"""Static + spec exports of the Captain Jetty moods → assets/pip (static SVG/PNG) and motion/json (Reanimated specs)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); PACK = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(PACK, 'tools'))
from statics import make_static
SVG = os.path.join(PACK, 'motion', 'svg'); A = os.path.join(PACK, 'assets', 'pip'); J = os.path.join(PACK, 'motion', 'json')
os.makedirs(A, exist_ok=True); os.makedirs(J, exist_ok=True)
# mood: [(suffix, hero time s)]
HERO = {'thinking': [('', .6)], 'sleepy': [('', 1.0), ('-wake', 3.6)], 'surprised': [('', .6)], 'celebrate': [('', .36)]}
for mood, poses in HERO.items():
    for i, (suf, t) in enumerate(poses):
        n = f'pip-{mood}{suf}'
        vb = make_static(f'{SVG}/pip-{mood}.svg', t, baked=f'{A}/{n}-static.svg', png=f'{A}/{n}.png',
                         paused=f'{A}/{n}.svg', paused_tight=f'{A}/{n}-t.svg', motion=(f'{J}/pip-{mood}.motion.json' if i == 0 else None), pad=12)
        print(n, vb)
