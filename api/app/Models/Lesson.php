<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ContentStatus;
use App\Models\Concerns\HasPublicationStatus;
use App\Models\Concerns\HasPublicUlid;
use Database\Factories\LessonFactory;
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
 * @property int $module_id
 * @property int $world_id
 * @property string $slug
 * @property int $lesson_number
 * @property string $title
 * @property string|null $summary
 * @property string|null $body
 * @property list<string>|null $learning_objectives
 * @property string|null $thumbnail_asset
 * @property string|null $intro_video_url
 * @property int $intro_video_duration_seconds
 * @property int $duration_minutes
 * @property string $difficulty
 * @property int $steps_count
 * @property string $completion_mode
 * @property int $required_watch_percent
 * @property int $reward_xp_preview
 * @property int $reward_coins_preview
 * @property int $reward_gems_preview
 * @property string $status
 * @property bool $is_demo
 * @property int $sort_order
 * @property Carbon|null $published_at
 * @property Carbon|null $archived_at
 */
#[Fillable([
    'public_id',
    'module_id',
    'world_id',
    'slug',
    'lesson_number',
    'title',
    'summary',
    'body',
    'learning_objectives',
    'thumbnail_asset',
    'intro_video_url',
    'intro_video_duration_seconds',
    'duration_minutes',
    'difficulty',
    'steps_count',
    'completion_mode',
    'required_watch_percent',
    'reward_xp_preview',
    'reward_coins_preview',
    'reward_gems_preview',
    'status',
    'is_demo',
    'sort_order',
    'published_at',
    'archived_at',
])]
#[Hidden(['id'])]
class Lesson extends Model
{
    /** @use HasFactory<LessonFactory> */
    use HasFactory, HasPublicationStatus, HasPublicUlid;

    protected $table = 'lessons';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'module_id' => 'integer',
            'world_id' => 'integer',
            'lesson_number' => 'integer',
            'learning_objectives' => 'array',
            'intro_video_duration_seconds' => 'integer',
            'duration_minutes' => 'integer',
            'steps_count' => 'integer',
            'required_watch_percent' => 'integer',
            'reward_xp_preview' => 'integer',
            'reward_coins_preview' => 'integer',
            'reward_gems_preview' => 'integer',
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
     * @return BelongsTo<Module, $this>
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'module_id');
    }

    /**
     * @return BelongsTo<World, $this>
     */
    public function world(): BelongsTo
    {
        return $this->belongsTo(World::class, 'world_id');
    }

    /**
     * @return HasMany<Quiz, $this>
     */
    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class, 'lesson_id')->orderBy('sort_order');
    }

    /**
     * @return HasMany<Project, $this>
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'lesson_id')->orderBy('sort_order');
    }

    /**
     * @return HasMany<LessonProgress, $this>
     */
    public function progressRecords(): HasMany
    {
        return $this->hasMany(LessonProgress::class, 'lesson_id');
    }

    /**
     * @return HasMany<LessonAttachment, $this>
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(LessonAttachment::class, 'lesson_id')->orderBy('sort_order');
    }
}
