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
            // First, update any existing records to use the new status values
            \DB::statement("UPDATE staff_check_in_check_outs SET status = 'checked_in' WHERE status = 'present'");
            \DB::statement("UPDATE staff_check_in_check_outs SET status = 'checked_out' WHERE status = 'absent'");
            \DB::statement("UPDATE staff_check_in_check_outs SET status = 'pending' WHERE status = 'leave'");
            
            // Then alter the column to use the new enum values
            \DB::statement("ALTER TABLE staff_check_in_check_outs MODIFY COLUMN status ENUM('checked_in', 'checked_out', 'pending', 'approved', 'declined') DEFAULT 'checked_in'");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff_check_in_check_outs', function (Blueprint $table) {
            // Revert to old enum values
            \DB::statement("ALTER TABLE staff_check_in_check_outs MODIFY COLUMN status ENUM('present', 'absent', 'leave') DEFAULT 'present'");
            
            // Update records back to old values
            \DB::statement("UPDATE staff_check_in_check_outs SET status = 'present' WHERE status = 'checked_in'");
            \DB::statement("UPDATE staff_check_in_check_outs SET status = 'absent' WHERE status = 'checked_out'");
            \DB::statement("UPDATE staff_check_in_check_outs SET status = 'leave' WHERE status = 'pending'");
        });
    }
};
