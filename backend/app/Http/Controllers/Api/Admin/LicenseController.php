<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\License;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LicenseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = License::with('tenant');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('license_key', 'like', "%{$search}%")
                  ->orWhereHas('tenant', function ($t) use ($search) {
                      $t->where('company_name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('plan')) {
            $query->where('plan', $request->input('plan'));
        }

        if ($request->filled('tenant_id')) {
            $query->where('tenant_id', $request->input('tenant_id'));
        }

        $licenses = $query->orderByDesc('created_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($licenses);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tenant_id' => 'required|uuid|exists:tenants,id',
            'plan' => 'required|in:basic,pro,enterprise',
            'max_users' => 'nullable|integer|min:1',
            'max_products' => 'nullable|integer|min:1',
            'starts_at' => 'required|date',
            'expires_at' => 'required|date|after:starts_at',
            'notes' => 'nullable|string',
        ]);

        $validated['created_by'] = $request->user()->id;

        $license = License::create($validated);

        return response()->json([
            'message' => 'License created successfully',
            'license' => $license->load('tenant'),
        ], 201);
    }

    public function show(License $license): JsonResponse
    {
        $license->load(['tenant', 'validations' => function ($query) {
            $query->orderByDesc('validated_at')->limit(20);
        }]);

        return response()->json([
            'license' => $license,
            'validation_count' => $license->validations()->count(),
            'success_rate' => $this->calculateSuccessRate($license),
        ]);
    }

    public function update(Request $request, License $license): JsonResponse
    {
        $validated = $request->validate([
            'plan' => 'sometimes|in:basic,pro,enterprise',
            'status' => 'sometimes|in:active,suspended',
            'max_users' => 'nullable|integer|min:1',
            'max_products' => 'nullable|integer|min:1',
            'expires_at' => 'sometimes|date',
            'notes' => 'nullable|string',
        ]);

        $license->update($validated);

        return response()->json([
            'message' => 'License updated successfully',
            'license' => $license->fresh()->load('tenant'),
        ]);
    }

    public function extend(Request $request, License $license): JsonResponse
    {
        $validated = $request->validate([
            'days' => 'required|integer|min:1|max:365',
        ]);

        $license->update([
            'expires_at' => $license->expires_at->addDays($validated['days']),
        ]);

        return response()->json([
            'message' => "License extended by {$validated['days']} days",
            'license' => $license->fresh()->load('tenant'),
        ]);
    }

    public function revoke(License $license): JsonResponse
    {
        $license->update([
            'status' => 'revoked',
        ]);

        return response()->json([
            'message' => 'License revoked successfully',
            'license' => $license->fresh()->load('tenant'),
        ]);
    }

    public function generateKey(): JsonResponse
    {
        return response()->json([
            'license_key' => License::generateLicenseKey(),
        ]);
    }

    private function calculateSuccessRate(License $license): float
    {
        $total = $license->validations()->count();
        if ($total === 0) {
            return 100.0;
        }

        $successful = $license->validations()->successful()->count();
        return round(($successful / $total) * 100, 2);
    }
}
