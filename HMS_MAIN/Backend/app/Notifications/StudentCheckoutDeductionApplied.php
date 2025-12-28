<?php

namespace App\Notifications;

use App\Models\StudentCheckInCheckOut;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class StudentCheckoutDeductionApplied extends Notification
{
    use Queueable;

    public function __construct(
        public StudentCheckInCheckOut $checkout,
        public array $calculation
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Check-out Approved - Fee Adjustment Applied')
            ->greeting("Dear {$notifiable->student_name},")
            ->line("Your check-out request has been approved.")
            ->line("**Check-out Date:** {$this->checkout->date}")
            ->line("**Check-out Time:** {$this->checkout->requested_checkout_time}")
            ->line("**Check-in Time:** {$this->checkout->requested_checkin_time}")
            ->line("**Duration:** {$this->checkout->checkout_duration} days")
            ->line("**Rule Applied:** {$this->calculation['rule_applied']}")
            ->line("**Monthly Fee:** Rs. " . number_format($this->checkout->student->monthly_fee, 2))
            ->line("**Deduction Amount:** Rs. " . number_format($this->calculation['deduction_amount'], 2))
            ->line("**Adjusted Fee:** Rs. " . number_format($this->calculation['adjusted_fee'], 2))
            ->action('View Details', url('/student/dashboard'))
            ->salutation('Best regards, HMS Administration');
    }
}