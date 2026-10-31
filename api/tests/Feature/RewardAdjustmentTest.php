<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Rewards\RewardService;
use App\Enums\PermissionName;
use App\Enums\RewardCurrency;
use App\Models\AuditLog;
use App\Models\Child;
use App\Models\RewardLedger;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

class RewardAdjustmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_with_rewards_adjust_permission_can_add_positive_and_negative_ledger_rows_with_reason_and_audit_log(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $staff = User::factory()->create();
        $staff->givePermissionTo(PermissionName::AdjustRewards->value);

        $parent = User::factory()->create();
        $child = Child::factory()->for($parent, 'parent')->create();

        $service = app(RewardService::class);

        $plusEntry = $service->adjust(
            child: $child,
            staff: $staff,
            currency: RewardCurrency::Coins,
            amount: 120,
            reason: 'Bonus coins for helping a classmate in Loops Valley.',
            idempotencyKey: 'adj-plus-001',
        );

        $this->assertSame(120, $plusEntry->amount);
        $this->assertSame('staff_adjustment', $plusEntry->source_type);
        $this->assertSame('Bonus coins for helping a classmate in Loops Valley.', $plusEntry->reason);
        $this->assertSame($staff->id, $plusEntry->actor_user_id);

        $minusEntry = $service->adjust(
            child: $child,
            staff: $staff,
            currency: RewardCurrency::Coins,
            amount: -45,
            reason: 'Correction for duplicate event test.',
            idempotencyKey: 'adj-minus-002',
        );

        $this->assertSame(-45, $minusEntry->amount);
        $this->assertNotSame($plusEntry->id, $minusEntry->id);

        // Replaying the same idempotency key does not duplicate the row or audit log
        $replayedMinus = $service->adjust(
            child: $child,
            staff: $staff,
            currency: RewardCurrency::Coins,
            amount: -45,
            reason: 'Correction for duplicate event test.',
            idempotencyKey: 'adj-minus-002',
        );
        $this->assertSame($minusEntry->id, $replayedMinus->id);

        $totals = RewardLedger::ledgerTotalsFor($child->id);
        $this->assertSame(75, $totals['coins']);
        $this->assertSame(2, RewardLedger::query()->where('child_id', $child->id)->count());

        $auditLogs = AuditLog::query()
            ->where('action', 'reward.adjusted')
            ->where('actor_id', $staff->id)
            ->where('subject_id', $child->id)
            ->orderBy('id')
            ->get();

        $this->assertCount(2, $auditLogs);
        $this->assertSame('Bonus coins for helping a classmate in Loops Valley.', $auditLogs[0]->metadata['reason'] ?? null);
        $this->assertSame(120, $auditLogs[0]->metadata['amount'] ?? null);
        $this->assertSame(120, $auditLogs[0]->metadata['new_balance'] ?? null);
        $this->assertSame(-45, $auditLogs[1]->metadata['amount'] ?? null);
        $this->assertSame(75, $auditLogs[1]->metadata['new_balance'] ?? null);
    }

    public function test_staff_without_rewards_adjust_permission_is_denied(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $viewerStaff = User::factory()->create();
        $viewerStaff->givePermissionTo(PermissionName::ViewRewards->value);

        $parent = User::factory()->create();
        $child = Child::factory()->for($parent, 'parent')->create();

        $service = app(RewardService::class);

        $this->expectException(AuthorizationException::class);

        $service->adjust(
            child: $child,
            staff: $viewerStaff,
            currency: RewardCurrency::Xp,
            amount: 50,
            reason: 'Unauthorized attempt',
            idempotencyKey: 'unauth-001',
        );
    }

    public function test_adjustment_requires_non_empty_reason(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $staff = User::factory()->create();
        $staff->givePermissionTo(PermissionName::AdjustRewards->value);

        $parent = User::factory()->create();
        $child = Child::factory()->for($parent, 'parent')->create();

        $service = app(RewardService::class);

        $this->expectException(InvalidArgumentException::class);

        $service->adjust(
            child: $child,
            staff: $staff,
            currency: RewardCurrency::Gems,
            amount: 5,
            reason: '   ',
            idempotencyKey: 'empty-reason-001',
        );
    }
}
