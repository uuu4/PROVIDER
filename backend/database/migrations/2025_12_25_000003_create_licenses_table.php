<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('licenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->onDelete('cascade');
            $table->string('license_key', 64)->unique();
            $table->enum('plan', ['basic', 'pro', 'enterprise'])->default('basic');
            $table->enum('status', ['active', 'suspended', 'expired', 'revoked'])->default('active');
            $table->integer('max_users')->default(10);
            $table->integer('max_products')->nullable();
            $table->date('starts_at');
            $table->date('expires_at');
            $table->text('notes')->nullable();
            $table->uuid('created_by')->nullable();
            $table->timestamps();

            $table->index(['license_key', 'status']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('licenses');
    }
};
