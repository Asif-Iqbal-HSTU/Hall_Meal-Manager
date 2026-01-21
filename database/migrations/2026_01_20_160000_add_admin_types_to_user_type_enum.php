<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For MySQL, we can't easily modify enum via Blueprint without doctrine/dbal (which might be missing)
        // Using raw SQL for compatibility
        DB::statement("ALTER TABLE users MODIFY COLUMN user_type ENUM('student', 'teacher', 'staff', 'admin', 'super_admin') DEFAULT 'student'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN user_type ENUM('student', 'teacher', 'staff') DEFAULT 'student'");
    }
};
