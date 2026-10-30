# TinkerPod design and implementation guide

Version: 1.0  
Status: Mandatory execution standard  
Audience: every product designer, coding agent, reviewer, and content implementer

## 1. The quality promise

TinkerPod should make a child feel that they entered a bright world built for curious makers while making a parent feel that the product is safe, structured, and worth paying for. The experience combines the delight and feedback clarity of a polished game with the calm navigation and reliability of a serious learning platform.

Every feature must satisfy five qualities:

1. Magical: identity, progress, motion, and sound create memorable moments.
2. Clear: the next meaningful action is obvious and language is age-appropriate.
3. Coherent: every screen belongs to one shared system, not an assortment of templates.
4. Trustworthy: payments, privacy, progress, feedback, and errors are transparent.
5. Durable: code, data, tests, and documentation support future Pods and platforms.

“Works” is the floor. The completion bar is a complete, accessible, responsive, tested experience with visual and interaction polish.

## 2. Product experience principles

### Learning comes before points

Reward evidence of learning: completed lessons, demonstrated quiz understanding, built projects, mentor approval, challenge completion, and attendance. Do not reward meaningless tapping, time-on-screen, repetitive farming, or spending.

### A Pod is a world

The learner should feel located inside Coding, AI, Design, Robotics, or Young Founders—not inside a generic dashboard. Pod identity influences color accents, iconography, rank language, missions, project imagery, sounds, and decorative motifs while shared layout and controls preserve familiarity.

### Show the next achievable step

Every learner home state should answer: Where am I? What am I building? What should I do next? What will I unlock? Who is helping me? Prefer one strong primary action over competing card grids.

### Celebrate proportionally

Micro feedback belongs to routine actions. Large celebrations are reserved for badges, ranks, approved projects, courses, Pod levels, and capstones. Over-celebration makes rewards meaningless and exhausts users.

### Encourage without comparison pressure

Leaderboards emphasize personal movement, nearby peers, and short fresh-start periods. Never shame low positions, expose identities, or make ranking the only success signal.

### Parent and child share truth, not presentation

The same learning state powers both modes. Child mode is immersive and motivational; parent mode is calm, factual, and focused on growth, wellbeing, schedule, feedback, and billing.

## 3. Brand foundation

### Personality

Playful, inventive, optimistic, warm, rounded, energetic, modern, and capable. Avoid babyish cartoons, casino-like reward noise, corporate sterility, generic edtech gradients, and visual clutter.

### Core palette

- Tinker Teal `#00B8A9`: primary brand/action.
- Deep Navy `#101B4D`: primary text and grounding surfaces.
- Maker Orange `#FF6B00`: high-energy milestone accent.
- Spark Yellow `#FFC928`: rewards, highlights, optimistic emphasis.
- Invent Purple `#6C4CF6`: imagination, ranks, special states.
- Growth Green `#63C132`: progress and verified success.
- Coral `#FF5A5F`: warmth and carefully used alerts.
- Bright Blue `#168BFF`: coding/information accent.
- Canvas `#FFFFFF` and Mist `#F8FAFC`: primary backgrounds.

Do not use these indiscriminately. Deep Navy carries hierarchy; Teal is the default action; other colors express Pod identity or semantic meaning. Maintain WCAG contrast. Never encode status using color alone.

### Pod identities

- Coding: blue + purple; bracket, cursor, block, or game motifs.
- AI: teal + green; responsible intelligence, nodes, spark/brain motifs.
- Design: coral + purple; shape, pen, layer, or layout motifs.
- Robotics: yellow + orange; gear, circuit, sensor, or motion motifs.
- Young Founders: orange + navy; idea, prototype, solution, or pitch motifs.

Exact tokens must live in shared theme code and may evolve only through an approved design decision. Do not create separate unrelated design systems per Pod.

### Typography

Nunito is the primary product family. Use rounded weights with disciplined hierarchy: bold for child-facing headings and reward titles, semibold for actions/labels, regular for readable body copy. Avoid excessive all-caps. Respect device font scaling and test wrapping at 200% where feasible.

### Shape and depth

Use friendly rounded geometry with a small, deliberate radius scale. Controls must look pressable without thick toy-like framing. Prefer open composition, bands, rails, paths, and purposeful panels over nested cards or bento grids. Shadows are soft and sparse; borders and background shifts should do most structural work.

### Icons and illustration

Use one coherent rounded icon family. Match stroke, optical size, fill behavior, and containers. Badge and rank art may be richer but must remain legible at small sizes. Illustrations should show making, tools, projects, and progress—not passive children staring at screens.

### Brand assets

Use the approved SVG for web/large display and transparent PNG derivatives for Expo icons/splash. Never regenerate, trace, recolor, stretch, or add effects to the logo without approval. Keep source and optimized derivatives under `assets/brand` with documented usage.

## 4. Layout and responsive behavior

