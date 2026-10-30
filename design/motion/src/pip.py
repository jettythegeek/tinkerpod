"""Pip mascot generator: builds layered SVG parts + per-mood CSS keyframe clips.
Coordinates: design space, viewBox -70 -110 540 540. All animated groups carry no transform attribute
(CSS transform would override it); static offsets live on inner groups."""
import math, random, os, json
OUT = os.path.join(os.path.dirname(__file__), '..', 'svg')
VB = "-70 -110 540 540"
TEAL_L, TEAL, TEAL_D = '#3FEADB', '#00BFAE', '#00968A'
EYE = '#5EEAD4'

def gear(cx, cy, ro=26, ri=19.5, n=9):
    pts = []
    for i in range(n * 4):
        a = (i / (n * 4)) * 2 * math.pi
        r = ro if (i % 4) in (1, 2) else ri
        pts.append(f"{cx + r*math.cos(a):.1f},{cy + r*math.sin(a):.1f}")
    return "M" + " L".join(pts) + "Z"

def eye_variants(side, cx, cy):
    s = -1 if side == 'l' else 1
    o = f'''<g id="eye-{side}-open" class="v on">
      <ellipse cx="{cx}" cy="{cy}" rx="21" ry="25" fill="{EYE}" opacity=".16"/>
      <rect x="{cx-13}" y="{cy-17}" width="26" height="34" rx="13" fill="{EYE}"/>
      <circle cx="{cx-4}" cy="{cy-8}" r="4.6" fill="#fff"/><circle cx="{cx+5}" cy="{cy+6}" r="2" fill="#fff" opacity=".7"/></g>'''
    h = f'''<g id="eye-{side}-happy" class="v"><path d="M{cx-14} {cy+5} Q{cx} {cy-15} {cx+14} {cy+5}" fill="none" stroke="{EYE}" stroke-width="7.5" stroke-linecap="round"/></g>'''
    lid = (f'M{cx-17} {cy-21} L{cx+17} {cy-21} L{cx+17} {cy-13} L{cx-17} {cy-1}Z' if side == 'l'
           else f'M{cx-17} {cy-21} L{cx+17} {cy-21} L{cx+17} {cy-1} L{cx-17} {cy-13}Z')
    brow = (f'M{cx-13} {cy-15} L{cx+12} {cy-25}' if side == 'l' else f'M{cx-12} {cy-25} L{cx+13} {cy-15}')
    sd = f'''<g id="eye-{side}-sad" class="v">
      <rect x="{cx-12}" y="{cy-12}" width="24" height="29" rx="12" fill="{EYE}" opacity=".9"/>
      <circle cx="{cx-3}" cy="{cy+5}" r="3.6" fill="#fff"/>
      <path d="{lid}" fill="#14234F"/>
      <path d="{brow}" stroke="{EYE}" stroke-width="5" stroke-linecap="round"/></g>'''
    # squint: '>' for left eye, '<' for right
    if side == 'l':
        sq = f'M{cx-10} {cy-11} L{cx+9} {cy} L{cx-10} {cy+11}'
    else:
        sq = f'M{cx+10} {cy-11} L{cx-9} {cy} L{cx+10} {cy+11}'
    q = f'''<g id="eye-{side}-squint" class="v"><path d="{sq}" fill="none" stroke="{EYE}" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"/></g>'''
    st = f'''<g id="eye-{side}-star" class="v">
      <ellipse cx="{cx}" cy="{cy}" rx="24" ry="28" fill="{EYE}" opacity=".18"/>
      <rect x="{cx-15}" y="{cy-19}" width="30" height="38" rx="15" fill="{EYE}"/>
      <path d="M{cx-3} {cy-14} l2.2 5 5 2.2 -5 2.2 -2.2 5 -2.2 -5 -5 -2.2 5 -2.2z" fill="#fff"/><circle cx="{cx+6}" cy="{cy+8}" r="2.4" fill="#fff"/></g>'''
    return f'<g id="eye-{side}">{o}{h}{sd}{q}{st}</g>'

def mouth(cx=200, cy=194):
    return f'''<g id="mouth">
    <g id="mouth-smile" class="v on"><path d="M{cx-15} {cy-3} Q{cx} {cy+11} {cx+15} {cy-3}" fill="none" stroke="{EYE}" stroke-width="6" stroke-linecap="round"/></g>
    <g id="mouth-grin" class="v"><path d="M{cx-19} {cy-6} Q{cx} {cy-9} {cx+19} {cy-6} Q{cx+17} {cy+17} {cx} {cy+17} Q{cx-17} {cy+17} {cx-19} {cy-6}Z" fill="#FF6B7D"/>
      <path d="M{cx-10} {cy+11} Q{cx} {cy+3} {cx+10} {cy+11} Q{cx+6} {cy+17} {cx} {cy+17} Q{cx-6} {cy+17} {cx-10} {cy+11}Z" fill="#FFB3BC"/></g>
    <g id="mouth-frown" class="v"><path d="M{cx-13} {cy+6} Q{cx} {cy-5} {cx+13} {cy+6}" fill="none" stroke="{EYE}" stroke-width="6" stroke-linecap="round"/></g>
    <g id="mouth-o" class="v"><ellipse cx="{cx}" cy="{cy+3}" rx="12" ry="14" fill="#FF6B7D"/><ellipse cx="{cx}" cy="{cy+10}" rx="7" ry="5" fill="#FFB3BC"/></g>
  </g>'''

