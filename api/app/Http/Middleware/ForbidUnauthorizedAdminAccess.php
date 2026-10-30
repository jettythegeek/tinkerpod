<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Enums\PermissionName;
use App\Models\Child;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ForbidUnauthorizedAdminAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('admin/login') || $request->is('admin/logout')) {
            return $next($request);
        }

        $actor = Auth::guard('web')->user() ?? Auth::guard('sanctum')->user();

        if ($actor instanceof Child) {
            abort(403, 'Child accounts cannot access the admin panel.');
        }

        if ($actor instanceof User && ! $actor->can(PermissionName::AccessAdminPanel->value)) {
            abort(403, 'You do not have permission to access the admin panel.');
        }

        return $next($request);
    }
}
