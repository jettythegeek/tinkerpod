<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_progress', function (Blueprint $table): void {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->foreignId('child_id')->constrained('children')->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->unsignedInteger('resume_position_seconds')->default(0);
            $table->unsignedTinyInteger('watch_percent')->default(0);
            $table->boolean('manual_completed')->default(false);
            $table->boolean('quiz_passed')->default(false);
            $table->boolean('is_completed')->default(false);
            $table->string('completion_source', 32)->nullable();
            $table->string('completion_idempotency_key', 120)->nullable()->unique();
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['child_id', 'lesson_id']);
            $table->index(['child_id', 'is_completed']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_progress');
    }
};
