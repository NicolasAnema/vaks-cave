// ============================================================
// LEVEL DATA — pure data, no engine imports beyond CONFIG math.
// Levels declare their orientation. Layouts are emitted by
// deterministic seeded builders that CONSTRUCT connectivity:
// every consecutive main platform is either within jump reach
// (gap/edge limits derived from CONFIG physics) or joined by a
// ladder. src/verify.js then re-proves reachability from the
// emitted data alone.
// ============================================================

import { CONFIG, jumpStats } from '../config.js';

function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Safe motion limits, derived from CONFIG (margin under the true max)
const J1 = jumpStats(CONFIG.player.walkSpeed);
const MAX_UP = Math.floor(J1.maxJumpH * 0.7);          // vertical world: jumpable rise
const MAX_EDGE = Math.floor(J1.maxJumpDist * 0.55);    // vertical world: horizontal edge gap

// ============================================================
// VERTICAL SHAFT BUILDER (World 1)
// ============================================================

function buildVertical(o) {
  const r = rng(o.seed);
  const W = 480, innerL = 26, innerR = 454;
  const platforms = [], ladders = [], pickups = [], rats = [], tikos = [],
        lanterns = [], tutorials = [], checkpoints = [];
  const floorY = o.height - 24;
  const topY = 96;

  const floor = { x: 16, y: floorY, w: W - 32, type: 'solid', main: true };
  platforms.push(floor);

  let prev = floor;
  let cx = 240, dir = r() < 0.5 ? 1 : -1, runLen = 0, zigTarget = 2;
  let y = floorY, row = 0, sinceLadder = 0;
  const placedFrac = new Set();

  function ensureOverlap(p, q, minOv) {
    // grow p horizontally until overlap(p,q) >= minOv (minOv may be
    // negative = allowed edge gap)
    const ov = () => Math.min(p.x + p.w, q.x + q.w) - Math.max(p.x, q.x);
    if (ov() >= minOv) return;
    if (q.x + q.w / 2 >= p.x + p.w / 2) {
      p.w = clamp(q.x + minOv - p.x, p.w, innerR - p.x);
    } else {
      const nx = clamp(q.x + q.w - minOv, innerL, p.x);
      p.w += p.x - nx; p.x = nx;
    }
    // if still short (wall-clamped), grow the other way too
    if (ov() < minOv) p.w = clamp(Math.max(p.w, q.x + minOv - p.x), p.w, innerR - p.x);
  }

  function connect(p, gap, allowCrumble) {
    // guarantee p is reachable from prev; returns p
    const needLadder = gap > MAX_UP || sinceLadder >= o.ladderEvery;
    if (needLadder) {
      ensureOverlap(p, prev, 30);
      const ovL = Math.max(p.x, prev.x), ovR = Math.min(p.x + p.w, prev.x + prev.w);
      const lx = clamp(Math.round((ovL + ovR) / 2 - 5), ovL, ovR - 10);
      ladders.push({ x: lx, y: p.y, h: prev.y - p.y, vine: r() < 0.45 });
      p.type = 'solid'; prev.type = 'solid';
      sinceLadder = 0;
    } else {
      ensureOverlap(p, prev, -MAX_EDGE);
      sinceLadder++;
      if (allowCrumble && r() < o.crumbleMain) p.type = 'crumble';
    }
    platforms.push(p);
    prev = p;
    return p;
  }

  while (y - o.gap[1] > topY + 50) {
    const gap = Math.round(o.gap[0] + r() * (o.gap[1] - o.gap[0]));
    y -= gap; row++;
    runLen++;
    if (runLen >= zigTarget) { dir *= -1; runLen = 0; zigTarget = 2 + Math.floor(r() * 3); }
    cx = clamp(cx + dir * (o.dx[0] + r() * (o.dx[1] - o.dx[0])), 105, 375);
    if (cx <= 105) dir = 1; if (cx >= 375) dir = -1;
    const w = Math.round(o.w[0] + r() * (o.w[1] - o.w[0]));
    const p = { x: Math.round(clamp(cx - w / 2, innerL, innerR - w)), y, w, type: 'solid', main: true };
    connect(p, gap, row > 4);

    const frac = (floorY - y) / (floorY - topY);

    // pickups on the main path: R2 coin runs, sometimes a green R10
    const eco = CONFIG.economy;
    if (r() < eco.w1CoinChance && p.w >= 60) {
      const n = 1 + Math.floor(r() * eco.w1CoinMax);
      for (let i = 0; i < n; i++) pickups.push({ x: p.x + 10 + i * 15 + r() * 4, y: p.y - 14, kind: 'r2' });
    } else if (r() < eco.w1NoteChance && p.w >= 60) {
      pickups.push({ x: p.x + p.w / 2, y: p.y - 14, kind: 'r10' });
    }
    // weed at planned fractions
    for (const wf of o.weedFracs) {
      const key = 'w' + wf;
      if (!placedFrac.has(key) && frac >= wf) {
        placedFrac.add(key);
        pickups.push({ x: p.x + p.w / 2, y: p.y - 15, kind: 'weed' });
      }
    }
    // (no checkpoints: a death restarts the whole level from the bottom)
    // rats on wider ledges (host stays solid: a rat never rides a falling step)
    if (o.ratFracs.some((rf, i) => !placedFrac.has('r' + i) && frac >= rf && p.w >= 80 && placedFrac.add('r' + i))) {
      p.type = 'solid';
      rats.push({ x: p.x + p.w / 2, y: p.y, minX: p.x + 6, maxX: p.x + p.w - 6 });
    }
    // shadow tikolosh patrols (L3)
    if (o.shadowFracs.some((sf, i) => !placedFrac.has('s' + i) && frac >= sf && p.w >= 76 && placedFrac.add('s' + i))) {
      tikos.push({ kind: 'shadow', x: p.x + p.w / 2, y: p.y, minX: p.x + 8, maxX: p.x + p.w - 8 });
    }
    // irie tikolosh drifters (L2)
    if (o.irieFracs.some((tf, i) => !placedFrac.has('t' + i) && frac >= tf && placedFrac.add('t' + i))) {
      tikos.push({ kind: 'irie', x: 240, y: p.y - 34, minX: 70, maxX: 410 });
    }
    // decoy platform beside the main path (hop-reachable) with goodies
    if (r() < o.decoyFrac) {
      const dw = Math.round(46 + r() * 40);
      const hop = Math.round(18 + r() * (MAX_EDGE - 22));
      const roomR = innerR - (p.x + p.w + hop + dw);
      const roomL = (p.x - hop - dw) - innerL;
      let dx = null;
      if (roomR > 0 && (roomL <= 0 || r() < 0.5)) dx = p.x + p.w + hop;
      else if (roomL > 0) dx = p.x - hop - dw;
      if (dx !== null) {
        const d = { x: Math.round(dx), y: y + Math.round(r() * 6 - 3), w: dw, type: r() < o.crumbleDecoy ? 'crumble' : 'solid', main: false };
        platforms.push(d);
        // decoys pay in notes: risk = reward. One R100 high up per level.
        if (frac >= 0.8 && !placedFrac.has('r100')) {
          placedFrac.add('r100');
          pickups.push({ x: d.x + d.w / 2, y: d.y - 14, kind: 'r100' });
        } else {
          const roll = r();
          pickups.push({ x: d.x + d.w / 2, y: d.y - 14, kind: roll < 0.5 ? 'r10' : (roll < 0.82 ? 'r20' : 'r50') });
          if (r() < eco.w1DecoyBonus) pickups.push({ x: d.x + 9, y: d.y - 13, kind: 'r2' });
        }
      }
    }
  }

  // exit platform + cave opening
  const exGap = clamp(y - topY, 24, MAX_UP + 26);
  const exY = y - exGap;
  const exW = 150;
  const exP = { x: Math.round(clamp(cx - exW / 2, innerL, innerR - exW)), y: exY, w: exW, type: 'solid', main: true };
  connect(exP, exGap, false);
  const exit = { x: exP.x + exP.w / 2 - 24, y: exY - 44, w: 48, h: 44 };

  const spawn = { x: 240, y: floorY };

  if (o.tutorials) tutorials.push(...o.tutorials(spawn, ladders, floorY));

  return {
    id: o.id, name: o.name, tagline: o.tagline, world: 1, orientation: 'vertical',
    width: W, height: o.height, theme: o.theme, dark: !!o.dark,
    introTiko: !!o.introTiko, bottles: o.bottles !== false,
    liveTutorial: !!o.liveTutorial, irieStart: !!o.irieStart,
    irieMusic: o.irieMusic || null,
    music: o.music || 'world1',
    platforms, ladders, pickups, rats, tikos, lanterns, checkpoints, tutorials,
    walls: [{ x: 0, y: 0, w: 16, h: o.height }, { x: W - 16, y: 0, w: 16, h: o.height }],
    spawn, exit, props: [], grounds: [], sushi: [], npcs: [],
  };
}

