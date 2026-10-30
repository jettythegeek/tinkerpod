<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Kid;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\KidProfileResource;
use App\Models\Child;
use App\Rules\ChildUsernameRule;
use App\Services\AuditLogger;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class KidProfileController extends Controller
{
    public function me(): JsonResponse
    {
        $child = $this->requireChild();

        return ApiResponse::success(
            message: 'Kid profile retrieved.',
            data: [
                'child' => (new KidProfileResource($child))->resolve(),
            ],
        );
    }

    public function updateUsername(Request $request, AuditLogger $auditLogger): JsonResponse
    {
        $child = $this->requireChild();

        $request->merge([
            'username' => strtolower(trim((string) $request->input('username', ''))),
        ]);

        /** @var array{username: string} $validated */
        $validated = $request->validate([
            'username' => [
                'required',
                new ChildUsernameRule($child->first_name, $child->last_name, $child->id),
            ],
        ]);

        $previousUsername = $child->username;
        $child->username = $validated['username'];
        $child->save();

        $auditLogger->log(
            action: 'child.username.updated',
            actor: $child,
            subject: $child,
            metadata: [
                'old_username' => $previousUsername,
                'new_username' => $child->username,
                'source' => 'kid.self',
            ],
            request: $request,
        );

        return ApiResponse::success(
            message: 'Your new username is ready!',
            data: [
                'child' => (new KidProfileResource($child))->resolve(),
            ],
        );
    }

    private function requireChild(): Child
    {
        $user = Auth::guard('sanctum')->user();

        if (! $user instanceof Child || ! $user->tokenCan('child:*')) {
            throw new AuthorizationException('Kid authentication is required for this endpoint.');
        }

        return $user;
    }
}
