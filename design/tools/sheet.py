"""Frame strip for reviewing an animated SVG: sheet.py in.svg out.png t1,t2,... [--w 300] [--bg #F8FAFC]"""
import asyncio, sys, argparse, os, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from render import render
from PIL import Image, ImageDraw
def sheet(svg, out, times, w=300, h=None, bg='#F8FAFC', cols=None):
    h = h or w; d = tempfile.mkdtemp()
    jobs = [dict(svg=svg, out=f'{d}/{i}.png', w=w, h=h, t=t * 1000, bg=bg) for i, t in enumerate(times)]
    asyncio.run(render(jobs))
    cols = cols or min(len(times), 6); rows = (len(times) + cols - 1) // cols
    S = Image.new('RGB', (cols * w, rows * h), 'white'); dr = ImageDraw.Draw(S)
    for i, t in enumerate(times):
        S.paste(Image.open(f'{d}/{i}.png').convert('RGB'), ((i % cols) * w, (i // cols) * h))
        dr.text(((i % cols) * w + 6, (i // cols) * h + 4), f'{t:.2f}s', fill='red')
    S.save(out); return out
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('svg'); ap.add_argument('out'); ap.add_argument('times')
    ap.add_argument('--w', type=int, default=300); ap.add_argument('--h', type=int); ap.add_argument('--bg', default='#F8FAFC'); ap.add_argument('--cols', type=int)
    a = ap.parse_args(); sheet(a.svg, a.out, [float(x) for x in a.times.split(',')], a.w, a.h, a.bg, a.cols)
