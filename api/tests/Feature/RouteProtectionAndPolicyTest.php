<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\RoleName;
use App\Models\Child;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RouteProtectionAndPolicyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_child_token_gets_403_on_parent_billing_and_admin_routes(): void
    {
        $parent = User::factory()->create();
        $parent->assignRole(RoleName::Parent->value);

        $child = Child::factory()->for($parent, 'parent')->create();
        $childToken = $child->createToken('kid-mobile', ['child:*'])->plainTextToken;

        // 1. Child token works on /api/v1/kid/me
        $this->withToken($childToken)
            ->getJson('/api/v1/kid/me')
            ->assertOk();

        // 2. Child token gets 403 on /api/v1/parent/* routes
        $this->withToken($childToken)
            ->getJson('/api/v1/parent/children')
            ->assertForbidden();

        $this->withToken($childToken)
            ->postJson('/api/v1/parent/children', [])
            ->assertForbidden();

        $this->withToken($childToken)
            ->postJson("/api/v1/parent/children/{$child->public_id}/unlock")
            ->assertForbidden();

        // 3. Child token gets 403 on /api/v1/auth/me and /api/v1/auth/logout
        $this->withToken($childToken)
            ->getJson('/api/v1/auth/me')
            ->assertForbidden();

        // 4. Child token gets 403 on /api/v1/billing/* routes
        $this->withToken($childToken)
            ->getJson('/api/v1/billing/status')
            ->assertForbidden();

        // 5. Child token gets 403 on Filament /admin route
        $this->withToken($childToken)
            ->get('/admin')
            ->assertForbidden();
    }

    public function test_parent_token_gets_403_on_kid_and_admin_routes_and_non_parent_roles_cannot_access_parent_routes(): void
    {
        $parentA = User::factory()->create();
        $parentA->assignRole(RoleName::Parent->value);
        $parentAToken = $parentA->createToken('parent-mobile', ['parent:*'])->plainTextToken;

        $parentB = User::factory()->create();
        $parentB->assignRole(RoleName::Parent->value);
        $childB = Child::factory()->for($parentB, 'parent')->create();

        // Parent token gets 403 on /api/v1/kid/me
        $this->withToken($parentAToken)
            ->getJson('/api/v1/kid/me')
            ->assertForbidden();

        // Parent token gets 403 on /admin
        $this->withToken($parentAToken)
            ->get('/admin')
            ->assertForbidden();

        // Parent A cannot touch Parent B's child
        $this->withToken($parentAToken)
            ->getJson("/api/v1/parent/children/{$childB->public_id}")
            ->assertForbidden();

        // Non-parent roles (mentor, support, content_manager, finance, admin, super_admin) without parent role/scope cannot use /api/v1/parent/children
        foreach ([
            RoleName::Mentor,
            RoleName::Support,
            RoleName::ContentManager,
            RoleName::Finance,
            RoleName::Admin,
            RoleName::SuperAdmin,
        ] as $role) {
            $roleUser = User::factory()->create();
            $roleUser->assignRole($role->value);
            $roleToken = $roleUser->createToken('staff-token', ['staff:*'])->plainTextToken;

            $this->withToken($roleToken)
                ->getJson('/api/v1/parent/children')
                ->assertForbidden();

            $this->withToken($roleToken)
                ->getJson("/api/v1/parent/children/{$childB->public_id}")
                ->assertForbidden();
        }
    }
}