// ============================================================
// TUTORIAL ARENA — its own tiny flow node before L1 (not part of
// LEVELS, so the completability verifier skips it). A handcrafted
// one-screen shaft: floor, one jump platform, one ladder platform.
// The staged control drill (level.js liveTut) runs here and hands
// straight off to L1 when done — no exit, no threats, no death.
// ============================================================

export function buildTutorialLevel() {
  const H = 320, floorY = H - 24;
  return {
    id: 0, name: 'MORNING STRETCH', tagline: 'FIRST, THE BASICS, BOSS.',
    isTutorial: true, world: 1, orientation: 'vertical',
    width: 480, height: H, theme: 'plat_w1a', dark: false,
    introTiko: false, bottles: false,
    liveTutorial: true, irieStart: false, irieMusic: null,
    music: 'darkcave', // carries the cold-open track through the drill
    platforms: [
      { x: 16, y: floorY, w: 448, type: 'solid', main: true },   // floor
      { x: 56, y: floorY - 38, w: 130, type: 'solid', main: true },  // jump ledge
      { x: 264, y: floorY - 78, w: 140, type: 'solid', main: true }, // ladder ledge
    ],
    ladders: [{ x: 322, y: floorY - 78, h: 78, vine: false }],
    pickups: [], rats: [], tikos: [], lanterns: [], checkpoints: [], tutorials: [],
    walls: [{ x: 0, y: 0, w: 16, h: H }, { x: 464, y: 0, w: 16, h: H }],
    spawn: { x: 240, y: floorY },
    exit: { x: 216, y: 40, w: 48, h: 44 }, // decorative — the drill clears the screen itself
    props: [], grounds: [], sushi: [], npcs: [],
  };
}

