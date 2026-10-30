<?php

declare(strict_types=1);

namespace App\Services\Sms;

use App\Contracts\SmsSender;
use Illuminate\Support\Facades\Log;

class LogSmsSender implements SmsSender
{
    /**
     * @var list<array{to: string, message: string}>
     */
    private array $sentMessages = [];

    public function send(string $to, string $message): void
    {
        $this->sentMessages[] = [
            'to' => $to,
            'message' => $message,
        ];

        Log::info('TinkerPod SMS dispatched via log driver.', [
            'to' => $to,
            'message' => $message,
        ]);
    }

    /**
     * @return list<array{to: string, message: string}>
     */
    public function sentMessages(): array
    {
        return $this->sentMessages;
    }
}
