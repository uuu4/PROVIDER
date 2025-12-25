<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('license_validations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('license_id')->constrained()->onDelete('cascade');
            $table->string('ip_address', 45);
            $table->text('user_agent')->nullable();
            $table->string('domain')->nullable();
            $table->string('app_version')->nullable();
            $table->string('php_version')->nullable();
            $table->enum('status', ['success', 'failed', 'expired', 'revoked', 'invalid'])->default('success');
            $table->text('response')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('validated_at');
            $table->timestamps();

            $table->index(['license_id', 'validated_at']);
            $table->index('ip_address');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('license_validations');
    }
};
