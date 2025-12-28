<?php

namespace App\Observers;

use App\Models\Complain;
use App\Mail\ComplaintUpdate;
use Illuminate\Support\Facades\Mail;

class ComplainObserver
{
    /**
     * Handle the Complain "created" event.
     */
    public function created(Complain $complain): void
    {
        try {
            Mail::to($complain->email)->send(
                new ComplaintUpdate(
                    $complain,
                    $complain->name,
                    $complain->email,
                    'created'
                )
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send Complaint created email: ' . $e->getMessage());
        }
    }

    /**
     * Handle the Complain "updated" event.
     */
    public function updated(Complain $complain): void
    {
        try {
            // Determine update type based on status changes
            $updateType = 'updated';
            
            if ($complain->isDirty('status')) {
                $status = $complain->status;
                if ($status === 'assigned' || $status === 'in_progress') {
                    $updateType = 'assigned';
                } elseif ($status === 'resolved' || $status === 'closed') {
                    $updateType = 'resolved';
                }
            }

            Mail::to($complain->email)->send(
                new ComplaintUpdate(
                    $complain,
                    $complain->name,
                    $complain->email,
                    $updateType
                )
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send Complaint updated email: ' . $e->getMessage());
        }
    }

    /**
     * Handle the Complain "deleted" event.
     */
    public function deleted(Complain $complain): void
    {
        //
    }

    /**
     * Handle the Complain "restored" event.
     */
    public function restored(Complain $complain): void
    {
        //
    }

    /**
     * Handle the Complain "force deleted" event.
     */
    public function forceDeleted(Complain $complain): void
    {
        //
    }
}
