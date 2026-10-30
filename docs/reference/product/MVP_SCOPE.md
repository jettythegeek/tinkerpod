# MVP scope

Source PRD: sections 1–9, 23–27.

## Outcome

TinkerPod MVP lets a parent register, create a child profile, purchase learning access, and monitor that child's structured lessons, projects, mentor feedback, live classes, progress, badges, and certificates.

## Users

- Parent: account owner, payer, child manager, and progress viewer.
- Child: parent-controlled learner profile with optional PIN.
- Mentor: dashboard user limited to assigned pods, learners, submissions, and classes.
- Admin/content/support/finance: permission-scoped dashboard users.
- Super admin: settings, integrations, permissions, audit, and unrestricted operations.

## Core loop

Learn → Build → Submit → Receive feedback → Improve → Showcase privately.

## MVP capabilities

- Parent authentication and profile.
- Child profiles, interests, level, age group, and profile switching.
- Plans, Paystack payment, subscription status, and content access.
- Tracks, courses, modules, lessons, quizzes, enrollment, and progress.
- Projects, uploads/links, submission states, mentor review, and resubmission.
- Pods, mentor assignment, live schedule, attendance, and reminders.
- Pod worlds, XP ledger, overall/Pod ranks, badges, streaks, challenges, privacy-safe leaderboards, celebrations, sounds, and haptics.
- In-app/push/email notifications.
- Certificates, parent progress view, sensory/accessibility controls, support tickets, basic analytics.
- Filament operations dashboard and public landing site.

## Explicitly deferred

- Child-independent accounts, in-app mentor chat, AI assistant, leaderboards.
- Public project gallery, offline video, wallet/referrals, mentor mobile app.
- Kit commerce, school dashboard, and advanced camp operations.

## End-to-end acceptance

A seeded clean environment must demonstrate: parent registration → child creation → successful webhook-confirmed payment → eligible course access → lesson completion → project submission → assigned mentor review → parent/child feedback visibility → class reminder/attendance → badge or certificate award.
