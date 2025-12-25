<?php

use App\Http\Controllers\Api\LicenseController;
use App\Http\Controllers\Api\UpdateController;
use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\TenantController;
use App\Http\Controllers\Api\Admin\LicenseController as AdminLicenseController;
use App\Http\Controllers\Api\Admin\ValidationLogController;
use App\Http\Controllers\Api\Admin\VersionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SaaS Provider API Routes
|--------------------------------------------------------------------------
|
| Public API for Tenant Apps to validate licenses and check updates.
| Admin API for managing tenants, licenses, and versions.
|
*/

// ========================================
// PUBLIC API (For Tenant Apps)
// ========================================

// License Validation (called by Tenant App on every request)
Route::post('/license/validate', [LicenseController::class, 'validate']);
Route::get('/license/{key}/info', [LicenseController::class, 'info']);

// Update Check (called by Tenant App)
Route::get('/updates/check', [UpdateController::class, 'check']);
Route::get('/updates/download/{version}', [UpdateController::class, 'download']);


// ========================================
// ADMIN API (Requires Authentication)
// ========================================

// Admin Authentication
Route::prefix('admin')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Protected Admin Routes
    Route::middleware('auth:sanctum')->group(function () {
        // Auth
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Tenants
        Route::apiResource('tenants', TenantController::class);

        // Licenses
        Route::get('/licenses/generate-key', [AdminLicenseController::class, 'generateKey']);
        Route::post('/licenses/{license}/extend', [AdminLicenseController::class, 'extend']);
        Route::post('/licenses/{license}/revoke', [AdminLicenseController::class, 'revoke']);
        Route::apiResource('licenses', AdminLicenseController::class);

        // Validation Logs
        Route::get('/validations', [ValidationLogController::class, 'index']);
        Route::get('/validations/stats', [ValidationLogController::class, 'stats']);

        // Versions
        Route::post('/versions/{version}/publish', [VersionController::class, 'publish']);
        Route::apiResource('versions', VersionController::class);
    });
});
