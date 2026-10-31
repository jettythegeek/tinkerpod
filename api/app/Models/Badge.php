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
 * @property string|null $description
 * @property string $icon
 * @property string $color
 * @property string $condition_type
 * @property int $condition_value
 * @property int $sort_order
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'public_id',
    'slug',
    'name',
    'description',
    'icon',
    'color',
    'condition_type',
    'condition_value',
    'sort_order',
    'is_active',
])]
#[Hidden(['id'])]
class Badge extends Model
{
    use HasPublicUlid;

    protected $table = 'badges';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'condition_value' => 'integer',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<ChildBadge, $this>
     */
    public function childBadges(): HasMany
    {
        return $this->hasMany(ChildBadge::class, 'badge_id');
    }
}
