<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Hall;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Super Admin
        User::updateOrCreate(
            ['email' => 'admin@baust.edu.bd'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'user_type' => 'super_admin',
            ]
        );

        // Hall Admins
        $halls = Hall::all();
        foreach ($halls as $hall) {
            $emailName = strtolower(explode(' ', $hall->name)[0]);
            if ($emailName === 'bir')
                $emailName = 'taramon';

            User::updateOrCreate(
                ['email' => $emailName . '@baust.edu.bd'],
                [
                    'name' => $hall->name . ' Admin',
                    'password' => Hash::make('password'),
                    'role' => 'hall_admin',
                    'user_type' => 'admin',
                    'hall_id' => $hall->id,
                ]
            );
        }
    }
}