// ============================================================
// HORIZONTAL SPRINT BUILDER (World 2)
// ============================================================

function buildHorizontal(o) {
  const r = rng(o.seed);
  const G = 232, H = 270, W = o.length;
  // L4 (the shebeen) plays the whole level tipsy-slow, so size its jumps/gaps to
  // that reduced run speed — the same effective speed verify.js proves against.
  const tipsyMul = o.tipsyMul || 1;
  const runEff = CONFIG.player.runSpeed * tipsyMul;
  const J2 = jumpStats(runEff);
  const maxGap = Math.floor(J2.maxJumpDist * 0.72);

  const grounds = [], platforms = [], pickups = [], rats = [], sushi = [],
        props = [], npcs = [], checkpoints = [], tutorials = [], tsotsis = [], hawkers = [];

  let gx = 0;       // current ground segment start
  let x = 340;      // build cursor (first stretch is safe)
  let placed100 = false; // one R100 note per level
  let stallX = null;     // x where the scripted granny-stall triggers
  const placed = new Set();

  function endGround(atX) { grounds.push({ x: gx, w: atX - gx }); }

  while (x < W - 420) {
    const frac = x / W;

    // planned one-shot placements
    let didPlace = false;
    // no checkpoints (a death restarts the level) — but the scripted Tallman &
    // Shorty granny-stall still happens at its planned spot
    if (o.scriptedStallAt != null && !placed.has('stall') && frac >= o.scriptedStallAt) {
      placed.add('stall');
      npcs.push({ kind: 'tallman', x: Math.round(x + 70), y: G });
      npcs.push({ kind: 'shorty', x: Math.round(x + 104), y: G });
      stallX = Math.round(x + 70);
      x += 150; continue;
    }
    for (const wf of o.weedFracs) {
      if (!placed.has('w' + wf) && frac >= wf) {
        placed.add('w' + wf);
        pickups.push({ x: Math.round(x + 40), y: G - 15, kind: 'weed' });
        x += 90; didPlace = true; break;
      }
    }
    if (didPlace) continue;
    // tsotsis at planned fractions: each works a fixed stretch of street
    for (const tp of (o.tsotsiPlan || [])) {
      const key = 't' + tp.frac;
      if (!placed.has(key) && frac >= tp.frac) {
        placed.add(key);
        tsotsis.push({ kind: tp.kind, x: Math.round(x + 70), y: G, minX: Math.round(x + 16), maxX: Math.round(x + 150) });
        x += 190; didPlace = true; break;
      }
    }
    if (didPlace) continue;
    // L5 hawker gauntlet: a short run of stalls you weave/jump through
    for (const hf of (o.hawkerPlan || [])) {
      const key = 'h' + hf;
      if (!placed.has(key) && frac >= hf) {
        placed.add(key);
        const count = 2 + Math.floor(r() * 2); // 2-3 stalls in a row
        let hxx = x + 36;
        for (let i = 0; i < count; i++) { hawkers.push({ x: Math.round(hxx), y: G }); hxx += 42 + Math.round(r() * 22); }
        x = Math.round(hxx) + 34; didPlace = true; break;
      }
    }
    if (didPlace) continue;
    // high-road overpass: a run of rooftops you can hop up to and cross instead
    // of the street. The street below stays open (and is guarded), so it's a
    // real choice — safer-but-trickier-jumps up top vs. run-the-gauntlet below.
    for (const op of (o.overpassPlan || [])) {
      const key = 'op' + op.frac;
      if (!placed.has(key) && frac >= op.frac) {
        placed.add(key);
        const len = op.len || 3, pw = 56, step = pw + 26;
        let ox = x + 20;
        for (let i = 0; i < len; i++) {
          platforms.push({ x: Math.round(ox), y: G - 42, w: pw, type: 'solid', main: false });
          pickups.push({ x: Math.round(ox + pw / 2), y: G - 58, kind: i === len - 1 ? 'r50' : 'r20' });
          ox += step;
        }
        // the street below is guarded so the rooftop is worth the risk
        tsotsis.push({ kind: op.kind || 'gun', x: Math.round(x + (ox - x) / 2), y: G, minX: Math.round(x + 16), maxX: Math.round(ox - 16) });
        x = Math.round(ox) + 40; didPlace = true; break; // ground continues underneath
      }
    }
    if (didPlace) continue;

    const roll = r();
    if (roll < o.gapFrac) {
      // a gap, sometimes with a bonus platform floating above it
      const gw = Math.round(clamp(o.gap[0] + r() * (o.gap[1] - o.gap[0]), 36, maxGap));
      endGround(x);
      if (r() < 0.4) {
        const pw = Math.max(54, gw - 6);
        const px = Math.round(x + gw / 2 - pw / 2);
        platforms.push({ x: px, y: G - 42, w: pw, type: 'solid', main: false });
        for (let i = 0; i < 3; i++) pickups.push({ x: px + 10 + i * 16, y: G - 58, kind: 'r2' });
      } else {
        // coin arc over the gap
        for (let i = 0; i < 3; i++) pickups.push({ x: x + gw * (0.25 + 0.25 * i), y: G - 34 - 12 * Math.sin(Math.PI * (i + 1) / 4), kind: 'r2' });
      }
      x += gw; gx = x; x += 60 + Math.round(r() * 80);
    } else if (roll < o.gapFrac + o.sushiFrac) {
      sushi.push({ x: Math.round(x + 30), y: G });
      if (r() < 0.4) sushi.push({ x: Math.round(x + 30 + 88 + r() * 40), y: G });
      x += 150 + Math.round(r() * 50);
    } else if (roll < o.gapFrac + o.sushiFrac + o.ratFrac) {
      rats.push({ x: Math.round(x + 60), y: G, minX: Math.round(x + 14), maxX: Math.round(x + 130) });
      x += 160 + Math.round(r() * 40);
    } else if (roll < o.gapFrac + o.sushiFrac + o.ratFrac + 0.16) {
      // raised platform run pays in notes (one R100 per level, late)
      const pw = 70 + Math.round(r() * 50);
      platforms.push({ x: Math.round(x + 20), y: G - 40, w: pw, type: 'solid', main: false });
      if (!placed100 && x > W * 0.62) {
        placed100 = true;
        pickups.push({ x: x + 20 + pw / 2, y: G - 56, kind: 'r100' });
      } else {
        pickups.push({ x: x + 36, y: G - 56, kind: 'r10' });
        if (r() < CONFIG.economy.w2RaisedNote) pickups.push({ x: x + 36 + 28, y: G - 56, kind: 'r20' });
      }
      x += pw + 70;
    } else {
      // breather with coins on the ground, sometimes a stray note
      const n = 1 + Math.floor(r() * CONFIG.economy.w2BreatherMax);
      for (let i = 0; i < n; i++) pickups.push({ x: x + 20 + i * 18, y: G - 14, kind: 'r2' });
      if (r() < CONFIG.economy.w2BreatherNote) pickups.push({ x: x + 20 + n * 18, y: G - 14, kind: 'r20' });
      x += 110 + Math.round(r() * 70);
    }
  }

  endGround(W);
  // re-open final ground to the end of the level
  grounds[grounds.length - 1].w = W - grounds[grounds.length - 1].x;

  // props by planned fraction, snapped onto ground
  for (const pp of o.propPlan) {
    props.push({ kind: pp.kind, x: Math.round(pp.frac * W), y: G });
  }
  // cosmetic bushes
  for (let bx = 200; bx < W - 200; bx += 260 + Math.floor(r() * 200)) {
    props.push({ kind: 'bush', x: bx, y: G });
  }

  const spawn = { x: 60, y: G };
  const exit = { x: W - 110, y: G - 52, w: 60, h: 52 };
  props.push({ kind: 'gate', x: W - 104, y: G });

  if (o.tutorials) tutorials.push(...o.tutorials(spawn, G));

  return {
    id: o.id, name: o.name, tagline: o.tagline, world: 2, orientation: 'horizontal',
    width: W, height: H, theme: 'plat_w2', groundY: G, dark: false,
    bottles: false, introTiko: false,
    music: 'world2',
    tint: o.tint || null,        // 'drunk' -> yellow tipsy overlay (L4)
    tipsyMul: tipsyMul,          // < 1 slows Vaks for the whole level (L4)
    platforms, ladders: [], pickups, rats, tikos: [], lanterns: [], checkpoints, tutorials,
    walls: [], grounds, sushi, props, npcs, tsotsis, hawkers,
    scriptedStallAt: stallX != null ? { x: stallX } : null,
    spawn, exit,
  };
}

