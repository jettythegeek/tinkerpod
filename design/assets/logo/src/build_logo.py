"""Compose the TinkerPod logo SVGs from logo-paths.json (traced by trace_logo.py).
Writes ../tinkerpod-{mark,wordmark,logo}{,-white,-ink}.svg and ../tinkerpod-logo-intro.svg.
Single-colour versions are re-traced from a knock-out render so they are one clean compound path."""
import json, os, re, sys, asyncio, numpy as np
from collections import OrderedDict
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..')
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..', '..', '..', 'tools'))
from tracelib import trace_mask
from render import render
J = json.load(open(os.path.join(HERE, 'logo-paths.json')))
INK, WHITE = '#0F172A', '#FFFFFF'
# merge components that share an id (ear halves, pod openings)
mark = OrderedDict()
for e in J['mark']:
    if e['id'] in mark: mark[e['id']]['d'] += e['d']
    else: mark[e['id']] = dict(e)
word = J['word']
KNOCK = {'faceplate', 'gear-hole', 'eye-l-wink', 'eye-r', 'mouth', 'dot-1', 'dot-2', 'dot-3', 'wrench-shine', 'antenna-shine', 'antenna-shine-2'}
DROP_MONO = {'gear-hole-arc'}
def bbox(ds):
    xs, ys = [], []
    for d in ds:
        n = list(map(float, re.findall(r'-?\d+\.?\d*', d))); xs += n[0::2]; ys += n[1::2]
    return min(xs), min(ys), max(xs), max(ys)
def vb(b, pad):
    x0, y0, x1, y1 = b; return (round(x0 - pad), round(y0 - pad), round(x1 - x0 + 2 * pad), round(y1 - y0 + 2 * pad))
MB = vb(bbox([e['d'] for e in mark.values()]), 6)
WB = vb(bbox([e['d'] for e in word]), 6)
LB = (MB[0], min(MB[1], WB[1]), WB[0] + WB[2] - MB[0], max(MB[1] + MB[3], WB[1] + WB[3]) - min(MB[1], WB[1]))
def doc(v, body, title, extra_style='', w=None):
    x, y, ww, hh = v
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x} {y} {ww} {hh}" width="{w or ww}" height="{round((w or ww) * hh / ww)}" role="img" aria-label="{title}">\n'
            f'<title>{title}</title>\n{extra_style}{body}\n</svg>\n')
def mark_colour(P=''):
    return '<g id="%smark">' % P + ''.join(f'<path id="{P}{k}" d="{e["d"]}" fill="{e["fill"]}"/>' for k, e in mark.items()) + '</g>'
def word_colour(P=''):
    return '<g id="%swordmark">' % P + ''.join(f'<path id="{P}{e["id"]}" d="{e["d"]}" fill="{e["fill"]}" fill-rule="evenodd"/>' for e in word) + '</g>'
def word_mono(fill):
    return '<g id="wordmark">' + ''.join(f'<path id="{e["id"]}" d="{e["d"]}" fill="{fill}" fill-rule="evenodd"/>' for e in word) + '</g>'
# ---- single-colour mark: render knock-out stack, re-trace to one compound path ----
def mono_mark_path():
    K = 6; x, y, w, h = MB
    body = ''.join(f'<path d="{e["d"]}" fill="{"#fff" if k in KNOCK else "#000"}"/>' for k, e in mark.items() if k not in DROP_MONO)
    tmp = '/tmp/_mono.svg'; open(tmp, 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x} {y} {w} {h}"><rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#fff"/>{body}</svg>')
    asyncio.run(render([dict(svg=tmp, out='/tmp/_mono.png', w=w * K, h=h * K, bg='#fff')]))
    g = np.array(Image.open('/tmp/_mono.png').convert('L')).astype(float)
    return trace_mask(~(g < 128), K, x, y, turd=40, alphamax=1.1, opttol=0.4)
