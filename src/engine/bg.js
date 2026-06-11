// ============================================================
// Procedural backgrounds: parallax layer stacks for both worlds
// (>=3 layers each) and full-screen painted scenes for cutscenes,
// title and shop. All generated, no assets.
// ============================================================

import { View, vGradient } from './render.js';

function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cv(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  return [c, g];
}

function R(g, x, y, w, h, col) {
  g.fillStyle = col;
  g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

// ============================================================
// WORLD 1 — cave layers (tile vertically). Returns layers sorted
// back to front: { c, p } where p is the parallax factor.
// ============================================================

const CAVE_THEMES = {
  1: { base: ['#241c14', '#1a1410'], rock: '#332618', rockHi: '#43321f', root: '#47704a', crystal: '#5ee0a0' },
  2: { base: ['#1e2415', '#141a0f'], rock: '#2a3a1c', rockHi: '#3a4c26', root: '#5a8a5a', crystal: '#8ae08a' },
  3: { base: ['#12141c', '#0a0b12'], rock: '#1c2230', rockHi: '#2a3244', root: '#2e4a3a', crystal: '#7fd0ff' },
};

export function makeCaveLayers(levelId) {
  const T = CAVE_THEMES[levelId] || CAVE_THEMES[1];
  const H = 480;
  const layers = [];

  // base gradient (static)
  const [b, bg] = cv(View.w, View.h);
  vGradient(bg, 0, 0, View.w, View.h, [[0, T.base[0]], [1, T.base[1]]]);
  layers.push({ c: b, p: 0 });

  // far rock blobs + crystal glints
  {
    const [c, g] = cv(View.w, H);
    const r = rng(levelId * 101 + 7);
    for (let i = 0; i < 26; i++) {
      const x = r() * View.w, y = r() * H, w = 30 + r() * 80, h = 16 + r() * 40;
      R(g, x, y, w, h, T.rock);
      R(g, x + 2, y, w - 4, 2, T.rockHi);
      if (x + w > View.w) R(g, x - View.w, y, w, h, T.rock);
    }
    for (let i = 0; i < 14; i++) {
      const x = r() * View.w, y = r() * H;
      R(g, x, y, 2, 3, T.crystal);
      R(g, x, y, 1, 1, '#eafff2');
    }
    layers.push({ c, p: 0.22 });
  }

  // mid roots + outcrops
  {
    const [c, g] = cv(View.w, H);
    const r = rng(levelId * 211 + 13);
    for (let i = 0; i < 9; i++) {
      // hanging root-vines
      let x = r() * View.w;
      const y0 = r() * H, len = 30 + r() * 70;
      for (let s = 0; s < len; s += 2) {
        x += (r() - 0.5) * 2.4;
        R(g, x, (y0 + s) % H, 2, 2, T.root);
      }
    }
    for (let i = 0; i < 12; i++) {
      const x = r() < 0.5 ? r() * 60 : View.w - 60 + r() * 60;
      const y = r() * H, w = 20 + r() * 50;
      R(g, x - w / 2, y, w, 8 + r() * 14, T.rockHi);
    }
    layers.push({ c, p: 0.5 });
  }

  // near dark columns (frames the shaft)
  {
    const [c, g] = cv(View.w, H);
    const r = rng(levelId * 311 + 23);
    for (let i = 0; i < 7; i++) {
      const left = r() < 0.5;
      const y = r() * H, w = 6 + r() * 16, h = 50 + r() * 90;
      R(g, left ? 0 : View.w - w, y, w, h, 'rgba(6,6,10,0.55)');
    }
    layers.push({ c, p: 0.8 });
  }

  return layers;
}

// ============================================================
// WORLD 2 — township layers (tile horizontally)
// ============================================================

const TOWN_THEMES = {
  4: { skyTop: '#5a4a7a', skyMid: '#c97a6a', skyBot: '#ffce8a', sun: '#ffb84d', far: '#6a4a5f', house: ['#b5736a', '#a08458', '#7a8a9a', '#9a6a8a'] },
  5: { skyTop: '#6a6a9a', skyMid: '#dd9a7a', skyBot: '#ffe0a0', sun: '#ffd84d', far: '#735a6a', house: ['#c9897a', '#b09a5a', '#8a9aaa', '#aa7a9a'] },
  6: { skyTop: '#7a8ab5', skyMid: '#eab58a', skyBot: '#fff0b8', sun: '#ffe49a', far: '#7a6a72', house: ['#caa57a', '#b5736a', '#9aaab5', '#b58aa5'] },
};

function house(g, r, x, baseY, T) {
  const w = 34 + Math.floor(r() * 26);
  const h = 26 + Math.floor(r() * 16);
  const col = T.house[Math.floor(r() * T.house.length)];
  R(g, x, baseY - h, w, h, col);
  // corrugated roof
  R(g, x - 2, baseY - h - 5, w + 4, 6, '#5a5f6a');
  for (let i = 0; i < w + 4; i += 4) R(g, x - 2 + i, baseY - h - 5, 1, 6, '#4a4f58');
  // door + windows (some lit)
  R(g, x + 4, baseY - 12, 7, 12, '#3c3424');
  const lit = r() < 0.5;
  R(g, x + w - 13, baseY - h + 6, 8, 7, lit ? '#ffd88a' : '#2a2a38');
  if (w > 46) R(g, x + 16, baseY - h + 6, 8, 7, r() < 0.4 ? '#ffd88a' : '#2a2a38');
  return w;
}

export function makeTownLayers(levelId) {
  const T = TOWN_THEMES[levelId] || TOWN_THEMES[4];
  const W = 960;
  const layers = [];

  // sky (fixed)
  {
    const [c, g] = cv(View.w, View.h);
    vGradient(g, 0, 0, View.w, View.h, [[0, T.skyTop], [0.45, T.skyMid], [0.8, T.skyBot], [1, T.skyBot]]);
    // sun low on the horizon
    g.fillStyle = T.sun;
    g.beginPath(); g.arc(360, 150, 26, 0, 6.2832); g.fill();
    g.fillStyle = 'rgba(255,220,140,0.25)';
    g.beginPath(); g.arc(360, 150, 40, 0, 6.2832); g.fill();
    // clouds
    const r = rng(levelId * 77 + 3);
    for (let i = 0; i < 5; i++) {
      const x = r() * View.w, y = 20 + r() * 70, w = 40 + r() * 50;
      R(g, x, y, w, 6, 'rgba(255,235,215,0.5)');
      R(g, x + 8, y - 4, w - 20, 5, 'rgba(255,235,215,0.4)');
    }
    layers.push({ c, p: 0 });
  }

  // far hills + silhouettes
  {
    const [c, g] = cv(W, View.h);
    const r = rng(levelId * 131 + 5);
    g.fillStyle = T.far;
    for (let x = 0; x < W; x += 4) {
      const h = 50 + Math.sin(x * 0.012 + levelId) * 18 + Math.sin(x * 0.05) * 6;
      R(g, x, 200 - h, 4, h + 70, T.far);
    }
    // distant water tower + masts
    R(g, 180, 108, 3, 44, '#4f3e4a'); R(g, 174, 96, 15, 13, '#4f3e4a');
    R(g, 620, 100, 2, 52, '#4f3e4a'); R(g, 614, 100, 14, 2, '#4f3e4a');
    for (let i = 0; i < 18; i++) {
      const x = r() * W, w = 18 + r() * 26, h = 10 + r() * 18;
      R(g, x, 186 - h, w, h, '#5d4856');
    }
    layers.push({ c, p: 0.15 });
  }

  // mid houses row
  {
    const [c, g] = cv(W, View.h);
    const r = rng(levelId * 197 + 11);
    let x = 6;
    while (x < W - 60) {
      x += house(g, r, x, 226, T) + 8 + Math.floor(r() * 26);
    }
    // power line
    g.strokeStyle = 'rgba(40,35,50,0.8)';
    g.beginPath();
    for (let px = 0; px <= W; px += 120) {
      R(g, px, 150, 2, 76, '#3c3444');
      g.moveTo(px, 156);
      g.quadraticCurveTo(px + 60, 170, px + 120, 156);
    }
    g.stroke();
    layers.push({ c, p: 0.4 });
  }

  // near fence + bushes
  {
    const [c, g] = cv(W, View.h);
    const r = rng(levelId * 233 + 17);
    for (let x = 0; x < W; x += 14) {
      R(g, x, 216, 3, 22, '#54482f');
    }
    R(g, 0, 218, W, 2, '#6b5436');
    R(g, 0, 228, W, 2, '#6b5436');
    for (let i = 0; i < 16; i++) {
      const x = r() * W;
      R(g, x, 226, 14 + r() * 12, 10, '#3c6a34');
    }
    layers.push({ c, p: 0.72 });
  }

  return layers;
}

// Draw a layer stack given camera scroll along the level axis.
export function drawLayers(ctx, layers, camX, camY, orientation) {
  for (const L of layers) {
    if (L.p === 0) { ctx.drawImage(L.c, 0, 0); continue; }
    if (orientation === 'vertical') {
      const h = L.c.height;
      let off = (-(camY * L.p)) % h;
      if (off > 0) off -= h;
      for (let y = off; y < View.h; y += h) ctx.drawImage(L.c, 0, Math.round(y));
    } else {
      const w = L.c.width;
      let off = (-(camX * L.p)) % w;
      if (off > 0) off -= w;
      for (let x = off; x < View.w; x += w) ctx.drawImage(L.c, Math.round(x), 0);
    }
  }
}

// ============================================================
// Painted full-screen scenes (cutscenes, title, shop, credits)
// t = seconds for ambient animation.
// ============================================================

export function drawScene(ctx, name, t) {
  const fns = {
    cave_floor: sceneCaveFloor, cave_shaft: sceneCaveShaft,
    cave_mouth: sceneCaveMouth, cave_mouth_dawn: (c, tt) => sceneCaveMouth(c, tt, true),
    ridge: sceneRidge, garden: sceneGarden, garden_thursday: sceneThursday,
    shop_nook: sceneShop, black: sceneBlack,
  };
  (fns[name] || sceneBlack)(ctx, t);
}

function sceneBlack(g) { R(g, 0, 0, View.w, View.h, '#07070d'); }

function speckles(g, seed, n, area, col) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    R(g, area.x + r() * area.w, area.y + r() * area.h, 1 + (r() < 0.3 ? 1 : 0), 1, col);
  }
}

