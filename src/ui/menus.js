// ============================================================
// MENUS & UI SCREENS — title, main menu, level select, jukebox,
// scene gallery, settings, credits, loading, pause, game over,
// level clear. All keyboard-navigable.
// ============================================================

import { CONFIG } from '../config.js';
import { View, dimScreen, panel } from '../engine/render.js';
import { Input } from '../engine/input.js';
import { drawText, textWidth, LINE_H } from '../engine/font.js';
import { draw } from '../engine/sprites.js';
import { drawScene } from '../engine/bg.js';
import { Particles } from '../engine/particles.js';
import { AudioManager, Barks } from '../systems/audio.js';
import { Save } from '../systems/save.js';
import { MUSIC_SLOTS, TIPS } from '../data/manifest.js';
import { SCENE_ORDER, CUTSCENES } from '../data/cutscenes.js';

const barkGarden = Barks.wire('m_garden', 'menus.js: title screen');
const barkNewSong = Barks.wire('m_new_song', 'menus.js: jukebox select');

// Browsers block audio until the first user gesture. While audio is still
// locked, the menus show a pulsing "click to play" button; any click unlocks
// the sound (AudioManager wires the gesture) and the button vanishes.
export function drawSoundButton(ctx, t, cy = View.h - 38) {
  if (AudioManager.musicPlaying()) return; // only prompt while no sound is playing
  const label = 'CLICK TO PLAY SOUND';
  const bw = textWidth(label) + 22, bh = 18;
  const x = Math.round(View.w / 2 - bw / 2), y = cy;
  const pulse = 0.55 + 0.45 * Math.sin(t * 4);
  panel(ctx, x, y, bw, bh, { border: '#ffe49a', bg: 'rgba(20,28,48,0.95)' });
  // little speaker glyph + label
  ctx.globalAlpha = 0.5 + 0.5 * pulse;
  drawText(ctx, label, View.w / 2, y + 5, { color: '#ffe49a', align: 'center' });
  ctx.globalAlpha = 1;
}
const barkMenuIdle = Barks.wire('m_idle_pool', 'menus.js: menu idle pool');
const barkMenuIdle2 = Barks.wire('m_im_good', 'menus.js: menu idle check-in');

function hint(ctx, text) {
  drawText(ctx, text, View.w / 2, View.h - 10, { color: '#5a6280', align: 'center' });
}

class MenuIdle {
  constructor() { this.t = 0; this.alt = false; }
  update(dt) {
    this.t += dt;
    if (this.t > CONFIG.timers.menuIdleAfter) {
      this.t = 0;
      this.alt = !this.alt;
      AudioManager.play('menu_idle');
      (this.alt ? barkMenuIdle : barkMenuIdle2)({ subtitle: true, speaker: 'VAKS' });
    }
    if (Input.pressed.size > 0) this.t = 0;
  }
}

// ---------------- title ----------------

export class TitleScreen {
  constructor(cb) {
    this.cb = cb; // { onStart() }
    this.t = 0;
    this.idle = new MenuIdle();
    this.started = false;
    AudioManager.playMusic(AudioManager.menuTrack); // jukebox pick carries over (defaults to 'title')
  }

  update(dt) {
    if (!this.started) {
      this.started = true;
      barkGarden({ subtitle: true, speaker: 'VAKS', force: true });
    }
    this.t += dt;
    this.idle.update(dt);
    if (Math.random() < 0.06) Particles.leaf(120 + Math.random() * 80, 200);
    Particles.update(dt);
    Barks.update(dt);
    if (Input.wasPressed('Enter')) this.cb.onStart();
    if (Input.wasPressed('KeyM')) {
      const s = Save.data.settings;
      if (s.master === 0) {
        s.master = this._preMuteVol || 8;
      } else {
        this._preMuteVol = s.master;
        s.master = 0;
      }
      Save.save();
      AudioManager.applyVolumes();
    }
  }

  draw(ctx) {
    drawScene(ctx, 'garden', this.t);
    draw(ctx, 'vaks_rake', Math.floor(this.t * 2) % 2, 110, 218);
    Particles.draw(ctx, false);

    const bob = Math.sin(this.t * 1.4) * 3;
    drawText(ctx, "VAK'S CAVE", View.w / 2 + 2, 48 + bob + 2, { color: '#1d1710', scale: 4, align: 'center' });
    drawText(ctx, "VAK'S CAVE", View.w / 2, 48 + bob, { color: '#ffe49a', scale: 4, align: 'center' });
    drawText(ctx, 'A BABALAS LEGEND IN TWO ACTS', View.w / 2, 86 + bob, { color: '#f4f0e0', align: 'center' });

    // while no sound is playing the button sits where PRESS ENTER goes;
    // once music is playing the button vanishes and PRESS ENTER appears
    if (!AudioManager.musicPlaying()) {
      drawSoundButton(ctx, this.t, 146);
    } else if (Math.floor(this.t * 1.6) % 2 === 0) {
      drawText(ctx, 'PRESS ENTER', View.w / 2, 150, { color: '#fff', scale: 2, align: 'center' });
    }

    drawText(ctx, 'F: FULLSCREEN', 6, 7, { color: '#7480a0' });
    Barks.draw(ctx, null);
  }
}

