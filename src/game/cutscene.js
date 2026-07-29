// ============================================================
// CUTSCENE PLAYER — executes the data scripts: staged actors,
// timed commands, typewriter dialogue with portraits, letterbox,
// screen effects. Enter (or a click) advances ONE beat at a time —
// it never skips the whole scene. Pure command interpreter; all
// content lives in src/data/cutscenes.js.
// ============================================================

import { View, dimScreen, panel, roundedRect } from '../engine/render.js';
import { Input } from '../engine/input.js';
import { drawText, wrapText, textWidth, LINE_H } from '../engine/font.js';
import { draw, drawImoHead, spr, PHOTO_FACES, VAKS, GRANNY, TIKO_HEAD_RECT } from '../engine/sprites.js';
import { drawScene } from '../engine/bg.js';
import { Particles } from '../engine/particles.js';
import { AudioManager, Barks } from '../systems/audio.js';
import { CUTSCENES, SPEAKERS } from '../data/cutscenes.js';

function R(ctx, x, y, w, h, col) { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); }

// who's who in the WhatsApp-style family group chat (the 'phone'/'chat' steps)
const CHAT_SENDERS = {
  vaks:    { name: 'VAKS',    color: '#8ae08a', bubble: '#103a26' },
  shorty:  { name: 'SHORTY',  color: '#7fd0ff', bubble: '#202c33' },
  tallman: { name: 'TALLMAN', color: '#c0a6ff', bubble: '#202c33' },
  granny:  { name: 'GRANNY',  color: '#ff8a8a', bubble: '#41232a' },
};

function resolveFrames(sheet, anim) {
  // a numeric anim pins a single frame (static props: upright bottles, a
  // resting rake, coins) so a multi-frame sheet doesn't loop-spin.
  if (typeof anim === 'number') {
    const n = spr(sheet) ? spr(sheet).n : 1;
    return { frames: [((anim % n) + n) % n], fps: 1 };
  }
  if (sheet === 'vaks') {
    const m = {
      idle: [VAKS.idle, 3], run: [VAKS.run, 10], babalas: [VAKS.babalas, 3],
      celeb: [VAKS.celeb, 5], climb: [VAKS.climb, 6], dance: [VAKS.dance, 8],
      hurt: [VAKS.hurt, 1], smokePuff: [VAKS.smokePuff, 1],
    };
    if (m[anim]) return { frames: [].concat(m[anim][0]), fps: m[anim][1] };
    return { frames: [0, 1], fps: 3 };
  }
  if (sheet === 'granny') {
    if (anim === 'run') return { frames: GRANNY.run, fps: 10 };
    if (anim === 'stare') return { frames: [GRANNY.stare], fps: 1 };
    return { frames: [GRANNY.idle], fps: 1 };
  }
  if (sheet.startsWith('tsotsi_')) return { frames: [0, 1, 2, 1], fps: 4 }; // skip stun/arm frames
  const n = spr(sheet) ? spr(sheet).n : 1;
  const fr = [];
  for (let i = 0; i < n; i++) fr.push(i);
  return { frames: fr, fps: 2.2 };
}

export class CutsceneScreen {
  constructor(sceneId, cb) {
    this.scene = CUTSCENES[sceneId];
    this.cb = cb; // { onDone() }
    this.t = 0;
    this.bg = this.scene.bg;
    this.actors = {};
    for (const [id, a] of Object.entries(this.scene.actors)) {
      this.actors[id] = { ...a, visible: true, animT: Math.random() * 3, scale: a.scale || 1, move: null };
    }
    this.stepIdx = -1;
    this.stepT = 0;
    this.fade = 1;
    this.fadeDir = 0; this.fadeDur = 1;
    this.letterbox = 0; this.letterTarget = 0;
    this.flashA = 0;
    this.shakeT = 0; this.shakeMag = 0;
    this.dialogue = null;
    this.fx = null;
    // Virtual camera: (x,y) is the world point mapped to screen centre, zoom>=1.
    // Default is dead-centre at 1x, i.e. an identity transform, so scenes that
    // never touch the camera render exactly as before.
    this.cam = { x: View.w / 2, y: View.h / 2, zoom: 1 };
    this.camTween = null;
    this.phone = null; // WhatsApp-style group chat overlay (see 'phone'/'chat' steps)
    this.call = null;  // full-screen incoming-call card (cold open)
    this.priceCard = null;
    this.greenRoute = null;
    this.sushiPs = [];
    this.dawnT = 0;
    this.flashback = false;
    this.mood = null;
    this.done = false;
    this._clicked = false;
    this._pointer = { x: -1, y: -1 };
    if (typeof document !== 'undefined') {
      this._clickHandler = (event) => {
        if (this.done) return;
        const canvas = document.getElementById('game');
        const rect = canvas && canvas.getBoundingClientRect();
        if (rect && rect.width && rect.height) {
          this._pointer.x = (event.clientX - rect.left) / rect.width * View.w;
          this._pointer.y = (event.clientY - rect.top) / rect.height * View.h;
        }
        this._clicked = true;
      };
      document.addEventListener('pointerdown', this._clickHandler);
    }
    // Side scenes (mid-level breathers) declare NO music, so the level's track
    // keeps playing underneath the pushed overlay — only start music when the
    // scene actually names a slot. Story scenes all declare one.
    if (this.scene.music) AudioManager.playMusic(this.scene.music);
    this.nextStep();
  }

  _removeClickHandler() {
    if (this._clickHandler && typeof document !== 'undefined') {
      document.removeEventListener('pointerdown', this._clickHandler);
      this._clickHandler = null;
    }
  }

