"""Preview MP4 of Captain Jetty talking (same method as tools/record_preview.py): inline each talk SVG, pause its
Web Animations, scrub currentTime per frame, and lay the line's own wav at the exact frame where t=0 is shown.
-> talk/preview/captain-jetty-talk-preview.mp4"""
import asyncio, json, os, base64, shutil, subprocess, numpy as np, soundfile as sf
from playwright.async_api import async_playwright
FPS, SIZE, SR = 30, 720, 48000
HERE = os.path.dirname(os.path.abspath(__file__)); TALK = os.path.dirname(HERE); PACK = os.path.dirname(TALK)
FR = '/tmp/talkframes'; OUT = f'{TALK}/preview/captain-jetty-talk-preview.mp4'
LEAD, TAIL = .45, .35
LINES = ['talk-01-welcome', 'talk-02-streak', 'talk-03-help']
SEQ = [(k, 'Abeo (main)') for k in LINES] + [(k + '-ezinne', 'Ezinne (alternative)') for k in LINES]
logo = base64.b64encode(open(f'{PACK}/assets/logo/tinkerpod-logo.svg', 'rb').read()).decode()
HTML = f'''<html><head><link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=block" rel="stylesheet"><style>
body{{margin:0;width:{SIZE}px;height:{SIZE}px;background:#F8FAFC;font-family:Nunito;overflow:hidden;position:relative}}
.top{{position:absolute;top:26px;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:0 36px}}
.top img{{height:36px}} .tag{{font-weight:800;color:#64748B;font-size:16px;letter-spacing:.04em}}
#stage{{position:absolute;left:150px;top:74px;width:420px;height:420px}} #stage svg{{width:420px;height:420px}}
.lab{{position:absolute;top:500px;left:40px;right:40px;text-align:center}}
.lab .n{{display:inline-block;background:#E6FBF8;color:#007A70;font-weight:900;font-size:15px;border-radius:14px;padding:3px 12px;letter-spacing:.06em}}
.lab .vo{{display:inline-block;background:#EDE9FE;color:#7C3AED;font-weight:900;font-size:15px;border-radius:14px;padding:3px 12px;margin-left:8px}}
#cap{{margin-top:14px;font-weight:900;font-size:33px;line-height:1.2;color:#CBD5E1}} #cap i{{font-style:normal;transition:none}} #cap i.said{{color:#0F172A}} #cap i.now{{color:#007A70}}
#g{{margin-top:10px;font-weight:800;font-size:18px;color:#64748B;height:24px}}
#card{{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#F8FAFC}}
#card img{{height:80px;margin-bottom:24px}} #card b{{font-weight:900;font-size:42px;color:#0F172A;text-align:center}} #card span{{font-weight:700;font-size:20px;color:#64748B;margin-top:10px;text-align:center}}
#card .snd{{margin-top:24px;background:#7C3AED;color:#fff;font-weight:900;font-size:18px;padding:9px 20px;border-radius:24px}}
</style></head><body>
<div class="top"><img src="data:image/svg+xml;base64,{logo}"><div class="tag">CAPTAIN JETTY · TALKING</div></div>
<div id="stage"></div><div class="lab" id="lab"><span class="n" id="n"></span><span class="vo" id="vo"></span><div id="cap"></div><div id="g"></div></div>
<div id="card" style="opacity:0"><img src="data:image/svg+xml;base64,{logo}"><b id="ct"></b><span id="cs"></span><div class="snd" id="cb">Sound on</div></div></body></html>'''
async def main():
    shutil.rmtree(FR, ignore_errors=True); os.makedirs(FR)
    hits = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': SIZE, 'height': SIZE})
        await pg.set_content(HTML); await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(500)
        n = 0
        async def shot():
            nonlocal n; await pg.screenshot(path=f'{FR}/f{n:05d}.png'); n += 1
        async def card(title, sub, btn, dur, fi, fo):
            await pg.evaluate('([t,s,b])=>{ct.innerHTML=t;cs.innerHTML=s;cb.style.display=b?"block":"none"}', [title, sub, btn])
            nf = round(dur * FPS)
            for f in range(nf):
                a = 1
                if fi: a = min(a, (f + 1) / 8)
                if fo: a = min(a, (nf - f) / 8)
                await pg.evaluate('a=>{card.style.opacity=a}', a); await shot()
        await card('Captain Jetty talks', 'Real voice · lip-sync from mouth-cue JSON · end gestures', True, 1.6, False, True)
        await pg.evaluate('()=>{card.style.opacity=0}')
        for i, (key, vo) in enumerate(SEQ):
            if i == 3:
                await card('Alternative voice', 'Same three lines · en-NG-EzinneNeural', False, 1.3, True, True)
                await pg.evaluate('()=>{card.style.opacity=0}')
            c = json.load(open(f'{TALK}/cues/{key}.mouth.json'))
            svg = open(f'{TALK}/svg/{key}.svg').read()
            toks = c['text'].split(); assert len(toks) == len(c['words']), key
            await pg.evaluate('''([svg,toks,n,vo])=>{stage.innerHTML=svg;const v=stage.querySelector('svg');v.setAttribute("width",420);v.setAttribute("height",420);
              cap.innerHTML=toks.map((t,i)=>`<i id="w${i}">${t}</i>`).join(' ');document.getElementById('n').textContent=n;document.getElementById('vo').textContent=vo;g.textContent='';
              document.getAnimations().forEach(a=>a.pause())}''', [svg, toks, f'LINE {i % 3 + 1} / 3', vo])
            await pg.wait_for_timeout(120); await pg.evaluate('document.getAnimations().forEach(a=>a.pause())')
            T = c['timeline_duration']; nl, np_, nt = round(LEAD * FPS), round(T * FPS), round(TAIL * FPS)
            hits.append((f'{TALK}/audio/{key}.wav', n / FPS + LEAD))
            ws = [w['start'] for w in c['words']]; we = [w['end'] for w in c['words']]; g = c['gesture']
            for f in range(nl + np_ + nt):
                if f < nl: t, a = 0, (f + 1) / nl
                elif f < nl + np_: t, a = (f - nl) / FPS, 1
                else: t, a = T - .001, min(1, (nl + np_ + nt - f) / 6)
                cur = max([j for j, s in enumerate(ws) if s <= t] or [-1]); cur = cur if cur >= 0 and t < we[cur] + .12 else -1
                cls = ['now' if j == cur else 'said' if t >= s else '' for j, s in enumerate(ws)]
                gl = ('→ ' + g['label']) if t >= g['start'] else ''
                await pg.evaluate('''([t,a,cls,gl])=>{document.getAnimations().forEach(x=>x.currentTime=t*1000);stage.style.opacity=a;lab.style.opacity=Math.min(1,a*1.5);
                  cls.forEach((c,i)=>document.getElementById('w'+i).className=c);g.textContent=gl}''', [t * 1000 / 1000, a, cls, gl])
                await shot()
        await pg.evaluate('()=>{lab.style.opacity=0;stage.innerHTML=""}')
        await card('Made by the TinkerPod team', 'SVG + Reanimated · expo-audio · cue JSON', False, 1.4, True, False)
        await b.close()
    L = int(round(n / FPS * SR)); mix = np.zeros(L + SR)
    for path, at in hits:
        y, sr = sf.read(path); assert sr == SR, (path, sr)
        if y.ndim > 1: y = y.mean(1)
        i = int(round(at * SR)); mix[i:i + len(y)] += y[:len(mix) - i]
    sf.write('/tmp/talk_mix.wav', np.clip(mix[:L], -1, 1), SR, subtype='PCM_24')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{FR}/f%05d.png', '-i', '/tmp/talk_mix.wav', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
                    '-crf', '22', '-preset', 'slow', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-shortest', OUT], check=True)
    json.dump([dict(audio=os.path.basename(p), at=round(a, 4)) for p, a in hits], open('/tmp/talk_hits.json', 'w'))
    print(OUT, n, 'frames', os.path.getsize(OUT))
asyncio.run(main())
