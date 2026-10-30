# Task specification: foundation, admin shell, and initial mobile experience

- Build packages: `P1.1`, `P1.4`, `P1.6` foundation slice
- Owner/agent: Codex
- Date: 2026-07-13
- Relevant PRD sections: 4–5, 8, 10, 12, 14, 22–23, 28–32
- Focused specifications: backend, database, API, admin, mobile, gamification motion/audio, security, testing
- Design reference: concepts generated for this task and stored under `docs/design/concepts/`

## User outcome

An authorized administrator can enter a polished TinkerPod operations dashboard, and a prospective parent can launch the Expo app, understand the product, and move through the initial onboarding/authentication presentation. Both surfaces share one recognizable premium brand system.

## Scope

- Repair and verify Laravel installation, application key, MySQL connectivity, migrations, and health endpoint.
- Install Filament-compatible administration framework and create the authenticated admin panel foundation.
- Implement dashboard shell, brand/theme, honest empty-state operational overview, and initial User/Parent/Child foundations only if backend readiness permits.
- Scaffold Expo Router/TypeScript app and shared tokens/components.
- Implement splash, three-page onboarding, welcome/auth choice, login, register, and forgot-password visual states.
- Establish SVG motion primitives and semantic audio asset registry; produce only assets needed by these initial screens.

## Non-goals

- Full production authentication API and live mobile authentication.
- Complete Filament resources for all PRD modules.
- Final badge library, certificates, all chimes, or production reward engine.
- Subscription, learning, project, mentor, or live-class workflows.

## Journey and states

- Admin: panel login → dashboard overview → clear navigation foundation and development-state panels.
- Parent: branded splash → swipe onboarding → Get started → login/register/forgot password.
- UI includes focus/pressed/disabled/loading and validation presentation where applicable; API-dependent submission remains clearly marked for the next auth slice.

## Data, API, and authorization

- MySQL is authoritative. Add `/api/v1/health` standard envelope and test.
- Admin panel requires authenticated eligible user; no public dashboard.
- No client-side reward/access decisions.

## Design inventory

- Brand palette and Nunito-family typography from mandatory guide.
- Admin: calm SaaS operations shell, deep navy hierarchy, teal action, selective Pod accents, open rails/tables rather than card clutter.
- Mobile: white/mist canvas, mascot/Pod-world storytelling, large friendly type, thumb-reachable primary action.
- Motion: splash orbit/rays and onboarding transitions implemented as code-native SVG/Reanimated where supported, with reduced-motion behavior.

## Acceptance criteria

- [ ] Laravel boots with generated key and connects to MySQL.
- [ ] Fresh backend migrations and health feature test pass.
- [ ] Filament panel loads with TinkerPod brand styling and protected access.
- [ ] Expo app typechecks and starts with `/` route in Expo Go-compatible configuration.
- [ ] Initial mobile screens are responsive and navigable with shared primitives/tokens.
- [ ] Primary admin and mobile screens have screenshot-based visual QA against concepts.
- [ ] Handoff records all commands, evidence, and remaining auth work.

## Verification plan

- Automated: Laravel feature tests; migrations; Expo typecheck/lint.
- Manual: admin login/dashboard routing; onboarding and auth navigation.
- Visual/device: desktop admin, small Android viewport, typical iPhone viewport.
- Accessibility/security: focus/labels/contrast/reduced motion; admin authorization; no secrets in client.

## Risks and decisions required

- Laravel 13/Filament compatibility must be confirmed against current official documentation/package constraints.
- No audio-generation capability is currently exposed in the workspace; semantic sound keys can be implemented, but production chime generation may require a later audio-capable tool or supplied assets.
