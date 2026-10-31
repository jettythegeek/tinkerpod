# TinkerPod design pack

The implementation assets that were missing from `design/`. Everything here was made by the design team. **The coding agent must not generate, redraw or "improve" any art.** If an asset is missing, ask for it.

The folders mirror `design/`, so you can merge this pack in later (`design-pack/fx` → `design/fx`, and so on). Nothing in `design/` was changed.

**Tokens:**
- Font: Nunito.
- Ink `#0F172A`.
- Teal `#00BFAE` is for fills only; buttons and teal text use `#007A70`.
- Kid purple `#7C3AED`, yellow `#FFB700`, coral `#FF6B6B`, blue `#2563EB`, green `#63C132`.
- Background `#F8FAFC`, admin navy `#101B4D`.
- Small text: green `#2F7D16`, coral `#C93A3A`, slate `#64748B`.

**Mascot:** he is **Captain Jetty** (short form "Captain") in every piece of user-facing text and in accessibility labels. The files keep the `pip-*` names on purpose, so the code doesn't need renaming.

**Icons:** use Lucide (app) and Heroicons (admin). Don't make a custom icon set. See [ICONS.md](ICONS.md).

**Captain Jetty talking (new):** voice + lip-sync sample in [`talk/`](talk/README.md). Open `talk/index.html`, or watch `talk/preview/captain-jetty-talk-preview.mp4`.

**Preview:** open `preview/index.html` (all visuals animated, every sound playable). The contact sheets are `preview/contact-sheet-*.png`, and the video with sound is `preview/tinkerpod-design-pack-preview.mp4`.

## How the animated SVGs work (read this first)

Every animated SVG uses **CSS `@keyframes` inside its `<style>`**. There are no SVG filters, no SMIL and no scripts. Every animation has a `prefers-reduced-motion` fallback that stops on a still frame. Each file also ships with:

| File | What it is | Use it for |
|---|---|---|
| `*.svg` | Animated master (CSS keyframes) | Web, admin, Expo web, a `WebView`, and as the design reference |
| `*-static.svg` | **Baked** hero frame: no `<style>`, no classes, plain attributes and transforms | `react-native-svg` (`SvgXml` or the transformer) and anywhere a still frame is needed |
| `*.png` | Transparent raster of the hero frame | Lists, notifications, fallbacks |
| `*.motion.json` | Every keyframe track exported from Chrome: target id, duration, delay, iterations, easing, offsets, transform, opacity and dash values | Rebuilding the motion in **Reanimated** on the baked SVG (ids match) |

`react-native-svg` ignores CSS animations, so in the native app either:
1. Render the baked `*-static.svg` and animate the listed ids with Reanimated using `*.motion.json` (recommended for Captain Jetty, the spinner, the progress ring, the download meter, the flame and pull-to-refresh), or
2. Show the animated SVG in a transparent `react-native-webview` (fine for one-shot full-screen celebrations: fx06–fx09).

Lottie JSON is **not** included (see Compromises).

```tsx
// 1) static + Reanimated (example: spinner arc rotation from fx/json/fx11-loading-spinner.motion.json)
import Svg, { G, Circle } from "react-native-svg";
import Animated, { useSharedValue, useAnimatedProps, withRepeat, withTiming, Easing } from "react-native-reanimated";
const AG = Animated.createAnimatedComponent(G);
const r = useSharedValue(0);
useEffect(() => { r.value = withRepeat(withTiming(360, { duration: 1200, easing: Easing.linear }), -1); }, []);
const arcProps = useAnimatedProps(() => ({ transform: [{ rotate: `${r.value}deg` }] }));   // origin: see transform_origin in the JSON
// <AG animatedProps={arcProps} originX={300} originY={300}>…arc paths copied from fx11-loading-spinner-static.svg…</AG>

// 2) static only (any baked file)
import { SvgXml } from "react-native-svg";
<SvgXml xml={emptyOfflineXml} width="100%" height={240} accessibilityLabel="No internet" />

// 3) one-shot celebration in a WebView overlay
<WebView source={{ html: `<body style="margin:0;background:transparent">${confettiSvg}</body>` }} style={{ position:"absolute", inset:0, backgroundColor:"transparent" }} pointerEvents="none" />
```

```tsx
// Sounds: expo-audio + expo-haptics, the cue values come from fx/src/cues.json
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
const tap = useAudioPlayer(require("../assets/sfx/ui-tap.ogg"));   // .ogg on Android, .wav or .mp3 on iOS (see below)
function onPress() { tap.volume = 0.6; tap.seekTo(0); tap.play(); Haptics.selectionAsync(); }
```

