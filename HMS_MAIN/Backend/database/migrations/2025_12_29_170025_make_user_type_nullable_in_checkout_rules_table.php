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
        Schema::table('checkout_rules', function (Blueprint $table) {
            $table->string('user_type')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('checkout_rules', function (Blueprint $table) {
            $table->enum('user_type', ['student', 'staff'])->nullable(false)->change();
        });
    }
};
