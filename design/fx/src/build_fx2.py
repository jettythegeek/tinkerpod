"""FX06–FX15 (celebration + UI motion), same engine and look as build_svg.py (FX01–05): CSS keyframes inside SVG,
600×600 artboard, Nunito 900, brand tokens, no SVG filters. Cue times merge into cues.json (never replace it).
Run: python3 build_fx2.py → ../svg/fx06…fx15.svg"""
import math, json, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
for p in (HERE, os.path.join(HERE, '..', '..', '..', 'design', 'fx', 'src')):
    if os.path.exists(os.path.join(p, 'fxlib.py')): sys.path.insert(0, p); break
from fxlib import TL, svg_doc, OUT, IN, BACK, IO, LIN, STEP
SVG = os.path.join(HERE, '..', 'svg'); os.makedirs(SVG, exist_ok=True)
CUES = {}
TEAL, BTN, INK, PURP, YEL, CORAL, BLUE, GREEN, BG = '#00BFAE', '#007A70', '#0F172A', '#7C3AED', '#FFB700', '#FF6B6B', '#2563EB', '#63C132', '#F8FAFC'
G_TXT, C_TXT, SLATE = '#2F7D16', '#C93A3A', '#64748B'
CONF = [YEL, CORAL, PURP, BLUE, GREEN, TEAL, '#FF8A1F']

def star4(r, fill, op=1):
    k = r * .2
    return f'<path d="M0 {-r} Q{k} {-k} {r} 0 Q{k} {k} 0 {r} Q{-k} {k} {-r} 0 Q{-k} {-k} 0 {-r}Z" fill="{fill}" opacity="{op}"/>'
def star5(r, fill, r2=None, extra=''):
    r2 = r2 or r * .5
    pts = ' '.join(f'{(r if i % 2 == 0 else r2) * math.sin(math.pi * i / 5):.1f},{-(r if i % 2 == 0 else r2) * math.cos(math.pi * i / 5):.1f}' for i in range(10))
    return f'<polygon points="{pts}" fill="{fill}" stroke-linejoin="round" {extra}/>'
def T(x, y, s, txt, fill=INK, anchor='middle', extra=''):
    return f'<text x="{x}" y="{y}" font-size="{s}" fill="{fill}" text-anchor="{anchor}" {extra}>{txt}</text>'
def card(x, y, w, h, r=28, fill='#fff', sid=None, stroke=None):
    s = f' stroke="{stroke}" stroke-width="3"' if stroke else ''
    i = f' id="{sid}"' if sid else ''
    return (f'<rect x="{x}" y="{y+5}" width="{w}" height="{h}" rx="{r}" fill="{INK}" opacity=".07"/>'
            f'<rect{i} x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"{s}/>')
def write(name, P, title, css, body, rm=''):
    open(os.path.join(SVG, name + '.svg'), 'w').write(svg_doc(P, title, css, body, rm))
def pop_in(tl, sel, t0, d=.3, s0=0, s1=1, extra0='', extra1=''):
    tl.k(sel, [(0, f'opacity:0;transform:scale({s0}){extra0}', STEP), (t0, f'opacity:1;transform:scale({s0}){extra0}', BACK), (t0 + d, f'opacity:1;transform:scale({s1}){extra1}')])
def sparkle_pop(tl, sel, t0, life=.55):
    tl.k(sel, [(0, 'opacity:0;transform:scale(0) rotate(0deg)', STEP), (t0, 'opacity:1;transform:scale(0) rotate(0deg)', BACK),
               (t0 + life * .35, 'opacity:1;transform:scale(1.15) rotate(45deg)', IN), (t0 + life, 'opacity:0;transform:scale(0) rotate(110deg)')])

def confetti_pieces(tl, P, n, cx, cy, t0, seed, spread=(-160, -20), speed=(420, 760), g=1300, life=1.9, scale=1.0, tag='cf'):
    """ballistic confetti: sampled parabola + flutter (scaleX flip) + spin, linear between samples"""
    r = random.Random(seed); out = ''
    for i in range(n):
        a = math.radians(r.uniform(*spread)); v = r.uniform(*speed); vx, vy = v * math.cos(a), v * math.sin(a)
        c = CONF[i % len(CONF)]; kind = i % 4; sz = r.uniform(.8, 1.25) * scale
        if kind == 0: el = f'<rect x="{-5*sz:.1f}" y="{-9*sz:.1f}" width="{10*sz:.1f}" height="{18*sz:.1f}" rx="{3*sz:.1f}" fill="{c}"/>'
        elif kind == 1: el = f'<circle r="{6*sz:.1f}" fill="{c}"/>'
        elif kind == 2: el = f'<g transform="scale({sz:.2f})">{star4(10, c)}</g>'
        else: el = f'<path d="M{-10*sz:.1f} 0 q{5*sz:.1f} {-7*sz:.1f} {10*sz:.1f} 0 t{10*sz:.1f} 0" fill="none" stroke="{c}" stroke-width="{4.5*sz:.1f}" stroke-linecap="round"/>'
        out += f'<g transform="translate({cx} {cy})"><g id="{P}{tag}{i}" class="{P}a" opacity="0">{el}</g></g>'
        d0 = t0 + r.uniform(0, .06); L = life * r.uniform(.8, 1.1); spin = r.choice([-1, 1]) * r.uniform(300, 760); fl = r.uniform(5, 9)
        pts = [(0, 'opacity:0;transform:translate(0px,0px) rotate(0deg) scale(0)', STEP)]
        drag = 1.6
        for k in range(10):
            tt_ = L * k / 9
            x = vx * (1 - math.exp(-drag * tt_)) / drag; y = vy * (1 - math.exp(-drag * tt_)) / drag + .5 * g * tt_ ** 2 * .55
            sx = math.cos(tt_ * fl) if kind in (0, 3) else 1
            op = 1 if k < 7 else (1 - (k - 6) / 3)
            sc = min(1, .4 + k * .6) if k < 2 else 1
            pts.append((d0 + tt_, f'opacity:{op:.2f};transform:translate({x:.0f}px,{y:.0f}px) rotate({spin * tt_ / L:.0f}deg) scale({sx * sc:.2f},{sc:.2f})', LIN if k else OUT))
        tl.k(f'#{P}{tag}{i}', pts)
    return out

