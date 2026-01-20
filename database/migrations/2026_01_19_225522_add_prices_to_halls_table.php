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
        Schema::table('halls', function (Blueprint $table) {
            $table->decimal('breakfast_price', 8, 2)->default(20.00);
            $table->decimal('lunch_price', 8, 2)->default(50.00);
            $table->decimal('dinner_price', 8, 2)->default(45.00);
        });
    }

    public function down(): void
    {
        Schema::table('halls', function (Blueprint $table) {
            $table->dropColumn(['breakfast_price', 'lunch_price', 'dinner_price']);
        });
    }
};
