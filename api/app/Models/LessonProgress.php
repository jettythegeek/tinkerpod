<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasPublicUlid;
use Database\Factories\LessonProgressFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $public_id
 * @property int $child_id
 * @property int $lesson_id
 * @property int $resume_position_seconds
 * @property int $watch_percent
 * @property bool $manual_completed
 * @property bool $quiz_passed
 * @property bool $is_completed
 * @property string|null $completion_source
 * @property string|null $completion_idempotency_key
 * @property Carbon|null $last_accessed_at
 * @property Carbon|null $completed_at
 */
#[Fillable([
    'public_id',
    'child_id',
    'lesson_id',
    'resume_position_seconds',
    'watch_percent',
    'manual_completed',
    'quiz_passed',
    'is_completed',
    'completion_source',
    'completion_idempotency_key',
    'last_accessed_at',
    'completed_at',
])]
#[Hidden(['id'])]
class LessonProgress extends Model
{
    /** @use HasFactory<LessonProgressFactory> */
    use HasFactory, HasPublicUlid;

    protected $table = 'lesson_progress';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'child_id' => 'integer',
            'lesson_id' => 'integer',
            'resume_position_seconds' => 'integer',
            'watch_percent' => 'integer',
            'manual_completed' => 'boolean',
            'quiz_passed' => 'boolean',
            'is_completed' => 'boolean',
            'last_accessed_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Child, $this>
     */
    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class, 'child_id');
    }

    /**
     * @return BelongsTo<Lesson, $this>
     */
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id');
    }
}
