<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MealBooking;
use Carbon\Carbon;
use Inertia\Inertia;

class MealRequestController extends Controller
{
    public function index()
    {
        $hallId = auth()->user()->hall_id;
        $nextDay = Carbon::tomorrow()->toDateString();

        $mealRequests = MealBooking::with('user')
            ->where('hall_id', $hallId)
            ->where('booking_date', $nextDay)
            ->get();

        $summary = MealBooking::where('hall_id', $hallId)
            ->where('booking_date', $nextDay)
            ->selectRaw('meal_type, sum(quantity) as total_quantity')
            ->groupBy('meal_type')
            ->get();

        // Calculate meat preference summary for each meal type
        $meatSummary = MealBooking::join('users', 'meal_bookings.user_id', '=', 'users.id')
            ->where('meal_bookings.hall_id', $hallId)
            ->where('meal_bookings.booking_date', $nextDay)
            ->selectRaw('meal_bookings.meal_type, users.meat_preference, sum(meal_bookings.quantity) as count')
            ->groupBy('meal_bookings.meal_type', 'users.meat_preference')
            ->get()
            ->groupBy('meal_type');

        return Inertia::render('admin/dashboard', [
            'mealRequests' => $mealRequests,
            'summary' => $summary,
            'meatSummary' => $meatSummary,
            'date' => $nextDay
        ]);
    }
}
