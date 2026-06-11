// Dev-only CDP driver (not part of the game): drives the served game
// in headless Edge with real key events, captures screenshots, and
// records every console message so we can prove a clean console
// during play. Uses Node's built-in WebSocket; zero dependencies.
//
//   node tools/drive.mjs <edge-path> <port> <url> <outdir>

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [, , port = '9333', url = 'http://localhost:4173/', outdir = 'shots'] = process.argv;
mkdirSync(outdir, { recursive: true });

const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
const targets = await listRes.json();
let page = targets.find((t) => t.type === 'page');
if (!page) {
  const created = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  page = await created.json();
}

const ws = new WebSocket(page.webSocketDebuggerUrl);
let msgId = 0;
const pending = new Map();
const consoleLog = [];

ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  } else if (m.method === 'Runtime.consoleAPICalled') {
    const text = (m.params.args || []).map((a) => a.value ?? a.description ?? '').join(' ');
    consoleLog.push({ level: m.params.type, text });
  } else if (m.method === 'Log.entryAdded') {
    consoleLog.push({ level: m.params.entry.level, text: m.params.entry.text });
  } else if (m.method === 'Runtime.exceptionThrown') {
    consoleLog.push({ level: 'error', text: 'EXCEPTION: ' + JSON.stringify(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text) });
  }
});

function send(method, params = {}) {
  return new Promise((resolve) => {
    const id = ++msgId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function key(code, holdMs = 60) {
  const vk = { Enter: 13, Escape: 27, Space: 32, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40,
    KeyM: 77, KeyB: 66, KeyC: 67, KeyI: 73, KeyT: 84, Digit1: 49, Digit2: 50, Digit3: 51, Digit4: 52, Digit5: 53, Digit6: 54 }[code] || 0;
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', code, key: code, windowsVirtualKeyCode: vk });
  await sleep(holdMs);
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code, key: code, windowsVirtualKeyCode: vk });
}

async function hold(code, ms) { return key(code, ms); }

async function shot(name) {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(outdir, name + '.png'), Buffer.from(r.result.data, 'base64'));
  console.log('shot:', name);
}

async function evalJs(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  return r.result?.result?.value;
}

await new Promise((r) => ws.addEventListener('open', r));
await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');

await send('Page.navigate', { url });
await sleep(2500);

await shot('d01_title');
await key('Enter');               // title -> main menu
await sleep(700);
await shot('d02_menu');
await key('Enter');               // NEW GAME -> loading
await sleep(2300);                // loading 1.7s -> cold open
await shot('d03_cold_open');
await key('Enter');               // skip cutscene -> level 1
await sleep(1000);
await shot('d04_level1_intro');
await sleep(2200);                // intro card passes
await hold('ArrowRight', 900);    // walk right
await key('Space');               // jump
await sleep(600);
await key('KeyM');                // meow
await sleep(500);
await shot('d05_level1_play');
await key('KeyT');                // freeze threat
await key('KeyI');                // invincible
await sleep(300);
await shot('d06_debug_toggles');
await key('Escape');              // pause
await sleep(400);
await shot('d07_pause');
await key('ArrowDown'); await key('ArrowDown'); await key('Enter'); // pause -> settings
await sleep(400);
await shot('d08_pause_settings');
await key('ArrowRight');          // adjust a slider
await key('Escape');              // back to pause
await key('Escape');              // resume
await sleep(300);
await key('Digit4');              // debug key: jump to level 4
await sleep(2400);                // loading
await sleep(2600);                // intro card
await hold('ArrowRight', 1200);
await key('Space');
await sleep(700);
await shot('d09_level4_play');
await key('KeyB');                // debug: boss
await sleep(2500);
await key('Space');               // try a beat
await sleep(400);
await shot('d10_boss');
await key('KeyC');                // debug: cycle cutscene 1
await sleep(900);
await key('KeyC');                // cutscene 2
await sleep(900);
await shot('d11_cutscene_cycle');

const errors = await evalJs('window.__errors.length');
const bootLog = await evalJs("document.getElementById('boot-log').textContent.slice(0, 200)");

console.log('\n--- window.__errors:', errors);
console.log('--- boot-log head:', JSON.stringify(bootLog));
console.log('\n--- console messages during play:');
let bad = 0;
for (const c of consoleLog) {
  const isBad = c.level === 'error' || c.level === 'warning' || c.level === 'warn';
  if (isBad) bad++;
  console.log(`  [${c.level}] ${c.text.slice(0, 160)}`);
}
console.log(bad === 0 && errors === 0 ? '\nDRIVE OK: zero console errors/warnings during play.' : `\nDRIVE FAIL: ${bad} bad console entries, ${errors} window errors`);
ws.close();
process.exit(bad === 0 && errors === 0 ? 0 : 1);
