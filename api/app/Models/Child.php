<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\ChildFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string $public_id
 * @property int $parent_id
 * @property string $first_name
 * @property string|null $last_name
 * @property Carbon|null $birth_date
 * @property string $age_band
 * @property string $theme_flag
 * @property string $avatar
 * @property string $username
 * @property string $pin_hash
 * @property int $pin_failed_attempts
 * @property int $lockout_tier
 * @property Carbon|null $locked_until
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'public_id',
    'parent_id',
    'first_name',
    'last_name',
    'birth_date',
    'age_band',
    'theme_flag',
    'avatar',
    'username',
    'pin_hash',
    'pin_failed_attempts',
    'lockout_tier',
    'locked_until',
])]
#[Hidden([
    'id',
    'pin_hash',
])]
class Child extends Authenticatable
{
    /** @use HasFactory<ChildFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'children';

    protected static function booted(): void
    {
        static::creating(static function (self $child): void {
            if (empty($child->public_id)) {
                $child->public_id = strtolower((string) Str::ulid());
            }

            $child->username = strtolower(trim($child->username));
        });

        static::saving(static function (self $child): void {
            $child->username = strtolower(trim($child->username));
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'pin_failed_attempts' => 'integer',
            'lockout_tier' => 'integer',
            'locked_until' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'public_id';
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    /**
     * @return HasMany<Enrollment, $this>
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'child_id');
    }

    /**
     * @return BelongsToMany<Pod, $this>
     */
    public function pods(): BelongsToMany
    {
        return $this->belongsToMany(Pod::class, 'enrollments', 'child_id', 'pod_id')
            ->withPivot(['status', 'enrolled_at'])
            ->withTimestamps();
    }

    /**
     * @return HasMany<LessonProgress, $this>
     */
    public function lessonProgress(): HasMany
    {
        return $this->hasMany(LessonProgress::class, 'child_id');
    }

    public function isLocked(): bool
    {
        return $this->locked_until instanceof CarbonInterface && $this->locked_until->isFuture();
    }

    public static function resolveBandForBirthDate(?string $birthDate): string
    {
        if ($birthDate === null || trim($birthDate) === '') {
            return 'junior';
        }

        $age = Carbon::parse($birthDate)->age;

        return $age >= 12 ? 'senior' : 'junior';
    }
}
