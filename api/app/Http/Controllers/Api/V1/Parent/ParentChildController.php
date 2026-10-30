<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Parent;

use App\Enums\ApprovedAvatar;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ParentChildResource;
use App\Models\Child;
use App\Models\User;
use App\Rules\ChildPinRule;
use App\Rules\ChildUsernameRule;
use App\Services\AuditLogger;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ParentChildController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $parent = $this->requireParentUser($request);
        Gate::forUser($parent)->authorize('viewAny', Child::class);

        $children = $parent->children()
            ->orderBy('created_at')
            ->get();

        return ApiResponse::success(
            message: 'Children profiles retrieved.',
            data: [
                'children' => ParentChildResource::collection($children)->resolve(),
            ],
        );
    }

    public function store(Request $request, AuditLogger $auditLogger): JsonResponse
    {
        $parent = $this->requireParentUser($request);
        Gate::forUser($parent)->authorize('create', Child::class);

        $normalizedAvatar = ApprovedAvatar::normalize((string) $request->input('avatar', ApprovedAvatar::Av1->value));

        $request->merge([
            'username' => strtolower(trim((string) $request->input('username', ''))),
            'avatar' => $normalizedAvatar ?? $request->input('avatar'),
        ]);

        /** @var array{
         *     first_name: string,
         *     last_name?: string|null,
         *     birth_date?: string|null,
         *     age_band?: string|null,
         *     theme_flag?: string|null,
         *     avatar: string,
         *     username: string,
         *     pin: string
         * } $validated
         */
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'min:1', 'max:80'],
            'last_name' => ['nullable', 'string', 'max:80'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'age_band' => ['nullable', 'string', 'in:junior,senior'],
            'theme_flag' => ['nullable', 'string', 'in:junior,senior'],
            'avatar' => ['required', 'string', Rule::in(ApprovedAvatar::values())],
            'username' => $this->usernameRules(
                firstName: (string) $request->input('first_name', ''),
                lastName: (string) $request->input('last_name', ''),
            ),
            'pin' => ['required', new ChildPinRule],
        ]);

        $resolvedBand = $validated['age_band']
            ?? Child::resolveBandForBirthDate($validated['birth_date'] ?? null);
        $resolvedTheme = $validated['theme_flag'] ?? $resolvedBand;

        $child = $parent->children()->create([
            'first_name' => trim($validated['first_name']),
            'last_name' => isset($validated['last_name']) && trim($validated['last_name']) !== ''
                ? trim($validated['last_name'])
                : null,
            'birth_date' => $validated['birth_date'] ?? null,
            'age_band' => $resolvedBand,
            'theme_flag' => $resolvedTheme,
            'avatar' => $validated['avatar'],
            'username' => $validated['username'],
            'pin_hash' => Hash::make((string) $validated['pin']),
            'pin_failed_attempts' => 0,
            'lockout_tier' => 0,
            'locked_until' => null,
        ]);

        $auditLogger->log(
            action: 'child.pin.set',
            actor: $parent,
            subject: $child,
            metadata: ['source' => 'parent.create'],
            request: $request,
        );

        $auditLogger->log(
            action: 'child.username.set',
            actor: $parent,
            subject: $child,
            metadata: ['new_username' => $child->username, 'source' => 'parent.create'],
            request: $request,
        );

        return ApiResponse::success(
            message: 'Child profile created.',
            data: [
                'child' => (new ParentChildResource($child))->resolve(),
            ],
            status: 201,
        );
    }

    public function show(Request $request, Child $child): JsonResponse
    {
        $parent = $this->requireParentUser($request);
        Gate::forUser($parent)->authorize('view', $child);

        return ApiResponse::success(
            message: 'Child profile retrieved.',
            data: [
                'child' => (new ParentChildResource($child))->resolve(),
            ],
        );
    }

    public function update(Request $request, Child $child, AuditLogger $auditLogger): JsonResponse
    {
        $parent = $this->requireParentUser($request);
        Gate::forUser($parent)->authorize('update', $child);

        if ($request->has('avatar')) {
            $normalizedAvatar = ApprovedAvatar::normalize((string) $request->input('avatar', ''));
            $request->merge(['avatar' => $normalizedAvatar ?? $request->input('avatar')]);
        }

        if ($request->has('username')) {
            $request->merge(['username' => strtolower(trim((string) $request->input('username', '')))]);
        }

        $effectiveFirstName = (string) ($request->input('first_name') ?? $child->first_name);
        $effectiveLastName = (string) ($request->input('last_name') ?? $child->last_name ?? '');

        /** @var array<string, mixed> $validated */
        $validated = $request->validate([
            'first_name' => ['sometimes', 'required', 'string', 'min:1', 'max:80'],
            'last_name' => ['sometimes', 'nullable', 'string', 'max:80'],
            'birth_date' => ['sometimes', 'nullable', 'date', 'before:today'],
            'age_band' => ['sometimes', 'required', 'string', 'in:junior,senior'],
            'theme_flag' => ['sometimes', 'required', 'string', 'in:junior,senior'],
            'avatar' => ['sometimes', 'required', 'string', Rule::in(ApprovedAvatar::values())],
            'username' => array_merge(
                ['sometimes'],
                $this->usernameRules($effectiveFirstName, $effectiveLastName, $child->id),
            ),
        ]);

        if (array_key_exists('birth_date', $validated) && ! array_key_exists('age_band', $validated)) {
            $band = Child::resolveBandForBirthDate(is_string($validated['birth_date']) ? $validated['birth_date'] : null);
            $validated['age_band'] = $band;
            if (! array_key_exists('theme_flag', $validated)) {
                $validated['theme_flag'] = $band;
            }
        }

        $previousUsername = $child->username;

        $child->fill($validated);
        $child->save();

        if ($child->username !== $previousUsername) {
            $auditLogger->log(
                action: 'child.username.updated',
                actor: $parent,
                subject: $child,
                metadata: [
                    'old_username' => $previousUsername,
                    'new_username' => $child->username,
                    'source' => 'parent.update',
                ],
                request: $request,
            );
        }

        return ApiResponse::success(
            message: 'Child profile updated.',
            data: [
                'child' => (new ParentChildResource($child))->resolve(),
            ],
        );
    }

    public function updatePin(Request $request, Child $child, AuditLogger $auditLogger): JsonResponse
    {
        $parent = $this->requireParentUser($request);
        Gate::forUser($parent)->authorize('updatePin', $child);

        /** @var array{pin: string} $validated */
        $validated = $request->validate([
            'pin' => ['required', new ChildPinRule],
        ]);

        $child->pin_hash = Hash::make((string) $validated['pin']);
        $child->pin_failed_attempts = 0;
        $child->lockout_tier = 0;
        $child->locked_until = null;
        $child->save();

        $auditLogger->log(
            action: 'child.pin.updated',
            actor: $parent,
            subject: $child,
            metadata: ['source' => 'parent.pin_control'],
            request: $request,
        );

        return ApiResponse::success(
            message: 'Child PIN updated successfully.',
            data: [
                'child' => (new ParentChildResource($child))->resolve(),
            ],
        );
    }

    public function updateUsername(Request $request, Child $child, AuditLogger $auditLogger): JsonResponse
    {
        $parent = $this->requireParentUser($request);
        Gate::forUser($parent)->authorize('updateUsername', $child);

        $request->merge([
            'username' => strtolower(trim((string) $request->input('username', ''))),
        ]);

        /** @var array{username: string} $validated */
        $validated = $request->validate([
            'username' => $this->usernameRules($child->first_name, $child->last_name, $child->id),
        ]);

        $previousUsername = $child->username;
        $child->username = $validated['username'];
        $child->save();

        $auditLogger->log(
            action: 'child.username.updated',
            actor: $parent,
            subject: $child,
            metadata: [
                'old_username' => $previousUsername,
                'new_username' => $child->username,
                'source' => 'parent.username_control',
            ],
            request: $request,
        );

        return ApiResponse::success(
            message: 'Child username updated successfully.',
            data: [
                'child' => (new ParentChildResource($child))->resolve(),
            ],
        );
    }

    public function unlock(Request $request, Child $child, AuditLogger $auditLogger): JsonResponse
    {
        $parent = $this->requireParentUser($request);
        Gate::forUser($parent)->authorize('unlock', $child);

        $wasLocked = $child->isLocked();
        $previousAttempts = $child->pin_failed_attempts;

        $child->pin_failed_attempts = 0;
        $child->lockout_tier = 0;
        $child->locked_until = null;
        $child->save();

        $auditLogger->log(
            action: 'child.profile.unlocked',
            actor: $parent,
            subject: $child,
            metadata: [
                'was_locked' => $wasLocked,
                'previous_failed_attempts' => $previousAttempts,
            ],
            request: $request,
        );

        return ApiResponse::success(
            message: 'Child profile unlocked.',
            data: [
                'child' => (new ParentChildResource($child))->resolve(),
            ],
        );
    }

    public function destroy(Request $request, Child $child): JsonResponse
    {
        $parent = $this->requireParentUser($request);
        Gate::forUser($parent)->authorize('delete', $child);

        $child->tokens()->delete();
        $child->delete();

        return ApiResponse::success(
            message: 'Child profile removed.',
            data: null,
        );
    }

    /**
     * @return list<mixed>
     */
    protected function usernameRules(string $firstName, ?string $lastName, ?int $ignoreChildId = null): array
    {
        return [
            'required',
            new ChildUsernameRule($firstName, $lastName, $ignoreChildId),
        ];
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
