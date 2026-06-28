// ============================================================
// All visuals are generated here at boot — pixel string maps,
// parameterized character compositors, palette-swapped variants
// — into runtime sprite sheets. No external image files.
// ============================================================

import { drawText } from './font.js';
import { queueHD } from './render.js';
import { IMO_HEAD_URI } from '../data/imo_photo.js';
import { VAKI_HEAD_URI } from '../data/vaki_photo.js';

export const Sprites = {}; // name -> { img, fw, fh, n }

// ---------------- helpers ----------------

function cv(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  return [c, g];
}

function sheet(name, frames) {
  const fw = frames[0].width, fh = frames[0].height;
  const [c, g] = cv(fw * frames.length, fh);
  frames.forEach((f, i) => g.drawImage(f, i * fw, 0));
  Sprites[name] = { img: c, fw, fh, n: frames.length };
}

function frame(w, h, fn) {
  const [c, g] = cv(w, h);
  fn(g);
  return c;
}

// pixel string map -> canvas ('.' and ' ' transparent)
function pix(str, pal) {
  const rows = str.trim().split('\n').map((r) => r.trim());
  const h = rows.length, w = Math.max(...rows.map((r) => r.length));
  const [c, g] = cv(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const ch = rows[y][x];
      if (ch === '.' || ch === ' ') continue;
      g.fillStyle = pal[ch] || '#ff00ff';
      g.fillRect(x, y, 1, 1);
    }
  }
  return c;
}

function rot90(src, quarters) {
  const q = ((quarters % 4) + 4) % 4;
  const w = q % 2 ? src.height : src.width;
  const h = q % 2 ? src.width : src.height;
  const [c, g] = cv(w, h);
  g.translate(w / 2, h / 2);
  g.rotate(q * Math.PI / 2);
  g.drawImage(src, -src.width / 2, -src.height / 2);
  return c;
}

