<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ChildPinRule implements ValidationRule
{
    public const MESSAGE = 'Choose a 4 to 6 digit PIN that is not too easy to guess (avoid 0000 or 1234).';

    private const WEAK_PINS = [
        '1212',
        '1122',
        '2580',
        '1357',
        '2468',
        '1010',
        '2020',
        '121212',
    ];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) && ! is_int($value)) {
            $fail(self::MESSAGE);

            return;
        }

        $pin = trim((string) $value);

        if (preg_match('/^\d{4,6}$/', $pin) !== 1) {
            $fail(self::MESSAGE);

            return;
        }

        if (self::isWeak($pin)) {
            $fail(self::MESSAGE);
        }
    }

    public static function isWeak(string $pin): bool
    {
        if (preg_match('/^(\d)\1+$/', $pin) === 1) {
            return true;
        }

        if (str_contains('01234567890', $pin) || str_contains('09876543210', $pin)) {
            return true;
        }

        return in_array($pin, self::WEAK_PINS, true);
    }
}
