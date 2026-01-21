<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\MemberWelcomeMail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TeacherRegistrationController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $hallId = $user->hall_id;
        $search = $request->input('search');

        if ($user->role === 'super_admin') {
            $hallId = $request->query('hall_id', \App\Models\Hall::first()?->id);
        }

        $query = Teacher::with('user')
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

        $teachers = $query->get()->map(function ($teacher) {
            return [
                'id' => $teacher->id,
                'name' => $teacher->user->name,
                'email' => $teacher->user->email,
                'user_type' => 'teacher',
                'student_id' => $teacher->teacher_id,
                'department' => $teacher->department,
                'designation' => $teacher->designation,
                'meat_preference' => $teacher->meat_preference,
                'balance' => $teacher->balance,
            ];
        });

        return Inertia::render('admin/student-list', [ // Using student-list as generic list or create teacher-list
            'students' => $teachers,
            'filters' => ['search' => $search, 'hall_id' => $hallId],
            'halls' => $user->role === 'super_admin' ? \App\Models\Hall::all() : [],
            'selectedHallId' => (int) $hallId,
            'memberType' => 'teacher',
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|string|max:255|unique:teachers,teacher_id',
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users',
            'department' => 'required|string|max:255',
            'designation' => 'required|string|max:255',
            'meat_preference' => 'required|in:beef,mutton',
            'hall_id' => 'nullable|exists:halls,id',
        ]);

        // For teachers/staff, maybe email prefix or something as default password if not provided?
        // Let's use name prefix or random 8 chars.
        $password = Str::random(8);

        try {
            DB::transaction(function () use ($request, $password) {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($password),
                    'hall_id' => auth()->user()->role === 'super_admin' ? ($request->hall_id ?: auth()->user()->hall_id) : auth()->user()->hall_id,
                    'role' => 'teacher', // or whatever role they check for access
                    'user_type' => 'teacher',
                ]);

                $user->teacher()->create([
                    'teacher_id' => $request->student_id,
                    'department' => $request->department,
                    'designation' => $request->designation,
                    'meat_preference' => $request->meat_preference,
                    'balance' => 0,
                ]);

                if ($user->email) {
                    Mail::to($user->email)->send(new MemberWelcomeMail($user, $password));
                }
            });

            return redirect()->back()->with('success', 'Teacher registered successfully. Password: ' . $password);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Teacher registration failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Registration failed.'])->withInput();
        }
    }

    public function update(Request $request, Teacher $teacher)
    {
        $user = auth()->user();
        if ($user->role !== 'super_admin' && $teacher->user->hall_id !== $user->hall_id) {
            abort(403);
        }

        $request->validate([
            'student_id' => 'required|string|max:255|unique:teachers,teacher_id,' . $teacher->id,
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users,email,' . $teacher->user_id,
            'department' => 'required|string|max:255',
            'designation' => 'required|string|max:255',
            'meat_preference' => 'required|in:beef,mutton',
        ]);

        DB::transaction(function () use ($request, $teacher) {
            $teacher->user->update([
                'name' => $request->name,
                'email' => $request->email,
            ]);

            $teacher->update([
                'teacher_id' => $request->student_id,
                'department' => $request->department,
                'designation' => $request->designation,
                'meat_preference' => $request->meat_preference,
            ]);
        });

        return redirect()->back()->with('success', 'Teacher updated successfully.');
    }
}
