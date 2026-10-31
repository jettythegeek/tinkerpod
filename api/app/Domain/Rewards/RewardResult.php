<?php

declare(strict_types=1);

namespace App\Domain\Rewards;

use App\Models\RewardLedger;

final readonly class RewardResult
{
    public const TIER_SMALL = 'small';

    public const TIER_LEVEL_UP = 'level_up';

    public const TIER_BADGE = 'badge';

    public const TIER_STREAK = 'streak';

    public const TIER_BIG = 'big';

    /**
     * @param  list<RewardLedger>  $entries
     * @param  array{xp: int, coins: int, gems: int}  $totals
     * @param  array{previous_level: int, current_level: int, leveled_up: bool}|null  $levelChange
     * @param  list<array{slug: string, name: string, description: string|null, icon: string, color: string}>  $newBadges
     * @param  array{previous_streak: int, current_streak: int, best_streak: int, incremented: bool, status: string, last_active_date: string|null, grace_days_used: int, message: string|null}|null  $streakChange
     * @param  array{slug: string, name: string}|null  $newTitle
     */
    public function __construct(
        public array $entries,
        public array $totals,
        public ?array $levelChange,
        public array $newBadges,
        public ?array $streakChange,
        public ?array $newTitle,
        public string $presentationTier,
        public bool $wasReplayed = false,
    ) {}

    public static function merge(self $primary, self ...$others): self
    {
        if ($others === []) {
            return $primary;
        }

        $all = [$primary, ...$others];
        /** @var list<RewardLedger> $entries */
        $entries = [];
        $seenIds = [];
        /** @var list<array{slug: string, name: string, description: string|null, icon: string, color: string}> $badges */
        $badges = [];
        $seenBadges = [];
        $streakChange = $primary->streakChange;
        $newTitle = $primary->newTitle;
        $allReplayed = true;

        foreach ($all as $res) {
            if (! $res->wasReplayed) {
                $allReplayed = false;
            }
            foreach ($res->entries as $entry) {
                if (! isset($seenIds[$entry->id])) {
                    $seenIds[$entry->id] = true;
                    $entries[] = $entry;
                }
            }
            foreach ($res->newBadges as $badge) {
                if (! isset($seenBadges[$badge['slug']])) {
                    $seenBadges[$badge['slug']] = true;
                    $badges[] = $badge;
                }
            }
            if ($res->streakChange !== null && ($streakChange === null || $res->streakChange['incremented'])) {
                $streakChange = $res->streakChange;
            }
            if ($res->newTitle !== null) {
                $newTitle = $res->newTitle;
            }
        }

        $last = $all[count($all) - 1];
        $prevLevel = $primary->levelChange['previous_level'] ?? 1;
        $currLevel = $last->levelChange['current_level'] ?? $prevLevel;
        $leveledUp = $currLevel > $prevLevel;

        $tierRank = [
            self::TIER_SMALL => 1,
            self::TIER_STREAK => 2,
            self::TIER_BADGE => 3,
            self::TIER_LEVEL_UP => 4,
            self::TIER_BIG => 5,
        ];

        $bestTier = $primary->presentationTier;
        foreach ($others as $other) {
            if (($tierRank[$other->presentationTier] ?? 1) > ($tierRank[$bestTier] ?? 1)) {
                $bestTier = $other->presentationTier;
            }
        }
        if ($leveledUp && count($badges) > 0) {
            $bestTier = self::TIER_BIG;
        }

        return new self(
            entries: $entries,
            totals: $last->totals,
            levelChange: [
                'previous_level' => $prevLevel,
                'current_level' => $currLevel,
                'leveled_up' => $leveledUp,
            ],
            newBadges: $badges,
            streakChange: $streakChange,
            newTitle: $newTitle,
            presentationTier: $bestTier,
            wasReplayed: $allReplayed,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'entries' => array_map(
                static fn (RewardLedger $entry): array => [
                    'id' => $entry->public_id,
                    'currency' => $entry->currency,
                    'amount' => $entry->amount,
                    'source_type' => $entry->source_type,
                    'source_id' => $entry->source_id,
                    'rule_version' => $entry->rule_version,
                    'idempotency_key' => $entry->idempotency_key,
                    'created_at' => $entry->created_at?->toIso8601String(),
                ],
                $this->entries,
            ),
            'totals' => $this->totals,
            'level_change' => $this->levelChange,
            'new_badges' => $this->newBadges,
            'streak_change' => $this->streakChange,
            'new_title' => $this->newTitle,
            'presentation_tier' => $this->presentationTier,
            'was_replayed' => $this->wasReplayed,
        ];
    }
}
