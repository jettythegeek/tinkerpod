
Canvas "TinkerPod Build Plan" (https://cursor.com/canvas/store-a0f27765-4c25-4616-a4ec-366f412684bf/aefb190c-c4e5-4e9a-a399-3939204a9edb):

import { Page, Section, Text, Callout, Table, NumberedList, Steps, Properties, TableOfContents, Diagram, Section as Sub } from "grok/canvas";

const milestones: string[][] = [
  ["M0", "Repo scaffold, CI, design import", "1", "—"],
  ["M1", "Auth, roles, kid login", "2", "M0"],
  ["M2", "Content, learning, quizzes, progress", "3", "M1"],
  ["M3", "Gamification ledger", "2", "M2"],
  ["M4", "Content-pack engine, downloader, player", "3", "M2, M3"],
  ["M5", "Parent mode and billing (Paystack re-implementation)", "2", "M1, M3"],
  ["M6", "Admin and mentor Filament panels", "2", "M2–M5"],
  ["M7", "Live classes and project review", "2", "M6"],
  ["M8", "League pilot with Reverb", "3", "M3, M7"],
  ["M9", "Launch hardening", "2", "M0–M8"],
  ["M10", "New landing page (fresh, later)", "2", "M9"],
];

export default function App() {
  return (
    <Page
      title="TinkerPod Build Plan"
      summary="A fresh-start build of TinkerPod in the new monorepo: the few things re-implemented from the old code, eleven milestones (M0–M10) of numbered tasks with acceptance tests, the rules for using the approved design assets, and what the founder must supply and when."
      width="column"
    >
      <TableOfContents
        items={[
          { label: "Decisions locked for this plan" },
          { label: "Repo structure" },
          { label: "Fresh start: what we take from the old code" },
          { label: "Milestones at a glance" },
          { label: "M0 Repo scaffold, CI, design import" },
          { label: "M1 Auth, roles, kid login" },
          { label: "M2 Content, learning, quizzes, progress" },
          { label: "M3 Gamification ledger" },
          { label: "M4 Content-pack engine" },
          { label: "M5 Parent mode and billing" },
          { label: "M6 Admin and mentor panels" },
          { label: "M7 Live classes and project review" },
          { label: "M8 League pilot with Reverb" },
          { label: "M9 Launch hardening" },
          { label: "M10 New landing page" },
          { label: "Asset-usage rules for the coding agent" },
          { label: "Commit and repo hygiene rules" },
          { label: "Definition of done" },
          { label: "Risks" },
          { label: "What the founder supplies, and when" },
          { label: "How the coding agent should run this plan" },
        ]}
      />

      <Section heading="Decisions locked for this plan">
        <Properties
          items={[
            { label: "Approach", value: "Fresh start. No old code is ported wholesale; everything is designed and written new. The old project is reference only" },
            { label: "API", value: "Laravel 13, Sanctum, Spatie Permission (8 roles), MySQL, Redis, Horizon, Reverb, Paystack first. Base `api.tinkerpod.ng/api/v1`, envelope `{success, message, data}`" },
            { label: "Admin", value: "Filament 5: `/admin` panel (staff) and `/mentor` panel (mentors)" },
            { label: "App", value: "Expo (TypeScript), React Navigation, NativeWind, TanStack Query, Axios, SecureStore, RHF + Zod, react-native-svg + Reanimated (Pip), Lottie (celebrations), expo-audio, expo-haptics, EAS Build + EAS Update" },
            { label: "Navigation", value: "React Navigation, not Expo Router. Parent mode, kid mode and the pack player are runtime-switched trees, and pack screens are data-driven rather than file routes. On a fresh build there is no migration cost" },
            { label: "Content packs", value: "Versioned zips on S3-compatible storage (R2 or Bunny) behind a CDN: JSON manifest, sha256 checksum, `min_app_version`, short-lived signed URLs; rendered in-app by a data-driven pack player. New component types ship by EAS Update" },
            { label: "Kid login", value: "Parent-managed child profiles. Kid signs in with a username, or the parent's phone or email, plus a PIN the parent sets; profile picker when a parent has several kids" },
            { label: "Landing page", value: "The old landing site is dropped entirely. A new, more powerful landing page is its own later milestone (M10); its stack and scope are decided then" },
            { label: "Theme", value: "Nunito; teal `#00BFAE`, button teal `#007A70`, ink `#0F172A`, purple `#7C3AED`, `#FFB700`, `#FF6B6B`, `#2563EB`, green `#63C132`, admin navy `#101B4D`; a `junior` (5–11) or `senior` (12–18) theme flag per child" },
            { label: "Plans and prices", value: "Placeholders only. The old ₦15k / ₦25k / ₦40k seed is not a price decision" },
          ]}
        />
      </Section>

      <Section heading="Repo structure">
        <Table
          columns={["Path", "Contents"]}
          rows={[
            ["`api/`", "Laravel 13 app: `app/Domain/*` (Billing, Learning, Pods, Gamification, Packs, Live, Projects, Leagues), Filament admin and mentor panels, tests"],
            ["`app/`", "Expo app: `src/navigation`, `src/features/*`, `src/pack-player`, `src/pip`, `src/fx`, `src/theme` (tokens and junior/senior flag), `src/api`"],
            ["`design/`", "Approved source of truth: `png/` screens 00–32 and boards, `html/` sources, `motion/` Pip SVGs and `moods.json`, `fx/` five FX SVGs, audio and `cues.json`, `assets/` (logo, avatars, mascot poses, journey map background)"],
            ["`docs/`", "New DECISIONS, this plan, ADRs, OpenAPI, handoffs"],
            ["`docs/reference/`", "Read-only copies of the old PRD v1.1, PRD v1, founder conversations, DECISIONS and specs. Context only; never binding"],
            ["`packages/contracts/`", "Optional: JSON Schemas for the pack manifest and API types, shared by `api/`, `app/` and the CI checks"],
            ["`.github/workflows/`", "API and app CI; secret scan; commit-author check"],
          ]}
        />
        <Text>No landing folder exists until M10 adds one.</Text>
      </Section>

      <Section heading="Fresh start: what we take from the old code">
        <Callout lead="Re-implement, don't port.">Only the Paystack billing core, kobo money handling and their tests are rebuilt from the old code, cleanly and in the new structure, using the old files as a reference. Nothing is copied across as-is.</Callout>
        <Steps
          steps={[
            { title: "1. Old docs as reference", detail: "Copy PRD v1.1, PRD v1, the two founder conversations, DECISIONS and the focused specs into `docs/reference/` with a README saying they are context only and that `docs/DECISIONS.md` (new) wins on any conflict." },
            { title: "2. Write new decisions", detail: "Start `docs/DECISIONS.md` fresh from the decisions on this page; carry a rule over from the reference docs only by restating it there." },
            { title: "3. Fresh Laravel 13 app", detail: "New skeleton, new `APP_KEY`, new schema designed for this plan. Old migrations, models, Filament resources and seeders are not copied." },
            { title: "4. Paystack billing (in M5)", detail: "Re-implement checkout initialize, server-side verify and the webhook. Keep from the old design: HMAC-SHA512 signature check with constant-time compare against the raw body; settlement inside a DB transaction with row locks on the transaction, plan and parent; idempotent replays (already-settled returns the same result); amount and currency must match the pending transaction or it fails; refunded payments never grant access; unknown references and non-success events are ignored safely." },
            { title: "5. Kobo money handling", detail: "Store every amount as an integer in minor units (`amount_minor`, kobo) with an ISO currency (`NGN`); a small `Money` value object for arithmetic and display; never floats; display formatting only at the edges." },
            { title: "6. Billing tests", detail: "Rewrite the old billing test scenarios against the new code: valid and invalid signature, replayed webhook, amount mismatch, currency mismatch, refunded transaction, verify then webhook racing, renewal extending the period, access summary rules." },
            { title: "7. Reference reading only", detail: "The old pod-recommendation, content-publishing and enrollment classes, and the old Pip SVG idea, may be read for ideas. The coding agent writes its own code and never copies files." },
            { title: "8. Never bring over", detail: "Old `.env` files, `APP_KEY`, `bootstrap/cache`, `.qoder`, `.next`, the old landing site, the old mobile app, and the seeder's hardcoded fallback admin password." },
          ]}
        />
      </Section>

      <Section heading="Milestones at a glance" caption="Weeks are estimates for one full-time coding agent with founder reviews; about 24 weeks in total.">
        <Table columns={["ID", "Milestone", "Weeks (est.)", "Needs"]} rows={milestones} align={["start", "start", "end", "start"]} />
        <Diagram
          direction="horizontal"
          nodes={[
            { id: "m0", label: "M0 Scaffold" },
            { id: "m1", label: "M1 Auth" },
            { id: "m2", label: "M2 Learning" },
            { id: "m3", label: "M3 Ledger" },
            { id: "m4", label: "M4 Packs" },
            { id: "m5", label: "M5 Billing" },
            { id: "m6", label: "M6 Panels" },
            { id: "m7", label: "M7 Live/Projects" },
            { id: "m8", label: "M8 League" },
            { id: "m9", label: "M9 Launch" },
            { id: "m10", label: "M10 Landing", kind: "terminal" },
          ]}
          edges={[
            { from: "m0", to: "m1" },
            { from: "m1", to: "m2" },
            { from: "m2", to: "m3" },
            { from: "m2", to: "m4" },
            { from: "m3", to: "m4" },
            { from: "m1", to: "m5" },
            { from: "m3", to: "m5" },
            { from: "m4", to: "m6" },
            { from: "m5", to: "m6" },
            { from: "m6", to: "m7" },
            { from: "m7", to: "m8" },
            { from: "m3", to: "m8" },
            { from: "m8", to: "m9" },
            { from: "m9", to: "m10" },
          ]}
        />
      </Section>

      <Section heading="M0 Repo scaffold, CI, design import" caption="Estimate: 1 week." collapsible>
        <NumberedList
          items={[
            "Initialise the monorepo with `api/`, `app/`, `design/`, `docs/`; root README, `.editorconfig`, `.gitignore` covering `.env*`, `.next`, `bootstrap/cache`, `.qoder`, `node_modules`, `vendor`, `storage`.",
            "Set the git identity to jettythegeek and add a `commit-msg` hook plus a CI job that reject any `Co-authored-by` trailer or a non-jettythegeek author or committer.",
            "Copy `/workspace/tinkerpod/design/` into `design/` byte for byte; write `design/MANIFEST.md` listing each file, its sha256 and the screen it serves.",
            "Put the old docs in `docs/reference/` (fresh-start step 1) and write the new `docs/DECISIONS.md`, ADR-001 (React Navigation) and ADR-002 (kid login).",
            "Create a fresh Laravel 13 app with a new `APP_KEY`, the `{success, message, data}` envelope, JSON error handling and `/api/v1/health`.",
            "Scaffold `app/` (Expo, TypeScript strict, NativeWind, React Navigation) with a theme module of the locked tokens and the junior/senior flag; load Nunito.",
            "CI: Pint, PHPStan level 6, PHPUnit on MySQL 8 + Redis with `ext-intl`; app `tsc`, ESLint, Jest; gitleaks secret scan.",
          ]}
        />
        <Sub heading="Acceptance and tests">
          <NumberedList
            items={[
              "CI is green on `main`; the health endpoint test passes on MySQL.",
              "The hook and the CI job reject a commit with a co-author trailer (tested with a fixture commit).",
              "gitleaks finds nothing; no `.env` or `bootstrap/cache` is tracked; no file from the old project's code exists in the repo.",
              "`design/MANIFEST.md` checksums match the box copy.",
              "The app boots on an Android emulator to a token-styled placeholder screen.",
            ]}
          />
        </Sub>
      </Section>

      <Section heading="M1 Auth, roles, kid login" caption="Estimate: 2 weeks." collapsible>
        <NumberedList
          items={[
            "Spatie roles: parent, child, mentor, admin, super_admin, content_manager, support, finance; permissions seeded; Filament navigation driven by permissions.",
            "Parent auth: register, login (email or phone), logout, me, password reset by email OTP, optional phone OTP.",
            "Children table designed fresh: parent owner, first name, optional last name, birth date, age band, theme flag, unique `username`, PIN hashed with bcrypt, `pin_failed_attempts`, `locked_until`.",
            "Username rules: 3–20 characters, letters, digits, `_` and `.`; profanity filter (English plus a Pidgin, Yoruba, Igbo and Hausa list); reject phone-number patterns, email patterns and the child's own first or last name. The parent sets it; the kid may change it.",
            "Kid login endpoint: identifier (username, or parent phone or email) plus PIN. A parent identifier returns a profile picker list (first name and avatar only), then PIN per profile. Issue a child-scoped Sanctum token with `child:*` abilities.",
            "Lockout: 5 wrong PINs locks that profile for 15 minutes, escalating; notify the parent; audit-log every attempt.",
            "Parent dashboard endpoints: set or reset a PIN, set a username, unlock a profile.",
            "Audit log table plus a service used for admin overrides and every PIN or username change.",
            "App: welcome, parent register and login, forgot password, kid login, profile picker, PIN pad (from the approved screens), parent and kid navigation trees.",
          ]}
        />
        <Sub heading="Acceptance and tests">
          <NumberedList
            items={[
              "Feature tests: kid login by username, by parent email, by parent phone; profile picker when several kids; wrong PIN increments; lockout after 5; parent unlock; PIN reset.",
              "A child token cannot reach parent, billing or admin routes (policy tests for each role).",
              "Username tests: profanity, phone-like, email-like and real-name values are rejected with a kid-friendly message.",
              "The profile picker never returns last names, birthdays or other children's data.",
              "App: Jest tests for the PIN pad and the login forms; manual run on a small Android screen.",
            ]}
          />
        </Sub>
      </Section>

      <Section heading="M2 Content, learning, quizzes, progress" caption="Estimate: 3 weeks." collapsible>
        <NumberedList
          items={[
            "Design the schema fresh: Track > Course > Module > Lesson > Quiz > Project, plus pods and `worlds` for the journey map; draft, published and archived statuses with a publication audit log.",
            "Lesson progress: monotonic updates, resume position, server-computed completion (manual, watch percentage, quiz pass).",
            "Quizzes: questions, options, attempts, scoring, attempt caps, explanations.",
            "Private attachments through short-lived signed URLs.",
            "Mobile: kid home (junior and senior), journey map, lesson detail, quiz, from screens 01–04 and 10.",
            "Hook the FX cues: correct or wrong (`fx03`) on quiz answers, behind mute and reduced-motion settings.",
          ]}
        />
        <Sub heading="Acceptance and tests">
          <NumberedList
            items={[
              "An eligible child completes a lesson and a quiz; progress survives an app restart and a second device.",
              "Replaying a completion request never double-counts; ineligible children get 403.",
              "Catalogue and progress endpoints have no N+1 queries (query-count assertions).",
              "Screens visually match PNGs 01–04 and 10 on a 360 dp and a 412 dp device.",
            ]}
          />
        </Sub>
      </Section>

      <Section heading="M3 Gamification ledger" caption="Estimate: 2 weeks." collapsible>
        <NumberedList
          items={[
            "One immutable `reward_ledger` with currency (xp, coins, gems), source type, source id and a unique idempotency key; balances are derived or cached projections.",
            "An award service that turns learning events into a reward result: entries, totals, level change, badges, streak change, title, presentation tier.",
            "Levels, Naija titles, badges and streaks, all admin-configurable and versioned; streaks use the Africa/Lagos day with grace days.",
            "Explicit negative adjustment entries for corrections; no silent edits.",
            "Mobile: XP, coin and gem HUD; level-up (`fx02`), XP and coins (`fx01`) and streak or mission (`fx05`) celebrations with Lottie and Pip moods; profile screen 07.",
          ]}
        />
        <Sub heading="Acceptance and tests">
          <NumberedList
            items={[
              "Property test: replaying any event sequence twice gives identical balances.",
              "Rank and badge transitions are reproducible from the ledger alone.",
              "The client never sends reward amounts; tampered requests are rejected.",
              "Celebrations respect mute, reduced motion and reduced effects (snapshot plus a manual check).",
            ]}
          />
        </Sub>
      </Section>

      <Section heading="M4 Content-pack engine" caption="Estimate: 3 weeks." collapsible>
        <NumberedList
          items={[
            "Define a versioned JSON Schema for the pack manifest: id, semver version, `min_app_version`, sha256 per asset and for the zip, size, locale, age band, screens and components.",
            "Pack tables: `content_packs`, `pack_versions`, `pack_assets`, child entitlements; statuses draft, review, published, retired.",
            "Builder: a Horizon job validates the content, builds the zip, computes checksums, uploads to R2 or Bunny, and publishes. Rollback goes to the previous version.",
            "API: list packs for a child, plus a manifest endpoint returning short-lived signed URLs; refuse when the app version is below `min_app_version`.",
            "App downloader: queue, resumable download, progress meter, checksum verification, unzip into versioned storage, cleanup of old versions, offline use.",
            "Pack player: a registry of component types (text, image, video, quiz, drag-and-drop, code block, Pip line). An unknown type shows a friendly update prompt; new types ship through EAS Update.",
            "Mobile: pack store screen 05 and the `fx04` pack-unlock moment.",
          ]}
        />
        <Sub heading="Acceptance and tests">
          <NumberedList
            items={[
              "A pack published in admin appears in the app and plays with no app rebuild.",
              "A corrupted zip fails the checksum and is retried, never rendered.",
              "An expired signed URL is refreshed; an app below `min_app_version` gets the update prompt.",
              "Schema tests on fixture packs; a player snapshot test for each component type; a 3G-throttled download test on a low-end Android device.",
            ]}
          />
        </Sub>
      </Section>

      <Section heading="M5 Parent mode and billing" caption="Estimate: 2 weeks." collapsible>
        <NumberedList
          items={[
            "Money: integer kobo amounts (`amount_minor`) with currency `NGN` and a `Money` value object (fresh-start step 5).",
            "Plans, subscriptions and transactions tables designed fresh; plan names and prices stay placeholders in admin config until the founder sets them; nothing hardcoded in the app.",
            "Re-implement Paystack initialize and server-side verify, using the old code as reference only.",
            "Re-implement the webhook: HMAC-SHA512 on the raw body with a constant-time compare, then locked, idempotent settlement with amount and currency checks (fresh-start step 4).",
            "Add what the old code lacked: recurring billing via card authorisation or Paystack subscriptions, `charge.failed`, `subscription.disable` and refund handling, and nightly reconciliation.",
            "Parent dashboard: children, progress, time spent, PIN and username management, subscription, receipts (screens 08 and 09).",
            "Parent onboarding: register → add child (username and PIN) → pod match → plan → Paystack checkout in a browser session → verify.",
          ]}
        />
        <Sub heading="Acceptance and tests">
          <NumberedList
            items={[
              "Release gate R1 passes end to end: register, add a child, pay in Paystack test mode, access granted.",
              "The rewritten billing tests pass (fresh-start step 6): bad signature rejected, replays idempotent, amount and currency mismatch fail, refund revokes access, a verify and webhook race settles once.",
              "Money tests: no float anywhere in billing; kobo totals round-trip exactly.",
              "Access never depends on client payment success; the webhook or verify call is the source of truth.",
            ]}
          />
        </Sub>
      </Section>

      <Section heading="M6 Admin and mentor panels" caption="Estimate: 2 weeks." collapsible>
        <NumberedList
          items={[
            "Admin panel (navy `#101B4D`), built fresh: overview, packs, pack editor, tournaments, children and parents, pods and mentors, billing, reviews (screens 21–28).",
            "Mentor panel: today, review, child progress, attendance (screens 29–32), scoped to assigned pods and children only.",
            "Permission-driven navigation for content_manager, support and finance.",
            "Audit trail viewer; XP adjustments only through ledger entries.",
          ]}
        />
        <Sub heading="Acceptance and tests">
          <NumberedList
            items={[
              "A Filament test per resource for each role (can and cannot).",
              "A mentor cannot see an unassigned child (policy test).",
              "Panels match PNGs 21–32 at 1440 px and 1280 px.",
            ]}
          />
        </Sub>
      </Section>

      <Section heading="M7 Live classes and project review" caption="Estimate: 2 weeks." collapsible>
        <NumberedList
          items={[
            "Live classes: schedule, eligibility, join window, provider-neutral Zoom or Meet links, attendance.",
            "Projects: submission drafts, uploads to a private disk, mentor rubric review, resubmission, parent view.",
            "Notifications: Expo push tokens, email, preferences, 24-hour and 1-hour reminders on Horizon schedules.",
            "Missions and Adventures screens 19 and 20 wired to projects and challenges.",
          ]}
        />
        <Sub heading="Acceptance and tests">
          <NumberedList
            items={[
              "Release gate R3: a child submits, the assigned mentor reviews, the parent sees the feedback.",
              "Upload validation: type, size and virus-scan hook; files only reachable through signed URLs.",
              "Reminder jobs are idempotent and timezone-correct for Africa/Lagos.",
            ]}
          />
        </Sub>
      </Section>

      <Section heading="M8 League pilot with Reverb" caption="Estimate: 3 weeks." collapsible>
        <NumberedList
          items={[
            "Leagues: 20-kid cohorts by age band and level; weekly seasons; promotion and relegation with fresh starts; privacy-safe aliases only.",
            "Match days: Reverb channels with Redis for the lobby, live match and results (screens 12–16); server-authoritative scoring.",
            "Champions League, Cup and World Cup structures are modelled but feature-flagged off except one pilot league (screens 17 and 18 as teasers).",
            "Opt-out, minimum-participant rules and admin moderation.",
          ]}
        />
        <Sub heading="Acceptance and tests">
          <NumberedList
            items={[
              "A 20-kid load test (simulated clients) on a staging Reverb server: messages under 500 ms p95, reconnects restore state.",
              "No full child identity appears on any league or match payload.",
              "Pilot with a founder-chosen cohort of real families before switching on wider.",
            ]}
          />
        </Sub>
      </Section>

      <Section heading="M9 Launch hardening" caption="Estimate: 2 weeks." collapsible>
        <NumberedList
          items={[
            "Security and child-safety review, using `docs/reference/` safety specs as a checklist; NDPR-aligned privacy policy and parental consent.",
            "Rate limits, backups with a restore rehearsal, Sentry, uptime checks, Horizon and Reverb supervision.",
            "Store listings, EAS production builds, Paystack live keys, final DNS for `api.tinkerpod.ng`.",
          ]}
        />
        <Sub heading="Acceptance and tests">
          <NumberedList
            items={[
              "Release gates R1–R4 pass on production-like staging; the restore rehearsal is documented.",
              "Accessibility pass: text scaling, screen readers on key flows, reduced motion everywhere.",
              "A live ₦100 Paystack payment settles and is refunded cleanly.",
            ]}
          />
        </Sub>
      </Section>

      <Section heading="M10 New landing page" caption="Estimate: 2 weeks, to be re-estimated when scoped." collapsible>
        <NumberedList
          items={[
            "Brief and design with the founder first: goals, sections, interactive moments (for example Pip, a playable mini-lesson, live league teaser), waitlist or store links, analytics.",
            "Decide the stack in an ADR at that point; nothing from the old landing site is reused.",
            "Build with the approved `design/` assets and tokens only; plans and prices read from the API.",
          ]}
        />
        <Sub heading="Acceptance and tests">
          <NumberedList
            items={[
              "Lighthouse 90 or better on mobile; Open Graph and sitemap present.",
              "Every image, animation and sound traces to a file in `design/`.",
            ]}
          />
        </Sub>
      </Section>

      <Section heading="Asset-usage rules for the coding agent">
        <Callout tone="warning" lead="Use the approved art only.">The files in `design/` are the single source of truth. The coding agent never generates, redraws, traces or substitutes its own art, icons, mascot poses, sounds or animations.</Callout>
        <NumberedList
          items={[
            "Screens follow `design/png/00–32` and their `design/html` sources for layout, spacing, copy and colours; the design system is `00-design-system`.",
            "Pip is built only from `design/motion/svg/*.svg` and `design/assets/pip/*.svg`, with moods and durations from `design/motion/moods.json` (idle, wave, happy, sad, laugh, clap, cheer).",
            "Celebrations use the five FX SVGs (`fx01-xp-coins` to `fx05-streak-mission`), their audio (`.mp3` or `.ogg`) and the timings in `fx/src/cues.json`; Lottie is a conversion of these, never new art.",
            "Logos, avatars, the journey map background and lesson or mission art come from `design/assets/`. `png/mascot-concept-generated.jpg` is a concept reference, not a production asset.",
            "Every colour, font and radius comes from the theme tokens; no one-off values.",
            "Missing asset: stop that task, list the missing file in the handoff and use a neutral grey placeholder box labelled with the file name. Never invent a replacement.",
            "Any change to an asset goes back through the founder and lands in `design/` first, with `MANIFEST.md` updated.",
          ]}
        />
      </Section>

      <Section heading="Commit and repo hygiene rules">
        <NumberedList
          items={[
            "Every commit is authored and committed as jettythegeek; no `Co-authored-by` trailer and no cursoragent committer. Enforced by the hook and the CI job from M0.",
            "Never commit `.env` files, `.next`, `bootstrap/cache`, `.qoder`, `storage`, `vendor` or `node_modules`.",
            "A fresh `APP_KEY`; secrets only in environment variables or the host's secret store.",
            "No hardcoded admin password anywhere; seeders fail without `ADMIN_PASSWORD`.",
            "Old project code is never copied in; `docs/reference/` holds documents only.",
            "Small commits per numbered task, with the task ID in the message (for example `M1.5 kid login endpoint`).",
          ]}
        />
      </Section>

      <Section heading="Definition of done">
        <NumberedList
          items={[
            "The acceptance criteria above pass end to end, not just the happy path.",
            "Migrations include constraints, indexes, rollback and factories; API changes include validation, policies, resources, OpenAPI updates and feature tests.",
            "CI green: Pint, PHPStan, PHPUnit, `tsc`, ESLint, Jest, gitleaks, author check.",
            "UI covers loading, empty, error, offline, success, disabled and accessibility states, and is checked against the matching design PNG on a small Android phone.",
            "Mute, reduced motion and reduced effects are honoured; no client-authored rewards and no trusting client payment success.",
            "A handoff note under `docs/handoffs/` lists what shipped, the commands run and anything still unverified.",
          ]}
        />
      </Section>

      <Section heading="Risks">
        <Table
          columns={["Risk", "Mitigation"]}
          rows={[
            ["A fresh start re-solves problems the old code had solved", "The billing core is re-implemented from the old reference with its test scenarios; other old classes stay readable in the old zip for ideas"],
            ["Pack player scope grows into a second app", "Fix the component list in M4; anything new waits for an EAS Update and a schema bump"],
            ["Kid PIN brute force or shared devices", "Lockout, escalating delays, parent alerts, child-scoped tokens with short expiry"],
            ["Live match days on low-end phones and weak networks", "Pilot one league in M8; server-authoritative state; reconnect and resync; fall back to polling"],
            ["Paystack recurring edge cases (failed renewals, refunds)", "Webhook as source of truth, nightly reconciliation, refund revokes access"],
            ["Agent invents art or drifts from mockups", "Asset rules, `MANIFEST.md` checksums, a screenshot comparison in every UI task"],
            ["Child data privacy (NDPR) and public identities", "Aliases on every public surface, consent records, data export and deletion for parents"],
            ["Prices and curriculum arrive late", "Plans and content are config and packs, so they slot in without code changes"],
            ["No public web presence until M10", "A simple holding page or store links can go up at M9 if the founder wants one"],
          ]}
        />
      </Section>

      <Section heading="What the founder supplies, and when">
        <Table
          columns={["Needed by", "Item"]}
          rows={[
            ["M0", "GitHub access as jettythegeek and the commit email to use; GitHub Actions enabled"],
            ["M0", "Hosting choice for staging (API, MySQL, Redis) and DNS control for `tinkerpod.ng`"],
            ["M0", "Expo or EAS account, Apple Developer and Google Play accounts"],
            ["M1", "Email and SMS provider accounts for OTP and password reset; a local-language profanity word list"],
            ["M2", "The first flagship course outline and lesson content, and quiz questions"],
            ["M3", "Naija titles list, badge names, and approval of the XP, coin and gem rules"],
            ["M4", "R2 or Bunny storage plus a CDN account; the first real content pack"],
            ["M5", "Paystack test keys, then the final plan names, prices and what each plan includes"],
            ["M6", "Admin and mentor staff list with their roles"],
            ["M7", "Mentor roster, live-class schedule, Zoom or Meet accounts"],
            ["M8", "Tournament rules, a pilot cohort of families, any prizes policy"],
            ["M9", "Privacy policy, terms, parental consent copy, store listing text and screenshots approval, Paystack live keys"],
            ["M10", "Landing page goals, copy direction and any new design work approved into `design/`"],
          ]}
        />
      </Section>

      <Section heading="How the coding agent should run this plan">
        <Text>Give the coding agent one standing prompt: work through the numbered tasks of the current milestone in order, commit after each one, run the tests, then go straight to the next task until the milestone's acceptance list passes. Then start the next milestone. Stop only when hard-blocked, for example a missing founder item from the table above, a missing asset, or a failing test it cannot fix. When it stops, it writes a handoff naming the task, the blocker and exactly what it needs.</Text>
      </Section>
    </Page>
  );
}


