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
            $successCount = 0;
            $failureCount = 0;

            // Determine recipients based on target_type and send emails in chunks
            match ($notice->target_type) {
                'all' => $this->sendToAllUsers($notice, $successCount, $failureCount),
                'student' => $this->sendToStudents($notice, $successCount, $failureCount),
                'staff' => $this->sendToStaff($notice, $successCount, $failureCount),
                'specific_student' => $this->sendToSpecificStudent($notice, $successCount, $failureCount),
                'specific_staff' => $this->sendToSpecificStaff($notice, $successCount, $failureCount),
                'block' => $this->sendToBlockStudents($notice, $successCount, $failureCount),
                default => \Log::warning("Unknown target_type: {$notice->target_type} for notice {$notice->id}"),
            };

            \Log::info("Notice {$notice->id} email distribution completed: {$successCount} sent, {$failureCount} failed");

        } catch (\Exception $e) {
            \Log::error('Failed to process Notice created event: ' . $e->getMessage());
        }
    }

    private function sendToAllUsers(Notice $notice, &$successCount, &$failureCount): void
    {
        // Send to all students and staff
        \App\Models\Student::whereNotNull('email')->chunk(100, function ($students) use ($notice, &$successCount, &$failureCount) {
            foreach ($students as $student) {
                $this->sendEmailToUser($notice, $student, $student->student_name, $student->email, $successCount, $failureCount);
            }
        });

        \App\Models\Staff::whereNotNull('email')->chunk(100, function ($staff) use ($notice, &$successCount, &$failureCount) {
            foreach ($staff as $staffMember) {
                $this->sendEmailToUser($notice, $staffMember, $staffMember->staff_name, $staffMember->email, $successCount, $failureCount);
            }
        });
    }

    private function sendToStudents(Notice $notice, &$successCount, &$failureCount): void
    {
        \App\Models\Student::whereNotNull('email')->chunk(100, function ($students) use ($notice, &$successCount, &$failureCount) {
            foreach ($students as $student) {
                $this->sendEmailToUser($notice, $student, $student->student_name, $student->email, $successCount, $failureCount);
            }
        });
    }

    private function sendToStaff(Notice $notice, &$successCount, &$failureCount): void
    {
        \App\Models\Staff::whereNotNull('email')->chunk(100, function ($staff) use ($notice, &$successCount, &$failureCount) {
            foreach ($staff as $staffMember) {
                $this->sendEmailToUser($notice, $staffMember, $staffMember->staff_name, $staffMember->email, $successCount, $failureCount);
            }
        });
    }

    private function sendToSpecificStudent(Notice $notice, &$successCount, &$failureCount): void
    {
        if ($notice->student_id) {
            $student = \App\Models\Student::find($notice->student_id);
            if ($student && $student->email) {
                $this->sendEmailToUser($notice, $student, $student->student_name, $student->email, $successCount, $failureCount);
            }
        }
    }

    private function sendToSpecificStaff(Notice $notice, &$successCount, &$failureCount): void
    {
        if ($notice->staff_id) {
            $staff = \App\Models\Staff::find($notice->staff_id);
            if ($staff && $staff->email) {
                $this->sendEmailToUser($notice, $staff, $staff->staff_name, $staff->email, $successCount, $failureCount);
            }
        }
    }

    private function sendToBlockStudents(Notice $notice, &$successCount, &$failureCount): void
    {
        if ($notice->block_id) {
            \App\Models\Student::whereHas('room', function($query) use ($notice) {
                $query->whereHas('block', function($blockQuery) use ($notice) {
                    $blockQuery->where('id', $notice->block_id);
                });
            })->whereNotNull('email')->chunk(100, function ($students) use ($notice, &$successCount, &$failureCount) {
                foreach ($students as $student) {
                    $this->sendEmailToUser($notice, $student, $student->student_name, $student->email, $successCount, $failureCount);
                }
            });
        }
    }

    private function sendEmailToUser(Notice $notice, $user, string $name, string $email, &$successCount, &$failureCount): void
    {
        try {
            \Log::info("Sending notice {$notice->id} to: {$email} ({$name})");

            Mail::to($email)->send(
                new AdminNoticeCreated(
                    $notice,
                    $name,
                    $email
                )
            );

            $successCount++;
            \Log::info("Successfully sent notice {$notice->id} to: {$email}");

        } catch (\Exception $e) {
            $failureCount++;
            \Log::error("Failed to send notice {$notice->id} to {$email}: " . $e->getMessage());
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
