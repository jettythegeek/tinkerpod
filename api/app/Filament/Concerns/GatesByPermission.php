<?php

declare(strict_types=1);

namespace App\Filament\Concerns;

use App\Enums\PermissionName;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Gates Filament resources and pages strictly by Spatie permissions, never by role names.
 */
trait GatesByPermission
{
    abstract public static function viewPermission(): PermissionName;

    public static function managePermission(): ?PermissionName
    {
        return null;
    }

    public static function shouldRegisterNavigation(): bool
    {
        return static::canViewAny();
    }

    public static function canAccess(): bool
    {
        return static::canViewAny();
    }

    public static function canViewAny(): bool
    {
        $user = auth()->user();

        if (! $user instanceof User) {
            return false;
        }

        return $user->can(static::viewPermission()->value);
    }

    public static function canCreate(): bool
    {
        return static::canManage();
    }

    public static function canEdit(Model $record): bool
    {
        return static::canManage();
    }

    public static function canDelete(Model $record): bool
    {
        return static::canManage();
    }

    protected static function canManage(): bool
    {
        $permission = static::managePermission() ?? static::viewPermission();
        $user = auth()->user();

        if (! $user instanceof User) {
            return false;
        }

        return $user->can($permission->value);
    }
}
