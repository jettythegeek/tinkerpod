<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasPublicUlid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $public_id
 * @property int $level_number
 * @property int $xp_required
 * @property int|null $naija_title_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'public_id',
    'level_number',
    'xp_required',
    'naija_title_id',
])]
#[Hidden(['id', 'naija_title_id'])]
class RewardLevel extends Model
{
    use HasPublicUlid;

    protected $table = 'reward_levels';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'level_number' => 'integer',
            'xp_required' => 'integer',
            'naija_title_id' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<NaijaTitle, $this>
     */
    public function naijaTitle(): BelongsTo
    {
        return $this->belongsTo(NaijaTitle::class, 'naija_title_id');
    }
}
