// ============================================================
// COMPLETABILITY VERIFIER — re-proves from the emitted level
// data + CONFIG physics that every level is beatable.
//
// World 1: builds a reachability graph (jump arcs solved from
// the real ballistic equations, ladder links), checks EVERY
// platform is reachable from spawn, Dijkstra's the spawn->exit
// route, and compares route time x safety vs the mist's rise
// time (also per checkpoint restart).
// World 2: checks every gap and raised platform against the
// run-speed jump arc, and that granny's speed (including the
// burst cycle average) stays below Vaks's run speed.
// Pure math, no DOM — also runs under Node via tools/check.mjs.
// ============================================================

import { CONFIG } from './config.js';
import { LEVELS } from './data/levels.js';

const SAFETY = 1.22;

// Exact arc feasibility: can a jump at horizontal `speed` clear a
// rise of `rise` px while crossing `edge` px of horizontal gap?
function canJump(rise, edge, speed) {
  const V = CONFIG.player.jumpVel, g = CONFIG.physics.gravity;
  const need = rise + 3;                      // clear with margin
  const disc = V * V - 2 * g * need;
  if (disc < 0) return false;
  const tLand = (V + Math.sqrt(disc)) / g;    // latest time still at `need` height
  return speed * tLand * 0.92 >= edge + 5;
}

function edgeGap(a, b) {
  return Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w));
}

function verifyVertical(L, out) {
  let ok = true;
  const P = L.platforms;
  const walk = CONFIG.player.walkSpeed, climb = CONFIG.player.climbSpeed;
  const n = P.length;
  const adj = Array.from({ length: n }, () => []);

  const center = (p) => p.x + p.w / 2;

  // jump / hop / drop edges
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const rise = P[i].y - P[j].y; // + means j is higher
      const e = edgeGap(P[i], P[j]);
      if (rise > 0) {
        if (canJump(rise, e, walk)) {
          adj[i].push({ to: j, t: 0.5 + Math.abs(center(P[i]) - center(P[j])) / walk });
        }
      } else if (rise > -160) {
        // drop or hop down
        if (e <= 60) adj[i].push({ to: j, t: 0.3 + Math.abs(center(P[i]) - center(P[j])) / walk });
      }
    }
  }

  // ladder edges (and ladder attachment sanity)
  for (const ld of L.ladders) {
    const topP = P.findIndex((p) => Math.abs(p.y - ld.y) <= 6 && ld.x + 10 > p.x && ld.x < p.x + p.w);
    const botP = P.findIndex((p) => Math.abs(p.y - (ld.y + ld.h)) <= 8 && ld.x + 10 > p.x && ld.x < p.x + p.w);
    if (topP < 0 || botP < 0) {
      out.push(`  L${L.id} FAIL: ladder at (${ld.x},${ld.y}) not attached to platforms`);
      ok = false; continue;
    }
    const t = ld.h / climb + 0.2;
    adj[botP].push({ to: topP, t });
    adj[topP].push({ to: botP, t });
  }

  // spawn + exit platforms
  const spawnP = P.findIndex((p) => Math.abs(p.y - L.spawn.y) <= 4 && L.spawn.x >= p.x && L.spawn.x <= p.x + p.w);
  const exitP = P.findIndex((p) => Math.abs(p.y - (L.exit.y + L.exit.h)) <= 4 && L.exit.x + L.exit.w / 2 >= p.x && L.exit.x + L.exit.w / 2 <= p.x + p.w);
  if (spawnP < 0 || exitP < 0) {
    out.push(`  L${L.id} FAIL: spawn/exit platform missing`);
    return false;
  }

  // Dijkstra
  const dist = new Array(n).fill(Infinity);
  dist[spawnP] = 0;
  const visited = new Array(n).fill(false);
  for (let it = 0; it < n; it++) {
    let u = -1, best = Infinity;
    for (let k = 0; k < n; k++) if (!visited[k] && dist[k] < best) { best = dist[k]; u = k; }
    if (u < 0) break;
    visited[u] = true;
    for (const e of adj[u]) if (dist[u] + e.t < dist[e.to]) dist[e.to] = dist[u] + e.t;
  }

  const unreachable = [];
  for (let k = 0; k < n; k++) if (!isFinite(dist[k])) unreachable.push(k);
  if (unreachable.length) {
    ok = false;
    out.push(`  L${L.id} FAIL: ${unreachable.length} unreachable platform(s), e.g. (${P[unreachable[0]].x},${P[unreachable[0]].y})`);
  }

  const rate = CONFIG.mist.rate[L.id];
  const climbT = dist[exitP];
  const mistT = (L.spawn.y + CONFIG.mist.startGap - P[exitP].y) / rate;
  const margin = mistT / (climbT * SAFETY);
  if (!(isFinite(climbT) && climbT * SAFETY <= mistT)) {
    ok = false;
    out.push(`  L${L.id} FAIL: route ${climbT.toFixed(1)}s x${SAFETY} vs mist ${mistT.toFixed(1)}s`);
  }

  // checkpoint restarts must also outrun the reset mist
  for (const cp of L.checkpoints) {
    const cpP = P.findIndex((p) => Math.abs(p.y - cp.y) <= 4 && cp.x >= p.x && cp.x <= p.x + p.w);
    if (cpP < 0) { out.push(`  L${L.id} FAIL: checkpoint off-platform`); ok = false; continue; }
    // Dijkstra from checkpoint
    const d2 = new Array(n).fill(Infinity); d2[cpP] = 0;
    const v2 = new Array(n).fill(false);
    for (let it = 0; it < n; it++) {
      let u = -1, best = Infinity;
      for (let k = 0; k < n; k++) if (!v2[k] && d2[k] < best) { best = d2[k]; u = k; }
      if (u < 0) break;
      v2[u] = true;
      for (const e of adj[u]) if (d2[u] + e.t < d2[e.to]) d2[e.to] = d2[u] + e.t;
    }
    const mt = (cp.y + CONFIG.mist.resetGap - P[exitP].y) / rate;
    if (!(isFinite(d2[exitP]) && d2[exitP] * SAFETY <= mt)) {
      ok = false;
      out.push(`  L${L.id} FAIL: checkpoint(${cp.x},${cp.y}) route ${d2[exitP].toFixed(1)}s x${SAFETY} vs mist ${mt.toFixed(1)}s`);
    }
  }

  if (ok) {
    out.push(`  L${L.id} ${L.name}: VERTICAL OK — ${n} platforms all reachable, ${L.ladders.length} ladders attached, route ${climbT.toFixed(1)}s vs mist ${mistT.toFixed(1)}s (margin x${margin.toFixed(2)})`);
  }
  return ok;
}

