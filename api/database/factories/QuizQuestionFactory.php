<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Quiz;
use App\Models\QuizQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<QuizQuestion>
 */
class QuizQuestionFactory extends Factory
{
    protected $model = QuizQuestion::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'public_id' => strtolower((string) Str::ulid()),
            'quiz_id' => Quiz::factory(),
            'question_number' => 1,
            'prompt' => 'What will this loop print?',
            'code_snippet' => "for i in range(3):\n    print(i)",
            'hint' => 'computers start counting from 0, not 1!',
            'explanation' => 'range(3) starts at 0 and stops before 3, so it prints 0, 1, and 2.',
            'points' => 10,
            'sort_order' => 1,
        ];
    }
}
