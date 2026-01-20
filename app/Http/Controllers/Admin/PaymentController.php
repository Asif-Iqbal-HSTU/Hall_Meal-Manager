<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function store(Request $request, User $student)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'note' => 'nullable|string|max:255',
            'payment_date' => 'required|date',
        ]);

        DB::transaction(function () use ($request, $student) {
            Payment::create([
                'user_id' => $student->id,
                'hall_id' => auth()->user()->hall_id,
                'amount' => $request->amount,
                'payment_date' => $request->payment_date,
                'note' => $request->note,
            ]);

            $student->increment('balance', $request->amount);
        });

        return back()->with('success', 'Payment recorded and balance updated.');
    }
}
