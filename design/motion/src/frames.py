# usage: frames.py mood:t_ms mood:t_ms ...  -> one row image at 400px each
import asyncio, sys, os
from playwright.async_api import async_playwright
from PIL import Image
S=int(os.environ.get("S",400))
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={"width":int(os.environ.get("S",400)),"height":int(os.environ.get("S",400))})
        ims=[]
        for spec in sys.argv[1:]:
            m,t=spec.split(':')
            svg=open(f'../svg/pip-{m}.svg').read().replace('width="540" height="540"',f'width="{S}" height="{S}"')
            await pg.set_content(f'<html><body style="margin:0;background:#F8FAFC">{svg}</body></html>')
            await pg.evaluate(f'document.getAnimations().forEach(a=>{{a.pause();a.currentTime={t}}})')
            await pg.screenshot(path='/tmp/f.png'); ims.append(Image.open('/tmp/f.png').copy())
        await b.close()
    s=Image.new('RGB',(S*len(ims),S),'white')
    for i,im in enumerate(ims): s.paste(im,(i*S,0))
    out=f'/tmp/fr_{os.getpid()}.png'; s.save(out); print(out)
asyncio.run(main())
