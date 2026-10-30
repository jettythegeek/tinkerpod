<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Child;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ParentChildControlsTest extends TestCase
{
    use RefreshDatabase;

    public function test_parent_can_set_or_reset_pin_update_username_and_unlock_own_child_while_rejecting_weak_pins_and_other_parents(): void
    {
        $parent = User::factory()->create();
        $token = $parent->createToken('parent-mobile', ['parent:*'])->plainTextToken;

        $child = Child::factory()->for($parent, 'parent')->create([
            'first_name' => 'Amara',
            'last_name' => 'Okafor',
            'username' => 'star_coder',
            'pin_hash' => Hash::make('4826'),
            'pin_failed_attempts' => 5,
            'lockout_tier' => 1,
            'locked_until' => now()->addMinutes(15),
        ]);

        // 1. Weak PINs (0000, 1111, 1234, 4321, 123456) are rejected
        foreach (['0000', '1111', '1234', '4321', '123456', '12'] as $weakPin) {
            $this->withToken($token)
                ->postJson("/api/v1/parent/children/{$child->public_id}/pin", [
                    'pin' => $weakPin,
                ])
                ->assertStatus(422);
        }

        // 2. Unlock profile clears lockout and failed attempts
        $this->withToken($token)
            ->postJson("/api/v1/parent/children/{$child->public_id}/unlock")
            ->assertOk()
            ->assertJsonPath('data.child.is_locked', false)
            ->assertJsonPath('data.child.pin_failed_attempts', 0);

        $this->assertFalse($child->fresh()->isLocked());

        // 3. Reset PIN to a strong 6-digit PIN and verify kid can log in with it
        $this->withToken($token)
            ->postJson("/api/v1/parent/children/{$child->public_id}/pin", [
                'pin' => '592741',
            ])
            ->assertOk();

        $this->postJson('/api/v1/kid/login', [
            'profile_id' => $child->public_id,
            'pin' => '592741',
        ])->assertOk();

        // 4. Parent sets child username
        $this->withToken($token)
            ->postJson("/api/v1/parent/children/{$child->public_id}/username", [
                'username' => 'galaxy_explorer',
            ])
            ->assertOk()
            ->assertJsonPath('data.child.username', 'galaxy_explorer');

        // 5. Another parent cannot reset PIN, change username, or unlock this child
        $otherParent = User::factory()->create();
        $otherToken = $otherParent->createToken('parent-mobile', ['parent:*'])->plainTextToken;

        $this->withToken($otherToken)
            ->postJson("/api/v1/parent/children/{$child->public_id}/pin", ['pin' => '7391'])
            ->assertForbidden();

        $this->withToken($otherToken)
            ->postJson("/api/v1/parent/children/{$child->public_id}/username", ['username' => 'stolen_name'])
            ->assertForbidden();

        $this->withToken($otherToken)
            ->postJson("/api/v1/parent/children/{$child->public_id}/unlock")
            ->assertForbidden();
    }
}
