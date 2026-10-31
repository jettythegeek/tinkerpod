<?php

declare(strict_types=1);

namespace App\Providers;

use App\Contracts\SmsSender;
use App\Domain\Learning\LearningAccess as DomainLearningAccess;
use App\Services\LearningAccess as ServiceLearningAccess;
use App\Services\Sms\LogSmsSender;
use App\Support\NigerianPhone;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(LogSmsSender::class);
        $this->app->bind(SmsSender::class, LogSmsSender::class);
        $this->app->singleton(DomainLearningAccess::class);
        $this->app->alias(DomainLearningAccess::class, ServiceLearningAccess::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('auth-register', static function (Request $request): array {
            return [
                Limit::perMinute(5)->by('auth-register-ip:'.$request->ip()),
                Limit::perHour(20)->by('auth-register-hour-ip:'.$request->ip()),
            ];
        });

        RateLimiter::for('auth-login', static function (Request $request): array {
            $identifier = strtolower(trim((string) ($request->input('identifier') ?? $request->input('email') ?? $request->input('phone') ?? '')));

            return [
                Limit::perMinute(10)->by('ip:'.$request->ip()),
                Limit::perMinute(5)->by('id:'.$identifier.'|'.$request->ip()),
            ];
        });

        RateLimiter::for('password-reset-request', static function (Request $request): array {
            $identifier = strtolower(trim((string) ($request->input('identifier') ?? $request->input('email') ?? $request->input('phone') ?? '')));

            return [
                Limit::perMinutes(10, 5)->by('pwd-req-ip:'.$request->ip()),
                Limit::perMinutes(10, 3)->by('pwd-req-id:'.$identifier),
            ];
        });

        RateLimiter::for('password-reset-verify', static function (Request $request): array {
            $identifier = strtolower(trim((string) ($request->input('identifier') ?? $request->input('email') ?? $request->input('phone') ?? '')));

            return [
                Limit::perMinutes(10, 10)->by('pwd-ver-ip:'.$request->ip()),
                Limit::perMinutes(10, 5)->by('pwd-ver-id:'.$identifier),
            ];
        });

        RateLimiter::for('kid-lookup', static function (Request $request): array {
            $raw = strtolower(trim((string) $request->input('identifier', '')));
            $identifier = NigerianPhone::normalize($raw) ?? $raw;

            return [
                Limit::perMinute(20)->by('kid-lookup-ip:'.$request->ip()),
                Limit::perHour(60)->by('kid-lookup-hour-ip:'.$request->ip()),
                Limit::perMinute(10)->by('kid-lookup-id:'.$identifier),
            ];
        });

        RateLimiter::for('kid-login', static function (Request $request): array {
            $identifier = strtolower(trim((string) (
                $request->input('profile_id')
                ?? $request->input('child_id')
                ?? $request->input('id')
                ?? $request->input('username')
                ?? $request->input('identifier')
                ?? $request->input('target')
                ?? ''
            )));

            return [
                Limit::perMinute(20)->by('kid-login-ip:'.$request->ip()),
                Limit::perMinute(10)->by('kid-login-id:'.$identifier),
            ];
        });
    }
}
