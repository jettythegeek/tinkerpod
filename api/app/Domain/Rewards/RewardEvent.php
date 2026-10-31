<?php

declare(strict_types=1);

namespace App\Domain\Rewards;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

final readonly class RewardEvent
{
    public const TYPE_LESSON_COMPLETED = 'lesson_completed';

    public const TYPE_QUIZ_PASSED = 'quiz_passed';

    public const TYPE_PERFECT_QUIZ = 'perfect_quiz';

    public const TYPE_STREAK_DAY = 'streak_day';

    public CarbonImmutable $occurredAt;

    public function __construct(
        public int $childId,
        public string $eventType,
        public string $sourceId,
        ?CarbonInterface $occurredAt = null,
        public bool $triggerDailyStreak = true,
    ) {
        $this->occurredAt = $occurredAt !== null
            ? CarbonImmutable::instance($occurredAt)
            : CarbonImmutable::now();
    }

    public static function lessonCompleted(
        int $childId,
        int|string $lessonId,
        ?CarbonInterface $occurredAt = null,
        bool $triggerDailyStreak = true,
    ): self {
        return new self(
            childId: $childId,
            eventType: self::TYPE_LESSON_COMPLETED,
            sourceId: (string) $lessonId,
            occurredAt: $occurredAt,
            triggerDailyStreak: $triggerDailyStreak,
        );
    }

    public static function quizPassed(
        int $childId,
        int|string $quizId,
        ?CarbonInterface $occurredAt = null,
        bool $triggerDailyStreak = true,
    ): self {
        return new self(
            childId: $childId,
            eventType: self::TYPE_QUIZ_PASSED,
            sourceId: (string) $quizId,
            occurredAt: $occurredAt,
            triggerDailyStreak: $triggerDailyStreak,
        );
    }

    public static function perfectQuiz(
        int $childId,
        int|string $quizId,
        ?CarbonInterface $occurredAt = null,
        bool $triggerDailyStreak = true,
    ): self {
        return new self(
            childId: $childId,
            eventType: self::TYPE_PERFECT_QUIZ,
            sourceId: (string) $quizId,
            occurredAt: $occurredAt,
            triggerDailyStreak: $triggerDailyStreak,
        );
    }

    public static function streakDay(
        int $childId,
        ?CarbonInterface $occurredAt = null,
    ): self {
        $instant = $occurredAt !== null
            ? CarbonImmutable::instance($occurredAt)
            : CarbonImmutable::now();
        $lagosDate = $instant->setTimezone('Africa/Lagos')->toDateString();

        return new self(
            childId: $childId,
            eventType: self::TYPE_STREAK_DAY,
            sourceId: $lagosDate,
            occurredAt: $instant,
            triggerDailyStreak: true,
        );
    }

    public function idempotencyPrefix(): string
    {
        return sprintf('%s:%d:%s', $this->eventType, $this->childId, $this->sourceId);
    }
}