**Audio format guidance:**
- iOS can't play `.ogg`. Bundle `.wav` (best for sounds under 0.5 s) or `.mp3` for iOS, and `.ogg` for Android and web. Pick the file with `Platform.select`.
- MP3 encoders add about 25 ms of silence at the start. Use the wav or ogg file for taps, PIN digits and ticks.
- Respect a "Sounds" toggle in settings and the OS silent switch. The default for `setAudioModeAsync` is `playsInSilentMode: false`.


## Where each asset lands (BUILD_PLAN milestones)

| Milestone | Assets |
|---|---|
| M0 Repo scaffold, CI, design import | Merge this pack; `assets/logo/*`; `assets/app-icon/*` into `app.json`; ICONS.md set up (`lucide-react-native`) |
| M1 Auth, roles, kid login | `tinkerpod-logo-intro`; `ui-tap`, `ui-toggle`, `ui-back`, `ui-sheet-open/close`, `ui-error`, `ui-success-small`, `ui-notification`; `ui-pin-digit/-wrong/-unlock` (kid PIN); fx11 spinner, fx13 skeleton, fx12 pull-to-refresh; `empty-error`, `empty-offline` |
| M2 Content, learning, quizzes, progress | fx06 confetti, fx07 star burst, fx14 progress ring; `pip-thinking`, `pip-surprised`; `empty-no-lessons`, `empty-search-no-results`; `talk-01-welcome` (welcome back on kid home), `talk-03-help` (hint offer) |
| M3 Gamification ledger | fx08 badge + `ui-badge-earned`; fx10 streak flame (after design fx05); `pip-sleepy` / `pip-sleepy-wake` (streak), `pip-celebrate`; `talk-02-streak` (streak continue) |
| M4 Content-pack engine, downloader, player | fx15 download meter + `ui-download-complete`; `empty-no-packs`; `empty-offline` (offline packs) |
| M5 Parent mode and billing | `ui-pin-*` (parent gate), `ui-purchase-complete`; `empty-no-kids`; fx14 on the parent dashboard |
| M7 Live classes and project review | `ui-message-pop` (mentor messages) |
| M8 League pilot with Reverb | `ui-countdown-tick/-go`, `ui-match-whistle`, `ui-match-win`, `ui-match-lose`; fx09 trophy; `empty-no-tournaments`; `pip-celebrate` |

## Files

### `assets/logo/`: logo (vectors traced from the approved logo, colours kept from it)

| File | Purpose | Used in |
|---|---|---|
| `tinkerpod-logo.svg` | Lockup: mark + wordmark, full colour (viewBox 1521×398) | Splash, onboarding 08, web header, admin login |
| `tinkerpod-logo-white.svg` | Lockup, reversed white for navy or teal backgrounds | Admin sidebar (navy), marketing |
| `tinkerpod-logo-ink.svg` | Lockup, one colour ink | Print, receipts, emails in one colour |
| `tinkerpod-wordmark{,-white,-ink}.svg` | Wordmark only (viewBox 494 137 1027 190) | Headers where the mark is shown separately |
| `tinkerpod-mark{,-white,-ink}.svg` | Icon mark only (482×398) | Avatars, loading screen, app tab bar header |
| `tinkerpod-logo-intro.svg` | Animated intro, 1.5 s, plays once: parts pop in, then the antenna and wordmark | App launch after the splash, web hero |
| `json/tinkerpod-logo-intro.motion.json` | Reanimated spec for the intro | Native intro |
| `src/*.py, *.json` | Trace and build scripts plus traced geometry (python3 src/build_logo.py) | Maintenance |

### `assets/app-icon/`: Expo icons (`app.json`)

| File | Size | `app.json` key |
|---|---|---|
| `icon.png` | 1024², opaque RGB | `expo.icon`, `ios.icon` |
| `adaptive-icon-foreground.png` | 1024², transparent, mark inside the 66% safe zone | `android.adaptiveIcon.foregroundImage` |
| `adaptive-icon-background.png` | 1024², soft teal radial | `android.adaptiveIcon.backgroundImage` (or `backgroundColor: "#E6F9F7"`) |
| `adaptive-icon-monochrome.png` | 1024², single-colour mark | `android.adaptiveIcon.monochromeImage` (Android 13 themed icons) |
| `splash-icon.png` | 1024², transparent | `expo-splash-screen` plugin `image`, `backgroundColor: "#F8FAFC"`, `imageWidth: 200` |
| `favicon.png / favicon.ico` | 48² png; ico has 16, 32 and 48 | `web.favicon` |
| `notification-icon.png` | 96², white silhouette on transparent | `expo-notifications` plugin `icon`, `color: "#007A70"` |
| `src/*.svg, build_icons.py` | Source vectors for every PNG | Regenerate with `python3 src/build_icons.py` |