mono = mono_mark_path()
json.dump(dict(mono=mono), open(os.path.join(HERE, 'mark-mono-path.json'), 'w'))
def mark_mono(fill): return f'<g id="mark"><path id="mark-silhouette" d="{mono}" fill="{fill}" fill-rule="evenodd"/></g>'
files = {}
files['tinkerpod-mark.svg'] = doc(MB, mark_colour(), 'TinkerPod')
files['tinkerpod-mark-white.svg'] = doc(MB, mark_mono(WHITE), 'TinkerPod')
files['tinkerpod-mark-ink.svg'] = doc(MB, mark_mono(INK), 'TinkerPod')
files['tinkerpod-wordmark.svg'] = doc(WB, word_colour(), 'TinkerPod')
files['tinkerpod-wordmark-white.svg'] = doc(WB, word_mono(WHITE), 'TinkerPod')
files['tinkerpod-wordmark-ink.svg'] = doc(WB, word_mono(INK), 'TinkerPod')
files['tinkerpod-logo.svg'] = doc(LB, mark_colour() + word_colour(), 'TinkerPod')
files['tinkerpod-logo-white.svg'] = doc(LB, mark_mono(WHITE) + word_mono(WHITE), 'TinkerPod')
files['tinkerpod-logo-ink.svg'] = doc(LB, mark_mono(INK) + word_mono(INK), 'TinkerPod')

# ---- animated intro (1.5 s, plays once, ends on the rest pose = the static attributes) ----
P = 'li-'; T = 1.5
OUTE = 'cubic-bezier(.22,1,.36,1)'; BACK = 'cubic-bezier(.34,1.56,.64,1)'; IO = 'cubic-bezier(.45,0,.55,1)'
css = []
def k(sel, frames, dur=T, delay=0, ease='linear', origin=None):
    name = P + 'k' + str(len(css))
    body = ''.join(f'{p}%{{{v}}}' for p, v in frames)
    o = f'transform-origin:{origin};' if origin else ''
    css.append(f'@keyframes {name}{{{body}}}{sel}{{{o}animation:{name} {dur}s {ease} {delay}s 1 both}}')
pc = lambda t: round(t / T * 100, 2)
# whole mark: pop with squash
k(f'#{P}markpop', [(0, 'transform:translateY(40px) scale(.2,.2);opacity:0'), (pc(.08), 'opacity:1'), (pc(.34), f'transform:translateY(-6px) scale(1.08,.94);animation-timing-function:{IO}'),
                  (pc(.46), 'transform:translateY(0) scale(.97,1.04)'), (pc(.58), 'transform:translateY(0) scale(1,1)'), (100, 'transform:translateY(0) scale(1,1);opacity:1')], ease=OUTE)
# antenna springs out of the pod
k(f'#{P}antenna,#{P}antenna-shine,#{P}antenna-shine-2', [(0, 'opacity:0;transform:translateY(46px) scaleY(.3)'), (pc(.30), 'opacity:0;transform:translateY(46px) scaleY(.3)'), (pc(.33), 'opacity:1'),
   (pc(.48), 'transform:translateY(-8px) scaleY(1.08)'), (pc(.60), 'transform:translateY(2px) scaleY(.97)'), (pc(.72), 'transform:translateY(0) scaleY(1)'), (100, 'transform:translateY(0) scaleY(1)')], origin='245px 70px', ease=IO)
gc = (mark['gear']['cx'], mark['gear']['cy'])
k(f'#{P}gearg', [(0, 'transform:rotate(-200deg)'), (pc(.22), 'transform:rotate(-200deg)'), (pc(.80), 'transform:rotate(12deg)'), (pc(.95), 'transform:rotate(0deg)'), (100, 'transform:rotate(0deg)')], origin=f'{gc[0]}px {gc[1]}px', ease=OUTE)
k(f'#{P}wrenchg', [(0, 'transform:rotate(0deg) translateY(30px)'), (pc(.26), 'transform:rotate(0deg) translateY(30px)'), (pc(.44), 'transform:rotate(-14deg) translateY(-4px)'),
   (pc(.58), 'transform:rotate(10deg) translateY(0)'), (pc(.70), 'transform:rotate(-5deg)'), (pc(.82), 'transform:rotate(2deg)'), (pc(.92), 'transform:rotate(0deg)'), (100, 'transform:rotate(0deg)')], origin='330px 170px', ease=IO)
k(f'#{P}codeg', [(0, 'opacity:0;transform:scale(.4)'), (pc(.36), 'opacity:0;transform:scale(.4)'), (pc(.52), 'opacity:1;transform:scale(1.15)'), (pc(.64), 'transform:scale(1)'), (100, 'opacity:1;transform:scale(1)')], origin='267px 150px', ease=OUTE)
for i, rid in enumerate(['ray-coral', 'ray-purple', 'ray-teal']):
    e = mark[rid]
    k(f'#{P}{rid}', [(0, 'opacity:0;transform:translate(14px,8px) scale(.2)'), (pc(.40 + .05 * i), 'opacity:0;transform:translate(14px,8px) scale(.2)'),
       (pc(.58 + .05 * i), 'opacity:1;transform:translate(-3px,-2px) scale(1.1)'), (pc(.72 + .05 * i), 'opacity:1;transform:translate(0,0) scale(1)'), (100, 'opacity:1;transform:translate(0,0) scale(1)')], origin=f'{e["cx"]}px {e["cy"]}px', ease=OUTE)
