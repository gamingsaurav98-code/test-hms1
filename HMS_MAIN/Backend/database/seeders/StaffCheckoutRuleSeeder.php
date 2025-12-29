<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StaffCheckoutRuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\CheckInCheckOutRule::updateOrCreate(
            ['user_id' => null, 'user_type' => 'staff'], // Universal rule
            [
                'user_type' => 'staff',
                'user_id' => null,
                'is_active' => true,
                'active_after_days' => 8, // Deduct after 8 days
                'percentage' => 1, // 1% deduction to match student
                'name' => 'Universal Checkout Deduction',
                'description' => 'Default deduction rule applied to all staff after 8 days of checkout.',
                'deduction_type' => 'percentage',
                'deduction_value' => 1,
                'priority' => 1,
            ]
        );
    }
}