function R(g, x, y, w, h, col) {
  g.fillStyle = col;
  g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

// draw a sprite frame; opts: { flip, alpha, scale }
export function draw(ctx, name, fr, x, y, opts = {}) {
  const s = Sprites[name];
  const n = s.n;
  const f = ((Math.floor(fr) % n) + n) % n;
  const sc = opts.scale || 1;
  x = Math.round(x); y = Math.round(y);
  const needSave = opts.flip || opts.alpha !== undefined;
  if (needSave) ctx.save();
  if (opts.alpha !== undefined) ctx.globalAlpha *= opts.alpha;
  if (opts.flip) {
    ctx.translate(x + s.fw * sc, y);
    ctx.scale(-1, 1);
    ctx.drawImage(s.img, f * s.fw, 0, s.fw, s.fh, 0, 0, s.fw * sc, s.fh * sc);
  } else {
    ctx.drawImage(s.img, f * s.fw, 0, s.fw, s.fh, x, y, s.fw * sc, s.fh * sc);
  }
  if (needSave) ctx.restore();
}

export function spr(name) { return Sprites[name]; }

// ---------------- palettes ----------------

export const PAL = {
  vaks: {
    skin: '#9a6a42', skinD: '#7a4f30', jersey: '#7ec8ff', jerseyD: '#549fdb',
    cap: '#2e3f96', capD: '#202c6e', pants: '#3f3f54', pantsD: '#32323f',
    shoe: '#23232e', shoeD: '#1a1a22', eye: '#ffd84d', dark: '#22222c',
  },
  granny: {
    // classic Elizabethan granny: pale skin, dark formal dress, white ruff,
    // grey hair under a bonnet
    dress: '#3a4d40', dressD: '#27362b', scarf: '#dcd6c6', scarfD: '#b9b3a2',
    skin: '#edcaac', apron: '#e8e2d2', shoe: '#1f1a26', eye: '#2a2030', white: '#ffffff',
    ruff: '#f6f2e8', hair: '#c7c1b3',
  },
  // original mist-creature tikolosh bodies (the head is Imo's photo)
  tiko: {
    h: '#43523f', b: '#243126', d: '#192219', e: '#aef2a8', m: '#101a10', g: '#7fe08a', w: '#3c5a40',
  },
  tikoIrie: {
    h: '#4f4366', b: '#332a4a', d: '#241d35', e: '#e0aaf2', m: '#170f24', g: '#b07fe0', w: '#54447a',
  },
  tikoShadow: {
    h: '#161c22', b: '#10151b', d: '#0b0f14', e: '#c8ffc8', m: '#05080a', g: '#1f2e26', w: '#141a20',
  },
  tikoShop: {
    h: '#6e5638', b: '#4a3a28', d: '#372b1d', e: '#ffd88a', m: '#241a0e', g: '#e0a85a', w: '#705a3a',
  },
  tikoBig: {
    h: '#3a4a3e', b: '#1d2a20', d: '#131c15', e: '#c2ffb8', m: '#0a120a', g: '#8fefa0', w: '#33503a',
  },
};

// ============================================================
// CHARACTER COMPOSITOR — VAKS (cell 26x32, faces right)
// ============================================================

function vleg(g, C, x, top, lift, back) {
  const pant = back ? C.pantsD : C.pants;
  const shoe = back ? C.shoeD : C.shoe;
  R(g, x, top, 3, 30 - lift - top, pant);
  R(g, x, 30 - lift, 4, 2, shoe);
}

function varm(g, C, x, sh, v) {
  if (v === 'up') {
    R(g, x, sh - 5, 2, 5, C.jerseyD);
    R(g, x, sh - 7, 2, 2, C.skin);
  } else {
    const sw = Math.max(-2, Math.min(2, v | 0));
    R(g, x, sh, 2, 5, C.jerseyD);
    R(g, x, sh + 5 + sw, 2, 2, C.skin);
  }
}

function vhead(g, C, hx, hy, p) {
  // face
  R(g, hx, hy + 2, 8, 7, C.skin);
  R(g, hx, hy + 8, 8, 1, C.skinD);
  // cap
  R(g, hx - 1, hy, 10, 2, C.cap);
  R(g, hx - 1, hy + 2, 10, 1, C.capD);
  R(g, hx + 8, hy + 2, 3, 1, C.cap); // brim (faces right)
  // eyes
  if (p.eyes === 'closed' || p.eyes === 'x') {
    R(g, hx + 3, hy + 4, 2, 1, C.dark);
    R(g, hx + 6, hy + 4, 2, 1, C.dark);
  } else {
    R(g, hx + 3, hy + 4, 2, 1, C.eye);
    R(g, hx + 6, hy + 4, 2, 1, C.eye);
  }
  if (p.mouth) R(g, hx + 5, hy + 7, 2, p.mouth === 'big' ? 2 : 1, C.dark);
  if (p.babalas) {
    R(g, hx + 1, hy + 6, 1, 1, '#9ab35a');       // green cheek
    R(g, hx - 1, hy + 3, 1, 2, '#9adcff');       // sweat drop
  }
}

function drawVaks(g, p = {}) {
  const C = PAL.vaks;
  const bob = p.bob | 0, cr = p.crouch | 0, lean = p.lean | 0;
  const top = 13 + bob + cr;
  const legTop = 23 + bob + cr;
  const L = p.legs || [{ dx: 0, lift: 0 }, { dx: 0, lift: 0 }];
  vleg(g, C, 9 + L[0].dx, legTop, L[0].lift, true);
  vleg(g, C, 14 + L[1].dx, legTop, L[1].lift, false);
  // torso
  R(g, 9 + lean, top, 8, legTop - top, C.jersey);
  R(g, 9 + lean, legTop - 1, 8, 1, C.jerseyD);
  R(g, 9 + lean, top, 1, legTop - top, C.jerseyD);
  // arms
  varm(g, C, 7 + lean, top + 1, p.armB !== undefined ? p.armB : 0);
  varm(g, C, 17 + lean, top + 1, p.armF !== undefined ? p.armF : 0);
  vhead(g, C, 9 + lean * 2, 4 + bob + cr, p);
}

// climb: back view, gripping a ladder
function drawVaksBack(g, p = {}) {
  const C = PAL.vaks;
  const bob = p.bob | 0;
  const legTop = 23 + bob;
  const L = p.legs || [{ dx: 0, lift: 0 }, { dx: 0, lift: 0 }];
  vleg(g, C, 9 + L[0].dx, legTop, L[0].lift, true);
  vleg(g, C, 14 + L[1].dx, legTop, L[1].lift, false);
  R(g, 9, 13 + bob, 8, legTop - 13 - bob, C.jersey);
  R(g, 16, 13 + bob, 1, legTop - 13 - bob, C.jerseyD);
  // arms
  varm(g, C, 7, 14 + bob, p.armB);
  varm(g, C, 17, 14 + bob, p.armF);
  // back of head: all cap + neck
  R(g, 9, 6 + bob, 8, 5, C.cap);
  R(g, 9, 11 + bob, 8, 1, C.capD);
  R(g, 10, 12 + bob, 6, 1, C.skin);
}

const VAKS_POSES = [
  /* 0 idle0 */ (g) => drawVaks(g, { armB: 0, armF: 0 }),
  /* 1 idle1 */ (g) => drawVaks(g, { bob: 1, armB: 1, armF: 1 }),
  /* 2 run0  */ (g) => drawVaks(g, { legs: [{ dx: -3, lift: 1 }, { dx: 3, lift: 0 }], armB: 2, armF: -2 }),
  /* 3 run1  */ (g) => drawVaks(g, { bob: 1, legs: [{ dx: -1, lift: 2 }, { dx: 0, lift: 1 }], armB: 1, armF: 0 }),
  /* 4 run2  */ (g) => drawVaks(g, { legs: [{ dx: 3, lift: 0 }, { dx: -3, lift: 1 }], armB: -2, armF: 2 }),
  /* 5 run3  */ (g) => drawVaks(g, { bob: 1, legs: [{ dx: 0, lift: 1 }, { dx: -1, lift: 2 }], armB: 0, armF: 1 }),
  /* 6 jump  */ (g) => drawVaks(g, { legs: [{ dx: -2, lift: 4 }, { dx: 1, lift: 2 }], armB: 'up', armF: -2, mouth: false }),
  /* 7 fall  */ (g) => drawVaks(g, { legs: [{ dx: -3, lift: 0 }, { dx: 2, lift: 3 }], armB: 'up', armF: 'up', mouth: true }),
  /* 8 climb0 */ (g) => drawVaksBack(g, { legs: [{ dx: -1, lift: 3 }, { dx: 1, lift: 0 }], armB: 'up', armF: 0 }),
  /* 9 climb1 */ (g) => drawVaksBack(g, { legs: [{ dx: -1, lift: 0 }, { dx: 1, lift: 3 }], armB: 0, armF: 'up' }),
  /* 10 land  */ (g) => drawVaks(g, { crouch: 2, legs: [{ dx: -3, lift: 0 }, { dx: 3, lift: 0 }], armB: 2, armF: 2 }),
  /* 11 celeb0 */ (g) => drawVaks(g, { armB: 'up', armF: 'up', mouth: 'big' }),
  /* 12 celeb1 */ (g) => drawVaks(g, { bob: 1, armB: 'up', armF: 'up', mouth: 'big', legs: [{ dx: -2, lift: 1 }, { dx: 2, lift: 1 }] }),
  /* 13 bab0  */ (g) => drawVaks(g, { lean: -1, bob: 1, eyes: 'closed', babalas: true, armB: 1, armF: 2, legs: [{ dx: -2, lift: 0 }, { dx: 1, lift: 0 }] }),
  /* 14 bab1  */ (g) => drawVaks(g, { lean: 1, bob: 1, eyes: 'closed', babalas: true, armB: 2, armF: 1, legs: [{ dx: -1, lift: 0 }, { dx: 2, lift: 0 }] }),
  /* 15 hurt  */ (g) => drawVaks(g, { lean: -1, eyes: 'x', mouth: 'big', armB: 'up', armF: 'up', legs: [{ dx: -3, lift: 1 }, { dx: 3, lift: 0 }] }),
  /* 16 meow  */ (g) => drawVaks(g, { eyes: 'closed', mouth: 'big', armB: 0, armF: 'up' }),
  // skin-up ritual (G): the joint itself is drawn live in player.draw so it can
  // burn down to the Rodger; these are just the body postures for each phase.
  /* 17 smkPull  */ (g) => drawVaks(g, { crouch: 1, eyes: 'open', mouth: false, armB: 2, armF: 2, legs: [{ dx: -1, lift: 0 }, { dx: 1, lift: 0 }] }),
  /* 18 smkRoll0 */ (g) => drawVaks(g, { crouch: 1, eyes: 'closed', mouth: false, armB: 1, armF: 1 }),
  /* 19 smkRoll1 */ (g) => drawVaks(g, { crouch: 1, bob: 1, eyes: 'closed', mouth: false, armB: 2, armF: 2 }),
  /* 20 smkPuff  */ (g) => drawVaks(g, { eyes: 'closed', mouth: false, armB: 0, armF: 'up' }),
];

export const VAKS = {
  idle: [0, 1], run: [2, 3, 4, 5], jump: 6, fall: 7, climb: [8, 9],
  land: 10, celeb: [11, 12], babalas: [13, 14], hurt: 15, meow: 16,
  smokePull: 17, smokeRoll: [18, 19], smokePuff: 20,
};

// ============================================================
// GRANNY (cell 20x26, faces right)
// ============================================================

function drawGranny(g, p = {}) {
  const C = PAL.granny;
  const bob = p.bob | 0, lean = p.lean | 0;
  const L = p.legs || [{ dx: 0, lift: 0 }, { dx: 0, lift: 0 }];
  // legs
  R(g, 8 + L[0].dx, 20, 2, 4 - L[0].lift, C.shoe);
  R(g, 12 + L[1].dx, 20, 2, 4 - L[1].lift, C.shoe);
  R(g, 8 + L[0].dx, 24 - L[0].lift, 3, 2, C.shoe);
  R(g, 12 + L[1].dx, 24 - L[1].lift, 3, 2, C.shoe);
  // dress (widens downward)
  R(g, 7 + lean, 10 + bob, 8, 4, C.dress);
  R(g, 6 + lean, 14 + bob, 10, 4, C.dress);
  R(g, 5 + lean, 18 + bob, 12, 3, C.dress);
  R(g, 5 + lean, 20 + bob, 12, 1, C.dressD);
  // apron
  R(g, 10 + lean, 13 + bob, 4, 6, C.apron);
  // arms (pumping)
  const sw = p.arm | 0;
  R(g, 15 + lean, 12 + bob + sw, 2, 2, C.skin);
  R(g, 5 + lean, 12 + bob - sw, 2, 2, C.skin);
  // white Elizabethan ruff collar at the neck
  R(g, 5 + lean, 9 + bob, 11, 2, C.ruff);
  R(g, 5 + lean, 10 + bob, 11, 1, C.scarfD);
  // head wrapped in a bonnet, grey hair peeking at the front
  R(g, 6 + lean, 3 + bob, 9, 7, C.scarf);
  R(g, 6 + lean, 9 + bob, 9, 1, C.scarfD);
  R(g, 4 + lean, 7 + bob, 2, 3, C.scarfD); // knot at back
  R(g, 11 + lean, 4 + bob, 4, 1, C.hair);  // grey hair at the hairline
  // face
  R(g, 11 + lean, 5 + bob, 4, 4, C.skin);
  if (p.stare) {
    R(g, 12 + lean, 6 + bob, 2, 2, C.white);
    R(g, 13 + lean, 7 + bob, 1, 1, C.eye);
  } else {
    R(g, 13 + lean, 6 + bob, 1, 1, C.eye);
  }
}

const GRANNY_POSES = [
  /* 0 idle  */ (g) => drawGranny(g, {}),
  /* 1 run0  */ (g) => drawGranny(g, { legs: [{ dx: -2, lift: 1 }, { dx: 2, lift: 0 }], arm: -1, lean: 1 }),
  /* 2 run1  */ (g) => drawGranny(g, { bob: 1, legs: [{ dx: 0, lift: 2 }, { dx: 0, lift: 1 }], arm: 0, lean: 1 }),
  /* 3 run2  */ (g) => drawGranny(g, { legs: [{ dx: 2, lift: 0 }, { dx: -2, lift: 1 }], arm: 1, lean: 1 }),
  /* 4 run3  */ (g) => drawGranny(g, { bob: 1, legs: [{ dx: 0, lift: 1 }, { dx: 0, lift: 2 }], arm: 0, lean: 1 }),
  /* 5 stare */ (g) => drawGranny(g, { stare: true, lean: 2 }),
];

export const GRANNY = { idle: 0, run: [1, 2, 3, 4], stare: 5 };

// ============================================================
// NPCs
// ============================================================

function drawTallman(g, p = {}) {
  const bob = p.bob | 0;
  // legs
  R(g, 6, 32, 2, 8, '#2c2c38'); R(g, 10, 32, 2, 8, '#2c2c38');
  R(g, 5, 39, 4, 2, '#1c1c26'); R(g, 9, 39, 4, 2, '#1c1c26');
  // long coat
  R(g, 5, 12 + bob, 8, 20, '#6a5a42');
  R(g, 5, 12 + bob, 1, 20, '#54482f');
  R(g, 8, 14 + bob, 1, 12, '#3c3424'); // seam
  // arms
  R(g, 3, 14 + bob, 2, 10, '#54482f');
  R(g, 13, 14 + bob, 2, 10 - (p.wave ? 6 : 0), '#54482f');
  if (p.wave) R(g, 13, 6 + bob, 2, 2, '#9a6a42');
  // head + beanie
  R(g, 5, 4 + bob, 8, 6, '#9a6a42');
  R(g, 5, 2 + bob, 8, 3, '#8a3c3c');
  R(g, 8, 6 + bob, 1, 1, '#22222c'); R(g, 11, 6 + bob, 1, 1, '#22222c');
  R(g, 9, 8 + bob, 2, 1, '#7a4f30');
}

function drawShorty(g, p = {}) {
  const bob = p.bob | 0;
  // legs
  R(g, 4, 20, 3, 4, '#2c2c38'); R(g, 9, 20, 3, 4, '#2c2c38');
  R(g, 3, 23, 5, 2, '#1c1c26'); R(g, 9, 23, 5, 2, '#1c1c26');
  // wide body
  R(g, 2, 10 + bob, 12, 10, '#5a8a5a');
  R(g, 2, 10 + bob, 1, 10, '#47704a');
  // arms
  R(g, 0, 12 + bob, 2, 6, '#47704a'); R(g, 14, 12 + bob, 2, 6, '#47704a');
  // head + bucket hat
  R(g, 4, 4 + bob, 8, 6, '#9a6a42');
  R(g, 4, 2 + bob, 8, 2, '#4a6a4a');
  R(g, 3, 4 + bob, 10, 1, '#3c573e');
  R(g, 7, 6 + bob, 1, 1, '#22222c'); R(g, 10, 6 + bob, 1, 1, '#22222c');
  R(g, 8, 8 + bob, 2, 1, '#7a4f30');
}

// ============================================================
// THE SHEBEEN CREW — the drunk Friday trio who try to get Vaks to
// drink (chase_begins cutscene). All red-eyed and tipsy: Masi (fat),
// Imo (a small boy), and Rasta (dreads + a rasta tam). Face right.
// ============================================================
const RED_EYE = '#ef3b3b';

function drawMasi(g, p = {}) {           // big, jovial, quart in hand (cell 21x42)
  const bob = p.bob | 0, skin = '#8a5a3a', vest = '#c2683a', vestD = '#9c4e2a';
  R(g, 5, 33, 4, 7, '#33323e'); R(g, 12, 33, 4, 7, '#33323e');           // stout legs
  R(g, 4, 39, 5, 2, '#1c1c26'); R(g, 12, 39, 5, 2, '#1c1c26');
  R(g, 2, 15 + bob, 17, 19, vest); R(g, 2, 15 + bob, 1, 19, vestD);      // round belly
  R(g, 3, 29 + bob, 15, 2, vestD);                                       // belly fold
  R(g, 0, 17 + bob, 3, 11, skin); R(g, 18, 17 + bob, 3, 11, skin);       // thick arms
  R(g, 18, 24 + bob, 3, 7, '#2f6a3f'); R(g, 19, 22 + bob, 1, 3, '#cdb36a'); // quart
  R(g, 5, 5 + bob, 11, 10, skin); R(g, 5, 3 + bob, 11, 3, '#1a140f');    // round head + hair
  R(g, 6, 14 + bob, 9, 2, '#7a4f30');                                    // double chin
  R(g, 7, 9 + bob, 2, 2, RED_EYE); R(g, 12, 9 + bob, 2, 2, RED_EYE);     // red drunk eyes
  R(g, 6, 11 + bob, 1, 1, vest); R(g, 14, 11 + bob, 1, 1, vest);         // flushed cheeks
  R(g, 9, 12 + bob, 3, 1, '#5a3520');                                    // grin
}

function drawImo(g, p = {}) {            // small boy, oversized soccer shirt (cell 14x24)
  const bob = p.bob | 0, skin = '#7a5232';
  R(g, 3, 18, 2, 5, '#3a4a6a'); R(g, 8, 18, 2, 5, '#3a4a6a');           // skinny legs
  R(g, 2, 22, 4, 2, '#1c1c26'); R(g, 7, 22, 4, 2, '#1c1c26');
  R(g, 1, 9 + bob, 11, 9, '#d2a23a'); R(g, 1, 9 + bob, 1, 9, '#a87f28');// baggy shirt
  R(g, 5, 9 + bob, 1, 9, '#a87f28');                                     // stripe
  R(g, 0, 10 + bob, 1, 6, skin); R(g, 12, 10 + bob, 1, 6, skin);        // thin arms
  R(g, 12, 13 + bob, 2, 5, '#2f6a3f');                                   // little bottle
  R(g, 2, 1 + bob, 9, 9, skin); R(g, 2, 0 + bob, 9, 2, '#1a140f');      // big kid head + hair
  R(g, 4, 4 + bob, 2, 2, RED_EYE); R(g, 8, 4 + bob, 2, 2, RED_EYE);     // big red eyes
  R(g, 5, 7 + bob, 3, 1, '#5a3520');                                    // grin
}

function drawRasta(g, p = {}) {          // dreads + rasta tam, mellow (cell 18x42)
  const bob = p.bob | 0, skin = '#6e4a2c', lock = '#241509';
  R(g, 5, 34, 3, 7, '#3a3a2a'); R(g, 10, 34, 3, 7, '#3a3a2a');          // legs
  R(g, 4, 40, 4, 2, '#1c1c26'); R(g, 10, 40, 4, 2, '#1c1c26');
  R(g, 4, 16 + bob, 10, 18, '#3a7a3a'); R(g, 4, 16 + bob, 1, 18, '#2c5e2e'); // green shirt
  R(g, 7, 16 + bob, 1, 18, '#d23a3a'); R(g, 9, 16 + bob, 1, 18, '#e2b83a'); R(g, 11, 16 + bob, 1, 18, '#e6e6e6'); // rasta stripes
  R(g, 2, 18 + bob, 2, 11, '#2c5e2e'); R(g, 14, 18 + bob, 2, 11, '#2c5e2e'); // arms
  // dreadlocks hanging down the sides + back
  R(g, 2, 9 + bob, 2, 15, lock); R(g, 14, 9 + bob, 2, 17, lock);
  R(g, 1, 13 + bob, 1, 9, lock); R(g, 16, 15 + bob, 1, 8, lock);
  R(g, 4, 19 + bob, 1, 6, lock); R(g, 13, 21 + bob, 1, 5, lock);
  R(g, 5, 7 + bob, 8, 8, skin);                                          // head
  R(g, 6, 11 + bob, 2, 1, RED_EYE); R(g, 11, 11 + bob, 2, 1, RED_EYE);   // red mellow eyes
  R(g, 8, 13 + bob, 3, 1, '#4a2c18');                                    // chill mouth
  // rasta tam (knitted, bulging over the dreads): green / gold / red
  R(g, 3, 2 + bob, 12, 5, '#1f8a36'); R(g, 3, 2 + bob, 12, 2, '#e2b83a'); R(g, 3, 1 + bob, 12, 1, '#d23a3a');
  R(g, 4, 0 + bob, 2, 1, '#d23a3a'); R(g, 3, 6 + bob, 12, 1, '#145a24'); // pom + brim
}

// ============================================================
// TSOTSIS — township gangsters (cell 20x28, face right; the call
// site flips them toward Vaks). Three kinds: the phone snatcher
// (knife), the gunman, and the viceroy pusher.
// ============================================================

const TSOTSI_PALS = {
  knife:   { skin: '#7a5232', hat: '#a83a3a', hatD: '#7c2a2a', top: '#e8e4da', topD: '#b8b3a6',
             pants: '#2c2c38', shoe: '#1c1c26', eye: '#22222c', prop: '#cfd6e2', propD: '#6b7390' },
  gun:     { skin: '#8a5a3a', hat: '#23232e', hatD: '#16161e', top: '#3a3a4a', topD: '#2c2c38',
             pants: '#32323f', shoe: '#1c1c26', eye: '#22222c', prop: '#23232e', propD: '#11111a' },
  viceroy: { skin: '#9a6a42', hat: '#4a6a4a', hatD: '#3c573e', top: '#7c3a4a', topD: '#5e2c38',
             pants: '#3f3f54', shoe: '#23232e', eye: '#c23a3a', prop: '#8a5a2a', propD: '#5e3c1c' },
};

function drawTsotsi(g, C, kind, p = {}) {
  const bob = p.bob | 0;
  if (p.stun) {
    // sat down hard, seeing stars
    R(g, 4, 20, 12, 6, C.pants);
    R(g, 3, 24, 5, 2, C.shoe); R(g, 12, 24, 5, 2, C.shoe);
    R(g, 5, 12, 10, 9, C.top);
    R(g, 5, 12, 1, 9, C.topD);
    R(g, 6, 5, 8, 7, C.skin);
    R(g, 6, 3, 8, 3, C.hat);
    R(g, 8, 8, 2, 1, C.eye); R(g, 11, 8, 2, 1, C.eye);
    R(g, 9, 0, 2, 2, '#ffe49a'); R(g, 13, 2, 1, 1, '#ffe49a'); R(g, 5, 1, 1, 1, '#ffe49a');
    return;
  }
  const L = p.legs || [{ dx: 0, lift: 0 }, { dx: 0, lift: 0 }];
  // legs
  R(g, 6 + L[0].dx, 19 + bob, 3, 7 - L[0].lift - bob, C.pants);
  R(g, 11 + L[1].dx, 19 + bob, 3, 7 - L[1].lift - bob, C.pants);
  R(g, 6 + L[0].dx, 26 - L[0].lift, 4, 2, C.shoe);
  R(g, 11 + L[1].dx, 26 - L[1].lift, 4, 2, C.shoe);
  // torso
  R(g, 5, 11 + bob, 10, 9, C.top);
  R(g, 5, 11 + bob, 1, 9, C.topD);
  // back arm
  R(g, 3, 13 + bob, 2, 6, C.topD);
  // head + headgear (knife: bandana, gun: beanie, viceroy: bucket hat)
  R(g, 6, 4 + bob, 8, 7, C.skin);
  R(g, 6, 2 + bob, 8, 3, C.hat);
  if (kind === 'viceroy') R(g, 5, 4 + bob, 10, 1, C.hatD);
  else R(g, 6, 4 + bob, 8, 1, C.hatD);
  R(g, 9, 7 + bob, 1, 1, C.eye); R(g, 12, 7 + bob, 1, 1, C.eye);
  R(g, 10, 9 + bob, 3, 1, '#5e3c28'); // mouth
  // front arm + the goods
  const raise = p.arm === 'up' ? 4 : 0;
  R(g, 15, 13 + bob - raise, 2, 5, C.topD);
  R(g, 15, 18 + bob - raise, 2, 2, C.skin);
  if (kind === 'knife') {
    R(g, 17, 18 + bob - raise, 3, 1, C.prop);   // blade
    R(g, 16, 19 + bob - raise, 2, 1, C.propD);  // hilt
  } else if (kind === 'gun') {
    R(g, 17, 18 + bob - raise, 3, 2, C.prop);   // barrel + slide
    R(g, 17, 20 + bob - raise, 1, 2, C.propD);  // grip
  } else {
    R(g, 17, 15 + bob - raise, 2, 5, C.prop);   // viceroy bottle
    R(g, 17, 13 + bob - raise, 1, 2, C.propD);  // bottle neck
  }
}

export const TSOTSI = { idle: 0, walk: [1, 2], stun: 3, aim: 4 };

// ============================================================
// TIKOLOSH (string map, 2 float frames, palette variants)
// ============================================================

// The Tikolosh: the ORIGINAL horned mist-creature body (face rows
// blanked) with the ACTUAL photo of Imo's head — embedded as a data
// URI in src/data/imo_photo.js — drawn smoothly on top. Cell 20x26.
// body keys: h horns, b body, d shade, g glow nubs, w feet
const TIKO_A = `
..hh............hh..
..hhh..........hhh..
...hhh........hhh...
....hh........hh....
.....hbbbbbbbbh.....
....bbbbbbbbbbbb....
...bbbbbbbbbbbbbb...
...bbbbbbbbbbbbbb...
...bbbbbbbbbbbbbb...
...bbbbbbbbbbbbbb...
...bbbbbbbbbbbbbb...
...bbbbbbbbbbbbbb...
...dbbbbbbbbbbbbd...
..gbbbbbbbbbbbbbbg..
..gbbbbbbbbbbbbbbg..
...dbbbbbbbbbbbbd...
...dbbbbbbbbbbbbd...
....dbbbbbbbbbbd....
....dbbbbbbbbbbd....
.....dbbbbbbbbd.....
.....wdbbbbbbdw.....
......wdbbbbdw......
......w.dbbd.w......
....w....ww....w....
.........ww.........
..........w.........
`;

const TIKO_B = `
..hh............hh..
..hhh..........hhh..
...hhh........hhh...
....hh........hh....
.....hbbbbbbbbh.....
....bbbbbbbbbbbb....
...bbbbbbbbbbbbbb...
...bbbbbbbbbbbbbb...
...bbbbbbbbbbbbbb...
...bbbbbbbbbbbbbb...
...bbbbbbbbbbbbbb...
...bbbbbbbbbbbbbb...
..gdbbbbbbbbbbbbdg..
.g.bbbbbbbbbbbbbb.g.
.g.bbbbbbbbbbbbbb.g.
...dbbbbbbbbbbbbd...
...dbbbbbbbbbbbbd...
....dbbbbbbbbbbd....
....dbbbbbbbbbbd....
.....dbbbbbbbbd.....
......dbbbbbbd......
.....w.dbbbbd.w.....
......w.dbbd.w......
.........ww....w....
....w....ww.........
.........w..........
`;

// the decoded photos + per-variant tinted masters (96px, built once in
// initSprites; boss/shop draw these directly for a crisp large head)
const ImoHeads = {};

// variant heads: which photo + an optional tint painted source-atop.
// Everyone is Imo; the shopkeeper is Vaki, as himself.
const TIKO_TINTS = {
  tiko: { who: 'imo', tint: null },                          // the photo, looming in the mist
  tiko_irie: { who: 'imo', tint: 'rgba(176,127,224,0.45)' }, // irie ghost
  tiko_shadow: { who: 'imo', tint: 'rgba(8,12,16,0.85)' },   // silhouette (glow eyes overlaid by entity)
  tiko_shop: { who: 'vaki', tint: null },                    // Vaki keeps shop, actual photo
  tiko_big: { who: 'imo', tint: null },                      // the boss IS the photo
};

function buildPhotoHeads(imgs) {
  for (const [name, spec] of Object.entries(TIKO_TINTS)) {
    const img = imgs[spec.who];
    if (!spec.tint) {
      // the NORMAL photo, byte-for-byte: drawn straight from the
      // decoded original at native resolution, zero processing
      ImoHeads[name] = img;
      continue;
    }
    // gameplay-state tints (irie ghost, shadow silhouette) need one
    // canvas pass; keep generous resolution so they stay sharp
    const k = Math.min(1, 768 / Math.max(img.width, img.height));
    const w = Math.round(img.width * k), h = Math.round(img.height * k);
    const [c, g] = cv(w, h);
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, 0, 0, w, h);
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = spec.tint;
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-over';
    ImoHeads[name] = c;
  }
}

