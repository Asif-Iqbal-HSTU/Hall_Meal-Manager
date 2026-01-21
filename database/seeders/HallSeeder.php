<?php

namespace Database\Seeders;

use App\Models\Hall;
use Illuminate\Database\Seeder;

class HallSeeder extends Seeder
{
    public function run(): void
    {
        $halls = [
            [
                'name' => 'Shahid Dr Zikrul Haque Hall',
                'seat_rent' => 150.00,
            ],
            [
                'name' => 'Abbas Uddin Ahmed Hall',
                'seat_rent' => 150.00,
            ],
            [
                'name' => 'Bir Protik Taramon Bibi Hall',
                'seat_rent' => 200.00,
            ],
            [
                'name' => 'Annex Hall',
                'seat_rent' => 100.00,
            ],
        ];

        foreach ($halls as $hallData) {
            Hall::updateOrCreate(
                ['name' => $hallData['name']],
                ['seat_rent' => $hallData['seat_rent']]
            );
        }
    }
}
