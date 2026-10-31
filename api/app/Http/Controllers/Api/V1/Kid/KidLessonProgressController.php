<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Kid;

use App\Domain\Learning\LearningAccess;
use App\Domain\Rewards\RewardEvent;
use App\Domain\Rewards\RewardResult;
use App\Domain\Rewards\RewardService;
use App\Enums\LessonCompletionMode;
use App\Http\Controllers\Controller;
use App\Models\Child;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KidLessonProgressController extends Controller
{
    public function update(
        Request $request,
        Lesson $lesson,
        LearningAccess $access,
        RewardService $rewardService,
    ): JsonResponse {
        $child = $this->requireChild($request);
        $child->loadMissing('enrollments');

        $lesson->load([
            'world.pod',
            'module.course.track',
        ]);

        $access->assertCanAccessLesson($child, $lesson);

        /** @var array{resume_position_seconds?: int, watch_percent?: int, mark_complete?: bool, idempotency_key?: string|null} $validated */
        $validated = $request->validate([
            'resume_position_seconds' => ['sometimes', 'integer', 'min:0', 'max:86400'],
            'watch_percent' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'mark_complete' => ['sometimes', 'boolean'],
            'idempotency_key' => ['sometimes', 'nullable', 'string', 'max:120'],
        ]);

        $incomingResume = (int) ($validated['resume_position_seconds'] ?? 0);
        $incomingWatch = (int) ($validated['watch_percent'] ?? 0);
        $incomingManual = (bool) ($validated['mark_complete'] ?? false);
        $headerKey = trim((string) $request->header('Idempotency-Key', ''));
        $idempotencyKey = isset($validated['idempotency_key']) && trim((string) $validated['idempotency_key']) !== ''
            ? trim((string) $validated['idempotency_key'])
            : ($headerKey !== '' ? $headerKey : null);

        /** @var array{progress: LessonProgress, newly_completed: bool, reward_result: RewardResult|null} $result */
        $result = DB::transaction(function () use (
            $child,
            $lesson,
            $incomingResume,
            $incomingWatch,
            $incomingManual,
            $idempotencyKey,
            $rewardService
        ): array {
            Child::query()->whereKey($child->id)->lockForUpdate()->firstOrFail();

            /** @var LessonProgress|null $progress */
            $progress = LessonProgress::query()
                ->where('child_id', $child->id)
                ->where('lesson_id', $lesson->id)
                ->lockForUpdate()
                ->first();

            if ($progress === null) {
                $progress = new LessonProgress([
                    'child_id' => $child->id,
                    'lesson_id' => $lesson->id,
                    'resume_position_seconds' => 0,
                    'watch_percent' => 0,
                    'manual_completed' => false,
                    'quiz_passed' => false,
                    'is_completed' => false,
                ]);
            }

            $wasCompleted = (bool) $progress->is_completed;

            $nextResume = max((int) $progress->resume_position_seconds, $incomingResume);
            $nextWatch = min(100, max((int) $progress->watch_percent, $incomingWatch));
            $nextManual = ((bool) $progress->manual_completed) || $incomingManual;
            $quizPassed = (bool) $progress->quiz_passed;

            $shouldComplete = $this->evaluateCompletion(
                lesson: $lesson,
                watchPercent: $nextWatch,
                manualCompleted: $nextManual,
                quizPassed: $quizPassed,
            );

            $nextIsCompleted = $wasCompleted || $shouldComplete;
            $newlyCompleted = ! $wasCompleted && $nextIsCompleted;

            $hasStateChange = ! $progress->exists
                || $nextResume !== (int) $progress->resume_position_seconds
                || $nextWatch !== (int) $progress->watch_percent
                || $nextManual !== (bool) $progress->manual_completed
                || $newlyCompleted;

            if ($hasStateChange) {
                $progress->resume_position_seconds = $nextResume;
                $progress->watch_percent = $nextWatch;
                $progress->manual_completed = $nextManual;
                $progress->is_completed = $nextIsCompleted;
                $progress->last_accessed_at = now();

                if ($newlyCompleted) {
                    $progress->completed_at = now();
                    $progress->completion_source = (LessonCompletionMode::tryFrom($lesson->completion_mode) ?? LessonCompletionMode::Manual)->value;
                    if ($idempotencyKey !== null) {
                        $progress->completion_idempotency_key = $idempotencyKey;
                    }
                }

                $progress->save();
            }

            $rewardResult = null;
            if ($nextIsCompleted && ($newlyCompleted || $shouldComplete || $idempotencyKey !== null)) {
                $rewardResult = $rewardService->award(
                    RewardEvent::lessonCompleted($child->id, $lesson->id)
                );
            }

            return [
                'progress' => $progress,
                'newly_completed' => $newlyCompleted,
                'reward_result' => $rewardResult,
            ];
        });

        $progress = $result['progress'];
        $resolvedMode = LessonCompletionMode::tryFrom($lesson->completion_mode) ?? LessonCompletionMode::Manual;

        return ApiResponse::success(
            message: 'Lesson progress updated.',
            data: [
                'lesson_id' => $lesson->public_id,
                'completion_mode' => $resolvedMode->value,
                'newly_completed' => $result['newly_completed'],
                'progress' => [
                    'resume_position_seconds' => $progress->resume_position_seconds,
                    'watch_percent' => $progress->watch_percent,
                    'manual_completed' => $progress->manual_completed,
                    'quiz_passed' => $progress->quiz_passed,
                    'is_completed' => $progress->is_completed,
                    'completed_at' => $progress->completed_at?->toIso8601String(),
                ],
                'reward_result' => $result['reward_result']?->toArray(),
            ],
        );
    }

    private function evaluateCompletion(
        Lesson $lesson,
        int $watchPercent,
        bool $manualCompleted,
        bool $quizPassed,
    ): bool {
        $mode = LessonCompletionMode::tryFrom($lesson->completion_mode) ?? LessonCompletionMode::Manual;

        return match ($mode) {
            LessonCompletionMode::Manual => $manualCompleted,
            LessonCompletionMode::WatchPercent => $watchPercent >= max(1, (int) $lesson->required_watch_percent),
            LessonCompletionMode::QuizPass => $quizPassed,
        };
    }

    private function requireChild(Request $request): Child
    {
        $actor = $request->user();
        if (! $actor instanceof Child || ! $actor->tokenCan('child:*')) {
            throw new AuthorizationException('Child authentication is required for this endpoint.');
        }

        return $actor;
    }
}
