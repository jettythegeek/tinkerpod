# Handoff: Plans and Paystack subscriptions

- Build package: P1.5
- Agent: Composer
- Date: 2026-07-31
- Status: complete (backend/API/admin slice)

## Outcome

Parents can list active plans, start a Paystack checkout that creates a pending transaction, confirm payment via server-side verify or signed webhook, receive an active subscription exactly once, view current access, and cancel renewal without losing paid access before `ends_at`. Client callbacks alone never grant access.

## Changed areas

- Billing domain: Paystack gateway, initialize/verify/settle/webhook/cancel, subscription access service.
- Plans/subscriptions/transactions schema, factories, PlanSeeder.
- API routes/resources/requests plus feature tests.
- Filament Plan resource under Operations.
- OpenAPI contract and `.env.example` Paystack keys.
- Task spec: `docs/tasks/2026-07-31-plans-and-paystack.md`.

## Database/API/contracts

- Migration `2026_07_31_000001_create_plans_subscriptions_transactions.php` stores amounts as integer minor units (`price_minor` / `amount_minor`) per `DECISIONS.md`.
- Seeded plans: Basic (₦15,000), Standard (₦25,000), Premium (₦40,000) — development placeholders; admin-editable.
- Endpoints: `GET /plans`, `GET /parent/subscription`, `POST /subscriptions/initialize`, `POST /subscriptions/verify`, `POST /subscriptions/cancel`, `POST /payments/paystack/webhook`.
- Verify and webhook share `SettleSuccessfulPayment` for idempotent activation.
- Rollback drops transactions → subscriptions → plans.

## Design and behavior

- API-only slice; no mobile checkout UI in this package.
- Access continues after cancel until `ends_at`; `renews_at` is cleared.
- Premium seed sets `max_active_pods = 2` aligned with Pod membership decisions.
- Provider secrets stay in env; responses expose public key and authorization URL only.

## Verification evidence

| Check | Command or method | Result |
|---|---|---|
| Tests | `php artisan test --compact` | Passed: 20 tests, 93 assertions |
| Subscription tests | `php artisan test --compact tests/Feature/Api/V1/SubscriptionPaymentTest.php` | Passed: 7 tests, 42 assertions |
| Migration | `php artisan migrate --force` | Applied on local MySQL |
| Seed | `php artisan db:seed --class=PlanSeeder` | Seeded Basic/Standard/Premium |
| Visual/device | N/A (backend slice) | Skipped |
| Accessibility/security | Feature tests | Invalid signature forbidden; amount mismatch fails without access; cross-household verify 404; no client-only activation |

## Decisions and assumptions

- Precedence: BUILD_PLAN P1.5 and BACKEND_PLAN billing-before-content override the prior handoff’s informal “P1.5A content” next step.
- Verify may activate only after Paystack API confirmation; webhook remains authoritative and idempotent with the same settler.
- Seed NGN prices are placeholders, not production pricing.
- No new Composer dependency; Laravel HTTP client wraps Paystack.

## Known limitations or blockers

- Mobile plan/checkout screens not built.
- Course enrollment on payment, scheduled expiry/past-due jobs, refunds, upgrades/proration, and audited manual activation remain later packages.
- Live Paystack keys were not exercised; Http::fake covers gateway behavior in tests.
- Child-limit enforcement helper exists (`SubscriptionAccessService::canAddChild`) but is not yet wired into child create validation.

## Exact next step

Either wire `SubscriptionAccessService` into child-create / Pod entitlement checks and ship a parent mobile billing screen, or start learning content foundation (BUILD_PLAN P2.1 / prior “pathway” note) once R1 payment access is accepted. Prefer connecting access gates before deep content if aiming at release gate R1.