# ───────── FX06 · Confetti burst ─────────
def fx06():
    P = 'f6-'; Tt = 2.6; tl = TL(Tt, P)
    cf = confetti_pieces(tl, P, 56, 300, 380, .08, 6, spread=(-160, -20), speed=(520, 900), life=2.2, scale=1.6)
    tl.k(f'#{P}ring', [(0, 'opacity:0;transform:scale(.3)', STEP), (.04, 'opacity:.9;transform:scale(.3)', OUT), (.5, 'opacity:0;transform:scale(2.4)')])
    tl.k(f'#{P}flash', [(0, 'opacity:0;transform:scale(.2)', STEP), (.02, 'opacity:1;transform:scale(.2)', OUT), (.3, 'opacity:0;transform:scale(1.3)')])
    body = (f'<g transform="translate(300 360)"><g id="{P}flash" class="{P}a" opacity="0"><circle r="70" fill="#FFF1B8"/></g></g>'
            f'<g transform="translate(300 360)"><g id="{P}ring" class="{P}a" opacity="0"><circle r="60" fill="none" stroke="{YEL}" stroke-width="8" stroke-dasharray="6 22" stroke-linecap="round"/></g></g>'
            f'<g id="{P}confetti">{cf}</g>')
    write('fx06-confetti-burst', P, 'Confetti burst', tl.out(), body, rm=f'#{P}confetti,#{P}ring,#{P}flash{{opacity:0}}')
    CUES['fx06-confetti-burst'] = dict(T=Tt, burst=.08, sound='ui-success-small', sound_at=.02, haptic='Haptics.notificationAsync(NotificationFeedbackType.Success)', loop=False)

# ───────── FX07 · Star burst ─────────
def fx07():
    P = 'f7-'; Tt = 1.8; tl = TL(Tt, P); CX, CY = 300, 300
    tl.k(f'#{P}star', [(0, 'opacity:0;transform:scale(0) rotate(-40deg)', STEP), (.04, 'opacity:1;transform:scale(0) rotate(-40deg)', BACK),
                       (.34, 'opacity:1;transform:scale(1) rotate(0deg)', IO), (.9, 'opacity:1;transform:scale(1.06) rotate(4deg)', IO), (1.25, 'opacity:1;transform:scale(1) rotate(0deg)', IN), (1.6, 'opacity:0;transform:scale(.6) rotate(0deg)')])
    tl.k(f'#{P}glow', [(0, 'opacity:0;transform:scale(.4)'), (.08, 'opacity:0;transform:scale(.4)', OUT), (.4, 'opacity:1;transform:scale(1)', IO), (1.3, 'opacity:.6;transform:scale(1.08)', IN), (1.6, 'opacity:0;transform:scale(1.2)')])
    tl.k(f'#{P}ring', [(0, 'opacity:0;transform:scale(.4)', STEP), (.12, 'opacity:1;transform:scale(.4)', OUT), (.6, 'opacity:0;transform:scale(2.2)')])
    tl.k(f'#{P}shine', [(0, 'transform:translateX(-140px)'), (.45, 'transform:translateX(-140px)', IO), (.85, 'transform:translateX(140px)')])
    rays = ''
    for i in range(10):
        a = i * 36 - 90; rad = math.radians(a); c = [YEL, CORAL, PURP, BLUE, GREEN][i % 5]
        d = 150 if i % 2 == 0 else 120; s = 16 if i % 2 == 0 else 11
        rays += f'<g transform="translate({CX} {CY})"><g id="{P}r{i}" class="{P}a" opacity="0">{star4(s, c)}</g></g>'
        x, y = d * math.cos(rad), d * math.sin(rad)
        tl.k(f'#{P}r{i}', [(0, 'opacity:0;transform:translate(0px,0px) scale(0) rotate(0deg)', STEP), (.1, 'opacity:1;transform:translate(0px,0px) scale(.3) rotate(0deg)', OUT),
                           (.55, f'opacity:1;transform:translate({x:.0f}px,{y:.0f}px) scale(1) rotate(90deg)', IN), (1.0, f'opacity:0;transform:translate({x*1.25:.0f}px,{y*1.25:.0f}px) scale(.2) rotate(180deg)')])
    dots = ''
    for i in range(12):
        a = math.radians(i * 30 + 15); x, y = 95 * math.cos(a), 95 * math.sin(a)
        dots += f'<g transform="translate({CX} {CY})"><g id="{P}d{i}" class="{P}a" opacity="0"><circle r="6" fill="{[YEL, TEAL, CORAL][i % 3]}"/></g></g>'
        tl.k(f'#{P}d{i}', [(0, 'opacity:0;transform:translate(0px,0px) scale(1)', STEP), (.14, 'opacity:1;transform:translate(0px,0px) scale(1)', OUT), (.6, f'opacity:0;transform:translate({x:.0f}px,{y:.0f}px) scale(.3)')])
    body = f'''<defs><radialGradient id="{P}gl"><stop offset="0" stop-color="#FFE7A3" stop-opacity=".9"/><stop offset="1" stop-color="#FFE7A3" stop-opacity="0"/></radialGradient>
 <linearGradient id="{P}sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE07A"/><stop offset="1" stop-color="#F2A900"/></linearGradient>
 <clipPath id="{P}clip"><g transform="translate({CX} {CY})">{star5(96, '#000', 46)}</g></clipPath></defs>
<g transform="translate({CX} {CY})"><g id="{P}glow" class="{P}a" opacity="0"><circle r="190" fill="url(#{P}gl)"/></g></g>
<g transform="translate({CX} {CY})"><g id="{P}ring" class="{P}a" opacity="0"><circle r="80" fill="none" stroke="{YEL}" stroke-width="7"/></g></g>
{dots}{rays}
<g transform="translate({CX} {CY})"><g id="{P}star" class="{P}a" opacity="0">
 <g transform="translate(0 7)">{star5(100, '#D48A00', 48, 'stroke="#D48A00" stroke-width="14"')}</g>
 {star5(100, f'url(#{P}sg)', 48, 'stroke="#FFC21A" stroke-width="14"')}
 {star5(58, '#FFE58F', 28, 'opacity=".55"')}
 <ellipse cx="-30" cy="-30" rx="16" ry="9" fill="#fff" opacity=".6" transform="rotate(-35 -30 -30)"/>
</g></g>
<g clip-path="url(#{P}clip)"><g id="{P}shine"><polygon points="{CX-30},{CY-120} {CX+6},{CY-120} {CX-24},{CY+120} {CX-60},{CY+120}" fill="#fff" opacity=".5"/></g></g>'''
    write('fx07-star-burst', P, 'Star burst', tl.out(), body)
    CUES['fx07-star-burst'] = dict(T=Tt, pop=.04, rays=.1, shine=.45, sound='ui-success-small', sound_at=.04, haptic='Haptics.impactAsync(ImpactFeedbackStyle.Medium)', loop=False)

