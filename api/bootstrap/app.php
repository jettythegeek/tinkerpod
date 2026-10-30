<?php

declare(strict_types=1);

use App\Http\Middleware\EnsureChildToken;
use App\Http\Middleware\EnsureParentToken;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Http\Middleware\CheckAbilities;
use Laravel\Sanctum\Http\Middleware\CheckForAnyAbility;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'abilities' => CheckAbilities::class,
            'ability' => CheckForAnyAbility::class,
            'parent.token' => EnsureParentToken::class,
            'child.token' => EnsureChildToken::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request): bool => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            if ($e instanceof ValidationException) {
                return ApiResponse::error(
                    message: $e->getMessage(),
                    data: ['errors' => $e->errors()],
                    status: $e->status,
                );
            }

            if ($e instanceof AuthenticationException) {
                return ApiResponse::error(
                    message: 'Unauthenticated.',
                    data: null,
                    status: 401,
                );
            }

            if ($e instanceof AuthorizationException) {
                return ApiResponse::error(
                    message: $e->getMessage() !== '' ? $e->getMessage() : 'Forbidden.',
                    data: null,
                    status: 403,
                );
            }

            if ($e instanceof HttpExceptionInterface) {
                $status = $e->getStatusCode();
                $message = $e->getMessage() !== ''
                    ? $e->getMessage()
                    : ($status === 404 ? 'Resource not found.' : 'Request failed.');

                return ApiResponse::error(
                    message: $message,
                    data: null,
                    status: $status,
                );
            }

            return ApiResponse::error(
                message: 'Server error.',
                data: null,
                status: 500,
            );
        });
    })->create();
