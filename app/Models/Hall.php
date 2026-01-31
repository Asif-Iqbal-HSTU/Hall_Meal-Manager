<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hall extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'seat_rent',
        'prefix',
    ];

    public function students()
    {
        return $this->hasMany(User::class)->where('role', 'student');
    }
}
