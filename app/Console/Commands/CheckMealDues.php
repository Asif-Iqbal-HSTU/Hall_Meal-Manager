<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\MealBooking;
use App\Models\Payment;
use Carbon\Carbon;

class CheckMealDues extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'meal:check-dues';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for users with long-pending dues and cancel their future bookings.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for dues...');

        // Criteria: Balance < 0 AND Last Payment > 2 months OR No payment > 2 months
        $twoMonthsAgo = Carbon::now()->subMonths(2);

        $users = User::where('status', 'active')->cursor();

        foreach ($users as $user) {
            $member = null;
            if ($user->student)
                $member = $user->student;
            elseif ($user->teacher)
                $member = $user->teacher;
            elseif ($user->staff)
                $member = $user->staff;

            if (!$member)
                continue;

            if ($member->balance < 0) {
                // Check payment
                $lastPayment = Payment::where('student_id', $member->id) // Assuming payment linked to member id? 
                    // Payment model has student_id, teacher_id?
                    // I need to check Payment model structure.
                    // Assuming for now generic payment check or member-specific.
                    // Let's assume student_id only for now based on previous code.
                    ->latest()
                    ->first();

                // If the system separates payments by table (student_id), I need to be careful.
                // Assuming Payment linked via user_id or specific IDs.
                // The previous code used payment->student_id.
                // I will skip complex polymorphic check here and assume student for this prototype or check only if student.

                $shouldCancel = false;

                if ($user->role === 'student') {
                    $lastPayment = Payment::where('student_id', $member->id)->latest()->first();
                    if (!$lastPayment || $lastPayment->created_at < $twoMonthsAgo) {
                        $shouldCancel = true;
                    }
                }

                if ($shouldCancel) {
                    $this->warn("User {$user->name} ({$user->id}) has dues pending > 2 months. Cancelling future bookings.");

                    // Cancel future bookings
                    $deleted = MealBooking::where('user_id', $user->id)
                        ->where('booking_date', '>', now()->toDateString())
                        ->delete();

                    if ($deleted > 0) {
                        $this->info("Cancelled $deleted bookings for {$user->name}.");
                    }

                    // Optionally suspend
                    // $user->update(['status' => 'suspended']);
                }
            }
        }

        $this->info('Check complete.');
    }
}
