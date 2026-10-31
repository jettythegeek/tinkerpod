<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasPublicUlid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $public_id
 * @property string $slug
 * @property string $name
 * @property int $min_level
 * @property int $sort_order
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'public_id',
    'slug',
    'name',
    'min_level',
    'sort_order',
    'is_active',
])]
#[Hidden(['id'])]
class NaijaTitle extends Model
{
    use HasPublicUlid;

    protected $table = 'naija_titles';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'min_level' => 'integer',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<RewardLevel, $this>
     */
    public function levels(): HasMany
    {
        return $this->hasMany(RewardLevel::class, 'naija_title_id');
    }
}
