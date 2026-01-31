<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class MemberStatusController extends Controller
{
    public function toggle(User $user)
    {
        if (auth()->user()->hall_id !== $user->hall_id && auth()->user()->role !== 'super_admin') {
            abort(403);
        }

        if ($user->status === 'ex') {
            // Reactivate
            $user->update(['status' => 'active']);
            return back()->with('success', 'Member reactivated successfully.');
        }

        // Check Clearance (Balance >= 0)
        $balance = 0;
        if ($user->student)
            $balance = $user->student->balance;
        elseif ($user->teacher)
            $balance = $user->teacher->balance;
        elseif ($user->staff)
            $balance = $user->staff->balance;

        // Tolerance? Usually 0.
        if ($balance < -0.01) { // Floating point tolerance
            return back()->withErrors(['error' => 'Clearance Failed: Member has pending dues of ' . number_format(abs($balance), 2) . ' TK. Please settle payments first.']);
        }

        $user->update(['status' => 'ex']);
        return back()->with('success', 'Member marked as Ex-User (Clearance Passed).');
    }
}
