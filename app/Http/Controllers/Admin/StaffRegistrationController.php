<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class StaffRegistrationController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $hallId = $user->hall_id;
        $search = $request->input('search');

        if ($user->role === 'super_admin') {
            $hallId = $request->query('hall_id', \App\Models\Hall::first()?->id);
        }

        $query = Staff::with('user')
            ->whereHas('user', function ($q) use ($hallId) {
                $q->where('hall_id', $hallId);
            });

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($uq) use ($search) {
                    $uq->where('name', 'like', "%{$search}%");
                });
            });
        }

        $staffs = $query->get()->map(function ($staff) {
            return [
                'id' => $staff->id,
                'name' => $staff->user->name,
                'email' => $staff->user->email,
                'user_type' => 'staff',
                'student_id' => $staff->staff_id,
                'department' => '',
                'designation' => $staff->designation,
                'meat_preference' => $staff->meat_preference,
                'balance' => $staff->balance,
            ];
        });

        return Inertia::render('admin/student-list', [
            'students' => $staffs,
            'filters' => ['search' => $search, 'hall_id' => $hallId],
            'halls' => $user->role === 'super_admin' ? \App\Models\Hall::all() : [],
            'selectedHallId' => (int) $hallId,
            'memberType' => 'staff',
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|string|max:255|unique:staff,staff_id',
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users',
            'designation' => 'required|string|max:255',
            'meat_preference' => 'required|in:beef,mutton',
            'hall_id' => 'nullable|exists:halls,id',
        ]);

        $password = Str::random(8);

        try {
            DB::transaction(function () use ($request, $password) {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($password),
                    'hall_id' => auth()->user()->role === 'super_admin' ? ($request->hall_id ?: auth()->user()->hall_id) : auth()->user()->hall_id,
                    'role' => 'staff',
                    'user_type' => 'staff',
                ]);

                $user->staff()->create([
                    'staff_id' => $request->student_id,
                    'designation' => $request->designation,
                    'meat_preference' => $request->meat_preference,
                    'balance' => 0,
                ]);
            });

            return redirect()->back()->with('success', 'Staff registered successfully. Password: ' . $password);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Staff registration failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Registration failed.'])->withInput();
        }
    }

    public function update(Request $request, Staff $staff)
    {
        $user = auth()->user();
        if ($user->role !== 'super_admin' && $staff->user->hall_id !== $user->hall_id) {
            abort(403);
        }

        $request->validate([
            'student_id' => 'required|string|max:255|unique:staff,staff_id,' . $staff->id,
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users,email,' . $staff->user_id,
            'designation' => 'required|string|max:255',
            'meat_preference' => 'required|in:beef,mutton',
        ]);

        DB::transaction(function () use ($request, $staff) {
            $staff->user->update([
                'name' => $request->name,
                'email' => $request->email,
            ]);

            $staff->update([
                'staff_id' => $request->student_id,
                'designation' => $request->designation,
                'meat_preference' => $request->meat_preference,
            ]);
        });

        return redirect()->back()->with('success', 'Staff updated successfully.');
    }
}
