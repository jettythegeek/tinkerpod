<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Kid;

use App\Domain\Rewards\RewardService;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\KidProfileResource;
use App\Models\Child;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KidRewardsController extends Controller
{
    public function rewards(Request $request, RewardService $rewardService): JsonResponse
    {
        $child = $this->requireChild($request);
        $child->loadMissing('streak');

        return ApiResponse::success(
            message: 'Kid rewards HUD retrieved.',
            data: [
                'rewards' => $rewardService->hudSummaryFor($child),
            ],
        );
    }

    public function profile(Request $request, RewardService $rewardService): JsonResponse
    {
        $child = $this->requireChild($request);
        $child->loadMissing('streak');

        $summary = $rewardService->profileSummaryFor($child);

        return ApiResponse::success(
            message: 'Kid profile and rewards summary retrieved.',
            data: [
                'child' => (new KidProfileResource($child))->resolve(),
                'profile' => $summary,
            ],
        );
    }

    private function requireChild(Request $request): Child
    {
        $actor = $request->user();
        if (! $actor instanceof Child || ! $actor->tokenCan('child:*')) {
            throw new AuthorizationException('Child authentication is required for this endpoint.');
        }

        return $actor;
    }
}