function sceneCaveFloor(g, t) {
  vGradient(g, 0, 0, View.w, View.h, [[0, '#0c0a08'], [0.7, '#1d1710'], [1, '#241c14']]);
  // distant speck of light, far above
  const tw = 0.6 + 0.4 * Math.sin(t * 2);
  R(g, 238, 18, 4, 4, `rgba(255,240,200,${0.5 + tw * 0.4})`);
  R(g, 236, 16, 8, 8, `rgba(255,240,200,${0.12 + tw * 0.08})`);
  // rock walls leaning in
  g.fillStyle = '#171209';
  g.beginPath(); g.moveTo(0, 0); g.lineTo(150, 0); g.lineTo(40, View.h); g.lineTo(0, View.h); g.fill();
  g.beginPath(); g.moveTo(View.w, 0); g.lineTo(View.w - 150, 0); g.lineTo(View.w - 40, View.h); g.lineTo(View.w, View.h); g.fill();
  // floor
  R(g, 0, 218, View.w, 52, '#2c2218');
  R(g, 0, 218, View.w, 3, '#43321f');
  speckles(g, 42, 50, { x: 0, y: 222, w: View.w, h: 46 }, '#1d1710');
  // Thursday's debris
  R(g, 120, 210, 4, 9, '#3f7a4a'); R(g, 121, 207, 2, 3, '#c9a86a');
  R(g, 322, 212, 9, 4, '#3f7a4a');
  R(g, 360, 213, 4, 6, '#7a4a3a');
  // crystals
  R(g, 70, 200, 4, 18, '#2e8f5e'); R(g, 72, 196, 3, 8, '#5ee0a0');
  R(g, 410, 204, 3, 14, '#2e8f5e');
}

