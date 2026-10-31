<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ContentStatus;
use App\Models\Concerns\HasPublicationStatus;
use App\Models\Concerns\HasPublicUlid;
use Database\Factories\CourseFactory;
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
 * @property int $track_id
 * @property int $pod_id
 * @property string $slug
 * @property string $title
 * @property string|null $description
 * @property string $difficulty
 * @property string $status
 * @property bool $is_demo
 * @property int $sort_order
 * @property Carbon|null $published_at
 * @property Carbon|null $archived_at
 */
#[Fillable([
    'public_id',
    'track_id',
    'pod_id',
    'slug',
    'title',
    'description',
    'difficulty',
    'status',
    'is_demo',
    'sort_order',
    'published_at',
    'archived_at',
])]
#[Hidden(['id'])]
class Course extends Model
{
    /** @use HasFactory<CourseFactory> */
    use HasFactory, HasPublicationStatus, HasPublicUlid;

    protected $table = 'courses';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'track_id' => 'integer',
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
     * @return BelongsTo<Track, $this>
     */
    public function track(): BelongsTo
    {
        return $this->belongsTo(Track::class, 'track_id');
    }

    /**
     * @return BelongsTo<Pod, $this>
     */
    public function pod(): BelongsTo
    {
        return $this->belongsTo(Pod::class, 'pod_id');
    }

    /**
     * @return HasMany<Module, $this>
     */
    public function modules(): HasMany
    {
        return $this->hasMany(Module::class, 'course_id')->orderBy('sort_order');
    }

    /**
     * @return HasMany<World, $this>
     */
    public function worlds(): HasMany
    {
        return $this->hasMany(World::class, 'course_id')->orderBy('sort_order');
    }
}
