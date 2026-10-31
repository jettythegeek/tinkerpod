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
 * @property string $currency
 * @property int $balance
 * @property Carbon $updated_at
 */
#[Fillable([
    'child_id',
    'currency',
    'balance',
    'updated_at',
])]
#[Hidden([
    'id',
    'child_id',
])]
class RewardBalance extends Model
{
    public const CREATED_AT = null;

    protected $table = 'reward_balances';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'balance' => 'integer',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Child, $this>
     */
    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class, 'child_id');
    }
}