Use a shared spacing scale based on 4, with common steps 4, 8, 12, 16, 24, 32, 48, and 64. Major screens need intentional safe-area handling, readable line lengths, stable bottom-navigation clearance, and thumb-reachable primary actions.

Mobile designs begin with a representative small Android viewport, then scale upward. Do not shrink desktop layouts into phones. Tablet layouts may widen content or add supporting rails but must preserve task hierarchy. Avoid absolute positioning for core content and never depend on one fixed screen height.

Every surface defines:

- default, loading/skeleton, empty, partial, offline/stale, validation error, server error, success, and permission/expired-access states;
- keyboard, safe-area, long-name, translated/expanded-copy, and large-text behavior;
- pressed, focus, selected, disabled, and destructive-control behavior.

## 5. Core screen grammar

### Child home / Pod home

Prioritize current mission or “Continue learning,” current project, XP/rank path, next live/mentor moment, and one challenge. Secondary rewards and leaderboard previews follow. Avoid displaying every metric above the fold.

### Parent home

Lead with child switcher, meaningful progress summary, action-needed items, next class, latest mentor feedback, and subscription state. Use plain evidence rather than gamified pressure.

### Learning

Make pathway location visible. Course/module/lesson hierarchy must be comprehensible without breadcrumbs overload. Preserve progress locally during brief network loss and reconcile with server authority.

### Projects

Show the build outcome first, then instructions, requirements, examples/rubric, submission state, and feedback history. Uploads must show progress, retry, cancellation, validation, and privacy.

### Rewards

Distinguish XP (incremental), badges (specific achievements), ranks (identity/mastery), streaks (consistency), and certificates (formal completion). Explain why each reward was earned and the next meaningful target.

## 6. Motion, sound, and haptic language

Use the detailed specification in `gamification/MOTION_AUDIO_AND_FEEDBACK_SYSTEM.md`.

Motion clarifies cause and effect. Default UI motion is quick and calm; celebratory motion is expressive but brief. Use spring motion for friendly reveals, easing for progress and navigation, and avoid arbitrary perpetual animation.

Use semantic sound and haptic keys, never screen-specific ad hoc files. Routine actions should remain quiet. Milestone sounds are warm, short, non-startling, and normalized. All sensory feedback respects system state and in-app preferences.

Reward state is committed before presentation. If animation or audio fails, the achievement still exists and remains understandable. Queue simultaneous reward events and present them in a deliberate order rather than stacking modals.

## 7. Writing and content voice

Child copy is encouraging, concrete, and action-oriented: “Add a score to your game” is better than “Continue your journey.” Never imply failure defines the learner. Prefer “Try this next” to “You failed.”

Parent copy is precise, calm, and transparent about money, schedules, progress, privacy, and mentor feedback. Admin copy uses operational terminology consistently.

Do not invent claims, fake statistics, testimonials, urgency, course availability, or reward outcomes. All visible states must be supported by real data or clearly labeled seed/demo content.

## 8. Accessibility and inclusion

Accessibility is part of the design, not a cleanup task:

- sufficient contrast; logical focus order; labels, roles, hints, and large targets;
- screen-reader announcements after reward motion settles;
- captions/transcripts for learning media and text alternatives for meaningful imagery;
- mute, haptic toggle, reduced motion, reduced effects, and celebration replay;
- no rapid flashing, essential sound-only cues, precision-only gestures, or color-only status;
- age-appropriate language, culturally respectful names/examples, and support for different learning speeds.

## 9. Frontend architecture

Use feature/domain ownership and a shared design-system layer. Screens compose focused components and hooks; they do not contain duplicated API, entitlement, reward, or formatting logic.

Required boundaries:

- API schemas/resources → typed client DTOs → feature adapters/view models → UI components.
- Server state uses TanStack Query; ephemeral interaction state stays local; persisted preferences use an appropriate device store; tokens use SecureStore.
- Stable query-key factories and centralized error normalization.
- Forms use shared field primitives, React Hook Form, and Zod schemas aligned with server validation.
- Theme tokens own color, type, spacing, radii, elevation, icon sizes, motion, sound, and z-index.
- Reward presentation consumes server events; it never computes XP or eligibility.

Do not add premature global state, giant screen components, inline design constants, anonymous duplicated icons, uncontrolled effects, or navigation-dependent business logic.

## 10. Backend architecture

Follow `backend/BACKEND_PLAN.md`, `DATABASE_PLAN.md`, and `API_PLAN.md`.

Controllers validate orchestration only. Form Requests validate input, Policies authorize resources, Actions/Services implement domain workflows, API Resources serialize stable contracts, events represent committed domain facts, and queued listeners handle external side effects.

Critical rules:

- transactions around multi-record state changes;
- database constraints in addition to application validation;
- idempotency for payments, XP, awards, notifications, imports, and scheduled jobs;
- append-only financial, XP, review-history, and audit concepts;
- UTC storage with explicit IANA event timezone;
- eager loading and pagination by default for collections;
- private file storage and short-lived signed access;
- enums shared through documented contract values, not duplicated informal strings.

