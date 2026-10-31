"""Captain Jetty extra moods (thinking, sleepy, surprised, celebrate), built from the same rig as pip.py.
pip.py is imported unchanged; this file only adds moods. File names stay pip-*; every visible title says Captain Jetty.
Run: python3 pip_moods.py  → ../svg/pip-{mood}.svg (+ copies of the 7 original moods with corrected titles) and ../moods.json"""
import os, sys, re, json
HERE = os.path.dirname(os.path.abspath(__file__))
for p in (HERE, os.path.join(HERE, '..', '..', '..', 'design', 'motion', 'src')):
    if os.path.exists(os.path.join(p, 'pip.py')): sys.path.insert(0, p); PIP_SRC = p; break
import pip as R
from pip import anim, IO, OUTE, INE, BACK, EYE
R.OUT = os.path.join(HERE, '..', 'svg')
NAME = 'Captain Jetty'

def retitle(svg, title):
    svg = re.sub(r'aria-label="[^"]*"', f'aria-label="{NAME}, the TinkerPod robot: {title}"', svg, count=1)
    return re.sub(r'<title>[^<]*</title>', f'<title>{NAME} · {title}</title>', svg, count=1)

def closed_eyes(svg):
    """add a 'closed' (sleeping, lashes-down) eye variant next to the rig's own variants"""
    for side, cx in (('l', 166), ('r', 234)):
        g = (f'<g id="eye-{side}-closed" class="v"><path d="M{cx-14} {161} Q{cx} {173} {cx+14} {161}" fill="none" stroke="{EYE}" stroke-width="7" stroke-linecap="round"/>'
             f'<path d="M{cx-12} {171} l-4 5 M{cx+12} {171} l4 5" stroke="{EYE}" stroke-width="3.5" stroke-linecap="round" opacity=".55"/></g>')
        svg = svg.replace(f'<g id="eye-{side}">', f'<g id="eye-{side}">{g}', 1)
    return svg

def sv(id_, ox, oy, inner):   # an fx element with its own view-box transform origin
    return f'<g id="{id_}" style="transform-box:view-box;transform-origin:{ox}px {oy}px">{inner}</g>'

M = {}
# ───────── THINKING (3.6 s): hand on chin, eyes glance up-right then up-left, gear turns, "?" bobs ─────────
c = '#mouth-smile{opacity:1}\n'
c += anim('#head', 't-head', [('0%,100%', 'transform:rotate(-5deg)'), ('50%', 'transform:rotate(-2deg) translateY(1px)')])
c += anim('#eyes', 't-eyes', [('0%,38%', 'transform:translate(6px,-9px) scaleY(1)'), ('44%', 'transform:translate(0px,-9px) scaleY(.1)'),
                              ('50%,86%', 'transform:translate(-6px,-9px) scaleY(1)'), ('93%,100%', 'transform:translate(6px,-9px) scaleY(1)')], ease=IO)
c += anim('#mouth', 't-m', [('0%,100%', 'transform:translateX(9px) scale(.55,.45)'), ('50%', 'transform:translateX(7px) scale(.6,.4)')])
c += anim('#arm-r', 't-ar', [('0%,100%', 'transform:rotate(134deg)'), ('20%', 'transform:rotate(130deg)'), ('26%', 'transform:rotate(136deg)'), ('32%', 'transform:rotate(131deg)'), ('38%', 'transform:rotate(134deg)')])
c += anim('#hand-r', 't-hr', [('0%,100%', 'transform:rotate(-20deg)'), ('50%', 'transform:rotate(-14deg)')])
c += anim('#arm-l', 't-al', [('0%,100%', 'transform:rotate(-14deg)'), ('50%', 'transform:rotate(-18deg)')])
c += anim('#pip', 't-bob', [('0%,100%', 'transform:translateY(0)'), ('50%', 'transform:translateY(-4px)')])
c += anim('#torso', 't-breathe', [('0%,100%', 'transform:scale(1,1)'), ('50%', 'transform:scale(1.012,1.025)')])
c += anim('#gear', 't-gear', [('0%', 'transform:rotate(0deg)'), ('100%', 'transform:rotate(360deg)')], ease='linear')
c += anim('#antenna', 't-ant', [('0%,100%', 'transform:rotate(-6deg)'), ('50%', 'transform:rotate(3deg)')], delay='-.6s')
c += anim('#antenna-glow', 't-glow', [('0%,100%', 'opacity:.15;transform:scale(.9)'), ('25%,75%', 'opacity:.6;transform:scale(1.3)'), ('50%', 'opacity:.2;transform:scale(1)')])
c += anim('#q', 't-q', [('0%', 'opacity:0;transform:translateY(10px) scale(.4) rotate(-10deg)'), ('10%', 'opacity:1;transform:translateY(-4px) scale(1.1) rotate(6deg)'),
                        ('16%', 'opacity:1;transform:translateY(0) scale(1) rotate(0deg)'), ('55%', 'opacity:1;transform:translateY(-6px) scale(1) rotate(-5deg)'),
                        ('88%', 'opacity:1;transform:translateY(0) scale(1) rotate(3deg)'), ('100%', 'opacity:0;transform:translateY(-12px) scale(.9) rotate(0deg)')], ease=IO)
