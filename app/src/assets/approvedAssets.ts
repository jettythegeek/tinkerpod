/* eslint-disable @typescript-eslint/no-require-imports */
import { ImageSourcePropType, Platform } from 'react-native';

export const APPROVED_LOGO_ASSET: ImageSourcePropType = require('../../../design/assets/logo.png');

export const APPROVED_AVATAR_ASSETS: Record<string, ImageSourcePropType> = {
  'av1.png': require('../../../design/assets/av1.png'),
  'av2.png': require('../../../design/assets/av2.png'),
  'av3.png': require('../../../design/assets/av3.png'),
  'av4.png': require('../../../design/assets/av4.png'),
  'av5.png': require('../../../design/assets/av5.png'),
  'av6.png': require('../../../design/assets/av6.png'),
  'av-girl.png': require('../../../design/assets/av-girl.png'),
};

export const APPROVED_AVATAR_KEYS = Object.keys(APPROVED_AVATAR_ASSETS);

export function resolveApprovedAvatar(filename: string): ImageSourcePropType | null {
  const normalized = filename.trim().toLowerCase();
  const key = normalized.endsWith('.png') ? normalized : `${normalized}.png`;
  return APPROVED_AVATAR_ASSETS[key] ?? null;
}

export const APPROVED_GIRL_CUTOUT_ASSET: ImageSourcePropType = require('../../../design/assets/girl-cutout.png');
export const APPROVED_MASCOT_CHEERING_ASSET: ImageSourcePropType = require('../../../design/assets/mascot-cheering.png');
export const APPROVED_MASCOT_HAPPY_ASSET: ImageSourcePropType = require('../../../design/assets/mascot-happy.png');
export const APPROVED_MASCOT_SLEEPY_ASSET: ImageSourcePropType = require('../../../design/assets/mascot-sleepy.png');
export const APPROVED_MASCOT_THINKING_ASSET: ImageSourcePropType = require('../../../design/assets/mascot-thinking.png');

export const APPROVED_PIP_CELEBRATE_PNG: ImageSourcePropType = require('../../../design/assets/pip/pip-celebrate.png');
export const APPROVED_PIP_SLEEPY_PNG: ImageSourcePropType = require('../../../design/assets/pip/pip-sleepy.png');
export const APPROVED_PIP_SLEEPY_WAKE_PNG: ImageSourcePropType = require('../../../design/assets/pip/pip-sleepy-wake.png');
export const APPROVED_PIP_SURPRISED_PNG: ImageSourcePropType = require('../../../design/assets/pip/pip-surprised.png');
export const APPROVED_PIP_THINKING_PNG: ImageSourcePropType = require('../../../design/assets/pip/pip-thinking.png');

export const APPROVED_JOURNEY_MAP_BG_ASSET: ImageSourcePropType = require('../../../design/assets/journey-map-bg.jpg');
export const APPROVED_LESSON_LOOPS_ASSET: ImageSourcePropType = require('../../../design/assets/lesson-loops.jpg');
export const APPROVED_ADVENTURE_NGODO_ASSET: ImageSourcePropType = require('../../../design/assets/adventure-ngodo.jpg');
export const APPROVED_MISSION_LOST_KEY_ASSET: ImageSourcePropType = require('../../../design/assets/mission-lost-key.jpg');

export const APPROVED_EMPTY_NO_TOURNAMENTS_PNG: ImageSourcePropType = require('../../../design/assets/empty/static/empty-no-tournaments.png');
export const APPROVED_EMPTY_NO_PACKS_PNG: ImageSourcePropType = require('../../../design/assets/empty/static/empty-no-packs.png');
export const APPROVED_EMPTY_NO_LESSONS_PNG: ImageSourcePropType = require('../../../design/assets/empty/static/empty-no-lessons.png');

export const APPROVED_FX06_CONFETTI_PNG: ImageSourcePropType = require('../../../design/fx/static/fx06-confetti-burst.png');
export const APPROVED_FX07_STAR_BURST_PNG: ImageSourcePropType = require('../../../design/fx/static/fx07-star-burst.png');
export const APPROVED_FX08_BADGE_REVEAL_PNG: ImageSourcePropType = require('../../../design/fx/static/fx08-badge-reveal.png');
export const APPROVED_FX09_TROPHY_REVEAL_PNG: ImageSourcePropType = require('../../../design/fx/static/fx09-trophy-reveal.png');
export const APPROVED_FX10_FLAME_IDLE_PNG: ImageSourcePropType = require('../../../design/fx/static/fx10-streak-flame-idle.png');

