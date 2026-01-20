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
            $table->decimal('balance', 10, 2)->default(0.00)->after('role');
        });

        Schema::table('meal_bookings', function (Blueprint $table) {
            $table->decimal('price', 8, 2)->nullable()->after('quantity');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('balance');
        });

        Schema::table('meal_bookings', function (Blueprint $table) {
            $table->dropColumn('price');
        });
    }
};
