"""TinkerPod UI sound set (20 short cues). Same engine, reverb and mastering chain as synth.py (the FX01–05 score),
so these sit at the same loudness: −16 LUFS integrated, true peak ≤ −1.5 dBTP.
Cues shorter than the 400 ms EBU R128 gating block are measured padded with silence to 400 ms (documented in README).
Run:  python3 ui_synth.py   → ../audio/ui-*.{wav,mp3,ogg}, ui-master-report.json, merges entries into cues.json"""
import json, os, sys, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
HERE = os.path.dirname(os.path.abspath(__file__))
for p in (HERE, os.path.join(HERE, '..', '..', '..', 'design', 'fx', 'src')):   # merged layout, or alongside design/
    if os.path.exists(os.path.join(p, 'synth.py')): sys.path.insert(0, p); break
import synth as S
from synth import SR, NOTE, Mix, tt, env, lp, hp, bp, bell, marimba, pluck, coin, glide, pop, noise, svf_sweep, whoosh, sparkle, riser, brass, thump, knock, pad, reverb
OUT = os.path.join(HERE, '..', 'audio')
rng = np.random.default_rng(11)

def soft_tri(f, d, dec=.12, vib=0, trem=0):
    t = tt(d); ff = f * (1 + .01 * vib * np.sin(2 * np.pi * 6 * t))
    y = 2 / np.pi * np.arcsin(np.sin(2 * np.pi * np.cumsum(ff) / SR)) * env(d, .008, dec, .02)
    if trem: y *= 1 - trem * (.5 + .5 * np.sin(2 * np.pi * 18 * t))
    return lp(y, 1500, 4)

def whistle(d=.6):
    """referee-style pea whistle, softened: 2.3 kHz tone with a 28 Hz pea flutter and a breath of noise"""
    t = tt(d); flutter = 1 + .035 * np.sin(2 * np.pi * 28 * t)
    tone = np.sin(2 * np.pi * np.cumsum(2300 * flutter) / SR) * (.75 + .25 * np.sin(2 * np.pi * 28 * t))
    breath = bp(noise(d), 1800, 3200) * .12
    e = np.minimum(1, t / .025) * np.minimum(1, (d - t) / .06); return lp((tone + breath) * e, 6000)

# ── scores: name → (T seconds, builder, haptic, suggested volume, purpose) ──
def tap():          m = Mix(.12); m.add(0, pop(620, 980, .05), .8); m.add(.004, marimba(NOTE(93), .08), .25); return m
def toggle():       m = Mix(.16); m.add(0, knock(1500) * .5, .5); m.add(.03, pop(500, 1150, .07), .7); return m
def back():         m = Mix(.22); m.add(0, whoosh(.16, 3200, 900, 1.3), .55); m.add(.03, pop(760, 430, .08), .55); return m
def sheet_open():   m = Mix(.32); m.add(0, whoosh(.24, 600, 3400, 1.4), .6); m.add(.17, pop(420, 900, .07), .45); return m
def sheet_close():  m = Mix(.28); m.add(0, whoosh(.2, 3000, 650, 1.4), .6); m.add(.15, thump(.12), .35); m.add(.15, knock(700) * .4, .3); return m
def error():        # gentle "hmm-mm": two soft rounded tones stepping down a tone, no buzz, no harsh partials
    m = Mix(.42); m.add(0, soft_tri(NOTE(67), .16, .1), .8); m.add(.15, soft_tri(NOTE(65), .26, .14, vib=1), .8); return m
def success_small():
    m = Mix(.55); m.add(0, marimba(NOTE(88), .4), .6); m.add(.08, marimba(NOTE(91), .5), .65); m.add(.08, bell(NOTE(103), .4, .1, .3), .1); return m
def notification():
    m = Mix(.8); m.add(0, bell(NOTE(84), .7, .22, .5), .5); m.add(.14, bell(NOTE(91), .7, .25, .5), .5); return m
def message_pop():
    m = Mix(.26); m.add(0, pop(380, 1150, .09), .85); m.add(.05, marimba(NOTE(96), .18), .22); return m
def pin_digit():    m = Mix(.1); m.add(0, marimba(NOTE(96), .08), .55); m.add(0, knock(1800) * .3, .25); return m
def pin_wrong():    # soft double "nuh-uh", quick and quiet in character, never a buzzer
    m = Mix(.4); m.add(0, soft_tri(NOTE(64), .12, .07), .75); m.add(.14, soft_tri(NOTE(60), .2, .1), .75); m.add(0, knock(420) * .4, .25); return m
