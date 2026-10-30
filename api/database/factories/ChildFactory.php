<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ApprovedAvatar;
use App\Models\Child;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<Child>
 */
class ChildFactory extends Factory
{
    protected $model = Child::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $age = fake()->numberBetween(6, 16);
        $band = $age >= 12 ? 'senior' : 'junior';

        return [
            'public_id' => strtolower((string) Str::ulid()),
            'parent_id' => User::factory(),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'birth_date' => now()->subYears($age)->format('Y-m-d'),
            'age_band' => $band,
            'theme_flag' => $band,
            'avatar' => fake()->randomElement(ApprovedAvatar::values()),
            'username' => 'kid_'.strtolower(Str::random(8)),
            'pin_hash' => Hash::make('4826'),
            'pin_failed_attempts' => 0,
            'lockout_tier' => 0,
            'locked_until' => null,
        ];
    }

    public function junior(): static
    {
        return $this->state(fn (): array => [
            'birth_date' => now()->subYears(8)->format('Y-m-d'),
            'age_band' => 'junior',
            'theme_flag' => 'junior',
        ]);
    }

    public function senior(): static
    {
        return $this->state(fn (): array => [
            'birth_date' => now()->subYears(14)->format('Y-m-d'),
            'age_band' => 'senior',
            'theme_flag' => 'senior',
        ]);
    }
}
