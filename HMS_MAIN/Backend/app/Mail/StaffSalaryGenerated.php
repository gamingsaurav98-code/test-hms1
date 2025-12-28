<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StaffSalaryGenerated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public \App\Models\Payroll $payroll,
        public \App\Models\User $staff
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Monthly Salary Generated - {$this->payroll->nepali_date}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.staff-salary-generated',
            with: [
                'payroll' => $this->payroll,
                'staff' => $this->staff,
                'bsDate' => $this->payroll->nepali_date,
                'basicSalary' => $this->payroll->basic_salary,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