def arm(side):
    sx = 148 if side == 'l' else 252
    rest = 22 if side == 'l' else -22
    thumb_dx = 11 if side == 'l' else -11
    return f'''<g id="arm-{side}"><g transform="rotate({rest} {sx} 252)">
     <rect x="{sx-14}" y="242" width="28" height="64" rx="14" fill="url(#limb)" stroke="{TEAL_D}" stroke-width="2"/>
     <g id="hand-{side}"><circle cx="{sx}" cy="316" r="18.5" fill="url(#limb)" stroke="{TEAL_D}" stroke-width="2"/>
       <ellipse cx="{sx+thumb_dx}" cy="306" rx="8" ry="7" fill="url(#limb)" stroke="{TEAL_D}" stroke-width="2"/>
       <ellipse cx="{sx-5 if side=='l' else sx+5}" cy="309" rx="5" ry="3.5" fill="#fff" opacity=".35"/></g>
    </g></g>'''

def confetti(n=26, seed=7):
    random.seed(seed)
    cols = ['#FFB700', '#FF6B6B', '#7C3AED', '#2563EB', '#63C132', '#00BFAE', '#FF8A1F']
    parts, css = [], []
    for i in range(n):
        a = -math.pi/2 + random.uniform(-1.35, 1.35)
        d = random.uniform(110, 190)
        dx, dy = math.cos(a)*d, math.sin(a)*d
        c = cols[i % len(cols)]
        shape = i % 3
        if shape == 0: el = f'<rect x="-5" y="-9" width="10" height="18" rx="3" fill="{c}"/>'
        elif shape == 1: el = f'<circle r="6" fill="{c}"/>'
        else: el = f'<path d="M0 -9 L2.6 -2.6 9 0 2.6 2.6 0 9 -2.6 2.6 -9 0 -2.6 -2.6Z" fill="{c}"/>'
        rot = random.choice([-1, 1]) * random.randint(360, 720)
        parts.append(f'<g transform="translate(200 120)"><g id="cf{i}" class="cf">{el}</g></g>')
        t0 = 20 + random.uniform(0, 3)
        css.append(f'''@keyframes cf{i}{{0%,{t0:.1f}%{{transform:translate(0,0) scale(0) rotate(0);opacity:0}}
 {t0+1:.1f}%{{opacity:1;transform:translate({dx*.15:.0f}px,{dy*.15:.0f}px) scale(.6) rotate(0)}}
 {t0+13:.1f}%{{transform:translate({dx:.0f}px,{dy:.0f}px) scale(1) rotate({rot*.4:.0f}deg);animation-timing-function:cubic-bezier(.4,0,1,1)}}
 {t0+48:.1f}%{{transform:translate({dx*1.25:.0f}px,{dy+260:.0f}px) scale(.9) rotate({rot}deg);opacity:1}}
 {t0+54:.1f}%,100%{{transform:translate({dx*1.3:.0f}px,{dy+300:.0f}px) scale(.8) rotate({rot}deg);opacity:0}}}}
#cf{i}{{animation:cf{i} var(--dur) infinite;animation-timing-function:cubic-bezier(.1,.8,.3,1)}}''')
    return ''.join(parts[0::2]), ''.join(parts[1::2]), '\n'.join(css)

def star4(x, y, r, c, id_):
    return f'<g transform="translate({x} {y})"><g id="{id_}" class="spark"><path d="M0 {-r} Q{r*.18} {-r*.18} {r} 0 Q{r*.18} {r*.18} 0 {r} Q{-r*.18} {r*.18} {-r} 0 Q{-r*.18} {-r*.18} 0 {-r}Z" fill="{c}"/></g></g>'

def build(mood, css, extras_front='', extras_back='', dur='3s', title=''):
    cf_back, cf_front, cf_css = confetti() if mood == 'cheer' else ('', '', '')
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VB}" width="540" height="540" role="img" aria-label="Pip the TinkerPod robot, {title}">
<title>Pip · {title}</title>
<defs>
 <linearGradient id="limb" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#00A597"/><stop offset=".4" stop-color="#22D9C7"/><stop offset="1" stop-color="#00A597"/></linearGradient>
 <linearGradient id="torsoG" x1="0" x2="1"><stop offset="0" stop-color="#00A194"/><stop offset=".32" stop-color="#2DDFCD"/><stop offset=".7" stop-color="#05C2B1"/><stop offset="1" stop-color="#009587"/></linearGradient>
 <radialGradient id="shellG" cx=".34" cy=".25" r=".9"><stop offset="0" stop-color="#5BF2E3"/><stop offset=".45" stop-color="#0CC9B7"/><stop offset="1" stop-color="#009184"/></radialGradient>
 <radialGradient id="screenG" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#22336B"/><stop offset="1" stop-color="#0D1838"/></radialGradient>
 <radialGradient id="earG" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFE07A"/><stop offset="1" stop-color="#F2A900"/></radialGradient>
 <radialGradient id="ballG" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#FFC48A"/><stop offset=".6" stop-color="#FF8A1F"/><stop offset="1" stop-color="#E86A00"/></radialGradient>
 <clipPath id="podTop"><rect x="60" y="-20" width="280" height="112"/></clipPath>
