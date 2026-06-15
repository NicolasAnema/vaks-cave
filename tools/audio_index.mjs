// ============================================================
// Audio drop-in indexer. Run after adding/removing files under
// assets/audio/ — the game discovers audio ONLY via index.json
// (no directory listing on a static server).
//   node tools/audio_index.mjs
// Scans assets/audio/{vo,music,sfx}, writes assets/audio/index.json,
// then prints which manifest voice rows, music slots, and events
// have files and which are still silent.
// ============================================================

import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MANIFEST, MUSIC_SLOTS, EVENTS } from '../src/data/manifest.js';
import { VOICE_ALIASES, MUSIC_ALIASES } from '../src/data/audio_map.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIR = join(ROOT, 'assets', 'audio');
const EXTS = new Set(['.opus', '.ogg', '.mp3', '.m4a', '.wav', '.webm']);

for (const d of ['vo', 'music', 'sfx']) mkdirSync(join(DIR, d), { recursive: true });

const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (EXTS.has(extname(e.name).toLowerCase())) files.push(relative(DIR, p).replaceAll('\\', '/'));
  }
})(DIR);
files.sort();
writeFileSync(join(DIR, 'index.json'), JSON.stringify({ files }, null, 2) + '\n');
console.log(`[AUDIO INDEX] ${files.length} file(s) -> assets/audio/index.json\n`);

const have = new Set(files);
const stems = new Set(files.map((f) => f.replace(/\.[a-z0-9]+$/i, '')));
const used = new Set();   // files referenced by an alias or stem
const dangling = [];      // alias paths that point at a missing file

// returns the file backing a row line: explicit alias first, then convention
function voiceHit(row, idx) {
  const a = VOICE_ALIASES[row.id];
  if (Array.isArray(a)) {
    const f = a[idx] || a.find(Boolean);
    if (f && !have.has(f)) dangling.push(`${row.id}[${idx}] -> ${f}`);
    return have.has(f) ? f : null;
  }
  if (a) { if (!have.has(a)) dangling.push(`${row.id} -> ${a}`); return have.has(a) ? a : null; }
  const stem = row.file.replace(/\.[a-z0-9]+$/i, '');
  for (const ext of ['opus', 'ogg', 'mp3', 'm4a', 'wav', 'webm']) {
    if (have.has(`${stem}_${idx + 1}.${ext}`)) return `${stem}_${idx + 1}.${ext}`;
    if (have.has(`${stem}.${ext}`)) return `${stem}.${ext}`;
  }
  return null;
}

console.log('VOICE NOTES:');
let voiced = 0;
for (const row of MANIFEST) {
  const hits = row.lines.map((_, i) => voiceHit(row, i));
  hits.forEach((f) => f && used.add(f));
  const n = new Set(hits.filter(Boolean)).size, ok = n > 0;
  if (ok) voiced++;
  const variants = row.lines.length > 1 ? `  (${hits.filter(Boolean).length}/${row.lines.length} lines)` : '';
  const shown = hits.find(Boolean) || row.file;
  console.log(`  ${ok ? 'VOICED' : '  ----'}  ${row.id.padEnd(18)} ${shown}${variants}`);
}

console.log('\nMUSIC:');
let tracked = 0;
for (const slot of MUSIC_SLOTS) {
  const a = MUSIC_ALIASES[slot.id];
  if (a && !have.has(a)) dangling.push(`music ${slot.id} -> ${a}`);
  const f = (a && have.has(a)) ? a : (stems.has(slot.file.replace(/\.[a-z0-9]+$/i, '')) ? slot.file : null);
  if (f) { used.add(f); tracked++; }
  console.log(`  ${f ? ' TRACK' : '  ----'}  ${slot.id.padEnd(8)} ${f || slot.file}  (${slot.name})`);
}

const sfx = EVENTS.filter((ev) => stems.has('sfx/' + ev));
console.log(`\nSFX (sfx/<event>): ${sfx.length ? sfx.join(', ') : 'none'}`);

const leftover = files.filter((f) => !used.has(f) && !sfx.some((ev) => f.startsWith('sfx/' + ev + '.')));
if (leftover.length) {
  console.log(`\nUNUSED FILES (${leftover.length}) — not matched to any row, slot, or event:`);
  for (const f of leftover) console.log(`  ${f}`);
}
if (dangling.length) {
  console.log(`\nDANGLING ALIASES (${dangling.length}) — audio_map points at a missing file:`);
  for (const d of dangling) console.log(`  ${d}`);
}
console.log(`\n${voiced}/${MANIFEST.length} voice rows, ${tracked}/${MUSIC_SLOTS.length} music slots have audio.`);
