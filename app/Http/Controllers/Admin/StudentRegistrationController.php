<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class StudentRegistrationController extends Controller
{
    public function index(Request $request)
    {
        $hallId = auth()->user()->hall_id;
        $search = $request->input('search');

        $students = User::where('role', 'student')
            ->where('hall_id', $hallId)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('student_id', 'like', "%{$search}%")
                        ->orWhere('unique_id', 'like', "%{$search}%");
                });
            })
            ->get();

        return Inertia::render('admin/student-list', [
            'students' => $students,
            'filters' => [
                'search' => $search
            ]
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
            'email' => 'required|string|email|max:255|unique:users',
            'student_id' => 'required|string|max:255|unique:users',
            'department' => 'required|string|max:50',
            'batch' => 'required|string|max:50',
            'room_number' => 'required|string|max:50',
            'hall_id' => auth()->user()->role === 'super_admin' ? 'required|exists:halls,id' : 'nullable',
            'meat_preference' => 'required|in:beef,mutton',
            'use_id_as_password' => 'boolean',
        ]);

        $password = $request->use_id_as_password
            ? $request->student_id
            : \Illuminate\Support\Str::random(8);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'student_id' => $request->student_id,
            'department' => $request->department,
            'batch' => $request->batch,
            'room_number' => $request->room_number,
            'password' => Hash::make($password),
            'role' => 'student',
            'meat_preference' => $request->meat_preference,
            'hall_id' => auth()->user()->role === 'super_admin' ? $request->hall_id : auth()->user()->hall_id,
        ]);

        \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\StudentRegistrationMail($user, $password));

        return redirect()->route('admin.students.index')->with('success', 'Student registered successfully.');
    }

    public function bulkStore(Request $request)
    {
        $request->validate([
            'students' => 'required|array|min:1',
            'students.*.student_id' => 'required|string',
            'students.*.name' => 'required|string',
        ]);

        $hallId = auth()->user()->hall_id;

        \Illuminate\Support\Facades\DB::transaction(function () use ($request, $hallId) {
            foreach ($request->students as $studentData) {
                // Skip if student already exists
                if (User::where('student_id', $studentData['student_id'])->exists()) {
                    continue;
                }

                $password = $studentData['student_id'];

                $user = User::create([
                    'unique_id' => $studentData['unique_id'] ?? null,
                    'name' => $studentData['name'],
                    'email' => null,
                    'student_id' => $studentData['student_id'],
                    'department' => $studentData['department'] ?? null,
                    'batch' => $studentData['batch'] ?? null,
                    'room_number' => $studentData['room_number'] ?? null,
                    'password' => Hash::make($password),
                    'role' => 'student',
                    'meat_preference' => $studentData['meat_preference'] ?? 'beef',
                    'hall_id' => $hallId,
                ]);
            }
        });
        return redirect()->route('admin.students.index')->with('success', count($request->students) . ' students processed for import.');
    }

    public function update(Request $request, User $student)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users,email,' . $student->id,
            'student_id' => 'required|string|max:255|unique:users,student_id,' . $student->id,
            'unique_id' => 'nullable|string|max:255',
            'department' => 'required|string|max:50',
            'batch' => 'required|string|max:50',
            'room_number' => 'required|string|max:50',
            'meat_preference' => 'required|in:beef,mutton',
        ]);

        $student->update([
            'name' => $request->name,
            'email' => $request->email,
            'student_id' => $request->student_id,
            'unique_id' => $request->unique_id,
            'department' => $request->department,
            'batch' => $request->batch,
            'room_number' => $request->room_number,
            'meat_preference' => $request->meat_preference,
        ]);

        return redirect()->route('admin.students.index')->with('success', 'Student updated successfully.');
    }
}
