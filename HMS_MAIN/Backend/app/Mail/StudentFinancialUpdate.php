<?php

namespace App\Mail;

use App\Models\StudentFinancial;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StudentFinancialUpdate extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public StudentFinancial $financial,
        public string $studentName,
        public string $studentEmail,
        public string $updateType // 'created', 'updated', 'payment_received'
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            'created' => 'New Financial Record Created',
            'updated' => 'Your Financial Record Has Been Updated',
            'payment_received' => 'Payment Received Confirmation',
        ];

        return new Envelope(
            subject: $subjects[$this->updateType] ?? 'Financial Update Notification',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.student_financial_update',
            with: [
                'financial' => $this->financial,
                'studentName' => $this->studentName,
                'studentEmail' => $this->studentEmail,
                'updateType' => $this->updateType,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
