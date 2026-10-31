"""preview/index.html: every visual (animated via <object> so each SVG keeps its own CSS) + every sound."""
import os, json, glob, html
HERE = os.path.dirname(os.path.abspath(__file__)); PACK = os.path.dirname(HERE)
C = json.load(open(f'{PACK}/fx/src/cues.json'))
rel = lambda p: '../' + os.path.relpath(p, PACK)
def obj(p, w=220, h=220, bg='#fff', cap=None, sub=''):
    cap = cap or os.path.basename(p)
    tag = f'<object type="image/svg+xml" data="{rel(p)}" width="{w}" height="{h}"></object>' if p.endswith('.svg') else f'<img src="{rel(p)}" width="{w}" height="{h}" style="object-fit:contain">'
    dk = ' class="dk"' if bg == '#101B4D' else ''
    return f'<figure{dk} style="background:{bg}"><div class="box">{tag}</div><figcaption><b>{html.escape(cap)}</b>{f"<i>{html.escape(sub)}</i>" if sub else ""}</figcaption></figure>'
S = []
def sec(id, title, note, items): S.append(f'<section id="{id}"><h2>{title}</h2><p>{note}</p><div class="grid">{"".join(items)}</div></section>')
L = f'{PACK}/assets/logo'
sec('logo', 'Logo', 'Vector mark, wordmark and lockup in full colour, white (reversed) and ink. The intro plays once (1.5 s): press ↻ to replay.',
    [obj(f'{L}/tinkerpod-logo-intro.svg', 440, 116, cap='tinkerpod-logo-intro.svg', sub='animated · 1.5 s')] +
    [obj(f'{L}/tinkerpod-{k}{v}.svg', 300 if k != 'mark' else 160, 80 if k != 'mark' else 132, '#101B4D' if v == '-white' else '#fff') for k in ('logo', 'wordmark', 'mark') for v in ('', '-white', '-ink')])
A = f'{PACK}/assets/app-icon'
sec('icons', 'App icons (Expo)', 'icon.png 1024 · adaptive foreground/background/monochrome 1024 · splash-icon · favicon · notification icon (white silhouette, 96 px, shown on navy).',
    [obj(f'{A}/{n}', 150, 150, '#101B4D' if 'notification' in n or 'monochrome' in n else '#fff') for n in ('icon.png', 'adaptive-icon-foreground.png', 'adaptive-icon-background.png', 'adaptive-icon-monochrome.png', 'splash-icon.png', 'favicon.png', 'notification-icon.png')])
fx = sorted(glob.glob(f'{PACK}/fx/svg/fx*.svg'))
sec('fx', 'FX (animated SVG)', 'Each tile loops in this preview with ↻; in the app, one-shot FX play once. The sound button plays the paired sound.',
    [obj(p, 220, 220, cap=os.path.basename(p), sub=(f'{C[n]["T"]} s' + (' · loop' if C[n].get('loop') else '') + (f' · ♪ {C[n]["sound"]}' if C[n].get('sound') else ''))) for p in fx for n in [os.path.basename(p)[:-4]]])
sec('fx-static', 'FX baked statics (no CSS)', 'CSS-free frames for react-native-svg: fx/static/*-static.svg, plus a PNG of each.',
    [obj(p, 160, 160) for p in sorted(glob.glob(f'{PACK}/fx/static/*-static.svg'))])
moods = json.load(open(f'{PACK}/motion/moods.json'))
sec('moods', 'Captain Jetty moods', 'New: thinking · sleepy (wakes up to cheer you on) · surprised · celebrate. Also the 7 approved moods, re-titled Captain Jetty. Files keep the pip-* names.',
    [obj(f'{PACK}/motion/svg/pip-{m}.svg', 200, 200, cap=f'pip-{m}.svg', sub=f'{moods[m]["title"]} · {moods[m]["dur"]} s') for m in ('thinking', 'sleepy', 'surprised', 'celebrate')] +
    [obj(f'{PACK}/motion/svg/pip-{m}.svg', 150, 150, cap=f'pip-{m}.svg', sub=moods[m]['title']) for m in moods if m not in ('thinking', 'sleepy', 'surprised', 'celebrate')])
sec('mood-static', 'Captain Jetty statics', 'assets/pip: baked static SVG (tight viewBox) and transparent PNG.',
    [obj(p, 150, 150, '#F1F5F9') for p in sorted(glob.glob(f'{PACK}/assets/pip/*-static.svg'))] + [obj(p, 150, 150, '#F1F5F9') for p in sorted(glob.glob(f'{PACK}/assets/pip/*.png'))])
sec('empty', 'Empty states', 'Text-free, 600×480: the app shows the title, body and button so they can be translated. Static versions are in assets/empty/static.',
    [obj(p, 300, 240) for p in sorted(glob.glob(f'{PACK}/assets/empty/empty-*.svg'))])
