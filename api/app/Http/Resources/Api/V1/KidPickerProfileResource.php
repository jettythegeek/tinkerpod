<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\Child;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Strictly privacy-safe resource for kid lookup & profile picker:
 * exposes ONLY public id, first_name, and avatar.
 *
 * @mixin Child
 */
class KidPickerProfileResource extends JsonResource
{
    /**
     * @return array{id: string, first_name: string, avatar: string}
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->public_id,
            'first_name' => $this->first_name,
            'avatar' => $this->avatar,
        ];
    }
}
