import asyncio, json, sys, os
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw
SV='../svg'; meta=json.load(open('../moods.json'))
moods=sys.argv[1:] or list(meta)
N=8
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':300,'height':300})
        rows=[]
        for m in moods:
            svg=open(f'{SV}/pip-{m}.svg').read().replace('width="540" height="540"','width="300" height="300"')
            await pg.set_content(f'<html><body style="margin:0;background:#F8FAFC">{svg}</body></html>')
            await pg.evaluate('document.getAnimations().forEach(a=>a.pause())')
            ims=[]
            for i in range(N):
                t=meta[m]['dur']*1000*i/N
                await pg.evaluate(f'document.getAnimations().forEach(a=>a.currentTime={t})')
                await pg.screenshot(path='/tmp/f.png'); ims.append(Image.open('/tmp/f.png').copy())
            rows.append((m,ims))
        await b.close()
    W=300*N; H=300*len(rows)
    sh=Image.new('RGB',(W,H),'white'); d=ImageDraw.Draw(sh)
    for r,(m,ims) in enumerate(rows):
        for i,im in enumerate(ims): sh.paste(im,(i*300,r*300))
        d.text((6,r*300+4),m,fill='black')
    sh=sh.resize((W//2,H//2))
    out=f'/tmp/sheet_{"_".join(moods)}_{os.getpid()}.png'; sh.save(out); print(out)
asyncio.run(main())
