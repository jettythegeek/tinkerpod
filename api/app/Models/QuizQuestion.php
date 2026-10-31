<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasPublicUlid;
use Database\Factories\QuizQuestionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $public_id
 * @property int $quiz_id
 * @property int $question_number
 * @property string $prompt
 * @property string|null $code_snippet
 * @property string|null $hint
 * @property string $explanation
 * @property int $points
 * @property int $sort_order
 */
#[Fillable([
    'public_id',
    'quiz_id',
    'question_number',
    'prompt',
    'code_snippet',
    'hint',
    'explanation',
    'points',
    'sort_order',
])]
#[Hidden(['id'])]
class QuizQuestion extends Model
{
    /** @use HasFactory<QuizQuestionFactory> */
    use HasFactory, HasPublicUlid;

    protected $table = 'quiz_questions';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quiz_id' => 'integer',
            'question_number' => 'integer',
            'points' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Quiz, $this>
     */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');
    }

    /**
     * @return HasMany<QuizOption, $this>
     */
    public function options(): HasMany
    {
        return $this->hasMany(QuizOption::class, 'quiz_question_id')->orderBy('sort_order');
    }
}
