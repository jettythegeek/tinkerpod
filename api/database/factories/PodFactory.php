<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ContentStatus;
use App\Models\Pod;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Pod>
 */
class PodFactory extends Factory
{
    protected $model = Pod::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = 'Coding Pod '.fake()->unique()->numerify('###');

        return [
            'public_id' => strtolower((string) Str::ulid()),
            'slug' => Str::slug($title),
            'title' => $title,
            'description' => fake()->sentence(),
            'icon' => 'code-xml',
            'age_band' => 'all',
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

    public function archived(): static
    {
        return $this->state(fn (): array => [
            'status' => ContentStatus::Archived->value,
            'archived_at' => now(),
        ]);
    }
}