// draw the actual photo head in TRUE HD: queued past the pixel buffer
// and rendered on the display canvas after the upscale, so it stays a
// normal photograph at screen resolution. x/y/w/h is the target box in
// buffer coords; the photo keeps its own aspect ratio (contained,
// bottom-anchored so it sits on the body).
export function drawImoHead(ctx, variant, x, y, w, h, flip, alpha) {
  const img = ImoHeads[variant] || ImoHeads.tiko;
  const k = Math.min(w / img.width, h / img.height);
  const dw = img.width * k, dh = img.height * k;
  queueHD(img, x + (w - dw) / 2, y + (h - dh), dw, dh, { flip, alpha });
}

// dialogue portraits that are photo heads (cutscenes draw these HD)
export const PHOTO_FACES = { face_tiko: 'tiko_big', face_shop: 'tiko_shop' };

// head placement on the 20x26 tiko cell. Imo's photo is drawn large and
// looming: the box is grown ~1.6x around its old bottom-centre anchor
// (centre x = x + w/2 = 10, baseline y = y + h = 16, both unchanged) so
// the bigger head stays pinned to the same spot on the body — it now
// overhangs the horns and crowns the mist body. Every call site scales
// this by the sprite scale, so all tikoloshes enlarge together.
export const TIKO_HEAD_RECT = { x: -1, y: -6, w: 22, h: 22 };

