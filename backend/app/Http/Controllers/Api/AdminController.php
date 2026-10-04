<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\TaskOrder;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function metrics()
    {
        $totalUsers = User::count();
        $totalCustomers = User::where('role', 'customer')->count();
        $totalDrivers = User::where('role', 'driver')->count();
        $activeDrivers = User::where('role', 'driver')->where('is_online', true)->count();
        
        $totalOrders = TaskOrder::count();
        $completedOrders = TaskOrder::where('status', 'COMPLETED')->count();
        $totalGrossVolume = TaskOrder::where('status', 'COMPLETED')->sum('budget');
        $totalCommissionEarned = TaskOrder::where('status', 'COMPLETED')->sum('commission_amount');

        return response()->json([
            'success' => true,
            'data' => [
                'total_users' => $totalUsers,
                'total_customers' => $totalCustomers,
                'total_drivers' => $totalDrivers,
                'active_drivers_online' => $activeDrivers,
                'total_orders' => $totalOrders,
                'completed_orders' => $completedOrders,
                'gross_merchandise_volume' => $totalGrossVolume,
                'total_platform_commission' => $totalCommissionEarned,
            ]
        ]);
    }

    public function users(Request $request)
    {
        $query = User::orderBy('created_at', 'desc');

        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(20),
        ]);
    }

    public function orders(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => TaskOrder::with(['customer', 'driver'])->orderBy('created_at', 'desc')->paginate(20),
        ]);
    }
}
