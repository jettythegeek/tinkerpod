"""MANIFEST.md: sha256 + bytes for every file in the pack (run last)."""
import os, hashlib
PACK = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(PACK)
rows = []; tot = 0
for d, ds, fs in os.walk('.'):
    ds[:] = sorted(x for x in ds if x != '__pycache__')
    for f in sorted(fs):
        p = os.path.join(d, f)[2:]
        if p == 'MANIFEST.md': continue
        b = open(p, 'rb').read(); tot += len(b); rows.append(f'| `{p}` | {len(b):,} | `{hashlib.sha256(b).hexdigest()}` |')
open('MANIFEST.md', 'w').write(f'# MANIFEST\n\n{len(rows)} files, {tot:,} bytes (MANIFEST.md itself not listed). Verify: `shasum -a 256 <file>`.\n\n| File | Bytes | SHA-256 |\n|---|---:|---|\n' + '\n'.join(rows) + '\n')
print(len(rows), tot)