for i, d in enumerate(('0s', '-.25s')):
    c += anim(f'#tb{i}', f't-tb{i}', [('0%,100%', 'opacity:.35;transform:scale(.8)'), ('50%', 'opacity:1;transform:scale(1.15)')], dur='1.2s', delay=d)
q = (sv('q', 330, 0, '<path d="M318 -18 Q318 -34 332 -34 Q347 -34 347 -20 Q347 -10 336 -5 L334 4" fill="none" stroke="#7C3AED" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="334" cy="20" r="6" fill="#7C3AED"/>')
     + sv('tb0', 288, 50, '<circle cx="288" cy="50" r="6" fill="#C4B5FD"/>') + sv('tb1', 304, 30, '<circle cx="304" cy="30" r="8" fill="#A78BFA"/>'))
M['thinking'] = (c, '3.6s', 'Thinking', q, '')

# ───────── SLEEPY → ENCOURAGING (5.2 s): dozes with Z's, wakes, smiles and waves "let's go again!" (streak paused, never shaming) ─────────
c = '#eye-l-open,#eye-r-open,#mouth-smile{opacity:0}\n'
c += anim('#eye-l-closed,#eye-r-closed', 'z-ec', [('0%,52%', 'opacity:1'), ('54%,96%', 'opacity:0'), ('98%,100%', 'opacity:1')], ease='linear')
c += anim('#eye-l-open,#eye-r-open', 'z-eo', [('0%,52%', 'opacity:0'), ('54%,62%', 'opacity:1'), ('64%,90%', 'opacity:0'), ('92%,96%', 'opacity:1'), ('98%,100%', 'opacity:0')], ease='linear')
c += anim('#eye-l-happy,#eye-r-happy', 'z-eh', [('0%,62%', 'opacity:0'), ('64%,90%', 'opacity:1'), ('92%,100%', 'opacity:0')], ease='linear')
c += anim('#eyes', 'z-ey', [('0%,54%', 'transform:scale(1)'), ('57%', 'transform:scale(1.2)'), ('62%,100%', 'transform:scale(1)')], ease=BACK)
c += anim('#mouth-o', 'z-mo', [('0%,12%', 'opacity:0'), ('18%,26%', 'opacity:1'), ('32%,40%', 'opacity:0'), ('44%,50%', 'opacity:1'), ('53%,100%', 'opacity:0')], ease='linear')
c += anim('#mouth-smile', 'z-ms', [('0%,12%', 'opacity:1'), ('18%,26%', 'opacity:0'), ('32%,40%', 'opacity:1'), ('44%,50%', 'opacity:0'), ('53%,62%', 'opacity:1'), ('64%,90%', 'opacity:0'), ('92%,100%', 'opacity:1')], ease='linear')
c += anim('#mouth-grin', 'z-mg', [('0%,62%', 'opacity:0;transform:scale(.6)'), ('66%,90%', 'opacity:1;transform:scale(1)'), ('92%,100%', 'opacity:0;transform:scale(.8)')], ease=BACK)
c += anim('#mouth', 'z-m', [('0%,52%', 'transform:scale(.7)'), ('58%,100%', 'transform:scale(1)')])
c += anim('#cheeks', 'z-ch', [('0%,62%', 'opacity:0'), ('68%,88%', 'opacity:1'), ('94%,100%', 'opacity:0')])
c += anim('#head', 'z-head', [('0%,100%', 'transform:translateY(8px) rotate(7deg)'), ('20%', 'transform:translateY(11px) rotate(8deg)'), ('40%', 'transform:translateY(6px) rotate(6deg)'),
                              ('52%', 'transform:translateY(10px) rotate(8deg)'), ('56%', f'transform:translateY(-6px) rotate(-2deg);animation-timing-function:{OUTE}'),
                              ('62%', 'transform:translateY(0) rotate(0deg)'), ('75%', 'transform:rotate(-4deg)'), ('88%', 'transform:rotate(2deg)'), ('94%', 'transform:translateY(4px) rotate(4deg)')])
