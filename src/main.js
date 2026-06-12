// ============================================================
// MAIN — boot, fixed-timestep loop, screen manager with pixel
// wipes, the full game flow (title -> cold open -> L1..L6 with
// shops -> boss -> ending -> credits -> menu), debug keys and
// the boot reports (manifest coverage + completability).
// ============================================================

import { CONFIG } from './config.js';
import { initRender, getCtx, present, View, drawWipe } from './engine/render.js';
import { Input } from './engine/input.js';
import { initSprites } from './engine/sprites.js';
import { drawText } from './engine/font.js';
import { Particles } from './engine/particles.js';
import { AudioManager, Barks, coverageReport } from './systems/audio.js';
import { Save } from './systems/save.js';
import { getLevel } from './data/levels.js';
import { CUTSCENES, SCENE_ORDER } from './data/cutscenes.js';
import { verifyLevels } from './verify.js';
import { LevelScreen } from './game/level.js';
import { BossScreen } from './game/boss.js';
import { CutsceneScreen } from './game/cutscene.js';
import { ShopScreen } from './game/shop.js';
import {
  TitleScreen, MainMenuScreen, LevelSelectScreen, JukeboxScreen, GalleryScreen,
  SettingsScreen, CreditsScreen, LoadingScreen, PauseScreen, GameOverScreen, ClearScreen,
} from './ui/menus.js';

// ---------------- screen manager ----------------

const M = {
  stack: [],
  trans: null,
  replace(s, wipe = true) {
    Barks.clear();
    Particles.clear();
    if (!wipe || this.stack.length === 0) { this.stack = [s]; return; }
    this.trans = { t: 0, phase: 'out', next: s };
  },
  push(s) { this.stack.push(s); },
  pop() { this.stack.pop(); },
  top() { return this.stack[this.stack.length - 1]; },
  update(dt) {
    if (this.trans) {
      this.trans.t += dt * 3.0;
      if (this.trans.phase === 'out' && this.trans.t >= 1) {
        this.stack = [this.trans.next];
        this.trans.phase = 'in';
        this.trans.t = 0;
      } else if (this.trans.phase === 'in' && this.trans.t >= 1) {
        this.trans = null;
      }
      return;
    }
    const t = this.top();
    if (t) t.update(dt);
  },
  draw(ctx) {
    const t = this.top();
    if (t) t.draw(ctx);
    else { ctx.fillStyle = '#07070d'; ctx.fillRect(0, 0, View.w, View.h); }
    if (this.trans) drawWipe(ctx, this.trans.phase === 'out' ? this.trans.t : 1 - this.trans.t);
  },
};

// ---------------- run state + flow ----------------

const FLOW = [
  { t: 'cutscene', id: 'cold_open' },
  { t: 'level', n: 1 },
  { t: 'cutscene', id: 'doubt1' },
  { t: 'shop', after: 1 },
  { t: 'level', n: 2 },
  { t: 'cutscene', id: 'doubt2' },
  { t: 'shop', after: 2 },
  { t: 'level', n: 3 },
  { t: 'cutscene', id: 'boss_intro' },
  { t: 'boss' },
  { t: 'cutscene', id: 'boss_resolve' },
  { t: 'cutscene', id: 'chase_begins' },
  { t: 'level', n: 4 },
  { t: 'shop', after: 4 },
  { t: 'level', n: 5 },
  { t: 'shop', after: 5 },
  { t: 'level', n: 6 },
  { t: 'cutscene', id: 'ending' },
  { t: 'credits' },
];

function newRun() {
  return {
    lives: CONFIG.lives.start, score: 0, mano: 0, earned: 0,
    irieStash: false, faintCharm: false, rattex: false,
    hats: { propeller: false, beanie: false, chiefs: false },
  };
}

let run = newRun();
let flowIdx = 0;

function flowIndexOfLevel(n) { return FLOW.findIndex((f) => f.t === 'level' && f.n === n); }

function saveProgress() {
  Save.data.flowNode = flowIdx;
  Save.data.runSnapshot = { ...run };
  Save.save();
}

function nextFlow() { goFlow(flowIdx + 1); }

function toMenu() {
  M.replace(new MainMenuScreen(menuCbs()));
}

function pushPause(under, restart) {
  M.push(new PauseScreen(under, {
    onResume: () => M.pop(),
    onRestart: () => { M.pop(); restart(); },
    onSettings: () => M.push(new SettingsScreen({ onBack: () => M.pop() })),
    onQuit: () => { M.pop(); toMenu(); },
  }));
}

