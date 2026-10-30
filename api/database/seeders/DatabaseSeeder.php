<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\RoleName;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);

        $adminEmail = trim((string) (config('tinkerpod.admin.email') ?: ($_ENV['ADMIN_EMAIL'] ?? $_SERVER['ADMIN_EMAIL'] ?? getenv('ADMIN_EMAIL') ?: '')));
        $adminPassword = (string) (config('tinkerpod.admin.password') ?: ($_ENV['ADMIN_PASSWORD'] ?? $_SERVER['ADMIN_PASSWORD'] ?? getenv('ADMIN_PASSWORD') ?: ''));

        if (trim($adminPassword) === '') {
            throw new RuntimeException('ADMIN_PASSWORD must be configured before seeding the super_admin user.');
        }

        if ($adminEmail === '') {
            throw new RuntimeException('ADMIN_EMAIL must be configured before seeding the super_admin user.');
        }

        $superAdmin = User::query()->updateOrCreate(
            ['email' => $adminEmail],
            [
                'name' => 'TinkerPod Super Admin',
                'password' => $adminPassword,
                'email_verified_at' => now(),
            ],
        );

        $superAdmin->syncRoles([RoleName::SuperAdmin->value]);
    }
}
