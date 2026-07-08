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
import { getLevel, buildTutorialLevel } from './data/levels.js';
import { CUTSCENES, SCENE_ORDER } from './data/cutscenes.js';
import { verifyLevels } from './verify.js';
import { LevelScreen } from './game/level.js';
import { BossScreen } from './game/boss.js';
import { GardenBossScreen } from './game/garden_boss.js';
import { CutsceneScreen } from './game/cutscene.js';
import { ShopScreen } from './game/shop.js?v=2';
import {
  TitleScreen, MainMenuScreen, LevelSelectScreen, JukeboxScreen, GalleryScreen,
  SettingsScreen, CreditsScreen, LoadingScreen, PauseScreen, GameOverScreen, ClearScreen,
  InventoryScreen, DevMenuScreen,
} from './ui/menus.js';
import { MuteButton } from './ui/mute_button.js';

// ---------------- screen manager ----------------

const M = {
  stack: [],
  trans: null,
  replace(s, wipe = true, keepVoice = false) {
    Barks.clear();
    if (!keepVoice) AudioManager.stopVoice();   // the level-clear handoff keeps the "finished" voice note playing through
    AudioManager.stopClear();                   // the GTA "mission passed" fanfare belongs to the LEVEL CLEAR screen only — never let it bleed past
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
  { t: 'tutorial' },              // the control drill: its own arena before L1
  { t: 'level', n: 1 },
  { t: 'cutscene', id: 'hole_wall' },
  { t: 'shop', after: 1 },
  { t: 'cutscene', id: 'green_lung' },
  { t: 'level', n: 2 },
  { t: 'cutscene', id: 'follower' },
  { t: 'shop', after: 2 },
  { t: 'cutscene', id: 'load_shedding' },
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
  { t: 'cutscene', id: 'granny_corner' },
  { t: 'boss', variant: 'granny' },
  { t: 'cutscene', id: 'granny_outro' },
  { t: 'cutscene', id: 'ending' },
  { t: 'credits' },
];

function newRun() {
  return {
    lives: livesForLevel(1), score: 0, mano: 0, earned: 0,
    currentLevel: 0,   // which level's lives are loaded (0 = none yet)
    bonusLives: 0,     // permanent +1s bought in the shop / earned at R200 milestones
    bossAt: -1, bossRound: 0,  // vibe-boss checkpoint: which boss + the round reached

    faintCharm: false, rattex: false,
    hats: { propeller: false, beanie: false, chiefs: false },        // equipped (active abilities)
    hatsOwned: { propeller: false, beanie: false, chiefs: false },   // purchased
  };
}

let run = newRun();
let flowIdx = 0;

function flowIndexOfLevel(n) { return FLOW.findIndex((f) => f.t === 'level' && f.n === n); }

// You start each level with as many lives as its number WITHIN its world:
// World 1 (the cave) is L1/L2/L3 -> 1/2/3 lives; World 2 (the township) is
// L4/L5/L6, also its 1st/2nd/3rd -> 1/2/3 lives. Permanent bonus lives (shop /
// R200 milestones) stack on top of this base. See goFlow()'s level branch.
function livesForLevel(n) { return ((n - 1) % 3) + 1; }

// the most recent 'level' node before flow index i (used by the boss fights)
function prevLevelNodeBefore(i) {
  for (let k = i - 1; k >= 0; k--) if (FLOW[k].t === 'level') return FLOW[k].n;
  return null;
}

// out of lives: drop back to the previous level (keeping mano/score/upgrades),
// where lives reload to that level's base. Nothing precedes L1, so that is the
// only true GAME OVER.
function goBackToLevel(prevN) {
  run.currentLevel = 0;            // force a fresh-entry life reload on arrival
  AudioManager.restartNext = true; // restart the level song from the top, not mid-track
  startRunAt(flowIndexOfLevel(prevN), false);
}
function loseAllLives(failedLevelN) {
  const prev = failedLevelN > 1 ? failedLevelN - 1 : null;
  if (prev) goBackToLevel(prev); else gameOver();
}
function gameOver() {
  M.replace(new GameOverScreen({
    onContinue: () => startRunAt(flowIndexOfLevel(1), true), // fresh run from L1
    onQuit: toMenu,
  }));
}

// level select hands back an entry: a level number or a boss variant. Bosses
// are reachable here for testing; startRunAt drives them like any flow node
// (it even picks the right world for the loading card by flow index).
function startFromSelect(e) {
  const i = e.kind === 'boss'
    ? FLOW.findIndex((f) => f.t === 'boss' && (f.variant || 'tiko') === e.variant)
    : flowIndexOfLevel(e.n);
  startRunAt(i, true);
}

function saveProgress() {
  Save.data.flowNode = flowIdx;
  Save.data.runSnapshot = { ...run };
  Save.save();
}

function nextFlow() { goFlow(flowIdx + 1); }

function toMenu() {
  M.replace(new MainMenuScreen(menuCbs()));
}

function toTitle() {
  M.replace(new TitleScreen({ onStart: () => M.replace(new MainMenuScreen(menuCbs()), true, true) }));
}

function goTitleShop() {
  const shopRun = Save.data.runSnapshot
    ? { ...newRun(), ...Save.data.runSnapshot }
    : Object.assign(newRun(), { mano: 200 });
  M.replace(new ShopScreen(shopRun, 0, {
    leaveLabel: 'BACK TO MENU',
    onDone: () => {
      if (Save.data.runSnapshot) { Save.data.runSnapshot = { ...shopRun }; Save.save(); }
      toMenu();
    },
  }));
}

function pushPause(under, restart) {
  M.push(new PauseScreen(under, {
    onResume: () => M.pop(),
    onRestart: () => { M.pop(); restart(); },
    onInventory: () => M.push(new InventoryScreen(run, { onBack: () => M.pop() })),
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
    // Fresh arrival at a level reloads lives to its base (level-in-world number)
    // plus any permanent bonus lives. A same-level death-restart keeps whatever
    // lives are left, so each death just costs one and restarts from the top.
    if (run.currentLevel !== node.n) {
      run.currentLevel = node.n;
      run.lives = livesForLevel(node.n) + (run.bonusLives || 0);
    }
    const ls = new LevelScreen(level, run, {
      onClear: (stats) => {
        Save.unlockLevel(Math.min(6, node.n + 1));
        // keepVoice: let the "I'M FINISHED, YOUR ROOM" note play on through the wipe into the clear screen
        M.replace(new ClearScreen(level.name, stats, { onDone: nextFlow }), true, true);
      },
      // a single death restarts THIS level (no checkpoints)
      onRestart: () => goFlow(flowIndexOfLevel(node.n)),
      // out of lives: fall back one level (or GAME OVER if this is the first)
      onGameOver: () => loseAllLives(node.n),
      onPause: () => pushPause(ls, () => goFlow(flowIndexOfLevel(node.n))),
    });
    M.replace(ls);
  } else if (node.t === 'tutorial') {
    // the standalone control drill: a tiny arena, no threats, no death — the
    // drill itself clears the screen and the flow marches on to L1
    const tutIdx = i;
    const ts = new LevelScreen(buildTutorialLevel(), run, {
      onClear: () => nextFlow(),
      onRestart: () => goFlow(tutIdx),
      onGameOver: () => goFlow(tutIdx),
      onPause: () => pushPause(ts, () => goFlow(tutIdx)),
    }, { tutorial: true });
    M.replace(ts);
  } else if (node.t === 'shop') {
    M.replace(new ShopScreen(run, node.after, { onDone: nextFlow }));
  } else if (node.t === 'boss') {
    const bossIdx = i;
    // Rounds are checkpoints. A FRESH arrival at this boss starts at round 0; a
    // retry after being caught resumes from the round reached (run.bossRound).
    if (run.bossAt !== bossIdx) { run.bossAt = bossIdx; run.bossRound = 0; }
    const cb = {
      onWin: () => { run.bossAt = -1; run.bossRound = 0; nextFlow(); },
      onCaught: (round) => {
        run.bossRound = round || 0;   // checkpoint at the round reached
        run.lives--;
        if (run.lives < 0) {
          // out of lives: fall back to the level that leads into this fight
          run.bossAt = -1; run.bossRound = 0;
          const pn = prevLevelNodeBefore(bossIdx);
          if (pn) goBackToLevel(pn); else gameOver();
        } else {
          goFlow(bossIdx);   // still got lives: retry from the checkpoint round
        }
      },
      onPause: () => pushPause(bs, () => goFlow(bossIdx)),
    };
    // the granny finale is a different game (TEND THE PLAAS); the cave boss is the
    // vibe-off whose rounds are checkpoints (the garden boss has no rounds)
    const bs = node.variant === 'granny'
      ? new GardenBossScreen(run, cb)
      : new BossScreen(run, cb, { startRound: run.bossRound });
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
  // township begins at the chase_begins cutscene (looked up, not hardcoded —
  // FLOW inserts shift indices)
  const w2Start = FLOW.findIndex((f) => f.t === 'cutscene' && f.id === 'chase_begins');
  const world2 = (node.t === 'level' && node.n >= 4) || i >= w2Start;
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

// ---------------- dev playground (debug builds) ----------------

// reopens itself so a viewed scene / closed shop lands back in the dev hub
function openDev() {
  M.replace(new DevMenuScreen({
    // jump straight to the standalone tutorial arena node
    onTutorial: () => startRunAt(FLOW.findIndex((f) => f.t === 'tutorial'), true),
    onLevelSelect: () => M.replace(new LevelSelectScreen({ onPick: startFromSelect, onBack: openDev })),
    onCutscenes: openDevGallery,
    onShop: () => { run = newRun(); run.mano = 500; M.replace(new ShopScreen(run, 4, { leaveLabel: 'BACK TO DEV', onDone: openDev })); },
    onJukebox: () => M.replace(new JukeboxScreen({ onBack: openDev })),
    onFullRun: () => startRunAt(0, true),
    onReset: () => { Save.reset(); openDev(); },
    onBack: toMenu,
  }));
}

// dev cutscene viewer: every scene unlocked, backs out to the dev hub
function openDevGallery() {
  Save.data.scenes = [...SCENE_ORDER];
  M.replace(new GalleryScreen({
    onPlay: (id) => M.replace(new CutsceneScreen(id, { onDone: openDevGallery })),
    onBack: openDev,
  }));
}

function menuCbs() {
  return {
    onContinue: () => {
      run = { ...newRun(), ...(Save.data.runSnapshot || {}) };
      startRunAt(Math.max(0, Save.data.flowNode), false);
    },
    // straight into the run — the L1 opening now walks the player through every
    // control live, so there's no static how-to-play card up front anymore.
    onNewGame: () => startRunAt(0, true),
    onLevelSelect: () => M.replace(new LevelSelectScreen({
      onPick: startFromSelect,
      onBack: toMenu,
    })),
    onShop: goTitleShop,
    onJukebox: () => M.replace(new JukeboxScreen({ onBack: toMenu })),
    onGallery: openGallery,
    onSettings: () => M.replace(new SettingsScreen({ onBack: toMenu })),
    onCredits: () => M.replace(new CreditsScreen({ onDone: toMenu })),
    onDev: openDev,
  };
}

// ---------------- data-driven wiring (cutscene rows) ----------------

function wireDataRows() {
  for (const sc of Object.values(CUTSCENES)) {
    sc.steps.forEach((s, i) => {
      if ((s[0] === 'say' || s[0] === 'bark') && typeof s[2] === 'string' && s[2].startsWith('m_')) {
        Barks.wireData(s[2], `cutscene:${sc.id} step ${i}`);
      }
      if (s[0] === 'wire' && typeof s[1] === 'string' && s[1].startsWith('m_')) {
        Barks.wireData(s[1], `cutscene:${sc.id} step ${i}`);
      }
      if (s[0] === 'voice_note' && typeof s[2] === 'string' && s[2].startsWith('m_')) {
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

function handleDebugKeys() {
  if (!CONFIG.debug) return;
  // never let a debug hotkey bypass an unskippable cutscene (e.g. the intro)
  const top = M.top();
  if (top && top.scene && top.scene.noSkip) return;
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
  // (the old KeyC "cycle cutscenes" hotkey was removed — it let players skip
  // scenes. Cutscenes are still reachable for testing via ?jump=cutscene:<id>.)
}

// ---------------- boot ----------------

async function boot() {
  Save.load();
  initRender();
  await initSprites(); // decodes the embedded photo heads
  await AudioManager.init(); // discovers uploaded voice notes / music
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

  M.replace(new TitleScreen({ onStart: () => M.replace(new MainMenuScreen(menuCbs()), true, true) }), false);

  if (jump) {
    if (jump === 'menu') M.replace(new MainMenuScreen(menuCbs()), false);
    else if (jump === 'levelselect') { Save.data.unlockedLevel = 6; M.replace(new LevelSelectScreen({ onPick: startFromSelect, onBack: toMenu }), false); }
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
    acc += Math.min(dt, 0.1);
    let steps = 0;
    // hidden on the title/home screen; pinned on top of every other screen
    const showMute = !(M.top() instanceof TitleScreen);
    while (acc >= STEP && steps < 4) {
      handleDebugKeys();
      M.update(STEP);
      if (showMute) MuteButton.update(STEP); // read clicks before endFrame clears them
      Input.endFrame();
      acc -= STEP;
      steps++;
    }
    const ctx = getCtx();
    M.draw(ctx);
    if (showMute) MuteButton.draw(ctx);
    present();
  }
  requestAnimationFrame(frame);
}

// only boot in a browser; tools/check.mjs imports this module in Node
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}
