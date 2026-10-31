<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasPublicUlid;
use Database\Factories\PublicationLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $public_id
 * @property string $publishable_type
 * @property string $publishable_id
 * @property string|null $from_status
 * @property string $to_status
 * @property string|null $actor_type
 * @property string|null $actor_id
 * @property int|null $audit_log_id
 * @property array<string, mixed>|null $metadata
 * @property Carbon $occurred_at
 */
#[Fillable([
    'public_id',
    'publishable_type',
    'publishable_id',
    'from_status',
    'to_status',
    'actor_type',
    'actor_id',
    'audit_log_id',
    'metadata',
    'occurred_at',
])]
#[Hidden(['id'])]
class PublicationLog extends Model
{
    /** @use HasFactory<PublicationLogFactory> */
    use HasFactory, HasPublicUlid;

    protected $table = 'publication_logs';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'occurred_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<AuditLog, $this>
     */
    public function auditLog(): BelongsTo
    {
        return $this->belongsTo(AuditLog::class, 'audit_log_id');
    }
}
