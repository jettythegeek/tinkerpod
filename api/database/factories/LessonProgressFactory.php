<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Child;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<LessonProgress>
 */
class LessonProgressFactory extends Factory
{
    protected $model = LessonProgress::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'public_id' => strtolower((string) Str::ulid()),
            'child_id' => Child::factory(),
            'lesson_id' => Lesson::factory(),
            'resume_position_seconds' => 0,
            'watch_percent' => 0,
            'manual_completed' => false,
            'quiz_passed' => false,
            'is_completed' => false,
            'completion_source' => null,
            'completion_idempotency_key' => null,
            'last_accessed_at' => now(),
            'completed_at' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (): array => [
            'watch_percent' => 100,
            'manual_completed' => true,
            'is_completed' => true,
            'completion_source' => 'manual',
            'completed_at' => now(),
        ]);
    }
}
