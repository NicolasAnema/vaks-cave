// ============================================================
// CAVE FM: LINE UP THE BEAT
//
// Vaks stays behind the decks. Direction and VIBE notes arrive one at a
// time; two Round 1 records briefly rewind as an unannounced physical prank.
// A short load-shedding interstitial introduces the focused final round.
// ============================================================

import { CONFIG } from '../config.js';
import { View, dimScreen, panel, roundedRect } from '../engine/render.js';
import { Input } from '../engine/input.js';
import { drawText } from '../engine/font.js';
import { draw, drawImoHead, TIKO_HEAD_RECT, VAKS } from '../engine/sprites.js';
import { drawScene } from '../engine/bg.js';
import { Particles } from '../engine/particles.js';
import { AudioManager, Barks } from '../systems/audio.js';

const barkVibe = Barks.wire('m_vibe', 'boss.js: CAVE FM challenge');

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const mod = (v, n) => ((v % n) + n) % n;
const TAU = Math.PI * 2;

const KEY_INFO = {
  ArrowLeft: { frame: 1, label: 'LEFT' },
  ArrowRight: { frame: 0, label: 'RIGHT' },
  ArrowUp: { frame: 2, label: 'UP' },
  ArrowDown: { frame: 3, label: 'DOWN' },
  Space: { frame: null, label: 'VIBE' },
};
const INPUT_KEYS = Object.keys(KEY_INFO);

const CROWD = [
  { x: 38, flip: false, tempo: 4.0 },
  { x: 82, flip: true, tempo: 4.8 },
  { x: 178, flip: false, tempo: 5.5 },
  { x: 286, flip: true, tempo: 4.4 },
  { x: 332, flip: false, tempo: 5.8 },
];

