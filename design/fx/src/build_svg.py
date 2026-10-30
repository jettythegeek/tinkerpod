"""Builds the 5 FX SVGs + cues.json (shared timing source for the synthesizer)."""
import math, json, os
from fxlib import *
SVG = os.path.join(os.path.dirname(__file__), '..', 'svg')
CUES = {}

def star4(r, fill, op=1):
    k = r * .2
    return f'<path d="M0 {-r} Q{k} {-k} {r} 0 Q{k} {k} 0 {r} Q{-k} {k} {-r} 0 Q{-k} {-k} 0 {-r}Z" fill="{fill}" opacity="{op}"/>'
def coin(r):
    return (f'<circle r="{r}" fill="#E09A00"/><circle r="{r*.88}" cy="{-r*.06}" fill="#FFB700"/>'
            f'<circle r="{r*.6}" cy="{-r*.06}" fill="none" stroke="#FFD54A" stroke-width="{r*.12:.1f}"/>'
            f'<g transform="translate(0 {-r*.06:.1f})">{star4(r*.34, "#FFF1B8")}</g>'
            f'<ellipse cx="{-r*.38:.1f}" cy="{-r*.42:.1f}" rx="{r*.22:.1f}" ry="{r*.12:.1f}" fill="#fff" opacity=".55" transform="rotate(-35 {-r*.38:.1f} {-r*.42:.1f})"/>')
def card(x, y, w, h, r=36, fill='#fff', sid=None, stroke=None):
    s = f' stroke="{stroke}" stroke-width="3"' if stroke else ''
    i = f' id="{sid}"' if sid else ''
    return (f'<rect x="{x}" y="{y+5}" width="{w}" height="{h}" rx="{r}" fill="#0F172A" opacity=".07"/>'
            f'<rect{i} x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"{s}/>')
def T(x, y, s, txt, fill='#0F172A', anchor='middle', extra=''):
    return f'<text x="{x}" y="{y}" font-size="{s}" fill="{fill}" text-anchor="{anchor}" {extra}>{txt}</text>'
def write(name, P, title, css, body, rm=''):
    open(os.path.join(SVG, name + '.svg'), 'w').write(svg_doc(P, title, css, body, rm))

