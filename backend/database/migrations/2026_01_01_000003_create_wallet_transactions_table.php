<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('user_id');
            $table->enum('type', ['TOPUP', 'PAYMENT', 'RECEIVE', 'WITHDRAW']);
            $table->bigInteger('amount');
            $table->string('description');
            $table->string('reference_id')->nullable();
            $table->enum('status', ['PENDING', 'SUCCESS', 'FAILED'])->default('SUCCESS');
            $table->timestamps();

            $table->index('user_id');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
