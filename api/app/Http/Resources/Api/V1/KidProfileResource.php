<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\Child;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Privacy-safe resource for an authenticated child session (never exposes last_name or birth_date).
 *
 * @mixin Child
 */
class KidProfileResource extends JsonResource
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
            'username' => $this->username,
            'avatar' => $this->avatar,
            'age_band' => $this->age_band,
            'theme_flag' => $this->theme_flag,
        ];
    }
}
