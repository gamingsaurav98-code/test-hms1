<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Payment;
use App\Models\Student;
use App\Models\Staff;
use App\Models\User;
use App\Mail\PaymentInitiatedStudent;
use App\Mail\PaymentNotificationAdmin;
use App\Mail\SalaryPaymentNotification;
use Illuminate\Support\Facades\Mail;

class TestPaymentEmail extends Command
{
    protected $signature = 'payment:test-email {type=student} {recipient=avi@example.com}';
    protected $description = 'Send test payment emails to verify configuration';

    public function handle()
    {
        $type = $this->argument('type');
        $recipient = $this->argument('recipient');

        $this->info("Testing payment email system...\n");
        $this->info("Type: $type");
        $this->info("Recipient: $recipient\n");

        try {
            if ($type === 'student') {
                $this->testStudentPaymentEmail($recipient);
            } elseif ($type === 'staff') {
                $this->testStaffPaymentEmail($recipient);
            } elseif ($type === 'admin') {
                $this->testAdminNotificationEmail($recipient);
            } else {
                $this->error("Invalid type. Use: student, staff, or admin");
                return;
            }

            $this->info("\n✓ Test email sent successfully!");
            $this->info("Check your Mailtrap inbox to verify delivery.");

        } catch (\Exception $e) {
            $this->error("Error sending email: " . $e->getMessage());
        }
    }

    private function testStudentPaymentEmail($email)
    {
        // Find or create test student
        $student = Student::where('email', $email)->first();
        
        if (!$student) {
            $this->info("Creating test student with email: $email");
            $student = Student::create([
                'student_name' => 'Test Student',
                'email' => $email,
                'date_of_birth' => '2002-01-01',
                'contact_number' => '9800000000',
                'district' => 'Kathmandu',
                'city_name' => 'Kathmandu',
                'ward_no' => '1',
                'street_name' => 'Test Street',
                'citizenship_no' => '123456789',
                'educational_institution' => 'Test University',
                'level_of_study' => 'Bachelor',
                'expected_stay_duration' => '4 years',
                'is_active' => true,
                'student_id' => 'ST' . time(),
            ]);
        }

        // Create test payment
        $payment = Payment::create([
            'student_id' => $student->id,
            'amount' => 5000,
            'payment_type' => 'tuition',
            'status' => 'pending',
            'transaction_id' => 'TEST-' . time(),
            'description' => 'Test Payment - First Semester Tuition',
            'notes' => 'This is a test payment email',
        ]);

        // Send email
        Mail::to($email)->send(
            new PaymentInitiatedStudent($payment, $student->student_name, $email)
        );

        $this->info("Student payment email created:");
        $this->info("  Student: {$student->student_name} ({$email})");
        $this->info("  Amount: ₹" . number_format($payment->amount, 2));
        $this->info("  Type: {$payment->payment_type}");
        $this->info("  Transaction ID: {$payment->transaction_id}");
    }

    private function testStaffPaymentEmail($email)
    {
        // Find staff by email
        $staff = Staff::where('email', $email)->first();
        
        if (!$staff) {
            $this->error("Staff with email '$email' not found.");
            $this->info("Available staff emails:");
            Staff::where('is_active', true)->pluck('email')->each(function ($e) {
                $this->info("  - $e");
            });
            return;
        }

        // Create test payment
        $payment = Payment::create([
            'staff_id' => $staff->id,
            'amount' => 15000,
            'payment_type' => 'salary',
            'status' => 'completed',
            'paid_at' => now(),
            'transaction_id' => 'SAL-' . time(),
            'description' => 'Monthly Salary - December 2024',
            'notes' => 'This is a test salary payment email',
        ]);

        // Send email
        Mail::to($email)->send(
            new SalaryPaymentNotification($payment, $staff->staff_name, $email)
        );

        $this->info("Staff salary payment email created:");
        $this->info("  Staff: {$staff->staff_name} ({$email})");
        $this->info("  Amount: ₹" . number_format($payment->amount, 2));
        $this->info("  Transaction ID: {$payment->transaction_id}");
    }

    private function testAdminNotificationEmail($email)
    {
        $admin = User::where('email', $email)->first();
        
        if (!$admin) {
            $this->error("Admin with email '$email' not found.");
            $this->info("Available admin emails:");
            User::where('role', 'admin')->pluck('email')->each(function ($e) {
                $this->info("  - $e");
            });
            return;
        }

        // Create test payment
        $payment = Payment::create([
            'amount' => 5000,
            'payment_type' => 'tuition',
            'status' => 'pending',
            'transaction_id' => 'TEST-' . time(),
            'description' => 'Test Payment Notification',
        ]);

        // Send notification
        Mail::to($email)->send(
            new \App\Mail\PaymentNotificationAdmin($payment, 'Test Student', 'student')
        );

        $this->info("Admin notification email created:");
        $this->info("  Admin: {$admin->name} ({$email})");
        $this->info("  Amount: ₹" . number_format($payment->amount, 2));
    }
}
