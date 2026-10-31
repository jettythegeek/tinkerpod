<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Rewards\RewardEvent;
use App\Domain\Rewards\RewardService;
use App\Models\Child;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class KidRewardsAndProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_kid_rewards_and_profile_endpoints_return_live_gamification_without_pii_and_within_query_budget(): void
    {
        $parent = User::factory()->create();
        $child = Child::factory()->for($parent, 'parent')->create([
            'first_name' => 'Amara',
            'last_name' => 'OkaforSecret',
            'username' => 'amara_star',
        ]);

        $childToken = $child->createToken('kid-mobile', ['child:*'])->plainTextToken;
        $parentToken = $parent->createToken('parent-mobile', ['parent:*'])->plainTextToken;

        $service = app(RewardService::class);
        $now = CarbonImmutable::now('Africa/Lagos');

        // Award first lesson (+50 XP, +20 coins) + streak_day (+20 XP, +5 coins) + first-steps badge
        $service->award(RewardEvent::lessonCompleted($child->id, 'lesson-101', $now));
        // Award second lesson (+50 XP, +20 coins) -> total 120 XP (Level 2!)
        $service->award(RewardEvent::lessonCompleted($child->id, 'lesson-102', $now->addMinutes(10)));
        // Award quiz pass (+80 XP, +30 coins) + perfect quiz (+40 XP, +20 coins, +5 gems) -> total 240 XP (Level 3!)
        $service->award(RewardEvent::quizPassed($child->id, 'quiz-201', $now->addMinutes(20)));
        $service->award(RewardEvent::perfectQuiz($child->id, 'quiz-201', $now->addMinutes(20)));

        // 1. GET /api/v1/kid/rewards + query budget assertion
        DB::enableQueryLog();
        DB::flushQueryLog();

        $rewardsRes = $this->withToken($childToken)->getJson('/api/v1/kid/rewards');
        $rewardsQueries = count(DB::getQueryLog());

        $rewardsRes->assertOk()
            ->assertJsonPath('data.rewards.xp', 240)
            ->assertJsonPath('data.rewards.coins', 95)
            ->assertJsonPath('data.rewards.gems', 5)
            ->assertJsonPath('data.rewards.level', 3)
            ->assertJsonPath('data.rewards.xp_in_level', 40)
            ->assertJsonPath('data.rewards.xp_for_next_level', 100)
            ->assertJsonPath('data.rewards.progress_percent', 40)
            ->assertJsonPath('data.rewards.title.name', 'Cody Coda')
            ->assertJsonPath('data.rewards.next_title.name', 'Jango-Jango')
            ->assertJsonPath('data.rewards.streak.current_streak', 1)
            ->assertJsonPath('data.rewards.streak.status', 'active')
            ->assertJsonCount(7, 'data.rewards.title_ladder');

        $this->assertLessThanOrEqual(8, $rewardsQueries, "Expected <= 8 queries on /kid/rewards, got {$rewardsQueries}");

        // 2. GET /api/v1/kid/profile + privacy + query budget assertion
        DB::flushQueryLog();

        $profileRes = $this->withToken($childToken)->getJson('/api/v1/kid/profile');
        $profileQueries = count(DB::getQueryLog());

        $profileRes->assertOk()
            ->assertJsonPath('data.child.first_name', 'Amara')
            ->assertJsonPath('data.child.username', 'amara_star')
            ->assertJsonPath('data.profile.level', 3)
            ->assertJsonPath('data.profile.title.name', 'Cody Coda')
            ->assertJsonPath('data.profile.next_title.name', 'Jango-Jango')
            ->assertJsonPath('data.profile.stats.total_xp', 240)
            ->assertJsonPath('data.profile.stats.coins', 95)
            ->assertJsonPath('data.profile.stats.gems', 5)
            ->assertJsonPath('data.profile.stats.streak_days', 1)
            ->assertJsonPath('data.profile.badges.earned_count', 3)
            ->assertJsonPath('data.profile.badges.total_count', 6)
            ->assertJsonCount(3, 'data.profile.badges.earned')
            ->assertJsonCount(3, 'data.profile.badges.locked');

        $rawProfileJson = (string) $profileRes->getContent();
        $this->assertStringNotContainsString('OkaforSecret', $rawProfileJson);
        $this->assertStringNotContainsString('last_name', $rawProfileJson);
        $this->assertStringNotContainsString('birth_date', $rawProfileJson);

        $this->assertLessThanOrEqual(10, $profileQueries, "Expected <= 10 queries on /kid/profile, got {$profileQueries}");

        // 3. Parent token cannot access kid rewards or profile endpoints
        $this->withToken($parentToken)->getJson('/api/v1/kid/rewards')->assertForbidden();
        $this->withToken($parentToken)->getJson('/api/v1/kid/profile')->assertForbidden();
    }
}
