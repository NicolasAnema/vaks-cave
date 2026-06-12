// Dev-only: bake a photo into code-generated tikolosh pixel data.
// Reads an image, crops to the subject, downsamples to two sizes
// (sprite + portrait), quantizes colors, and emits src/data/tiko_pix.js
// as pure source (the photo itself never ships).
//
//   node tools/bake_tiko.mjs <image-path>
//
// Uses headless Edge via CDP for image decoding (zero npm deps,
// same trick as drive*.mjs): the image is read locally, decoded in
// a canvas, and the downsampled RGBA grid is returned as JSON.

import { readFileSync, writeFileSync } from 'node:fs';

const [, , imgPath, port = '9333'] = process.argv;
if (!imgPath) { console.error('usage: node tools/bake_tiko.mjs <image-path> [cdp-port]'); process.exit(1); }

// head-only bake: the pixel body stays hand-drawn; the head mounts on it
const SPRITE_W = 24, SPRITE_H = 20;     // in-game tikolosh head (rows 0-19 of the 24x32 cell)
const PORTRAIT_W = 24, PORTRAIT_H = 24; // dialogue portrait head

const b64 = readFileSync(imgPath).toString('base64');
const ext = imgPath.toLowerCase().endsWith('.jpg') || imgPath.toLowerCase().endsWith('.jpeg') ? 'jpeg'
          : imgPath.toLowerCase().endsWith('.webp') ? 'webp' : 'png';
const dataUri = `data:image/${ext};base64,${b64}`;

