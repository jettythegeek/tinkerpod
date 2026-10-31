<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Enums\RoleName;
use App\Models\AuditLog;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Pod;
use App\Models\Project;
use App\Models\PublicationLog;
use App\Models\Quiz;
use App\Models\QuizOption;
use App\Models\QuizQuestion;
use App\Models\Track;
use App\Models\User;
use App\Models\World;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CurriculumSchemaAndPublicationLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_builds_tracks_courses_modules_lessons_quizzes_projects_pods_and_worlds_with_public_ulids_and_logs_publication_changes(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $contentManager = User::factory()->create();
        $contentManager->assignRole(RoleName::ContentManager->value);
        $this->actingAs($contentManager);

        $pod = Pod::factory()->draft()->create([
            'slug' => 'coding-pod',
            'title' => 'Coding Pod',
        ]);

        $track = Track::factory()->draft()->for($pod, 'pod')->create([
            'slug' => 'python-adventures',
            'title' => 'Python Adventures',
        ]);

        $course = Course::factory()->draft()->create([
            'pod_id' => $pod->id,
            'track_id' => $track->id,
            'slug' => 'python-foundations',
            'title' => 'Python Foundations',
        ]);

        $world = World::factory()->draft()->create([
            'pod_id' => $pod->id,
            'course_id' => $course->id,
            'slug' => 'loops-valley',
            'title' => 'Loops Valley',
            'world_number' => 4,
            'sort_order' => 4,
        ]);

        $module = Module::factory()->draft()->create([
            'course_id' => $course->id,
            'world_id' => $world->id,
            'slug' => 'looping-basics',
            'title' => 'Looping Basics',
            'sort_order' => 1,
        ]);

        $lesson1 = Lesson::factory()->draft()->create([
            'module_id' => $module->id,
            'world_id' => $world->id,
            'slug' => 'intro-to-loops',
            'lesson_number' => 1,
            'title' => 'Intro to Loops',
            'sort_order' => 1,
        ]);

        $lesson2 = Lesson::factory()->draft()->create([
            'module_id' => $module->id,
            'world_id' => $world->id,
            'slug' => 'repeat-and-count',
            'lesson_number' => 2,
            'title' => 'Repeat and Count',
            'sort_order' => 2,
        ]);

        $quiz = Quiz::factory()->draft()->for($lesson2, 'lesson')->create([
            'title' => 'range() Quiz',
        ]);

        $question = QuizQuestion::factory()->for($quiz, 'quiz')->create([
            'question_number' => 1,
            'sort_order' => 1,
        ]);

        $optionA = QuizOption::factory()->for($question, 'question')->create([
            'option_key' => 'A',
            'label' => '0  1  2',
            'is_correct' => true,
            'sort_order' => 1,
        ]);

        $optionB = QuizOption::factory()->for($question, 'question')->create([
            'option_key' => 'B',
            'label' => '1  2  3',
            'is_correct' => false,
            'sort_order' => 2,
        ]);

        $project = Project::factory()->for($lesson2, 'lesson')->create([
            'status' => ContentStatus::Draft->value,
            'published_at' => null,
        ]);

        // Verify public ULIDs (26-char lowercase) across all entities
        foreach ([$pod, $track, $course, $world, $module, $lesson1, $lesson2, $quiz, $question, $optionA, $optionB, $project] as $model) {
            $this->assertSame(26, strlen($model->public_id));
            $this->assertSame('public_id', $model->getRouteKeyName());
        }

        // Lessons belong to a world and are ordered by sort_order
        $worldLessons = $world->lessons()->pluck('slug')->all();
        $this->assertSame(['intro-to-loops', 'repeat-and-count'], $worldLessons);

        // Transition lesson2 from draft -> published -> archived and verify publication logs & audit logs
        $lesson2->publish($contentManager);
        $this->assertSame(ContentStatus::Published->value, $lesson2->fresh()->status);
        $this->assertNotNull($lesson2->fresh()->published_at);

        $lesson2->archive($contentManager);
        $this->assertSame(ContentStatus::Archived->value, $lesson2->fresh()->status);
        $this->assertNotNull($lesson2->fresh()->archived_at);

        $logs = PublicationLog::query()
            ->where('publishable_type', Lesson::class)
            ->where('publishable_id', $lesson2->public_id)
            ->orderBy('id')
            ->get();

        $this->assertCount(2, $logs);
        $this->assertSame('draft', $logs[0]->from_status);
        $this->assertSame('published', $logs[0]->to_status);
        $this->assertSame((string) $contentManager->id, $logs[0]->actor_id);
        $this->assertNotNull($logs[0]->audit_log_id);

        $this->assertSame('published', $logs[1]->from_status);
        $this->assertSame('archived', $logs[1]->to_status);

        $this->assertDatabaseHas('audit_logs', [
            'id' => $logs[0]->audit_log_id,
            'action' => 'curriculum.status.changed',
            'subject_type' => Lesson::class,
            'subject_id' => $lesson2->public_id,
        ]);

        $this->assertGreaterThanOrEqual(2, AuditLog::query()->where('action', 'curriculum.status.changed')->count());
    }
}
