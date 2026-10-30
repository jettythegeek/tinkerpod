# MVP decisions

These defaults resolve the PRD's open questions until product leadership changes them.

- Child access: parent-controlled profile switching with optional child PIN; no independent child account.
- Payments: Paystack only for MVP; webhook is the source of truth.
- Video: provider-neutral URLs initially; Bunny Stream is the preferred production provider.
- Mentor feedback: text and rubric scores in MVP; attachments can follow.
- Live classes: provider-neutral external URL supporting Zoom or Google Meet.
- Plan access: Basic has recorded learning/projects but no mentor review; Standard and Premium include review.
- Included children: one by default; `max_children` remains configurable per plan.
- Pre-payment onboarding: a parent may create one active child profile and join one primary Pod before purchasing; additional children or Pods require an access-granting subscription and that plan’s `max_children` / `max_active_pods`. Archived children do not consume the child limit. Learning content access remains gated by `has_access` (P2.2+).
- Content eligibility vocabulary (P2.1, ratified 2026-09-26, supersedes the earlier `experience_level` naming): courses carry `minimum_age`, `maximum_age`, and `learning_level` (string enum `beginner|intermediate|advanced`), so catalogue age filtering reuses the age-range rule already shipped in `pods` and `PodRecommendationService` while level is a separate string vocabulary. Tracks carry no eligibility columns; eligibility lives on courses. The PRD's four named age bands remain a display concept only.
- Course to Pod/Track linkage (P2.1, ratified 2026-09-26, supersedes the earlier nullable-Pod decision): every course is attached at creation to exactly one primary Pod (`courses.pod_id`) and one track (`courses.track_id`); both are required NOT NULL `restrictOnDelete` FKs. Consequence accepted by product: a content manager cannot save a course before choosing its Pod and track, so there is no Pod-less draft. `pod_courses` many-to-many stays deferred. Pods and tracks are taxonomy that must never be silently deleted, hence restrict.
- Content structure deletion (P2.1, ratified 2026-09-26): `modules.course_id` and `lessons.module_id` are `restrictOnDelete`, so a module that still holds lessons and a course that still holds modules cannot be deleted until emptied. This supersedes the earlier `cascadeOnDelete` plan for these two FKs and is safe because P2.2 progress references are not yet introduced.
- Course profile fields (P2.1, ratified 2026-09-26): lesson PDF/attachment storage is recorded as `lessons.attachment_path` (server-side path) rather than a provider-neutral public URL, aligning with the private-by-default file rule; signed-URL exposure remains P2.3.
- Content vocabularies (P2.1, approved 2026-09-26): content status, level, lesson type, completion rule, and video provider are string-backed PHP enums mapped onto indexed varchar columns per `backend/DATABASE_PLAN.md`. Tables created before this decision keep raw string columns and are unchanged.
- Publishing contract (P2.1, ratified 2026-09-26, supersedes the earlier `PublishCourse`/`ArchiveCourse` naming): publication is a single server-side `ContentWriter` orchestration that validates Pod, ordered modules, at least one lesson per module, and per-type lesson media before anything reaches a learner, then publishes the course and its non-archived children and stamps `published_at` once. Every status transition writes an append-only `content_publication_events` audit row (actor, entity, from_status, to_status). Archiving hides a course subtree without deleting it. The public read-only catalogue exposes published content only and answers 404 for unpublished slugs.
- Public gallery: post-MVP and consent/moderation gated.
- Kits, schools, and camp commerce: post-core; admin schema can be introduced only in Phase 6.
- Timezone: `Africa/Lagos`; money stored in minor units at payment boundaries and decimals only for display/reporting.
- API: versioned under `/api/v1`; clients never infer authorization from UI state.
- Product navigation: Pods are the primary learner-facing worlds; tracks remain useful internal taxonomy and filtering.
- Pod membership: Basic and Standard begin with one active primary Pod; Premium permits up to two active Pods. Admin overrides are audited.
- Gamification: XP uses an immutable ledger; children have an overall TinkerPod rank and a separate rank per joined Pod.
- Competition: leaderboards are age-banded, privacy-safe, time-boxed, and opt-out capable. They emphasize personal movement and nearby positions rather than public failure.
- Rewards: XP, rank, badge, streak, and challenge rules are server-authored and idempotent. The mobile app only presents results.
- Sensory feedback: sound, haptics, Lottie/SVG/Reanimated motion are core UX, with mute, reduced-motion, reduced-effects, and replay controls.

## Architecture boundaries

- Laravel owns identity, authorization, learning state, payments, notifications and reporting.
- Expo serves parents and children; mentors use Filament in MVP.
- Landing site has no authenticated user area.
- Files are private by default and exposed through short-lived signed URLs.
- Every child-scoped query must be constrained through the authenticated parent's ownership or mentor assignment.
