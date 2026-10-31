"""Vectorise the approved logo (design/assets/logo.png) into clean SVG paths.
Mark: palette segmentation -> per-component masks -> potrace. White face plate = enclosed interior.
Wordmark: per-letter coverage from colour distance -> potrace. Output: logo-paths.json (logo.png pixel units)."""
import json, os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd
from tracelib import trace_mask, upscale_alpha
HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in globals() else os.getcwd()
SRC = os.path.join(HERE, '..', '..', '..', '..', 'design', 'assets', 'logo.png')
K = 4  # trace at 4x
im = Image.open(SRC).convert('RGBA')
bgw = Image.new('RGBA', im.size, (255, 255, 255, 255)); bgw.alpha_composite(im)
X = np.array(bgw.convert('RGB')).astype(float)
A = np.array(im)[:, :, 3].astype(float)
H, W = A.shape
MX = 495  # icon | wordmark split column

# ---------- mark ----------
PAL = {  # class: (rgb sampled from the PNG, output colour)
 'navy':   ((0x25, 0x33, 0x58), '#253358'),
 'teal':   ((0x00, 0xC0, 0xBD), '#00C0BB'),
 'yellow': ((0xFE, 0xC4, 0x2A), '#FFC52B'),
 'purple': ((0x76, 0x50, 0xEC), '#7650EC'),
 'eye':    ((0x41, 0xED, 0xCC), '#41EDCC'),
 'orange': ((0xFD, 0x8A, 0x07), '#FF8A06'),
 'coral':  ((0xFD, 0x76, 0x75), '#FD7675'),
 'green':  ((0x74, 0xCB, 0x78), '#74CB78'),
 'pink':   ((0xED, 0xA0, 0xFB), '#EDA0FB'),
 'white':  ((0xFF, 0xFF, 0xFF), '#FFFFFF'),
}
names = list(PAL); cols = np.array([PAL[n][0] for n in names], float)
Xi = X[:, :MX]; Ai = A[:, :MX]
d2 = ((Xi[:, :, None, :] - cols[None, None]) ** 2).sum(-1)
lab = d2.argmin(-1)
wi = names.index('white')
colored = (lab != wi) & (Ai > 100)
# white face plate etc. = holes enclosed by coloured ink
interior = nd.binary_fill_holes(nd.binary_closing(colored, structure=nd.generate_binary_structure(2, 1), iterations=4)) & ~colored
lab = np.where(colored, lab, np.where(interior, wi, -1))
# majority clean-up of AA slivers: small components get the label of their surroundings
for it in range(2):
    for ci in range(len(names)):
        m = lab == ci
        cc, n = nd.label(m)
        if n == 0: continue
        sizes = nd.sum(m, cc, range(1, n + 1))
        for k, s in enumerate(sizes):
            if s < 25:
                comp = cc == k + 1
                ring = nd.binary_dilation(comp, iterations=1) & ~comp
                vals = lab[ring]
                vals = vals[vals != ci]
                lab[comp] = np.bincount(vals + 1).argmax() - 1 if len(vals) else -1
def comp_masks(ci, min_px=30):
    m = lab == ci; cc, n = nd.label(m)
    out = []
    for k in range(1, n + 1):
        c = cc == k
        if c.sum() >= min_px:
            ys, xs = np.where(c); out.append((c, xs.mean(), ys.mean(), int(c.sum())))
    return out
def name_comp(cls, cx, cy, area):
    """Semantic id for each traced component; None drops anti-alias slivers."""
    if cls == 'navy': return ('screen' if cy > 200 else 'pod-opening') if area > 200 else None
    if cls == 'teal':
        if area > 5000: return 'shell'
        if cx < 120 and area > 300: return 'ray-teal'
        if cy < 125 and area > 500: return 'shell-arc'
        if 160 < cx < 200 and cy < 125: return 'gear-hole-arc'
        if area > 400: return 'code-lt' if cx < 260 else 'code-gt'
        return None
    if cls == 'yellow':
        if cy < 45: return 'antenna-shine' if area > 40 else None
        if cx < 80: return 'ear-l' if area > 150 else None
        if cx > 420: return ('ear-r' if cy > 180 else 'sparkle') if area > 150 else None
        if cy > 330: return 'dot-2'
        return 'gear' if area > 3000 else None
    if cls == 'purple': return ('ray-purple' if cx < 100 else 'wrench') if area > 300 else None
    if cls == 'coral':
        if cy < 80: return 'antenna-shine-2' if area > 100 else None
        return ('ray-coral' if cx < 100 else 'dot-1') if area > 300 else None
    if cls == 'pink':
        if cy < 130 and area > 60: return 'wrench-shine'
        return 'dot-3' if area > 300 else None
    if cls == 'eye':
        if area < 500: return None
        return 'eye-r' if cx > 280 else 'mouth'
    if cls == 'orange': return 'antenna' if area > 1000 else None
    if cls == 'green': return 'code-slash' if area > 500 else None
    if cls == 'white':
        if area > 3000: return 'faceplate'
        if 140 < cx < 210 and 230 < cy < 300: return 'eye-l-wink'
        if 150 < cx < 210 and 100 < cy < 160: return 'gear-hole'
        if cx < 40 and area > 150: return 'ear-l-shine'
        return None
    return None
