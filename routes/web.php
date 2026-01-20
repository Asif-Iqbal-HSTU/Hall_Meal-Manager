<?php

use App\Http\Controllers\Admin\MealRequestController;
use App\Http\Controllers\Admin\StudentRegistrationController;
use App\Http\Controllers\Student\MealBookingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $role = auth()->user()->role;
        if ($role === 'super_admin' || $role === 'hall_admin') {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('student.dashboard');
    })->name('dashboard');

    // Admin Routes
    Route::middleware(['can:access-admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', [MealRequestController::class, 'index'])->name('dashboard');
        Route::get('students', [StudentRegistrationController::class, 'index'])->name('students.index');
        Route::get('students/create', [StudentRegistrationController::class, 'create'])->name('students.create');
        Route::post('students', [StudentRegistrationController::class, 'store'])->name('students.store');
        Route::post('students/bulk', [StudentRegistrationController::class, 'bulkStore'])->name('students.bulk');
        Route::put('students/{student}', [StudentRegistrationController::class, 'update'])->name('students.update');
        Route::post('students/{student}/payments', [\App\Http\Controllers\Admin\PaymentController::class, 'store'])->name('students.payments.store');
    });

    // Student Routes
    Route::middleware(['can:access-student'])->prefix('student')->name('student.')->group(function () {
        Route::get('dashboard', [MealBookingController::class, 'index'])->name('dashboard');
        Route::post('meal-bookings', [MealBookingController::class, 'store'])->name('meal-bookings.store');
    });
});

require __DIR__ . '/settings.php';
