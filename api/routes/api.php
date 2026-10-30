<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Auth\ParentAuthController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\Kid\KidAuthController;
use App\Http\Controllers\Api\V1\Kid\KidProfileController;
use App\Http\Controllers\Api\V1\Parent\ParentChildController;
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

    Route::prefix('parent')
        ->middleware(['auth:sanctum', 'ability:parent:*'])
        ->group(function (): void {
            Route::get('/children', [ParentChildController::class, 'index'])->name('api.v1.parent.children.index');
            Route::post('/children', [ParentChildController::class, 'store'])->name('api.v1.parent.children.store');
            Route::get('/children/{child}', [ParentChildController::class, 'show'])->name('api.v1.parent.children.show');
            Route::match(['put', 'patch'], '/children/{child}', [ParentChildController::class, 'update'])->name('api.v1.parent.children.update');
            Route::delete('/children/{child}', [ParentChildController::class, 'destroy'])->name('api.v1.parent.children.destroy');
        });

    Route::prefix('kid')->group(function (): void {
        Route::post('/lookup', [KidAuthController::class, 'lookup'])
            ->middleware('throttle:kid-lookup')
            ->name('api.v1.kid.lookup');
        Route::post('/login', [KidAuthController::class, 'login'])
            ->middleware('throttle:kid-login')
            ->name('api.v1.kid.login');

        Route::middleware(['auth:sanctum', 'ability:child:*'])->group(function (): void {
            Route::get('/me', [KidProfileController::class, 'me'])->name('api.v1.kid.me');
            Route::match(['put', 'patch'], '/username', [KidProfileController::class, 'updateUsername'])->name('api.v1.kid.username');
            Route::match(['put', 'patch'], '/profile/username', [KidProfileController::class, 'updateUsername']);
        });
    });
});
