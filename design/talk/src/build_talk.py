"""Captain Jetty talking samples: voice (edge-tts en-NG) + viseme lip-sync + speaking body motion + end gesture.
→ talk/audio/*.{wav,mp3,ogg}, talk/cues/*.mouth.json, talk/svg/*.svg (CSS keyframes, one-shot, t=0 is audio start)."""
import os, sys, json, math, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); TALK = os.path.dirname(HERE); PACK = os.path.dirname(TALK)
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(PACK, '..', 'design', 'motion', 'src'))
import pip as R
from voice import process
RAW = os.path.join(HERE, 'raw')   # raw TTS output from tts.py (shipped, so builds work offline)
EYE = R.EYE; PINK, PINK_L, INKM = '#FF6B7D', '#FFB3BC', '#0B1430'
LINES = {'talk-01-welcome': dict(text='Hello! Welcome back today!', gesture='happy', gesture_label='smile (happy hop)'),
         'talk-02-streak': dict(text="Hello! Let's continue your streak from yesterday!", gesture='cheer', gesture_label='smile + fist pump'),
         'talk-03-help': dict(text='Hello! Do you need my help with anything?', gesture='wave', gesture_label='friendly wave + head tilt')}
VOICES = {'abeo': ('en-NG-AbeoNeural', 'main'), 'ezinne': ('en-NG-EzinneNeural', 'alt')}

# ── mouth shapes (visemes) ─────────────────────────────────────────────────────────────────────────────
SHAPES = ['rest', 'mbp', 'small', 'wide', 'round', 'e', 'fv']
SHAPE_DOC = {'rest': 'closed, soft smile (silence)', 'mbp': 'lips pressed (M B P)', 'small': 'small open (most consonants, schwa, I)',
             'wide': 'wide open (A, AH, AY)', 'round': 'round (O, U, W)', 'e': 'wide smile (E, EE, AY-end)', 'fv': 'top teeth on lip (F V)'}
def mouth_talk(cx=200, cy=194):
    o = R._orig_mouth(cx, cy); o = o[:o.rfind('</g>')]
    V = f'''
    <g id="m-rest" class="v"><path d="M{cx-14} {cy-1} Q{cx} {cy+8} {cx+14} {cy-1}" fill="none" stroke="{EYE}" stroke-width="6" stroke-linecap="round"/></g>
    <g id="m-mbp" class="v"><path d="M{cx-13} {cy+2} Q{cx} {cy+5} {cx+13} {cy+2}" fill="none" stroke="{EYE}" stroke-width="7.5" stroke-linecap="round"/></g>
    <g id="m-small" class="v"><path d="M{cx-14} {cy-2} Q{cx} {cy-4} {cx+14} {cy-2} Q{cx+13} {cy+11} {cx} {cy+11} Q{cx-13} {cy+11} {cx-14} {cy-2}Z" fill="{PINK}"/>
      <path d="M{cx-6} {cy+6} Q{cx} {cy+3} {cx+6} {cy+6} Q{cx+4} {cy+9} {cx} {cy+9} Q{cx-4} {cy+9} {cx-6} {cy+6}Z" fill="{PINK_L}"/></g>
    <g id="m-wide" class="v"><path d="M{cx-18} {cy-6} Q{cx} {cy-9} {cx+18} {cy-6} Q{cx+17} {cy+20} {cx} {cy+20} Q{cx-17} {cy+20} {cx-18} {cy-6}Z" fill="{PINK}"/>
      <path d="M{cx-15} {cy-5} Q{cx} {cy-7} {cx+15} {cy-5} L{cx+14} {cy-1} Q{cx} {cy-3} {cx-14} {cy-1}Z" fill="#fff" opacity=".9"/>
      <path d="M{cx-10} {cy+14} Q{cx} {cy+5} {cx+10} {cy+14} Q{cx+6} {cy+20} {cx} {cy+20} Q{cx-6} {cy+20} {cx-10} {cy+14}Z" fill="{PINK_L}"/></g>
    <g id="m-round" class="v"><ellipse cx="{cx}" cy="{cy+4}" rx="9.5" ry="11.5" fill="{PINK}"/><ellipse cx="{cx}" cy="{cy+4}" rx="9.5" ry="11.5" fill="none" stroke="{EYE}" stroke-width="3.5"/>
      <ellipse cx="{cx}" cy="{cy+10}" rx="5" ry="3.5" fill="{PINK_L}"/></g>
    <g id="m-e" class="v"><path d="M{cx-21} {cy-4} Q{cx} {cy-6} {cx+21} {cy-4} Q{cx+18} {cy+11} {cx} {cy+11} Q{cx-18} {cy+11} {cx-21} {cy-4}Z" fill="{PINK}"/>
      <path d="M{cx-18} {cy-3} Q{cx} {cy-5} {cx+18} {cy-3} L{cx+16} {cy+2} Q{cx} {cy} {cx-16} {cy+2}Z" fill="#fff" opacity=".92"/></g>
    <g id="m-fv" class="v"><path d="M{cx-13} {cy+3} Q{cx} {cy+7} {cx+13} {cy+3}" fill="none" stroke="{EYE}" stroke-width="6" stroke-linecap="round"/>
      <rect x="{cx-8}" y="{cy-4}" width="16" height="7" rx="2.5" fill="#fff"/></g>
  </g>'''
    return o + V
