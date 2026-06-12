// Dev-only: embed a photo as a data URI module — the RAW file bytes,
// untouched (no crop, no background knockout, no downscale). The
// photos are pre-cut stickers with transparency; the game draws them
// as-is at native resolution. The file itself never ships: the URI is
// source code, so the game still loads zero external asset files.
//
//   node tools/embed_imo.mjs <image-path> [out-file] [export-name]

import { readFileSync, writeFileSync } from 'node:fs';

const [, , imgPath = 'tools/Imo.png', outFile = 'src/data/imo_photo.js', exportName = 'IMO_HEAD_URI'] = process.argv;
const b64 = readFileSync(imgPath).toString('base64');
const ext = imgPath.toLowerCase().endsWith('.jpg') || imgPath.toLowerCase().endsWith('.jpeg') ? 'jpeg'
          : imgPath.toLowerCase().endsWith('.webp') ? 'webp' : 'png';
const uri = `data:image/${ext};base64,${b64}`;

const out = `// ============================================================
// PHOTO HEAD — the actual photo, byte-for-byte (no edits), embedded
// as a data URI by tools/embed_imo.mjs. Pure source code: the game
// loads zero external asset files.
// ============================================================

export const ${exportName} = '${uri}';
`;
writeFileSync(outFile, out);
console.log(`EMBEDDED ${outFile} — ${Math.round(uri.length / 1024)}KB raw data URI (no edits)`);
