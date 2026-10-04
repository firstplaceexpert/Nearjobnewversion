<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaskOrder;
use App\Models\OrderTracking;
use App\Models\WalletTransaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TaskOrderController extends Controller
{
    /**
     * Hitung komisi dinamis:
     * - Budget >= 1.000.000: komisi 9%
     * - Budget < 1.000.000: komisi 10%
     */
    private function calculateCommission(int $budget): array
    {
        $rate = $budget >= 1000000 ? 0.09 : 0.10;
        $commissionAmount = (int) round($budget * $rate);
        $netAmount = $budget - $commissionAmount;

        return [
            'rate' => $rate,
            'commission' => $commissionAmount,
            'net' => $netAmount,
        ];
    }

    public function index(Request $request)
    {
        $query = TaskOrder::with(['customer', 'driver'])->orderBy('created_at', 'desc');

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('service_type') && $request->service_type) {
            $query->where('service_type', $request->service_type);
        }

        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        $orders = $query->paginate($request->get('limit', 20));

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'service_type' => 'nullable|in:near_ride,near_send,near_food,near_clean,task_custom',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'pickup_address' => 'required|string',
            'pickup_lat' => 'nullable|numeric',
            'pickup_lng' => 'nullable|numeric',
            'destination_address' => 'nullable|string',
            'destination_lat' => 'nullable|numeric',
            'destination_lng' => 'nullable|numeric',
            'distance_km' => 'nullable|numeric',
            'budget' => 'required|integer|min:10000',
            'customer_id' => 'required|string',
            'schedule_date' => 'nullable|date',
            'schedule_time' => 'nullable|string',
        ]);

        $comm = $this->calculateCommission($validated['budget']);
        $orderId = 'ord-' . Str::random(10);

        $order = TaskOrder::create([
            'id' => $orderId,
            'service_type' => $validated['service_type'] ?? 'task_custom',
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? 'Umum',
            'pickup_address' => $validated['pickup_address'],
            'pickup_lat' => $validated['pickup_lat'] ?? -6.2088,
            'pickup_lng' => $validated['pickup_lng'] ?? 106.8456,
            'destination_address' => $validated['destination_address'] ?? null,
            'destination_lat' => $validated['destination_lat'] ?? null,
            'destination_lng' => $validated['destination_lng'] ?? null,
            'distance_km' => $validated['distance_km'] ?? 2.5,
            'budget' => $validated['budget'],
            'commission_rate' => $comm['rate'],
            'commission_amount' => $comm['commission'],
            'net_amount' => $comm['net'],
            'status' => 'PENDING',
            'customer_id' => $validated['customer_id'],
            'schedule_date' => $validated['schedule_date'] ?? now()->toDateString(),
            'schedule_time' => $validated['schedule_time'] ?? now()->format('H:i'),
        ]);

        OrderTracking::create([
            'order_id' => $order->id,
            'status' => 'PENDING',
            'title' => 'Pesanan Dibuat',
            'description' => 'Mencari mitra driver/pekerja di sekitar lokasi jemput.',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibuat',
            'data' => $order->load(['customer', 'trackings']),
        ], 201);
    }

    public function show($id)
    {
        $order = TaskOrder::with(['customer', 'driver', 'trackings'])->find($id);

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Pesanan tidak ditemukan'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }
}
