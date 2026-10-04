<?php

/**
 * NEAR JOB — Laravel Backend API Entrypoint
 * Menyediakan router RESTful standar untuk Web Next.js & Mobile React Native.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Inisialisasi Database SQLite
$dbDir = __DIR__ . '/../database';
if (!is_dir($dbDir)) {
    mkdir($dbDir, 0755, true);
}
$dbPath = $dbDir . '/database.sqlite';
$pdo = new PDO("sqlite:" . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

// Buat Skema Tabel jika belum ada
$pdo->exec("
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        avatar TEXT,
        balance INTEGER DEFAULT 0,
        rating REAL DEFAULT 5.0,
        is_online INTEGER DEFAULT 0,
        vehicle TEXT,
        plate_number TEXT,
        points INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS task_orders (
        id TEXT PRIMARY KEY,
        service_type TEXT DEFAULT 'task_custom',
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'Umum',
        pickup_address TEXT NOT NULL,
        pickup_lat REAL,
        pickup_lng REAL,
        destination_address TEXT,
        destination_lat REAL,
        destination_lng REAL,
        distance_km REAL DEFAULT 1.0,
        budget INTEGER NOT NULL,
        commission_rate REAL DEFAULT 0.10,
        commission_amount INTEGER DEFAULT 0,
        net_amount INTEGER DEFAULT 0,
        status TEXT DEFAULT 'PENDING',
        customer_id TEXT NOT NULL,
        driver_id TEXT,
        schedule_date TEXT,
        schedule_time TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wallet_transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        description TEXT NOT NULL,
        reference_id TEXT,
        status TEXT DEFAULT 'SUCCESS',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_trackings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        status TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
");

// Seed data awal jika tabel users masih kosong
$userCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
if ($userCount == 0) {
    $now = date('Y-m-d H:i:s');
    $hash = password_hash('password123', PASSWORD_BCRYPT);
    
    // 1. Customer Budi
    $pdo->prepare("INSERT INTO users (id, name, email, phone, password, role, balance, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        ->execute(['usr-customer-budi', 'Budi Santoso', 'budi@nearjob.id', '0812-3456-7890', $hash, 'customer', 500000, $now]);
    
    // 2. Driver Siti
    $pdo->prepare("INSERT INTO users (id, name, email, phone, password, role, balance, rating, is_online, vehicle, plate_number, points, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        ->execute(['usr-worker-siti', 'Siti Rahma', 'siti@nearjob.id', '0812-9988-7722', $hash, 'driver', 820000, 4.98, 1, 'Honda Beat eSP 110cc', 'B 3819 TZG', 80, $now]);

    // 3. Admin
    $pdo->prepare("INSERT INTO users (id, name, email, phone, password, role, balance, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        ->execute(['usr-admin-nearjob', 'Administrator NEAR JOB', 'admin@nearjob.id', '0811-0000-1111', $hash, 'admin', 0, $now]);

    // Sample Orders
    $pdo->prepare("INSERT INTO task_orders (id, service_type, title, description, category, pickup_address, pickup_lat, pickup_lng, destination_address, destination_lat, destination_lng, distance_km, budget, commission_rate, commission_amount, net_amount, status, customer_id, driver_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        ->execute([
            'tsk-active-sample',
            'near_ride',
            'Antar Dokumen Kontrak & Jemput Klien',
            'Antar berkas legalitas dari SCBD ke Menteng.',
            'Logistik & Kurir',
            'Equity Tower SCBD, Senayan',
            -6.2255,
            106.8080,
            'Menteng Central, Jakarta Pusat',
            -6.1950,
            106.8320,
            3.2,
            75000,
            0.10,
            7500,
            67500,
            'ACCEPTED',
            'usr-customer-budi',
            'usr-worker-siti',
            $now
        ]);

    $pdo->prepare("INSERT INTO order_trackings (order_id, status, title, description, created_at) VALUES (?, ?, ?, ?, ?)")
        ->execute(['tsk-active-sample', 'ACCEPTED', 'Driver Menerima Order', 'Mitra Siti Rahma sedang menuju lokasi jemput.', $now]);
}

// Router Sederhana
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];
$body = json_decode(file_get_contents('php://input'), true) ?? [];

// Helper Response
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// Routes
if ($uri === '/' || $uri === '/api/health') {
    jsonResponse([
        'success' => true,
        'app' => 'NEAR JOB Laravel Backend API',
        'version' => '1.0.0',
        'database' => 'SQLite (pdo_sqlite ready)',
        'environment' => 'development',
        'timestamp' => date('c'),
    ]);
}

// Auth: Register
if ($uri === '/api/register' && $method === 'POST') {
    if (empty($body['email']) || empty($body['name']) || empty($body['password'])) {
        jsonResponse(['success' => false, 'message' => 'Nama, email, dan password wajib diisi'], 422);
    }

    $existing = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $existing->execute([$body['email']]);
    if ($existing->fetch()) {
        jsonResponse(['success' => false, 'message' => 'Email sudah terdaftar'], 400);
    }

    $userId = 'usr-' . substr(md5(uniqid()), 0, 12);
    $role = $body['role'] ?? 'customer';
    $hash = password_hash($body['password'], PASSWORD_BCRYPT);
    $initialBalance = $role === 'customer' ? 500000 : 0;

    $stmt = $pdo->prepare("
        INSERT INTO users (id, name, email, phone, password, role, balance, is_online, vehicle, plate_number) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $userId,
        $body['name'],
        $body['email'],
        $body['phone'] ?? null,
        $hash,
        $role,
        $initialBalance,
        $role === 'driver' ? 1 : 0,
        $body['vehicle'] ?? ($role === 'driver' ? 'Motor Standar' : null),
        $body['plate_number'] ?? null,
    ]);

    $user = $pdo->query("SELECT id, name, email, phone, role, balance, rating, is_online, vehicle, plate_number FROM users WHERE id = '{$userId}'")->fetch();

    jsonResponse([
        'success' => true,
        'message' => 'Registrasi user berhasil',
        'data' => [
            'user' => $user,
            'token' => 'nearjob_token_' . bin2hex(random_bytes(16)),
        ]
    ], 201);
}

// Auth: Login
if ($uri === '/api/login' && $method === 'POST') {
    if (empty($body['email']) || empty($body['password'])) {
        jsonResponse(['success' => false, 'message' => 'Email dan kata sandi wajib diisi'], 422);
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$body['email']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($body['password'], $user['password'])) {
        jsonResponse(['success' => false, 'message' => 'Email atau kata sandi tidak valid'], 401);
    }

    unset($user['password']);

    jsonResponse([
        'success' => true,
        'message' => 'Login berhasil',
        'data' => [
            'user' => $user,
            'token' => 'nearjob_token_' . bin2hex(random_bytes(16)),
        ]
    ]);
}

// Task Orders: List & Create
if ($uri === '/api/tasks') {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM task_orders ORDER BY created_at DESC");
        $tasks = $stmt->fetchAll();
        jsonResponse(['success' => true, 'data' => $tasks]);
    }

    if ($method === 'POST') {
        if (empty($body['title']) || empty($body['budget']) || empty($body['pickup_address'])) {
            jsonResponse(['success' => false, 'message' => 'Judul, budget, dan alamat jemput wajib diisi'], 422);
        }

        $budget = (int) $body['budget'];
        $rate = $budget >= 1000000 ? 0.09 : 0.10;
        $commission = (int) round($budget * $rate);
        $net = $budget - $commission;
        $orderId = 'tsk-' . substr(md5(uniqid()), 0, 10);

        $stmt = $pdo->prepare("
            INSERT INTO task_orders (
                id, service_type, title, description, category,
                pickup_address, pickup_lat, pickup_lng, destination_address, destination_lat, destination_lng,
                distance_km, budget, commission_rate, commission_amount, net_amount,
                status, customer_id, schedule_date, schedule_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?)
        ");
        $stmt->execute([
            $orderId,
            $body['service_type'] ?? 'task_custom',
            $body['title'],
            $body['description'] ?? null,
            $body['category'] ?? 'Umum',
            $body['pickup_address'],
            $body['pickup_lat'] ?? -6.2088,
            $body['pickup_lng'] ?? 106.8456,
            $body['destination_address'] ?? null,
            $body['destination_lat'] ?? null,
            $body['destination_lng'] ?? null,
            $body['distance_km'] ?? 2.5,
            $budget,
            $rate,
            $commission,
            $net,
            $body['customer_id'] ?? 'usr-customer-budi',
            $body['schedule_date'] ?? date('Y-m-d'),
            $body['schedule_time'] ?? date('H:i'),
        ]);

        $order = $pdo->query("SELECT * FROM task_orders WHERE id = '{$orderId}'")->fetch();

        jsonResponse([
            'success' => true,
            'message' => 'Pesanan berhasil dibuat',
            'data' => $order,
        ], 201);
    }
}

// Driver: Toggle Online
if ($uri === '/api/driver/toggle-online' && $method === 'POST') {
    $driverId = $body['driver_id'] ?? 'usr-worker-siti';
    $isOnline = isset($body['is_online']) ? (int) $body['is_online'] : 1;

    $stmt = $pdo->prepare("UPDATE users SET is_online = ? WHERE id = ?");
    $stmt->execute([$isOnline, $driverId]);

    jsonResponse([
        'success' => true,
        'message' => $isOnline ? 'Status Driver: Siap Kerja (ONLINE)' : 'Status Driver: Istirahat (OFFLINE)',
        'data' => ['is_online' => (bool) $isOnline],
    ]);
}

// Driver: Radar (Pesanan Masuk)
if ($uri === '/api/driver/radar' && $method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM task_orders WHERE status = 'PENDING' ORDER BY created_at DESC LIMIT 5");
    jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
}

// Driver: Active Order
if ($uri === '/api/driver/active-order' && $method === 'GET') {
    $driverId = $_GET['driver_id'] ?? 'usr-worker-siti';
    $stmt = $pdo->prepare("SELECT * FROM task_orders WHERE driver_id = ? AND status IN ('ACCEPTED', 'OTW', 'ARRIVED', 'WORKING') LIMIT 1");
    $stmt->execute([$driverId]);
    $order = $stmt->fetch();

    jsonResponse(['success' => true, 'data' => $order ?: null]);
}

// Driver: Accept Order
if (preg_match('#^/api/driver/orders/([^/]+)/accept$#', $uri, $matches) && $method === 'POST') {
    $orderId = $matches[1];
    $driverId = $body['driver_id'] ?? 'usr-worker-siti';

    $stmt = $pdo->prepare("UPDATE task_orders SET status = 'ACCEPTED', driver_id = ? WHERE id = ?");
    $stmt->execute([$driverId, $orderId]);

    $order = $pdo->query("SELECT * FROM task_orders WHERE id = '{$orderId}'")->fetch();
    jsonResponse(['success' => true, 'message' => 'Order diterima oleh mitra driver', 'data' => $order]);
}

// Driver: Update Status (OTW -> ARRIVED -> WORKING -> COMPLETED)
if (preg_match('#^/api/driver/orders/([^/]+)/status$#', $uri, $matches) && ($method === 'PATCH' || $method === 'POST')) {
    $orderId = $matches[1];
    $status = $body['status'] ?? 'COMPLETED';

    $stmt = $pdo->prepare("UPDATE task_orders SET status = ? WHERE id = ?");
    $stmt->execute([$status, $orderId]);

    $order = $pdo->query("SELECT * FROM task_orders WHERE id = '{$orderId}'")->fetch();

    if ($status === 'COMPLETED' && !empty($order['driver_id'])) {
        $pdo->prepare("UPDATE users SET balance = balance + ?, points = points + 15 WHERE id = ?")
            ->execute([$order['net_amount'], $order['driver_id']]);

        $txId = 'tx-' . substr(md5(uniqid()), 0, 10);
        $pdo->prepare("INSERT INTO wallet_transactions (id, user_id, type, amount, description, reference_id, status) VALUES (?, ?, 'RECEIVE', ?, ?, ?, 'SUCCESS')")
            ->execute([$txId, $order['driver_id'], $order['net_amount'], 'Pendapatan Bersih: ' . $order['title'], $orderId]);
    }

    jsonResponse(['success' => true, 'message' => "Status diperbarui menjadi {$status}", 'data' => $order]);
}

// Wallet: Index
if ($uri === '/api/wallet' && $method === 'GET') {
    $userId = $_GET['user_id'] ?? 'usr-worker-siti';
    $user = $pdo->query("SELECT balance FROM users WHERE id = '{$userId}'")->fetch();
    $stmt = $pdo->prepare("SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 30");
    $stmt->execute([$userId]);
    $txs = $stmt->fetchAll();

    jsonResponse([
        'success' => true,
        'data' => [
            'balance' => $user ? (int) $user['balance'] : 0,
            'pending_balance' => 0,
            'transactions' => $txs,
        ]
    ]);
}

// Wallet: Withdraw
if ($uri === '/api/wallet/withdraw' && $method === 'POST') {
    $userId = $body['user_id'] ?? 'usr-worker-siti';
    $amount = (int) ($body['amount'] ?? 0);
    $bank = $body['bank'] ?? 'BCA';
    $accountNumber = $body['account_number'] ?? '123-456-7890';

    $user = $pdo->query("SELECT balance FROM users WHERE id = '{$userId}'")->fetch();
    if (!$user || $user['balance'] < $amount) {
        jsonResponse(['success' => false, 'message' => 'Saldo tidak mencukupi'], 400);
    }

    $pdo->prepare("UPDATE users SET balance = balance - ? WHERE id = ?")->execute([$amount, $userId]);
    $txId = 'tx-' . substr(md5(uniqid()), 0, 10);
    $pdo->prepare("INSERT INTO wallet_transactions (id, user_id, type, amount, description, status) VALUES (?, ?, 'WITHDRAW', ?, ?, 'SUCCESS')")
        ->execute([$txId, $userId, $amount, "Pencairan ke {$bank} ({$accountNumber})"]);

    $newBalance = $pdo->query("SELECT balance FROM users WHERE id = '{$userId}'")->fetchColumn();

    jsonResponse([
        'success' => true,
        'message' => 'Pencairan saldo berhasil diproses',
        'data' => ['balance' => (int) $newBalance],
    ]);
}

// Admin: Metrics
if ($uri === '/api/admin/metrics' && $method === 'GET') {
    $totalUsers = (int) $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $totalCustomers = (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'customer'")->fetchColumn();
    $totalDrivers = (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'driver'")->fetchColumn();
    $onlineDrivers = (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'driver' AND is_online = 1")->fetchColumn();
    $totalOrders = (int) $pdo->query("SELECT COUNT(*) FROM task_orders")->fetchColumn();
    $completedOrders = (int) $pdo->query("SELECT COUNT(*) FROM task_orders WHERE status = 'COMPLETED'")->fetchColumn();
    $grossVolume = (int) $pdo->query("SELECT COALESCE(SUM(budget), 0) FROM task_orders WHERE status = 'COMPLETED'")->fetchColumn();
    $commissionEarned = (int) $pdo->query("SELECT COALESCE(SUM(commission_amount), 0) FROM task_orders WHERE status = 'COMPLETED'")->fetchColumn();

    jsonResponse([
        'success' => true,
        'data' => [
            'total_users' => $totalUsers,
            'total_customers' => $totalCustomers,
            'total_drivers' => $totalDrivers,
            'active_drivers_online' => $onlineDrivers,
            'total_orders' => $totalOrders,
            'completed_orders' => $completedOrders,
            'gross_merchandise_volume' => $grossVolume,
            'total_platform_commission' => $commissionEarned,
        ]
    ]);
}

// 404 Fallback
jsonResponse(['success' => false, 'message' => "Route {$method} {$uri} tidak ditemukan"], 404);
