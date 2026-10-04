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
        Schema::create('users', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('password');
            $table->enum('role', ['customer', 'driver', 'admin', 'merchant'])->default('customer');
            $table->string('avatar')->nullable();
            $table->bigInteger('balance')->default(0);
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->boolean('is_online')->default(false);
            $table->string('vehicle')->nullable(); // contoh: Honda Beat eSP
            $table->string('plate_number')->nullable(); // contoh: B 3819 TZG
            $table->integer('points')->default(0);
            $table->rememberToken();
            $table->timestamps();

            $table->index(['role', 'is_online']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
