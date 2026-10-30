# Implementation handoffs

Every implementation task must add a dated handoff using `../templates/HANDOFF_TEMPLATE.md` and link it here newest first.

The repository is **not under version control**. Concurrent agents silently overwrite each other with no undo and no conflict signal, so exactly one agent may hold a package at a time. Before writing any file, check this page and `../BUILD_PLAN.md` for an active owner.

## Active work

| Date | Package | Task | Status | Owner | Spec |
|---|---|---|---|---|---|
| 2026-10-02 | P2.2 | Enrollment and access rules | Complete | Qoder | [Task spec](../tasks/2026-10-02-p2.2-enrollment-access.md) · [Handoff](2026-10-02-p2.2-enrollment-access.md) |
| 2026-09-26 | P2.1 | Content schema and admin | Partial — reconciled + Design B ratified, catalogue API shipped; Filament v5 test port open | Qoder | [Task spec](../tasks/2026-09-26-p2.1-content-schema-admin.md) · [Handoff](2026-09-26-p2.1-content-schema-reconciliation.md) |

### Unresolved conflicts on P2.1

1. **Eligibility vocabulary (resolved — ratified).** Product ratified Design B on 2026-09-26: courses use `learning_level`; `../DECISIONS.md` was updated to supersede the earlier `experience_level` entry.
2. **Foreign-key policy (resolved — ratified).** Ratified as shipped: `courses.pod_id`/`track_id` NOT NULL `restrictOnDelete`, `modules`/`lessons` `restrictOnDelete`. Accepted behavior: a course cannot be saved before its Pod/track is chosen, and non-empty modules/lessons cannot be deleted. `../DECISIONS.md` records the reversal.
3. **Catalogue (resolved — verified).** `GET /api/v1/tracks`, `/courses`, `/courses/{slug}` exist with `CourseDetailResource`, OpenAPI updated, and 8 passing feature tests (published-only, filters, pagination, no-N+1, no child data, 404-equivalence). Full suite 148 pass / 5 fail; the 5 are the deferred Filament v5 / Windows private-visibility blocker.

## Completed handoffs

| Date | Build package | Task | Status | Handoff |
|---|---|---|---|---|
| 2026-08-01 | P1.5A | R1 subscription access gates | Complete | [Open](2026-08-01-r1-subscription-access-gates.md) |
| 2026-07-31 | P1.5 | Plans and Paystack subscriptions | Backend/API complete | [Open](2026-07-31-plans-and-paystack.md) |
| 2026-07-16 | P1.3A | Pod recommendation and primary membership | Complete | [Open](2026-07-16-pod-recommendation-membership.md) |
| 2026-07-13 | P1.3 / P1.6 | Mobile child-profile journey | Mobile vertical slice complete | [Open](2026-07-13-mobile-child-profile.md) |
| 2026-07-13 | P1.3 | Child profiles, ownership, and Filament sidebar correction | Backend/admin slice complete | [Open](2026-07-13-child-profiles-and-sidebar-fix.md) |
| 2026-07-13 | P1.4 | Filament SaaS dashboard and operations shell | Polished foundation complete | [Open](2026-07-13-filament-saas-dashboard.md) |
| 2026-07-13 | P1.1 / P1.4 / P1.6 | Foundation, admin shell, initial mobile experience | Partial milestone complete | [Open](2026-07-13-foundation-admin-mobile.md) |
