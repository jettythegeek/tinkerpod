<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domain\Rewards\RewardService;
use Illuminate\Database\Seeder;

class RewardsSeeder extends Seeder
{
    public function run(): void
    {
        RewardService::ensureDefaultsSeeded();
    }
}
