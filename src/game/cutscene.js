// ============================================================
// CUTSCENE PLAYER — executes the data scripts: staged actors,
// timed commands, typewriter dialogue with portraits, letterbox,
// screen effects. Enter skips. Pure command interpreter; all
// content lives in src/data/cutscenes.js.
// ============================================================

import { View, dimScreen, panel } from '../engine/render.js';
import { Input } from '../engine/input.js';
import { drawText, wrapText, LINE_H } from '../engine/font.js';
import { draw, drawImoHead, spr, PHOTO_FACES, VAKS, GRANNY } from '../engine/sprites.js';
import { drawScene } from '../engine/bg.js';
import { Particles } from '../engine/particles.js';
import { AudioManager, Barks } from '../systems/audio.js';
import { CUTSCENES, SPEAKERS } from '../data/cutscenes.js';

function R(ctx, x, y, w, h, col) { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); }

function resolveFrames(sheet, anim) {
  if (sheet === 'vaks') {
    const m = { idle: [VAKS.idle, 3], run: [VAKS.run, 10], babalas: [VAKS.babalas, 3], celeb: [VAKS.celeb, 5], climb: [VAKS.climb, 6] };
    if (m[anim]) return { frames: [].concat(m[anim][0]), fps: m[anim][1] };
    return { frames: [0, 1], fps: 3 };
  }
  if (sheet === 'granny') {
    if (anim === 'run') return { frames: GRANNY.run, fps: 10 };
    if (anim === 'stare') return { frames: [GRANNY.stare], fps: 1 };
    return { frames: [GRANNY.idle], fps: 1 };
  }
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
    this.sushiPs = [];
    this.dawnT = 0;
    this.flashback = false;
    this.done = false;
    this._clicked = false;
    if (typeof document !== 'undefined') {
      this._clickHandler = () => { if (!this.done) this._clicked = true; };
      document.addEventListener('pointerdown', this._clickHandler);
    }
    AudioManager.playMusic(this.scene.music);
    this.nextStep();
  }

  _removeClickHandler() {
    if (this._clickHandler && typeof document !== 'undefined') {
      document.removeEventListener('pointerdown', this._clickHandler);
      this._clickHandler = null;
    }
  }

  skip() {
    if (this.done) return;
    this.done = true;
    this._removeClickHandler();
    // fire any unfired manifest 'say' rows so the beat still registers
    const steps = this.scene.steps;
    for (let i = this.stepIdx + 1; i < steps.length; i++) {
      const s = steps[i];
      if (s[0] === 'say' && typeof s[2] === 'string' && s[2].startsWith('m_')) Barks.quote(s[2]);
      if (s[0] === 'voice_note' && typeof s[2] === 'string' && s[2].startsWith('m_')) Barks.quote(s[2]);
    }
    this.cb.onDone();
  }

  nextStep() {
    this.stepIdx++;
    this.stepT = 0;
    const s = this.scene.steps[this.stepIdx];
    if (!s) { this.done = true; this._removeClickHandler(); this.cb.onDone(); return; }
    const [cmd, a, b, c, d] = s;
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
      case 'teleport': this.actors[a].x = b; this.actors[a].y = c; this.nextStep(); break;
      case 'anim': this.actors[a].anim = b; this.nextStep(); break;
      case 'sprite': this.actors[a].sheet = b; this.actors[a].anim = c || 'loop'; this.nextStep(); break;
      case 'face': this.actors[a].flip = b < 0; this.nextStep(); break;
      case 'show': this.actors[a].visible = b; this.nextStep(); break;
      case 'wire': this.nextStep(); break; // wires a manifest row without playing it
      case 'voice_note': {
        // like 'say' but locked — speech bubble shows, voice plays to completion,
        // neither click nor Enter can advance until the clip ends
        const vnActor = this.actors[a];
        const vnSp = SPEAKERS[a] || { face: 'face_vaks', name: a.toUpperCase() };
        const vnText = Barks.quote(b); // fires audio, returns display text
        this.dialogue = { name: vnSp.name, face: vnSp.face, text: vnText, shown: 0, holdT: 0, voiceEl: AudioManager.voiceEl, locked: true };
        if (vnActor) vnActor.talkT = 0.6;
        this.waitFor = Infinity;
        break;
      }
      case 'bgset': this.bg = a; this.nextStep(); break;
      case 'flash': this.flashA = 1; this.flashColor = a; this.waitFor = b || 0.3; break;
      case 'shake': this.shakeT = 0.45; this.shakeMag = a; this.nextStep(); break;
      case 'music': AudioManager.playMusic(a); this.nextStep(); break;
      case 'smash':
        this.flashA = 1; this.flashColor = '#ffffff';
        this.bg = a;
        this.waitFor = 0.4;
        break;
      case 'fx':
        if (a === 'flashback') { this.flashback = true; this.nextStep(); break; }
        if (a === 'flashback_end') { this.flashback = false; this.nextStep(); break; }
        this.fx = { name: a, t: b || 1 };
        this.waitFor = b || 1;
        break;
      default: this.nextStep();
    }
  }

  update(dt) {
    if (this.done) return;
    this.t += dt;
    this.stepT += dt;

    // locked dialogue (voice_note step) blocks all skipping until clip ends
    if (Input.wasPressed('Enter') && !(this.dialogue && this.dialogue.locked)) { this.skip(); return; }

    const clicked = this._clicked;
    this._clicked = false;
    if (clicked && this.dialogue && !this.dialogue.locked) {
      const d = this.dialogue;
      if (d.shown < d.text.length) {
        d.shown = d.text.length; d.holdT = 0;
      } else {
        this.dialogue = null; this.nextStep(); return;
      }
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

    // actors
    for (const a of Object.values(this.actors)) {
      a.animT += dt;
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
      d.shown = Math.min(d.text.length, d.shown + 20 * dt);
      if (d.shown >= d.text.length) {
        d.holdT -= dt;
        if (d.holdT <= 0) {
          if (d.voiceEl && !d.voiceEl.ended) {
            // voice clip still going — keep box open until it finishes
            d.voiceWait = (d.voiceWait || 0) + dt;
            // give up if clip never started (pre-gesture) after a short grace period
            if (!d.voiceEl.paused || d.voiceWait < 0.5) return;
          }
          this.dialogue = null; this.nextStep(); return;
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
        Particles.sparkle(v.x, v.y - 16, '#ffe98a', 2);
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

    Particles.update(dt);
    Barks.update(dt);

    // timed step completion
    if (this.waitFor !== Infinity && this.stepT >= this.waitFor) this.nextStep();
  }

  draw(ctx) {
    ctx.save();
    if (this.shakeT > 0) {
      ctx.translate(Math.round((Math.random() * 2 - 1) * this.shakeMag), Math.round((Math.random() * 2 - 1) * this.shakeMag));
    }

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

    // actors
    for (const a of Object.values(this.actors)) {
      if (!a.visible) continue;
      const { frames, fps } = resolveFrames(a.sheet, a.anim);
      const f = frames[Math.floor(a.animT * fps) % frames.length];
      const s = spr(a.sheet);
      if (!s) continue;
      draw(ctx, a.sheet, f, a.x - (s.fw * a.scale) / 2, a.y - s.fh * a.scale, { flip: a.flip, scale: a.scale });
      // dream face-swap overlay (doubt2: tikolosh wears Vaks's face)
      if (a.faceOverlay && PHOTO_FACES[a.faceOverlay]) {
        const ow = Math.round(16 * a.scale), oh = Math.round(16 * a.scale);
        drawImoHead(ctx, PHOTO_FACES[a.faceOverlay], Math.round(a.x - ow / 2), Math.round(a.y - s.fh * a.scale), ow, oh);
      }
    }

    Particles.draw(ctx, false);

    if (this.dawnT > 0) {
      ctx.fillStyle = `rgba(255,210,130,${0.3 * this.dawnT})`;
      ctx.fillRect(0, 0, View.w, View.h);
    }
    if (this.flashback) {
      ctx.fillStyle = 'rgba(255,220,150,0.16)';
      ctx.fillRect(0, 0, View.w, View.h);
    }
    ctx.restore();

    // letterbox
    const lb = Math.round(26 * this.letterbox);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, View.w, lb);
    ctx.fillRect(0, View.h - lb, View.w, lb);

    // dialogue box
    if (this.dialogue) this.drawDialogue(ctx);
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

    drawText(ctx, 'ENTER: SKIP', View.w - 6, View.h - 8, { color: '#5a6280', align: 'right' });
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
