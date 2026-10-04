<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaskOrder;
use App\Models\OrderTracking;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DriverController extends Controller
{
    public function toggleOnline(Request $request)
    {
        $driverId = $request->input('driver_id', 'usr-worker-siti');
        $driver = User::find($driverId);

        if (!$driver) {
            return response()->json(['success' => false, 'message' => 'Driver tidak ditemukan'], 404);
        }

        $driver->is_online = $request->boolean('is_online', !$driver->is_online);
        $driver->save();

        return response()->json([
            'success' => true,
            'message' => $driver->is_online ? 'Status Siap Kerja (ONLINE)' : 'Status Istirahat (OFFLINE)',
            'data' => [
                'is_online' => $driver->is_online,
                'driver' => $driver,
            ]
        ]);
    }

    public function radar(Request $request)
    {
        $orders = TaskOrder::where('status', 'PENDING')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    public function acceptOrder(Request $request, $id)
    {
        $driverId = $request->input('driver_id', 'usr-worker-siti');
        $order = TaskOrder::find($id);

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order tidak ditemukan'], 404);
        }

        if ($order->status !== 'PENDING') {
            return response()->json(['success' => false, 'message' => 'Order sudah diambil oleh mitra lain'], 400);
        }

        $order->status = 'ACCEPTED';
        $order->driver_id = $driverId;
        $order->save();

        OrderTracking::create([
            'order_id' => $order->id,
            'status' => 'ACCEPTED',
            'title' => 'Mitra Mengambil Pesanan',
            'description' => 'Driver telah menerima pekerjaan ini dan bersiap.',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order berhasil diterima',
            'data' => $order->load(['customer', 'driver', 'trackings']),
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:OTW,ARRIVED,WORKING,COMPLETED,CANCELLED',
            'note' => 'nullable|string',
        ]);

        $order = TaskOrder::find($id);

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order tidak ditemukan'], 404);
        }

        $order->status = $validated['status'];
        $order->save();

        $titles = [
            'OTW' => 'Mitra Sedang Menuju Lokasi',
            'ARRIVED' => 'Mitra Sudah Tiba di Lokasi',
            'WORKING' => 'Pekerjaan Sedang Berlangsung',
            'COMPLETED' => 'Pekerjaan Telah Selesai',
            'CANCELLED' => 'Pesanan Dibatalkan',
        ];

        OrderTracking::create([
            'order_id' => $order->id,
            'status' => $order->status,
            'title' => $titles[$order->status] ?? $order->status,
            'description' => $validated['note'] ?? null,
        ]);

        // Jika selesai, transfer penghasilan bersih ke dompet mitra driver
        if ($order->status === 'COMPLETED' && $order->driver_id) {
            $driver = User::find($order->driver_id);
            if ($driver) {
                $driver->balance += $order->net_amount;
                $driver->points += 15;
                $driver->save();

                WalletTransaction::create([
                    'id' => 'tx-' . Str::random(10),
                    'user_id' => $driver->id,
                    'type' => 'RECEIVE',
                    'amount' => $order->net_amount,
                    'description' => 'Pendapatan Bersih: ' . $order->title,
                    'reference_id' => $order->id,
                    'status' => 'SUCCESS',
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Status berhasil diperbarui',
            'data' => $order->load(['customer', 'driver', 'trackings']),
        ]);
    }

    public function activeOrder(Request $request)
    {
        $driverId = $request->input('driver_id', 'usr-worker-siti');
        $order = TaskOrder::with(['customer', 'trackings'])
            ->where('driver_id', $driverId)
            ->whereIn('status', ['ACCEPTED', 'OTW', 'ARRIVED', 'WORKING'])
            ->first();

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }
}