```json
"icon": "./assets/app-icon/icon.png",
"android": { "adaptiveIcon": { "foregroundImage": "./assets/app-icon/adaptive-icon-foreground.png", "backgroundImage": "./assets/app-icon/adaptive-icon-background.png", "monochromeImage": "./assets/app-icon/adaptive-icon-monochrome.png" } },
"web": { "favicon": "./assets/app-icon/favicon.png" },
"plugins": [["expo-splash-screen", { "image": "./assets/app-icon/splash-icon.png", "imageWidth": 200, "backgroundColor": "#F8FAFC" }],
            ["expo-notifications", { "icon": "./assets/app-icon/notification-icon.png", "color": "#007A70" }]]
```

### `fx/svg/`, `fx/static/`, `fx/json/`: FX (600×600 artboard)

Use the `T` and event times in `fx/src/cues.json` to sync sounds and haptics: `sound`, `sound_at` (seconds after start), `haptic` and `loop`.

| File | Length | Purpose | Screen | Sound | Haptic |
|---|---|---|---|---|---|
| `fx06-confetti-burst.svg` (91.9 KB) | 2.6 s | Full-screen celebration overlay: lesson complete, mission done | 03 lesson end, 01 mission done, 15 match results | ui-success-small @ 0.02 s | `Haptics.notificationAsync(NotificationFeedbackType.Success)` |
| `fx07-star-burst.svg` (17.3 KB) | 1.8 s | Star earned / perfect answer | 04 quiz (all correct), 03 lesson stars | ui-success-small @ 0.04 s | `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` |
| `fx08-badge-reveal.svg` (10.8 KB) | 3.2 s | New badge unlocked. Swap the `</>` glyph and the ribbon text for each badge | 07 profile badges, post-lesson reward | ui-badge-earned @ 0.02 s | `Haptics.notificationAsync(NotificationFeedbackType.Success)` |
| `fx09-trophy-reveal.svg` (50.6 KB) | 3.4 s | League / cup won | 15 match results, 06 league table, 17 champions league | ui-match-win @ 0.36 s | `Haptics.notificationAsync(NotificationFeedbackType.Success)` |
| `fx10-streak-flame-idle.svg` (6.3 KB) | 1.8 s loop | Streak flame idle loop (after fx05 ignites it) | 01 kid home streak chip, 07 profile | none | `none` |
| `fx11-loading-spinner.svg` (3.6 KB) | 1.2 s loop | Brand loading spinner for anything larger than 32 px | All screens; 14 match live "testing code" | none | `none` |
| `fx12-pull-to-refresh.svg` (5.2 KB) | 2.6 s | Pull-to-refresh indicator: 0–0.8 s follows the finger, then spinner and check | 01, 06, 12, 09 lists | ui-tap @ 0.8 s | `Haptics.impactAsync(ImpactFeedbackStyle.Light) on release` |
| `fx13-skeleton-shimmer.svg` (2.4 KB) | 1.4 s loop | Loading placeholder for card lists | 05 pack store, 12 hub, 09 dashboard | none | `none` |
| `fx14-progress-ring.svg` (8.7 KB) | 2.8 s | Daily goal ring; drive `strokeDashoffset` from real progress | 01 kid home, 09 parent dashboard | ui-success-small @ 1.6 s | `Haptics.selectionAsync() at done` |
| `fx15-download-meter.svg` (17.3 KB) | 3.6 s | Offline pack download card: drive the bar width and the MB label from real progress | 05 pack store, 19 adventure detail | ui-download-complete @ 2.4 s | `Haptics.notificationAsync(NotificationFeedbackType.Success) at done` |

Each FX also has `fx/static/<name>-static.svg` (baked hero frame), `fx/static/<name>.png` and `fx/json/<name>.motion.json`.

