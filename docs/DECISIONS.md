# TinkerPod — Locked Architecture & Product Decisions

This document is the **authoritative source of truth** for product, architecture, design, and engineering decisions in the TinkerPod monorepo. Historical documents in [`docs/reference/`](./reference/README.md) are read-only context only; **this document (`docs/DECISIONS.md`) wins on any conflict.**

---

## 1. Locked Core Decisions

| Area | Locked Decision |
| :--- | :--- |
| **Approach** | **Fresh start.** No old code is ported wholesale; everything is designed and written new. The old project (`docs/reference/`) is reference only. Only the Paystack billing core, kobo money handling, and their test scenarios are re-implemented cleanly in the new domain structure (M5). |
| **API Stack** | **Laravel 13** (PHP 8.3+), **Sanctum**, **Spatie Permission** (8 roles: `parent`, `child`, `mentor`, `admin`, `super_admin`, `content_manager`, `support`, `finance`), **MySQL**, **Redis**, **Horizon**, **Reverb**, **Paystack** first. Base URL `api.tinkerpod.ng/api/v1`, canonical JSON response envelope `{ "success": bool, "message": string, "data": object\|null }`. |
| **Admin & Mentor Panels** | **Filament 5**: `/admin` panel for staff (styled in admin navy `#101B4D`) and `/mentor` panel for mentors (scoped strictly to assigned pods and children). Uses **Heroicons** (Filament's built-in icon set) exclusively. |
| **Mobile App Stack** | **Expo** (latest stable SDK, TypeScript strict), **React Navigation**, **NativeWind**, **TanStack Query**, **Axios**, **expo-secure-store**, **React Hook Form + Zod**, **lucide-react-native** (icons per `design/ICONS.md`), **react-native-svg + Reanimated** (baked `*-static.svg` + `*.motion.json`) and **react-native-webview** (transparent WebView for one-shot full-screen celebrations; **there is no Lottie**), **expo-audio**, **expo-haptics**, **EAS Build + EAS Update**. |
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
4. **Approved Assets, Icons, Animations & Accessibility**:
   - All visual and audio assets come exclusively from `design/` and are verified against `design/MANIFEST.md`.
   - FX may use every FX in `design/` (`fx01`–`fx15`), not only `fx01`–`fx05`.
   - The app uses **Lucide** (`lucide-react-native`, see `design/ICONS.md`) and admin uses **Heroicons**. No emoji or text symbols are used as icons.
   - **There is no Lottie**: animations use the pack's baked `*-static.svg` plus Reanimated driven by `*.motion.json`, or a transparent `WebView` for one-shot full-screen celebrations (see `design/PACK-README.md`).
   - All animations, Captain Jetty moods, celebration FX, audio cues, and haptics honour mute, reduced-motion, and reduced-effects preferences.
5. **Private Storage by Default**:
   - Lesson attachments, content pack downloads, and child project uploads reside on private disks and are served only through short-lived signed URLs after authorization checks.

---

## 3. Learning Structure, Pods & Kid Navigation (Founder Decisions)

### Learning Structure (Locked Word-for-Word)
Pod > Journey > Level > Unit > Lessons, where each lesson ends with a Quiz, and each unit ends with an Assignment (mentor-reviewed, saved to the Build tab). Missions unlock when a level is finished, and an Adventure is a story series of missions. Competitions are separate from learning: League, Cup and World Cup.

### Pods & Enrollment Scoping
- A **pod** is a track (**Coding**, **AI**, **Design**, **Robotics**, **Founder**).
- A child only sees content from the pod(s) they are enrolled in, nothing else. Every learning query is scoped by the child's enrolled pods (`LearningAccess`).
- More than one pod per child is allowed by the data model (`enrollments` unique on `(child_id, pod_id)`); which subscription plans allow multiple pods is decided in M5.

### Kid Bottom Navigation & Learn Hub
- **Bottom Nav**: `Home`, `Learn`, `Build`, `Rewards`, `Me` with Lucide `House`, `BookOpen`, `Hammer`, `Trophy`, `Smile`.
- **Learn Hub**: Opens with three top sections: `Journey` (default), `Missions`, and `Compete` (`League`, `Cup`, and `World Cup` shown as locked "coming soon" cards until M8).

### Mapping Current M2 Schema to the Learning Structure
We keep the M2 tables intact in M3 and map them to the product hierarchy as follows:

| Product Term | Current M2 Table(s) | Notes |
| :--- | :--- | :--- |
| **Pod** | `pods` | Track (`Coding`, `AI`, `Design`, `Robotics`, `Founder`), scoped via `enrollments`. |
| **Journey** | `tracks` / `courses` | Ordered sequence of levels within a Pod (e.g., *Journey 1 · Explorer*). |
| **Level** | `worlds` | Map stages inside a Journey (e.g., *Level 3 · Loops Valley*). |
| **Unit** | `modules` | Units inside a Level (e.g., *Unit 1 · What is a loop?*, *Unit 3 · Repeat and Count*). |
| **Lesson** | `lessons` | Individual lessons inside a Unit (`module_id`) and Level (`world_id`). |
| **Quiz** | `quizzes`, `quiz_questions`, `quiz_options`, `quiz_attempts`, `quiz_attempt_answers` | Ends each lesson; attempts start first via `POST /quizzes/{quiz}/attempts`, answers are checked inside an open attempt, and only the first answer per question scores. |
| **Assignment** | `projects` | Currently linked to `lesson_id` as a curriculum stub. |

### Schema Gaps Deferred to M4 / M7 / M8
1. **Unit-Level Assignments & Portfolio Submissions (M4 / M7)**:
   - `projects` (Assignments) currently belong to `lesson_id` rather than `module_id` (Unit).
   - Child assignment submission tables (`assignment_submissions` with status `draft`, `submitted`, `reviewed`, code/upload attachment, mentor feedback, and 1–3 star rubric score) will be added in M7 for the Build portfolio (`34`–`37`, `46`–`47`).
2. **Missions & Adventures (M4 / M7)**:
   - Dedicated `adventures` (story series of missions) and `missions` (unlocked when a `world` / Level is finished, with chapters and downloadable content packs) are not yet separate tables in M2 and will be introduced with the M4 content-pack engine (`38`, `39`).
3. **Competitions (M8)**:
   - `League` (weekly cohorts of 20), `Cup` (pod knockout bracket), and `World Cup` (nationwide pod table) tables and Reverb channels are deferred to M8 (`40`–`43`).
