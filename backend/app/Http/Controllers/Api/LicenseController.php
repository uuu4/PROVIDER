<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LicenseValidationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LicenseController extends Controller
{
    public function __construct(
        private readonly LicenseValidationService $validationService
    ) {}

    /**
     * Validate a license key (called by Tenant App)
     */
    public function validate(Request $request): JsonResponse
    {
        $licenseKey = $request->header('X-License-Key') ?? $request->input('license_key');

        if (empty($licenseKey)) {
            return response()->json([
                'valid' => false,
                'status' => 'invalid',
                'message' => 'License key is required',
            ], 400);
        }

        $result = $this->validationService->validate($licenseKey, $request);

        $statusCode = $result['valid'] ? 200 : match ($result['status'] ?? 'failed') {
            'invalid' => 404,
            'expired' => 402,
            'revoked' => 403,
            'suspended' => 403,
            default => 400,
        };

        return response()->json($result, $statusCode);
    }

    /**
     * Get license info (called by Tenant App)
     */
    public function info(Request $request, string $key): JsonResponse
    {
        $license = \App\Models\License::with('tenant')
            ->where('license_key', $key)
            ->first();

        if (!$license) {
            return response()->json([
                'error' => 'License not found',
            ], 404);
        }

        return response()->json([
            'license_key' => $license->license_key,
            'plan' => $license->plan,
            'status' => $license->status,
            'max_users' => $license->max_users,
            'max_products' => $license->max_products,
            'starts_at' => $license->starts_at->toDateString(),
            'expires_at' => $license->expires_at->toDateString(),
            'is_valid' => $license->isValid(),
            'days_remaining' => $license->daysUntilExpiration(),
            'tenant' => [
                'company_name' => $license->tenant->company_name,
                'domain' => $license->tenant->domain,
            ],
        ]);
    }
}