// ============================================================
// SMALL CREATURES & PICKUPS (string maps)
// ============================================================

const RAT_PAL = { r: '#8a8694', d: '#6b6776', e: '#1c1822', n: '#d49a9a', t: '#b58a8a' };

const RAT_A = `
..............
.......rrrr...
.t....rrrrrr..
..t..rrrrrrr..
...ttrrrrrrre.
.....rrrrrrrn.
.....rdrrrdr..
....rr....rr..
`;

const RAT_B = `
..............
.......rrrr...
..t...rrrrrr..
.t...rrrrrrr..
...ttrrrrrrre.
.....rrrrrrrn.
.....rrdrdrr..
......rr.rr...
`;

const RAT_SQ = `
..............
..............
..............
..............
..............
.t.e........e.
..trrrrrrrrrr.
.rrrrrrrrrrrr.
`;

const BOTTLE = `
...kk..
...kk..
..ggg..
..glg..
.ggllg.
.gglgg.
.gglgg.
.gglgg.
.ggllg.
.gglgg.
.ggggg.
.ggggg.
..ggg..
.......
`;
const BOTTLE_PAL = { k: '#c9a86a', g: '#3f7a4a', l: '#7fc98a' };

const SUSHI = `
.oOoOoOoOo..
oOoOoOoOoOo.
rrrrrrrrrrr.
rrrrrrrrrrr.
nnnnnnnnnnn.
nrrrrrrrrrn.
.nnnnnnnnn..
`;
const SUSHI_PAL = { o: '#ff9a5a', O: '#ffb88a', r: '#f0ead8', n: '#1d2a1e' };

