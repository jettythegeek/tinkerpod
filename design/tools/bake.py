"""Bake an animated (CSS-keyframe) SVG into a plain, CSS-free SVG frozen at time t, for react-native-svg
(which ignores <style> and CSS animation). Also exports the animation as a JSON spec for re-implementing in Reanimated.
usage: bake.py in.svg out.svg --t ms [--motion out.motion.json] [--keep-hidden]
How: headless Chrome pauses every animation at t, then for each element reads the computed transform (via getCTM,
so transform-origin / transform-box are folded in), opacity and any other animated property, writes them as
presentation attributes, drops elements that are fully transparent, and removes <style>, class and style attributes."""
import asyncio, sys, argparse, json, re, os
from playwright.async_api import async_playwright

JS = r"""
([t, keepHidden]) => {
  const root = document.querySelector('#s>svg');
  const anims = document.getAnimations();
  anims.forEach(a => { a.pause(); a.currentTime = t; });
  // motion spec (before we touch the DOM)
  let n = 0;
  const motion = anims.map(a => {
    const el = a.effect.target; if (!el.id) el.id = 'm' + (n++);
    const cs = getComputedStyle(el), tm = a.effect.getTiming();
    return { target: el.id, name: a.animationName || null, duration_ms: tm.duration, delay_ms: tm.delay,
             iterations: tm.iterations === Infinity ? 'infinite' : tm.iterations, direction: tm.direction, fill: tm.fill,
             easing: tm.easing, transform_origin: cs.transformOrigin, transform_box: cs.transformBox,
             keyframes: a.effect.getKeyframes().map(k => { const o = {}; for (const [kk, v] of Object.entries(k)) if (kk !== 'composite' && kk !== 'computedOffset') o[kk] = v; o.offset = k.computedOffset; return o; }) };
  });
  const animProps = new Map();
  anims.forEach(a => { const s = animProps.get(a.effect.target) || new Set();
    a.effect.getKeyframes().forEach(k => Object.keys(k).forEach(p => { if (!['offset','easing','composite','computedOffset'].includes(p)) s.add(p); }));
    animProps.set(a.effect.target, s); });
  const inDefs = el => !!el.closest('defs,clipPath,mask,linearGradient,radialGradient,pattern,symbol');
  const els = [...root.querySelectorAll('*')].filter(el => !inDefs(el) && !['style','title','desc','defs','stop'].includes(el.tagName));
  const rec = [];
  for (const el of els) {
    const cs = getComputedStyle(el), r = { el };
    if (cs.transform && cs.transform !== 'none' && el.getCTM) {
      const d = document.createElementNS('http://www.w3.org/2000/svg', 'g'); el.parentNode.insertBefore(d, el);
      const P = d.getCTM(), E = el.getCTM(); d.remove();
      if (P && E) { const m = P.inverse().multiply(E); r.tr = [m.a, m.b, m.c, m.d, m.e, m.f]; }
    }
    r.op = parseFloat(cs.opacity); r.disp = cs.display; r.vis = cs.visibility;
    const props = animProps.get(el) || new Set();
    r.props = {};
    for (const p of props) {
      const cssName = p.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
      if (['transform','opacity'].includes(cssName)) continue;
      r.props[cssName] = cs.getPropertyValue(cssName);
    }
    if (el.tagName === 'text' || el.tagName === 'tspan') { r.font = [cs.fontFamily, cs.fontWeight, cs.fontSize]; }
    rec.push(r);
  }
  // write
  const geo = ['x','y','width','height','cx','cy','r','rx','ry'];
  let dropped = 0;
  for (const r of rec) {
    const el = r.el; if (!el.isConnected) continue;
    if (!keepHidden && (r.op === 0 || r.disp === 'none' || r.vis === 'hidden')) { el.remove(); dropped++; continue; }
    if (r.tr) {
      const f = v => +v.toFixed(4);
      const [a,b,c,d,e,g] = r.tr.map(f);
      if (a === 1 && b === 0 && c === 0 && d === 1) { if (e || g) el.setAttribute('transform', `translate(${e} ${g})`); else el.removeAttribute('transform'); }
      else el.setAttribute('transform', `matrix(${a} ${b} ${c} ${d} ${e} ${g})`);
    }
    if (r.op < 1) el.setAttribute('opacity', +r.op.toFixed(3)); else el.removeAttribute('opacity');
    for (const [p, v] of Object.entries(r.props)) {
      const name = p, val = v.replace(/px$/, '');
      if (geo.includes(name) || ['fill','stroke','stroke-dashoffset','stroke-dasharray','stroke-width','fill-opacity','stroke-opacity'].includes(name)) el.setAttribute(name, val);
    }
    if (r.font) { el.setAttribute('font-family', 'Nunito'); el.setAttribute('font-weight', r.font[1]); }
    el.removeAttribute('class'); el.removeAttribute('style');
  }
  root.querySelectorAll('style').forEach(s => s.remove());
  root.querySelectorAll('[class]').forEach(e => e.removeAttribute('class'));
  root.querySelectorAll('[style]').forEach(e => e.removeAttribute('style'));
  // drop empty groups
  let again = true; while (again) { again = false; root.querySelectorAll('g').forEach(g => { if (!g.children.length && !inDefs(g)) { g.remove(); again = true; } }); }
  return { svg: root.outerHTML, motion, dropped };
}
"""
async def bake(jobs):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page()
        for j in jobs:
            src = re.sub(r'<\?xml[^>]*\?>', '', open(j['svg']).read())
            await pg.set_content(f'<html><body><div id="s">{src}</div></body></html>')
            await pg.wait_for_timeout(40)
            res = await pg.evaluate(JS, [j.get('t', 0), j.get('keep_hidden', False)])
            svg = res['svg']
            if 'xmlns="http://www.w3.org/2000/svg"' not in svg[:200]: svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"', 1)
            svg = svg.replace(' xmlns:xlink="http://www.w3.org/1999/xlink"', '')
            svg = re.sub(r'\s+id="[^"]*root"', '', svg, count=1)
            if j.get('title'): svg = re.sub(r'<title>[^<]*</title>', f'<title>{j["title"]}</title>', svg, count=1)
            open(j['out'], 'w').write(svg + '\n')
            if j.get('motion'):
                json.dump(dict(source=os.path.basename(j['svg']), note='CSS keyframe animation exported from Chrome. transform_origin is in px of the reference box (transform_box). Offsets 0..1.', animations=res['motion']), open(j['motion'], 'w'), indent=1)
        await b.close()
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('svg'); ap.add_argument('out'); ap.add_argument('--t', type=float, default=0); ap.add_argument('--motion'); ap.add_argument('--keep-hidden', action='store_true')
    a = ap.parse_args(); asyncio.run(bake([dict(svg=a.svg, out=a.out, t=a.t, motion=a.motion, keep_hidden=a.keep_hidden)]))