// ---------------- generic list menu ----------------

class ListScreen {
  constructor(title, items, cb) {
    this.title = title;
    this.items = items; // { label():string, run(), disabled():bool, hint? }
    this.cb = cb;
    this.sel = 0;
    this.t = 0;
    this.idle = new MenuIdle();
  }

  moveSel(d) {
    const n = this.items.length;
    for (let i = 0; i < n; i++) {
      this.sel = (this.sel + d + n) % n;
      if (!(this.items[this.sel].disabled && this.items[this.sel].disabled())) break;
    }
  }

  update(dt) {
    this.t += dt;
    this.idle.update(dt);
    Particles.update(dt);
    Barks.update(dt);
    if (Input.wasPressed('ArrowUp')) this.moveSel(-1);
    if (Input.wasPressed('ArrowDown')) this.moveSel(1);
    if (Input.wasPressed('Enter')) {
      const it = this.items[this.sel];
      if (!(it.disabled && it.disabled())) it.run();
    }
    if (Input.wasPressed('Escape') && this.cb.onBack) this.cb.onBack();
  }

  draw(ctx) {
    drawScene(ctx, 'garden', this.t);
    dimScreen(ctx, 0.62);
    drawText(ctx, this.title, View.w / 2, 26, { color: '#ffe49a', scale: 2, align: 'center' });
    const y0 = 66, lh = 16;
    this.items.forEach((it, i) => {
      const dis = it.disabled && it.disabled();
      const col = dis ? '#4a4f63' : (i === this.sel ? '#ffffff' : '#9aa3c0');
      const label = typeof it.label === 'function' ? it.label() : it.label;
      drawText(ctx, label, View.w / 2, y0 + i * lh, { color: col, align: 'center' });
      if (i === this.sel && !dis) {
        const wob = Math.sin(this.t * 6) * 2;
        drawText(ctx, '>', View.w / 2 - 90 + wob, y0 + i * lh, { color: '#ffe49a' });
        drawText(ctx, '<', View.w / 2 + 86 - wob, y0 + i * lh, { color: '#ffe49a' });
      }
    });
    hint(ctx, this.hintText || 'ARROWS: MOVE   ENTER: SELECT   ESC: BACK');
    Barks.draw(ctx, null);
  }
}

// ---------------- main menu ----------------

export class MainMenuScreen extends ListScreen {
  constructor(cb) {
    const hasRun = Save.data.flowNode >= 0;
    const items = [];
    if (hasRun) items.push({ label: 'CONTINUE', run: () => cb.onContinue() });
    items.push({ label: 'NEW GAME', run: () => cb.onNewGame() });
    items.push({ label: 'LEVEL SELECT', run: () => cb.onLevelSelect() });
    items.push({ label: 'SHOP', run: () => cb.onShop() });
    items.push({ label: 'JUKEBOX', run: () => cb.onJukebox() });
    items.push({ label: 'SCENE GALLERY', run: () => cb.onGallery() });
    items.push({ label: 'SETTINGS', run: () => cb.onSettings() });
    items.push({ label: 'CREDITS', run: () => cb.onCredits() });
    // dev playground sits right under credits, only in a debug build
    if (CONFIG.debug) items.push({ label: 'DEV PLAYGROUND', run: () => cb.onDev() });
    super('MAIN MENU', items, cb);
    this.hintText = 'ARROWS: MOVE   ENTER: SELECT';
    AudioManager.playMusic(AudioManager.menuTrack); // the jukebox pick (or 'title') carries over, no restart
  }

  draw(ctx) {
    super.draw(ctx);
    drawSoundButton(ctx, this.t); // shows until the first click unlocks audio
  }
}

// ---------------- dev playground (debug builds only) ----------------

