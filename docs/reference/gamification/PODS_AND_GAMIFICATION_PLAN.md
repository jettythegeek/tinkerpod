# Pods and gamification plan

Source: PRD v1 plus `source/conversations/pods-and-gamification.txt`.

## Product definition

A Pod is a skill-based learning world where a child belongs to a mentor-guided community, follows a structured pathway, completes courses, builds projects, joins live classes, earns XP, unlocks badges and ranks, participates in age-safe leaderboards, and grows toward mastery. The Pod is the primary child-facing product surface.

## Launch Pods

Coding, AI, Design, Robotics, and Young Founders. Later candidates include Animation, Game Development, Web/App, Cyber Safety, Content Creation, and Data.

Each Pod requires: name/slug, description/slogan, icon/color/theme, skill category, eligibility, capacity, pathway levels, courses, projects, challenges, mentor roles, live sessions, badges/ranks, leaderboard scopes, showcase configuration, recommended tools/kits, and reporting.

## Joining flow

Parent supplies child age, level, interests, and desired builds. The server returns an explainable Pod recommendation. Parent accepts or chooses another eligible Pod. The child receives a welcome, mentor/path preview, first course/project/challenge/live class, overall Tinker Starter rank, and Pod-specific starting rank.

## Reward engine

XP is recorded in an immutable, idempotent ledger. Suggested defaults are admin-configurable and content-versioned:

- lesson complete 10; quiz complete 15; score ≥80% bonus 10;
- project submitted 50; approved 100; excellent 150;
- live attendance 25; weekly challenge 75; seven-day streak 50;
- meaningful Pod participation 20; course complete 200; Pod level complete 500.

The server emits a reward result containing ledger entries, new totals, earned badges, rank transitions, streak changes, unlocks, and presentation tier. Clients never calculate awards.

## Progression

Children have an overall TinkerPod rank and one rank per joined Pod. Initial overall ladder: Tinker Starter, Curious Builder, Skill Explorer, Project Maker, Problem Solver, Pod Champion, Tech Creator, Innovation Leader, Young Founder, TinkerPod Legend. Rank rules combine XP with required achievements so passive point accumulation cannot replace mastery.

Pod ladders use domain identity—for example Code Rookie → App Creator, Robot Rookie → Robotics Innovator, and Idea Explorer → Future Founder. Exact thresholds and requirements are managed in admin and versioned.

## Badges, streaks, and challenges

Badges represent specific achievements and may be global or Pod-specific. Streaks reward meaningful learning activity, use a documented Africa/Lagos day boundary, and include compassionate grace rules. Challenges have eligibility, period, tasks, reward rule, optional badge, moderation, and completion evidence.

## Leaderboards

Support Pod, weekly, monthly, project/challenge, and age-group scopes. Default child view emphasizes personal position, movement, next reachable position, and nearby peers; it may hide the full board for younger groups. Weekly resets provide fresh starts. Use privacy-safe aliases, ties, minimum-participation rules, abuse review, parent opt-out, and archived snapshots.

## Administration and analytics

Admins manage rules without code deployment, preview their effects, schedule challenges, correct XP through ledger adjustments, and audit every change. Measure participation and learning outcomes alongside reward use; monitor unhealthy concentration, farming, discouragement, opt-outs, and notification fatigue.

## Non-negotiables

No purchasable rank, pay-to-win leaderboard, hidden point manipulation, public child identity, punishment-heavy streaks, or client-authoritative awards. Rewards reinforce real learning and building; they do not replace them.

