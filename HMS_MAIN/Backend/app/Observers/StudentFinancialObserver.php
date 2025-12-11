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
        try {
            Mail::to($studentFinancial->student->email)->send(
                new StudentFinancialUpdate($studentFinancial, 'created')
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send StudentFinancial created email: ' . $e->getMessage());
        }
    }

    /**
     * Handle the StudentFinancial "updated" event.
     */
    public function updated(StudentFinancial $studentFinancial): void
    {
        try {
            Mail::to($studentFinancial->student->email)->send(
                new StudentFinancialUpdate($studentFinancial, 'updated')
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
