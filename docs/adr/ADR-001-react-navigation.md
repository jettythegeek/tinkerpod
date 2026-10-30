# ADR-001: Use React Navigation Instead of Expo Router

- **Status**: Accepted
- **Date**: 2026-10-30
- **Milestone**: M0

## Context

TinkerPod's mobile application (`app/`) serves multiple distinct runtime contexts inside a single binary:
1. **Unauthenticated Auth Flow**: Welcome, parent registration/login, password reset, and kid login (identifier + profile picker + PIN pad).
2. **Kid Mode (`junior` 5–11 and `senior` 12–18)**: Age-banded home screens, journey map, lesson player, interactive quizzes, content-pack store, profile, adventures, missions, and live tournament arenas.
3. **Parent Mode**: Parent onboarding, child profile & PIN management, progress monitoring, and Paystack billing/subscriptions.
4. **Data-Driven Content-Pack Player**: Dynamic screen graphs defined inside downloaded versioned pack manifests (`manifest.json`), where screens and component trees are driven by pack JSON rather than static filesystem routes.

## Decision

We use **React Navigation** (`@react-navigation/native` and `@react-navigation/native-stack`) rather than file-based routing (`expo-router`).

## Consequences

- **Positive**:
  - Clean runtime switching between Auth, Kid Mode (scoped to `child:*` token), Parent Mode (scoped to parent token), and the modal/embedded Pack Player tree based on auth and session state.
  - Child tokens are structurally prevented from mounting or navigating to parent or billing navigation stacks.
  - Content pack screens are rendered from manifest JSON definitions without fighting file-system route conventions or deep-link path collisions.
  - Zero migration cost on a fresh-start codebase.
- **Negative / Trade-offs**:
  - Navigation stacks and TypeScript param lists (`RootStackParamList`) are declared explicitly in `app/src/navigation/` rather than inferred from directory structure.
