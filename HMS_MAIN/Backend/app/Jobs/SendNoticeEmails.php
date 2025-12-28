<?php

namespace App\Jobs;

use App\Models\Notice;
use App\Models\Student;
use App\Models\Staff;
use App\Mail\AdminNoticeCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendNoticeEmails implements ShouldQueue
{
    use Queueable;

    protected Notice $notice;

    /**
     * Create a new job instance.
     */
    public function __construct(Notice $notice)
    {
        $this->notice = $notice;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $successCount = 0;
        $failureCount = 0;

        // Use the same logic as NoticeObserver to respect target_type
        match ($this->notice->target_type) {
            'all' => $this->sendToAllUsers($successCount, $failureCount),
            'student' => $this->sendToStudents($successCount, $failureCount),
            'staff' => $this->sendToStaff($successCount, $failureCount),
            'specific_student' => $this->sendToSpecificStudent($successCount, $failureCount),
            'specific_staff' => $this->sendToSpecificStaff($successCount, $failureCount),
            'block' => $this->sendToBlockStudents($successCount, $failureCount),
            default => \Log::warning("Unknown target_type: {$this->notice->target_type} for notice {$this->notice->id}"),
        };

        \Log::info("Manual notice send {$this->notice->id} completed: {$successCount} sent, {$failureCount} failed");
    }

    private function sendToAllUsers(&$successCount, &$failureCount): void
    {
        // Send to all students only
        Student::whereNotNull('email')->chunk(100, function ($students) use (&$successCount, &$failureCount) {
            foreach ($students as $student) {
                $this->sendEmailToUser($student, $student->student_name, $student->email, $successCount, $failureCount);
            }
        });
    }

    private function sendToStudents(&$successCount, &$failureCount): void
    {
        Student::whereNotNull('email')->chunk(100, function ($students) use (&$successCount, &$failureCount) {
            foreach ($students as $student) {
                $this->sendEmailToUser($student, $student->student_name, $student->email, $successCount, $failureCount);
            }
        });
    }

    private function sendToStaff(&$successCount, &$failureCount): void
    {
        Staff::whereNotNull('email')->chunk(100, function ($staff) use (&$successCount, &$failureCount) {
            foreach ($staff as $staffMember) {
                $this->sendEmailToUser($staffMember, $staffMember->staff_name, $staffMember->email, $successCount, $failureCount);
            }
        });
    }

    private function sendToSpecificStudent(&$successCount, &$failureCount): void
    {
        if ($this->notice->student_id) {
            $student = Student::find($this->notice->student_id);
            if ($student && $student->email) {
                $this->sendEmailToUser($student, $student->student_name, $student->email, $successCount, $failureCount);
            }
        }
    }

    private function sendToSpecificStaff(&$successCount, &$failureCount): void
    {
        if ($this->notice->staff_id) {
            $staff = Staff::find($this->notice->staff_id);
            if ($staff && $staff->email) {
                $this->sendEmailToUser($staff, $staff->staff_name, $staff->email, $successCount, $failureCount);
            }
        }
    }

    private function sendToBlockStudents(&$successCount, &$failureCount): void
    {
        if ($this->notice->block_id) {
            Student::whereHas('room', function($query) {
                $query->whereHas('block', function($blockQuery) {
                    $blockQuery->where('id', $this->notice->block_id);
                });
            })->whereNotNull('email')->chunk(100, function ($students) use (&$successCount, &$failureCount) {
                foreach ($students as $student) {
                    $this->sendEmailToUser($student, $student->student_name, $student->email, $successCount, $failureCount);
                }
            });
        }
    }

    private function sendEmailToUser($user, string $name, string $email, &$successCount, &$failureCount): void
    {
        try {
            \Log::info("Manually sending notice {$this->notice->id} to: {$email} ({$name})");

            Mail::to($email)->send(
                new AdminNoticeCreated(
                    $this->notice,
                    $name,
                    $email
                )
            );

            $successCount++;
            \Log::info("Successfully sent notice {$this->notice->id} to: {$email}");

        } catch (\Exception $e) {
            $failureCount++;
            \Log::error("Failed to send notice {$this->notice->id} to {$email}: " . $e->getMessage());
        }
    }
}
