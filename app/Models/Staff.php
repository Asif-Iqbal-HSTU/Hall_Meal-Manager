<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Staff extends Model
{
    use HasFactory;

    protected $table = 'staff'; // Specify table name explicitly just in case

    protected $fillable = [
        'user_id',
        'staff_id',
        'designation',
        'meat_preference',
        'balance',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
