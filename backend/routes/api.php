<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TaskOrderController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes - NEAR JOB Backend
|--------------------------------------------------------------------------
*/

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Tasks & Orders (Customer & Marketplace)
Route::get('/tasks', [TaskOrderController::class, 'index']);
Route::post('/tasks', [TaskOrderController::class, 'store']);
Route::get('/tasks/{id}', [TaskOrderController::class, 'show']);

// Driver / Mitra Partner Endpoints
Route::prefix('driver')->group(function () {
    Route::post('/toggle-online', [DriverController::class, 'toggleOnline']);
    Route::get('/radar', [DriverController::class, 'radar']);
    Route::get('/active-order', [DriverController::class, 'activeOrder']);
    Route::post('/orders/{id}/accept', [DriverController::class, 'acceptOrder']);
    Route::patch('/orders/{id}/status', [DriverController::class, 'updateStatus']);
});

// Wallet & NearPay
Route::prefix('wallet')->group(function () {
    Route::get('/', [WalletController::class, 'index']);
    Route::post('/withdraw', [WalletController::class, 'withdraw']);
    Route::post('/topup', [WalletController::class, 'topup']);
});

// Admin Dashboard & Metrics
Route::prefix('admin')->group(function () {
    Route::get('/metrics', [AdminController::class, 'metrics']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::get('/orders', [AdminController::class, 'orders']);
});
