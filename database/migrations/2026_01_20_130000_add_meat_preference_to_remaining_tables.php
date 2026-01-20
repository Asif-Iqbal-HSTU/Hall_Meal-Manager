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
            $table->enum('meat_preference', ['beef', 'mutton'])->default('beef')->after('department');
        });

        Schema::table('staff', function (Blueprint $table) {
            $table->enum('meat_preference', ['beef', 'mutton'])->default('beef')->after('designation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropColumn('meat_preference');
        });

        Schema::table('staff', function (Blueprint $table) {
            $table->dropColumn('meat_preference');
        });
    }
};
