<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Rewards\RewardEvent;
use App\Domain\Rewards\RewardService;
use App\Models\Child;
use App\Models\StreakSetting;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StreakLagosTimezoneTest extends TestCase
{
    use RefreshDatabase;

    public function test_streak_uses_africa_lagos_midnight_boundary_and_configurable_grace_days_with_kind_streak_paused_status(): void
    {
        $parent = User::factory()->create();
        $child = Child::factory()->for($parent, 'parent')->create();
        $service = app(RewardService::class);
        $service->ensureDefaultsSeeded();

        // 1. 2026-10-31 22:55:00 UTC is 2026-10-31 23:55:00 Africa/Lagos (Day 1)
        $utcBeforeLagosMidnight = CarbonImmutable::parse('2026-10-31 22:55:00', 'UTC');
        $resDay1 = $service->award(RewardEvent::lessonCompleted($child->id, 'lesson-1', $utcBeforeLagosMidnight));

        $this->assertNotNull($resDay1->streakChange);
        $this->assertSame(1, $resDay1->streakChange['current_streak']);
        $this->assertSame('2026-10-31', $resDay1->streakChange['last_active_date']);
        $this->assertTrue($resDay1->streakChange['incremented']);

        // 2. 10 minutes later: 2026-10-31 23:05:00 UTC is 2026-11-01 00:05:00 Africa/Lagos (Day 2!)
        $utcAfterLagosMidnight = CarbonImmutable::parse('2026-10-31 23:05:00', 'UTC');
        $resDay2 = $service->award(RewardEvent::quizPassed($child->id, 'quiz-1', $utcAfterLagosMidnight));

        $this->assertNotNull($resDay2->streakChange);
        $this->assertSame(2, $resDay2->streakChange['current_streak']);
        $this->assertSame('2026-11-01', $resDay2->streakChange['last_active_date']);
        $this->assertTrue($resDay2->streakChange['incremented']);

        // Same Lagos day later in the evening (2026-11-01 21:00 UTC = 22:00 WAT) -> stays at 2
        $sameLagosDayEvening = CarbonImmutable::parse('2026-11-01 21:00:00', 'UTC');
        $resSameDay = $service->award(RewardEvent::lessonCompleted($child->id, 'lesson-2', $sameLagosDayEvening));
        $this->assertNotNull($resSameDay->streakChange);
        $this->assertSame(2, $resSameDay->streakChange['current_streak']);
        $this->assertFalse($resSameDay->streakChange['incremented']);

        // 3. Skip 2026-11-02 (1 missed day, within default grace_days = 1) -> active on 2026-11-03 10:00 WAT
        $afterOneMissedDay = CarbonImmutable::parse('2026-11-03 10:00:00', 'Africa/Lagos');
        $graceSnapshot = $service->getStreakSnapshot($child->fresh() ?? $child, $afterOneMissedDay);
        $this->assertSame('grace', $graceSnapshot['status']);
        $this->assertFalse($graceSnapshot['is_paused']);
        $this->assertSame(2, $graceSnapshot['current_streak']);

        $resDay3WithGrace = $service->award(RewardEvent::lessonCompleted($child->id, 'lesson-3', $afterOneMissedDay));
        $this->assertNotNull($resDay3WithGrace->streakChange);
        $this->assertSame(3, $resDay3WithGrace->streakChange['current_streak']);
        $this->assertSame(3, $resDay3WithGrace->streakChange['best_streak']);
        $this->assertSame(1, $resDay3WithGrace->streakChange['grace_days_used']);
        $this->assertSame('grace_preserved', $resDay3WithGrace->streakChange['status']);

        // 4. Skip 2026-11-04 and 2026-11-05 (2 missed days > grace_days = 1) -> check on 2026-11-06
        $afterTwoMissedDays = CarbonImmutable::parse('2026-11-06 09:00:00', 'Africa/Lagos');
        $pausedSnapshot = $service->getStreakSnapshot($child->fresh() ?? $child, $afterTwoMissedDays);

        $this->assertSame('streak_paused', $pausedSnapshot['status']);
        $this->assertTrue($pausedSnapshot['is_paused']);
        $this->assertSame(0, $pausedSnapshot['current_streak']);
        $this->assertSame(3, $pausedSnapshot['best_streak']);
        $this->assertSame(RewardService::KIND_STREAK_PAUSED_MESSAGE, $pausedSnapshot['message']);
        $this->assertStringNotContainsStringIgnoringCase('lost', (string) $pausedSnapshot['message']);
        $this->assertStringNotContainsStringIgnoringCase('broken', (string) $pausedSnapshot['message']);
        $this->assertStringNotContainsStringIgnoringCase('ended', (string) $pausedSnapshot['message']);

        // Doing one lesson on 2026-11-06 starts a new streak at 1 while preserving best_streak = 3
        $resRestart = $service->award(RewardEvent::lessonCompleted($child->id, 'lesson-4', $afterTwoMissedDays));
        $this->assertNotNull($resRestart->streakChange);
        $this->assertSame(1, $resRestart->streakChange['current_streak']);
        $this->assertSame(3, $resRestart->streakChange['best_streak']);
        $this->assertSame('streak_paused', $resRestart->streakChange['status']);
        $this->assertSame(RewardService::KIND_STREAK_PAUSED_MESSAGE, $resRestart->streakChange['message']);

        // 5. Configurable grace_days = 0 in streak_settings pauses after 1 missed day
        StreakSetting::current()->update(['grace_days' => 0]);

        $oneMissedWithZeroGrace = CarbonImmutable::parse('2026-11-08 09:00:00', 'Africa/Lagos');
        $zeroGraceSnapshot = $service->getStreakSnapshot($child->fresh() ?? $child, $oneMissedWithZeroGrace);
        $this->assertSame('streak_paused', $zeroGraceSnapshot['status']);
        $this->assertTrue($zeroGraceSnapshot['is_paused']);
        $this->assertSame(0, $zeroGraceSnapshot['current_streak']);
    }
}