function goFlow(i) {
  if (i >= FLOW.length) { finishRun(); return; }
  flowIdx = i;
  const node = FLOW[i];
  if (node.t !== 'credits') saveProgress();

  if (node.t === 'cutscene') {
    if (node.id === 'chase_begins') AudioManager.play('world_transition', 'cave -> township');
    if (node.id === 'ending') AudioManager.play('ending');
    M.replace(new CutsceneScreen(node.id, {
      onDone: () => { Save.unlockScene(node.id); nextFlow(); },
    }));
  } else if (node.t === 'level') {
    const level = getLevel(node.n);
    Save.unlockLevel(node.n);
    const ls = new LevelScreen(level, run, {
      onClear: (stats) => {
        Save.unlockLevel(Math.min(6, node.n + 1));
        M.replace(new ClearScreen(level.name, stats, { onDone: nextFlow }));
      },
      onGameOver: () => M.replace(new GameOverScreen({
        onContinue: () => { run.lives = CONFIG.lives.start; goFlow(flowIndexOfLevel(node.n)); },
        onQuit: toMenu,
      })),
      onPause: () => pushPause(ls, () => goFlow(flowIndexOfLevel(node.n))),
    });
    M.replace(ls);
  } else if (node.t === 'shop') {
    M.replace(new ShopScreen(run, node.after, { onDone: nextFlow }));
  } else if (node.t === 'boss') {
    const bossIdx = i;
    const bs = new BossScreen(run, {
      onWin: nextFlow,
      onCaught: () => {
        run.lives--;
        if (run.lives < 0) {
          M.replace(new GameOverScreen({
            onContinue: () => { run.lives = CONFIG.lives.start; goFlow(bossIdx); },
            onQuit: toMenu,
          }));
        } else {
          goFlow(bossIdx);
        }
      },
      onPause: () => pushPause(bs, () => goFlow(bossIdx)),
    });
    M.replace(bs);
  } else if (node.t === 'credits') {
    M.replace(new CreditsScreen({ onDone: finishRun }));
  }
}

function finishRun() {
  Save.data.flowNode = -1;
  Save.data.runSnapshot = null;
  Save.data.bestScore = Math.max(Save.data.bestScore, run.score);
  Save.save();
  toMenu();
}

function startRunAt(i, freshRun) {
  if (freshRun) run = newRun();
  const node = FLOW[i];
  const world2 = (node.t === 'level' && node.n >= 4) || i >= 11;
  M.replace(new LoadingScreen(
    world2 ? 'THE TOWNSHIP WAKES...' : 'THE CAVE CALLS...',
    world2 ? 'world2' : 'world1',
    { onDone: () => goFlow(i) },
  ));
}

// gallery reopens itself after a replay
function openGallery() {
  M.replace(new GalleryScreen({
    onPlay: (id) => M.replace(new CutsceneScreen(id, { onDone: openGallery })),
    onBack: toMenu,
  }));
}

function menuCbs() {
  return {
    onContinue: () => {
      run = { ...newRun(), ...(Save.data.runSnapshot || {}) };
      startRunAt(Math.max(0, Save.data.flowNode), false);
    },
    onNewGame: () => startRunAt(0, true),
    onLevelSelect: () => M.replace(new LevelSelectScreen({
      onPick: (n) => startRunAt(flowIndexOfLevel(n), true),
      onBack: toMenu,
    })),
    onJukebox: () => M.replace(new JukeboxScreen({ onBack: toMenu })),
    onGallery: openGallery,
    onSettings: () => M.replace(new SettingsScreen({ onBack: toMenu })),
    onCredits: () => M.replace(new CreditsScreen({ onDone: toMenu })),
  };
}

// ---------------- data-driven wiring (cutscene rows) ----------------

function wireDataRows() {
  for (const sc of Object.values(CUTSCENES)) {
    sc.steps.forEach((s, i) => {
      if ((s[0] === 'say' || s[0] === 'bark') && typeof s[2] === 'string' && s[2].startsWith('m_')) {
        Barks.wireData(s[2], `cutscene:${sc.id} step ${i}`);
      }
    });
  }
}

export function bootReports() {
  wireDataRows();
  const cov = coverageReport();
  const ver = verifyLevels();
  return { cov, ver };
}

// ---------------- debug ----------------

let debugCutsceneIdx = -1;
let fps = 60;