# ───────── FX08 · Badge reveal ─────────
def fx08():
    P = 'f8-'; Tt = 3.2; tl = TL(Tt, P); BX, BY = 300, 250
    tl.k(f'#{P}badge', [(0, 'opacity:0;transform:translateY(40px) scale(.2,.2)', STEP), (.1, 'opacity:1;transform:translateY(40px) scale(.2,.2)', OUT),
                        (.42, 'opacity:1;transform:translateY(-10px) scale(1.08,1.08)', IO), (.58, 'opacity:1;transform:translateY(0px) scale(1,1)')])
    tl.k(f'#{P}flip', [(0, 'transform:scaleX(1)'), (.1, 'transform:scaleX(0.15)', LIN), (.24, 'transform:scaleX(-1)', LIN), (.38, 'transform:scaleX(0.15)', LIN), (.52, 'transform:scaleX(1)', BACK), (.7, 'transform:scaleX(1)')])
    tl.k(f'#{P}rays', [(0, 'opacity:0;transform:rotate(0deg) scale(.6)'), (.45, 'opacity:0;transform:rotate(0deg) scale(.6)', OUT), (.8, 'opacity:.8;transform:rotate(12deg) scale(1)', LIN), (Tt, 'opacity:.8;transform:rotate(60deg) scale(1)')])
    tl.k(f'#{P}shine', [(0, 'transform:translateX(-200px)'), (.75, 'transform:translateX(-200px)', IO), (1.2, 'transform:translateX(200px)')])
    tl.k(f'#{P}rib', [(0, 'opacity:0;transform:scaleX(0)', STEP), (.5, 'opacity:1;transform:scaleX(0)', BACK), (.8, 'opacity:1;transform:scaleX(1)')])
    tl.k(f'#{P}t1', [(0, 'opacity:0;transform:translateY(16px)', STEP), (.8, 'opacity:0;transform:translateY(16px)', OUT), (1.1, 'opacity:1;transform:translateY(0px)')])
    tl.k(f'#{P}t2', [(0, 'opacity:0;transform:translateY(16px)', STEP), (.95, 'opacity:0;transform:translateY(16px)', OUT), (1.25, 'opacity:1;transform:translateY(0px)')])
    sp = ''
    for i, (dx, dy, r, c) in enumerate([(-150, -90, 16, YEL), (148, -110, 13, TEAL), (160, 30, 18, YEL), (-150, 60, 12, CORAL), (-70, -165, 11, PURP), (90, 150, 13, YEL)]):
        sp += f'<g transform="translate({BX+dx} {BY+dy})"><g id="{P}s{i}" class="{P}a" opacity="0">{star4(r, c)}</g></g>'
        sparkle_pop(tl, f'#{P}s{i}', .55 + .1 * i)
    rays = ''.join(f'<polygon points="0,0 {230*math.cos(math.radians(a-6)):.0f},{230*math.sin(math.radians(a-6)):.0f} {230*math.cos(math.radians(a+6)):.0f},{230*math.sin(math.radians(a+6)):.0f}" fill="url(#{P}rayg)"/>' for a in range(0, 360, 30))
    # round medal: scalloped rim (16 bumps), purple face, brackets motif = code badge
    scal = ' '.join(f'{(112 if i % 2 == 0 else 102) * math.cos(math.pi * i / 16):.1f},{(112 if i % 2 == 0 else 102) * math.sin(math.pi * i / 16):.1f}' for i in range(32))
    medal = f'''<g transform="translate(0 6)"><polygon points="{scal}" fill="#C27F00" stroke="#C27F00" stroke-width="10" stroke-linejoin="round"/></g>
 <polygon points="{scal}" fill="url(#{P}gold)" stroke="#FFC21A" stroke-width="10" stroke-linejoin="round"/>
 <circle r="84" fill="url(#{P}purp)"/><circle r="84" fill="none" stroke="#C4B5FD" stroke-width="3" opacity=".6"/><circle r="70" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 9" opacity=".35"/>
 <path d="M-26 -22 L-48 0 L-26 22 M26 -22 L48 0 L26 22 M10 -32 L-10 32" fill="none" stroke="#FFD54A" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
 <ellipse cx="-44" cy="-50" rx="18" ry="9" fill="#fff" opacity=".35" transform="rotate(-35 -44 -50)"/>'''
    body = f'''<defs>
 <linearGradient id="{P}rayg" x1="0" x2="1"><stop offset="0" stop-color="#C4B5FD" stop-opacity=".6"/><stop offset="1" stop-color="#C4B5FD" stop-opacity="0"/></linearGradient>
 <linearGradient id="{P}gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE07A"/><stop offset="1" stop-color="#F2A900"/></linearGradient>
 <linearGradient id="{P}purp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A78BFA"/><stop offset=".55" stop-color="#7C3AED"/><stop offset="1" stop-color="#5B21B6"/></linearGradient>
 <clipPath id="{P}clip"><circle cx="{BX}" cy="{BY}" r="112"/></clipPath></defs>
<g transform="translate({BX} {BY})"><g id="{P}rays" class="{P}a" opacity="0">{rays}</g></g>
<g transform="translate({BX} {BY})"><g id="{P}badge" class="{P}a" opacity="0">
 <g id="{P}flip" class="{P}a" style="transform-origin:50% 50%">{medal}</g>
 <g transform="translate(0 100)"><g id="{P}rib" class="{P}a" opacity="0">
  <path d="M-128 -4 L-158 -4 L-142 20 L-158 44 L-108 44Z" fill="#B0372F"/><path d="M128 -4 L158 -4 L142 20 L158 44 L108 44Z" fill="#B0372F"/>
  <rect x="-130" y="-14" width="260" height="50" rx="12" fill="{CORAL}"/>{T(0, 20, 25, 'LOOP MASTER', '#fff', extra='letter-spacing="2"')}</g></g>
</g></g>
<g clip-path="url(#{P}clip)"><g id="{P}shine"><polygon points="{BX-40},{BY-130} {BX},{BY-130} {BX-30},{BY+130} {BX-70},{BY+130}" fill="#fff" opacity=".45"/><polygon points="{BX+18},{BY-130} {BX+30},{BY-130} {BX},{BY+130} {BX-12},{BY+130}" fill="#fff" opacity=".35"/></g></g>
{sp}
<g id="{P}t1">{T(300, 470, 50, 'Badge earned!', PURP)}</g>
<g id="{P}t2">{T(300, 516, 24, 'You finished 5 loop lessons', SLATE)}</g>'''
    write('fx08-badge-reveal', P, 'Badge reveal', tl.out(), body)
    CUES['fx08-badge-reveal'] = dict(T=Tt, pop=.1, land=.58, ribbon=.5, shine=.75, title=.8, sound='ui-badge-earned', sound_at=.02, haptic='Haptics.notificationAsync(NotificationFeedbackType.Success)', loop=False)

