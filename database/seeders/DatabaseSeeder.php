<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            HallSeeder::class,
            AdminSeeder::class,
            // MemberSeeder::class,
            // MealExpenseSeeder::class,
            // MealBookingSeeder::class,
            // MonthlyCostSeeder::class,
        ]);
    }
}
