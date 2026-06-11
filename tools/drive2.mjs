// Dev-only CDP driver, pass 2: cutscene Enter-skip, pause menu flow,
// clear screen. node tools/drive2.mjs <port> <url> <outdir>

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [, , port = '9333', url = 'http://localhost:4173/', outdir = 'shots2'] = process.argv;
mkdirSync(outdir, { recursive: true });

const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let msgId = 0;
const pending = new Map();
const consoleLog = [];

ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  else if (m.method === 'Runtime.consoleAPICalled') consoleLog.push({ level: m.params.type, text: (m.params.args || []).map((a) => a.value ?? '').join(' ') });
  else if (m.method === 'Log.entryAdded') consoleLog.push({ level: m.params.entry.level, text: m.params.entry.text });
  else if (m.method === 'Runtime.exceptionThrown') consoleLog.push({ level: 'error', text: 'EXC ' + (m.params.exceptionDetails.text || '') });
});

const send = (method, params = {}) => new Promise((res) => { const id = ++msgId; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function key(code, holdMs = 60) {
  const vk = { Enter: 13, Escape: 27, Space: 32, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, KeyM: 77, KeyT: 84, KeyI: 73, Digit1: 49 }[code] || 0;
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', code, key: code, windowsVirtualKeyCode: vk });
  await sleep(holdMs);
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code, key: code, windowsVirtualKeyCode: vk });
}
async function shot(name) {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(outdir, name + '.png'), Buffer.from(r.result.data, 'base64'));
  console.log('shot:', name);
}

await new Promise((r) => ws.addEventListener('open', r));
await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');

// 1. cutscene Enter-skip: jump straight into the cold open (no wipe), wait, skip
await send('Page.navigate', { url: url + '?jump=cutscene:cold_open' });
await sleep(3000);
await shot('e01_cold_open_playing');
await key('Enter');           // skip -> onDone -> menu (via jump cb)
await sleep(1400);
await shot('e02_after_skip_menu');

// 2. pause flow inside a real level
await send('Page.navigate', { url: url + '?jump=level1&ff=5' });
await sleep(2000);
await key('Escape');
await sleep(400);
await shot('e03_pause');
await key('ArrowDown'); await key('ArrowDown'); await key('Enter');  // SETTINGS
await sleep(400);
await shot('e04_pause_settings');
await key('ArrowDown'); await key('ArrowRight');                     // tweak music volume
await key('Escape');                                                  // back to pause
await sleep(300);
await key('Escape');                                                  // resume
await sleep(400);
await key('KeyT'); await key('KeyI');
await sleep(200);
await shot('e05_resumed_toggles');

// 3. clear screen
await send('Page.navigate', { url: url + '?jump=clear' });
await sleep(1800);
await shot('e06_clear');

// 4. shop purchase: jump=shop gives 40 crystals; buy EXTRA LIFE
await send('Page.navigate', { url: url + '?jump=shop&ff=1' });
await sleep(1600);
await key('Enter'); // buy extra life
await sleep(500);
await shot('e07_shop_bought');

const errors = await send('Runtime.evaluate', { expression: 'window.__errors.length', returnByValue: true });
const n = errors.result.result.value;
let bad = 0;
for (const c of consoleLog) {
  if (c.level === 'error' || c.level === 'warning' || c.level === 'warn') { bad++; console.log('[BAD]', c.level, c.text.slice(0, 140)); }
}
console.log(bad === 0 && n === 0 ? 'DRIVE2 OK: clean console.' : `DRIVE2 FAIL: ${bad} console, ${n} window errors`);
ws.close();
process.exit(bad === 0 && n === 0 ? 0 : 1);