function verifyHorizontal(L, out) {
  let ok = true;
  const run = CONFIG.player.runSpeed;
  const G = L.groundY;

  // gaps between ground segments
  const gs = [...L.grounds].sort((a, b) => a.x - b.x);
  let worstGap = 0;
  for (let i = 0; i + 1 < gs.length; i++) {
    const gap = gs[i + 1].x - (gs[i].x + gs[i].w);
    worstGap = Math.max(worstGap, gap);
    if (gap > 0 && !canJump(0, gap, run)) {
      // a platform bridging the gap also satisfies it
      const bridge = L.platforms.find((p) => p.x < gs[i + 1].x && p.x + p.w > gs[i].x + gs[i].w &&
        canJump(G - p.y, Math.max(0, p.x - (gs[i].x + gs[i].w)), run) &&
        canJump(0, Math.max(0, gs[i + 1].x - (p.x + p.w)), run));
      if (!bridge) {
        ok = false;
        out.push(`  L${L.id} FAIL: gap of ${gap}px at x=${gs[i].x + gs[i].w} not clearable`);
      }
    }
  }

  // raised platforms must be mountable from the ground
  for (const p of L.platforms) {
    if (!canJump(G - p.y, 0, run)) {
      ok = false;
      out.push(`  L${L.id} FAIL: platform at (${p.x},${p.y}) too high (${G - p.y}px)`);
    }
  }

  // spawn, checkpoints and exit must stand on ground
  const onGround = (x) => gs.some((s) => x >= s.x && x <= s.x + s.w);
  for (const cp of [{ x: L.spawn.x }, ...L.checkpoints, { x: L.exit.x + L.exit.w / 2 }]) {
    if (!onGround(cp.x)) { ok = false; out.push(`  L${L.id} FAIL: point x=${cp.x} hangs over a gap`); }
  }

  // granny math: base below run speed; burst-cycle average below too
  const gs6 = CONFIG.granny;
  const base = gs6.speed[L.id];
  const cycle = gs6.burstEvery[L.id];
  const avg = (gs6.burstTime * base * gs6.burstMul + (cycle - gs6.burstTime) * base) / cycle;
  if (!(base < run)) { ok = false; out.push(`  L${L.id} FAIL: granny base ${base} >= run ${run}`); }
  if (!(avg < run * 0.95)) { ok = false; out.push(`  L${L.id} FAIL: granny cycle avg ${avg.toFixed(1)} too close to run ${run}`); }

  if (ok) {
    out.push(`  L${L.id} ${L.name}: HORIZONTAL OK — ${gs.length} ground segments, worst gap ${worstGap}px (max ${(run * 2 * CONFIG.player.jumpVel / CONFIG.physics.gravity * 0.92 - 5).toFixed(0)}px), granny ${base}/${avg.toFixed(0)} avg vs vaks ${run}`);
  }
  return ok;
}

export function verifyLevels() {
  const out = [];
  let allOk = true;
  out.push("[VAK'S CAVE] COMPLETABILITY VERIFIER");
  for (const L of LEVELS) {
    const ok = L.orientation === 'vertical' ? verifyVertical(L, out) : verifyHorizontal(L, out);
    allOk = allOk && ok;
  }
  out.push(allOk ? "[VAK'S CAVE] ALL LEVELS VERIFIED COMPLETABLE" : "[VAK'S CAVE] VERIFICATION FAILED");
  return { ok: allOk, lines: out };
}
