export interface GamificationMissionStub {
  readonly id: string;
  readonly label: string;
  readonly completed: boolean;
  readonly rewardXp: number;
}

export interface GamificationSummaryStub {
  readonly xp: number;
  readonly nextLevelXp: number;
  readonly level: number;
  readonly title: string;
  readonly nextTitle: string;
  readonly coins: number;
  readonly gems: number;
  readonly stars: number;
  readonly streakDays: number;
  readonly missions: readonly GamificationMissionStub[];
}

/**
 * M2 Gamification Stub.
 *
 * XP, coins, streaks, levels, and missions belong to M3 (Server-Authoritative Gamification).
 * This stub supplies zeroed values so M2 screens preserve the exact layout slots from
 * `01-kid-home.png`, `10-teen-home.png`, `02-journey-map.png`, `03-lesson-detail.png`,
 * and `04-quiz.png` without inventing client-side reward logic.
 */
export function getGamificationStub(): GamificationSummaryStub {
  return {
    xp: 0,
    nextLevelXp: 0,
    level: 1,
    title: 'Starter Explorer',
    nextTitle: 'Level 1',
    coins: 0,
    gems: 0,
    stars: 0,
    streakDays: 0,
    missions: [],
  };
}