// ============================================================
// MONEY NORMALIZER
// The builders place pickup POSITIONS; this sets the mano TOTAL per
// level to CONFIG.economy.levelBudget. Over budget -> drop the biggest
// notes first (keeps small coins spread out, kills the easy big notes).
// Under budget -> upgrade coins up the denomination ladder. Deterministic
// (seeded by id), so the per-level max is fixed and rises with the level.
// ============================================================

const MONEY_LADDER = ['r2', 'r10', 'r20', 'r50', 'r100'];

function normalizeMoney(level) {
  const budget = CONFIG.economy.levelBudget && CONFIG.economy.levelBudget[level.id];
  if (budget == null) return;
  const V = CONFIG.money.values;
  const idxs = [];
  level.pickups.forEach((p, i) => { if (V[p.kind] != null) idxs.push(i); });
  let total = idxs.reduce((s, i) => s + V[level.pickups[i].kind], 0);

  // 1) Over budget: drop the highest-value pickups first (kills easy big
  //    notes, leaves small coins spread out) until within budget.
  if (total > budget) {
    const order = idxs.slice().sort((a, b) => V[level.pickups[b].kind] - V[level.pickups[a].kind] || a - b);
    const remove = new Set();
    for (const i of order) {
      if (total <= budget) break;
      total -= V[level.pickups[i].kind];
      remove.add(i);
    }
    level.pickups = level.pickups.filter((p, i) => !remove.has(i));
  }

  // 2) Under budget (originally, or after trimming): upgrade coins up the
  //    denomination ladder, seeded order, to climb as close to budget as
  //    the denominations allow without exceeding it.
  const money = [];
  level.pickups.forEach((p, i) => { if (V[p.kind] != null) money.push(i); });
  const r = rng(9000 + level.id);
  for (let i = money.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [money[i], money[j]] = [money[j], money[i]]; }
  let progress = true;
  while (total < budget && progress) {
    progress = false;
    for (const i of money) {
      const li = MONEY_LADDER.indexOf(level.pickups[i].kind);
      if (li < 0 || li === MONEY_LADDER.length - 1) continue;
      const delta = V[MONEY_LADDER[li + 1]] - V[MONEY_LADDER[li]];
      if (total + delta <= budget) {
        level.pickups[i].kind = MONEY_LADDER[li + 1];
        total += delta;
        progress = true;
        if (total >= budget) break;
      }
    }
  }
}

