/**
 * Approved FX celebration cues registry (M0 scaffold).
 * All celebrations trace strictly to `design/fx/svg/fx01`..`fx05` and `design/fx/src/cues.json`.
 */
export const APPROVED_FX_CUES = {
  fx01XpCoins: 'design/fx/svg/fx01-xp-coins.svg',
  fx02LevelUp: 'design/fx/svg/fx02-level-up.svg',
  fx03CorrectWrong: 'design/fx/svg/fx03-correct-wrong.svg',
  fx04PackUnlock: 'design/fx/svg/fx04-pack-unlock.svg',
  fx05StreakMission: 'design/fx/svg/fx05-streak-mission.svg',
} as const;

export type ApprovedFxCueKey = keyof typeof APPROVED_FX_CUES;