e = mark['sparkle']
k(f'#{P}sparkle', [(0, 'opacity:0;transform:scale(0) rotate(-90deg)'), (pc(.50), 'opacity:0;transform:scale(0) rotate(-90deg)'), (pc(.68), 'opacity:1;transform:scale(1.35) rotate(15deg)'),
   (pc(.82), 'transform:scale(.92) rotate(0deg)'), (pc(.92), 'transform:scale(1)'), (100, 'opacity:1;transform:scale(1) rotate(0deg)')], origin=f'{e["cx"]}px {e["cy"]}px', ease=OUTE)
# open eye blinks while the wink "lands"
e = mark['eye-r']
k(f'#{P}eye-r', [(0, 'transform:scaleY(1)'), (pc(.62), 'transform:scaleY(1)'), (pc(.68), 'transform:scaleY(.1)'), (pc(.76), 'transform:scaleY(1)'), (100, 'transform:scaleY(1)')], origin=f'{e["cx"]}px {e["cy"]}px', ease=IO)
for i, d in enumerate(['dot-1', 'dot-2', 'dot-3']):
    e = mark[d]
    k(f'#{P}{d}', [(0, 'transform:scale(0)'), (pc(.50 + .07 * i), 'transform:scale(0)'), (pc(.62 + .07 * i), 'transform:scale(1.4)'), (pc(.72 + .07 * i), 'transform:scale(1)'), (100, 'transform:scale(1)')], origin=f'{e["cx"]}px {e["cy"]}px', ease=OUTE)
# letters drop in one by one with a squash landing
for i, e in enumerate(word):
    t0 = .42 + .07 * i
    k(f'#{P}{e["id"]}', [(0, 'opacity:0;transform:translateY(-70px) scale(1,1)'), (pc(t0), 'opacity:0;transform:translateY(-70px) scale(1,1);animation-timing-function:cubic-bezier(.55,0,.9,.4)'),
       (pc(t0 + .02), 'opacity:1'), (pc(t0 + .18), f'opacity:1;transform:translateY(0) scale(1.12,.86);animation-timing-function:{OUTE}'),
       (pc(t0 + .30), 'transform:translateY(-6px) scale(.97,1.04)'), (pc(min(t0 + .40, 1.49)), 'transform:translateY(0) scale(1,1)'), (100, 'opacity:1;transform:translateY(0) scale(1,1)')])
style = (f'<style>\n#{P}root *{{transform-box:view-box}}\n#{P}root [id^="{P}letter"]{{transform-box:fill-box;transform-origin:50% 100%}}\n#{P}markpop{{transform-origin:240px 380px}}\n' + '\n'.join(css) +
         f'\n@media (prefers-reduced-motion:reduce){{#{P}root *{{animation:none!important}}}}\n</style>\n')
# grouped colour mark for the intro
grp = {'gearg': ['gear', 'gear-hole', 'gear-hole-arc'], 'wrenchg': ['wrench', 'wrench-shine'], 'codeg': ['code-lt', 'code-slash', 'code-gt']}
inv = {v: g for g, vs in grp.items() for v in vs}
body, open_g = '', None
order = ['antenna', 'antenna-shine-2', 'antenna-shine'] + [k for k in mark if not k.startswith('antenna')]   # antenna tucks behind the head while retracted
for kk in order:
    e = mark[kk]
    g = inv.get(kk)
    if g != open_g:
        if open_g: body += '</g>'
        if g: body += f'<g id="{P}{g}">'
        open_g = g
    body += f'<path id="{P}{kk}" d="{e["d"]}" fill="{e["fill"]}"/>'
if open_g: body += '</g>'
intro = doc(LB, f'<g id="{P}root"><g id="{P}markpop">{body}</g>{word_colour(P)}</g>', 'TinkerPod', style)
files['tinkerpod-logo-intro.svg'] = intro
for n, s in files.items(): open(os.path.join(OUT, n), 'w').write(s)
json.dump(dict(mark_viewbox=MB, wordmark_viewbox=WB, logo_viewbox=LB, intro_duration_s=T), open(os.path.join(HERE, 'logo-geometry.json'), 'w'), indent=1)
print(MB, WB, LB, {n: len(s) for n, s in files.items()})