# ───────────────────────── FX1 · XP gain + coin burst ─────────────────────────
def fx1():
    P = 'f1-'; Tt = 3.0; tl = TL(Tt, P)
    pcss, pmk = pip('happy', P + 'p-', 175, 300, 260, 0.0)
    A = [round(0.80 + 0.065 * i, 3) for i in range(8)]
    CX, CY, TX, TY = 300, 250, 418, 70
    coins = ''
    for i in range(8):
        a = math.radians(i * 45 + 22.5); bx, by = 140 * math.cos(a), 105 * math.sin(a)
        tx, ty = TX - CX, TY - CY; s0 = 0.55 + 0.02 * i
        mx, my = (bx + tx) / 2 - 30, (by + ty) / 2 - 30
        coins += f'<g transform="translate({CX} {CY})"><g id="{P}c{i}" class="{P}a">{coin(19)}</g></g>'
        tl.k(f'#{P}c{i}', [(0, 'opacity:0;transform:translate(0,0) scale(.3)', STEP),
            (0.25, 'opacity:1;transform:translate(0px,0px) scale(.3) rotate(0deg)', OUT),
            (s0, f'opacity:1;transform:translate({bx:.0f}px,{by:.0f}px) scale(1) rotate({90+i*20}deg)', 'cubic-bezier(.5,0,.9,.6)'),
            ((s0 + A[i]) / 2 + .04, f'opacity:1;transform:translate({mx:.0f}px,{my:.0f}px) scale(.85) rotate({180+i*20}deg)', LIN),
            (A[i], f'opacity:1;transform:translate({tx}px,{ty}px) scale(.62) rotate({300+i*20}deg)', STEP),
            (A[i] + .001, f'opacity:0;transform:translate({tx}px,{ty}px) scale(.62)', STEP)])
    bump = [(0, 'transform:scale(1)')]
    for a in A: bump += [(a, 'transform:scale(1.3)', OUT), (a + .06, 'transform:scale(1)')]
    tl.k(f'#{P}hudcoin', bump)
    tl.k(f'#{P}num', [(p[0], p[1].replace('1.3', '1.12')) + tuple(p[2:]) for p in bump])
    nums = ''
    for k in range(9):
        v = 120 + 5 * k
        nums += T(454, 82, 32, v, extra=f'id="{P}n{k}" opacity="{1 if k == 8 else 0}"')
        t0 = 0 if k == 0 else A[k - 1]; t1 = A[k] if k < 8 else Tt + 1
        tl.show(f'#{P}n{k}', [(t0, t1)])
    tl.k(f'#{P}pill', [(0, 'opacity:0;transform:translate(0,0) scale(0)', STEP), (0.05, 'opacity:1;transform:translate(0,0) scale(0)', BACK),
        (0.30, 'opacity:1;transform:translate(0px,0px) scale(1)'), (0.90, 'opacity:1;transform:translate(0px,0px) scale(1)', IN),
        (1.20, 'opacity:0;transform:translate(-80px,-180px) scale(.3)')])
    tl.k(f'#{P}ring', [(0, 'opacity:0;transform:scale(.4)', STEP), (0.2, 'opacity:1;transform:scale(.4)', OUT), (0.65, 'opacity:0;transform:scale(3.2)')])
    tl.k(f'#{P}xpfill', [(0, 'width:80px'), (1.2, 'width:80px', OUT), (1.7, 'width:180px')])
    tl.k(f'#{P}xpglow', [(0, 'opacity:0'), (1.2, 'opacity:0', OUT), (1.35, 'opacity:.9'), (1.9, 'opacity:0')])
    tl.k(f'#{P}spk', [(0, 'opacity:0;transform:scale(0) rotate(0deg)', STEP), (1.7, 'opacity:1;transform:scale(0) rotate(0deg)', BACK),
        (1.9, 'opacity:1;transform:scale(1.2) rotate(45deg)', IN), (2.25, 'opacity:0;transform:scale(0) rotate(120deg)')])
    tl.k(f'#{P}plus', [(0, 'opacity:0;transform:translateY(10px)', STEP), (1.28, 'opacity:1;transform:translateY(10px)', OUT),
        (1.6, 'opacity:1;transform:translateY(-6px)', IN), (2.0, 'opacity:0;transform:translateY(-16px)')])
    tl.k(f'#{P}lv', [(0, 'opacity:1'), (1.7, 'opacity:1;transform:scale(1)', BACK), (1.85, 'transform:scale(1.25)'), (2.05, 'transform:scale(1)')])
    body = f'''<defs><linearGradient id="{P}xpg" x1="0" x2="1"><stop offset="0" stop-color="#A78BFA"/><stop offset="1" stop-color="#7C3AED"/></linearGradient></defs>
<g id="{P}hud">
 <g id="{P}xpcard">{card(30, 34, 300, 72)}
  <g id="{P}lv" class="{P}a"><circle cx="68" cy="70" r="24" fill="#7C3AED"/>{T(68, 77, 18, 'XP', '#fff')}</g>
  <rect x="104" y="62" width="200" height="16" rx="8" fill="#EDE7FB"/>
  <rect id="{P}xpfill" x="104" y="62" width="180" height="16" rx="8" fill="url(#{P}xpg)"/>
  <rect id="{P}xpglow" x="98" y="56" width="212" height="28" rx="14" fill="none" stroke="#C4B5FD" stroke-width="4" opacity="0"/>
  <g transform="translate(284 70)"><g id="{P}spk" class="{P}a" opacity="0">{star4(16, '#FFB700')}</g></g>
 </g>
 <g id="{P}coincard">{card(380, 34, 190, 72)}
  <g transform="translate(418 70)"><g id="{P}hudcoin" class="{P}a">{coin(22)}</g></g>
  <g id="{P}num" class="{P}a" style="transform-origin:0% 50%">{nums}</g>
 </g>
 <g id="{P}plus" opacity="0">{T(476, 148, 30, '+40', '#E09A00')}</g>
</g>
<g id="{P}pip">{pmk}</g>
<g transform="translate({CX} {CY})"><g id="{P}ring" class="{P}a" opacity="0"><circle r="40" fill="none" stroke="#FFB700" stroke-width="8"/></g></g>
<g id="{P}coins">{coins}</g>
<g transform="translate({CX} {CY})"><g id="{P}pill" class="{P}a" opacity="0">
  <rect x="-100" y="-34" width="200" height="76" rx="38" fill="#5B21B6"/><rect x="-100" y="-40" width="200" height="76" rx="38" fill="#7C3AED"/>
  {T(0, 12, 38, '+50 XP', '#fff')}</g></g>'''
    write('fx01-xp-coins', P, 'XP gain and coin burst', pcss + tl.out(), body)
    CUES['fx01-xp-coins'] = dict(T=Tt, pop=0.05, burst=0.25, coins=A, whoosh=0.9, fill=[1.2, 1.7], sparkle=1.7, plus=1.28)

# ───────────────────────── FX2 · Level-up / badge unlock ─────────────────────────
def hexpts(cx, cy, r, rot=-90):
    return ' '.join(f'{cx + r*math.cos(math.radians(rot + 60*i)):.1f},{cy + r*math.sin(math.radians(rot + 60*i)):.1f}' for i in range(6))
