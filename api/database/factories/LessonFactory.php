<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ContentStatus;
use App\Enums\LessonCompletionMode;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\World;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Lesson>
 */
class LessonFactory extends Factory
{
    protected $model = Lesson::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = 'Lesson '.fake()->unique()->numerify('###');

        return [
            'public_id' => strtolower((string) Str::ulid()),
            'module_id' => Module::factory(),
            'world_id' => World::factory(),
            'slug' => Str::slug($title),
            'lesson_number' => 1,
            'title' => $title,
            'summary' => 'Teach your robot to do the same thing again and again — without writing it 100 times!',
            'body' => 'Loops let us repeat instructions cleanly.',
            'learning_objectives' => [
                'What a loop is',
                'Counting with range()',
                'Build a jollof-timer that counts down',
            ],
            'thumbnail_asset' => 'lesson-loops.jpg',
            'intro_video_url' => null,
            'intro_video_duration_seconds' => 80,
            'duration_minutes' => 8,
            'difficulty' => 'Beginner',
            'steps_count' => 5,
            'completion_mode' => LessonCompletionMode::Manual->value,
            'required_watch_percent' => 80,
            'status' => ContentStatus::Published->value,
            'is_demo' => false,
            'sort_order' => 1,
            'published_at' => now(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (): array => [
            'status' => ContentStatus::Draft->value,
            'published_at' => null,
        ]);
    }
}
