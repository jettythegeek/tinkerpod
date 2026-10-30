"""Deterministic recorder: inline each mood SVG, pause Web Animations, scrub currentTime per frame."""
import asyncio, json, os, base64, shutil, subprocess
from playwright.async_api import async_playwright
FPS=30; SIZE=1080
ROOT=os.path.abspath('..'); FR='/tmp/pipframes'
SEQ=[('idle',2,'Idle','Home screen · always alive'),('wave',1,'Wave','Hello! · onboarding & greetings'),
     ('happy',1,'Happy','Correct answer'),('sad',1,'Sad','Wrong answer · streak broken'),
     ('laugh',2,'Laugh','Fun moments · jokes'),('clap',2,'Clap','Lesson complete'),('cheer',1,'Cheer','Level up · tournament win')]
meta=json.load(open(f'{ROOT}/moods.json'))
logo=base64.b64encode(open(f'{ROOT}/../assets/logo.png','rb').read()).decode()
dots=''.join(f'<i id="d{i}"></i>' for i in range(len(SEQ)))
HTML=f'''<html><head><style>
body{{margin:0;width:{SIZE}px;height:{SIZE}px;background:#F8FAFC;font-family:Nunito;overflow:hidden;position:relative}}
.top{{position:absolute;top:44px;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:0 56px}}
.top img{{height:54px}} .tag{{font-weight:800;color:#64748B;font-size:24px;letter-spacing:.04em}}
#stage{{position:absolute;left:150px;top:70px;width:780px;height:780px;transition:none}}
#stage svg{{width:780px;height:780px}}
.lab{{position:absolute;bottom:96px;left:0;right:0;text-align:center}}
.lab b{{display:inline-block;font-weight:900;font-size:64px;color:#0F172A;line-height:1}}
.lab span{{display:block;font-weight:700;font-size:28px;color:#475569;margin-top:10px}}
.dots{{position:absolute;bottom:48px;left:0;right:0;display:flex;justify-content:center;gap:12px}}
.dots i{{width:12px;height:12px;border-radius:6px;background:#CBD5E1;display:block}}
.dots i.on{{width:36px;background:#00BFAE}}
.floor{{position:absolute;left:0;right:0;top:0;height:100%;background:radial-gradient(ellipse 520px 300px at 50% 52%,#E6FBF8 0,#F8FAFC 70%)}}
</style></head><body><div class="floor"></div>
<div class="top"><img src="data:image/png;base64,{logo}"><div class="tag">MEET PIP · MOTION TEST</div></div>
<div id="stage"></div><div class="lab" id="lab"><b id="t"></b><span id="s"></span></div><div class="dots">{dots}</div></body></html>'''
async def main():
    shutil.rmtree(FR,ignore_errors=True); os.makedirs(FR)
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':SIZE,'height':SIZE})
        await pg.set_content(HTML); await pg.evaluate('document.fonts.ready')
        n=0
        for idx,(m,loops,title,sub) in enumerate(SEQ):
            svg=open(f'{ROOT}/svg/pip-{m}.svg').read()
            await pg.evaluate('''([svg,t,s,i])=>{document.getElementById('stage').innerHTML=svg;
              document.getElementById('t').textContent=t;document.getElementById('s').textContent=s;
              document.querySelectorAll('.dots i').forEach((d,k)=>d.className=k==i?'on':'');
              document.getAnimations().forEach(a=>a.pause())}''',[svg,title,sub,idx])
            seg=meta[m]['dur']*loops; nf=round(seg*FPS); fade=7
            for f in range(nf):
                tms=f/FPS*1000
                a=min(1,(f+1)/fade, (nf-f)/fade) if idx>0 or f>=nf-fade else min(1,(nf-f)/fade)
                if idx==0 and f<fade: a=1
                if idx==len(SEQ)-1 and f>=nf-fade: a=min(1,(nf-f)/fade)
                await pg.evaluate('''([t,a])=>{document.getAnimations().forEach(x=>x.currentTime=t);
                  const st=document.getElementById('stage');st.style.opacity=a;st.style.transform=`translateY(${(1-a)*24}px) scale(${.96+.04*a})`;
                  document.getElementById('lab').style.opacity=Math.min(1,a*1.4)}''',[tms,a])
                await pg.screenshot(path=f'{FR}/f{n:05d}.png'); n+=1
        await b.close()
    print('frames',n, n/FPS,'s')
    mp4=f'{ROOT}/pip-motion-test.mp4'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate',str(FPS),'-i',f'{FR}/f%05d.png','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','slow','-movflags','+faststart',mp4],check=True)
    gif=f'{ROOT}/pip-motion-test.gif'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate',str(FPS),'-i',f'{FR}/f%05d.png','-vf','fps=15,scale=540:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle',gif],check=True)
    for f in (mp4,gif): print(f, os.path.getsize(f)//1024,'KB')
asyncio.run(main())
