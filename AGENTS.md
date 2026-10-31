# AGENTS.md — Mandatory Engineering & Repository Rules

Every contributor and coding agent working in the TinkerPod repository must strictly follow these rules.

## 1. Commit Identity & Repository Hygiene
- **Single Identity (`jettythegeek` only)**: Every commit must be authored **and** committed exclusively as `jettythegeek <jettythegeek@users.noreply.github.com>`.
- **No Co-Author or Bot Trailers**: Never include `Co-authored-by:` trailers, and never commit using an AI/bot author or committer (such as `Cursor Agent`, `cursoragent@cursor.com`, `github-actions`, etc.).
- **Pre-Commit Verification**: Always verify `git config user.name` and `git config user.email` before creating commits, and ensure `git config core.hooksPath .githooks` is active.
- **No Secrets in Git**: Never commit `.env` files, API keys, tokens, certificates, or hardcoded passwords. Commit only `.env.example` templates with empty placeholders. Always generate a fresh `APP_KEY` locally.
- **Fresh-Start Codebase**: Never copy code files, migrations, models, controllers, seeders, or components wholesale from the legacy project. Documents in `docs/reference/` are read-only context; `docs/DECISIONS.md` wins on any conflict.

## 2. Approved `design/` Assets Only
- **`design/` is the Single Source of Truth**: Use **only** files from `design/` (`design/png/`, `design/html/`, `design/motion/`, `design/fx/`, `design/assets/`).
- **Never Invent Art or Audio**: Never generate, draw, trace, download, or substitute custom images, icons, mascot poses, SVGs, Lottie files, or sound effects.
- **Pip Mascot Rig (`Captain Jetty`)**: The mascot's official user-facing name is **Captain Jetty** (short form **"Captain"**). Any text or accessibility label that users can see must say **Captain Jetty** (or **Captain**), never **"Pip"**. Asset files (`design/motion/svg/pip-*.svg`, `design/assets/pip/*.svg`) and code identifiers stay `pip-*`; do not rename them. Build the mascot exclusively from `design/motion/svg/*.svg` and `design/assets/pip/*.svg`, driven by `design/motion/moods.json` (`idle`, `wave`, `happy`, `sad`, `laugh`, `clap`, `cheer`).
- **FX & Celebrations**: Use only the five approved FX SVGs (`fx01-xp-coins` through `fx05-streak-mission`), audio files in `design/fx/audio/`, and timings in `design/fx/src/cues.json`.
- **Missing Asset Protocol**: If a required asset is missing from `design/`, **stop** that task, document the missing path in the handoff note under `docs/handoffs/`, and render a neutral grey placeholder box labelled with the missing filename.
- **Theme Tokens Only**: Every colour, font (`Nunito`), spacing, and radius must come from the theme tokens module (`app/src/theme/`). Note that primary teal `#00BFAE` is used for fills and illustrations with dark text (`#0F172A`) only; buttons with white text must use button teal `#007A70`.

## 3. Server-Authoritative Rewards & Billing
- **Server-Authoritative Gamification**: The mobile client never sends XP, coin, or gem amounts and never decides badge or level transitions. Learning events are validated server-side and recorded in the immutable `reward_ledger` with unique idempotency keys.
- **Server-Authoritative Billing**: Never trust client-reported payment success. Subscription access is granted only after server-side Paystack verification or HMAC-SHA512 webhook settlement inside a locked database transaction.
- **Integer Minor Units (Kobo)**: Store and compute all monetary values as integer minor units (`amount_minor` in kobo with currency `NGN`). Never use floating-point numbers for money.

## 4. Child Privacy & Safety (NDPR Compliance)
- **Parent-Managed Profiles**: Kids sign in using a parent-managed profile (`username`, or parent email/phone) plus a bcrypt-hashed PIN with brute-force lockout protection.
- **No Child PII on Public Surfaces**: Leaderboards, cohorts, match lobbies, and tournament views must only expose privacy-safe aliases and approved avatars—never last names, birth dates, emails, phone numbers, or other children's private data.
- **Scoped Tokens**: Child sessions use child-scoped Sanctum tokens (`child:*` abilities) that are strictly blocked from parent, billing, and admin endpoints.

## 5. Accessibility & Reduced Motion Support
- **Honour User Preferences**: Every mascot animation, SVG transition, celebration effect (`fx01`–`fx05`), audio cue, and haptic pulse must respect user settings for **mute**, **reduced motion**, and **reduced effects** (as well as OS-level accessibility reduced-motion flags).
- **Age-Band Theme Flag**: Support both `junior` (ages 5–11) and `senior` (ages 12–18) theme configurations across kid-facing screens.
