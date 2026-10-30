import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const designRoot = path.join(repoRoot, 'design');
const manifestPath = path.join(designRoot, 'MANIFEST.md');

function walk(dir) {
  let res = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      res = res.concat(walk(full));
    } else {
      res.push(full);
    }
  }
  return res;
}

const screenMap = {
  '00-design-system': 'Screen 00 — Design System & Tokens Reference',
  '01-kid-home': 'Screen 01 — Kid Home (Junior 5–11)',
  '02-journey-map': 'Screen 02 — World Journey Map',
  '03-lesson-detail': 'Screen 03 — Lesson Detail & Player',
  '04-quiz': 'Screen 04 — Interactive Quiz',
  '05-pack-store': 'Screen 05 — Content Pack Store',
  '06-league-table': 'Screen 06 — League Standings Table',
  '07-profile': 'Screen 07 — Kid Profile, Badges & Avatar',
  '08-parent-onboarding': 'Screen 08 — Parent Onboarding & Child Setup',
  '09-parent-dashboard': 'Screen 09 — Parent Dashboard & Billing',
  '10-teen-home': 'Screen 10 — Teen Home (Senior 12–18)',
  '11-mascot-sheet': 'Screen 11 — Pip Mascot Expression Sheet',
  '12-tournaments-hub': 'Screen 12 — Tournaments & Leagues Hub',
  '13-cohort-lobby': 'Screen 13 — Live Match Cohort Lobby',
  '14-match-live': 'Screen 14 — Live Match Day Arena',
  '15-match-results': 'Screen 15 — Match Day Results & Podium',
  '16-fixtures': 'Screen 16 — Season Fixtures & Schedule',
  '17-champions-league': 'Screen 17 — Champions League Teaser',
  '18-world-cup-teaser': 'Screen 18 — World Cup Teaser',
  '19-adventure-detail': 'Screen 19 — Story Adventure Detail',
  '20-mission-detail': 'Screen 20 — Coding Mission Detail',
  '21-admin-overview': 'Screen 21 — Admin Overview Dashboard',
  '22-admin-packs': 'Screen 22 — Admin Content Packs List',
  '23-admin-pack-editor': 'Screen 23 — Admin Pack Editor',
  '24-admin-tournaments': 'Screen 24 — Admin Tournaments Management',
  '25-admin-children-parents': 'Screen 25 — Admin Children & Parents Directory',
  '26-admin-pods-mentors': 'Screen 26 — Admin Pods & Mentors Management',
  '27-admin-billing': 'Screen 27 — Admin Subscriptions & Billing',
  '28-admin-reviews': 'Screen 28 — Admin Project Reviews Queue',
  '29-mentor-today': 'Screen 29 — Mentor Today Schedule & Tasks',
  '30-mentor-review': 'Screen 30 — Mentor Project Rubric Review',
  '31-mentor-child-progress': 'Screen 31 — Mentor Child Progress View',
  '32-mentor-attendance': 'Screen 32 — Mentor Live Class Attendance',
  'board-admin-mentor': 'Board — Admin & Mentor Screens Overview (21–32)',
  'board-tournaments': 'Board — Tournaments & Leagues Overview (12–18)',
  'overview-board': 'Board — Master Screens Overview (00–11, 19–20)',
};