export const APPROVED_FX01_SVG: string = require('../../../design/fx/svg/fx01-xp-coins.svg');
export const APPROVED_FX02_SVG: string = require('../../../design/fx/svg/fx02-level-up.svg');
export const APPROVED_FX03_SVG: string = require('../../../design/fx/svg/fx03-correct-wrong.svg');
export const APPROVED_FX04_SVG: string = require('../../../design/fx/svg/fx04-pack-unlock.svg');
export const APPROVED_FX05_SVG: string = require('../../../design/fx/svg/fx05-streak-mission.svg');
export const APPROVED_FX06_SVG: string = require('../../../design/fx/svg/fx06-confetti-burst.svg');
export const APPROVED_FX06_STATIC_SVG: string = require('../../../design/fx/static/fx06-confetti-burst-static.svg');
export const APPROVED_FX07_SVG: string = require('../../../design/fx/svg/fx07-star-burst.svg');
export const APPROVED_FX07_STATIC_SVG: string = require('../../../design/fx/static/fx07-star-burst-static.svg');
export const APPROVED_FX08_SVG: string = require('../../../design/fx/svg/fx08-badge-reveal.svg');
export const APPROVED_FX08_STATIC_SVG: string = require('../../../design/fx/static/fx08-badge-reveal-static.svg');
export const APPROVED_FX09_SVG: string = require('../../../design/fx/svg/fx09-trophy-reveal.svg');
export const APPROVED_FX09_STATIC_SVG: string = require('../../../design/fx/static/fx09-trophy-reveal-static.svg');
export const APPROVED_FX10_SVG: string = require('../../../design/fx/svg/fx10-streak-flame-idle.svg');
export const APPROVED_FX10_STATIC_SVG: string = require('../../../design/fx/static/fx10-streak-flame-idle-static.svg');

export const APPROVED_PIP_CELEBRATE_SVG: string = require('../../../design/motion/svg/pip-celebrate.svg');
export const APPROVED_PIP_CELEBRATE_STATIC_SVG: string = require('../../../design/assets/pip/pip-celebrate-static.svg');
export const APPROVED_PIP_SLEEPY_SVG: string = require('../../../design/motion/svg/pip-sleepy.svg');
export const APPROVED_PIP_SLEEPY_STATIC_SVG: string = require('../../../design/assets/pip/pip-sleepy-static.svg');
export const APPROVED_PIP_SLEEPY_WAKE_SVG: string = require('../../../design/assets/pip/pip-sleepy-wake.svg');
export const APPROVED_PIP_SLEEPY_WAKE_STATIC_SVG: string = require('../../../design/assets/pip/pip-sleepy-wake-static.svg');

export const APPROVED_FX01_AUDIO_ASSET: number = Platform.select({
  android: require('../../../design/fx/audio/fx01-xp-coins.ogg'),
  default: require('../../../design/fx/audio/fx01-xp-coins.wav'),
}) as number;

export const APPROVED_FX02_AUDIO_ASSET: number = Platform.select({
  android: require('../../../design/fx/audio/fx02-level-up.ogg'),
  default: require('../../../design/fx/audio/fx02-level-up.wav'),
}) as number;

export const APPROVED_FX03_AUDIO_ASSET: number = Platform.select({
  android: require('../../../design/fx/audio/fx03-correct-wrong.ogg'),
  default: require('../../../design/fx/audio/fx03-correct-wrong.mp3'),
}) as number;

export const APPROVED_FX05_AUDIO_ASSET: number = Platform.select({
  android: require('../../../design/fx/audio/fx05-streak-mission.ogg'),
  default: require('../../../design/fx/audio/fx05-streak-mission.wav'),
}) as number;

export const APPROVED_UI_BADGE_EARNED_AUDIO_ASSET: number = Platform.select({
  android: require('../../../design/fx/audio/ui-badge-earned.ogg'),
  default: require('../../../design/fx/audio/ui-badge-earned.wav'),
}) as number;

export const APPROVED_UI_SUCCESS_SMALL_AUDIO_ASSET: number = Platform.select({
  android: require('../../../design/fx/audio/ui-success-small.ogg'),
  default: require('../../../design/fx/audio/ui-success-small.wav'),
}) as number;

export const APPROVED_UI_ERROR_AUDIO_ASSET: number = Platform.select({
  android: require('../../../design/fx/audio/ui-error.ogg'),
  default: require('../../../design/fx/audio/ui-error.wav'),
}) as number;

export const APPROVED_FX_CUES = require('../../../design/fx/src/cues.json');
export const APPROVED_FX08_MOTION = require('../../../design/fx/json/fx08-badge-reveal.motion.json');
export const APPROVED_FX10_MOTION = require('../../../design/fx/json/fx10-streak-flame-idle.motion.json');
export const APPROVED_PIP_SLEEPY_MOTION = require('../../../design/motion/json/pip-sleepy.motion.json');
export const APPROVED_PIP_CELEBRATE_MOTION = require('../../../design/motion/json/pip-celebrate.motion.json');
