<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Salary;
use App\Models\Staff;

class SalarySeeder extends Seeder
{
    public function run()
    {
        $staffIds = Staff::pluck('id')->take(10);
        
        foreach ($staffIds as $staffId) {
            // Create salary for current month
            Salary::create([
                'staff_id' => $staffId,
                'amount' => rand(30000, 80000),
                'month' => 7,
                'year' => 2025,
                'status' => 'pending'
            ]);
            
            // Create salary for previous month
            Salary::create([
                'staff_id' => $staffId,
                'amount' => rand(30000, 80000),
                'month' => 6,
                'year' => 2025,
                'status' => 'paid'
            ]);
        }
        
        echo "Created " . Salary::count() . " salary records\n";
    }
}
