<?php

namespace Database\Seeders;

use App\Models\DailyMealCost;
use App\Models\Hall;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class MealExpenseSeeder extends Seeder
{
    public function run(): void
    {
        $halls = Hall::all();
        $mealTypes = ['breakfast', 'lunch', 'dinner'];

        // Seed last 30 days
        for ($i = 30; $i >= 1; $i--) {
            $date = Carbon::now()->subDays($i)->toDateString();

            foreach ($halls as $hall) {
                foreach ($mealTypes as $mealType) {
                    $basePrice = $mealType === 'breakfast' ? rand(20, 30) : rand(40, 60);
                    $totalQuantity = rand(50, 100);

                    DailyMealCost::create([
                        'hall_id' => $hall->id,
                        'date' => $date,
                        'meal_type' => $mealType,
                        'total_cost' => $basePrice * $totalQuantity,
                        'extra_mutton_charge' => ($mealType !== 'breakfast' ? 20.00 : 0),
                        'calculated_price' => $basePrice,
                        'status' => 'finalized',
                    ]);
                }
            }
        }
    }
}