// A one-stop test hub, reached from MAIN MENU > DEV PLAYGROUND. Everything a
// dev wants to jump straight to: level/boss select, the cutscene viewer, the
// shop, the jukebox, a full run from the intro (to test the opening + L1
// tutorial), and a save wipe to re-arm first-run flows.
export class DevMenuScreen extends ListScreen {
  constructor(cb) {
    const st = { armed: false }; // RESET SAVE needs a confirm press
    const items = [
      { label: 'TUTORIAL DRILL',      run: () => cb.onTutorial() },
      { label: 'LEVEL / BOSS SELECT', run: () => cb.onLevelSelect() },
      { label: 'CUTSCENE VIEWER',     run: () => cb.onCutscenes() },
      { label: 'SHOP (500 MANO)',     run: () => cb.onShop() },
      { label: 'JUKEBOX',             run: () => cb.onJukebox() },
      { label: 'FULL RUN FROM INTRO', run: () => cb.onFullRun() },
      { label: () => st.armed ? 'RESET SAVE - PRESS AGAIN TO WIPE' : 'RESET SAVE',
        run: () => { if (st.armed) cb.onReset(); else st.armed = true; } },
    ];
    super('DEV PLAYGROUND', items, cb);
    this.hintText = 'DEV TOOLS - JUMP TO ANYTHING   ESC: BACK';
  }
}

// ---------------- level select ----------------

export class LevelSelectScreen {
  constructor(cb) {
    this.cb = cb; // { onPick(entry), onBack() }
    this.sel = 0;
    this.t = 0;
    // bosses sit after the six levels and are always playable here (test access)
    this.entries = [
      { kind: 'level', n: 1, label: 'LEVEL 1', name: 'SHALLOW SHAFT',      zone: 'THE CAVE' },
      { kind: 'level', n: 2, label: 'LEVEL 2', name: 'WEED BIOME',         zone: 'THE CAVE' },
      { kind: 'level', n: 3, label: 'LEVEL 3', name: 'THE DEEP',           zone: 'THE CAVE' },
      { kind: 'level', n: 4, label: 'LEVEL 4', name: 'TOWNSHIP OUTSKIRTS', zone: 'THE TOWNSHIP' },
      { kind: 'level', n: 5, label: 'LEVEL 5', name: 'KASI MAIN STREET',   zone: 'THE TOWNSHIP' },
      { kind: 'level', n: 6, label: 'LEVEL 6', name: 'HOME STRETCH',       zone: 'THE TOWNSHIP' },
      { kind: 'boss', variant: 'tiko',   label: 'BOSS 1', name: 'BIG TIKOLOSH',  zone: 'THE VIBE-OFF' },
      { kind: 'boss', variant: 'granny', label: 'BOSS 2', name: 'TEND THE PLAAS', zone: 'THE FINALE' },
    ];
  }

  unlocked(e) { return e.kind === 'boss' || e.n <= Save.data.unlockedLevel; }

  update(dt) {
    this.t += dt;
    Barks.update(dt);
    const N = this.entries.length, COLS = 3;
    if (Input.wasPressed('ArrowLeft')) this.sel = (this.sel + N - 1) % N;
    if (Input.wasPressed('ArrowRight')) this.sel = (this.sel + 1) % N;
    if (Input.wasPressed('ArrowUp')) this.sel = (this.sel + N - COLS) % N;
    if (Input.wasPressed('ArrowDown')) this.sel = (this.sel + COLS) % N;
    if (Input.wasPressed('Enter')) {
      const e = this.entries[this.sel];
      if (this.unlocked(e)) this.cb.onPick(e);
    }
    if (Input.wasPressed('Escape')) this.cb.onBack();
  }

  draw(ctx) {
    drawScene(ctx, 'garden', this.t);
    dimScreen(ctx, 0.66);
    drawText(ctx, 'LEVEL SELECT', View.w / 2, 18, { color: '#ffe49a', scale: 2, align: 'center' });
    const COLS = 3;
    this.entries.forEach((e, i) => {
      const col = i % COLS, row = Math.floor(i / COLS);
      const x = 70 + col * 120, y = 46 + row * 64;
      const unlocked = this.unlocked(e);
      const seld = this.sel === i;
      const isBoss = e.kind === 'boss';
      panel(ctx, x, y, 100, 50, { border: seld ? '#ffe49a' : (isBoss ? '#8a4a5a' : '#4a5a8a'), bg: unlocked ? 'rgba(16,20,36,0.92)' : 'rgba(10,10,16,0.92)' });
      drawText(ctx, e.label, x + 50, y + 6, { color: unlocked ? (isBoss ? '#ff9a9a' : '#8ae08a') : '#4a4f63', align: 'center' });
      if (unlocked) {
        drawText(ctx, e.name, x + 50, y + 20, { color: seld ? '#fff' : '#9aa3c0', align: 'center' });
        drawText(ctx, e.zone, x + 50, y + 34, { color: '#5a6280', align: 'center' });
      } else {
        drawText(ctx, 'LOCKED', x + 50, y + 22, { color: '#4a4f63', align: 'center' });
      }
    });
    hint(ctx, 'ARROWS: MOVE   ENTER: PLAY   ESC: BACK');
    Barks.draw(ctx, null);
  }
}