const CEPPY = `
...cccc...
..cccccc..
.cccccccc.
.cCCCCCCc.
.dddddddd.
.....bbbbb
`;
const CEPPY_PAL = { c: '#d04a4a', C: '#a83a3a', d: '#7c2a2a', b: '#5c1f1f' };

// cannabis leaf: SEVEN separate radiating spikes (not a filled blob) —
// centre spike up, an upper pair, a side pair, and a lower pair, each a
// tapered pointed leaflet with transparent gaps between them. Dark teal
// outline (o), green body (g), bright mint vein highlights (l).
const WEED = `
......ooo......
......olo......
.ooo..olo..ooo.
.oloo.olo.oolo.
.ollooolooollo.
.oollooloolloo.
..ooloolooloo..
...ollolollo...
ooooolglglooooo
ollloglllgolllo
ooolllllllllooo
..oooollloooo..
..ooollgllooo..
.oollooooolloo.
.olloo...oollo.
`;
const WEED_PAL = { o: '#15333c', g: '#46a043', l: '#93d568' };

// Penis snake: phallic head + green slithering body, 2-frame tongue flicker
const PSNAKE_BODY = `
....DDDDD.....
...DhhhhhD....
...DhhhssD....
...DhhhssD....
...DhhhhhD....
...DDDDDDD....
....DssssD....
....DssssD....
.....DssD.....
.....DGGD.....
....DGGGgD....
...DgGGGGgD...
...DgGGGGgD...
....DGGGgD....
.....DGGgD....
......DGD.....
.....DGGgD....
....DgGGGGD...
....DgGGGGD...
.....DGGgD....
......DGD.....
.......D......
`;
const PSNAKE_TONGUE = `
....DDDDD.....
...DhhhhhD....
...DhhhssD....
...DhhhssD....
...DhhhhhD....
...DDDDDDD....
....DssssD....
....DssssD....
.....DssD.....
.....DGGD.....
....DGGGgD....
...DgGGGGgD...
...DgGGGGgD...
....DGGGgD....
.....DGGgD....
......DGD.....
.....DGGgD....
....DgGGGGD...
....DgGGGGD...
.....DGGgD....
......DtD.....
.....Dt.tD....
`;
const PSNAKE_PAL = { D: '#2a1810', h: '#f0c0a8', s: '#c89070', G: '#388c28', g: '#64cc44', t: '#cc2828' };

// Mano: the South African 100 Rand note — blue banknote, dark frame,
// big "100" on the left field, Mandela portrait on the right, green
// accent strip along the bottom. Rounded corners.
const MANO = `
.eeeeeeeeeeeeeeeeeeeeee.
ebbbbbbbbbbbbbmmbbhhhbbe
ebbbbbbbbbbbbbmsbhhhhhbe
ebbbbbbbbbbbbbmmbhkkkhbe
ebbnbbnnnbnnnbmmbkkkkkbe
ebnnbbnbnbnbnbmsbkKkKkbe
ebbnbbnbnbnbnbmmbkkkkkbe
ebbnbbnbnbnbnbmsbkKKKkbe
ebnnnbnnnbnnnbmmbwkkkwbe
ebbbbbbbbbbbbbmmbswswsbe
ebbgggggggggbbggbsssssbe
.eeeeeeeeeeeeeeeeeeeeee.
`;
const MANO_PAL = {
  e: '#26306e', b: '#aebfe0', m: '#8294c4', n: '#1d2660',
  g: '#3f8a5b', k: '#b89066', K: '#8a6843', h: '#6f6a62',
  s: '#33406b', w: '#e8eef8',
};

// the other denominations reuse the same note design, recolored:
// R10 green, R20 light brown, R50 red (R100 keeps the blue above)
const NOTE_PALS = {
  r10: {
    e: '#1f4a2a', b: '#b9d8b4', m: '#8cba8e', n: '#163a1e',
    g: '#2e6b38', k: '#b89066', K: '#8a6843', h: '#6f6a62',
    s: '#2c4a33', w: '#eef8ee',
  },
  r20: {
    e: '#5e4426', b: '#dcc7a4', m: '#bfa37c', n: '#4a3318',
    g: '#8a6a40', k: '#b89066', K: '#8a6843', h: '#6f6a62',
    s: '#54422a', w: '#f8f0e0',
  },
  r50: {
    e: '#6e1f1c', b: '#e3b3aa', m: '#c98a80', n: '#54110e',
    g: '#a03c34', k: '#b89066', K: '#8a6843', h: '#6f6a62',
    s: '#5c2622', w: '#f8e8e4',
  },
};

// the R2 kudu coin (silver rounded square, kudu left, big 2 right)
const COIN_R2 = `
..ssssssss..
.slllllllls.
sllkdlll222s
slkkllllll2s
slkkklll222s
slkkklll2lls
sllkklll222s
slllklllllls
.slllllllls.
..ssssssss..
`;
const COIN_R2_PAL = { s: '#8a8f96', l: '#c9ced6', k: '#6d737c', d: '#565b63', 2: '#5a5f68' };

// Rattex box (from the photo): red DOOM band, yellow box, red RATTEX
// lettering band, deadly pellets, grey rat
const RATTEX = `
rrrrrrrrrrrr
rwrwrwrwrrrr
yyyyyyyyyyyy
yRRRRRRRRRRy
yRRRRRRRRRRy
yyyyyyyyyyyy
yrryyyygGGyy
yrryyyggggGy
yyryyggggggy
yrryygggggwy
yrryyGgggggy
yyyyyGGyGGyy
yyyyyyyyyyyy
YYYYYYYYYYYY
`;
const RATTEX_PAL = {
  r: '#d61f1f', R: '#b01212', w: '#f4f4f0',
  y: '#f2c91e', Y: '#c79f12',
  g: '#9aa0a6', G: '#5d646b',
};

