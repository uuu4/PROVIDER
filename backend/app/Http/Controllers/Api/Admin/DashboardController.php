<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\License;
use App\Models\LicenseValidation;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $now = now();

        return response()->json([
            'stats' => [
                'total_tenants' => Tenant::count(),
                'active_tenants' => Tenant::where('is_active', true)->count(),
                'total_licenses' => License::count(),
                'active_licenses' => License::active()->count(),
                'expiring_soon' => License::expiringSoon(30)->count(),
                'validations_today' => LicenseValidation::whereDate('validated_at', $now->toDateString())->count(),
                'failed_validations_today' => LicenseValidation::failed()
                    ->whereDate('validated_at', $now->toDateString())
                    ->count(),
            ],
            'recent_validations' => LicenseValidation::with('license.tenant')
                ->orderByDesc('validated_at')
                ->limit(10)
                ->get()
                ->map(fn ($v) => [
                    'id' => $v->id,
                    'license_key' => $v->license?->license_key,
                    'tenant' => $v->license?->tenant?->company_name,
                    'status' => $v->status,
                    'ip_address' => $v->ip_address,
                    'validated_at' => $v->validated_at->toIso8601String(),
                ]),
            'expiring_licenses' => License::with('tenant')
                ->expiringSoon(30)
                ->orderBy('expires_at')
                ->limit(5)
                ->get()
                ->map(fn ($l) => [
                    'id' => $l->id,
                    'license_key' => $l->license_key,
                    'tenant' => $l->tenant->company_name,
                    'plan' => $l->plan,
                    'expires_at' => $l->expires_at->toDateString(),
                    'days_remaining' => $l->daysUntilExpiration(),
                ]),
        ]);
    }
}
