<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('children', function (Blueprint $table): void {
            $table->id();
            $table->ulid('public_id')->unique();
            $table->foreignId('parent_id')->constrained('users')->cascadeOnDelete();
            $table->string('first_name', 80);
            $table->string('last_name', 80)->nullable();
            $table->date('birth_date')->nullable();
            $table->string('age_band', 16)->default('junior');
            $table->string('theme_flag', 16)->default('junior');
            $table->string('avatar', 64)->default('av1.png');
            $table->string('username', 20)->unique();
            $table->string('pin_hash');
            $table->unsignedTinyInteger('pin_failed_attempts')->default(0);
            $table->unsignedTinyInteger('lockout_tier')->default(0);
            $table->timestamp('locked_until')->nullable()->index();
            $table->timestamps();

            $table->index(['parent_id', 'created_at']);
            $table->index('age_band');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('children');
    }
};
