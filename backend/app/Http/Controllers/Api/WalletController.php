<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WalletController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->input('user_id', 'usr-worker-siti');
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User tidak ditemukan'], 404);
        }

        $transactions = WalletTransaction::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->take(30)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'balance' => $user->balance,
                'pending_balance' => 0,
                'transactions' => $transactions,
            ]
        ]);
    }

    public function withdraw(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|string',
            'amount' => 'required|integer|min:10000',
            'bank' => 'required|string',
            'account_number' => 'required|string',
        ]);

        $userId = $validated['user_id'] ?? 'usr-worker-siti';
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User tidak ditemukan'], 404);
        }

        if ($user->balance < $validated['amount']) {
            return response()->json([
                'success' => false,
                'message' => 'Saldo tidak mencukupi untuk penarikan',
            ], 400);
        }

        $user->balance -= $validated['amount'];
        $user->save();

        $tx = WalletTransaction::create([
            'id' => 'tx-' . Str::random(10),
            'user_id' => $user->id,
            'type' => 'WITHDRAW',
            'amount' => $validated['amount'],
            'description' => "Pencairan Dana ke {$validated['bank']} ({$validated['account_number']})",
            'status' => 'SUCCESS',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Penarikan saldo berhasil diproses',
            'data' => [
                'current_balance' => $user->balance,
                'transaction' => $tx,
            ]
        ]);
    }

    public function topup(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|string',
            'amount' => 'required|integer|min:10000',
        ]);

        $user = User::find($validated['user_id']);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User tidak ditemukan'], 404);
        }

        $user->balance += $validated['amount'];
        $user->save();

        $tx = WalletTransaction::create([
            'id' => 'tx-' . Str::random(10),
            'user_id' => $user->id,
            'type' => 'TOPUP',
            'amount' => $validated['amount'],
            'description' => 'Top Up Saldo NearPay',
            'status' => 'SUCCESS',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Top up berhasil',
            'data' => [
                'balance' => $user->balance,
                'transaction' => $tx,
            ]
        ]);
    }
}
