<?php

namespace App\Services;

use App\Models\User;
use App\Models\Payroll;
use App\Mail\StaffSalaryGenerated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class StaffPayrollGenerationService
{
    public function generateMonthlyPayrolls(): array
    {
        $stats = [
            'processed' => 0,
            'payrolls_created' => 0,
            'skipped_existing' => 0,
            'errors' => 0
        ];

        $currentBs = $this->getCurrentBsDate();

        // Get staff users with active status and salary amount
        User::where('role', 'staff')
            ->where('is_active', true)
            ->whereHas('staffProfile', function ($query) {
                $query->whereNotNull('salary_amount')
                      ->where('salary_amount', '>', 0);
            })
            ->with('staffProfile')
            ->chunk(100, function ($staffUsers) use ($currentBs, &$stats) {
                foreach ($staffUsers as $user) {
                    $stats['processed']++;

                    try {
                        // Check if payroll already exists for this B.S. month
                        $existingPayroll = Payroll::where('staff_id', $user->id)
                            ->where('billing_month_bs', $currentBs['month'])
                            ->where('billing_year_bs', $currentBs['year'])
                            ->exists();

                        if ($existingPayroll) {
                            $stats['skipped_existing']++;
                            continue;
                        }

                        // Create payroll atomically
                        DB::transaction(function () use ($user, $currentBs, &$stats) {
                            $payroll = Payroll::create([
                                'payroll_number' => $this->generatePayrollNumber($user->id, $currentBs),
                                'staff_id' => $user->id,
                                'basic_salary' => $user->staffProfile->salary_amount,
                                'billing_month_bs' => $currentBs['month'],
                                'billing_year_bs' => $currentBs['year'],
                                'nepali_date' => $currentBs['full_date'],
                            ]);

                            // Queue notification email
                            if ($user->email) {
                                Mail::to($user->email)->queue(
                                    new StaffSalaryGenerated($payroll, $user)
                                );
                            }

                            $stats['payrolls_created']++;

                            Log::info("Generated payroll {$payroll->payroll_number} for staff {$user->id}", [
                                'staff_name' => $user->name,
                                'staff_email' => $user->email,
                                'basic_salary' => $user->staffProfile->salary_amount,
                                'bs_date' => $currentBs['full_date'],
                                'ad_date' => $currentBs['ad_date'],
                                'payroll_id' => $payroll->id
                            ]);

                            // Alert: Log a warning if payroll creation is high volume (potential issue)
                            if ($stats['payrolls_created'] > 100) {
                                Log::warning("High volume payroll creation detected: {$stats['payrolls_created']} payrolls created in this run");
                            }
                        });

                    } catch (\Exception $e) {
                        $stats['errors']++;
                        Log::error("Failed to generate payroll for staff {$user->id}: " . $e->getMessage());
                    }
                }
            });

        return $stats;
    }

    private function generatePayrollNumber(int $staffId, array $bsDate): string
    {
        return sprintf(
            'PAY-BS%d-%02d-%d',
            $bsDate['year'],
            $bsDate['month'],
            $staffId
        );
    }

    private function getCurrentBsDate(): array
    {
        $now = \Carbon\Carbon::now(timezone: 'Asia/Kathmandu');
        $nepaliDate = new \Nilambar\NepaliDate\NepaliDate();
        $current = $nepaliDate->getDetails((int) $now->year, (int) $now->format('m'), (int) $now->format('d'), 'ad');

        return [
            'month' => (int) $current['n'], // numeric month
            'year' => (int) $current['Y'],  // 4-digit year
            'full_date' => $current['Y'] . '-' . $current['m'] . '-' . $current['d'],
            'ad_date' => $now->format('Y-m-d')
        ];
    }
}