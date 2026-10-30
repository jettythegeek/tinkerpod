# Security and child safety

Source PRD: sections 15, 16, 19.

## Access control

Policies enforce parent ownership, mentor assignment, active subscription/content eligibility, and permission-scoped administration. Automated tests must attempt cross-household and cross-pod access for every child resource.

## Credentials and sessions

Passwords and child PINs are hashed; tokens are revocable and stored in SecureStore. Auth endpoints are rate limited. Sensitive changes require current credentials or verified recovery flow.

## Files and payments

Validate MIME, extension, size, and authorization; store privately and use signed URLs. Validate Paystack signatures and amounts, apply idempotency, and never trust client payment success.

## Child privacy

- Parent controls the child profile and deletion/export requests.
- Minimize collected fields; gender and photo remain optional.
- No public full names, projects, or identifiable media without recorded parent consent.
- Mentor interactions are platform-visible, logged, and parent-accessible.
- Audit admin access and changes to child, payment, review, consent, and publication data.

## Gamification safety

- Use display names/avatars or privacy-safe aliases; never expose full child identity on leaderboards.
- Compare children only within appropriate age/Pod scopes and short periods; provide opt-out and parent controls.
- Do not sell XP, ranks, leaderboard placement, or streak restoration.
- Avoid loss-framed notifications, infinite reward loops, dark patterns, public shaming, and excessive celebration pressure.
- Admin XP corrections require reason and append a ledger adjustment; they never rewrite history invisibly.

## Operational controls

Encrypted transport, environment-managed secrets, least privilege, dependency scanning, backups, restore tests, retention policy, incident runbook, and production log redaction.
