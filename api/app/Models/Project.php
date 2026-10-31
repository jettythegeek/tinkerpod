<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ContentStatus;
use App\Models\Concerns\HasPublicationStatus;
use App\Models\Concerns\HasPublicUlid;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $public_id
 * @property int $lesson_id
 * @property string $title
 * @property string|null $description
 * @property string|null $instructions
 * @property string|null $starter_code
 * @property string $language
 * @property int $steps_count
 * @property string $status
 * @property bool $is_demo
 * @property int $sort_order
 * @property Carbon|null $published_at
 * @property Carbon|null $archived_at
 */
#[Fillable([
    'public_id',
    'lesson_id',
    'title',
    'description',
    'instructions',
    'starter_code',
    'language',
    'steps_count',
    'status',
    'is_demo',
    'sort_order',
    'published_at',
    'archived_at',
])]
#[Hidden(['id'])]
class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory, HasPublicationStatus, HasPublicUlid;

    protected $table = 'projects';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'lesson_id' => 'integer',
            'steps_count' => 'integer',
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
     * @return BelongsTo<Lesson, $this>
     */
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id');
    }
}
