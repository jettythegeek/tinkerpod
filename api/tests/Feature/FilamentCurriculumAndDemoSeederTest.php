<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Enums\PermissionName;
use App\Filament\Resources\CourseResource;
use App\Filament\Resources\LessonResource;
use App\Filament\Resources\ModuleResource;
use App\Filament\Resources\QuizResource;
use App\Filament\Resources\TrackResource;
use App\Filament\Resources\WorldResource;
use App\Models\Child;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Pod;
use App\Models\Quiz;
use App\Models\Track;
use App\Models\User;
use App\Models\World;
use Database\Seeders\DemoCurriculumSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FilamentCurriculumAndDemoSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_filament_curriculum_resources_are_gated_by_curriculum_permissions_not_role_names(): void
    {
        $resources = [
            TrackResource::class,
            CourseResource::class,
            ModuleResource::class,
            WorldResource::class,
            LessonResource::class,
            QuizResource::class,
        ];

        $userWithoutPermissions = User::factory()->create();
        $this->actingAs($userWithoutPermissions);

        foreach ($resources as $resourceClass) {
            $this->assertFalse($resourceClass::canViewAny(), "{$resourceClass} must deny view without curriculum.view");
            $this->assertFalse($resourceClass::canCreate(), "{$resourceClass} must deny create without curriculum.manage");
            $this->assertFalse($resourceClass::canPublish(), "{$resourceClass} must deny publish without curriculum.publish");
        }

        // Grant only curriculum.view directly (no role name assigned)
        $viewer = User::factory()->create();
        $viewer->givePermissionTo(PermissionName::ViewCurriculum->value);
        $this->actingAs($viewer);

        foreach ($resources as $resourceClass) {
            $this->assertTrue($resourceClass::canViewAny());
            $this->assertFalse($resourceClass::canCreate());
            $this->assertFalse($resourceClass::canPublish());
        }

        // Grant curriculum.manage (still cannot publish)
        $editor = User::factory()->create();
        $editor->givePermissionTo([
            PermissionName::ViewCurriculum->value,
            PermissionName::ManageCurriculum->value,
        ]);
        $this->actingAs($editor);

        $pod = Pod::factory()->create();
        $track = Track::factory()->for($pod)->create(['status' => ContentStatus::Draft]);
        $course = Course::factory()->for($pod)->for($track)->create(['status' => ContentStatus::Draft]);
        $world = World::factory()->for($pod)->for($course)->create(['status' => ContentStatus::Draft]);
        $module = Module::factory()->for($course)->create(['status' => ContentStatus::Draft]);
        $lesson = Lesson::factory()->for($world)->for($module)->create(['status' => ContentStatus::Draft]);

        foreach ($resources as $resourceClass) {
            $this->assertTrue($resourceClass::canViewAny());
            $this->assertTrue($resourceClass::canCreate());
            $this->assertFalse($resourceClass::canPublish());
        }

        $caughtForbiddenPublish = false;
        try {
            LessonResource::publishRecord($lesson);
        } catch (AuthorizationException) {
            $caughtForbiddenPublish = true;
        }
        $this->assertTrue($caughtForbiddenPublish, 'Editor without curriculum.publish must not publish.');

        // Grant curriculum.publish -> publish and archive succeed and write publication logs
        $publisher = User::factory()->create();
        $publisher->givePermissionTo([
            PermissionName::ViewCurriculum->value,
            PermissionName::ManageCurriculum->value,
            PermissionName::PublishCurriculum->value,
        ]);
        $this->actingAs($publisher);

        LessonResource::publishRecord($lesson, 'Ready for Loops Valley');
        $this->assertSame(ContentStatus::Published->value, $lesson->fresh()?->status);

        LessonResource::archiveRecord($lesson, 'Retiring old draft');
        $this->assertSame(ContentStatus::Archived->value, $lesson->fresh()?->status);

        $this->assertSame(
            2,
            $lesson->publicationLogs()->count()
        );
    }

    public function test_demo_curriculum_seeder_seeds_coding_pod_loops_valley_repeat_and_count_and_range_quiz_marked_as_demo(): void
    {
        $parent = User::factory()->create();
        $child = Child::factory()->for($parent, 'parent')->create(['first_name' => 'Tunde']);

        $this->seed(DemoCurriculumSeeder::class);

        $pod = Pod::query()->where('slug', 'coding-pod')->firstOrFail();
        $this->assertTrue($pod->is_demo);
        $this->assertSame('Coding Pod', $pod->title);
        $this->assertCount(6, $pod->worlds);

        $loopsValley = World::query()->where('pod_id', $pod->id)->where('slug', 'loops-valley')->firstOrFail();
        $this->assertTrue($loopsValley->is_demo);
        $this->assertSame('Loops Valley', $loopsValley->title);
        $this->assertCount(5, $loopsValley->lessons);

        $repeatAndCount = Lesson::query()->where('world_id', $loopsValley->id)->where('slug', 'repeat-and-count')->firstOrFail();
        $this->assertTrue($repeatAndCount->is_demo);
        $this->assertSame('Repeat and Count', $repeatAndCount->title);
        $this->assertSame(8, $repeatAndCount->duration_minutes);
        $this->assertSame(5, $repeatAndCount->steps_count);

        $quiz = Quiz::query()->where('lesson_id', $repeatAndCount->id)->firstOrFail();
        $this->assertTrue($quiz->is_demo);
        $this->assertCount(4, $quiz->questions);

        $childToken = $child->createToken('demo-kid', ['child:*'])->plainTextToken;
        $this->withToken($childToken)
            ->getJson('/api/v1/kid/journey-map')
            ->assertOk()
            ->assertJsonPath('data.pod.title', 'Coding Pod')
            ->assertJsonPath('data.pod.is_demo', true)
            ->assertJsonCount(6, 'data.pod.worlds');
    }
}
