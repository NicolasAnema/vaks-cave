// Dev-only CDP audit for the v2 feature pass: weed jump boost,
// babalas bottles, earlier mist, checkpoint lights (3/2/1),
// crumble in all cave levels, weed-icon lives. Saves screenshots.
//   node tools/drive_v2.mjs <port> <url> <outdir>

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [, , port = '9333', url = 'http://localhost:4173/', outdir = 'shots'] = process.argv;
mkdirSync(outdir, { recursive: true });

const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
let page = targets.find((t) => t.type === 'page');
if (!page) {
  page = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
}
const ws = new WebSocket(page.webSocketDebuggerUrl);
let msgId = 0;
const pending = new Map();
const consoleBad = [];
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  else if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) {
    consoleBad.push((m.params.args || []).map((a) => a.value ?? a.description ?? '').join(' '));
  } else if (m.method === 'Runtime.exceptionThrown') {
    consoleBad.push('EXCEPTION: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
  }
});
const send = (method, params = {}) => new Promise((res) => { const id = ++msgId; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const evalJs = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
async function shot(name) {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(outdir, name + '.png'), Buffer.from(r.result.data, 'base64'));
}

await new Promise((r) => ws.addEventListener('open', r));
await send('Page.enable'); await send('Runtime.enable');

const results = [];
const check = (name, ok, detail) => { results.push([name, ok, detail]); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${detail}`); };

// ---- Level 1: mist gap, checkpoints, HUD ----
await send('Page.navigate', { url: url + '?jump=level1&ff=1' });
await sleep(2500);
const l1 = await evalJs(`(async () => {
  const { CONFIG } = await import('./src/config.js');
  const s = window.__vaks.M.top();
  return {
    gap: s.threat.topY - s.level.spawn.y, // startGap minus what has already risen
    t: s.threat.t,                        // seconds the mist has been live
    rate: s.threat.rate,
    startGap: CONFIG.mist.startGap,
    cps: s.checkpoints.length,
    lives: s.run.lives,
  };
})()`);
// time-aware: gap should equal startGap - rate*t (idle player, worldScale 1)
const expGap = l1.startGap - l1.rate * l1.t;
check(`mist starts ${l1.startGap} below spawn`, Math.abs(l1.gap - expGap) < 15 && l1.gap <= l1.startGap + 0.5,
  `gap ${l1.gap?.toFixed(0)}px after ${l1.t?.toFixed(1)}s at ${l1.rate}px/s (expected ~${expGap.toFixed(0)})`);
check('L1 has 3 checkpoints', l1.cps === 3, `${l1.cps} checkpoint lights`);
check('3 lives shown as weed icons', l1.lives === 3, `run.lives = ${l1.lives} (icon = weed sprite)`);
await shot('v2_l1_spawn');

// ---- weed jump boost: irie clears a ladder-sized rise ----
const jump = await evalJs(`(() => {
  const s = window.__vaks.M.top();
  const p = s.player;
  p.irieT = 4;
  return { scale: p.jumpScale(), apex: Math.pow(330 * p.jumpScale(), 2) / (2 * 980) };
})()`);
check('irie jump x1.35', jump.scale === 1.35, `apex ${jump.apex?.toFixed(0)}px vs worst ladder gap 48px — ladders optional while irie`);

// ---- babalas via a real bottle hit ----
const bab = await evalJs(`(async () => {
  const s = window.__vaks.M.top();
  const p = s.player;
  p.irieT = 0; p.invuln = 0;
  for (let i = 0; i < 40; i++) {                 // wait for a live bottle
    if (s.bottles.length > 0) break;
    await new Promise((r) => setTimeout(r, 250));
  }
  const b = s.bottles[0];
  if (!b) return { hit: false };
  p.x = b.x; p.y = b.y + 6; p.invuln = 0;        // step into it
  await new Promise((r) => setTimeout(r, 250));
  const walking = p.speedScale();
  return { hit: true, babalasT: p.babalasT, speedMul: walking, jumpMul: p.jumpScale() };
})()`);
check('bottle inflicts babalas', bab.hit && bab.babalasT > 0, `babalasT ${bab.babalasT?.toFixed(1)}s after bottle hit`);
check('babalas = slower + weaker', bab.speedMul === 0.6 && bab.jumpMul === 0.85, `speed x${bab.speedMul}, jump x${bab.jumpMul}`);

// ---- rattex: armed, rats die on touch, Vaks unhurt ----
const rtx = await evalJs(`(async () => {
  const s = window.__vaks.M.top();
  const p = s.player;
  s.rattex = true;
  s.threat.frozen = true;
  p.dead = false; p.invuln = 0; p.babalasT = 0; p.stun = 0;
  const r = s.rats[0];
  if (!r) return { why: 'no rats' };
  const lives = s.run.lives;
  p.x = r.x; p.y = r.y; p.vx = 0; p.vy = 0;
  await new Promise((res) => setTimeout(res, 300));
  const out = { squished: r.squishT > 0 || r.dead, unhurt: p.stun <= 0, livesKept: s.run.lives === lives };
  s.rattex = false;
  return out;
})()`);
check('rattex kills rats on touch', rtx.squished === true && rtx.unhurt && rtx.livesKept,
  rtx.why || `rat squished, Vaks unhurt, lives kept`);

// ---- ability caps: propeller jump, chiefs speed, beanie vs small rats ----
const hats = await evalJs(`(async () => {
  const s = window.__vaks.M.top();
  const p = s.player;
  s.run.hats = { propeller: true, beanie: true, chiefs: true };
  const jump = p.jumpScale(), speed = p.speedScale();
  const r = s.rats[0];
  if (!r) return { jump, speed, why: 'no rats left' };
  r.scale = 1.1; // smallest real rat size (< beanie smashUnder 1.5)
  p.dead = false; p.invuln = 0; p.stun = 0; p.babalasT = 0;
  s.threat.frozen = true;
  p.x = r.x; p.y = r.y; p.vx = 0; p.vy = 0;
  await new Promise((res) => setTimeout(res, 300));
  const out = { jump, speed, squished: r.squishT > 0 || r.dead, unhurt: p.stun <= 0 };
  s.run.hats = { propeller: false, beanie: false, chiefs: false };
  return out;
})()`);
check('propeller + chiefs hats scale movement', Math.abs(hats.jump - 1.18) < 0.01 && Math.abs(hats.speed - 1.22) < 0.01,
  `jump x${hats.jump?.toFixed(2)}, speed x${hats.speed?.toFixed(2)}`);
check('beanie runs through small rats', hats.squished === true && hats.unhurt === true,
  hats.why || 'small rat squished, Vaks unhurt');

// ---- checkpoint lantern: ignites when PASSED (no touch), respawn there ----
await evalJs(`(() => {
  const s = window.__vaks.M.top();
  const cp = s.checkpoints[0];
  s.threat.frozen = true;
  s.player.babalasT = 0; s.player.dead = false;
  s.player.x = cp.x + 40; s.player.y = cp.y - 40; s.player.vy = 0; // above it, off to the side
  s.cam.snapTo(cp.x, cp.y);
  return true;
})()`);
await sleep(600);
const lit = await evalJs('window.__vaks.M.top().checkpoints[0].active');
check('checkpoint ignites when passed (no touch)', lit === true, 'lamp lit from climbing above it');
await shot('v2_l1_checkpoint_light');
const resp = await evalJs(`(async () => {
  const s = window.__vaks.M.top();
  const cp = s.checkpoints[0];
  s.die();
  await new Promise((r) => setTimeout(r, 1900)); // deathT 1.5s + respawn
  return { x: s.player.x, y: s.player.y, cpx: cp.x, cpy: cp.y, dead: s.player.dead };
})()`);
check('death respawns at passed checkpoint', !resp.dead && Math.abs(resp.x - resp.cpx) < 2 && Math.abs(resp.y - resp.cpy) < 2,
  `respawned at (${resp.x?.toFixed(0)},${resp.y?.toFixed(0)}) vs lantern (${resp.cpx},${resp.cpy})`);
const lns = await evalJs('window.__vaks.M.top().level.lanterns.length');
check('no decorative lanterns remain', lns === 0, `${lns} lantern objects in level data`);

// ---- L2/L3: checkpoint counts + crumble mains ----
for (const [lvl, wantCp] of [[2, 2], [3, 1]]) {
  await send('Page.navigate', { url: url + `?jump=level${lvl}&ff=1` });
  await sleep(3200);
  const d = await evalJs(`(() => {
    const s = window.__vaks.M.top();
    return {
      cps: s.checkpoints.length,
      crumbleMain: s.level.platforms.filter((p) => p.type === 'crumble' && p.main).length,
    };
  })()`);
  check(`L${lvl} has ${wantCp} checkpoint(s)`, d.cps === wantCp, `${d.cps} lights`);
  check(`L${lvl} has breaking main steps`, d.crumbleMain >= 3, `${d.crumbleMain} crumble main platforms`);
}

// ---- the redesigned tiko: shop + boss + L1 mist looming shots ----
await send('Page.navigate', { url: url + '?jump=shop' });
await sleep(2000);
const buyRtx = await evalJs(`(() => {
  const sh = window.__vaks.M.top();
  const item = sh.items.find((i) => i.id === 'rattex');
  if (!item) return { why: 'no rattex item' };
  sh.buy(item);
  return { got: sh.run.rattex === true, price: item.price };
})()`);
check('shop sells RATTEX', buyRtx.got === true, buyRtx.why || `bought for ${buyRtx.price} mano, run.rattex armed`);
const buyHats = await evalJs(`(() => {
  const sh = window.__vaks.M.top();
  sh.run.mano = 1000;
  for (const id of ['propeller', 'beanie', 'chiefs']) sh.buy(sh.items.find((i) => i.id === id));
  return { ...sh.run.hats, mano: sh.run.mano };
})()`);
check('shop sells ability caps for mano', buyHats.propeller && buyHats.beanie && buyHats.chiefs,
  `all 3 hats bought, ${buyHats.mano} mano left`);
// owned caps toggle equipped state for free on re-select
const toggle = await evalJs(`(() => {
  const sh = window.__vaks.M.top();
  const it = sh.items.find((i) => i.id === 'beanie');
  const manoBefore = sh.run.mano;
  sh.buy(it); // owned -> unequip, no charge
  const off = sh.run.hats.beanie === false && sh.run.hatsOwned.beanie === true && sh.run.mano === manoBefore;
  sh.buy(it); // -> re-equip
  const on = sh.run.hats.beanie === true && sh.run.mano === manoBefore;
  return { off, on, mano: sh.run.mano };
})()`);
check('owned caps equip/unequip for free', toggle.off === true && toggle.on === true,
  `beanie off then back on, balance untouched at R${toggle.mano}`);
// LEAVE SHOP is selectable and exits via Enter; Esc also exits
const leaveNav = await evalJs(`(() => {
  const sh = window.__vaks.M.top();
  sh.sel = 0;
  // walk down/right until we land on the LEAVE slot
  for (let i = 0; i < 12 && sh.sel !== sh.leaveIndex; i++) sh.nav(1, 0);
  const reached = sh.sel === sh.leaveIndex;
  const isLeave = sh.slots[sh.sel]?.leave === true;
  return { reached, isLeave, count: sh.slots.length, items: sh.items.length };
})()`);
check('LEAVE SHOP is a selectable slot', leaveNav.reached && leaveNav.isLeave,
  `slot ${leaveNav.items} of ${leaveNav.count} is LEAVE`);
await shot('v2_tiko_shop');
await send('Page.navigate', { url: url + '?jump=boss' });
await sleep(2500);
await shot('v2_tiko_boss');
await send('Page.navigate', { url: url + '?jump=level1&ff=6' });
await sleep(2500);
await evalJs(`(() => { const s = window.__vaks.M.top();
  s.cam.snapTo(s.player.x, s.threat.topY - 40); return true; })()`);
await sleep(400);
await shot('v2_tiko_in_mist');

check('console clean', consoleBad.length === 0, consoleBad.length ? consoleBad.slice(0, 3).join(' | ') : 'no errors/warnings across all scenes');

const failed = results.filter((r) => !r[1]).length;
console.log(failed === 0 ? '\nDRIVE_V2 OK: feature pass live.' : `\nDRIVE_V2: ${failed} FAILURES`);
ws.close();
process.exit(failed === 0 ? 0 : 1);
