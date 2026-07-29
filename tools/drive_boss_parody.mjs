// Full CAVE FM regression: uses real keyboard events to complete the
// direction + Space deck check, prove an early press is punished, observe the
// two unannounced Round 1 VIBE rewinds, complete three rounds, watch the
// load-shedding transition into Round 3, and enter the resolution scene.
//
//   node tools/drive_boss_parody.mjs <cdpPort> <baseUrl> <outdir>

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [
  , ,
  port = '9333',
  base = 'http://127.0.0.1:4173/',
  outdir = 'boss-shots',
  mode = 'full',
] = process.argv;
mkdirSync(outdir, { recursive: true });

const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
const targets = await listRes.json();
let page = targets.find((target) => target.type === 'page');
if (!page) {
  const created = await fetch(
    `http://127.0.0.1:${port}/json/new?${encodeURIComponent(base)}`,
    { method: 'PUT' },
  );
  page = await created.json();
}

const ws = new WebSocket(page.webSocketDebuggerUrl);
let msgId = 0;
const pending = new Map();
const consoleLog = [];

ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  } else if (message.method === 'Runtime.consoleAPICalled') {
    const text = (message.params.args || []).map((arg) => arg.value ?? arg.description ?? '').join(' ');
    consoleLog.push({ level: message.params.type, text });
  } else if (message.method === 'Log.entryAdded') {
    consoleLog.push({
      level: message.params.entry.level,
      text: message.params.entry.text,
    });
  } else if (message.method === 'Runtime.exceptionThrown') {
    consoleLog.push({
      level: 'error',
      text: 'EXCEPTION: ' + JSON.stringify(
        message.params.exceptionDetails.exception?.description
        || message.params.exceptionDetails.text,
      ),
    });
  }
});

function send(method, params = {}) {
  return new Promise((resolve) => {
    const id = ++msgId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const VK = {
  Enter: 13,
  Escape: 27,
  Space: 32,
  ArrowLeft: 37,
  ArrowUp: 38,
  ArrowRight: 39,
  ArrowDown: 40,
  KeyI: 73,
};

async function key(code, holdMs = 35) {
  await send('Input.dispatchKeyEvent', {
    type: 'rawKeyDown',
    code,
    key: code,
    windowsVirtualKeyCode: VK[code] || 0,
  });
  await sleep(holdMs);
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    code,
    key: code,
    windowsVirtualKeyCode: VK[code] || 0,
  });
}

async function shot(name) {
  const result = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(outdir, name + '.png'), Buffer.from(result.result.data, 'base64'));
  console.log('shot:', name);
}

const evalJs = async (expression) => (
  await send('Runtime.evaluate', { expression, returnByValue: true })
).result?.result?.value;

async function bossState() {
  return evalJs(`(() => {
    const s = window.__vaks?.M?.top();
    if (!s) return null;
    return {
      screen: s.constructor?.name || '',
      phase: s.phase || '',
      round: s.round,
      t: s.t,
      syncHits: s.syncHits,
      vibe: s.vibe,
      promptSerial: s.promptSerial,
      scratchPranks: s.scratchPranks || 0,
      loadsheddingT: s.loadsheddingT || 0,
      blackout: !!s.blackout,
      currentPrompt: s.currentPrompt ? {
        key: s.currentPrompt.key,
        spawnT: s.currentPrompt.spawnT,
        hitT: s.currentPrompt.hitT,
        travelTime: s.currentPrompt.travelTime,
        progress: s.promptProgress(),
        scratch: !!s.currentPrompt.scratch,
        scratchTriggered: !!s.currentPrompt.scratch?.triggered,
      } : null,
    };
  })()`);
}

async function waitState(test, label, timeoutMs = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const state = await bossState();
    if (state && test(state)) return state;
    await sleep(25);
  }
  throw new Error(`Timed out waiting for ${label}: ${JSON.stringify(await bossState())}`);
}

async function hitCurrentPrompt() {
  const state = await waitState(
    (s) => (s.phase === 'tutorial' || s.phase === 'fight') && !!s.currentPrompt,
    'an active prompt',
  );
  const prompt = state.currentPrompt;
  const waitMs = Math.max(0, (prompt.hitT - state.t) * 1000 - 7);
  await sleep(waitMs);
  await key(prompt.key, 24);
  await waitState(
    (s) => s.phase !== state.phase
      || !s.currentPrompt
      || s.currentPrompt.spawnT !== prompt.spawnT,
    `prompt ${prompt.key} to resolve`,
  );
  return prompt;
}

async function missCurrentPrompt() {
  const state = await waitState(
    (s) => s.phase === 'fight' && !!s.currentPrompt,
    'an emergency prompt to miss',
  );
  const prompt = state.currentPrompt;
  const waitMs = Math.max(0, (prompt.hitT - state.t) * 1000 - 7);
  await sleep(waitMs);
  const wrongKey = prompt.key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
  await key(wrongKey, 24);
  await waitState(
    (s) => s.vibe < state.vibe,
    `missed ${prompt.key} to cost VIBE`,
  );
  return prompt;
}

