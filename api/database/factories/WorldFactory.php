<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ContentStatus;
use App\Models\Pod;
use App\Models\World;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<World>
 */
class WorldFactory extends Factory
{
    protected $model = World::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = 'World '.fake()->unique()->numerify('###');

        return [
            'public_id' => strtolower((string) Str::ulid()),
            'pod_id' => Pod::factory(),
            'course_id' => null,
            'slug' => Str::slug($title),
            'title' => $title,
            'description' => fake()->sentence(),
            'world_number' => 1,
            'icon' => 'repeat',
            'map_x' => 195,
            'map_y' => 400,
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
