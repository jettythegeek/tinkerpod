<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $grace_days
 * @property string $timezone
 * @property int $version
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'grace_days',
    'timezone',
    'version',
])]
#[Hidden(['id'])]
class StreakSetting extends Model
{
    protected $table = 'streak_settings';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'grace_days' => 'integer',
            'version' => 'integer',
        ];
    }

    public static function current(): self
    {
        /** @var self|null $setting */
        $setting = self::query()->orderByDesc('version')->first();

        if ($setting !== null) {
            return $setting;
        }

        /** @var self $created */
        $created = self::query()->create([
            'grace_days' => 1,
            'timezone' => 'Africa/Lagos',
            'version' => 1,
        ]);

        return $created;
    }
}
