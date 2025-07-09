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
        Schema::create('inquiry_seaters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inquiry_id');
            $table->integer('seater_type'); // 1 for single, 2 for double, etc.
            $table->text('notes')->nullable(); // Any additional notes about their interest
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inquiry_seaters');
    }
};