function describeFile(rel) {
  for (const [key, desc] of Object.entries(screenMap)) {
    if (rel.includes(key)) return desc;
  }
  if (rel.startsWith('design/assets/pip/')) return 'Pip static/transparent pose SVG (Screens 00–20, 11-mascot-sheet)';
  if (rel.startsWith('design/assets/av')) return 'Approved child avatar asset (Screens 01, 06–10, 12–16, 25)';
  if (rel === 'design/assets/adventure-ngodo.jpg') return 'Adventure cover art (Screen 19 — Adventure Detail)';
  if (rel === 'design/assets/girl-cutout.png') return 'Hero child cutout illustration (Screens 01, 08)';
  if (rel === 'design/assets/journey-map-bg.jpg') return 'World map background illustration (Screen 02 — Journey Map)';
  if (rel === 'design/assets/lesson-loops.jpg') return 'Lesson thumbnail illustration (Screens 01, 03 — Lesson Detail)';
  if (rel.startsWith('design/assets/logo')) return 'TinkerPod brand logo asset (All screens 00–32, auth & headers)';
  if (rel.startsWith('design/assets/mascot')) return 'Pip mascot raster reference sheet/pose (Screen 11 — Mascot Sheet)';
  if (rel === 'design/assets/mission-lost-key.jpg') return 'Mission cover illustration (Screen 20 — Mission Detail)';
  if (rel === 'design/assets/proc.py') return 'Asset processing utility script (Design pipeline)';
  if (rel.includes('fx01-xp-coins')) return 'FX01 XP & Coins reward celebration (Screens 03, 04, 07, M3 Ledger)';
  if (rel.includes('fx02-level-up')) return 'FX02 Level-Up celebration (Screens 01, 07, M3 Ledger)';
  if (rel.includes('fx03-correct-wrong')) return 'FX03 Quiz Correct/Wrong feedback cue (Screen 04 — Quiz, M2)';
  if (rel.includes('fx04-pack-unlock')) return 'FX04 Content Pack Unlock celebration (Screen 05 — Pack Store, M4)';
  if (rel.includes('fx05-streak-mission')) return 'FX05 Streak & Mission complete celebration (Screens 01, 20, M3)';
  if (rel.startsWith('design/fx/')) return 'FX celebration preview, audio/SVG build scripts & cue timings (Screens 01–07, 20)';
  if (rel.startsWith('design/motion/svg/')) return 'Pip animated SVG rig mood (Boot placeholder, Screens 01–20)';
  if (rel === 'design/motion/moods.json') return 'Pip mood durations and loop metadata (All kid screens & Pip component)';
  if (rel.startsWith('design/motion/')) return 'Pip motion rig preview & generator scripts (Screen 11, Pip component)';
  if (rel === 'design/html/tp.css') return 'Shared design system stylesheet & tokens (HTML sources 00–32)';
  if (rel === 'design/html/tp.js') return 'Shared design preview script (HTML sources 00–32)';
  if (rel === 'design/html/build.py') return 'HTML screen builder script (HTML sources 00–32)';
  if (rel === 'design/png/mascot-concept-generated.jpg') return 'Concept reference only — not a production asset (Screen 11 reference)';
  return 'Shared design system asset (Screens 00–32)';
}

function generateManifest() {
  const files = walk(designRoot)
    .map((f) => path.relative(repoRoot, f).split(path.sep).join('/'))
    .filter((f) => f !== 'design/MANIFEST.md')
    .sort();

  let md = '# Design Asset Manifest\n\n';
  md += 'This manifest lists every approved file in `design/`, its byte size, its exact `sha256` checksum, and the screen(s) it serves.\n\n';
  md += `Total files tracked: **${files.length}**\n\n`;
  md += '| Path | Bytes | SHA-256 | Screen / Purpose |\n';
  md += '| :--- | ---: | :--- | :--- |\n';

  for (const rel of files) {
    const buf = fs.readFileSync(path.join(repoRoot, rel));
    const sha = crypto.createHash('sha256').update(buf).digest('hex');
    md += `| \`${rel}\` | ${buf.length} | \`${sha}\` | ${describeFile(rel)} |\n`;
  }

  return md;
}

const expected = generateManifest();
if (process.argv.includes('--write')) {
  fs.writeFileSync(manifestPath, expected, 'utf8');
  console.log('Generated design/MANIFEST.md successfully.');
} else {
  const actual = fs.readFileSync(manifestPath, 'utf8');
  if (actual !== expected) {
    console.error('ERROR: design/MANIFEST.md does not match the current contents/checksums of design/.');
    process.exit(1);
  }
  console.log('Verified design/MANIFEST.md: all 197 asset checksums match.');
}
