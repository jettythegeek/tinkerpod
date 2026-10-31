<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ContentStatus;
use App\Models\Concerns\HasPublicationStatus;
use App\Models\Concerns\HasPublicUlid;
use Database\Factories\TrackFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $public_id
 * @property int $pod_id
 * @property string $slug
 * @property string $title
 * @property string|null $description
 * @property string $age_band
 * @property string $status
 * @property bool $is_demo
 * @property int $sort_order
 * @property Carbon|null $published_at
 * @property Carbon|null $archived_at
 */
#[Fillable([
    'public_id',
    'pod_id',
    'slug',
    'title',
    'description',
    'age_band',
    'status',
    'is_demo',
    'sort_order',
    'published_at',
    'archived_at',
])]
#[Hidden(['id'])]
class Track extends Model
{
    /** @use HasFactory<TrackFactory> */
    use HasFactory, HasPublicationStatus, HasPublicUlid;

    protected $table = 'tracks';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'pod_id' => 'integer',
            'is_demo' => 'boolean',
            'sort_order' => 'integer',
            'published_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', ContentStatus::Published->value);
    }

    /**
     * @return BelongsTo<Pod, $this>
     */
    public function pod(): BelongsTo
    {
        return $this->belongsTo(Pod::class, 'pod_id');
    }

    /**
     * @return HasMany<Course, $this>
     */
    public function courses(): HasMany
    {
        return $this->hasMany(Course::class, 'track_id')->orderBy('sort_order');
    }
}
