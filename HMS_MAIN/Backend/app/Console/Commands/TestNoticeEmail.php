<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Notice;
use App\Models\Student;
use App\Mail\AdminNoticeCreated;
use Illuminate\Support\Facades\Mail;

class TestNoticeEmail extends Command
{
    protected $signature = 'notice:test-email {recipient?}';
    protected $description = 'Test notice email by creating a test notice and sending to a student';

    public function handle()
    {
        $recipient = $this->argument('recipient');

        $this->info("Testing notice email system...\n");

        try {
            // Get first student with email
            $student = Student::whereNotNull('email')->first();

            if (!$student) {
                $this->error('❌ No student with email found in database');
                $this->info('Please create a student with an email address first.');
                return 1;
            }

            $this->info("Found student: " . $student->student_name);
            $this->info("Email: " . $student->email . "\n");

            // Create a test notice
            $notice = Notice::create([
                'title' => '[TEST] Emergency Maintenance Notice',
                'description' => 'This is a test notice email to verify the notification system is working correctly. Please ignore this message.',
                'status' => 'active',
                'notice_type' => 'general',
                'target_type' => 'all',
            ]);

            $this->info("✅ Created test notice: {$notice->title}");
            $this->info("Notice ID: {$notice->id}\n");

            // Send email directly to verify
            $this->info("Sending notice email...");
            Mail::to($student->email)->send(
                new AdminNoticeCreated(
                    $notice,
                    $student->student_name ?? 'Student',
                    $student->email
                )
            );

            $this->info("✅ Test notice email sent successfully!");
            $this->info("\nEmail Details:");
            $this->info("  • Recipient: " . $student->email);
            $this->info("  • Notice: " . $notice->title);
            $this->info("  • Description: " . substr($notice->description, 0, 50) . "...");
            $this->info("\n✅ Check your email inbox (or Mailtrap) to verify the email was received.");

            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Error sending notice email: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            return 1;
        }
    }
}