Notes:
- The text in fx08, fx09, fx12, fx14 and fx15 is sample copy in Nunito (badge name, league, pack, MB, %). In the app, draw that text as native `Text` over the art, or change the `<text>` nodes in the static SVG.
- For fx12 (pull-to-refresh), map the pull distance to time 0–0.8 s, then play the rest.
- For fx14 and fx15, drive the value from real progress; the files animate to 75% and 48 MB as a demo.

### `motion/`: Captain Jetty (pip rig)

| File | Length | Purpose | Screen |
|---|---|---|---|
| `svg/pip-thinking.svg` **(new)** | 3.6 s loop | Thinking | Hint loading, "let me think", quiz waiting (04, 14) |
| `svg/pip-sleepy.svg` **(new)** | 5.2 s loop | Sleepy, then wakes up to cheer you on | Streak paused or inactive: dozes, wakes, grins and waves to cheer the kid on (never shaming) (01, 07) |
| `svg/pip-surprised.svg` **(new)** | 2.0 s loop | Surprised | New item, unexpected result, "whoa!" moments (05, 10, 18) |
| `svg/pip-celebrate.svg` **(new)** | 3.0 s loop | Celebrate (victory dance) | Victory dance: match won, world cleared (15, 02, 17) |
| `svg/pip-idle.svg` | 3.2 s loop | Idle: approved mood, a copy re-titled "Captain Jetty" (unchanged art) | as in design/motion |
| `svg/pip-wave.svg` | 2.8 s loop | Wave hello: approved mood, a copy re-titled "Captain Jetty" (unchanged art) | as in design/motion |
| `svg/pip-happy.svg` | 2.6 s loop | Happy smile: approved mood, a copy re-titled "Captain Jetty" (unchanged art) | as in design/motion |
| `svg/pip-sad.svg` | 4.4 s loop | Sad (streak broken): approved mood, a copy re-titled "Captain Jetty" (unchanged art) | as in design/motion |
| `svg/pip-laugh.svg` | 1.4 s loop | Laugh: approved mood, a copy re-titled "Captain Jetty" (unchanged art) | as in design/motion |
| `svg/pip-clap.svg` | 1.8 s loop | Clap: approved mood, a copy re-titled "Captain Jetty" (unchanged art) | as in design/motion |
| `svg/pip-cheer.svg` | 3.2 s loop | Cheer + confetti: approved mood, a copy re-titled "Captain Jetty" (unchanged art) | as in design/motion |
| `moods.json` | | Durations and titles of all 11 moods (design/motion/moods.json plus 4 new) | |
| `json/pip-{thinking,sleepy,surprised,celebrate}.motion.json` | | Reanimated specs (ids match the baked statics) | Native |
| `src/pip_moods.py`, `src/pip_statics.py` | | Build scripts (they import design/motion/src/pip.py unchanged) | |

### `talk/`: Captain Jetty talking (voice + lip-sync sample)

There are three founder-approved lines. Each one ends with a gesture:
- `talk-01-welcome` ends with a happy hop.
- `talk-02-streak` ends with a fist pump.
- `talk-03-help` ends with a wave and a head tilt.

Each line ships as:
- `audio/*.wav|mp3|ogg`: the main voice is en-NG-AbeoNeural (pitch +16 Hz); the alternative is en-NG-EzinneNeural (`*-ezinne.*`). All are −16 LUFS.
- `cues/*.mouth.json`: mouth shape by playback time, word times, gesture start and loudness envelope, for Reanimated.
- `svg/*.svg`: the animated performance (CSS keyframes, same rig, no filters).

Also in the folder:
- `index.html`: the audio clock drives the SVG.
- `preview/captain-jetty-talk-preview.mp4` and `preview/talk-contact-sheet.png`.

See [talk/README.md](talk/README.md) for the expo-audio and Reanimated wiring, and for how the same cue format works for live server speech.

### `assets/pip/`: Captain Jetty statics (same convention as design/assets/pip)

| Pattern | What it is |
|---|---|
| `pip-<mood>.svg` | Animated master, paused on the hero frame (full 540 box) |
| `pip-<mood>-t.svg` | The same, with a tight viewBox |
| `pip-<mood>-static.svg` | **Baked**, CSS-free, tight viewBox: use with react-native-svg |
| `pip-<mood>.png` | 512 px wide, transparent |

Moods: `thinking`, `sleepy` (eyes closed), `sleepy-wake` (awake and waving: use this for "come back, you can do it!"), `surprised`, `celebrate`.

### `assets/empty/`: empty states (600×480, text-free)

