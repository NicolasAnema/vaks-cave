// TEMP dev driver: screenshots the title, how-to-play, and shop screens
// (shop with a bark showing) and asserts a clean console. Delete after use.
//   node tools/drive_ui_check.mjs <port> <baseUrl> <outdir>

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [, , port = '9333', base = 'http://localhost:3000/', outdir = 'shots'] = process.argv;
mkdirSync(outdir, { recursive: true });

const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
const targets = await listRes.json();
let page = targets.find((t) => t.type === 'page');
if (!page) {
  const created = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(base)}`, { method: 'PUT' });
  page = await created.json();
}

const ws = new WebSocket(page.webSocketDebuggerUrl);
let msgId = 0;
const pending = new Map();
const consoleLog = [];

ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  else if (m.method === 'Runtime.consoleAPICalled') {
    const text = (m.params.args || []).map((a) => a.value ?? a.description ?? '').join(' ');
    consoleLog.push({ level: m.params.type, text });
  } else if (m.method === 'Log.entryAdded') {
    consoleLog.push({ level: m.params.entry.level, text: m.params.entry.text });
  } else if (m.method === 'Runtime.exceptionThrown') {
    consoleLog.push({ level: 'error', text: 'EXCEPTION: ' + JSON.stringify(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text) });
  }
});

function send(method, params = {}) {
  return new Promise((resolve) => { const id = ++msgId; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function key(code, holdMs = 60) {
  const vk = { Enter: 13, Escape: 27, Space: 32, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, KeyM: 77 }[code] || 0;
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', code, key: code, windowsVirtualKeyCode: vk });
  await sleep(holdMs);
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code, key: code, windowsVirtualKeyCode: vk });
}
async function shot(name) {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(outdir, name + '.png'), Buffer.from(r.result.data, 'base64'));
  console.log('shot:', name);
}
const evalJs = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result?.result?.value;

await new Promise((r) => ws.addEventListener('open', r));
await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');

// fresh save so NEW GAME shows first and the shop first-visit bark fires
await send('Page.navigate', { url: base + '?nosave=1' });
await sleep(2500);
await evalJs('try{localStorage.clear()}catch(e){}');

await send('Page.navigate', { url: base });
await sleep(2500);
await shot('u01_title');           // F hint top-left, no footer line
await key('Enter');                // -> main menu
await sleep(700);
await key('Enter');                // NEW GAME -> how to play
await sleep(700);
await shot('u02_howtoplay');
await key('Escape');               // back to menu
await sleep(600);

// shop with mano, fresh visit => keeper line + first-visit bark subtitle
await send('Page.navigate', { url: base + '?jump=shop' });
await sleep(2600);
await shot('u03_shop_enter');      // first-visit bark subtitle showing
await key('ArrowRight');           // browse -> quip subtitle
await sleep(700);
await shot('u04_shop_browse');
await key('ArrowDown');            // move to lower shelf / leave row
await sleep(700);
await shot('u05_shop_lower');

const errors = await evalJs('window.__errors.length');
console.log('\n--- window.__errors:', errors);
let bad = 0;
for (const c of consoleLog) {
  const isBad = c.level === 'error' || c.level === 'warning' || c.level === 'warn';
  if (isBad) bad++;
  if (isBad) console.log(`  [${c.level}] ${c.text.slice(0, 160)}`);
}
console.log(bad === 0 && errors === 0 ? '\nDRIVE OK: zero console errors/warnings.' : `\nDRIVE FAIL: ${bad} bad console entries, ${errors} window errors`);
ws.close();
process.exit(bad === 0 && errors === 0 ? 0 : 1);