  nextStep() {
    this.stepIdx++;
    this.stepT = 0;
    const s = this.scene.steps[this.stepIdx];
    if (!s) { this.done = true; this._removeClickHandler(); this.cb.onDone(); return; }
    const [cmd, a, b, c, d, e] = s;
    switch (cmd) {
      case 'letterbox': this.letterTarget = a ? 1 : 0; this.nextStep(); break;
      case 'fade':
        this.fadeDir = a === 'in' ? -1 : 1;
        this.fadeDur = b || 1;
        this.waitFor = this.fadeDur;
        break;
      case 'wait': this.waitFor = a; break;
      case 'say': {
        const actor = this.actors[a];
        const sp = SPEAKERS[a] || { face: 'face_vaks', name: a.toUpperCase() };
        const isRow = typeof b === 'string' && b.startsWith('m_');
        // c is an optional display-text override for m_ rows (voice plays, different text shown)
        const text = isRow ? (c || Barks.quote(b)) : b;
        if (isRow && c) Barks.quote(b); // fire audio without overriding text
        const voiceEl = isRow ? AudioManager.voiceEl : null;
        this.dialogue = { name: sp.name, face: sp.face, text, shown: 0, holdT: Barks.holdFor(text) * 1.2 + 1.0, voiceEl };
        if (actor) actor.talkT = 0.6;
        this.waitFor = Infinity; // completes via dialogue
        break;
      }
      case 'bark':
        Barks.fire(b, { anchor: { x: this.actors[a].x, y: this.actors[a].y - 30, bubbleH: 6 }, force: true });
        this.waitFor = 0.9;
        break;
      case 'note':
        Barks.note(a);
        this.waitFor = Math.min(2.4, 0.8 + a.length * 0.03);
        break;
      case 'move': {
        const actor = this.actors[a];
        actor.move = { x0: actor.x, y0: actor.y, x1: b, y1: c, dur: d || 1, t: 0 };
        if (actor.sheet === 'vaks' && actor.anim === 'idle') actor.anim = 'run';
        actor.flip = b < actor.x;
        this.waitFor = Infinity; // completes when move ends
        break;
      }
      case 'glide': {
        const actor = this.actors[a];
        actor.move = { x0: actor.x, y0: actor.y, x1: b, y1: c, dur: d || 1, t: 0 };
        actor.flip = b < actor.x;
        this.nextStep(); // non-blocking: lets several actors move under a fade
        break;
      }
      case 'teleport': this.actors[a].x = b; this.actors[a].y = c; this.nextStep(); break;
      case 'anim': this.actors[a].anim = b; this.nextStep(); break;
      case 'sprite': this.actors[a].sheet = b; this.actors[a].anim = c || 'loop'; this.nextStep(); break;
      case 'face': this.actors[a].flip = b < 0; this.nextStep(); break;
      case 'show': this.actors[a].visible = b; this.nextStep(); break;
      case 'wire': this.nextStep(); break; // wires a manifest row without playing it
      case 'voice_note': {
        // like 'say' but locked — speech bubble shows, voice plays to completion,
        // neither click nor Enter can advance until the clip ends. Optional
        // timed pages in c are [seconds, text] pairs; d is the clip duration
        // used to preserve the full narration cadence in the silent build.
        const vnActor = this.actors[a];
        const vnSp = SPEAKERS[a] || { face: 'face_vaks', name: a.toUpperCase() };
        const vnDefaultText = Barks.quote(b); // fires audio, returns display text
        const vnPages = Array.isArray(c) && c.length ? c : null;
        const vnText = vnPages ? vnPages[0][1] : vnDefaultText;
        this.dialogue = {
          name: vnSp.name, face: vnSp.face, text: vnText, shown: 0, holdT: 0,
          voiceEl: AudioManager.voiceEl, locked: true,
          voicePages: vnPages, voicePage: 0, voiceElapsed: 0,
          voiceDuration: typeof d === 'number' ? d : 0,
          voiceCues: Array.isArray(e) ? e : [], voiceCue: 0,
        };
        if (vnActor) vnActor.talkT = 0.6;
        this.waitFor = Infinity;
        break;
      }
      case 'sfx': AudioManager.play(a, b || ''); this.nextStep(); break;
      case 'phone':
        if (a) { this.phone = { msgs: [], t: 0 }; this.waitFor = 0.55; } // pop-in beat
        else { this.phone = null; this.nextStep(); }
        break;
      case 'call':
        if (a) {
          this.call = { contact: String(a), missed: Number(b) || 0, t: 0 };
          this.waitFor = c || 0.55;
        } else {
          this.call = null;
          this.nextStep();
        }
        break;
      case 'call_choice':
        this.call = {
          contact: String(a), missed: Number(b) || 0, t: 0,
          interactive: true, selected: 'decline',
        };
        this.waitFor = Infinity;
        break;
      case 'chat': {
        // a = sender id ('sys' = centred date chip), b = text, c = fx ('alert')
        if (!this.phone) this.phone = { msgs: [], t: 0 };
        this.phone.msgs.push({ sender: a, text: b, t: 0 });
        if (c === 'alert') { AudioManager.play('alert'); this.shakeT = 0.5; this.shakeMag = 3; }
        // pace messages so they land one at a time (Enter still can't rush a phone)
        this.waitFor = a === 'sys' ? 0.7 : Math.min(2.4, 1.0 + b.length * 0.045);
        break;
      }
      case 'voice_at': {
        // fire a Vaks voice note from `c` seconds in and keep going — the scene
        // marches on and stopVoice() (on the next M.replace) cuts it at scene end
        const vaText = Barks.quote(b, undefined, c || 0);
        const vaSp = SPEAKERS[a] || { face: 'face_vaks', name: a.toUpperCase() };
        Barks.note(vaText, vaSp.name);
        this.nextStep();
        break;
      }
      // ---- camera (all non-blocking: the glide runs UNDER the next beats,
      // so you push in while a line plays; add a 'wait' if you want to hold) ----
      case 'camera': this.camTo(a, b, c, d); this.nextStep(); break;          // [x, y, zoom, dur]
      case 'focus': {                                                          // [actorId, zoom, dur]
        const act = this.actors[a];
        this.camTo(act ? act.x : View.w / 2, act ? act.y - 16 : View.h / 2, b || 1.6, c || 1);
        this.nextStep(); break;
      }
      case 'camreset': this.camTo(View.w / 2, View.h / 2, 1, a || 1); this.nextStep(); break;
      case 'dance': {                                                          // [actorId, on?, tempo?]
        const act = this.actors[a];
        if (act) {
          const on = b !== false;
          act.dance = on ? { t: 0, tempo: c || 6 } : null;
          if (act.sheet === 'vaks') act.anim = on ? 'dance' : 'idle';
        }
        this.nextStep(); break;
      }
      case 'laugh': {
        const act = this.actors[a];
        if (act) {
          const on = b !== false;
          act.laugh = on;
          act.dance = on ? { t: 0, tempo: c || 11 } : null;
        }
        this.nextStep(); break;
      }
      case 'mood': this.mood = a || null; this.nextStep(); break;
      case 'price':
        this.priceCard = a === false ? null : { x: a, y: b, text: c || '100 MANO', t: 0 };
        this.nextStep();
        break;
      case 'route':
        this.greenRoute = a === false ? null : { x: a, y: b, t: 0 };
        this.nextStep();
        break;
      case 'bgset': this.bg = a; this.nextStep(); break;
      case 'flash': this.flashA = 1; this.flashColor = a; this.waitFor = b || 0.3; break;
      case 'shake': this.shakeT = 0.45; this.shakeMag = a; this.nextStep(); break;
      case 'shards':
        Particles.shards(a, b, Array.isArray(c) ? c : ['#4e9a58', '#b9df9b', '#e8f5cf'], d || 12);
        this.nextStep();
        break;
      case 'music': if (a) AudioManager.playMusic(a); else AudioManager.stopMusic(); this.nextStep(); break;
      case 'smash':
        this.flashA = 1; this.flashColor = '#ffffff';
        this.bg = a;
        this.waitFor = 0.4;
        break;
      case 'fx':
        if (a === 'flashback') { this.flashback = true; this.nextStep(); break; }
        if (a === 'flashback_end') { this.flashback = false; this.nextStep(); break; }
        // optional c,d = an explicit sparkle position (defaults to Vaks)
        this.fx = { name: a, t: b || 1, dur: b || 1, x: c, y: d };
        this.waitFor = b || 1;
        break;
      default: this.nextStep();
    }
  }

  // Visual beats that run underneath a locked voice note. They deliberately
  // never touch the scene step index: the recording remains one uninterrupted
  // command while actors, camera and lighting keep telling the story.
  runVoiceCue(cue) {
    const [cmd, a, b, c, d] = cue;
    const actor = typeof a === 'string' ? this.actors[a] : null;
    if (cmd === 'move' && actor) {
      actor.move = { x0: actor.x, y0: actor.y, x1: b, y1: c, dur: d || 1, t: 0 };
      actor.flip = b < actor.x;
    } else if (cmd === 'teleport' && actor) {
      actor.x = b; actor.y = c;
    } else if (cmd === 'show' && actor) {
      actor.visible = b;
    } else if (cmd === 'sprite' && actor) {
      actor.sheet = b; actor.anim = c || 'loop';
    } else if (cmd === 'anim' && actor) {
      actor.anim = b;
    } else if (cmd === 'face' && actor) {
      actor.flip = b < 0;
    } else if (cmd === 'dance' && actor) {
      actor.dance = b === false ? null : { t: 0, tempo: c || 6 };
      if (actor.sheet === 'vaks') actor.anim = b === false ? 'idle' : 'dance';
    } else if (cmd === 'camera') {
      this.camTo(a, b, c, d);
    } else if (cmd === 'camreset') {
      this.camTo(View.w / 2, View.h / 2, 1, a || 1);
    } else if (cmd === 'shake') {
      this.shakeT = 0.45; this.shakeMag = a;
    } else if (cmd === 'sfx') {
      AudioManager.play(a, b || '');
    } else if (cmd === 'fx') {
      this.fx = { name: a, t: b || 1, dur: b || 1, x: c, y: d };
    }
  }

