<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonthlyCost extends Model
{
    use HasFactory;

    protected $fillable = [
        'hall_id',
        'year',
        'month',
        'fuel_charge',
        'spice_charge',
        'cleaning_charge',
        'other_charge',
        'total_amount',
        'status',
        'other_items',
    ];

    protected $casts = [
        'other_items' => 'array',
    ];

    public function hall()
    {
        return $this->belongsTo(Hall::class);
    }
}