</defs>
<style>
:root{{--dur:{dur}}}
#pip *{{transform-box:view-box}}
.v{{opacity:0}} .v.on{{opacity:1}}
#pip,#pip-squash{{transform-origin:200px 384px}}
#shadow{{transform-box:view-box;transform-origin:200px 392px}}
#head{{transform-origin:200px 238px}} #antenna{{transform-origin:200px 84px}} #antenna-glow{{transform-origin:200px 28px}}
#arm-l{{transform-origin:148px 252px}} #arm-r{{transform-origin:252px 252px}}
#hand-l{{transform-origin:148px 316px}} #hand-r{{transform-origin:252px 316px}}
#eyes{{transform-origin:200px 160px}} #mouth{{transform-origin:200px 196px}} #torso{{transform-origin:200px 338px}}
#cheeks{{opacity:0}} #tear,#burst,.spark,#ha-l,#ha-r{{opacity:0}}
#gear{{transform-origin:156px 82px}} #wrench{{transform-origin:246px 96px}}
.spark{{transform-box:fill-box;transform-origin:50% 50%}}
{css}
{cf_css}
@media (prefers-reduced-motion:reduce){{*{{animation-duration:0s!important;animation-iteration-count:1!important}}}}
</style>
<ellipse id="shadow" cx="200" cy="392" rx="78" ry="11" fill="#0F172A" opacity=".13"/>
<g id="fx-back">{extras_back}{cf_back}</g>
<g id="pip"><g id="pip-squash">
 <g id="legs">
  <rect x="165" y="318" width="28" height="56" rx="14" fill="url(#limb)"/><rect x="155" y="360" width="42" height="24" rx="12" fill="#00978A"/><rect x="161" y="363" width="18" height="6" rx="3" fill="#fff" opacity=".25"/>
  <rect x="207" y="318" width="28" height="56" rx="14" fill="url(#limb)"/><rect x="203" y="360" width="42" height="24" rx="12" fill="#00978A"/><rect x="221" y="363" width="18" height="6" rx="3" fill="#fff" opacity=".25"/>
 </g>
 <g id="torso">
  <rect x="138" y="226" width="124" height="114" rx="46" fill="url(#torsoG)"/>
  <rect x="148" y="300" width="104" height="34" rx="17" fill="#7FF5E9" opacity=".32"/>
  <ellipse cx="166" cy="252" rx="14" ry="7" fill="#fff" opacity=".28"/>
  <g id="chest-lights"><circle id="led-1" cx="180" cy="266" r="6.5" fill="#FF6B6B"/><circle id="led-2" cx="200" cy="266" r="6.5" fill="#FFC21A"/><circle id="led-3" cx="220" cy="266" r="6.5" fill="#A78BFA"/></g>
 </g>
 <g id="head">
  <g id="antenna">
   <circle id="antenna-glow" cx="200" cy="28" r="24" fill="#FFB066" opacity=".3"/>
   <rect x="196.5" y="30" width="7" height="56" rx="3.5" fill="#FF9A3C"/>
   <circle id="antenna-ball" cx="200" cy="28" r="13" fill="url(#ballG)"/><circle id="antenna-dim" cx="200" cy="28" r="13" fill="#7C8799" opacity="0"/><circle cx="196" cy="23.5" r="4" fill="#fff" opacity=".7"/>
  </g>
  <g id="ear-l"><ellipse cx="93" cy="160" rx="18" ry="33" fill="url(#earG)"/><ellipse cx="89" cy="160" rx="7" ry="20" fill="#E39A00" opacity=".45"/></g>
  <g id="ear-r"><ellipse cx="307" cy="160" rx="18" ry="33" fill="url(#earG)"/><ellipse cx="311" cy="160" rx="7" ry="20" fill="#E39A00" opacity=".45"/></g>
  <rect id="shell" x="92" y="76" width="216" height="168" rx="78" fill="url(#shellG)"/>
  <ellipse cx="102" cy="150" rx="4.5" ry="22" fill="#fff" opacity=".35"/>
  <ellipse id="pod-opening" cx="200" cy="92" rx="72" ry="11" fill="#06655D"/>
  <g id="toolkit" clip-path="url(#podTop)">
   <g id="gear"><path d="{gear(156, 82)}" fill="#FFC21A"/><circle cx="156" cy="82" r="8" fill="#E39A00"/><circle cx="153" cy="78" r="2.5" fill="#fff" opacity=".5"/></g>
   <g id="code-chip"><rect x="181" y="66" width="38" height="28" rx="8" fill="#ECFFFB"/><path d="M193 73 l-6 6 6 6 M205 72 l-6 15 M209 73 l6 6 -6 6" fill="none" stroke="#22B455" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></g>
   <g id="wrench"><g transform="translate(248 60) rotate(18) scale(1.18)"><path d="M-15 -2 L-15 -15 L-6 -15 L-6 -5 L6 -5 L6 -15 L15 -15 L15 -2 Q15 13 0 13 Q-15 13 -15 -2Z" fill="#8B5CF6"/><rect x="-6.5" y="8" width="13" height="46" rx="6.5" fill="#7C3AED"/><rect x="-3" y="12" width="3" height="30" rx="1.5" fill="#fff" opacity=".3"/></g></g>
  </g>
  <path d="M128 93 A72 11 0 0 0 272 93" fill="none" stroke="#F3FFFD" stroke-width="4.5" stroke-linecap="round"/>
  <rect id="face-rim" x="106" y="104" width="188" height="126" rx="56" fill="#F2FFFD"/>
  <rect id="screen" x="118" y="114" width="164" height="106" rx="46" fill="url(#screenG)"/>
  <path d="M140 132 Q150 120 172 119" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".12"/>
  <g id="face">
   <g id="brows"></g>
   <g id="eyes">{eye_variants('l', 166, 160)}{eye_variants('r', 234, 160)}</g>
   <g id="cheeks"><ellipse cx="139" cy="190" rx="10" ry="6" fill="#FF7FA8" opacity=".55"/><ellipse cx="261" cy="190" rx="10" ry="6" fill="#FF7FA8" opacity=".55"/></g>
   {mouth()}
  </g>
 </g>
 {arm('l')}{arm('r')}
