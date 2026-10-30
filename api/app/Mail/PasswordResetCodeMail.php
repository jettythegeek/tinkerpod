<?php

declare(strict_types=1);

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $code,
        public readonly int $expiresInMinutes,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your TinkerPod Password Reset Code',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: sprintf(
                '<p>Your TinkerPod password reset code is <strong>%s</strong>. It expires in %d minutes.</p>',
                e($this->code),
                $this->expiresInMinutes,
            ),
        );
    }
}