if not hasattr(R, '_orig_mouth'): R._orig_mouth = R.mouth
R.mouth = mouth_talk

# ── words → phonemes → visemes ─────────────────────────────────────────────────────────────────────────
LEX = {'hello': 'HH EH L OW', 'welcome': 'W EH L K AX M', 'back': 'B AE K', 'today': 'T AX D EY', "let's": 'L EH T S', 'continue': 'K AX N T IH N Y UW',
       'your': 'Y AO R', 'streak': 'S T R IY K', 'from': 'F R AX M', 'yesterday': 'Y EH S T ER D EY', 'do': 'D UW', 'you': 'Y UW', 'need': 'N IY D',
       'my': 'M AY', 'help': 'HH EH L P', 'with': 'W IH TH', 'anything': 'EH N IY TH IH NG'}
VIS = {**{p: 'mbp' for p in 'M B P'.split()}, **{p: 'fv' for p in 'F V'.split()}, **{p: 'round' for p in 'OW UW UH AO OY W'.split()},
       **{p: 'wide' for p in 'AA AE AH AY AW'.split()}, **{p: 'e' for p in 'IY EH EY'.split()}}
VOW = set('AA AE AH AY AW OW UW UH AO OY IY EH EY IH AX ER'.split())
WT = {'AY': 1.4, 'OW': 1.4, 'EY': 1.3, 'AW': 1.4, 'OY': 1.4}
def letters_to_phones(w):   # fallback for words not in LEX (live speech): crude grapheme rules
    out, i, w = [], 0, w.lower()
    D = [('th', 'TH'), ('sh', 'SH'), ('ch', 'CH'), ('ph', 'F'), ('oo', 'UW'), ('ee', 'IY'), ('ea', 'IY'), ('ou', 'AW'), ('ow', 'OW'), ('ay', 'EY'), ('ai', 'EY')]
    S1 = dict(a='AE', e='EH', i='IH', o='OW', u='AH', y='IY', b='B', m='M', p='P', f='F', v='V', w='W')
    while i < len(w):
        for g, p in D:
            if w.startswith(g, i): out.append(p); i += len(g); break
        else:
            c = w[i]; i += 1
            if c.isalpha(): out.append(S1.get(c, 'T'))
    return out
def word_visemes(word, t0, t1, env, fps=100):
    ph = LEX.get(word.lower().strip("!?.,"), None)
    ph = ph.split() if ph else letters_to_phones(word)
    wts = [WT.get(p, 1.0) if p in VOW else (.75 if VIS.get(p) in ('mbp', 'fv') else .55) for p in ph]
    tot = sum(wts); t = t0; segs = []
    for p, wv in zip(ph, wts):
        d = (t1 - t0) * wv / tot; s = VIS.get(p, 'small')
        e = env[min(len(env) - 1, int((t + d / 2) * fps))]
        if s == 'wide' and e < .45: s = 'small'          # quiet → less open
        if s == 'e' and e < .25: s = 'small'
        segs.append([round(t, 3), s]); t += d
    return segs
