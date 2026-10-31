# ICONS.md — icon map (Lucide, not a custom set)

TinkerPod uses **Lucide** in the kid and parent apps (`lucide-react-native`) and **Heroicons** in the web admin (screens 21–32, already specified in those mockups). There is no custom icon set: the table maps every icon that appears in mockups 00–20 to its Lucide name. Brand art (Captain Jetty, badges, trophies, empty states, FX) lives in this pack as SVG and is *not* an icon.

Defaults: `size={24}` (20 in dense rows, 28 in the bottom nav), `strokeWidth={2.25}`, `color` from tokens: ink `#0F172A`, slate `#64748B` (inactive), button teal `#007A70`, kid purple `#7C3AED` (active nav). Never use `#00BFAE` teal for an icon on white (contrast); it is fill-only.

```tsx
import { House, Map, Target, Trophy, Smile } from "lucide-react-native";
<House size={28} strokeWidth={2.25} color={active ? "#7C3AED" : "#64748B"} />
```

| Semantic name | Lucide (kebab) | Component | Mockups |
|---|---|---|---|
| info / note | `info` | `Info` | 00 |
| play / continue / run | `play` | `Play` | 00, 01, 14 |
| time estimate | `clock` | `Clock` | 00, 01, 03 |
| puzzle mission | `puzzle` | `Puzzle` | 00, 01 |
| loops topic | `repeat` | `Repeat` | 00, 02, 03, 07, 13 |
| debugging / bug hunt | `bug` | `Bug` | 00, 07, 13 |
| nav: Home | `house` | `House` | 00, 01, 02, 07, 10, 12, 16, 17 |
| nav: Journey | `map` | `Map` | 00, 01, 02, 07, 10, 12, 16, 17 |
| nav: Missions | `target` | `Target` | 00, 01, 02, 07, 10, 12, 16, 17 |
| nav: League / trophy | `trophy` | `Trophy` | 00, 01, 02, 07, 10, 12, 16, 17 |
| nav: Me (profile) | `smile` | `Smile` | 00, 01, 02, 07, 10, 12, 16, 17 |
| notifications / reminder | `bell` | `Bell` | 01, 08, 09 |
| lesson done mission | `book-open-check` | `BookOpenCheck` | 01 |
| timed mission / match clock | `timer` | `Timer` | 01, 13 |
| coding / build step | `code-xml` | `CodeXml` | 02, 20 |
| world: Welcome Island | `tree-palm` | `TreePalm` | 02 |
| world: Logic Land | `git-branch` | `GitBranch` | 02 |
| world: Functions Forest | `trees` | `Trees` | 02 |
| back | `chevron-left` | `ChevronLeft` | 03, 05, 06, 08, 13, 16, 17, 18, 19, 20 |
| watch video intro | `circle-play` | `CirclePlay` | 03 |
| difficulty level | `signal` | `Signal` | 03 |
| steps count / First Steps badge | `footprints` | `Footprints` | 03, 07 |
| primary CTA arrow | `arrow-right` | `ArrowRight` | 03 |
| close / exit | `x` | `X` | 04, 09, 14 |
| lives / hearts | `heart` | `Heart` | 04 |
| hint | `lightbulb` | `Lightbulb` | 04, 14 |
| adventure pack | `tent-tree` | `TentTree` | 05 |
| pause download | `pause` | `Pause` | 05 |
| mission / startup pack | `rocket` | `Rocket` | 05, 20 |
| parent-locked (ask parent) | `lock-keyhole` | `LockKeyhole` | 05, 09 |
| pack art: Wakanda | `shield` | `Shield` | 05 |
| done / installed / selected | `check` | `Check` | 05, 07, 08, 20 |
| pack: Guangzhou; bank payment | `landmark` | `Landmark` | 05, 08 |
| download / offline ready | `download` | `Download` | 05, 19 |
| mission: The Lost Key | `key-round` | `KeyRound` | 05 |
| mission: Golden Gate | `door-open` | `DoorOpen` | 05 |
| players / seats | `users-round` | `UsersRound` | 05 |
| storage used | `hard-drive` | `HardDrive` | 05 |
| Champions League | `swords` | `Swords` | 06 |
| settings | `settings` | `Settings` | 07, 09 |
| avatar styling | `shirt` | `Shirt` | 07 |
| equipped title / top rank | `crown` | `Crown` | 07 |
| locked item | `lock` | `Lock` | 07 |
| Quiz Champ badge | `brain` | `Brain` | 07 |
| safety / parent check / trust | `shield-check` | `ShieldCheck` | 08, 09, 12 |
| unlock (trial timeline) | `unlock` | `Unlock` | 08 |
| card payment | `credit-card` | `CreditCard` | 08 |
| USSD payment | `smartphone` | `Smartphone` | 08 |
| parent dashboard / overview tab | `layout-dashboard` | `LayoutDashboard` | 09 |
| add child / add | `plus` | `Plus` | 09 |
| dropdown / date range | `chevron-down` | `ChevronDown` | 09 |
| screen time / limits | `hourglass` | `Hourglass` | 09 |
| reports | `chart-no-axes-column` | `ChartNoAxesColumn` | 09 |
| billing | `wallet` | `Wallet` | 09 |
| game builder project | `gamepad-2` | `Gamepad2` | 10 |
| share / invite | `share-2` | `Share2` | 10, 13 |
| go to / drill in | `chevron-right` | `ChevronRight` | 12, 18 |
| sound on | `volume-2` | `Volume2` | 14 |
| opponent working (spinner) | `loader` | `Loader` | 14 |
| submit answer | `send` | `Send` | 14 |
| public visibility | `eye` | `Eye` | 16 |
| notify me | `bell-ring` | `BellRing` | 18 |
| adventure step: luggage | `luggage` | `Luggage` | 19 |
| adventure step: market | `shopping-basket` | `ShoppingBasket` | 19 |
| adventure step: river | `waves` | `Waves` | 19 |
| adventure step: selfie | `camera` | `Camera` | 19 |
| adventure step: cave | `mountain` | `Mountain` | 19 |
| continue (danfo bus) | `bus` | `Bus` | 19 |
| design step | `pen-tool` | `PenTool` | 20 |
| pitch step | `presentation` | `Presentation` | 20 |

## Renamed Lucide icons
The mockups use some legacy Lucide names. Use the current names:

| Legacy name in mockup | Current Lucide name | Component |
|---|---|---|
| `code-2` | `code-xml` | `CodeXml` |
| `play-circle` | `circle-play` | `CirclePlay` |
| `palmtree` | `tree-palm` | `TreePalm` |

## Extra icons for the new states in this pack
These icons are not in mockups 00–20 but the new screens need them:

| Semantic name | Lucide | Component | Where |
|---|---|---|---|
| offline banner | `wifi-off` | `WifiOff` | offline toast / banner beside `empty-offline` |
| retry | `rotate-cw` | `RotateCw` | error and offline CTA button |
| search field | `search` | `Search` | search bar above `empty-search-no-results` |
| add child | `user-round-plus` | `UserRoundPlus` | CTA under `empty-no-kids` |
| streak | `flame` | `Flame` | small streak counter (big animated flame = fx05/fx10) |
| sound off | `volume-x` | `VolumeX` | mute toggle paired with `volume-2` |

## Notes
- 11-mascot-sheet and 15-match-results use no Lucide icons; they use brand art only.
- 13-cohort-lobby says "Practice match vs Pip bot". Change the visible text to "Captain Jetty bot" when you build it; the mascot is called Captain Jetty.
- `loader` in 14-match-live can be swapped for `fx11-loading-spinner` when the spinner is bigger than 32 px.
