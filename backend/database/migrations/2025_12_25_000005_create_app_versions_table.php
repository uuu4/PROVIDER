<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('version', 20)->unique();
            $table->string('git_tag')->nullable();
            $table->text('release_notes')->nullable();
            $table->text('changelog')->nullable();
            $table->string('download_url')->nullable();
            $table->string('checksum')->nullable();
            $table->boolean('is_stable')->default(false);
            $table->boolean('is_critical')->default(false);
            $table->string('min_php_version')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->uuid('released_by')->nullable();
            $table->timestamps();

            $table->index(['is_stable', 'released_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_versions');
    }
};