function sceneCaveShaft(g, t) {
  vGradient(g, 0, 0, View.w, View.h, [[0, '#241c14'], [1, '#0e0b08']]);
  speckles(g, 9, 80, { x: 0, y: 0, w: View.w, h: View.h }, '#332618');
  // a ledge to stand on
  R(g, 140, 220, 200, 8, '#5d4630');
  R(g, 140, 220, 200, 2, '#8a6f48');
}

function sceneCaveMouth(g, t, dawn) {
  // arena at the cave mouth: huge arch, sky beyond
  if (dawn) {
    vGradient(g, 0, 0, View.w, View.h, [[0, '#5a4a7a'], [0.5, '#c97a6a'], [1, '#ffce8a']]);
    const p = Math.min(1, t / 3);
    g.fillStyle = `rgba(255,200,120,${0.25 * p})`;
    g.fillRect(0, 0, View.w, View.h);
  } else {
    vGradient(g, 0, 0, View.w, View.h, [[0, '#0a0a14'], [0.6, '#181426'], [1, '#241c2a']]);
    // stars
    speckles(g, 5, 26, { x: 60, y: 8, w: 360, h: 90 }, '#cfd6ff');
  }
  // rock arch frame
  g.fillStyle = '#171209';
  g.beginPath(); g.moveTo(0, 0); g.lineTo(110, 0); g.lineTo(54, 80); g.lineTo(20, 200); g.lineTo(0, 230); g.fill();
  g.beginPath(); g.moveTo(View.w, 0); g.lineTo(View.w - 110, 0); g.lineTo(View.w - 54, 80); g.lineTo(View.w - 20, 200); g.lineTo(View.w, 230); g.fill();
  R(g, 0, 0, View.w, 14, '#171209');
  // floor
  R(g, 0, 226, View.w, 44, '#2c2218');
  R(g, 0, 226, View.w, 3, '#43321f');
  speckles(g, 12, 30, { x: 0, y: 230, w: View.w, h: 38 }, '#1d1710');
}

