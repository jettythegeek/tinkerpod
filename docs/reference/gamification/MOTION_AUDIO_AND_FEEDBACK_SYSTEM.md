# Motion, audio, haptics, and feedback system

Source: `source/conversations/motion-and-svg-animation.txt` plus approved gamification direction.

## Technology roles

- Lottie: authored hero celebrations such as badge unlock, rank up, Pod join/unlock, level/course/capstone completion.
- React Native SVG: scalable badges, rings, rays, glows, stars, progress ornaments, and simple code-controlled vector motion.
- Reanimated/Moti: screen transitions, counters, progress fills, card/state motion, leaderboard movement, and reward-modal choreography.
- Expo audio/haptics: short branded chimes and tactile reinforcement. No remote audio is required for core feedback.

## Celebration tiers

- Tier 0, micro: tap/selection, small XP gain—subtle scale/color/haptic, normally no modal.
- Tier 1, progress: lesson/quiz/streak—XP count-up, progress fill, short chime.
- Tier 2, achievement: badge/challenge/project approval—focused reveal, ring/rays/sparkles, named reward, replay option.
- Tier 3, milestone: rank/Pod level/course/capstone—full-screen but brief choreography, distinctive sound/haptic, next-goal message.

Reserve confetti and large bursts for meaningful milestones so effects retain emotional value.

## Required sequences

- Badge: dim → badge pop → expanding ring → rotating rays/stars → title/XP → Continue.
- Rank: old rank glow → bar completes → burst/transition → new mark appears → rank title/sound → next target.
- XP: source label → particles/counter travel → total count-up → progress settles.
- Leaderboard climb: old/new positions animate with positive, factual copy and no humiliation.
- Pod join/unlock: Pod palette/world reveal, identity sound, starting rank, first mission.

## Sound language

Define stable semantic keys: `tap_soft`, `success_small`, `xp_gain`, `badge_unlock`, `rank_up`, `challenge_complete`, `project_approved`, `streak`, `pod_join`, `error_soft`. Sounds should be warm, bright, short, non-startling, normalized, and duck/pause correctly with other device audio.

## Accessibility and control

- Global sound toggle, effects volume, haptics toggle, reduced motion, reduced celebration effects, and replay celebration.
- Respect OS reduced-motion and silent/interruption behavior.
- Reduced mode replaces spins, particles, parallax, and flashes with fades/static states; reward information remains identical.
- Avoid rapid flashing, excessive vibration, autoplay speech, and essential audio-only cues.
- Screen readers announce reward title, reason, XP, new rank, and next action after animation settles.

## Performance and asset governance

Target smooth performance on representative low/mid Android devices. Keep vector complexity and simultaneous particles bounded; prefetch milestone assets; provide static fallback frames; cancel animations on navigation/backgrounding; version assets and sound keys. Every reward component needs performance, interruption, accessibility, and screenshot/visual QA.

