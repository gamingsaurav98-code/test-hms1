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
        Schema::create('checkout_rules', function (Blueprint $table) {
            $table->id();
            $table->enum('user_type', ['student', 'staff']);
            $table->foreignId('user_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('active_after_days')->nullable();
            $table->integer('percentage')->nullable();
            $table->string('name')->nullable();
            $table->text('description')->nullable();
            $table->enum('deduction_type', ['percentage', 'fixed'])->default('percentage');
            $table->decimal('deduction_value', 8, 2);
            $table->integer('min_days')->nullable();
            $table->integer('max_days')->nullable();
            $table->integer('priority')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('checkout_rules');
    }
};
