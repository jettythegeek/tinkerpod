# API plan

Source PRD: sections 12–13 and 15.

## Contract

Base path: `/api/v1`. Maintain an OpenAPI document before mobile integration. Responses use the PRD success/error envelope, with `meta` and `links` for pagination. Validation returns stable machine-readable error keys.

## Endpoint groups

- Auth: register, login, logout, password recovery, verification, me.
- Parent: profile, password, dashboard, children, PIN, profile switch.
- Child: dashboard, courses, lessons/progress, projects/submissions, rewards, live classes, pod/feedback.
- Pods/gamification: Pod recommendation/membership/home/path, XP history/summary, ranks, badges, streak, challenges/participation, leaderboard scopes, and reward-event presentation queue.
- Catalog: tracks, courses, modules, public previews.
- Billing: plans, subscription, initialize, verify, cancel, Paystack webhook.
- Engagement: notifications, push tokens, support, camps/kits when released.

## Authorization

- Never trust a passed parent, child, mentor, price, score, or access status.
- Parent-child ownership and active access are verified server-side on every child route.
- Mentor policies scope queries to assigned pods/submissions/classes.
- Admin REST routes, if needed, use permission middleware in addition to policies.

## Performance and reliability

- Eager-load declared resource relationships and prohibit accidental N+1 queries in tests.
- Paginate unbounded collections and support documented filters/sorts only.
- Use conditional requests or cache headers for published catalog data.
- Webhooks acknowledge only after signature validation and durable idempotent recording.
- Learning actions return a server-authored `reward_events` collection when they create XP, badges, rank changes, streak changes, or unlocks; clients acknowledge presentation separately so celebrations can be replayed without repeating awards.
