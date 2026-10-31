<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Kid;

use App\Domain\Learning\LearningAccess;
use App\Domain\Rewards\RewardService;
use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\KidProfileResource;
use App\Models\Child;
use App\Models\Lesson;
use App\Models\LessonAttachment;
use App\Models\LessonProgress;
use App\Models\Pod;
use App\Models\Project;
use App\Models\Quiz;
use App\Models\QuizOption;
use App\Models\QuizQuestion;
use App\Models\World;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KidCatalogueController extends Controller
{
    public function home(Request $request, LearningAccess $access, RewardService $rewardService): JsonResponse
    {
        $child = $this->requireChild($request);
        $child->loadMissing(['enrollments', 'streak']);

        $pods = $this->loadEnrolledPublishedPodsWithCurriculum($child, $access);
        $progressByLessonId = $this->loadProgressMapForPods($child, $pods);

        $podsPayload = [];
        $continueLesson = null;
        $continueProject = null;

        foreach ($pods as $pod) {
            $podMap = $this->buildPodJourneyData($pod, $progressByLessonId);
            $podsPayload[] = [
                'id' => $pod->public_id,
                'slug' => $pod->slug,
                'title' => $pod->title,
                'icon' => $pod->icon,
                'is_demo' => $pod->is_demo,
                'cleared_worlds_count' => $podMap['cleared_worlds_count'],
                'total_worlds_count' => $podMap['total_worlds_count'],
            ];

            if ($continueLesson === null && $podMap['current_lesson'] !== null) {
                $continueLesson = $podMap['current_lesson'];
            }
        }

        return ApiResponse::success(
            message: 'Kid home summary retrieved.',
            data: [
                'child' => (new KidProfileResource($child))->resolve(),
                'gamification' => $rewardService->homeGamificationSummaryFor($child),
                'continue_lesson' => $continueLesson,
                'continue_project' => $continueProject,
                'pods' => $podsPayload,
            ],
        );
    }

    public function journeyMap(Request $request, LearningAccess $access): JsonResponse
    {
        $child = $this->requireChild($request);
        $child->loadMissing('enrollments');

        $requestedPodPublicId = trim((string) $request->query('pod_id', ''));
        if ($requestedPodPublicId !== '') {
            $pod = Pod::query()->where('public_id', strtolower($requestedPodPublicId))->firstOrFail();

            return $this->podJourneyMap($request, $pod, $access);
        }

        $pods = $this->loadEnrolledPublishedPodsWithCurriculum($child, $access);
        $progressByLessonId = $this->loadProgressMapForPods($child, $pods);

        $mappedPods = [];
        foreach ($pods as $pod) {
            $mappedPods[] = $this->buildPodJourneyData($pod, $progressByLessonId);
        }

        $activePod = $mappedPods[0] ?? null;

        return ApiResponse::success(
            message: 'Journey map retrieved.',
            data: [
                'pod' => $activePod,
                'pods' => $mappedPods,
            ],
        );
    }

    public function podJourneyMap(Request $request, Pod $pod, LearningAccess $access): JsonResponse
    {
        $child = $this->requireChild($request);
        $child->loadMissing('enrollments');

        $access->assertCanAccessPod($child, $pod);

        $pods = $this->loadPodsCollectionWithCurriculum(new Collection([$pod]));
        $loadedPod = $pods->first() ?? $pod;
        $progressByLessonId = $this->loadProgressMapForPods($child, $pods);
        $podData = $this->buildPodJourneyData($loadedPod, $progressByLessonId);

        return ApiResponse::success(
            message: 'Pod journey map retrieved.',
            data: [
                'pod' => $podData,
                'pods' => [$podData],
            ],
        );
    }

    public function lessonDetail(Request $request, Lesson $lesson, LearningAccess $access): JsonResponse
    {
        $child = $this->requireChild($request);
        $child->loadMissing('enrollments');

        $lesson->load([
            'world.pod',
            'module.course.track',
            'quizzes' => static function ($query): void {
                $query->where('status', ContentStatus::Published->value)
                    ->orderBy('sort_order')
                    ->withCount('questions');
            },
            'projects' => static function ($query): void {
                $query->where('status', ContentStatus::Published->value)
                    ->orderBy('sort_order');
            },
            'attachments',
        ]);

        $access->assertCanAccessLesson($child, $lesson);

        /** @var LessonProgress|null $progress */
        $progress = LessonProgress::query()
            ->where('child_id', $child->id)
            ->where('lesson_id', $lesson->id)
            ->first();

        $quizzes = $lesson->quizzes->map(static fn (Quiz $quiz): array => [
            'id' => $quiz->public_id,
            'title' => $quiz->title,
            'description' => $quiz->description,
            'pass_mark_percent' => $quiz->pass_mark_percent,
            'max_attempts' => $quiz->max_attempts,
            'questions_count' => (int) ($quiz->getAttribute('questions_count') ?? 0),
            'is_demo' => $quiz->is_demo,
        ])->values()->all();

        $projects = $lesson->projects->map(static fn (Project $project): array => [
            'id' => $project->public_id,
            'title' => $project->title,
            'description' => $project->description,
            'language' => $project->language,
            'steps_count' => $project->steps_count,
            'is_demo' => $project->is_demo,
        ])->values()->all();

        $attachments = $lesson->attachments->map(static fn (LessonAttachment $attachment): array => [
            'id' => $attachment->public_id,
            'title' => $attachment->title,
            'filename' => $attachment->original_filename,
            'mime_type' => $attachment->mime_type,
            'size_bytes' => $attachment->size_bytes,
        ])->values()->all();

        $world = $lesson->world;
        $module = $lesson->module;

        return ApiResponse::success(
            message: 'Lesson detail retrieved.',
            data: [
                'lesson' => [
                    'id' => $lesson->public_id,
                    'slug' => $lesson->slug,
                    'lesson_number' => $lesson->lesson_number,
                    'title' => $lesson->title,
                    'summary' => $lesson->summary,
                    'body' => $lesson->body,
                    'learning_objectives' => $lesson->learning_objectives ?? [],
                    'thumbnail_asset' => $lesson->thumbnail_asset,
                    'intro_video_url' => $lesson->intro_video_url,
                    'intro_video_duration_seconds' => $lesson->intro_video_duration_seconds,
                    'duration_minutes' => $lesson->duration_minutes,
                    'difficulty' => $lesson->difficulty,
                    'steps_count' => $lesson->steps_count,
                    'completion_mode' => $lesson->completion_mode,
                    'required_watch_percent' => $lesson->required_watch_percent,
                    'is_demo' => $lesson->is_demo,
                    'rewards_preview' => $lesson->rewardsPreview(),
                    'world' => $world !== null ? [
                        'id' => $world->public_id,
                        'world_number' => $world->world_number,
                        'title' => $world->title,
                        'icon' => $world->icon,
                    ] : null,
                    'module' => $module !== null ? [
                        'id' => $module->public_id,
                        'title' => $module->title,
                    ] : null,
                    'progress' => [
                        'resume_position_seconds' => $progress->resume_position_seconds ?? 0,
                        'watch_percent' => $progress->watch_percent ?? 0,
                        'manual_completed' => $progress->manual_completed ?? false,
                        'quiz_passed' => $progress->quiz_passed ?? false,
                        'is_completed' => $progress->is_completed ?? false,
                        'completed_at' => $progress?->completed_at?->toIso8601String(),
                    ],
                    'quizzes' => $quizzes,
                    'projects' => $projects,
                    'attachments' => $attachments,
                ],
            ],
        );
    }

    public function lessonQuiz(Request $request, Lesson $lesson, LearningAccess $access): JsonResponse
    {
        $child = $this->requireChild($request);
        $child->loadMissing('enrollments');

        $lesson->load([
            'world.pod',
            'module.course.track',
            'quizzes' => static function ($query): void {
                $query->where('status', ContentStatus::Published->value)
                    ->orderBy('sort_order');
            },
        ]);

        $access->assertCanAccessLesson($child, $lesson);

        /** @var Quiz|null $quiz */
        $quiz = $lesson->quizzes->first();
        if ($quiz === null) {
            return ApiResponse::error(
                message: 'No published quiz found for this lesson.',
                data: null,
                status: 404,
            );
        }

        return $this->quizDetail($request, $quiz, $access);
    }

    public function quizDetail(Request $request, Quiz $quiz, LearningAccess $access): JsonResponse
    {
        $child = $this->requireChild($request);
        $child->loadMissing('enrollments');

        $quiz->load([
            'lesson.world.pod',
            'lesson.module.course.track',
            'questions.options',
        ]);

        $access->assertCanAccessQuiz($child, $quiz);

        $attemptsUsed = 0;
        $bestScorePercent = 0;
        $isPassed = false;
        $openAttemptId = null;

        if (class_exists('App\\Models\\QuizAttempt')) {
            $attemptStats = DB::table('quiz_attempts')
                ->where('child_id', $child->id)
                ->where('quiz_id', $quiz->id)
                ->selectRaw('COUNT(*) as attempts_count, COALESCE(MAX(CASE WHEN submitted_at IS NOT NULL THEN score_percent ELSE 0 END), 0) as max_score, COALESCE(MAX(CASE WHEN submitted_at IS NOT NULL THEN passed ELSE 0 END), 0) as has_passed, MAX(CASE WHEN submitted_at IS NULL THEN public_id ELSE NULL END) as open_attempt_public_id')
                ->first();

            if ($attemptStats !== null) {
                $attemptsUsed = (int) ($attemptStats->attempts_count ?? 0);
                $bestScorePercent = (int) ($attemptStats->max_score ?? 0);
                $isPassed = ((int) ($attemptStats->has_passed ?? 0)) === 1;
                $openAttemptId = $attemptStats->open_attempt_public_id !== null
                    ? (string) $attemptStats->open_attempt_public_id
                    : null;
            }
        }

        $questionsPayload = $quiz->questions->map(static function (QuizQuestion $question): array {
            return [
                'id' => $question->public_id,
                'question_number' => $question->question_number,
                'prompt' => $question->prompt,
                'code_snippet' => $question->code_snippet,
                'hint' => $question->hint,
                'points' => $question->points,
                'options' => $question->options->map(static fn (QuizOption $option): array => [
                    'id' => $option->public_id,
                    'option_key' => $option->option_key,
                    'label' => $option->label,
                    'sort_order' => $option->sort_order,
                ])->values()->all(),
            ];
        })->values()->all();

        return ApiResponse::success(
            message: 'Quiz retrieved.',
            data: [
                'quiz' => [
                    'id' => $quiz->public_id,
                    'lesson_id' => $quiz->lesson?->public_id,
                    'title' => $quiz->title,
                    'description' => $quiz->description,
                    'pass_mark_percent' => $quiz->pass_mark_percent,
                    'max_attempts' => $quiz->max_attempts,
                    'attempts_used' => $attemptsUsed,
                    'remaining_attempts' => max(0, $quiz->max_attempts - $attemptsUsed),
                    'best_score_percent' => $bestScorePercent,
                    'is_passed' => $isPassed,
                    'open_attempt_id' => $openAttemptId,
                    'is_demo' => $quiz->is_demo,
                    'questions' => $questionsPayload,
                ],
            ],
        );
    }

    /**
     * @return Collection<int, Pod>
     */
    private function loadEnrolledPublishedPodsWithCurriculum(Child $child, LearningAccess $access): Collection
    {
        $podIds = $access->enrolledPodIds($child);
        if ($podIds === []) {
            return new Collection;
        }

        $pods = Pod::query()
            ->whereIn('id', $podIds)
            ->where('status', ContentStatus::Published->value)
            ->orderBy('sort_order')
            ->get();

        return $this->loadPodsCollectionWithCurriculum($pods);
    }

    /**
     * @param  Collection<int, Pod>  $pods
     * @return Collection<int, Pod>
     */
    private function loadPodsCollectionWithCurriculum(Collection $pods): Collection
    {
        if ($pods->isEmpty()) {
            return $pods;
        }

        $pods->load([
            'worlds' => static function ($query): void {
                $query->where('status', ContentStatus::Published->value)
                    ->where(static function ($wQuery): void {
                        $wQuery->whereNull('course_id')
                            ->orWhereHas('course', static function ($cQuery): void {
                                $cQuery->where('status', ContentStatus::Published->value)
                                    ->whereHas('track', static function ($tQuery): void {
                                        $tQuery->where('status', ContentStatus::Published->value);
                                    });
                            });
                    })
                    ->orderBy('sort_order')
                    ->with([
                        'lessons' => static function ($lQuery): void {
                            $lQuery->where('status', ContentStatus::Published->value)
                                ->whereHas('module', static function ($mQuery): void {
                                    $mQuery->where('status', ContentStatus::Published->value)
                                        ->whereHas('course', static function ($cQuery): void {
                                            $cQuery->where('status', ContentStatus::Published->value)
                                                ->whereHas('track', static function ($tQuery): void {
                                                    $tQuery->where('status', ContentStatus::Published->value);
                                                });
                                        });
                                })
                                ->orderBy('sort_order');
                        },
                    ]);
            },
        ]);

        return $pods;
    }

    /**
     * @param  Collection<int, Pod>  $pods
     * @return array<int, LessonProgress>
     */
    private function loadProgressMapForPods(Child $child, Collection $pods): array
    {
        $lessonIds = [];
        foreach ($pods as $pod) {
            foreach ($pod->worlds as $world) {
                foreach ($world->lessons as $lesson) {
                    $lessonIds[] = $lesson->id;
                }
            }
        }

        if ($lessonIds === []) {
            return [];
        }

        /** @var Collection<int, LessonProgress> $records */
        $records = LessonProgress::query()
            ->where('child_id', $child->id)
            ->whereIn('lesson_id', array_values(array_unique($lessonIds)))
            ->get();

        $map = [];
        foreach ($records as $record) {
            $map[$record->lesson_id] = $record;
        }

        return $map;
    }

    /**
     * @param  array<int, LessonProgress>  $progressByLessonId
     * @return array<string, mixed>
     */
    private function buildPodJourneyData(Pod $pod, array $progressByLessonId): array
    {
        $worldsPayload = [];
        $clearedWorldsCount = 0;
        $foundActiveWorld = false;
        $currentWorldSummary = null;
        $currentLessonSummary = null;

        /** @var World $world */
        foreach ($pod->worlds as $world) {
            $lessons = $world->lessons;
            $totalLessons = $lessons->count();
            $completedLessons = 0;

            foreach ($lessons as $lesson) {
                if (($progressByLessonId[$lesson->id]->is_completed ?? false) === true) {
                    $completedLessons++;
                }
            }

            $allLessonsDone = $totalLessons > 0 && $completedLessons === $totalLessons;

            if (! $foundActiveWorld && $allLessonsDone) {
                $worldState = 'done';
                $clearedWorldsCount++;
            } elseif (! $foundActiveWorld) {
                $worldState = 'now';
                $foundActiveWorld = true;
            } else {
                $worldState = 'lock';
            }

            $foundActiveLessonInWorld = false;
            $lessonsPayload = [];

            /** @var Lesson $lesson */
            foreach ($lessons as $index => $lesson) {
                $progress = $progressByLessonId[$lesson->id] ?? null;
                $isDone = ($progress->is_completed ?? false) === true;

                if ($worldState === 'done') {
                    $lessonState = 'done';
                } elseif ($worldState === 'lock') {
                    $lessonState = 'lock';
                } elseif (! $foundActiveLessonInWorld && $isDone) {
                    $lessonState = 'done';
                } elseif (! $foundActiveLessonInWorld) {
                    $lessonState = 'now';
                    $foundActiveLessonInWorld = true;
                } else {
                    $lessonState = 'lock';
                }

                $lessonItem = [
                    'id' => $lesson->public_id,
                    'slug' => $lesson->slug,
                    'lesson_number' => $lesson->lesson_number,
                    'position_in_world' => $index + 1,
                    'total_in_world' => $totalLessons,
                    'title' => $lesson->title,
                    'summary' => $lesson->summary,
                    'thumbnail_asset' => $lesson->thumbnail_asset,
                    'duration_minutes' => $lesson->duration_minutes,
                    'difficulty' => $lesson->difficulty,
                    'steps_count' => $lesson->steps_count,
                    'state' => $lessonState,
                    'is_completed' => $isDone,
                    'watch_percent' => $progress->watch_percent ?? 0,
                    'resume_position_seconds' => $progress->resume_position_seconds ?? 0,
                    'world_id' => $world->public_id,
                    'world_number' => $world->world_number,
                    'world_title' => $world->title,
                ];

                $lessonsPayload[] = $lessonItem;

                if ($worldState === 'now' && $lessonState === 'now' && $currentLessonSummary === null) {
                    $currentLessonSummary = $lessonItem;
                }
            }

            $worldItem = [
                'id' => $world->public_id,
                'slug' => $world->slug,
                'world_number' => $world->world_number,
                'title' => $world->title,
                'description' => $world->description,
                'icon' => $world->icon,
                'map_x' => $world->map_x,
                'map_y' => $world->map_y,
                'state' => $worldState,
                'completed_lessons_count' => $completedLessons,
                'total_lessons_count' => $totalLessons,
                'lessons' => $lessonsPayload,
            ];

            if ($worldState === 'now' && $currentWorldSummary === null) {
                $currentWorldSummary = $worldItem;
            }

            $worldsPayload[] = $worldItem;
        }

        // If every world is done, fall back to the last lesson of the last world for continue card
        if ($currentLessonSummary === null && $worldsPayload !== []) {
            $lastWorld = $worldsPayload[count($worldsPayload) - 1];
            $currentWorldSummary = $lastWorld;
            $lastLessons = $lastWorld['lessons'];
            if ($lastLessons !== []) {
                $currentLessonSummary = $lastLessons[count($lastLessons) - 1];
            }
        }

        return [
            'id' => $pod->public_id,
            'slug' => $pod->slug,
            'title' => $pod->title,
            'description' => $pod->description,
            'icon' => $pod->icon,
            'is_demo' => $pod->is_demo,
            'cleared_worlds_count' => $clearedWorldsCount,
            'total_worlds_count' => count($worldsPayload),
            'current_world' => $currentWorldSummary,
            'current_lesson' => $currentLessonSummary,
            'worlds' => $worldsPayload,
        ];
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
