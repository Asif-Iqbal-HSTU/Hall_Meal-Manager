<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MonthlyCost;
use App\Models\Hall;
use App\Models\MealBooking;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MonthlyCostController extends Controller
{
    public function index(Request $request)
    {
        $hallId = auth()->user()->hall_id;
        if (auth()->user()->role === 'super_admin') {
            $hallId = $request->query('hall_id', Hall::first()?->id);
        }

        $costs = MonthlyCost::where('hall_id', $hallId)
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->paginate(12);

        return Inertia::render('admin/monthly-costs/index', [
            'costs' => $costs,
            'halls' => auth()->user()->role === 'super_admin' ? Hall::all() : [],
            'selectedHallId' => (int) $hallId,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'year' => 'required|integer',
            'month' => 'required|integer|min:1|max:12',
            'fuel_charge' => 'required|numeric|min:0',
            'spice_charge' => 'required|numeric|min:0',
            'cleaning_charge' => 'required|numeric|min:0',
            'other_items' => 'nullable|array',
            'other_items.*.name' => 'required|string|max:255',
            'other_items.*.amount' => 'required|numeric|min:0',
        ]);

        $hallId = auth()->user()->hall_id;
        if (auth()->user()->role === 'super_admin') {
            $hallId = $request->hall_id;
        }

        $otherItems = $request->other_items ?? [];
        $otherChargeTotal = collect($otherItems)->sum('amount');

        $total = $request->fuel_charge + $request->spice_charge + $request->cleaning_charge + $otherChargeTotal;

        MonthlyCost::updateOrCreate(
            [
                'hall_id' => $hallId,
                'year' => $request->year,
                'month' => $request->month,
            ],
            [
                'fuel_charge' => $request->fuel_charge,
                'spice_charge' => $request->spice_charge,
                'cleaning_charge' => $request->cleaning_charge,
                'other_charge' => $otherChargeTotal,
                'other_items' => $otherItems,
                'total_amount' => $total,
                'status' => 'draft',
            ]
        );

        return back()->with('success', 'Monthly costs saved.');
    }

    public function finalize(MonthlyCost $monthlyCost)
    {
        if ($monthlyCost->status === 'finalized') {
            return back()->with('error', 'Already finalized.');
        }

        $hall = $monthlyCost->hall;
        $year = $monthlyCost->year;
        $month = $monthlyCost->month;

        DB::transaction(function () use ($monthlyCost, $hall, $year, $month) {
            $startDate = "$year-$month-01";
            $endDate = date("Y-m-t", strtotime($startDate));

            // Get all bookings for this hall and month
            $bookings = MealBooking::where('hall_id', $hall->id)
                ->whereBetween('booking_date', [$startDate, $endDate])
                ->get();

            $totalBookingsCount = $bookings->sum('quantity');

            if ($totalBookingsCount == 0) {
                throw new \Exception('No bookings found for this month. Cannot finalize shared costs.');
            }

            $perMealSharedCost = $monthlyCost->total_amount / $totalBookingsCount;

            // Distribute shared costs to each booking
            foreach ($bookings as $booking) {
                // Actually, the daily charge is already deducted.
                // We just need to deduct the additional shared cost per meal.
                $user = $booking->user;
                $additionalCost = $booking->quantity * $perMealSharedCost;

                if ($user->student) {
                    $user->student->decrement('balance', $additionalCost);
                } elseif ($user->teacher) {
                    $user->teacher->decrement('balance', $additionalCost);
                } elseif ($user->staff) {
                    $user->staff->decrement('balance', $additionalCost);
                }
            }

            // Apply Seat Rent to all active users in this hall for this month
            // Only if they had at least one booking? Or everyone?
            // "And their will be a seat renot for each hall. It will also be added at the total bill of a month."
            // Usually seat rent is per person per month.

            $usersWithBookings = $bookings->pluck('user_id')->unique();

            foreach ($usersWithBookings as $userId) {
                $user = User::with(['student', 'teacher', 'staff'])->find($userId);
                $seatRent = $hall->seat_rent;

                if ($user->student) {
                    $user->student->decrement('balance', $seatRent);
                } elseif ($user->teacher) {
                    $user->teacher->decrement('balance', $seatRent);
                } elseif ($user->staff) {
                    $user->staff->decrement('balance', $seatRent);
                }
            }

            $monthlyCost->update(['status' => 'finalized']);
        });

        return back()->with('success', 'Month finalized. Shared costs and seat rent applied.');
    }

    public function updateHallSettings(Request $request, Hall $hall)
    {
        $request->validate([
            'seat_rent' => 'required|numeric|min:0',
        ]);

        $hall->update([
            'seat_rent' => $request->seat_rent,
        ]);

        return back()->with('success', 'Hall settings updated.');
    }
}