function drawRecord(ctx, cx, cy, color, spin, jump = false) {
  const hop = jump ? (Math.floor(spin * 16) % 2) * 2 : 0;
  ctx.fillStyle = '#11131a';
  ctx.beginPath();
  ctx.arc(cx, cy - hop, 25, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#404653';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy - hop, 19, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy - hop, 13, 0, TAU); ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(cx, cy - hop, 7, 0, TAU); ctx.fill();
  const a = spin * TAU - Math.PI / 2;
  ctx.fillStyle = '#fff3aa';
  ctx.fillRect(
    Math.round(cx + Math.cos(a) * 19) - 2,
    Math.round(cy - hop + Math.sin(a) * 19) - 2,
    4,
    4,
  );

  ctx.strokeStyle = '#a9adb6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + 28, cy - 23);
  ctx.lineTo(cx + 16, cy - 8 - hop);
  ctx.lineTo(cx + 12, cy + 4 - hop);
  ctx.stroke();
}

export class BossScreen {
  constructor(run, cb, opts = {}) {
    this.run = run;
    this.cb = cb;
    this.cfg = CONFIG.boss;
    this.rounds = this.cfg.rounds;
    this.round = clamp(opts.startRound || 0, 0, this.rounds.length - 1);

    this.t = 0;
    this.started = false;
    this.phase = run.bossTutorialDone ? 'enter' : 'tutorial';
    this.phaseT = run.bossTutorialDone ? 0.7 : 0;
    this.currentPrompt = null;
    this.nextPromptT = 0;
    this.promptSerial = 0;
    this.lastKey = '';
    this.tutorialStep = 0;

    this.syncHits = 0;
    this.vibe = this.cfg.vibeStart;
    this.feedback = null;
    this.hitFlash = 0;
    this.missFlash = 0;
    this.handT = 0;
    this.handKey = 'ArrowLeft';
    this.deckSpin = 0;
    this.shakeT = 0;
    this.shakeMag = 0;

    this.recordScratchT = 0;
    this.scratchPranks = 0;
    this.loadsheddingT = 0;
    this.loadsheddingPoweredDown = false;
    this.loadsheddingSparked = false;
    this.loadsheddingBeatPlayed = false;
    this.blackout = false;
    this.finalDrop = false;
    this.finalT = 0;
    this.invincible = false;
    this.frozen = false;

    AudioManager.playMusic('boss');
  }

  setFeedback(text, color = '#ffe49a', hold = 0.9) {
    this.feedback = { text, color, t: hold };
  }

  startTutorial() {
    this.phase = 'tutorial';
    this.tutorialStep = 0;
    this.currentPrompt = {
      key: 'ArrowLeft',
      spawnT: this.t,
      hitT: this.t + this.cfg.tutorialTravelTime,
      travelTime: this.cfg.tutorialTravelTime,
      tutorial: true,
    };
  }

  finishTutorialHit(prompt) {
    if (this.tutorialStep === 0) {
      this.tutorialStep = 1;
      this.currentPrompt = {
        key: 'Space',
        spawnT: this.t,
        hitT: this.t + this.cfg.tutorialTravelTime,
        travelTime: this.cfg.tutorialTravelTime,
        tutorial: true,
      };
      this.hitFlash = 1;
      this.handT = 0.34;
      this.handKey = prompt.key;
      this.setFeedback('NOW HIT THE VIBE.', '#ffe49a', 0.65);
      Particles.sparkle(350, 166, '#8ae08a', 8);
      return;
    }
    this.currentPrompt = null;
    this.run.bossTutorialDone = true;
    this.run.score += this.cfg.tutorialScore;
    this.phase = 'tutorial_result';
    this.phaseT = this.cfg.tutorialResultHold;
    this.hitFlash = 1;
    this.handT = 0.28;
    this.handKey = prompt.key;
    this.setFeedback('SHAP. SOUNDCHECK.', '#8ae08a', this.cfg.tutorialResultHold);
    Particles.sparkle(350, 166, '#8ae08a', 12);
  }

  startRound(index) {
    this.round = clamp(index, 0, this.rounds.length - 1);
    this.run.bossRound = this.round;
    this.phase = 'round_intro';
    this.phaseT = this.cfg.roundIntro;
    this.currentPrompt = null;
    this.nextPromptT = 0;
    this.promptSerial = 0;
    this.lastKey = '';
    this.syncHits = 0;
    this.blackout = !!this.rounds[this.round].blackout;

    // The cutscene has already delivered "VIBE WITH ME". Keeping the gameplay
    // subtitle lane empty makes the single incoming prompt impossible to miss.
  }

  beginFight() {
    this.phase = 'fight';
    this.spawnPrompt();
    AudioManager.play('boss_vibe', `CAVE FM round ${this.round + 1}`);
  }

  choosePromptKey() {
    const allowed = this.rounds[this.round].keys;
    // A step of two walks every three- or five-key prompt pool, so Space
    // appears naturally without allowing identical notes back-to-back.
    let key = allowed[(this.promptSerial * 2 + this.round) % allowed.length];
    if (key === this.lastKey && allowed.length > 1) {
      key = allowed[(allowed.indexOf(key) + 1) % allowed.length];
    }
    this.lastKey = key;
    return key;
  }

  spawnPrompt() {
    const r = this.rounds[this.round];
    const serial = this.promptSerial + 1;
    const scratch = this.round === 0 && this.cfg.scratchPromptSerials.includes(serial);
    const normalKey = scratch ? 'Space' : this.choosePromptKey();
    if (scratch) this.lastKey = 'Space';
    const baseTravelTime = r.travelTime;
    const turnDuration = baseTravelTime * this.cfg.scratchTurnAt;
    const travelTime = scratch
      ? turnDuration + this.cfg.scratchRewindDuration + this.cfg.scratchResumeDuration
      : baseTravelTime;
    this.currentPrompt = {
      key: normalKey,
      spawnT: this.t,
      hitT: this.t + travelTime,
      travelTime,
      baseTravelTime,
      tutorial: false,
      scratch: scratch ? {
        turnDuration,
        rewindDuration: this.cfg.scratchRewindDuration,
        resumeDuration: this.cfg.scratchResumeDuration,
        turnProgress: this.cfg.scratchTurnAt,
        backtrack: this.cfg.scratchBacktrack,
        triggered: false,
      } : null,
    };
    this.promptSerial = serial;
  }

  currentDistance() {
    if (!this.currentPrompt) return Infinity;
    return Math.abs(this.currentPrompt.hitT - this.t);
  }

  promptHitWindow(prompt = this.currentPrompt) {
    if (!prompt || prompt.tutorial) return this.cfg.tutorialHitWindow;
    return this.rounds[this.round].hitWindow;
  }

  promptPerfectWindow(prompt = this.currentPrompt) {
    if (!prompt || prompt.tutorial) return this.rounds[this.round].perfectWindow;
    return this.rounds[this.round].perfectWindow;
  }

  hitPrompt(perfect) {
    const p = this.currentPrompt;
    if (!p) return;
    if (p.tutorial) {
      this.finishTutorialHit(p);
      return;
    }

    this.currentPrompt = null;
    this.syncHits++;
    this.vibe = clamp(
      this.vibe + (perfect ? this.cfg.perfectVibe : this.cfg.hitVibe),
      0,
      this.cfg.vibeMax,
    );
    this.run.score += perfect ? this.cfg.perfectScore : this.cfg.hitScore;
    this.hitFlash = 1;
    this.handT = 0.28;
    this.handKey = p.key;
    this.shakeT = perfect ? 0.1 : 0;
    this.shakeMag = perfect ? 1 : 0;
    this.setFeedback(perfect ? 'PERFECT.' : 'GOOD.', perfect ? '#fff3a0' : '#8ae08a', 0.55);
    Particles.sparkle(350, 166, perfect ? '#fff3a0' : '#8ae08a', perfect ? 12 : 7);

    if (this.syncHits >= this.rounds[this.round].hits) {
      this.clearRound();
    } else {
      this.nextPromptT = this.t + this.cfg.promptGap;
    }
  }

  missPrompt(reason = 'OFF BEAT.') {
    if (!this.currentPrompt || this.currentPrompt.tutorial) return;
    this.currentPrompt = null;
    this.syncHits = Math.max(0, this.syncHits - this.cfg.syncLoss);
    this.vibe = clamp(this.vibe - this.cfg.missPenalty, 0, this.cfg.vibeMax);
    this.missFlash = 1;
    this.shakeT = 0.2;
    this.shakeMag = 2;
    this.setFeedback(reason, '#ff8a8a', 0.9);
    this.nextPromptT = this.t + this.cfg.promptGap;

    if (!this.invincible && this.vibe <= 0) this.catchVaks();
  }

  handlePromptInput() {
    if (!this.currentPrompt) return;
    for (const code of INPUT_KEYS) {
      if (!Input.wasPressed(code)) continue;
      const distance = this.currentDistance();
      const hitWindow = this.promptHitWindow();
      if (distance > hitWindow) {
        if (this.t < this.currentPrompt.hitT) {
          this.missPrompt('TOO EARLY.');
        }
        return;
      }
      if (code !== this.currentPrompt.key) {
        this.missPrompt('WRONG NOTE.');
        return;
      }
      this.hitPrompt(distance <= this.promptPerfectWindow());
      return;
    }
  }

  clearRound() {
    this.currentPrompt = null;
    this.phase = 'round_clear';
    this.phaseT = this.cfg.roundClear;
    this.hitFlash = 1;
    this.vibe = clamp(this.vibe + 10, 0, this.cfg.vibeMax);
    this.setFeedback('BEATS LINED UP.', '#fff3a0', this.cfg.roundClear);
    Particles.confetti(240, 143, 18);
  }

  startLoadshedding() {
    this.phase = 'loadshedding';
    this.phaseT = this.cfg.loadsheddingDuration;
    this.loadsheddingT = 0;
    this.currentPrompt = null;
    this.feedback = null;
    this.blackout = false;
    this.loadsheddingPoweredDown = false;
    this.loadsheddingSparked = false;
    this.loadsheddingBeatPlayed = false;
    this.run.bossLoadsheddingSeen = true;
  }

  updateLoadshedding(dt) {
    this.loadsheddingT += dt;

    if (
      !this.loadsheddingPoweredDown
      && this.loadsheddingT >= this.cfg.loadsheddingPowerCutAt
    ) {
      this.loadsheddingPoweredDown = true;
      this.blackout = true;
      AudioManager.stopMusic();
      AudioManager.play('hazard_warning', 'CAVE FM power cut');
    }

    if (
      !this.loadsheddingSparked
      && this.loadsheddingT >= this.cfg.loadsheddingGeneratorAt
    ) {
      this.loadsheddingSparked = true;
      this.shakeT = 0.16;
      this.shakeMag = 2;
      AudioManager.play('alert', 'the dead generator coughs once');
      Particles.sparkle(398, 143, '#ffcf55', 12);
      Particles.smoke(407, 139);
    }

    if (
      !this.loadsheddingBeatPlayed
      && this.loadsheddingT >= this.cfg.loadsheddingTitleAt
    ) {
      this.loadsheddingBeatPlayed = true;
      AudioManager.play('boss_vibe', 'one heavy beat in the dark');
    }

    if (this.phaseT <= 0) {
      this.startRound(2);
      AudioManager.playMusic('boss');
      this.phaseT = 0;
      this.beginFight();
    }
  }

  updateScratchPrompt() {
    const scratch = this.currentPrompt?.scratch;
    if (!scratch || scratch.triggered) return;
    if (this.t - this.currentPrompt.spawnT < scratch.turnDuration) return;
    scratch.triggered = true;
    this.scratchPranks++;
    this.recordScratchT = this.cfg.scratchRecordJerk;
    AudioManager.play('hazard_warning', 'vinyl scratch');
  }

  startFinalDrop() {
    this.phase = 'final';
    this.phaseT = this.cfg.finalHold;
    this.finalDrop = true;
    this.finalT = 0;
    this.blackout = false;
    this.vibe = this.cfg.vibeMax;
    this.run.score += this.cfg.finalScore;
    this.setFeedback('THE WHOLE CAVE DROPS.', '#fff3a0', 2.2);
    AudioManager.play('boss_resolve', 'CAVE FM final drop');
    Particles.confetti(240, 105, 44);
  }

  catchVaks() {
    this.phase = 'caught';
    this.phaseT = this.cfg.caughtHold;
    this.currentPrompt = null;
    this.shakeT = 0.4;
    this.shakeMag = 4;
    AudioManager.play('death', 'CAVE FM crowd chose moer');
    Barks.fire('m_chao', { subtitle: true, speaker: 'VAKS', force: true });
  }

  updateTutorial() {
    if (Input.wasPressed('Enter')) {
      this.run.bossTutorialDone = true;
      this.currentPrompt = null;
      this.phase = 'tutorial_result';
      this.phaseT = 0.45;
      Barks.clear();
      this.setFeedback('DECK CHECK SKIPPED.', '#8a93b8', 0.45);
      return;
    }

    this.handlePromptInput();
    if (
      this.currentPrompt
      && this.t > this.currentPrompt.hitT + this.promptHitWindow()
    ) {
      this.currentPrompt.spawnT = this.t;
      this.currentPrompt.hitT = this.t + this.cfg.tutorialTravelTime;
      this.currentPrompt.travelTime = this.cfg.tutorialTravelTime;
    }
  }

  updateFight() {
    this.updateScratchPrompt();
    this.handlePromptInput();
    if (
      this.currentPrompt
      && this.t > this.currentPrompt.hitT + this.promptHitWindow()
    ) {
      this.missPrompt('MISSED THE BEAT.');
    }
    if (!this.currentPrompt && this.phase === 'fight' && this.t >= this.nextPromptT) {
      this.spawnPrompt();
    }
  }

  update(dt) {
    if (!this.started) {
      this.started = true;
      if (this.phase === 'tutorial') this.startTutorial();
    }

    if (Input.wasPressed('Escape') && this.cb.onPause) {
      this.cb.onPause();
      return;
    }
    if (Input.wasPressed('KeyI')) this.invincible = !this.invincible;
    if (Input.wasPressed('KeyT')) this.frozen = !this.frozen;
    if (Input.wasPressed('KeyK')) {
      this.cb.onWin();
      return;
    }

    this.t += dt;
    this.phaseT -= dt;
    const slowdown = this.phase === 'loadshedding'
      ? 1 - clamp(
        this.loadsheddingT / this.cfg.loadsheddingPowerCutAt,
        0,
        1,
      )
      : (this.blackout && this.phase !== 'fight' ? 0 : 1);
    this.deckSpin = mod(this.deckSpin + dt * 2 * slowdown, 1);
    this.hitFlash = Math.max(0, this.hitFlash - dt * 3.8);
    this.missFlash = Math.max(0, this.missFlash - dt * 3.4);
    this.handT = Math.max(0, this.handT - dt);
    this.recordScratchT = Math.max(0, this.recordScratchT - dt);
    this.shakeT = Math.max(0, this.shakeT - dt);
    if (this.feedback) {
      this.feedback.t -= dt;
      if (this.feedback.t <= 0) this.feedback = null;
    }

    Particles.update(dt);
    Barks.update(dt);

    switch (this.phase) {
      case 'tutorial':
        this.updateTutorial();
        break;
      case 'tutorial_result':
        if (this.phaseT <= 0) this.startRound(this.round);
        break;
      case 'enter':
        if (this.phaseT <= 0) this.startRound(this.round);
        break;
      case 'round_intro':
        if (this.phaseT <= 0) this.beginFight();
        break;
      case 'fight':
        if (!this.frozen) this.updateFight();
        break;
      case 'round_clear':
        if (this.phaseT <= 0) {
          if (this.round >= this.rounds.length - 1) this.startFinalDrop();
          else if (
            this.round === 1
            && !this.run.bossLoadsheddingSeen
          ) this.startLoadshedding();
          else this.startRound(this.round + 1);
        }
        break;
      case 'loadshedding':
        if (!this.frozen) this.updateLoadshedding(dt);
        break;
      case 'final':
        this.finalT += dt;
        if (Math.random() < dt * 9) {
          Particles.sparkle(24 + Math.random() * 432, 125, '#ffe49a', 2);
        }
        if (this.phaseT <= 0) this.cb.onWin();
        break;
      case 'caught':
        if (this.phaseT <= 0) this.cb.onCaught(this.round);
        break;
    }
  }

  promptProgress() {
    if (!this.currentPrompt) return 0;
    const scratch = this.currentPrompt.scratch;
    if (scratch) {
      const elapsed = this.t - this.currentPrompt.spawnT;
      if (elapsed <= scratch.turnDuration) {
        return clamp(
          elapsed / this.currentPrompt.baseTravelTime,
          0,
          scratch.turnProgress,
        );
      }
      const rewindElapsed = elapsed - scratch.turnDuration;
      if (rewindElapsed <= scratch.rewindDuration) {
        return scratch.turnProgress
          - scratch.backtrack * clamp(rewindElapsed / scratch.rewindDuration, 0, 1);
      }
      const resumeElapsed = rewindElapsed - scratch.rewindDuration;
      const resumeFrom = scratch.turnProgress - scratch.backtrack;
      return clamp(
        resumeFrom
          + (1 - resumeFrom) * (resumeElapsed / scratch.resumeDuration),
        0,
        1.2,
      );
    }
    return clamp(
      (this.t - this.currentPrompt.spawnT) / this.currentPrompt.travelTime,
      0,
      1.2,
    );
  }

  drawCrowd(ctx) {
    const hype = clamp((this.vibe - 25) / 75, 0, 1);
    const pulse = mod(this.t * 2, 1) < 0.16;
    for (let i = 0; i < CROWD.length; i++) {
      const c = CROWD[i];
      const converted = this.finalDrop || hype > 0.75;
      const bob = converted && pulse ? -3 - (i % 2) : 0;
      const sway = converted ? Math.round(Math.sin(this.t * c.tempo + i) * 2) : 0;
      const x = c.x - 10 + sway;
      const y = 137 + bob;
      draw(ctx, 'tiko', Math.floor(this.t * (1.5 + hype * 3) + i) % 2, x, y, { flip: c.flip });
      if (this.phase !== 'caught') {
        drawImoHead(
          ctx,
          'tiko',
          x + TIKO_HEAD_RECT.x,
          y + TIKO_HEAD_RECT.y,
          TIKO_HEAD_RECT.w,
          TIKO_HEAD_RECT.h,
          c.flip,
          this.blackout ? 0.12 : 1,
        );
      }
    }

    // The crowd may start nodding earlier, but it does not publicly switch
    // sides until Vaks completes the final line-up.
    draw(ctx, 'boss_placard', this.finalDrop ? 2 : 0, 7, 101);
    draw(ctx, 'boss_placard', this.finalDrop ? 3 : 1, 232, 101);
    draw(ctx, 'boss_cooler', 0, 44, 151);
    draw(ctx, 'boss_chair', 0, 181, 139);
  }

  drawSet(ctx) {
    ctx.fillStyle = 'rgba(255,226,148,0.09)';
    ctx.beginPath();
    ctx.moveTo(342, 94);
    ctx.lineTo(20, 176);
    ctx.lineTo(280, 176);
    ctx.lineTo(356, 94);
    ctx.closePath();
    ctx.fill();
    draw(ctx, 'boss_barrier', 0, 375, 108);
    draw(ctx, 'boss_generator', this.blackout ? 1 : 2, 310, 142);
    draw(ctx, 'boss_floodlight', this.blackout ? 0 : 1, 337, 86);
    this.drawCrowd(ctx);
  }

  drawBigTiko(ctx) {
    const menace = 1 - this.vibe / this.cfg.vibeMax;
    const bx = Math.round(24 + menace * 35);
    const reluctantTap = this.finalDrop && this.finalT < 1.1 && Math.floor(this.t * 8) % 2 ? -3 : 0;
    const dance = this.finalDrop && this.finalT >= 1.1;
    const by = 48 + reluctantTap + (this.missFlash > 0 ? 3 : 0);
    draw(ctx, 'tiko_big', Math.floor(this.t * (dance ? 7 : 1.8)) % 2, bx, by, {
      scale: 3,
      flip: true,
    });
    if (!['tutorial', 'tutorial_result', 'round_intro', 'caught'].includes(this.phase)) {
      drawImoHead(
        ctx,
        'tiko_big',
        bx + TIKO_HEAD_RECT.x * 3,
        by + TIKO_HEAD_RECT.y * 3,
        TIKO_HEAD_RECT.w * 3,
        TIKO_HEAD_RECT.h * 3,
        true,
        this.blackout ? 0.12 : 1,
      );
    } else {
      // These states place opaque UI over the actor. Use the buffer-res
      // portrait so the later HD pass cannot jump in front of those panels.
      draw(ctx, 'face_tiko', 0, bx + TIKO_HEAD_RECT.x * 3, by + TIKO_HEAD_RECT.y * 3, {
        scale: 2.75,
        flip: true,
        alpha: this.blackout ? 0.12 : 1,
      });
    }
  }

  drawPerformers(ctx) {
    const sx = 242;
    const sy = 128;
    draw(ctx, 'tiko_shop', Math.floor(this.t * 2) % 2, sx, sy);
    if (this.phase !== 'caught') {
      drawImoHead(
        ctx,
        'tiko_shop',
        sx + TIKO_HEAD_RECT.x,
        sy + TIKO_HEAD_RECT.y,
        TIKO_HEAD_RECT.w,
        TIKO_HEAD_RECT.h,
        false,
        this.blackout ? 0.12 : 1,
      );
    }

    let frame;
    if (this.phase === 'caught' || this.missFlash > 0) frame = VAKS.hurt;
    else if (this.finalDrop) frame = VAKS.dance[Math.floor(this.t * 7) % VAKS.dance.length];
    else if (this.hitFlash > 0) frame = VAKS.celeb[Math.floor(this.t * 8) % VAKS.celeb.length];
    else frame = VAKS.idle[Math.floor(this.t * 2) % VAKS.idle.length];
    draw(ctx, 'vaks', frame, 372, 126, { flip: true });
  }

  drawBooth(ctx) {
    ctx.fillStyle = '#261a13';
    ctx.fillRect(18, 158, 444, 11);
    ctx.fillStyle = '#94653b';
    ctx.fillRect(20, 158, 440, 4);
    ctx.fillStyle = '#4a2f1f';
    ctx.fillRect(30, 238, 39, 32);
    ctx.fillRect(411, 238, 39, 32);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = '#211712';
      ctx.fillRect(35, 243 + i * 5, 29, 2);
      ctx.fillRect(416, 243 + i * 5, 29, 2);
    }

    roundedRect(ctx, 28, 166, 170, 72, '#343a43');
    roundedRect(ctx, 282, 166, 170, 72, '#343a43');
    drawRecord(ctx, 95, 200, '#ffcf55', this.deckSpin);
    const scratchElapsed = this.cfg.scratchRecordJerk - this.recordScratchT;
    const rightSpin = this.recordScratchT > 0
      ? mod(this.deckSpin - scratchElapsed * 9, 1)
      : this.deckSpin;
    drawRecord(
      ctx,
      350,
      200,
      '#72f0a0',
      rightSpin,
      this.missFlash > 0 || this.recordScratchT > 0,
    );

    roundedRect(ctx, 205, 166, 70, 72, '#242a32');
    drawText(ctx, 'CAVE FM', 240, 173, { color: '#ffe49a', align: 'center' });
    for (let i = 0; i < 4; i++) {
      const lit = i === Math.floor(mod(this.t * 2, 4));
      ctx.fillStyle = i === 0
        ? (lit ? '#fff39b' : '#79652e')
        : (lit ? '#aeb8cc' : '#414754');
      ctx.fillRect(214 + i * 15, 192, 10, 10);
    }
    ctx.fillStyle = this.hitFlash > 0 ? '#fff39b' : this.missFlash > 0 ? '#ff6e63' : '#15191f';
    ctx.fillRect(218, 216, 44, 9);
    drawText(ctx, 'SYNC', 240, 217, {
      color: this.hitFlash > 0 ? '#342716' : '#d5d9e2',
      align: 'center',
    });

    this.drawHands(ctx);
  }

  drawHands(ctx) {
    if (this.recordScratchT > 0) {
      // A misty arm reaches in, jerks the record backward, and disappears.
      // There is deliberately no caption or warning: the physical rewind is
      // the whole prank.
      const jerk = Math.floor(this.t * 30) % 2 ? -5 : 4;
      ctx.strokeStyle = '#314b35';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(462, 154);
      ctx.lineTo(392 + jerk, 177);
      ctx.lineTo(355 + jerk, 197);
      ctx.stroke();
      ctx.fillStyle = '#43523f';
      ctx.fillRect(346 + jerk, 193, 15, 10);
      return;
    }
    if (this.handT <= 0) return;
    ctx.fillStyle = '#9a6a42';
    if (this.handKey === 'ArrowLeft') {
      ctx.fillRect(355, 179, 9, 7);
      ctx.fillRect(363, 181, 35, 3);
    } else if (this.handKey === 'ArrowRight') {
      ctx.fillRect(397, 200, 9, 7);
      ctx.fillRect(368, 202, 30, 3);
    } else if (this.handKey === 'ArrowUp') {
      ctx.fillRect(371, 171, 8, 7);
      ctx.fillRect(378, 173, 25, 3);
    } else if (this.handKey === 'ArrowDown') {
      ctx.fillRect(255, 216, 9, 7);
      ctx.fillRect(263, 218, 126, 3);
    } else {
      // Space is the big VIBE pad in the middle of the mixer.
      ctx.fillRect(236, 203, 10, 9);
      ctx.fillRect(244, 206, 122, 4);
    }
  }

  drawGag(ctx) {
    const id = this.activeGag;
    if (!id) return;
    const focus = GAG_FOCUS[id];
    const elapsed = this.cfg.setupGagDuration - this.gagIntroT;
    const intro = clamp(elapsed / this.cfg.setupGagResolveAt, 0, 1);
    const resultProgress = clamp(
      (elapsed - this.cfg.setupGagResolveAt)
        / (this.cfg.setupGagDuration - this.cfg.setupGagResolveAt),
      0,
      1,
    );

    // Each disaster gets its own visual beat: the booth recedes, the physical
    // joke plays in the scene, and the rhythm UI stays out of its way.
    ctx.fillStyle = 'rgba(3,4,8,0.38)';
    ctx.fillRect(0, 0, View.w, View.h);
    const spotlight = ctx.createRadialGradient(
      focus.x,
      focus.y,
      8,
      focus.x,
      focus.y,
      92,
    );
    spotlight.addColorStop(0, 'rgba(255,244,190,0.18)');
    spotlight.addColorStop(0.55, 'rgba(255,226,145,0.07)');
    spotlight.addColorStop(1, 'rgba(255,226,145,0)');
    ctx.fillStyle = spotlight;
    ctx.fillRect(focus.x - 94, focus.y - 94, 188, 188);

    if (id === 'rage') {
      const menace = 1 - this.vibe / this.cfg.vibeMax;
      const bx = Math.round(24 + menace * 35);
      const pulse = 1 + Math.sin(this.t * 15) * 0.16;
      ctx.strokeStyle = '#ff8b52';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx + 8, 50 - pulse * 4);
      ctx.lineTo(bx + 25, 56);
      ctx.moveTo(bx + 55, 56);
      ctx.lineTo(bx + 72, 50 - pulse * 4);
      ctx.stroke();
      drawText(ctx, '!', bx - 4, 61 - intro * 19, {
        color: '#ffbd66',
        scale: 3,
        align: 'center',
      });
      drawText(ctx, '!', bx + 82, 66 - intro * 25, {
        color: '#ff8b52',
        scale: 2,
        align: 'center',
      });
      if (this.gagResult) {
        ctx.strokeStyle = '#c68b62';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          const crackX = 18 + i * 108;
          ctx.beginPath();
          ctx.moveTo(crackX, 77);
          ctx.lineTo(crackX + 8, 91);
          ctx.lineTo(crackX + 2, 104);
          ctx.lineTo(crackX + 13, 119);
          ctx.stroke();
        }
        for (let i = 0; i < 9; i++) {
          const rockX = 22 + i * 53;
          const rockY = 70 + mod(this.t * 83 + i * 29, 105);
          ctx.fillStyle = i % 2 ? '#b49a76' : '#7e6a56';
          ctx.fillRect(Math.round(rockX), Math.round(rockY), 3 + i % 3, 3);
        }
      }
    } else if (id === 'zamalek') {
      const bx = Math.round(292 + intro * 64);
      const by = Math.round(117 + intro * 63 - Math.sin(intro * Math.PI) * 22);
      const spill = clamp((intro - 0.55) / 0.45, 0, 1)
        * (this.gagResult ? 1 - resultProgress : 1);
      ctx.save();
      ctx.globalAlpha = spill;
      ctx.fillStyle = '#d88926';
      ctx.fillRect(328, 183, 49, 5);
      ctx.fillRect(337, 178, 31, 5);
      ctx.fillRect(347, 174, 14, 4);
      ctx.fillStyle = '#f0b447';
      ctx.fillRect(333, 184, 23, 2);
      ctx.fillRect(360, 179, 10, 2);
      ctx.restore();
      draw(ctx, 'bottle', Math.floor(this.t * 8) % 4, bx, by, {
        scale: 1.7,
      });
      if (this.gagResult) {
        const wipeX = Math.round(329 + resultProgress * 44);
        ctx.strokeStyle = '#549fdb';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(386, 156);
        ctx.lineTo(wipeX + 18, 181);
        ctx.stroke();
        ctx.fillStyle = '#549fdb';
        ctx.fillRect(wipeX, 177, 24, 8);
        ctx.fillStyle = '#9a6a42';
        ctx.fillRect(wipeX - 5, 179, 7, 5);
      }
    } else if (id === 'phone') {
      const phoneY = Math.round(137 - intro * 38);
      const phoneX = 208;
      roundedRect(ctx, phoneX, phoneY - 4, 48, 66, '#080b13');
      ctx.strokeStyle = '#72d5ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(phoneX + 2, phoneY - 2, 44, 62);
      ctx.fillStyle = '#244861';
      ctx.fillRect(phoneX + 7, phoneY + 4, 34, 39);
      draw(ctx, 'face_granny', 0, phoneX + 12, phoneY + 10);
      ctx.fillStyle = '#c9f0ff';
      ctx.fillRect(phoneX + 22, phoneY + 51, 5, 3);
      if (!this.gagResult) {
        ctx.strokeStyle = '#72d5ff';
        ctx.lineWidth = 2;
        const ring = 30 + Math.floor(this.t * 7) % 7;
        ctx.strokeRect(232 - ring, phoneY + 28 - ring, ring * 2, ring * 2);
        ctx.fillStyle = '#66d879';
        ctx.fillRect(phoneX + 7, phoneY + 49, 12, 8);
        ctx.fillStyle = '#ff6e63';
        ctx.fillRect(phoneX + 29, phoneY + 49, 12, 8);
      } else {
        ctx.strokeStyle = '#ff6e63';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(phoneX + 7, phoneY + 4);
        ctx.lineTo(phoneX + 41, phoneY + 42);
        ctx.moveTo(phoneX + 41, phoneY + 4);
        ctx.lineTo(phoneX + 7, phoneY + 42);
        ctx.stroke();
      }
      drawText(ctx, 'GRANNY', 232, phoneY - 10, {
        color: '#dff6ff',
        align: 'center',
      });
    } else if (id === 'cable') {
      const reconnected = !!this.gagResult;
      const plugX = reconnected
        ? Math.round(238 + resultProgress * 31)
        : Math.round(269 - intro * 31);
      ctx.strokeStyle = '#925bd4';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(105, 130);
      ctx.bezierCurveTo(145, 151, 196, 146, plugX, 174);
      ctx.stroke();
      ctx.fillStyle = '#20242c';
      ctx.fillRect(plugX - 8, 168, 14, 10);
      ctx.fillStyle = '#d5d9e2';
      ctx.fillRect(plugX + 4, 171, 7, 4);
      ctx.fillStyle = '#ff733f';
      ctx.fillRect(269, 171, 4, 4);
      if (reconnected) {
        const footX = Math.round(375 - resultProgress * 96);
        ctx.strokeStyle = '#3f3f54';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(390, 154);
        ctx.lineTo(footX + 7, 169);
        ctx.stroke();
        draw(ctx, 'loose_shoe', 0, footX - 2, 165, {
          scale: 1.35,
          flip: true,
        });
      }
      if (!reconnected && Math.floor(this.t * 12) % 2) {
        ctx.fillStyle = '#fff0a0';
        ctx.fillRect(276, 165, 3, 3);
        ctx.fillRect(280, 176, 2, 2);
      }
    } else if (id === 'generator') {
      const generatorY = Math.round(150 - intro * 20);
      draw(ctx, 'boss_generator', this.gagResult ? 2 : Math.floor(this.t * 7) % 2, 356, generatorY, {
        scale: 1.65,
      });
      if (this.gagResult) {
        const kickX = Math.round(265 + Math.sin(resultProgress * Math.PI) * 76);
        ctx.strokeStyle = '#314b35';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(258, 151);
        ctx.lineTo(kickX, generatorY + 21);
        ctx.stroke();
        ctx.fillStyle = '#171d18';
        ctx.fillRect(kickX - 2, generatorY + 16, 16, 8);
      }
      ctx.fillStyle = Math.floor(this.t * 9) % 2 ? '#ff733f' : '#fff0a0';
      ctx.fillRect(386, generatorY - 5, 5, 5);
      ctx.fillRect(397, generatorY + 2, 3, 3);
    }

  }

  drawScratchPrankScene(ctx) {
    if (!this.pendingPrank) return;
    const elapsed = this.t - this.pendingPrank.startT;
    const revealed = elapsed >= this.cfg.scratchPrankRevealAt;
    const scratchX = 350 + Math.round(Math.sin(this.t * 48) * 8);

    ctx.fillStyle = 'rgba(3,4,8,0.22)';
    ctx.fillRect(0, 0, View.w, View.h);
    ctx.strokeStyle = '#314b35';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(350, 241);
    ctx.lineTo(scratchX, 202);
    ctx.stroke();
    ctx.fillStyle = '#43523f';
    ctx.fillRect(scratchX - 7, 195, 14, 10);

    ctx.strokeStyle = revealed ? '#ff8a8a' : '#f4f0dc';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(350, 200, 29 + i * 5, -2.5, -0.65);
      ctx.stroke();
    }
    if (revealed) {
      drawText(ctx, 'HAHA!', 95, 144, {
        color: '#ff9d88',
        scale: 2,
        align: 'center',
      });
    } else {
      drawText(ctx, 'SKRRRT!', 350, 151, {
        color: '#fff3a0',
        scale: 2,
        align: 'center',
      });
    }
  }

  drawScratchPrankTrack(ctx) {
    if (!this.pendingPrank) return;
    const elapsed = this.t - this.pendingPrank.startT;
    const pass = clamp(elapsed / this.cfg.scratchPrankRevealAt, 0, 1);
    const revealed = pass >= 1;
    const y = 247;
    const ringX = 240;
    const startX = View.w - 13;
    const x = Math.round(startX + (165 - startX) * pass);

    ctx.fillStyle = 'rgba(7,9,16,0.94)';
    ctx.fillRect(0, 229, View.w, 41);
    ctx.fillStyle = '#465066';
    ctx.fillRect(22, y, View.w - 44, 1);
    ctx.fillStyle = revealed ? '#a64f54' : '#d1a65a';
    ctx.fillRect(ringX - 1, y - 16, 3, 33);
    ctx.strokeStyle = revealed ? '#ff8a8a' : '#9b7f38';
    ctx.lineWidth = 2;
    ctx.strokeRect(ringX - 18, y - 14, 36, 28);

    roundedRect(ctx, x - 35, y - 9, 70, 19, revealed ? '#ff8a8a' : '#fff3a0');
    drawText(ctx, 'SCRATCH', x, y - 3, {
      color: '#251d1a',
      align: 'center',
    });
  }

  drawBlackout(ctx) {
    if (!this.blackout) return;
    const catEyesReady = this.phase !== 'loadshedding'
      || this.loadsheddingT >= this.cfg.loadsheddingCatEyesAt;
    dimScreen(ctx, catEyesReady ? 0.88 : 0.96);
    if (!catEyesReady) return;
    const glow = ctx.createRadialGradient(385, 142, 5, 385, 142, 78);
    glow.addColorStop(0, 'rgba(255,232,92,0.28)');
    glow.addColorStop(0.5, 'rgba(255,225,77,0.10)');
    glow.addColorStop(1, 'rgba(255,225,77,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(305, 64, 165, 170);
    ctx.fillStyle = '#ffe24a';
    ctx.fillRect(380, 137, 5, 4);
    ctx.fillRect(390, 137, 5, 4);
    ctx.fillStyle = '#fffbd0';
    ctx.fillRect(381, 138, 2, 2);
    ctx.fillRect(391, 138, 2, 2);
  }

  drawLoadsheddingScene(ctx) {
    if (this.phase !== 'loadshedding') return;
    const elapsed = this.loadsheddingT;

    // Two sickly flickers before the power actually disappears.
    const flickerElapsed = elapsed - this.cfg.loadsheddingFlickerAt;
    if (
      flickerElapsed >= 0
      && flickerElapsed < this.cfg.loadsheddingPowerCutAt - this.cfg.loadsheddingFlickerAt
      && (Math.floor(flickerElapsed / 0.16) === 0 || Math.floor(flickerElapsed / 0.16) === 2)
    ) {
      dimScreen(ctx, 0.72);
    }

    // In the pause after the cut, the audience quietly becomes a row of phone
    // torches. Nothing labels the beat; it reads from the new points of light.
    if (elapsed >= this.cfg.loadsheddingPhoneLightsAt) {
      const lights = [
        [44, 132, '#d5efff'], [85, 126, '#b8dcff'], [181, 130, '#eaf6ff'],
        [289, 125, '#d5efff'], [335, 131, '#b8dcff'],
      ];
      for (let i = 0; i < lights.length; i++) {
        const [x, y, color] = lights[i];
        const blink = Math.floor(this.t * (2.4 + i * 0.15) + i) % 5 !== 0;
        if (!blink) continue;
        ctx.fillStyle = 'rgba(170,220,255,0.08)';
        ctx.fillRect(x - 10, y - 10, 22, 22);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 3, 4);
      }
    }

    if (elapsed >= this.cfg.loadsheddingTargetAt) {
      const y = 247;
      const alpha = clamp(
        (elapsed - this.cfg.loadsheddingTargetAt) / 0.3,
        0,
        1,
      );
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(7,9,16,0.72)';
      ctx.fillRect(0, 229, View.w, 41);
      ctx.fillStyle = '#3e4657';
      ctx.fillRect(22, y, View.w - 44, 1);
      ctx.fillStyle = '#d1a65a';
      ctx.fillRect(239, y - 16, 3, 33);
      ctx.strokeStyle = '#fff3a0';
      ctx.lineWidth = 3;
      ctx.strokeRect(222, y - 14, 36, 28);
      ctx.restore();
    }

    if (elapsed >= this.cfg.loadsheddingTitleAt) {
      const titleAlpha = clamp(
        (elapsed - this.cfg.loadsheddingTitleAt) / 0.25,
        0,
        1,
      );
      ctx.save();
      ctx.globalAlpha = titleAlpha;
      panel(ctx, 79, 38, 322, 36, {
        bg: 'rgba(3,4,8,0.9)',
        border: '#d1a65a',
      });
      drawText(ctx, 'THIS ONE IS ACTUALLY ESKOM', View.w / 2, 50, {
        color: '#fff3a0',
        align: 'center',
      });
      ctx.restore();
    }
  }

  drawStatusBar(ctx) {
    const r = this.rounds[this.round];
    const filled = Math.min(this.syncHits, r.hits);
    // Keep the right edge clear for the persistent mute button drawn by main.
    panel(ctx, 9, 6, 435, 24, {
      bg: 'rgba(7,9,16,0.9)',
      border: this.missFlash > 0 ? '#a64f54' : '#4d5669',
    });
    drawText(ctx, `R${this.round + 1}`, 20, 14, { color: '#ffe49a' });
    drawText(ctx, 'SYNC', 50, 14, { color: '#9da6b8' });

    const pipW = r.hits > 10 ? 7 : 9;
    const gap = 3;
    const startX = 91;
    for (let i = 0; i < r.hits; i++) {
      ctx.fillStyle = i < filled ? '#72f0a0' : '#303746';
      ctx.fillRect(startX + i * (pipW + gap), 13, pipW, 8);
      if (i < filled && i === filled - 1 && this.hitFlash > 0) {
        ctx.fillStyle = '#fff3a0';
        ctx.fillRect(startX + i * (pipW + gap) + 2, 15, pipW - 4, 4);
      }
    }

    drawText(ctx, 'VIBE', 349, 14, {
      color: this.vibe <= this.cfg.missPenalty ? '#ff8a8a' : '#9da6b8',
    });
    const vibeX = 390;
    const vibeW = 46;
    ctx.fillStyle = '#6b3038';
    ctx.fillRect(vibeX, 13, vibeW, 8);
    ctx.fillStyle = this.vibe <= this.cfg.missPenalty ? '#ff6e63' : '#66d879';
    ctx.fillRect(
      vibeX,
      13,
      Math.round(vibeW * clamp(this.vibe / this.cfg.vibeMax, 0, 1)),
      8,
    );
  }

  drawPromptTrack(ctx) {
    if (!this.currentPrompt) return;
    const y = 247;
    const ringX = 240;
    const startX = View.w - 13;
    const x = Math.round(startX + (ringX - startX) * this.promptProgress());
    const distance = this.currentDistance();
    const hitWindow = this.promptHitWindow();
    const ready = distance <= hitWindow;

    ctx.fillStyle = 'rgba(7,9,16,0.82)';
    ctx.fillRect(0, 229, View.w, 41);
    ctx.fillStyle = '#465066';
    ctx.fillRect(22, y, View.w - 44, 1);
    ctx.fillStyle = '#d1a65a';
    ctx.fillRect(ringX - 1, y - 16, 3, 33);
    ctx.strokeStyle = ready ? '#fff3a0' : '#9b7f38';
    ctx.lineWidth = ready ? 3 : 1;
    ctx.strokeRect(ringX - 18, y - 14, 36, 28);
    if (ready) {
      ctx.fillStyle = 'rgba(255,243,160,0.15)';
      ctx.fillRect(ringX - 22, y - 18, 44, 36);
    }

    const info = KEY_INFO[this.currentPrompt.key];
    if (info.frame === null) {
      const label = this.currentPrompt.actionLabel || 'VIBE';
      const keyW = label.length > 5 ? 64 : 52;
      roundedRect(ctx, x - keyW / 2, y - 8, keyW, 17, ready ? '#fff3a0' : '#e7ebf3');
      drawText(ctx, label, x, y - 3, {
        color: '#26211a',
        align: 'center',
      });
    } else {
      draw(ctx, 'arrow', info.frame, x - 9, y - 9, { scale: 1.5 });
    }
  }

  drawHUD(ctx) {
    if (this.phase === 'tutorial' || this.phase === 'tutorial_result') {
      panel(ctx, 48, 12, 384, 82, { bg: 'rgba(7,9,16,0.94)', border: '#d1a65a' });
      drawText(ctx, "SPAZA'S DECK CHECK", View.w / 2, 21, {
        color: '#ffe49a',
        scale: 2,
        align: 'center',
      });
      if (this.phase === 'tutorial') {
        drawText(ctx, 'BEAT NOTES USE BUTTONS.', View.w / 2, 48, {
          color: '#e8edf7',
          align: 'center',
        });
        const lesson = this.tutorialStep === 0
          ? 'MATCH THE ARROW IN THE GOLD SLOT.'
          : 'SPACE HITS THE VIBE.';
        drawText(ctx, lesson, View.w / 2, 63, {
          color: '#aeb6c8',
          align: 'center',
        });
        drawText(ctx, 'ENTER: SKIP', 420, 80, { color: '#6f7893', align: 'right' });
      } else {
        drawText(ctx, this.feedback ? this.feedback.text : 'SHAP.', View.w / 2, 56, {
          color: this.feedback ? this.feedback.color : '#8ae08a',
          align: 'center',
        });
      }
      return;
    }

    if (this.phase === 'loadshedding') return;

    this.drawStatusBar(ctx);
    if (this.phase === 'round_intro') {
      const roundName = this.rounds[this.round].name;
      const titleScale = roundName.length > 22 ? 1 : 2;
      panel(ctx, 54, 40, 372, 44, { bg: 'rgba(7,9,16,0.92)', border: '#d1a65a' });
      drawText(ctx, roundName, View.w / 2, titleScale === 1 ? 55 : 49, {
        color: '#fff3a0',
        scale: titleScale,
        align: 'center',
      });
      drawText(ctx, this.round === 2 ? 'NO LIGHT. WATCH THE BEAT.' : 'LINE IT UP.', View.w / 2, 72, {
        color: '#aeb6c8',
        align: 'center',
      });
    } else if (this.phase === 'round_clear') {
      drawText(ctx, 'BEATS LINED UP.', View.w / 2, 48, {
        color: '#fff3a0',
        scale: 2,
        align: 'center',
      });
    } else if (this.phase === 'final') {
      drawText(ctx, 'THE WHOLE CAVE DROPS.', View.w / 2, 48, {
        color: '#fff3a0',
        scale: 2,
        align: 'center',
      });
    } else if (this.phase === 'caught') {
      return;
    } else if (this.feedback) {
      panel(ctx, 148, 34, 184, 20, {
        bg: 'rgba(7,9,16,0.84)',
        border: this.feedback.color,
      });
      drawText(ctx, this.feedback.text, View.w / 2, 38, {
        color: this.feedback.color,
        align: 'center',
      });
    }
  }

  draw(ctx) {
    ctx.save();
    if (this.shakeT > 0) {
      ctx.translate(
        Math.round((Math.random() * 2 - 1) * this.shakeMag),
        Math.round((Math.random() * 2 - 1) * this.shakeMag),
      );
    }

    drawScene(ctx, 'cave_mouth', this.t);
    this.drawSet(ctx);
    this.drawBigTiko(ctx);
    this.drawPerformers(ctx);
    this.drawBooth(ctx);
    this.drawBlackout(ctx);
    this.drawLoadsheddingScene(ctx);
    Particles.draw(ctx, false);
    ctx.restore();

    this.drawHUD(ctx);
    if (
      this.phase === 'tutorial'
      || this.phase === 'fight'
    ) {
      this.drawPromptTrack(ctx);
    }

    if (this.phase === 'caught') {
      dimScreen(ctx, 0.62);
      panel(ctx, 102, 84, 276, 70, {
        bg: '#070910',
        border: '#a64f54',
      });
      drawText(ctx, 'THE BEATS CAME APART.', View.w / 2, 98, {
        color: '#ff8a8a',
        scale: 2,
        align: 'center',
      });
      drawText(ctx, 'CHAO.', View.w / 2, 124, {
        color: '#ffdad0',
        scale: 3,
        align: 'center',
      });
    }
    if (this.frozen) drawText(ctx, 'BEAT FROZEN', View.w / 2, 112, { color: '#7fd0ff', align: 'center' });
    if (this.invincible) drawText(ctx, 'INVINCIBLE', View.w / 2, 122, { color: '#7fd0ff', align: 'center' });

    Barks.draw(ctx, null);
  }
}
