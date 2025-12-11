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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->nullable()->constrained('students')->onDelete('cascade');
            $table->foreignId('staff_id')->nullable()->constrained('staff')->onDelete('cascade');
            $table->foreignId('admin_id')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('amount', 12, 2);
            $table->enum('payment_type', ['tuition', 'salary', 'hostel_fee', 'amenities', 'other'])->default('tuition');
            $table->string('description')->nullable();
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->string('transaction_id')->nullable()->unique();
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            
            // Polymorphic relationship to handle different payable models
            $table->morphs('payable');
            
            $table->timestamps();
            
            // Indexes for common queries
            $table->index('student_id');
            $table->index('staff_id');
            $table->index('admin_id');
            $table->index('status');
            $table->index('payment_type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
