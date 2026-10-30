# Database plan

Source PRD: section 11.

## Migration sequence

1. Identity: users, parent profiles, mentor profiles, permission tables.
2. Children and vocabulary: children, tracks.
3. Learning: courses, modules, lessons, enrollments, progress, quizzes/questions/attempts.
4. Pods/mentorship/projects: rich pods, pod mentors/courses/projects/members, projects, submissions, reviews, challenges.
5. Billing: plans, subscriptions, transactions.
6. Gamification: XP transactions, ranks, rank progress, badges/awards, streaks, achievements, challenge participation, leaderboard snapshots.
7. Live/engagement: classes, attendance, notifications, push tokens, user experience preferences.
8. Rewards/support: certificates, tickets/replies.
9. Deferred domains: camps, kits, schools.
10. Operations: audit logs and settings.

## Required constraints

- Unique enrollment `(child_id, course_id)` and pod membership `(pod_id, child_id)`.
- Unique lesson progress `(child_id, lesson_id)` and badge award `(child_id, badge_id)`.
- Unique payment provider reference and certificate number.
- Unique XP award key/source tuple and challenge participation `(challenge_id, child_id)`.
- Unique current rank progress per child/scope; rank level unique within overall or Pod scope.
- One parent profile/mentor profile per user.
- Foreign keys use restrictive deletion for financial/audit records; nullable associations use `nullOnDelete` only where historical meaning survives.
- Child PIN is hashed and never queryable or returned.

## Indexing

Index all foreign keys plus common filters: user role/status, child parent/status, content status/sort, subscription parent/status/renewal, submission mentor/status/submitted date, class start/status, notification user/read date, and audit entity/date.

## Data policy

- Prefer string-backed PHP enums mapped to indexed varchar columns over database enums when workflow values may evolve.
- JSON is appropriate for flexible metadata, rubric definitions/scores, feature lists, and provider payload fragments—not core searchable relations.
- Store payment amounts as integer minor units in transaction processing; expose formatted decimals through resources.
- XP is never stored as an unexplained mutable total: `xp_transactions` is authoritative; cached totals are rebuildable projections.
- Factories and seeders must provide plans, roles, tracks, sample courses, and an end-to-end demo household.
