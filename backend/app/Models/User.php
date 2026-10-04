<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'email',
        'phone',
        'password',
        'role',
        'avatar',
        'balance',
        'rating',
        'is_online',
        'vehicle',
        'plate_number',
        'points',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_online' => 'boolean',
            'balance' => 'integer',
            'rating' => 'float',
            'points' => 'integer',
        ];
    }

    public function customerOrders()
    {
        return $this->hasMany(TaskOrder::class, 'customer_id');
    }

    public function driverOrders()
    {
        return $this->hasMany(TaskOrder::class, 'driver_id');
    }

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class, 'user_id');
    }
}