c += anim('#antenna', 'z-ant', [('0%,52%', 'transform:rotate(22deg)'), ('56%', f'transform:rotate(-18deg);animation-timing-function:{OUTE}'), ('60%', 'transform:rotate(10deg)'),
                                ('64%', 'transform:rotate(-4deg)'), ('68%,90%', 'transform:rotate(0deg)'), ('98%,100%', 'transform:rotate(22deg)')])
c += anim('#antenna-dim', 'z-dim', [('0%,52%', 'opacity:.55'), ('56%,92%', 'opacity:0'), ('99%,100%', 'opacity:.55')])
c += anim('#antenna-glow', 'z-glow', [('0%,54%', 'opacity:0;transform:scale(.8)'), ('58%', 'opacity:.7;transform:scale(1.5)'), ('66%,90%', 'opacity:.35;transform:scale(1.1)'), ('96%,100%', 'opacity:0;transform:scale(.8)')])
c += anim('#torso', 'z-breath', [('0%,100%', 'transform:scale(1,.98)'), ('20%', 'transform:scale(1.02,1.03)'), ('40%', 'transform:scale(1,.98)'), ('52%', 'transform:scale(1.02,1.03)'), ('58%,92%', 'transform:scale(1,1)')])
c += anim('#pip', 'z-pip', [('0%,54%', 'transform:translateY(2px)'), ('58%', f'transform:translateY(-22px);animation-timing-function:{INE}'), ('63%', 'transform:translateY(0)'), ('96%,100%', 'transform:translateY(2px)')])
c += anim('#pip-squash', 'z-sq', [('0%,54%', 'transform:scale(1,1)'), ('55%', 'transform:scale(1.06,.93)'), ('58%', 'transform:scale(.96,1.05)'), ('63%', 'transform:scale(1.06,.94)'), ('68%,100%', 'transform:scale(1,1)')])
c += anim('#arm-l', 'z-al', [('0%,52%', 'transform:rotate(-6deg)'), ('58%', 'transform:rotate(-30deg)'), ('66%,90%', 'transform:rotate(-6deg)'), ('100%', 'transform:rotate(-6deg)')])
c += anim('#arm-r', 'z-ar', [('0%,52%', 'transform:rotate(6deg)'), ('58%', 'transform:rotate(30deg)'), ('64%', 'transform:rotate(-112deg)'), ('70%', 'transform:rotate(-128deg)'),
                             ('76%', 'transform:rotate(-100deg)'), ('82%', 'transform:rotate(-128deg)'), ('88%', 'transform:rotate(-104deg)'), ('95%,100%', 'transform:rotate(6deg)')])
c += anim('#hand-r', 'z-hr', [('0%,64%', 'transform:rotate(0)'), ('70%,82%', 'transform:rotate(-20deg)'), ('76%,88%', 'transform:rotate(16deg)'), ('94%,100%', 'transform:rotate(0)')])
c += anim('#chest-lights circle', 'z-led', [('0%,52%', 'opacity:.35'), ('56%,92%', 'opacity:1'), ('100%', 'opacity:.35')])
zs = ''
for i, (x, y, s) in enumerate(((292, 58, .8), (318, 26, 1.0), (348, -12, 1.25))):
    zs += sv(f'z{i}', x, y, f'<path d="M{x-7*s:.1f} {y-8*s:.1f} h{14*s:.1f} l{-14*s:.1f} {16*s:.1f} h{14*s:.1f}" fill="none" stroke="#A78BFA" stroke-width="{4.5*s:.1f}" stroke-linecap="round" stroke-linejoin="round"/>')
    t0 = 2 + i * 12
    c += anim(f'#z{i}', f'z-z{i}', [('0%', 'opacity:0;transform:translate(-8px,10px) scale(.5)'), (f'{t0}%', 'opacity:0;transform:translate(-8px,10px) scale(.5)'),
                                    (f'{t0+8}%', 'opacity:1;transform:translate(0,0) scale(1)'), (f'{t0+16}%', 'opacity:1;transform:translate(6px,-8px) scale(1)'),
                                    (f'{t0+24}%', 'opacity:0;transform:translate(10px,-16px) scale(1.1)'), ('100%', 'opacity:0;transform:translate(10px,-16px) scale(1.1)')], ease=IO)