  // start a camera glide toward (x,y) at zoom (clamped >=1) over dur seconds
  camTo(x, y, zoom, dur) {
    const z = Math.max(1, zoom || 1);
    this.camTween = { x0: this.cam.x, y0: this.cam.y, z0: this.cam.zoom, x1: x, y1: y, z1: z, t: 0, dur: dur || 1 };
  }

  // keep the framed region inside the painted scene (no empty edges on zoom-in)
  clampCam() {
    const z = Math.max(1, this.cam.zoom);
    const hw = (View.w / 2) / z, hh = (View.h / 2) / z;
    this.cam.x = Math.max(hw, Math.min(View.w - hw, this.cam.x));
    this.cam.y = Math.max(hh, Math.min(View.h - hh, this.cam.y));
  }

  // world point -> on-screen buffer coords under the current camera (used to
  // place HD photo heads, which are queued past the pixel buffer)
  camPt(wx, wy) {
    return {
      x: (wx - this.cam.x) * this.cam.zoom + View.w / 2,
      y: (wy - this.cam.y) * this.cam.zoom + View.h / 2,
    };
  }

  callChoiceAt(x, y) {
    const px = Math.round((View.w - 142) / 2);
    const py = Math.round((View.h - 204) / 2);
    if (y < py + 151 || y > py + 200) return null;
    if (x >= px + 17 && x <= px + 59) return 'decline';
    if (x >= px + 83 && x <= px + 125) return 'answer';
    return null;
  }

  chooseCall(choice) {
    if (!this.call || !this.call.interactive) return;
    this._clicked = false;
    if (choice === 'answer') {
      this.call = { ...this.call, interactive: false, connected: true, selected: null, t: 0 };
      const text = 'WHERE ARE YOU, VAKS?';
      const granny = SPEAKERS.granny;
      this.dialogue = {
        name: granny.name, face: granny.face, text, shown: 0,
        holdT: Barks.holdFor(text) * 1.2 + 1.0, voiceEl: null,
        after: 'hangup',
      };
      this.waitFor = Infinity;
    } else {
      this.call = null;
      this.nextStep();
    }
  }

  finishDialogue() {
    const after = this.dialogue && this.dialogue.after;
    this.dialogue = null;
    if (after === 'hangup') {
      const current = this.call || { contact: 'GRANNY', missed: 5 };
      this.call = {
        ...current, interactive: false, connected: false, ended: true, t: 0,
      };
      AudioManager.play('alert');
      this.stepT = 0;
      this.waitFor = 0.8;
      return;
    }
    this.nextStep();
  }

  update(dt) {
    if (this.done) return;
    this.t += dt;
    this.stepT += dt;

    // The Granny call is a genuine fork. Pointer hit-testing uses the same
    // 480x270 coordinates as the buttons; arrows + Enter support keyboard play.
    if (this.call && this.call.interactive) {
      if (Input.wasPressed('ArrowLeft')) this.call.selected = 'decline';
      if (Input.wasPressed('ArrowRight')) this.call.selected = 'answer';
      if (Input.wasPressed('Enter')) {
        this.chooseCall(this.call.selected);
        return;
      }
      if (this._clicked || Input.clicked) {
        const choice = this.callChoiceAt(this._pointer.x, this._pointer.y)
          || this.callChoiceAt(Input.mouse.x, Input.mouse.y);
        if (choice) {
          this.chooseCall(choice);
          return;
        }
      }
      this._clicked = false;
    }

    // Enter (or a click) advances ONE beat — it never skips the whole scene.
    // First press snaps the typewriter to full; the next moves to the next
    // step. Locked voice_note steps ignore both inputs until the clip ends.
    const advance = (Input.wasPressed('Enter') || this._clicked) && !(this.dialogue && this.dialogue.locked);
    this._clicked = false;
    if (advance && this.dialogue) {
      const d = this.dialogue;
      if (d.shown < d.text.length) { d.shown = d.text.length; d.holdT = 0; }
      else { this.finishDialogue(); return; }
    }

    // ambient state
    this.letterbox += (this.letterTarget - this.letterbox) * Math.min(1, 6 * dt);
    if (this.fadeDir !== 0) {
      this.fade += this.fadeDir * dt / this.fadeDur;
      if (this.fade <= 0) { this.fade = 0; this.fadeDir = 0; }
      if (this.fade >= 1) { this.fade = 1; this.fadeDir = 0; }
    }
    this.flashA = Math.max(0, this.flashA - dt * 3);
    this.shakeT = Math.max(0, this.shakeT - dt);

    // camera glide
    if (this.camTween) {
      const tw = this.camTween; tw.t += dt;
      const u = Math.min(1, tw.t / tw.dur), e = u * u * (3 - 2 * u);
      this.cam.x = tw.x0 + (tw.x1 - tw.x0) * e;
      this.cam.y = tw.y0 + (tw.y1 - tw.y0) * e;
      this.cam.zoom = tw.z0 + (tw.z1 - tw.z0) * e;
      if (u >= 1) this.camTween = null;
    }
    this.clampCam();

    // actors
    for (const a of Object.values(this.actors)) {
      a.animT += dt;
      if (a.dance) a.dance.t += dt;
      if (a.move) {
        a.move.t += dt;
        const u = Math.min(1, a.move.t / a.move.dur);
        const e = u * u * (3 - 2 * u);
        a.x = a.move.x0 + (a.move.x1 - a.move.x0) * e;
        a.y = a.move.y0 + (a.move.y1 - a.move.y0) * e;
        if (u >= 1) {
          a.move = null;
          if (a.sheet === 'vaks' && a.anim === 'run') a.anim = 'idle';
          if (this.waitFor === Infinity && !this.dialogue) this.nextStep();
        }
      }
    }

    // dialogue typewriter
    if (this.dialogue) {
      const d = this.dialogue;
      if (d.voicePages) {
        d.voiceElapsed += dt;
        // Prefer the media playhead when the recording is running. The elapsed
        // fallback keeps every transcript page visible in a silent build.
        const mediaRunning = d.voiceEl && !d.voiceEl.paused
          && Number.isFinite(d.voiceEl.currentTime) && d.voiceEl.currentTime > 0;
        const mediaT = mediaRunning ? d.voiceEl.currentTime : d.voiceElapsed;
        while (d.voiceCue < d.voiceCues.length && mediaT >= d.voiceCues[d.voiceCue][0]) {
          this.runVoiceCue(d.voiceCues[d.voiceCue].slice(1));
          d.voiceCue++;
        }
        while (d.voicePage + 1 < d.voicePages.length && mediaT >= d.voicePages[d.voicePage + 1][0]) {
          d.voicePage++;
          d.text = d.voicePages[d.voicePage][1];
          d.shown = 0;
          d.holdT = 0;
        }
      }
      d.shown = Math.min(d.text.length, d.shown + (d.voicePages ? 44 : 20) * dt);
      if (d.shown >= d.text.length) {
        if (d.voicePages) {
          const finalPage = d.voicePage === d.voicePages.length - 1;
          const audioRunning = d.voiceEl && !d.voiceEl.ended && !d.voiceEl.paused;
          const fallbackRunning = (!d.voiceEl || d.voiceEl.paused) && d.voiceElapsed < d.voiceDuration;
          // Keep updating actors, lighting and particles while the locked
          // transcript stays on screen. Only the scene step itself is blocked.
          if (finalPage && !audioRunning && !fallbackRunning) {
            this.dialogue = null;
            this.nextStep();
          }
        } else {
          d.holdT -= dt;
          if (d.holdT <= 0) {
            if (d.voiceEl && !d.voiceEl.ended) {
              // Keep the box open while a real voice clip is still running.
              d.voiceWait = (d.voiceWait || 0) + dt;
              // Give up if it never started after a short pre-gesture grace.
              if (!d.voiceEl.paused || d.voiceWait < 0.5) return;
            }
            this.finishDialogue(); return;
          }
        }
      }
    }

    // fx emitters
    if (this.fx) {
      this.fx.t -= dt;
      const n = this.fx.name;
      if (n === 'zzz' && Math.random() < 0.08) {
        const v = this.actors.vaks;
        Particles.zzz(v.x + 8, v.y - 18);
      } else if (n === 'mistStir' && Math.random() < 0.5) {
        Particles.wisp(40 + Math.random() * 400, 250 + Math.random() * 16);
      } else if (n === 'wind' && Math.random() < 0.7) {
        Particles.spawn({
          x: -10, y: 40 + Math.random() * 180, vx: 130 + Math.random() * 80,
          vy: (Math.random() - 0.5) * 16, life: 2.4, size: 2,
          color: 'rgba(220,240,220,0.6)', wobble: 1.6,
        });
      } else if (n === 'dawn') {
        this.dawnT = Math.min(1, this.dawnT + dt * 0.6);
      } else if (n === 'sparkle' && Math.random() < 0.6) {
        const v = this.actors.vaks;
        const sx = this.fx.x !== undefined ? this.fx.x : v.x;
        const sy = this.fx.y !== undefined ? this.fx.y : v.y - 16;
        Particles.sparkle(sx, sy, '#ffe98a', 2);
      } else if (n === 'puff' && Math.random() < 0.2) {
        const v = this.actors.vaks;
        if (v) Particles.smoke(v.x + (v.flip ? -8 : 8), v.y - 22);
      } else if (n === 'confetti' && Math.random() < 0.3) {
        Particles.confetti(100 + Math.random() * 280, 80, 6);
      } else if (n === 'sushi' && Math.random() < 0.5) {
        this.sushiPs.push({
          x: Math.random() * View.w, y: -10,
          type: Math.floor(Math.random() * 3),
          speed: 38 + Math.random() * 44,
          wobbleT: Math.random() * 6.28,
        });
      }
      if (this.fx.t <= 0) this.fx = null;
    }

    this.sushiPs = this.sushiPs.filter((p) => {
      p.y += p.speed * dt;
      p.wobbleT += dt * 2.4;
      p.x += Math.sin(p.wobbleT) * 0.6;
      return p.y < View.h + 16;
    });

    if (this.phone) {
      this.phone.t += dt;
      for (const m of this.phone.msgs) m.t += dt;
    }
    if (this.call) this.call.t += dt;
    if (this.priceCard) this.priceCard.t += dt;
    if (this.greenRoute) {
      this.greenRoute.t += dt;
      if (Math.random() < 0.08) {
        Particles.wisp(
          this.greenRoute.x - 16 + Math.random() * 32,
          this.greenRoute.y - 10 - Math.random() * 42,
          'rgba(95,235,125,0.42)',
        );
      }
    }

    Particles.update(dt);
    Barks.update(dt);

    // timed step completion
    if (this.waitFor !== Infinity && this.stepT >= this.waitFor) {
      if (this.call && this.call.ended) this.call = null;
      this.nextStep();
    }
  }

