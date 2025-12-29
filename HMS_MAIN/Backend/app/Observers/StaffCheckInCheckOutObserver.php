<?php

namespace App\Observers;

use App\Models\StaffCheckInCheckOut;
use App\Mail\StaffCheckInCheckOutApproved;
use Illuminate\Support\Facades\Mail;

class StaffCheckInCheckOutObserver
{
    /**
     * Handle the StaffCheckInCheckOut "updated" event.
     * Send notification when status is approved or rejected
     */
    public function updated(StaffCheckInCheckOut $checkInOut): void
    {
        // Only send email if status has changed
        if ($checkInOut->isDirty('status')) {
            try {
                $status = $checkInOut->status;
                if (in_array($status, ['approved', 'rejected'])) {
                    // Load staff relationship if not already loaded
                    if (!$checkInOut->relationLoaded('staff')) {
                        $checkInOut->load('staff');
                    }
                    
                    if ($checkInOut->staff && $checkInOut->staff->email) {
                        Mail::to($checkInOut->staff->email)->send(
                            new StaffCheckInCheckOutApproved(
                                $checkInOut,
                                $checkInOut->staff->staff_name ?? $checkInOut->staff->name ?? 'Staff',
                                $checkInOut->staff->email,
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
     * Handle the StaffCheckInCheckOut "created" event.
     */
    public function created(StaffCheckInCheckOut $checkInOut): void
    {
        //
    }

    /**
     * Handle the StaffCheckInCheckOut "deleted" event.
     */
    public function deleted(StaffCheckInCheckOut $checkInOut): void
    {
        //
    }

    /**
     * Handle the StaffCheckInCheckOut "restored" event.
     */
    public function restored(StaffCheckInCheckOut $checkInOut): void
    {
        //
    }

    /**
     * Handle the StaffCheckInCheckOut "force deleted" event.
     */
    public function forceDeleted(StaffCheckInCheckOut $checkInOut): void
    {
        //
    }
}