# ───────── FX09 · Trophy reveal ─────────
def fx09():
    P = 'f9-'; Tt = 3.4; tl = TL(Tt, P); CX, CY = 300, 260
    tl.k(f'#{P}tro', [(0, 'opacity:0;transform:translateY(260px) scale(.7)', STEP), (.15, 'opacity:1;transform:translateY(260px) scale(.7)', OUT),
                      (.6, 'opacity:1;transform:translateY(-18px) scale(1.04)', IO), (.78, 'opacity:1;transform:translateY(0px) scale(1)')])
    tl.k(f'#{P}sq', [(0, 'transform:scale(1,1)'), (.6, 'transform:scale(.96,1.05)', IO), (.74, 'transform:scale(1.06,.94)', IO), (.9, 'transform:scale(1,1)')])
    tl.k(f'#{P}glow', [(0, 'opacity:0;transform:scale(.5)'), (.45, 'opacity:0;transform:scale(.5)', OUT), (.9, 'opacity:1;transform:scale(1)')])
    tl.k(f'#{P}rays', [(0, 'opacity:0;transform:rotate(0deg)'), (.6, 'opacity:0;transform:rotate(0deg)', OUT), (.95, 'opacity:.85;transform:rotate(10deg)', LIN), (Tt, 'opacity:.85;transform:rotate(55deg)')])
    tl.k(f'#{P}shine', [(0, 'transform:translateX(-180px)'), (.95, 'transform:translateX(-180px)', IO), (1.4, 'transform:translateX(180px)')])
    tl.k(f'#{P}t1', [(0, 'opacity:0;transform:scale(.5)', STEP), (1.0, 'opacity:1;transform:scale(.5)', BACK), (1.3, 'opacity:1;transform:scale(1)')])
    tl.k(f'#{P}t2', [(0, 'opacity:0;transform:translateY(14px)', STEP), (1.2, 'opacity:0;transform:translateY(14px)', OUT), (1.5, 'opacity:1;transform:translateY(0px)')])
    cf = confetti_pieces(tl, P, 26, 300, 200, .82, 9, spread=(-150, -30), speed=(380, 640), life=2.0, scale=.9)
    sp = ''
    for i, (dx, dy, r, c) in enumerate([(-140, -110, 16, YEL), (130, -130, 12, '#fff'), (150, -10, 18, YEL), (-150, 20, 12, '#fff')]):
        sp += f'<g transform="translate({CX+dx} {CY+dy})"><g id="{P}s{i}" class="{P}a" opacity="0">{star4(r, c)}</g></g>'
        sparkle_pop(tl, f'#{P}s{i}', .9 + .12 * i)
    rays = ''.join(f'<polygon points="0,0 {240*math.cos(math.radians(a-7)):.0f},{240*math.sin(math.radians(a-7)):.0f} {240*math.cos(math.radians(a+7)):.0f},{240*math.sin(math.radians(a+7)):.0f}" fill="url(#{P}rayg)"/>' for a in range(0, 360, 30))
    cup = f'''<path d="M-62 -96 C-112 -96 -118 -36 -66 -20" fill="none" stroke="#E09A00" stroke-width="16" stroke-linecap="round"/>
 <path d="M62 -96 C112 -96 118 -36 66 -20" fill="none" stroke="#E09A00" stroke-width="16" stroke-linecap="round"/>
 <path d="M-78 -112 H78 C78 -30 46 6 0 10 C-46 6 -78 -30 -78 -112Z" fill="url(#{P}gold)"/>
 <path d="M-78 -112 H78 V-100 H-78Z" fill="#FFE58F"/>
 <path d="M-14 8 H14 L18 52 H-18Z" fill="#E09A00"/>
 <rect x="-62" y="50" width="124" height="22" rx="8" fill="#F2A900"/>
 <rect x="-78" y="70" width="156" height="40" rx="12" fill="{PURP}"/><rect x="-78" y="70" width="156" height="10" rx="5" fill="#A78BFA" opacity=".7"/>
 <g transform="translate(0 -56)">{star5(26, '#FFF1B8', 12)}</g>
 <path d="M-56 -100 C-56 -58 -44 -30 -26 -14" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".45"/>'''
    body = f'''<defs>
 <radialGradient id="{P}glowg"><stop offset="0" stop-color="#FFE7A3" stop-opacity=".95"/><stop offset=".6" stop-color="#FFF3C4" stop-opacity=".45"/><stop offset="1" stop-color="#FFF3C4" stop-opacity="0"/></radialGradient>
 <linearGradient id="{P}rayg" x1="0" x2="1"><stop offset="0" stop-color="#FFD54A" stop-opacity=".55"/><stop offset="1" stop-color="#FFD54A" stop-opacity="0"/></linearGradient>
 <linearGradient id="{P}gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE07A"/><stop offset=".6" stop-color="#FFC21A"/><stop offset="1" stop-color="#F2A900"/></linearGradient>
 <clipPath id="{P}clip"><path d="M{CX-78} {CY-112} H{CX+78} C{CX+78} {CY-30} {CX+46} {CY+6} {CX} {CY+10} C{CX-46} {CY+6} {CX-78} {CY-30} {CX-78} {CY-112}Z"/></clipPath></defs>
<g transform="translate({CX} {CY-20})"><g id="{P}glow" class="{P}a" opacity="0"><circle r="210" fill="url(#{P}glowg)"/></g></g>
<g transform="translate({CX} {CY-40})"><g id="{P}rays" class="{P}a" opacity="0">{rays}</g></g>
<g id="{P}cf">{cf}</g>
<g transform="translate({CX} {CY})"><g id="{P}tro" class="{P}a" opacity="0"><g id="{P}sq" class="{P}a" style="transform-origin:50% 100%">{cup}</g></g></g>
<g clip-path="url(#{P}clip)"><g id="{P}shine"><polygon points="{CX-40},{CY-130} {CX-4},{CY-130} {CX-34},{CY+30} {CX-70},{CY+30}" fill="#fff" opacity=".5"/></g></g>
{sp}
<g transform="translate(300 470)"><g id="{P}t1" class="{P}a" opacity="0">{T(0, 0, 58, 'Champion!', PURP)}</g></g>
<g id="{P}t2" opacity="0">{T(300, 520, 26, 'Lagos Junior League · Week 3', SLATE)}</g>'''
    write('fx09-trophy-reveal', P, 'Trophy reveal', tl.out(), body)
    CUES['fx09-trophy-reveal'] = dict(T=Tt, rise=[.15, .6], land=.74, confetti=.82, title=1.0, sound='ui-match-win', sound_at=.36, haptic='Haptics.notificationAsync(NotificationFeedbackType.Success)', loop=False)

