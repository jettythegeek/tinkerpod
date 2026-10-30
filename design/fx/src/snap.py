"""Contact sheet: each FX at chosen times (seconds) → /tmp/fxsheet_<name>.png"""
import asyncio, sys, json, os, subprocess
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
async def main(name, times, rm=False):
    svg = open(f'{ROOT}/svg/{name}.svg').read()
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 400, 'height': 400}, reduced_motion='reduce' if rm else 'no-preference')
        await pg.set_content(f'<html><body style="margin:0;background:#F8FAFC">{svg}</body></html>')
        await pg.evaluate("()=>{const s=document.querySelector('svg');s.setAttribute('width',400);s.setAttribute('height',400)}")
        await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(300)
        await pg.evaluate('document.getAnimations().forEach(a=>a.pause())')
        fs = []
        for i, t in enumerate(times):
            await pg.evaluate('t=>document.getAnimations().forEach(a=>a.currentTime=t)', t * 1000)
            f = f'/tmp/snap_{i:02d}.png'; await pg.screenshot(path=f); fs.append(f)
        await b.close()
    out = f'/tmp/fxsheet_{name}{"_rm" if rm else ""}.png'
    n = len(fs); cols = min(n, 4)
    vf = ''.join(f'[{i}]drawtext=text=\'{times[i]}s\':x=8:y=8:fontsize=22:fontcolor=red[v{i}];' for i in range(n))
    vf += ''.join(f'[v{i}]' for i in range(n)) + f'xstack=inputs={n}:layout=' + '|'.join(f'{(i%cols)*400}_{(i//cols)*400}' for i in range(n)) + ':fill=white'
    cmd = ['ffmpeg', '-y', '-loglevel', 'error'] + sum([['-i', f] for f in fs], []) + ['-filter_complex', vf, out]
    subprocess.run(cmd, check=True); print(out)
name = sys.argv[1]; times = [float(x) for x in sys.argv[2].split(',')]
asyncio.run(main(name, times, len(sys.argv) > 3))
