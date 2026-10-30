<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Contracts\SmsSender;
use App\Enums\RoleName;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ParentUserResource;
use App\Mail\PasswordResetCodeMail;
use App\Models\PasswordResetCode;
use App\Models\User;
use App\Support\ApiResponse;
use App\Support\NigerianPhone;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class ParentAuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $rawPhone = (string) $request->input('phone', '');
        $normalizedPhone = NigerianPhone::normalize($rawPhone);

        $request->merge([
            'email' => strtolower(trim((string) $request->input('email', ''))),
            'phone' => $normalizedPhone ?? $rawPhone,
        ]);

        /** @var array{name: string, email: string, phone: string, password: string} $validated */
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:191', 'unique:users,email'],
            'phone' => [
                'required',
                'string',
                static function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! is_string($value) || ! NigerianPhone::isValid($value)) {
                        $fail('Please enter a valid Nigerian phone number (e.g. 0803..., 234803..., or +234803...).');
                    }
                },
                'unique:users,phone',
            ],
            'password' => ['required', 'string', 'min:8', 'max:128'],
        ]);

        $canonicalPhone = NigerianPhone::normalize($validated['phone']);

        Role::findOrCreate(RoleName::Parent->value, 'web');

        $user = User::query()->create([
            'name' => trim($validated['name']),
            'email' => $validated['email'],
            'phone' => $canonicalPhone,
            'password' => $validated['password'],
        ]);

        $user->assignRole(RoleName::Parent->value);

        $token = $user->createToken('parent-mobile', ['parent:*'])->plainTextToken;

        return ApiResponse::success(
            message: 'Account created successfully.',
            data: [
                'token' => $token,
                'token_type' => 'Bearer',
                'abilities' => ['parent:*'],
                'user' => (new ParentUserResource($user))->resolve(),
            ],
            status: 201,
        );
    }

    public function login(Request $request): JsonResponse
    {
        $identifierInput = trim((string) ($request->input('identifier') ?? $request->input('email') ?? $request->input('phone') ?? ''));

        $request->merge(['identifier' => $identifierInput]);

        /** @var array{identifier: string, password: string} $validated */
        $validated = $request->validate([
            'identifier' => ['required', 'string', 'max:191'],
            'password' => ['required', 'string'],
        ]);

        $user = $this->resolveParentByIdentifier($validated['identifier']);

        if ($user === null || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'identifier' => ['These sign-in details do not match our records.'],
            ]);
        }

        if (! $user->hasRole(RoleName::Parent->value)) {
            Role::findOrCreate(RoleName::Parent->value, 'web');
            $user->assignRole(RoleName::Parent->value);
        }

        $token = $user->createToken('parent-mobile', ['parent:*'])->plainTextToken;

        return ApiResponse::success(
            message: 'Signed in successfully.',
            data: [
                'token' => $token,
                'token_type' => 'Bearer',
                'abilities' => ['parent:*'],
                'user' => (new ParentUserResource($user))->resolve(),
            ],
        );
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $this->requireParentUser($request);

        $user->currentAccessToken()->delete();

        return ApiResponse::success(
            message: 'Signed out successfully.',
            data: null,
        );
    }

    public function me(Request $request): JsonResponse
    {
        $user = $this->requireParentUser($request);

        return ApiResponse::success(
            message: 'Authenticated parent profile.',
            data: [
                'user' => (new ParentUserResource($user))->resolve(),
            ],
        );
    }

    public function requestPasswordReset(Request $request, SmsSender $smsSender): JsonResponse
    {
        $identifierInput = trim((string) ($request->input('identifier') ?? $request->input('email') ?? $request->input('phone') ?? ''));
        $request->merge(['identifier' => $identifierInput]);

        /** @var array{identifier: string, channel?: string} $validated */
        $validated = $request->validate([
            'identifier' => ['required', 'string', 'max:191'],
            'channel' => ['nullable', 'string', 'in:email,phone'],
        ]);

        $normalizedPhone = NigerianPhone::normalize($validated['identifier']);
        $channel = $validated['channel'] ?? ($normalizedPhone !== null ? 'phone' : 'email');

        $user = $this->resolveParentByIdentifier($validated['identifier']);

        if ($user !== null) {
            $ttlMinutes = max(1, (int) config('tinkerpod.auth.password_reset_ttl_minutes', 10));
            $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            $targetIdentifier = $channel === 'phone'
                ? (string) ($user->phone ?? $normalizedPhone ?? '')
                : strtolower($user->email);

            if ($targetIdentifier !== '') {
                PasswordResetCode::query()
                    ->where('user_id', $user->id)
                    ->where('channel', $channel)
                    ->whereNull('consumed_at')
                    ->update(['consumed_at' => now()]);

                PasswordResetCode::query()->create([
                    'user_id' => $user->id,
                    'channel' => $channel,
                    'identifier' => $targetIdentifier,
                    'code_hash' => Hash::make($code),
                    'attempts' => 0,
                    'expires_at' => now()->addMinutes($ttlMinutes),
                ]);

                if ($channel === 'phone' && $user->phone !== null) {
                    $smsSender->send(
                        $user->phone,
                        sprintf('Your TinkerPod password reset code is %s. Valid for %d minutes.', $code, $ttlMinutes),
                    );
                } else {
                    Mail::to($user->email)->send(new PasswordResetCodeMail($code, $ttlMinutes));
                }
            }
        }

        return ApiResponse::success(
            message: 'If an account matches those details, we have sent a 6-digit reset code.',
            data: null,
        );
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $identifierInput = trim((string) ($request->input('identifier') ?? $request->input('email') ?? $request->input('phone') ?? ''));
        $request->merge(['identifier' => $identifierInput]);

        /** @var array{identifier: string, code: string, password: string} $validated */
        $validated = $request->validate([
            'identifier' => ['required', 'string', 'max:191'],
            'code' => ['required', 'string', 'regex:/^\d{6}$/'],
            'password' => ['required', 'string', 'min:8', 'max:128'],
        ]);

        $user = $this->resolveParentByIdentifier($validated['identifier']);

        if ($user === null) {
            throw ValidationException::withMessages([
                'code' => ['Invalid or expired reset code.'],
            ]);
        }

        /** @var PasswordResetCode|null $resetRecord */
        $resetRecord = PasswordResetCode::query()
            ->where('user_id', $user->id)
            ->whereNull('consumed_at')
            ->where('expires_at', '>', now())
            ->where('attempts', '<', 5)
            ->latest('id')
            ->first();

        if ($resetRecord === null) {
            throw ValidationException::withMessages([
                'code' => ['Invalid or expired reset code.'],
            ]);
        }

        if (! Hash::check($validated['code'], $resetRecord->code_hash)) {
            $resetRecord->increment('attempts');

            throw ValidationException::withMessages([
                'code' => ['Invalid or expired reset code.'],
            ]);
        }

        $resetRecord->update(['consumed_at' => now()]);

        $user->update([
            'password' => $validated['password'],
        ]);

        $user->tokens()->delete();

        return ApiResponse::success(
            message: 'Password has been reset successfully.',
            data: null,
        );
    }

    private function resolveParentByIdentifier(string $identifier): ?User
    {
        $normalizedPhone = NigerianPhone::normalize($identifier);

        if ($normalizedPhone !== null) {
            return User::query()->where('phone', $normalizedPhone)->first();
        }

        return User::query()
            ->whereRaw('LOWER(email) = ?', [strtolower(trim($identifier))])
            ->first();
    }

    private function requireParentUser(Request $request): User
    {
        $user = $request->user();

        if (! $user instanceof User || ! $user->tokenCan('parent:*')) {
            throw new AuthorizationException('Parent authentication is required for this endpoint.');
        }

        return $user;
    }
}
