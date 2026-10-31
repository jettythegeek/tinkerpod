<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_attempts', function (Blueprint $table): void {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->foreignId('child_id')->constrained('children')->cascadeOnDelete();
            $table->foreignId('quiz_id')->constrained('quizzes')->cascadeOnDelete();
            $table->unsignedSmallInteger('attempt_number');
            $table->string('idempotency_key', 120)->nullable();
            $table->unsignedInteger('earned_points')->default(0);
            $table->unsignedInteger('total_points')->default(0);
            $table->unsignedTinyInteger('score_percent')->default(0);
            $table->boolean('passed')->default(false);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->unique(['child_id', 'quiz_id', 'attempt_number']);
            $table->unique(['child_id', 'quiz_id', 'idempotency_key']);
            $table->index(['child_id', 'quiz_id', 'submitted_at']);
        });

        Schema::create('quiz_attempt_answers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('quiz_attempt_id')->constrained('quiz_attempts')->cascadeOnDelete();
            $table->foreignId('quiz_question_id')->constrained('quiz_questions')->cascadeOnDelete();
            $table->foreignId('quiz_option_id')->constrained('quiz_options')->cascadeOnDelete();
            $table->boolean('is_correct')->default(false);
            $table->unsignedSmallInteger('points_awarded')->default(0);
            $table->timestamps();

            $table->unique(['quiz_attempt_id', 'quiz_question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_attempt_answers');
        Schema::dropIfExists('quiz_attempts');
    }
};
