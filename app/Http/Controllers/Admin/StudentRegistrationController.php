<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class StudentRegistrationController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $hallId = $user->hall_id;
        $search = $request->input('search');

        if ($user->role === 'super_admin') {
            $hallId = $request->query('hall_id', \App\Models\Hall::first()?->id);
        }

        $query = Student::with('user')
            ->whereHas('user', function ($q) use ($hallId) {
                $q->where('hall_id', $hallId);
            });

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('student_id', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $students = $query->get()->map(function ($student) {
            return [
                'id' => $student->id,
                'student_id' => $student->student_id,
                'name' => $student->user->name,
                'email' => $student->user->email,
                'user_type' => 'student',
                'department' => $student->department,
                'batch' => $student->batch,
                'room_number' => $student->room_number,
                'meat_preference' => $student->meat_preference,
                'balance' => $student->balance,
            ];
        });

        return Inertia::render('admin/student-list', [
            'students' => $students,
            'filters' => ['search' => $search, 'hall_id' => $hallId],
            'halls' => $user->role === 'super_admin' ? \App\Models\Hall::all() : [],
            'selectedHallId' => (int) $hallId,
            'memberType' => 'student',
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/register-student', [
            'halls' => auth()->user()->role === 'super_admin' ? \App\Models\Hall::all() : []
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users',
            'student_id' => 'required|string|max:255|unique:students',
            'department' => 'required|string|max:255',
            'batch' => 'required|string|max:255',
            'room_number' => 'required|string|max:255',
            'meat_preference' => 'required|in:beef,mutton',
            'hall_id' => 'nullable|exists:halls,id',
            'use_id_as_password' => 'boolean',
        ]);

        $password = $request->use_id_as_password ? $request->student_id : Str::random(8);

        try {
            DB::transaction(function () use ($request, $password) {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($password),
                    'hall_id' => auth()->user()->role === 'super_admin' ? ($request->hall_id ?: auth()->user()->hall_id) : auth()->user()->hall_id,
                    'role' => 'student',
                    'user_type' => 'student',
                ]);

                $user->student()->create([
                    'student_id' => $request->student_id,
                    'department' => $request->department,
                    'batch' => $request->batch,
                    'room_number' => $request->room_number,
                    'meat_preference' => $request->meat_preference,
                    'balance' => 0,
                ]);

                // Email sending ignored as per request
            });

            return redirect()->route('admin.students.index')->with('success', 'Student registered successfully. Password: ' . ($request->use_id_as_password ? 'Same as ID' : $password));

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Student registration failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Registration failed. Please try again.'])->withInput();
        }
    }

    public function bulkStore(Request $request)
    {
        $request->validate([
            'students' => 'required|array|min:1',
            'students.*.student_id' => 'required|string',
            'students.*.name' => 'required|string',
            'students.*.department' => 'required|string',
            'students.*.batch' => 'required|string',
            'students.*.room_number' => 'required|string',
        ]);

        $hallId = auth()->user()->hall_id;

        try {
            DB::transaction(function () use ($request, $hallId) {
                foreach ($request->students as $data) {
                    if (Student::where('student_id', $data['student_id'])->exists()) {
                        continue;
                    }

                    $user = User::create([
                        'name' => $data['name'],
                        'email' => null,
                        'password' => Hash::make($data['student_id']),
                        'hall_id' => auth()->user()->role === 'super_admin' ? ($data['hall_id'] ?? auth()->user()->hall_id) : auth()->user()->hall_id,
                        'role' => 'student',
                        'user_type' => 'student',
                    ]);

                    $user->student()->create([
                        'student_id' => $data['student_id'],
                        'department' => $data['department'],
                        'batch' => $data['batch'],
                        'room_number' => $data['room_number'],
                        'meat_preference' => $data['meat_preference'] ?? 'beef',
                        'balance' => 0,
                    ]);
                }
            });
            return redirect()->route('admin.students.index')->with('success', 'Bulk registration completed.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Bulk registration failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Bulk registration failed.']);
        }
    }

    public function update(Request $request, Student $student)
    {
        $user = auth()->user();
        if ($user->role !== 'super_admin' && $student->user->hall_id !== $user->hall_id) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users,email,' . $student->user_id,
            'student_id' => 'required|string|max:255|unique:students,student_id,' . $student->id,
            'department' => 'required|string|max:255',
            'batch' => 'required|string|max:255',
            'room_number' => 'required|string|max:255',
            'meat_preference' => 'required|in:beef,mutton',
        ]);

        DB::transaction(function () use ($request, $student) {
            $student->user->update([
                'name' => $request->name,
                'email' => $request->email,
            ]);

            $student->update([
                'student_id' => $request->student_id,
                'department' => $request->department,
                'batch' => $request->batch,
                'room_number' => $request->room_number,
                'meat_preference' => $request->meat_preference,
            ]);
        });

        return redirect()->route('admin.students.index')->with('success', 'Student updated successfully.');
    }
}
