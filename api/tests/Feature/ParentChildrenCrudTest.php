<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\RoleName;
use App\Models\Child;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ParentChildrenCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_parent_can_add_list_edit_and_remove_own_children_using_public_ulid(): void
    {
        Role::findOrCreate(RoleName::Parent->value, 'web');

        $parent = User::factory()->create();
        $parent->assignRole(RoleName::Parent->value);
        $token = $parent->createToken('parent-mobile', ['parent:*'])->plainTextToken;

        // Add child (junior age 8)
        $createRes = $this->withToken($token)->postJson('/api/v1/parent/children', [
            'first_name' => 'Amara',
            'last_name' => 'Okafor',
            'birth_date' => now()->subYears(8)->format('Y-m-d'),
            'avatar' => 'av-girl.png',
            'username' => 'code_star_8',
            'pin' => '4826',
        ]);

        $createRes->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.child.first_name', 'Amara')
            ->assertJsonPath('data.child.age_band', 'junior')
            ->assertJsonPath('data.child.theme_flag', 'junior')
            ->assertJsonPath('data.child.avatar', 'av-girl.png')
            ->assertJsonPath('data.child.username', 'code_star_8');

        $publicId = (string) $createRes->json('data.child.id');
        $this->assertSame(26, strlen($publicId));

        $child = Child::query()->where('public_id', $publicId)->firstOrFail();
        $this->assertTrue(Hash::check('4826', $child->pin_hash));

        // List own children
        $this->withToken($token)
            ->getJson('/api/v1/parent/children')
            ->assertOk()
            ->assertJsonCount(1, 'data.children')
            ->assertJsonPath('data.children.0.id', $publicId);

        // Edit child (senior age 14)
        $this->withToken($token)
            ->patchJson("/api/v1/parent/children/{$publicId}", [
                'birth_date' => now()->subYears(14)->format('Y-m-d'),
                'avatar' => 'av3.png',
            ])
            ->assertOk()
            ->assertJsonPath('data.child.age_band', 'senior')
            ->assertJsonPath('data.child.theme_flag', 'senior')
            ->assertJsonPath('data.child.avatar', 'av3.png');

        // Another parent cannot view, edit, or delete this child
        $otherParent = User::factory()->create();
        $otherParent->assignRole(RoleName::Parent->value);
        $otherToken = $otherParent->createToken('parent-mobile', ['parent:*'])->plainTextToken;

        $this->withToken($otherToken)
            ->getJson("/api/v1/parent/children/{$publicId}")
            ->assertForbidden();

        $this->withToken($otherToken)
            ->patchJson("/api/v1/parent/children/{$publicId}", ['first_name' => 'Hacked'])
            ->assertForbidden();

        $this->withToken($otherToken)
            ->deleteJson("/api/v1/parent/children/{$publicId}")
            ->assertForbidden();

        // Owner parent removes child
        $this->withToken($token)
            ->deleteJson("/api/v1/parent/children/{$publicId}")
            ->assertOk();

        $this->assertDatabaseMissing('children', ['public_id' => $publicId]);
    }
}
