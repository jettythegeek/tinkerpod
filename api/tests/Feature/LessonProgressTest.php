<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Enums\LessonCompletionMode;
use App\Models\Child;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Module;
use App\Models\Pod;
use App\Models\Track;
use App\Models\User;
use App\Models\World;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class LessonProgressTest extends TestCase
{
    use RefreshDatabase;

    public function test_lesson_progress_moves_only_forward_and_persists_across_second_device_token(): void
    {
        $parent = User::factory()->create();
        $child = Child::factory()->for($parent, 'parent')->create(['first_name' => 'Kemi']);

        $otherParent = User::factory()->create();
        $otherChild = Child::factory()->for($otherParent, 'parent')->create(['first_name' => 'Bola']);

        $pod = Pod::factory()->create(['status' => ContentStatus::Published]);
        $track = Track::factory()->for($pod)->create(['status' => ContentStatus::Published]);
        $course = Course::factory()->for($pod)->for($track)->create(['status' => ContentStatus::Published]);
        $world = World::factory()->for($pod)->for($course)->create(['status' => ContentStatus::Published]);
        $module = Module::factory()->for($course)->create(['status' => ContentStatus::Published]);

        $watchLesson = Lesson::factory()
            ->for($world)
            ->for($module)
            ->create([
                'lesson_number' => 1,
                'title' => 'Intro to Loops',
                'status' => ContentStatus::Published,
                'completion_mode' => LessonCompletionMode::WatchPercent,
                'required_watch_percent' => 80,
                'sort_order' => 1,
            ]);

        $manualLesson = Lesson::factory()
            ->for($world)
            ->for($module)
            ->create([
                'lesson_number' => 2,
                'title' => 'Practice Loops',
                'status' => ContentStatus::Published,
                'completion_mode' => LessonCompletionMode::Manual,
                'required_watch_percent' => 80,
                'sort_order' => 2,
            ]);

        $quizGatedLesson = Lesson::factory()
            ->for($world)
            ->for($module)
            ->create([
                'lesson_number' => 3,
                'title' => 'Quiz Challenge',
                'status' => ContentStatus::Published,
                'completion_mode' => LessonCompletionMode::QuizPass,
                'required_watch_percent' => 80,
                'sort_order' => 3,
            ]);

        Enrollment::factory()->for($child)->for($pod)->create(['status' => 'active']);

        $deviceOneToken = $child->createToken('tablet-one', ['child:*'])->plainTextToken;
        $deviceTwoToken = $child->createToken('phone-two', ['child:*'])->plainTextToken;
        $otherFamilyToken = $otherChild->createToken('other-family', ['child:*'])->plainTextToken;

        // 1. Forward update on watch-gated lesson (not yet at 80%)
        DB::enableQueryLog();
        DB::flushQueryLog();

        $step1 = $this->withToken($deviceOneToken)
            ->putJson("/api/v1/kid/lessons/{$watchLesson->public_id}/progress", [
                'resume_position_seconds' => 45,
                'watch_percent' => 55,
                'mark_complete' => true, // Ignored because completion_mode is watch_percent
            ]);
        $putQueries = count(DB::getQueryLog());

        $step1->assertOk()
            ->assertJsonPath('data.newly_completed', false)
            ->assertJsonPath('data.progress.resume_position_seconds', 45)
            ->assertJsonPath('data.progress.watch_percent', 55)
            ->assertJsonPath('data.progress.is_completed', false);

        $this->assertLessThanOrEqual(14, $putQueries, "Expected <= 14 queries on PUT progress, got {$putQueries}");

        // 2. Smaller values never overwrite larger values
        $step2 = $this->withToken($deviceOneToken)
            ->putJson("/api/v1/kid/lessons/{$watchLesson->public_id}/progress", [
                'resume_position_seconds' => 12,
                'watch_percent' => 20,
            ]);

        $step2->assertOk()
            ->assertJsonPath('data.progress.resume_position_seconds', 45)
            ->assertJsonPath('data.progress.watch_percent', 55)
            ->assertJsonPath('data.progress.is_completed', false);

        // 3. Reaching required_watch_percent (80%) completes the lesson
        $step3 = $this->withToken($deviceOneToken)
            ->putJson("/api/v1/kid/lessons/{$watchLesson->public_id}/progress", [
                'resume_position_seconds' => 72,
                'watch_percent' => 85,
                'idempotency_key' => 'watch-complete-key-1',
            ]);

        $step3->assertOk()
            ->assertJsonPath('data.newly_completed', true)
            ->assertJsonPath('data.progress.resume_position_seconds', 72)
            ->assertJsonPath('data.progress.watch_percent', 85)
            ->assertJsonPath('data.progress.is_completed', true);

        $firstCompletedAt = $step3->json('data.progress.completed_at');
        $this->assertNotNull($firstCompletedAt);

        // 4. Sending the same completion again changes nothing (idempotent)
        $step4 = $this->withToken($deviceOneToken)
            ->putJson("/api/v1/kid/lessons/{$watchLesson->public_id}/progress", [
                'resume_position_seconds' => 72,
                'watch_percent' => 85,
                'idempotency_key' => 'watch-complete-key-1',
            ]);

        $step4->assertOk()
            ->assertJsonPath('data.newly_completed', false)
            ->assertJsonPath('data.progress.is_completed', true)
            ->assertJsonPath('data.progress.completed_at', $firstCompletedAt);

        $this->assertSame(
            1,
            LessonProgress::query()
                ->where('child_id', $child->id)
                ->where('lesson_id', $watchLesson->id)
                ->count()
        );

        // 5. Second device token reads back the exact same progress
        $secondDeviceRead = $this->withToken($deviceTwoToken)
            ->getJson("/api/v1/kid/lessons/{$watchLesson->public_id}");

        $secondDeviceRead->assertOk()
            ->assertJsonPath('data.lesson.progress.resume_position_seconds', 72)
            ->assertJsonPath('data.lesson.progress.watch_percent', 85)
            ->assertJsonPath('data.lesson.progress.is_completed', true)
            ->assertJsonPath('data.lesson.progress.completed_at', $firstCompletedAt);

        // 6. Manual mode requires mark_complete = true
        $this->withToken($deviceOneToken)
            ->putJson("/api/v1/kid/lessons/{$manualLesson->public_id}/progress", [
                'watch_percent' => 100,
                'mark_complete' => false,
            ])
            ->assertOk()
            ->assertJsonPath('data.progress.is_completed', false);

        $this->withToken($deviceOneToken)
            ->putJson("/api/v1/kid/lessons/{$manualLesson->public_id}/progress", [
                'mark_complete' => true,
            ])
            ->assertOk()
            ->assertJsonPath('data.newly_completed', true)
            ->assertJsonPath('data.progress.is_completed', true);

        // 7. QuizPass mode cannot be completed via PUT progress alone
        $this->withToken($deviceOneToken)
            ->putJson("/api/v1/kid/lessons/{$quizGatedLesson->public_id}/progress", [
                'watch_percent' => 100,
                'mark_complete' => true,
            ])
            ->assertOk()
            ->assertJsonPath('data.newly_completed', false)
            ->assertJsonPath('data.progress.is_completed', false);

        // 8. Another family's child gets 403
        $this->withToken($otherFamilyToken)
            ->putJson("/api/v1/kid/lessons/{$watchLesson->public_id}/progress", [
                'resume_position_seconds' => 10,
                'watch_percent' => 25,
            ])
            ->assertForbidden();
    }
}
