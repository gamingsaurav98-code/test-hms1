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
        // Only add foreign key if checkout_rules table exists
        if (Schema::hasTable('checkout_rules') && Schema::hasTable('student_check_in_check_outs')) {
            try {
                Schema::table('student_check_in_check_outs', function (Blueprint $table) {
                    $table->foreign('checkout_rule_id')
                        ->references('id')
                        ->on('checkout_rules')
                        ->onDelete('set null');
                });
            } catch (\Exception $e) {
                // Foreign key might already exist, skip if so
                if (!str_contains($e->getMessage(), 'Duplicate key name')) {
                    throw $e;
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('student_check_in_check_outs')) {
            try {
                Schema::table('student_check_in_check_outs', function (Blueprint $table) {
                    $table->dropForeign(['checkout_rule_id']);
                });
            } catch (\Exception $e) {
                // Foreign key doesn't exist, skip
            }
        }
    }
};
