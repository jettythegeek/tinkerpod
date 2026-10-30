"""Original SFX for the 5 TinkerPod FX. Pure numpy/scipy synthesis (no samples).
Timing comes from cues.json (written by build_svg.py) so sound and SVG share one source."""
import json, os, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly, fftconvolve
SR = 48000; rng = np.random.default_rng(7)
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'audio')
CUES = json.load(open(os.path.join(HERE, 'cues.json')))
NOTE = lambda n: 440 * 2 ** ((n - 69) / 12)          # midi → Hz
C5, D5, E5, G5, A5 = 72, 74, 76, 79, 81
def tt(d): return np.arange(int(d * SR)) / SR
def env(d, a=.004, dec=.25, rel=.01):
    t = tt(d); e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(t - a, 0) / dec)
    r = int(rel * SR); e[-r:] *= np.linspace(1, 0, r) if r else 1; return e
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
class Mix:
    def __init__(s, T): s.y = np.zeros(int(T * SR) + SR)  # +1 s tail, trimmed later
    def add(s, t, x, g=1.0):
        i = int(round(t * SR)); x = x[:len(s.y) - i]; s.y[i:i + len(x)] += g * x
# ── primitives ──
def bell(f, d=1.2, dec=.35, bright=1.0):
    t = tt(d); y = np.zeros_like(t)
    for m, a, k in ((1, 1, 1), (2.0, .35 * bright, .6), (3.01, .18 * bright, .4), (4.17, .08 * bright, .28), (5.43, .04 * bright, .2)):
        if f * m < 16000: y += a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / (dec * k))
    return y * np.minimum(1, t / .002)
def marimba(f, d=.6):
    t = tt(d); return (np.sin(2*np.pi*f*t)*np.exp(-t/.16) + .25*np.sin(2*np.pi*f*3.93*t)*np.exp(-t/.03) + .06*np.sin(2*np.pi*f*9.2*t)*np.exp(-t/.01)) * np.minimum(1, t/.0015)
def pluck(f, d=.7):   # soft harp
    t = tt(d); y = sum((.6 ** k) * np.sin(2*np.pi*f*(k+1)*t) * np.exp(-t/(.35/(k+1))) for k in range(5)); return y * np.minimum(1, t/.002)
def coin(f, g2=1.335):
    a = bell(f, .07, .05, .6); b = bell(f * g2, .45, .12, .7)
    y = np.zeros(int(.5 * SR)); y[:len(a)] += a; i = int(.05 * SR); y[i:i + len(b)] += b[:len(y) - i]; return y
def glide(f0, f1, d, shape='sine', curve=3.0):
    t = tt(d); f = f0 * (f1 / f0) ** ((t / d) ** (1 / curve) if f1 > f0 else (t / d))
    ph = 2 * np.pi * np.cumsum(f) / SR
    if shape == 'tri': return 2 / np.pi * np.arcsin(np.sin(ph))
    return np.sin(ph)
def pop(f0=380, f1=980, d=.11):
    y = glide(f0, f1, d) * env(d, .002, .045)
    n = lp(rng.standard_normal(int(.012 * SR)), 2500) * np.exp(-tt(.012) / .003) * .25; y[:len(n)] += n; return y
def noise(d): return rng.standard_normal(int(d * SR))
def svf_sweep(x, f0, f1, q=1.2, curve=1.0):
    """Chamberlin state-variable bandpass with swept centre — the whoosh engine."""
    n = len(x); fc = f0 * (f1 / f0) ** ((np.arange(n) / n) ** curve)
    F = 2 * np.sin(np.pi * fc / SR / 2); Q = 1 / q; low = band = 0.0; out = np.empty(n)
    for i in range(n):
        low += F[i] * band; high = x[i] - low - Q * band; band += F[i] * high; out[i] = band
    return out
def whoosh(d, f0, f1, q=1.4, peak=.5):
    t = tt(d); e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5; e *= np.where(t / d < peak, 1, 1)
    return svf_sweep(noise(d), f0, f1, q) * e * .6
