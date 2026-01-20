<?php

namespace Database\Seeders;

use App\Models\Hall;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $halls = Hall::all();
        $departments = ['CSE', 'ICT', 'EEE', 'ME', 'IPE', 'DBA', 'AIS', 'Eng', 'CE'];
        $teacherDesignations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'];
        $staffDesignations = ['Hall Manager', 'Mess Manager', 'Account Clerk', 'Building Supervisor'];

        foreach ($halls as $hall) {
            // Create 10 Students for each hall
            for ($i = 1; $i <= 10; $i++) {
                $studentId = 'S' . $hall->id . Str::padLeft($i, 3, '0');
                $user = User::create([
                    'name' => "Student $i - {$hall->name}",
                    'email' => strtolower($studentId) . "@student.baust.edu.bd",
                    'password' => Hash::make('password'),
                    'hall_id' => $hall->id,
                    'role' => 'student',
                    'user_type' => 'student',
                ]);

                $user->student()->create([
                    'student_id' => $studentId,
                    'department' => $departments[array_rand($departments)],
                    'batch' => '202' . rand(0, 4),
                    'room_number' => rand(100, 500),
                    'meat_preference' => rand(0, 1) ? 'beef' : 'mutton',
                    'balance' => rand(100, 1000),
                ]);
            }

            // Create 3 Teachers for each hall
            for ($i = 1; $i <= 3; $i++) {
                $teacherId = 'T' . $hall->id . Str::padLeft($i, 3, '0');
                $user = User::create([
                    'name' => "Teacher $i - {$hall->name}",
                    'email' => strtolower($teacherId) . "@teacher.baust.edu.bd",
                    'password' => Hash::make('password'),
                    'hall_id' => $hall->id,
                    'role' => 'teacher',
                    'user_type' => 'teacher',
                ]);

                $user->teacher()->create([
                    'teacher_id' => $teacherId,
                    'department' => $departments[array_rand($departments)],
                    'designation' => $teacherDesignations[array_rand($teacherDesignations)],
                    'meat_preference' => rand(0, 1) ? 'beef' : 'mutton',
                    'balance' => rand(500, 2000),
                ]);
            }

            // Create 2 Staff for each hall
            for ($i = 1; $i <= 2; $i++) {
                $staffId = 'ST' . $hall->id . Str::padLeft($i, 3, '0');
                $user = User::create([
                    'name' => "Staff $i - {$hall->name}",
                    'email' => strtolower($staffId) . "@staff.baust.edu.bd",
                    'password' => Hash::make('password'),
                    'hall_id' => $hall->id,
                    'role' => 'staff',
                    'user_type' => 'staff',
                ]);

                $user->staff()->create([
                    'staff_id' => $staffId,
                    'designation' => $staffDesignations[array_rand($staffDesignations)],
                    'meat_preference' => rand(0, 1) ? 'beef' : 'mutton',
                    'balance' => rand(200, 1000),
                ]);
            }
        }
    }
}
