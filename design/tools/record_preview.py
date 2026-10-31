"""Preview MP4 for the whole pack (same method as design/fx/src/record.py): inline each SVG, pause Web Animations,
scrub currentTime per frame, then mix the pack's own sounds at the cue offsets. → preview/tinkerpod-design-pack-preview.mp4"""
import asyncio, json, os, base64, shutil, subprocess, numpy as np, soundfile as sf
from playwright.async_api import async_playwright
FPS, SIZE, SR = 30, 720, 48000
HERE = os.path.dirname(os.path.abspath(__file__)); PACK = os.path.dirname(HERE)
FR = '/tmp/packframes'; OUT = f'{PACK}/preview/tinkerpod-design-pack-preview.mp4'
CUES = json.load(open(f'{PACK}/fx/src/cues.json'))
LEAD, TAIL = .3, .4
def S(kind, path, title, sub, T, sounds=(), reps=1): return dict(kind=kind, path=path, title=title, sub=sub, T=T, sounds=list(sounds), reps=reps)
SEQ = [S('logo', 'assets/logo/tinkerpod-logo-intro.svg', 'Logo intro', '1.5 s · plays once on launch', 1.5)]
FXT = {'fx06-confetti-burst': 'Confetti burst', 'fx07-star-burst': 'Star burst', 'fx08-badge-reveal': 'Badge reveal', 'fx09-trophy-reveal': 'Trophy reveal',
       'fx10-streak-flame-idle': 'Streak flame · idle loop', 'fx11-loading-spinner': 'Loading spinner', 'fx12-pull-to-refresh': 'Pull to refresh',
       'fx13-skeleton-shimmer': 'Skeleton shimmer', 'fx14-progress-ring': 'Progress ring', 'fx15-download-meter': 'Download meter'}
for n, t in FXT.items():
    c = CUES[n]; snd = [(c['sound'], c['sound_at'])] if c.get('sound') else []
    SEQ.append(S('fx', f'fx/svg/{n}.svg', t, n + (f' · sound: {c["sound"]}' if snd else ' · loop'), c['T'], snd, 2 if c.get('loop') else 1))
for m, t, snd in [('thinking', 'Captain Jetty · thinking', []), ('sleepy', 'Captain Jetty · sleepy → cheers you on', []),
                  ('surprised', 'Captain Jetty · surprised', [('ui-message-pop', .12)]), ('celebrate', 'Captain Jetty · celebrate', [('ui-match-win', .0)])]:
    SEQ.append(S('mood', f'motion/svg/pip-{m}.svg', t, f'pip-{m}.svg', json.load(open(f'{PACK}/motion/moods.json'))[m]['dur'], snd))
for e, t in [('no-lessons', 'No lessons yet'), ('offline', 'Offline'), ('error', 'Something went wrong'), ('no-packs', 'No packs downloaded'),
             ('no-tournaments', 'No tournaments yet'), ('search-no-results', 'No search results'), ('no-kids', 'Parent · add your first child')]:
    SEQ.append(S('empty', f'assets/empty/empty-{e}.svg', 'Empty state · ' + t, f'empty-{e}.svg', 2.4))
