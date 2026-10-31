<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Learning\LearningAccess;
use App\Models\Child;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Pod;
use App\Models\Quiz;
use App\Models\Track;
use App\Models\User;
use App\Models\World;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LearningAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_enrolled_child_can_access_published_pod_world_lesson_and_quiz_while_non_enrolled_or_unpublished_gets_403(): void
    {
        $parent = User::factory()->create();
        $enrolledChild = Child::factory()->for($parent, 'parent')->create();
        $unenrolledChild = Child::factory()->for($parent, 'parent')->create();

        $pod = Pod::factory()->create();
        $track = Track::factory()->for($pod, 'pod')->create();
        $course = Course::factory()->create([
            'pod_id' => $pod->id,
            'track_id' => $track->id,
        ]);
        $world = World::factory()->create([
            'pod_id' => $pod->id,
            'course_id' => $course->id,
        ]);
        $module = Module::factory()->create([
            'course_id' => $course->id,
            'world_id' => $world->id,
        ]);
        $lesson = Lesson::factory()->create([
            'module_id' => $module->id,
            'world_id' => $world->id,
        ]);
        $quiz = Quiz::factory()->for($lesson, 'lesson')->create();

        Enrollment::factory()->create([
            'child_id' => $enrolledChild->id,
            'pod_id' => $pod->id,
            'status' => 'active',
        ]);

        /** @var LearningAccess $access */
        $access = app(LearningAccess::class);

        // Enrolled child can open published content
        $this->assertTrue($access->canAccessPod($enrolledChild, $pod));
        $this->assertTrue($access->canAccessWorld($enrolledChild, $world));
        $this->assertTrue($access->canAccessLesson($enrolledChild, $lesson));
        $this->assertTrue($access->canAccessQuiz($enrolledChild, $quiz));

        // Non-enrolled child is rejected on all content
        $this->assertFalse($access->canAccessPod($unenrolledChild, $pod));
        $this->assertFalse($access->canAccessWorld($unenrolledChild, $world));
        $this->assertFalse($access->canAccessLesson($unenrolledChild, $lesson));
        $this->assertFalse($access->canAccessQuiz($unenrolledChild, $quiz));

        $this->expectException(AuthorizationException::class);
        $access->assertCanAccessLesson($unenrolledChild, $lesson);
    }

    public function test_draft_or_archived_content_or_ancestor_is_blocked_even_when_enrolled(): void
    {
        $parent = User::factory()->create();
        $child = Child::factory()->for($parent, 'parent')->create();

        $pod = Pod::factory()->create();
        $track = Track::factory()->for($pod, 'pod')->create();
        $course = Course::factory()->create([
            'pod_id' => $pod->id,
            'track_id' => $track->id,
        ]);
        $world = World::factory()->create([
            'pod_id' => $pod->id,
            'course_id' => $course->id,
        ]);
        $module = Module::factory()->create([
            'course_id' => $course->id,
            'world_id' => $world->id,
        ]);
        $lesson = Lesson::factory()->create([
            'module_id' => $module->id,
            'world_id' => $world->id,
        ]);
        $quiz = Quiz::factory()->for($lesson, 'lesson')->create();

        Enrollment::factory()->create([
            'child_id' => $child->id,
            'pod_id' => $pod->id,
            'status' => 'active',
        ]);

        /** @var LearningAccess $access */
        $access = app(LearningAccess::class);

        // Draft lesson blocked
        $lesson->markDraft();
        $this->assertFalse($access->canAccessLesson($child, $lesson->fresh()));
        $this->assertFalse($access->canAccessQuiz($child, $quiz->fresh()));

        // Archived lesson blocked
        $lesson->archive();
        $this->assertFalse($access->canAccessLesson($child, $lesson->fresh()));

        // Restore lesson, archive module -> lesson and quiz blocked
        $lesson->publish();
        $module->archive();
        $this->assertFalse($access->canAccessLesson($child, $lesson->fresh()));

        // Restore module, draft world -> lesson blocked
        $module->publish();
        $world->markDraft();
        $this->assertFalse($access->canAccessWorld($child, $world->fresh()));
        $this->assertFalse($access->canAccessLesson($child, $lesson->fresh()));

        // Restore world, archive pod -> everything blocked
        $world->publish();
        $pod->archive();
        $this->assertFalse($access->canAccessPod($child, $pod->fresh()));
        $this->assertFalse($access->canAccessLesson($child, $lesson->fresh()));
    }
}
