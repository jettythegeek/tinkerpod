<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Child;
use App\Models\User;
use App\Notifications\ChildProfileLockedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class KidLockoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_wrong_pin_increments_and_locks_after_5_attempts_with_escalating_durations_parent_notifications_and_audit_logs(): void
    {
        Notification::fake();

        $parent = User::factory()->create(['email' => 'parent@example.com']);
        $child = Child::factory()->for($parent, 'parent')->create([
            'first_name' => 'Amara',
            'username' => 'star_coder',
            'pin_hash' => Hash::make('4826'),
        ]);

        // 4 wrong attempts increment pin_failed_attempts without locking
        for ($i = 1; $i <= 4; $i++) {
            $this->withHeader('User-Agent', 'TinkerPodTest/1.0')
                ->postJson('/api/v1/kid/login', [
                    'profile_id' => $child->public_id,
                    'pin' => '9999',
                ])
                ->assertStatus(422)
                ->assertJsonPath('data.remaining_attempts', 5 - $i);

            $this->assertSame($i, $child->fresh()->pin_failed_attempts);
            $this->assertFalse($child->fresh()->isLocked());
        }

        // 5th wrong attempt triggers 15-minute lockout + parent notification + audit log
        $fifthRes = $this->withHeader('User-Agent', 'TinkerPodTest/1.0')
            ->postJson('/api/v1/kid/login', [
                'profile_id' => $child->public_id,
                'pin' => '9999',
            ]);

        $fifthRes->assertStatus(423)
            ->assertJsonPath('message', "Let's take a short break. Ask your parent to unlock, or try again in 15 minutes.")
            ->assertJsonPath('data.lockout_minutes', 15);

        $this->assertTrue($child->fresh()->isLocked());

        Notification::assertSentTo(
            $parent,
            ChildProfileLockedNotification::class,
            static function (ChildProfileLockedNotification $notification) use ($parent, $child): bool {
                $channels = $notification->via($parent);

                return in_array('mail', $channels, true)
                    && in_array('database', $channels, true)
                    && $notification->child->id === $child->id
                    && $notification->lockoutMinutes === 15;
            }
        );

        // Even a correct PIN is blocked while locked
        $this->postJson('/api/v1/kid/login', [
            'profile_id' => $child->public_id,
            'pin' => '4826',
        ])->assertStatus(423)
            ->assertJsonPath('message', "Let's take a short break. Ask your parent to unlock, or try again in 15 minutes.");

        // Travel 16 minutes: first lockout expires; 5 more wrong attempts escalate to 60 minutes (1 hour)
        $this->travel(16)->minutes();

        for ($i = 1; $i <= 4; $i++) {
            $this->postJson('/api/v1/kid/login', [
                'profile_id' => $child->public_id,
                'pin' => '9999',
            ])->assertStatus(422);
        }

        $this->postJson('/api/v1/kid/login', [
            'profile_id' => $child->public_id,
            'pin' => '9999',
        ])->assertStatus(423)
            ->assertJsonPath('message', "Let's take a short break. Ask your parent to unlock, or try again in 1 hour.")
            ->assertJsonPath('data.lockout_minutes', 60);

        // Blocked while in 1-hour lockout states 1 hour wait time
        $this->postJson('/api/v1/kid/login', [
            'profile_id' => $child->public_id,
            'pin' => '4826',
        ])->assertStatus(423)
            ->assertJsonPath('message', "Let's take a short break. Ask your parent to unlock, or try again in 1 hour.");

        // Travel 61 minutes: second lockout expires; 5 more wrong attempts escalate to 1440 minutes (24 hours)
        $this->travel(61)->minutes();

        for ($i = 1; $i <= 4; $i++) {
            $this->postJson('/api/v1/kid/login', [
                'profile_id' => $child->public_id,
                'pin' => '9999',
            ])->assertStatus(422);
        }

        $this->postJson('/api/v1/kid/login', [
            'profile_id' => $child->public_id,
            'pin' => '9999',
        ])->assertStatus(423)
            ->assertJsonPath('message', "Let's take a short break. Ask your parent to unlock, or try again in 24 hours.")
            ->assertJsonPath('data.lockout_minutes', 1440);

        // Blocked while in 24-hour lockout states 24 hours wait time
        $this->postJson('/api/v1/kid/login', [
            'profile_id' => $child->public_id,
            'pin' => '4826',
        ])->assertStatus(423)
            ->assertJsonPath('message', "Let's take a short break. Ask your parent to unlock, or try again in 24 hours.");

        // Travel 1441 minutes and enter correct PIN -> resets failed attempts and lockout tier
        $this->travel(1441)->minutes();

        $this->postJson('/api/v1/kid/login', [
            'profile_id' => $child->public_id,
            'pin' => '4826',
        ])->assertOk();

        $freshChild = $child->fresh();
        $this->assertSame(0, $freshChild->pin_failed_attempts);
        $this->assertSame(0, $freshChild->lockout_tier);
        $this->assertNull($freshChild->locked_until);

        // Verify audit logs recorded IP and user_agent for failed, locked, and succeeded attempts
        $this->assertTrue(AuditLog::query()->where('action', 'kid.login.failed')->exists());
        $this->assertTrue(AuditLog::query()->where('action', 'kid.login.locked')->exists());
        $this->assertTrue(AuditLog::query()->where('action', 'kid.login.succeeded')->exists());

        $firstLog = AuditLog::query()->oldest('id')->firstOrFail();
        $this->assertNotNull($firstLog->ip_address);
        $this->assertSame('TinkerPodTest/1.0', $firstLog->metadata['user_agent'] ?? null);
    }

    public function test_kid_lookup_and_login_enforce_ip_independent_per_identifier_limits_and_hourly_ip_cap(): void
    {
        $parent = User::factory()->create(['email' => 'rate@example.com']);
        $child = Child::factory()->for($parent, 'parent')->create([
            'username' => 'rate_kid',
            'pin_hash' => Hash::make('4826'),
        ]);

        // 1. Per-identifier limit on kid/lookup across 10 distinct IPs succeeds, 11th from a new IP gets 429
        for ($i = 1; $i <= 10; $i++) {
            $this->withServerVariables(['REMOTE_ADDR' => "10.0.1.{$i}"])
                ->postJson('/api/v1/kid/lookup', ['identifier' => 'rate_kid'])
                ->assertOk();
        }

        $this->withServerVariables(['REMOTE_ADDR' => '10.0.1.99'])
            ->postJson('/api/v1/kid/lookup', ['identifier' => 'rate_kid'])
            ->assertStatus(429);

        // 2. Per-identifier limit on kid/login across 10 distinct IPs for the same target gets 429 on 11th
        for ($i = 1; $i <= 10; $i++) {
            $res = $this->withServerVariables(['REMOTE_ADDR' => "10.0.2.{$i}"])
                ->postJson('/api/v1/kid/login', [
                    'profile_id' => $child->public_id,
                    'pin' => '9999',
                ]);
            $this->assertContains($res->status(), [422, 423]);
        }

        $this->withServerVariables(['REMOTE_ADDR' => '10.0.2.99'])
            ->postJson('/api/v1/kid/login', [
                'profile_id' => $child->public_id,
                'pin' => '9999',
            ])
            ->assertStatus(429);

        // 3. Hourly per-IP cap (~60/hour) on kid/lookup across 4 minutes (15 req/min < 20/min per-IP limit)
        $fixedIp = '192.0.2.55';
        for ($batch = 0; $batch < 4; $batch++) {
            for ($j = 1; $j <= 15; $j++) {
                $id = sprintf('unknown_%d_%d', $batch, $j);
                $this->withServerVariables(['REMOTE_ADDR' => $fixedIp])
                    ->postJson('/api/v1/kid/lookup', ['identifier' => $id])
                    ->assertStatus(404);
            }
            $this->travel(2)->minutes();
        }

        // 61st lookup within the same hour from the same IP is throttled with 429
        $this->withServerVariables(['REMOTE_ADDR' => $fixedIp])
            ->postJson('/api/v1/kid/lookup', ['identifier' => 'unknown_61'])
            ->assertStatus(429);
    }
}
