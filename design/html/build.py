import sys,glob,os,asyncio
from playwright.async_api import async_playwright
HEAD=open('head.inc').read()
async def main(names):
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1600,'height':1000},device_scale_factor=2)
        for n in names:
            body=open(f'src/{n}.body.html').read()
            html=HEAD+f'<body>{body}<script>tpInit()</script></body></html>'
            open(f'{n}.html','w').write(html)
            await pg.goto('file://'+os.path.abspath(f'{n}.html'))
            await pg.wait_for_selector('body[data-ready]',timeout=20000)
            await pg.wait_for_load_state('networkidle')
            await pg.wait_for_timeout(400)
            el=await pg.query_selector('.capture')
            await el.screenshot(path=f'../png/{n}.png')
            import shutil,time; shutil.copy(f'../png/{n}.png',f'/tmp/v_{n}_{int(time.time())}.png'); print('rendered',n,f'/tmp/v_{n}_{int(time.time())}.png')
        await b.close()
names=sys.argv[1:] or [os.path.basename(f)[:-10] for f in sorted(glob.glob('src/*.body.html'))]
asyncio.run(main(names))
