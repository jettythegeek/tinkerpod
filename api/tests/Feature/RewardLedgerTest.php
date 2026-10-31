<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\RewardCurrency;
use App\Models\Child;
use App\Models\RewardBalance;
use App\Models\RewardLedger;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use LogicException;
use Tests\TestCase;

class RewardLedgerTest extends TestCase
{
    use RefreshDatabase;

    public function test_reward_ledger_is_append_only_and_blocks_updates_and_deletes(): void
    {
        $parent = User::factory()->create();
        $child = Child::factory()->for($parent, 'parent')->create();

        $result = RewardLedger::appendEntry(
            childId: $child->id,
            currency: RewardCurrency::Xp,
            amount: 50,
            sourceType: 'lesson_completed',
            sourceId: '01jlesson001',
            ruleVersion: 1,
            idempotencyKey: sprintf('lesson_completed:%d:1:xp', $child->id),
        );

        $this->assertTrue($result['created']);
        $this->assertSame(50, $result['balance']);

        $entry = $result['entry'];

        try {
            $entry->update(['amount' => 999]);
            $this->fail('Expected LogicException when updating a reward_ledger entry.');
        } catch (LogicException $exception) {
            $this->assertStringContainsString('immutable', $exception->getMessage());
        }

        try {
            $entry->delete();
            $this->fail('Expected LogicException when deleting a reward_ledger entry.');
        } catch (LogicException $exception) {
            $this->assertStringContainsString('immutable', $exception->getMessage());
        }

        try {
            $entry->forceDelete();
            $this->fail('Expected LogicException when force-deleting a reward_ledger entry.');
        } catch (LogicException $exception) {
            $this->assertStringContainsString('immutable', $exception->getMessage());
        }

        $this->assertDatabaseHas('reward_ledger', [
            'id' => $entry->id,
            'amount' => 50,
        ]);
    }

    public function test_idempotency_key_is_unique_in_database_and_append_is_idempotent(): void
    {
        $parent = User::factory()->create();
        $child = Child::factory()->for($parent, 'parent')->create();

        $key = sprintf('lesson_completed:%d:10:coins', $child->id);

        $first = RewardLedger::appendEntry(
            childId: $child->id,
            currency: RewardCurrency::Coins,
            amount: 20,
            sourceType: 'lesson_completed',
            sourceId: '10',
            ruleVersion: 1,
            idempotencyKey: $key,
        );

        $second = RewardLedger::appendEntry(
            childId: $child->id,
            currency: RewardCurrency::Coins,
            amount: 20,
            sourceType: 'lesson_completed',
            sourceId: '10',
            ruleVersion: 1,
            idempotencyKey: $key,
        );

        $this->assertTrue($first['created']);
        $this->assertFalse($second['created']);
        $this->assertSame($first['entry']->id, $second['entry']->id);
        $this->assertSame(20, $second['balance']);
        $this->assertSame(1, RewardLedger::query()->where('idempotency_key', $key)->count());

        $this->expectException(QueryException::class);

        RewardLedger::query()->create([
            'child_id' => $child->id,
            'currency' => RewardCurrency::Coins->value,
            'amount' => 20,
            'source_type' => 'lesson_completed',
            'source_id' => '10',
            'rule_version' => 1,
            'idempotency_key' => $key,
        ]);
    }

    public function test_rebuild_reward_balances_command_matches_ledger_totals(): void
    {
        $parent = User::factory()->create();
        $child = Child::factory()->for($parent, 'parent')->create();

        RewardLedger::appendEntry($child->id, RewardCurrency::Xp, 50, 'lesson_completed', '1', 1, 'k1');
        RewardLedger::appendEntry($child->id, RewardCurrency::Xp, 80, 'quiz_passed', '1', 1, 'k2');
        RewardLedger::appendEntry($child->id, RewardCurrency::Coins, 20, 'lesson_completed', '1', 1, 'k3');
        RewardLedger::appendEntry($child->id, RewardCurrency::Coins, -5, 'staff_adjustment', 'adj-1', 1, 'k4', 'Duplicate coin correction', $parent->id);
        RewardLedger::appendEntry($child->id, RewardCurrency::Gems, 5, 'perfect_quiz', '1', 1, 'k5');

        $beforeTotals = RewardLedger::ledgerTotalsFor($child->id);
        $this->assertSame(['xp' => 130, 'coins' => 15, 'gems' => 5], $beforeTotals);

        $exitCode = Artisan::call('tinkerpod:rebuild-reward-balances', ['--verify' => true]);
        $this->assertSame(0, $exitCode);

        // Tamper with cached reward_balances row directly in DB and verify rebuild restores exact ledger sums
        DB::table('reward_balances')
            ->where('child_id', $child->id)
            ->where('currency', RewardCurrency::Xp->value)
            ->update(['balance' => 99999]);

        $verifyFailCode = Artisan::call('tinkerpod:rebuild-reward-balances', ['--verify' => true]);
        $this->assertSame(1, $verifyFailCode);

        $rebuiltXp = RewardBalance::query()
            ->where('child_id', $child->id)
            ->where('currency', RewardCurrency::Xp->value)
            ->value('balance');
        $rebuiltCoins = RewardBalance::query()
            ->where('child_id', $child->id)
            ->where('currency', RewardCurrency::Coins->value)
            ->value('balance');
        $rebuiltGems = RewardBalance::query()
            ->where('child_id', $child->id)
            ->where('currency', RewardCurrency::Gems->value)
            ->value('balance');

        $this->assertSame(130, (int) $rebuiltXp);
        $this->assertSame(15, (int) $rebuiltCoins);
        $this->assertSame(5, (int) $rebuiltGems);
    }
}
