<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('naija_titles', function (Blueprint $table): void {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->string('slug', 64)->unique();
            $table->string('name', 120);
            $table->unsignedInteger('min_level')->default(1);
            $table->unsignedInteger('sort_order')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('reward_levels', function (Blueprint $table): void {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->unsignedInteger('level_number')->unique();
            $table->unsignedInteger('xp_required')->default(0);
            $table->foreignId('naija_title_id')->nullable()->constrained('naija_titles')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('reward_rules', function (Blueprint $table): void {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->string('event_type', 64);
            $table->unsignedInteger('version')->default(1);
            $table->integer('xp_amount')->default(0);
            $table->integer('coins_amount')->default(0);
            $table->integer('gems_amount')->default(0);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['event_type', 'version']);
            $table->index(['event_type', 'is_active']);
        });

        Schema::create('badges', function (Blueprint $table): void {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->string('slug', 64)->unique();
            $table->string('name', 120);
            $table->string('description', 255)->nullable();
            $table->string('icon', 64)->default('award');
            $table->string('color', 32)->default('#7C3AED');
            $table->string('condition_type', 64);
            $table->unsignedInteger('condition_value')->default(1);
            $table->unsignedInteger('sort_order')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('child_badges', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('child_id')->constrained('children')->cascadeOnDelete();
            $table->foreignId('badge_id')->constrained('badges')->cascadeOnDelete();
            $table->foreignId('ledger_id')->nullable()->constrained('reward_ledger')->nullOnDelete();
            $table->timestamp('earned_at')->useCurrent();

            $table->unique(['child_id', 'badge_id']);
        });

        Schema::create('streak_settings', function (Blueprint $table): void {
            $table->id();
            $table->unsignedInteger('grace_days')->default(1);
            $table->string('timezone', 64)->default('Africa/Lagos');
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();
        });

        Schema::create('child_streaks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('child_id')->unique()->constrained('children')->cascadeOnDelete();
            $table->unsignedInteger('current_streak')->default(0);
            $table->unsignedInteger('best_streak')->default(0);
            $table->date('last_active_date')->nullable();
            $table->unsignedInteger('grace_days_used')->default(0);
            $table->boolean('is_paused')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('child_streaks');
        Schema::dropIfExists('streak_settings');
        Schema::dropIfExists('child_badges');
        Schema::dropIfExists('badges');
        Schema::dropIfExists('reward_rules');
        Schema::dropIfExists('reward_levels');
        Schema::dropIfExists('naija_titles');
    }
};
