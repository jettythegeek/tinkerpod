# Handoff: Pod recommendation and primary membership

- Build package: P1.3A
- Agent: Codex
- Date: 2026-07-16
- Status: complete

## Outcome

After creating a child, a parent can now open an explainable, age-safe Pod recommendation, compare every eligible launch world, choose an alternative, and commit one authoritative primary membership. The child receives an overall starter rank and a Pod-specific starter rank in the same transaction. Returning parents see the persisted membership without duplicate rewards.

Filament now includes a Pod management resource, and the mobile journey includes loading, retry, selection, disabled/submitting, existing-membership and celebratory welcome states.

## Changed areas

- Laravel Pod recommendation, membership and rank domain services.
- Pod, membership and child-rank database schema plus deterministic launch seeds.
- Parent-owned API endpoints, resources, authorization tests and OpenAPI contract.
- Filament Pod forms and tables.
- Expo Pod API/query layer, code-native SVG emblems, recommendation screen and Parent HQ entry points.
- Implemented visual evidence in `docs/design/implemented/`.

## Database/API/contracts

- Migration `2026_07_16_000001_create_pods_and_memberships.php` adds `pods`, `pod_members`, `ranks` and `child_rank_progress` with foreign keys, uniqueness and lookup indexes; rollback drops them in dependency order.
- `PodSeeder` creates Coding, AI, Design, Robotics and Young Founders plus the overall and Pod starter ranks.
- `GET /api/v1/parent/children/{child}/pod-recommendation` returns the recommendation, reason, eligible alternatives and any current primary membership.
- `POST /api/v1/parent/children/{child}/pod-membership` validates eligibility and owns membership/rank creation server-side. Replaying the same choice is idempotent; changing an existing primary Pod conflicts.
- `ChildResource` now includes the child's primary Pod when present.

## Design and behavior

- Reference: existing TinkerPod parent mobile token/primitives system and `docs/tasks/2026-07-16-pod-recommendation-membership.md`.
- The recommended world is visually dominant; alternatives remain compact and clearly selected with border, checkmark and radio semantics rather than color alone.
- Pod emblems are lightweight, code-native SVG motifs using server-supplied brand colors; no additional asset dependency was introduced.
- The welcome state uses the selected Pod color, persisted rank names and a restrained halo treatment. No client-authored XP, rank or reward is possible.
- Retry and existing-membership states are implemented. The journey remains usable without motion or sound; motion/audio rewards are deliberately deferred until the shared preference controls exist.

## Verification evidence

| Check | Command or method | Result |
|---|---|---|
| Tests | `php artisan test --compact` | Passed: 13 tests, 51 assertions |
| Types/lint/build | `npx tsc --noEmit`; `npm run lint`; `npx expo-doctor`; `npx expo export --platform web --clear` | Passed; Expo Doctor 18/18; web export produced all 10 routes |
| Migration | `php artisan migrate`; `php artisan db:seed --class=PodSeeder` | Applied and seeded against local MySQL |
| Visual/device | In-app browser at 390x844; screenshots inspected | Recommendation and welcome primary states passed visual inspection |
| Accessibility/security | DOM roles plus API feature tests | Radio/button names present; non-color selection cue; cross-household access denied; rewards server-authored |

## Decisions and assumptions

- Recommendation v1 is deterministic and explainable, using age eligibility, interests, desired builds and experience; it is not an opaque ML system.
- A child has one primary launch Pod in this slice. Secondary/Premium memberships remain out of scope.
- MySQL cannot express the desired conditional unique primary-membership constraint cleanly, so the invariant is enforced inside a child-row-locked transaction and covered by idempotency tests.
- Expo remains on SDK 54; only the SDK-compatible patch release was applied.

## Known limitations or blockers

- Mentor assignment, pathways/lessons, XP earning, challenges and subscription-gated Pod access are not part of P1.3A.
- The mobile dependency audit currently reports 14 moderate transitive advisories. Do not run a forced upgrade; review them during dependency/security hardening because Expo compatibility must be preserved.
- Tablet, reduced-motion and large-text physical-device passes remain part of the broader mobile release gate; this slice was browser-verified at a representative small-phone viewport.

## Exact next step

Start P1.5A with the content foundation: model course/pathway/module/lesson authoring and Pod assignment, expose the first learner-safe pathway contract, then connect the selected Pod welcome state to its first mission preview.
