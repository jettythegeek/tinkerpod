<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\Child;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Child
 */
class ParentChildResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->public_id,
            'public_id' => $this->public_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'birth_date' => $this->birth_date?->format('Y-m-d'),
            'age_band' => $this->age_band,
            'theme_flag' => $this->theme_flag,
            'avatar' => $this->avatar,
            'username' => $this->username,
            'pin_failed_attempts' => $this->pin_failed_attempts,
            'is_locked' => $this->isLocked(),
            'locked_until' => $this->locked_until?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
