<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Http\Controllers\Api\V1\Kid\KidAuthController;
use App\Models\Child;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class KidLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_kid_lookup_by_username_parent_email_and_parent_phone_is_privacy_safe(): void
    {
        $parent = User::factory()->create([
            'email' => 'mama@example.com',
            'phone' => '+2348035556677',
        ]);

        $amara = Child::factory()->for($parent, 'parent')->create([
            'first_name' => 'Amara',
            'last_name' => 'Okafor',
            'birth_date' => '2017-03-14',
            'avatar' => 'av-girl.png',
            'username' => 'star_coder',
            'pin_hash' => Hash::make('4826'),
        ]);

        $tobi = Child::factory()->for($parent, 'parent')->create([
            'first_name' => 'Tobi',
            'last_name' => 'Okafor',
            'birth_date' => '2012-08-22',
            'avatar' => 'av3.png',
            'username' => 'robo_builder',
            'pin_hash' => Hash::make('7391'),
        ]);

        $otherFamilyChild = Child::factory()->create([
            'first_name' => 'Zainab',
            'last_name' => 'Bello',
            'username' => 'zainab_rocket',
        ]);

        // 1. Lookup by username returns only that single profile with ONLY id, first_name, avatar
        $usernameRes = $this->postJson('/api/v1/kid/lookup', [
            'identifier' => 'STAR_CODER',
        ]);

        $usernameRes->assertOk()
            ->assertJsonPath('data.mode', 'single')
            ->assertJsonCount(1, 'data.profiles');

        $singleProfile = $usernameRes->json('data.profiles.0');
        $this->assertSame([
            'id' => $amara->public_id,
            'first_name' => 'Amara',
            'avatar' => 'av-girl.png',
        ], $singleProfile);
        $this->assertArrayNotHasKey('last_name', $singleProfile);
        $this->assertArrayNotHasKey('birth_date', $singleProfile);

        // 2. Lookup by parent email returns picker list for that parent's children only
        $emailRes = $this->postJson('/api/v1/kid/lookup', [
            'identifier' => 'mama@example.com',
        ]);

        $emailRes->assertOk()
            ->assertJsonPath('data.mode', 'picker')
            ->assertJsonCount(2, 'data.profiles');

        $pickerIds = array_column($emailRes->json('data.profiles'), 'id');
        $this->assertContains($amara->public_id, $pickerIds);
        $this->assertContains($tobi->public_id, $pickerIds);
        $this->assertNotContains($otherFamilyChild->public_id, $pickerIds);

        foreach ($emailRes->json('data.profiles') as $profile) {
            $this->assertSame(['id', 'first_name', 'avatar'], array_keys($profile));
        }

        // 3. Lookup by parent phone (080... format) returns picker list
        $phoneRes = $this->postJson('/api/v1/kid/lookup', [
            'identifier' => '08035556677',
        ]);
        $phoneRes->assertOk()
            ->assertJsonPath('data.mode', 'picker')
            ->assertJsonCount(2, 'data.profiles');

        // 4. Unknown identifier returns generic kind answer
        $this->postJson('/api/v1/kid/lookup', [
            'identifier' => 'nobody_here_123',
        ])->assertNotFound()
            ->assertJsonPath('message', KidAuthController::NOT_FOUND_MESSAGE);
    }

    public function test_kid_can_login_with_profile_id_or_username_and_receive_7_day_child_scoped_token(): void
    {
        $child = Child::factory()->create([
            'first_name' => 'Amara',
            'username' => 'star_coder',
            'pin_hash' => Hash::make('4826'),
        ]);

        // Login with profile_id (ULID) + PIN
        $loginById = $this->postJson('/api/v1/kid/login', [
            'profile_id' => $child->public_id,
            'pin' => '4826',
        ]);

        $loginById->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.abilities', ['child:*'])
            ->assertJsonPath('data.child.id', $child->public_id);

        // Login with username + PIN
        $loginByUsername = $this->postJson('/api/v1/kid/login', [
            'username' => 'star_coder',
            'pin' => '4826',
        ]);

        $loginByUsername->assertOk()
            ->assertJsonPath('data.abilities', ['child:*']);

        $tokenModel = $child->tokens()->latest('id')->firstOrFail();
        $this->assertSame(['child:*'], $tokenModel->abilities);
        $this->assertNotNull($tokenModel->expires_at);
        $this->assertTrue($tokenModel->expires_at->greaterThan(now()->addDays(6)));
    }
}
