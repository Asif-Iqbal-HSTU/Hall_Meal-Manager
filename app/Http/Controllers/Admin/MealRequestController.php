<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MealBooking;
use Carbon\Carbon;
use Inertia\Inertia;

class MealRequestController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $user = auth()->user();
        $hallId = $user->hall_id;

        // For super admin, allow viewing a specific hall via query param, or default to first hall if none selected
        if ($user->role === 'super_admin') {
            $hallId = $request->query('hall_id', \App\Models\Hall::first()?->id);
        }

        $today = Carbon::today()->toDateString();
        $tomorrow = Carbon::tomorrow()->toDateString();

        $data = [];

        foreach ([$today, $tomorrow] as $date) {
            $mealRequests = MealBooking::with('user')
                ->where('hall_id', $hallId)
                ->where('booking_date', $date)
                ->get();

            $summary = MealBooking::where('hall_id', $hallId)
                ->where('booking_date', $date)
                ->selectRaw('meal_type, sum(quantity) as total_quantity')
                ->groupBy('meal_type')
                ->get();

            $meatSummary = MealBooking::join('users', 'meal_bookings.user_id', '=', 'users.id')
                ->leftJoin('students', 'users.id', '=', 'students.user_id')
                ->leftJoin('teachers', 'users.id', '=', 'teachers.user_id')
                ->leftJoin('staff', 'users.id', '=', 'staff.user_id')
                ->where('meal_bookings.hall_id', $hallId)
                ->where('meal_bookings.booking_date', $date)
                ->selectRaw('meal_bookings.meal_type, COALESCE(students.meat_preference, teachers.meat_preference, staff.meat_preference) as meat_preference, sum(meal_bookings.quantity) as count')
                ->groupBy('meal_bookings.meal_type', 'meat_preference')
                ->get()
                ->groupBy('meal_type');

            $data[$date === $today ? 'today' : 'tomorrow'] = [
                'mealRequests' => $mealRequests,
                'summary' => $summary,
                'meatSummary' => $meatSummary,
                'date' => $date
            ];
        }

        return Inertia::render('admin/dashboard', [
            'data' => $data,
            'currentDate' => $today,
            'tomorrowDate' => $tomorrow,
            'halls' => $user->role === 'super_admin' ? \App\Models\Hall::all() : [],
            'selectedHallId' => (int) $hallId,
        ]);
    }
}