// ---------------- jukebox ----------------

export class JukeboxScreen {
  constructor(cb) {
    this.cb = cb;
    this.sel = 0;
    this.t = 0;
    this.playing = AudioManager.music;
    // only list tracks with a real uploaded file — silent slots are hidden
    this.slots = MUSIC_SLOTS.filter((s) => AudioManager.hasMusic(s.id));
  }

  update(dt) {
    this.t += dt;
    Barks.update(dt);
    const n = this.slots.length;
    if (n > 0) {
      if (Input.wasPressed('ArrowUp')) this.sel = (this.sel + n - 1) % n;
      if (Input.wasPressed('ArrowDown')) this.sel = (this.sel + 1) % n;
      if (Input.wasPressed('Enter')) {
        const slot = this.slots[this.sel];
        AudioManager.play('jukebox_select', slot.id);
        AudioManager.playMusic(slot.id);
        AudioManager.menuTrack = slot.id; // this pick becomes the new title/menu song
        this.playing = slot.id;
        barkNewSong({ subtitle: true, speaker: 'VAKS', force: true });
      }
    }
    if (Input.wasPressed('Escape')) this.cb.onBack();
  }

  draw(ctx) {
    drawScene(ctx, 'shop_nook', this.t);
    dimScreen(ctx, 0.35);
    drawText(ctx, 'JUKEBOX', View.w / 2, 22, { color: '#ffe49a', scale: 2, align: 'center' });
    drawText(ctx, 'ENTER TO SPIN A TRACK. UPLOAD MORE UNDER ASSETS/AUDIO/MUSIC.', View.w / 2, 44, { color: '#8a93b8', align: 'center' });
    if (this.slots.length === 0) {
      drawText(ctx, 'NO TRACKS UPLOADED YET.', View.w / 2, 110, { color: '#9aa3c0', align: 'center' });
    }
    this.slots.forEach((s, i) => {
      const y = 70 + i * 18;
      const seld = this.sel === i;
      const isPlaying = this.playing === s.id;
      drawText(ctx, s.name, View.w / 2 - 60, y, { color: seld ? '#fff' : '#9aa3c0' });
      drawText(ctx, '(' + s.id + ')', View.w / 2 + 70, y, { color: '#5a6280', align: 'left' });
      if (seld) drawText(ctx, '>', View.w / 2 - 76, y, { color: '#ffe49a' });
      if (isPlaying) {
        const bars = Math.floor(this.t * 6) % 3 + 1;
        for (let b = 0; b < bars; b++) {
          ctx.fillStyle = '#8ae08a';
          ctx.fillRect(View.w / 2 + 46, y + 5 - b * 2, 2, 2);
          ctx.fillRect(View.w / 2 + 50, y + 5 - ((b + 1) % 3) * 2, 2, 2);
        }
      }
    });
    hint(ctx, 'ARROWS: MOVE   ENTER: SPIN IT   ESC: BACK');
    Barks.draw(ctx, null);
  }
}

// ---------------- scene gallery ----------------

export class GalleryScreen {
  constructor(cb) {
    this.cb = cb; // { onPlay(sceneId), onBack() }
    this.sel = 0;
    this.t = 0;
  }

  update(dt) {
    this.t += dt;
    Barks.update(dt);
    const n = SCENE_ORDER.length;
    if (Input.wasPressed('ArrowUp')) this.sel = (this.sel + n - 1) % n;
    if (Input.wasPressed('ArrowDown')) this.sel = (this.sel + 1) % n;
    if (Input.wasPressed('Enter')) {
      const id = SCENE_ORDER[this.sel];
      if (Save.data.scenes.includes(id)) this.cb.onPlay(id);
    }
    if (Input.wasPressed('Escape')) this.cb.onBack();
  }

  draw(ctx) {
    drawScene(ctx, 'cave_mouth', this.t);
    dimScreen(ctx, 0.55);
    drawText(ctx, 'SCENE GALLERY', View.w / 2, 22, { color: '#ffe49a', scale: 2, align: 'center' });
    // step shrinks as the list grows so it always fits between the title and hint
    const n = SCENE_ORDER.length;
    const top = 48;
    const step = Math.max(9, Math.min(16, Math.floor((246 - top) / n)));
    SCENE_ORDER.forEach((id, i) => {
      const unlocked = Save.data.scenes.includes(id);
      const seld = this.sel === i;
      const y = top + i * step;
      const name = unlocked ? CUTSCENES[id].name : '? ? ? ? ?';
      drawText(ctx, (i + 1) + '. ' + name, View.w / 2, y, {
        color: unlocked ? (seld ? '#fff' : '#9aa3c0') : '#4a4f63', align: 'center',
      });
      if (seld && unlocked) drawText(ctx, '>', View.w / 2 - 90, y, { color: '#ffe49a' });
    });
    hint(ctx, 'ENTER: REPLAY SCENE   ESC: BACK');
    Barks.draw(ctx, null);
  }
}

