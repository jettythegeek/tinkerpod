# TinkerPod build plan

Each work package below is intentionally small enough for one coding agent. An agent must read this file, `docs/DECISIONS.md`, and the package's referenced PRD sections before changing code.

## Definition of done for every package

1. Database changes include migrations, factories, seeders, and rollback behavior.
2. API changes include request validation, authorization policy, resource/response shape, and feature tests.
3. UI changes include loading, empty, error, success, accessibility, and small-screen states.
4. Secrets remain in ignored environment files.
5. Relevant tests and linters pass; handoff records commands and any remaining blocker.

## Current package

**P2.3 Lesson delivery and progress** — next up. Depends on P2.2 enrollment access gate.

## Package status

Status must cite observed code, a command result, or a handoff — never intent. Every package handoff flips its own row.

Legend: `Done` acceptance met · `Partial` shipped with named gaps · `Active` being written now · `—` not started.

| Package | Status | Evidence | Outstanding |
|---|---|---|---|
| P0.1 Decisions | Done | `docs/DECISIONS.md` | content vocabulary rows disputed (2026-09-26) |
| P0.2 API contract | Done | `docs/api/openapi-v1.yaml` | catalogue endpoints not yet in the contract |
| P0.3 Reward/motion contracts | Partial | motion/audio spec, `ranks` seeded 2026-07-16 | mobile has no shared motion, sound, or haptic token layer |
| P1.1 Bootstrap | Done | `/api/v1/health` in `routes/api.php` | — |
| P1.2 Auth and roles | Partial | `AuthController` register/login/logout/me, Sanctum | no password-reset endpoint although `mobile/src/app/forgot-password.tsx` exists; Spatie Permission not installed, so roles are a plain `users.role` string |
| P1.3 Child profiles | Done | children migration, `ChildPolicy`, hashed PIN | — |
| P1.3A Pods | Done | pods, pod_members, ranks, recommendation and join endpoints | — |
| P1.4 Admin foundation | Partial | Filament v5 panel with Users, Children, Plans, Pods | no `audit_logs` table despite this plan and `DECISIONS.md` requiring audited admin overrides; no permission-driven navigation |
| P1.5 Plans and Paystack | Done | initialize, verify, webhook, and settle actions | live Paystack keys never exercised |
| P1.5A Access gates | Done | `SubscriptionAccessService`, handoff 2026-08-01 | — |
| P1.6 Expo onboarding | Partial | 8 screens: welcome, register, login, forgot-password, create-child, pod-match, parent-home | no plan or checkout screen, no child profile switcher, forgot-password dead-ends |
| P1.7 Public web | — | Laravel default `welcome.blade.php` only | entire landing site |
| P2.1 Content schema/admin | Done | content migration, Track/Course/Module/Lesson models, `Domain/Learning/*`, four Filament resources, `LearningContentSeeder`, public catalogue routes, `ContentPolicy`, OpenAPI updated, handoff 2026-09-26 | 5 Filament v5 test-harness failures deferred (isolated blocker) |
| P2.2 Enrollment/access | Done | `course_enrollments` migration, `CourseAccessService`, `EnrollChildInCourse`, `EnrollmentPolicy`, 3 endpoints, 11 tests, handoff 2026-10-02 | — |
| P2.3 Lesson delivery/progress | — | — | — |
| P2.4 Quizzes | — | — | — |
| P2.5 Mobile learning | — | — | — |
| P2.6 Gamification engine | Partial | overall and per-Pod rank rows seeded early | no XP ledger, badges, streaks, challenges, or award service |
| P2.7 Pod home/feedback | — | — | — |
| P3.1–P3.5 | — | — | — |
| P4.1–P4.3 | — | — | — |
| P5.1–P5.4 | — | — | — |
| P6 deferred | — | — | — |

### Release gates

| Gate | Status | Blocking evidence |
|---|---|---|
| R1 register → child → pay → access | Not met | entitlement API is complete, but no in-app payment screen exists, so a parent cannot pay |
| R2 learning | Not met | no enrollment, progress, or lesson delivery |
| R3 guided projects | Not met | Phase 3 not started |
| R4 live/rewards | Not met | Phase 4 not started |
| MVP | Not met | R1–R4 plus Phase 5 and the public site |

Verified by direct inspection of `api/`, `mobile/`, and `docs/` on 2026-09-26.

## Phase 0 — Product contract

### P0.1 Decisions and domain vocabulary

- Input: PRD sections 1–6, 24, 26.
- Output: locked MVP defaults in `docs/DECISIONS.md`; shared role, age-group, level, status, and plan vocabulary.
- Acceptance: backend and mobile use identical enum values.

### P0.2 API contract

- Output: OpenAPI document for `/api/v1`, standard success/error envelopes, pagination and error codes.
- Depends on: P0.1.

### P0.3 Pod, reward, motion, and audio contracts

- Define Pod identity tokens, XP event vocabulary, rank thresholds, badge criteria, challenge states, leaderboard privacy, celebration tiers, sound keys, haptic patterns, and accessibility fallbacks.
- Acceptance: backend, mobile, admin, analytics, and content plans use the same stable event identifiers.
- Depends on: P0.1.

## Phase 1 — Foundation

### P1.1 Laravel platform bootstrap

- Laravel, MySQL environment, `/api/v1/health`, API response helper, CI baseline.
- Acceptance: fresh install can connect and migrate; health endpoint returns the standard envelope.

### P1.2 Authentication and roles

