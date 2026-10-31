<?php

declare(strict_types=1);

namespace App\Filament\Resources\RewardRuleResource\Pages;

use App\Filament\Resources\RewardRuleResource;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateRewardRule extends CreateRecord
{
    protected static string $resource = RewardRuleResource::class;

    /**
     * @param  array<string, mixed>  $data
     */
    protected function handleRecordCreation(array $data): Model
    {
        return RewardRuleResource::publishNewVersion(
            eventType: (string) ($data['event_type'] ?? ''),
            xpAmount: (int) ($data['xp_amount'] ?? 0),
            coinsAmount: (int) ($data['coins_amount'] ?? 0),
            gemsAmount: (int) ($data['gems_amount'] ?? 0),
        );
    }
}