# ───────── FX10 · Streak flame (idle loop) ─────────
FLAME_O = 'M300 62 C334 104 380 132 376 186 C373 228 340 252 300 252 C260 252 226 228 224 188 C222 152 244 132 258 108 C264 134 274 146 286 150 C284 118 288 90 300 62Z'
FLAME_M = 'M302 116 C322 142 346 160 344 194 C342 224 324 240 300 240 C276 240 258 224 258 198 C258 176 270 162 280 148 C284 166 292 174 300 176 C296 156 296 136 302 116Z'
FLAME_C = 'M300 166 C314 184 324 196 322 212 C320 228 312 236 300 236 C288 236 280 228 279 214 C278 198 290 186 300 166Z'
def fx10():
    P = 'f10-'; Tt = 1.8; tl = TL(Tt, P)   # loop-safe: every track starts and ends on the same value
    fl = [(0, 'transform:scale(1,1) skewX(0deg)', IO), (.3, 'transform:scale(1.04,.96) skewX(2deg)', IO), (.6, 'transform:scale(.97,1.05) skewX(-2deg)', IO),
          (.9, 'transform:scale(1.03,.98) skewX(1.5deg)', IO), (1.2, 'transform:scale(.98,1.04) skewX(-1.5deg)', IO), (1.5, 'transform:scale(1.02,.99) skewX(1deg)', IO), (1.8, 'transform:scale(1,1) skewX(0deg)')]
    tl.k(f'#{P}flick', fl)
    tl.k(f'#{P}mid', [(0, 'transform:scale(1,1)', IO), (.45, 'transform:scale(.95,1.06)', IO), (.9, 'transform:scale(1.04,.96)', IO), (1.35, 'transform:scale(.97,1.04)', IO), (1.8, 'transform:scale(1,1)')])
    tl.k(f'#{P}core', [(0, 'transform:scale(1,1)', IO), (.3, 'transform:scale(1.06,.93)', IO), (.6, 'transform:scale(.95,1.07)', IO), (.9, 'transform:scale(1.05,.95)', IO), (1.2, 'transform:scale(.96,1.06)', IO), (1.5, 'transform:scale(1.04,.96)', IO), (1.8, 'transform:scale(1,1)')])
    tl.k(f'#{P}halo', [(0, 'opacity:.75;transform:scale(1)', IO), (.9, 'opacity:1;transform:scale(1.07)', IO), (1.8, 'opacity:.75;transform:scale(1)')])
    emb = ''
    for i, (dx, r, t0) in enumerate([(-34, 5, 0), (26, 4, .45), (-8, 6, .9), (38, 3.5, 1.2), (-44, 4, 1.5)]):
        emb += f'<circle id="{P}e{i}" cx="{300+dx}" cy="{120}" r="{r+1.5}" fill="{YEL}" opacity="0"/>'
        # each ember lives 0.9 s, wrapping across the loop end
        a, b = t0, t0 + .9
        if b <= Tt: tl.k(f'#{P}e{i}', [(0, 'opacity:0;transform:translateY(0px)', STEP), (a, 'opacity:1;transform:translateY(0px)', OUT), (b, 'opacity:0;transform:translateY(-110px)', STEP)])
        else:
            m = Tt - a; f = m / .9
            tl.k(f'#{P}e{i}', [(0, f'opacity:{1-f:.2f};transform:translateY({-110*f:.0f}px)', OUT), (b - Tt, 'opacity:0;transform:translateY(-110px)', STEP), (a, 'opacity:1;transform:translateY(0px)', OUT), (Tt, f'opacity:{1-f:.2f};transform:translateY({-110*f:.0f}px)')])
    body = f'''<defs>
 <linearGradient id="{P}fo" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF6B6B"/><stop offset=".55" stop-color="#FF8A1F"/><stop offset="1" stop-color="#FFB700"/></linearGradient>
 <linearGradient id="{P}fm" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF8A1F"/><stop offset="1" stop-color="#FFD54A"/></linearGradient>
 <radialGradient id="{P}halo"><stop offset="0" stop-color="#FFE7A3" stop-opacity=".8"/><stop offset="1" stop-color="#FFE7A3" stop-opacity="0"/></radialGradient></defs>
<g transform="translate(300 300) scale(1.55) translate(-300 -170)">
 <g id="{P}halo" class="{P}a"><ellipse cx="300" cy="170" rx="130" ry="120" fill="url(#{P}halo)"/></g>
 <g id="{P}flick" class="{P}a" style="transform-origin:50% 100%">
  <path d="{FLAME_O}" fill="url(#{P}fo)"/>
  <g id="{P}mid" class="{P}a" style="transform-origin:50% 100%"><path d="{FLAME_M}" fill="url(#{P}fm)"/></g>
  <g id="{P}core" class="{P}a" style="transform-origin:50% 100%"><path d="{FLAME_C}" fill="#FFF1B8"/></g>
 </g>
 <g id="{P}embers">{emb}</g>
</g>'''
    write('fx10-streak-flame-idle', P, 'Streak flame, idle loop', tl.out(), body, rm=f'#{P}embers circle{{opacity:0}}')
    CUES['fx10-streak-flame-idle'] = dict(T=Tt, loop=True, sound=None, haptic=None, note='silent ambient loop; pair with fx05 / ui-success-small when the streak increments')

# ───────── FX11 · Loading spinner (brand) ─────────
def gear_path(ro=30, ri=22, n=8, hole=10):
    pts = []
    for i in range(n * 4):
        a = (i / (n * 4)) * 2 * math.pi; r = ro if (i % 4) in (1, 2) else ri
        pts.append(f'{r*math.cos(a):.1f},{r*math.sin(a):.1f}')
    return 'M' + ' L'.join(pts) + f'Z M{hole} 0 A{hole} {hole} 0 1 0 {-hole} 0 A{hole} {hole} 0 1 0 {hole} 0Z'