- Sanctum; Spatie Permission; parent register/login/logout/me; password reset; auth throttling.
- Tables: `users`, `parent_profiles`.
- Tests: duplicate email/phone, invalid credentials, inactive account, token revocation.
- Depends on: P1.1, P0.2.

### P1.3 Child profiles and ownership

- CRUD children, hashed optional PIN, profile switch response, parent ownership policies.
- Tables: `children`.
- Tests: cross-parent access is always denied; age group is derived consistently.
- Depends on: P1.2.

### P1.3A Pod recommendation and membership

- Recommend a primary Pod from age, level, interests, and desired builds; parent accepts or chooses another.
- Tables: rich `pods`, `pod_mentors`, `pod_members`; seed five launch Pods.
- Acceptance: a new child enters a branded Pod world with a mentor assignment boundary, first path, and Tinker Starter/Pod rank.
- Depends on: P1.3, P0.3.

### P1.4 Admin foundation

- Filament install, admin panel, roles/permissions, Users/Parents/Children resources, audit logging.
- Depends on: P1.2–P1.3.

### P1.5 Plans and Paystack subscriptions

- Plans, subscriptions, transactions; initialize/verify/webhook service; idempotency and signature checks.
- Never activate access from client callback alone.
- Depends on: P1.2.

### P1.5A R1 subscription access gates

- Wire `SubscriptionAccessService` into child-create and Pod join limits; expose entitlement fields on parent subscription.
- Pre-payment onboarding allows one child and one primary Pod; paid plans enforce `max_children` / `max_active_pods`.
- Depends on: P1.5, P1.3, P1.3A.

### P1.6 Expo shell and onboarding

- Expo Router + TypeScript, TanStack Query, SecureStore, forms/Zod, brand tokens/assets.
- Screens: splash, onboarding, register, login, forgot/reset, create child, profile switcher.
- Depends on: P0.2, P1.2–P1.3.

### P1.7 Public web foundation

- Landing site shell, metadata, favicon, header/footer, responsive tokens, waitlist/contact boundary.
- Depends on: approved page concepts and brand assets.

## Phase 2 — Learning core

### P2.1 Content schema/admin

- Tracks, courses, modules, lessons; ordering, draft/publish/archive; Filament resources.

### P2.2 Enrollment/access rules

- Course enrollments and plan access rules; free previews; child eligibility.
- Depends on: P1.5, P2.1.

### P2.3 Lesson delivery/progress

- Lesson resources, signed private attachments, progress and completion rules.
- Depends on: P2.1–P2.2.

### P2.4 Quizzes

- Questions, attempts, scoring, attempt caps, quiz-pass lesson completion.
- Depends on: P2.3.

### P2.5 Mobile learning experience

- Parent/child dashboards, catalog, course/module detail, lesson player, progress states.
- Depends on: P2.1–P2.4.

### P2.6 Gamification engine

- Immutable XP ledger, idempotent award service, overall and Pod ranks, badges, streaks, achievements, challenges, unlock rules, and notifications.
- Acceptance: replayed events never double-award; negative adjustments are explicit ledger entries; rank/badge transitions are reproducible.
- Depends on: P1.3A, P2.3–P2.4.

### P2.7 Pod home and feedback system

- Pod identity, rank/XP progress, current learning/project, mentor, live class, challenges, badges, and privacy-safe leaderboard preview.
- Implement motion/audio foundation and celebration tiers with accessibility settings.
- Depends on: P2.5–P2.6.

## Phase 3 — Projects and mentorship

### P3.1 Projects/submissions

- Project catalog, draft/submission workflow, validated uploads/links, private history.

### P3.2 Mentors/pods

- Mentor profiles, pod capacity, membership and assignment policies.

### P3.3 Review workflow

- Assignment, rubric review, statuses, immutable review history, parent/child visibility.
- Depends on: P3.1–P3.2.

### P3.4 Mobile projects/feedback

- Project detail, upload, status timeline, review feedback and improvement resubmission.

### P3.5 Challenges and leaderboards

- Weekly/monthly/Pod/project challenges; age-banded weekly/monthly leaderboards; snapshots; personal movement messaging; moderation/admin controls.
- Depends on: P2.6, P3.1–P3.3.

## Phase 4 — Live and notifications

### P4.1 Live classes/attendance

- Admin scheduling, eligibility, register/join window, cancellation and attendance.

### P4.2 Notification platform

- Database notifications, Expo tokens/push, email queues, preferences and delivery logging.

### P4.3 Scheduler jobs

- 24-hour/1-hour class reminders, due dates, renewal/expiry, inactivity summaries.

## Phase 5 — Rewards, reporting, operations

### P5.1 Badges and certificates

- Idempotent award rules, certificate numbers, generation/revocation/verification.

### P5.2 Parent progress reports

- In-app monthly summary and recommendation data.

### P5.3 Admin analytics/exports

- Revenue, subscriptions, completion, mentor/pod, submissions and attendance; queued CSV export.

### P5.4 Support

- Parent tickets/replies, admin assignment, status and priority workflow.

## Phase 6 — Deferred ecosystem

Separate releases: Camps, Kits, Schools, Young Founders specialization, moderated public gallery. These must not delay the Academy MVP.

## Release gates

- R1 Foundation: parent can register, add a child, pay, and receive authorized access.
- R2 Learning: eligible child can complete a lesson, progress persists, XP awards once, and accessible feedback is presented.
- R3 Guided projects: child submits, assigned mentor reviews, parent sees feedback.
- R4 Live/rewards: reminders, attendance, badge/certificate flow work end to end.
- MVP: all PRD acceptance criteria pass plus privacy/security review and backup/restore rehearsal.
