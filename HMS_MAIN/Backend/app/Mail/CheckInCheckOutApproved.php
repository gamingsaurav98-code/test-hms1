<?php

namespace App\Mail;

use App\Models\StudentCheckInCheckOut;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CheckInCheckOutApproved extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public StudentCheckInCheckOut $record,
        public string $studentName,
        public string $studentEmail,
        public string $status // 'approved', 'rejected'
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->status === 'approved' 
            ? 'Check-In/Check-Out Request Approved' 
            : 'Check-In/Check-Out Request Rejected';

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.checkin_checkout_approved',
            with: [
                'record' => $this->record,
                'studentName' => $this->studentName,
                'studentEmail' => $this->studentEmail,
                'status' => $this->status,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
