<?php

namespace Tests\Feature;

use App\Models\CheckoutRule;
use App\Models\StudentCheckInCheckOut;
use App\Models\Student;
use App\Models\Block;
use App\Services\StudentCheckoutDeductionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentCheckoutDeductionTest extends TestCase
{
    use RefreshDatabase;

    public function testDeductionFor16Days()
    {
        // Create the universal rule: >=15 days with 10% deduction
        $rule = CheckoutRule::create([
            'user_type' => 'student',
            'user_id' => null, // universal
            'name' => 'checkout duration >= 15 days',
            'description' => 'checkout duration >= 15 days',
            'is_active' => true,
            'deduction_type' => 'percentage',
            'deduction_value' => 10,
            'min_days' => 15,
            'max_days' => null,
            'priority' => 1,
        ]);

        // Create a block
        $block = Block::create([
            'block_name' => 'Block A',
            'location' => 'Main Campus',
            'capacity' => 100,
        ]);

        // Create student Saurav with email gamingsaurav98@gmail.com and Rs. 1000 fee
        $student = Student::factory()->create([
            'student_name' => 'Saurav',
            'email' => 'gamingsaurav98@gmail.com',
            'monthly_fee' => 1000
        ]);

        // Create check-out request for 16 days
        $checkout = StudentCheckInCheckOut::create([
            'student_id' => $student->id,
            'block_id' => $block->id,
            'checkout_duration' => 16,
            'date' => '2024-01-01',
            'status' => 'pending',
        ]);

        // Calculate deduction
        $service = app(StudentCheckoutDeductionService::class);
        $calculation = $service->calculateDeduction($checkout);

        // Expected: 10% of 1000 = 100, prorated by 16/30 ≈ 0.5333, so ~53.33 deduction
        $expectedDeduction = (10 / 100) * 1000 * (16 / 30);
        $expectedAdjustedFee = 1000 - $expectedDeduction;

        $this->assertEquals(round($expectedDeduction, 2), $calculation['deduction_amount']);
        $this->assertEquals(round($expectedAdjustedFee, 2), $calculation['adjusted_fee']);
        $this->assertEquals('checkout duration >= 15 days', $calculation['rule_applied']);
    }
}