TINT = {'wrench-shine': '#A996F7', 'antenna-shine': '#FFC27A', 'antenna-shine-2': '#FFB46B'}
Z = ['shell', 'faceplate', 'pod-opening', 'screen', 'ear-l', 'ear-r', 'ear-l-shine', 'shell-arc', 'gear', 'gear-hole', 'gear-hole-arc', 'code-lt', 'code-slash', 'code-gt',
     'wrench', 'wrench-shine', 'antenna', 'antenna-shine-2', 'antenna-shine', 'eye-l-wink', 'eye-r', 'mouth', 'dot-1', 'dot-2', 'dot-3', 'ray-teal', 'ray-purple', 'ray-coral', 'sparkle']
mark = []
ears = {}
for ci, cls in enumerate(names):
    for c, cx, cy, area in comp_masks(ci):
        nid = name_comp(cls, cx, cy, area)
        if nid is None: continue
        if nid in ('ear-l', 'ear-r'):
            ears.setdefault(nid, []).append(c); continue
        cov = Image.fromarray((c * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.6 if area > 5000 else 0.9))
        up = upscale_alpha(np.array(cov), K)
        thr = 127 if cls in ('white',) else 105   # lower layers bleed ~0.2px under neighbours: no seams
        dpath = trace_mask(~(up > thr), K, 0, 0, turd=20, alphamax=1.15, opttol=0.4)
        mark.append(dict(id=nid, cls=cls, fill=TINT.get(nid, PAL[cls][1]), cx=round(cx, 1), cy=round(cy, 1), area=area, d=dpath))
for nid, cs in ears.items():   # the PNG ears are split by an AA seam: merge halves into one clean shape
    c = nd.binary_fill_holes(nd.binary_closing(np.logical_or.reduce(cs), iterations=3))
    ys, xs = np.where(c)
    cov = Image.fromarray((c * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))
    mark.append(dict(id=nid, cls='yellow', fill=PAL['yellow'][1], cx=round(xs.mean(), 1), cy=round(ys.mean(), 1), area=int(c.sum()),
                     d=trace_mask(~(upscale_alpha(np.array(cov), K) > 105), K, 0, 0, turd=20, alphamax=1.15, opttol=0.4)))
mark.sort(key=lambda e: (Z.index(e['id']), -e['area']))
# highlights the PNG shows as light tints (antenna ball, wrench, left ear) are added by hand in build_logo.py
# ---------- wordmark ----------
LET = [('T', 497, 645, '#01C0BE'), ('i', 645, 700, '#FD6E6C'), ('n', 700, 820, '#FEC82E'), ('k', 820, 934, '#7650EC'),
       ('e', 934, 1050, '#79C451'), ('r', 1050, 1150, '#0F87FD'), ('P', 1150, 1272, '#FE7402'), ('o', 1272, 1396, '#FE7402'), ('d', 1396, 1523, '#FE7402')]
dist = 765 - X.sum(2)
word = []
y0, y1 = 120, 340
for ch, x0, x1, col in LET:
    sub = dist[y0:y1, x0:x1]
    m = sub > 60
    ref = np.percentile(sub[m], 70) if m.any() else 300
    cov = np.clip(sub / ref, 0, 1) * 255
    cov = np.array(Image.fromarray(cov.astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)))
    up = upscale_alpha(cov, K)
    word.append(dict(id=f'letter-{ch}', ch=ch, fill=col, d=trace_mask(~(up > 127), K, x0, y0, turd=30, alphamax=1.2, opttol=0.5)))
json.dump(dict(size=[W, H], split=MX, mark=mark, word=word), open(os.path.join(HERE, 'logo-paths.json'), 'w'))
for e in mark: print(e['id'], e['cls'], e['area'], e['cx'], e['cy'])
