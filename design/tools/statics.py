"""Static exports for an animated SVG: CSS-paused copy (design/assets/pip convention), baked CSS-free SVG with a
tight viewBox (react-native-svg safe), transparent PNG, and the Reanimated motion spec."""
import asyncio, os, re, sys, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from render import render
from bake import bake
from PIL import Image

def vb_of(svg): return [float(v) for v in re.search(r'viewBox="([^"]+)"', svg).group(1).split()]
def set_vb(svg, vb, w=None, h=None):
    vbs = ' '.join(f'{v:g}' for v in vb)
    svg = re.sub(r'viewBox="[^"]+"', f'viewBox="{vbs}"', svg, count=1)
    if w: svg = re.sub(r'(<svg[^>]*?)\swidth="[^"]+"', rf'\1 width="{w:g}"', svg, count=1)
    if h: svg = re.sub(r'(<svg[^>]*?)\sheight="[^"]+"', rf'\1 height="{h:g}"', svg, count=1)
    return svg

def tight_box(svg_path, pad=10, t=None, k=2):
    """alpha bbox of the rendered frame, in viewBox units"""
    svg = open(svg_path).read(); x, y, w, h = vb_of(svg)
    d = tempfile.mkdtemp(); png = f'{d}/a.png'
    asyncio.run(render([dict(svg=svg_path, out=png, w=int(w * k), h=int(h * k), t=t)]))
    bb = Image.open(png).getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    x0, y0, x1, y1 = bb
    return [round(x + x0 / k - pad), round(y + y0 / k - pad), round((x1 - x0) / k + 2 * pad), round((y1 - y0) / k + 2 * pad)]

def make_static(anim, t, baked=None, png=None, png_w=512, paused=None, paused_tight=None, motion=None, tight=True, pad=10, title=None, box=None):
    tmp = tempfile.mkdtemp()
    bk = baked or f'{tmp}/b.svg'
    asyncio.run(bake([dict(svg=anim, out=bk, t=t * 1000, motion=motion, title=title)]))
    vb = box or (tight_box(bk, pad) if tight else vb_of(open(bk).read()))
    s = open(bk).read(); s = set_vb(s, vb, vb[2], vb[3]); open(bk, 'w').write(s)
    if png:
        hgt = round(png_w * vb[3] / vb[2])
        asyncio.run(render([dict(svg=bk, out=png, w=png_w, h=hgt)]))
    if paused or paused_tight:
        src = open(anim).read()
        css = f'*{{animation-play-state:paused!important;animation-delay:-{t:g}s!important}}'
        p = src.replace('</style>', css + '\n</style>', 1)
        if paused: open(paused, 'w').write(p)
        if paused_tight: open(paused_tight, 'w').write(set_vb(p, vb, vb[2], vb[3]))
    return vb
