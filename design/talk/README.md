# Captain Jetty talking — voice + lip-sync sample

Three founder-approved lines. Each one ends with a gesture:

| File stem | Line | End gesture |
|---|---|---|
| `talk-01-welcome` | “Hello! Welcome back today!” | smile + small happy hop |
| `talk-02-streak` | “Hello! Let's continue your streak from yesterday!” | smile + fist pump with sparkles |
| `talk-03-help` | “Hello! Do you need my help with anything?” | friendly wave + head tilt |

**Watch it first:** open `index.html`, which plays each line with its audio and has a voice toggle. You can also play `preview/captain-jetty-talk-preview.mp4` (720×720, with sound). The frames are in `preview/talk-contact-sheet.png`.

## Files

```
talk/
  audio/  talk-0N-*.wav|mp3|ogg            main voice (Abeo)
          talk-0N-*-ezinne.wav|mp3|ogg     alternative voice (Ezinne)
  cues/   talk-0N-*.mouth.json             timing for Reanimated (one per line and voice)
  svg/    talk-0N-*.svg                    animated SVG of the same performance (CSS keyframes, no filters)
  index.html                               browser preview; the audio clock drives the SVG
  preview/captain-jetty-talk-preview.mp4, talk-contact-sheet.png
  talk-index.json                          list of lines, voices, durations and loudness
  src/    tts.py (edge-tts) · voice.py (polish/master) · build_talk.py (cues + SVG) · build_talk_index.py · record_talk.py
          raw/  untouched TTS mp3 + word-boundary JSON, so a rebuild works offline
```

## Rebuild

```
cd talk/src
python3 tts.py            # optional: re-voice (needs internet); edit LINES / VOICES at the top
python3 build_talk.py     # audio polish + master, cues, SVGs, talk-index.json
python3 build_talk_index.py && python3 record_talk.py
```
The build needs `design/` next to `design-pack/`, because it imports the rig and the synth.

## Voice

- **Main voice: `en-NG-AbeoNeural`**, generated with edge-tts using `pitch=+16Hz, rate=+5%`. Abeo's natural pitch is about 114 Hz, which sounds like a grown man. The +16 Hz lift (about 2 semitones) makes him a younger, friendlier robot buddy without sounding like a chipmunk.
- **Alternative voice: `en-NG-EzinneNeural`**, generated with `pitch=+4Hz, rate=+5%` (natural pitch about 192 Hz). Every line ships in both voices (`*-ezinne.*`), and the cue JSON and SVG for each voice have their own timing.
- **Light processing** (`src/voice.py`):
  - 90 Hz high-pass
  - about +2.5 dB presence shelf above 3.2 kHz
  - a very faint 4 ms comb at 16 % mix, which adds a hint of "robot" while the words stay clear
- **Mastering:** trailing silence trimmed to 120 ms. Each file is mastered to **−16 LUFS integrated, ≤ −1.5 dBTP**, the same as the UI sounds.
- **Formats:**
  - wav: 48 kHz, 24-bit mono
  - mp3: 128 kbps, 44.1 kHz
  - ogg: Vorbis q5
- **Platform note:** use the mp3 on iOS, because iOS will not play ogg. Android and web can use either.

## Mouth shapes

These are the groups inside `#mouth` in every talk SVG. In React Native, build them as `<G>`s at the same coordinates.

