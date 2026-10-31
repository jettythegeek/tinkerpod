<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Rewards\RewardEvent;
use App\Domain\Rewards\RewardService;
use App\Enums\PermissionName;
use App\Enums\RewardCurrency;
use App\Filament\Resources\BadgeResource;
use App\Filament\Resources\NaijaTitleResource;
use App\Filament\Resources\RewardLedgerResource;
use App\Filament\Resources\RewardLevelResource;
use App\Filament\Resources\RewardRuleResource;
use App\Filament\Resources\StreakSettingResource;
use App\Models\AuditLog;
use App\Models\Child;
use App\Models\RewardLedger;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FilamentRewardsResourcesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_filament_reward_resources_are_gated_by_permissions_and_ledger_is_read_only_with_adjust_action(): void
    {
        RewardService::ensureDefaultsSeeded();

        $editableResources = [
            RewardRuleResource::class,
            RewardLevelResource::class,
            NaijaTitleResource::class,
            BadgeResource::class,
            StreakSettingResource::class,
        ];

        $userWithoutPermissions = User::factory()->create();
        $this->actingAs($userWithoutPermissions);

        foreach ([...$editableResources, RewardLedgerResource::class] as $resourceClass) {
            $this->assertFalse($resourceClass::canViewAny(), "{$resourceClass} must deny view without rewards.view");
            $this->assertFalse($resourceClass::canCreate(), "{$resourceClass} must deny create without rewards.manage");
            $this->assertFalse($resourceClass::canAdjust(), "{$resourceClass} must deny adjust without rewards.adjust");
        }

        // Grant only rewards.view directly (no role name assigned)
        $viewer = User::factory()->create();
        $viewer->givePermissionTo(PermissionName::ViewRewards->value);
        $this->actingAs($viewer);

        foreach ($editableResources as $resourceClass) {
            $this->assertTrue($resourceClass::canViewAny());
            $this->assertFalse($resourceClass::canCreate());
            $this->assertFalse($resourceClass::canAdjust());
        }
        $this->assertTrue(RewardLedgerResource::canViewAny());
        $this->assertFalse(RewardLedgerResource::canCreate());
        $this->assertFalse(RewardLedgerResource::canAdjust());

        // Grant rewards.manage -> can edit rules/levels/titles/badges/streak settings, but ledger stays read-only and cannot adjust
        $manager = User::factory()->create();
        $manager->givePermissionTo([
            PermissionName::ViewRewards->value,
            PermissionName::ManageRewards->value,
        ]);
        $this->actingAs($manager);

        foreach ($editableResources as $resourceClass) {
            $this->assertTrue($resourceClass::canViewAny());
            $this->assertTrue($resourceClass::canCreate());
            $this->assertFalse($resourceClass::canAdjust());
        }

        $newRule = RewardRuleResource::publishNewVersion(
            eventType: RewardEvent::TYPE_LESSON_COMPLETED,
            xpAmount: 65,
            coinsAmount: 25,
            gemsAmount: 1,
        );
        $this->assertSame(2, $newRule->version);
        $this->assertTrue($newRule->is_active);

        $parent = User::factory()->create();
        $child = Child::factory()->for($parent, 'parent')->create();

        // Manager without rewards.adjust cannot adjust child rewards
        $caughtDeniedAdjust = false;
        try {
            RewardLedgerResource::adjustChildReward(
                child: $child,
                currency: RewardCurrency::Coins,
                amount: 50,
                reason: 'Attempt without rewards.adjust',
                idempotencyKey: 'denied-adj-1',
            );
        } catch (AuthorizationException) {
            $caughtDeniedAdjust = true;
        }
        $this->assertTrue($caughtDeniedAdjust, 'User without rewards.adjust must not adjust rewards.');

        // Grant rewards.adjust -> can adjust child reward via RewardLedgerResource action, while ledger rows remain non-editable/non-deletable
        $adjuster = User::factory()->create();
        $adjuster->givePermissionTo([
            PermissionName::ViewRewards->value,
            PermissionName::AdjustRewards->value,
        ]);
        $this->actingAs($adjuster);

        $this->assertTrue(RewardLedgerResource::canViewAny());
        $this->assertTrue(RewardLedgerResource::canAdjust());
        $this->assertFalse(RewardLedgerResource::canCreate());

        $ledgerEntry = RewardLedgerResource::adjustChildReward(
            child: $child,
            currency: RewardCurrency::Coins,
            amount: 80,
            reason: 'Filament admin adjustment for workshop winner.',
            idempotencyKey: 'filament-adj-1',
        );

        $this->assertFalse(RewardLedgerResource::canEdit($ledgerEntry));
        $this->assertFalse(RewardLedgerResource::canDelete($ledgerEntry));
        $this->assertSame(80, RewardLedger::ledgerTotalsFor($child->id)['coins']);
        $this->assertSame(
            1,
            AuditLog::query()
                ->where('action', 'reward.adjusted')
                ->where('actor_id', (string) $adjuster->id)
                ->where('subject_id', $child->public_id)
                ->count()
        );
    }
}