def fx2():
    P = 'f2-'; Tt = 3.8; tl = TL(Tt, P); BX, BY = 215, 245
    pcss, pmk = pip('cheer', P + 'p-', 350, 105, 265, 1.2)
    rays = ''.join(f'<polygon points="0,0 {215*math.cos(math.radians(a-7)):.0f},{215*math.sin(math.radians(a-7)):.0f} {215*math.cos(math.radians(a+7)):.0f},{215*math.sin(math.radians(a+7)):.0f}" fill="url(#{P}rayg)"/>' for a in range(0, 360, 30))
    spots = [(-135, -70, 18, '#FFB700'), (128, -95, 14, '#00BFAE'), (140, 40, 20, '#FFB700'), (-128, 70, 13, '#FF6B6B'), (-60, -150, 12, '#7C3AED'), (70, 140, 15, '#FFB700')]
    sp = ''
    for i, (dx, dy, r, c) in enumerate(spots):
        sp += f'<g transform="translate({BX+dx} {BY+dy})"><g id="{P}s{i}" class="{P}a" opacity="0">{star4(r, c)}</g></g>'
        t0 = 1.0 + 0.11 * i
        tl.k(f'#{P}s{i}', [(0, 'opacity:0;transform:scale(0) rotate(0deg)', STEP), (t0, 'opacity:1;transform:scale(0) rotate(0deg)', BACK),
            (t0 + .18, 'opacity:1;transform:scale(1.15) rotate(45deg)', IN), (t0 + .6, 'opacity:0;transform:scale(0) rotate(110deg)')])
    tl.k(f'#{P}rays', [(0, 'opacity:0;transform:rotate(0deg)'), (0.45, 'opacity:0;transform:rotate(7deg)', OUT), (0.8, 'opacity:.75;transform:rotate(14deg)', LIN), (Tt, 'opacity:.75;transform:rotate(68deg)')])
    tl.k(f'#{P}glow', [(0, 'opacity:0;transform:scale(.6)'), (0.45, 'opacity:0;transform:scale(.6)', OUT), (0.9, 'opacity:1;transform:scale(1)')])
    tl.k(f'#{P}drop', [(0, 'transform:translateY(-470px)'), (0.1, 'transform:translateY(-470px)', IN), (0.45, 'transform:translateY(0px)', OUT),
        (0.56, 'transform:translateY(-28px)', IN), (0.68, 'transform:translateY(0px)', OUT), (0.76, 'transform:translateY(-7px)', IN), (0.84, 'transform:translateY(0px)')])
    tl.k(f'#{P}sq', [(0, 'transform:scale(1,1)'), (0.44, 'transform:scale(.94,1.08)', OUT), (0.47, 'transform:scale(1.14,.84)', OUT), (0.58, 'transform:scale(.96,1.05)', IO),
        (0.69, 'transform:scale(1.05,.95)', IO), (0.84, 'transform:scale(1,1)')])
    tl.k(f'#{P}shine', [(0, 'transform:translateX(-190px)'), (0.85, 'transform:translateX(-190px)', IO), (1.3, 'transform:translateX(190px)')])
    tl.k(f'#{P}t1', [(0, 'opacity:0;transform:scale(.5)', STEP), (1.15, 'opacity:1;transform:scale(.5)', BACK), (1.45, 'opacity:1;transform:scale(1)')])
    tl.k(f'#{P}t2', [(0, 'opacity:0;transform:translateY(14px)', STEP), (1.35, 'opacity:0;transform:translateY(14px)', OUT), (1.65, 'opacity:1;transform:translateY(0px)')])
    tl.k(f'#{P}pipw', [(0, 'opacity:0;transform:translateY(70px)', STEP), (1.2, 'opacity:0;transform:translateY(70px)', OUT), (1.35, 'opacity:1;transform:translateY(-6px)', IO), (1.5, 'opacity:1;transform:translateY(0px)')])
    badge = f'''<polygon points="{hexpts(BX, BY+6, 108)}" fill="#C27F00"/><polygon points="{hexpts(BX, BY, 108)}" fill="url(#{P}gold)"/>
 <polygon points="{hexpts(BX, BY, 90)}" fill="url(#{P}purp)"/>
 <polygon points="{hexpts(BX, BY, 90)}" fill="none" stroke="#C4B5FD" stroke-width="3" opacity=".6"/>
 <g transform="translate({BX} {BY-6}) scale(1.15)"><path d="M0 -46 L13 -16 L46 -14 L21 8 L28 40 L0 23 L-28 40 L-21 8 L-46 -14 L-13 -16Z" fill="#FFD54A" stroke="#FFF1B8" stroke-width="4" stroke-linejoin="round"/></g>
 <g clip-path="url(#{P}clip)"><g id="{P}shine"><polygon points="{BX-30},{BY-130} {BX+12},{BY-130} {BX-18},{BY+130} {BX-60},{BY+130}" fill="#fff" opacity=".55"/>
   <polygon points="{BX+26},{BY-130} {BX+38},{BY-130} {BX+8},{BY+130} {BX-4},{BY+130}" fill="#fff" opacity=".4"/></g></g>
 <path d="M{BX-96} {BY+86} L{BX-120} {BY+86} L{BX-104} {BY+108} L{BX-120} {BY+130} L{BX-80} {BY+130}Z" fill="#005E56"/>
 <path d="M{BX+96} {BY+86} L{BX+120} {BY+86} L{BX+104} {BY+108} L{BX+120} {BY+130} L{BX+80} {BY+130}Z" fill="#005E56"/>
 <rect x="{BX-98}" y="{BY+78}" width="196" height="48" rx="12" fill="#007A70"/>{T(BX, BY+111, 26, 'LEVEL 5', '#fff', extra='letter-spacing="2"')}'''
    body = f'''<defs>
 <radialGradient id="{P}glowg"><stop offset="0" stop-color="#FFE7A3" stop-opacity=".95"/><stop offset=".6" stop-color="#FFF3C4" stop-opacity=".45"/><stop offset="1" stop-color="#FFF3C4" stop-opacity="0"/></radialGradient>
 <linearGradient id="{P}rayg" x1="0" x2="1"><stop offset="0" stop-color="#FFD54A" stop-opacity=".55"/><stop offset="1" stop-color="#FFD54A" stop-opacity="0"/></linearGradient>
 <linearGradient id="{P}gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE07A"/><stop offset="1" stop-color="#F2A900"/></linearGradient>
 <linearGradient id="{P}purp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A78BFA"/><stop offset=".55" stop-color="#7C3AED"/><stop offset="1" stop-color="#5B21B6"/></linearGradient>
 <clipPath id="{P}clip"><polygon points="{hexpts(BX, BY, 108)}"/></clipPath></defs>
<g transform="translate({BX} {BY})"><g id="{P}glow" class="{P}a"><circle r="200" fill="url(#{P}glowg)"/></g></g>
<g transform="translate({BX} {BY})"><g id="{P}rays" class="{P}a">{rays}</g></g>
<g id="{P}pipw">{pmk}</g>
<g id="{P}drop"><g id="{P}sq" class="{P}a" style="transform-origin:50% 100%">{badge}</g></g>
<g id="{P}sparkles">{sp}</g>
<g transform="translate(300 474)"><g id="{P}t1" class="{P}a">{T(0, 0, 60, 'LEVEL UP!', '#7C3AED', extra='letter-spacing="1"')}</g></g>
<g id="{P}t2">{T(300, 524, 28, 'New title: <tspan fill="#007A70">Design Sultan</tspan>')}</g>'''
    write('fx02-level-up', P, 'Level up and badge unlock', pcss + tl.out(), body)
    CUES['fx02-level-up'] = dict(T=Tt, drop=[0.1, 0.45], land=0.45, bounce=0.68, shine=[0.85, 1.3], sparkles=[round(1.0 + 0.11 * i, 2) for i in range(6)], fanfare=1.15)

