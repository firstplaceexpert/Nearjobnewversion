<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('task_orders', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->enum('service_type', ['near_ride', 'near_send', 'near_food', 'near_clean', 'task_custom'])->default('task_custom');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->default('Umum');
            
            // Lokasi
            $table->string('pickup_address');
            $table->decimal('pickup_lat', 10, 7)->nullable();
            $table->decimal('pickup_lng', 10, 7)->nullable();
            $table->string('destination_address')->nullable();
            $table->decimal('destination_lat', 10, 7)->nullable();
            $table->decimal('destination_lng', 10, 7)->nullable();
            $table->decimal('distance_km', 5, 2)->default(1.0);

            // Keuangan & Komisi
            $table->bigInteger('budget');
            $table->decimal('commission_rate', 4, 2)->default(0.10);
            $table->bigInteger('commission_amount')->default(0);
            $table->bigInteger('net_amount')->default(0);

            // Status Progres
            $table->enum('status', [
                'PENDING',    // Menunggu Driver
                'ACCEPTED',   // Driver Menerima Order
                'OTW',        // Driver Menuju Lokasi
                'ARRIVED',    // Driver Tiba di Lokasi
                'WORKING',    // Pekerjaan Sedang Dilakukan
                'COMPLETED',  // Selesai
                'CANCELLED'   // Dibatalkan
            ])->default('PENDING');

            // Relasi User
            $table->string('customer_id');
            $table->string('driver_id')->nullable();

            $table->date('schedule_date')->nullable();
            $table->string('schedule_time')->nullable();
            $table->timestamps();

            $table->index(['status', 'service_type']);
            $table->index('customer_id');
            $table->index('driver_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_orders');
    }
};
