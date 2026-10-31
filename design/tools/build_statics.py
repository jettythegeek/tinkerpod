"""Baked (CSS-free, react-native-svg safe) static frames + Reanimated motion specs for the FX, empty states and logo intro."""
import os, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); PACK = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from statics import make_static
FX = {'fx06-confetti-burst': .6, 'fx07-star-burst': .55, 'fx08-badge-reveal': 3.0, 'fx09-trophy-reveal': 3.3, 'fx10-streak-flame-idle': 0,
      'fx11-loading-spinner': .3, 'fx12-pull-to-refresh': 2.4, 'fx13-skeleton-shimmer': .6, 'fx14-progress-ring': 2.6, 'fx15-download-meter': 3.5}
EMPTY = {'no-lessons': 1.0, 'offline': 2.2, 'error': 1.6, 'no-packs': .8, 'no-tournaments': 1.0, 'search-no-results': .6, 'no-kids': 1.0}
def go():
    fs, fj = f'{PACK}/fx/static', f'{PACK}/fx/json'; os.makedirs(fs, exist_ok=True); os.makedirs(fj, exist_ok=True)
    for n, t in FX.items():
        make_static(f'{PACK}/fx/svg/{n}.svg', t, baked=f'{fs}/{n}-static.svg', png=f'{fs}/{n}.png', png_w=600, motion=f'{fj}/{n}.motion.json', tight=False); print(n)
    es, ej = f'{PACK}/assets/empty/static', f'{PACK}/assets/empty/json'; os.makedirs(es, exist_ok=True); os.makedirs(ej, exist_ok=True)
    for n, t in EMPTY.items():
        n = f'empty-{n}'
        make_static(f'{PACK}/assets/empty/{n}.svg', t, baked=f'{es}/{n}-static.svg', png=f'{es}/{n}.png', png_w=720, motion=f'{ej}/{n}.motion.json', tight=False); print(n)
    lj = f'{PACK}/assets/logo/json'; os.makedirs(lj, exist_ok=True)
    make_static(f'{PACK}/assets/logo/tinkerpod-logo-intro.svg', 1.5, baked=tempfile.mktemp(suffix='.svg'), motion=f'{lj}/tinkerpod-logo-intro.motion.json', tight=False); print('logo intro')
if __name__ == '__main__': go()
