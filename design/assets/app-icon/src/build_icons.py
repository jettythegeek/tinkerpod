"""Build Expo app-icon / splash / favicon / notification assets from the traced TinkerPod mark.
Writes source SVGs to ./ and PNGs to ../ . Rendering uses headless Chrome (tools/render.py)."""
import asyncio, re, sys, io, pathlib
HERE = pathlib.Path(__file__).resolve().parent
PACK = HERE.parents[2]
sys.path.insert(0, str(PACK / 'tools'))
from render import render
from PIL import Image

LOGO = PACK / 'assets' / 'logo'
def inner(name):
    s = (LOGO / name).read_text()
    s = re.sub(r'^.*?<svg[^>]*>', '', s, flags=re.S)
    s = re.sub(r'<title>.*?</title>', '', s, flags=re.S)
    return s.replace('</svg>', '').strip()

MW, MH = 482, 398
def place(content, box, cx=512, cy=512, dy=0):
    """scale the mark so its width is `box` px, centred on (cx, cy+dy)"""
    k = box / MW
    return f'<g transform="translate({cx - MW*k/2:.1f} {cy - MH*k/2 + dy:.1f}) scale({k:.4f})">{content}</g>'

def doc(body, defs='', label='TinkerPod'):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" role="img" aria-label="{label}">'
            f'<title>{label}</title>{defs}{body}</svg>\n')

BG_DEFS = ('<defs><radialGradient id="bg" cx="50%" cy="38%" r="75%">'
           '<stop offset="0" stop-color="#FFFFFF"/><stop offset=".62" stop-color="#F0FBFA"/><stop offset="1" stop-color="#D5F5F1"/>'
           '</radialGradient></defs>')
BG = '<rect width="1024" height="1024" fill="url(#bg)"/>'
# tiny brand confetti dots on the background (kept outside the adaptive-icon safe zone so they survive any mask)
DOTS = ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}" opacity=".9"/>' for x, y, r, c in
               [(150, 170, 14, '#FFB700'), (880, 210, 11, '#FF6B6B'), (120, 820, 10, '#7C3AED'), (900, 850, 13, '#63C132')])

mark, mono = inner('tinkerpod-mark.svg'), inner('tinkerpod-mark-white.svg')

# Notification icon: Android needs a flat white silhouette that still reads at 24 dp, so the detailed mark is
# simplified to the pod head: shell with screen cut-out, two eyes, ear pads, antenna. Drawn on a 96 grid.
NOTIF = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96" role="img" aria-label="TinkerPod">
<title>TinkerPod</title>
<g fill="#FFFFFF" fill-rule="evenodd">
<circle cx="48" cy="13" r="7"/><rect x="45" y="16" width="6" height="14" rx="3"/>
<path d="M48 27c22 0 36 9 36 29 0 19-14 29-36 29S12 75 12 56c0-20 14-29 36-29Z M30 44h36c6 0 9 4 9 10s-3 10-9 10H30c-6 0-9-4-9-10s3-10 9-10Z"/>
<rect x="4" y="47" width="6" height="18" rx="3"/><rect x="86" y="47" width="6" height="18" rx="3"/>
<path d="M33 54a4.5 4.5 0 1 1 9 0a4.5 4.5 0 1 1-9 0Z M54 54a4.5 4.5 0 1 1 9 0a4.5 4.5 0 1 1-9 0Z"/>
</g></svg>
'''
SVGS = {
    'icon.svg': doc(BG + DOTS + place(mark, 800, dy=10), BG_DEFS),
    'adaptive-icon-foreground.svg': doc(place(mark, 640, dy=8)),          # 66% safe circle = 676 px; mark fits inside
    'adaptive-icon-background.svg': doc(BG, BG_DEFS),
    'adaptive-icon-monochrome.svg': doc(place(mono, 640, dy=8)),
    'splash-icon.svg': doc(place(mark, 1000)),
    'favicon.svg': doc(BG.replace('<rect', '<rect rx="224"') + place(mark, 900, dy=8), BG_DEFS),
    'notification-icon.svg': NOTIF,
}
for n, s in SVGS.items(): (HERE / n).write_text(s)

OUT = HERE.parent
jobs = [dict(svg=str(HERE / 'icon.svg'), out=str(OUT / 'icon.png'), w=1024, h=1024, bg='#ffffff'),
        dict(svg=str(HERE / 'adaptive-icon-foreground.svg'), out=str(OUT / 'adaptive-icon-foreground.png'), w=1024, h=1024),
        dict(svg=str(HERE / 'adaptive-icon-background.svg'), out=str(OUT / 'adaptive-icon-background.png'), w=1024, h=1024, bg='#ffffff'),
        dict(svg=str(HERE / 'adaptive-icon-monochrome.svg'), out=str(OUT / 'adaptive-icon-monochrome.png'), w=1024, h=1024),
        dict(svg=str(HERE / 'splash-icon.svg'), out=str(OUT / 'splash-icon.png'), w=1024, h=1024),
        dict(svg=str(HERE / 'favicon.svg'), out=str(HERE / '_fav256.png'), w=256, h=256),
        dict(svg=str(HERE / 'notification-icon.svg'), out=str(OUT / 'notification-icon.png'), w=96, h=96)]
asyncio.run(render(jobs))
# icon.png must be opaque (App Store rejects alpha)
Image.open(OUT / 'icon.png').convert('RGB').save(OUT / 'icon.png', optimize=True)
Image.open(OUT / 'adaptive-icon-background.png').convert('RGB').save(OUT / 'adaptive-icon-background.png', optimize=True)
fav = Image.open(HERE / '_fav256.png').convert('RGBA')
fav.resize((48, 48), Image.LANCZOS).save(OUT / 'favicon.png', optimize=True)
fav.save(OUT / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
(HERE / '_fav256.png').unlink()
print('ok')
