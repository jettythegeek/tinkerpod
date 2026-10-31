<?php

declare(strict_types=1);

namespace App\Enums;

enum LessonCompletionMode: string
{
    case Manual = 'manual';
    case WatchPercent = 'watch_percent';
    case QuizPass = 'quiz_pass';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $mode): string => $mode->value,
            self::cases(),
        );
    }
}
