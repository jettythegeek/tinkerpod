<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ContentStatus;
use App\Models\Course;
use App\Models\Module;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Module>
 */
class ModuleFactory extends Factory
{
    protected $model = Module::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = 'Module '.fake()->unique()->numerify('###');

        return [
            'public_id' => strtolower((string) Str::ulid()),
            'course_id' => Course::factory(),
            'world_id' => null,
            'slug' => Str::slug($title),
            'title' => $title,
            'description' => fake()->sentence(),
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
