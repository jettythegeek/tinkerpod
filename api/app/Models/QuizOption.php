<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasPublicUlid;
use Database\Factories\QuizOptionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $public_id
 * @property int $quiz_question_id
 * @property string $option_key
 * @property string $label
 * @property bool $is_correct
 * @property int $sort_order
 */
#[Fillable([
    'public_id',
    'quiz_question_id',
    'option_key',
    'label',
    'is_correct',
    'sort_order',
])]
#[Hidden(['id', 'is_correct'])]
class QuizOption extends Model
{
    /** @use HasFactory<QuizOptionFactory> */
    use HasFactory, HasPublicUlid;

    protected $table = 'quiz_options';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quiz_question_id' => 'integer',
            'is_correct' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<QuizQuestion, $this>
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class, 'quiz_question_id');
    }
}