  draw(ctx) {
    ctx.save();
    // camera: centre the frame, apply screen-space shake, then zoom about the
    // camera target. Everything in the world (scene, props, actors, particles)
    // draws under this; overlays (letterbox, dialogue, washes) stay screen-space.
    ctx.translate(View.w / 2, View.h / 2);
    if (this.shakeT > 0) {
      ctx.translate(Math.round((Math.random() * 2 - 1) * this.shakeMag), Math.round((Math.random() * 2 - 1) * this.shakeMag));
    }
    ctx.scale(this.cam.zoom, this.cam.zoom);
    ctx.translate(-this.cam.x, -this.cam.y);

    drawScene(ctx, this.bg, this.t);

    // sushi rain (dream FX)
    for (const p of this.sushiPs) {
      const x = Math.round(p.x), y = Math.round(p.y);
      if (p.type === 2) {
        // maki roll
        R(ctx, x, y, 5, 5, '#1a1414');
        R(ctx, x + 1, y + 1, 3, 3, '#f0ece0');
        R(ctx, x + 2, y + 2, 1, 1, '#e05a5a');
      } else {
        // nigiri — salmon (0) or tuna (1)
        const top = p.type === 0 ? '#f0a070' : '#c84040';
        R(ctx, x, y, 6, 3, '#f0ece0');
        R(ctx, x + 1, y - 2, 4, 2, top);
        R(ctx, x, y + 2, 6, 1, '#1a1414');
      }
    }

    // painted props (signs, banners) — scenery, behind the actors
    if (this.scene.props) for (const p of this.scene.props) { if (!p.hidden) this.drawProp(ctx, p); }
    if (this.greenRoute) this.drawGreenRoute(ctx);
    if (this.priceCard) this.drawPriceCard(ctx);

    // actors (drawn back-to-front in declaration order; a dancing actor hops)
    for (const a of Object.values(this.actors)) {
      if (!a.visible) continue;
      const { frames, fps } = resolveFrames(a.sheet, a.anim);
      const f = frames[Math.floor(a.animT * fps) % frames.length];
      const s = spr(a.sheet);
      if (!s) continue;
      let dx = 0, dy = 0;
      if (a.dance) {
        const amp = 4 + 2 * (a.scale || 1);
        dy = -Math.abs(Math.sin(a.dance.t * a.dance.tempo)) * amp; // the hop
        dx = Math.sin(a.dance.t * a.dance.tempo * 0.5) * 2;        // the sway
      }
      if (a.laugh) {
        dx += Math.sin(a.animT * 24) > 0 ? 2 : -2;
        dy -= Math.abs(Math.sin(a.animT * 12)) * 2;
      }
      draw(ctx, a.sheet, f, a.x + dx - (s.fw * a.scale) / 2, a.y + dy - s.fh * a.scale, { flip: a.flip, scale: a.scale, alpha: a.alpha });
      // a real photographic head crowning the mist body (shopkeeper, boss, tsotsi)
      if (a.head) this.drawActorHead(a, dx, dy);
      // dream face-swap overlay (doubt2: tikolosh wears Vaks's face)
      if (a.faceOverlay && PHOTO_FACES[a.faceOverlay]) {
        const ow = Math.round(16 * a.scale), oh = Math.round(16 * a.scale);
        drawImoHead(ctx, PHOTO_FACES[a.faceOverlay], Math.round(a.x - ow / 2), Math.round(a.y - s.fh * a.scale), ow, oh);
      }
      if (a.laugh) {
        const laughText = Math.sin(a.animT * 10) > 0 ? 'HA!' : 'HA HA!';
        drawText(ctx, laughText, a.x + dx, a.y + dy - s.fh * a.scale - 13, {
          color: '#b7ff86', align: 'center',
        });
      }
    }

    Particles.draw(ctx, false);
    ctx.restore();

    // Audacious screen-space story FX still rendered in chunky pixels.
    if (this.fx && this.fx.name === 'fallTunnel') {
      const p = 1 - Math.max(0, this.fx.t) / Math.max(0.001, this.fx.dur || 1);
      R(ctx, 0, 0, View.w, View.h, '#050408');
      const cx = View.w / 2, cy = View.h / 2;
      // Rock rings rush outward as Vaks drops through the shaft.
      for (let i = 0; i < 8; i++) {
        const z = ((p * 1.8 + i / 8) % 1);
        const w = 24 + z * 430, h = 14 + z * 245;
        const col = i % 2 ? '#251821' : '#3b2728';
        R(ctx, cx - w / 2, cy - h / 2, w, 3 + z * 5, col);
        R(ctx, cx - w / 2, cy + h / 2, w, 3 + z * 5, col);
        R(ctx, cx - w / 2, cy - h / 2, 3 + z * 5, h, col);
        R(ctx, cx + w / 2, cy - h / 2, 3 + z * 5, h, col);
      }
      // Long square-ended speed streaks.
      for (let i = 0; i < 12; i++) {
        const side = i % 2 ? 1 : -1;
        const x = cx + side * (42 + (i % 6) * 30);
        const y = ((i * 31 + p * 360) % 320) - 25;
        R(ctx, x, y, 3, 16 + (i % 4) * 7, i % 3 ? '#6b4038' : '#d07a46');
      }
      // Vaks tumbles as one readable pixel silhouette in the middle.
      const vs = spr('vaks');
      if (vs) {
        ctx.save();
        ctx.translate(cx, cy + Math.sin(p * 18) * 12);
        ctx.rotate(p * 9);
        draw(ctx, 'vaks', [].concat(VAKS.babalas)[0], -vs.fw, -vs.fh, { scale: 2 });
        ctx.restore();
      }
    } else if (this.fx && this.fx.name === 'phoneLight') {
      const v = this.actors.vaks;
      const src = v ? this.camPt(v.x + (v.flip ? -5 : 5), v.y - 18) : { x: 240, y: 180 };
      ctx.fillStyle = 'rgba(0,0,8,0.34)';
      ctx.fillRect(0, 0, View.w, View.h);
      const endX = View.w / 2, endY = 18;
      ctx.fillStyle = 'rgba(150,210,255,0.13)';
      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(endX - 66, endY);
      ctx.lineTo(endX + 66, endY);
      ctx.closePath();
      ctx.fill();
      const glow = ctx.createRadialGradient(endX, endY, 2, endX, endY, 72);
      glow.addColorStop(0, 'rgba(210,235,255,0.28)');
      glow.addColorStop(1, 'rgba(150,210,255,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(endX - 72, 0, 144, 100);
    } else if (this.fx && this.fx.name === 'irieFade') {
      const v = this.actors.vaks;
      const p = v ? this.camPt(v.x, v.y - 18) : { x: 170, y: 180 };
      const left = Math.max(0, this.fx.t) / Math.max(0.001, this.fx.dur || 1);
      ctx.fillStyle = `rgba(62,210,92,${0.12 * left})`;
      ctx.fillRect(0, 0, View.w, View.h);
      const colors = ['#ff70ae', '#ffe15a', '#6bd3ff', '#75e68d', '#c68cff'];
      for (let i = 0; i < 15; i++) {
        const ang = i * 2.399 + this.t * (0.7 + (i % 3) * 0.2);
        const radius = 15 + (i % 5) * 8 + (1 - left) * 34;
        const x = p.x + Math.cos(ang) * radius;
        const y = p.y + Math.sin(ang) * radius - (1 - left) * 18;
        ctx.globalAlpha = left * (0.35 + (i % 4) * 0.12);
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(Math.round(x), Math.round(y), 2 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else if (this.fx && this.fx.name === 'shopDiscovery') {
      const shop = this.camPt(this.fx.x ?? 360, this.fx.y ?? 154);
      const v = this.actors.vaks;
      const vaks = v ? this.camPt(v.x, v.y - 24) : { x: 110, y: 190 };
      const elapsed = (this.fx.dur || 1) - this.fx.t;
      const pulse = 0.75 + Math.sin(elapsed * 11) * 0.15;
      const glow = ctx.createRadialGradient(shop.x, shop.y, 5, shop.x, shop.y, 105);
      glow.addColorStop(0, `rgba(255,208,92,${0.3 * pulse})`);
      glow.addColorStop(0.45, `rgba(255,154,58,${0.16 * pulse})`);
      glow.addColorStop(1, 'rgba(255,140,45,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(shop.x - 110, shop.y - 105, 220, 210);
      // Chunky rays make the warm cave light read as something Vaks notices,
      // not merely as another camera pan.
      const rayColor = elapsed % 0.26 < 0.13 ? '#ffe27a' : '#ffb84d';
      const rays = [
        [-91, -48, 22, 3], [-79, 45, 18, 3], [68, -50, 22, 3],
        [72, 38, 18, 3], [-54, -76, 3, 18], [48, -78, 3, 18],
      ];
      for (const [x, y, w, h] of rays) R(ctx, shop.x + x, shop.y + y, w, h, rayColor);
      drawText(ctx, '?', vaks.x, vaks.y - 19, {
        color: '#fff1a0', scale: 2, align: 'center',
      });
    } else if (this.fx && this.fx.name === 'impactBurst') {
      const p = this.camPt(this.fx.x ?? 315, this.fx.y ?? 194);
      const pulse = 1 + Math.sin(this.t * 35) * 0.1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(pulse, pulse);
      const rays = [
        [-28, -2, 13, 3], [15, -2, 13, 3], [-2, -28, 3, 13],
        [-2, 15, 3, 13], [-21, -21, 9, 3], [13, -21, 9, 3],
        [-21, 18, 9, 3], [13, 18, 9, 3],
      ];
      for (const [x, y, w, h] of rays) R(ctx, x, y, w, h, '#ffdc62');
      R(ctx, -9, -9, 18, 18, '#fff1a0');
      R(ctx, -5, -5, 10, 10, '#ff7f3f');
      R(ctx, -2, -2, 4, 4, '#ffffff');
      ctx.restore();
    } else if (this.fx && this.fx.name === 'frightBurst') {
      const v = this.actors.vaks;
      const p = v ? this.camPt(v.x, v.y - 18) : { x: 160, y: 150 };
      const pulse = 1 + Math.sin(this.t * 28) * 0.12;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(pulse, pulse);
      const rays = [
        [-30, -25, 10, 2], [20, -25, 10, 2], [-38, -8, 14, 2],
        [24, -8, 14, 2], [-27, 11, 10, 2], [17, 11, 10, 2],
      ];
      for (const [x, y, w, h] of rays) R(ctx, x, y, w, h, '#fff1a0');
      drawText(ctx, 'AAAH!', 0, -57, { color: '#fff4a8', scale: 2, align: 'center' });
      drawText(ctx, '!!', 0, -34, { color: '#ffcf42', scale: 2, align: 'center' });
      ctx.restore();
    }

    if (this.mood === 'danger') {
      const pulse = 0.22 + Math.sin(this.t * 8) * 0.04;
      const vignette = ctx.createRadialGradient(View.w / 2, View.h / 2, 36, View.w / 2, View.h / 2, 290);
      vignette.addColorStop(0, 'rgba(45,0,20,0.04)');
      vignette.addColorStop(1, `rgba(12,0,8,${0.68 + pulse})`);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, View.w, View.h);
      R(ctx, 0, 0, View.w, 4, '#7a1520');
      R(ctx, 0, View.h - 4, View.w, 4, '#7a1520');
    } else if (this.mood === 'tiko_psyop') {
      // Give the failed attack a readable consequence before the full-screen
      // meme lands: Tikolosh is deliberately booting a retaliation psyop.
      const load = Math.min(1, this.stepT / 1.35);
      const pct = Math.min(99, Math.floor(load * 100));
      ctx.fillStyle = 'rgba(0,8,4,0.72)';
      ctx.fillRect(0, 0, View.w, View.h);
      for (let y = 0; y < View.h; y += 6) R(ctx, 0, y, View.w, 1, 'rgba(57,255,114,0.08)');
      R(ctx, 52, 57, View.w - 104, 122, '#07120b');
      R(ctx, 52, 57, View.w - 104, 3, '#39ff72');
      R(ctx, 52, 176, View.w - 104, 3, '#39ff72');
      R(ctx, 52, 57, 3, 122, '#39ff72');
      R(ctx, View.w - 55, 57, 3, 122, '#39ff72');
      drawText(ctx, 'CAVE SECURITY SYSTEM', View.w / 2, 69, { color: '#b9ffb0', align: 'center' });
      drawText(ctx, 'ATTACK DETECTED', View.w / 2, 91, { color: '#ff4050', scale: 2, align: 'center' });
      drawText(ctx, 'TARGET: VAKS', View.w / 2, 120, { color: '#ffdc62', align: 'center' });
      drawText(ctx, 'COUNTER-PSYOP LOADING...', View.w / 2, 139, { color: '#b9ffb0', align: 'center' });
      R(ctx, 112, 156, 256, 8, '#173821');
      R(ctx, 114, 158, Math.floor(252 * load), 4, load > 0.82 ? '#ff4050' : '#39ff72');
      drawText(ctx, `${pct}%`, View.w / 2, 166, { color: '#ffffff', align: 'center' });
    } else if (this.mood === 'tiko_meme') {
      // A ludicrous cursed-CCTV jump scare: the tiny tsotsi suddenly gives
      // itself the production value of a bass-boosted WhatsApp status edit.
      const jitterX = Math.sin(this.t * 47) > 0.45 ? 4 : -3;
      const jitterY = Math.cos(this.t * 39) > 0.5 ? 2 : -2;
      const pulse = 8.9 + Math.sin(this.t * 13) * 0.18;
      ctx.fillStyle = '#061109';
      ctx.fillRect(0, 0, View.w, View.h);
      ctx.save();
      // Chromatic ghost copies sell the corrupted, over-edited zoom.
      ctx.globalAlpha = 0.34;
      draw(ctx, 'face_tiko', 0, 132 + jitterX - 8, 22 + jitterY, { scale: pulse });
      ctx.fillStyle = 'rgba(255,35,70,0.18)';
      ctx.fillRect(120 + jitterX, 18 + jitterY, 235, 220);
      ctx.globalAlpha = 1;
      draw(ctx, 'face_tiko', 0, 132 + jitterX, 22 + jitterY, { scale: pulse });

      // Completely unnecessary laser eyes.
      const eyeY = 112 + jitterY;
      ctx.fillStyle = 'rgba(255,35,45,0.72)';
      ctx.beginPath();
      ctx.moveTo(216 + jitterX, eyeY);
      ctx.lineTo(0, eyeY - 17);
      ctx.lineTo(0, eyeY + 4);
      ctx.closePath();
      ctx.moveTo(263 + jitterX, eyeY);
      ctx.lineTo(View.w, eyeY - 17);
      ctx.lineTo(View.w, eyeY + 4);
      ctx.closePath();
      ctx.fill();
      R(ctx, 210 + jitterX, eyeY - 4, 13, 8, '#ff3848');
      R(ctx, 257 + jitterX, eyeY - 4, 13, 8, '#ff3848');
      R(ctx, 215 + jitterX, eyeY - 2, 4, 4, '#fff1a0');
      R(ctx, 262 + jitterX, eyeY - 2, 4, 4, '#fff1a0');

      // Scanlines and broken signal blocks.
      for (let y = 27; y < View.h - 27; y += 7) R(ctx, 0, y, View.w, 2, 'rgba(0,0,0,0.24)');
      const glitchY = 86 + Math.round((this.t * 37) % 92);
      R(ctx, 24, glitchY, 142, 4, '#50ff83');
      R(ctx, 290, glitchY + 9, 166, 5, '#e23d68');
      R(ctx, 0, 26, View.w, 3, '#39ff72');
      R(ctx, 0, View.h - 29, View.w, 3, '#39ff72');
      drawText(ctx, 'REC', 8, 30, { color: '#ff4050' });
      drawText(ctx, 'CAM 4', View.w - 8, 30, { color: '#b9ffb0', align: 'right' });
      drawText(ctx, 'CAVE CCTV', 8, View.h - 39, { color: '#b9ffb0' });
      drawText(ctx, 'SIGNAL: EISH', View.w - 8, View.h - 39, { color: '#ffdc62', align: 'right' });
      ctx.restore();
    }

    // full-screen colour washes: screen-space so they cover the frame at any zoom
    if (this.dawnT > 0) {
      ctx.fillStyle = `rgba(255,210,130,${0.3 * this.dawnT})`;
      ctx.fillRect(0, 0, View.w, View.h);
    }
    if (this.flashback) {
      ctx.fillStyle = 'rgba(255,220,150,0.16)';
      ctx.fillRect(0, 0, View.w, View.h);
    }

    // letterbox
    const lb = Math.round(26 * this.letterbox);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, View.w, lb);
    ctx.fillRect(0, View.h - lb, View.w, lb);

    // phone group-chat overlay (sits above the scene, below dialogue)
    if (this.phone) this.drawPhone(ctx);
    if (this.call) this.drawCall(ctx);

    // dialogue box
    if (this.dialogue) this.drawDialogue(ctx);

    // locked voice_note: 'voice memo' tag in the box's top-right — EQ bars + LISTEN
    if (this.dialogue && this.dialogue.locked) {
      const bx = 64, by = 34, bw = View.w - 128;
      const tagY = by + 2; // sit high in the box so there's clear space below
      // 'LISTEN' anchored to the right edge of the box
      const label = 'LISTEN';
      const labelRight = bx + bw - 10;
      const labelLeft = labelRight - textWidth(label);
      drawText(ctx, label, labelLeft, tagY, { color: '#e04040' });
      // 4 animated EQ bars to the LEFT of the label, with a clear gap
      const freqs = [3.1, 4.7, 3.8, 5.2];
      const phases = [0, 1.2, 2.4, 0.6];
      const barW = 2, barGap = 2, nBars = freqs.length;
      const barsRight = labelLeft - 6;                       // 6px gap before LISTEN
      const barsLeft = barsRight - nBars * (barW + barGap);
      for (let i = 0; i < nBars; i++) {
        const h = 3 + Math.round(Math.abs(Math.sin(this.t * freqs[i] + phases[i])) * 5);
        R(ctx, barsLeft + i * (barW + barGap), tagY + 7 - h, barW, h, '#e04040');
      }
    }

    Barks.draw(ctx, null);

    if (this.flashA > 0) {
      ctx.globalAlpha = this.flashA;
      ctx.fillStyle = this.flashColor || '#fff';
      ctx.fillRect(0, 0, View.w, View.h);
      ctx.globalAlpha = 1;
    }
    if (this.fade > 0) {
      ctx.globalAlpha = this.fade;
      ctx.fillStyle = '#07070d';
      ctx.fillRect(0, 0, View.w, View.h);
      ctx.globalAlpha = 1;
    }

    if (!(this.dialogue && this.dialogue.locked)) drawText(ctx, 'ENTER: NEXT', View.w - 6, View.h - 8, { color: '#5a6280', align: 'right' });
  }

  // Incoming call: a bold, readable phone takeover rather than three abstract
  // alert sounds. The missed-call count supplies the stakes without exposition.
  drawCall(ctx) {
    const ph = this.call;
    const pop = Math.min(1, ph.t * 6);
    const w = 142, h = 204;
    let px = Math.round((View.w - w) / 2);
    let py = Math.round((View.h - h) / 2);
    if (this.shakeT > 0 || Math.sin(ph.t * 22) > 0.84) px += Math.sin(ph.t * 48) > 0 ? 2 : -2;
    dimScreen(ctx, 0.62 * pop);
    roundedRect(ctx, px - 4, py - 4, w + 8, h + 8, '#05060a');
    roundedRect(ctx, px, py, w, h, '#10131f');
    const cg = ctx.createLinearGradient(px, py, px, py + h);
    cg.addColorStop(0, '#28213b');
    cg.addColorStop(1, '#10131f');
    ctx.fillStyle = cg;
    ctx.fillRect(px + 2, py + 2, w - 4, h - 4);

    const callTitle = ph.ended ? 'CALL ENDED' : ph.connected ? 'CONNECTED' : 'INCOMING CALL';
    drawText(ctx, callTitle, px + w / 2, py + 12, {
      color: ph.ended ? '#ff8a8a' : ph.connected ? '#8ae08a' : '#8a93b8',
      align: 'center',
    });
    panel(ctx, px + w / 2 - 24, py + 36, 48, 48, { bg: '#261d2d', border: '#ff8a8a' });
    draw(ctx, 'face_granny', 0, px + w / 2 - 12, py + 48);
    drawText(ctx, ph.contact, px + w / 2, py + 93, { color: '#f4f0e0', scale: 2, align: 'center' });
    const callStatus = ph.ended ? 'VAKS HANGS UP' : ph.connected ? 'ON THE CALL' : ph.missed + ' MISSED CALLS';
    drawText(ctx, callStatus, px + w / 2, py + 116, {
      color: ph.connected ? '#8ae08a' : '#ff8a8a', align: 'center',
    });

    if (ph.interactive) {
      const hover = this.callChoiceAt(Input.mouse.x, Input.mouse.y);
      const declineOn = hover === 'decline' || ph.selected === 'decline';
      const answerOn = hover === 'answer' || ph.selected === 'answer';
      if (declineOn) R(ctx, px + 21, py + 154, 34, 34, '#ff8a8a');
      if (answerOn) R(ctx, px + 87, py + 154, 34, 34, '#8ae08a');
      R(ctx, px + 24, py + 157, 28, 28, declineOn ? '#e34b5b' : '#a83240');
      R(ctx, px + 90, py + 157, 28, 28, answerOn ? '#43c77b' : '#287b50');
      drawText(ctx, 'X', px + 38, py + 166, { color: '#fff', scale: 2, align: 'center' });
      drawText(ctx, '>', px + 104, py + 166, { color: '#fff', scale: 2, align: 'center' });
      drawText(ctx, 'DECLINE', px + 38, py + 190, { color: '#ff8a8a', align: 'center' });
      drawText(ctx, 'ANSWER', px + 104, py + 190, { color: '#8ae08a', align: 'center' });
      drawText(ctx, 'CLICK A BUTTON', px + w / 2, py + 137, { color: '#d8d2eb', align: 'center' });
    } else {
      R(ctx, px + w / 2 - 17, py + 151, 34, 34, '#ff8a8a');
      R(ctx, px + w / 2 - 14, py + 154, 28, 28, '#c83e4d');
      drawText(ctx, 'X', px + w / 2, py + 163, { color: '#fff', scale: 2, align: 'center' });
      drawText(ctx, ph.ended ? 'HUNG UP' : 'HANG UP', px + w / 2, py + 190, {
        color: '#ff8a8a', align: 'center',
      });
    }
  }

  // Vaks pulls up the family group on his phone. WhatsApp-ish: dark screen,
  // green header, incoming bubbles per sender, a date chip for 'sys' lines.
  drawPhone(ctx) {
    const ph = this.phone;
    const pop = Math.min(1, ph.t * 5);
    const w = 150, h = 210;
    let px = Math.round((View.w - w) / 2);
    let py = Math.round((View.h - h) / 2);
    if (this.shakeT > 0) { // granny's message rattles the handset
      px += Math.round((Math.random() * 2 - 1) * this.shakeMag);
      py += Math.round((Math.random() * 2 - 1) * this.shakeMag);
    }
    dimScreen(ctx, 0.5 * pop);

    roundedRect(ctx, px - 3, py - 3, w + 6, h + 6, '#05060a'); // bezel
    roundedRect(ctx, px, py, w, h, '#0b141a');                 // screen (wa dark)

    // header
    const hb = 18;
    ctx.fillStyle = '#1f3d36'; ctx.fillRect(px, py, w, hb);
    R(ctx, px + 5, py + 5, 8, 8, '#3a6b5f');                   // group avatar
    R(ctx, px + 6, py + 6, 6, 3, '#cfe9df');
    drawText(ctx, 'FAMILY GROUP', px + 17, py + 4, { color: '#eafff5' });
    drawText(ctx, 'GRANNY, TALLMAN, SHORTY, +3', px + 17, py + 11, { color: '#7fae9f' });

    // messages — newest anchored near the bottom; older ones scroll off the
    // top once the thread outgrows the screen (clipped to the phone body)
    const top = py + hb + 6, bot = py + h - 16;
    let total = 0;
    for (const m of ph.msgs) total += this.chatMsgH(m, w);
    let cy = total > bot - top ? bot - total : top;
    ctx.save();
    ctx.beginPath(); ctx.rect(px, top - 3, w, bot - top + 3); ctx.clip();
    for (const m of ph.msgs) cy = this.drawChatMsg(ctx, m, px, cy, w);
    ctx.restore();

    // input bar
    ctx.fillStyle = '#111b21'; ctx.fillRect(px, py + h - 14, w, 14);
    roundedRect(ctx, px + 4, py + h - 12, w - 26, 10, '#2a3942');
    drawText(ctx, 'MESSAGE', px + 7, py + h - 10, { color: '#5a6b73' });
    R(ctx, px + w - 18, py + h - 12, 10, 10, '#21c063');       // send
    drawText(ctx, '>', px + w - 15, py + h - 10, { color: '#0b141a' });
  }

  // vertical space a chat message consumes (mirrors drawChatMsg's advance)
  chatMsgH(m, w) {
    if (m.sender === 'sys') return 14;
    const lines = wrapText(m.text, (w - 16) - 8);
    return 16 + lines.length * LINE_H;
  }

  drawChatMsg(ctx, m, px, cy, w) {
    const inA = Math.min(1, m.t * 6); // fade/slide in
    if (m.sender === 'sys') {
      const tw = textWidth(m.text) + 10;
      const cx = Math.round(px + (w - tw) / 2);
      roundedRect(ctx, cx, cy, Math.round(tw), 9, '#16242c');
      drawText(ctx, m.text, px + w / 2, cy + 1, { color: '#9ab0a8', align: 'center' });
      return cy + 14;
    }
    const meta = CHAT_SENDERS[m.sender] || { name: m.sender.toUpperCase(), color: '#cfe9df', bubble: '#202c33' };
    const maxBW = w - 16;
    const lines = wrapText(m.text, maxBW - 8);
    let tw = textWidth(meta.name);
    for (const l of lines) tw = Math.max(tw, textWidth(l));
    const bw = Math.min(maxBW, tw + 8);
    const bh = 10 + lines.length * LINE_H + 2;
    const slide = Math.round((1 - inA) * 4);
    const bx = px + 6;
    ctx.globalAlpha = inA;
    roundedRect(ctx, bx, cy + slide, bw, bh, meta.bubble);
    drawText(ctx, meta.name, bx + 3, cy + slide + 2, { color: meta.color });
    for (let i = 0; i < lines.length; i++) {
      drawText(ctx, lines[i], bx + 3, cy + slide + 10 + i * LINE_H, { color: '#eaf2ee' });
    }
    ctx.globalAlpha = 1;
    return cy + bh + 4;
  }

  // HD photo head pinned to a mist-body actor, transformed through the camera
  // (queued past the pixel buffer so it stays photographic). Fades with the scene.
  drawActorHead(a, dx, dy) {
    // The meme CCTV scare supplies its own enormous corrupted face. Do not let
    // the normal HD head queue a tiny duplicate on top of that screen-space gag.
    if (this.mood === 'tiko_meme' && a === this.actors.tiko) return;
    const s = spr(a.sheet); if (!s) return;
    const sc = a.scale || 1;
    const tlx = a.x + dx - (s.fw * sc) / 2;
    const tly = a.y + dy - s.fh * sc;
    const hr = TIKO_HEAD_RECT;
    const p = this.camPt(tlx + hr.x * sc, tly + hr.y * sc);
    const alpha = (a.alpha === undefined ? 1 : a.alpha) * (1 - this.fade);
    if (alpha <= 0.02) return;
    const z = this.cam.zoom;
    drawImoHead(null, a.head, p.x, p.y, hr.w * sc * z, hr.h * sc * z, a.flip, alpha);
  }

  drawProp(ctx, p) {
    if (p.type === 'sign') this.drawSign(ctx, p);
  }

  drawGreenRoute(ctx) {
    const route = this.greenRoute;
    const x = Math.round(route.x), floor = Math.round(route.y);
    const open = Math.min(1, route.t * 2.4);
    const pulse = 0.75 + Math.sin(route.t * 7) * 0.15;
    ctx.save();
    // Light leaks out before the curtain finishes opening.
    const glow = ctx.createRadialGradient(x, floor - 42, 4, x, floor - 42, 78);
    glow.addColorStop(0, `rgba(105,255,135,${0.33 * pulse * open})`);
    glow.addColorStop(0.5, `rgba(45,210,95,${0.18 * pulse * open})`);
    glow.addColorStop(1, 'rgba(30,180,75,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 80, floor - 118, 160, 128);

    // Battered doorway cut directly into the corrugated back wall.
    R(ctx, x - 31, floor - 83, 62, 83, '#17130f');
    R(ctx, x - 27, floor - 79, 54, 79, '#06130d');
    R(ctx, x - 31, floor - 87, 62, 6, '#69452b');
    R(ctx, x - 35, floor - 3, 70, 5, '#49331f');
    drawText(ctx, 'GARDEN', x, floor - 82, { color: '#a8ff94', align: 'center' });

    // Ladder inside the green shaft.
    R(ctx, x - 14, floor - 66, 3, 62, '#47624a');
    R(ctx, x + 11, floor - 66, 3, 62, '#47624a');
    for (let y = floor - 60; y < floor - 7; y += 11) R(ctx, x - 12, y, 24, 2, '#72926f');

    // Bead curtain parts from the centre as the route is revealed.
    for (let i = 0; i < 8; i++) {
      const side = i < 4 ? -1 : 1;
      const rank = i < 4 ? 3 - i : i - 4;
      const closedX = x - 18 + i * 5;
      const partedX = x + side * (9 + rank * 6);
      const bx = closedX + (partedX - closedX) * open;
      const by = floor - 70 + rank * 2 * open;
      R(ctx, bx, by, 1, 56, '#372417');
      for (let yy = by + 5; yy < by + 54; yy += 9) {
        R(ctx, bx - 1, yy, 3, 4, (i + yy) % 2 ? '#58c96d' : '#e8bd4f');
      }
    }

    // Two unmistakable upward chevrons pulse inside the passage.
    const arrowY = floor - 31 - Math.round((route.t * 11) % 12);
    const arrowCol = pulse > 0.76 ? '#c6ff9b' : '#65dc76';
    R(ctx, x - 5, arrowY + 4, 3, 3, arrowCol);
    R(ctx, x + 3, arrowY + 4, 3, 3, arrowCol);
    R(ctx, x - 2, arrowY + 1, 5, 3, arrowCol);
    ctx.restore();
  }

  drawPriceCard(ctx) {
    const card = this.priceCard;
    const pop = Math.min(1, card.t * 8);
    const bounce = Math.sin(Math.min(1, card.t * 5) * Math.PI) * 4;
    const label = card.text || '100 MANO';
    const twoLines = label.length > 10;
    ctx.save();
    ctx.translate(Math.round(card.x), Math.round(card.y - bounce));
    ctx.scale(pop, pop);
    R(ctx, -39, -34, 78, 34, '#2a170d');
    R(ctx, -36, -32, 72, 29, '#f1cf62');
    R(ctx, -33, -29, 66, 23, label === '100 MANO' ? '#812f28' : '#246739');
    if (twoLines) {
      const words = label.split(' ');
      drawText(ctx, words.slice(0, -1).join(' '), 0, -26, { color: '#fff3b0', align: 'center' });
      drawText(ctx, words.at(-1), 0, -16, { color: '#fff3b0', align: 'center' });
    } else {
      drawText(ctx, label, 0, -22, { color: '#fff3b0', align: 'center' });
    }
    // Two chunky Mano coins pin the handwritten price to the counter.
    R(ctx, -35, -6, 6, 6, '#d9a928');
    R(ctx, 29, -6, 6, 6, '#d9a928');
    R(ctx, -33, -4, 2, 2, '#fff0a0');
    R(ctx, 31, -4, 2, 2, '#fff0a0');
    ctx.restore();
  }

  // A hand-painted wooden sign carrying REAL words (the pixel font), hung on the
  // wall in world space so it pans/zooms with the camera. Push in to read it.
  drawSign(ctx, p) {
    const bw = p.w || 96;
    const lines = wrapText(p.text, bw - 8);
    const padY = 4;
    const bh = padY * 2 + lines.length * LINE_H;
    const x = Math.round(p.x - bw / 2), y = Math.round(p.y);
    if (p.hang) { R(ctx, p.x, y - p.hang, 1, p.hang, '#2a2114'); R(ctx, p.x - 3, y - p.hang, 7, 1, '#3a2f1e'); }
    R(ctx, x, y, bw, bh, p.bg || '#6e5638');          // plank
    R(ctx, x, y, bw, 1, '#8a6f48');                   // top light edge
    R(ctx, x, y + bh - 1, bw, 1, '#4a3c28');          // bottom shade
    R(ctx, x, y, 1, bh, '#5a4a30'); R(ctx, x + bw - 1, y, 1, bh, '#4a3c28');
    R(ctx, x + 2, y + 2, 1, 1, '#3a2f1e'); R(ctx, x + bw - 3, y + 2, 1, 1, '#3a2f1e'); // nails
    const ink = p.ink || '#241206';
    for (let i = 0; i < lines.length; i++) {
      drawText(ctx, lines[i], p.x, y + padY + i * LINE_H, { color: ink, align: 'center' });
    }
  }

  drawDialogue(ctx) {
    const d = this.dialogue;
    const bx = 64, by = 34, bw = View.w - 128, bh = 44;
    panel(ctx, bx, by, bw, bh);
    panel(ctx, bx + 5, by + 8, 28, 28, { bg: '#10131f' });
    if (PHOTO_FACES[d.face]) drawImoHead(ctx, PHOTO_FACES[d.face], bx + 7, by + 10, 24, 24);
    else draw(ctx, d.face, 0, bx + 7, by + 10);
    drawText(ctx, d.name, bx + 40, by + 5, { color: '#8ae08a' });
    const lines = wrapText(d.text, bw - 50);
    const shown = d.text.slice(0, Math.ceil(d.shown));
    let used = 0;
    for (let i = 0; i < lines.length && i < 3; i++) {
      const remain = shown.length - used;
      if (remain <= 0) break;
      drawText(ctx, lines[i].slice(0, remain), bx + 40, by + 15 + i * LINE_H, { color: '#f4f0e0' });
      used += lines[i].length + 1;
    }
  }
}
