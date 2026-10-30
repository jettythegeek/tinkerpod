# TinkerPod — Locked Architecture & Product Decisions

This document is the **authoritative source of truth** for product, architecture, design, and engineering decisions in the TinkerPod monorepo. Historical documents in [`docs/reference/`](./reference/README.md) are read-only context only; **this document (`docs/DECISIONS.md`) wins on any conflict.**

---

## 1. Locked Core Decisions

| Area | Locked Decision |
| :--- | :--- |
| **Approach** | **Fresh start.** No old code is ported wholesale; everything is designed and written new. The old project (`docs/reference/`) is reference only. Only the Paystack billing core, kobo money handling, and their test scenarios are re-implemented cleanly in the new domain structure (M5). |
| **API Stack** | **Laravel 13** (PHP 8.3+), **Sanctum**, **Spatie Permission** (8 roles: `parent`, `child`, `mentor`, `admin`, `super_admin`, `content_manager`, `support`, `finance`), **MySQL**, **Redis**, **Horizon**, **Reverb**, **Paystack** first. Base URL `api.tinkerpod.ng/api/v1`, canonical JSON response envelope `{ "success": bool, "message": string, "data": object\|null }`. |
| **Admin & Mentor Panels** | **Filament 5**: `/admin` panel for staff (styled in admin navy `#101B4D`) and `/mentor` panel for mentors (scoped strictly to assigned pods and children). |
| **Mobile App Stack** | **Expo** (latest stable SDK, TypeScript strict), **React Navigation**, **NativeWind**, **TanStack Query**, **Axios**, **expo-secure-store**, **React Hook Form + Zod**, **react-native-svg + Reanimated** (Pip mascot rig), **Lottie** (celebrations), **expo-audio**, **expo-haptics**, **EAS Build + EAS Update**. |
| **Navigation** | **React Navigation**, not Expo Router (see [`ADR-001`](./adr/ADR-001-react-navigation.md)). Parent mode, kid mode, and the pack player are runtime-switched navigation trees, and pack screens are data-driven rather than file-based routes. |
| **Content Packs** | Versioned zip archives on S3-compatible object storage (Cloudflare R2 or Bunny Storage) behind a CDN: validated JSON manifest, `sha256` checksums per asset and zip, `min_app_version`, short-lived signed URLs; rendered offline/in-app by a data-driven pack player. New component types ship via EAS Update. |
| **Kid Login** | **Parent-managed child profiles** (see [`ADR-002`](./adr/ADR-002-kid-login.md)). Kid signs in using a `username` (or the parent's phone or email) plus a bcrypt-hashed PIN set by the parent. When a parent identifier has multiple children, a privacy-safe profile picker (first name and avatar only) is shown before PIN entry. Issues a child-scoped Sanctum token (`child:*` abilities). |
| **Landing Page** | The old landing site is dropped entirely. No landing folder exists until **M10**, where a new landing page will be scoped and built from approved `design/` assets and API-driven plans. |
| **Theme & Tokens** | Font **Nunito**; primary teal `#00BFAE` (fills/illustrations, dark text `#0F172A` only), button teal `#007A70` (white text), ink `#0F172A`, kid purple `#7C3AED`, accents `#FFB700`, `#FF6B6B`, `#2563EB`, success `#63C132`, background `#F8FAFC`, admin navy `#101B4D`; per-child `junior` (ages 5–11) or `senior` (ages 12–18) theme flag. |
| **Mascot Naming** | The official mascot name is **Captain Jetty** (short form **"Captain"**). All user-facing copy and accessibility labels must use **Captain Jetty** (or **Captain**), never **"Pip"**. Asset filenames and internal code identifiers remain `pip-*`. |
| **Plans & Prices** | **Placeholders only** in admin configuration until the founder sets final pricing. The old ₦15k / ₦25k / ₦40k seed is not a binding price decision, and no prices are hardcoded in the mobile client. |

---

## 2. Domain & Security Rules Carried Forward

1. **Money & Billing (M5)**:
   - Every monetary amount is stored and processed as an integer in minor units (`amount_minor` in kobo) paired with an ISO currency code (`NGN`), encapsulated in a `Money` value object. Floating-point arithmetic is never used for money.
   - Paystack webhooks verify `HMAC-SHA512` against the raw request body using a constant-time comparison (`hash_equals`), then settle inside a database transaction with row locks on the transaction, plan, and parent.
   - Replayed webhooks and verify/webhook races are idempotent. Amount or currency mismatches fail settlement. Refunded payments never grant access.
   - Client-reported payment success is never trusted; server-side verification or webhook settlement is the sole source of truth.
2. **Server-Authoritative Gamification (M3)**:
   - XP, coins, and gems are recorded in a single immutable `reward_ledger` with a unique idempotency key per event.
   - The mobile client never submits reward amounts. Corrections use explicit negative adjustment entries—never silent edits.
   - Streaks use the `Africa/Lagos` calendar day with configurable grace days.
3. **Child Privacy & Safety (NDPR)**:
   - Public surfaces (leagues, match days, leaderboards) display only privacy-safe aliases and approved avatars—never a child's full name, birthday, email, or phone number.
   - Kid usernames (3–20 chars, `[a-zA-Z0-9_.]`) are filtered against English, Pidgin, Yoruba, Igbo, and Hausa profanity lists and reject phone-number patterns, email patterns, and the child's real first or last name.
   - 5 wrong PIN attempts lock that child profile for 15 minutes (escalating), notify the parent, and write an audit log entry.
4. **Approved Assets & Accessibility**:
   - All visual and audio assets come exclusively from `design/` and are verified against `design/MANIFEST.md`.
   - All animations, Pip moods, celebration FX (`fx01`–`fx05`), audio cues, and haptics honour mute, reduced-motion, and reduced-effects preferences.
5. **Private Storage by Default**:
   - Lesson attachments, content pack downloads, and child project uploads reside on private disks and are served only through short-lived signed URLs after authorization checks.