def pin_unlock():
    m = Mix(.7); m.add(0, knock(900) * .6, .45); m.add(.02, pop(400, 1000, .08), .5)
    for k, n in enumerate([84, 88, 91, 96]): m.add(.08 + .05 * k, pluck(NOTE(n), .5), .3)
    m.add(.28, bell(NOTE(100), .4, .12, .4), .18); return m
def countdown_tick(): m = Mix(.22); m.add(0, marimba(NOTE(81), .2), .7); m.add(0, knock(1300) * .4, .25); return m
def countdown_go():
    m = Mix(.7); m.add(0, pop(500, 1200, .08), .6)
    for n in (84, 88, 91): m.add(.01, bell(NOTE(n), .65, .2, .6), .3)
    m.add(.03, sparkle(.25, 5, 96, 106, 6), .25); return m
def match_whistle():
    m = Mix(.8); m.add(0, whistle(.16), .55); m.add(.22, whistle(.48), .6); return m
def match_win():
    m = Mix(2.3); nt = [S.C5, S.E5, S.G5]
    for k, n in enumerate(nt): m.add(.0 + .12 * k, brass(NOTE(n), .16), .3)
    for n in nt + [84]: m.add(.36, brass(NOTE(n), 1.5, .02), .2 if n != 84 else .28)
    m.add(.36, brass(NOTE(48), 1.5, .04), .16); m.add(.36, thump(.3), .4)
    m.add(.36, sparkle(1.0, 12, 91, 106, 9), .24); m.add(1.1, bell(NOTE(96), 1.0, .35, .6), .16); return m
def match_lose():   # "good game, next time!": dips, then lifts and resolves up on a major chord (hopeful, not sad)
    m = Mix(1.5)
    for t0, n in ((0, 79), (.16, 76), (.34, 77), (.5, 79)): m.add(t0, marimba(NOTE(n), .6), .55)
    m.add(.72, marimba(NOTE(84), .9), .6); m.add(.72, pad(.75, [60, 64, 67], .1), 1); m.add(.74, bell(NOTE(96), .6, .2, .4), .12); return m
def badge_earned():
    m = Mix(1.4); m.add(0, riser(.4, 500, 1000), .3); m.add(.38, pop(420, 1050, .1), .7)
    for n in (84, 88, 91, 96): m.add(.42, bell(NOTE(n), 1.0, .3, .6), .22)
    m.add(.45, sparkle(.6, 9, 91, 106, 3), .28); m.add(.7, coin(NOTE(96)), .3); return m
def purchase_complete():
    m = Mix(1.1); m.add(0, coin(NOTE(88)), .45); m.add(.1, coin(NOTE(93)), .45)
    for k, n in enumerate([84, 88, 91, 96]): m.add(.28 + .05 * k, pluck(NOTE(n), .6), .3)
    m.add(.5, bell(NOTE(96), .6, .25, .5), .2); return m
def download_complete():
    m = Mix(.95); m.add(0, pop(380, 900, .08), .55); m.add(.06, marimba(NOTE(84), .5), .55); m.add(.18, marimba(NOTE(91), .7), .6)
    m.add(.2, bell(NOTE(103), .5, .15, .3), .12); m.add(.22, sparkle(.25, 4, 96, 106, 8), .18); return m

