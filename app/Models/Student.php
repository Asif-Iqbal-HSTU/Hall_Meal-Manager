<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'student_id',
        'batch',
        'department',
        'room_number',
        'meat_preference',
        'balance',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
