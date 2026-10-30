"""Deterministic preview renderer: inline each FX SVG, pause Web Animations, scrub currentTime per frame,
then mux the synthesized audio placed at the exact same offsets. Writes combined + per-FX MP4s."""
import asyncio, json, os, base64, shutil, subprocess, numpy as np, soundfile as sf
from playwright.async_api import async_playwright
FPS = 30; SIZE = 1080; SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..'))
VID = f'{ROOT}/video'; FR = '/tmp/fxframes'
CUES = json.load(open(f'{HERE}/cues.json'))
LEAD, TAIL, INTRO, OUTRO = 0.4, 0.5, 1.6, 1.4
SEQ = [('fx01-xp-coins', 'XP + coin burst', 'Lesson reward · coins fly into the counter'),
       ('fx02-level-up', 'Level up', 'Badge drops · shine sweep · Pip cheers'),
       ('fx03-correct-wrong', 'Correct / Not quite', 'Answer feedback · two short clips'),
       ('fx04-pack-unlock', 'Pack unlock', 'Download ring fills · the box opens'),
       ('fx05-streak-mission', 'Streak + daily mission', 'Flame ignites · 11 → 12 · mission ticked')]
logo = base64.b64encode(open(f'{ROOT}/../assets/logo.png', 'rb').read()).decode()
dots = ''.join(f'<i></i>' for _ in SEQ)
HTML = f'''<html><head><link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=block" rel="stylesheet"><style>
body{{margin:0;width:{SIZE}px;height:{SIZE}px;background:#F8FAFC;font-family:Nunito;overflow:hidden;position:relative}}
.top{{position:absolute;top:44px;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:0 56px}}
.top img{{height:54px}} .tag{{font-weight:800;color:#64748B;font-size:24px;letter-spacing:.04em}}
#stage{{position:absolute;left:195px;top:118px;width:690px;height:690px}} #stage svg{{width:690px;height:690px}}
.lab{{position:absolute;bottom:92px;left:0;right:0;text-align:center}}
.lab .n{{display:inline-block;background:#E6FBF8;color:#007A70;font-weight:900;font-size:22px;border-radius:20px;padding:4px 16px;margin-bottom:10px;letter-spacing:.06em}}
.lab b{{display:block;font-weight:900;font-size:56px;color:#0F172A;line-height:1.05}}
.lab span{{display:block;font-weight:700;font-size:27px;color:#475569;margin-top:8px}}
.dots{{position:absolute;bottom:46px;left:0;right:0;display:flex;justify-content:center;gap:12px}}
.dots i{{width:12px;height:12px;border-radius:6px;background:#CBD5E1;display:block}} .dots i.on{{width:36px;background:#00BFAE}}
#card{{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#F8FAFC}}
#card img{{height:110px;margin-bottom:34px}} #card b{{font-weight:900;font-size:64px;color:#0F172A}} #card span{{font-weight:700;font-size:30px;color:#475569;margin-top:14px}}
#card .snd{{margin-top:34px;background:#7C3AED;color:#fff;font-weight:900;font-size:26px;padding:12px 26px;border-radius:30px}}
</style></head><body>
<div class="top"><img src="data:image/png;base64,{logo}"><div class="tag">MOTION + SOUND SAMPLES</div></div>
<div id="stage"></div><div class="lab" id="lab"><div class="n" id="n"></div><b id="t"></b><span id="s"></span></div><div class="dots">{dots}</div>
<div id="card" style="opacity:0"><img src="data:image/png;base64,{logo}"><b id="ct"></b><span id="cs"></span><div class="snd" id="cb">Sound on</div></div></body></html>'''
async def main():
    shutil.rmtree(FR, ignore_errors=True); os.makedirs(FR); os.makedirs(VID, exist_ok=True)
    sections = []  # (name, first_frame, n_frames, audio_offset_in_section_s)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': SIZE, 'height': SIZE})
        await pg.set_content(HTML); await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(400)
        n = 0
        async def shot(): 
            nonlocal n; await pg.screenshot(path=f'{FR}/f{n:05d}.png'); n += 1
        async def card(title, sub, btn, dur, fade_in, fade_out):
            await pg.evaluate('([t,s,b])=>{ct.textContent=t;cs.textContent=s;cb.style.display=b?"block":"none"}', [title, sub, btn])
            nf = round(dur * FPS)
            for f in range(nf):
                a = 1
                if fade_in: a = min(a, (f + 1) / 8)
                if fade_out: a = min(a, (nf - f) / 8)
                await pg.evaluate('a=>{card.style.opacity=a}', a); await shot()
        await card('Sound + motion samples', '5 moments for the TinkerPod app', True, INTRO, False, True)
        await pg.evaluate('()=>{card.style.opacity=0}')
        for idx, (name, title, sub) in enumerate(SEQ):
            T = CUES[name]['T']; svg = open(f'{ROOT}/svg/{name}.svg').read()
            await pg.evaluate('''([svg,t,s,i])=>{stage.innerHTML=svg;const v=stage.querySelector('svg');v.setAttribute("width",690);v.setAttribute("height",690);
              document.getElementById('t').textContent=t;document.getElementById('s').textContent=s;document.getElementById('n').textContent='0'+(i+1)+' / 05';
              document.querySelectorAll('.dots i').forEach((d,k)=>d.className=k==i?'on':'');document.getAnimations().forEach(a=>a.pause())}''', [svg, title, sub, idx])
            await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(150)
            await pg.evaluate('document.getAnimations().forEach(a=>a.pause())')
            first = n; nl, np_, nt = round(LEAD * FPS), round(T * FPS), round(TAIL * FPS)
            for f in range(nl + np_ + nt):
                if f < nl: tms, a = 0, (f + 1) / nl
                elif f < nl + np_: tms, a = (f - nl) / FPS * 1000, 1
                else: tms, a = T * 1000 - 1, min(1, (nl + np_ + nt - f) / 8)
                await pg.evaluate('''([t,a])=>{document.getAnimations().forEach(x=>x.currentTime=t);
                  stage.style.opacity=a;stage.style.transform=`translateY(${(1-a)*20}px)`;lab.style.opacity=Math.min(1,a*1.5)}''', [tms, a])
                await shot()
            sections.append((name, first, n - first))
        await pg.evaluate('()=>{stage.innerHTML="";lab.style.opacity=0}')
        await card('Ready for build', 'SVG + CSS keyframes · original SFX at −16 LUFS', False, OUTRO, True, False)
        await b.close()
    encode(sections, n)
