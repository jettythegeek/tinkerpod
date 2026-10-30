# TinkerPod

TinkerPod (`www.tinkerpod.ng`) is a year-round subscription coding and digital-skills platform for Nigerian kids aged 5–18, with a dedicated parent mode, mentor workflows, content-pack engine, and live leagues.

## Monorepo Layout

| Path | Description |
| :--- | :--- |
| `api/` | Laravel 13 backend (`/api/v1/*`), Sanctum auth, Spatie Permission, Horizon, Reverb, and Filament 5 panels (`/admin` and `/mentor`). |
| `app/` | Expo (React Native, TypeScript strict) mobile client using React Navigation, NativeWind, TanStack Query, Reanimated, and `react-native-svg`. |
| `design/` | Approved design source of truth: PNG screen mockups (`00`–`32` and boards), HTML/CSS sources, Pip mascot motion SVGs & `moods.json`, FX SVGs/audio & `cues.json`, and brand art assets. |
| `docs/` | Active architecture decisions (`DECISIONS.md`), ADRs (`docs/adr/`), build plan (`BUILD_PLAN.md`), handoff logs (`docs/handoffs/`), and read-only historical context (`docs/reference/`). |
| `.githooks/` | Versioned Git hooks enforcing commit author/committer identity and rejecting `Co-authored-by` trailers. |
| `.github/workflows/` | GitHub Actions CI for API (Pint, PHPStan, PHPUnit), App (`tsc`, ESLint, Jest), secret scanning (Gitleaks), and commit identity enforcement. |

## Local Development Setup

### Prerequisites
- PHP 8.3+ with `ext-intl`, `ext-pdo_mysql`, `ext-mbstring`, `ext-zip`
- Composer 2.x
- MySQL 8.0+ / 9.x and Redis (Laragon on Windows)
- Node.js 20+ and npm

### 1. Git Hooks & Identity
```bash
git config user.name "jettythegeek"
git config user.email "jettythegeek@users.noreply.github.com"
git config core.hooksPath .githooks
```

### 2. API (`api/`)
```bash
cd api
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```
- Health check: `GET http://127.0.0.1:8000/api/v1/health`
- Admin panel: `http://127.0.0.1:8000/admin`

Run API checks:
```bash
cd api
composer test
./vendor/bin/pint --test
./vendor/bin/phpstan analyse --memory-limit=1G
```

### 3. Mobile App (`app/`)
```bash
cd app
cp .env.example .env
npm ci
npx expo start
```

Run App checks:
```bash
cd app
npm run typecheck
npm run lint
npm test
```

## Documentation & Rules
- Read [`AGENTS.md`](./AGENTS.md) for mandatory engineering, asset, privacy, and commit rules.
- Read [`docs/DECISIONS.md`](./docs/DECISIONS.md) for locked product and technical decisions.
- Read [`BUILD_PLAN.md`](./BUILD_PLAN.md) for the milestone breakdown and acceptance criteria.
