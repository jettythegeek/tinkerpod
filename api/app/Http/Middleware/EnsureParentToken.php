<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Enums\RoleName;
use App\Models\User;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureParentToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $actor = Auth::guard('sanctum')->user();

        if ($actor === null) {
            throw new AuthenticationException('Unauthenticated.');
        }

        if (! $actor instanceof User || ! $actor->tokenCan('parent:*')) {
            throw new AuthorizationException('Parent authorization is required for this route.');
        }

        if ($actor->roles()->exists() && ! $actor->hasRole(RoleName::Parent->value)) {
            throw new AuthorizationException('Parent role is required for this route.');
        }

        return $next($request);
    }
}
