# Handoff: foundation, admin shell, and initial mobile experience

- Build packages: `P1.1`, `P1.4` foundation, `P1.6` presentation foundation
- Agent: Codex
- Date: 2026-07-13
- Status: partial milestone complete

## Outcome

Laravel 13 now runs against the supplied MySQL database, exposes a tested `/api/v1/health` endpoint, and includes a protected Filament 5 admin panel foundation with TinkerPod branding, role/status access, and live platform totals. Expo SDK 57 now has a responsive, navigable initial parent experience: three onboarding states, welcome, login, registration, and password recovery, plus code-native animated SVG maker art with reduced-motion behavior and haptic button feedback.

## Changed areas

- Backend runtime, Filament 5 install, admin provider, user access fields and authorization.
- Health endpoint, API routing, migration, admin seeder, and feature test.
- Expo Router scaffold, brand tokens, shared button/form/auth primitives, onboarding/auth routes, SVG motion.
- Visual concepts under `docs/design/concepts/` and task specification under `docs/tasks/`.
- Enabled the standard ZIP extension in the active Laragon PHP 8.5 `php.ini`, required by Filament's export dependency.

## Database/API/contracts

- Migration `2026_07_13_000001_add_platform_access_to_users_table` adds indexed `role`, indexed `status`, and nullable `last_login_at`.
- `/api/v1/health` returns the standard response envelope and verifies database readiness.
- Default development admin is seeded from `ADMIN_*` environment settings; the fallback password is development-only and must never be used in production.
- Full Sanctum auth and formal OpenAPI contract remain in P1.2.

## Design and behavior

- Admin concept: `docs/design/concepts/admin-dashboard-v1.png`.
- Mobile concept: `docs/design/concepts/mobile-onboarding-v1.png`.
- Admin uses true white/mist surfaces, Tinker teal semantic primary, Nunito, TinkerPod Studio naming, and restricted access.
- Mobile uses one shared token system and code-native SVG artwork. Animation respects reduced motion. Form submission is deliberately not faked before auth APIs exist.
- Final headless mobile screenshot had a capture-only right-edge crop because the local headless browser enforces a CSS minimum viewport wider than its 390px output. Source layout explicitly constrains text width and uses responsive window dimensions.

## Verification evidence

| Check | Command or method | Result |
|---|---|---|
| Backend migration | `php artisan migrate --force` | Passed on MySQL |
| Health feature test | `php artisan test --filter=HealthCheckTest` | 1 passed, 4 assertions |
| Routes | `php artisan route:list --path=api/v1` and `--path=admin` | Health and 3 protected panel routes registered |
| Mobile types | `npx tsc --noEmit` | Passed |
| Mobile bundle | Expo web on port 8083 | HTTP 200; 1,229 modules bundled |
| Visual QA | Headless Edge + `view_image` | Admin login and onboarding inspected; motion/wrapping corrections made |

## Decisions and assumptions

- Filament 5.6 is used because current official requirements support Laravel 11.28+ and PHP 8.2+.
- Expo Go-compatible libraries are used first: Reanimated, SVG, and Haptics.
- Production chimes are not synthesized in code. An audio-generation-capable tool or approved sound assets are required for the dedicated reward asset pass.

## Known limitations or blockers

- Admin dashboard is a polished protected foundation with live account totals, not the complete concept: People/Children resources and activity/payment/class modules need their domain tables.
- Mobile auth buttons are presentation-only pending P1.2 API/Sanctum work.
- Supplied transparent web SVG and final 1024px app icon are still pending from the user; current raster assets are temporary.
- `npm audit` reports 11 moderate transitive findings in the new Expo dependency tree; review without forced breaking upgrades in the next dependency-hardening pass.
- The Expo scaffold created a nested `.git` directory; remove it when the root monorepo Git repository is initialized.

## Exact next step

Implement P1.2 authentication vertically: Sanctum, parent registration/login/logout/me, validation/envelopes/rate limiting/tests, then connect the existing mobile forms with TanStack Query, SecureStore, loading/error states, and session restoration.

