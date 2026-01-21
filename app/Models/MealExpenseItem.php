<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MealExpenseItem extends Model
{
    protected $fillable = [
        'daily_meal_cost_id',
        'name',
        'unit_price',
        'quantity',
        'total_price',
    ];

    public function dailyMealCost()
    {
        return $this->belongsTo(DailyMealCost::class);
    }
}
