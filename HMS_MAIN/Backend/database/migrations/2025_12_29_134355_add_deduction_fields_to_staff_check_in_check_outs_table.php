<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('staff_check_in_check_outs', function (Blueprint $table) {
            $table->decimal('deduction_amount', 10, 2)->nullable()->after('checkout_duration');
            $table->decimal('adjusted_amount', 10, 2)->nullable()->after('deduction_amount');
            $table->string('rule_applied')->nullable()->after('adjusted_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff_check_in_check_outs', function (Blueprint $table) {
            $table->dropColumn(['deduction_amount', 'adjusted_amount', 'rule_applied']);
        });
    }
};