// ============================================================
// THE SIX LEVELS
// ============================================================

export const LEVELS = [
  buildVertical({
    id: 1, seed: 1101, name: 'SHALLOW SHAFT', tagline: 'BABALAS YESTERDAY. BIG PARTY!',
    music: 'level1',
    theme: 'plat_w1a', height: 1700,
    gap: [35, 40], w: [104, 175], dx: [58, 98], ladderEvery: 6,
    decoyFrac: 0.12, crumbleDecoy: 0.55, crumbleMain: 0.6,
    weedFracs: [], ratFracs: [0.25, 0.42, 0.58, 0.74, 0.88], shadowFracs: [], irieFracs: [],
    introTiko: true,
    // Controls are taught in the standalone tutorial arena before this level
    // (buildTutorialLevel, its own flow node); these zones cover the threats
    // Vaks meets higher up the shaft.
    tutorials: (spawn, ladders, floorY) => {
      return [
        { x: 16, y: floorY - 260, w: 448, h: 60, text: 'THE MIST RISES. IF IT TOUCHES YOU, IT HAS YOU. CLIMB!' },
        { x: 16, y: floorY - 380, w: 448, h: 60, text: 'RATS BITE ON THE LEDGES. PRESS W TO MEOW AND SCATTER THEM. DO NOT FORGET THE MEOW!' },
        { x: 16, y: floorY - 560, w: 448, h: 60, text: 'CRACKED STEPS GIVE WAY. KEEP CLIMBING.' },
      ].filter(Boolean);
    },
  }),
  buildVertical({
    id: 2, seed: 2202, name: 'WEED BIOME', tagline: "IT'S GOOD TO BE FEEL IRIE",
    theme: 'plat_w1b', height: 2100,
    irieStart: true,    // the irie level opens with Vaks auto-skinning up into the rush
    irieMusic: 'irie',  // ...and the Irie Loop takes over the music once he's smoked


    gap: [35, 40], w: [90, 150], dx: [62, 108], ladderEvery: 5,
    decoyFrac: 0.12, crumbleDecoy: 0.55, crumbleMain: 0.5,
    weedFracs: [0.3, 0.72], ratFracs: [0.3, 0.5, 0.68, 0.85],
    shadowFracs: [], irieFracs: [0.24, 0.42, 0.6, 0.78],
    tutorials: (spawn, ladders, floorY) => [
      { x: spawn.x - 110, y: floorY - 70, w: 240, h: 70, text: 'GANJA SLOWS THE WORLD AND POWERS THE LEGS. TWO AT ONCE IS TOO STRONG.' },
      { x: 16, y: floorY - 420, w: 448, h: 60, text: 'THE TIKOLOSH DRIFTS RIGHT AT YOU NOW. MEOW (W) SCARES IT BACK - USE IT!' },
    ],
  }),
  buildVertical({
    id: 3, seed: 3303, name: 'THE DEEP', tagline: 'YOUR CAT IS GONNA DIE',
    music: 'level3',
    theme: 'plat_w1c', height: 2500, dark: true,
    gap: [35, 40], w: [80, 138], dx: [66, 112], ladderEvery: 5,
    decoyFrac: 0.12, crumbleDecoy: 0.6, crumbleMain: 0.55,
    weedFracs: [0.55],
    ratFracs: [0.16, 0.3, 0.42, 0.56, 0.7, 0.84],
    shadowFracs: [], irieFracs: [0.24, 0.42, 0.6, 0.78],
    tutorials: (spawn, ladders, floorY) => [
      { x: spawn.x - 110, y: floorY - 70, w: 240, h: 70, text: 'TOO DARK FOR PEOPLE EYES. GOOD THING VAKS HAS CAT EYES.' },
      { x: 16, y: floorY - 380, w: 448, h: 60, text: 'RATS AND THE TIKOLOSH HUNT IN THE DARK. MEOW (W) OFTEN TO KEEP THEM BACK!' },
    ],
  }),
  buildHorizontal({
    // L4 THE SHEBEEN: the drink crew chases Vaks to make him buy a round. He's
    // tipsy the whole level (yellow + slow); drink-pushers force a sip (babalas)
    // and pickpockets grab his mano. The crew lobs bottles ahead of him.
    id: 4, seed: 4404, name: 'ONE FOR THE ROAD', tagline: 'JUST ONE, BOSS. JUST ONE...',
    length: 3400, tint: 'drunk', tipsyMul: 0.85,
    gap: [40, 60], gapFrac: 0.26, sushiFrac: 0.16, ratFrac: 0.14,
    tsotsiPlan: [
      { frac: 0.22, kind: 'viceroy' }, { frac: 0.4, kind: 'knife' }, { frac: 0.56, kind: 'viceroy' },
      { frac: 0.72, kind: 'knife' }, { frac: 0.86, kind: 'viceroy' },
    ],
    overpassPlan: [ { frac: 0.62, len: 3, kind: 'knife' } ],
    weedFracs: [0.46],
    propPlan: [
      { kind: 'school', frac: 0.22 }, { kind: 'washing', frac: 0.42 },
      { kind: 'taxi', frac: 0.56 }, { kind: 'washing', frac: 0.78 },
    ],
    tutorials: (spawn, G) => [
      { x: spawn.x - 40, y: G - 70, w: 250, h: 70, text: "RUN RIGHT! THE CREW WANTS YOU TO BUY A ROUND. DON'T STOP." },
      { x: spawn.x + 320, y: G - 70, w: 270, h: 70, text: 'DRINK-PUSHERS FORCE A SIP (BABALAS). PICKPOCKETS GRAB YOUR MANO. DODGE OR JUMP THEM!' },
    ],
  }),
  buildHorizontal({
    // L5 MAIN STREET: a reckless minibus taxi tears down the road trying to
    // scoop Vaks up — it HONKS, then horn-dashes. Gunmen hold the corners and a
    // gauntlet of hawker stalls clogs the road (jump them or stumble).
    id: 5, seed: 5505, name: 'KASI MAIN STREET', tagline: 'EVERY TUESDAY, A TAXI',
    length: 4200,
    gap: [50, 76], gapFrac: 0.28, sushiFrac: 0.18, ratFrac: 0.14,
    tsotsiPlan: [
      { frac: 0.14, kind: 'gun' }, { frac: 0.32, kind: 'knife' }, { frac: 0.52, kind: 'gun' },
      { frac: 0.78, kind: 'gun' },
    ],
    hawkerPlan: [0.22, 0.46, 0.7],
    overpassPlan: [ { frac: 0.26, len: 3, kind: 'gun' }, { frac: 0.72, len: 4, kind: 'knife' } ],
    weedFracs: [0.58],
    scriptedStallAt: 0.64,
    propPlan: [
      { kind: 'taxi', frac: 0.16 }, { kind: 'tv', frac: 0.28 },
      { kind: 'payphone', frac: 0.46 }, { kind: 'billboard', frac: 0.58 },
      { kind: 'washing', frac: 0.4 }, { kind: 'washing', frac: 0.72 }, { kind: 'taxi', frac: 0.86 },
    ],
    tutorials: (spawn, G) => [
      { x: spawn.x - 40, y: G - 70, w: 250, h: 70, text: 'TAXI ON YOUR TAIL! WHEN IT HONKS, IT DASHES. KEEP RUNNING!' },
      { x: spawn.x + 360, y: G - 70, w: 250, h: 70, text: 'HAWKER STALLS BLOCK THE ROAD. JUMP THEM OR STUMBLE.' },
    ],
  }),
  buildHorizontal({
    // L6 HOME STRETCH: the tsotsi crew is after his phone. Knife snatchers
    // everywhere (grab = PHONE SNATCH, mash to keep it), gunmen on the corners,
    // and the crew chaser keeps flanking fast runners up from behind.
    id: 6, seed: 6606, name: 'HOME STRETCH', tagline: 'NOT MY PHONE, BOSS!',
    length: 5000,
    gap: [60, 86], gapFrac: 0.32, sushiFrac: 0.22, ratFrac: 0.18,
    tsotsiPlan: [
      { frac: 0.12, kind: 'knife' }, { frac: 0.26, kind: 'gun' }, { frac: 0.38, kind: 'knife' },
      { frac: 0.5, kind: 'knife' }, { frac: 0.62, kind: 'gun' }, { frac: 0.74, kind: 'knife' },
      { frac: 0.86, kind: 'gun' },
    ],
    overpassPlan: [ { frac: 0.3, len: 4, kind: 'knife' }, { frac: 0.66, len: 5, kind: 'gun' } ],
    weedFracs: [],
    propPlan: [
      { kind: 'school', frac: 0.24 }, { kind: 'tv', frac: 0.48 },
      { kind: 'taxi', frac: 0.66 }, { kind: 'washing', frac: 0.3 }, { kind: 'washing', frac: 0.8 },
    ],
    tutorials: (spawn, G) => [
      { x: spawn.x - 40, y: G - 70, w: 260, h: 70, text: 'TSOTSIS WANT YOUR PHONE! IF GRABBED, MASH TO KEEP IT.' },
      { x: spawn.x + 360, y: G - 70, w: 250, h: 70, text: 'RUNNERS FLANK FROM BEHIND. JUMP ON THEM OR OUTRUN THEM.' },
    ],
  }),
];

LEVELS.forEach(normalizeMoney);

export function getLevel(n) { return LEVELS[n - 1]; }

// ============================================================
// BOSS ARENA — the cave mouth
// ============================================================

export const BOSS_ARENA = {
  floorY: 226,
  vaksX: 360,
  tikoStartX: 110,
};
