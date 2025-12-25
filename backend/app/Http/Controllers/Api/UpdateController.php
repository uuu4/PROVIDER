<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateController extends Controller
{
    /**
     * Check for available updates
     */
    public function check(Request $request): JsonResponse
    {
        $currentVersion = $request->input('current_version', '0.0.0');
        $latestVersion = AppVersion::latest();

        if (!$latestVersion) {
            return response()->json([
                'update_available' => false,
                'message' => 'No releases found',
            ]);
        }

        $updateAvailable = $latestVersion->isNewerThan($currentVersion);

        return response()->json([
            'update_available' => $updateAvailable,
            'current_version' => $currentVersion,
            'latest_version' => $latestVersion->version,
            'is_critical' => $updateAvailable && $latestVersion->is_critical,
            'release_notes' => $updateAvailable ? $latestVersion->release_notes : null,
            'download_url' => $updateAvailable ? $latestVersion->download_url : null,
            'min_php_version' => $latestVersion->min_php_version,
            'released_at' => $latestVersion->released_at?->toIso8601String(),
        ]);
    }

    /**
     * Get download URL for a specific version
     */
    public function download(string $version): JsonResponse
    {
        $appVersion = AppVersion::where('version', $version)
            ->stable()
            ->released()
            ->first();

        if (!$appVersion) {
            return response()->json([
                'error' => 'Version not found or not available',
            ], 404);
        }

        return response()->json([
            'version' => $appVersion->version,
            'download_url' => $appVersion->download_url,
            'checksum' => $appVersion->checksum,
            'git_tag' => $appVersion->git_tag,
        ]);
    }
}
