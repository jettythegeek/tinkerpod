"""fx/index.html: all 5 SVGs inline (prefixed, so no collisions) + synced sound playback."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
C = json.load(open(f'{HERE}/cues.json')); M = json.load(open(f'{ROOT}/audio/master-report.json'))
SEQ = [('fx01-xp-coins', 'XP + coin burst', 'Coins fly into the counter, it ticks 120 → 160, XP bar fills.', 'Rising pop, sparkle whoosh, 8 coin pings climbing a pentatonic scale, riser, bright ding.'),
       ('fx02-level-up', 'Level up / badge unlock', 'Badge drops and squashes, shine sweeps, sparkles, Pip cheers.', 'Down-whoosh, soft thump, glassy shimmer, twinkles, C-major brass fanfare.'),
       ('fx03-correct-wrong', 'Correct / Not quite', 'Clip A: green check pop + Pip happy. Clip B: red shake + Pip sad.', 'A: pop + two-note marimba (E6 → A6). B: gentle triangle "uh-oh" with a soft wobble.'),
       ('fx04-pack-unlock', 'Pack download → unlock', 'Progress ring fills in steps, box wiggles, lid pops, glow + prize.', 'Rising ticks over a quiet pad, done-ding, 3 wood knocks, pop + whoosh, harp sparkle run.'),
       ('fx05-streak-mission', 'Streak + daily mission', 'Flame ignites, 11 flips to 12, mission bar fills and ticks off.', 'Warm "fwoomp" ignite, soft crackle, flap clicks, 3-note chime, check pop, success chord, 2 coins.')]
cards = ''
for i, (n, t, d, s) in enumerate(SEQ):
    svg = open(f'{ROOT}/svg/{n}.svg').read().split('?>', 1)[-1]
    cards += f'''<section class="fx" data-name="{n}" data-t="{C[n]['T']}">
 <div class="art">{svg}</div>
 <div class="meta"><div class="num">0{i+1}</div><h2>{t}</h2><p>{d}</p><p class="snd"><b>Sound:</b> {s}</p>
  <div class="row"><button class="play">▶ Play</button><label><input type="checkbox" class="loop"> Loop</label>
  <span class="dur">{C[n]['T']} s · {M[n]['lufs']:.0f} LUFS</span></div>
  <div class="files">SVG <a href="svg/{n}.svg">svg</a> · Sound <a href="audio/{n}.wav">wav</a> <a href="audio/{n}.mp3">mp3</a> <a href="audio/{n}.ogg">ogg</a> · Video <a href="video/{n}.mp4">mp4</a></div>
  <audio preload="auto" src="audio/{n}.mp3"></audio></div></section>'''
html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>TinkerPod · Motion + sound samples</title>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap" rel="stylesheet">
<style>
*{{box-sizing:border-box}} body{{margin:0;background:#F8FAFC;font-family:Nunito,system-ui,sans-serif;color:#0F172A}}
header{{max-width:1120px;margin:0 auto;padding:36px 24px 8px;display:flex;align-items:center;gap:20px;flex-wrap:wrap}}
header img{{height:44px}} header h1{{font-size:28px;font-weight:900;margin:0;flex:1}}
header button,.play{{font:inherit;font-weight:900;border:0;border-radius:999px;padding:12px 22px;cursor:pointer;background:#007A70;color:#fff;font-size:16px}}
.note{{max-width:1120px;margin:0 auto;padding:0 24px 12px;color:#475569;font-weight:700}}
main{{max-width:1120px;margin:0 auto;padding:12px 24px 60px;display:grid;gap:22px}}
.fx{{background:#fff;border-radius:28px;box-shadow:0 2px 0 #E2E8F0,0 10px 30px rgba(15,23,42,.06);display:grid;grid-template-columns:minmax(260px,420px) 1fr;gap:28px;padding:22px;align-items:center}}
.art{{background:#F8FAFC;border-radius:22px;aspect-ratio:1}} .art svg{{width:100%;height:100%;display:block}}
.num{{display:inline-block;background:#E6FBF8;color:#007A70;font-weight:900;border-radius:999px;padding:3px 12px;letter-spacing:.06em}}
h2{{font-size:30px;font-weight:900;margin:10px 0 6px}} p{{margin:6px 0;color:#334155;font-weight:600;font-size:17px;line-height:1.45}}
.snd b{{color:#7C3AED}} .row{{display:flex;align-items:center;gap:16px;margin:16px 0 10px;flex-wrap:wrap}} .row label{{font-weight:800}}
.dur{{color:#64748B;font-weight:700}} .files{{font-weight:700;color:#64748B;font-size:15px}} .files a{{color:#2563EB}}
.fx.playing{{outline:3px solid #00BFAE}}
@media (max-width:760px){{.fx{{grid-template-columns:1fr}}}}
</style></head><body>
<header><img src="../assets/logo.png" alt="TinkerPod"><h1>Motion + sound samples</h1><button id="all">▶ Play all</button></header>
<div class="note">Hand-made SVG + CSS keyframes (no filters). All sounds synthesized from scratch, mastered to −16 LUFS, peaks under −1 dBTP. Turn sound on. With “reduce motion” on, each asset shows its final frame.
 Combined preview: <a href="video/tinkerpod-fx-preview.mp4">video/tinkerpod-fx-preview.mp4</a></div>
<main>{cards}</main>
<script>
const fx=[...document.querySelectorAll('.fx')];
const anims=s=>s.querySelector('svg').getAnimations({{subtree:true}});
function seek(s,ms){{anims(s).forEach(a=>{{a.pause();a.currentTime=ms}})}}
fx.forEach(s=>seek(s,s.dataset.t*1000-1));           // rest on the final frame
function play(s){{return new Promise(res=>{{
  // Picture is slaved to the audio clock every frame, so sound and motion can never drift apart.
  const T=s.dataset.t*1000, au=s.querySelector('audio'), loop=s.querySelector('.loop');
  cancelAnimationFrame(s._r); s.classList.add('playing');
  const tick=()=>{{const ms=au.currentTime*1000; seek(s,Math.min(ms,T-1));
    if(ms>=T-1||au.ended){{ if(loop.checked){{au.currentTime=0;au.play();}} else {{au.pause();seek(s,T-1);s.classList.remove('playing');return res();}} }}
    s._r=requestAnimationFrame(tick);}};
  au.currentTime=0; au.play().catch(()=>{{}}); tick();}})}}
fx.forEach(s=>s.querySelector('.play').onclick=()=>play(s));
document.getElementById('all').onclick=async()=>{{for(const s of fx){{s.scrollIntoView({{behavior:'smooth',block:'center'}});await new Promise(r=>setTimeout(r,500));await play(s);}}}};
</script></body></html>'''
open(f'{ROOT}/index.html', 'w').write(html); print('ok', len(html) // 1024, 'KB')