const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
let page = targets.find((t) => t.type === 'page');
if (!page) {
  page = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
}
const ws = new WebSocket(page.webSocketDebuggerUrl);
let msgId = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise((res) => { const id = ++msgId; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
await new Promise((r) => ws.addEventListener('open', r));
await send('Runtime.enable');

const expr = `(async () => {
  const img = new Image();
  img.src = ${JSON.stringify(dataUri)};
  await img.decode();
  const W = img.width, H = img.height;

  // --- find the subject: scan for non-background pixels ---
  // the WhatsApp sticker style has a dark/transparent surround; sample
  // the four corners as "background" and find the bounding box of
  // everything that differs strongly from them.
  const c0 = document.createElement('canvas');
  c0.width = W; c0.height = H;
  const g0 = c0.getContext('2d', { willReadFrequently: true });
  g0.drawImage(img, 0, 0);
  const d0 = g0.getImageData(0, 0, W, H).data;
  const px = (x, y) => { const i = (y * W + x) * 4; return [d0[i], d0[i+1], d0[i+2], d0[i+3]]; };
  // only OPAQUE corners are background references — a transparent corner
  // reads as black and would wrongly cull dark hair/shadow pixels
  const corners = [px(2,2), px(W-3,2), px(2,H-3), px(W-3,H-3)].filter((c) => c[3] > 200);
  const isBg = (r,g,b,a) => a < 60 || corners.some(([cr,cg,cb]) => Math.abs(r-cr)+Math.abs(g-cg)+Math.abs(b-cb) < 90);
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
    const [r,g,b,a] = px(x,y);
    if (!isBg(r,g,b,a)) { if (x<minX)minX=x; if (x>maxX)maxX=x; if (y<minY)minY=y; if (y>maxY)maxY=y; }
  }
  const pad = Math.round((maxX - minX) * 0.03);
  minX = Math.max(0, minX - pad); maxX = Math.min(W - 1, maxX + pad);
  minY = Math.max(0, minY - pad); maxY = Math.min(H - 1, maxY + pad);
  const bw = maxX - minX + 1, bh = maxY - minY + 1;

  // --- downsample a crop region to wxh with background knocked out ---
  function grid(sx, sy, sw, sh, w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    const d = g.getImageData(0, 0, w, h).data;
    const cells = [], bgish = [];
    for (let y = 0; y < h; y++) {
      cells.push([]); bgish.push([]);
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        cells[y].push([d[i], d[i+1], d[i+2]]);
        bgish[y].push(isBg(d[i], d[i+1], d[i+2], d[i+3]));
      }
    }
    // flood-fill background from the borders only, so interior whites
    // (eye highlights) survive the knockout
    const cut = Array.from({ length: h }, () => new Array(w).fill(false));
    const q = [];
    for (let x = 0; x < w; x++) { q.push([x, 0], [x, h - 1]); }
    for (let y = 0; y < h; y++) { q.push([0, y], [w - 1, y]); }
    while (q.length) {
      const [x, y] = q.pop();
      if (x < 0 || y < 0 || x >= w || y >= h || cut[y][x] || !bgish[y][x]) continue;
      cut[y][x] = true;
      q.push([x+1, y], [x-1, y], [x, y+1], [x, y-1]);
    }
    return cells.map((row, y) => row.map((p, x) => {
      if (cut[y][x]) return null;
      // tame camera-flash brights in the face region (collar may stay white)
      if (y < h * 0.6 && p[0] + p[1] + p[2] > 470) {
        return [Math.round(p[0] * 0.25 + 112), Math.round(p[1] * 0.25 + 79), Math.round(p[2] * 0.25 + 56)];
      }
      return p;
    }));
  }

  // head = top portion of the subject (head is ~as tall as it is wide)
  const headH = Math.min(bh, Math.round(bw * 1.0));
  const sprite = grid(minX, minY, bw, headH, ${SPRITE_W}, ${SPRITE_H});
  const portrait = grid(minX, minY, bw, headH, ${PORTRAIT_W}, ${PORTRAIT_H});
  return JSON.stringify({ sprite, portrait });
})()`;

const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
const val = res.result?.result?.value;
if (!val) { console.error('decode failed:', JSON.stringify(res.result?.result?.description || res.result, null, 2).slice(0, 800)); process.exit(1); }
const { sprite, portrait } = JSON.parse(val);
ws.close();

// --- quantize to a compact palette (median-cut-ish via popularity buckets) ---
function quantize(gridData, maxColors) {
  const buckets = new Map();
  for (const row of gridData) for (const p of row) {
    if (!p) continue;
    const key = [(p[0] >> 4) << 4, (p[1] >> 4) << 4, (p[2] >> 4) << 4].join(',');
    const b = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 };
    b.n++; b.r += p[0]; b.g += p[1]; b.b += p[2];
    buckets.set(key, b);
  }
  const pal = [...buckets.values()]
    .sort((a, b) => b.n - a.n).slice(0, maxColors)
    .map((b) => [Math.round(b.r / b.n), Math.round(b.g / b.n), Math.round(b.b / b.n)]);
  const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  const nearest = (p) => pal.reduce((best, c, i) =>
    (Math.abs(c[0]-p[0]) + Math.abs(c[1]-p[1]) + Math.abs(c[2]-p[2])) <
    (Math.abs(pal[best][0]-p[0]) + Math.abs(pal[best][1]-p[1]) + Math.abs(pal[best][2]-p[2])) ? i : best, 0);
  const rows = gridData.map((row) => row.map((p) => (p ? nearest(p) : -1)));
  return { palette: pal.map(hex), rows };
}

const sQ = quantize(sprite, 14);
const pQ = quantize(portrait, 18);

// encode rows as strings: '.' = transparent, then base36 palette index
const enc = (q) => q.rows.map((row) => row.map((i) => (i < 0 ? '.' : i.toString(36))).join(''));

const out = `// ============================================================
// TIKO PIXEL DATA — generated by tools/bake_tiko.mjs from a local
// photo; the photo itself never ships. Pure data, zero asset files.
// rows: '.' = transparent, else base36 index into palette.
// ============================================================

export const TIKO_PHOTO = {
  head: {
    w: ${SPRITE_W}, h: ${SPRITE_H},
    palette: ${JSON.stringify(sQ.palette)},
    rows: ${JSON.stringify(enc(sQ), null, 4)},
  },
  portrait: {
    w: ${PORTRAIT_W}, h: ${PORTRAIT_H},
    palette: ${JSON.stringify(pQ.palette)},
    rows: ${JSON.stringify(enc(pQ), null, 4)},
  },
};
`;
writeFileSync('src/data/tiko_pix.js', out);
const counts = (q) => q.rows.flat().filter((i) => i >= 0).length;
console.log(`BAKED src/data/tiko_pix.js — sprite ${SPRITE_W}x${SPRITE_H} (${counts(sQ)}px, ${sQ.palette.length} colors), portrait ${PORTRAIT_W}x${PORTRAIT_H} (${counts(pQ)}px, ${pQ.palette.length} colors)`);
