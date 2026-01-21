<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\MealBooking;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TeacherDashboardController extends Controller
{
    public function index()
    {
        $userId = auth()->id();
        $user = auth()->user()->load(['teacher', 'hall']);

        $upcomingBookings = MealBooking::where('user_id', $userId)
            ->where('booking_date', '>=', now()->toDateString())
            ->get();

        $pastBookings = MealBooking::where('user_id', $userId)
            ->where('booking_date', '<', now()->toDateString())
            ->orderBy('booking_date', 'desc')
            ->limit(20)
            ->get();

        $monthlyCosts = \App\Models\MonthlyCost::where('hall_id', auth()->user()->hall_id)
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->limit(3)
            ->get();

        $stats = [
            'total_meals' => MealBooking::where('user_id', $userId)->sum('quantity'),
            'total_spent' => MealBooking::where('user_id', $userId)->selectRaw('sum(quantity * price) as total')->value('total') ?? 0,
            'meal_counts' => [
                'breakfast' => MealBooking::where('user_id', $userId)->where('meal_type', 'breakfast')->sum('quantity'),
                'lunch' => MealBooking::where('user_id', $userId)->where('meal_type', 'lunch')->sum('quantity'),
                'dinner' => MealBooking::where('user_id', $userId)->where('meal_type', 'dinner')->sum('quantity'),
            ]
        ];

        // Fetch last 3 finalized rates for each meal type
        $historicalRates = [
            'breakfast' => \App\Models\DailyMealCost::where('hall_id', auth()->user()->hall_id)
                ->where('meal_type', 'breakfast')
                ->where('status', 'finalized')
                ->orderBy('date', 'desc')
                ->limit(3)
                ->get(['date', 'calculated_price']),
            'lunch' => \App\Models\DailyMealCost::where('hall_id', auth()->user()->hall_id)
                ->where('meal_type', 'lunch')
                ->where('status', 'finalized')
                ->orderBy('date', 'desc')
                ->limit(3)
                ->get(['date', 'calculated_price']),
            'dinner' => \App\Models\DailyMealCost::where('hall_id', auth()->user()->hall_id)
                ->where('meal_type', 'dinner')
                ->where('status', 'finalized')
                ->orderBy('date', 'desc')
                ->limit(3)
                ->get(['date', 'calculated_price']),
        ];

        return Inertia::render('teacher/dashboard', [
            'user' => $user,
            'bookings' => $upcomingBookings,
            'pastBookings' => $pastBookings,
            'monthlyCosts' => $monthlyCosts,
            'stats' => $stats,
            'historicalRates' => $historicalRates,
        ]);
    }

    public function store(Request $request)
    {
        $now = Carbon::now();
        $startTime = Carbon::createFromTime(8, 0, 0);
        $endTime = Carbon::createFromTime(23, 59, 59);

        if (!$now->between($startTime, $endTime)) {
            return back()->withErrors(['error' => 'Booking is only allowed between 08 AM and 11:59 PM.']);
        }

        $request->validate([
            'meal_type' => 'required|in:breakfast,lunch,dinner',
            'quantity' => 'required|integer|min:1|max:10',
        ]);

        $nextDay = Carbon::tomorrow()->toDateString();

        DB::transaction(function () use ($request, $nextDay) {
            MealBooking::updateOrCreate(
                [
                    'user_id' => auth()->id(),
                    'meal_type' => $request->meal_type,
                    'booking_date' => $nextDay,
                ],
                [
                    'hall_id' => auth()->user()->hall_id,
                    'quantity' => $request->quantity,
                    'price' => 0,
                ]
            );
        });

        return back()->with('success', 'Meal booked successfully for tomorrow.');
    }
}