def fx11():
    P = 'f11-'; Tt = 1.2; tl = TL(Tt, P)
    tl.k(f'#{P}arc', [(0, 'transform:rotate(0deg)', LIN), (Tt, 'transform:rotate(360deg)')])
    tl.k(f'#{P}arc2', [(0, 'stroke-dasharray:16 84;transform:rotate(0deg)', IO), (.6, 'stroke-dasharray:52 48;transform:rotate(80deg)', IO), (1.2, 'stroke-dasharray:16 84;transform:rotate(360deg)')])
    tl.k(f'#{P}gear', [(0, 'transform:rotate(0deg)', LIN), (Tt, 'transform:rotate(-90deg)')])   # 8 teeth → 90° is seamless
    for i in range(3):
        tl.k(f'#{P}dot{i}', [(0, 'transform:scale(.6)', IO), (.2 + .2 * i, 'transform:scale(1.15)', IO), (.6 + .2 * i, 'transform:scale(.6)', IO), (Tt, 'transform:scale(.6)')])
    body = f'''<g transform="translate(300 270)">
 <circle r="100" fill="none" stroke="#E6F9F7" stroke-width="22"/>
 <g id="{P}arc" class="{P}a" style="transform-origin:50% 50%"><g transform="rotate(-90)">
  <circle id="{P}arc2" r="100" fill="none" stroke="{TEAL}" stroke-width="22" stroke-linecap="round" pathLength="100" stroke-dasharray="16 84" style="transform-box:view-box;transform-origin:0 0"/>
 </g></g>
 <circle r="58" fill="#fff"/><circle r="58" fill="none" stroke="#E2E8F0" stroke-width="3"/>
 <g id="{P}gear" class="{P}a"><path d="{gear_path()}" fill="{YEL}" fill-rule="evenodd"/></g>
</g>
<g transform="translate(300 440)">{''.join(f'<g transform="translate({-30 + 30 * i} 0)"><g id="{P}dot{i}" class="{P}a"><circle r="9" fill="{[TEAL, PURP, YEL][i]}"/></g></g>' for i in range(3))}</g>'''
    write('fx11-loading-spinner', P, 'Loading', tl.out(), body)
    CUES['fx11-loading-spinner'] = dict(T=Tt, loop=True, sound=None, haptic=None, note='silent loop; scales down to 32 px (use the static for < 32 px)')

# ───────── FX12 · Pull to refresh ─────────
def fx12():
    P = 'f12-'; Tt = 2.6; tl = TL(Tt, P)
    # 0–0.8 pull (scrub by drag distance), 0.8 release snap, 0.9–1.9 refreshing spin, 1.9 done check, 2.3 retract
    tl.k(f'#{P}puck', [(0, 'transform:translateY(-120px)', IO), (.8, 'transform:translateY(0px)', OUT), (.92, 'transform:translateY(-14px)', IO), (1.0, 'transform:translateY(0px)'),
                       (2.2, 'transform:translateY(0px)', IN), (2.5, 'transform:translateY(-140px)')])
    tl.k(f'#{P}rot', [(0, 'transform:rotate(-180deg)', IO), (.8, 'transform:rotate(0deg)', LIN), (1.9, 'transform:rotate(720deg)', STEP), (Tt, 'transform:rotate(720deg)')])
    tl.k(f'#{P}arrow', [(0, 'opacity:1;transform:scale(1)'), (1.85, 'opacity:1;transform:scale(1)', IN), (1.95, 'opacity:0;transform:scale(.4)', STEP)])
    tl.k(f'#{P}check', [(0, 'opacity:0;transform:scale(0)', STEP), (1.92, 'opacity:1;transform:scale(0)', BACK), (2.15, 'opacity:1;transform:scale(1)')])
    tl.k(f'#{P}disc', [(0, f'fill:#fff'), (1.9, 'fill:#fff', OUT), (2.0, f'fill:{GREEN}')])
    tl.k(f'#{P}stretch', [(0, 'transform:scaleY(0)', IO), (.8, 'transform:scaleY(1)', OUT), (.95, 'transform:scaleY(0)')])
    tl.k(f'#{P}list', [(0, 'transform:translateY(0px)', IO), (.8, 'transform:translateY(110px)', OUT), (.98, 'transform:translateY(84px)', IO), (2.2, 'transform:translateY(84px)', IN), (2.5, 'transform:translateY(0px)')])
    tl.k(f'#{P}t', [(0, 'opacity:0', STEP), (1.95, 'opacity:1', OUT), (2.25, 'opacity:0')])
    rows = ''.join(card(70, 150 + 120 * i, 460, 96, 24) + f'<circle cx="122" cy="{198+120*i}" r="26" fill="{["#E6F9F7", "#EDE7FB", "#FFF6DB"][i]}"/>'
                   f'<rect x="166" y="{180+120*i}" width="{[230, 190, 250][i]}" height="16" rx="8" fill="#E2E8F0"/><rect x="166" y="{206+120*i}" width="{[150, 210, 120][i]}" height="12" rx="6" fill="#EEF1F5"/>' for i in range(3))
    arrows = (f'<path d="M4 -24 A24 24 0 1 1 -20.8 -12" fill="none" stroke="{BTN}" stroke-width="8" stroke-linecap="round"/>'
              f'<path d="M-2 -35 L12 -24 L-2 -13Z" fill="{BTN}" stroke="{BTN}" stroke-width="4" stroke-linejoin="round"/>')
    body = f'''<g id="{P}list">{rows}</g>
<g transform="translate(300 40)"><g id="{P}stretch" class="{P}a" style="transform-origin:50% 0%"><rect x="-4" y="0" width="8" height="40" rx="4" fill="#CBD5E1"/></g></g>
<g id="{P}puck"><g transform="translate(300 100)">
 <circle r="44" cy="4" fill="{INK}" opacity=".08"/><circle id="{P}disc" r="44" fill="#fff" stroke="#E2E8F0" stroke-width="3"/>
 <g id="{P}rot" class="{P}a"><g id="{P}arrow" class="{P}a">{arrows}</g></g>
 <g id="{P}check" class="{P}a" opacity="0"><path d="M-17 1 L-5 13 L18 -12" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></g>
</g></g>
<g id="{P}t" opacity="0">{T(300, 186, 22, 'Up to date', G_TXT)}</g>'''
    write('fx12-pull-to-refresh', P, 'Pull to refresh', tl.out(), body)
    CUES['fx12-pull-to-refresh'] = dict(T=Tt, pull=[0, .8], release=.8, spin=[.9, 1.9], done=1.92, retract=[2.2, 2.5], sound='ui-tap', sound_at=.8, done_sound='ui-success-small',
                                        haptic='Haptics.impactAsync(ImpactFeedbackStyle.Light) on release', loop=False, note='scrub 0–0.8 s with the pull distance; loop the spin segment while loading')

