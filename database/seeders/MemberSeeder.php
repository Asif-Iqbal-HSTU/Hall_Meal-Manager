<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Hall;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Staff;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        $halls = Hall::all();

        foreach ($halls as $hall) {
            // Students
            for ($i = 1; $i <= 5; $i++) {
                $user = User::create([
                    'name' => "Student $i ({$hall->name})",
                    'email' => "student{$i}_" . strtolower(substr($hall->name, 0, 3)) . "@example.com",
                    'password' => Hash::make('password'),
                    'role' => 'student',
                    'user_type' => 'student',
                    'hall_id' => $hall->id,
                ]);

                Student::create([
                    'user_id' => $user->id,
                    'student_id' => "2001010" . ($hall->id * 10 + $i),
                    'department' => 'CSE',
                    'batch' => '10th',
                    'room_number' => '10' . $i,
                    'meat_preference' => $i % 2 === 0 ? 'mutton' : 'beef',
                    'balance' => 1000.00,
                ]);
            }

            // Teachers
            for ($i = 1; $i <= 2; $i++) {
                $user = User::create([
                    'name' => "Teacher $i ({$hall->name})",
                    'email' => "teacher{$i}_" . strtolower(substr($hall->name, 0, 3)) . "@example.com",
                    'password' => Hash::make('password'),
                    'role' => 'teacher',
                    'user_type' => 'teacher',
                    'hall_id' => $hall->id,
                ]);

                Teacher::create([
                    'user_id' => $user->id,
                    'teacher_id' => "T-00" . ($hall->id * 10 + $i),
                    'department' => 'EEE',
                    'designation' => 'Assistant Professor',
                    'meat_preference' => 'beef',
                    'balance' => 2000.00,
                ]);
            }

            // Staff
            for ($i = 1; $i <= 2; $i++) {
                $user = User::create([
                    'name' => "Staff $i ({$hall->name})",
                    'email' => "staff{$i}_" . strtolower(substr($hall->name, 0, 3)) . "@example.com",
                    'password' => Hash::make('password'),
                    'role' => 'staff',
                    'user_type' => 'staff',
                    'hall_id' => $hall->id,
                ]);

                Staff::create([
                    'user_id' => $user->id,
                    'staff_id' => "S-00" . ($hall->id * 10 + $i),
                    'designation' => 'Office Assistant',
                    'meat_preference' => 'mutton',
                    'balance' => 500.00,
                ]);
            }
        }
    }
}
