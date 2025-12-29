<?php

namespace App\Mail;

use App\Models\StaffCheckInCheckOut;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StaffCheckInCheckOutApproved extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public StaffCheckInCheckOut $record,
        public string $staffName,
        public string $staffEmail,
        public string $status // 'approved', 'rejected'
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->status === 'approved' 
            ? 'Staff Check-In/Check-Out Request Approved' 
            : 'Staff Check-In/Check-Out Request Rejected';

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.staff_checkin_checkout_approved',
            with: [
                'record' => $this->record,
                'staffName' => $this->staffName,
                'staffEmail' => $this->staffEmail,
                'status' => $this->status,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}