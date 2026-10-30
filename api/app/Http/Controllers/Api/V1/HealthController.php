<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

final class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        DB::connection()->getPdo();

        return ApiResponse::success(
            data: [
                'service' => 'tinkerpod-api',
                'version' => 'v1',
                'status' => 'ok',
                'database' => 'connected',
                'timezone' => (string) config('app.timezone', 'Africa/Lagos'),
                'timestamp' => now()->toIso8601String(),
            ],
            message: 'TinkerPod API is healthy.',
        );
    }
}
