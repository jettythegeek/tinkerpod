<?php

declare(strict_types=1);

namespace App\Enums;

enum ApprovedAvatar: string
{
    case Av1 = 'av1.png';
    case Av2 = 'av2.png';
    case Av3 = 'av3.png';
    case Av4 = 'av4.png';
    case Av5 = 'av5.png';
    case Av6 = 'av6.png';
    case AvGirl = 'av-girl.png';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $avatar): string => $avatar->value,
            self::cases(),
        );
    }

    public static function normalize(string $input): ?string
    {
        $trimmed = strtolower(trim($input));
        $trimmed = basename($trimmed);

        if (! str_ends_with($trimmed, '.png')) {
            $trimmed .= '.png';
        }

        foreach (self::cases() as $case) {
            if ($case->value === $trimmed) {
                return $case->value;
            }
        }

        return null;
    }
}
