# Mobile app development plan

Source PRD: sections 7–9, 14, 21–25.

## Stack

Expo Router, TypeScript, TanStack Query, Axios, SecureStore, React Hook Form, Zod, Expo Notifications, ImagePicker/FileSystem, and the current Expo video package. Use StyleSheet/design tokens unless NativeWind is deliberately adopted for the whole app.

## App architecture

- `app/`: route groups `(auth)`, `(parent)`, `(child)`, and modal flows.
- `features/`: auth, children, billing, pods, learning, projects, challenges, rewards, leaderboards, live, notifications, account.
- `components/`: accessible shared primitives only.
- `lib/`: API client, query keys, secure session, uploads, analytics, errors.
- `theme/`: Nunito typography, PRD colors, spacing, radii, elevation, motion.

## Navigation

- Parent tabs: Home, Children, Learning, Progress, Account.
- Child tabs: Home, Learn, Projects, Live, Rewards.
- Switching to a child creates an explicit active-profile context; it does not replace the parent API identity.

## Milestones

1. Brand assets, splash/onboarding, session restoration, register/login/recovery.
2. Child creation/editing, recommendations, profile switcher and optional PIN.
3. Plans, checkout handoff, payment verification and access refresh.
4. Catalog, course/module/lesson player, quizzes, resilient progress syncing.
5. Projects, upload queue, status timeline, reviews and resubmission.
6. Live classes, reminders, notifications, badges, certificates, account/support.
7. Celebration polish: tiered XP/badge/rank/Pod animations, sound themes, haptics, motion/audio settings, and performance QA.

## UX requirements

- Parent and child modes must be visually distinct without feeling like separate brands.
- Every server screen handles offline/retry, skeleton/loading, empty, validation, and expired-access states.
- Child-facing copy is age-appropriate; destructive or payment actions require parent mode.
- Tokens go only in SecureStore; no secrets or child PINs in AsyncStorage/logs.
- A child lands in their Pod world, not a generic course catalog. The Pod home is the primary learner dashboard.
- Reward results come from the server and are queued locally for ordered, replayable presentation; animations never determine state.
- Respect system reduced motion and in-app mute/reduced-effects settings; never require sound, color, or motion to understand success.