// ---------------- settings ----------------

export class SettingsScreen {
  constructor(cb) {
    this.cb = cb;
    this.sel = 0;
    this.t = 0;
    this.rows = [
      { name: 'MASTER VOLUME', get: () => Save.data.settings.master, adj: (d) => this.vol('master', d) },
      { name: 'MUSIC VOLUME', get: () => Save.data.settings.music, adj: (d) => this.vol('music', d) },
      { name: 'SFX VOLUME', get: () => Save.data.settings.voice, adj: (d) => this.vol('voice', d) },
      { name: 'SCREEN SHAKE', get: () => (Save.data.settings.shake ? 'ON' : 'OFF'), adj: () => { Save.data.settings.shake = !Save.data.settings.shake; Save.save(); } },
      { name: 'BARK TEXT SPEED', get: () => Save.data.settings.textSpeed.toUpperCase(), adj: (d) => this.speed(d) },
    ];
  }

  vol(k, d) {
    Save.data.settings[k] = Math.max(0, Math.min(10, Save.data.settings[k] + d));
    Save.save();
    AudioManager.applyVolumes(); // settings apply within the session
  }

  speed(d) {
    const opts = ['slow', 'normal', 'fast'];
    const i = opts.indexOf(Save.data.settings.textSpeed);
    Save.data.settings.textSpeed = opts[(i + d + 3) % 3];
    Save.save();
  }

  update(dt) {
    this.t += dt;
    Barks.update(dt);
    if (Input.wasPressed('ArrowUp')) this.sel = (this.sel + this.rows.length - 1) % this.rows.length;
    if (Input.wasPressed('ArrowDown')) this.sel = (this.sel + 1) % this.rows.length;
    if (Input.wasPressed('ArrowLeft')) this.rows[this.sel].adj(-1);
    if (Input.wasPressed('ArrowRight') || Input.wasPressed('Enter')) this.rows[this.sel].adj(1);
    if (Input.wasPressed('Escape')) this.cb.onBack();
  }

  draw(ctx) {
    drawScene(ctx, 'garden', this.t);
    dimScreen(ctx, 0.7);
    drawText(ctx, 'SETTINGS', View.w / 2, 26, { color: '#ffe49a', scale: 2, align: 'center' });
    this.rows.forEach((r, i) => {
      const y = 70 + i * 22;
      const seld = this.sel === i;
      drawText(ctx, r.name, 110, y, { color: seld ? '#fff' : '#9aa3c0' });
      const v = r.get();
      if (typeof v === 'number') {
        // slider
        ctx.fillStyle = '#1a1a24'; ctx.fillRect(270, y, 84, 6);
        ctx.fillStyle = seld ? '#ffe49a' : '#8ae08a';
        ctx.fillRect(270, y, Math.round(84 * v / 10), 6);
        drawText(ctx, String(v), 362, y, { color: seld ? '#fff' : '#9aa3c0' });
      } else {
        drawText(ctx, v, 270, y, { color: seld ? '#ffe49a' : '#8ae08a' });
      }
      if (seld) drawText(ctx, '>', 98, y, { color: '#ffe49a' });
    });
    drawText(ctx, 'MUSIC = THE THEME / BACKGROUND TRACKS.   SFX = VAKS VOICE NOTES.', View.w / 2, 200, { color: '#5a6280', align: 'center' });
    hint(ctx, 'ARROWS: ADJUST   ESC: BACK');
    Barks.draw(ctx, null);
  }
}

// ---------------- credits ----------------

