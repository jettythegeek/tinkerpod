<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $child_id
 * @property int $badge_id
 * @property int|null $ledger_id
 * @property Carbon $earned_at
 */
#[Fillable([
    'child_id',
    'badge_id',
    'ledger_id',
    'earned_at',
])]
#[Hidden(['id', 'child_id', 'badge_id', 'ledger_id'])]
class ChildBadge extends Model
{
    public $timestamps = false;

    protected $table = 'child_badges';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'child_id' => 'integer',
            'badge_id' => 'integer',
            'ledger_id' => 'integer',
            'earned_at' => 'datetime',
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
     * @return BelongsTo<Badge, $this>
     */
    public function badge(): BelongsTo
    {
        return $this->belongsTo(Badge::class, 'badge_id');
    }

    /**
     * @return BelongsTo<RewardLedger, $this>
     */
    public function ledgerEntry(): BelongsTo
    {
        return $this->belongsTo(RewardLedger::class, 'ledger_id');
    }
}