The title, body and button are native text so they can be translated. Suggested copy is in the table. Keep the tone kind: never blame the child.

| File | Captain Jetty | Purpose | Screen | Suggested copy |
|---|---|---|---|---|
| `empty-no-lessons.svg` | wave | Journey or world has no lessons yet | 02 journey map, 03 | "Lessons are on the way!": "Captain Jetty is building this world. Check back soon." |
| `empty-offline.svg` | thinking | No internet; offline packs still work | Any screen, global offline state | "You're offline": "Your downloaded packs still work. [Try again]" |
| `empty-error.svg` | surprised | Something went wrong: retry | Any failed load | "Oops, a gear popped out!": "That's on us, not you. [Try again]" |
| `empty-no-packs.svg` | idle | No packs downloaded for offline use | 05 pack store, "Downloaded" tab | "No packs yet": "Download a pack to play without internet. [Browse packs]" |
| `empty-no-tournaments.svg` | happy | No tournaments or leagues yet | 12 tournaments hub, 16 fixtures | "No tournaments yet": "The next league opens soon. We'll tell you!" |
| `empty-search-no-results.svg` | thinking | Search found nothing | Search in 05, 02, admin lists | "No matches": "Try another word or check the spelling." |
| `empty-no-kids.svg` | wave | Parent has not added a child yet: "Add child" CTA | 09 parent dashboard, after 08 onboarding | "Add your first child": "Set up a profile to start their coding journey. [Add child]" |

Each one also has `static/empty-<name>-static.svg` (baked), `static/empty-<name>.png` (720 px) and `json/empty-<name>.motion.json`. Each SVG embeds the matching Captain Jetty mood rig.

### `fx/audio/`: 20 UI sounds (`ui-*.wav` 48 kHz 24-bit, `.mp3` 128k, `.ogg` q5)

All are mastered like the existing FX: −16 LUFS integrated, true peak ≤ −1.5 dBTP (`fx/audio/ui-master-report.json`). Kid-friendly and short. `ui-error` and `ui-pin-wrong` are soft and low, and `ui-match-lose` resolves up into a hopeful major chord.

| Sound | Length | Use | Haptic (expo-haptics) | Volume |
|---|---|---|---|---|
| `ui-tap` | 0.12 s | Any button / card tap | `Haptics.selectionAsync()` | 0.6 |
| `ui-toggle` | 0.16 s | Switches, checkboxes, segmented controls | `Haptics.impactAsync(ImpactFeedbackStyle.Light)` | 0.6 |
| `ui-back` | 0.22 s | Back / navigate up, tab change | `Haptics.selectionAsync()` | 0.5 |
| `ui-sheet-open` | 0.32 s | Bottom sheet / modal opens | `Haptics.impactAsync(ImpactFeedbackStyle.Soft)` | 0.6 |
| `ui-sheet-close` | 0.28 s | Bottom sheet / modal closes | `Haptics.impactAsync(ImpactFeedbackStyle.Soft)` | 0.5 |
| `ui-error` | 0.42 s | Gentle "not quite" for form errors / failed actions (never shaming) | `Haptics.notificationAsync(NotificationFeedbackType.Warning)` | 0.7 |
| `ui-success-small` | 0.55 s | Small success: saved, step done | `Haptics.notificationAsync(NotificationFeedbackType.Success)` | 0.8 |
| `ui-notification` | 0.8 s | In-app notification / toast | `Haptics.notificationAsync(NotificationFeedbackType.Success)` | 0.8 |
| `ui-message-pop` | 0.26 s | New chat / mentor message bubble | `Haptics.impactAsync(ImpactFeedbackStyle.Light)` | 0.7 |
| `ui-pin-digit` | 0.1 s | Each PIN pad digit (kid login, parent gate) | `Haptics.selectionAsync()` | 0.6 |
| `ui-pin-wrong` | 0.4 s | Wrong PIN (soft, with shake animation) | `Haptics.notificationAsync(NotificationFeedbackType.Warning)` | 0.7 |
| `ui-pin-unlock` | 0.7 s | Correct PIN / parent gate opened | `Haptics.notificationAsync(NotificationFeedbackType.Success)` | 0.8 |
| `ui-countdown-tick` | 0.22 s | Match countdown 3-2-1 | `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` | 0.8 |
| `ui-countdown-go` | 0.7 s | Countdown "Go!" | `Haptics.impactAsync(ImpactFeedbackStyle.Heavy)` | 0.9 |
| `ui-match-whistle` | 0.8 s | League match start | `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` | 0.8 |
| `ui-match-win` | 2.3 s | League match won (fanfare) | `Haptics.notificationAsync(NotificationFeedbackType.Success)` | 1.0 |
| `ui-match-lose` | 1.5 s | League match lost: encouraging "next time" motif | `Haptics.impactAsync(ImpactFeedbackStyle.Soft)` | 0.9 |
| `ui-badge-earned` | 1.4 s | Badge unlocked (pairs with fx08-badge-reveal) | `Haptics.notificationAsync(NotificationFeedbackType.Success)` | 1.0 |
| `ui-purchase-complete` | 1.1 s | Parent purchase / subscription confirmed | `Haptics.notificationAsync(NotificationFeedbackType.Success)` | 0.9 |
| `ui-download-complete` | 0.95 s | Content pack download finished (pairs with fx15) | `Haptics.notificationAsync(NotificationFeedbackType.Success)` | 0.8 |

