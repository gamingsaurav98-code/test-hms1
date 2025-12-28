<?php

namespace App\Observers;

use App\Models\StudentFinancial;
use App\Mail\StudentFinancialUpdate;
use Illuminate\Support\Facades\Mail;

class StudentFinancialObserver
{
    /**
     * Handle the StudentFinancial "created" event.
     */
    public function created(StudentFinancial $studentFinancial): void
    {
        // Skip sending emails for newly created financial records
        // Only send emails for updates to avoid spam during student creation
        return;
    }

    /**
     * Handle the StudentFinancial "updated" event.
     */
    public function updated(StudentFinancial $studentFinancial): void
    {
        try {
            $student = $studentFinancial->student ?? null;
            if (!$student || empty($student->email)) {
                // No valid student or email to send to
                return;
            }

            $studentName = $student->student_name ?? $student->name ?? '';
            $studentEmail = $student->email ?? '';

            $studentName = is_string($studentName) ? $studentName : (string) $studentName;
            $studentEmail = is_string($studentEmail) ? $studentEmail : (string) $studentEmail;

            Mail::to($studentEmail)->send(
                new StudentFinancialUpdate(
                    $studentFinancial,
                    $studentName,
                    $studentEmail,
                    'updated'
                )
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send StudentFinancial updated email: ' . $e->getMessage());
        }
    }

    /**
     * Handle the StudentFinancial "deleted" event.
     */
    public function deleted(StudentFinancial $studentFinancial): void
    {
        //
    }

    /**
     * Handle the StudentFinancial "restored" event.
     */
    public function restored(StudentFinancial $studentFinancial): void
    {
        //
    }

    /**
     * Handle the StudentFinancial "force deleted" event.
     */
    public function forceDeleted(StudentFinancial $studentFinancial): void
    {
        //
    }
}
