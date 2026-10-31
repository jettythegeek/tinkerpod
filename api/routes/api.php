<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Auth\ParentAuthController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\Kid\KidAuthController;
use App\Http\Controllers\Api\V1\Kid\KidCatalogueController;
use App\Http\Controllers\Api\V1\Kid\KidLessonAttachmentController;
use App\Http\Controllers\Api\V1\Kid\KidLessonProgressController;
use App\Http\Controllers\Api\V1\Kid\KidProfileController;
use App\Http\Controllers\Api\V1\Kid\KidQuizController;
use App\Http\Controllers\Api\V1\Parent\ParentChildController;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', HealthController::class)->name('api.v1.health');

    Route::prefix('auth')->group(function (): void {
        Route::post('/register', [ParentAuthController::class, 'register'])
            ->middleware('throttle:auth-register')
            ->name('api.v1.auth.register');
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

        Route::middleware(['auth:sanctum', 'parent.token'])->group(function (): void {
            Route::post('/logout', [ParentAuthController::class, 'logout'])->name('api.v1.auth.logout');
            Route::get('/me', [ParentAuthController::class, 'me'])->name('api.v1.auth.me');
        });
    });

    Route::prefix('parent')
        ->middleware(['auth:sanctum', 'parent.token'])
        ->group(function (): void {
            Route::get('/children', [ParentChildController::class, 'index'])->name('api.v1.parent.children.index');
            Route::post('/children', [ParentChildController::class, 'store'])->name('api.v1.parent.children.store');
            Route::get('/children/{child}', [ParentChildController::class, 'show'])->name('api.v1.parent.children.show');
            Route::match(['put', 'patch'], '/children/{child}', [ParentChildController::class, 'update'])->name('api.v1.parent.children.update');
            Route::match(['post', 'put', 'patch'], '/children/{child}/pin', [ParentChildController::class, 'updatePin'])->name('api.v1.parent.children.pin');
            Route::match(['post', 'put', 'patch'], '/children/{child}/username', [ParentChildController::class, 'updateUsername'])->name('api.v1.parent.children.username');
            Route::post('/children/{child}/unlock', [ParentChildController::class, 'unlock'])->name('api.v1.parent.children.unlock');
            Route::delete('/children/{child}', [ParentChildController::class, 'destroy'])->name('api.v1.parent.children.destroy');
        });

    Route::prefix('billing')
        ->middleware(['auth:sanctum', 'parent.token'])
        ->group(function (): void {
            Route::get('/status', static fn () => ApiResponse::success(
                data: ['status' => 'none'],
                message: 'Billing status retrieved.',
            ))->name('api.v1.billing.status');
        });

    Route::prefix('kid')->group(function (): void {
        Route::post('/lookup', [KidAuthController::class, 'lookup'])
            ->middleware('throttle:kid-lookup')
            ->name('api.v1.kid.lookup');
        Route::post('/login', [KidAuthController::class, 'login'])
            ->middleware('throttle:kid-login')
            ->name('api.v1.kid.login');

        Route::middleware(['auth:sanctum', 'child.token'])->group(function (): void {
            Route::get('/me', [KidProfileController::class, 'me'])->name('api.v1.kid.me');
            Route::match(['put', 'patch'], '/username', [KidProfileController::class, 'updateUsername'])->name('api.v1.kid.username');

            Route::get('/home', [KidCatalogueController::class, 'home'])->name('api.v1.kid.home');
            Route::get('/journey-map', [KidCatalogueController::class, 'journeyMap'])->name('api.v1.kid.journey-map');
            Route::get('/pods/{pod}/journey-map', [KidCatalogueController::class, 'podJourneyMap'])->name('api.v1.kid.pods.journey-map');
            Route::get('/lessons/{lesson}', [KidCatalogueController::class, 'lessonDetail'])->name('api.v1.kid.lessons.show');
            Route::put('/lessons/{lesson}/progress', [KidLessonProgressController::class, 'update'])->name('api.v1.kid.lessons.progress.update');
            Route::get('/lessons/{lesson}/quiz', [KidCatalogueController::class, 'lessonQuiz'])->name('api.v1.kid.lessons.quiz');
            Route::get('/quizzes/{quiz}', [KidCatalogueController::class, 'quizDetail'])->name('api.v1.kid.quizzes.show');
            Route::post('/quizzes/{quiz}/check', [KidQuizController::class, 'check'])->name('api.v1.kid.quizzes.check');
            Route::post('/quizzes/{quiz}/attempts', [KidQuizController::class, 'attempts'])->name('api.v1.kid.quizzes.attempts');
            Route::post('/quizzes/{quiz}/attempts/{attempt}/finish', [KidQuizController::class, 'finishAttempt'])->name('api.v1.kid.quizzes.attempts.finish');

            Route::post('/lessons/{lesson}/attachments/{attachment}/signed-url', [KidLessonAttachmentController::class, 'signedUrlForLessonAttachment'])
                ->name('api.v1.kid.lessons.attachments.signed-url');
            Route::post('/attachments/{attachment}/signed-url', [KidLessonAttachmentController::class, 'signedUrl'])
                ->name('api.v1.kid.attachments.signed-url');
        });

        Route::get('/attachments/{attachment}/download', [KidLessonAttachmentController::class, 'download'])
            ->name('api.v1.kid.attachments.download');
    });
});
