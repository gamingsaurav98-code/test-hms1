<?php

namespace App\Services;

use App\Models\Student;
use App\Models\Invoice;
use App\Mail\MonthlyFeeGenerated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class StudentFeeGenerationService
{
    public function generateMonthlyFees(): array
    {
        $stats = [
            'processed' => 0,
            'invoices_created' => 0,
            'skipped_existing' => 0,
            'errors' => 0
        ];

        $currentBs = $this->getCurrentBsDate();

        Student::where('is_active', true)
            ->whereNotNull('monthly_fee')
            ->where('monthly_fee', '>', 0)
            ->chunk(100, function ($students) use ($currentBs, &$stats) {
                foreach ($students as $student) {
                    $stats['processed']++;

                    try {
                        // Check if invoice already exists for this B.S. month
                        $existingInvoice = Invoice::where('student_id', $student->id)
                            ->where('billing_month_bs', $currentBs['month'])
                            ->where('billing_year_bs', $currentBs['year'])
                            ->exists();

                        if ($existingInvoice) {
                            $stats['skipped_existing']++;
                            continue;
                        }

                        // Create invoice atomically
                        DB::transaction(function () use ($student, $currentBs, &$stats) {
                            $invoice = Invoice::create([
                                'invoice_number' => $this->generateInvoiceNumber($student->id, $currentBs),
                                'student_id' => $student->id,
                                'amount' => $student->monthly_fee, // Admin-defined fee
                                'billing_month_bs' => $currentBs['month'],
                                'billing_year_bs' => $currentBs['year'],
                                'nepali_date' => $currentBs['full_date'],
                                'due_date' => now()->addDays(30), // 30 days to pay
                            ]);

            // Queue notification email
            if ($student->email) {
                Mail::to($student->email)->queue(
                    new \App\Mail\StudentMonthlyFeeGenerated($invoice, $student)
                );
            }                            $stats['invoices_created']++;

                            Log::info("Generated invoice {$invoice->invoice_number} for student {$student->id}", [
                                'student_name' => $student->name,
                                'student_email' => $student->email,
                                'amount' => $student->monthly_fee,
                                'bs_date' => $currentBs['full_date'],
                                'ad_date' => $currentBs['ad_date'],
                                'due_date' => $invoice->due_date->format('Y-m-d'),
                                'invoice_id' => $invoice->id
                            ]);

                            // Alert: Log a warning if invoice creation is high volume (potential issue)
                            if ($stats['invoices_created'] > 100) {
                                Log::warning("High volume invoice creation detected: {$stats['invoices_created']} invoices created in this run");
                            }
                        });

                    } catch (\Exception $e) {
                        $stats['errors']++;
                        Log::error("Failed to generate invoice for student {$student->id}: " . $e->getMessage());
                    }
                }
            });

        return $stats;
    }

    private function generateInvoiceNumber(int $studentId, array $bsDate): string
    {
        return sprintf(
            'INV-BS%d-%02d-%d',
            $bsDate['year'],
            $bsDate['month'],
            $studentId
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