<?php

namespace App\Console\Commands;

use App\Services\FeeGenerationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class StudentGenerateMonthlyFees extends Command
{
    protected $signature = 'student:fees:generate {--force : Force generation regardless of date}';
    protected $description = 'Generate monthly fee invoices for active students (runs on B.S. month start)';

    public function handle(): int
    {
        $force = $this->option('force');

        if (!$force && !$this->isFirstDayOfBsMonth()) {
            $this->info('Not the first day of B.S. month. Skipping fee generation.');
            Log::info('Monthly fee generation skipped - not first day of B.S. month');
            return self::SUCCESS;
        }

        $this->info('Starting monthly fee generation...');
        Log::info('Monthly fee generation started');

        $service = new \App\Services\StudentFeeGenerationService();
        $stats = $service->generateMonthlyFees();

        $this->info("Fee generation completed:");
        $this->info("- Processed: {$stats['processed']} students");
        $this->info("- Invoices created: {$stats['invoices_created']}");
        $this->info("- Skipped (existing): {$stats['skipped_existing']}");
        $this->info("- Errors: {$stats['errors']}");

        Log::info('Monthly fee generation completed', $stats);

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
