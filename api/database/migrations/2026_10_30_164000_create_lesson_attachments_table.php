<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_attachments', function (Blueprint $table): void {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->string('title', 160);
            $table->string('disk', 40)->default('local');
            $table->string('storage_path', 255);
            $table->string('original_filename', 255);
            $table->string('mime_type', 120)->default('application/octet-stream');
            $table->unsignedBigInteger('size_bytes')->default(0);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['lesson_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_attachments');
    }
};
