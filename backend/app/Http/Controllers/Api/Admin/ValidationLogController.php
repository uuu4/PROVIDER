<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\LicenseValidation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ValidationLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = LicenseValidation::with('license.tenant');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('license_id')) {
            $query->where('license_id', $request->input('license_id'));
        }

        if ($request->filled('ip_address')) {
            $query->where('ip_address', $request->input('ip_address'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('validated_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('validated_at', '<=', $request->input('date_to'));
        }

        $logs = $query->orderByDesc('validated_at')
            ->paginate($request->input('per_page', 50));

        return response()->json($logs);
    }

    public function stats(): JsonResponse
    {
        $now = now();

        return response()->json([
            'today' => [
                'total' => LicenseValidation::whereDate('validated_at', $now->toDateString())->count(),
                'success' => LicenseValidation::successful()->whereDate('validated_at', $now->toDateString())->count(),
                'failed' => LicenseValidation::failed()->whereDate('validated_at', $now->toDateString())->count(),
            ],
            'last_7_days' => [
                'total' => LicenseValidation::where('validated_at', '>=', $now->subDays(7))->count(),
                'success' => LicenseValidation::successful()->where('validated_at', '>=', $now->subDays(7))->count(),
                'failed' => LicenseValidation::failed()->where('validated_at', '>=', $now->subDays(7))->count(),
            ],
            'by_status' => LicenseValidation::selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'top_ips' => LicenseValidation::selectRaw('ip_address, count(*) as count')
                ->groupBy('ip_address')
                ->orderByDesc('count')
                ->limit(10)
                ->pluck('count', 'ip_address'),
        ]);
    }
}
