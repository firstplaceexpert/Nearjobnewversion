<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => 'NEAR JOB Laravel Backend API',
        'version' => '1.0.0',
        'status' => 'online',
        'documentation' => '/api/health',
    ]);
});
