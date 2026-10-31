<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Child;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuizAttempt>
 */
class QuizAttemptFactory extends Factory
{
    protected $model = QuizAttempt::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'child_id' => Child::factory(),
            'quiz_id' => Quiz::factory(),
            'attempt_number' => 1,
            'idempotency_key' => null,
            'earned_points' => 40,
            'total_points' => 40,
            'score_percent' => 100,
            'passed' => true,
            'submitted_at' => now(),
        ];
    }
}
