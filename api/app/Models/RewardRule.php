<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasPublicUlid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * @property int $id
 * @property string $public_id
 * @property string $event_type
 * @property int $version
 * @property int $xp_amount
 * @property int $coins_amount
 * @property int $gems_amount
 * @property bool $is_active
 * @property int|null $created_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'public_id',
    'event_type',
    'version',
    'xp_amount',
    'coins_amount',
    'gems_amount',
    'is_active',
    'created_by',
])]
#[Hidden(['id', 'created_by'])]
class RewardRule extends Model
{
    use HasPublicUlid;

    protected $table = 'reward_rules';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'xp_amount' => 'integer',
            'coins_amount' => 'integer',
            'gems_amount' => 'integer',
            'is_active' => 'boolean',
            'created_by' => 'integer',
        ];
    }

    public static function activeForEvent(string $eventType): ?self
    {
        /** @var self|null $rule */
        $rule = self::query()
            ->where('event_type', $eventType)
            ->where('is_active', true)
            ->orderByDesc('version')
            ->first();

        return $rule;
    }

    /**
     * Create a new version of a reward rule and deactivate prior versions so historical ledger rows
     * retain the exact version number they were awarded under.
     */
    public static function createNextVersion(
        string $eventType,
        int $xpAmount,
        int $coinsAmount,
        int $gemsAmount = 0,
        ?int $createdBy = null,
    ): self {
        return DB::transaction(static function () use (
            $eventType,
            $xpAmount,
            $coinsAmount,
            $gemsAmount,
            $createdBy,
        ): self {
            $maxVersion = (int) self::query()
                ->where('event_type', $eventType)
                ->lockForUpdate()
                ->max('version');

            self::query()
                ->where('event_type', $eventType)
                ->where('is_active', true)
                ->update(['is_active' => false]);

            /** @var self $rule */
            $rule = self::query()->create([
                'event_type' => $eventType,
                'version' => $maxVersion + 1,
                'xp_amount' => $xpAmount,
                'coins_amount' => $coinsAmount,
                'gems_amount' => $gemsAmount,
                'is_active' => true,
                'created_by' => $createdBy,
            ]);

            return $rule;
        });
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
