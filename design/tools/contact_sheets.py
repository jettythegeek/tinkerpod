"""Contact sheets: screenshot each section of preview/index.html (animations caught mid-play)."""
import asyncio, os
from playwright.async_api import async_playwright
PACK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
        pg = await b.new_page(viewport={'width': 1500, 'height': 1000}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(f'file://{PACK}/preview/index.html'); await pg.wait_for_timeout(2600)
        await pg.evaluate("document.querySelector('header').style.position='static'")
        for i, (sid, name) in enumerate([('logo', 'logo'), ('icons', 'app-icons'), ('fx', 'fx'), ('fx-static', 'fx-static'), ('moods', 'captain-jetty'), ('mood-static', 'captain-jetty-static'), ('empty', 'empty-states')]):
            await pg.locator(f'#{sid}').screenshot(path=f'{PACK}/preview/contact-sheet-{i+1:02d}-{name}.png')
        print('errors', errs); await b.close()
asyncio.run(main())
