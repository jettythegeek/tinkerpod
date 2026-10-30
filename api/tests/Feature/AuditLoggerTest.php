<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\RoleName;
use App\Models\AuditLog;
use App\Models\Child;
use App\Models\User;
use App\Services\AdminChildOverrideService;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuditLoggerTest extends TestCase
{
    use RefreshDatabase;

    public function test_audit_logger_records_pin_changes_username_changes_unlocks_kid_logins_and_admin_overrides(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $parent = User::factory()->create();
        $parent->assignRole(RoleName::Parent->value);
        $parentToken = $parent->createToken('parent-mobile', ['parent:*'])->plainTextToken;

        $child = Child::factory()->for($parent, 'parent')->create([
            'first_name' => 'Amara',
            'last_name' => 'Okafor',
            'username' => 'star_coder',
            'pin_hash' => Hash::make('4826'),
            'locked_until' => now()->addMinutes(15),
        ]);

        // 1. Parent unlocks profile
        $this->withToken($parentToken)
            ->postJson("/api/v1/parent/children/{$child->public_id}/unlock")
            ->assertOk();

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'child.profile.unlocked',
            'actor_type' => User::class,
            'actor_id' => (string) $parent->id,
            'subject_type' => Child::class,
            'subject_id' => $child->public_id,
        ]);

        // 2. Parent updates PIN
        $this->withToken($parentToken)
            ->postJson("/api/v1/parent/children/{$child->public_id}/pin", ['pin' => '7391'])
            ->assertOk();

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'child.pin.updated',
            'actor_type' => User::class,
            'subject_id' => $child->public_id,
        ]);

        // 3. Parent updates username
        $this->withToken($parentToken)
            ->postJson("/api/v1/parent/children/{$child->public_id}/username", ['username' => 'orbit_hero'])
            ->assertOk();

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'child.username.updated',
            'actor_type' => User::class,
            'subject_id' => $child->public_id,
        ]);

        // 4. Kid logs in and updates their own username
        $loginRes = $this->postJson('/api/v1/kid/login', [
            'username' => 'orbit_hero',
            'pin' => '7391',
        ])->assertOk();

        $kidToken = (string) $loginRes->json('data.token');

        $this->withToken($kidToken)
            ->patchJson('/api/v1/kid/username', ['username' => 'nova_builder'])
            ->assertOk();

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'child.username.updated',
            'actor_type' => Child::class,
            'actor_id' => $child->public_id,
            'subject_id' => $child->public_id,
        ]);

        // 5. Support staff admin override unlock
        $supportStaff = User::factory()->create();
        $supportStaff->assignRole(RoleName::Support->value);

        /** @var AdminChildOverrideService $overrideService */
        $overrideService = app(AdminChildOverrideService::class);
        $overrideLog = $overrideService->unlockChild($supportStaff, $child, 'Verified parent call via support ticket #104');

        $this->assertSame('admin.override.child_unlock', $overrideLog->action);
        $this->assertTrue((bool) ($overrideLog->metadata['admin_override'] ?? false));
        $this->assertSame('Verified parent call via support ticket #104', $overrideLog->metadata['reason'] ?? null);
        $this->assertGreaterThanOrEqual(5, AuditLog::query()->count());
    }
}
