<?php

declare(strict_types=1);

namespace App\Domain\Rewards;

use App\Enums\PermissionName;
use App\Enums\RewardCurrency;
use App\Models\Badge;
use App\Models\Child;
use App\Models\ChildBadge;
use App\Models\ChildStreak;
use App\Models\NaijaTitle;
use App\Models\RewardBalance;
use App\Models\RewardLedger;
use App\Models\RewardLevel;
use App\Models\RewardRule;
use App\Models\StreakSetting;
use App\Models\User;
use App\Services\AuditLogger;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class RewardService
{
    public const KIND_STREAK_PAUSED_MESSAGE = 'Captain Jetty kept your spot warm! Do one lesson today to start a new streak.';

    public function __construct(
        private readonly AuditLogger $auditLogger,
    ) {}

    public static function ensureDefaultsSeeded(): void
    {
        if (NaijaTitle::query()->exists() && RewardRule::query()->exists() && RewardLevel::query()->exists()) {
            return;
        }

        DB::transaction(static function (): void {
            $titles = [
                ['slug' => 'cody-coda', 'name' => 'Cody Coda', 'min_level' => 1, 'sort_order' => 1],
                ['slug' => 'jango-jango', 'name' => 'Jango-Jango', 'min_level' => 5, 'sort_order' => 2],
                ['slug' => 'design-sultan', 'name' => 'Design Sultan', 'min_level' => 10, 'sort_order' => 3],
                ['slug' => 'eze-code', 'name' => 'Eze Code', 'min_level' => 15, 'sort_order' => 4],
                ['slug' => 'code-dragon', 'name' => 'Code Dragon', 'min_level' => 20, 'sort_order' => 5],
                ['slug' => 'design-jango', 'name' => 'Design Jango', 'min_level' => 25, 'sort_order' => 6],
                ['slug' => 'odogwu', 'name' => 'Odogwu', 'min_level' => 30, 'sort_order' => 7],
            ];

            /** @var array<int, NaijaTitle> $createdTitles */
            $createdTitles = [];
            foreach ($titles as $titleData) {
                /** @var NaijaTitle $title */
                $title = NaijaTitle::query()->updateOrCreate(
                    ['slug' => $titleData['slug']],
                    [
                        'name' => $titleData['name'],
                        'min_level' => $titleData['min_level'],
                        'sort_order' => $titleData['sort_order'],
                        'is_active' => true,
                    ],
                );
                $createdTitles[] = $title;
            }

            if (! RewardLevel::query()->exists()) {
                for ($lvl = 1; $lvl <= 30; $lvl++) {
                    $xpRequired = $lvl === 1 ? 0 : ($lvl - 1) * 100;
                    $matchedTitleId = null;

                    foreach ($createdTitles as $title) {
                        if ($lvl >= $title->min_level) {
                            $matchedTitleId = $title->id;
                        }
                    }

                    RewardLevel::query()->updateOrCreate(
                        ['level_number' => $lvl],
                        [
                            'xp_required' => $xpRequired,
                            'naija_title_id' => $matchedTitleId,
                        ],
                    );
                }
            }

            $defaultRules = [
                [
                    'event_type' => RewardEvent::TYPE_LESSON_COMPLETED,
                    'xp_amount' => 50,
                    'coins_amount' => 20,
                    'gems_amount' => 0,
                ],
                [
                    'event_type' => RewardEvent::TYPE_QUIZ_PASSED,
                    'xp_amount' => 80,
                    'coins_amount' => 30,
                    'gems_amount' => 0,
                ],
                [
                    'event_type' => RewardEvent::TYPE_PERFECT_QUIZ,
                    'xp_amount' => 40,
                    'coins_amount' => 20,
                    'gems_amount' => 5,
                ],
                [
                    'event_type' => RewardEvent::TYPE_STREAK_DAY,
                    'xp_amount' => 20,
                    'coins_amount' => 5,
                    'gems_amount' => 0,
                ],
            ];

            foreach ($defaultRules as $ruleData) {
                $exists = RewardRule::query()
                    ->where('event_type', $ruleData['event_type'])
                    ->exists();

                if (! $exists) {
                    RewardRule::query()->create([
                        'event_type' => $ruleData['event_type'],
                        'version' => 1,
                        'xp_amount' => $ruleData['xp_amount'],
                        'coins_amount' => $ruleData['coins_amount'],
                        'gems_amount' => $ruleData['gems_amount'],
                        'is_active' => true,
                    ]);
                }
            }

            $defaultBadges = [
                [
                    'slug' => 'first-steps',
                    'name' => 'First Steps',
                    'description' => 'Completed your very first TinkerPod lesson!',
                    'icon' => 'footprints',
                    'color' => '#63C132',
                    'condition_type' => 'first_lesson',
                    'condition_value' => 1,
                    'sort_order' => 1,
                ],
                [
                    'slug' => 'loop-hero',
                    'name' => 'Loop Hero',
                    'description' => 'Completed 3 lessons in your learning journey.',
                    'icon' => 'repeat',
                    'color' => '#7C3AED',
                    'condition_type' => 'lessons_completed_count',
                    'condition_value' => 3,
                    'sort_order' => 2,
                ],
                [
                    'slug' => 'quiz-champ',
                    'name' => 'Quiz Champ',
                    'description' => 'Passed your first lesson quiz!',
                    'icon' => 'brain',
                    'color' => '#2563EB',
                    'condition_type' => 'first_quiz_pass',
                    'condition_value' => 1,
                    'sort_order' => 3,
                ],
                [
                    'slug' => 'quiz-ace',
                    'name' => 'Quiz Ace',
                    'description' => 'Scored 100% on a quiz!',
                    'icon' => 'star',
                    'color' => '#2563EB',
                    'condition_type' => 'perfect_quiz_count',
                    'condition_value' => 1,
                    'sort_order' => 4,
                ],
                [
                    'slug' => 'seven-day-flame',
                    'name' => '7-Day Flame',
                    'description' => 'Kept your learning streak glowing for 7 days!',
                    'icon' => 'flame',
                    'color' => '#F59E0B',
                    'condition_type' => 'streak_days',
                    'condition_value' => 7,
                    'sort_order' => 5,
                ],
                [
                    'slug' => 'bug-buster',
                    'name' => 'Bug Buster',
                    'description' => 'Reached Level 5 (Jango-Jango)!',
                    'icon' => 'bug',
                    'color' => '#FF6B6B',
                    'condition_type' => 'level_reached',
                    'condition_value' => 5,
                    'sort_order' => 6,
                ],
            ];

            foreach ($defaultBadges as $badgeData) {
                Badge::query()->updateOrCreate(
                    ['slug' => $badgeData['slug']],
                    [
                        'name' => $badgeData['name'],
                        'description' => $badgeData['description'],
                        'icon' => $badgeData['icon'],
                        'color' => $badgeData['color'],
                        'condition_type' => $badgeData['condition_type'],
                        'condition_value' => $badgeData['condition_value'],
                        'sort_order' => $badgeData['sort_order'],
                        'is_active' => true,
                    ],
                );
            }

            if (! StreakSetting::query()->exists()) {
                StreakSetting::query()->create([
                    'grace_days' => 1,
                    'timezone' => 'Africa/Lagos',
                    'version' => 1,
                ]);
            }
        });
    }

    public function award(RewardEvent $event): RewardResult
    {
        self::ensureDefaultsSeeded();

        return DB::transaction(function () use ($event): RewardResult {
            /** @var Child $child */
            $child = Child::query()->whereKey($event->childId)->lockForUpdate()->firstOrFail();

            $createdAt = Carbon::instance($event->occurredAt);
            $rule = RewardRule::activeForEvent($event->eventType);
            if ($rule === null) {
                throw new InvalidArgumentException(sprintf('No active reward rule found for event [%s].', $event->eventType));
            }

            $prefix = $event->idempotencyPrefix();
            /** @var list<RewardLedger> $entries */
            $entries = [];
            $anyCreated = false;
            $xpDeltaThisCall = 0;

            $currencyAmounts = [
                RewardCurrency::Xp->value => $rule->xp_amount,
                RewardCurrency::Coins->value => $rule->coins_amount,
                RewardCurrency::Gems->value => $rule->gems_amount,
            ];

            foreach ($currencyAmounts as $currency => $amount) {
                if ($amount === 0) {
                    continue;
                }

                $key = sprintf('%s:%s', $prefix, $currency);
                $appended = RewardLedger::appendEntry(
                    childId: $child->id,
                    currency: $currency,
                    amount: $amount,
                    sourceType: $event->eventType,
                    sourceId: $event->sourceId,
                    ruleVersion: $rule->version,
                    idempotencyKey: $key,
                    createdAt: $createdAt,
                );

                $entries[] = $appended['entry'];
                if ($appended['created']) {
                    $anyCreated = true;
                    if ($currency === RewardCurrency::Xp->value) {
                        $xpDeltaThisCall += $amount;
                    }
                }
            }

            // Handle daily streak in Africa/Lagos if triggered or if this is a streak_day event
            $streakChange = null;
            if ($event->eventType === RewardEvent::TYPE_STREAK_DAY) {
                $streakOutcome = $this->applyDailyStreak(
                    child: $child,
                    occurredAt: $event->occurredAt,
                    appendLedgerRows: false,
                    alreadyCreatedPrimary: $anyCreated,
                );
                $streakChange = $streakOutcome['streak_change'];
            } elseif ($event->triggerDailyStreak) {
                $streakOutcome = $this->applyDailyStreak(
                    child: $child,
                    occurredAt: $event->occurredAt,
                    appendLedgerRows: true,
                    alreadyCreatedPrimary: $anyCreated,
                );
                $streakChange = $streakOutcome['streak_change'];
                foreach ($streakOutcome['entries'] as $streakEntry) {
                    $entries[] = $streakEntry;
                }
                if ($streakOutcome['xp_awarded'] > 0) {
                    $xpDeltaThisCall += $streakOutcome['xp_awarded'];
                    $anyCreated = true;
                }
            }

            $totals = RewardLedger::ledgerTotalsFor($child->id);
            $wasReplayed = ! $anyCreated;

            // Compute level and title before vs after
            $effectiveXpDelta = $wasReplayed
                ? array_sum(array_map(
                    static fn (RewardLedger $e): int => $e->currency === RewardCurrency::Xp->value ? $e->amount : 0,
                    $entries,
                ))
                : $xpDeltaThisCall;

            $previousXp = max(0, $totals['xp'] - $effectiveXpDelta);
            $previousLevelInfo = $this->resolveLevelAndTitleForXp($previousXp);
            $currentLevelInfo = $this->resolveLevelAndTitleForXp($totals['xp']);

            $leveledUp = $currentLevelInfo['level'] > $previousLevelInfo['level'];
            $levelChange = [
                'previous_level' => $previousLevelInfo['level'],
                'current_level' => $currentLevelInfo['level'],
                'leveled_up' => $leveledUp,
            ];

            $newTitle = null;
            if (
                $currentLevelInfo['title'] !== null
                && ($previousLevelInfo['title'] === null || $currentLevelInfo['title']['slug'] !== $previousLevelInfo['title']['slug'])
            ) {
                $newTitle = $currentLevelInfo['title'];
            }

            // Evaluate badge unlocks
            $primaryLedgerId = $entries[0]->id ?? null;
            $newBadges = $this->evaluateAndGrantBadges(
                child: $child,
                totalXp: $totals['xp'],
                currentLevel: $currentLevelInfo['level'],
                primaryLedgerId: $primaryLedgerId,
                wasReplayed: $wasReplayed,
                earnedAt: $createdAt,
            );

            $streakIncremented = (bool) ($streakChange['incremented'] ?? false);

            $presentationTier = $this->determinePresentationTier(
                eventType: $event->eventType,
                leveledUp: $leveledUp,
                newBadgesCount: count($newBadges),
                streakIncremented: $streakIncremented,
                newTitleUnlocked: $newTitle !== null,
            );

            return new RewardResult(
                entries: $entries,
                totals: $totals,
                levelChange: $levelChange,
                newBadges: $newBadges,
                streakChange: $streakChange,
                newTitle: $newTitle,
                presentationTier: $presentationTier,
                wasReplayed: $wasReplayed,
            );
        });
    }

    /**
     * Staff adjustment with required reason and permission check (`rewards.adjust`).
     */
    public function adjust(
        Child $child,
        User $staff,
        RewardCurrency|string $currency,
        int $amount,
        string $reason,
        string $idempotencyKey,
    ): RewardLedger {
        if (! $staff->can(PermissionName::AdjustRewards->value)) {
            throw new AuthorizationException('You do not have permission to adjust child rewards.');
        }

        $trimmedReason = trim($reason);
        if ($trimmedReason === '') {
            throw new InvalidArgumentException('A non-empty reason is required for reward adjustments.');
        }

        if ($amount === 0) {
            throw new InvalidArgumentException('Adjustment amount must be non-zero.');
        }

        $trimmedKey = trim($idempotencyKey);
        if ($trimmedKey === '') {
            throw new InvalidArgumentException('An idempotency key is required for reward adjustments.');
        }

        self::ensureDefaultsSeeded();

        return DB::transaction(function () use (
            $child,
            $staff,
            $currency,
            $amount,
            $trimmedReason,
            $trimmedKey,
        ): RewardLedger {
            $result = RewardLedger::appendEntry(
                childId: $child->id,
                currency: $currency,
                amount: $amount,
                sourceType: 'staff_adjustment',
                sourceId: $trimmedKey,
                ruleVersion: 1,
                idempotencyKey: sprintf('staff_adjustment:%d:%s', $child->id, $trimmedKey),
                reason: $trimmedReason,
                actorUserId: $staff->id,
            );

            if ($result['created']) {
                $this->auditLogger->log(
                    action: 'reward.adjusted',
                    actor: $staff,
                    subject: $child,
                    metadata: [
                        'ledger_public_id' => $result['entry']->public_id,
                        'currency' => $result['entry']->currency,
                        'amount' => $amount,
                        'new_balance' => $result['balance'],
                        'reason' => $trimmedReason,
                        'idempotency_key' => $result['entry']->idempotency_key,
                    ],
                );
            }

            return $result['entry'];
        });
    }

    /**
     * Evaluate a child's streak state at a given instant in Africa/Lagos without mutating the database.
     *
     * @return array{current_streak: int, best_streak: int, status: string, is_paused: bool, last_active_date: string|null, grace_days_used: int, grace_days_allowed: int, timezone: string, message: string|null}
     */
    public function getStreakSnapshot(Child $child, ?CarbonInterface $at = null): array
    {
        /** @var ChildStreak|null $streak */
        $streak = $child->relationLoaded('streak')
            ? $child->getRelation('streak')
            : ChildStreak::query()->where('child_id', $child->id)->first();

        if ($streak === null || $streak->last_active_date === null) {
            return [
                'current_streak' => 0,
                'best_streak' => $streak !== null ? (int) $streak->best_streak : 0,
                'status' => 'streak_paused',
                'is_paused' => true,
                'last_active_date' => null,
                'grace_days_used' => 0,
                'grace_days_allowed' => 1,
                'timezone' => 'Africa/Lagos',
                'message' => self::KIND_STREAK_PAUSED_MESSAGE,
            ];
        }

        /** @var StreakSetting|null $setting */
        $setting = StreakSetting::query()->orderByDesc('version')->first();
        $timezone = ($setting !== null && $setting->timezone !== '') ? $setting->timezone : 'Africa/Lagos';
        $graceDays = $setting !== null ? max(0, (int) $setting->grace_days) : 1;
        $nowLagos = ($at !== null ? CarbonImmutable::instance($at) : CarbonImmutable::now())
            ->setTimezone($timezone)
            ->startOfDay();

        $lastActive = CarbonImmutable::parse($streak->last_active_date->toDateString(), $timezone)->startOfDay();
        $daysSinceActive = (int) $lastActive->diffInDays($nowLagos, false);

        if ($daysSinceActive <= 1) {
            return [
                'current_streak' => (int) $streak->current_streak,
                'best_streak' => (int) $streak->best_streak,
                'status' => 'active',
                'is_paused' => false,
                'last_active_date' => $lastActive->toDateString(),
                'grace_days_used' => (int) $streak->grace_days_used,
                'grace_days_allowed' => $graceDays,
                'timezone' => $timezone,
                'message' => null,
            ];
        }

        $missedDays = $daysSinceActive - 1;
        if ($missedDays <= $graceDays) {
            return [
                'current_streak' => (int) $streak->current_streak,
                'best_streak' => (int) $streak->best_streak,
                'status' => 'grace',
                'is_paused' => false,
                'last_active_date' => $lastActive->toDateString(),
                'grace_days_used' => $missedDays,
                'grace_days_allowed' => $graceDays,
                'timezone' => $timezone,
                'message' => null,
            ];
        }

        return [
            'current_streak' => 0,
            'best_streak' => (int) $streak->best_streak,
            'status' => 'streak_paused',
            'is_paused' => true,
            'last_active_date' => $lastActive->toDateString(),
            'grace_days_used' => (int) $streak->grace_days_used,
            'grace_days_allowed' => $graceDays,
            'timezone' => $timezone,
            'message' => self::KIND_STREAK_PAUSED_MESSAGE,
        ];
    }

    /**
     * Resolve level number, XP progress, current Naija title, next Naija title, and full title ladder for a given XP amount.
     *
     * @return array{level: int, current_level_xp: int, next_level_xp: int|null, xp_in_level: int, xp_for_next_level: int, progress_percent: int, title: array{slug: string, name: string}|null, next_title: array{slug: string, name: string, min_level: int}|null, title_ladder: list<array{slug: string, name: string, min_level: int, unlocked: bool, is_current: bool}>}
     */
    public function resolveLevelAndTitleForXp(int $xp): array
    {
        $normalizedXp = max(0, $xp);

        /** @var list<RewardLevel> $levels */
        $levels = RewardLevel::query()
            ->orderBy('level_number')
            ->get()
            ->all();

        $levelNumber = 1;
        $currentLevelXp = 0;
        $nextLevelXp = 100;

        if ($levels !== []) {
            $currentLevel = $levels[0];
            $nextLevel = null;

            foreach ($levels as $index => $levelRow) {
                if ($normalizedXp >= $levelRow->xp_required) {
                    $currentLevel = $levelRow;
                    $nextLevel = $levels[$index + 1] ?? null;
                } else {
                    break;
                }
            }

            $levelNumber = (int) $currentLevel->level_number;
            $currentLevelXp = (int) $currentLevel->xp_required;
            $nextLevelXp = $nextLevel !== null ? (int) $nextLevel->xp_required : null;
        } else {
            $levelNumber = min(30, intdiv($normalizedXp, 100) + 1);
            $currentLevelXp = ($levelNumber - 1) * 100;
            $nextLevelXp = $levelNumber < 30 ? $levelNumber * 100 : null;
        }

        $xpInLevel = max(0, $normalizedXp - $currentLevelXp);
        $xpSpan = $nextLevelXp !== null ? max(1, $nextLevelXp - $currentLevelXp) : 100;
        $progressPercent = $nextLevelXp !== null
            ? min(100, (int) round(($xpInLevel / $xpSpan) * 100))
            : 100;

        /** @var list<NaijaTitle> $dbTitles */
        $dbTitles = NaijaTitle::query()
            ->where('is_active', true)
            ->orderBy('min_level')
            ->orderBy('sort_order')
            ->get()
            ->all();

        /** @var list<array{slug: string, name: string, min_level: int}> $titleRows */
        $titleRows = $dbTitles !== []
            ? array_map(static fn (NaijaTitle $t): array => [
                'slug' => $t->slug,
                'name' => $t->name,
                'min_level' => (int) $t->min_level,
            ], $dbTitles)
            : [
                ['slug' => 'cody-coda', 'name' => 'Cody Coda', 'min_level' => 1],
                ['slug' => 'jango-jango', 'name' => 'Jango-Jango', 'min_level' => 5],
                ['slug' => 'design-sultan', 'name' => 'Design Sultan', 'min_level' => 10],
                ['slug' => 'eze-code', 'name' => 'Eze Code', 'min_level' => 15],
                ['slug' => 'code-dragon', 'name' => 'Code Dragon', 'min_level' => 20],
                ['slug' => 'design-jango', 'name' => 'Design Jango', 'min_level' => 25],
                ['slug' => 'odogwu', 'name' => 'Odogwu', 'min_level' => 30],
            ];

        $currentTitle = null;
        $nextTitle = null;

        foreach ($titleRows as $title) {
            if ($levelNumber >= $title['min_level']) {
                $currentTitle = [
                    'slug' => $title['slug'],
                    'name' => $title['name'],
                ];
            } elseif ($nextTitle === null) {
                $nextTitle = [
                    'slug' => $title['slug'],
                    'name' => $title['name'],
                    'min_level' => $title['min_level'],
                ];
            }
        }

        /** @var list<array{slug: string, name: string, min_level: int, unlocked: bool, is_current: bool}> $titleLadder */
        $titleLadder = [];
        foreach ($titleRows as $title) {
            $titleLadder[] = [
                'slug' => $title['slug'],
                'name' => $title['name'],
                'min_level' => $title['min_level'],
                'unlocked' => $levelNumber >= $title['min_level'],
                'is_current' => $currentTitle !== null && $currentTitle['slug'] === $title['slug'],
            ];
        }

        return [
            'level' => $levelNumber,
            'current_level_xp' => $currentLevelXp,
            'next_level_xp' => $nextLevelXp,
            'xp_in_level' => $xpInLevel,
            'xp_for_next_level' => $xpSpan,
            'progress_percent' => $progressPercent,
            'title' => $currentTitle,
            'next_title' => $nextTitle,
            'title_ladder' => $titleLadder,
        ];
    }

    /**
     * Build the HUD payload for `GET /api/v1/kid/rewards` (with minimal query count).
     *
     * @return array<string, mixed>
     */
    public function hudSummaryFor(Child $child): array
    {
        $totals = RewardLedger::ledgerTotalsFor($child->id);
        $levelInfo = $this->resolveLevelAndTitleForXp($totals['xp']);
        $streak = $this->getStreakSnapshot($child);

        return [
            'xp' => $totals['xp'],
            'coins' => $totals['coins'],
            'gems' => $totals['gems'],
            'level' => $levelInfo['level'],
            'current_level_xp' => $levelInfo['current_level_xp'],
            'next_level_xp' => $levelInfo['next_level_xp'],
            'xp_in_level' => $levelInfo['xp_in_level'],
            'xp_for_next_level' => $levelInfo['xp_for_next_level'],
            'progress_percent' => $levelInfo['progress_percent'],
            'title' => $levelInfo['title'],
            'next_title' => $levelInfo['next_title'],
            'title_ladder' => $levelInfo['title_ladder'],
            'streak' => $streak,
        ];
    }

    /**
     * Build the compact gamification summary for `GET /api/v1/kid/home` in <= 2 queries when XP = 0.
     *
     * @return array<string, mixed>
     */
    public function homeGamificationSummaryFor(Child $child): array
    {
        $totals = RewardLedger::ledgerTotalsFor($child->id);
        $child->loadMissing('streak');
        $streak = $this->getStreakSnapshot($child);

        if ($totals['xp'] === 0) {
            return [
                'xp' => 0,
                'next_level_xp' => 100,
                'xp_in_level' => 0,
                'xp_for_next_level' => 100,
                'progress_percent' => 0,
                'level' => 1,
                'title' => ['slug' => 'cody-coda', 'name' => 'Cody Coda'],
                'next_title' => ['slug' => 'jango-jango', 'name' => 'Jango-Jango', 'min_level' => 5],
                'coins' => $totals['coins'],
                'gems' => $totals['gems'],
                'stars' => 0,
                'streak_days' => $streak['current_streak'],
                'streak' => $streak,
                'missions' => [],
            ];
        }

        $levelInfo = $this->resolveLevelAndTitleForXp($totals['xp']);

        return [
            'xp' => $totals['xp'],
            'next_level_xp' => $levelInfo['next_level_xp'] ?? ($levelInfo['current_level_xp'] + 100),
            'xp_in_level' => $levelInfo['xp_in_level'],
            'xp_for_next_level' => $levelInfo['xp_for_next_level'],
            'progress_percent' => $levelInfo['progress_percent'],
            'level' => $levelInfo['level'],
            'title' => $levelInfo['title'],
            'next_title' => $levelInfo['next_title'],
            'coins' => $totals['coins'],
            'gems' => $totals['gems'],
            'stars' => 0,
            'streak_days' => $streak['current_streak'],
            'streak' => $streak,
            'missions' => [],
        ];
    }

    /**
     * Build the full profile & rewards payload for `GET /api/v1/kid/profile` (screen 07-profile & 44/45-rewards).
     *
     * @return array<string, mixed>
     */
    public function profileSummaryFor(Child $child): array
    {
        $hud = $this->hudSummaryFor($child);

        /** @var list<Badge> $dbBadges */
        $dbBadges = Badge::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->all();

        /** @var array<int, ChildBadge> $earnedByBadgeId */
        $earnedByBadgeId = $dbBadges !== []
            ? ChildBadge::query()
                ->where('child_id', $child->id)
                ->get()
                ->keyBy('badge_id')
                ->all()
            : [];

        /** @var list<array<string, mixed>> $earnedList */
        $earnedList = [];
        /** @var list<array<string, mixed>> $lockedList */
        $lockedList = [];
        /** @var list<array<string, mixed>> $allBadges */
        $allBadges = [];

        if ($dbBadges !== []) {
            foreach ($dbBadges as $badge) {
                $earnedRecord = $earnedByBadgeId[$badge->id] ?? null;
                $isEarned = $earnedRecord !== null;
                $item = [
                    'id' => $badge->public_id,
                    'slug' => $badge->slug,
                    'name' => $badge->name,
                    'description' => $badge->description,
                    'icon' => $badge->icon,
                    'color' => $badge->color,
                    'condition_type' => $badge->condition_type,
                    'condition_value' => (int) $badge->condition_value,
                    'is_earned' => $isEarned,
                    'earned_at' => $earnedRecord?->earned_at?->toIso8601String(),
                ];

                $allBadges[] = $item;
                if ($isEarned) {
                    $earnedList[] = $item;
                } else {
                    $lockedList[] = $item;
                }
            }
        } else {
            $fallbackBadges = [
                ['slug' => 'first-steps', 'name' => 'First Steps', 'description' => 'Completed your very first TinkerPod lesson!', 'icon' => 'footprints', 'color' => '#63C132', 'condition_type' => 'first_lesson', 'condition_value' => 1],
                ['slug' => 'loop-hero', 'name' => 'Loop Hero', 'description' => 'Completed 3 lessons in your learning journey.', 'icon' => 'repeat', 'color' => '#7C3AED', 'condition_type' => 'lessons_completed_count', 'condition_value' => 3],
                ['slug' => 'quiz-champ', 'name' => 'Quiz Champ', 'description' => 'Passed your first lesson quiz!', 'icon' => 'brain', 'color' => '#2563EB', 'condition_type' => 'first_quiz_pass', 'condition_value' => 1],
                ['slug' => 'quiz-ace', 'name' => 'Quiz Ace', 'description' => 'Scored 100% on a quiz!', 'icon' => 'star', 'color' => '#2563EB', 'condition_type' => 'perfect_quiz_count', 'condition_value' => 1],
                ['slug' => 'seven-day-flame', 'name' => '7-Day Flame', 'description' => 'Kept your learning streak glowing for 7 days!', 'icon' => 'flame', 'color' => '#F59E0B', 'condition_type' => 'streak_days', 'condition_value' => 7],
                ['slug' => 'bug-buster', 'name' => 'Bug Buster', 'description' => 'Reached Level 5 (Jango-Jango)!', 'icon' => 'bug', 'color' => '#FF6B6B', 'condition_type' => 'level_reached', 'condition_value' => 5],
            ];
            foreach ($fallbackBadges as $fb) {
                $item = [
                    'id' => $fb['slug'],
                    'slug' => $fb['slug'],
                    'name' => $fb['name'],
                    'description' => $fb['description'],
                    'icon' => $fb['icon'],
                    'color' => $fb['color'],
                    'condition_type' => $fb['condition_type'],
                    'condition_value' => $fb['condition_value'],
                    'is_earned' => false,
                    'earned_at' => null,
                ];
                $allBadges[] = $item;
                $lockedList[] = $item;
            }
        }

        return [
            'xp' => $hud['xp'],
            'coins' => $hud['coins'],
            'gems' => $hud['gems'],
            'level' => $hud['level'],
            'current_level_xp' => $hud['current_level_xp'],
            'next_level_xp' => $hud['next_level_xp'],
            'xp_in_level' => $hud['xp_in_level'],
            'xp_for_next_level' => $hud['xp_for_next_level'],
            'progress_percent' => $hud['progress_percent'],
            'title' => $hud['title'],
            'next_title' => $hud['next_title'],
            'title_ladder' => $hud['title_ladder'],
            'streak' => $hud['streak'],
            'stats' => [
                'streak_days' => $hud['streak']['current_streak'],
                'best_streak_days' => $hud['streak']['best_streak'],
                'total_xp' => $hud['xp'],
                'coins' => $hud['coins'],
                'gems' => $hud['gems'],
                'level' => $hud['level'],
                'badges_earned_count' => count($earnedList),
                'badges_total_count' => count($allBadges),
            ],
            'badges' => [
                'earned_count' => count($earnedList),
                'total_count' => count($allBadges),
                'earned' => $earnedList,
                'locked' => $lockedList,
                'all' => $allBadges,
            ],
        ];
    }

    /**
     * Rebuild a child's balances, level, Naija title, streak, and earned badges strictly from the reward_ledger table.
     *
     * @return array{totals: array{xp: int, coins: int, gems: int}, level: int, title: array{slug: string, name: string}|null, badges: list<string>, streak: array{current_streak: int, best_streak: int}}
     */
    public function rebuildFromLedger(Child $child, bool $persistProjections = true): array
    {
        self::ensureDefaultsSeeded();

        return DB::transaction(function () use ($child, $persistProjections): array {
            $totals = RewardLedger::ledgerTotalsFor($child->id);

            if ($persistProjections) {
                foreach (RewardCurrency::values() as $currency) {
                    RewardBalance::query()->updateOrCreate(
                        [
                            'child_id' => $child->id,
                            'currency' => $currency,
                        ],
                        [
                            'balance' => $totals[$currency] ?? 0,
                            'updated_at' => Carbon::now(),
                        ],
                    );
                }
            }

            $levelInfo = $this->resolveLevelAndTitleForXp($totals['xp']);

            // Rebuild streak from distinct Africa/Lagos activity dates in reward_ledger
            $setting = StreakSetting::current();
            $timezone = $setting->timezone ?: 'Africa/Lagos';
            $graceDays = max(0, (int) $setting->grace_days);

            /** @var list<RewardLedger> $activityEntries */
            $activityEntries = RewardLedger::query()
                ->where('child_id', $child->id)
                ->whereIn('source_type', [
                    RewardEvent::TYPE_LESSON_COMPLETED,
                    RewardEvent::TYPE_QUIZ_PASSED,
                    RewardEvent::TYPE_PERFECT_QUIZ,
                    RewardEvent::TYPE_STREAK_DAY,
                ])
                ->orderBy('created_at')
                ->orderBy('id')
                ->get()
                ->all();

            /** @var list<string> $distinctLagosDates */
            $distinctLagosDates = [];
            foreach ($activityEntries as $entry) {
                if ($entry->source_type === RewardEvent::TYPE_STREAK_DAY && preg_match('/^\d{4}-\d{2}-\d{2}$/', $entry->source_id) === 1) {
                    $dateStr = $entry->source_id;
                } else {
                    $dateStr = CarbonImmutable::instance($entry->created_at ?? Carbon::now())
                        ->setTimezone($timezone)
                        ->toDateString();
                }

                if (! in_array($dateStr, $distinctLagosDates, true)) {
                    $distinctLagosDates[] = $dateStr;
                }
            }

            sort($distinctLagosDates);

            $currentStreak = 0;
            $bestStreak = 0;
            $prevDate = null;
            $graceUsed = 0;

            foreach ($distinctLagosDates as $dateStr) {
                $curr = CarbonImmutable::parse($dateStr, $timezone)->startOfDay();
                if ($prevDate === null) {
                    $currentStreak = 1;
                    $graceUsed = 0;
                } else {
                    $diff = (int) $prevDate->diffInDays($curr, false);
                    if ($diff === 1) {
                        $currentStreak++;
                    } elseif ($diff > 1 && ($diff - 1) <= $graceDays) {
                        $currentStreak++;
                        $graceUsed = $diff - 1;
                    } elseif ($diff > 1) {
                        $currentStreak = 1;
                        $graceUsed = 0;
                    }
                }

                if ($currentStreak > $bestStreak) {
                    $bestStreak = $currentStreak;
                }
                $prevDate = $curr;
            }

            if ($persistProjections && $prevDate !== null) {
                ChildStreak::query()->updateOrCreate(
                    ['child_id' => $child->id],
                    [
                        'current_streak' => $currentStreak,
                        'best_streak' => $bestStreak,
                        'last_active_date' => $prevDate->toDateString(),
                        'grace_days_used' => $graceUsed,
                        'is_paused' => false,
                    ],
                );
            }

            // Recompute badges purely from ledger counts + level + bestStreak
            $lessonsCompletedCount = (int) RewardLedger::query()
                ->where('child_id', $child->id)
                ->where('source_type', RewardEvent::TYPE_LESSON_COMPLETED)
                ->distinct()
                ->count('source_id');

            $quizzesPassedCount = (int) RewardLedger::query()
                ->where('child_id', $child->id)
                ->where('source_type', RewardEvent::TYPE_QUIZ_PASSED)
                ->distinct()
                ->count('source_id');

            $perfectQuizzesCount = (int) RewardLedger::query()
                ->where('child_id', $child->id)
                ->where('source_type', RewardEvent::TYPE_PERFECT_QUIZ)
                ->distinct()
                ->count('source_id');

            /** @var list<Badge> $activeBadges */
            $activeBadges = Badge::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get()
                ->all();

            /** @var list<string> $earnedSlugs */
            $earnedSlugs = [];

            foreach ($activeBadges as $badge) {
                $qualifies = match ($badge->condition_type) {
                    'first_lesson', 'lessons_completed_count' => $lessonsCompletedCount >= $badge->condition_value,
                    'first_quiz_pass' => $quizzesPassedCount >= $badge->condition_value,
                    'perfect_quiz_count' => $perfectQuizzesCount >= $badge->condition_value,
                    'streak_days' => $bestStreak >= $badge->condition_value,
                    'level_reached' => $levelInfo['level'] >= $badge->condition_value,
                    default => false,
                };

                if ($qualifies) {
                    $earnedSlugs[] = $badge->slug;
                    if ($persistProjections) {
                        ChildBadge::query()->firstOrCreate(
                            [
                                'child_id' => $child->id,
                                'badge_id' => $badge->id,
                            ],
                            [
                                'earned_at' => Carbon::now(),
                            ],
                        );
                    }
                }
            }

            return [
                'totals' => $totals,
                'level' => $levelInfo['level'],
                'title' => $levelInfo['title'],
                'badges' => $earnedSlugs,
                'streak' => [
                    'current_streak' => $currentStreak,
                    'best_streak' => $bestStreak,
                ],
            ];
        });
    }

    /**
     * Compute the active lesson reward preview from active `reward_rules` (M3.4).
     *
     * @return array{xp: int, coins: int, gems: int, rule_version: int}
     */
    public function activeLessonRewardPreview(): array
    {
        self::ensureDefaultsSeeded();

        $rule = RewardRule::activeForEvent(RewardEvent::TYPE_LESSON_COMPLETED);

        return [
            'xp' => $rule !== null ? (int) $rule->xp_amount : 50,
            'coins' => $rule !== null ? (int) $rule->coins_amount : 20,
            'gems' => $rule !== null ? (int) $rule->gems_amount : 0,
            'rule_version' => $rule !== null ? (int) $rule->version : 1,
        ];
    }

    /**
     * @return array{streak_change: array{previous_streak: int, current_streak: int, best_streak: int, incremented: bool, status: string, last_active_date: string|null, grace_days_used: int, message: string|null}, entries: list<RewardLedger>, xp_awarded: int}
     */
    private function applyDailyStreak(
        Child $child,
        CarbonImmutable $occurredAt,
        bool $appendLedgerRows,
        bool $alreadyCreatedPrimary,
    ): array {
        $setting = StreakSetting::current();
        $timezone = $setting->timezone ?: 'Africa/Lagos';
        $graceDays = max(0, (int) $setting->grace_days);

        $lagosDay = $occurredAt->setTimezone($timezone)->startOfDay();
        $lagosDateString = $lagosDay->toDateString();

        /** @var ChildStreak|null $streak */
        $streak = ChildStreak::query()
            ->where('child_id', $child->id)
            ->lockForUpdate()
            ->first();

        if ($streak === null) {
            $streak = new ChildStreak([
                'child_id' => $child->id,
                'current_streak' => 0,
                'best_streak' => 0,
                'last_active_date' => null,
                'grace_days_used' => 0,
                'is_paused' => false,
            ]);
        }

        $previousStreak = (int) $streak->current_streak;
        $lastActive = $streak->last_active_date !== null
            ? CarbonImmutable::parse($streak->last_active_date->toDateString(), $timezone)->startOfDay()
            : null;

        $incremented = false;
        $status = 'active';
        $message = null;
        $graceUsed = (int) $streak->grace_days_used;

        if ($lastActive === null) {
            $currentStreak = 1;
            $incremented = true;
            $graceUsed = 0;
        } else {
            $daysDiff = (int) $lastActive->diffInDays($lagosDay, false);

            if ($daysDiff <= 0) {
                // Already active on this Lagos date (or replay)
                $currentStreak = max(1, $previousStreak);
                $incremented = ! $alreadyCreatedPrimary && $previousStreak === 1 && $streak->created_at !== null && $streak->created_at->equalTo($streak->updated_at);
            } elseif ($daysDiff === 1) {
                // Consecutive Lagos day
                $currentStreak = $previousStreak + 1;
                $incremented = true;
            } elseif (($daysDiff - 1) <= $graceDays) {
                // Within grace window (e.g. missed 1 day with grace_days = 1)
                $currentStreak = $previousStreak + 1;
                $incremented = true;
                $graceUsed = $daysDiff - 1;
                $status = 'grace_preserved';
            } else {
                // Streak paused after grace window — starts fresh at 1 today with kind message
                $currentStreak = 1;
                $incremented = true;
                $graceUsed = 0;
                $status = 'streak_paused';
                $message = self::KIND_STREAK_PAUSED_MESSAGE;
            }
        }

        $bestStreak = max((int) $streak->best_streak, $currentStreak);

        if ($lastActive === null || $lastActive->toDateString() !== $lagosDateString || ! $streak->exists) {
            $streak->current_streak = $currentStreak;
            $streak->best_streak = $bestStreak;
            $streak->last_active_date = Carbon::parse($lagosDateString);
            $streak->grace_days_used = $graceUsed;
            $streak->is_paused = false;
            $streak->save();
        }

        /** @var list<RewardLedger> $streakEntries */
        $streakEntries = [];
        $xpAwarded = 0;

        if ($appendLedgerRows) {
            $streakRule = RewardRule::activeForEvent(RewardEvent::TYPE_STREAK_DAY);
            if ($streakRule !== null) {
                $streakCurrencies = [
                    RewardCurrency::Xp->value => $streakRule->xp_amount,
                    RewardCurrency::Coins->value => $streakRule->coins_amount,
                    RewardCurrency::Gems->value => $streakRule->gems_amount,
                ];

                foreach ($streakCurrencies as $currency => $amount) {
                    if ($amount === 0) {
                        continue;
                    }

                    $key = sprintf('%s:%d:%s:%s', RewardEvent::TYPE_STREAK_DAY, $child->id, $lagosDateString, $currency);
                    $appended = RewardLedger::appendEntry(
                        childId: $child->id,
                        currency: $currency,
                        amount: $amount,
                        sourceType: RewardEvent::TYPE_STREAK_DAY,
                        sourceId: $lagosDateString,
                        ruleVersion: $streakRule->version,
                        idempotencyKey: $key,
                        createdAt: Carbon::instance($occurredAt),
                    );

                    if ($appended['created']) {
                        $streakEntries[] = $appended['entry'];
                        if ($currency === RewardCurrency::Xp->value) {
                            $xpAwarded += $amount;
                        }
                    }
                }
            }
        }

        return [
            'streak_change' => [
                'previous_streak' => $previousStreak,
                'current_streak' => (int) $streak->current_streak,
                'best_streak' => (int) $streak->best_streak,
                'incremented' => $incremented,
                'status' => $status,
                'last_active_date' => $lagosDateString,
                'grace_days_used' => (int) $streak->grace_days_used,
                'message' => $message,
            ],
            'entries' => $streakEntries,
            'xp_awarded' => $xpAwarded,
        ];
    }

    /**
     * @return list<array{slug: string, name: string, description: string|null, icon: string, color: string}>
     */
    private function evaluateAndGrantBadges(
        Child $child,
        int $totalXp,
        int $currentLevel,
        ?int $primaryLedgerId,
        bool $wasReplayed,
        Carbon $earnedAt,
    ): array {
        $lessonsCompletedCount = (int) RewardLedger::query()
            ->where('child_id', $child->id)
            ->where('source_type', RewardEvent::TYPE_LESSON_COMPLETED)
            ->distinct()
            ->count('source_id');

        $quizzesPassedCount = (int) RewardLedger::query()
            ->where('child_id', $child->id)
            ->where('source_type', RewardEvent::TYPE_QUIZ_PASSED)
            ->distinct()
            ->count('source_id');

        $perfectQuizzesCount = (int) RewardLedger::query()
            ->where('child_id', $child->id)
            ->where('source_type', RewardEvent::TYPE_PERFECT_QUIZ)
            ->distinct()
            ->count('source_id');

        /** @var ChildStreak|null $streak */
        $streak = ChildStreak::query()->where('child_id', $child->id)->first();
        $bestStreak = $streak !== null
            ? max((int) $streak->current_streak, (int) $streak->best_streak)
            : 0;

        /** @var list<Badge> $activeBadges */
        $activeBadges = Badge::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->all();

        /** @var array<int, ChildBadge> $existingByBadgeId */
        $existingByBadgeId = ChildBadge::query()
            ->where('child_id', $child->id)
            ->get()
            ->keyBy('badge_id')
            ->all();

        /** @var list<array{slug: string, name: string, description: string|null, icon: string, color: string}> $newlyEarned */
        $newlyEarned = [];

        foreach ($activeBadges as $badge) {
            $qualifies = match ($badge->condition_type) {
                'first_lesson', 'lessons_completed_count' => $lessonsCompletedCount >= $badge->condition_value,
                'first_quiz_pass' => $quizzesPassedCount >= $badge->condition_value,
                'perfect_quiz_count' => $perfectQuizzesCount >= $badge->condition_value,
                'streak_days' => $bestStreak >= $badge->condition_value,
                'level_reached' => $currentLevel >= $badge->condition_value,
                default => false,
            };

            if (! $qualifies) {
                continue;
            }

            $existing = $existingByBadgeId[$badge->id] ?? null;
            if ($existing === null) {
                ChildBadge::query()->create([
                    'child_id' => $child->id,
                    'badge_id' => $badge->id,
                    'ledger_id' => $primaryLedgerId,
                    'earned_at' => $earnedAt,
                ]);

                $newlyEarned[] = [
                    'slug' => $badge->slug,
                    'name' => $badge->name,
                    'description' => $badge->description,
                    'icon' => $badge->icon,
                    'color' => $badge->color,
                ];
            } elseif ($wasReplayed && $primaryLedgerId !== null && $existing->ledger_id === $primaryLedgerId) {
                $newlyEarned[] = [
                    'slug' => $badge->slug,
                    'name' => $badge->name,
                    'description' => $badge->description,
                    'icon' => $badge->icon,
                    'color' => $badge->color,
                ];
            }
        }

        return $newlyEarned;
    }

    private function determinePresentationTier(
        string $eventType,
        bool $leveledUp,
        int $newBadgesCount,
        bool $streakIncremented,
        bool $newTitleUnlocked,
    ): string {
        if ($eventType === RewardEvent::TYPE_PERFECT_QUIZ) {
            return RewardResult::TIER_BIG;
        }

        if ($leveledUp && ($newBadgesCount > 0 || $newTitleUnlocked)) {
            return RewardResult::TIER_BIG;
        }

        if ($leveledUp) {
            return RewardResult::TIER_LEVEL_UP;
        }

        if ($newBadgesCount > 0) {
            return RewardResult::TIER_BADGE;
        }

        if ($eventType === RewardEvent::TYPE_STREAK_DAY || $streakIncremented) {
            return RewardResult::TIER_STREAK;
        }

        return RewardResult::TIER_SMALL;
    }
}
