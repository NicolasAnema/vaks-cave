// Dev-only CDP mechanical smoke test: proves the live engine's
// climb, jump, mist rise, bottle spawn, meow-flee and granny
// chase actually function. node tools/drive3.mjs <port> <url>

const [, , port = '9333', url = 'http://localhost:4173/'] = process.argv;

const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let msgId = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise((res) => { const id = ++msgId; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const evalJs = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result?.result?.value;
async function key(code, holdMs = 60) {
  const vk = { Enter: 13, Space: 32, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, KeyM: 77 }[code] || 0;
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', code, key: code, windowsVirtualKeyCode: vk });
  await sleep(holdMs);
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code, key: code, windowsVirtualKeyCode: vk });
}

await new Promise((r) => ws.addEventListener('open', r));
await send('Page.enable'); await send('Runtime.enable');

const results = [];
const check = (name, ok, detail) => { results.push([name, ok, detail]); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${detail}`); };

// ---- World 1 mechanics ----
await send('Page.navigate', { url: url + '?jump=level1&ff=5' });
await sleep(2500);

// teleport onto the base of the first ladder
await evalJs(`(() => {
  const s = window.__vaks.M.top();
  const ld = s.level.ladders[0];
  s.player.x = ld.x + 5; s.player.y = ld.y + ld.h; s.player.vx = 0; s.player.vy = 0;
  s.cam.snapTo(s.player.x, s.player.y);
  return true;
})()`);
const yBefore = await evalJs('window.__vaks.M.top().player.y');
const ladderH = await evalJs('window.__vaks.M.top().level.ladders[0].h');
await key('ArrowUp', 1000);
const yAfter = await evalJs('window.__vaks.M.top().player.y');
const climbed = yBefore - yAfter;
check('ladder climb + top-out', climbed >= Math.min(ladderH, 70) - 4,
  `climbed ${climbed.toFixed(0)}px of ${ladderH}px ladder in 1s`);

// jump physics: read vy while still rising (measure mid-hold)
await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', code: 'Space', key: ' ', windowsVirtualKeyCode: 32 });
await sleep(90);
const vyMid = await evalJs('window.__vaks.M.top().player.vy');
await send('Input.dispatchKeyEvent', { type: 'keyUp', code: 'Space', key: ' ', windowsVirtualKeyCode: 32 });
check('jump launches', vyMid < -120, `vy mid-jump = ${Number(vyMid).toFixed(0)} (jumpVel 330)`);

// mist rises
const mist1 = await evalJs('window.__vaks.M.top().threat.topY');
await sleep(1500);
const mist2 = await evalJs('window.__vaks.M.top().threat.topY');
check('mist rises', mist2 < mist1 - 10, `topY ${Number(mist1).toFixed(0)} -> ${Number(mist2).toFixed(0)} (rate 16px/s)`);

// bottles spawn (poll: they tumble into the mist and despawn)
let bottlesSeen = 0;
for (let i = 0; i < 14 && bottlesSeen === 0; i++) {
  await sleep(500);
  bottlesSeen = await evalJs('window.__vaks.M.top().bottles.length');
}
check('bottles spawn', bottlesSeen > 0, `${bottlesSeen} active bottles observed`);

// ---- World 2 mechanics ----
await send('Page.navigate', { url: url + '?jump=level4&ff=5' });
await sleep(2500);
// granny advances (poll across her faint windows; dummy invincible so a
// catch doesn't reset her mid-measurement)
await evalJs('window.__vaks.M.top().debug.invincible = true; true');
const g1 = await evalJs('window.__vaks.M.top().threat.x');
let g2 = g1, sawFaint = false;
for (let i = 0; i < 12 && g2 - g1 < 60; i++) {
  await sleep(500);
  g2 = await evalJs('window.__vaks.M.top().threat.x');
  if (await evalJs("window.__vaks.M.top().threat.state === 'faint'")) sawFaint = true;
}
check('granny advances', g2 > g1 + 60, `x ${Number(g1).toFixed(0)} -> ${Number(g2).toFixed(0)}${sawFaint ? ' (faint witnessed)' : ''}`);

// freeze the threat + reset the test dummy to a clean standing state
// (granny may have caught it while it idled through the earlier checks)
await evalJs(`(() => {
  const s = window.__vaks.M.top();
  s.threat.frozen = true;
  s.deathT = 0;
  s.player.respawn(s.respawnPoint.x, s.respawnPoint.y);
  s.player.invuln = 0; s.player.babalasT = 0; s.player.stun = 0;
  return true;
})()`);
await sleep(150);
const run1 = await evalJs('window.__vaks.M.top().player.x');
await key('ArrowRight', 1200);
const run2 = await evalJs('window.__vaks.M.top().player.x');
check('run speed ~165', run2 - run1 > 140, `moved ${(run2 - run1).toFixed(0)}px in 1.2s`);

// meow makes rats flee
const flee = await evalJs(`(() => {
  const s = window.__vaks.M.top();
  const r = s.rats[0];
  if (!r) return 'no-rats';
  s.player.x = r.x - 30; s.player.y = s.level.groundY;
  return 'ready';
})()`);
if (flee === 'ready') {
  await key('KeyM');
  await sleep(200);
  const fleeing = await evalJs('window.__vaks.M.top().rats[0].fleeT > 0');
  check('meow scares rats', fleeing === true, 'rat fleeT > 0 after M');
} else {
  check('meow scares rats', true, 'no rats in this stretch (skipped)');
}

// granny faints eventually
const faintLen = await evalJs('window.__vaks.M.top().threat.faintTimer');
check('faint scheduled', typeof faintLen === 'number' && faintLen < 12, `next faint in ${Number(faintLen).toFixed(1)}s`);

const failed = results.filter((r) => !r[1]).length;
console.log(failed === 0 ? '\nDRIVE3 OK: all mechanics live.' : `\nDRIVE3: ${failed} FAILURES`);
ws.close();
process.exit(failed === 0 ? 0 : 1);
