<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\RoleName;
use App\Mail\PasswordResetCodeMail;
use App\Models\PasswordResetCode;
use App\Models\User;
use App\Services\Sms\LogSmsSender;
use App\Support\NigerianPhone;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class ParentAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_nigerian_phone_normalizes_all_supported_formats_to_plus_234(): void
    {
        $this->assertSame('+2348031234567', NigerianPhone::normalize('08031234567'));
        $this->assertSame('+2348031234567', NigerianPhone::normalize('2348031234567'));
        $this->assertSame('+2348031234567', NigerianPhone::normalize('+2348031234567'));
        $this->assertSame('+2349012345678', NigerianPhone::normalize('0901 234 5678'));
        $this->assertNull(NigerianPhone::normalize('12345'));
    }

    public function test_parent_can_register_login_by_email_or_phone_fetch_me_and_logout(): void
    {
        $registerResponse = $this->postJson('/api/v1/auth/register', [
            'name' => 'Ngozi Okafor',
            'email' => 'Ngozi@Example.com',
            'phone' => '08031234567',
            'password' => 'ParentSecret123!',
        ]);

        $registerResponse->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'ngozi@example.com')
            ->assertJsonPath('data.user.phone', '+2348031234567')
            ->assertJsonPath('data.abilities', ['parent:*']);

        $token = (string) $registerResponse->json('data.token');
        $this->assertNotEmpty($token);

        // Login with email
        $this->postJson('/api/v1/auth/login', [
            'identifier' => 'ngozi@example.com',
            'password' => 'ParentSecret123!',
        ])->assertOk()->assertJsonPath('success', true);

        // Login with local 080... phone format
        $this->postJson('/api/v1/auth/login', [
            'identifier' => '08031234567',
            'password' => 'ParentSecret123!',
        ])->assertOk()->assertJsonPath('success', true);

        // Login with 234... phone format
        $this->postJson('/api/v1/auth/login', [
            'phone' => '2348031234567',
            'password' => 'ParentSecret123!',
        ])->assertOk()->assertJsonPath('success', true);

        // Me endpoint
        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.user.name', 'Ngozi Okafor');

        // Logout endpoint revokes token
        $this->withToken($token)
            ->postJson('/api/v1/auth/logout')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseCount('personal_access_tokens', 3);

        // Verify all issued parent tokens carry a 30-day default expiry
        foreach (PersonalAccessToken::all() as $pat) {
            $this->assertNotNull($pat->expires_at);
            $this->assertGreaterThan(now()->addDays(29), $pat->expires_at);
            $this->assertLessThanOrEqual(now()->addDays(31), $pat->expires_at);
        }
    }

    public function test_parent_login_never_assigns_parent_role_and_rejects_non_parent_users_with_generic_error(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $admin = User::factory()->create([
            'email' => 'admin@tinkerpod.ng',
            'password' => 'AdminSecret123!',
        ]);
        $admin->assignRole(RoleName::Admin->value);

        $rolelessUser = User::factory()->create([
            'email' => 'staff@tinkerpod.ng',
            'password' => 'StaffSecret123!',
        ]);

        // Admin trying to sign in via mobile parent login is rejected with the same generic error as wrong password
        $adminLoginRes = $this->postJson('/api/v1/auth/login', [
            'identifier' => 'admin@tinkerpod.ng',
            'password' => 'AdminSecret123!',
        ]);

        $adminLoginRes->assertStatus(422)
            ->assertJsonPath('message', 'These sign-in details do not match our records.');

        $this->assertFalse($admin->fresh()->hasRole(RoleName::Parent->value));

        // Roleless user trying to sign in via mobile parent login is rejected and NOT given the parent role
        $rolelessRes = $this->postJson('/api/v1/auth/login', [
            'identifier' => 'staff@tinkerpod.ng',
            'password' => 'StaffSecret123!',
        ]);

        $rolelessRes->assertStatus(422)
            ->assertJsonPath('message', 'These sign-in details do not match our records.');

        $this->assertFalse($rolelessUser->fresh()->hasRole(RoleName::Parent->value));

        // EnsureParentToken also rejects a parent:* token if the user lacks the parent role
        $forgedToken = $rolelessUser->createToken('forged', ['parent:*'])->plainTextToken;
        $this->withToken($forgedToken)
            ->getJson('/api/v1/parent/children')
            ->assertForbidden();
        $this->withToken($forgedToken)
            ->getJson('/api/v1/auth/me')
            ->assertForbidden();
    }

    public function test_register_endpoint_is_rate_limited(): void
    {
        for ($i = 1; $i <= 5; $i++) {
            $this->postJson('/api/v1/auth/register', [
                'name' => 'Test Parent '.$i,
                'email' => "parent{$i}@example.com",
                'phone' => sprintf('0803000000%d', $i),
                'password' => 'ParentSecret123!',
            ])->assertCreated();
        }

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Test Parent 6',
            'email' => 'parent6@example.com',
            'phone' => '08030000006',
            'password' => 'ParentSecret123!',
        ])->assertStatus(429);
    }

    public function test_password_reset_by_email_code_and_phone_code_with_expiry(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'ade@example.com',
            'phone' => '+2348091112233',
            'password' => 'OldPassword123!',
        ]);

        // 1. Request email reset code
        $this->postJson('/api/v1/auth/password/forgot', [
            'identifier' => 'ade@example.com',
        ])->assertOk()->assertJsonPath('success', true);

        $sentCode = null;
        Mail::assertSent(PasswordResetCodeMail::class, function (PasswordResetCodeMail $mail) use (&$sentCode): bool {
            $sentCode = $mail->code;

            return strlen($mail->code) === 6 && $mail->expiresInMinutes === 10;
        });

        $this->assertIsString($sentCode);

        $resetRecord = PasswordResetCode::query()->where('user_id', $user->id)->latest('id')->firstOrFail();
        $this->assertNotSame($sentCode, $resetRecord->code_hash);
        $this->assertTrue(Hash::check($sentCode, $resetRecord->code_hash));

        // Reset password with valid 6-digit code
        $this->postJson('/api/v1/auth/password/reset', [
            'identifier' => 'ade@example.com',
            'code' => $sentCode,
            'password' => 'NewPassword456!',
        ])->assertOk()->assertJsonPath('success', true);

        $this->assertTrue(Hash::check('NewPassword456!', $user->fresh()->password));

        // 2. Request phone SMS reset code via LogSmsSender
        $this->postJson('/api/v1/auth/password/forgot', [
            'identifier' => '08091112233',
            'channel' => 'phone',
        ])->assertOk();

        /** @var LogSmsSender $smsSender */
        $smsSender = app(LogSmsSender::class);
        $messages = $smsSender->sentMessages();
        $this->assertNotEmpty($messages);
        $this->assertSame('+2348091112233', $messages[0]['to']);

        preg_match('/\b(\d{6})\b/', $messages[0]['message'], $matches);
        $smsCode = $matches[1] ?? '';
        $this->assertSame(6, strlen($smsCode));

        // Expire the code (11 minutes later) and verify rejection
        $this->travel(11)->minutes();

        $this->postJson('/api/v1/auth/password/reset', [
            'identifier' => '08091112233',
            'code' => $smsCode,
            'password' => 'AnotherPass789!',
        ])->assertStatus(422);
    }
}