spk = R.star4(318, 110, 13, '#FFB700', 'zs0') + R.star4(80, 70, 10, '#00BFAE', 'zs1')
for i, d in enumerate(('0s', '-.15s')):
    c += anim(f'#zs{i}', f'z-sp{i}', [('0%,64%', 'opacity:0;transform:scale(0) rotate(0)'), ('70%', 'opacity:1;transform:scale(1.2) rotate(45deg)'), ('80%,100%', 'opacity:0;transform:scale(0) rotate(90deg)')], delay=d, ease=OUTE)
M['sleepy'] = (c, '5.2s', 'Sleepy, then wakes up to cheer you on', zs + spk, '')

# ───────── SURPRISED (2.0 s): little jump, big eyes, "o" mouth, antenna boing, "!" pop ─────────
c = '#mouth-smile{opacity:0}#mouth-o{opacity:1}\n'
c += anim('#pip', 'su-j', [('0%,8%', f'transform:translateY(0);animation-timing-function:{OUTE}'), ('20%', f'transform:translateY(-26px);animation-timing-function:{INE}'),
                           ('32%', 'transform:translateY(0)'), ('100%', 'transform:translateY(0)')])
c += anim('#pip-squash', 'su-s', [('0%', 'transform:scale(1,1)'), ('8%', 'transform:scale(1.07,.92)'), ('14%', 'transform:scale(.94,1.08)'), ('24%', 'transform:scale(1,1)'),
                                  ('32%', f'transform:scale(1.08,.92);animation-timing-function:{BACK}'), ('42%,100%', 'transform:scale(1,1)')])
c += anim('#shadow', 'su-sh', [('0%,8%,32%,100%', 'transform:scale(1);opacity:.13'), ('20%', 'transform:scale(.8);opacity:.08')])
c += anim('#eyes', 'su-e', [('0%,6%', 'transform:scale(1)'), ('14%', 'transform:scale(1.28,1.34)'), ('24%,74%', 'transform:scale(1.2,1.24)'), ('77%', 'transform:scale(1.2,.1)'),
                            ('80%,92%', 'transform:scale(1.18,1.22)'), ('100%', 'transform:scale(1)')], ease=BACK)
c += anim('#mouth', 'su-m', [('0%,6%', 'transform:scale(.5)'), ('16%', 'transform:scale(1.25)'), ('30%,90%', 'transform:scale(1)'), ('100%', 'transform:scale(.5)')], ease=BACK)
c += anim('#head', 'su-h', [('0%,6%', 'transform:translateY(0)'), ('12%', 'transform:translateY(-8px) rotate(-3deg)'), ('30%', 'transform:translateY(2px)'), ('44%,100%', 'transform:translateY(0) rotate(0)')])
c += anim('#antenna', 'su-ant', [('0%,8%', 'transform:rotate(0)'), ('14%', 'transform:rotate(-20deg)'), ('22%', 'transform:rotate(16deg)'), ('30%', 'transform:rotate(-10deg)'),
                                 ('38%', 'transform:rotate(6deg)'), ('46%', 'transform:rotate(-3deg)'), ('54%,100%', 'transform:rotate(0)')])
c += anim('#antenna-glow', 'su-glow', [('0%,8%', 'opacity:.2;transform:scale(.9)'), ('14%', 'opacity:.8;transform:scale(1.6)'), ('50%,100%', 'opacity:.25;transform:scale(1)')])
c += anim('#arm-l', 'su-al', [('0%,6%', 'transform:rotate(0)'), ('14%', 'transform:rotate(58deg)'), ('24%,80%', 'transform:rotate(48deg)'), ('100%', 'transform:rotate(0)')], ease=OUTE)
c += anim('#arm-r', 'su-ar', [('0%,6%', 'transform:rotate(0)'), ('14%', 'transform:rotate(-58deg)'), ('24%,80%', 'transform:rotate(-48deg)'), ('100%', 'transform:rotate(0)')], ease=OUTE)
c += anim('#hand-l', 'su-hl', [('0%,6%,100%', 'transform:rotate(0)'), ('14%,80%', 'transform:rotate(-24deg)')])
c += anim('#hand-r', 'su-hr', [('0%,6%,100%', 'transform:rotate(0)'), ('14%,80%', 'transform:rotate(24deg)')])
c += anim('#bang', 'su-bang', [('0%,8%', 'opacity:0;transform:scale(0) rotate(-20deg)'), ('16%', 'opacity:1;transform:scale(1.25) rotate(8deg)'), ('24%,80%', 'opacity:1;transform:scale(1) rotate(0deg)'),
                               ('92%,100%', 'opacity:0;transform:scale(.6) rotate(0deg)')], ease=OUTE)