def mouth_cues(words, env, end_t, lead=.04, fps=100):
    cues = [[0.0, 'rest']]
    for i, w in enumerate(words):
        t0 = max(0, w['start'] - lead); t1 = w['end'] - lead
        if cues[-1][0] > t0: t0 = cues[-1][0]
        cues += word_visemes(w['word'], t0, t1, env, fps)
        nxt = words[i + 1]['start'] - lead if i + 1 < len(words) else end_t
        if nxt - t1 > .09: cues.append([round(t1, 3), 'rest'])
    out = []
    for t, s in cues:                                    # merge repeats; drop flickers < 45 ms (except lip closures mbp/fv, which must show)
        if out and out[-1][1] == s: continue
        if out and t - out[-1][0] < .045 and out[-1][1] not in ('mbp', 'fv') and len(out) > 1:
            out[-1] = [out[-1][0], s]
            if len(out) > 1 and out[-2][1] == s: out.pop()
            continue
        out.append([t, s])
    return [dict(t=round(t, 3), shape=s) for t, s in out]
def align_offset(words, env, fps=100):
    """edge-tts boundary offsets vs decoded audio: pick the shift that best matches speech activity."""
    act = (env > .15).astype(float); best = (0, -1)
    for sh in np.arange(-.05, .2, .005):
        m = np.zeros_like(act)
        for w in words: m[int((w['start'] + sh) * fps):int((w['start'] + w['dur'] + sh) * fps)] = 1
        sc = (m * act).sum() - .5 * (m * (1 - act)).sum()
        if sc > best[1]: best = (sh, sc)
    return float(best[0])

# ── timeline (one-shot) ───────────────────────────────────────────────────────────────────────────────
STEP = 'steps(1,end)'
class TL1:
    def __init__(s, T): s.T, s.css, s.n = T, [], 0
    def k(s, sel, pts):
        if pts[0][0] > 0: pts = [(0,) + tuple(pts[0][1:2])] + pts
        if pts[-1][0] < s.T: pts = pts + [(s.T,) + tuple(pts[-1][1:2])]
        name = f'tk{s.n}'; s.n += 1; body = ''; last = -1
        for p in pts:
            pc = max(last + .001, p[0] / s.T * 100); last = pc
            body += f'{pc:.3f}%{{{p[1]}' + (f';animation-timing-function:{p[2]}' if len(p) > 2 and p[2] else '') + '}'
        s.css.append(f'@keyframes {name}{{{body}}}\n{sel}{{animation:{name} {s.T:.3f}s linear 0s 1 both}}')
    def out(s): return '\n'.join(s.css)
IO, OUT, BACK, INE = R.IO, R.OUTE, R.BACK, R.INE

