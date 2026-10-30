<?php

declare(strict_types=1);

namespace App\Enums;

enum RoleName: string
{
    case Parent = 'parent';
    case Child = 'child';
    case Mentor = 'mentor';
    case Admin = 'admin';
    case SuperAdmin = 'super_admin';
    case ContentManager = 'content_manager';
    case Support = 'support';
    case Finance = 'finance';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $role): string => $role->value,
            self::cases(),
        );
    }
}
