<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasPublicUlid;
use Database\Factories\QuizAttemptFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $public_id
 * @property int $child_id
 * @property int $quiz_id
 * @property int $attempt_number
 * @property string|null $idempotency_key
 * @property int $earned_points
 * @property int $total_points
 * @property int $score_percent
 * @property bool $passed
 * @property Carbon|null $submitted_at
 */
class QuizAttempt extends Model
{
    /** @use HasFactory<QuizAttemptFactory> */
    use HasFactory;

    use HasPublicUlid;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'public_id',
        'child_id',
        'quiz_id',
        'attempt_number',
        'idempotency_key',
        'earned_points',
        'total_points',
        'score_percent',
        'passed',
        'submitted_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'attempt_number' => 'integer',
            'earned_points' => 'integer',
            'total_points' => 'integer',
            'score_percent' => 'integer',
            'passed' => 'boolean',
            'submitted_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Child, $this>
     */
    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }

    /**
     * @return BelongsTo<Quiz, $this>
     */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * @return HasMany<QuizAttemptAnswer, $this>
     */
    public function answers(): HasMany
    {
        return $this->hasMany(QuizAttemptAnswer::class);
    }
}
