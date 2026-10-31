<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ContentStatus;
use App\Models\Lesson;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'public_id' => strtolower((string) Str::ulid()),
            'lesson_id' => Lesson::factory(),
            'title' => 'Jollof Timer Countdown',
            'description' => 'Build a timer that counts down using a loop.',
            'instructions' => 'Use range() to count down and print when Jollof is ready!',
            'starter_code' => "for second in range(5, 0, -1):\n    print(second)\n",
            'language' => 'python',
            'steps_count' => 5,
            'status' => ContentStatus::Published->value,
            'is_demo' => false,
            'sort_order' => 1,
            'published_at' => now(),
        ];
    }
}
