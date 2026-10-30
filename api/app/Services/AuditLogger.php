<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Child;
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

    private function resolveIdentifier(?Model $model): ?string
    {
        if ($model === null) {
            return null;
        }

        if ($model instanceof Child) {
            return $model->public_id;
        }

        $key = $model->getKey();

        return $key !== null ? (string) $key : null;
    }
}
