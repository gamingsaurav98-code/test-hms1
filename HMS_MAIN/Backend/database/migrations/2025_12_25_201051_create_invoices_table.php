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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->integer('billing_month_bs'); // B.S. month (1-12)
            $table->integer('billing_year_bs');  // B.S. year
            $table->string('nepali_date');       // Full B.S. date string
            $table->enum('status', ['pending', 'paid', 'overdue'])->default('pending');
            $table->timestamp('due_date');
            $table->timestamps();

            // Idempotency guard: Prevent duplicate invoices for same student/month/year
            $table->unique(['student_id', 'billing_month_bs', 'billing_year_bs'], 'unique_student_bs_billing');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
