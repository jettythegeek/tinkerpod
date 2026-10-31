<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\RewardCurrency;
use App\Models\Concerns\HasPublicUlid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use LogicException;

/**
 * @property int $id
 * @property string $public_id
 * @property int $child_id
 * @property string $currency
 * @property int $amount
 * @property string $source_type
 * @property string $source_id
 * @property int $rule_version
 * @property string|null $reason
 * @property int|null $actor_user_id
 * @property string $idempotency_key
 * @property Carbon|null $created_at
 */
#[Fillable([
    'public_id',
    'child_id',
    'currency',
    'amount',
    'source_type',
    'source_id',
    'rule_version',
    'reason',
    'actor_user_id',
    'idempotency_key',
    'created_at',
])]
#[Hidden([
    'id',
    'child_id',
    'actor_user_id',
])]
class RewardLedger extends Model
{
    use HasPublicUlid;

    public $timestamps = false;

    protected $table = 'reward_ledger';

    protected static function booted(): void
    {
        static::creating(static function (self $entry): void {
            if (! in_array($entry->currency, RewardCurrency::values(), true)) {
                throw new LogicException(sprintf('Invalid reward currency [%s].', (string) $entry->currency));
            }

            if ($entry->created_at === null) {
                $entry->created_at = Carbon::now();
            }
        });

        static::updating(static function (): never {
            throw new LogicException('Reward ledger entries are immutable and cannot be updated.');
        });

        static::deleting(static function (): never {
            throw new LogicException('Reward ledger entries are immutable and cannot be deleted.');
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'rule_version' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function delete(): ?bool
    {
        throw new LogicException('Reward ledger entries are immutable and cannot be deleted.');
    }

    public function forceDelete(): ?bool
    {
        throw new LogicException('Reward ledger entries are immutable and cannot be deleted.');
    }

    /**
     * Append a ledger entry and atomically update the cached reward_balances row in the same DB transaction.
     * If an entry with the same idempotency_key already exists, returns the existing entry without modifying balances.
     *
     * @return array{entry: self, created: bool, balance: int}
     */
    public static function appendEntry(
        int $childId,
        RewardCurrency|string $currency,
        int $amount,
        string $sourceType,
        string $sourceId,
        int $ruleVersion,
        string $idempotencyKey,
        ?string $reason = null,
        ?int $actorUserId = null,
        ?Carbon $createdAt = null,
    ): array {
        $currencyValue = $currency instanceof RewardCurrency ? $currency->value : $currency;

        if (! in_array($currencyValue, RewardCurrency::values(), true)) {
            throw new LogicException(sprintf('Invalid reward currency [%s].', $currencyValue));
        }

        return DB::transaction(static function () use (
            $childId,
            $currencyValue,
            $amount,
            $sourceType,
            $sourceId,
            $ruleVersion,
            $idempotencyKey,
            $reason,
            $actorUserId,
            $createdAt,
        ): array {
            Child::query()->whereKey($childId)->lockForUpdate()->firstOrFail();

            /** @var self|null $existing */
            $existing = self::query()
                ->where('idempotency_key', $idempotencyKey)
                ->lockForUpdate()
                ->first();

            if ($existing !== null) {
                $balance = self::ledgerBalanceFor($childId, $currencyValue);

                return [
                    'entry' => $existing,
                    'created' => false,
                    'balance' => $balance,
                ];
            }

            /** @var self $entry */
            $entry = self::query()->create([
                'child_id' => $childId,
                'currency' => $currencyValue,
                'amount' => $amount,
                'source_type' => $sourceType,
                'source_id' => $sourceId,
                'rule_version' => $ruleVersion,
                'reason' => $reason,
                'actor_user_id' => $actorUserId,
                'idempotency_key' => $idempotencyKey,
                'created_at' => $createdAt ?? Carbon::now(),
            ]);

            $newBalance = self::ledgerBalanceFor($childId, $currencyValue);

            RewardBalance::query()->updateOrCreate(
                [
                    'child_id' => $childId,
                    'currency' => $currencyValue,
                ],
                [
                    'balance' => $newBalance,
                    'updated_at' => Carbon::now(),
                ],
            );

            return [
                'entry' => $entry,
                'created' => true,
                'balance' => $newBalance,
            ];
        });
    }

    public static function ledgerBalanceFor(int $childId, RewardCurrency|string $currency): int
    {
        $currencyValue = $currency instanceof RewardCurrency ? $currency->value : $currency;

        return (int) self::query()
            ->where('child_id', $childId)
            ->where('currency', $currencyValue)
            ->sum('amount');
    }

    /**
     * @return array{xp: int, coins: int, gems: int}
     */
    public static function ledgerTotalsFor(int $childId): array
    {
        /** @var array<string, int|string> $rows */
        $rows = self::query()
            ->selectRaw('currency, COALESCE(SUM(amount), 0) as total')
            ->where('child_id', $childId)
            ->groupBy('currency')
            ->pluck('total', 'currency')
            ->all();

        return [
            'xp' => (int) ($rows[RewardCurrency::Xp->value] ?? 0),
            'coins' => (int) ($rows[RewardCurrency::Coins->value] ?? 0),
            'gems' => (int) ($rows[RewardCurrency::Gems->value] ?? 0),
        ];
    }

    /**
     * @return BelongsTo<Child, $this>
     */
    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class, 'child_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
