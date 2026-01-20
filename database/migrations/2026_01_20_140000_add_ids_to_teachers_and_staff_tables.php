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
        Schema::table('teachers', function (Blueprint $table) {
            $table->string('teacher_id')->unique()->after('user_id');
        });

        Schema::table('staff', function (Blueprint $table) {
            $table->string('staff_id')->unique()->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropColumn('teacher_id');
        });

        Schema::table('staff', function (Blueprint $table) {
            $table->dropColumn('staff_id');
        });
    }
};
