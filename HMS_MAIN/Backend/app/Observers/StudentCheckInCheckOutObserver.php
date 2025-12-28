<?php

namespace App\Observers;

use App\Models\StudentCheckInCheckOut;
use App\Mail\StudentCheckInCheckOutApproved;
use Illuminate\Support\Facades\Mail;

class StudentCheckInCheckOutObserver
{
    /**
     * Handle the StudentCheckInCheckOut "updated" event.
     * Send notification when status is approved or rejected
     */
    public function updated(StudentCheckInCheckOut $checkInOut): void
    {
        // Only send email if status has changed
        if ($checkInOut->isDirty('status')) {
            try {
                $status = $checkInOut->status;
                if (in_array($status, ['approved', 'rejected'])) {
                    // Load student relationship if not already loaded
                    if (!$checkInOut->relationLoaded('student')) {
                        $checkInOut->load('student');
                    }
                    
                    if ($checkInOut->student && $checkInOut->student->email) {
                        Mail::to($checkInOut->student->email)->send(
                            new StudentCheckInCheckOutApproved(
                                $checkInOut,
                                $checkInOut->student->student_name ?? $checkInOut->student->name ?? 'Student',
                                $checkInOut->student->email,
                                $status
                            )
                        );
                    }
                }
            } catch (\Exception $e) {
                \Log::error('Failed to send CheckInCheckOut status email: ' . $e->getMessage());
            }
        }
    }

    /**
     * Handle the StudentCheckInCheckOut "created" event.
     */
    public function created(StudentCheckInCheckOut $checkInOut): void
    {
        //
    }

    /**
     * Handle the StudentCheckInCheckOut "deleted" event.
     */
    public function deleted(StudentCheckInCheckOut $checkInOut): void
    {
        //
    }

    /**
     * Handle the StudentCheckInCheckOut "restored" event.
     */
    public function restored(StudentCheckInCheckOut $checkInOut): void
    {
        //
    }

    /**
     * Handle the StudentCheckInCheckOut "force deleted" event.
     */
    public function forceDeleted(StudentCheckInCheckOut $checkInOut): void
    {
        //
    }
}
