"""Decode the edge-tts mp3, add a light 'robot buddy' polish (low cut, presence lift, a faint metallic comb shimmer),
master to −16 LUFS / ≤ −1.5 dBTP like the UI sounds, export wav/mp3/ogg, and return the amplitude envelope."""
import os, sys, subprocess, json, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt
HERE = os.path.dirname(os.path.abspath(__file__)); PACK = os.path.abspath(os.path.join(HERE, '..', '..'))
for p in (os.path.join(PACK, 'fx', 'src'), os.path.join(PACK, '..', 'design', 'fx', 'src')):
    if os.path.exists(os.path.join(p, 'synth.py')): sys.path.insert(0, p); break
import synth as S
SR = 48000
COMB_MIX = .16   # faint 4.2 ms comb = robot shimmer; 0 = clean voice
def decode(mp3):
    w = mp3[:-4] + '.dec.wav'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp3, '-ar', str(SR), '-ac', '1', w], check=True)
    y, _ = sf.read(w); os.remove(w); return y
def shelf_up(y, f=3200, gain_db=2.5):
    hi = sosfilt(butter(2, f, 'hp', fs=SR, output='sos'), y); return y + (10 ** (gain_db / 20) - 1) * hi
def polish(y):
    y = sosfilt(butter(2, 90, 'hp', fs=SR, output='sos'), y)
    y = shelf_up(y, 3200, 2.5)
    d = int(.0042 * SR); c = np.zeros_like(y); c[d:] = y[:-d]          # 4.2 ms comb: faint metallic "speaker" colour
    y = y + COMB_MIX * c
    return y
def master(y, target=-16.0):
    meter = pyln.Meter(SR)
    for _ in range(12):
        y = y * 10 ** ((target - meter.integrated_loudness(y)) / 20)
        if S.true_peak(y) <= -1.5: break
        y = S.limit(y, -1.8)
    return y, meter.integrated_loudness(y), S.true_peak(y)
def envelope(y, fps=100):
    hop = SR // fps; n = len(y) // hop
    r = np.sqrt(np.array([np.mean(y[i * hop:(i + 1) * hop] ** 2) for i in range(n)]) + 1e-12)
    db = 20 * np.log10(r); e = np.clip((db + 50) / 38, 0, 1)                  # −50 dBFS → 0, −12 dBFS → 1
    k = np.ones(3) / 3; return np.convolve(e, k, 'same')
def process(mp3_in, out_base, trim_tail=True):
    y = decode(mp3_in)
    if trim_tail:   # trim trailing silence beyond 120 ms
        nz = np.where(np.abs(y) > 1e-3)[0]; y = y[:min(len(y), nz[-1] + int(.12 * SR))]
    y = polish(y); f = int(.01 * SR); y[-f:] *= np.linspace(1, 0, f)
    y, L, tp = master(y)
    sf.write(out_base + '.wav', y, SR, subtype='PCM_24')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', out_base + '.wav', '-c:a', 'libmp3lame', '-b:a', '128k', '-ar', '44100', out_base + '.mp3'], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', out_base + '.wav', '-c:a', 'libvorbis', '-q:a', '5', '-ar', '44100', out_base + '.ogg'], check=True)
    return dict(lufs=round(L, 2), dbtp=round(tp, 2), dur=round(len(y) / SR, 3)), envelope(y)