</g></g>
<g id="fx-front">{extras_front}{cf_front}</g>
</svg>'''
    os.makedirs(OUT, exist_ok=True)
    open(os.path.join(OUT, f'pip-{mood}.svg'), 'w').write(svg)
    return svg

IO = 'cubic-bezier(.45,0,.55,1)'      # sine in-out
OUTE = 'cubic-bezier(.22,1,.36,1)'    # soft out
INE = 'cubic-bezier(.55,0,.9,.4)'     # accelerate (gravity)
BACK = 'cubic-bezier(.34,1.6,.64,1)'  # overshoot

def anim(sel, name, frames, dur='var(--dur)', ease=IO, delay='0s'):
    body = ' '.join(f'{p}{{{v}}}' for p, v in frames)
    return f'@keyframes {name}{{{body}}}\n{sel}{{animation:{name} {dur} {ease} {delay} infinite}}\n'

def vis(ids, frames, name):
    """animate opacity of variant groups"""
    return anim(','.join('#' + i for i in ids), name, frames, ease='steps(1,end)' if False else 'linear')

MOODS = {}

# ---------------- IDLE ----------------
c = ''
c += anim('#pip', 'i-bob', [('0%,100%', 'transform:translateY(0)'), ('50%', 'transform:translateY(-7px)')])
c += anim('#torso', 'i-breathe', [('0%,100%', 'transform:scale(1,1)'), ('50%', 'transform:scale(1.015,1.03)')])
c += anim('#shadow', 'i-sh', [('0%,100%', 'transform:scale(1);opacity:.13'), ('50%', 'transform:scale(.93);opacity:.1')])
c += anim('#head', 'i-head', [('0%,100%', 'transform:rotate(-1.6deg)'), ('50%', 'transform:rotate(1.6deg)')], delay='-.45s')
c += anim('#antenna', 'i-ant', [('0%,100%', 'transform:rotate(-4deg)'), ('50%', 'transform:rotate(4deg)')], delay='-.9s')
c += anim('#antenna-glow', 'i-glow', [('0%,100%', 'transform:scale(.85);opacity:.15'), ('50%', 'transform:scale(1.25);opacity:.55')])
c += anim('#arm-l', 'i-al', [('0%,100%', 'transform:rotate(0)'), ('50%', 'transform:rotate(-4deg)')], delay='-.3s')
c += anim('#arm-r', 'i-ar', [('0%,100%', 'transform:rotate(0)'), ('50%', 'transform:rotate(4deg)')], delay='-.3s')
c += anim('#eyes', 'i-blink', [('0%,62%,68%,90%,100%', 'transform:scaleY(1)'), ('65%,93%', 'transform:scaleY(.08)')], ease='cubic-bezier(.4,0,.6,1)', dur='calc(var(--dur) * 2)')
c += anim('#chest-lights circle', 'i-led', [('0%,100%', 'opacity:1'), ('50%', 'opacity:.55')])
c += '#led-2{animation-delay:-.6s}#led-3{animation-delay:-1.2s}\n'
MOODS['idle'] = (c, '3.2s', 'Idle', '', '')

# ---------------- WAVE ----------------
c = ''
c += anim('#arm-r', 'w-arm', [
    ('0%', f'transform:rotate(0);animation-timing-function:{IO}'),
    ('9%', f'transform:rotate(10deg);animation-timing-function:{BACK}'),          # anticipation
    ('24%', f'transform:rotate(-104deg);animation-timing-function:{IO}'),
    ('33%', 'transform:rotate(-126deg)'), ('42%', 'transform:rotate(-90deg)'),
    ('51%', 'transform:rotate(-126deg)'), ('60%', 'transform:rotate(-90deg)'),
    ('69%', 'transform:rotate(-112deg)'),
    ('80%', f'transform:rotate(-102deg);animation-timing-function:cubic-bezier(.5,0,.3,1)'),
    ('94%,100%', 'transform:rotate(0)')], ease=IO)
c += anim('#hand-r', 'w-hand', [('0%,24%,80%,100%', 'transform:rotate(0)'), ('33%,51%', 'transform:rotate(-22deg)'), ('42%,60%', 'transform:rotate(18deg)'), ('69%', 'transform:rotate(-8deg)')])
c += anim('#head', 'w-head', [('0%,12%,94%,100%', 'transform:rotate(0)'), ('28%,80%', 'transform:rotate(6deg) translateX(3px)')])
c += anim('#pip-squash', 'w-lean', [('0%,10%,96%,100%', 'transform:rotate(0) scale(1)'), ('8%', 'transform:rotate(1deg) scale(1.02,.97)'), ('26%,80%', 'transform:rotate(-2.5deg) scale(1)')])
c += anim('#pip', 'w-bob', [('0%,100%', 'transform:translateY(0)'), ('42%', 'transform:translateY(-5px)'), ('60%', 'transform:translateY(0)'), ('78%', 'transform:translateY(-4px)')])
c += anim('#arm-l', 'w-al', [('0%,100%', 'transform:rotate(0)'), ('50%', 'transform:rotate(-5deg)')])
c += anim('#antenna', 'w-ant', [('0%,20%,100%', 'transform:rotate(0)'), ('30%', 'transform:rotate(-10deg)'), ('40%', 'transform:rotate(7deg)'), ('52%', 'transform:rotate(-4deg)'), ('64%', 'transform:rotate(2deg)')])
c += anim('#eye-l-open,#eye-r-open', 'w-eo', [('0%,18%,90%,100%', 'opacity:1'), ('22%,86%', 'opacity:0')], ease='linear')
c += anim('#eye-l-happy,#eye-r-happy', 'w-eh', [('0%,18%,90%,100%', 'opacity:0'), ('22%,86%', 'opacity:1')], ease='linear')
c += anim('#mouth-smile', 'w-ms', [('0%,18%,90%,100%', 'opacity:1'), ('22%,86%', 'opacity:0')], ease='linear')
c += anim('#mouth-grin', 'w-mg', [('0%,18%,90%,100%', 'opacity:0;transform:scale(.6)'), ('24%,86%', 'opacity:1;transform:scale(1)')], ease=BACK)
c += anim('#cheeks', 'w-ch', [('0%,18%,90%,100%', 'opacity:0'), ('26%,84%', 'opacity:1')])
MOODS['wave'] = (c, '2.8s', 'Wave hello', '', '')

# ---------------- HAPPY / SMILE ----------------
c = ''
c += anim('#pip', 'h-hop', [
    ('0%,18%', f'transform:translateY(0);animation-timing-function:{OUTE}'),
    ('34%', f'transform:translateY(-34px);animation-timing-function:{INE}'),
    ('50%', 'transform:translateY(0)'), ('100%', 'transform:translateY(0)')])
c += anim('#pip-squash', 'h-sq', [
    ('0%,8%', 'transform:scale(1,1)'),
    ('18%', f'transform:scale(1.08,.9);animation-timing-function:{OUTE}'),     # anticipation squash
    ('26%', 'transform:scale(.95,1.07)'),                                         # stretch on launch
    ('34%', 'transform:scale(1,1)'),
    ('46%', 'transform:scale(.97,1.04)'),
    ('51%', f'transform:scale(1.1,.88);animation-timing-function:{BACK}'),       # landing squash
    ('62%', 'transform:scale(.98,1.02)'), ('70%,100%', 'transform:scale(1,1)')], ease=IO)
c += anim('#shadow', 'h-sh', [('0%,18%,50%,100%', 'transform:scale(1);opacity:.13'), ('34%', 'transform:scale(.72);opacity:.07')])
c += anim('#antenna', 'h-ant', [('0%,46%,100%', 'transform:rotate(0)'), ('52%', 'transform:rotate(14deg)'), ('60%', 'transform:rotate(-9deg)'), ('68%', 'transform:rotate(5deg)'), ('76%', 'transform:rotate(-2deg)'), ('84%', 'transform:rotate(0)')])
c += anim('#antenna-glow', 'h-glow', [('0%,20%,100%', 'opacity:.2;transform:scale(.9)'), ('36%', 'opacity:.5;transform:scale(1.3)')])
c += anim('#arm-l', 'h-al', [('0%,18%,62%,100%', 'transform:rotate(0)'), ('30%', f'transform:rotate(38deg)'), ('48%', 'transform:rotate(10deg)')])
c += anim('#arm-r', 'h-ar', [('0%,18%,62%,100%', 'transform:rotate(0)'), ('30%', f'transform:rotate(-38deg)'), ('48%', 'transform:rotate(-10deg)')])
c += anim('#head', 'h-head', [('0%,100%', 'transform:rotate(0)'), ('60%', 'transform:rotate(-4deg)'), ('76%', 'transform:rotate(3deg)'), ('90%', 'transform:rotate(0)')])
c += anim('#eye-l-open,#eye-r-open', 'h-eo', [('0%,14%,94%,100%', 'opacity:1'), ('18%,90%', 'opacity:0')], ease='linear')
c += anim('#eye-l-happy,#eye-r-happy', 'h-eh', [('0%,14%,94%,100%', 'opacity:0'), ('18%,90%', 'opacity:1')], ease='linear')
c += anim('#mouth', 'h-m', [('0%,14%,94%,100%', 'transform:scale(1)'), ('22%,88%', 'transform:scale(1.35,1.25)')], ease=BACK)
c += anim('#cheeks', 'h-ch', [('0%,14%,94%,100%', 'opacity:0'), ('24%,88%', 'opacity:1')])
for i, d in enumerate(['0s', '-.25s', '-.5s']):
    c += anim(f'#sp{i}', f'h-sp{i}', [('0%,30%', 'opacity:0;transform:scale(0) rotate(0)'), ('42%', 'opacity:1;transform:scale(1.2) rotate(45deg)'), ('60%,100%', 'opacity:0;transform:scale(0) rotate(90deg)')], delay=d, ease=OUTE)
sp = star4(96, 70, 16, '#FFB700', 'sp0') + star4(312, 92, 12, '#7C3AED', 'sp1') + star4(296, 6, 10, '#FF6B6B', 'sp2')
MOODS['happy'] = (c, '2.6s', 'Happy smile', sp, '')

# ---------------- SAD ----------------
c = ''
c += '#eye-l-open,#eye-r-open,#mouth-smile{opacity:0}#eye-l-sad,#eye-r-sad,#mouth-frown{opacity:1}\n'
c += anim('#head', 's-head', [('0%,100%', 'transform:translateY(7px) rotate(-3deg)'), ('45%', 'transform:translateY(12px) rotate(-6deg)'), ('70%', 'transform:translateY(4px) rotate(-2deg)')])
c += anim('#antenna', 's-ant', [('0%,100%', 'transform:rotate(26deg)'), ('45%', 'transform:rotate(34deg)'), ('70%', 'transform:rotate(22deg)')], delay='-.4s')
c += '#antenna-glow{opacity:0}#antenna-dim{opacity:.6}\n'
c += anim('#torso', 's-breath', [('0%,100%', 'transform:scale(1,.97)'), ('45%', 'transform:scale(1.01,.95)'), ('70%', 'transform:scale(1,1)')])
c += anim('#arm-l', 's-al', [('0%,100%', 'transform:rotate(-12deg)'), ('45%', 'transform:rotate(-15deg) translateY(4px)'), ('70%', 'transform:rotate(-9deg)')])
c += anim('#arm-r', 's-ar', [('0%,100%', 'transform:rotate(12deg)'), ('45%', 'transform:rotate(15deg) translateY(4px)'), ('70%', 'transform:rotate(9deg)')])
c += anim('#pip', 's-pip', [('0%,100%', 'transform:translateY(3px)'), ('45%', 'transform:translateY(6px)'), ('70%', 'transform:translateY(0)')])
c += anim('#tear', 's-tear', [('0%,8%', 'opacity:0;transform:translate(0,0) scale(.2)'), ('22%', f'opacity:1;transform:translate(0,0) scale(1);animation-timing-function:{INE}'), ('52%', 'opacity:1;transform:translate(-3px,46px) scale(1,1.1)'), ('60%,100%', 'opacity:0;transform:translate(-4px,58px) scale(.9)')], ease=OUTE)
c += anim('#chest-lights circle', 's-led', [('0%,100%', 'opacity:.35'), ('50%', 'opacity:.6')])
c += anim('#mouth', 's-m', [('0%,100%', 'transform:scale(1)'), ('45%', 'transform:scale(.9,1.1)')])
tear = '<g transform="translate(176 172)"><g id="tear" style="transform-box:view-box;transform-origin:0 0"><path d="M0 -9 Q7 0 7 4 A7 7 0 1 1 -7 4 Q-7 0 0 -9Z" fill="#60A5FA"/><ellipse cx="-2" cy="3" rx="2" ry="3" fill="#fff" opacity=".7"/></g></g>'
MOODS['sad'] = (c, '4.4s', 'Sad (streak broken)', '', '')

# ---------------- LAUGH ----------------
c = ''
c += '#eye-l-open,#eye-r-open,#mouth-smile{opacity:0}#eye-l-squint,#eye-r-squint,#mouth-grin,#cheeks{opacity:1}\n'
c += anim('#pip', 'l-b', [
    ('0%', f'transform:translateY(0);animation-timing-function:{OUTE}'), ('25%', f'transform:translateY(-16px);animation-timing-function:{INE}'),
    ('50%', f'transform:translateY(0);animation-timing-function:{OUTE}'), ('75%', f'transform:translateY(-16px);animation-timing-function:{INE}'), ('100%', 'transform:translateY(0)')])
c += anim('#pip-squash', 'l-s', [('0%,50%,100%', 'transform:scale(1.07,.91)'), ('12%,62%', 'transform:scale(.96,1.05)'), ('25%,75%', 'transform:scale(1,1)'), ('40%,90%', 'transform:scale(.98,1.03)')])
c += anim('#shadow', 'l-sh', [('0%,50%,100%', 'transform:scale(1)'), ('25%,75%', 'transform:scale(.85)')])
c += anim('#head', 'l-h', [('0%,100%', 'transform:rotate(-5deg)'), ('25%', 'transform:rotate(4deg) translateY(-3px)'), ('50%', 'transform:rotate(-4deg)'), ('75%', 'transform:rotate(5deg) translateY(-3px)')])
c += anim('#mouth', 'l-m', [('0%,50%,100%', 'transform:scale(1.1,.8)'), ('25%,75%', 'transform:scale(1.2,1.25)')])
c += anim('#arm-l', 'l-al', [('0%,50%,100%', 'transform:rotate(-42deg)'), ('25%,75%', 'transform:rotate(-30deg)')])
c += anim('#arm-r', 'l-ar', [('0%,50%,100%', 'transform:rotate(42deg)'), ('25%,75%', 'transform:rotate(30deg)')])
c += anim('#antenna', 'l-ant', [('0%,50%,100%', 'transform:rotate(8deg)'), ('25%,75%', 'transform:rotate(-8deg)')], delay='-.1s')
c += anim('#ha-l,#ha-r', 'l-ha', [('0%,50%,100%', 'opacity:0;transform:scale(.6)'), ('20%,70%', 'opacity:1;transform:scale(1.05)')], ease=OUTE)
c += '#ha-r{animation-delay:-.2s}\n'
c += anim('#antenna-glow', 'l-glow', [('0%,50%,100%', 'opacity:.25'), ('25%,75%', 'opacity:.6')])
ha = ('<g id="ha-l" style="transform-box:view-box;transform-origin:60px 120px"><path d="M66 96 l-16 -8 M60 120 h-20 M66 144 l-16 8" stroke="#FFB700" stroke-width="6" stroke-linecap="round"/></g>'
      '<g id="ha-r" style="transform-box:view-box;transform-origin:340px 120px"><path d="M334 96 l16 -8 M340 120 h20 M334 144 l16 8" stroke="#FFB700" stroke-width="6" stroke-linecap="round"/></g>')
MOODS['laugh'] = (c, '1.4s', 'Laugh', ha, '')

# ---------------- CLAP ----------------
c = ''
c += '#eye-l-open,#eye-r-open,#mouth-smile{opacity:0}#eye-l-happy,#eye-r-happy,#mouth-grin,#cheeks{opacity:1}\n'
c += anim('#arm-l', 'c-al', [
    ('0%,100%', f'transform:rotate(-22deg);animation-timing-function:{INE}'), ('16%', f'transform:rotate(-62deg);animation-timing-function:{OUTE}'),
    ('26%', f'transform:rotate(-46deg);animation-timing-function:{IO}'), ('36%', f'transform:rotate(-20deg);animation-timing-function:{INE}'),
    ('52%', f'transform:rotate(-62deg);animation-timing-function:{OUTE}'), ('62%', f'transform:rotate(-46deg);animation-timing-function:{IO}'), ('80%', 'transform:rotate(-14deg)')])
c += anim('#arm-r', 'c-ar', [
    ('0%,100%', f'transform:rotate(22deg);animation-timing-function:{INE}'), ('16%', f'transform:rotate(62deg);animation-timing-function:{OUTE}'),
    ('26%', f'transform:rotate(46deg);animation-timing-function:{IO}'), ('36%', f'transform:rotate(20deg);animation-timing-function:{INE}'),
    ('52%', f'transform:rotate(62deg);animation-timing-function:{OUTE}'), ('62%', f'transform:rotate(46deg);animation-timing-function:{IO}'), ('80%', 'transform:rotate(14deg)')])
c += anim('#hand-l', 'c-hl', [('0%,36%,80%,100%', 'transform:rotate(0)'), ('16%,52%', 'transform:rotate(-20deg)')])
c += anim('#hand-r', 'c-hr', [('0%,36%,80%,100%', 'transform:rotate(0)'), ('16%,52%', 'transform:rotate(20deg)')])
c += anim('#burst', 'c-burst', [('0%,15%', 'opacity:0;transform:scale(.4)'), ('17%', 'opacity:1;transform:scale(.8)'), ('28%', 'opacity:0;transform:scale(1.35)'),
                               ('50%,51%', 'opacity:0;transform:scale(.4)'), ('53%', 'opacity:1;transform:scale(.8)'), ('64%,100%', 'opacity:0;transform:scale(1.35)')], ease=OUTE)
c += anim('#pip-squash', 'c-sq', [('0%,36%,80%,100%', 'transform:scale(1)'), ('17%,53%', 'transform:scale(1.04,.96)'), ('26%,62%', 'transform:scale(.99,1.02)')])
c += anim('#head', 'c-h', [('0%,100%', 'transform:rotate(0) translateY(0)'), ('17%,53%', 'transform:rotate(-2deg) translateY(4px)'), ('30%,66%', 'transform:rotate(2deg) translateY(-2px)')])
c += anim('#pip', 'c-pip', [('0%,100%', 'transform:translateY(0)'), ('30%,66%', 'transform:translateY(-6px)'), ('17%,53%', 'transform:translateY(1px)')])
c += anim('#antenna', 'c-ant', [('0%,100%', 'transform:rotate(0)'), ('20%,56%', 'transform:rotate(-8deg)'), ('32%,68%', 'transform:rotate(6deg)')])
c += anim('#mouth', 'c-m', [('0%,36%,80%,100%', 'transform:scale(1)'), ('17%,53%', 'transform:scale(1.2,1.25)')], ease=BACK)
burst = '<g id="burst" style="transform-box:view-box;transform-origin:200px 300px"><path d="M200 262 v-16 M228 272 l11 -11 M172 272 l-11 -11 M238 300 h16 M162 300 h-16" stroke="#FFB700" stroke-width="6" stroke-linecap="round"/></g>'
MOODS['clap'] = (c, '1.8s', 'Clap', burst, '')

# ---------------- CHEER / CELEBRATE ----------------
c = ''
c += '#eye-l-open,#eye-r-open,#mouth-smile{opacity:0}#cheeks{opacity:1}\n'
c += anim('#pip', 'ch-j', [
    ('0%,12%', f'transform:translateY(0);animation-timing-function:{OUTE}'),
    ('30%', f'transform:translateY(-92px);animation-timing-function:{IO}'),
    ('38%', f'transform:translateY(-96px);animation-timing-function:{INE}'),
    ('54%', 'transform:translateY(0)'), ('100%', 'transform:translateY(0)')])
c += anim('#pip-squash', 'ch-s', [
    ('0%,2%', 'transform:scale(1,1)'), ('12%', f'transform:scale(1.12,.84);animation-timing-function:{OUTE}'),
    ('19%', 'transform:scale(.9,1.12)'), ('30%,40%', 'transform:scale(1,1)'), ('50%', 'transform:scale(.95,1.07)'),
    ('55%', f'transform:scale(1.14,.84);animation-timing-function:{BACK}'), ('66%', 'transform:scale(.97,1.03)'), ('74%,100%', 'transform:scale(1,1)')], ease=IO)
c += anim('#shadow', 'ch-sh', [('0%,12%,54%,100%', 'transform:scale(1);opacity:.13'), ('12%', 'transform:scale(1.1);opacity:.15'), ('32%,38%', 'transform:scale(.45);opacity:.05')])
c += anim('#arm-l', 'ch-al', [('0%,4%', 'transform:rotate(0)'), ('12%', f'transform:rotate(-14deg);animation-timing-function:{BACK}'), ('24%', 'transform:rotate(126deg)'),
                             ('34%', 'transform:rotate(104deg)'), ('44%', 'transform:rotate(120deg)'), ('58%', 'transform:rotate(100deg)'), ('68%', 'transform:rotate(126deg)'), ('78%', 'transform:rotate(104deg)'),
                             ('86%', f'transform:rotate(112deg);animation-timing-function:{IO}'), ('100%', 'transform:rotate(0)')], ease=IO)
c += anim('#arm-r', 'ch-ar', [('0%,4%', 'transform:rotate(0)'), ('12%', f'transform:rotate(14deg);animation-timing-function:{BACK}'), ('24%', 'transform:rotate(-126deg)'),
                             ('34%', 'transform:rotate(-104deg)'), ('44%', 'transform:rotate(-120deg)'), ('58%', 'transform:rotate(-100deg)'), ('68%', 'transform:rotate(-126deg)'), ('78%', 'transform:rotate(-104deg)'),
                             ('86%', f'transform:rotate(-112deg);animation-timing-function:{IO}'), ('100%', 'transform:rotate(0)')], ease=IO)
c += anim('#head', 'ch-h', [('0%,100%', 'transform:rotate(0)'), ('12%', 'transform:translateY(6px)'), ('24%', 'transform:translateY(-4px)'), ('55%', 'transform:translateY(6px)'), ('64%', 'transform:rotate(-3deg)'), ('76%', 'transform:rotate(3deg)'), ('88%', 'transform:rotate(0)')])
c += anim('#antenna', 'ch-ant', [('0%,100%', 'transform:rotate(0)'), ('14%', 'transform:rotate(-6deg)'), ('24%', 'transform:rotate(12deg)'), ('34%', 'transform:rotate(-6deg)'), ('56%', 'transform:rotate(16deg)'), ('64%', 'transform:rotate(-10deg)'), ('72%', 'transform:rotate(5deg)'), ('80%', 'transform:rotate(0)')])
c += anim('#antenna-glow', 'ch-glow', [('0%,16%,80%,100%', 'opacity:.2;transform:scale(.9)'), ('24%,60%', 'opacity:.5;transform:scale(1.35)')])
c += anim('#eye-l-happy,#eye-r-happy', 'ch-eh', [('0%,10%,90%,100%', 'opacity:0'), ('12%,18%', 'opacity:1'), ('20%,88%', 'opacity:0')], ease='linear')
c += anim('#eye-l-star,#eye-r-star', 'ch-es', [('0%,10%', 'opacity:1;transform:scale(1)'), ('12%,18%', 'opacity:0'), ('20%', 'opacity:1;transform:scale(1.1)'), ('30%', 'transform:scale(1.18)'), ('60%,100%', 'opacity:1;transform:scale(1)')], ease='linear')
c += '#eye-l-star{transform-origin:166px 160px}#eye-r-star{transform-origin:234px 160px}\n'
c += anim('#mouth-o', 'ch-mo', [('0%,10%,90%,100%', 'opacity:0'), ('12%,18%', 'opacity:1')], ease='linear')
c += anim('#mouth-grin', 'ch-mg', [('0%,10%,90%,100%', 'opacity:1'), ('12%,18%', 'opacity:0'), ('20%,88%', 'opacity:1')], ease='linear')
c += anim('#mouth', 'ch-m', [('0%,100%', 'transform:scale(1)'), ('24%,40%', 'transform:scale(1.3,1.35)'), ('60%', 'transform:scale(1.1)')], ease=BACK)
c += anim('#ring', 'ch-ring', [('0%,18%', 'opacity:0;transform:scale(.3)'), ('21%', 'opacity:.9;transform:scale(.6)'), ('40%,100%', 'opacity:0;transform:scale(1.6)')], ease=OUTE)
c += anim('#chest-lights circle', 'ch-led', [('0%,100%', 'opacity:1'), ('25%', 'opacity:.4'), ('50%', 'opacity:1'), ('75%', 'opacity:.4')], dur='.6s')
ring = '<g id="ring" style="transform-box:view-box;transform-origin:200px 40px"><circle cx="200" cy="40" r="120" fill="none" stroke="#FFB700" stroke-width="10" stroke-dasharray="4 26" stroke-linecap="round"/></g>'
MOODS['cheer'] = (c, '3.2s', 'Cheer + confetti', '', ring)

if __name__ == '__main__':
    meta = {}
    for k, (css, dur, title, front, back) in MOODS.items():
        if k == 'sad':
            front = tear
        build(k, css, front, back, dur, title)
        meta[k] = {'dur': float(dur[:-1]), 'title': title}
    json.dump(meta, open(os.path.join(OUT, '..', 'moods.json'), 'w'), indent=1)
    print('built', list(MOODS))
