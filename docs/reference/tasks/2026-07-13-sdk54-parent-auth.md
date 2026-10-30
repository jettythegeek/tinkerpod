# Task specification: Expo SDK 54 and parent authentication

- Build package: `P1.2` plus SDK compatibility maintenance
- Owner/agent: Codex
- Date: 2026-07-13
- Relevant PRD sections: 7–9, 12–15, 19, 23
- Focused specifications: backend API, mobile development, security/child safety, testing
- Design reference: `docs/design/concepts/mobile-onboarding-v1.png`

## User outcome

A parent can create an account, log in securely, close/reopen the SDK 54 Expo Go app with their session restored, view their authenticated welcome state, and log out. Validation, invalid credentials, offline/network failure, loading, and inactive-account states are understandable.

## Scope

- Align the mobile dependency matrix with Expo SDK 54 / React Native 0.81 / React 19.1 and verify with Expo Doctor.
- Install Sanctum and implement versioned parent register/login/logout/me endpoints.
- Add request validation, normalized response envelopes, role/status checks, token revocation, and auth throttling.
- Add backend feature tests for happy paths and security/error paths.
- Add TanStack Query, expo/fetch client, SecureStore token persistence, typed errors, auth context/session bootstrap, and real forms using React Hook Form/Zod.
- Add a minimal authenticated parent landing screen and logout action.

## Non-goals

- Password-reset email delivery, email/phone verification, social login, child profiles, subscriptions, or full parent dashboard.

## Acceptance criteria

- [ ] SDK 54 dependency validation and TypeScript checks pass.
- [ ] Registration creates only a parent account, returns a Sanctum token, and never returns password fields.
- [ ] Login rejects invalid credentials and inactive users without leaking account details.
- [ ] Auth endpoints are rate-limited and logout revokes the current token.
- [ ] `/me` requires a valid bearer token and returns the canonical user resource.
- [ ] Mobile stores tokens only in SecureStore, restores valid sessions, clears invalid sessions, and shows actionable network/validation errors.
- [ ] Backend tests and mobile type/lint checks pass.

## Verification plan

- Backend: migrate, feature tests, route list, manual API smoke test.
- Mobile: Expo Doctor, TypeScript, lint, Expo web/Expo Go bundle.
- Security: token revocation, inactive user, duplicate email, validation, throttle coverage.

