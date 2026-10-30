# Testing and release plan

Source PRD: sections 19, 20, 23.

## Test layers

- Unit: enums, access calculations, scoring, award rules, status transitions.
- Property/idempotency: repeated, reordered, or retried learning events produce the same XP/rank/badge result.
- Feature/API: validation, policies, envelopes, database effects, jobs, webhooks.
- Integration: MySQL, storage, queues, Paystack sandbox, push/email fakes.
- Mobile component/integration: forms, navigation guards, query/error/offline states.
- Sensory/accessibility: mute, reduced motion, reduced effects, screen readers, sound interruption, animation replay, low-end device performance.
- End-to-end: the MVP household journey defined in `product/MVP_SCOPE.md`.
- Security: horizontal access, role escalation, upload abuse, rate limits, webhook forgery.

## CI gates

Backend formatting/static analysis/tests and migration check; mobile typecheck/lint/tests; web build/lint/accessibility smoke test; secret/dependency scan. No release with failing migrations or critical/high security findings.

## Environments

Local → CI → staging → production. Staging uses sandbox providers and representative anonymized/seeded data. Production release requires database backup, migration plan, smoke checks, rollback owner, queue/scheduler verification, and error monitoring.

## MVP release checklist

All PRD acceptance criteria, webhook reconciliation, notification retry, privacy/terms links, child-data deletion workflow, signed uploads, backup restore rehearsal, analytics definitions, and app-store assets are verified.
