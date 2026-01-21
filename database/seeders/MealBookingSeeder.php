<?php

namespace Database\Seeders;

use App\Models\MealBooking;
use App\Models\User;
use App\Models\DailyMealCost;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class MealBookingSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::whereIn('role', ['student', 'teacher', 'staff'])->get();

        // Past bookings for history display
        for ($i = 10; $i >= 1; $i--) {
            $date = Carbon::now()->subDays($i)->toDateString();

            foreach ($users as $user) {
                // Not every user eats every meal
                if (rand(1, 10) > 3) {
                    $mealType = ['breakfast', 'lunch', 'dinner'][rand(0, 2)];
                    $dailyCost = DailyMealCost::where('hall_id', $user->hall_id)
                        ->where('date', $date)
                        ->where('meal_type', $mealType)
                        ->first();

                    if ($dailyCost) {
                        MealBooking::create([
                            'user_id' => $user->id,
                            'hall_id' => $user->hall_id,
                            'meal_type' => $mealType,
                            'booking_date' => $date,
                            'quantity' => rand(1, 2),
                            'price' => $dailyCost->calculated_price,
                        ]);
                    }
                }
            }
        }

        // Future bookings
        $tomorrow = Carbon::tomorrow()->toDateString();
        foreach ($users as $user) {
            if (rand(1, 10) > 5) {
                MealBooking::create([
                    'user_id' => $user->id,
                    'hall_id' => $user->hall_id,
                    'meal_type' => 'lunch',
                    'booking_date' => $tomorrow,
                    'quantity' => 1,
                    'price' => 0,
                ]);
            }
        }
    }
}
