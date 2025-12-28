<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StudentMonthlyFeeGenerated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public \App\Models\Invoice $invoice,
        public \App\Models\Student $student
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Monthly Fee Invoice - {$this->invoice->nepali_date}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.student-monthly-fee-generated',
            with: [
                'invoice' => $this->invoice,
                'student' => $this->student,
                'bsDate' => $this->invoice->nepali_date,
                'amount' => $this->invoice->amount,
                'dueDate' => $this->invoice->due_date->format('M d, Y'),
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
