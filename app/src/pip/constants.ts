export const PIP_IDLE_SOURCE_ASSET = 'design/motion/svg/pip-idle.svg' as const;
export const PIP_IDLE_DURATION_MS = 3200 as const;

export const PIP_MOODS = {
  idle: { dur: 3.2, title: 'Idle', svg: 'design/motion/svg/pip-idle.svg' },
  wave: { dur: 2.8, title: 'Wave hello', svg: 'design/motion/svg/pip-wave.svg' },
  happy: { dur: 2.6, title: 'Happy smile', svg: 'design/motion/svg/pip-happy.svg' },
  sad: { dur: 4.4, title: 'Sad (streak broken)', svg: 'design/motion/svg/pip-sad.svg' },
  laugh: { dur: 1.4, title: 'Laugh', svg: 'design/motion/svg/pip-laugh.svg' },
  clap: { dur: 1.8, title: 'Clap', svg: 'design/motion/svg/pip-clap.svg' },
  cheer: { dur: 3.2, title: 'Cheer + confetti', svg: 'design/motion/svg/pip-cheer.svg' },
} as const;

export type PipMoodKey = keyof typeof PIP_MOODS;
