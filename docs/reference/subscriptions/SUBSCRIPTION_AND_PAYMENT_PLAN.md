# Subscription and payment plan

Source PRD: sections 9, 10, 13, 17, 24, 26.

## MVP products

- Basic: one active Pod, recorded lessons, monthly project, progress, XP/ranks/badges, certificates; no mentor review/live class.
- Standard: one active Pod plus selected extra courses, weekly live class, mentor pod/reviews, challenges/leaderboards, and parent report.
- Premium: up to two active Pods, Standard benefits, priority review, monthly 1:1, personalized path, and priority support.

Prices remain admin-configured. Plans default to one included child and support monthly, quarterly, yearly, or one-time billing.

## Paystack lifecycle

1. Server validates plan and calculates amount/currency.
2. Server creates pending transaction with unique internal reference.
3. Server initializes Paystack and returns authorization URL/reference.
4. Client returns and requests verification for immediate UX only.
5. Signed webhook is processed idempotently and remains the payment source of truth.
6. Successful transaction activates/extends subscription and enrolls eligible children.
7. Duplicate/out-of-order events do not double-credit access.

## Access rules

- Access service evaluates active dates, plan rules, child limit, course eligibility, and free previews.
- Pod entitlements limit active memberships without deleting historical Pod XP, ranks, badges, or projects.
- Cancellation stops renewal but does not remove paid access before `ends_at`.
- Past-due/expired transitions run from scheduled jobs and are auditable.
- Manual activation requires finance permission, reason, actor, and audit record.

## Test cases

Invalid signature, altered amount, duplicate webhook, abandoned checkout, failed payment, delayed webhook, renewal, cancellation, expired access, plan downgrade/upgrade, child-limit enforcement, and refund handling.
