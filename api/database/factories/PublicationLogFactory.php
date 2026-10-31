<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ContentStatus;
use App\Models\Lesson;
use App\Models\PublicationLog;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PublicationLog>
 */
class PublicationLogFactory extends Factory
{
    protected $model = PublicationLog::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'public_id' => strtolower((string) Str::ulid()),
            'publishable_type' => Lesson::class,
            'publishable_id' => strtolower((string) Str::ulid()),
            'from_status' => ContentStatus::Draft->value,
            'to_status' => ContentStatus::Published->value,
            'actor_type' => null,
            'actor_id' => null,
            'audit_log_id' => null,
            'metadata' => [
                'from_status' => ContentStatus::Draft->value,
                'to_status' => ContentStatus::Published->value,
            ],
            'occurred_at' => now(),
        ];
    }
}
