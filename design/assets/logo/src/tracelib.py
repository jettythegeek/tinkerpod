"""Potrace helpers (pure-Python potracer) used to vectorise the approved logo PNGs."""
import numpy as np, potrace
from PIL import Image

def trace_mask(mask, scale=1.0, ox=0.0, oy=0.0, turd=8, alphamax=1.0, opttol=0.3):
    """mask: bool array (True = ink). Returns SVG path data in output units (pixel/scale + offset)."""
    bm = potrace.Bitmap(mask.astype(bool))
    path = bm.trace(turdsize=turd, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,
                    alphamax=alphamax, opticurve=True, opttolerance=opttol)
    f = lambda p: f'{p.x/scale+ox:.1f} {p.y/scale+oy:.1f}'
    d = []
    for curve in path:
        d.append('M' + f(curve.start_point))
        for s in curve.segments:
            if s.is_corner:
                d.append('L' + f(s.c) + 'L' + f(s.end_point))
            else:
                d.append('C' + f(s.c1) + ' ' + f(s.c2) + ' ' + f(s.end_point))
        d.append('Z')
    return ''.join(d)

def upscale_alpha(a, k):
    """Bicubic-upscale a 0..255 channel by k and return float array."""
    im = Image.fromarray(a.astype(np.uint8))
    return np.array(im.resize((im.width * k, im.height * k), Image.BICUBIC)).astype(float)
