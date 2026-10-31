<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Enums\LessonCompletionMode;
use App\Models\Child;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Pod;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizOption;
use App\Models\QuizQuestion;
use App\Models\Track;
use App\Models\User;
use App\Models\World;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KidQuizTest extends TestCase
{
    use RefreshDatabase;

    public function test_quiz_hides_answers_checks_with_explanations_scores_on_server_and_enforces_attempt_cap_and_idempotency(): void
    {
        $parent = User::factory()->create();
        $child = Child::factory()->for($parent, 'parent')->create(['first_name' => 'Zainab']);

        $otherParent = User::factory()->create();
        $otherChild = Child::factory()->for($otherParent, 'parent')->create(['first_name' => 'Chidi']);

        $pod = Pod::factory()->create(['status' => ContentStatus::Published]);
        $track = Track::factory()->for($pod)->create(['status' => ContentStatus::Published]);
        $course = Course::factory()->for($pod)->for($track)->create(['status' => ContentStatus::Published]);
        $world = World::factory()->for($pod)->for($course)->create(['status' => ContentStatus::Published]);
        $module = Module::factory()->for($course)->create(['status' => ContentStatus::Published]);

        $lesson = Lesson::factory()
            ->for($world)
            ->for($module)
            ->create([
                'lesson_number' => 2,
                'title' => 'Repeat and Count',
                'status' => ContentStatus::Published,
                'completion_mode' => LessonCompletionMode::QuizPass,
            ]);

        $quiz = Quiz::factory()
            ->for($lesson)
            ->create([
                'title' => 'Range Loop Quiz',
                'status' => ContentStatus::Published,
                'pass_mark_percent' => 75,
                'max_attempts' => 2,
            ]);

        $q1 = QuizQuestion::factory()->for($quiz)->create([
            'question_number' => 1,
            'prompt' => 'What will this loop print?',
            'code_snippet' => "for i in range(3):\n    print(i)",
            'explanation' => 'range(3) counts 0, 1, 2 and stops before 3.',
            'points' => 10,
            'sort_order' => 1,
        ]);
        $q1OptA = QuizOption::factory()->for($q1, 'question')->create([
            'option_key' => 'A',
            'label' => '0  1  2',
            'is_correct' => true,
            'sort_order' => 1,
        ]);
        $q1OptB = QuizOption::factory()->for($q1, 'question')->create([
            'option_key' => 'B',
            'label' => '1  2  3',
            'is_correct' => false,
            'sort_order' => 2,
        ]);

        $q2 = QuizQuestion::factory()->for($quiz)->create([
            'question_number' => 2,
            'prompt' => 'How many numbers does range(4) produce?',
            'code_snippet' => 'list(range(4))',
            'explanation' => 'range(4) produces four numbers: 0, 1, 2, and 3.',
            'points' => 10,
            'sort_order' => 2,
        ]);
        $q2OptA = QuizOption::factory()->for($q2, 'question')->create([
            'option_key' => 'A',
            'label' => '3 numbers',
            'is_correct' => false,
            'sort_order' => 1,
        ]);
        $q2OptB = QuizOption::factory()->for($q2, 'question')->create([
            'option_key' => 'B',
            'label' => '4 numbers',
            'is_correct' => true,
            'sort_order' => 2,
        ]);

        Enrollment::factory()->for($child)->for($pod)->create(['status' => 'active']);

        $tokenOne = $child->createToken('device-1', ['child:*'])->plainTextToken;
        $tokenTwo = $child->createToken('device-2', ['child:*'])->plainTextToken;
        $otherToken = $otherChild->createToken('other-device', ['child:*'])->plainTextToken;

        // 1. Quiz fetch never exposes is_correct or explanation before a check
        $getRes = $this->withToken($tokenOne)->getJson("/api/v1/kid/quizzes/{$quiz->public_id}");
        $getRes->assertOk()
            ->assertJsonPath('data.quiz.max_attempts', 2)
            ->assertJsonPath('data.quiz.remaining_attempts', 2);

        $rawQuiz = (string) $getRes->getContent();
        $this->assertStringNotContainsString('is_correct', $rawQuiz);
        $this->assertStringNotContainsString('stops before 3', $rawQuiz);

        // 2. Check a wrong answer: friendly wording ("Not quite. Try again!", never "Wrong!") + explanation
        $wrongCheck = $this->withToken($tokenOne)
            ->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/check", [
                'question_id' => $q1->public_id,
                'option_id' => $q1OptB->public_id,
            ]);

        $wrongCheck->assertOk()
            ->assertJsonPath('data.is_correct', false)
            ->assertJsonPath('data.feedback', 'Not quite. Try again!')
            ->assertJsonPath('data.explanation', 'range(3) counts 0, 1, 2 and stops before 3.');

        $this->assertStringNotContainsString('Wrong!', (string) $wrongCheck->getContent());

        // 3. Check a right answer: returns is_correct = true + explanation
        $rightCheck = $this->withToken($tokenOne)
            ->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/check", [
                'question_id' => $q1->public_id,
                'option_id' => $q1OptA->public_id,
            ]);

        $rightCheck->assertOk()
            ->assertJsonPath('data.is_correct', true)
            ->assertJsonPath('data.explanation', 'range(3) counts 0, 1, 2 and stops before 3.');

        // 4. Attempt 1: 50% (< 75% pass mark) -> fails, lesson stays incomplete
        $attempt1 = $this->withToken($tokenOne)
            ->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/attempts", [
                'idempotency_key' => 'attempt-1-key',
                'answers' => [
                    ['question_id' => $q1->public_id, 'option_id' => $q1OptA->public_id],
                    ['question_id' => $q2->public_id, 'option_id' => $q2OptA->public_id],
                ],
            ]);

        $attempt1->assertOk()
            ->assertJsonPath('data.attempt.attempt_number', 1)
            ->assertJsonPath('data.attempt.score_percent', 50)
            ->assertJsonPath('data.attempt.passed', false)
            ->assertJsonPath('data.attempt.remaining_attempts', 1)
            ->assertJsonPath('data.attempt.lesson_completed', false)
            ->assertJsonPath('data.attempt.feedback', 'Not quite. Try again!');

        // 5. Attempt 2: 100% (>= 75% pass mark) -> passes and completes the quiz-gated lesson
        $attempt2 = $this->withToken($tokenOne)
            ->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/attempts", [
                'idempotency_key' => 'attempt-2-key',
                'answers' => [
                    ['question_id' => $q1->public_id, 'option_id' => $q1OptA->public_id],
                    ['question_id' => $q2->public_id, 'option_id' => $q2OptB->public_id],
                ],
            ]);

        $attempt2->assertOk()
            ->assertJsonPath('data.attempt.attempt_number', 2)
            ->assertJsonPath('data.attempt.score_percent', 100)
            ->assertJsonPath('data.attempt.passed', true)
            ->assertJsonPath('data.attempt.remaining_attempts', 0)
            ->assertJsonPath('data.attempt.replayed', false)
            ->assertJsonPath('data.attempt.lesson_completed', true);

        // 6. Replaying Attempt 2 with the same idempotency_key never double-counts
        $replayAttempt2 = $this->withToken($tokenOne)
            ->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/attempts", [
                'idempotency_key' => 'attempt-2-key',
                'answers' => [
                    ['question_id' => $q1->public_id, 'option_id' => $q1OptA->public_id],
                    ['question_id' => $q2->public_id, 'option_id' => $q2OptB->public_id],
                ],
            ]);

        $replayAttempt2->assertOk()
            ->assertJsonPath('data.attempt.attempt_number', 2)
            ->assertJsonPath('data.attempt.replayed', true)
            ->assertJsonPath('data.attempt.score_percent', 100);

        $this->assertSame(
            2,
            QuizAttempt::query()
                ->where('child_id', $child->id)
                ->where('quiz_id', $quiz->id)
                ->count()
        );

        // 7. Attempt 3 (exceeding max_attempts = 2) is rejected with 422
        $this->withToken($tokenOne)
            ->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/attempts", [
                'idempotency_key' => 'attempt-3-key',
                'answers' => [
                    ['question_id' => $q1->public_id, 'option_id' => $q1OptA->public_id],
                    ['question_id' => $q2->public_id, 'option_id' => $q2OptB->public_id],
                ],
            ])
            ->assertStatus(422)
            ->assertJsonPath('data.remaining_attempts', 0);

        $this->withToken($tokenOne)
            ->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/check", [
                'question_id' => $q1->public_id,
                'option_id' => $q1OptA->public_id,
            ])
            ->assertStatus(422);

        // 8. Second device token reads back the completed lesson and quiz status
        $this->withToken($tokenTwo)
            ->getJson("/api/v1/kid/lessons/{$lesson->public_id}")
            ->assertOk()
            ->assertJsonPath('data.lesson.progress.quiz_passed', true)
            ->assertJsonPath('data.lesson.progress.is_completed', true);

        $this->withToken($tokenTwo)
            ->getJson("/api/v1/kid/quizzes/{$quiz->public_id}")
            ->assertOk()
            ->assertJsonPath('data.quiz.attempts_used', 2)
            ->assertJsonPath('data.quiz.remaining_attempts', 0)
            ->assertJsonPath('data.quiz.best_score_percent', 100)
            ->assertJsonPath('data.quiz.is_passed', true);

        // 9. Another family's child gets 403
        $this->withToken($otherToken)
            ->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/check", [
                'question_id' => $q1->public_id,
                'option_id' => $q1OptA->public_id,
            ])
            ->assertForbidden();

        $this->withToken($otherToken)
            ->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/attempts", [
                'answers' => [
                    ['question_id' => $q1->public_id, 'option_id' => $q1OptA->public_id],
                    ['question_id' => $q2->public_id, 'option_id' => $q2OptB->public_id],
                ],
            ])
            ->assertForbidden();
    }
}
