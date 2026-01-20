<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hall extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'breakfast_price',
        'lunch_price',
        'dinner_price',
    ];

    public function students()
    {
        return $this->hasMany(User::class)->where('role', 'student');
    }
}