def sparkle(d=.5, n=7, lo=84, hi=100, seed=1):
    r = np.random.default_rng(seed); y = np.zeros(int((d + .5) * SR))
    penta = [m for m in range(lo, hi) if m % 12 in (0, 2, 4, 7, 9)]
    for k in range(n):
        g = bell(NOTE(r.choice(penta)), .4, .09, .4) * (.35 + .4 * r.random()); i = int(r.random() * d * SR); y[i:i + len(g)] += g[:len(y) - i]
    return y
def riser(d, f0, f1):
    t = tt(d); e = (t / d) ** 1.6 * np.minimum(1, (d - t) / .03)
    return (glide(f0, f1, d, curve=1) * .5 + .5 * glide(f0 * 1.5, f1 * 1.5, d, curve=1) * .5) * e * .8 + svf_sweep(noise(d), 1500, 6000, 2) * e * .25
def brass(f, d, att=.03, vib=5.2):
    t = tt(d); br = np.minimum(1, t / .08) * (.55 + .45 * np.exp(-t / .25))
    ph = 2 * np.pi * np.cumsum(f * (1 + .004 * np.sin(2 * np.pi * vib * t) * np.minimum(1, t / .3))) / SR
    y = sum((1 / k) * (br ** (k * .5)) * np.sin(k * ph) for k in range(1, 9))
    e = np.minimum(1, t / att) * np.exp(-t / 2.5); r = int(.12 * SR); e[-r:] *= np.linspace(1, 0, r)
    return lp(y * e, 5000)
def thump(d=.25):
    t = tt(d); return glide(150, 55, d) * np.exp(-t / .06) * np.minimum(1, t / .002)
def knock(f=520):
    d = .14; t = tt(d); y = (np.sin(2*np.pi*f*t)*np.exp(-t/.03) + .5*np.sin(2*np.pi*f*2.7*t)*np.exp(-t/.012))
    y += bp(noise(d), 800, 3000) * np.exp(-t / .006) * .4; return y * np.minimum(1, t / .001)