def encode(sections, total):
    print('frames', total, total / FPS, 's')
    # ── audio: place each master at section start + LEAD ──
    mix = np.zeros(int(round(total / FPS * SR)))
    def place(buf, start_s, name):
        y, sr = sf.read(f'{ROOT}/audio/{name}.wav'); assert sr == SR
        i = int(round(start_s * SR)); buf[i:i + len(y)] += y[:len(buf) - i]
    for name, first, nf in sections: place(mix, first / FPS + LEAD, name)
    sf.write('/tmp/fx_mix.wav', mix, SR, subtype='PCM_24')
    enc = ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart']
    out = f'{VID}/tinkerpod-fx-preview.mp4'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{FR}/f%05d.png', '-i', '/tmp/fx_mix.wav'] + enc + [out], check=True)
    print(out)
    for name, first, nf in sections:
        a = np.zeros(int(round(nf / FPS * SR))); place(a, LEAD, name); sf.write(f'/tmp/{name}_a.wav', a, SR, subtype='PCM_24')
        o = f'{VID}/{name}.mp4'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-start_number', str(first), '-i', f'{FR}/f%05d.png', '-i', f'/tmp/{name}_a.wav', '-frames:v', str(nf)] + enc + [o], check=True)
        print(o)
    json.dump(dict(fps=FPS, lead=LEAD, sections=[dict(name=s[0], start_s=s[1] / FPS, frames=s[2], audio_at_s=s[1] / FPS + LEAD) for s in sections]), open(f'{VID}/timeline.json', 'w'), indent=1)
import sys
if '--encode-only' in sys.argv:   # frames already in /tmp/fxframes
    secs, f = [], round(INTRO * FPS)
    for name, _, _ in SEQ:
        nf = round(LEAD * FPS) + round(CUES[name]['T'] * FPS) + round(TAIL * FPS); secs.append((name, f, nf)); f += nf
    encode(secs, len(os.listdir(FR)))
else: asyncio.run(main())
