<?php

namespace App\Mail;

use App\Models\Complain;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ComplaintUpdate extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Complain $complaint,
        public string $recipientName,
        public string $recipientEmail,
        public string $updateType // 'created', 'assigned', 'resolved'
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            'created' => 'Your Complaint Has Been Received',
            'assigned' => 'Your Complaint Has Been Assigned',
            'resolved' => 'Your Complaint Has Been Resolved',
        ];

        return new Envelope(
            subject: $subjects[$this->updateType] ?? 'Complaint Update',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.complaint_update',
            with: [
                'complaint' => $this->complaint,
                'recipientName' => $this->recipientName,
                'recipientEmail' => $this->recipientEmail,
                'updateType' => $this->updateType,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
