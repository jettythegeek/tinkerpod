<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Child;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Module;
use App\Models\Pod;
use App\Models\Quiz;
use App\Models\QuizOption;
use App\Models\QuizQuestion;
use App\Models\Track;
use App\Models\User;
use App\Models\World;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class KidCatalogueTest extends TestCase
{
    use RefreshDatabase;

    public function test_kid_catalogue_endpoints_return_home_journey_map_lesson_and_quiz_without_correct_answers_and_without_n_plus_one_queries(): void
    {
        $parent = User::factory()->create();
        $child = Child::factory()->for($parent, 'parent')->create([
            'first_name' => 'Amara',
            'username' => 'amara_star',
        ]);
        $unenrolledChild = Child::factory()->for($parent, 'parent')->create([
            'first_name' => 'Tobi',
            'username' => 'tobi_star',
        ]);

        $childToken = $child->createToken('kid-mobile', ['child:*'])->plainTextToken;
        $unenrolledToken = $unenrolledChild->createToken('kid-mobile', ['child:*'])->plainTextToken;

        $pod = Pod::factory()->create([
            'slug' => 'coding-pod',
            'title' => 'Coding Pod',
        ]);

        Enrollment::factory()->create([
            'child_id' => $child->id,
            'pod_id' => $pod->id,
            'status' => 'active',
        ]);

        $track = Track::factory()->for($pod, 'pod')->create();
        $course = Course::factory()->create([
            'pod_id' => $pod->id,
            'track_id' => $track->id,
        ]);

        $world1 = World::factory()->create([
            'pod_id' => $pod->id,
            'course_id' => $course->id,
            'title' => 'Welcome Island',
            'world_number' => 1,
            'sort_order' => 1,
        ]);
        $world2 = World::factory()->create([
            'pod_id' => $pod->id,
            'course_id' => $course->id,
            'title' => 'Loops Valley',
            'world_number' => 2,
            'sort_order' => 2,
        ]);
        $world3 = World::factory()->create([
            'pod_id' => $pod->id,
            'course_id' => $course->id,
            'title' => 'Game Builder',
            'world_number' => 3,
            'sort_order' => 3,
        ]);

        // Draft world must never appear
        $draftWorld = World::factory()->draft()->create([
            'pod_id' => $pod->id,
            'course_id' => $course->id,
            'title' => 'Secret Draft World',
            'world_number' => 4,
            'sort_order' => 4,
        ]);

        $module1 = Module::factory()->create([
            'course_id' => $course->id,
            'world_id' => $world1->id,
            'sort_order' => 1,
        ]);
        $module2 = Module::factory()->create([
            'course_id' => $course->id,
            'world_id' => $world2->id,
            'sort_order' => 2,
        ]);
        $module3 = Module::factory()->create([
            'course_id' => $course->id,
            'world_id' => $world3->id,
            'sort_order' => 3,
        ]);

        // World 1 has 1 lesson, completed -> World 1 is 'done'
        $w1Lesson1 = Lesson::factory()->create([
            'module_id' => $module1->id,
            'world_id' => $world1->id,
            'lesson_number' => 1,
            'title' => 'Hello Captain Jetty',
            'sort_order' => 1,
        ]);
        LessonProgress::factory()->completed()->create([
            'child_id' => $child->id,
            'lesson_id' => $w1Lesson1->id,
        ]);

        // World 2 has 3 lessons: Lesson 1 done, Lesson 2 in progress ('now'), Lesson 3 locked ('lock')
        $w2Lesson1 = Lesson::factory()->create([
            'module_id' => $module2->id,
            'world_id' => $world2->id,
            'lesson_number' => 1,
            'title' => 'What Is a Loop?',
            'sort_order' => 1,
        ]);
        LessonProgress::factory()->completed()->create([
            'child_id' => $child->id,
            'lesson_id' => $w2Lesson1->id,
        ]);

        $w2Lesson2 = Lesson::factory()->create([
            'module_id' => $module2->id,
            'world_id' => $world2->id,
            'lesson_number' => 2,
            'title' => 'Repeat and Count',
            'sort_order' => 2,
        ]);
        LessonProgress::factory()->create([
            'child_id' => $child->id,
            'lesson_id' => $w2Lesson2->id,
            'watch_percent' => 40,
            'resume_position_seconds' => 32,
            'is_completed' => false,
        ]);

        $w2Lesson3 = Lesson::factory()->create([
            'module_id' => $module2->id,
            'world_id' => $world2->id,
            'lesson_number' => 3,
            'title' => 'Nested Loops',
            'sort_order' => 3,
        ]);

        // Draft lesson in World 2 must never appear
        $draftLesson = Lesson::factory()->draft()->create([
            'module_id' => $module2->id,
            'world_id' => $world2->id,
            'lesson_number' => 4,
            'title' => 'Draft Loop Lesson',
            'sort_order' => 4,
        ]);

        // World 3 has 1 lesson -> World 3 is 'lock'
        Lesson::factory()->create([
            'module_id' => $module3->id,
            'world_id' => $world3->id,
            'lesson_number' => 1,
            'title' => 'Sprite Motion',
            'sort_order' => 1,
        ]);

        $quiz = Quiz::factory()->for($w2Lesson2, 'lesson')->create([
            'title' => 'range() Loop Quiz',
        ]);

        for ($qNum = 1; $qNum <= 4; $qNum++) {
            $q = QuizQuestion::factory()->for($quiz, 'quiz')->create([
                'question_number' => $qNum,
                'sort_order' => $qNum,
            ]);
            foreach (['A' => true, 'B' => false, 'C' => false, 'D' => false] as $idx => $isCorrect) {
                QuizOption::factory()->for($q, 'question')->create([
                    'option_key' => $idx,
                    'label' => "Option {$idx}",
                    'is_correct' => $isCorrect,
                    'sort_order' => ord($idx) - 64,
                ]);
            }
        }

        // 1. Kid Home summary + query count assertion
        DB::enableQueryLog();
        DB::flushQueryLog();

        $homeRes = $this->withToken($childToken)->getJson('/api/v1/kid/home');
        $homeQueries = count(DB::getQueryLog());

        $homeRes->assertOk()
            ->assertJsonPath('data.child.first_name', 'Amara')
            ->assertJsonPath('data.continue_lesson.id', $w2Lesson2->public_id)
            ->assertJsonPath('data.continue_lesson.title', 'Repeat and Count')
            ->assertJsonPath('data.continue_lesson.watch_percent', 40)
            ->assertJsonPath('data.pods.0.cleared_worlds_count', 1)
            ->assertJsonPath('data.pods.0.total_worlds_count', 3);

        $this->assertLessThanOrEqual(8, $homeQueries, "Expected <= 8 queries on /kid/home, got {$homeQueries}");

        // 2. Journey Map + lock/done/now states + query count assertion
        DB::flushQueryLog();

        $mapRes = $this->withToken($childToken)->getJson('/api/v1/kid/journey-map');
        $mapQueries = count(DB::getQueryLog());

        $mapRes->assertOk()
            ->assertJsonCount(3, 'data.pod.worlds')
            ->assertJsonPath('data.pod.worlds.0.title', 'Welcome Island')
            ->assertJsonPath('data.pod.worlds.0.state', 'done')
            ->assertJsonPath('data.pod.worlds.1.title', 'Loops Valley')
            ->assertJsonPath('data.pod.worlds.1.state', 'now')
            ->assertJsonPath('data.pod.worlds.1.lessons.0.state', 'done')
            ->assertJsonPath('data.pod.worlds.1.lessons.1.state', 'now')
            ->assertJsonPath('data.pod.worlds.1.lessons.2.state', 'lock')
            ->assertJsonPath('data.pod.worlds.2.title', 'Game Builder')
            ->assertJsonPath('data.pod.worlds.2.state', 'lock')
            ->assertJsonPath('data.pod.current_lesson.id', $w2Lesson2->public_id);

        $this->assertLessThanOrEqual(8, $mapQueries, "Expected <= 8 queries on /kid/journey-map, got {$mapQueries}");

        // 3. Lesson detail + query count assertion
        DB::flushQueryLog();

        $lessonRes = $this->withToken($childToken)->getJson("/api/v1/kid/lessons/{$w2Lesson2->public_id}");
        $lessonQueries = count(DB::getQueryLog());

        $lessonRes->assertOk()
            ->assertJsonPath('data.lesson.id', $w2Lesson2->public_id)
            ->assertJsonPath('data.lesson.title', 'Repeat and Count')
            ->assertJsonPath('data.lesson.progress.watch_percent', 40)
            ->assertJsonPath('data.lesson.progress.resume_position_seconds', 32)
            ->assertJsonPath('data.lesson.quizzes.0.id', $quiz->public_id);

        $this->assertLessThanOrEqual(14, $lessonQueries, "Expected <= 14 queries on /kid/lessons/{id}, got {$lessonQueries}");

        // 4. Quiz detail + hidden answers + query count assertion
        DB::flushQueryLog();

        $quizRes = $this->withToken($childToken)->getJson("/api/v1/kid/quizzes/{$quiz->public_id}");
        $quizQueries = count(DB::getQueryLog());

        $quizRes->assertOk()
            ->assertJsonPath('data.quiz.id', $quiz->public_id)
            ->assertJsonCount(4, 'data.quiz.questions');

        $this->assertLessThanOrEqual(14, $quizQueries, "Expected <= 14 queries on /kid/quizzes/{id}, got {$quizQueries}");

        // Ensure `is_correct` is never present anywhere in the quiz JSON payload
        $rawQuizJson = (string) $quizRes->getContent();
        $this->assertStringNotContainsString('is_correct', $rawQuizJson);

        // 5. Draft content and non-enrolled child get 403
        $this->withToken($childToken)
            ->getJson("/api/v1/kid/lessons/{$draftLesson->public_id}")
            ->assertForbidden();

        $this->withToken($unenrolledToken)
            ->getJson("/api/v1/kid/pods/{$pod->public_id}/journey-map")
            ->assertForbidden();

        $this->withToken($unenrolledToken)
            ->getJson("/api/v1/kid/lessons/{$w2Lesson2->public_id}")
            ->assertForbidden();

        $this->withToken($unenrolledToken)
            ->getJson("/api/v1/kid/quizzes/{$quiz->public_id}")
            ->assertForbidden();
    }
}
