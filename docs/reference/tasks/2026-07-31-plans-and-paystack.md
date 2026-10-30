# Task specification: Plans and Paystack subscriptions

- Build package: `P1.5`
- Owner/agent: Composer
- Date: 2026-07-31
- Relevant PRD sections: 9, 10, 13, 17, 24, 26
- Focused specifications: `subscriptions/SUBSCRIPTION_AND_PAYMENT_PLAN.md`, `backend/BACKEND_PLAN.md`, `backend/DATABASE_PLAN.md`, `backend/API_PLAN.md`, `DECISIONS.md`
- Design reference: API-only slice; mobile checkout UI deferred

## User outcome

A parent can browse active plans, start a Paystack checkout, have payment confirmed server-side, receive an active subscription, view status, and cancel renewal without losing paid access before `ends_at`.

## Scope

- `plans`, `subscriptions`, `transactions` schema with factories/seeders.
- Paystack initialize, verify, signed webhook, cancel, and subscription access evaluation.
- Parent API contracts and feature tests for signature, amount, idempotency, and ownership.
- Filament Plan resource for admin price/feature configuration.
- OpenAPI path updates.

## Non-goals

- Mobile subscription screens.
- Flutterwave, wallet, refunds UI, plan upgrade/downgrade proration.
- Course enrollment on payment (depends on P2.2).
- Scheduled past-due/expiry jobs (stub access rules only).
- Manual admin activation audit workflow beyond Plan CRUD.

## Journey and states

- List plans (empty if none active).
- Initialize: pending transaction + Paystack authorization URL.
- Verify: server confirms with Paystack, then same idempotent activation as webhook.
- Webhook: invalid signature rejected; duplicates ignored; amount mismatch rejected; success activates.
- Cancel: stops renewal; access remains until `ends_at`.
- Parent subscription: none / active / cancelled-with-access / expired.

## Data, API, and authorization

- Amounts stored as integer minor units; API resources expose display decimals.
- Laravel owns plan price, activation, and entitlement checks; client never authors success.
- Endpoints: `GET /plans`, `GET /parent/subscription`, `POST /subscriptions/initialize`, `POST /subscriptions/verify`, `POST /subscriptions/cancel`, `POST /payments/paystack/webhook`.
- Parent routes require Sanctum + parent role; webhook is unauthenticated but signature-gated.

## Design inventory

- N/A for this backend slice.

## Acceptance criteria

- [ ] Three MVP plans seed deterministically with configurable prices.
- [ ] Initialize creates a pending transaction with a unique internal reference.
- [ ] Successful Paystack confirmation activates/extends subscription exactly once.
- [ ] Invalid webhook signature and altered amounts are rejected.
- [ ] Client cannot activate access without Paystack confirmation.
- [ ] Cancel stops renewal but preserves paid access until `ends_at`.
- [ ] Access service evaluates active dates and plan child limits.

## Verification plan

- Automated: `php artisan test --filter=Subscription`, migrate + `PlanSeeder`.
- Manual: N/A without live Paystack keys (Http::fake covers gateway).
- Visual/device: N/A.
- Accessibility/security: no secrets in responses; provider payload fragments not leaked.

## Risks and decisions required

- Seed NGN prices are development placeholders; production prices are admin-configured.
- Verify and webhook share one idempotent settlement path so delayed webhooks cannot double-credit.
- Previous handoff suggested “P1.5A content”; BUILD_PLAN + BACKEND_PLAN place billing before learning content, so this package takes precedence.
