<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\RewardCurrency;
use App\Models\Child;
use App\Models\RewardBalance;
use App\Models\RewardLedger;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class RebuildRewardBalancesCommand extends Command
{
    protected $signature = 'tinkerpod:rebuild-reward-balances {--verify : Fail if cached balances differed from the ledger before rebuilding}';

    protected $description = 'Rebuild cached reward_balances rows strictly from the immutable reward_ledger table';

    public function handle(): int
    {
        $verify = (bool) $this->option('verify');
        $mismatches = 0;
        $updatedRows = 0;

        DB::transaction(function () use (&$mismatches, &$updatedRows): void {
            /** @var array<int, array<string, int>> $ledgerSums */
            $ledgerSums = [];

            $aggregates = RewardLedger::query()
                ->selectRaw('child_id, currency, COALESCE(SUM(amount), 0) as total')
                ->groupBy('child_id', 'currency')
                ->get();

            foreach ($aggregates as $row) {
                $childId = (int) $row->getAttribute('child_id');
                $currency = (string) $row->getAttribute('currency');
                $total = (int) $row->getAttribute('total');
                $ledgerSums[$childId][$currency] = $total;
            }

            /** @var list<int> $childIds */
            $childIds = Child::query()->pluck('id')->map(static fn ($id): int => (int) $id)->all();

            foreach ($childIds as $childId) {
                foreach (RewardCurrency::values() as $currency) {
                    $expected = $ledgerSums[$childId][$currency] ?? 0;

                    /** @var RewardBalance|null $existing */
                    $existing = RewardBalance::query()
                        ->where('child_id', $childId)
                        ->where('currency', $currency)
                        ->first();

                    if ($existing !== null && $existing->balance !== $expected) {
                        $mismatches++;
                    }

                    if ($expected === 0 && $existing === null) {
                        continue;
                    }

                    RewardBalance::query()->updateOrCreate(
                        [
                            'child_id' => $childId,
                            'currency' => $currency,
                        ],
                        [
                            'balance' => $expected,
                            'updated_at' => Carbon::now(),
                        ],
                    );

                    $updatedRows++;
                }
            }
        });

        $this->info(sprintf(
            'Rebuilt %d reward balance row(s) from reward_ledger (%d mismatch(es) corrected).',
            $updatedRows,
            $mismatches,
        ));

        if ($verify && $mismatches > 0) {
            $this->error(sprintf('Found %d cached balance mismatch(es) against reward_ledger.', $mismatches));

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
