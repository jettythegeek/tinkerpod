# Task specification: R1 subscription access gates

- Build package: `P1.5A`
- Owner/agent: Composer
- Date: 2026-08-01
- Relevant PRD sections: 7 (Parent Onboarding), 9–10, 13, 17, 23–24, 26
- Focused specifications: `subscriptions/SUBSCRIPTION_AND_PAYMENT_PLAN.md`, `backend/BACKEND_PLAN.md`, `backend/API_PLAN.md`, `DECISIONS.md`, `product/MVP_SCOPE.md`
- Design reference: API/domain slice; no new mobile UI surfaces

## User outcome

A parent can create one child during onboarding without paying, see clear entitlement gates on their subscription status, and is blocked from creating more children than their plan (or onboarding default) allows. After Paystack-confirmed payment, `has_access` is true and plan `max_children` / `max_active_pods` apply. Pod joins respect `max_active_pods`.

## Scope

- Expand `SubscriptionAccessService` with onboarding defaults, counts, and `accessSummary`.
- Enforce `canAddChild` on `POST /parent/children`.
- Enrich `GET /parent/subscription` with entitlement fields.
- Enforce `canJoinPod` inside `JoinPrimaryPod`.
- Unit + feature tests; OpenAPI and DECISIONS updates.

## Non-goals

- Mobile billing/checkout UI.
- Course enrollment on payment (P2.2).
- Scheduled expiry/past-due jobs.
- Secondary Pod membership UX (Premium second Pod still deferred beyond the entitlement check).
- Live Paystack key exercise.

## Journey and states

- Register → create first child (allowed) → recommend/join primary Pod (allowed) → pay → `has_access` true.
- Second child without access → 422 `errors.children`.
- Plan with `max_children` > 1 → additional children up to limit.
- Archive frees a slot.
- Pod join beyond `max_active_pods` → 409.

## Acceptance criteria

- [ ] Pre-payment parent can create exactly one active child.
- [ ] Second child without access-granting subscription is rejected with stable `children` error key.
- [ ] Active plan `max_children` is enforced; archived children do not count.
- [ ] `GET /parent/subscription` returns `has_access`, `can_add_child`, counts, and limits.
- [ ] `JoinPrimaryPod` refuses joins that would exceed plan/onboarding `max_active_pods`.
- [ ] Existing child CRUD and payment settlement tests remain green.

## Verification plan

- Automated: `php artisan test --compact` plus focused Child/Subscription/Access unit suites.
- Manual: N/A for this API slice.
- Visual/device: N/A.
- Accessibility/security: child ownership policies unchanged; limits are server-authored.

## Risks and decisions required

- Onboarding defaults (`max_children=1`, `max_active_pods=1` without paid access) are recorded in `DECISIONS.md` so PRD register→child→pay order remains possible.
