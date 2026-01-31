<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MealBooking extends Model
{
    protected $fillable = [
        'user_id',
        'hall_id',
        'meal_type',
        'quantity',
        'price',
        'booking_date',
        'is_taken',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function hall()
    {
        return $this->belongsTo(Hall::class);
    }
}