c += anim('#pops', 'su-pops', [('0%,10%', 'opacity:0;transform:scale(.5)'), ('16%', 'opacity:1;transform:scale(1)'), ('34%,100%', 'opacity:0;transform:scale(1.4)')], ease=OUTE)
bang = (sv('bang', 330, 10, '<path d="M330 -30 L330 4" stroke="#FF6B6B" stroke-width="13" stroke-linecap="round"/><circle cx="330" cy="24" r="7.5" fill="#FF6B6B"/>')
        + sv('pops', 200, 40, '<path d="M150 18 l-14 -14 M200 -8 v-20 M250 18 l14 -14 M120 60 h-20 M280 60 h20" stroke="#FFB700" stroke-width="7" stroke-linecap="round"/>'))
M['surprised'] = (c, '2.0s', 'Surprised', bang, '')

# ───────── CELEBRATE (3.0 s): victory dance, alternate fist pumps, two hops, star eyes, confetti ─────────
c = '#eye-l-open,#eye-r-open,#mouth-smile{opacity:0}#eye-l-star,#eye-r-star,#mouth-grin,#cheeks{opacity:1}\n'
c += '#eye-l-star{transform-origin:166px 160px}#eye-r-star{transform-origin:234px 160px}\n'
c += anim('#pip', 'ce-j', [('0%', f'transform:translateY(0) rotate(0deg);animation-timing-function:{OUTE}'), ('12%', f'transform:translateY(-40px) rotate(-4deg);animation-timing-function:{INE}'),
                           ('24%', 'transform:translateY(0) rotate(-5deg)'), ('36%', 'transform:translateY(-4px) rotate(5deg)'), ('48%', f'transform:translateY(0) rotate(-5deg);animation-timing-function:{OUTE}'),
                           ('60%', f'transform:translateY(-40px) rotate(4deg);animation-timing-function:{INE}'), ('72%', 'transform:translateY(0) rotate(5deg)'), ('86%', 'transform:translateY(-3px) rotate(-3deg)'), ('100%', 'transform:translateY(0) rotate(0deg)')])
c += anim('#pip-squash', 'ce-s', [('0%,48%', 'transform:scale(1.08,.9)'), ('5%,53%', 'transform:scale(.94,1.08)'), ('12%,60%', 'transform:scale(1,1)'), ('24%,72%', 'transform:scale(1.1,.88)'),
                                  ('32%,80%', 'transform:scale(.98,1.03)'), ('40%,88%', 'transform:scale(1,1)'), ('100%', 'transform:scale(1.08,.9)')])
c += anim('#shadow', 'ce-sh', [('0%,24%,48%,72%,100%', 'transform:scale(1);opacity:.13'), ('12%,60%', 'transform:scale(.68);opacity:.06')])
c += anim('#arm-l', 'ce-al', [('0%,100%', 'transform:rotate(30deg)'), ('12%', 'transform:rotate(120deg)'), ('24%', 'transform:rotate(30deg)'), ('36%', 'transform:rotate(112deg)'),
                              ('48%', 'transform:rotate(30deg)'), ('60%', 'transform:rotate(120deg)'), ('72%', 'transform:rotate(30deg)'), ('86%', 'transform:rotate(112deg)')])
c += anim('#arm-r', 'ce-ar', [('0%,100%', 'transform:rotate(-112deg)'), ('12%', 'transform:rotate(-120deg)'), ('24%', 'transform:rotate(-30deg)'), ('36%', 'transform:rotate(-120deg)'),
                              ('48%', 'transform:rotate(-30deg)'), ('60%', 'transform:rotate(-120deg)'), ('72%', 'transform:rotate(-30deg)'), ('86%', 'transform:rotate(-120deg)')])
