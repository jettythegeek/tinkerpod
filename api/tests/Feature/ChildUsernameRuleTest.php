<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Child;
use App\Models\User;
use App\Rules\ChildUsernameRule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChildUsernameRuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_rejects_rude_lookalike_phone_like_email_like_and_real_name_usernames_with_kid_friendly_message(): void
    {
        $parent = User::factory()->create();
        $parentToken = $parent->createToken('parent-mobile', ['parent:*'])->plainTextToken;

        $existingChild = Child::factory()->for($parent, 'parent')->create([
            'first_name' => 'Amara',
            'last_name' => 'Okafor',
            'username' => 'star_builder',
        ]);

        $invalidUsernames = [
            'ab',                     // too short (< 3)
            'this_username_is_way_too_long_123', // too long (> 20)
            'STAR_BUILDER',           // case-insensitive duplicate
            'fuck_hero',              // English profanity
            'm.u_m.u_kid',            // Pidgin/Igbo profanity with separators
            '0l0d0_99',               // Yoruba/Pidgin look-alike (0 -> o)
            'b45t4rd_x',              // Look-alike (4 -> a, 5 -> s)
            '1d10t_coder',            // Look-alike (1 -> i, 0 -> o)
            'banza_boy',              // Hausa profanity
            'ofeke.coder',            // Igbo profanity
            'coder_08031234',         // Phone-like (7+ digits)
            'kid@tinkerpod.ng',       // Email-like (@)
            'kid.gmail.com',          // Email-like (.com / gmail.)
            'amara_codes',            // Contains child's first name
            'super_okafor',           // Contains child's last name
            '4m4r4_ninja',            // Look-alike of child's first name (4 -> a)
        ];

        foreach ($invalidUsernames as $badUsername) {
            $response = $this->withToken($parentToken)->postJson('/api/v1/parent/children', [
                'first_name' => 'Amara',
                'last_name' => 'Okafor',
                'birth_date' => '2016-05-10',
                'avatar' => 'av1.png',
                'username' => $badUsername,
                'pin' => '4826',
            ]);

            $response->assertStatus(422, "Expected username '{$badUsername}' to be rejected.");
            $this->assertSame(
                ChildUsernameRule::MESSAGE,
                $response->json('message'),
                "Expected kid-friendly message for rejected username '{$badUsername}'."
            );
        }

        // Kid can change their own username via kid endpoint using a child:* token
        $childToken = $existingChild->createToken('kid-mobile', ['child:*'])->plainTextToken;

        $this->withToken($childToken)
            ->patchJson('/api/v1/kid/username', [
                'username' => 'amara_star',
            ])
            ->assertStatus(422)
            ->assertJsonPath('message', ChildUsernameRule::MESSAGE);

        $this->withToken($childToken)
            ->patchJson('/api/v1/kid/username', [
                'username' => 'Pixel.Wizard_9',
            ])
            ->assertOk()
            ->assertJsonPath('data.child.username', 'pixel.wizard_9');
    }
}
