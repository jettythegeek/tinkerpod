"""Empty-state illustrations: Captain Jetty (embedded from the mood rig) + one brand prop each, 600×480, text-free
(titles/body copy live in the app so they can be translated). Same CSS-keyframe engine as the FX.
Run: python3 build_empty.py → ../empty-*.svg"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__)); PACK = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
for p in (os.path.join(PACK, 'fx', 'src'), os.path.join(PACK, '..', 'design', 'fx', 'src')):
    if os.path.exists(os.path.join(p, 'fxlib.py')): sys.path.insert(0, p); break
sys.path.insert(0, os.path.join(PACK, '..', 'design', 'fx', 'src'))
import fxlib, json
fxlib.MOTION = os.path.join(PACK, 'motion')                       # pack moods (incl. thinking / surprised …)
fxlib.MOODS = json.load(open(os.path.join(PACK, 'motion', 'moods.json')))
from fxlib import TL, pip, OUT, IN, BACK, IO, LIN, STEP, FONT
OUTD = os.path.join(HERE, '..')
TEAL, BTN, INK, PURP, YEL, CORAL, BLUE, GREEN, SLATE = '#00BFAE', '#007A70', '#0F172A', '#7C3AED', '#FFB700', '#FF6B6B', '#2563EB', '#63C132', '#64748B'
W, H = 600, 480

def star4(r, fill, op=1):
    k = r * .2
    return f'<path d="M0 {-r} Q{k} {-k} {r} 0 Q{k} {k} 0 {r} Q{-k} {k} {-r} 0 Q{-k} {-k} 0 {-r}Z" fill="{fill}" opacity="{op}"/>'
def doc(P, title, css, body):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" id="{P}root" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="{title}">
<title>{title}</title>
<style>
#{P}root .{P}a{{transform-box:fill-box;transform-origin:50% 50%}}
{css}
@media (prefers-reduced-motion:reduce){{#{P}root *{{animation-duration:0s!important;animation-delay:0s!important;animation-iteration-count:1!important}}}}
</style>
<circle cx="300" cy="226" r="196" fill="#E6F9F7"/>
<circle cx="300" cy="226" r="196" fill="none" stroke="#CCF2EE" stroke-width="3" stroke-dasharray="2 14" stroke-linecap="round"/>
<ellipse cx="300" cy="424" rx="230" ry="14" fill="{INK}" opacity=".05"/>
{body}
</svg>
'''
def jetty(P, mood, x=40, y=96, size=350):
    return pip(mood, P + 'p-', x, y, size, 0.0)
def floaty(tl, sel, amp=8, rot=0, T=None, phase=0):
    T = T or tl.T; q = T / 4
    tl.k(sel, [(0, f'transform:translateY(0px) rotate(0deg)', IO), (q, f'transform:translateY({-amp}px) rotate({rot}deg)', IO), (2 * q, 'transform:translateY(0px) rotate(0deg)', IO),
               (3 * q, f'transform:translateY({-amp*.5:.0f}px) rotate({-rot}deg)', IO), (T, 'transform:translateY(0px) rotate(0deg)')])
def twinkle(tl, sel, t0, T):
    a = t0 % T
    pts = [(0, 'opacity:0;transform:scale(0) rotate(0deg)', STEP), (a, 'opacity:1;transform:scale(0) rotate(0deg)', BACK), (min(a + .3, T), 'opacity:1;transform:scale(1) rotate(45deg)', IN), (min(a + .7, T), 'opacity:0;transform:scale(0) rotate(90deg)')]
    tl.k(sel, pts)
def sparkles(tl, P, pts, T):
    out = ''
    for i, (x, y, r, c, t0) in enumerate(pts):
        out += f'<g transform="translate({x} {y})"><g id="{P}sp{i}" class="{P}a" opacity="0">{star4(r, c)}</g></g>'
        twinkle(tl, f'#{P}sp{i}', t0, T)
    return out
def write(name, P, title, css, body):
    open(os.path.join(OUTD, f'{name}.svg'), 'w').write(doc(P, title, css, body))

def no_lessons():
    P = 'e1-'; tl = TL(3.2, P); pc, pm = jetty(P, 'wave')
    floaty(tl, f'#{P}book', 10, 2)
    tl.k(f'#{P}page', [(0, 'transform:scaleX(1)', IO), (1.2, 'transform:scaleX(1)', IO), (1.5, 'transform:scaleX(-.05)', IO), (1.8, 'transform:scaleX(1)'), (3.2, 'transform:scaleX(1)')])
    book = f'''<g transform="translate(430 250)"><g id="{P}book" class="{P}a">
 <path d="M-96 -54 Q-48 -72 0 -50 Q48 -72 96 -54 L96 66 Q48 48 0 70 Q-48 48 -96 66Z" fill="{PURP}"/>
 <path d="M-86 -60 Q-44 -76 -2 -56 L-2 56 Q-44 38 -86 52Z" fill="#fff"/><path d="M86 -60 Q44 -76 2 -56 L2 56 Q44 38 86 52Z" fill="#F8FAFC"/>
 <g stroke="#E2E8F0" stroke-width="6" stroke-linecap="round"><path d="M-70 -36 Q-46 -44 -18 -34 M-70 -14 Q-46 -22 -18 -12 M-70 8 Q-46 0 -30 6"/><path d="M70 -36 Q46 -44 18 -34 M70 -14 Q46 -22 18 -12"/></g>
 <g transform="translate(2 0)"><g id="{P}page" class="{P}a" style="transform-origin:0% 50%"><path d="M0 -56 Q36 -72 72 -60 L72 50 Q36 38 0 54Z" fill="#fff" opacity=".9"/></g></g>
 <path d="M52 -66 L52 -20 L62 -30 L72 -20 L72 -66Z" fill="{CORAL}"/>
</g></g>'''
    sp = sparkles(tl, P, [(352, 130, 14, YEL, .2), (520, 160, 11, TEAL, 1.1), (500, 340, 10, CORAL, 2.0)], 3.2)
    write('empty-no-lessons', P, 'No lessons yet: Captain Jetty with an open book', pc + tl.out(), pm + book + sp)

def offline():
    P = 'e2-'; tl = TL(3.6, P); pc, pm = jetty(P, 'thinking')
    floaty(tl, f'#{P}cloud', 9, 0)
    tl.k(f'#{P}w1', [(0, 'opacity:.25'), (.6, 'opacity:1', IO), (1.2, 'opacity:.25'), (3.6, 'opacity:.25')])
    tl.k(f'#{P}w2', [(0, 'opacity:.25'), (.3, 'opacity:.25', IO), (.9, 'opacity:1', IO), (1.5, 'opacity:.25'), (3.6, 'opacity:.25')])
    tl.k(f'#{P}w3', [(0, 'opacity:.25'), (.6, 'opacity:.25', IO), (1.2, 'opacity:1', IO), (1.8, 'opacity:.25'), (3.6, 'opacity:.25')])
    tl.k(f'#{P}slash', [(0, 'stroke-dashoffset:1'), (1.9, 'stroke-dashoffset:1', OUT), (2.3, 'stroke-dashoffset:0'), (3.3, 'stroke-dashoffset:0', IN), (3.6, 'stroke-dashoffset:1')])
    cloud = f'''<g transform="translate(436 232)"><g id="{P}cloud" class="{P}a">
 <path d="M-92 46 Q-124 46 -124 16 Q-124 -14 -92 -16 Q-90 -62 -44 -64 Q-14 -92 26 -74 Q68 -88 84 -44 Q124 -40 124 2 Q124 46 84 46Z" fill="#fff"/>
 <path d="M-92 46 Q-124 46 -124 16 Q-124 -14 -92 -16 Q-90 -62 -44 -64 Q-14 -92 26 -74 Q68 -88 84 -44 Q124 -40 124 2 Q124 46 84 46Z" fill="none" stroke="#CBD5E1" stroke-width="4"/>
 <g transform="translate(0 14)" fill="none" stroke="{SLATE}" stroke-width="10" stroke-linecap="round">
  <path id="{P}w3" d="M-58 -30 Q0 -76 58 -30"/><path id="{P}w2" d="M-36 -8 Q0 -38 36 -8"/><path id="{P}w1" d="M-14 14 Q0 2 14 14"/>
  <circle cx="0" cy="30" r="3" fill="{SLATE}" stroke="none"/></g>
 <path id="{P}slash" d="M-62 -52 L62 60" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="0" fill="none" stroke="{CORAL}" stroke-width="11" stroke-linecap="round"/>
</g></g>'''
    sp = sparkles(tl, P, [(560, 120, 10, PURP, .5), (330, 120, 12, YEL, 2.2)], 3.6)
    write('empty-offline', P, 'No internet: Captain Jetty with a cloud and no signal', pc + tl.out(), pm + cloud + sp)

def error():
    P = 'e3-'; tl = TL(2.4, P); pc, pm = jetty(P, 'surprised')
    tl.k(f'#{P}gear', [(0, 'transform:translateY(0px) rotate(0deg)', 'cubic-bezier(.2,.6,.4,1)'), (.4, 'transform:translateY(-70px) rotate(90deg)', 'cubic-bezier(.6,0,.8,.4)'),
                       (.8, 'transform:translateY(0px) rotate(180deg)', 'cubic-bezier(.2,.6,.4,1)'), (1.05, 'transform:translateY(-22px) rotate(220deg)', 'cubic-bezier(.6,0,.8,.4)'),
                       (1.3, 'transform:translateY(0px) rotate(260deg)', IO), (2.4, 'transform:translateY(0px) rotate(360deg)')])
    tl.k(f'#{P}gsh', [(0, 'transform:scale(1)'), (.4, 'transform:scale(.6)', IO), (.8, 'transform:scale(1)', IO), (1.05, 'transform:scale(.85)', IO), (1.3, 'transform:scale(1)')])
    for i in range(3):
        tl.k(f'#{P}b{i}', [(0, 'transform:translateY(0px) rotate(0deg)', IO), (.3 + .15 * i, f'transform:translateY({-16 - 6*i}px) rotate({[30, -40, 60][i]}deg)', IO), (.8 + .1 * i, 'transform:translateY(0px) rotate(0deg)'), (2.4, 'transform:translateY(0px) rotate(0deg)')])
    tl.k(f'#{P}spring', [(0, 'transform:scaleY(1)', IO), (.6, 'transform:scaleY(1.35)', IO), (1.2, 'transform:scaleY(.85)', IO), (1.8, 'transform:scaleY(1.1)', IO), (2.4, 'transform:scaleY(1)')])
    g = []
    for i in range(36):
        a = i / 36 * 2 * math.pi; r = 52 if i % 4 in (1, 2) else 40; g.append(f'{r*math.cos(a):.1f},{r*math.sin(a):.1f}')
    gear = 'M' + ' L'.join(g) + 'Z M16 0 A16 16 0 1 0 -16 0 A16 16 0 1 0 16 0Z'
    props = f'''<g transform="translate(450 412)"><g id="{P}gsh" class="{P}a"><ellipse rx="50" ry="8" fill="{INK}" opacity=".08"/></g></g>
<g transform="translate(450 358)"><g id="{P}gear" class="{P}a"><path d="{gear}" fill="{YEL}" fill-rule="evenodd"/><circle r="26" fill="none" stroke="#E09A00" stroke-width="6" opacity=".6"/></g></g>
<g transform="translate(556 408)"><g id="{P}b0" class="{P}a"><rect x="-7" y="-12" width="14" height="24" rx="4" fill="#94A3B8"/><rect x="-11" y="-14" width="22" height="7" rx="3" fill="#64748B"/></g></g>
<g transform="translate(392 410)"><g id="{P}b1" class="{P}a"><path d="M0 -12 L10 -6 L10 6 L0 12 L-10 6 L-10 -6Z" fill="#94A3B8"/><circle r="4.5" fill="#E6F9F7"/></g></g>
<g transform="translate(540 402)"><g id="{P}b2" class="{P}a"><g transform="rotate(-18)"><rect x="-26" y="-6" width="52" height="12" rx="6" fill="{PURP}"/><circle cx="-26" cy="0" r="11" fill="{PURP}"/><circle cx="-26" cy="0" r="5" fill="#E6F9F7"/></g></g></g>
<g transform="translate(536 358)"><g id="{P}spring" class="{P}a" style="transform-origin:50% 100%"><path d="M0 50 C18 46 18 36 0 32 C-18 28 -18 18 0 14 C18 10 18 0 0 -4 C-18 -8 -18 -18 0 -22" fill="none" stroke="{CORAL}" stroke-width="6" stroke-linecap="round"/></g></g>'''
    write('empty-error', P, 'Something went wrong: Captain Jetty and a popped-out gear', pc + tl.out(), pm + props)

def no_packs():
    P = 'e4-'; tl = TL(2.8, P); pc, pm = jetty(P, 'idle')
    tl.k(f'#{P}arrow', [(0, 'opacity:0;transform:translateY(-30px)', STEP), (.2, 'opacity:1;transform:translateY(-30px)', IO), (1.2, 'opacity:1;transform:translateY(10px)', IN), (1.5, 'opacity:0;transform:translateY(30px)'), (2.8, 'opacity:0;transform:translateY(30px)')])
    tl.k(f'#{P}flapl', [(0, 'transform:rotate(0deg)', IO), (1.4, 'transform:rotate(-10deg)', IO), (2.8, 'transform:rotate(0deg)')])
    tl.k(f'#{P}flapr', [(0, 'transform:rotate(0deg)', IO), (1.4, 'transform:rotate(10deg)', IO), (2.8, 'transform:rotate(0deg)')])
    tl.k(f'#{P}box', [(0, 'transform:scale(1,1)'), (1.4, 'transform:scale(1,1)', IO), (1.55, 'transform:scale(1.04,.96)', IO), (1.75, 'transform:scale(1,1)')])
    box = f'''<g transform="translate(445 330)"><g id="{P}box" class="{P}a" style="transform-origin:50% 100%">
 <path d="M-80 -30 L80 -30 L80 74 Q80 86 68 86 L-68 86 Q-80 86 -80 74Z" fill="#FFB700"/>
 <path d="M-80 -30 L80 -30 L80 -12 L-80 -12Z" fill="#E09A00"/>
 <path d="M-56 -30 L56 -30 L46 -4 L-46 -4Z" fill="#B45309" opacity=".35"/>
 <g transform="translate(-80 -30)"><g id="{P}flapl" class="{P}a" style="transform-origin:100% 100%"><g transform="translate(80 30)"><path d="M-80 -30 L-112 -66 L-46 -66 L0 -30Z" fill="#FFD54A"/></g></g></g>
 <g transform="translate(80 -30)"><g id="{P}flapr" class="{P}a" style="transform-origin:0% 100%"><g transform="translate(-80 30)"><path d="M80 -30 L112 -66 L46 -66 L0 -30Z" fill="#FFD54A"/></g></g></g>
 <rect x="-34" y="20" width="68" height="34" rx="8" fill="#FFF1B8" opacity=".8"/>
</g></g>
<g transform="translate(445 200)"><g id="{P}arrow" class="{P}a" opacity="0">
 <path d="M0 -50 V20" fill="none" stroke="{BTN}" stroke-width="12" stroke-linecap="round" stroke-dasharray="2 20"/>
 <path d="M-24 2 L0 28 L24 2" fill="none" stroke="{BTN}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></g></g>'''
    sp = sparkles(tl, P, [(560, 250, 11, PURP, .6), (340, 150, 12, TEAL, 1.6)], 2.8)
    write('empty-no-packs', P, 'No packs downloaded: Captain Jetty beside an empty content box', pc + tl.out(), pm + box + sp)

def no_tournaments():
    P = 'e5-'; tl = TL(3.2, P); pc, pm = jetty(P, 'happy')
    floaty(tl, f'#{P}tro', 12, 3)
    tl.k(f'#{P}dash', [(0, 'stroke-dashoffset:0', LIN), (3.2, 'stroke-dashoffset:-64')])
    tl.k(f'#{P}flag', [(0, 'transform:skewY(0deg) scaleX(1)', IO), (.8, 'transform:skewY(6deg) scaleX(.92)', IO), (1.6, 'transform:skewY(0deg) scaleX(1)', IO), (2.4, 'transform:skewY(-5deg) scaleX(.94)', IO), (3.2, 'transform:skewY(0deg) scaleX(1)')])
    pod = f'''<g transform="translate(445 0)">
 <rect x="-44" y="304" width="88" height="114" rx="10" fill="{PURP}"/><rect x="-44" y="304" width="88" height="14" rx="7" fill="#A78BFA"/>
 <rect x="-128" y="344" width="84" height="74" rx="10" fill="{TEAL}"/><rect x="-128" y="344" width="84" height="12" rx="6" fill="#5EEAD4"/>
 <rect x="44" y="364" width="84" height="54" rx="10" fill="{CORAL}"/><rect x="44" y="364" width="84" height="12" rx="6" fill="#FFA3A3"/>
 <path d="M0 340 l7 14 15 2 -11 10 3 15 -14 -7 -14 7 3 -15 -11 -10 15 -2z" fill="#fff" opacity=".85"/>
 <g transform="translate(108 364)"><rect x="-2" y="-62" width="5" height="62" rx="2.5" fill="#94A3B8"/><g id="{P}flag" class="{P}a" style="transform-origin:0% 50%"><path d="M3 -62 L40 -52 L3 -40Z" fill="{YEL}"/></g></g>
 <g transform="translate(0 200)"><g id="{P}tro" class="{P}a">
  <g id="{P}dash" fill="none" stroke="{SLATE}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 12" opacity=".7">
   <path d="M-46 -60 H46 C46 -12 26 10 0 12 C-26 10 -46 -12 -46 -60Z"/><path d="M-46 -52 C-74 -52 -76 -16 -42 -8 M46 -52 C74 -52 76 -16 42 -8"/><path d="M0 14 V40 M-30 52 H30"/></g>
 </g></g></g>'''
    sp = sparkles(tl, P, [(380, 150, 13, YEL, .3), (520, 140, 10, PURP, 1.3), (540, 260, 11, TEAL, 2.3)], 3.2)
    write('empty-no-tournaments', P, 'No tournaments yet: Captain Jetty beside an empty podium', pc + tl.out(), pm + pod + sp)

def search_none():
    P = 'e6-'; tl = TL(3.6, P); pc, pm = jetty(P, 'thinking')
    tl.k(f'#{P}mag', [(0, 'transform:translate(0px,0px) rotate(0deg)', IO), (.9, 'transform:translate(-26px,-12px) rotate(-8deg)', IO), (1.8, 'transform:translate(0px,6px) rotate(0deg)', IO),
                      (2.7, 'transform:translate(24px,-10px) rotate(8deg)', IO), (3.6, 'transform:translate(0px,0px) rotate(0deg)')])
    for i in range(3):
        tl.k(f'#{P}d{i}', [(0, 'transform:scale(.6);opacity:.4', IO), (.3 + .3 * i, 'transform:scale(1.2);opacity:1', IO), (.9 + .3 * i, 'transform:scale(.6);opacity:.4'), (3.6, 'transform:scale(.6);opacity:.4')])
    mag = f'''<g transform="translate(450 250)">
 <g opacity=".9">{''.join(f'<rect x="-100" y="{-70 + 44*i}" width="{[200, 170, 186, 120][i]}" height="26" rx="13" fill="#fff"/>' for i in range(4))}</g>
 <g id="{P}mag" class="{P}a" style="transform-origin:50% 50%">
  <path d="M40 40 L84 84" stroke="{PURP}" stroke-width="24" stroke-linecap="round"/>
  <circle r="62" fill="#fff" opacity=".55"/><circle r="62" fill="none" stroke="{PURP}" stroke-width="16"/>
  <path d="M-34 -20 Q-28 -38 -10 -42" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
  {''.join(f'<g transform="translate({-22 + 22*i} 6)"><g id="{P}d{i}" class="{P}a"><circle r="7" fill="{SLATE}"/></g></g>' for i in range(3))}
 </g></g>'''
    write('empty-search-no-results', P, 'No search results: Captain Jetty and a magnifying glass', pc + tl.out(), pm + mag)

def no_kids():
    P = 'e7-'; tl = TL(2.8, P); pc, pm = jetty(P, 'wave')
    tl.k(f'#{P}plus', [(0, 'transform:scale(1)', IO), (.5, 'transform:scale(1.14)', IO), (1.0, 'transform:scale(1)'), (2.8, 'transform:scale(1)')])
    tl.k(f'#{P}ring', [(0, 'opacity:.7;transform:scale(1)', OUT), (1.0, 'opacity:0;transform:scale(1.5)', STEP), (2.8, 'opacity:0;transform:scale(1.5)')])
    tl.k(f'#{P}dash', [(0, 'stroke-dashoffset:0', LIN), (2.8, 'stroke-dashoffset:-56')])
    floaty(tl, f'#{P}card', 6, 0)
    card = f'''<g transform="translate(450 236)"><g id="{P}card" class="{P}a">
 <rect x="-104" y="-118" width="208" height="236" rx="34" fill="#fff"/>
 <circle id="{P}dash" cy="-30" r="56" fill="#F1F5F9" stroke="#94A3B8" stroke-width="5" stroke-dasharray="12 16" stroke-linecap="round"/>
 <circle cy="-48" r="20" fill="#CBD5E1"/><path d="M-34 4 Q-34 -22 0 -22 Q34 -22 34 4Z" fill="#CBD5E1"/>
 <rect x="-60" y="44" width="120" height="16" rx="8" fill="#E2E8F0"/><rect x="-40" y="72" width="80" height="12" rx="6" fill="#EEF1F5"/>
 <g transform="translate(42 12)"><g id="{P}ring" class="{P}a"><circle r="26" fill="none" stroke="{TEAL}" stroke-width="5"/></g></g>
 <g transform="translate(42 12)"><g id="{P}plus" class="{P}a"><circle r="26" fill="{BTN}"/><path d="M0 -12 V12 M-12 0 H12" stroke="#fff" stroke-width="7" stroke-linecap="round"/></g></g>
</g></g>'''
    sp = sparkles(tl, P, [(330, 130, 12, YEL, .4), (572, 120, 10, CORAL, 1.4), (580, 360, 11, PURP, 2.2)], 2.8)
    write('empty-no-kids', P, 'Add your first child: Captain Jetty beside an empty profile card', pc + tl.out(), pm + card + sp)

for f in (no_lessons, offline, error, no_packs, no_tournaments, search_none, no_kids): f()
print('ok')
