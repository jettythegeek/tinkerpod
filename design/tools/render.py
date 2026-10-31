"""Render SVG files to PNG with headless Chrome (the same engine the previews use).
usage: render.py in.svg out.png [--w 512] [--h H] [--t ms] [--bg '#fff'|transparent] [--nocss]
--t pauses every CSS animation at that time (ms); --nocss strips <style> to emulate a plain react-native-svg render."""
import asyncio, sys, argparse, re, os
from playwright.async_api import async_playwright
async def render(jobs, scale=1):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(device_scale_factor=scale)
        for j in jobs:
            src = open(j['svg']).read()
            if j.get('nocss'): src = re.sub(r'<style>.*?</style>', '', src, flags=re.S)
            src = re.sub(r'<\?xml[^>]*\?>', '', src)
            w, h = j['w'], j.get('h') or j['w']
            bg = j.get('bg', 'transparent')
            await pg.set_viewport_size({'width': w, 'height': h})
            await pg.set_content(f'<html><head><link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=block" rel="stylesheet"><style>html,body{{margin:0;background:{bg};overflow:hidden}} #s>svg{{width:{w}px;height:{h}px;display:block}}</style></head><body><div id="s">{src}</div></body></html>')
            await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(60)
            t = j.get('t')
            if t is not None:
                await pg.evaluate('t=>document.getAnimations().forEach(a=>{a.pause();a.currentTime=t})', t)
                await pg.wait_for_timeout(30)
            await pg.screenshot(path=j['out'], omit_background=(bg == 'transparent'))
        await b.close()
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('svg'); ap.add_argument('out'); ap.add_argument('--w', type=int, default=512); ap.add_argument('--h', type=int)
    ap.add_argument('--t', type=float); ap.add_argument('--bg', default='transparent'); ap.add_argument('--nocss', action='store_true')
    a = ap.parse_args()
    asyncio.run(render([dict(svg=a.svg, out=a.out, w=a.w, h=a.h, t=a.t, bg=a.bg, nocss=a.nocss)]))
