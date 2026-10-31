<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasPublicUlid;
use Database\Factories\EnrollmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $public_id
 * @property int $child_id
 * @property int $pod_id
 * @property string $status
 * @property Carbon $enrolled_at
 */
#[Fillable([
    'public_id',
    'child_id',
    'pod_id',
    'status',
    'enrolled_at',
])]
#[Hidden(['id'])]
class Enrollment extends Model
{
    /** @use HasFactory<EnrollmentFactory> */
    use HasFactory, HasPublicUlid;

    protected $table = 'enrollments';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'child_id' => 'integer',
            'pod_id' => 'integer',
            'enrolled_at' => 'datetime',
        ];
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * @return BelongsTo<Child, $this>
     */
    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class, 'child_id');
    }

    /**
     * @return BelongsTo<Pod, $this>
     */
    public function pod(): BelongsTo
    {
        return $this->belongsTo(Pod::class, 'pod_id');
    }
}
