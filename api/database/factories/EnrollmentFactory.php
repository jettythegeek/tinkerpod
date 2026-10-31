<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Child;
use App\Models\Enrollment;
use App\Models\Pod;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Enrollment>
 */
class EnrollmentFactory extends Factory
{
    protected $model = Enrollment::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'public_id' => strtolower((string) Str::ulid()),
            'child_id' => Child::factory(),
            'pod_id' => Pod::factory(),
            'status' => 'active',
            'enrolled_at' => now(),
        ];
    }
}