# ───────── FX13 · Skeleton shimmer ─────────
def fx13():
    P = 'f13-'; Tt = 1.4; tl = TL(Tt, P)
    tl.k(f'#{P}band', [(0, 'transform:translateX(-520px)', IO), (1.2, 'transform:translateX(520px)', STEP), (Tt, 'transform:translateX(520px)')])
    shapes = []
    for i in range(2):
        y = 70 + i * 250
        shapes += [f'<rect x="60" y="{y}" width="480" height="140" rx="22"/>', f'<circle cx="112" cy="{y+196}" r="26"/>',
                   f'<rect x="156" y="{y+178}" width="300" height="16" rx="8"/>', f'<rect x="156" y="{y+204}" width="200" height="14" rx="7"/>']
    sk = ''.join(s.replace('/>', ' fill="#E2E8F0"/>') for s in shapes)
    body = f'''<defs><clipPath id="{P}clip">{''.join(shapes)}</clipPath>
 <linearGradient id="{P}g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
{card(40, 50, 520, 230, 30)}{card(40, 300, 520, 230, 30)}
{sk}
<g clip-path="url(#{P}clip)"><g id="{P}band"><rect x="160" y="0" width="280" height="600" fill="url(#{P}g)" transform="skewX(-12)"/></g></g>'''
    write('fx13-skeleton-shimmer', P, 'Loading placeholder', tl.out(), body)
    CUES['fx13-skeleton-shimmer'] = dict(T=Tt, loop=True, sound=None, haptic=None, note='skeleton colour #E2E8F0, band white 75 %; reduced motion = no band')

# ───────── FX14 · Progress ring ─────────
def fx14():
    P = 'f14-'; Tt = 2.8; tl = TL(Tt, P); R = 150; PCT = 75; t0, t1 = .2, 1.6
    tl.k(f'#{P}prog', [(0, 'stroke-dashoffset:100'), (t0, 'stroke-dashoffset:100', OUT), (t1, f'stroke-dashoffset:{100-PCT}')])
    tl.k(f'#{P}cap', [(0, 'transform:rotate(0deg)'), (t0, 'transform:rotate(0deg)', OUT), (t1, f'transform:rotate({360*PCT/100}deg)')])
    tl.k(f'#{P}pulse', [(0, 'opacity:0;transform:scale(1)', STEP), (t1, 'opacity:.8;transform:scale(1)', OUT), (t1 + .5, 'opacity:0;transform:scale(1.14)')])
    tl.k(f'#{P}num', [(0, 'transform:scale(1)'), (t1, 'transform:scale(1)', BACK), (t1 + .12, 'transform:scale(1.12)', IO), (t1 + .3, 'transform:scale(1)')])
    sp = f'<g transform="translate({300+R*math.cos(math.radians(PCT/100*360-90)):.0f} {280+R*math.sin(math.radians(PCT/100*360-90)):.0f})"><g id="{P}sp" class="{P}a" opacity="0">{star4(22, YEL)}</g></g>'
    sparkle_pop(tl, f'#{P}sp', t1)
    # number steps 0..75 following the same ease-out as the ring (cubic-bezier .22,1,.36,1 ≈ 1-(1-x)^3.2)
    nums = ''; steps = list(range(0, PCT + 1, 5))
    def tt_of(v):
        f = v / PCT; x = 1 - (1 - f) ** (1 / 3.2); return t0 + (t1 - t0) * x
    for k, v in enumerate(steps):
        nums += f'<g id="{P}n{k}" opacity="{1 if v == PCT else 0}">{T(300, 300, 76, f"{v}%")}</g>'
        a = 0 if k == 0 else tt_of(v); b = tt_of(steps[k + 1]) if k + 1 < len(steps) else Tt + 1
        tl.show(f'#{P}n{k}', [(a, b)])
    body = f'''<g transform="translate(300 280)">
 <g id="{P}pulse" class="{P}a" opacity="0"><circle r="{R}" fill="none" stroke="{TEAL}" stroke-width="10" opacity=".5"/></g>
 <circle r="{R}" fill="none" stroke="#E6F9F7" stroke-width="30"/>
 <g transform="rotate(-90)"><circle id="{P}prog" r="{R}" fill="none" stroke="{TEAL}" stroke-width="30" stroke-linecap="round" pathLength="100" stroke-dasharray="100 100" stroke-dashoffset="{100-PCT}"/></g>
 <g id="{P}cap" class="{P}a" style="transform-box:view-box;transform-origin:0 0"><circle cx="0" cy="{-R}" r="9" fill="#fff"/></g>
</g>
<g id="{P}num" class="{P}a">{nums}</g>
{T(300, 342, 24, 'of today’s goal', SLATE)}
{sp}'''
    write('fx14-progress-ring', P, 'Progress ring', tl.out(), body)
    CUES['fx14-progress-ring'] = dict(T=Tt, fill=[t0, t1], value=PCT, done=t1, sound='ui-success-small', sound_at=t1, haptic='Haptics.selectionAsync() at done', loop=False,
                                      note='drive with pathLength=100: strokeDashoffset = 100 - percent; rotate cap by 3.6 × percent deg')

