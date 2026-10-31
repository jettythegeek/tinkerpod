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
 * @property int $current_streak
 * @property int $best_streak
 * @property Carbon|null $last_active_date
 * @property int $grace_days_used
 * @property bool $is_paused
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'child_id',
    'current_streak',
    'best_streak',
    'last_active_date',
    'grace_days_used',
    'is_paused',
])]
#[Hidden(['id', 'child_id'])]
class ChildStreak extends Model
{
    protected $table = 'child_streaks';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'child_id' => 'integer',
            'current_streak' => 'integer',
            'best_streak' => 'integer',
            'last_active_date' => 'date',
            'grace_days_used' => 'integer',
            'is_paused' => 'boolean',
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