function handleDebugKeys() {
  if (!CONFIG.debug) return;
  for (let d = 1; d <= 6; d++) {
    if (Input.wasPressed('Digit' + d)) {
      Save.unlockLevel(d);
      startRunAt(flowIndexOfLevel(d), true);
      return;
    }
  }
  if (Input.wasPressed('KeyB')) {
    run = newRun();
    goFlow(FLOW.findIndex((f) => f.t === 'boss'));
  }
  if (Input.wasPressed('KeyC')) {
    debugCutsceneIdx = (debugCutsceneIdx + 1) % SCENE_ORDER.length;
    const id = SCENE_ORDER[debugCutsceneIdx];
    M.replace(new CutsceneScreen(id, { onDone: () => { Save.unlockScene(id); toMenu(); } }), false);
  }
}

function drawDebugOverlay(ctx) {
  if (!CONFIG.debug) return;
  ctx.fillStyle = 'rgba(5,6,12,0.6)';
  ctx.fillRect(0, View.h - 9, View.w, 9);
  drawText(ctx, 'FPS ' + Math.round(fps) + '  EV: ' + AudioManager.lastEvent + '  MUS: ' + (AudioManager.music || '-'),
    2, View.h - 8, { color: '#5fd08a' });
}

// ---------------- boot ----------------

async function boot() {
  Save.load();
  initRender();
  await initSprites(); // decodes the embedded photo heads
  Input.init();

  const { cov, ver } = bootReports();
  if (CONFIG.debug) {
    console.log(cov.lines.join('\n'));
    console.log(ver.lines.join('\n'));
    const logEl = document.getElementById('boot-log');
    if (logEl) logEl.textContent += '\n' + cov.lines.join('\n') + '\n' + ver.lines.join('\n');
  }

  // query-param jump for automated checks: ?jump=menu|level3|boss|shop|cutscene:ending
  const jump = new URLSearchParams(location.search).get('jump');

  M.replace(new TitleScreen({ onStart: () => M.replace(new MainMenuScreen(menuCbs())) }), false);

  if (jump) {
    if (jump === 'menu') M.replace(new MainMenuScreen(menuCbs()), false);
    else if (jump === 'levelselect') { Save.data.unlockedLevel = 6; M.replace(new LevelSelectScreen({ onPick: (n) => startRunAt(flowIndexOfLevel(n), true), onBack: toMenu }), false); }
    else if (jump.startsWith('level')) startRunAt(flowIndexOfLevel(parseInt(jump.slice(5), 10) || 1), true);
    else if (jump === 'boss') { run = newRun(); goFlow(FLOW.findIndex((f) => f.t === 'boss')); }
    else if (jump === 'shop') { run = newRun(); run.mano = 500; M.replace(new ShopScreen(run, 4, { onDone: toMenu }), false); }
    else if (jump.startsWith('cutscene:')) M.replace(new CutsceneScreen(jump.split(':')[1], { onDone: toMenu }), false);
    else if (jump === 'jukebox') M.replace(new JukeboxScreen({ onBack: toMenu }), false);
    else if (jump === 'gallery') { Save.data.scenes = [...SCENE_ORDER]; openGallery(); }
    else if (jump === 'settings') M.replace(new SettingsScreen({ onBack: toMenu }), false);
    else if (jump === 'credits') M.replace(new CreditsScreen({ onDone: toMenu }), false);
    else if (jump === 'gameover') M.replace(new GameOverScreen({ onContinue: toMenu, onQuit: toMenu }), false);
    else if (jump === 'clear') M.replace(new ClearScreen('SHALLOW SHAFT', { time: 61.2, mano: 14, deaths: 1, timeBonus: 150 }, { onDone: toMenu }), false);
  }

  // debug handle for automated smoke tests
  if (CONFIG.debug) window.__vaks = { M };

  // debug fast-forward for headless checks: ?ff=5 steps 5s before first draw
  const ff = parseFloat(new URLSearchParams(location.search).get('ff') || '0');
  if (CONFIG.debug && ff > 0) {
    for (let i = 0; i < Math.min(ff, 60) * 60; i++) {
      M.update(1 / 60);
      Input.endFrame();
    }
  }

  // fixed-timestep loop
  const STEP = 1 / 60;
  let last = performance.now();
  let acc = 0;

  function frame(now) {
    requestAnimationFrame(frame);
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0) fps += ((1 / dt) - fps) * 0.05;
    acc += Math.min(dt, 0.1);
    let steps = 0;
    while (acc >= STEP && steps < 4) {
      handleDebugKeys();
      M.update(STEP);
      Input.endFrame();
      acc -= STEP;
      steps++;
    }
    const ctx = getCtx();
    M.draw(ctx);
    drawDebugOverlay(ctx);
    present();
  }
  requestAnimationFrame(frame);
}

// only boot in a browser; tools/check.mjs imports this module in Node
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}
