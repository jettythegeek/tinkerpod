<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\RoleName;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_fails_clearly_when_admin_password_is_empty(): void
    {
        config([
            'tinkerpod.admin.email' => 'founder@tinkerpod.ng',
            'tinkerpod.admin.password' => '',
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('ADMIN_PASSWORD');

        $this->seed(DatabaseSeeder::class);
    }

    public function test_database_seeder_seeds_roles_permissions_and_super_admin_without_test_user(): void
    {
        config([
            'tinkerpod.admin.email' => 'founder@tinkerpod.ng',
            'tinkerpod.admin.password' => 'SuperSecretAdminPass!2026',
        ]);

        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseMissing('users', ['email' => 'test@example.com']);
        $this->assertDatabaseHas('users', ['email' => 'founder@tinkerpod.ng']);

        foreach (RoleName::values() as $roleName) {
            $this->assertTrue(Role::query()->where('name', $roleName)->exists(), "Missing role {$roleName}");
        }

        $admin = User::query()->where('email', 'founder@tinkerpod.ng')->firstOrFail();
        $this->assertTrue($admin->hasRole(RoleName::SuperAdmin->value));
    }
}
