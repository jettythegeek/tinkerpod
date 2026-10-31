<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ContentStatus;
use App\Models\Concerns\HasPublicationStatus;
use App\Models\Concerns\HasPublicUlid;
use Database\Factories\WorldFactory;
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
 * @property int|null $course_id
 * @property string $slug
 * @property string $title
 * @property string|null $description
 * @property int $world_number
 * @property string $icon
 * @property int $map_x
 * @property int $map_y
 * @property string $status
 * @property bool $is_demo
 * @property int $sort_order
 * @property Carbon|null $published_at
 * @property Carbon|null $archived_at
 */
#[Fillable([
    'public_id',
    'pod_id',
    'course_id',
    'slug',
    'title',
    'description',
    'world_number',
    'icon',
    'map_x',
    'map_y',
    'status',
    'is_demo',
    'sort_order',
    'published_at',
    'archived_at',
])]
#[Hidden(['id'])]
class World extends Model
{
    /** @use HasFactory<WorldFactory> */
    use HasFactory, HasPublicationStatus, HasPublicUlid;

    protected $table = 'worlds';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'pod_id' => 'integer',
            'course_id' => 'integer',
            'world_number' => 'integer',
            'map_x' => 'integer',
            'map_y' => 'integer',
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
     * @return BelongsTo<Course, $this>
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    /**
     * @return HasMany<Module, $this>
     */
    public function modules(): HasMany
    {
        return $this->hasMany(Module::class, 'world_id')->orderBy('sort_order');
    }

    /**
     * @return HasMany<Lesson, $this>
     */
    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class, 'world_id')->orderBy('sort_order');
    }
}
