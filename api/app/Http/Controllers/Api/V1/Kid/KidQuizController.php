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
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizAttemptAnswer;
use App\Models\QuizOption;
use App\Models\QuizQuestion;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class KidQuizController extends Controller
{
    public const FEEDBACK_CORRECT = 'Correct! Captain Jetty is proud of you.';

    public const FEEDBACK_TRY_AGAIN = 'Not quite. Try again!';

    public function attempts(
        Request $request,
        Quiz $quiz,
        LearningAccess $access,
        RewardService $rewardService,
    ): JsonResponse {
        $action = strtolower(trim((string) $request->input('action', '')));
        $attemptId = trim((string) $request->input('attempt_id', ''));

        if ($action === 'finish' || $attemptId !== '') {
            return $this->finishOpenAttempt(
                request: $request,
                quiz: $quiz,
                access: $access,
                rewardService: $rewardService,
                attemptPublicId: $attemptId !== '' ? $attemptId : null,
            );
        }

        return $this->startAttempt($request, $quiz, $access);
    }

    public function startAttempt(Request $request, Quiz $quiz, LearningAccess $access): JsonResponse
    {
        $child = $this->requireChild($request);
        $child->loadMissing('enrollments');

        $quiz->load([
            'lesson.world.pod',
            'lesson.module.course.track',
            'questions.options',
        ]);

        $access->assertCanAccessQuiz($child, $quiz);

        /** @var array{idempotency_key?: string|null} $validated */
        $validated = $request->validate([
            'idempotency_key' => ['sometimes', 'nullable', 'string', 'max:120'],
        ]);

        $headerKey = trim((string) $request->header('Idempotency-Key', ''));
        $idempotencyKey = isset($validated['idempotency_key']) && trim((string) $validated['idempotency_key']) !== ''
            ? trim((string) $validated['idempotency_key'])
            : ($headerKey !== '' ? $headerKey : null);

        $totalPoints = (int) $quiz->questions->sum('points');

        /** @var array{capped: bool, replayed: bool, attempt: QuizAttempt|null, attempts_used: int} $outcome */
        $outcome = DB::transaction(static function () use ($child, $quiz, $idempotencyKey, $totalPoints): array {
            Child::query()->whereKey($child->id)->lockForUpdate()->firstOrFail();

            if ($idempotencyKey !== null) {
                /** @var QuizAttempt|null $existingAttempt */
                $existingAttempt = QuizAttempt::query()
                    ->where('child_id', $child->id)
                    ->where('quiz_id', $quiz->id)
                    ->where('idempotency_key', $idempotencyKey)
                    ->first();

                if ($existingAttempt !== null) {
                    $attemptsUsed = QuizAttempt::query()
                        ->where('child_id', $child->id)
                        ->where('quiz_id', $quiz->id)
                        ->count();

                    return [
                        'capped' => false,
                        'replayed' => true,
                        'attempt' => $existingAttempt,
                        'attempts_used' => $attemptsUsed,
                    ];
                }
            }

            $existingCount = QuizAttempt::query()
                ->where('child_id', $child->id)
                ->where('quiz_id', $quiz->id)
                ->lockForUpdate()
                ->count();

            if ($quiz->max_attempts > 0 && $existingCount >= $quiz->max_attempts) {
                return [
                    'capped' => true,
                    'replayed' => false,
                    'attempt' => null,
                    'attempts_used' => $existingCount,
                ];
            }

            $attemptNumber = $existingCount + 1;

            $attempt = QuizAttempt::query()->create([
                'child_id' => $child->id,
                'quiz_id' => $quiz->id,
                'attempt_number' => $attemptNumber,
                'idempotency_key' => $idempotencyKey,
                'earned_points' => 0,
                'total_points' => $totalPoints,
                'score_percent' => 0,
                'passed' => false,
                'submitted_at' => null,
            ]);

            return [
                'capped' => false,
                'replayed' => false,
                'attempt' => $attempt,
                'attempts_used' => $attemptNumber,
            ];
        });

        if ($outcome['capped'] || $outcome['attempt'] === null) {
            return ApiResponse::error(
                message: 'You have used all attempts for this quiz.',
                data: [
                    'attempts_used' => $outcome['attempts_used'],
                    'max_attempts' => $quiz->max_attempts,
                    'remaining_attempts' => 0,
                ],
                status: 422,
            );
        }

        $attempt = $outcome['attempt'];

        return ApiResponse::success(
            message: 'Quiz attempt started.',
            data: [
                'attempt' => [
                    'id' => $attempt->public_id,
                    'quiz_id' => $quiz->public_id,
                    'attempt_number' => $attempt->attempt_number,
                    'status' => $attempt->submitted_at === null ? 'open' : 'submitted',
                    'attempts_used' => $outcome['attempts_used'],
                    'max_attempts' => $quiz->max_attempts,
                    'remaining_attempts' => max(0, $quiz->max_attempts - $outcome['attempts_used']),
                    'total_points' => $attempt->total_points,
                    'replayed' => $outcome['replayed'],
                ],
            ],
            status: $outcome['replayed'] ? 200 : 201,
        );
    }

    public function check(Request $request, Quiz $quiz, LearningAccess $access): JsonResponse
    {
        $child = $this->requireChild($request);
        $child->loadMissing('enrollments');

        $quiz->load([
            'lesson.world.pod',
            'lesson.module.course.track',
            'questions.options',
        ]);

        $access->assertCanAccessQuiz($child, $quiz);

        /** @var array{attempt_id?: string|null, question_id: string, option_id?: string|null, option_key?: string|null} $validated */
        $validated = $request->validate([
            'attempt_id' => ['sometimes', 'nullable', 'string'],
            'question_id' => ['required', 'string'],
            'option_id' => ['nullable', 'string', 'required_without:option_key'],
            'option_key' => ['nullable', 'string', 'required_without:option_id'],
        ]);

        $questionId = strtolower(trim($validated['question_id']));
        /** @var QuizQuestion|null $question */
        $question = $quiz->questions->first(
            static fn (QuizQuestion $q): bool => strtolower($q->public_id) === $questionId
        );

        if ($question === null) {
            throw ValidationException::withMessages([
                'question_id' => ['The selected question does not belong to this quiz.'],
            ]);
        }

        $option = $this->resolveOptionForQuestion(
            question: $question,
            optionId: $validated['option_id'] ?? null,
            optionKey: $validated['option_key'] ?? null,
        );

        if ($option === null) {
            throw ValidationException::withMessages([
                'option_id' => ['The selected option does not belong to this question.'],
            ]);
        }

        $attemptId = isset($validated['attempt_id']) && trim((string) $validated['attempt_id']) !== ''
            ? trim((string) $validated['attempt_id'])
            : null;

        /** @var array{open_attempt: QuizAttempt|null, is_first_answer: bool, points_awarded: int, recorded_points: int} $checkOutcome */
        $checkOutcome = DB::transaction(static function () use ($child, $quiz, $attemptId, $question, $option): array {
            Child::query()->whereKey($child->id)->lockForUpdate()->firstOrFail();

            $attemptQuery = QuizAttempt::query()
                ->where('child_id', $child->id)
                ->where('quiz_id', $quiz->id)
                ->whereNull('submitted_at')
                ->lockForUpdate();

            if ($attemptId !== null) {
                $attemptQuery->where('public_id', $attemptId);
            } else {
                $attemptQuery->orderByDesc('attempt_number');
            }

            /** @var QuizAttempt|null $openAttempt */
            $openAttempt = $attemptQuery->first();

            if ($openAttempt === null) {
                return [
                    'open_attempt' => null,
                    'is_first_answer' => false,
                    'points_awarded' => 0,
                    'recorded_points' => 0,
                ];
            }

            /** @var QuizAttemptAnswer|null $existingAnswer */
            $existingAnswer = QuizAttemptAnswer::query()
                ->where('quiz_attempt_id', $openAttempt->id)
                ->where('quiz_question_id', $question->id)
                ->lockForUpdate()
                ->first();

            $isCorrect = (bool) $option->is_correct;

            if ($existingAnswer === null) {
                $pointsAwarded = $isCorrect ? (int) $question->points : 0;

                QuizAttemptAnswer::query()->create([
                    'quiz_attempt_id' => $openAttempt->id,
                    'quiz_question_id' => $question->id,
                    'quiz_option_id' => $option->id,
                    'is_correct' => $isCorrect,
                    'points_awarded' => $pointsAwarded,
                ]);

                return [
                    'open_attempt' => $openAttempt,
                    'is_first_answer' => true,
                    'points_awarded' => $pointsAwarded,
                    'recorded_points' => $pointsAwarded,
                ];
            }

            return [
                'open_attempt' => $openAttempt,
                'is_first_answer' => false,
                'points_awarded' => 0,
                'recorded_points' => (int) $existingAnswer->points_awarded,
            ];
        });

        if ($checkOutcome['open_attempt'] === null) {
            return ApiResponse::error(
                message: 'You must start an open quiz attempt before checking an answer.',
                data: null,
                status: 422,
            );
        }

        $isCorrect = (bool) $option->is_correct;
        $openAttempt = $checkOutcome['open_attempt'];

        return ApiResponse::success(
            message: $isCorrect ? self::FEEDBACK_CORRECT : self::FEEDBACK_TRY_AGAIN,
            data: [
                'attempt_id' => $openAttempt->public_id,
                'quiz_id' => $quiz->public_id,
                'question_id' => $question->public_id,
                'option_id' => $option->public_id,
                'option_key' => $option->option_key,
                'is_correct' => $isCorrect,
                'is_first_answer' => $checkOutcome['is_first_answer'],
                'is_retry' => ! $checkOutcome['is_first_answer'],
                'points_awarded' => $checkOutcome['points_awarded'],
                'recorded_points' => $checkOutcome['recorded_points'],
                'feedback' => $isCorrect ? self::FEEDBACK_CORRECT : self::FEEDBACK_TRY_AGAIN,
                'explanation' => $question->explanation,
            ],
        );
    }

    public function finishAttempt(
        Request $request,
        Quiz $quiz,
        QuizAttempt $attempt,
        LearningAccess $access,
        RewardService $rewardService,
    ): JsonResponse {
        return $this->finishOpenAttempt($request, $quiz, $access, $rewardService, $attempt->public_id);
    }

    private function finishOpenAttempt(
        Request $request,
        Quiz $quiz,
        LearningAccess $access,
        RewardService $rewardService,
        ?string $attemptPublicId = null,
    ): JsonResponse {
        $child = $this->requireChild($request);
        $child->loadMissing('enrollments');

        $quiz->load([
            'lesson.world.pod',
            'lesson.module.course.track',
            'questions.options',
        ]);

        $access->assertCanAccessQuiz($child, $quiz);

        /** @var array{attempt_id?: string|null, idempotency_key?: string|null} $validated */
        $validated = $request->validate([
            'attempt_id' => ['sometimes', 'nullable', 'string'],
            'idempotency_key' => ['sometimes', 'nullable', 'string', 'max:120'],
        ]);

        $resolvedAttemptPublicId = $attemptPublicId
            ?? (isset($validated['attempt_id']) && trim((string) $validated['attempt_id']) !== ''
                ? trim((string) $validated['attempt_id'])
                : null);

        $headerKey = trim((string) $request->header('Idempotency-Key', ''));
        $idempotencyKey = isset($validated['idempotency_key']) && trim((string) $validated['idempotency_key']) !== ''
            ? trim((string) $validated['idempotency_key'])
            : ($headerKey !== '' ? $headerKey : null);

        /** @var array{missing_attempt: bool, unanswered_question: int|null, replayed: bool, attempt: QuizAttempt|null, attempts_used: int, lesson_completed: bool, question_results: list<array<string, mixed>>, reward_result: RewardResult|null} $outcome */
        $outcome = DB::transaction(function () use (
            $child,
            $quiz,
            $resolvedAttemptPublicId,
            $idempotencyKey,
            $rewardService
        ): array {
            Child::query()->whereKey($child->id)->lockForUpdate()->firstOrFail();

            $attemptQuery = QuizAttempt::query()
                ->where('child_id', $child->id)
                ->where('quiz_id', $quiz->id)
                ->with(['answers'])
                ->lockForUpdate();

            if ($resolvedAttemptPublicId !== null) {
                $attemptQuery->where('public_id', $resolvedAttemptPublicId);
            } else {
                $attemptQuery->whereNull('submitted_at')->orderByDesc('attempt_number');
            }

            /** @var QuizAttempt|null $attempt */
            $attempt = $attemptQuery->first();

            if ($attempt === null) {
                return [
                    'missing_attempt' => true,
                    'unanswered_question' => null,
                    'replayed' => false,
                    'attempt' => null,
                    'attempts_used' => 0,
                    'lesson_completed' => false,
                    'question_results' => [],
                    'reward_result' => null,
                ];
            }

            $attemptsUsed = QuizAttempt::query()
                ->where('child_id', $child->id)
                ->where('quiz_id', $quiz->id)
                ->count();

            $answersByQuestionId = [];
            foreach ($attempt->answers as $savedAnswer) {
                $answersByQuestionId[$savedAnswer->quiz_question_id] = $savedAnswer;
            }

            /** @var QuizQuestion $question */
            foreach ($quiz->questions as $question) {
                if (! isset($answersByQuestionId[$question->id])) {
                    return [
                        'missing_attempt' => false,
                        'unanswered_question' => $question->question_number,
                        'replayed' => false,
                        'attempt' => $attempt,
                        'attempts_used' => $attemptsUsed,
                        'lesson_completed' => false,
                        'question_results' => [],
                        'reward_result' => null,
                    ];
                }
            }

            $questionResults = $this->buildQuestionResultsFromSavedAnswers($quiz, $answersByQuestionId);

            if ($attempt->submitted_at !== null) {
                $lessonCompleted = false;
                if ($quiz->lesson !== null) {
                    $lessonCompleted = LessonProgress::query()
                        ->where('child_id', $child->id)
                        ->where('lesson_id', $quiz->lesson->id)
                        ->where('is_completed', true)
                        ->exists();
                }

                $replayedRewardResult = null;
                if ($attempt->passed) {
                    $quizPassReward = $rewardService->award(
                        RewardEvent::quizPassed($child->id, $quiz->id)
                    );
                    $others = [];
                    if ($attempt->score_percent === 100) {
                        $others[] = $rewardService->award(
                            RewardEvent::perfectQuiz($child->id, $quiz->id)
                        );
                    }
                    if ($lessonCompleted) {
                        $mode = LessonCompletionMode::tryFrom($quiz->lesson->completion_mode) ?? LessonCompletionMode::Manual;
                        if ($mode === LessonCompletionMode::QuizPass) {
                            $others[] = $rewardService->award(
                                RewardEvent::lessonCompleted($child->id, $quiz->lesson->id, triggerDailyStreak: false)
                            );
                        }
                    }
                    $replayedRewardResult = RewardResult::merge($quizPassReward, ...$others);
                }

                return [
                    'missing_attempt' => false,
                    'unanswered_question' => null,
                    'replayed' => true,
                    'attempt' => $attempt,
                    'attempts_used' => $attemptsUsed,
                    'lesson_completed' => $lessonCompleted,
                    'question_results' => $questionResults,
                    'reward_result' => $replayedRewardResult,
                ];
            }

            $earnedPoints = 0;
            $totalPoints = 0;

            /** @var QuizQuestion $question */
            foreach ($quiz->questions as $question) {
                $savedAnswer = $answersByQuestionId[$question->id];
                $totalPoints += (int) $question->points;
                $earnedPoints += (int) $savedAnswer->points_awarded;
            }

            $scorePercent = $totalPoints > 0
                ? (int) round(($earnedPoints * 100) / $totalPoints)
                : 0;
            $passed = $scorePercent >= (int) $quiz->pass_mark_percent;

            $attempt->earned_points = $earnedPoints;
            $attempt->total_points = $totalPoints;
            $attempt->score_percent = $scorePercent;
            $attempt->passed = $passed;
            $attempt->submitted_at = now();
            $attempt->save();

            $lessonCompleted = false;
            $lessonNewlyCompleted = false;
            $lesson = $quiz->lesson;

            if ($lesson instanceof Lesson) {
                /** @var LessonProgress|null $progress */
                $progress = LessonProgress::query()
                    ->where('child_id', $child->id)
                    ->where('lesson_id', $lesson->id)
                    ->lockForUpdate()
                    ->first();

                if ($passed) {
                    if ($progress === null) {
                        $progress = new LessonProgress([
                            'child_id' => $child->id,
                            'lesson_id' => $lesson->id,
                            'resume_position_seconds' => 0,
                            'watch_percent' => 0,
                            'manual_completed' => false,
                            'quiz_passed' => true,
                            'is_completed' => false,
                        ]);
                    } else {
                        $progress->quiz_passed = true;
                    }

                    $mode = LessonCompletionMode::tryFrom($lesson->completion_mode) ?? LessonCompletionMode::Manual;
                    if ($mode === LessonCompletionMode::QuizPass && ! $progress->is_completed) {
                        $progress->is_completed = true;
                        $progress->completed_at = now();
                        $progress->completion_source = LessonCompletionMode::QuizPass->value;
                        $lessonNewlyCompleted = true;
                        if ($idempotencyKey !== null) {
                            $progress->completion_idempotency_key = $idempotencyKey;
                        }
                    }

                    $progress->last_accessed_at = now();
                    $progress->save();
                }

                $lessonCompleted = (bool) ($progress->is_completed ?? false);
            }

            $rewardResult = null;
            if ($passed) {
                $quizPassReward = $rewardService->award(
                    RewardEvent::quizPassed($child->id, $quiz->id)
                );
                $others = [];
                if ($scorePercent === 100) {
                    $others[] = $rewardService->award(
                        RewardEvent::perfectQuiz($child->id, $quiz->id)
                    );
                }
                if ($lessonNewlyCompleted) {
                    $others[] = $rewardService->award(
                        RewardEvent::lessonCompleted($child->id, $lesson->id, triggerDailyStreak: false)
                    );
                }
                $rewardResult = RewardResult::merge($quizPassReward, ...$others);
            }

            return [
                'missing_attempt' => false,
                'unanswered_question' => null,
                'replayed' => false,
                'attempt' => $attempt,
                'attempts_used' => $attemptsUsed,
                'lesson_completed' => $lessonCompleted,
                'question_results' => $questionResults,
                'reward_result' => $rewardResult,
            ];
        });

        if ($outcome['missing_attempt'] || $outcome['attempt'] === null) {
            return ApiResponse::error(
                message: 'No open quiz attempt found to finish.',
                data: null,
                status: 422,
            );
        }

        if ($outcome['unanswered_question'] !== null) {
            throw ValidationException::withMessages([
                'questions' => ["Missing saved answer for question {$outcome['unanswered_question']}. Check every question first."],
            ]);
        }

        $attempt = $outcome['attempt'];

        return ApiResponse::success(
            message: $attempt->passed ? self::FEEDBACK_CORRECT : self::FEEDBACK_TRY_AGAIN,
            data: [
                'attempt' => [
                    'id' => $attempt->public_id,
                    'quiz_id' => $quiz->public_id,
                    'attempt_number' => $attempt->attempt_number,
                    'status' => 'submitted',
                    'attempts_used' => $outcome['attempts_used'],
                    'max_attempts' => $quiz->max_attempts,
                    'remaining_attempts' => max(0, $quiz->max_attempts - $outcome['attempts_used']),
                    'earned_points' => $attempt->earned_points,
                    'total_points' => $attempt->total_points,
                    'score_percent' => $attempt->score_percent,
                    'pass_mark_percent' => $quiz->pass_mark_percent,
                    'passed' => $attempt->passed,
                    'replayed' => $outcome['replayed'],
                    'lesson_completed' => $outcome['lesson_completed'],
                    'feedback' => $attempt->passed ? self::FEEDBACK_CORRECT : self::FEEDBACK_TRY_AGAIN,
                    'submitted_at' => $attempt->submitted_at?->toIso8601String(),
                    'results' => $outcome['question_results'],
                ],
                'reward_result' => $outcome['reward_result']?->toArray(),
            ],
        );
    }

    /**
     * @param  array<int, QuizAttemptAnswer>  $answersByQuestionId
     * @return list<array<string, mixed>>
     */
    private function buildQuestionResultsFromSavedAnswers(Quiz $quiz, array $answersByQuestionId): array
    {
        $results = [];

        /** @var QuizQuestion $question */
        foreach ($quiz->questions as $question) {
            $savedAnswer = $answersByQuestionId[$question->id];
            /** @var QuizOption|null $option */
            $option = $question->options->first(
                static fn (QuizOption $opt): bool => $opt->id === $savedAnswer->quiz_option_id
            );

            $isCorrect = (bool) $savedAnswer->is_correct;

            $results[] = [
                'question_id' => $question->public_id,
                'question_number' => $question->question_number,
                'option_id' => $option?->public_id,
                'option_key' => $option?->option_key,
                'is_correct' => $isCorrect,
                'points_awarded' => (int) $savedAnswer->points_awarded,
                'feedback' => $isCorrect ? self::FEEDBACK_CORRECT : self::FEEDBACK_TRY_AGAIN,
                'explanation' => $question->explanation,
            ];
        }

        return $results;
    }

    private function resolveOptionForQuestion(
        QuizQuestion $question,
        ?string $optionId,
        ?string $optionKey,
    ): ?QuizOption {
        $normalizedId = $optionId !== null ? strtolower(trim($optionId)) : '';
        $normalizedKey = $optionKey !== null ? strtoupper(trim($optionKey)) : '';

        /** @var QuizOption|null $option */
        $option = $question->options->first(
            static function (QuizOption $opt) use ($normalizedId, $normalizedKey): bool {
                if ($normalizedId !== '' && strtolower($opt->public_id) === $normalizedId) {
                    return true;
                }

                if ($normalizedKey !== '' && strtoupper($opt->option_key) === $normalizedKey) {
                    return true;
                }

                return false;
            }
        );

        return $option;
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
