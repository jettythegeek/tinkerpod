# TinkerPod design: screen index

Each screen is built from `html/src/NN-name.body.html`. Run `python3 build.py NN-name` from inside `html/`. This writes `html/NN-name.html` and `png/NN-name.png`. Kid screens are 390 × 844 at 2×, so each PNG is 900 × 1808. All screens use Nunito, Lucide 0.460, `tp.css` and `tp.js`.

## Key screens v1 (00–11) · board: `png/overview-board.png`
00 design-system · 01 kid-home · 02 journey-map · 03 lesson-detail · 04 quiz · 05 pack-store · 06 league-table · 07 profile · 08 parent-onboarding · 09 parent-dashboard · 10 teen-home · 11 mascot-sheet

## Tournaments, Adventures & Missions v1 (12–20) · board: `png/board-tournaments.png`
12 tournaments-hub · 13 cohort-lobby · 14 match-live · 15 match-results · 16 fixtures · 17 champions-league · 18 world-cup-teaser · 19 adventure-detail · 20 mission-detail

## Admin & Mentor (21–32) · board: `png/board-admin-mentor.png`
21 admin-overview · 22 admin-packs · 23 admin-pack-editor · 24 admin-tournaments · 25 admin-children-parents · 26 admin-pods-mentors · 27 admin-billing · 28 admin-reviews · 29 mentor-today · 30 mentor-review · 31 mentor-child-progress · 32 mentor-attendance

## Pods, Learn, Compete, Rewards & Build v2 (33–48) · board: `png/board-learn-compete.png` (copy: `preview-new-screens.png`)
| # | File | Screen |
|---|------|--------|
| 33 | 33-learn-journey | Learn hub, Journey tab: level/unit map, pod switcher chip |
| 34 | 34-unit-detail | Unit detail: lessons with quiz status, locked assignment card |
| 35 | 35-assignment-card-states | Component sheet: assignment card locked / unlocked / submitted / reviewed |
| 36 | 36-assignment-submit | Assignment: brief, what to make, code or upload, send to mentor |
| 37 | 37-assignment-reviewed | Assignment after mentor review: stars, feedback, rewards, saved to Build |
| 38 | 38-learn-missions | Learn hub, Missions tab: Adventure card plus unlocked and locked missions |
| 39 | 39-mission-codazanga | Mission detail: Golden Gate of Codazanga, Captain Jetty story, rewards |
| 40 | 40-compete-coming-soon | Learn hub, Compete tab: League, Cup and World Cup locked ("coming soon") |
| 41 | 41-league-division | Weekly League: mentor group of 20, Silver division, promotion and relegation, aliases |
| 42 | 42-cup-bracket | Pod Cup: knockout bracket inside a pod, next match |
| 43 | 43-world-cup-overview | World Cup: nationwide pod table, next match, road League → Cup → World Cup |
| 44 | 44-rewards | Rewards tab: level and Naija title, XP/coins/gems, Lagos-day streak, badges |
| 45 | 45-rewards-streak-paused | Rewards tab with a paused streak (sleepy Captain Jetty, never sad) |
| 46 | 46-build-portfolio | Build tab: portfolio of submitted assignments |
| 47 | 47-build-empty | Build tab: empty state |
| 48 | 48-parent-add-child-pods | Parent, add a child: pod picker with a recommendation and plan note |

### What's new in v2
- **New kid bottom nav:** Home, Learn, Build, Rewards, Me (`<div data-kidnav="learn">` in `tp.js`). It replaces the old nav, which still appears on screens 01, 02, 07, 10, 12 and 17 (`data-nav`). Those PNGs were left unchanged.
- **Pods:** Coding, AI, Design, Robotics and Founder. The palette is `PODS` in `tp.js`. Helpers: `data-podchip="coding,design"` is the switcher chip shown when a child has 2+ pods. `data-podicon="ai:40"` draws a pod icon.
- **New CSS** (appended to `tp.css`): `.podchip`, and `.seg3`, the 3-way Learn tabs (Journey / Missions / Compete).
- **Mascot:** called "Captain Jetty" in all user-facing text. The art files keep their `pip-*` names.
- **Art from `../design-pack/`, referenced in place and not copied:** `assets/pip/pip-celebrate.png`, `pip-surprised.png`, `pip-sleepy.png`; `assets/empty/static/empty-no-tournaments.png` and `empty-no-packs.png`; `fx/static/fx10-streak-flame-idle.png`. Merge the pack into `design/assets` before handoff, then update the `../../design-pack/` paths.
