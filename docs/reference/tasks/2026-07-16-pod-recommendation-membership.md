# Task specification: Pod recommendation and membership

- Build package: `P1.3A`
- Owner/agent: Codex
- Date: 2026-07-16
- Relevant PRD sections: 7, 28–32
- Focused specifications: Pods/gamification, backend database/API, mobile, security
- Design reference: existing TinkerPod parent mobile design system; recommendation uses one dominant world card and a compact alternative rail.

## User outcome

After creating a child, a parent receives an explainable Pod recommendation, may select another eligible launch Pod, and commits one authoritative primary membership with starting rank identity.

## Scope

- Rich launch Pod schema and deterministic seed data.
- Pod membership, initial overall/Pod rank progress, recommendation service and parent-owned API.
- Expo recommendation, selection, loading/error and success experience.
- Filament Pod management foundation.

## Non-goals

- Mentor auto-assignment, content pathways, subscriptions, XP earning, challenges, leaderboards, or secondary Premium Pod membership.

## Journey and states

- Recommendation loading/retry; explanation and alternatives; ineligible state; disabled/working join; committed welcome; existing membership is idempotently returned.

## Data, API, and authorization

- Laravel owns eligibility, scoring, membership, ranks and idempotency. Parent ownership is checked on both endpoints. Unique child/Pod membership and unique active primary membership are enforced transactionally.

## Design inventory

- Existing Nunito/teal/navy system; Pod accent pairs from the approved guide; one large selected world panel; compact selectable alternatives; Phosphor-style code-native SVG motifs; reduced-motion-safe reveal and optional haptic only.

## Acceptance criteria

- [ ] Five launch Pods are seeded deterministically.
- [ ] Recommendation is explainable and deterministic.
- [ ] Parent may accept or choose another eligible Pod.
- [ ] Cross-household access is forbidden.
- [ ] Replayed join does not duplicate membership or rank progress.
- [ ] Child receives overall Tinker Starter and a Pod starter rank.

## Verification plan

- Automated: migration rollback/fresh, service/feature/idempotency/authorization tests, PHP/Expo lint/types/build.
- Visual/device: Android small phone and standard phone screenshots compared with the design inventory.
- Accessibility/security: selected state is not color-only; screen reader labels; no public child identity.

## Risks and decisions required

- Recommendation weights are deterministic MVP defaults and remain server-owned. Admin-configurable versioning follows with the full reward engine.
