<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\License;
use App\Models\LicenseValidation;
use App\Models\AppVersion;
use Illuminate\Http\Request;

class LicenseValidationService
{
    public function validate(string $licenseKey, Request $request): array
    {
        $license = License::with('tenant')->where('license_key', $licenseKey)->first();

        if (!$license) {
            $this->logValidation(null, $request, 'invalid', 'License key not found');
            return $this->errorResponse('invalid', 'Invalid license key');
        }

        if (!$license->tenant->is_active) {
            $this->logValidation($license, $request, 'failed', 'Tenant is deactivated');
            return $this->errorResponse('failed', 'Tenant account is deactivated');
        }

        if ($license->status === 'revoked') {
            $this->logValidation($license, $request, 'revoked', 'License has been revoked');
            return $this->errorResponse('revoked', 'License has been revoked');
        }

        if ($license->status === 'suspended') {
            $this->logValidation($license, $request, 'failed', 'License is suspended');
            return $this->errorResponse('suspended', 'License is suspended');
        }

        if ($license->isExpired()) {
            $this->logValidation($license, $request, 'expired', 'License has expired');
            return $this->errorResponse('expired', 'License has expired', [
                'expired_at' => $license->expires_at->toDateString(),
            ]);
        }

        if (!$license->starts_at->isPast()) {
            $this->logValidation($license, $request, 'failed', 'License not yet active');
            return $this->errorResponse('failed', 'License is not yet active', [
                'starts_at' => $license->starts_at->toDateString(),
            ]);
        }

        // Success
        $this->logValidation($license, $request, 'success');

        $latestVersion = AppVersion::latest();

        return [
            'valid' => true,
            'license' => [
                'plan' => $license->plan,
                'max_users' => $license->max_users,
                'max_products' => $license->max_products,
                'starts_at' => $license->starts_at->toDateString(),
                'expires_at' => $license->expires_at->toDateString(),
                'days_remaining' => $license->daysUntilExpiration(),
            ],
            'tenant' => [
                'id' => $license->tenant->id,
                'company_name' => $license->tenant->company_name,
                'domain' => $license->tenant->domain,
            ],
            'update_available' => $latestVersion && $latestVersion->isNewerThan($request->input('app_version', '0.0.0')),
            'latest_version' => $latestVersion?->version,
        ];
    }

    private function logValidation(?License $license, Request $request, string $status, ?string $errorMessage = null): void
    {
        LicenseValidation::create([
            'license_id' => $license?->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'domain' => $request->input('domain'),
            'app_version' => $request->input('app_version'),
            'php_version' => $request->input('php_version'),
            'status' => $status,
            'response' => $status === 'success' ? 'License validated successfully' : null,
            'error_message' => $errorMessage,
            'validated_at' => now(),
        ]);
    }

    private function errorResponse(string $status, string $message, array $extra = []): array
    {
        return array_merge([
            'valid' => false,
            'status' => $status,
            'message' => $message,
        ], $extra);
    }
}
