# Admin and mentor dashboard plan

Source PRD: sections 4, 10, 15, 22–25.

## Panels and roles

Use one Filament panel with permission-driven navigation for super admin, admin, content manager, mentor, support, and finance. Mentor queries are additionally scoped by policies; hiding navigation is not authorization.

## Resource groups

- People: users, parents, children, mentors, roles/permissions.
- Learning: tracks, courses, modules, lessons, quizzes, projects.
- Pods/mentorship: Pod identities/pathways, mentors/roles, members, courses/projects, submissions, reviews, announcements.
- Gamification: XP rules/ledger adjustments, rank ladders, badges/achievements, streak policy, challenges, leaderboard periods/snapshots, and reward presentation assets.
- Live: classes and attendance.
- Billing: plans, subscriptions, transactions, reconciliation.
- Engagement: badges, certificates, notifications, support.
- Operations: reports, settings, audit logs.
- Deferred: camps, kits, schools.

## Priority workflows

1. Publish ordered course content with validation preventing incomplete publication.
2. Assign mentors/pods and surface capacity conflicts.
3. Review submission queues with filters, rubric, history, and status transition rules.
4. Schedule/reschedule/cancel live classes and notify affected learners.
5. Reconcile payments and manually activate only with permission and audit reason.
6. Preview reward-rule changes against fixtures before publishing; configure effective dates so thresholds do not silently rewrite earned history.

## Dashboard metrics

Metrics must have documented definitions and date ranges: parents, children, active subscriptions, recognized revenue, pending reviews, upcoming classes, mentors/pods, completion rate, registrations, and expiring access.