const LANTERN_A = `
....hh....
.....h....
...ffff...
..f....f..
..f.aa.f..
..f.AA.f..
..f.aa.f..
..f....f..
...ffff...
...ffff...
`;
const LANTERN_B = `
....hh....
.....h....
...ffff...
..f.aa.f..
..faAAaf..
..fAAAAf..
..faAAaf..
..f.aa.f..
...ffff...
...ffff...
`;
const LANTERN_PAL = { h: '#6b5436', f: '#3a3026', a: '#ffb84d', A: '#ffe49a' };

// ============================================================
// init — build every sheet
// ============================================================

let built = false;

export async function initSprites() {
  if (built) return;
  built = true;

  // decode the embedded photo heads first (data URIs, instant)
  const imo = new Image(); imo.src = IMO_HEAD_URI;
  const vaki = new Image(); vaki.src = VAKI_HEAD_URI;
  await Promise.all([imo.decode(), vaki.decode()]);
  buildPhotoHeads({ imo, vaki });

  // Vaks
  sheet('vaks', VAKS_POSES.map((fn) => frame(26, 32, fn)));

  // Vaks sleeping (cold open) — lying down, cap still on
  sheet('vaks_sleep', [0, 1].map((i) => frame(34, 16, (g) => {
    const C = PAL.vaks;
    R(g, 2, 6 + i, 8, 7, C.skin);               // head
    R(g, 2, 4 + i, 8, 3, C.cap);
    R(g, 4, 9 + i, 2, 1, C.dark);                // closed eye
    R(g, 10, 7 + i, 14, 6, C.jersey);            // body
    R(g, 10, 12 + i, 14, 1, C.jerseyD);
    R(g, 24, 8 + i, 7, 4, C.pants);              // legs
    R(g, 30, 8 + i, 3, 5, C.shoe);
  })));

  // Vaks raking (title + ending)
  sheet('vaks_rake', [0, 1].map((i) => frame(38, 34, (g) => {
    drawVaks(g, { lean: i ? 1 : 0, bob: i, armF: 2, armB: 1, eyes: 'open', mouth: false });
    // rake: pole from hands to ground, head with tines
    g.fillStyle = '#8a6f48';
    for (let s = 0; s < 10; s++) R(g, 20 + s + i, 20 - i + s, 1, 1, '#8a6f48');
    R(g, 29 + i, 30, 8, 2, '#6b5436');
    for (let t = 0; t < 4; t++) R(g, 29 + i + t * 2, 32, 1, 2, '#54482f');
  })));

  // Granny
  sheet('granny', GRANNY_POSES.map((fn) => frame(20, 26, fn)));
  sheet('granny_faint', [frame(28, 12, (g) => {
    const C = PAL.granny;
    R(g, 1, 3, 7, 7, C.scarf);                   // head
    R(g, 3, 6, 3, 3, C.skin);
    R(g, 4, 7, 2, 1, C.eye);                     // closed eyes
    R(g, 8, 5, 13, 6, C.dress);                  // body
    R(g, 11, 5, 4, 6, C.apron);
    R(g, 21, 6, 4, 2, C.shoe); R(g, 21, 9, 4, 2, C.shoe);
  })]);

  // NPCs
  sheet('tallman', [frame(18, 42, (g) => drawTallman(g, {})),
                    frame(18, 42, (g) => drawTallman(g, { bob: 1, wave: true }))]);
  sheet('shorty', [frame(16, 26, (g) => drawShorty(g, {})),
                   frame(16, 26, (g) => drawShorty(g, { bob: 1 }))]);
  // the shebeen crew (chase_begins): Masi (fat), Imo (small boy), Rasta (dreads + tam)
  sheet('masi',  [frame(21, 42, (g) => drawMasi(g, {})),
                  frame(21, 42, (g) => drawMasi(g, { bob: 1 }))]);
  sheet('imo',   [frame(14, 24, (g) => drawImo(g, {})),
                  frame(14, 24, (g) => drawImo(g, { bob: 1 }))]);
  sheet('rasta', [frame(18, 42, (g) => drawRasta(g, {})),
                  frame(18, 42, (g) => drawRasta(g, { bob: 1 }))]);

  // township tsotsis (W2 gangsters) + the gunman's bullet
  for (const kind of ['knife', 'gun', 'viceroy']) {
    const C = TSOTSI_PALS[kind];
    sheet('tsotsi_' + kind, [
      frame(20, 28, (g) => drawTsotsi(g, C, kind, {})),
      frame(20, 28, (g) => drawTsotsi(g, C, kind, { legs: [{ dx: -2, lift: 1 }, { dx: 2, lift: 0 }] })),
      frame(20, 28, (g) => drawTsotsi(g, C, kind, { bob: 1, legs: [{ dx: 2, lift: 0 }, { dx: -2, lift: 1 }] })),
      frame(20, 28, (g) => drawTsotsi(g, C, kind, { stun: true })),
      frame(20, 28, (g) => drawTsotsi(g, C, kind, { arm: 'up' })),
    ]);
  }
  sheet('tsotsi_bullet', [frame(4, 3, (g) => {
    R(g, 0, 0, 3, 3, '#2c2c38');
    R(g, 3, 1, 1, 1, '#ffd84d'); // tracer tip (faces right, flipped in flight)
  })]);

  // Tikolosh variants: body-only sheets — the actual photo head is
  // drawn over them in HD via drawImoHead at every call site
  for (const [name, pal] of [
    ['tiko', PAL.tiko], ['tiko_irie', PAL.tikoIrie], ['tiko_shadow', PAL.tikoShadow],
    ['tiko_shop', PAL.tikoShop], ['tiko_big', PAL.tikoBig],
  ]) {
    sheet(name, [pix(TIKO_A, pal), pix(TIKO_B, pal)]);
  }

  // Creatures + hazards + pickups
  sheet('rat', [pix(RAT_A, RAT_PAL), pix(RAT_B, RAT_PAL)]);
  sheet('rat_squish', [pix(RAT_SQ, RAT_PAL)]);
  const bottle = pix(BOTTLE, BOTTLE_PAL);
  sheet('bottle', [bottle, rot90(bottle, 1), rot90(bottle, 2), rot90(bottle, 3)]);
  sheet('sushi', [pix(SUSHI, SUSHI_PAL)]);
  sheet('ceppy', [pix(CEPPY, CEPPY_PAL)]);
  // money: R2 kudu coin + the four notes (R100 = the hand-drawn MANO art).
  // The art bakes "100" into the numeral block; lower notes clear it and
  // stamp their own denomination with a 3x5 mini font.
  const MINI_DIGITS = {
    0: ['###', '#.#', '#.#', '#.#', '###'],
    1: ['.#.', '##.', '.#.', '.#.', '###'],
    2: ['###', '..#', '###', '#..', '###'],
    5: ['###', '#..', '###', '..#', '###'],
  };
  const noteFrame = (pal, label) => {
    const c = pix(MANO, pal);
    if (label) {
      const g = c.getContext('2d');
      g.fillStyle = pal.b;
      g.fillRect(2, 4, 12, 5);                  // clear the baked "100"
      g.fillStyle = pal.n;
      let dx = 3;
      for (const ch of label) {
        MINI_DIGITS[ch].forEach((row, yy) => [...row].forEach((cc, xx) => {
          if (cc === '#') g.fillRect(dx + xx, 4 + yy, 1, 1);
        }));
        dx += 4;
      }
    }
    return c;
  };
  sheet('r2', [pix(COIN_R2, COIN_R2_PAL)]);
  sheet('note_r100', [noteFrame(MANO_PAL, null)]);
  sheet('note_r10', [noteFrame(NOTE_PALS.r10, '10')]);
  sheet('note_r20', [noteFrame(NOTE_PALS.r20, '20')]);
  sheet('note_r50', [noteFrame(NOTE_PALS.r50, '50')]);
  sheet('weed', [pix(WEED, WEED_PAL)]);
  sheet('penis_snake', [pix(PSNAKE_BODY, PSNAKE_PAL), pix(PSNAKE_TONGUE, PSNAKE_PAL)]);
  sheet('rattex', [pix(RATTEX, RATTEX_PAL)]);
  // ability caps sold in the shop
  sheet('hat_propeller', [frame(12, 12, (g) => {
    R(g, 5, 0, 2, 2, '#54545f');                 // stalk
    R(g, 1, 1, 4, 2, '#d64545'); R(g, 7, 1, 4, 2, '#ffd84d'); // rotor blades
    R(g, 2, 4, 8, 3, '#2e7fd6');                 // dome
    R(g, 1, 7, 10, 2, '#d64545');                // band
  })]);
  sheet('hat_beanie', [frame(12, 12, (g) => {
    R(g, 5, 0, 2, 2, '#ffd84d');                 // pom
    R(g, 3, 2, 6, 2, '#8a3c3c');                 // crown
    R(g, 2, 4, 8, 3, '#8a3c3c');
    R(g, 1, 7, 10, 3, '#6d2e2e');                // fold band
  })]);
  sheet('hat_chiefs', [frame(12, 12, (g) => {
    R(g, 2, 2, 8, 3, '#1c1c22');                 // black crown
    R(g, 1, 5, 10, 3, '#ffb84d');                // amakhosi gold
    R(g, 7, 8, 5, 2, '#1c1c22');                 // brim
  })]);
  sheet('lantern', [pix(LANTERN_A, LANTERN_PAL), pix(LANTERN_B, LANTERN_PAL)]);

  // Checkpoint lantern: the cave lantern, unlit until Vaks passes it,
  // then it burns brighter (frames: 0 unlit, 1-2 lit flicker)
  const CP_UNLIT = { h: '#6b5436', f: '#3a3026', a: '#4a4338', A: '#5a5244' };
  const CP_LIT   = { h: '#6b5436', f: '#3a3026', a: '#ffcf6a', A: '#fff4c8' };
  sheet('cp_lantern', [pix(LANTERN_A, CP_UNLIT), pix(LANTERN_A, CP_LIT), pix(LANTERN_B, CP_LIT)]);

  // Payphone (ringing variant shifts handset)
  sheet('payphone', [0, 1].map((i) => frame(16, 28, (g) => {
    R(g, 1, 0, 14, 24, '#2e55b0');
    R(g, 1, 0, 14, 2, '#1d3a80');
    R(g, 3, 4, 10, 6, '#0e1626');               // screen
    R(g, 4, 5, 8, 1, '#5ee0a0');
    R(g, 5, 12, 6, 8, '#cfd4e0');               // keypad
    g.fillStyle = '#2a3040';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) R(g, 6 + c * 3, 13 + r * 2, 1, 1, '#2a3040');
    R(g, 1 - 0, 6 + (i ? -2 : 0), 2, 10, '#16203a'); // handset
    R(g, 1, 24, 14, 4, '#1d3a80');
  })));

  // TV in a window showing the match (Kaizer Chiefs easter egg)
  sheet('tv', [0, 1].map((i) => frame(20, 16, (g) => {
    R(g, 0, 0, 20, 16, '#54482f');               // window frame
    R(g, 2, 2, 16, 12, '#0c0c14');
    R(g, 3, 3, 14, 10, '#2a6a2a');               // pitch
    R(g, 3, 7, 14, 1, '#3f8a3f');                // halfway line
    R(g, 5 + i * 2, 5, 1, 2, '#ffb84d');         // gold shirts
    R(g, 12 - i, 9, 1, 2, '#ffb84d');
    R(g, 8 + i, 6, 1, 2, '#e0e0e0');             // opposition
    R(g, 10 + i * 3, 8, 1, 1, '#ffffff');        // ball
  })));

  // Taxi (kasi minibus)
  sheet('taxi', [frame(56, 26, (g) => {
    R(g, 2, 4, 52, 14, '#e8e4da');
    R(g, 2, 10, 52, 3, '#ffb84d');               // stripe
    R(g, 6, 6, 10, 5, '#9adcff'); R(g, 19, 6, 10, 5, '#9adcff');
    R(g, 32, 6, 10, 5, '#9adcff'); R(g, 45, 6, 8, 5, '#9adcff');
    R(g, 2, 16, 52, 3, '#b8b4aa');
    R(g, 10, 18, 8, 7, '#1c1c26'); R(g, 40, 18, 8, 7, '#1c1c26');
    R(g, 12, 20, 4, 3, '#54545f'); R(g, 42, 20, 4, 3, '#54545f');
  })]);

  // Garden gate / plaas arch (W2 final exit)
  sheet('gate', [frame(44, 48, (g) => {
    R(g, 2, 8, 5, 40, '#6b5436'); R(g, 37, 8, 5, 40, '#6b5436');
    R(g, 0, 2, 44, 7, '#8a6f48');
    R(g, 0, 9, 44, 2, '#54482f');
    g.fillStyle = '#4a9a3a';                      // creeper plants
    for (let i = 0; i < 16; i++) R(g, 1 + ((i * 7) % 42), 3 + ((i * 3) % 5), 2, 2, i % 3 ? '#4a9a3a' : '#6ac24a');
    R(g, 12, 14, 20, 9, '#e8e4da');               // PLAAS sign
  })]);

  // Shop pedestal
  sheet('pedestal', [frame(18, 14, (g) => {
    R(g, 3, 0, 12, 3, '#8a4a4a');
    R(g, 4, 3, 10, 9, '#6b5436');
    R(g, 4, 3, 10, 1, '#54482f');
    R(g, 2, 12, 14, 2, '#54482f');
  })]);

  // Rake prop (ending pickup)
  sheet('rake', [frame(16, 20, (g) => {
    for (let s = 0; s < 12; s++) R(g, 3 + s, 16 - s, 1, 1, '#8a6f48');
    R(g, 0, 16, 8, 2, '#6b5436');
    for (let t = 0; t < 4; t++) R(g, t * 2, 18, 1, 2, '#54482f');
  })]);

  // Washing line (sways)
  sheet('washing', [0, 1].map((i) => frame(46, 16, (g) => {
    R(g, 0, 2, 46, 1, '#9a9aa8');
    R(g, 4 + i, 3, 7, 8, '#7ec8ff');
    R(g, 17 - i, 3, 7, 10, '#d04a4a');
    R(g, 30 + i, 3, 7, 7, '#e8e4da');
    R(g, 40 - i, 3, 4, 6, '#ffd84d');
  })));

  // Billboard (KAIZER CHIEFS)
  sheet('billboard', [frame(52, 36, (g) => {
    R(g, 6, 28, 4, 8, '#54545f'); R(g, 42, 28, 4, 8, '#54545f');
    R(g, 0, 0, 52, 28, '#1c1c22');
    R(g, 2, 2, 48, 24, '#caa53d');
    drawText(g, 'KAIZER', 26, 5, { color: '#1c1c22', align: 'center' });
    drawText(g, 'CHIEFS', 26, 14, { color: '#1c1c22', align: 'center' });
  })]);

  // School building
  sheet('school', [frame(70, 48, (g) => {
    R(g, 0, 14, 70, 34, '#b5736a');
    R(g, 0, 12, 70, 4, '#8a5650');
    R(g, -1, 6, 72, 8, '#5a5f6a');
    for (let i = 0; i < 4; i++) R(g, 6 + i * 17, 22, 9, 9, '#cfe2ec');
    R(g, 30, 34, 12, 14, '#54482f');
    R(g, 20, 16, 30, 9, '#e8e4da');               // sign
    drawText(g, 'SCHOOL', 35, 17, { color: '#2a2438', align: 'center' });
  })]);

  // Arrows + space key (boss prompts, menus)
  const arrowDirs = ['right', 'left', 'up', 'down'];
  sheet('arrow', arrowDirs.map((dir) => frame(12, 12, (g) => {
    g.fillStyle = '#ffffff';
    for (let i = 0; i < 6; i++) {
      const len = 11 - i * 2;
      if (dir === 'right') R(g, 2 + i, 1 + i, 1, len, '#ffffff');
      if (dir === 'left') R(g, 9 - i, 1 + i, 1, len, '#ffffff');
      if (dir === 'up') R(g, 1 + i, 9 - i, len, 1, '#ffffff');
      if (dir === 'down') R(g, 1 + i, 2 + i, len, 1, '#ffffff');
    }
  })));
  sheet('key_space', [frame(26, 10, (g) => {
    R(g, 1, 0, 24, 10, '#3a3a4e');
    R(g, 2, 1, 22, 8, '#e8e4da');
    R(g, 6, 4, 14, 2, '#3a3a4e');
  })]);

  // Portraits (dialogue boxes)
  sheet('face_vaks', [frame(24, 24, (g) => {
    const C = PAL.vaks;
    R(g, 4, 8, 16, 14, C.skin);
    R(g, 4, 20, 16, 4, C.jersey);
    R(g, 3, 3, 18, 4, C.cap);
    R(g, 3, 7, 18, 2, C.capD);
    R(g, 18, 8, 5, 2, C.cap);
    R(g, 7, 12, 3, 2, C.eye); R(g, 14, 12, 3, 2, C.eye);
    R(g, 8, 13, 1, 1, C.dark); R(g, 15, 13, 1, 1, C.dark);
    R(g, 10, 17, 5, 1, C.dark);
    R(g, 4, 19, 16, 1, C.skinD);
  })]);
  sheet('face_granny', [frame(24, 24, (g) => {
    const C = PAL.granny;
    R(g, 3, 3, 18, 18, C.scarf);
    R(g, 3, 19, 18, 2, C.scarfD);
    R(g, 7, 8, 11, 10, C.skin);
    R(g, 9, 11, 2, 2, C.eye); R(g, 14, 11, 2, 2, C.eye);
    R(g, 10, 15, 5, 1, C.eye);
    R(g, 1, 14, 3, 4, C.scarfD);
    R(g, 4, 21, 16, 3, C.dress);
  })]);
  // Portraits: the baked photo head, graded to match each speaker
  // Portraits: buffer-res fallback sheets (cutscenes overlay these in
  // HD via PHOTO_FACES + drawImoHead)
  for (const [nm, gname] of [['face_tiko', 'tiko_big'], ['face_shop', 'tiko_shop']]) {
    const [c, g] = cv(24, 24);
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.drawImage(ImoHeads[gname], 0, 0, 24, 24);
    sheet(nm, [c]);
  }
  sheet('face_tallman', [frame(24, 24, (g) => {
    R(g, 5, 8, 14, 14, '#9a6a42');
    R(g, 4, 2, 16, 6, '#8a3c3c');
    R(g, 8, 12, 2, 2, '#22222c'); R(g, 14, 12, 2, 2, '#22222c');
    R(g, 10, 17, 4, 1, '#7a4f30');
    R(g, 5, 21, 14, 3, '#6a5a42');
  })]);
  sheet('face_shorty', [frame(24, 24, (g) => {
    R(g, 4, 9, 16, 13, '#9a6a42');
    R(g, 5, 2, 14, 5, '#4a6a4a');
    R(g, 2, 7, 20, 2, '#3c573e');
    R(g, 8, 13, 2, 2, '#22222c'); R(g, 14, 13, 2, 2, '#22222c');
    R(g, 10, 18, 5, 1, '#7a4f30');
    R(g, 4, 21, 16, 3, '#5a8a5a');
  })]);
  // shebeen crew portraits — all red-eyed and drunk
  sheet('face_masi', [frame(24, 24, (g) => {
    R(g, 3, 7, 18, 15, '#8a5a3a');                                   // big round face
    R(g, 3, 3, 18, 5, '#1a140f');                                    // hair
    R(g, 7, 12, 3, 3, RED_EYE); R(g, 14, 12, 3, 3, RED_EYE);         // red eyes
    R(g, 5, 14, 2, 2, '#c2683a'); R(g, 17, 14, 2, 2, '#c2683a');     // flushed cheeks
    R(g, 10, 18, 4, 1, '#5a3520'); R(g, 4, 20, 16, 3, '#c2683a');    // grin + vest
  })]);
  sheet('face_imo', [frame(24, 24, (g) => {
    R(g, 5, 6, 14, 14, '#7a5232');                                   // kid face
    R(g, 5, 2, 14, 4, '#1a140f');                                    // hair
    R(g, 7, 11, 3, 3, RED_EYE); R(g, 14, 11, 3, 3, RED_EYE);         // big red eyes
    R(g, 10, 16, 4, 1, '#5a3520'); R(g, 6, 20, 12, 3, '#d2a23a');    // grin + shirt
  })]);
  sheet('face_rasta', [frame(24, 24, (g) => {
    R(g, 3, 9, 3, 13, '#241509'); R(g, 18, 9, 3, 13, '#241509');     // dread sides
    R(g, 6, 8, 12, 12, '#6e4a2c');                                   // face
    R(g, 8, 12, 3, 2, RED_EYE); R(g, 14, 12, 3, 2, RED_EYE);         // red eyes
    R(g, 10, 16, 4, 1, '#4a2c18');                                   // mellow mouth
    R(g, 5, 2, 14, 6, '#1f8a36'); R(g, 5, 2, 14, 2, '#e2b83a'); R(g, 5, 1, 14, 1, '#d23a3a'); // tam
    R(g, 4, 20, 16, 3, '#3a7a3a');                                   // shirt
  })]);

  // ---- tilesets ----
  buildTiles();
}

