<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\QuizOption;
use App\Models\QuizQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<QuizOption>
 */
class QuizOptionFactory extends Factory
{
    protected $model = QuizOption::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'public_id' => strtolower((string) Str::ulid()),
            'quiz_question_id' => QuizQuestion::factory(),
            'option_key' => 'A',
            'label' => '0  1  2',
            'is_correct' => true,
            'sort_order' => 1,
        ];
    }
}
