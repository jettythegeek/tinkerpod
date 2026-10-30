<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\PermissionName;
use App\Models\AuditLog;
use App\Models\Child;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Hash;

class AdminChildOverrideService
{
    public function __construct(
        private readonly AuditLogger $auditLogger,
    ) {}

    public function unlockChild(User $staffUser, Child $child, string $reason): AuditLog
    {
        if (! $staffUser->can(PermissionName::UnlockChildren->value)) {
            throw new AuthorizationException('Staff user lacks permission to unlock child profiles.');
        }

        $child->pin_failed_attempts = 0;
        $child->lockout_tier = 0;
        $child->locked_until = null;
        $child->save();

        return $this->auditLogger->logAdminOverride(
            admin: $staffUser,
            action: 'admin.override.child_unlock',
            subject: $child,
            reason: $reason,
        );
    }

    public function resetChildPin(User $staffUser, Child $child, string $newPin, string $reason): AuditLog
    {
        if (! $staffUser->can(PermissionName::ResetChildPin->value)) {
            throw new AuthorizationException('Staff user lacks permission to reset child PINs.');
        }

        $child->pin_hash = Hash::make($newPin);
        $child->pin_failed_attempts = 0;
        $child->lockout_tier = 0;
        $child->locked_until = null;
        $child->save();

        return $this->auditLogger->logAdminOverride(
            admin: $staffUser,
            action: 'admin.override.child_pin_reset',
            subject: $child,
            reason: $reason,
        );
    }
}
