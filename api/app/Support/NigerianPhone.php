<?php

declare(strict_types=1);

namespace App\Support;

final class NigerianPhone
{
    /**
     * Normalize a Nigerian mobile phone number (`080...`, `234...`, `+234...`) to E.164 `+234XXXXXXXXXX`.
     * Returns null when the input is not a valid Nigerian mobile number.
     */
    public static function normalize(string $raw): ?string
    {
        $cleaned = preg_replace('/[\s\-\(\)]+/', '', trim($raw));

        if (! is_string($cleaned) || $cleaned === '') {
            return null;
        }

        if (preg_match('/^0([789][01]\d{8})$/', $cleaned, $matches) === 1) {
            return '+234'.$matches[1];
        }

        if (preg_match('/^234([789][01]\d{8})$/', $cleaned, $matches) === 1) {
            return '+234'.$matches[1];
        }

        if (preg_match('/^\+234([789][01]\d{8})$/', $cleaned, $matches) === 1) {
            return '+234'.$matches[1];
        }

        return null;
    }

    public static function isValid(string $raw): bool
    {
        return self::normalize($raw) !== null;
    }
}