# ───────── FX15 · Content-pack download meter ─────────
def fx15():
    P = 'f15-'; Tt = 3.6; tl = TL(Tt, P); BX, BY, BW = 120, 330, 360; t0, t1 = .3, 2.4
    tl.k(f'#{P}bar', [(0, 'width:0px'), (t0, 'width:0px', 'cubic-bezier(.3,.1,.6,1)'), (t1, f'width:{BW}px')])
    tl.k(f'#{P}stripes', [(0, 'transform:translateX(0px)', LIN), (Tt, 'transform:translateX(144px)')])
    tl.k(f'#{P}barfill', [(0, f'fill:{TEAL}'), (t1, f'fill:{TEAL}', OUT), (t1 + .15, f'fill:{GREEN}')])
    tl.k(f'#{P}stripeg', [(0, 'opacity:1'), (t1, 'opacity:1', OUT), (t1 + .1, 'opacity:0')])
    tl.k(f'#{P}dl', [(0, 'transform:translateY(0px)', IO), (.4, 'transform:translateY(6px)', IO), (.8, 'transform:translateY(0px)', IO), (1.2, 'transform:translateY(6px)', IO), (1.6, 'transform:translateY(0px)', IO),
                     (2.0, 'transform:translateY(6px)', IO), (2.4, 'transform:translateY(0px)')])
    tl.k(f'#{P}dlg', [(0, 'opacity:1;transform:scale(1)'), (t1, 'opacity:1;transform:scale(1)', IN), (t1 + .1, 'opacity:0;transform:scale(.4)', STEP)])
    tl.k(f'#{P}ok', [(0, 'opacity:0;transform:scale(0)', STEP), (t1 + .08, 'opacity:1;transform:scale(0)', BACK), (t1 + .35, 'opacity:1;transform:scale(1)')])
    tl.k(f'#{P}card', [(0, 'transform:scale(1)'), (t1, 'transform:scale(1)', OUT), (t1 + .12, 'transform:scale(1.03)', IO), (t1 + .32, 'transform:scale(1)')])
    tl.k(f'#{P}box', [(0, 'transform:rotate(0deg)'), (t1 + .05, 'transform:rotate(0deg)', IO), (t1 + .15, 'transform:rotate(-8deg)', IO), (t1 + .25, 'transform:rotate(6deg)', IO), (t1 + .35, 'transform:rotate(0deg)')])
    tl.show(f'#{P}busy', [(0, t1 + .05)]); tl.show(f'#{P}done', [(t1 + .05, Tt + 1)])
    sp = ''
    for i, (x, y, r, c) in enumerate([(520, 214, 14, YEL), (90, 230, 11, TEAL), (470, 440, 12, CORAL)]):
        sp += f'<g transform="translate({x} {y})"><g id="{P}s{i}" class="{P}a" opacity="0">{star4(r, c)}</g></g>'
        sparkle_pop(tl, f'#{P}s{i}', t1 + .1 + .08 * i)
    # percent + MB counters (10 steps)
    pct = ''; mb = ''; N = 10
    ease = lambda x: 1 - (1 - x) ** 1.8
    for k in range(N + 1):
        a = 0 if k == 0 else t0 + (t1 - t0) * (1 - (1 - k / N) ** (1 / 1.8)); b = t0 + (t1 - t0) * (1 - (1 - (k + 1) / N) ** (1 / 1.8)) if k < N else Tt + 1
        pct += f'<g id="{P}p{k}" opacity="{1 if k == N else 0}">{T(BX + BW, 312, 26, f"{k*10}%", INK, "end")}</g>'
        mb += f'<g id="{P}m{k}" opacity="{1 if k == N else 0}">{T(BX, 400, 20, f"{48*k/N:.1f} of 48 MB", SLATE, "start")}</g>'
        tl.show(f'#{P}p{k}', [(a, b)]); tl.show(f'#{P}m{k}', [(a, b)])
    stripes = ''.join(f'<path d="M{BX - 144 + 24*i} {BY+22} l12 -22 h12 l-12 22z" fill="#fff" opacity=".28"/>' for i in range(24))
    body = f'''<g id="{P}card" class="{P}a">{card(70, 150, 460, 300, 30)}
 <g transform="translate(150 228)"><g id="{P}box" class="{P}a">
  <path d="M-46 -16 L0 -38 L46 -16 L46 30 L0 52 L-46 30Z" fill="#FFB700"/><path d="M-46 -16 L0 6 L46 -16 L0 -38Z" fill="#FFD54A"/><path d="M0 6 L0 52 L-46 30 L-46 -16Z" fill="#E09A00"/>
  <path d="M-23 -27 L23 -5 L23 12" fill="none" stroke="#FFF1B8" stroke-width="7" stroke-linejoin="round"/></g></g>
 {T(222, 218, 30, 'Adventure Pack', INK, 'start')}
 {T(222, 252, 20, '5 lessons · Obudu Ranch', SLATE, 'start')}
 <g id="{P}busy">{pct}</g><g id="{P}done" opacity="0">{T(BX + BW, 312, 24, 'Ready offline', G_TXT, 'end')}</g>
 {T(BX, 312, 22, 'Downloading', SLATE, 'start').replace('Downloading', '<tspan id="' + P + 'lbl">Downloading…</tspan>')}
 <rect x="{BX}" y="{BY}" width="{BW}" height="22" rx="11" fill="#EEF1F5"/>
 <defs><clipPath id="{P}clip"><rect id="{P}bar" x="{BX}" y="{BY}" width="{BW}" height="22" rx="11"/></clipPath></defs>
 <g clip-path="url(#{P}clip)"><rect id="{P}barfill" x="{BX}" y="{BY}" width="{BW}" height="22" fill="{TEAL}"/><g id="{P}stripeg"><g id="{P}stripes">{stripes}</g></g></g>
 {mb}
 <g transform="translate(470 395)">
  <g id="{P}dlg" class="{P}a"><circle r="26" fill="#E6F9F7"/><g id="{P}dl"><path d="M0 -12 V8 M-9 0 L0 9 L9 0" fill="none" stroke="{BTN}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M-10 14 H10" stroke="{BTN}" stroke-width="5" stroke-linecap="round"/></g></g>
  <g id="{P}ok" class="{P}a" opacity="0"><circle r="26" fill="{GREEN}"/><path d="M-11 1 L-3 9 L12 -8" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>
 </g>
</g>{sp}'''
    # 'Downloading…' label swaps to nothing when done (the right-hand label says Ready offline)
    tl.show(f'#{P}lbl', [(0, t1 + .05)])
    write('fx15-download-meter', P, 'Content pack download', tl.out(), body)
    CUES['fx15-download-meter'] = dict(T=Tt, progress=[t0, t1], done=t1, sound='ui-download-complete', sound_at=t1, haptic='Haptics.notificationAsync(NotificationFeedbackType.Success) at done', loop=False,
                                       note='drive bar width = BW × progress; swap busy/done labels at 100 %')

for f in (fx06, fx07, fx08, fx09, fx10, fx11, fx12, fx13, fx14, fx15): f()
cp = os.path.join(HERE, 'cues.json'); cues = json.load(open(cp)) if os.path.exists(cp) else {}
for k, v in CUES.items(): v.setdefault('kind', 'fx'); cues[k] = v
json.dump(cues, open(cp, 'w'), indent=1); print('ok', list(CUES))