UI = [k for k in CUES if k.startswith('ui-')]
logo = base64.b64encode(open(f'{PACK}/assets/logo/tinkerpod-logo.svg', 'rb').read()).decode()
HTML = f'''<html><head><link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=block" rel="stylesheet"><style>
body{{margin:0;width:{SIZE}px;height:{SIZE}px;background:#F8FAFC;font-family:Nunito;overflow:hidden;position:relative}}
.top{{position:absolute;top:26px;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:0 36px}}
.top img{{height:36px}} .tag{{font-weight:800;color:#64748B;font-size:16px;letter-spacing:.04em}}
#stage{{position:absolute;left:110px;top:84px;width:500px;height:500px;display:flex;align-items:center;justify-content:center}} #stage svg{{width:500px;height:500px}}
.lab{{position:absolute;bottom:40px;left:0;right:0;text-align:center}}
.lab .n{{display:inline-block;background:#E6FBF8;color:#007A70;font-weight:900;font-size:15px;border-radius:14px;padding:3px 12px;margin-bottom:6px;letter-spacing:.06em}}
.lab b{{display:block;font-weight:900;font-size:36px;color:#0F172A;line-height:1.05}} .lab span{{display:block;font-weight:700;font-size:18px;color:#64748B;margin-top:6px}}
#ui{{position:absolute;left:60px;top:110px;width:600px;height:450px;display:none;grid-template-columns:repeat(4,1fr);gap:10px}}
#ui div{{background:#fff;border-radius:14px;border:2px solid #E2E8F0;font-weight:800;font-size:13px;color:#334155;display:flex;align-items:center;justify-content:center;text-align:center;padding:4px}}
#ui div.on{{background:#7C3AED;border-color:#7C3AED;color:#fff;transform:scale(1.06)}}
#card{{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#F8FAFC}}
#card img{{height:80px;margin-bottom:24px}} #card b{{font-weight:900;font-size:42px;color:#0F172A}} #card span{{font-weight:700;font-size:20px;color:#64748B;margin-top:10px}}
#card .snd{{margin-top:24px;background:#7C3AED;color:#fff;font-weight:900;font-size:18px;padding:9px 20px;border-radius:24px}}
</style></head><body>
<div class="top"><img src="data:image/svg+xml;base64,{logo}"><div class="tag">DESIGN PACK PREVIEW</div></div>
<div id="stage"></div><div id="ui">{''.join(f'<div id="u-{u}">{u[3:]}</div>' for u in UI)}</div>
<div class="lab" id="lab"><div class="n" id="n"></div><b id="t"></b><span id="s"></span></div>
<div id="card" style="opacity:0"><img src="data:image/svg+xml;base64,{logo}"><b id="ct"></b><span id="cs"></span><div class="snd" id="cb">Sound on</div></div></body></html>'''
async def main():
    shutil.rmtree(FR, ignore_errors=True); os.makedirs(FR)
    hits = []  # (sound, time_s)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': SIZE, 'height': SIZE})
        await pg.set_content(HTML); await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(500)
        n = 0
        async def shot():
            nonlocal n; await pg.screenshot(path=f'{FR}/f{n:05d}.png'); n += 1
        async def card(title, sub, btn, dur, fi, fo):
            await pg.evaluate('([t,s,b])=>{ct.textContent=t;cs.textContent=s;cb.style.display=b?"block":"none"}', [title, sub, btn])
            nf = round(dur * FPS)
            for f in range(nf):
                a = 1
                if fi: a = min(a, (f + 1) / 8)
                if fo: a = min(a, (nf - f) / 8)
                await pg.evaluate('a=>{card.style.opacity=a}', a); await shot()
        await card('TinkerPod design pack', 'Logo · FX · Captain Jetty · empty states · UI sounds', True, 1.6, False, True)
        await pg.evaluate('()=>{card.style.opacity=0}')
        for i, s in enumerate(SEQ):
            svg = open(f'{PACK}/{s["path"]}').read()
            await pg.evaluate('''([svg,t,s,n,logo])=>{stage.innerHTML=svg;const v=stage.querySelector('svg');v.setAttribute("width",logo?560:500);v.setAttribute("height",logo?146:500);
              document.getElementById('t').textContent=t;document.getElementById('s').textContent=s;document.getElementById('n').textContent=n;document.getAnimations().forEach(a=>a.pause())}''',
                              [svg, s['title'], s['sub'], f'{i+1:02d} / {len(SEQ)+1:02d}', s['kind'] == 'logo'])
            await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(120)
            await pg.evaluate('document.getAnimations().forEach(a=>a.pause())')
            T = s['T'] * s['reps']; nl, np_, nt = round(LEAD * FPS), round(T * FPS), round(TAIL * FPS)
            t0 = n / FPS + LEAD
            for snd, at in s['sounds']:
                for r in range(s['reps']): hits.append((snd, t0 + r * s['T'] + at))
            for f in range(nl + np_ + nt):
                if f < nl: tms, a = 0, (f + 1) / nl
                elif f < nl + np_: tms, a = (f - nl) / FPS * 1000, 1
                else: tms, a = T * 1000 - 1, min(1, (nl + np_ + nt - f) / 6)
                await pg.evaluate('''([t,a])=>{document.getAnimations().forEach(x=>x.currentTime=t);stage.style.opacity=a;lab.style.opacity=Math.min(1,a*1.5)}''', [tms, a])
                await shot()
        await pg.evaluate('''([n,t])=>{stage.innerHTML="";ui.style.display="grid";document.getElementById('t').textContent='20 UI sounds';document.getElementById('s').textContent='−16 LUFS · wav / mp3 / ogg';document.getElementById('n').textContent=n;lab.style.opacity=1}''', [f'{len(SEQ)+1:02d} / {len(SEQ)+1:02d}', 0])
        for u in UI:
            hits.append((u, n / FPS + .1)); d = max(CUES[u]['T'] + .35, .8)
            await pg.evaluate('u=>{document.querySelectorAll("#ui div").forEach(x=>x.className="");document.getElementById("u-"+u).className="on"}', u)
            for f in range(round(d * FPS)): await shot()
        await pg.evaluate('()=>{ui.style.display="none";lab.style.opacity=0}')
        await card('Made by the TinkerPod team', 'SVG · react-native-svg / Reanimated · expo-audio', False, 1.4, True, False)
        await b.close()
    mix = np.zeros(int(round(n / FPS * SR)) + SR)
    for name, at in hits:
        y, sr = sf.read(f'{PACK}/fx/audio/{name}.wav'); assert sr == SR
        if y.ndim > 1: y = y.mean(1)
        i = int(round(at * SR)); mix[i:i + len(y)] += y[:len(mix) - i]
    pk = np.abs(mix).max(); mix = mix / pk * .89 if pk > .89 else mix
    sf.write('/tmp/pack_mix.wav', mix[:int(round(n / FPS * SR))], SR, subtype='PCM_24')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{FR}/f%05d.png', '-i', '/tmp/pack_mix.wav', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
                    '-crf', '24', '-preset', 'slow', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-shortest', OUT], check=True)
    print(OUT, n, 'frames', os.path.getsize(OUT))
asyncio.run(main())
