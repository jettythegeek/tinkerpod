<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\PermissionName;
use App\Enums\RoleName;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (PermissionName::values() as $permissionName) {
            Permission::findOrCreate($permissionName, 'web');
        }

        /** @var array<string, list<PermissionName>> $roleMatrix */
        $roleMatrix = [
            RoleName::SuperAdmin->value => PermissionName::cases(),
            RoleName::Admin->value => [
                PermissionName::AccessAdminPanel,
                PermissionName::ViewUsers,
                PermissionName::ManageUsers,
                PermissionName::ViewChildren,
                PermissionName::ManageChildren,
                PermissionName::UnlockChildren,
                PermissionName::ResetChildPin,
                PermissionName::ViewContent,
                PermissionName::ManageContent,
                PermissionName::PublishContent,
                PermissionName::ViewPacks,
                PermissionName::ManagePacks,
                PermissionName::PublishPacks,
                PermissionName::ViewPods,
                PermissionName::ManagePods,
                PermissionName::ViewReviews,
                PermissionName::ManageReviews,
                PermissionName::ViewLiveClasses,
                PermissionName::ManageLiveClasses,
                PermissionName::ViewGamification,
                PermissionName::ManageGamification,
                PermissionName::ManageTournaments,
                PermissionName::ViewBilling,
                PermissionName::ViewSupport,
                PermissionName::ManageSupport,
                PermissionName::ViewAuditLogs,
            ],
            RoleName::ContentManager->value => [
                PermissionName::AccessAdminPanel,
                PermissionName::ViewContent,
                PermissionName::ManageContent,
                PermissionName::PublishContent,
                PermissionName::ViewPacks,
                PermissionName::ManagePacks,
                PermissionName::PublishPacks,
                PermissionName::ViewGamification,
            ],
            RoleName::Support->value => [
                PermissionName::AccessAdminPanel,
                PermissionName::ViewUsers,
                PermissionName::ViewChildren,
                PermissionName::UnlockChildren,
                PermissionName::ResetChildPin,
                PermissionName::ViewPods,
                PermissionName::ViewSupport,
                PermissionName::ManageSupport,
                PermissionName::ViewAuditLogs,
            ],
            RoleName::Finance->value => [
                PermissionName::AccessAdminPanel,
                PermissionName::ViewBilling,
                PermissionName::ManageBilling,
                PermissionName::ReconcileBilling,
                PermissionName::ViewAuditLogs,
            ],
            RoleName::Mentor->value => [
                PermissionName::AccessMentorPanel,
                PermissionName::ViewPods,
                PermissionName::ViewChildren,
                PermissionName::ViewReviews,
                PermissionName::ManageReviews,
                PermissionName::ViewLiveClasses,
                PermissionName::ManageLiveClasses,
            ],
            RoleName::Parent->value => [],
            RoleName::Child->value => [],
        ];

        foreach (RoleName::cases() as $roleEnum) {
            $role = Role::findOrCreate($roleEnum->value, 'web');
            $permissions = array_map(
                static fn (PermissionName $p): string => $p->value,
                $roleMatrix[$roleEnum->value] ?? [],
            );
            $role->syncPermissions($permissions);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
