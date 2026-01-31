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
            $table->string('unique_id')->nullable()->unique()->after('id');
            $table->string('status')->default('active')->after('role'); // active, ex
        });

        Schema::table('meal_bookings', function (Blueprint $table) {
            $table->boolean('is_taken')->default(false)->after('price');
        });

        Schema::table('monthly_costs', function (Blueprint $table) {
            $table->json('other_items')->nullable()->after('other_charge');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['unique_id', 'status']);
        });

        Schema::table('meal_bookings', function (Blueprint $table) {
            $table->dropColumn('is_taken');
        });

        Schema::table('monthly_costs', function (Blueprint $table) {
            $table->dropColumn('other_items');
        });
    }
};
