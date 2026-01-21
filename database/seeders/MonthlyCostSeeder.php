<?php

namespace Database\Seeders;

use App\Models\MonthlyCost;
use App\Models\Hall;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class MonthlyCostSeeder extends Seeder
{
    public function run(): void
    {
        $halls = Hall::all();
        $now = Carbon::now();

        $monthsToSeed = [
            ['year' => $now->year, 'month' => $now->subMonth()->month, 'status' => 'finalized'],
            ['year' => $now->year, 'month' => Carbon::now()->month, 'status' => 'draft'],
        ];

        foreach ($halls as $hall) {
            foreach ($monthsToSeed as $period) {
                $fuel = rand(5000, 10000);
                $spices = rand(3000, 7000);
                $cleaning = rand(2000, 5000);
                $other = rand(500, 2000);

                MonthlyCost::create([
                    'hall_id' => $hall->id,
                    'year' => $period['year'],
                    'month' => $period['month'],
                    'fuel_charge' => $fuel,
                    'spice_charge' => $spices,
                    'cleaning_charge' => $cleaning,
                    'other_charge' => $other,
                    'total_amount' => $fuel + $spices + $cleaning + $other,
                    'status' => $period['status'],
                ]);
            }
        }
    }
}
