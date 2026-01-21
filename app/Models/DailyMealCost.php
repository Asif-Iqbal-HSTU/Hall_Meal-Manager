<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyMealCost extends Model
{
    protected $fillable = [
        'hall_id',
        'date',
        'meal_type',
        'total_cost',
        'extra_mutton_charge',
        'calculated_price',
        'status',
    ];

    public function hall()
    {
        return $this->belongsTo(Hall::class);
    }

    public function expenseItems()
    {
        return $this->hasMany(MealExpenseItem::class);
    }

    public function bookings()
    {
        return $this->hasMany(MealBooking::class, 'booking_date', 'date')
            ->where('hall_id', $this->hall_id)
            ->where('meal_type', $this->meal_type);
    }
}