def bwomp():
    a = glide(NOTE(67), NOTE(66), .17, 'tri') * env(.17, .01, .3, .03)
    d = .55; t = tt(d); f = NOTE(63) * (1 - .06 * (t / d)) * (1 + .012 * np.sin(2 * np.pi * 7 * t))
    b = 2 / np.pi * np.arcsin(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.minimum(1, t / .015) * np.exp(-t / .4)
    r = int(.08 * SR); b[-r:] *= np.linspace(1, 0, r)
    y = np.zeros(int(.8 * SR)); y[:len(a)] += a; i = int(.19 * SR); y[i:i + len(b)] += b
    return lp(y, 1600, 4) * 1.2
def tick(f): return marimba(f, .25) * .8
def crackle(d, rate=14, g=.25, seed=3):
    r = np.random.default_rng(seed); y = np.zeros(int(d * SR))
    for _ in range(int(d * rate)):
        i = r.integers(0, len(y) - 400); c = bp(r.standard_normal(300), 1500, 6000) * np.exp(-np.arange(300) / 40); y[i:i + 300] += c * r.random() * g
    return y
def pad(d, notes, g=.12):
    t = tt(d); y = sum(np.sin(2 * np.pi * NOTE(n) * t) for n in notes) * (1 + .15 * np.sin(2 * np.pi * 3 * t))
    e = np.minimum(1, t / .3) * np.minimum(1, (d - t) / .15); return lp(y * e * g, 1800)
def reverb(x, mix=.14, d=.7):
    ir = lp(noise(d), 6000) * np.exp(-tt(d) / (d / 5)); ir /= np.sqrt(np.sum(ir ** 2))
    return x + mix * fftconvolve(x, ir)[:len(x)]
# ── per-FX scores ──
def fx01(c):
    m = Mix(c['T'])
    m.add(c['pop'], pop(420, 1050), .9); m.add(c['pop'] + .03, bell(NOTE(88), .6, .18, .5), .25)
    m.add(c['burst'] - .03, whoosh(.32, 1200, 5000, 1.6), .5); m.add(c['burst'], sparkle(.3, 6, 88, 101, 2), .45)
    scale = [G5, A5, 84, 86, 88, 91, 93, 96]
    for a, n in zip(c['coins'], scale): m.add(a - .02, coin(NOTE(n)), .42)
    m.add(c['whoosh'] - .05, whoosh(.36, 900, 3500, 1.4), .45)
    f0, f1 = c['fill']; m.add(f0, riser(f1 - f0, 520, 1040), .35)
    m.add(c['sparkle'], bell(NOTE(91), 1.1, .35, .7), .5); m.add(c['sparkle'] + .06, bell(NOTE(96), 1.1, .3, .5), .35)
    m.add(c['sparkle'] + .05, sparkle(.35, 5, 93, 105, 4), .3)
    return m
def fx02(c):
    m = Mix(c['T'])
    a, b = c['drop']; m.add(a, whoosh(b - a + .02, 4000, 500, 1.3), .55)
    m.add(c['land'], thump(), .9); m.add(c['land'], pop(260, 520, .09), .5); m.add(c['land'], bell(NOTE(60), .5, .15, .3), .25)
    m.add(c['bounce'], thump(.15), .35)
    s0, s1 = c['shine']; g = np.zeros(int((s1 - s0 + .5) * SR))
    for k, n in enumerate([84, 86, 88, 91, 93, 96, 98, 100]):
        x = bell(NOTE(n), .4, .1, .4); i = int(k / 8 * (s1 - s0) * SR); g[i:i + len(x)] += x[:len(g) - i]
    m.add(s0, g, .22)
    for i, t in enumerate(c['sparkles']): m.add(t, bell(NOTE([96, 100, 98, 103, 101, 105][i]), .35, .08, .3), .22)
    f = c['fanfare']; nt = [C5, E5, G5]
    for k, n in enumerate(nt): m.add(f + .12 * k, brass(NOTE(n), .16), .3)
    for n in nt + [84]: m.add(f + .36, brass(NOTE(n), 1.35, .02), .22 if n != 84 else .3)
    m.add(f + .36, brass(NOTE(48), 1.35, .04), .18)
    m.add(f + .36, sparkle(.8, 10, 91, 106, 9), .22); m.add(f + .36, thump(.3), .4)
    return m
def fx03(c):
    m = Mix(c['T'])
    m.add(c['A_pop'], pop(500, 1200, .09), .7)
    m.add(c['A_chime'], marimba(NOTE(88)), .7); m.add(c['A_chime'] + .1, marimba(NOTE(93), .9), .75)
    m.add(c['A_chime'] + .1, bell(NOTE(105), .5, .12, .3), .12); m.add(.25, sparkle(.3, 4, 96, 106, 5), .2)
    m.add(c['B_bwomp'], bwomp(), .85); m.add(c['B_bwomp'], thump(.18), .3)
    return m
def fx04(c):
    m = Mix(c['T'])
    p0, p1 = c['progress']; m.add(p0, pad(p1 - p0 + .1, [57, 64, 69]), 1)
    m.add(p0, tick(NOTE(81)), .35)
    for k, t in enumerate(c['ticks']): m.add(t, tick(NOTE([84, 86, 88][k])), .5)
    m.add(c['done'], bell(NOTE(84), 1.0, .3, .6), .45); m.add(c['done'], bell(NOTE(91), 1.0, .3, .5), .3)
    for k, t in enumerate(c['knocks']): m.add(t, knock([520, 560, 600][k]), .55)
    m.add(c['lid'], pop(300, 900, .14), .8); m.add(c['lid'] - .02, whoosh(.4, 600, 4500, 1.5), .5)
    for k, n in enumerate([84, 88, 91, 96, 100, 103]): m.add(c['unlock'] + .055 * k, pluck(NOTE(n)), .3)
    m.add(c['unlock'] + .3, bell(NOTE(96), 1.3, .4, .6), .25)
    for k, t in enumerate(c['sparkles']): m.add(t, bell(NOTE([98, 101, 103, 105, 108][k]), .3, .07, .3), .18)
    return m
def fx05(c):
    m = Mix(c['T'])
    i0 = c['ignite']; d = .5; t = tt(d)
    fw = svf_sweep(noise(d), 250, 2200, 1.0, .6) * np.minimum(1, t / .02) * np.exp(-t / .16)
    m.add(i0, fw, .9); m.add(i0, glide(110, 60, .45) * np.exp(-tt(.45) / .14) * np.minimum(1, tt(.45) / .01), .5)
    m.add(i0 + .02, bell(NOTE(91), .3, .08, .3), .15)
    m.add(.3, crackle(c['T'] - .4, 10, .22) * np.minimum(1, tt(c['T'] - .4) / .4), .9)
    for t0 in c['flip']: m.add(t0, knock(1400) * .6, .45)
    for k, n in enumerate([G5, 84, 88]): m.add(c['streak_chime'] + .08 * k, marimba(NOTE(n), .7), .55)
    m.add(c['streak_chime'] + .16, bell(NOTE(100), .5, .12, .3), .12)
    f0, f1 = c['fill']; m.add(f0, riser(f1 - f0, 600, 1200), .3)
    m.add(c['check'], pop(520, 1250, .09), .7)
    for k, n in enumerate([84, 88, 91]): m.add(c['success'] + .06 * k, bell(NOTE(n), 1.0, .3, .6), .33)
    m.add(c['coin'], coin(NOTE(91)), .45); m.add(c['coin'] + .11, coin(NOTE(96)), .4)
    return m
# ── mastering ──
def true_peak(x): return 20 * np.log10(np.max(np.abs(resample_poly(x, 4, 1))) + 1e-12)
def limit(x, ceil_db=-1.4, look=.003, rel=.06):
    c = 10 ** (ceil_db / 20); L = int(look * SR)
    pk = np.maximum.accumulate if False else None
    a = np.abs(resample_poly(x, 4, 1)).reshape(-1, 4).max(1)[:len(x)]
    need = np.minimum(1, c / np.maximum(a, 1e-9))
    # lookahead min-hold then smooth release
    from scipy.ndimage import minimum_filter1d
    g = minimum_filter1d(need, 2 * L + 1); g = np.concatenate([g[L:], np.full(L, g[-1])])
    out = np.empty_like(g); s = 1.0; ra = np.exp(-1 / (rel * SR)); aa = np.exp(-1 / (L * .5 + 1))
    for i in range(len(g)):
        s = g[i] if g[i] < s else (ra * s + (1 - ra) * g[i]); out[i] = s
    out = np.convolve(out, np.ones(L) / L, 'same'); return x * np.minimum(out, need * 0 + out)
def master(y, T, target=-16.0):
    y = reverb(lp(hp(y, 90), 14000)); n = int(T * SR); y = y[:n].copy()
    f = int(.02 * SR); y[-f:] *= np.linspace(1, 0, f)
    meter = pyln.Meter(SR)
    for _ in range(8):
        y *= 10 ** ((target - meter.integrated_loudness(y)) / 20)
        if true_peak(y) <= -1.2: break
        y = limit(y, -1.5)
    return y, meter.integrated_loudness(y), true_peak(y)
if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True); report = {}
    for name, fn in (('fx01-xp-coins', fx01), ('fx02-level-up', fx02), ('fx03-correct-wrong', fx03), ('fx04-pack-unlock', fx04), ('fx05-streak-mission', fx05)):
        c = CUES[name]; y, L, tp = master(fn(c).y, c['T'])
        w = f'{OUT}/{name}.wav'; sf.write(w, y, SR, subtype='PCM_24')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', w, '-c:a', 'libmp3lame', '-b:a', '128k', '-ar', '44100', f'{OUT}/{name}.mp3'], check=True)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', w, '-c:a', 'libvorbis', '-q:a', '5', '-ar', '44100', f'{OUT}/{name}.ogg'], check=True)
        report[name] = dict(lufs=round(L, 2), dbtp=round(tp, 2)); print(name, report[name])
    json.dump(report, open(f'{OUT}/master-report.json', 'w'), indent=1)