SOUNDS = {  # name: (builder, haptic (expo-haptics call), volume, purpose)
 'ui-tap': (tap, 'selectionAsync()', .6, 'Any button / card tap'),
 'ui-toggle': (toggle, 'impactAsync(ImpactFeedbackStyle.Light)', .6, 'Switches, checkboxes, segmented controls'),
 'ui-back': (back, 'selectionAsync()', .5, 'Back / navigate up, tab change'),
 'ui-sheet-open': (sheet_open, 'impactAsync(ImpactFeedbackStyle.Soft)', .6, 'Bottom sheet / modal opens'),
 'ui-sheet-close': (sheet_close, 'impactAsync(ImpactFeedbackStyle.Soft)', .5, 'Bottom sheet / modal closes'),
 'ui-error': (error, 'notificationAsync(NotificationFeedbackType.Warning)', .7, 'Gentle "not quite" for form errors / failed actions (never shaming)'),
 'ui-success-small': (success_small, 'notificationAsync(NotificationFeedbackType.Success)', .8, 'Small success: saved, step done'),
 'ui-notification': (notification, 'notificationAsync(NotificationFeedbackType.Success)', .8, 'In-app notification / toast'),
 'ui-message-pop': (message_pop, 'impactAsync(ImpactFeedbackStyle.Light)', .7, 'New chat / mentor message bubble'),
 'ui-pin-digit': (pin_digit, 'selectionAsync()', .6, 'Each PIN pad digit (kid login, parent gate)'),
 'ui-pin-wrong': (pin_wrong, 'notificationAsync(NotificationFeedbackType.Warning)', .7, 'Wrong PIN (soft, with shake animation)'),
 'ui-pin-unlock': (pin_unlock, 'notificationAsync(NotificationFeedbackType.Success)', .8, 'Correct PIN / parent gate opened'),
 'ui-countdown-tick': (countdown_tick, 'impactAsync(ImpactFeedbackStyle.Medium)', .8, 'Match countdown 3-2-1'),
 'ui-countdown-go': (countdown_go, 'impactAsync(ImpactFeedbackStyle.Heavy)', .9, 'Countdown "Go!"'),
 'ui-match-whistle': (match_whistle, 'impactAsync(ImpactFeedbackStyle.Medium)', .8, 'League match start'),
 'ui-match-win': (match_win, 'notificationAsync(NotificationFeedbackType.Success)', 1.0, 'League match won (fanfare)'),
 'ui-match-lose': (match_lose, 'impactAsync(ImpactFeedbackStyle.Soft)', .9, 'League match lost: encouraging "next time" motif'),
 'ui-badge-earned': (badge_earned, 'notificationAsync(NotificationFeedbackType.Success)', 1.0, 'Badge unlocked (pairs with fx08-badge-reveal)'),
 'ui-purchase-complete': (purchase_complete, 'notificationAsync(NotificationFeedbackType.Success)', .9, 'Parent purchase / subscription confirmed'),
 'ui-download-complete': (download_complete, 'notificationAsync(NotificationFeedbackType.Success)', .8, 'Content pack download finished (pairs with fx15)'),
}
UI_T = {'ui-tap': .12, 'ui-toggle': .16, 'ui-back': .22, 'ui-sheet-open': .32, 'ui-sheet-close': .28, 'ui-error': .42, 'ui-success-small': .55,
        'ui-notification': .8, 'ui-message-pop': .26, 'ui-pin-digit': .1, 'ui-pin-wrong': .4, 'ui-pin-unlock': .7, 'ui-countdown-tick': .22,
        'ui-countdown-go': .7, 'ui-match-whistle': .8, 'ui-match-win': 2.3, 'ui-match-lose': 1.5, 'ui-badge-earned': 1.4,
        'ui-purchase-complete': 1.1, 'ui-download-complete': .95}
GATE = .4
def loud(meter, y):
    if len(y) < GATE * SR: y = np.concatenate([y, np.zeros(int(GATE * SR) - len(y) + 1)])
    return meter.integrated_loudness(y)
def master_ui(y, T, target=-16.0):
    y = reverb(lp(hp(y, 120), 14000), .10, .4); n = int(T * SR); y = y[:n].copy()
    f = int(min(.02, T / 6) * SR); y[-f:] *= np.linspace(1, 0, f)
    meter = pyln.Meter(SR)
    for _ in range(10):
        y *= 10 ** ((target - loud(meter, y)) / 20)
        if S.true_peak(y) <= -1.5: break
        y = S.limit(y, -1.8)
    return y, loud(meter, y), S.true_peak(y)

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True); report = {}
    cues_p = os.path.join(HERE, 'cues.json')
    if not os.path.exists(cues_p):   # merge into the existing FX cue sheet rather than replacing it
        import shutil; shutil.copy(os.path.join(os.path.dirname(S.__file__), 'cues.json'), cues_p)
    cues = json.load(open(cues_p))
    for name, (fn, hap, vol, purpose) in SOUNDS.items():
        T = UI_T[name]; y, L, tp = master_ui(fn().y, T)
        w = f'{OUT}/{name}.wav'; sf.write(w, y, SR, subtype='PCM_24')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', w, '-c:a', 'libmp3lame', '-b:a', '128k', '-ar', '44100', f'{OUT}/{name}.mp3'], check=True)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', w, '-c:a', 'libvorbis', '-q:a', '5', '-ar', '44100', f'{OUT}/{name}.ogg'], check=True)
        report[name] = dict(lufs=round(L, 2), dbtp=round(tp, 2), measured_padded_to_400ms=T < GATE); print(name, report[name])
        cues[name] = dict(T=T, kind='ui-sound', files=[f'fx/audio/{name}.{e}' for e in ('wav', 'mp3', 'ogg')],
                          haptic=f'Haptics.{hap}', volume=vol, purpose=purpose)
    json.dump(report, open(f'{OUT}/ui-master-report.json', 'w'), indent=1)
    json.dump(cues, open(cues_p, 'w'), indent=1)
