<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Enums\PermissionName;
use App\Models\User;

abstract class RewardsResource extends PermissionGatedResource
{
    protected static string|\UnitEnum|null $navigationGroup = 'Rewards';

    public static function viewPermission(): PermissionName
    {
        return PermissionName::ViewRewards;
    }

    public static function managePermission(): ?PermissionName
    {
        return PermissionName::ManageRewards;
    }

    public static function adjustPermission(): PermissionName
    {
        return PermissionName::AdjustRewards;
    }

    public static function canAdjust(): bool
    {
        $user = auth()->user();

        if (! $user instanceof User) {
            return false;
        }

        return $user->can(PermissionName::AdjustRewards->value);
    }
}
