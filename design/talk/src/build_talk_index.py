"""talk/index.html — plays each Captain Jetty line with its audio; the audio clock drives the SVG (same idea as the app)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); TALK = os.path.dirname(HERE)
LINES = ['talk-01-welcome', 'talk-02-streak', 'talk-03-help']
data = {}
for k in LINES:
    for v, suf in [('abeo', ''), ('ezinne', '-ezinne')]:
        c = json.load(open(f'{TALK}/cues/{k}{suf}.mouth.json'))
        data[f'{k}|{v}'] = dict(svg=open(f'{TALK}/svg/{k}{suf}.svg').read(), mp3=f'audio/{k}{suf}.mp3', ogg=f'audio/{k}{suf}.ogg', text=c['text'],
                               words=c['words'], mouth=c['mouth'], gesture=c['gesture'], T=c['timeline_duration'])
html = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Captain Jetty talking · TinkerPod</title>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap" rel="stylesheet"><style>
*{box-sizing:border-box}body{margin:0;background:#F8FAFC;font-family:Nunito,system-ui,sans-serif;color:#0F172A}
header{padding:28px 24px 6px;text-align:center}h1{margin:0;font-weight:900;font-size:30px}header p{margin:6px 0 0;color:#64748B;font-weight:700}
main{max-width:980px;margin:0 auto;padding:16px;display:grid;grid-template-columns:420px 1fr;gap:24px;align-items:start}
@media(max-width:860px){main{grid-template-columns:1fr}}
#stage{background:#fff;border:2px solid #E2E8F0;border-radius:24px;aspect-ratio:1;display:flex;align-items:center;justify-content:center}#stage svg{width:100%;height:100%}
.panel{background:#fff;border:2px solid #E2E8F0;border-radius:24px;padding:20px}
h2{margin:0 0 10px;font-size:15px;letter-spacing:.06em;color:#64748B;font-weight:900}
.lines button,.voices button{display:block;width:100%;text-align:left;font:inherit;font-weight:800;font-size:17px;padding:12px 14px;margin:0 0 8px;border-radius:16px;border:2px solid #E2E8F0;background:#fff;color:#0F172A;cursor:pointer}
.lines button small{display:block;font-weight:700;color:#64748B;font-size:13px}
.lines button.on,.voices button.on{border-color:#007A70;background:#E6FBF8}
.voices{display:flex;gap:8px}.voices button{text-align:center}
#play{margin-top:8px;width:100%;font:inherit;font-weight:900;font-size:20px;color:#fff;background:#007A70;border:0;border-radius:18px;padding:14px;cursor:pointer}
#play:focus-visible,button:focus-visible{outline:3px solid #7C3AED;outline-offset:2px}
#cap{margin-top:16px;font-weight:900;font-size:24px;line-height:1.3;color:#CBD5E1;min-height:64px}#cap .said{color:#0F172A}#cap .now{color:#007A70}
#meta{margin-top:6px;font-weight:700;color:#64748B;font-size:14px}#shape{display:inline-block;background:#EDE9FE;color:#7C3AED;border-radius:10px;padding:1px 8px;font-weight:900}
</style></head><body>
<header><h1>Captain Jetty talking</h1><p>Real voice · lip-sync from the mouth-cue JSON · the audio clock drives the animation</p></header>
<main><div id="stage" role="img" aria-label="Captain Jetty"></div>
<div class="panel"><h2>LINE</h2><div class="lines" id="lines"></div>
<h2 style="margin-top:14px">VOICE</h2><div class="voices"><button data-v="abeo" class="on">Abeo (main)</button><button data-v="ezinne">Ezinne (alt)</button></div>
<button id="play">▶ Play with sound</button>
<div id="cap" aria-live="polite"></div><div id="meta">mouth: <span id="shape">rest</span> · <span id="clock">0.00 s</span></div></div></main>
<audio id="au" preload="auto"></audio>
<script>
const D=__DATA__;const LINES=__LINES__;const au=document.getElementById('au');let line=LINES[0],voice='abeo',raf=0;
function cur(){return D[line+'|'+voice]}
function anims(){return document.getElementById('stage').getAnimations({subtree:true})}
function load(){const c=cur();const st=document.getElementById('stage');st.innerHTML=c.svg;st.setAttribute('aria-label','Captain Jetty says: '+c.text);
  au.innerHTML=`<source src="${c.mp3}" type="audio/mpeg"><source src="${c.ogg}" type="audio/ogg">`;au.load();
  document.getElementById('cap').innerHTML=c.text.split(' ').map((w,i)=>`<span id="w${i}">${w}</span>`).join(' ');
  requestAnimationFrame(()=>{anims().forEach(a=>{a.pause();a.currentTime=0});paint(0)})}
function shapeAt(c,t){let s='rest';for(const m of c.mouth){if(m.t<=t)s=m.shape;else break}return s}
function paint(t){const c=cur();anims().forEach(a=>a.currentTime=Math.min(t,c.T-.001)*1000);
  let k=-1;c.words.forEach((w,i)=>{if(w.start<=t)k=i});
  c.words.forEach((w,i)=>{const e=document.getElementById('w'+i);e.className=(i===k&&t<w.end+.12)?'now':(w.start<=t?'said':'')});
  document.getElementById('shape').textContent=shapeAt(c,t);document.getElementById('clock').textContent=t.toFixed(2)+' s'}
function tick(){const c=cur();const t=au.ended?Math.max(au.currentTime,0)+(performance.now()-endAt)/1000:au.currentTime;paint(t);
  if(t<c.T)raf=requestAnimationFrame(tick);else{raf=0;document.getElementById('play').textContent='▶ Play again'}}
let endAt=0;au.addEventListener('ended',()=>{endAt=performance.now()});   // gesture keeps going after the voice ends
document.getElementById('play').onclick=()=>{cancelAnimationFrame(raf);au.currentTime=0;paint(0);au.play().then(()=>{document.getElementById('play').textContent='▶ Playing…';raf=requestAnimationFrame(tick)})};
const L=document.getElementById('lines');const N={'talk-01-welcome':'smile (happy hop)','talk-02-streak':'smile + fist pump','talk-03-help':'friendly wave + head tilt'};
LINES.forEach((k,i)=>{const b=document.createElement('button');b.innerHTML=`${D[k+'|abeo'].text}<small>${i+1} · ends with ${N[k]}</small>`;if(!i)b.className='on';
  b.onclick=()=>{line=k;L.querySelectorAll('button').forEach(x=>x.className='');b.className='on';cancelAnimationFrame(raf);au.pause();load();document.getElementById('play').textContent='▶ Play with sound'};L.appendChild(b)});
document.querySelectorAll('.voices button').forEach(b=>b.onclick=()=>{voice=b.dataset.v;document.querySelectorAll('.voices button').forEach(x=>x.className='');b.className='on';cancelAnimationFrame(raf);au.pause();load();document.getElementById('play').textContent='▶ Play with sound'});
load();
</script></body></html>'''
html = html.replace('__DATA__', json.dumps(data).replace('</', '<\\/')).replace('__LINES__', json.dumps(LINES))
open(f'{TALK}/index.html', 'w').write(html); print('index.html', len(html))
