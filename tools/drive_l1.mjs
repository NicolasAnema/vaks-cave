// Dev-only CDP audit for the Level 1 "cave chaos" pass: proves the
// crumble steps, mist, and rats function live, with a clean console.
//   node tools/drive_l1.mjs <port> <url>

const [, , port = '9333', url = 'http://localhost:4173/'] = process.argv;

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

await new Promise((r) => ws.addEventListener('open', r));
await send('Page.enable'); await send('Runtime.enable');

const results = [];
const check = (name, ok, detail) => { results.push([name, ok, detail]); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${detail}`); };

await send('Page.navigate', { url: url + '?jump=level1&ff=5' });
await sleep(2500);

// ---- level data: falling steps + rats landed in L1 ----
const data = await evalJs(`(() => {
  const s = window.__vaks.M.top();
  const P = s.level.platforms;
  return {
    crumbleMain: P.filter((p) => p.type === 'crumble' && p.main).length,
    crumbleAll: P.filter((p) => p.type === 'crumble').length,
    rats: s.rats.length,
    ratHostsSolid: s.rats.every((r) => P.some((p) => p.type === 'solid' && Math.abs(p.y - r.y) <= 4 && r.x >= p.x && r.x <= p.x + p.w)),
    mistRate: s.threat.rate,
    tut: s.level.tutorials.some((t) => /STEPS GIVE WAY/.test(t.text)),
  };
})()`);
check('L1 has falling main steps', data.crumbleMain >= 5, `${data.crumbleMain} crumble main / ${data.crumbleAll} total`);
check('L1 has 3 rats', data.rats === 3, `${data.rats} rats placed`);
check('rat ledges stay solid', data.ratHostsSolid === true, 'no rat rides a falling step');
check('mist rate bumped', data.mistRate === 20, `rate ${data.mistRate}px/s`);
check('falling-step tutorial sign', data.tut === true, 'CRACKED STEPS GIVE WAY present');

// ---- crumble lifecycle: stand on one, watch it give way in ~0.4s ----
const cr = await evalJs(`(() => {
  const s = window.__vaks.M.top();
  const p = s.level.platforms.find((q) => q.type === 'crumble' && q.main);
  s.threat.frozen = true;
  s.player.x = p.x + p.w / 2; s.player.y = p.y; s.player.vx = 0; s.player.vy = 0;
  s.cam.snapTo(s.player.x, s.player.y);
  s.standOn(p);
  const st = s.crumbleState.get(p);
  window.__l1p = p;
  return st ? st.timer : null;
})()`);
check('crumble timer is L1-fast', cr !== null && Math.abs(cr - 0.4) < 0.01, `armed at ${cr}s (delayByLevel)`);
await sleep(900);
const gone = await evalJs(`(() => {
  const s = window.__vaks.M.top();
  const st = s.crumbleState.get(window.__l1p);
  return st ? st.gone : 'no-state';
})()`);
check('step gives way', gone === true, 'platform gone ~0.4s after standing');
const inSolid = await evalJs(`window.__vaks.M.top().solidPlatforms().includes(window.__l1p)`);
check('gone step has no collision', inSolid === false, 'excluded from solidPlatforms()');
await sleep(4200);
const back = await evalJs(`!window.__vaks.M.top().crumbleState.has(window.__l1p)`);
check('step respawns', back === true, 'state cleared after ~4s');

// ---- mist: rises at the new rate, kills on contact, resets on respawn ----
await evalJs(`(() => { const s = window.__vaks.M.top(); s.threat.frozen = false;
  s.player.respawn(s.respawnPoint.x, s.respawnPoint.y); return true; })()`);
const m1 = await evalJs('window.__vaks.M.top().threat.topY');
await sleep(2000);
const m2 = await evalJs('window.__vaks.M.top().threat.topY');
const risen = m1 - m2;
check('mist rises ~20px/s', risen > 30 && risen < 50, `${risen.toFixed(0)}px in 2s`);
const killRes = await evalJs(`(() => {
  const s = window.__vaks.M.top();
  s.player.y = s.threat.topY + 30; // drop into the mist
  return new Promise((r) => setTimeout(() => r(s.player.dead), 300));
})()`);
check('mist kills on contact', killRes === true, 'player dead after touching mist');
await sleep(2000); // death timer (1.5s) elapses -> respawn
const reset = await evalJs(`(() => {
  const s = window.__vaks.M.top();
  return { dead: s.player.dead, gap: s.threat.topY - s.respawnPoint.y };
})()`);
check('mist resets below respawn', reset.dead === false && reset.gap > 150 && reset.gap <= 215, `gap ${reset.gap?.toFixed(0)}px after respawn (resetGap 215)`);

// ---- rats: buffed speed + hitbox, stomp still works ----
const rat = await evalJs(`(() => {
  const s = window.__vaks.M.top();
  const r = s.rats[0];
  const hb = r.hitbox();
  // path length, not displacement: a patrol bouncing off its bounds can net ~0
  let path = 0, last = r.x;
  const iv = setInterval(() => { path += Math.abs(r.x - last); last = r.x; }, 50);
  return new Promise((res) => setTimeout(() => { clearInterval(iv); res({ hbW: hb.w, hbH: hb.h, path }); }, 1000));
})()`);
check('rat hitbox widened', rat.hbW === 16 && rat.hbH === 9, `hitbox ${rat.hbW}x${rat.hbH}`);
check('rat patrols at buffed speed', rat.path > 40, `path ${rat.path?.toFixed(0)}px in 1s (speed 52)`);
const stomp = await evalJs(`(() => {
  const s = window.__vaks.M.top();
  const r = s.rats[0];
  s.threat.frozen = true;
  s.player.x = r.x; s.player.y = r.y - 10; s.player.vy = 200; // falling onto it
  return new Promise((res) => setTimeout(() => res({ squish: r.squishT > 0 || r.dead, bounce: s.player.vy < 0 }), 250));
})()`);
check('stomp counterplay intact', stomp.squish === true, `rat squished, bounce=${stomp.bounce}`);

// ---- console hygiene over the whole run ----
check('console clean', consoleBad.length === 0, consoleBad.length ? consoleBad.slice(0, 3).join(' | ') : 'no errors/warnings during play');

const failed = results.filter((r) => !r[1]).length;
console.log(failed === 0 ? '\nDRIVE_L1 OK: cave-chaos pass live.' : `\nDRIVE_L1: ${failed} FAILURES`);
ws.close();
process.exit(failed === 0 ? 0 : 1);
