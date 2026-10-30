"""Shared helpers: Pip rig embedding (id/class/keyframe prefixing + time offset) and timeline keyframes in seconds."""
import re, json, os
MOTION = os.path.join(os.path.dirname(__file__), '..', '..', 'motion')
MOODS = json.load(open(os.path.join(MOTION, 'moods.json')))
OUT = 'cubic-bezier(.22,1,.36,1)'; IN = 'cubic-bezier(.55,0,.9,.4)'; BACK = 'cubic-bezier(.34,1.6,.64,1)'
IO = 'cubic-bezier(.45,0,.55,1)'; LIN = 'linear'; STEP = 'step-end'
FONT = "font-family:Nunito,'Arial Rounded MT Bold',system-ui,sans-serif"

def _split_top(v):
    out, d, cur = [], 0, ''
    for ch in v:
        if ch == '(': d += 1
        if ch == ')': d -= 1
        if ch == ' ' and d == 0:
            if cur: out.append(cur); cur = ''
        else: cur += ch
    if cur: out.append(cur)
    return out

def _shift_anim(val, off):
    parts = []
    segs, d, cur = [], 0, ''
    for ch in val:
        d += (ch == '(') - (ch == ')')
        if ch == ',' and d == 0: segs.append(cur); cur = ''
        else: cur += ch
    segs.append(cur)
    for one in segs:
        toks = _split_top(one.strip())
        tidx = [i for i, t in enumerate(toks) if re.fullmatch(r'-?\d*\.?\d+m?s', t)]
        if len(tidx) >= 2:
            t = toks[tidx[1]]; s = float(t[:-1]) / (1000 if t.endswith('ms') else 1)
            toks[tidx[1]] = f'{s+off:.3f}s'
        elif len(tidx) == 1:
            toks.insert(tidx[0] + 1, f'{off:.3f}s')
        parts.append(' '.join(toks))
    return ','.join(parts)

def pip(mood, P, x, y, size, offset=0.0, vb='-70 -110 540 540'):
    """Return (css, markup). Pip mood SVG with every id/class/keyframe prefixed by P and all its
    animation delays shifted by `offset` seconds so its clip starts at that point of the FX timeline."""
    src = open(os.path.join(MOTION, 'svg', f'pip-{mood}.svg')).read()
    dur = MOODS[mood]['dur']
    defs = re.search(r'<defs>(.*?)</defs>', src, re.S).group(1)
    css = re.search(r'<style>(.*?)</style>', src, re.S).group(1)
    body = src.split('</style>', 1)[1].rsplit('</svg>', 1)[0]
    ids = sorted(set(re.findall(r'id="([^"]+)"', src)), key=len, reverse=True)
    classes = sorted(set(c for cl in re.findall(r'class="([^"]+)"', src) for c in cl.split()), key=len, reverse=True)
    kfs = sorted(set(re.findall(r'@keyframes ([\w-]+)', css)), key=len, reverse=True)
    def fix_markup(m):
        m = re.sub(r'id="([^"]+)"', lambda g: f'id="{P}{g.group(1)}"', m)
        m = re.sub(r'url\(#([^)]+)\)', lambda g: f'url(#{P}{g.group(1)})', m)
        m = re.sub(r'href="#([^"]+)"', lambda g: f'href="#{P}{g.group(1)}"', m)
        m = re.sub(r'class="([^"]+)"', lambda g: 'class="' + ' '.join(P + c for c in g.group(1).split()) + '"', m)
        return m
    css = re.sub(r':root\{[^}]*\}', '', css)
    css = re.sub(r'@media \(prefers-reduced-motion[^{]*\{.*?\}\}', '', css, flags=re.S)
    css = css.replace('var(--dur)', f'{dur}s')
    for k in kfs:
        css = re.sub(r'(@keyframes )' + re.escape(k) + r'(?![\w-])', r'\g<1>' + P + k, css)
        css = re.sub(r'(animation:\s*)' + re.escape(k) + r'(?![\w-])', r'\g<1>' + P + k, css)
    hexy = lambda n: re.fullmatch(r'[0-9a-fA-F]{3,8}', n) is not None
    names = set(ids) | {n for n in re.findall(r'#([a-zA-Z][\w-]*)', css) if not hexy(n)}
    for i in sorted(names, key=len, reverse=True):
        css = re.sub(r'#' + re.escape(i) + r'(?![\w-])', '#' + P + i, css)
    css = re.sub(r'(?<![\d-])\.([a-zA-Z][\w-]*)', lambda g: '.' + P + g.group(1), css)
    if offset:
        css = re.sub(r'animation:([^;}]+)', lambda g: 'animation:' + _shift_anim(g.group(1), offset), css)
    markup = (f'<svg id="{P}rig" x="{x}" y="{y}" width="{size}" height="{size}" viewBox="{vb}" overflow="visible">'
              f'<defs>{fix_markup(defs)}</defs>{fix_markup(body)}</svg>')
    return css, markup

class TL:
    """Timeline of one FX: keyframes authored in seconds, emitted as % of the loop length T."""
    def __init__(self, T, P): self.T, self.P, self.css = T, P, []
    def k(self, sel, pts, prop_default=None):
        name = self.P + 'k' + str(len(self.css))
        if pts[0][0] > 0: pts = [(0,) + tuple(pts[0][1:])] + pts
        if pts[-1][0] < self.T: pts = pts + [(self.T,) + tuple(pts[-1][1:2])]
        body = ''
        for p in pts:
            t, decl = p[0], p[1]; ease = p[2] if len(p) > 2 else None
            body += f'{t/self.T*100:.3f}%{{{decl}' + (f';animation-timing-function:{ease}' if ease else '') + '}'
        self.css.append(f'@keyframes {name}{{{body}}}{sel}{{animation:{name} {self.T}s linear 0s infinite both}}')
    def show(self, sel, windows, extra=''):
        """visible only inside [t0,t1) windows (hard cuts)."""
        pts = [(0, 'opacity:0', STEP)]
        for a, b in windows:
            if a <= 0: pts = []
            pts += [(a, 'opacity:1', STEP)]
            if b < self.T: pts += [(b, 'opacity:0', STEP)]
        self.k(sel, pts)
    def out(self): return '\n'.join(self.css)

def svg_doc(P, title, css, body, rm_css='', size=600):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" id="{P}root" viewBox="0 0 {size} {size}" width="{size}" height="{size}" role="img" aria-label="{title}">
<title>{title}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@800;900&amp;display=swap');
#{P}root text{{{FONT};font-weight:900}}
#{P}root .{P}a{{transform-box:fill-box;transform-origin:50% 50%}}
{css}
@media (prefers-reduced-motion:reduce){{#{P}root *{{animation-duration:0s!important;animation-delay:0s!important;animation-iteration-count:1!important}}{rm_css}}}
</style>
{body}
</svg>'''
