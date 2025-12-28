<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Staff;
use App\Models\Salary;
use Carbon\Carbon;

class SalarySeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing salaries
        Salary::truncate();
        
        // Get all staff members
        $staffMembers = Staff::all();
        
        foreach ($staffMembers as $staff) {
            // Use EXACT monthly_wage set by admin (no multipliers, no variations)
            $monthlyWage = $staff->monthly_wage ?? 15000;
            
            // Create 6 months of salary records (July 2025 - December 2025)
            for ($i = 6; $i >= 1; $i--) {
                $date = Carbon::now()->subMonths($i);
                $month = $date->month;
                $year = $date->year;
                
                // Current month (December 2025) is pending, others are paid
                $status = ($month === 12 && $year === 2025) ? 'pending' : 'paid';
                
                Salary::create([
                    'staff_id' => $staff->id,
                    'amount' => $monthlyWage, // Exact amount set by admin
                    'month' => $month,
                    'year' => $year,
                    'status' => $status,
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);
            }
        }
    }
}
