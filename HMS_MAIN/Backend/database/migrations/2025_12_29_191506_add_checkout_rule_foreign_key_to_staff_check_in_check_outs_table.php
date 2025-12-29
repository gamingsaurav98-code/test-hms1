<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Only add foreign key if checkincheckout_rules table exists
        if (Schema::hasTable('checkincheckout_rules') && Schema::hasTable('staff_check_in_check_outs')) {
            $connection = Schema::getConnection();
            $dbName = $connection->getDatabaseName();
            
            // Check if foreign key already exists
            $foreignKeyExists = $connection->selectOne("
                SELECT COUNT(*) as count
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = ?
                AND TABLE_NAME = 'staff_check_in_check_outs'
                AND COLUMN_NAME = 'checkout_rule_id'
                AND REFERENCED_TABLE_NAME = 'checkincheckout_rules'
                AND REFERENCED_COLUMN_NAME = 'id'
            ", [$dbName]);
            
            if ($foreignKeyExists && $foreignKeyExists->count > 0) {
                // Foreign key already exists, skip
                return;
            }
            
            // Add foreign key constraint
            Schema::table('staff_check_in_check_outs', function (Blueprint $table) {
                $table->foreign('checkout_rule_id')
                    ->references('id')
                    ->on('checkincheckout_rules')
                    ->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('staff_check_in_check_outs')) {
            try {
                Schema::table('staff_check_in_check_outs', function (Blueprint $table) {
                    $table->dropForeign(['checkout_rule_id']);
                });
            } catch (\Exception $e) {
                // Foreign key doesn't exist, skip
            }
        }
    }
};
