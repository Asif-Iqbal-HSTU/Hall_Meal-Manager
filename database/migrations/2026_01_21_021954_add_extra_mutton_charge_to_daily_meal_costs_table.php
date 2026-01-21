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
        Schema::table('daily_meal_costs', function (Blueprint $table) {
            $table->decimal('extra_mutton_charge', 10, 2)->default(0)->after('total_cost');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('daily_meal_costs', function (Blueprint $table) {
            $table->dropColumn('extra_mutton_charge');
        });
    }
};
