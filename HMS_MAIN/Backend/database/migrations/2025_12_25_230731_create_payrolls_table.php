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
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->string('payroll_number')->unique();
            $table->foreignId('staff_id')->constrained('users')->onDelete('cascade');
            $table->decimal('basic_salary', 10, 2);
            $table->string('billing_month_bs', 2);
            $table->string('billing_year_bs', 4);
            $table->date('nepali_date');
            $table->enum('status', ['pending', 'paid', 'failed'])->default('pending');
            $table->timestamp('payment_date')->nullable();
            $table->timestamps();

            // Composite unique index to prevent duplicate payrolls for same staff in same B.S. month/year
            $table->unique(['staff_id', 'billing_month_bs', 'billing_year_bs'], 'unique_staff_payroll_month_year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
