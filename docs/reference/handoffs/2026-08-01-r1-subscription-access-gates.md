# Handoff: R1 subscription access gates

- Build package: P1.5A
- Agent: Composer
- Date: 2026-08-01
- Status: complete

## Outcome

Parents can create one child and join one primary Pod during pre-payment onboarding. Additional children are blocked until an access-granting subscription allows them under `plan.max_children`. `GET /parent/subscription` now returns entitlement gates (`has_access`, `can_add_child`, counts, limits). Pod joins refuse memberships that would exceed `max_active_pods`.

## Changed areas

- `SubscriptionAccessService`: onboarding defaults, counts, `canJoinPod`, `accessSummary`.
- `ChildController::store` enforces `canAddChild` with stable `errors.children`.
- `SubscriptionController::current` returns entitlement fields.
- `JoinPrimaryPod` checks plan/onboarding Pod limits before creating membership.
- Unit + feature tests; OpenAPI; `DECISIONS.md`; `BUILD_PLAN.md` P1.5A entry.
- Task spec: `docs/tasks/2026-08-01-r1-subscription-access-gates.md`.

## Database/API/contracts

- No new migrations.
- `GET /parent/subscription` data now includes `can_add_child`, `active_children_count`, `max_children`, `max_active_pods` (in addition to `subscription` / `has_access`).
- `POST /parent/children` may return 422 with `errors.children` when the limit is reached.
- `POST .../pod-membership` may return 409 when Pod entitlement is exhausted.
- OpenAPI updated in `docs/api/openapi-v1.yaml`.

## Design and behavior

- API/domain slice only; no mobile UI in this package.
- Pre-payment defaults: one active child, one active Pod per child — aligns with PRD register → child → pay order.
- Archived children do not consume the child limit.
- Learning content gating remains P2.2; this package authorizes household entitlements for R1.

## Verification evidence

| Check | Command or method | Result |
|---|---|---|
| Focused tests | `php artisan test --compact tests/Unit/Domain/Billing/SubscriptionAccessServiceTest.php tests/Feature/Api/V1/ChildProfileTest.php tests/Feature/Api/V1/SubscriptionPaymentTest.php tests/Feature/Api/V1/PodMembershipTest.php` | Passed: 22 tests, 109 assertions |
| Full suite | `php artisan test --compact` | Passed: 29 tests, 135 assertions |
| Migration | N/A | No schema change |
| Visual/device | N/A | Backend slice |
| Accessibility/security | Feature tests | Cross-household child access still denied; limits server-authored |

## Decisions and assumptions

- Recorded in `DECISIONS.md`: onboarding allows one child and one primary Pod before paid access; plan limits apply after.
- Premium `max_children` seed remains 1; multi-child only via admin-configured plans.
- Secondary Pod membership product UX remains deferred; entitlement check is in place for when it ships.

## Known limitations or blockers

- Mobile plan/checkout screens still not built.
- Course enrollment on payment, scheduled expiry jobs, refunds, upgrades/proration remain later packages.
- Live Paystack keys not exercised.
- R1 “authorized access” for lessons still needs P2.1–P2.2 content/enrollment; entitlements for child/Pod limits are now wired.

## Exact next step

Start P2.1 content schema/admin (tracks, courses, modules, lessons) so P2.2 can enroll eligible children against `has_access`, or ship a parent mobile billing screen against the existing payment API.
