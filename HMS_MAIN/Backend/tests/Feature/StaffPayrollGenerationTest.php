<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Staff;
use App\Models\Payroll;
use App\Services\StaffPayrollGenerationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class StaffPayrollGenerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_generates_payroll_with_staff_salary()
    {
        // Create a staff user and staff record
        $user = User::create([
            'name' => 'Test Staff',
            'email' => 'staff@example.com',
            'password' => bcrypt('password'),
            'role' => 'staff',
            'is_active' => true,
        ]);

        $staff = Staff::create([
            'staff_id' => 'STF001',
            'user_id' => $user->id,
            'staff_name' => 'Test Staff',
            'date_of_birth' => '1990-01-01',
            'contact_number' => '1234567890',
            'email' => 'staff@example.com',
            'salary_amount' => 25000.00,
            'is_active' => true,
        ]);

        // Run payroll generation
        $service = new StaffPayrollGenerationService();
        $stats = $service->generateMonthlyPayrolls();

        // Assert payroll was created
        $this->assertEquals(1, $stats['payrolls_created']);
        $this->assertDatabaseHas('payrolls', [
            'staff_id' => $user->id,
            'basic_salary' => 25000.00,
        ]);
    }

    public function test_prevents_duplicate_payrolls_for_same_bs_month()
    {
        $user = User::create([
            'name' => 'Test Staff 2',
            'email' => 'staff2@example.com',
            'password' => bcrypt('password'),
            'role' => 'staff',
            'is_active' => true,
        ]);

        $staff = Staff::create([
            'staff_id' => 'STF002',
            'user_id' => $user->id,
            'staff_name' => 'Test Staff 2',
            'date_of_birth' => '1990-01-01',
            'contact_number' => '1234567891',
            'email' => 'staff2@example.com',
            'salary_amount' => 30000.00,
            'is_active' => true,
        ]);

        // Create existing payroll for current B.S. month
        $nepaliDate = new \Nilambar\NepaliDate\NepaliDate();
        $current = $nepaliDate->getDetails(date('Y'), date('m'), date('d'), 'ad');
        Payroll::create([
            'payroll_number' => 'PAY-BS' . $current['Y'] . '-' . $current['m'] . '-' . $user->id,
            'staff_id' => $user->id,
            'basic_salary' => 30000.00,
            'billing_month_bs' => (int) $current['n'],
            'billing_year_bs' => (int) $current['Y'],
            'nepali_date' => $current['Y'] . '-' . $current['m'] . '-' . $current['d'],
        ]);

        // Run payroll generation again
        $service = new StaffPayrollGenerationService();
        $stats = $service->generateMonthlyPayrolls();

        // Assert no new payroll was created
        $this->assertEquals(0, $stats['payrolls_created']);
        $this->assertEquals(1, $stats['skipped_existing']);
    }

    public function test_only_processes_active_staff_with_salaries()
    {
        // Create staff with different scenarios
        $inactiveUser = User::create([
            'name' => 'Inactive Staff',
            'email' => 'inactive@example.com',
            'password' => bcrypt('password'),
            'role' => 'staff',
            'is_active' => false,
        ]);

        $inactiveStaff = Staff::create([
            'staff_id' => 'STF003',
            'user_id' => $inactiveUser->id,
            'staff_name' => 'Inactive Staff',
            'date_of_birth' => '1990-01-01',
            'contact_number' => '1234567892',
            'email' => 'inactive@example.com',
            'salary_amount' => 20000.00,
            'is_active' => true,
        ]);

        $noSalaryUser = User::create([
            'name' => 'No Salary Staff',
            'email' => 'nosalary@example.com',
            'password' => bcrypt('password'),
            'role' => 'staff',
            'is_active' => true,
        ]);

        $noSalaryStaff = Staff::create([
            'staff_id' => 'STF004',
            'user_id' => $noSalaryUser->id,
            'staff_name' => 'No Salary Staff',
            'date_of_birth' => '1990-01-01',
            'contact_number' => '1234567893',
            'email' => 'nosalary@example.com',
            'salary_amount' => null,
            'is_active' => true,
        ]);

        $activeUser = User::create([
            'name' => 'Active Staff',
            'email' => 'active@example.com',
            'password' => bcrypt('password'),
            'role' => 'staff',
            'is_active' => true,
        ]);

        $activeStaff = Staff::create([
            'staff_id' => 'STF005',
            'user_id' => $activeUser->id,
            'staff_name' => 'Active Staff',
            'date_of_birth' => '1990-01-01',
            'contact_number' => '1234567894',
            'email' => 'active@example.com',
            'salary_amount' => 35000.00,
            'is_active' => true,
        ]);

        $service = new StaffPayrollGenerationService();
        $stats = $service->generateMonthlyPayrolls();

        // Should only process the active staff with salary
        $this->assertEquals(1, $stats['processed']);
        $this->assertEquals(1, $stats['payrolls_created']);
    }

    public function test_creates_payroll_only_on_bs_day_one()
    {
        // Create a staff user and record
        $user = User::create([
            'name' => 'Test Staff',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role' => 'staff',
            'is_active' => true,
        ]);

        $staff = Staff::create([
            'staff_id' => 'STF006',
            'user_id' => $user->id,
            'staff_name' => 'Test Staff',
            'date_of_birth' => '1990-01-01',
            'contact_number' => '1234567890',
            'email' => 'test@example.com',
            'salary_amount' => 28000.00,
            'is_active' => true,
        ]);

        // Get current B.S. date
        $nepaliDate = new \Nilambar\NepaliDate\NepaliDate();
        $current = $nepaliDate->getDetails(date('Y'), date('m'), date('d'), 'ad');
        $currentYear = (int) $current['Y'];
        $currentMonth = (int) $current['n'];

        // Ensure no existing payroll for this B.S. month
        Payroll::where('staff_id', $user->id)
            ->where('billing_year_bs', $currentYear)
            ->where('billing_month_bs', $currentMonth)
            ->delete();

        $service = new StaffPayrollGenerationService();
        $stats = $service->generateMonthlyPayrolls();

        // Assert payroll was created
        $this->assertEquals(1, $stats['payrolls_created']);
        $this->assertDatabaseHas('payrolls', [
            'staff_id' => $user->id,
            'billing_year_bs' => $currentYear,
            'billing_month_bs' => $currentMonth,
            'basic_salary' => 28000.00,
        ]);

        // Run again to ensure no duplicate
        $stats2 = $service->generateMonthlyPayrolls();
        $this->assertEquals(0, $stats2['payrolls_created']);
        $this->assertEquals(1, $stats2['skipped_existing']);
    }
}