const CREDITS_LINES = [
  ['VAK\'S CAVE', '#ffe49a', 2],
  ['', '', 1],
  ['STARRING', '#8ae08a', 1],
  ['VAKS - LEGENDARY XHOSA GARDENER', '#f4f0e0', 1],
  ['GRANNY - SHE WORKS TOO HARD', '#f4f0e0', 1],
  ['THE BIG TIKOLOSH - IT\'S LIKE THE WIND', '#f4f0e0', 1],
  ['TALLMAN - OWES MONEY, IS A CROOK', '#f4f0e0', 1],
  ['SHORTY - STEALS PLATES, IS STOUT', '#f4f0e0', 1],
  ['THE RATS - RRRATTAX!', '#f4f0e0', 1],
  ['', '', 1],
  ['DESIGN', '#8ae08a', 1],
  ['ONE BIG DAYS, ONE BIG DESIGN DOC', '#f4f0e0', 1],
  ['', '', 1],
  ['CODE, PIXELS AND PARTICLES', '#8ae08a', 1],
  ['ALL GENERATED, NO ASSETS WERE HARMED', '#f4f0e0', 1],
  ['', '', 1],
  ['MUSIC', '#8ae08a', 1],
  ['COMING SOON. THE SLOTS ARE READY.', '#f4f0e0', 1],
  ['LISTEN, NEW SONG, LISTEN TO THIS.', '#f4f0e0', 1],
  ['', '', 1],
  ['SPECIAL THANKS', '#8ae08a', 1],
  ['THURSDAY. FOR EVERYTHING.', '#f4f0e0', 1],
  ['THE WIND OF MALAWI', '#f4f0e0', 1],
  ['', '', 1],
  ['NO GARDENERS WERE CAUGHT', '#5a6280', 1],
  ['DURING THE MAKING OF THIS GAME', '#5a6280', 1],
  ['', '', 1],
  ['EK IS DIE BAAS VAN DIE PLAAS', '#ffe49a', 2],
];

export class CreditsScreen {
  constructor(cb) {
    this.cb = cb;
    this.t = 0;
    this.scroll = 0;
    AudioManager.playMusic('ending');
  }

  update(dt) {
    this.t += dt;
    this.scroll += dt * 16;
    Particles.update(dt);
    Barks.update(dt);
    const total = CREDITS_LINES.reduce((s, l) => s + l[2] * 12 + 4, 0);
    if (this.scroll > total + View.h + 30) this.cb.onDone();
    if (Input.wasPressed('Enter') || Input.wasPressed('Escape')) this.cb.onDone();
    if (Math.random() < 0.05) Particles.leaf(Math.random() * View.w, -5);
  }

  draw(ctx) {
    drawScene(ctx, 'garden', this.t);
    dimScreen(ctx, 0.6);
    Particles.draw(ctx, false);
    let y = View.h - this.scroll;
    for (const [text, color, scale] of CREDITS_LINES) {
      if (text && y > -20 && y < View.h + 20) {
        drawText(ctx, text, View.w / 2, y, { color, scale, align: 'center' });
      }
      y += scale * 12 + 4;
    }
    hint(ctx, 'ENTER: BACK TO MENU');
  }
}

// ---------------- loading ----------------

export class LoadingScreen {
  constructor(label, musicSlot, cb) {
    this.cb = cb;
    this.label = label;
    this.t = 0;
    this.dur = CONFIG.timers.loading;
    this.tip = TIPS[Math.floor(Math.random() * TIPS.length)];
    // the loading screen now runs on KASI SPRINT (the world2 township track)
    // instead of sitting silent. Preserve a pending restartNext across it so a
    // lost-lives go-back still restarts the destination LEVEL song from the top
    // (playMusic would otherwise consume the flag here).
    const keepRestart = AudioManager.restartNext;
    AudioManager.playMusic('world2');
    AudioManager.restartNext = keepRestart;
    this.slotName = AudioManager.musicName('world2'); // "KASI SPRINT"
  }

  update(dt) {
    this.t += dt;
    Barks.update(dt);
    if (this.t >= this.dur) this.cb.onDone();
  }

  draw(ctx) {
    ctx.fillStyle = '#07070d';
    ctx.fillRect(0, 0, View.w, View.h);
    drawText(ctx, this.label, View.w / 2, 96, { color: '#f4f0e0', scale: 2, align: 'center' });
    const w = 200, p = Math.min(1, this.t / this.dur);
    ctx.fillStyle = '#1a1a24';
    ctx.fillRect(View.w / 2 - w / 2, 128, w, 10);
    ctx.fillStyle = '#8ae08a';
    ctx.fillRect(View.w / 2 - w / 2 + 1, 129, Math.round((w - 2) * p), 8);
    drawText(ctx, this.tip, View.w / 2, 156, { color: '#ffe49a', align: 'center' });
    drawText(ctx, 'NOW PLAYING: ' + this.slotName, View.w / 2, 176, { color: '#5a6280', align: 'center' });
    // little running vaks
    const x = View.w / 2 - w / 2 + (w - 26) * p;
    draw(ctx, 'vaks', 2 + Math.floor(this.t * 10) % 4, x, 104);
  }
}

// ---------------- inventory / catalogue ----------------