### `fx/src/`
- `cues.json`: the cue sheet. It contains `design/fx/src/cues.json` (fx01–05, unchanged) plus `ui-*` entries (`kind: "ui-sound"`, files, haptic, volume, purpose) and fx06–15 entries (`kind: "fx"`, T, event times, sound, sound_at, haptic, loop). **Replace** design's cues.json with this one when you merge.
- `ui_synth.py`: synthesises and masters the 20 UI sounds. It reuses `design/fx/src/synth.py`.
- `build_fx2.py`: builds fx06–15. It reuses `design/fx/src/fxlib.py`.

### `tools/`
Chrome (playwright) render and bake helpers: `render.py`, `sheet.py` (frame strips), `bake.py` (CSS → static SVG + motion JSON), `statics.py`, `build_statics.py`, `record_preview.py` (MP4), `build_index.py`, `contact_sheets.py`, `build_readme.py`, `build_manifest.py`.

### `preview/`
`index.html` · `contact-sheet-01…07-*.png` · `tinkerpod-design-pack-preview.mp4` (720², about 100 s, with sound).

## Rebuild order
```
python3 assets/logo/src/build_logo.py && python3 assets/app-icon/src/build_icons.py
python3 fx/src/ui_synth.py && python3 fx/src/build_fx2.py
python3 motion/src/pip_moods.py && python3 motion/src/pip_statics.py
python3 assets/empty/src/build_empty.py && python3 tools/build_statics.py
python3 tools/build_index.py && python3 tools/contact_sheets.py && python3 tools/record_preview.py
cd talk/src && python3 build_talk.py && python3 build_talk_index.py && python3 record_talk.py && cd ../..   # re-voice first with python3 tts.py (needs internet); raw TTS is in talk/src/raw
python3 tools/build_readme.py && python3 tools/build_manifest.py
```
Requirements: python3, numpy, scipy, soundfile, pyloudnorm, lxml, Pillow, playwright with Chrome, ffmpeg, and edge-tts (for `talk/` only). The build scripts expect `design/` next to `design-pack/`.

## Compromises and known limits
- **No Lottie.** The animation is CSS keyframes plus an exported motion JSON and baked statics. Native playback needs Reanimated wiring (or a WebView). A Lottie export would need After Effects or a converter that doesn't handle CSS keyframes reliably.
- **Logo colours** are sampled from the approved logo PNG, not snapped to the tokens. The logo is a traced vector of that artwork, so curves are very close to the PNG but not identical.
- **Loudness on very short sounds:** sounds under 400 ms are measured padded with silence to 400 ms (the BS.1770 gate needs 400 ms). `ui-back` reads −16.35 LUFS because the limiter caps it.
- **MP3 encoder delay:** about 25 ms of silence at the start; use wav or ogg for short sounds.
- **Original moods** in `motion/svg` are re-titled copies, so their user-visible label says Captain Jetty. The art is unchanged. `pip-sad` (approved) is still in the set; prefer `pip-sleepy-wake` for streak-broken moments so kids are never shamed.
- Sample text inside FX (badge and league names, MB values) is placeholder; draw real text natively.
- **Talk sample:** the voices come from edge-tts (Microsoft's online neural TTS). Check the licence before production, or move to Azure Speech. Lip-sync uses a lexicon plus word timing, not a forced aligner. See talk/README.md.
- `design/html/13-cohort-lobby.html` says "Pip bot". Show "Captain Jetty bot" in the app.
