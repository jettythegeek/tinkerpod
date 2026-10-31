<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reward_ledger', function (Blueprint $table): void {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->foreignId('child_id')->constrained('children')->cascadeOnDelete();
            $table->string('currency', 16);
            $table->integer('amount');
            $table->string('source_type', 64);
            $table->string('source_id', 128);
            $table->unsignedInteger('rule_version')->default(1);
            $table->string('reason', 255)->nullable();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('idempotency_key', 191)->unique();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['child_id', 'currency', 'created_at']);
            $table->index(['child_id', 'source_type', 'source_id']);
        });

        Schema::create('reward_balances', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('child_id')->constrained('children')->cascadeOnDelete();
            $table->string('currency', 16);
            $table->integer('balance')->default(0);
            $table->timestamp('updated_at')->useCurrent();

            $table->unique(['child_id', 'currency']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reward_balances');
        Schema::dropIfExists('reward_ledger');
    }
};
