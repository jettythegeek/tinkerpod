# Backend development plan

Source PRD: sections 9–13, 15–20, 22–25.

## Stack

- Latest compatible Laravel, PHP 8.5, MySQL 8.4.
- Sanctum for API tokens; Spatie Permission for dashboard roles.
- Filament for admin/mentor operations.
- Queues and scheduler for notifications, reports, certificates, and webhook follow-up.
- S3-compatible private storage in production; local private disk in development.

## Code organization

Use domain-oriented folders under `app/Domain`: Identity, Children, Learning, Projects, Mentorship, LiveClasses, Billing, Notifications, Rewards, Support, Reporting, and Settings. HTTP controllers remain thin; validation belongs in Form Requests, authorization in Policies, output in API Resources, and business workflows in Actions/Services.

## Conventions

- All mobile endpoints live under `/api/v1`.
- Use database transactions for payments, enrollment, reviews, and awards.
- Use enums for shared statuses and roles, with matching client constants.
- Use UTC in storage and return ISO 8601 timestamps; retain event timezone metadata.
- Use queued listeners for side effects after domain state commits.
- Use idempotency keys/provider references for external payment events.

## Delivery order

1. Health endpoint, response helpers, exception mapping, CI/test baseline.
2. Identity, roles, parent profile, and child ownership.
3. Plans, billing, subscription access service.
4. Learning content, enrollment, progress, quizzes.
5. Projects, mentors, pods, and review workflow.
6. Live classes, notifications, rewards, support, reports.
7. Hardening: rate limits, audit, signed files, backup/restore, monitoring.

## Operational requirements

- Scheduler runs every minute; queue workers are supervised.
- Failed jobs and webhook failures are visible to admins.
- Health checks distinguish application health from optional dependency readiness.
- Production configuration never logs tokens, passwords, child PINs, or webhook payload secrets.

