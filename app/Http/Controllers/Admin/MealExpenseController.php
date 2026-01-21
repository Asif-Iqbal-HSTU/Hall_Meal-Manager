<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DailyMealCost;
use App\Models\MealBooking;
use App\Models\Hall;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MealExpenseController extends Controller
{
    public function index(Request $request)
    {
        $hallId = auth()->user()->hall_id;
        if (auth()->user()->role === 'super_admin') {
            $hallId = $request->query('hall_id', Hall::first()?->id);
        }

        $expenses = DailyMealCost::with('expenseItems')
            ->where('hall_id', $hallId)
            ->orderBy('date', 'desc')
            ->orderBy('meal_type', 'asc')
            ->paginate(15);

        return Inertia::render('admin/meal-expenses/index', [
            'expenses' => $expenses,
            'halls' => auth()->user()->role === 'super_admin' ? Hall::all() : [],
            'selectedHallId' => (int) $hallId,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/meal-expenses/create', [
            'halls' => auth()->user()->role === 'super_admin' ? Hall::all() : [],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date|before_or_equal:today',
            'meal_type' => 'required|in:breakfast,lunch,dinner',
            'extra_mutton_charge' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|numeric|min:0',
        ]);

        $hallId = auth()->user()->hall_id;
        if (auth()->user()->role === 'super_admin') {
            $hallId = $request->hall_id;
        }

        DB::transaction(function () use ($request, $hallId) {
            $totalCost = collect($request->items)->sum(function ($item) {
                return $item['unit_price'] * $item['quantity'];
            });

            $dailyCost = DailyMealCost::updateOrCreate(
                [
                    'hall_id' => $hallId,
                    'date' => $request->date,
                    'meal_type' => $request->meal_type,
                ],
                [
                    'total_cost' => $totalCost,
                    'extra_mutton_charge' => $request->extra_mutton_charge ?? 0,
                    'status' => 'draft',
                ]
            );

            $dailyCost->expenseItems()->delete();
            foreach ($request->items as $item) {
                $dailyCost->expenseItems()->create([
                    'name' => $item['name'],
                    'unit_price' => $item['unit_price'],
                    'quantity' => $item['quantity'],
                    'total_price' => $item['unit_price'] * $item['quantity'],
                ]);
            }
        });

        return redirect()->route('admin.meal-expenses.index')->with('success', 'Expenses saved as draft.');
    }

    public function edit(DailyMealCost $dailyCost)
    {
        if ($dailyCost->status === 'finalized') {
            return redirect()->route('admin.meal-expenses.index')->with('error', 'Finalized expenses cannot be edited.');
        }

        return Inertia::render('admin/meal-expenses/edit', [
            'expense' => $dailyCost->load('expenseItems'),
            'halls' => auth()->user()->role === 'super_admin' ? Hall::all() : [],
        ]);
    }

    public function update(Request $request, DailyMealCost $dailyCost)
    {
        if ($dailyCost->status === 'finalized') {
            return back()->with('error', 'Finalized expenses cannot be updated.');
        }

        $request->validate([
            'date' => 'required|date|before_or_equal:today',
            'meal_type' => 'required|in:breakfast,lunch,dinner',
            'extra_mutton_charge' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($request, $dailyCost) {
            $totalCost = collect($request->items)->sum(function ($item) {
                return $item['unit_price'] * $item['quantity'];
            });

            $dailyCost->update([
                'date' => $request->date,
                'meal_type' => $request->meal_type,
                'total_cost' => $totalCost,
                'extra_mutton_charge' => $request->extra_mutton_charge ?? 0,
            ]);

            $dailyCost->expenseItems()->delete();
            foreach ($request->items as $item) {
                $dailyCost->expenseItems()->create([
                    'name' => $item['name'],
                    'unit_price' => $item['unit_price'],
                    'quantity' => $item['quantity'],
                    'total_price' => $item['unit_price'] * $item['quantity'],
                ]);
            }
        });

        return redirect()->route('admin.meal-expenses.index')->with('success', 'Expenses updated successfully.');
    }

    public function finalize(DailyMealCost $dailyCost)
    {
        if ($dailyCost->status === 'finalized') {
            return back()->with('error', 'This day is already finalized.');
        }

        $totalBookings = MealBooking::where('hall_id', $dailyCost->hall_id)
            ->where('booking_date', $dailyCost->date)
            ->where('meal_type', $dailyCost->meal_type)
            ->sum('quantity');

        if ($totalBookings == 0) {
            return back()->with('error', 'No bookings found for this day/meal. Cannot finalize.');
        }

        $calculatedPrice = $dailyCost->total_cost / $totalBookings;

        DB::transaction(function () use ($dailyCost) {
            $bookings = MealBooking::where('hall_id', $dailyCost->hall_id)
                ->where('booking_date', $dailyCost->date)
                ->where('meal_type', $dailyCost->meal_type)
                ->with(['user.student', 'user.teacher', 'user.staff'])
                ->get();

            $totalQuantity = $bookings->sum('quantity');

            if ($totalQuantity == 0) {
                throw new \Exception('No bookings found.');
            }

            // Calculate extra weight for mutton
            $muttonQuantity = 0;
            foreach ($bookings as $booking) {
                $pref = null;
                if ($booking->user->student)
                    $pref = $booking->user->student->meat_preference;
                elseif ($booking->user->teacher)
                    $pref = $booking->user->teacher->meat_preference;
                elseif ($booking->user->staff)
                    $pref = $booking->user->staff->meat_preference;

                if (strtolower($pref) === 'mutton') {
                    $muttonQuantity += $booking->quantity;
                }
            }

            $extraMuttonTotal = $muttonQuantity * $dailyCost->extra_mutton_charge;
            $basePrice = ($dailyCost->total_cost - $extraMuttonTotal) / $totalQuantity;

            $dailyCost->update([
                'calculated_price' => $basePrice,
                'status' => 'finalized',
            ]);

            foreach ($bookings as $booking) {
                $pref = null;
                if ($booking->user->student)
                    $pref = $booking->user->student->meat_preference;
                elseif ($booking->user->teacher)
                    $pref = $booking->user->teacher->meat_preference;
                elseif ($booking->user->staff)
                    $pref = $booking->user->staff->meat_preference;

                $finalPrice = $basePrice;
                if (strtolower($pref) === 'mutton' && in_array($dailyCost->meal_type, ['lunch', 'dinner'])) {
                    $finalPrice += $dailyCost->extra_mutton_charge;
                }

                $booking->update(['price' => $finalPrice]);

                $user = $booking->user;
                $cost = $booking->quantity * $finalPrice;

                if ($user->student) {
                    $user->student->decrement('balance', $cost);
                } elseif ($user->teacher) {
                    $user->teacher->decrement('balance', $cost);
                } elseif ($user->staff) {
                    $user->staff->decrement('balance', $cost);
                }
            }
        });

        return back()->with('success', 'Day finalized and user balances updated.');
    }
}