# ───────────────────────── FX3 · Correct / wrong ─────────────────────────
def fx3():
    P = 'f3-'; Tt = 4.6; tl = TL(Tt, P); B0 = 2.3
    ca, ma = pip('happy', P + 'pa-', 165, 0, 270, 0.0)
    cb, mb = pip('sad', P + 'pb-', 165, 0, 270, B0)
    def scene(S, ok):
        c = '#63C132' if ok else '#FF6B6B'
        icon = (f'<path id="{P}{S}mk" d="M-14 1 L-4 11 L15 -10" pathLength="1" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>' if ok else
                f'<path id="{P}{S}mk" d="M-11 -11 L11 11 M11 -11 L-11 11" pathLength="1" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>')
        stars = ''.join(f'<g transform="translate({480+dx} {376+dy})"><g id="{P}{S}st{i}" class="{P}a" opacity="0">{star4(r, cc)}</g></g>'
                        for i, (dx, dy, r, cc) in enumerate([(-52, -40, 11, '#FFB700'), (50, -44, 9, '#00BFAE'), (54, 36, 10, '#FFB700')])) if ok else ''
        msg = (T(300, 512, 46, 'Correct!', '#2F7D16') + T(300, 552, 26, '+10 XP  ·  Pip is proud of you', '#475569')) if ok else \
              (T(300, 512, 44, 'Not quite!', '#D92D20') + T(300, 552, 26, 'Look at the loop again. You got this.', '#475569'))
        return f'''<g id="{P}{S}">
 <g id="{P}{S}pip">{ma if ok else mb}</g>
 <g id="{P}{S}shake"><g id="{P}{S}card" class="{P}a">
  <rect x="70" y="335" width="460" height="86" rx="26" fill="#0F172A" opacity=".07"/>
  <rect id="{P}{S}bg" x="70" y="330" width="460" height="86" rx="26" fill="#fff" stroke="#E2E8F0" stroke-width="3"/>
  <circle cx="120" cy="373" r="23" fill="#F1F5F9"/>{T(120, 382, 24, 'B' if ok else 'C', '#475569')}
  {T(160, 384, 30, 'repeat 3 times' if ok else 'repeat forever', anchor='start')}
  <g transform="translate(480 373)"><g id="{P}{S}ring" class="{P}a" opacity="0"><circle r="30" fill="none" stroke="{c}" stroke-width="6"/></g></g>
  <g transform="translate(480 373)"><g id="{P}{S}ic" class="{P}a"><circle r="30" fill="{c}"/>{icon}</g></g>
 </g></g>{stars}
 <g id="{P}{S}msg">{msg}</g></g>'''
    # scene A (correct) 0–2.15 ; scene B (wrong) 2.3–4.6
    tl.k(f'#{P}A', [(0, 'opacity:1'), (2.02, 'opacity:1', IO), (2.15, 'opacity:0')])
    tl.k(f'#{P}B', [(0, 'opacity:0'), (B0, 'opacity:0', IO), (B0 + .1, 'opacity:1')])
    for S, t0, ok, col, bg in (('A', 0.1, True, '#63C132', '#EFFAE8'), ('B', B0 + 0.1, False, '#FF6B6B', '#FFF1F1')):
        tl.k(f'#{P}{S}bg', [(0, 'fill:#fff;stroke:#E2E8F0'), (t0, 'fill:#fff;stroke:#E2E8F0', OUT), (t0 + .14, f'fill:{bg};stroke:{col}')])
        tl.k(f'#{P}{S}ic', [(0, 'transform:scale(0)', STEP), (t0 + .02, 'transform:scale(0)', BACK), (t0 + .2, 'transform:scale(1.25)', IO), (t0 + .32, 'transform:scale(1)')])
        tl.k(f'#{P}{S}mk', [(0, 'stroke-dasharray:1;stroke-dashoffset:1'), (t0 + .12, 'stroke-dasharray:1;stroke-dashoffset:1', OUT), (t0 + .32, 'stroke-dasharray:1;stroke-dashoffset:0')])
        tl.k(f'#{P}{S}msg', [(0, 'opacity:0;transform:translateY(16px)'), (t0 + .15, 'opacity:0;transform:translateY(16px)', OUT), (t0 + .45, 'opacity:1;transform:translateY(0px)')])
    tl.k(f'#{P}Acard', [(0, 'transform:scale(1)'), (0.1, 'transform:scale(1)', OUT), (0.22, 'transform:scale(1.045)', IO), (0.42, 'transform:scale(1)')])
    tl.k(f'#{P}Aring', [(0, 'opacity:0;transform:scale(1)', STEP), (0.14, 'opacity:.9;transform:scale(1)', OUT), (0.62, 'opacity:0;transform:scale(2.5)')])
    for i in range(3):
        t0 = 0.22 + 0.07 * i
        tl.k(f'#{P}Ast{i}', [(0, 'opacity:0;transform:scale(0) rotate(0deg)', STEP), (t0, 'opacity:1;transform:scale(0)', BACK), (t0 + .16, 'opacity:1;transform:scale(1.2) rotate(40deg)', IN), (t0 + .55, 'opacity:0;transform:scale(0) rotate(100deg)')])
    sh = [(0, 'transform:translateX(0px)'), (B0 + 0.1, 'transform:translateX(0px)', IO)]
    for j, dx in enumerate([-16, 14, -10, 7, -4, 0]): sh.append((B0 + 0.16 + 0.065 * j, f'transform:translateX({dx}px)', IO))
    tl.k(f'#{P}Bshake', sh)
    body = scene('A', True) + scene('B', False).replace(f'<g id="{P}B">', f'<g id="{P}B" opacity="0">')
    write('fx03-correct-wrong', P, 'Correct and wrong answer feedback', ca + cb + tl.out(), body, rm=f'#{P}A{{opacity:1!important}}#{P}B{{opacity:0!important}}')
    CUES['fx03-correct-wrong'] = dict(T=Tt, A_pop=0.12, A_chime=0.14, B_start=B0, B_shake=[B0 + .16, B0 + .5], B_bwomp=B0 + 0.12)

