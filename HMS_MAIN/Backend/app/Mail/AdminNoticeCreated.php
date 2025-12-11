<?php

namespace App\Mail;

use App\Models\Notice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminNoticeCreated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Notice $notice,
        public string $recipientName,
        public string $recipientEmail
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Important Notice from Administration',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin_notice_created',
            with: [
                'notice' => $this->notice,
                'recipientName' => $this->recipientName,
                'recipientEmail' => $this->recipientEmail,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
