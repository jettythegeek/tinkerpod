<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Kid;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\KidPickerProfileResource;
use App\Http\Resources\Api\V1\KidProfileResource;
use App\Models\Child;
use App\Models\User;
use App\Notifications\ChildProfileLockedNotification;
use App\Services\AuditLogger;
use App\Support\ApiResponse;
use App\Support\NigerianPhone;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class KidAuthController extends Controller
{
    public const NOT_FOUND_MESSAGE = "We couldn't find that. Ask your parent to check.";

    public const WRONG_PIN_MESSAGE = "Hmm, that PIN didn't match. Try again or ask your parent for help.";

    public const LOCKOUT_MESSAGE = "Let's take a short break. Ask your parent to unlock, or try again in 15 minutes.";

    public function lookup(Request $request): JsonResponse
    {
        $identifierInput = trim((string) $request->input('identifier', ''));
        $request->merge(['identifier' => $identifierInput]);

        /** @var array{identifier: string} $validated */
        $validated = $request->validate([
            'identifier' => ['required', 'string', 'max:191'],
        ]);

        [$mode, $children] = $this->resolveProfilesForLookup($validated['identifier']);

        if ($children->isEmpty()) {
            return ApiResponse::error(
                message: self::NOT_FOUND_MESSAGE,
                data: null,
                status: 404,
            );
        }

        $profiles = KidPickerProfileResource::collection($children)->resolve();

        return ApiResponse::success(
            message: 'Profiles found.',
            data: [
                'mode' => $mode,
                'profiles' => $profiles,
                'profile' => $mode === 'single' ? ($profiles[0] ?? null) : null,
            ],
        );
    }

    public function login(Request $request, AuditLogger $auditLogger): JsonResponse
    {
        $targetInput = trim((string) (
            $request->input('profile_id')
            ?? $request->input('child_id')
            ?? $request->input('id')
            ?? $request->input('username')
            ?? $request->input('identifier')
            ?? ''
        ));

        $request->merge(['target' => $targetInput]);

        /** @var array{target: string, pin: string} $validated */
        $validated = $request->validate([
            'target' => ['required', 'string', 'max:191'],
            'pin' => ['required', 'string', 'regex:/^\d{4,6}$/'],
        ]);

        $child = $this->resolveChildByIdOrUsername($validated['target']);

        if ($child === null) {
            $auditLogger->log(
                action: 'kid.login.failed',
                actor: null,
                subject: null,
                metadata: [
                    'target' => $validated['target'],
                    'reason' => 'unknown_profile',
                ],
                request: $request,
            );

            return ApiResponse::error(
                message: self::WRONG_PIN_MESSAGE,
                data: null,
                status: 422,
            );
        }

        if ($child->isLocked()) {
            $auditLogger->log(
                action: 'kid.login.blocked_locked',
                actor: $child,
                subject: $child,
                metadata: [
                    'locked_until' => $child->locked_until?->toIso8601String(),
                ],
                request: $request,
            );

            return ApiResponse::error(
                message: self::LOCKOUT_MESSAGE,
                data: [
                    'locked_until' => $child->locked_until?->toIso8601String(),
                ],
                status: 423,
            );
        }

        // If a previous lockout has expired, reset the attempt counter for the new cycle while keeping lockout_tier
        $maxAttempts = max(1, (int) config('tinkerpod.auth.pin_max_attempts', 5));
        if (
            $child->locked_until instanceof CarbonInterface
            && $child->locked_until->isPast()
            && $child->pin_failed_attempts >= $maxAttempts
        ) {
            $child->pin_failed_attempts = 0;
            $child->locked_until = null;
        }

        if (! Hash::check($validated['pin'], $child->pin_hash)) {
            return $this->handleFailedPinAttempt($child, $request, $auditLogger);
        }

        $child->pin_failed_attempts = 0;
        $child->lockout_tier = 0;
        $child->locked_until = null;
        $child->save();

        $ttlDays = max(1, (int) config('tinkerpod.auth.kid_token_ttl_days', 7));
        $expiresAt = now()->addDays($ttlDays);

        $token = $child->createToken('kid-mobile', ['child:*'], $expiresAt)->plainTextToken;

        $auditLogger->log(
            action: 'kid.login.succeeded',
            actor: $child,
            subject: $child,
            metadata: [
                'expires_at' => $expiresAt->toIso8601String(),
            ],
            request: $request,
        );

        return ApiResponse::success(
            message: 'Welcome back!',
            data: [
                'token' => $token,
                'token_type' => 'Bearer',
                'abilities' => ['child:*'],
                'expires_at' => $expiresAt->toIso8601String(),
                'child' => (new KidProfileResource($child))->resolve(),
            ],
        );
    }

    protected function handleFailedPinAttempt(Child $child, Request $request, AuditLogger $auditLogger): JsonResponse
    {
        $maxAttempts = max(1, (int) config('tinkerpod.auth.pin_max_attempts', 5));
        $attempts = $child->pin_failed_attempts + 1;

        if ($attempts >= $maxAttempts) {
            /** @var list<int> $schedule */
            $schedule = config('tinkerpod.auth.lockout_minutes_schedule', [15, 60, 1440]);
            $tierIndex = min($child->lockout_tier, count($schedule) - 1);
            $lockMinutes = $schedule[$tierIndex] ?? 15;

            $child->pin_failed_attempts = $attempts;
            $child->locked_until = now()->addMinutes($lockMinutes);
            $child->lockout_tier = $child->lockout_tier + 1;
            $child->save();

            $auditLogger->log(
                action: 'kid.login.locked',
                actor: $child,
                subject: $child,
                metadata: [
                    'failed_attempts' => $attempts,
                    'lockout_minutes' => $lockMinutes,
                    'lockout_tier' => $child->lockout_tier,
                    'locked_until' => $child->locked_until->toIso8601String(),
                ],
                request: $request,
            );

            $parent = $child->parent;
            if ($parent instanceof User) {
                $parent->notify(new ChildProfileLockedNotification($child, $lockMinutes));
            }

            return ApiResponse::error(
                message: self::LOCKOUT_MESSAGE,
                data: [
                    'locked_until' => $child->locked_until->toIso8601String(),
                    'lockout_minutes' => $lockMinutes,
                ],
                status: 423,
            );
        }

        $child->pin_failed_attempts = $attempts;
        $child->save();

        $auditLogger->log(
            action: 'kid.login.failed',
            actor: $child,
            subject: $child,
            metadata: [
                'failed_attempts' => $attempts,
                'remaining_attempts' => max(0, $maxAttempts - $attempts),
            ],
            request: $request,
        );

        return ApiResponse::error(
            message: self::WRONG_PIN_MESSAGE,
            data: [
                'remaining_attempts' => max(0, $maxAttempts - $attempts),
            ],
            status: 422,
        );
    }

    /**
     * @return array{0: 'single'|'picker', 1: Collection<int, Child>}
     */
    private function resolveProfilesForLookup(string $identifier): array
    {
        $normalizedPhone = NigerianPhone::normalize($identifier);

        if ($normalizedPhone !== null) {
            $parent = User::query()->where('phone', $normalizedPhone)->first();

            if ($parent === null) {
                return ['picker', new Collection];
            }

            return ['picker', $parent->children()->orderBy('created_at')->get()];
        }

        if (str_contains($identifier, '@')) {
            $parent = User::query()
                ->whereRaw('LOWER(email) = ?', [strtolower(trim($identifier))])
                ->first();

            if ($parent === null) {
                return ['picker', new Collection];
            }

            return ['picker', $parent->children()->orderBy('created_at')->get()];
        }

        $child = Child::query()
            ->whereRaw('LOWER(username) = ?', [strtolower(trim($identifier))])
            ->first();

        if ($child === null) {
            return ['single', new Collection];
        }

        return ['single', new Collection([$child])];
    }

    private function resolveChildByIdOrUsername(string $target): ?Child
    {
        $lower = strtolower(trim($target));

        return Child::query()
            ->where('public_id', $lower)
            ->orWhereRaw('LOWER(username) = ?', [$lower])
            ->first();
    }
}