async function clearRound(round, roundShot) {
  await waitState(
    (s) => s.phase === 'fight' && s.round === round && !!s.currentPrompt,
    `round ${round + 1} to begin`,
  );
  await shot(roundShot);

  while (true) {
    const state = await waitState(
      (s) => s.round !== round
        || s.phase !== 'fight'
        || !!s.currentPrompt,
      `round ${round + 1} prompt`,
    );
    if (state.round !== round || state.phase !== 'fight') break;
    if (round === 0 && state.currentPrompt?.scratch && !state.currentPrompt.scratchTriggered) {
      const nearLine = await waitState(
        (s) => s.phase === 'fight'
          && s.currentPrompt?.scratch
          && !s.currentPrompt.scratchTriggered
          && s.currentPrompt.progress >= 0.8,
        'vinyl prompt to approach the line',
      );
      const beforeRewind = nearLine.currentPrompt.progress;
      const rewound = await waitState(
        (s) => s.phase === 'fight'
          && s.currentPrompt?.scratch
          && s.currentPrompt.scratchTriggered
          && s.currentPrompt.progress < beforeRewind - 0.05,
        'vinyl prompt to rewind',
      );
      await shot(`round_one_rewind_${rewound.scratchPranks}`);
    }
    await hitCurrentPrompt();
  }
  await waitState(
    (s) => s.round === round && s.phase === 'round_clear',
    `round ${round + 1} clear`,
  );
}

await new Promise((resolve) => ws.addEventListener('open', resolve));
await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
await send('Page.navigate', { url: base + '?jump=boss' });
await sleep(700);
await evalJs('localStorage.clear(); location.reload()');
await waitState(
  (s) => s.phase === 'tutorial' && s.currentPrompt?.key === 'ArrowLeft',
  'arrow deck check',
);
await shot('s01_arrow_tutorial');
await hitCurrentPrompt();
await waitState(
  (s) => s.phase === 'tutorial' && s.currentPrompt?.key === 'Space',
  'Space VIBE deck check',
);
await shot('s02_space_tutorial');
await hitCurrentPrompt();
await waitState(
  (s) => s.phase === 'round_intro' && s.round === 0,
  'round one intro',
);
await shot('s02b_round_one_intro');

if (mode === 'failure') {
  for (let i = 0; i < 3; i++) {
    const missState = await waitState(
      (s) => s.phase === 'fight' && !!s.currentPrompt,
      `failure test prompt ${i + 1}`,
    );
    await key(missState.currentPrompt.key);
    await waitState(
      (s) => s.phase === 'caught' || s.vibe < missState.vibe,
      `failure penalty ${i + 1}`,
    );
  }
  await waitState((s) => s.phase === 'caught', 'three misses to fail');
  await shot('three_misses_caught');
  const failureErrors = await evalJs('window.__errors.length');
  const failureBad = consoleLog.filter(
    (entry) => entry.level === 'error' || entry.level === 'warning' || entry.level === 'warn',
  );
  console.log('window.__errors:', failureErrors);
  console.log(
    failureBad.length === 0 && failureErrors === 0
      ? 'CAVE FM FAILURE DRIVE OK: three early presses reached caught state, console clean.'
      : `CAVE FM FAILURE DRIVE FAIL: ${failureBad.length} bad console entries, ${failureErrors} window errors.`,
  );
  ws.close();
  process.exit(failureBad.length === 0 && failureErrors === 0 ? 0 : 1);
}

// Prove that mashing ahead of the slot now has a real cost.
let state = await waitState(
  (s) => s.phase === 'fight' && s.round === 0 && !!s.currentPrompt,
  'round one',
);
const vibeBeforeEarlyPress = state.vibe;
await key(state.currentPrompt.key);
state = await waitState(
  (s) => s.phase === 'fight' && s.vibe < vibeBeforeEarlyPress,
  'early press penalty',
);
if (!(state.vibe < vibeBeforeEarlyPress && state.syncHits === 0)) {
  throw new Error(`Early press was not punished: ${JSON.stringify(state)}`);
}
await shot('s03_early_press_costs_vibe');

await clearRound(0, 's10_round_one');
const afterRoundOne = await waitState(
  (s) => s.phase === 'round_intro' && s.round === 1,
  'round two intro',
);
if (afterRoundOne.scratchPranks !== 2) {
  throw new Error(`Round 1 did not play exactly two rewinds: ${JSON.stringify(afterRoundOne)}`);
}
await shot('s06b_round_two_intro');
await clearRound(1, 's11_requests_open');
await waitState(
  (s) => s.phase === 'loadshedding',
  'load-shedding transition',
);
await shot('s09a_loadshedding_slowdown');
await waitState(
  (s) => s.phase === 'loadshedding' && s.blackout,
  'power to cut',
);
await shot('s09b_loadshedding_blackout');
await waitState(
  (s) => s.phase === 'loadshedding' && s.loadsheddingT >= 3.2,
  'cat eyes and target to appear',
);
await shot('s09c_loadshedding_focus');
await waitState(
  (s) => s.phase === 'fight' && s.round === 2 && !!s.currentPrompt,
  'round three to begin directly',
);
await clearRound(2, 's12_eskom_round');

await waitState((s) => s.phase === 'final', 'final drop');
await shot('s13_final_drop');
await waitState((s) => s.screen === 'CutsceneScreen', 'resolution scene', 12000);
await sleep(1200);
await shot('s14_resolution_scene');

const errors = await evalJs('window.__errors.length');
console.log('window.__errors:', errors);

let bad = 0;
for (const entry of consoleLog) {
  const isBad = entry.level === 'error' || entry.level === 'warning' || entry.level === 'warn';
  if (!isBad) continue;
  bad++;
  console.log(`[${entry.level}] ${entry.text.slice(0, 200)}`);
}

console.log(
  bad === 0 && errors === 0
    ? 'CAVE FM CHALLENGE DRIVE OK: real keys, two rewinds, load shedding, all rounds, zero console errors/warnings.'
    : `CAVE FM CHALLENGE DRIVE FAIL: ${bad} bad console entries, ${errors} window errors.`,
);
ws.close();
process.exit(bad === 0 && errors === 0 ? 0 : 1);
