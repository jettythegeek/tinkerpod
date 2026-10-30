<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Child;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ChildProfileLockedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly Child $child,
        public readonly int $lockoutMinutes,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("TinkerPod: {$this->child->first_name}'s profile needs a quick unlock")
            ->line("{$this->child->first_name}'s TinkerPod profile was paused for {$this->lockoutMinutes} minutes after 5 incorrect PIN attempts.")
            ->line('You can unlock their profile or reset their PIN anytime from Parent Mode in the TinkerPod app.');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'child_profile_locked',
            'child_id' => $this->child->public_id,
            'child_first_name' => $this->child->first_name,
            'lockout_minutes' => $this->lockoutMinutes,
            'locked_until' => $this->child->locked_until?->toIso8601String(),
            'message' => "{$this->child->first_name}'s profile was locked for {$this->lockoutMinutes} minutes after 5 wrong PIN attempts.",
        ];
    }
}