| shape | SVG group | used for |
|---|---|---|
| `rest` | `m-rest` | silence: closed soft smile |
| `mbp` | `m-mbp` | M B P: lips pressed |
| `small` | `m-small` | most consonants, schwa, short I |
| `wide` | `m-wide` | A / AH / AY: wide open with teeth |
| `round` | `m-round` | O / U / W |
| `e` | `m-e` | E / EE / AY-end: wide smile |
| `fv` | `m-fv` | F V: top teeth on lip |
| `grin` | `mouth-grin` | end gesture (the rig's existing grin) |

Exactly one shape is visible at a time. The rig's resting `mouth-smile` stays hidden while a line plays.

## Cue JSON (`cues/*.mouth.json`)

```jsonc
{
  "line": "talk-01-welcome", "text": "Hello! Welcome back today!", "voice": "en-NG-AbeoNeural", "voice_role": "main",
  "audio": ["talk/audio/talk-01-welcome.wav", "talk/audio/talk-01-welcome.mp3", "talk/audio/talk-01-welcome.ogg"], "audio_duration": 2.539,
  "timeline_duration": 4.481,            // audio + gesture tail
  "t0": "audio start",                   // t = 0 is the first sample of the audio file
  "mouth": [{"t": 0, "shape": "rest"}, {"t": 0.134, "shape": "small"}, …, {"t": 2.481, "shape": "grin"}],
  "words": [{"word": "Hello", "start": 0.174, "end": 0.507}, …],
  "speech_end": 2.361,
  "gesture": {"name": "happy", "label": "smile (happy hop)", "start": 2.481, "duration": 1.9, "mood_reference": "pip-happy"},
  "blinks": [0.9, 2.149],
  "envelope": {"fps": 50, "values": [0–1 …]},   // loudness, for the antenna glow, LEDs and mouth scale
  "shapes": {"rest": {"svg_group": "m-rest", "desc": "…"}, …}
}
```

How the cues are made:
1. Look up each word in a small ARPAbet lexicon. Words that are not in the lexicon fall back to rough letter rules.
2. Split each word's time across its phones, weighted (vowels long, consonants short).
3. Map each phone to a mouth shape.
4. Downgrade `wide` and `e` to `small` when the audio is quiet.
5. Insert `rest` when a gap between words is longer than 90 ms.
6. Merge flickers under 45 ms. Lip closures (`mbp`, `fv`) are never merged away.
7. Shift every cue **40 ms ahead** of the sound, because mouths read better slightly early.

The word times come from the TTS word boundaries, auto-aligned to the decoded audio. edge-tts reports words 65–90 ms early, and `align_offset` corrects for that.

## Playing it in the app (Expo + Reanimated)

```tsx
import { useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import Animated, { useSharedValue, useFrameCallback, useAnimatedProps, withTiming } from 'react-native-reanimated';
import cue from '@/assets/talk/talk-01-welcome.mouth.json';

const SHAPES = ['rest','mbp','small','wide','round','e','fv','grin'] as const;
const shapeIndexAt = (t: number) => {            // worklet-friendly binary search over cue.mouth
  'worklet'; let lo = 0, hi = cue.mouth.length - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (cue.mouth[m].t <= t) lo = m; else hi = m - 1; }
  return SHAPES.indexOf(cue.mouth[lo].shape as any);
};

export function JettyTalk() {
  const player = useAudioPlayer(require('@/assets/talk/talk-01-welcome.mp3'));
  const status = useAudioPlayerStatus(player);
  const t = useSharedValue(0);                    // seconds since the audio started
  const anchor = useSharedValue({ audio: 0, wall: 0 });

  // The audio clock is the truth: re-anchor whenever expo-audio reports a position…
  useEffect(() => { anchor.value = { audio: status.currentTime, wall: performance.now() }; }, [status.currentTime]);
  // …and interpolate between reports on the UI thread, so the mouth moves at 60 fps.
  // This keeps running after the audio ends, so the gesture finishes.
  useFrameCallback(() => {
    if (!status.playing && !status.didJustFinish && t.value === 0) return;
    t.value = Math.min(cue.timeline_duration, anchor.value.audio + (performance.now() - anchor.value.wall) / 1000);
  });

  // SHAPES is a fixed list, so this creates the same 8 hooks in the same order on every render.
  const mouthProps = SHAPES.map((_, i) => useAnimatedProps(() => ({ opacity: shapeIndexAt(t.value) === i ? 1 : 0 })));
  // Gesture: when t passes cue.gesture.start, play the matching pip-* mood timeline from motion/json
  // (pip-happy for the hop, the cheer arm keyframes in svg/talk-02-streak.svg, the wave in talk-03).
  // Antenna glow / LEDs: sample cue.envelope.values[Math.floor(t * 50)].
  return /* <Svg> rig … <AnimatedG animatedProps={mouthProps[i]}> for each m-* group … */ null;
}
// start: player.seekTo(0); player.play();
```

Tips:
- Set `useAudioPlayerStatus(player, { updateInterval: 50 })` (or close to it) so the clock re-anchors often.
- Preload the mp3 on the screen before it plays, so there is no start delay.
- Mouth switches are hard cuts, matching the SVG's `steps(1,end)` timing. This is normal in 2D lip-sync. Do not cross-fade the shapes.
- Mouth scale: multiply `#mouth` scale by `1 + 0.08 * envelope` for a little extra life. The SVG does this too.
- **Reduced motion:** keep the mouth animating, because it carries meaning. Turn off the bob, hops, arm and head motion. The SVGs already do this in their `prefers-reduced-motion` rule.
- Always show the line as text too (speech bubble or caption), for kids playing on mute and for accessibility.

## Live speech later (server-generated)

The same system works when the server generates speech on the fly:

1. **Server:** synthesise the audio. Collect **word boundaries** (edge-tts `WordBoundary`, Azure Speech `WordBoundary`, Google `timepoints`, and so on). If you use Azure Speech, collect its **viseme events** instead; they map almost one-to-one onto the shapes above.
2. **Server or client:** run the same mapper (`word_visemes` + `mouth_cues` in `src/build_talk.py`, under 100 lines and easy to port to TypeScript) to turn the boundaries into `mouth[]`. Compute the 50 fps loudness `envelope` from the audio. The letter-rule fallback covers words that are not in the lexicon, and kids' names.
3. **Send to the client:** `{audio_url, mouth[], words[], envelope, gesture}`, the same shape as these cue files. The client code above does not change.
4. To pick the gesture, the server sends a tag (`happy` / `cheer` / `wave`) chosen from the message intent.

## Compromises and notes

- **TTS provider:** edge-tts calls Microsoft's online neural voices. For production, check the licence terms, or switch to Azure Speech (same voices, paid, and it also provides official viseme events).
- **Lip-sync accuracy:** it is built from a lexicon and the TTS word timing, not from a forced aligner. It is accurate to about one frame at word starts, and approximate inside long words.
- **No eyebrows:** the rig has none, so the expression comes from the antenna wiggle, antenna glow and LEDs following the voice, blinks, head nods on stressed words, and happy eyes in the gestures.
- **Robot shimmer:** the comb effect is deliberately subtle. Set `COMB_MIX = 0` in `voice.py` for a fully clean voice.
