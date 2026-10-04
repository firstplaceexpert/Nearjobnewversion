<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskOrder extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'service_type',
        'title',
        'description',
        'category',
        'pickup_address',
        'pickup_lat',
        'pickup_lng',
        'destination_address',
        'destination_lat',
        'destination_lng',
        'distance_km',
        'budget',
        'commission_rate',
        'commission_amount',
        'net_amount',
        'status',
        'customer_id',
        'driver_id',
        'schedule_date',
        'schedule_time',
    ];

    protected $casts = [
        'budget' => 'integer',
        'commission_rate' => 'float',
        'commission_amount' => 'integer',
        'net_amount' => 'integer',
        'distance_km' => 'float',
        'pickup_lat' => 'float',
        'pickup_lng' => 'float',
        'destination_lat' => 'float',
        'destination_lng' => 'float',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function trackings()
    {
        return $this->hasMany(OrderTracking::class, 'order_id');
    }
}
