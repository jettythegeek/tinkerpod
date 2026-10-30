<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Auth\ParentAuthController;
use App\Http\Controllers\Api\V1\HealthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', HealthController::class)->name('api.v1.health');

    Route::prefix('auth')->group(function (): void {
        Route::post('/register', [ParentAuthController::class, 'register'])->name('api.v1.auth.register');
        Route::post('/login', [ParentAuthController::class, 'login'])
            ->middleware('throttle:auth-login')
            ->name('api.v1.auth.login');

        Route::post('/password/forgot', [ParentAuthController::class, 'requestPasswordReset'])
            ->middleware('throttle:password-reset-request')
            ->name('api.v1.auth.password.forgot');
        Route::post('/forgot-password', [ParentAuthController::class, 'requestPasswordReset'])
            ->middleware('throttle:password-reset-request');

        Route::post('/password/reset', [ParentAuthController::class, 'resetPassword'])
            ->middleware('throttle:password-reset-verify')
            ->name('api.v1.auth.password.reset');
        Route::post('/reset-password', [ParentAuthController::class, 'resetPassword'])
            ->middleware('throttle:password-reset-verify');

        Route::middleware(['auth:sanctum', 'ability:parent:*'])->group(function (): void {
            Route::post('/logout', [ParentAuthController::class, 'logout'])->name('api.v1.auth.logout');
            Route::get('/me', [ParentAuthController::class, 'me'])->name('api.v1.auth.me');
        });
    });
});
