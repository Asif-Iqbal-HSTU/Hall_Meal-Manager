<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop existing columns if they already exist to ensure a clean slate
            $columnsToDrop = [
                'student_id',
                'unique_id',
                'department',
                'batch',
                'room_number',
                'designation',
                'balance',
                'meat_preference'
            ];

            foreach ($columnsToDrop as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('student_id')->unique()->nullable();
            $table->string('unique_id')->nullable();
            $table->string('department')->nullable();
            $table->string('batch')->nullable();
            $table->string('room_number')->nullable();
            $table->string('designation')->nullable();
            $table->decimal('balance', 10, 2)->default(0);
            $table->enum('meat_preference', ['beef', 'mutton'])->default('beef');

            // Allow email to be nullable
            $table->string('email')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'student_id',
                'unique_id',
                'department',
                'batch',
                'room_number',
                'user_type',
                'designation',
                'balance',
                'meat_preference'
            ]);
            $table->string('email')->nullable(false)->change();
        });
    }
};
