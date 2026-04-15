<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MealBooking;
use App\Models\User;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class MealReportController extends Controller
{
    public function compactList(Request $request)
    {
        $hallId = auth()->user()->hall_id;
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        $daysInMonth = $startDate->daysInMonth;

        // Fetch all students in the hall
        $students = Student::with('user')
            ->join('users', 'students.user_id', '=', 'users.id')
            ->where('users.hall_id', $hallId)
            ->where('users.status', '!=', 'ex') // Exclude ex-students?
            ->select('students.*')
            ->orderBy('students.room_number', 'asc')
            ->get();

        // Fetch all bookings for these students in this month
        $bookings = MealBooking::whereIn('user_id', $students->pluck('user_id'))
            ->whereBetween('booking_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->where('quantity', '>', 0)
            ->get();

        // Structure bookings: [user_id][day][meal_type] = quantity
        $bookingData = [];
        foreach ($bookings as $booking) {
            $day = Carbon::parse($booking->booking_date)->day;
            $bookingData[$booking->user_id][$day][$booking->meal_type] = $booking->quantity;
        }

        return Inertia::render('admin/reports/compact-meal-list', [
            'students' => $students->map(function ($student) {
                return [
                    'id' => $student->id,
                    'user_id' => $student->user_id,
                    'name' => $student->user->name,
                    'student_id' => $student->student_id,
                    'room_number' => $student->room_number,
                    'department' => $student->department,
                    'batch' => $student->batch,
                ];
            }),
            'bookingData' => $bookingData,
            'selectedMonth' => (int)$month,
            'selectedYear' => (int)$year,
            'daysInMonth' => $daysInMonth,
            'months' => collect(range(1, 12))->map(function ($m) {
                return [
                    'value' => $m,
                    'label' => Carbon::create()->month($m)->format('F'),
                ];
            }),
            'years' => collect(range(now()->year - 2, now()->year + 1))->reverse()->values(),
        ]);
    }
}