function noiseRect(g, x, y, w, h, base, fleck, density) {
  R(g, x, y, w, h, base);
  g.fillStyle = fleck;
  const n = Math.floor(w * h * density);
  for (let i = 0; i < n; i++) {
    g.fillRect(x + Math.floor(Math.random() * w), y + Math.floor(Math.random() * h), 1, 1);
  }
}

function platSheet(name, top, topHi, body, dark) {
  // 3 frames: left edge / mid / right edge, 8x10
  const mk = (edge) => frame(8, 10, (g) => {
    noiseRect(g, 0, 3, 8, 7, body, dark, 0.12);
    R(g, 0, 0, 8, 1, topHi);
    R(g, 0, 1, 8, 2, top);
    if (edge === 'l') { R(g, 0, 0, 1, 10, dark); }
    if (edge === 'r') { R(g, 7, 0, 1, 10, dark); }
    // ragged underside
    g.fillStyle = dark;
    for (let x = 0; x < 8; x += 2) R(g, x, 9, 1, 1, dark);
  });
  sheet(name, [mk('l'), mk('m'), mk('r')]);
}

function buildTiles() {
  platSheet('plat_w1a', '#8a6f48', '#a08458', '#5d4630', '#3c2e1e');   // L1 earthy
  platSheet('plat_w1b', '#6f8a48', '#88a058', '#46582e', '#2c3c1c');   // L2 weed biome
  platSheet('plat_w1c', '#5d6a7a', '#74849a', '#3a4350', '#242a34');   // L3 deep stone
  platSheet('plat_crumble', '#9a8468', '#b09a78', '#6b5a44', '#463a28');
  platSheet('plat_w2', '#b08a5a', '#caa570', '#7a5f3c', '#4f3e28');    // township crates/stoeps

  // crumble cracks overlay baked in: redo mid frame with cracks
  // (visual only; crumbling state handled by level renderer alpha/shake)

  // ladder unit 10x8
  sheet('ladder', [frame(10, 8, (g) => {
    R(g, 1, 0, 2, 8, '#8a6f48'); R(g, 7, 0, 2, 8, '#8a6f48');
    R(g, 1, 0, 2, 1, '#a08458'); R(g, 7, 0, 2, 1, '#a08458');
    R(g, 1, 3, 8, 2, '#6b5436');
  })]);

  // root-vine unit 10x8
  sheet('vine', [frame(10, 8, (g) => {
    R(g, 2, 0, 2, 8, '#47704a'); R(g, 6, 0, 2, 8, '#3c573e');
    R(g, 2, 3, 6, 2, '#5a8a5a');
    R(g, 0, 1, 2, 2, '#6ac24a');
    R(g, 8, 5, 2, 2, '#6ac24a');
  })]);

  // township ground tile 16x44
  sheet('ground_w2', [frame(16, 44, (g) => {
    noiseRect(g, 0, 4, 16, 40, '#8a6a4a', '#6f543a', 0.08);
    R(g, 0, 0, 16, 2, '#caa570');
    R(g, 0, 2, 16, 2, '#a08458');
  })]);

  // bush (township foreground)
  sheet('bush', [frame(22, 14, (g) => {
    g.fillStyle = '#3c6a34';
    R(g, 2, 4, 18, 10, '#3c6a34');
    R(g, 0, 8, 22, 6, '#3c6a34');
    R(g, 5, 1, 12, 6, '#4a8040');
    R(g, 4, 5, 6, 3, '#5a9a4a');
    R(g, 13, 7, 5, 3, '#5a9a4a');
  })]);
}
