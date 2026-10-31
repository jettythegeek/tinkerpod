<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Rewards\RewardEvent;
use App\Domain\Rewards\RewardService;
use App\Models\Child;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Pod;
use App\Models\Quiz;
use App\Models\QuizOption;
use App\Models\QuizQuestion;
use App\Models\RewardBalance;
use App\Models\RewardLedger;
use App\Models\User;
use Carbon\CarbonImmutable;
use Database\Seeders\DemoCurriculumSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RewardPropertyAndConcurrencyTest extends TestCase
{
    use RefreshDatabase;

    public function test_property_random_event_sequences_replay_and_rebuild_identically(): void
    {
        $service = app(RewardService::class);
        $parent = User::factory()->create();

        // Run 5 deterministic PRNG seeds with varied event sequences
        foreach ([101, 202, 303, 404, 505] as $seed) {
            mt_srand($seed);
            $child = Child::factory()->for($parent, 'parent')->create();

            $cursor = CarbonImmutable::parse('2026-10-01 09:00:00', 'Africa/Lagos');
            /** @var list<RewardEvent> $events */
            $events = [];

            for ($step = 0; $step < 18; $step++) {
                $roll = mt_rand(1, 4);
                if ($roll === 1) {
                    $lessonId = mt_rand(1, 8);
                    $events[] = RewardEvent::lessonCompleted($child->id, $lessonId, $cursor);
                } elseif ($roll === 2) {
                    $quizId = mt_rand(1, 6);
                    $events[] = RewardEvent::quizPassed($child->id, $quizId, $cursor);
                } elseif ($roll === 3) {
                    $quizId = mt_rand(1, 6);
                    $events[] = RewardEvent::perfectQuiz($child->id, $quizId, $cursor);
                } else {
                    $events[] = RewardEvent::streakDay($child->id, $cursor);
                }

                // Advance by either a few hours or 1-2 days in Africa/Lagos
                $advanceHours = [2, 6, 14, 24, 30, 48][mt_rand(0, 5)];
                $cursor = $cursor->addHours($advanceHours);
            }

            foreach ($events as $event) {
                $service->award($event);
            }

            $expectedLedgerCount = RewardLedger::query()->where('child_id', $child->id)->count();
            $expectedTotals = RewardLedger::ledgerTotalsFor($child->id);
            $expectedSummary = $service->profileSummaryFor($child);

            // Replay all events in reverse order and duplicate order: must be 100% idempotent
            foreach (array_reverse($events) as $event) {
                $replayed = $service->award($event);
                $this->assertSame($expectedTotals, $replayed->totals);
            }

            $this->assertSame(
                $expectedLedgerCount,
                RewardLedger::query()->where('child_id', $child->id)->count(),
                "Ledger count drifted on replay for seed {$seed}."
            );

            // Verify cached balances match ledger before rebuild
            $this->artisan('tinkerpod:rebuild-reward-balances --verify')
                ->assertExitCode(0);

            // Corrupt/wipe cached balances and rebuild from ledger
            RewardBalance::query()->where('child_id', $child->id)->delete();

            $this->artisan('tinkerpod:rebuild-reward-balances')
                ->assertExitCode(0);

            $rebuiltFromLedger = $service->rebuildFromLedger($child);
            $this->assertSame($expectedTotals, $rebuiltFromLedger['totals']);
            $this->assertSame($expectedSummary['level'], $rebuiltFromLedger['level']);
            $this->assertSame($expectedSummary['title'], $rebuiltFromLedger['title']);

            $rebuiltSummary = $service->profileSummaryFor($child->fresh() ?? $child);
            $this->assertSame($expectedSummary['xp'], $rebuiltSummary['xp']);
            $this->assertSame($expectedSummary['coins'], $rebuiltSummary['coins']);
            $this->assertSame($expectedSummary['gems'], $rebuiltSummary['gems']);
            $this->assertSame($expectedSummary['level'], $rebuiltSummary['level']);
            $this->assertSame($expectedSummary['title'], $rebuiltSummary['title']);
            $this->assertSame($expectedSummary['streak']['current_streak'], $rebuiltSummary['streak']['current_streak']);
            $this->assertSame($expectedSummary['badges']['earned_count'], $rebuiltSummary['badges']['earned_count']);
        }
    }

    public function test_duplicate_lesson_progress_and_quiz_finish_requests_award_only_once(): void
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

        // Fire 3 completion requests (same idempotency key and distinct idempotency keys)
        $r1 = $this->putJson("/api/v1/kid/lessons/{$lesson->public_id}/progress", [
            'mark_complete' => true,
            'idempotency_key' => 'dup-lesson-key-1',
        ])->assertOk();

        $r2 = $this->putJson("/api/v1/kid/lessons/{$lesson->public_id}/progress", [
            'mark_complete' => true,
            'idempotency_key' => 'dup-lesson-key-1',
        ])->assertOk();

        $r3 = $this->putJson("/api/v1/kid/lessons/{$lesson->public_id}/progress", [
            'mark_complete' => true,
            'idempotency_key' => 'dup-lesson-key-2',
        ])->assertOk();

        $this->assertTrue((bool) $r1->json('data.newly_completed'));
        $this->assertFalse((bool) $r3->json('data.newly_completed'));

        // XP = 50 (lesson) + 20 (streak day) = 70; Coins = 20 (lesson) + 5 (streak day) = 25
        $this->assertSame(['xp' => 70, 'coins' => 25, 'gems' => 0], RewardLedger::ledgerTotalsFor($child->id));

        // Now start a quiz attempt, answer all questions 100% right, and fire duplicate finish calls
        $attemptId = (string) $this->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/attempts")
            ->assertCreated()
            ->json('data.attempt.id');

        foreach ($questions as $question) {
            /** @var QuizOption $correct */
            $correct = QuizOption::query()
                ->where('quiz_question_id', $question->id)
                ->where('is_correct', true)
                ->firstOrFail();

            $this->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/check", [
                'attempt_id' => $attemptId,
                'question_id' => $question->public_id,
                'option_id' => $correct->public_id,
            ])->assertOk();
        }

        $finish1 = $this->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/attempts/{$attemptId}/finish", [
            'idempotency_key' => 'finish-key-1',
        ])->assertOk();

        $finish2 = $this->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/attempts/{$attemptId}/finish", [
            'idempotency_key' => 'finish-key-1',
        ])->assertOk();

        $finish3 = $this->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/attempts/{$attemptId}/finish", [
            'idempotency_key' => 'finish-key-2',
        ])->assertOk();

        // Start a second attempt and pass 100% again: must NOT award quiz_passed or perfect_quiz a second time
        $attempt2Id = (string) $this->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/attempts")
            ->assertCreated()
            ->json('data.attempt.id');

        foreach ($questions as $question) {
            /** @var QuizOption $correct */
            $correct = QuizOption::query()
                ->where('quiz_question_id', $question->id)
                ->where('is_correct', true)
                ->firstOrFail();

            $this->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/check", [
                'attempt_id' => $attempt2Id,
                'question_id' => $question->public_id,
                'option_id' => $correct->public_id,
            ])->assertOk();
        }

        $finishAttempt2 = $this->postJson("/api/v1/kid/quizzes/{$quiz->public_id}/attempts/{$attempt2Id}/finish", [
            'idempotency_key' => 'finish-attempt-2',
        ])->assertOk();

        $this->assertSame(190, $finish1->json('data.reward_result.totals.xp'));
        $this->assertSame(190, $finish2->json('data.reward_result.totals.xp'));
        $this->assertSame(190, $finish3->json('data.reward_result.totals.xp'));
        $this->assertTrue((bool) $finishAttempt2->json('data.reward_result.was_replayed'));
        $this->assertSame(['xp' => 190, 'coins' => 75, 'gems' => 5], RewardLedger::ledgerTotalsFor($child->id));
    }
}
