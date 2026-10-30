<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Child;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureChildToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $actor = Auth::guard('sanctum')->user();

        if ($actor === null) {
            throw new AuthenticationException('Unauthenticated.');
        }

        if (! $actor instanceof Child || ! $actor->tokenCan('child:*')) {
            throw new AuthorizationException('Child authorization is required for this route.');
        }

        return $next($request);
    }
}
