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
        // Specific Hall Admins
        $adminCredentials = [
            'Shahid Dr Zikrul Haque Hall' => [
                'email' => 'sdzhh@baust.edu.bd',
                'password' => 'sdzhh@Admin'
            ],
            'Abbas Uddin Ahmed Hall' => [
                'email' => 'auah@baust.edu.bd',
                'password' => 'auah@Admin'
            ],
            'Bir Protik Taramon Bibi Hall' => [
                'email' => 'bptbh@baust.edu.bd',
                'password' => 'bptbh@Admin'
            ],
            'Annex Hall' => [
                'email' => 'annex@baust.edu.bd',
                'password' => 'annex@Admin'
            ],
        ];

        foreach ($adminCredentials as $hallName => $creds) {
            $hall = Hall::where('name', $hallName)->first();

            if ($hall) {
                User::updateOrCreate(
                    ['email' => $creds['email']],
                    [
                        'name' => $hall->name . ' Admin',
                        'password' => Hash::make($creds['password']),
                        'role' => 'hall_admin',
                        'user_type' => 'admin',
                        'hall_id' => $hall->id,
                        // Ensure unique_id doesn't conflict or is ignored for admins
                        'unique_id' => null,
                        'status' => 'active',
                    ]
                );
            }
        }
    }
}
