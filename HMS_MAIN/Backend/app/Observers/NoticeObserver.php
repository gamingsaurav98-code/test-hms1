<?php

namespace App\Observers;

use App\Models\Notice;
use App\Mail\AdminNoticeCreated;
use Illuminate\Support\Facades\Mail;

class NoticeObserver
{
    /**
     * Handle the Notice "created" event.
     */
    public function created(Notice $notice): void
    {
        try {
            // Get all students and send them the notice
            $students = \App\Models\Student::where('email', '!=', null)->get();
            
            if ($students->isEmpty()) {
                \Log::warning('No students with email found for notice distribution');
                return;
            }

            $successCount = 0;
            $failureCount = 0;

            foreach ($students as $student) {
                try {
                    Mail::to($student->email)->send(
                        new AdminNoticeCreated(
                            $notice, 
                            $student->student_name ?? $student->name ?? 'Student',
                            $student->email
                        )
                    );
                    $successCount++;
                } catch (\Exception $studentError) {
                    $failureCount++;
                    \Log::error('Failed to send notice to student ' . $student->id . ' (' . $student->email . '): ' . $studentError->getMessage());
                }
            }

            \Log::info("Notice {$notice->id} email distribution: {$successCount} sent, {$failureCount} failed");
        } catch (\Exception $e) {
            \Log::error('Failed to process Notice created event: ' . $e->getMessage());
        }
    }

    /**
     * Handle the Notice "updated" event.
     */
    public function updated(Notice $notice): void
    {
        //
    }

    /**
     * Handle the Notice "deleted" event.
     */
    public function deleted(Notice $notice): void
    {
        //
    }

    /**
     * Handle the Notice "restored" event.
     */
    public function restored(Notice $notice): void
    {
        //
    }

    /**
     * Handle the Notice "force deleted" event.
     */
    public function forceDeleted(Notice $notice): void
    {
        //
    }
}