# ───────────────────────── FX4 · Pack download → unlock ─────────────────────────
def fx4():
    P = 'f4-'; Tt = 4.6; tl = TL(Tt, P); CX, CY = 300, 262
    steps = [(0.2, 0), (0.6, 22), (0.75, 24), (1.15, 48), (1.3, 50), (1.7, 76), (1.82, 78), (2.2, 100)]
    pts = [(0, 'stroke-dashoffset:100')] + [(t, f'stroke-dashoffset:{100-v}', IO) for t, v in steps]
    tl.k(f'#{P}prog', pts)
    tl.k(f'#{P}ring', [(0, 'opacity:1;transform:scale(1)'), (2.2, 'opacity:1;transform:scale(1)', OUT), (2.34, 'opacity:1;transform:scale(1.05)', IN), (2.6, 'opacity:0;transform:scale(1.18)')])
    pct = [(0, 0), (0.6, 22), (1.15, 48), (1.7, 76), (2.2, 100)]
    ptx = ''
    for k, (t, v) in enumerate(pct):
        ptx += f'<g id="{P}p{k}" opacity="0">{T(CX, 520, 40, f"{v}%", "#007A70")}</g>'
        tl.show(f'#{P}p{k}', [(t, pct[k + 1][0] if k < 4 else 2.75)])
    tl.show(f'#{P}dl', [(0, 2.75)])
    tl.k(f'#{P}done', [(0, 'opacity:0;transform:scale(.6)', STEP), (3.0, 'opacity:1;transform:scale(.6)', BACK), (3.28, 'opacity:1;transform:scale(1)')])
    tl.k(f'#{P}done2', [(0, 'opacity:0'), (3.2, 'opacity:0', OUT), (3.5, 'opacity:1')])
    bob = [(0, 'transform:translateY(0px) rotate(0deg)')]
    t = 0.0
    while t < 2.1: bob += [(t + .27, 'transform:translateY(-5px) rotate(0deg)', IO), (t + .55, 'transform:translateY(0px) rotate(0deg)', IO)]; t += .55
    for j, r in enumerate([-7, 6, -6, 5, -3, 0]): bob.append((2.32 + 0.075 * j, f'transform:translateY(0px) rotate({r}deg)', IO))
    tl.k(f'#{P}boxw', bob)
    tl.k(f'#{P}lid', [(0, 'transform:translate(0px,0px) rotate(0deg)'), (2.8, 'transform:translate(0px,0px) rotate(0deg)', OUT),
        (3.05, 'transform:translate(-110px,-70px) rotate(-30deg)', IO), (3.4, 'transform:translate(-122px,-40px) rotate(-22deg)', IO), (Tt, 'transform:translate(-122px,-46px) rotate(-22deg)')])
    tl.k(f'#{P}beams', [(0, 'opacity:0;transform:scaleY(.1)'), (2.82, 'opacity:0;transform:scaleY(.1)', OUT), (3.25, 'opacity:1;transform:scaleY(1)', IO), (3.9, 'opacity:.75;transform:scaleY(.94)', IO), (Tt, 'opacity:1;transform:scaleY(1)')])
    tl.k(f'#{P}prize', [(0, 'opacity:0;transform:translateY(90px) scale(.3)'), (2.85, 'opacity:0;transform:translateY(90px) scale(.3)', OUT),
        (3.3, 'opacity:1;transform:translateY(0px) scale(1)', IO), (3.9, 'opacity:1;transform:translateY(-8px) scale(1)', IO), (Tt, 'opacity:1;transform:translateY(0px) scale(1)')])
    sp = ''
    for i, (dx, dy, r, c) in enumerate([(-120, -130, 14, '#FFB700'), (118, -150, 12, '#00BFAE'), (-86, -40, 10, '#7C3AED'), (110, -50, 15, '#FFB700'), (0, -230, 11, '#FF6B6B')]):
        sp += f'<g transform="translate({CX+dx} {CY+dy})"><g id="{P}s{i}" class="{P}a" opacity="0">{star4(r, c)}</g></g>'
        t0 = 2.95 + 0.1 * i
        tl.k(f'#{P}s{i}', [(0, 'opacity:0;transform:scale(0)', STEP), (t0, 'opacity:1;transform:scale(0) rotate(0deg)', BACK), (t0 + .2, 'opacity:1;transform:scale(1.2) rotate(45deg)', IN), (t0 + .65, 'opacity:0;transform:scale(0) rotate(110deg)')])
    beams = ''.join(f'<polygon points="{CX-14+o*0.2},{CY+6} {CX+14+o*0.2},{CY+6} {CX+o+34},{CY-210} {CX+o-34},{CY-210}" fill="url(#{P}beamg)"/>' for o in (-150, -75, 0, 75, 150))
    body = f'''<defs>
 <linearGradient id="{P}rg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#00BFAE"/><stop offset="1" stop-color="#2563EB"/></linearGradient>
 <linearGradient id="{P}beamg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFE07A" stop-opacity=".95"/><stop offset="1" stop-color="#FFF6DB" stop-opacity="0"/></linearGradient>
 <linearGradient id="{P}boxg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14CDBB"/><stop offset="1" stop-color="#009587"/></linearGradient>
 <radialGradient id="{P}hole"><stop offset="0" stop-color="#FFF6DB"/><stop offset="1" stop-color="#FFB700" stop-opacity="0"/></radialGradient></defs>
<g transform="translate({CX} {CY})"><g id="{P}ring" class="{P}a">
 <circle r="176" fill="none" stroke="#E2E8F0" stroke-width="18"/>
 <g transform="rotate(-90)"><circle id="{P}prog" r="176" fill="none" stroke="url(#{P}rg)" stroke-width="18" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="0"/></g></g></g>
<g id="{P}beams" class="{P}a" style="transform-origin:50% 100%">{beams}<ellipse cx="{CX}" cy="{CY+4}" rx="110" ry="26" fill="url(#{P}hole)"/></g>
<g id="{P}boxw" class="{P}a" style="transform-origin:50% 100%">
 <rect x="198" y="272" width="204" height="138" rx="18" fill="#00756B"/>
 <rect x="198" y="266" width="204" height="138" rx="18" fill="url(#{P}boxg)"/>
 <rect x="283" y="266" width="34" height="138" fill="#FFB700"/><rect x="283" y="266" width="8" height="138" fill="#FFD54A"/>
 <circle cx="236" cy="340" r="15" fill="#fff" opacity=".2"/><circle cx="364" cy="340" r="15" fill="#fff" opacity=".2"/>
 <rect x="204" y="262" width="192" height="18" rx="9" fill="#005E56"/><rect x="214" y="264" width="172" height="8" rx="4" fill="#FFE07A" opacity=".8"/>
 <g id="{P}lid" class="{P}a" style="transform-origin:0% 100%">
  <rect x="184" y="228" width="232" height="48" rx="14" fill="#00897D"/><rect x="184" y="224" width="232" height="46" rx="14" fill="#1FD3C1"/>
  <rect x="281" y="224" width="38" height="46" fill="#FFB700"/>
  <path d="M300 224 C270 186 240 200 262 222Z M300 224 C330 186 360 200 338 222Z" fill="#FFB700" stroke="#E09A00" stroke-width="4" stroke-linejoin="round"/><circle cx="300" cy="222" r="10" fill="#E09A00"/></g>
</g>
<g id="{P}prize" class="{P}a"><g transform="translate({CX} {CY-118})">
 <circle r="52" fill="#FFF6DB"/><circle r="44" fill="#FFB700"/>
 <g transform="translate(-28 -14)"><rect x="0" y="0" width="56" height="30" rx="8" fill="#FFE07A"/><rect x="6" y="5" width="13" height="10" rx="2" fill="#0F172A" opacity=".75"/><rect x="22" y="5" width="13" height="10" rx="2" fill="#0F172A" opacity=".75"/><rect x="38" y="5" width="12" height="10" rx="2" fill="#0F172A" opacity=".75"/>
 <circle cx="13" cy="31" r="6" fill="#0F172A"/><circle cx="43" cy="31" r="6" fill="#0F172A"/></g></g></g>
<g id="{P}spark">{sp}</g>
<g id="{P}dl">{T(CX, 560, 24, 'Downloading Trip to Ngodo · 38 MB', '#64748B')}</g>
{ptx}
<g transform="translate({CX} 516)"><g id="{P}done" class="{P}a" opacity="1">{T(0, 0, 44, 'Trip to Ngodo unlocked!', '#0F172A')}</g></g>
<g id="{P}done2">{T(CX, 556, 24, 'Adventure · 5 stops · ready offline', '#007A70')}</g>'''
    write('fx04-pack-unlock', P, 'Content pack download and unlock', tl.out(), body, rm=f'#{P}ring,#{P}dl,#{P}p0,#{P}p1,#{P}p2,#{P}p3,#{P}p4{{opacity:0}}')
    CUES['fx04-pack-unlock'] = dict(T=Tt, ticks=[0.6, 1.15, 1.7], progress=[0.2, 2.2], done=2.2, knocks=[2.32, 2.47, 2.62], lid=2.8, unlock=2.85, sparkles=[round(2.95 + .1 * i, 2) for i in range(5)])

