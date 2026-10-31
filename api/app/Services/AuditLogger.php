<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Child;
use App\Models\PublicationLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AuditLogger
{
    /**
     * @param  array<string, mixed>  $metadata
     */
    public function log(
        string $action,
        ?Model $actor = null,
        ?Model $subject = null,
        array $metadata = [],
        ?Request $request = null,
    ): AuditLog {
        $req = $request ?? request();

        $mergedMetadata = array_merge(
            ['user_agent' => $req->userAgent()],
            $metadata,
        );

        return AuditLog::query()->create([
            'actor_type' => $actor !== null ? $actor::class : null,
            'actor_id' => $this->resolveIdentifier($actor),
            'action' => $action,
            'subject_type' => $subject !== null ? $subject::class : null,
            'subject_id' => $this->resolveIdentifier($subject),
            'metadata' => $mergedMetadata,
            'ip_address' => $req->ip(),
            'occurred_at' => now(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $metadata
     */
    public function logAdminOverride(
        User $admin,
        string $action,
        Model $subject,
        string $reason,
        array $metadata = [],
        ?Request $request = null,
    ): AuditLog {
        return $this->log(
            action: $action,
            actor: $admin,
            subject: $subject,
            metadata: array_merge($metadata, [
                'admin_override' => true,
                'reason' => $reason,
            ]),
            request: $request,
        );
    }

    /**
     * Records a curriculum publication status transition in both `audit_logs`
     * and `publication_logs`.
     *
     * @param  array<string, mixed>  $metadata
     */
    public function logPublicationChange(
        Model $subject,
        ?string $fromStatus,
        string $toStatus,
        ?Model $actor = null,
        array $metadata = [],
        ?Request $request = null,
    ): PublicationLog {
        $mergedMeta = array_merge($metadata, [
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
        ]);

        $auditLog = $this->log(
            action: 'curriculum.status.changed',
            actor: $actor,
            subject: $subject,
            metadata: $mergedMeta,
            request: $request,
        );

        return PublicationLog::query()->create([
            'publishable_type' => $subject::class,
            'publishable_id' => (string) $this->resolveIdentifier($subject),
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'actor_type' => $actor !== null ? $actor::class : null,
            'actor_id' => $this->resolveIdentifier($actor),
            'audit_log_id' => $auditLog->id,
            'metadata' => $mergedMeta,
            'occurred_at' => $auditLog->occurred_at,
        ]);
    }

    private function resolveIdentifier(?Model $model): ?string
    {
        if ($model === null) {
            return null;
        }

        if ($model instanceof Child) {
            return $model->public_id;
        }

        $publicId = $model->getAttribute('public_id');
        if (is_string($publicId) && $publicId !== '') {
            return $publicId;
        }

        $key = $model->getKey();

        return $key !== null ? (string) $key : null;
    }
}