// A read-only catalogue of everything Vaks is carrying this run: lives and
// mano up top, then consumables (spent on the next level) and the ability
// caps that stick for the whole run. Reachable from the pause menu.
const INV_CONS = [
  { name: 'RATTEX', sprite: 'rattex', key: 'rattex', note: 'RATS DIE ON TOUCH NEXT LEVEL' },
  { name: 'FAINT CHARM', sprite: 'lantern', key: 'faintCharm', note: 'GRANNY RESTS LONGER NEXT TIME' },
];
const INV_HATS = [
  { name: 'PROPELLER HAT', sprite: 'hat_propeller', id: 'propeller', note: 'JUMP HIGHER' },
  { name: 'BEANIE', sprite: 'hat_beanie', id: 'beanie', note: 'RUN THROUGH SMALL RATS' },
  { name: 'CHIEFS HAT', sprite: 'hat_chiefs', id: 'chiefs', note: 'FASTER, LIKE A TIKOLOSH' },
];

export class InventoryScreen {
  constructor(run, cb) {
    this.run = run;
    this.cb = cb; // { onBack }
    this.t = 0;
    if (!this.run.hatsOwned) this.run.hatsOwned = { ...this.run.hats };
  }

  update(dt) {
    this.t += dt;
    Particles.update(dt);
    Barks.update(dt);
    if (Input.wasPressed('Escape') || Input.wasPressed('Enter')) this.cb.onBack();
  }

  draw(ctx) {
    drawScene(ctx, 'shop_nook', this.t);
    dimScreen(ctx, 0.5);
    drawText(ctx, 'YOUR STASH', View.w / 2, 16, { color: '#ffe49a', scale: 2, align: 'center' });

    // top line: lives + current mano + total earned across the run
    drawText(ctx, 'LIVES: ' + this.run.lives, 28, 40, { color: '#f4f0e0' });
    draw(ctx, 'r2', 0, 138, 38);
    drawText(ctx, 'R' + this.run.mano, 154, 40, { color: '#ffe49a' });
    drawText(ctx, 'EARNED THIS RUN: R' + (this.run.earned || 0), 250, 40, { color: '#8a93b8' });

    // consumables — one level's worth, marked READY or empty
    drawText(ctx, 'CONSUMABLES', 28, 62, { color: '#8ae08a' });
    INV_CONS.forEach((it, i) => {
      const y = 78 + i * 20;
      const have = !!this.run[it.key];
      draw(ctx, it.sprite, 0, 30, y - 8, { alpha: have ? 1 : 0.28 });
      drawText(ctx, it.name, 56, y, { color: have ? '#f4f0e0' : '#5a6280' });
      drawText(ctx, have ? 'READY' : 'EMPTY', 196, y, { color: have ? '#8ae08a' : '#4a4f63' });
      drawText(ctx, it.note, 250, y, { color: '#5a6280' });
    });

    // ability caps — owned for the rest of the run, equip in the shop
    drawText(ctx, 'CAPS (KEPT ALL RUN)', 28, 148, { color: '#8ae08a' });
    INV_HATS.forEach((it, i) => {
      const y = 164 + i * 20;
      const owned = !!this.run.hatsOwned[it.id];
      const worn = !!this.run.hats[it.id];
      draw(ctx, it.sprite, 0, 30, y - 8, { alpha: owned ? 1 : 0.28 });
      drawText(ctx, it.name, 56, y, { color: owned ? '#f4f0e0' : '#5a6280' });
      drawText(ctx, worn ? 'WEARING' : owned ? 'OWNED' : 'LOCKED', 196, y,
        { color: worn ? '#ffe49a' : owned ? '#8a93b8' : '#4a4f63' });
      drawText(ctx, it.note, 280, y, { color: '#5a6280' });
    });

    hint(ctx, 'ESC OR ENTER: BACK');
    Barks.draw(ctx, null);
  }
}

// ---------------- pause ----------------

export class PauseScreen {
  constructor(under, cb) {
    this.under = under; // frozen gameplay screen, drawn beneath
    this.cb = cb; // { onResume, onRestart, onInventory, onSettings, onQuit }
    this.sel = 0;
    this.t = 0;
    this.items = [
      ['RESUME', () => cb.onResume()],
      ['RESTART LEVEL', () => cb.onRestart()],
      ['INVENTORY', () => cb.onInventory()],
      ['SETTINGS', () => cb.onSettings()],
      ['QUIT TO MENU', () => cb.onQuit()],
    ];
  }

