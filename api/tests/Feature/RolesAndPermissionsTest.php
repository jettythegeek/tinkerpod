<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\PermissionName;
use App\Enums\RoleName;
use App\Filament\Concerns\GatesByPermission;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RolesAndPermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_seeds_all_eight_roles_and_permissions(): void
    {
        $expectedRoles = [
            'parent',
            'child',
            'mentor',
            'admin',
            'super_admin',
            'content_manager',
            'support',
            'finance',
        ];

        $this->assertSame($expectedRoles, RoleName::values());

        foreach ($expectedRoles as $roleName) {
            $this->assertTrue(
                Role::query()->where('name', $roleName)->where('guard_name', 'web')->exists(),
                "Role '{$roleName}' must be seeded."
            );
        }

        foreach (PermissionName::values() as $permName) {
            $this->assertTrue(
                Permission::query()->where('name', $permName)->where('guard_name', 'web')->exists(),
                "Permission '{$permName}' must be seeded."
            );
        }
    }

    public function test_filament_panel_and_navigation_are_gated_by_permissions_not_role_names(): void
    {
        $adminPanel = Filament::getPanel('admin');

        // Staff roles with panel.admin.access permission can access the panel
        foreach ([RoleName::SuperAdmin, RoleName::Admin, RoleName::ContentManager, RoleName::Support, RoleName::Finance] as $staffRole) {
            $user = User::factory()->create();
            $user->assignRole($staffRole->value);

            $this->assertTrue(
                $user->canAccessPanel($adminPanel),
                "Role {$staffRole->value} should access /admin via permission."
            );
        }

        // Non-admin roles without panel.admin.access cannot access /admin
        foreach ([RoleName::Parent, RoleName::Child, RoleName::Mentor] as $nonAdminRole) {
            $user = User::factory()->create();
            $user->assignRole($nonAdminRole->value);

            $this->assertFalse(
                $user->canAccessPanel($adminPanel),
                "Role {$nonAdminRole->value} must not access /admin."
            );
        }

        // Direct permission grant without any staff role name grants access (proving permission-driven gating)
        $customUser = User::factory()->create();
        $customUser->givePermissionTo(PermissionName::AccessAdminPanel->value);
        $this->assertTrue($customUser->canAccessPanel($adminPanel));

        // Resource navigation helper checks permissions
        $billingResourceProbe = new class
        {
            use GatesByPermission;

            public static function viewPermission(): PermissionName
            {
                return PermissionName::ViewBilling;
            }

            public static function managePermission(): ?PermissionName
            {
                return PermissionName::ManageBilling;
            }
        };

        $financeUser = User::factory()->create();
        $financeUser->assignRole(RoleName::Finance->value);
        $this->actingAs($financeUser);
        $this->assertTrue($billingResourceProbe::shouldRegisterNavigation());
        $this->assertTrue($billingResourceProbe::canCreate());

        $contentUser = User::factory()->create();
        $contentUser->assignRole(RoleName::ContentManager->value);
        $this->actingAs($contentUser);
        $this->assertFalse($billingResourceProbe::shouldRegisterNavigation());
        $this->assertFalse($billingResourceProbe::canCreate());
    }
}