function sceneRidge(g, t) {
  vGradient(g, 0, 0, View.w, View.h, [[0, '#5a4a7a'], [0.45, '#c97a6a'], [0.78, '#ffce8a'], [1, '#ffe0a8']]);
  g.fillStyle = '#ffb84d';
  g.beginPath(); g.arc(340, 120, 24, 0, 6.2832); g.fill();
  g.fillStyle = 'rgba(255,220,140,0.22)';
  g.beginPath(); g.arc(340, 120, 38, 0, 6.2832); g.fill();
  // township below
  const r = rng(88);
  for (let i = 0; i < 40; i++) {
    const x = r() * View.w, w = 10 + r() * 20, h = 6 + r() * 12, y = 158 + r() * 30;
    R(g, x, y, w, h, '#6a4a5f');
    if (r() < 0.4) R(g, x + 2, y + 2, 3, 3, '#ffd88a');
  }
  // ridge ground
  g.fillStyle = '#43321f';
  g.beginPath(); g.moveTo(0, 232); g.lineTo(View.w, 218); g.lineTo(View.w, View.h); g.lineTo(0, View.h); g.fill();
  R(g, 0, 230, View.w, 3, '#8a6f48');
  // cave mouth at left
  g.fillStyle = '#171209';
  g.beginPath(); g.moveTo(0, 60); g.lineTo(70, 90); g.lineTo(86, 160); g.lineTo(70, 232); g.lineTo(0, 240); g.fill();
  g.fillStyle = '#0a0805';
  g.beginPath(); g.moveTo(0, 110); g.lineTo(40, 130); g.lineTo(50, 180); g.lineTo(36, 232); g.lineTo(0, 236); g.fill();
}

function sceneGarden(g, t) {
  vGradient(g, 0, 0, View.w, View.h, [[0, '#7ab5d8'], [0.55, '#aad4e8'], [0.75, '#ffe9b8'], [1, '#ffe9b8']]);
  g.fillStyle = '#ffe49a';
  g.beginPath(); g.arc(396, 60, 20, 0, 6.2832); g.fill();
  // clouds drift
  for (let i = 0; i < 4; i++) {
    const x = ((i * 130 + t * 6) % (View.w + 80)) - 60;
    R(g, x, 28 + i * 16, 50, 6, 'rgba(255,255,255,0.7)');
    R(g, x + 10, 24 + i * 16, 30, 5, 'rgba(255,255,255,0.6)');
  }
  // far hedge + house edge
  R(g, 0, 150, View.w, 28, '#4a8040');
  speckles(g, 31, 110, { x: 0, y: 150, w: View.w, h: 28 }, '#3c6a34');
  R(g, 380, 96, 100, 60, '#c9897a');
  R(g, 374, 88, 112, 12, '#5a5f6a');
  R(g, 396, 116, 16, 14, '#ffd88a');
  R(g, 430, 116, 16, 40, '#3c3424');
  // lawn
  vGradient(g, 0, 178, View.w, 92, [[0, '#5a9a4a'], [1, '#3c6a34']]);
  speckles(g, 77, 160, { x: 0, y: 180, w: View.w, h: 88 }, '#4a8040');
  // garden beds + flowers
  for (let i = 0; i < 3; i++) {
    const y = 196 + i * 22;
    R(g, 30, y, 150, 8, '#5d4630');
    const r = rng(50 + i);
    for (let f = 0; f < 8; f++) {
      const fx = 36 + f * 18;
      R(g, fx, y - 6, 2, 6, '#3c6a34');
      const cols = ['#ff6b6b', '#ffd84d', '#e08aff', '#ff9a5a'];
      R(g, fx - 1, y - 9, 4, 4, cols[(f + i) % 4]);
    }
  }
  // fence
  for (let x = 0; x < View.w; x += 16) R(g, x, 158, 4, 20, '#8a6f48');
  R(g, 0, 162, View.w, 3, '#6b5436');
}

