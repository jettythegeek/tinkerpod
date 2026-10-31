<?php

declare(strict_types=1);

namespace App\Domain\Learning;

use App\Models\Child;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Pod;
use App\Models\Project;
use App\Models\Quiz;
use App\Models\World;
use Illuminate\Auth\Access\AuthorizationException;

/**
 * Single centralized access gate for kid learning content.
 *
 * A child may open published content in a pod they are actively enrolled in.
 * Draft or archived content, or pods the child is not enrolled in, always fail
 * with 403. M5 will add the family subscription check inside
 * `hasSubscriptionAccess()` without touching controllers.
 */
class LearningAccess
{
    public const FORBIDDEN_MESSAGE = 'You do not have access to this learning content.';

    /**
     * @return list<int>
     */
    public function enrolledPodIds(Child $child): array
    {
        if ($child->relationLoaded('enrollments')) {
            /** @var list<int> $ids */
            $ids = $child->enrollments
                ->where('status', 'active')
                ->pluck('pod_id')
                ->map(static fn (mixed $id): int => (int) $id)
                ->values()
                ->all();

            return $ids;
        }

        /** @var list<int> $ids */
        $ids = Enrollment::query()
            ->where('child_id', $child->id)
            ->where('status', 'active')
            ->pluck('pod_id')
            ->map(static fn (mixed $id): int => (int) $id)
            ->values()
            ->all();

        return $ids;
    }

    public function canAccessPod(Child $child, Pod $pod): bool
    {
        if (! $pod->isPublished()) {
            return false;
        }

        if (! $this->hasSubscriptionAccess($child, $pod)) {
            return false;
        }

        return in_array($pod->id, $this->enrolledPodIds($child), true);
    }

    public function assertCanAccessPod(Child $child, Pod $pod): void
    {
        if (! $this->canAccessPod($child, $pod)) {
            throw new AuthorizationException(self::FORBIDDEN_MESSAGE);
        }
    }

    public function canAccessWorld(Child $child, World $world): bool
    {
        if (! $world->isPublished()) {
            return false;
        }

        $pod = $world->pod;
        if (! $pod instanceof Pod || ! $this->canAccessPod($child, $pod)) {
            return false;
        }

        if ($world->course_id !== null) {
            $course = $world->course;
            if ($course === null || ! $course->isPublished()) {
                return false;
            }

            $track = $course->track;
            if ($track === null || ! $track->isPublished()) {
                return false;
            }
        }

        return true;
    }

    public function assertCanAccessWorld(Child $child, World $world): void
    {
        if (! $this->canAccessWorld($child, $world)) {
            throw new AuthorizationException(self::FORBIDDEN_MESSAGE);
        }
    }

    public function canAccessLesson(Child $child, Lesson $lesson): bool
    {
        if (! $lesson->isPublished()) {
            return false;
        }

        $world = $lesson->world;
        if (! $world instanceof World || ! $this->canAccessWorld($child, $world)) {
            return false;
        }

        $module = $lesson->module;
        if ($module === null || ! $module->isPublished()) {
            return false;
        }

        $course = $module->course;
        if ($course === null || ! $course->isPublished() || $course->pod_id !== $world->pod_id) {
            return false;
        }

        $track = $course->track;
        if ($track === null || ! $track->isPublished() || $track->pod_id !== $world->pod_id) {
            return false;
        }

        return true;
    }

    public function assertCanAccessLesson(Child $child, Lesson $lesson): void
    {
        if (! $this->canAccessLesson($child, $lesson)) {
            throw new AuthorizationException(self::FORBIDDEN_MESSAGE);
        }
    }

    public function canAccessQuiz(Child $child, Quiz $quiz): bool
    {
        if (! $quiz->isPublished()) {
            return false;
        }

        $lesson = $quiz->lesson;

        return $lesson instanceof Lesson && $this->canAccessLesson($child, $lesson);
    }

    public function assertCanAccessQuiz(Child $child, Quiz $quiz): void
    {
        if (! $this->canAccessQuiz($child, $quiz)) {
            throw new AuthorizationException(self::FORBIDDEN_MESSAGE);
        }
    }

    public function canAccessProject(Child $child, Project $project): bool
    {
        if (! $project->isPublished()) {
            return false;
        }

        $lesson = $project->lesson;

        return $lesson instanceof Lesson && $this->canAccessLesson($child, $lesson);
    }

    public function assertCanAccessProject(Child $child, Project $project): void
    {
        if (! $this->canAccessProject($child, $project)) {
            throw new AuthorizationException(self::FORBIDDEN_MESSAGE);
        }
    }

    /**
     * Hook for M5 subscription enforcement.
     */
    protected function hasSubscriptionAccess(Child $child, Pod $pod): bool
    {
        return true;
    }
}