## 11. API and error quality

Maintain `/api/v1` OpenAPI contracts. Use the standard success/error envelope and stable error codes. The client should be able to distinguish validation, unauthenticated, unauthorized, subscription-required, child-ineligible, conflict, rate-limited, offline, and unexpected failures.

Never leak stack traces, internal IDs unnecessarily, provider payloads, secrets, or another household’s existence. Retry only safe/idempotent operations. Mutations should return the updated canonical resource and any reward presentation events.

## 12. Database and migration quality

Design from invariants, not only fields. Every migration review asks:

- What must be unique?
- What must never be deleted?
- What happens on parent deletion?
- Which history must survive reassignment or entitlement changes?
- Which queries require indexes?
- Can totals be rebuilt from authoritative facts?
- Is JSON being used to avoid a real relation?

Use factories for meaningful states and deterministic seeders for the five Pods, roles, plans, ranks, badges, and a demo journey. Migrations must work on a fresh database and a populated previous version.

## 13. Security and child safety

Read `quality/SECURITY_AND_CHILD_SAFETY.md` for every feature touching identity, children, mentors, files, rewards, payments, messages, analytics, or sharing. Treat horizontal authorization tests as mandatory. Never expose public full child names, unmoderated work, meeting links outside eligibility/join windows, or private storage URLs.

Do not log credentials, PINs, tokens, sensitive child fields, full payment payloads, or uploaded content. Analytics use stable event names and minimal pseudonymous identifiers.

## 14. Testing strategy

Tests prove behavior, not implementation details:

- domain unit tests for rules and transitions;
- API feature tests for validation, policies, resources, database effects, and jobs;
- idempotency/property tests for payment/reward/event retries;
- frontend integration tests for user-visible states and navigation guards;
- end-to-end tests for critical vertical journeys;
- visual regression/screenshot inspection for primary surfaces and reward moments;
- accessibility and low/mid-device performance checks.

Every bug fix includes a regression test where practical. Avoid brittle snapshots of large markup or tests that only assert a function was called.

## 15. Performance budgets and reliability

Design for Nigerian network conditions and common Android hardware. Avoid blocking startup on nonessential media, prefetch only likely next actions, compress/cache imagery, lazy-load heavy celebrations, bound particle/vector complexity, and provide static fallbacks.

Use optimistic updates only when rollback is clear and authorization/state is not security-sensitive. Offline UI distinguishes queued work from confirmed server state. Uploads and progress sync require retry-safe identifiers.

## 16. Analytics and observability

Define event names and properties before instrumentation. Measure onboarding completion, Pod recommendation/selection, lesson/project/challenge outcomes, reward engagement, live attendance, subscription conversion/renewal, errors, and accessibility preference use. Do not optimize solely for screen time or leaderboard activity.

Backend workflows need structured logs, correlation IDs, queue/failed-job visibility, webhook reconciliation, and health/readiness checks. Error messages presented to users remain helpful and nontechnical.

## 17. Agent implementation workflow

### Discover

Read `AGENTS.md` in its required order, inspect the relevant code/tests/history, and identify an exact build package. Do not regenerate existing architecture because it is unfamiliar.

### Specify

Use `templates/TASK_SPEC_TEMPLATE.md`. Write the journey, scope, non-goals, states, data/authorization changes, acceptance criteria, verification, and risks. For a new surface, create an approved visual specification and token/component inventory before coding.

### Implement vertically

Prefer one complete journey across migration → domain → API → client → UI → tests over many disconnected models or placeholder screens. Keep commits/changes coherent and reversible.

### Verify

Run targeted tests during work and the applicable full suite before handoff. Inspect actual rendered UI, not only source. Exercise failure, retry, permissions, accessibility, and representative device sizes.

### Hand off

Use `templates/HANDOFF_TEMPLATE.md`. Record outcome, files, migrations/contracts, commands/results, screenshots, decisions, remaining work, and exact continuation step. Update `docs/handoffs/INDEX.md`.

## 18. Definition of ready

A task is ready only when its user, purpose, scope, dependencies, data authority, authorization, UX states, acceptance criteria, and design reference are clear enough to implement without inventing product behavior.

## 19. Definition of done

Done means:

- the end-to-end acceptance criteria work with real domain state;
- visual, responsive, motion, audio, accessibility, error, loading, empty, and offline states are complete where applicable;
- authorization, validation, constraints, idempotency, privacy, and child safety are tested;
- types, lint, formatting, builds, migrations, tests, and targeted performance checks pass;
- APIs, decisions, focused specifications, and handoff records are current;
- no placeholders, fake success, debug output, untracked secrets, or known critical defects remain.

Anything less must be labeled honestly as scaffold, prototype, partial, or blocked.

