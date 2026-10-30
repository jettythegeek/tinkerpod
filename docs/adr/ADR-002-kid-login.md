# ADR-002: Parent-Managed Kid Login with Username/Parent Identifier and PIN

- **Status**: Accepted
- **Date**: 2026-10-30
- **Milestone**: M0 (implemented in M1)

## Context

TinkerPod serves children aged 5–18 across shared family devices and personal tablets/phones:
- Younger kids (5–11) rarely have their own email address or phone number, and typing long passwords is error-prone.
- Teenagers (12–18) often sign in on their own device and want a memorable handle (`username`), while younger siblings may sign in using their parent's phone number or email on a family tablet.
- Child privacy (NDPR) and safety require that children cannot create unverified accounts without parental oversight, that brute-force PIN guessing is blocked, and that a child session can never access parent billing or account settings.

## Decision

1. **Parent-Managed Child Profiles**:
   - Only an authenticated parent can create a child profile, set or reset a child's PIN, or unlock a locked profile.
   - Each child profile has a unique `username` (3–20 characters, `[a-zA-Z0-9_.]`), validated against an English, Pidgin, Yoruba, Igbo, and Hausa profanity filter, and rejecting phone patterns, email patterns, and the child's own first or last name.
   - Each child profile stores a bcrypt-hashed PIN (`pin_hash`), `pin_failed_attempts`, and `locked_until`.

2. **Two Kid Sign-In Flows**:
   - **Direct Username + PIN**: The kid enters their unique `username` and PIN to authenticate directly.
   - **Parent Phone/Email + Profile Picker + PIN**: If the kid enters a parent's phone number or email address, the API returns a privacy-safe profile picker list containing **only** each child's `id`, `first_name`, `avatar`, and `theme_mode` (never last names, birth dates, or sensitive fields). The kid taps their profile and enters their PIN.

3. **Brute-Force Lockout & Scoped Token**:
   - 5 consecutive wrong PIN attempts lock that child profile for 15 minutes (escalating on repeated lockouts), notify the parent, and record an audit log entry.
   - Successful authentication issues a child-scoped Laravel Sanctum token with `child:*` abilities only, which is rejected by policies/middleware on all parent, billing, mentor, and admin routes.

## Consequences

- **Positive**:
  - Works seamlessly for both 5-year-olds on a shared tablet and 16-year-olds on their own phone.
  - Protects household privacy and prevents unauthorized access to parent billing or other children's accounts.
- **Negative / Trade-offs**:
  - Requires dedicated rate-limiting, per-profile lockout tracking, and an audit log service in M1.
