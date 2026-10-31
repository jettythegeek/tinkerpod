<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pods', function (Blueprint $table): void {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->string('slug', 120)->unique();
            $table->string('title', 160);
            $table->text('description')->nullable();
            $table->string('icon', 64)->default('code-xml');
            $table->string('age_band', 16)->default('all');
            $table->string('status', 24)->default('draft');
            $table->boolean('is_demo')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'sort_order']);
        });

        Schema::create('tracks', function (Blueprint $table): void {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->foreignId('pod_id')->constrained('pods')->cascadeOnDelete();
            $table->string('slug', 120)->unique();
            $table->string('title', 160);
            $table->text('description')->nullable();
            $table->string('age_band', 16)->default('all');
            $table->string('status', 24)->default('draft');
            $table->boolean('is_demo')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->index(['pod_id', 'status', 'sort_order']);
        });

        Schema::create('courses', function (Blueprint $table): void {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->foreignId('track_id')->constrained('tracks')->cascadeOnDelete();
            $table->foreignId('pod_id')->constrained('pods')->cascadeOnDelete();
            $table->string('slug', 120)->unique();
            $table->string('title', 160);
            $table->text('description')->nullable();
            $table->string('difficulty', 32)->default('Beginner');
            $table->string('status', 24)->default('draft');
            $table->boolean('is_demo')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->index(['track_id', 'status', 'sort_order']);
            $table->index(['pod_id', 'status', 'sort_order']);
        });

        Schema::create('worlds', function (Blueprint $table): void {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->foreignId('pod_id')->constrained('pods')->cascadeOnDelete();
            $table->foreignId('course_id')->nullable()->constrained('courses')->nullOnDelete();
            $table->string('slug', 120)->unique();
            $table->string('title', 160);
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('world_number')->default(1);
            $table->string('icon', 64)->default('globe');
            $table->unsignedSmallInteger('map_x')->default(195);
            $table->unsignedSmallInteger('map_y')->default(400);
            $table->string('status', 24)->default('draft');
            $table->boolean('is_demo')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->index(['pod_id', 'status', 'sort_order']);
            $table->index(['course_id', 'status', 'sort_order']);
        });

        Schema::create('modules', function (Blueprint $table): void {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('world_id')->nullable()->constrained('worlds')->nullOnDelete();
            $table->string('slug', 120)->unique();
            $table->string('title', 160);
            $table->text('description')->nullable();
            $table->string('status', 24)->default('draft');
            $table->boolean('is_demo')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->index(['course_id', 'status', 'sort_order']);
            $table->index(['world_id', 'status', 'sort_order']);
        });

        Schema::create('lessons', function (Blueprint $table): void {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->foreignId('world_id')->constrained('worlds')->cascadeOnDelete();
            $table->string('slug', 120)->unique();
            $table->unsignedSmallInteger('lesson_number')->default(1);
            $table->string('title', 160);
            $table->text('summary')->nullable();
            $table->longText('body')->nullable();
            $table->json('learning_objectives')->nullable();
            $table->string('thumbnail_asset', 120)->nullable();
            $table->string('intro_video_url', 255)->nullable();
            $table->unsignedInteger('intro_video_duration_seconds')->default(80);
            $table->unsignedSmallInteger('duration_minutes')->default(8);
            $table->string('difficulty', 32)->default('Beginner');
            $table->unsignedSmallInteger('steps_count')->default(5);
            $table->string('completion_mode', 24)->default('manual');
            $table->unsignedTinyInteger('required_watch_percent')->default(80);
            $table->unsignedInteger('reward_xp_preview')->default(80);
            $table->unsignedInteger('reward_coins_preview')->default(40);
            $table->unsignedInteger('reward_gems_preview')->default(2);
            $table->string('status', 24)->default('draft');
            $table->boolean('is_demo')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->index(['world_id', 'status', 'sort_order']);
            $table->index(['module_id', 'status', 'sort_order']);
        });

        Schema::create('quizzes', function (Blueprint $table): void {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->string('title', 160);
            $table->text('description')->nullable();
            $table->unsignedTinyInteger('pass_mark_percent')->default(70);
            $table->unsignedSmallInteger('max_attempts')->default(3);
            $table->string('status', 24)->default('draft');
            $table->boolean('is_demo')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->index(['lesson_id', 'status', 'sort_order']);
        });

        Schema::create('quiz_questions', function (Blueprint $table): void {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->foreignId('quiz_id')->constrained('quizzes')->cascadeOnDelete();
            $table->unsignedSmallInteger('question_number')->default(1);
            $table->text('prompt');
            $table->text('code_snippet')->nullable();
            $table->text('hint')->nullable();
            $table->text('explanation');
            $table->unsignedSmallInteger('points')->default(10);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['quiz_id', 'sort_order']);
        });

        Schema::create('quiz_options', function (Blueprint $table): void {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->foreignId('quiz_question_id')->constrained('quiz_questions')->cascadeOnDelete();
            $table->string('option_key', 8);
            $table->text('label');
            $table->boolean('is_correct')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['quiz_question_id', 'option_key']);
            $table->index(['quiz_question_id', 'sort_order']);
        });

        Schema::create('projects', function (Blueprint $table): void {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->string('title', 160);
            $table->text('description')->nullable();
            $table->longText('instructions')->nullable();
            $table->text('starter_code')->nullable();
            $table->string('language', 32)->default('python');
            $table->unsignedSmallInteger('steps_count')->default(5);
            $table->string('status', 24)->default('draft');
            $table->boolean('is_demo')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->index(['lesson_id', 'status', 'sort_order']);
        });

        Schema::create('publication_logs', function (Blueprint $table): void {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->string('publishable_type', 160);
            $table->string('publishable_id', 64);
            $table->string('from_status', 24)->nullable();
            $table->string('to_status', 24);
            $table->string('actor_type', 160)->nullable();
            $table->string('actor_id', 64)->nullable();
            $table->foreignId('audit_log_id')->nullable()->constrained('audit_logs')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['publishable_type', 'publishable_id', 'occurred_at'], 'pub_logs_subject_occurred_idx');
            $table->index(['to_status', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('publication_logs');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('quiz_options');
        Schema::dropIfExists('quiz_questions');
        Schema::dropIfExists('quizzes');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('modules');
        Schema::dropIfExists('worlds');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('tracks');
        Schema::dropIfExists('pods');
    }
};
