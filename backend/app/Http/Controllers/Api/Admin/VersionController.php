<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VersionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AppVersion::query();

        if ($request->boolean('stable_only')) {
            $query->stable();
        }

        $versions = $query->orderByDesc('released_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($versions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'version' => 'required|string|max:20|unique:app_versions',
            'git_tag' => 'nullable|string|max:50',
            'release_notes' => 'nullable|string',
            'changelog' => 'nullable|string',
            'download_url' => 'nullable|url',
            'checksum' => 'nullable|string|max:128',
            'is_stable' => 'boolean',
            'is_critical' => 'boolean',
            'min_php_version' => 'nullable|string|max:10',
        ]);

        $validated['released_at'] = $request->boolean('publish_now') ? now() : null;
        $validated['released_by'] = $request->user()->id;

        $version = AppVersion::create($validated);

        return response()->json([
            'message' => 'Version created successfully',
            'version' => $version,
        ], 201);
    }

    public function show(AppVersion $version): JsonResponse
    {
        return response()->json($version);
    }

    public function update(Request $request, AppVersion $version): JsonResponse
    {
        $validated = $request->validate([
            'release_notes' => 'nullable|string',
            'changelog' => 'nullable|string',
            'download_url' => 'nullable|url',
            'checksum' => 'nullable|string|max:128',
            'is_stable' => 'boolean',
            'is_critical' => 'boolean',
            'min_php_version' => 'nullable|string|max:10',
        ]);

        $version->update($validated);

        return response()->json([
            'message' => 'Version updated successfully',
            'version' => $version->fresh(),
        ]);
    }

    public function publish(AppVersion $version): JsonResponse
    {
        $version->update([
            'released_at' => now(),
            'is_stable' => true,
        ]);

        return response()->json([
            'message' => 'Version published successfully',
            'version' => $version->fresh(),
        ]);
    }

    public function destroy(AppVersion $version): JsonResponse
    {
        if ($version->released_at) {
            return response()->json([
                'error' => 'Cannot delete a published version',
            ], 400);
        }

        $version->delete();

        return response()->json([
            'message' => 'Version deleted successfully',
        ]);
    }
}