function sceneThursday(g, t) {
  // night, bushes, a lit window: Vaks films his bosses
  vGradient(g, 0, 0, View.w, View.h, [[0, '#0a0c1c'], [0.7, '#141630'], [1, '#1a1c38']]);
  speckles(g, 14, 40, { x: 0, y: 0, w: View.w, h: 110 }, '#cfd6ff');
  g.fillStyle = '#e8e4d4';
  g.beginPath(); g.arc(80, 50, 14, 0, 6.2832); g.fill();
  g.fillStyle = '#0a0c1c';
  g.beginPath(); g.arc(86, 46, 12, 0, 6.2832); g.fill();
  // house with the lit window (the bosses)
  R(g, 280, 90, 150, 120, '#2a2438');
  R(g, 272, 80, 166, 14, '#1c1826');
  R(g, 310, 116, 50, 36, '#ffd88a');
  R(g, 334, 116, 3, 36, '#2a2438');
  R(g, 310, 132, 50, 2, '#2a2438');
  // boss silhouettes in the window
  R(g, 318, 124, 8, 24, '#3c3040');
  R(g, 316, 120, 12, 7, '#3c3040');
  R(g, 344, 126, 8, 22, '#3c3040');
  R(g, 342, 122, 12, 7, '#3c3040');
  // ground + bushes foreground
  R(g, 0, 210, View.w, 60, '#10141c');
  for (let i = 0; i < 10; i++) {
    const x = i * 52 - 10;
    R(g, x, 196 + (i % 3) * 6, 56, 60, '#142018');
    R(g, x + 8, 190 + (i % 3) * 6, 36, 16, '#1c2c20');
  }
}

function sceneShop(g, t) {
  vGradient(g, 0, 0, View.w, View.h, [[0, '#171209'], [0.6, '#241c14'], [1, '#2c2218']]);
  speckles(g, 21, 70, { x: 0, y: 0, w: View.w, h: View.h }, '#332618');
  // nook arch
  g.fillStyle = '#0e0b06';
  g.beginPath(); g.moveTo(40, View.h); g.lineTo(70, 60); g.lineTo(170, 24); g.lineTo(310, 24); g.lineTo(410, 60); g.lineTo(440, View.h); g.fill();
  vGradient(g, 70, 50, 340, 170, [[0, '#241c14'], [1, '#3a2c1e']]);
  // warm lantern pools
  const flick = 0.9 + 0.1 * Math.sin(t * 9) * Math.sin(t * 3.7);
  for (const lx of [120, 360]) {
    const grad = g.createRadialGradient(lx, 120, 4, lx, 120, 70);
    grad.addColorStop(0, `rgba(255,184,77,${0.30 * flick})`);
    grad.addColorStop(1, 'rgba(255,184,77,0)');
    g.fillStyle = grad;
    g.fillRect(lx - 70, 50, 140, 160);
  }
  // floor
  R(g, 0, 216, View.w, 54, '#2c2218');
  R(g, 0, 216, View.w, 3, '#43321f');
  speckles(g, 8, 40, { x: 0, y: 220, w: View.w, h: 48 }, '#1d1710');
  // shelves with wares
  R(g, 84, 96, 70, 4, '#54482f');
  R(g, 90, 86, 6, 10, '#3f7a4a'); R(g, 102, 84, 6, 12, '#7a4a3a'); R(g, 116, 88, 8, 8, '#5ee0a0');
  R(g, 326, 96, 70, 4, '#54482f');
  R(g, 332, 88, 8, 8, '#d04a4a'); R(g, 348, 84, 6, 12, '#c9a86a'); R(g, 362, 86, 6, 10, '#8ae08a');
}
