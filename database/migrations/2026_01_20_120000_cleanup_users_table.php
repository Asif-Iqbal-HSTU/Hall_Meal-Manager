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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Revert is complex without data loss, but we can add columns back
            $table->string('student_id')->nullable();
            $table->string('unique_id')->nullable();
            $table->string('department')->nullable();
            $table->string('batch')->nullable();
            $table->string('room_number')->nullable();
            $table->string('designation')->nullable();
            $table->decimal('balance', 10, 2)->default(0);
            $table->enum('meat_preference', ['beef', 'mutton'])->default('beef');
        });
    }
};