c += anim('#hand-l', 'ce-hl', [('0%,100%', 'transform:rotate(0)'), ('12%,60%', 'transform:rotate(-16deg)')])
c += anim('#hand-r', 'ce-hr', [('0%,100%', 'transform:rotate(0)'), ('12%,36%,60%', 'transform:rotate(16deg)')])
c += anim('#head', 'ce-h', [('0%,100%', 'transform:rotate(0)'), ('24%', 'transform:rotate(-6deg) translateY(4px)'), ('48%', 'transform:rotate(6deg)'), ('72%', 'transform:rotate(-6deg) translateY(4px)')])
c += anim('#antenna', 'ce-ant', [('0%,100%', 'transform:rotate(0)'), ('14%', 'transform:rotate(-14deg)'), ('26%', 'transform:rotate(14deg)'), ('38%', 'transform:rotate(-8deg)'),
                                 ('62%', 'transform:rotate(-14deg)'), ('74%', 'transform:rotate(14deg)'), ('86%', 'transform:rotate(-6deg)')])
c += anim('#antenna-glow', 'ce-glow', [('0%,100%', 'opacity:.35;transform:scale(1)'), ('12%,60%', 'opacity:.75;transform:scale(1.5)'), ('36%,84%', 'opacity:.3;transform:scale(1)')])
c += anim('#eye-l-star,#eye-r-star', 'ce-es', [('0%,24%,48%,72%,100%', 'transform:scale(1)'), ('12%,60%', 'transform:scale(1.18)')], ease=BACK)
c += anim('#mouth', 'ce-m', [('0%,24%,48%,72%,100%', 'transform:scale(1.1)'), ('12%,60%', 'transform:scale(1.35,1.4)')], ease=BACK)
c += anim('#chest-lights circle', 'ce-led', [('0%,100%', 'opacity:1'), ('50%', 'opacity:.35')], dur='.5s')
c += '#led-2{animation-delay:-.17s}#led-3{animation-delay:-.34s}\n'
cb, cf, ccss = R.confetti(28, 13)
c += ccss.replace('@keyframes cf', '@keyframes ce-cf').replace('animation:cf', 'animation:ce-cf') + '\n'
c += '.cf{transform-box:view-box}\n'
sps = R.star4(70, 40, 16, '#FFB700', 'cs0') + R.star4(334, 70, 13, '#FF6B6B', 'cs1') + R.star4(320, 230, 11, '#2563EB', 'cs2') + R.star4(78, 220, 12, '#63C132', 'cs3')
for i, d in enumerate(('0s', '-.4s', '-.8s', '-1.2s')):
    c += anim(f'#cs{i}', f'ce-sp{i}', [('0%,20%', 'opacity:0;transform:scale(0) rotate(0)'), ('32%', 'opacity:1;transform:scale(1.2) rotate(45deg)'), ('50%,100%', 'opacity:0;transform:scale(0) rotate(90deg)')], delay=d, ease=OUTE)
M['celebrate'] = (c, '3.0s', 'Celebrate (victory dance)', cf + sps, cb)

ORIGINAL = {'idle': 'Idle', 'wave': 'Wave hello', 'happy': 'Happy smile', 'sad': 'Sad (streak broken)', 'laugh': 'Laugh', 'clap': 'Clap', 'cheer': 'Cheer + confetti'}
if __name__ == '__main__':
    meta = json.load(open(os.path.join(PIP_SRC, '..', 'moods.json'))) if os.path.exists(os.path.join(PIP_SRC, '..', 'moods.json')) else {}
    for k, t in ORIGINAL.items():   # same animation, title corrected to Captain Jetty
        src = os.path.join(PIP_SRC, '..', 'svg', f'pip-{k}.svg')
        if os.path.exists(src):
            open(os.path.join(R.OUT, f'pip-{k}.svg'), 'w').write(retitle(open(src).read(), t))
            meta.setdefault(k, {})['title'] = t
    for k, (css, dur, title, front, back) in M.items():
        svg = R.build(k, css, front, back, dur, title)
        svg = retitle(closed_eyes(svg) if k == 'sleepy' else svg, title)
        open(os.path.join(R.OUT, f'pip-{k}.svg'), 'w').write(svg)
        meta[k] = {'dur': float(dur[:-1]), 'title': title}
    json.dump(meta, open(os.path.join(HERE, '..', 'moods.json'), 'w'), indent=1)
    print('built', list(M))