ui = [k for k in C if k.startswith('ui-')]
rows = ''.join(f'<tr><td><button onclick="play(\'{k}\')">▶</button></td><td><b>{k}</b></td><td>{C[k]["T"]} s</td><td>{html.escape(C[k]["purpose"])}</td><td><code>{html.escape(C[k]["haptic"] or "none")}</code></td><td>{C[k]["volume"]}</td>'
               f'<td><a href="../fx/audio/{k}.wav">wav</a> · <a href="../fx/audio/{k}.mp3">mp3</a> · <a href="../fx/audio/{k}.ogg">ogg</a></td></tr>' for k in ui)
S.append(f'<section id="sounds"><h2>UI sounds (20)</h2><p>All mastered to −16 LUFS (true peak ≤ −1.5 dBTP), like the existing FX sounds. <button onclick="playAll()">▶ Play all</button> <button onclick="stopAll()">■ Stop</button></p>'
         f'<table><tr><th></th><th>Name</th><th>Length</th><th>Use</th><th>Haptic (expo-haptics)</th><th>Vol</th><th>Files</th></tr>{rows}</table></section>')
S.append('<section id="video"><h2>Preview video</h2><video controls width="540" src="tinkerpod-design-pack-preview.mp4"></video></section>')
H = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>TinkerPod design pack · preview</title>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;800;900&display=swap" rel="stylesheet"><style>
body{{margin:0;background:#F8FAFC;font-family:Nunito,system-ui,sans-serif;color:#0F172A}} header{{background:#101B4D;color:#fff;padding:20px 32px;display:flex;gap:20px;align-items:center;position:sticky;top:0;z-index:5}}
header img{{height:40px}} header nav a{{color:#fff;margin-right:14px;font-weight:800;text-decoration:none;font-size:14px}}
section{{padding:24px 32px}} h2{{font-weight:900;margin:0 0 4px}} p{{color:#64748B;font-weight:600;margin:0 0 14px}}
.grid{{display:flex;flex-wrap:wrap;gap:14px}} figure{{margin:0;border:1px solid #E2E8F0;border-radius:16px;padding:10px;position:relative}}
.box{{display:flex;align-items:center;justify-content:center}} figcaption{{font-size:12px;margin-top:6px;max-width:300px}} figcaption b{{display:block}} .dk figcaption,.dk figcaption i{{color:#E2E8F0}} figcaption i{{color:#64748B;font-style:normal}}
figure .re{{position:absolute;top:6px;right:6px;border:0;background:#E6FBF8;color:#007A70;border-radius:12px;font-weight:900;cursor:pointer}}
table{{border-collapse:collapse;background:#fff;font-size:13px}} td,th{{border-bottom:1px solid #E2E8F0;padding:6px 10px;text-align:left}}
button{{font-family:inherit;font-weight:900;background:#007A70;color:#fff;border:0;border-radius:14px;padding:5px 12px;cursor:pointer}} a{{color:#007A70}}
</style></head><body><header><img src="../assets/logo/tinkerpod-logo-white.svg" alt="TinkerPod"><nav>{"".join(f'<a href="#{i}">{t}</a>' for i, t in [("logo","Logo"),("icons","Icons"),("fx","FX"),("moods","Captain Jetty"),("empty","Empty states"),("sounds","Sounds"),("video","Video")])}</nav></header>
{"".join(S)}
<script>
const A={{}};function play(k){{(A[k]=A[k]||new Audio('../fx/audio/'+k+'.ogg')).currentTime=0;A[k].play()}}
let tm=[];function stopAll(){{tm.forEach(clearTimeout);tm=[];Object.values(A).forEach(a=>a.pause())}}
function playAll(){{stopAll();let t=0;const L={json.dumps({k: C[k]['T'] for k in ui})};for(const k in L){{tm.push(setTimeout(()=>play(k),t*1000));t+=Math.max(L[k]+.4,.9)}}}}
document.querySelectorAll('figure object').forEach(o=>{{const b=document.createElement('button');b.className='re';b.textContent='↻';b.title='Replay';b.onclick=()=>{{const d=o.data;o.data='';o.data=d}};o.closest('figure').appendChild(b)}});
document.querySelectorAll('figure object').forEach(o=>{{const f=o.closest('figure'),i=f.querySelector('i');const m=i&&i.textContent.match(/♪ (ui-[a-z-]+)/);if(m){{const b=document.createElement('button');b.textContent='♪';b.className='re';b.style.right='40px';b.onclick=()=>play(m[1]);f.appendChild(b)}}}});
</script></body></html>'''
os.makedirs(f'{PACK}/preview', exist_ok=True); open(f'{PACK}/preview/index.html', 'w').write(H); print('ok')
