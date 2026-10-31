<?php

declare(strict_types=1);

namespace App\Filament\Resources\RewardRuleResource\Pages;

use App\Filament\Resources\RewardRuleResource;
use App\Models\RewardRule;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;

class EditRewardRule extends EditRecord
{
    protected static string $resource = RewardRuleResource::class;

    /**
     * Editing a reward rule publishes a new version so historical ledger rows retain their original rule_version.
     *
     * @param  array<string, mixed>  $data
     */
    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        /** @var RewardRule $rule */
        $rule = $record;

        return RewardRuleResource::publishNewVersion(
            eventType: (string) ($data['event_type'] ?? $rule->event_type),
            xpAmount: (int) ($data['xp_amount'] ?? $rule->xp_amount),
            coinsAmount: (int) ($data['coins_amount'] ?? $rule->coins_amount),
            gemsAmount: (int) ($data['gems_amount'] ?? $rule->gems_amount),
        );
    }
}
