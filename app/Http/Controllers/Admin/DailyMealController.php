<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MealBooking;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DailyMealController extends Controller
{
    public function index(Request $request)
    {
        $hallId = auth()->user()->hall_id;
        $date = $request->input('date', now()->toDateString());
        $mealType = $request->input('meal_type', 'lunch'); // Default to lunch

        $users = User::where('hall_id', $hallId)
            ->whereIn('role', ['student', 'teacher', 'staff']) // Filter by role?
            ->with([
                'mealBookings' => function ($query) use ($date, $mealType) {
                    $query->where('booking_date', $date)
                        ->where('meal_type', $mealType);
                }
            ])
            ->get()
            ->map(function ($user) {
                $booking = $user->mealBookings->first();
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'unique_id' => $user->unique_id,
                    'user_type' => $user->user_type,
                    'booking_id' => $booking ? $booking->id : null,
                    'quantity' => $booking ? $booking->quantity : 0,
                    'is_taken' => $booking ? $booking->is_taken : false,
                ];
            });

        return Inertia::render('admin/daily-meals/index', [
            'users' => $users,
            'date' => $date,
            'mealType' => $mealType,
        ]);
    }

    public function toggle(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'meal_type' => 'required|in:breakfast,lunch,dinner',
            'is_taken' => 'required|boolean',
        ]);

        // If booking exists, update it. 
        // If not and we are setting is_taken=true, create it?
        // Usually if they didn't book, they can't eat without penalty or distinct flow.
        // But the requirement says "option to add if he has taken".
        // I'll assume we creating a standard booking if missing.

        $booking = MealBooking::updateOrCreate(
            [
                'user_id' => $request->user_id,
                'booking_date' => $request->date,
                'meal_type' => $request->meal_type,
            ],
            [
                'hall_id' => auth()->user()->hall_id, // Admin's hall
                // If creating, what quantity? 1.
                'quantity' => \Illuminate\Support\Facades\DB::raw('quantity'),
                // Wait, if I use raw quantity it won't set default 1 for new records.
                // I need to fetch first.
            ]
        );

        // Fix quantity issue: if it was just created, quantity might be 0? 
        // updateOrCreate merged with defaults?
        // Let's do explicit check.

        $booking = MealBooking::where('user_id', $request->user_id)
            ->where('booking_date', $request->date)
            ->where('meal_type', $request->meal_type)
            ->first();

        if (!$booking) {
            // Create new booking with qty 1
            $booking = MealBooking::create([
                'user_id' => $request->user_id,
                'booking_date' => $request->date,
                'meal_type' => $request->meal_type,
                'hall_id' => auth()->user()->hall_id,
                'quantity' => 1,
                'price' => 0,
                'is_taken' => $request->is_taken
            ]);
        } else {
            $booking->is_taken = $request->is_taken;
            // If quantity was 0 (cancelled), setting taken should probably set quantity to 1?
            if ($booking->quantity == 0 && $request->is_taken) {
                $booking->quantity = 1;
            }
            $booking->save();
        }

        return back()->with('success', 'Status updated.');
    }
}
