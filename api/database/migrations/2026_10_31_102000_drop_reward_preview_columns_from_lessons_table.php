<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table): void {
            $table->dropColumn([
                'reward_xp_preview',
                'reward_coins_preview',
                'reward_gems_preview',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table): void {
            $table->unsignedInteger('reward_xp_preview')->default(50);
            $table->unsignedInteger('reward_coins_preview')->default(20);
            $table->unsignedInteger('reward_gems_preview')->default(0);
        });
    }
};
