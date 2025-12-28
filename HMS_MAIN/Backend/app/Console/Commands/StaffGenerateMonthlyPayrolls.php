<?php

namespace App\Console\Commands;

use App\Services\StaffPayrollGenerationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class StaffGenerateMonthlyPayrolls extends Command
{
    protected $signature = 'staff:payrolls:generate {--force : Force generation regardless of date}';
    protected $description = 'Generate monthly payrolls for active staff (runs on B.S. month start)';

    public function handle(): int
    {
        $force = $this->option('force');

        if (!$force && !$this->isFirstDayOfBsMonth()) {
            $this->info('Not the first day of B.S. month. Skipping payroll generation.');
            Log::info('Monthly payroll generation skipped - not first day of B.S. month');
            return self::SUCCESS;
        }

        $this->info('Starting monthly payroll generation...');
        Log::info('Monthly payroll generation started');

        $service = new StaffPayrollGenerationService();
        $stats = $service->generateMonthlyPayrolls();

        $this->info("Payroll generation completed:");
        $this->info("- Processed: {$stats['processed']} staff");
        $this->info("- Payrolls created: {$stats['payrolls_created']}");
        $this->info("- Skipped (existing): {$stats['skipped_existing']}");
        $this->info("- Errors: {$stats['errors']}");

        Log::info('Monthly payroll generation completed', $stats);

        return self::SUCCESS;
    }

    private function isFirstDayOfBsMonth(): bool
    {
        $now = Carbon::now(timezone: 'Asia/Kathmandu');
        $nepaliDate = new \Nilambar\NepaliDate\NepaliDate();
        $current = $nepaliDate->getDetails((int) $now->year, (int) $now->format('m'), (int) $now->format('d'), 'ad');
        return (int) $current['d'] === 1; // Check if Nepali day equals 1
    }
}