  update(dt) {
    this.t += dt;
    const n = this.items.length;
    if (Input.wasPressed('Escape')) { this.cb.onResume(); return; }
    if (Input.wasPressed('ArrowUp')) this.sel = (this.sel + n - 1) % n;
    if (Input.wasPressed('ArrowDown')) this.sel = (this.sel + 1) % n;
    if (Input.wasPressed('Enter')) this.items[this.sel][1]();
  }

  draw(ctx) {
    this.under.draw(ctx);
    dimScreen(ctx, 0.7);
    const h = 46 + this.items.length * 16;
    panel(ctx, View.w / 2 - 80, 66, 160, h);
    drawText(ctx, 'PAUSED', View.w / 2, 76, { color: '#ffe49a', scale: 2, align: 'center' });
    this.items.forEach(([label], i) => {
      const y = 102 + i * 16;
      drawText(ctx, label, View.w / 2, y, { color: i === this.sel ? '#fff' : '#9aa3c0', align: 'center' });
      if (i === this.sel) drawText(ctx, '>', View.w / 2 - 66, y, { color: '#ffe49a' });
    });
  }
}

// ---------------- game over ----------------

export class GameOverScreen {
  constructor(cb) {
    this.cb = cb; // { onContinue, onQuit }
    this.sel = 0;
    this.t = 0;
    AudioManager.play('death', 'game over');
  }

  update(dt) {
    this.t += dt;
    Barks.update(dt);
    if (Input.wasPressed('ArrowUp') || Input.wasPressed('ArrowDown')) this.sel = 1 - this.sel;
    if (Input.wasPressed('Enter')) (this.sel === 0 ? this.cb.onContinue : this.cb.onQuit)();
  }

  draw(ctx) {
    ctx.fillStyle = '#07070d';
    ctx.fillRect(0, 0, View.w, View.h);
    // mist creeps up the game over screen
    ctx.fillStyle = 'rgba(74,143,74,0.25)';
    const h = 40 + Math.sin(this.t) * 8;
    ctx.fillRect(0, View.h - h, View.w, h);
    drawText(ctx, 'GAME OVER', View.w / 2, 72, { color: '#ff8a8a', scale: 3, align: 'center' });
    drawText(ctx, 'THE MIST HAS HIM. FOR NOW.', View.w / 2, 104, { color: '#9aa3c0', align: 'center' });
    const opts = ['TRY AGAIN', 'QUIT TO MENU'];
    opts.forEach((o, i) => {
      const y = 140 + i * 18;
      drawText(ctx, o, View.w / 2, y, { color: i === this.sel ? '#fff' : '#9aa3c0', align: 'center' });
      if (i === this.sel) drawText(ctx, '>', View.w / 2 - 60, y, { color: '#ffe49a' });
    });
  }
}

// ---------------- level clear ----------------

export class ClearScreen {
  constructor(levelName, stats, cb) {
    this.cb = cb;
    this.name = levelName;
    this.stats = stats;
    this.t = 0;
  }

  update(dt) {
    this.t += dt;
    // the GTA "mission passed" fanfare belongs to THIS screen only: start it the
    // first frame it's shown, cut it the instant the player leaves. The "finished"
    // voice note carried over from the level keeps playing on top.
    if (!this.fanfareStarted) { this.fanfareStarted = true; AudioManager.playClear(); }
    Particles.update(dt);
    Barks.update(dt);
    if (Math.random() < 0.1) Particles.confetti(Math.random() * View.w, -4, 4);
    if (Input.wasPressed('Enter') && this.t > 0.6) { AudioManager.stopClear(); this.cb.onDone(); }
  }

  draw(ctx) {
    ctx.fillStyle = '#0a0c18';
    ctx.fillRect(0, 0, View.w, View.h);
    Particles.draw(ctx, false);
    drawText(ctx, 'LEVEL CLEAR', View.w / 2, 56, { color: '#8ae08a', scale: 3, align: 'center' });
    drawText(ctx, this.name, View.w / 2, 86, { color: '#f4f0e0', align: 'center' });
    const rows = [
      ['TIME', this.stats.time.toFixed(1) + 'S'],
      ['MANO', 'R' + this.stats.mano],
      ['DEATHS', String(this.stats.deaths)],
      ['TIME BONUS', '+' + this.stats.timeBonus],
    ];
    rows.forEach(([k, v], i) => {
      const y = 116 + i * 16;
      drawText(ctx, k, View.w / 2 - 70, y, { color: '#9aa3c0' });
      drawText(ctx, v, View.w / 2 + 70, y, { color: '#ffe49a', align: 'right' });
    });
    if (Math.floor(this.t * 2) % 2 === 0) {
      drawText(ctx, 'ENTER: CONTINUE', View.w / 2, 206, { color: '#fff', align: 'center' });
    }
    Barks.draw(ctx, null);
  }
}
