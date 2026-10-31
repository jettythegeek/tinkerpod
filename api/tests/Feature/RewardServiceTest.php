<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Rewards\RewardEvent;
use App\Domain\Rewards\RewardResult;
use App\Domain\Rewards\RewardService;
use App\Models\Child;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Pod;
use App\Models\Quiz;
use App\Models\QuizOption;
use App\Models\QuizQuestion;
use App\Models\RewardLedger;
use App\Models\User;
use Carbon\CarbonImmutable;
use Database\Seeders\DemoCurriculumSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RewardServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_award_handles_all_event_types_and_is_idempotent_on_replay(): void
    {
        $parent = User::factory()->create();
        $child = Child::factory()->for($parent, 'parent')->create();
        $service = app(RewardService::class);

        $day1 = CarbonImmutable::parse('2026-10-31 10:00:00', 'Africa/Lagos');

        // 1. First lesson completed -> awards lesson_completed (+50 XP, +20 coins) + streak_day (+20 XP, +5 coins) + first-steps badge
        $firstLesson = $service->award(RewardEvent::lessonCompleted($child->id, 101, $day1));

        $this->assertFalse($firstLesson->wasReplayed);
        $this->assertSame(['xp' => 70, 'coins' => 25, 'gems' => 0], $firstLesson->totals);
        $this->assertSame(1, $firstLesson->levelChange['current_level']);
        $this->assertSame(1, $firstLesson->streakChange['current_streak']);
        $this->assertTrue($firstLesson->streakChange['incremented']);
        $this->assertNotEmpty($firstLesson->newBadges);
        $this->assertSame('first-steps', $firstLesson->newBadges[0]['slug']);
        $this->assertSame(RewardResult::TIER_BADGE, $firstLesson->presentationTier);

        // Replaying the exact same lesson completion event does nothing and returns the same totals
        $replayedLesson = $service->award(RewardEvent::lessonCompleted($child->id, 101, $day1));
        $this->assertTrue($replayedLesson->wasReplayed);
        $this->assertSame($firstLesson->totals, $replayedLesson->totals);
        $this->assertSame(4, RewardLedger::query()->where('child_id', $child->id)->count());

        // 2. Second lesson completed on the same Lagos day -> +50 XP, +20 coins -> crosses 100 XP (Level 2!)
        $secondLesson = $service->award(RewardEvent::lessonCompleted($child->id, 102, $day1->addHour()));
        $this->assertFalse($secondLesson->wasReplayed);
        $this->assertSame(['xp' => 120, 'coins' => 45, 'gems' => 0], $secondLesson->totals);
        $this->assertTrue($secondLesson->levelChange['leveled_up']);
        $this->assertSame(2, $secondLesson->levelChange['current_level']);
        $this->assertSame(RewardResult::TIER_LEVEL_UP, $secondLesson->presentationTier);

        // 3. Quiz passed for the first time (+80 XP, +30 coins) + perfect quiz 100% (+40 XP, +20 coins, +5 gems)
        $quizPass = $service->award(RewardEvent::quizPassed($child->id, 201, $day1->addHours(2)));
        $perfectQuiz = $service->award(RewardEvent::perfectQuiz($child->id, 201, $day1->addHours(2)));
        $combinedQuiz = RewardResult::merge($quizPass, $perfectQuiz);

        $this->assertSame(['xp' => 240, 'coins' => 95, 'gems' => 5], $combinedQuiz->totals);
        $this->assertSame(3, $combinedQuiz->levelChange['current_level']);
        $this->assertSame(RewardResult::TIER_BIG, $combinedQuiz->presentationTier);

        // 4. Streak day on the next Lagos day
        $day2 = CarbonImmutable::parse('2026-11-01 09:00:00', 'Africa/Lagos');
        $streakDay = $service->award(RewardEvent::streakDay($child->id, $day2));
        $this->assertSame(2, $streakDay->streakChange['current_streak']);
        $this->assertSame(RewardResult::TIER_STREAK, $streakDay->presentationTier);
    }

    public function test_lesson_progress_and_quiz_finish_endpoints_return_reward_result(): void
    {
        $this->seed(DemoCurriculumSeeder::class);

        $parent = User::factory()->create();
        $child = Child::factory()->for($parent, 'parent')->create();

        /** @var Pod $pod */
        $pod = Pod::query()->firstOrFail();

        Enrollment::query()->create([
            'child_id' => $child->id,
            'pod_id' => $pod->id,
            'status' => 'active',
            'enrolled_at' => now(),
        ]);

        /** @var Lesson $lesson */
        $lesson = Lesson::query()->whereHas('quizzes')->firstOrFail();
        $lesson->update(['completion_mode' => 'manual']);
        /** @var Quiz $quiz */
        $quiz = Quiz::query()->where('lesson_id', $lesson->id)->firstOrFail();
        $questions = QuizQuestion::query()
            ->where('quiz_id', $quiz->id)
            ->orderBy('question_number')
            ->get();

        Sanctum::actingAs($child, ['child:*']);

        $progressResp = $this->putJson("/api/v1/kid/lessons/{$lesson->public_id}/progress", [
            'mark_complete' => true,
            'idempotency_key' => 'complete-lesson-1',
        ]);

        $progressResp->assertOk()
            ->assertJsonPath('data.newly_completed', true)
            ->assertJsonPath('data.reward_result.totals.xp', 70)
            ->assertJsonPath('data.reward_result.totals.coins', 25);

        $startAttempt = $this->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/attempts")
            ->assertCreated();
        $attemptId = (string) $startAttempt->json('data.attempt.id');

        foreach ($questions as $question) {
            /** @var QuizOption $correctOption */
            $correctOption = QuizOption::query()
                ->where('quiz_question_id', $question->id)
                ->where('is_correct', true)
                ->firstOrFail();

            $this->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/check", [
                'attempt_id' => $attemptId,
                'question_id' => $question->public_id,
                'option_id' => $correctOption->public_id,
            ])->assertOk();
        }

        $finishResp = $this->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/attempts/{$attemptId}/finish");
        $finishResp->assertOk()
            ->assertJsonPath('data.attempt.passed', true)
            ->assertJsonPath('data.attempt.score_percent', 100)
            ->assertJsonPath('data.reward_result.totals.xp', 190)
            ->assertJsonPath('data.reward_result.totals.coins', 75)
            ->assertJsonPath('data.reward_result.totals.gems', 5)
            ->assertJsonPath('data.reward_result.presentation_tier', 'big');
    }

    public function test_client_sent_reward_fields_are_rejected_with_422(): void
    {
        $this->seed(DemoCurriculumSeeder::class);

        $parent = User::factory()->create();
        $child = Child::factory()->for($parent, 'parent')->create();

        /** @var Pod $pod */
        $pod = Pod::query()->firstOrFail();

        Enrollment::query()->create([
            'child_id' => $child->id,
            'pod_id' => $pod->id,
            'status' => 'active',
            'enrolled_at' => now(),
        ]);

        /** @var Lesson $lesson */
        $lesson = Lesson::query()->whereHas('quizzes')->firstOrFail();
        /** @var Quiz $quiz */
        $quiz = Quiz::query()->where('lesson_id', $lesson->id)->firstOrFail();

        Sanctum::actingAs($child, ['child:*']);

        foreach (['xp' => 500, 'coins' => 999, 'gems' => 50, 'level' => 20, 'badge' => 'odogwu'] as $field => $value) {
            $this->putJson("/api/v1/kid/lessons/{$lesson->public_id}/progress", [
                'mark_complete' => true,
                $field => $value,
            ])->assertStatus(422)
                ->assertJsonStructure(['data' => ['errors' => [$field]]]);

            $this->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/attempts", [
                $field => $value,
            ])->assertStatus(422)
                ->assertJsonStructure(['data' => ['errors' => [$field]]]);
        }

        $this->assertSame(0, RewardLedger::query()->where('child_id', $child->id)->count());
    }
}