# ───────────────────────── FX5 · Streak flame + daily mission ─────────────────────────
def fx5():
    P = 'f5-'; Tt = 4.4; tl = TL(Tt, P)
    tl.k(f'#{P}flame', [(0, 'transform:scale(0)'), (0.12, 'transform:scale(0)', OUT), (0.42, 'transform:scale(1.12,1.2)', IO), (0.6, 'transform:scale(1)', IO),
        (1.05, 'transform:scale(1)', OUT), (1.22, 'transform:scale(1.2)', IO), (1.5, 'transform:scale(1)')])
    fl = [(0, 'transform:scale(1,1) skewX(0deg)')]; t = 0.5; j = 0
    while t < Tt - .1:
        fl.append((t, ['transform:scale(1.04,.96) skewX(2deg)', 'transform:scale(.97,1.05) skewX(-2deg)', 'transform:scale(1.02,.99) skewX(1deg)'][j % 3], IO)); t += .22; j += 1
    tl.k(f'#{P}flick', fl)
    tl.k(f'#{P}core', [(0, 'transform:scale(1,1)'), *[(0.5 + .17 * i, f'transform:scale({1 + .05*((-1)**i)},{1 - .06*((-1)**i)})', IO) for i in range(int((Tt - .6) / .17))]])
    tl.k(f'#{P}spark', [(0, 'opacity:0;transform:scale(0)', STEP), (0.05, 'opacity:1;transform:scale(0)', OUT), (0.13, 'opacity:1;transform:scale(1.4) rotate(30deg)', IN), (0.3, 'opacity:0;transform:scale(0) rotate(60deg)')])
    emb = ''
    for i, (dx, r) in enumerate([(-30, 5), (24, 4), (-8, 6), (36, 3.5), (-40, 4)]):
        emb += f'<circle id="{P}e{i}" cx="{300+dx}" cy="{170}" r="{r}" fill="#FFB700" opacity="0"/>'
        t0 = 0.35 + 0.22 * i
        tl.k(f'#{P}e{i}', [(0, 'opacity:0;transform:translateY(0px)'), (t0, 'opacity:1;transform:translateY(0px)', OUT), (t0 + .9, 'opacity:0;transform:translateY(-120px)')])
    tl.k(f'#{P}n11', [(0, 'transform:scaleY(1)'), (0.9, 'transform:scaleY(1)', IN), (1.02, 'transform:scaleY(0)', STEP), (Tt, 'transform:scaleY(0)')])
    tl.k(f'#{P}n12', [(0, 'transform:scaleY(0)'), (1.02, 'transform:scaleY(0)', BACK), (1.18, 'transform:scaleY(1)')])
    tl.k(f'#{P}pill', [(0, 'transform:scale(1)'), (1.02, 'transform:scale(1)', OUT), (1.12, 'transform:scale(1.08)', IO), (1.35, 'transform:scale(1)')])
    tl.k(f'#{P}bar', [(0, 'width:120px'), (1.6, 'width:120px', OUT), (2.0, 'width:240px')])
    tl.show(f'#{P}c1', [(0, 2.0)]); tl.show(f'#{P}c2', [(2.0, Tt + 1)])
    tl.k(f'#{P}box', [(0, 'fill:#fff;stroke:#CBD5E1'), (2.05, 'fill:#fff;stroke:#CBD5E1', OUT), (2.15, 'fill:#63C132;stroke:#63C132')])
    tl.k(f'#{P}boxg', [(0, 'transform:scale(1)'), (2.05, 'transform:scale(1)', BACK), (2.15, 'transform:scale(1.25)', IO), (2.3, 'transform:scale(1)')])
    tl.k(f'#{P}chk', [(0, 'stroke-dasharray:1;stroke-dashoffset:1'), (2.1, 'stroke-dasharray:1;stroke-dashoffset:1', OUT), (2.3, 'stroke-dasharray:1;stroke-dashoffset:0')])
    tl.k(f'#{P}cardbg', [(0, 'fill:#fff;stroke:#E2E8F0'), (2.1, 'fill:#fff;stroke:#E2E8F0', OUT), (2.3, 'fill:#F3FBEF;stroke:#63C132')])
    tl.k(f'#{P}card', [(0, 'transform:scale(1)'), (2.08, 'transform:scale(1)', OUT), (2.2, 'transform:scale(1.03)', IO), (2.4, 'transform:scale(1)')])
    tl.k(f'#{P}rew', [(0, 'transform:scale(1)'), (2.45, 'transform:scale(1)', BACK), (2.6, 'transform:scale(1.3)', IO), (2.78, 'transform:scale(1)')])
    tl.k(f'#{P}rs', [(0, 'opacity:0;transform:scale(0)', STEP), (2.47, 'opacity:1;transform:scale(0) rotate(0deg)', BACK), (2.65, 'opacity:1;transform:scale(1.2) rotate(45deg)', IN), (3.05, 'opacity:0;transform:scale(0) rotate(100deg)')])
    tl.k(f'#{P}msg', [(0, 'opacity:0;transform:translateY(16px)'), (2.3, 'opacity:0;transform:translateY(16px)', OUT), (2.6, 'opacity:1;transform:translateY(0px)')])
    body = f'''<defs>
 <linearGradient id="{P}fo" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF6B6B"/><stop offset=".55" stop-color="#FF8A1F"/><stop offset="1" stop-color="#FFB700"/></linearGradient>
 <linearGradient id="{P}fm" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF8A1F"/><stop offset="1" stop-color="#FFD54A"/></linearGradient>
 <radialGradient id="{P}halo"><stop offset="0" stop-color="#FFE7A3" stop-opacity=".8"/><stop offset="1" stop-color="#FFE7A3" stop-opacity="0"/></radialGradient></defs>
<g id="{P}flame" class="{P}a" style="transform-origin:50% 100%">
 <ellipse cx="300" cy="170" rx="120" ry="110" fill="url(#{P}halo)"/>
 <g id="{P}flick" class="{P}a" style="transform-origin:50% 100%">
  <path d="M300 62 C334 104 380 132 376 186 C373 228 340 252 300 252 C260 252 226 228 224 188 C222 152 244 132 258 108 C264 134 274 146 286 150 C284 118 288 90 300 62Z" fill="url(#{P}fo)"/>
  <path d="M302 116 C322 142 346 160 344 194 C342 224 324 240 300 240 C276 240 258 224 258 198 C258 176 270 162 280 148 C284 166 292 174 300 176 C296 156 296 136 302 116Z" fill="url(#{P}fm)"/>
  <g id="{P}core" class="{P}a" style="transform-origin:50% 100%"><path d="M300 166 C314 184 324 196 322 212 C320 228 312 236 300 236 C288 236 280 228 279 214 C278 198 290 186 300 166Z" fill="#FFF1B8"/></g>
 </g></g>
<g transform="translate(300 246)"><g id="{P}spark" class="{P}a" opacity="0">{star4(26, '#FFD54A')}</g></g>
<g id="{P}embers">{emb}</g>
<g id="{P}pill" class="{P}a">
 <rect x="186" y="270" width="228" height="62" rx="31" fill="#F2C94C" opacity=".35"/><rect x="186" y="266" width="228" height="62" rx="31" fill="#FFF6DB" stroke="#FFD54A" stroke-width="3"/>
 <g id="{P}n11" class="{P}a">{T(262, 311, 42, '11', '#B45309', 'end')}</g>
 <g id="{P}n12" class="{P}a">{T(262, 311, 42, '12', '#B45309', 'end')}</g>
 {T(274, 307, 26, 'day streak', '#8A5A00', 'start')}</g>
<g id="{P}card" class="{P}a">
 <rect x="60" y="377" width="480" height="122" rx="26" fill="#0F172A" opacity=".07"/>
 <rect id="{P}cardbg" x="60" y="372" width="480" height="122" rx="26" fill="#fff" stroke="#E2E8F0" stroke-width="3"/>
 <g transform="translate(116 433)"><g id="{P}boxg" class="{P}a"><circle id="{P}box" r="25" fill="#fff" stroke="#CBD5E1" stroke-width="4"/>
  <path id="{P}chk" d="M-11 1 L-3 9 L12 -8" pathLength="1" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g></g>
 {T(162, 414, 17, 'DAILY MISSION', '#7C3AED', 'start', 'letter-spacing="1.5"')}
 {T(162, 448, 29, 'Finish 2 lessons', anchor='start')}
 <rect x="162" y="464" width="240" height="14" rx="7" fill="#EEF1F5"/><rect id="{P}bar" x="162" y="464" width="240" height="14" rx="7" fill="#63C132"/>
 <g id="{P}c1" opacity="0">{T(416, 477, 20, '1/2', '#64748B', 'start')}</g><g id="{P}c2">{T(416, 477, 20, '2/2', '#2F7D16', 'start')}</g>
 <g id="{P}rew" class="{P}a"><rect x="432" y="392" width="92" height="42" rx="21" fill="#FFF6DB"/>
  <g transform="translate(456 413)">{coin(12)}</g>{T(474, 422, 22, '+20', '#B45309', 'start')}</g>
 <g transform="translate(520 392)"><g id="{P}rs" class="{P}a" opacity="0">{star4(14, '#FFB700')}</g></g>
</g>
<g id="{P}msg">{T(300, 558, 38, 'Mission complete!', '#2F7D16')}</g>'''
    write('fx05-streak-mission', P, 'Streak flame and daily mission complete', tl.out(), body)
    CUES['fx05-streak-mission'] = dict(T=Tt, ignite=0.05, flame=[0.12, 0.6], flip=[0.9, 1.02], streak_chime=1.1, fill=[1.6, 2.0], check=2.08, success=2.15, coin=2.47, msg=2.3)

for f in (fx1, fx2, fx3, fx4, fx5): f()
json.dump(CUES, open(os.path.join(os.path.dirname(__file__), 'cues.json'), 'w'), indent=1)
print('ok', list(CUES))
