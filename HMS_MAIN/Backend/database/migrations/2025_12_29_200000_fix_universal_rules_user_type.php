<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Normalize universal rules: user_id NULL and user_type 'student' -> user_type NULL
        if (Schema::hasTable('checkincheckout_rules')) {
            DB::table('checkincheckout_rules')
                ->whereNull('user_id')
                ->where('user_type', 'student')
                ->update(['user_type' => null]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert: set user_type 'student' for rows with NULL user_id that have NULL user_type
        if (Schema::hasTable('checkincheckout_rules')) {
            DB::table('checkincheckout_rules')
                ->whereNull('user_id')
                ->whereNull('user_type')
                ->update(['user_type' => 'student']);
        }
    }
};