def build_line(key, spec, vk):
    voice, role = VOICES[vk]
    adir = f'{TALK}/audio'; os.makedirs(adir, exist_ok=True)
    base = f'{adir}/{key}' + ('' if role == 'main' else f'-{vk}')
    rep, env = process(f'{RAW}/{key}-{vk}.mp3', base)
    raw = json.load(open(f'{RAW}/{key}-{vk}.words.json')); off = align_offset(raw, env)
    words = [dict(word=w['word'], start=round(w['start'] + off, 3), end=round(w['start'] + w['dur'] + off, 3)) for w in raw]
    sp_end = words[-1]['end']; g0 = round(sp_end + .12, 3); GD = 1.9; T = round(max(rep['dur'], g0 + GD) + .1, 3)
    cues = mouth_cues(words, env, sp_end)
    gest = spec['gesture']
    # gesture mouth: grin (happy/cheer), smile-grin (wave)
    cues.append(dict(t=g0, shape='grin'))
    tl = TL1(T)
    # visemes
    allshapes = SHAPES + ['grin']
    for s in allshapes:
        sel = '#mouth-grin' if s == 'grin' else f'#m-{s}'
        pts = []
        for i, c in enumerate(cues):
            pts.append((c['t'], f'opacity:{1 if c["shape"] == s else 0}', STEP))
        tl.k(sel, pts)
    tl.k('#mouth-smile', [(0, 'opacity:0')])
    # mouth openness from envelope (15 fps samples), settle for gesture
    pts = []
    for t in np.arange(0, sp_end + .1, 1 / 15):
        e = env[min(len(env) - 1, int(t * 100))]; pts.append((round(t, 3), f'transform:scale({1 + .05 * e:.3f},{.9 + .2 * e:.3f})', IO))
    pts += [(g0, 'transform:scale(1,1)', BACK), (g0 + .25, 'transform:scale(1.2,1.15)', IO), (T, 'transform:scale(1.15,1.1)')]
    tl.k('#mouth', pts)
    # head nods on word onsets (stressed: first syllable), plus gesture tilt
    hp = [(0, 'transform:rotate(0deg) translateY(0px)', IO)]
    for i, w in enumerate(words):
        a = (-2.2 if i % 2 else 2.0) * (1.4 if i == 0 else 1)
        hp += [(max(hp[-1][0] + .05, w['start'] - .03), f'transform:rotate({a * .3:.2f}deg) translateY(0px)', OUT), (w['start'] + .09, f'transform:rotate({a:.2f}deg) translateY(2.5px)', IO)]
    hp += [(sp_end, 'transform:rotate(0deg) translateY(0px)', IO)]
    if gest == 'wave': hp += [(g0 + .1, 'transform:rotate(0deg) translateY(0px)', IO), (g0 + .45, 'transform:rotate(7deg) translateX(3px)', IO), (g0 + GD - .2, 'transform:rotate(6deg) translateX(3px)', IO), (T, 'transform:rotate(4deg) translateX(2px)')]
    else: hp += [(T, 'transform:rotate(0deg) translateY(0px)')]
    tl.k('#head', hp)
    # antenna wiggle on words + glow on loudness
    ap = [(0, 'transform:rotate(0deg)', IO)]
    for i, w in enumerate(words):
        ap += [(max(ap[-1][0] + .05, w['start']), 'transform:rotate(0deg)', OUT), (w['start'] + .12, f'transform:rotate({(-7 if i % 2 else 7)}deg)', IO)]
    ap += [(sp_end + .05, 'transform:rotate(0deg)', IO), (g0 + .3, 'transform:rotate(12deg)', IO), (g0 + .55, 'transform:rotate(-8deg)', IO), (g0 + .8, 'transform:rotate(4deg)', IO), (g0 + 1.05, 'transform:rotate(0deg)')]
    tl.k('#antenna', ap)
    gp = [(round(t, 3), f'opacity:{.15 + .55 * env[min(len(env) - 1, int(t * 100))]:.2f};transform:scale({.85 + .5 * env[min(len(env) - 1, int(t * 100))]:.2f})', IO) for t in np.arange(0, sp_end + .1, 1 / 12)]
    gp += [(g0 + .2, 'opacity:.6;transform:scale(1.35)', IO), (T, 'opacity:.3;transform:scale(1)')]
    tl.k('#antenna-glow', gp)
    for j, led in enumerate(('#led-1', '#led-2', '#led-3')):
        lp = [(round(t, 3), f'opacity:{.45 + .55 * env[min(len(env) - 1, int((t + .04 * j) * 100))]:.2f}', IO) for t in np.arange(0, sp_end + .1, 1 / 12)]
        lp += [(g0, 'opacity:1', IO), (T, 'opacity:1')]
        tl.k(led, lp)
    # blinks (eyes group scaleY), placed in pauses / mid-line; none during the happy-eye gesture
    blinks = [.9, words[min(3, len(words) - 1)]['start'] + .05] if gest != 'wave' else [.9, words[3]['start'] + .05, g0 + 1.25]
    bp = [(0, 'transform:scaleY(1)')]
    for b in blinks: bp += [(b, 'transform:scaleY(1)', 'cubic-bezier(.4,0,.6,1)'), (b + .07, 'transform:scaleY(.08)', 'cubic-bezier(.4,0,.6,1)'), (b + .15, 'transform:scaleY(1)')]
    tl.k('#eyes', bp)
    # eyes open → happy for happy/cheer; wave keeps open eyes (friendly), cheeks on
    if gest in ('happy', 'cheer'):
        tl.k('#eye-l-open,#eye-r-open', [(0, 'opacity:1'), (g0, 'opacity:1', STEP), (g0 + .02, 'opacity:0')])
        tl.k('#eye-l-happy,#eye-r-happy', [(0, 'opacity:0'), (g0, 'opacity:0', STEP), (g0 + .02, 'opacity:1')])
    tl.k('#cheeks', [(0, 'opacity:0'), (words[0]['start'], 'opacity:0', IO), (words[0]['start'] + .3, 'opacity:.6', IO), (words[0]['end'] + .3, 'opacity:0'), (g0, 'opacity:0', IO), (g0 + .3, 'opacity:1')])
    # body: gentle talking bob + gesture
    bob = [(0, 'transform:translateY(0px)', IO)]
    for t in np.arange(.25, sp_end, .55): bob.append((round(t, 3), f'transform:translateY({-5 if int(t / .55) % 2 else -1}px)', IO))
    bob.append((sp_end, 'transform:translateY(0px)', IO))
    sq = [(0, 'transform:scale(1,1)')]
    sh = [(0, 'transform:scale(1);opacity:.13')]
    if gest in ('happy', 'cheer'):
        hops = [g0 + .05] if gest == 'happy' else [g0 + .05, g0 + .75]
        for h in hops:
            bob += [(h, 'transform:translateY(0px)', OUT), (h + .24, 'transform:translateY(-30px)', INE), (h + .46, 'transform:translateY(0px)', IO)]
            sq += [(h - .08, 'transform:scale(1,1)', OUT), (h, 'transform:scale(1.08,.9)', OUT), (h + .08, 'transform:scale(.95,1.07)', IO), (h + .24, 'transform:scale(1,1)', IO),
                   (h + .46, 'transform:scale(1.1,.88)', BACK), (h + .62, 'transform:scale(1,1)')]
            sh += [(h, 'transform:scale(1);opacity:.13', OUT), (h + .24, 'transform:scale(.72);opacity:.07', INE), (h + .46, 'transform:scale(1);opacity:.13')]
    bob.append((T, 'transform:translateY(0px)'))
    tl.k('#pip', bob); tl.k('#pip-squash', sq); tl.k('#shadow', sh)
    # arms: talking gestures (left arm small lifts on emphasis), gesture on the right arm
    al = [(0, 'transform:rotate(0deg)', IO), (words[0]['start'], 'transform:rotate(0deg)', IO), (words[0]['start'] + .25, 'transform:rotate(18deg)', IO), (words[0]['end'] + .35, 'transform:rotate(0deg)', IO)]
    if len(words) > 3: al += [(words[2]['start'], 'transform:rotate(0deg)', IO), (words[2]['start'] + .2, 'transform:rotate(12deg)', IO), (sp_end, 'transform:rotate(0deg)', IO)]
    if gest == 'cheer': al += [(g0, 'transform:rotate(0deg)', IO), (g0 + .25, 'transform:rotate(-8deg)', IO), (T, 'transform:rotate(-4deg)')]
    tl.k('#arm-l', al)
    if gest == 'happy':
        ar = [(0, 'transform:rotate(0deg)', IO), (g0, 'transform:rotate(0deg)', IO), (g0 + .25, 'transform:rotate(-30deg)', IO), (g0 + .5, 'transform:rotate(-12deg)', IO), (T, 'transform:rotate(-8deg)')]
    elif gest == 'cheer':   # fist pump: right arm up, two pumps, hand curled
        ar = [(0, 'transform:rotate(0deg)', IO), (g0 - .1, 'transform:rotate(0deg)', BACK), (g0 + .2, 'transform:rotate(-150deg)', IO),
              (g0 + .42, 'transform:rotate(-128deg)', IO), (g0 + .62, 'transform:rotate(-156deg)', IO), (g0 + .84, 'transform:rotate(-130deg)', IO), (g0 + 1.04, 'transform:rotate(-152deg)', IO),
              (g0 + 1.5, 'transform:rotate(-140deg)', IO), (T, 'transform:rotate(-138deg)')]
        tl.k('#hand-r', [(0, 'transform:scale(1)'), (g0 + .1, 'transform:scale(1)', BACK), (g0 + .3, 'transform:scale(1.12)'), (T, 'transform:scale(1.12)')])
    else:                   # wave
        ar = [(0, 'transform:rotate(0deg)', IO), (g0, 'transform:rotate(0deg)', BACK), (g0 + .3, 'transform:rotate(-110deg)', IO), (g0 + .52, 'transform:rotate(-128deg)', IO),
              (g0 + .74, 'transform:rotate(-96deg)', IO), (g0 + .96, 'transform:rotate(-128deg)', IO), (g0 + 1.18, 'transform:rotate(-98deg)', IO), (g0 + 1.4, 'transform:rotate(-116deg)', IO), (T, 'transform:rotate(-112deg)')]
        tl.k('#hand-r', [(0, 'transform:rotate(0deg)'), (g0 + .3, 'transform:rotate(0deg)', IO), (g0 + .52, 'transform:rotate(-20deg)', IO), (g0 + .74, 'transform:rotate(16deg)', IO),
                         (g0 + .96, 'transform:rotate(-20deg)', IO), (g0 + 1.18, 'transform:rotate(14deg)', IO), (g0 + 1.4, 'transform:rotate(0deg)')])
    tl.k('#arm-r', ar)
    # sparkles for the cheer
    front = ''
    if gest in ('cheer', 'happy'):
        for i, (x, y, r, c) in enumerate([(300, 40, 14, '#FFB700'), (330, 120, 10, '#7C3AED'), (96, 60, 11, '#63C132')][:3 if gest == 'cheer' else 2]):
            front += f'<g transform="translate({x} {y})"><g id="spk{i}" style="transform-box:fill-box;transform-origin:50% 50%;opacity:0">{_star(r, c)}</g></g>'
            t = g0 + .25 + .2 * i
            tl.k(f'#spk{i}', [(0, 'opacity:0;transform:scale(0) rotate(0deg)'), (t, 'opacity:0;transform:scale(0) rotate(0deg)', BACK), (t + .3, 'opacity:1;transform:scale(1) rotate(45deg)', IO), (t + .9, 'opacity:0;transform:scale(.2) rotate(90deg)')])
    title = f'Captain Jetty says: “{spec["text"]}”'
    R.OUT = f'{TALK}/svg'; os.makedirs(R.OUT, exist_ok=True)
    svg = R.build('tmp', tl.out() + '\n#m-rest,#m-mbp,#m-small,#m-wide,#m-round,#m-e,#m-fv{transform-box:view-box}', front, '', f'{T}s', title)
    svg = svg.replace('aria-label="Pip the TinkerPod robot, ' + title + '"', f'aria-label="{title}"').replace(f'<title>Pip · {title}</title>', f'<title>{title}</title>')
    svg = svg.replace('@media (prefers-reduced-motion:reduce){*{animation-duration:0s!important;animation-iteration-count:1!important}}',
                      '@media (prefers-reduced-motion:reduce){#pip,#pip-squash,#head,#arm-l,#arm-r,#hand-r,#antenna,#shadow{animation:none!important}}')
    os.remove(f'{R.OUT}/pip-tmp.svg')
    name = key + ('' if role == 'main' else f'-{vk}')
    open(f'{R.OUT}/{name}.svg', 'w').write(svg)
    cdir = f'{TALK}/cues'; os.makedirs(cdir, exist_ok=True)
    cue = dict(line=key, text=spec['text'], voice=voice, voice_role=role, audio=[f'talk/audio/{name}.{e}' for e in ('wav', 'mp3', 'ogg')], audio_duration=rep['dur'],
               loudness=dict(lufs=rep['lufs'], dbtp=rep['dbtp']), timeline_duration=T, t0='audio start (t=0 s is the first sample of the audio file)',
               shapes={s: dict(svg_group=('mouth-grin' if s == 'grin' else f'm-{s}'), desc=(SHAPE_DOC.get(s) or 'big grin (end gesture)')) for s in allshapes},
               words=words, mouth=cues, speech_end=sp_end,
               gesture=dict(name=gest, label=spec['gesture_label'], start=g0, duration=GD, mood_reference=dict(happy='pip-happy', cheer='pip-cheer', wave='pip-wave')[gest]),
               blinks=blinks, envelope=dict(fps=50, values=[round(float(v), 2) for v in env[::2]]),
               source=dict(tts='edge-tts (Microsoft Edge neural voice)', boundary_offset_applied_s=round(off, 3), lip_sync='phoneme lexicon + word boundaries + loudness gating, 40 ms visual lead'))
    json.dump(cue, open(f'{cdir}/{name}.mouth.json', 'w'), indent=1)
    print(name, rep, 'offset', round(off, 3), 'T', T, 'cues', len(cues))
    return cue
def _star(r, c):
    k = r * .2
    return f'<path d="M0 {-r} Q{k} {-k} {r} 0 Q{k} {k} 0 {r} Q{-k} {k} {-r} 0 Q{-k} {-k} 0 {-r}Z" fill="{c}"/>'
if __name__ == '__main__':
    allc = {}
    for vk in VOICES:
        for k, s in LINES.items(): allc[k + ('' if VOICES[vk][1] == 'main' else '-' + vk)] = build_line(k, s, vk)
    json.dump({k: dict(text=v['text'], voice=v['voice'], role=v['voice_role'], T=v['timeline_duration'], audio_duration=v['audio_duration'], gesture=v['gesture']['name']) for k, v in allc.items()},
              open(f'{TALK}/talk-index.json', 'w'), indent=1)
