<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HallSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $halls = [
            'Shahid Dr Zikrul Haque Hall',
            'Abbas Uddin Ahmed Hall',
            'Bir Protik Taramon Bibi Hall',
            'Annex Hall',
        ];

        foreach ($halls as $hallName) {
            $hall = \App\Models\Hall::create(['name' => $hallName]);

            // Create an admin for this hall
            $emailName = strtolower(explode(' ', $hallName)[0]);
            if ($emailName === 'bir')
                $emailName = 'taramon'; // Special case for Bir Protik

            \App\Models\User::create([
                'name' => $hallName . ' Admin',
                'email' => $emailName . '@baust.edu.bd',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'role' => 'hall_admin',
                'hall_id' => $hall->id,
            ]);
        }

        // Create a Super Admin
        \App\Models\User::create([
            'name' => 'Super Admin',
            'email' => 'admin@baust.edu.bd',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'super_admin',
        ]);
    }
}
