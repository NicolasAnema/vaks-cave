// ============================================================
// BIG TIKOLOSH — the vibe-off at the cave mouth. Vaks holds his
// ground; the player times inputs to a rhythm as it approaches.
// Hit prompts fill the vibe meter; misses let it lunge closer.
// Fill the meter through all rounds and it calms.
// ============================================================

import { CONFIG } from '../config.js';
import { View, dimScreen, panel } from '../engine/render.js';
import { Input } from '../engine/input.js';
import { drawText } from '../engine/font.js';
import { draw, drawImoHead, TIKO_HEAD_RECT, VAKS, GRANNY } from '../engine/sprites.js';
import { drawScene } from '../engine/bg.js';
import { Particles } from '../engine/particles.js';
import { AudioManager, Barks } from '../systems/audio.js';
import { BOSS_ARENA } from '../data/levels.js';

const barkVibe = Barks.wire('m_vibe', 'boss.js: vibe prompt at fight start');

const KEYS = [
  { code: 'ArrowLeft', sprite: 'arrow', frame: 1 },
  { code: 'ArrowRight', sprite: 'arrow', frame: 0 },
  { code: 'ArrowUp', sprite: 'arrow', frame: 2 },
  { code: 'ArrowDown', sprite: 'arrow', frame: 3 },
  { code: 'Space', sprite: 'key_space', frame: 0 },
];

export class BossScreen {
  constructor(run, cb, opts = {}) {
    this.run = run;
    this.cb = cb; // { onWin(), onCaught() -> bool keepFighting, onPause() }
    // variant: 'tiko' (cave-mouth vibe-off) | 'granny' (act-2 finale, harder)
    this.variant = opts.variant || 'tiko';
    this.isGranny = this.variant === 'granny';
    this.cfg = this.isGranny ? { ...CONFIG.boss, ...CONFIG.boss.granny } : CONFIG.boss;
    this.rounds = this.cfg.rounds;
    this.bg = this.isGranny ? 'garden' : 'cave_mouth';
    this.bossName = this.isGranny ? 'GRANNY' : 'BIG TIKOLOSH';
    this.t = 0;
    this.phase = 'enter'; // enter | round_intro | fight | rest | win | caught
    this.phaseT = 1.2;
    // rounds are checkpoints: a retry after being caught resumes from the round
    // you reached (clamped so a stale checkpoint can't overshoot)
    this.round = Math.max(0, Math.min(opts.startRound || 0, this.rounds.length - 1));
    this.tikoX = BOSS_ARENA.tikoStartX;
    this.vaksX = BOSS_ARENA.vaksX;
    this.floorY = BOSS_ARENA.floorY;
    this.prompts = [];
    this.totalBeats = this.rounds.reduce((s, r) => s + r.beats, 0);
    this.hits = 0;
    // the vibe meter already reflects the rounds cleared before the checkpoint
    for (let i = 0; i < this.round; i++) this.hits += this.rounds[i].beats;
    this.misses = 0;
    this.frozen = false;
    this.invincible = false;
    this.feedback = null; // { text, color, t }
    this.lungeT = 0;
    this.swayT = 0;
    this.started = false;
    AudioManager.playMusic('boss');
  }

  startRound() {
    const r = this.cfg.rounds[this.round];
    const interval = 60 / r.bpm;
    const lead = interval * 2.2;
    this.prompts = [];
    for (let i = 0; i < r.beats; i++) {
      this.prompts.push({
        key: KEYS[Math.floor(Math.random() * KEYS.length)],
        hitT: this.t + lead + i * interval,
        state: 'pending', // pending | hit | miss
      });
    }
    AudioManager.play('boss_vibe', 'round' + (this.round + 1));
    this.phase = 'fight';
  }

  miss(p) {
    p.state = 'miss';
    this.misses++;
    if (!this.frozen) this.tikoX += this.cfg.advanceMiss;
    this.lungeT = 0.3;
    this.feedback = { text: 'OFF BEAT!', color: '#ff8a8a', t: 0.6 };
  }

  hit(p, perfect) {
    p.state = 'hit';
    this.hits++;
    this.tikoX -= this.cfg.retreatHit * (perfect ? 1.5 : 1);
    this.tikoX = Math.max(40, this.tikoX);
    this.feedback = { text: perfect ? 'PERFECT VIBE!' : 'VIBE!', color: perfect ? '#ffe49a' : '#8ae08a', t: 0.6 };
    Particles.sparkle(this.vaksX - 60, this.floorY - 60, perfect ? '#ffe49a' : '#8ae08a', perfect ? 10 : 5);
    this.run.score += perfect ? 200 : 100;
  }

  update(dt) {
    if (!this.started) {
      this.started = true;
      if (this.isGranny) Barks.note('STAND STILL! YOU ARE SO LATE, VAKS. VIBE WITH GOGO!', 'GRANNY');
      else barkVibe({ subtitle: true, speaker: 'BIG TIKOLOSH', force: true });
    }
    if (Input.wasPressed('Escape') && this.cb.onPause) { this.cb.onPause(); return; }
    if (Input.wasPressed('KeyI')) this.invincible = !this.invincible;
    if (Input.wasPressed('KeyT')) this.frozen = !this.frozen;
    if (Input.wasPressed('KeyK') && !this.isGranny) { this.cb.onWin(); return; } // K = skip the tikolosh vibe-off

    this.t += dt;
    this.swayT += dt;
    this.phaseT -= dt;
    this.lungeT = Math.max(0, this.lungeT - dt);
    if (this.feedback) { this.feedback.t -= dt; if (this.feedback.t <= 0) this.feedback = null; }

    Particles.update(dt);
    Barks.update(dt);

    switch (this.phase) {
      case 'enter':
        if (this.phaseT <= 0) { this.phase = 'round_intro'; this.phaseT = 1.0; }
        break;
      case 'round_intro':
        if (this.phaseT <= 0) this.startRound();
        break;
      case 'rest':
        if (this.phaseT <= 0) { this.phase = 'round_intro'; this.phaseT = 0.8; }
        break;
      case 'fight': {
        if (!this.frozen) this.tikoX += this.cfg.driftSpeed * dt;

        // input matching
        for (const k of KEYS) {
          if (!Input.wasPressed(k.code)) continue;
          // nearest pending prompt
          let best = null, bestD = Infinity;
          for (const p of this.prompts) {
            if (p.state !== 'pending') continue;
            const d = Math.abs(p.hitT - this.t);
            if (d < bestD) { bestD = d; best = p; }
          }
          if (best && bestD <= this.cfg.hitWindow) {
            if (best.key.code === k.code) this.hit(best, bestD <= this.cfg.perfectWindow);
            else this.miss(best);
          }
        }
        // expired prompts
        for (const p of this.prompts) {
          if (p.state === 'pending' && this.t > p.hitT + this.cfg.hitWindow) this.miss(p);
        }
        // round done?
        if (this.prompts.every((p) => p.state !== 'pending')) {
          this.round++;
          // clearing a round earns another "VIBE WITH ME" (tikolosh fight only)
          if (!this.isGranny) barkVibe({ subtitle: true, speaker: 'BIG TIKOLOSH', force: true });
          if (this.round >= this.cfg.rounds.length) {
            this.phase = 'win'; this.phaseT = 1.6;
            AudioManager.play('boss_resolve', 'vibe complete');
            Particles.confetti(this.vaksX - 40, this.floorY - 60, 20);
          } else {
            this.phase = 'rest'; this.phaseT = 1.1;
          }
        }
        break;
      }
      case 'win':
        if (Math.random() < 0.3) Particles.sparkle(this.tikoX, this.floorY - 50, '#8ae08a', 2);
        if (this.phaseT <= 0) this.cb.onWin();
        break;
      case 'caught':
        if (this.phaseT <= 0) this.cb.onCaught(this.round); // checkpoint = the round reached
        break;
    }

    // caught?
    if (this.phase === 'fight' && !this.invincible &&
        this.tikoX + this.cfg.catchDist >= this.vaksX - 8) {
      this.phase = 'caught';
      this.phaseT = 1.4;
      AudioManager.play('death', 'boss');
      Barks.fire('m_chao', { subtitle: true, speaker: 'VAKS', force: true });
    }
  }

  draw(ctx) {
    drawScene(ctx, this.bg, this.t);

    const bob = Math.sin(this.swayT * 1.6) * 4;
    const lunge = this.lungeT > 0 ? 10 : 0;
    if (this.isGranny) {
      // granny bears down (scale 3), pumping toward Vaks
      const gx = this.tikoX - 26 + lunge, gy = this.floorY - 30 - 26 * 3 + bob;
      const gf = this.lungeT > 0 ? GRANNY.run[Math.floor(this.swayT * 12) % GRANNY.run.length] : GRANNY.stare;
      draw(ctx, 'granny', gf, gx, gy, { scale: 3, flip: true });
    } else {
      // mist pooling behind the Big Tikolosh
      const poolW = Math.max(0, this.tikoX - 20);
      if (poolW > 0) {
        const pg = ctx.createLinearGradient(0, 0, poolW, 0);
        pg.addColorStop(0, 'rgba(143,208,124,0.3)');
        pg.addColorStop(1, 'rgba(143,208,124,0)');
        ctx.fillStyle = pg;
        ctx.fillRect(0, this.floorY - 30, poolW, 50);
      }
      const bx = this.tikoX - 30 + lunge, by = this.floorY - 78 + bob - 26;
      draw(ctx, 'tiko_big', Math.floor(this.swayT * 2) % 2, bx, by, { scale: 3, flip: true });
      drawImoHead(ctx, 'tiko_big', bx + TIKO_HEAD_RECT.x * 3, by + TIKO_HEAD_RECT.y * 3,
        TIKO_HEAD_RECT.w * 3, TIKO_HEAD_RECT.h * 3, true);
    }

    // Vaks holds his ground
    const vf = this.phase === 'win' ? VAKS.celeb[Math.floor(this.t * 4) % 2]
      : (this.phase === 'caught' ? VAKS.hurt : VAKS.idle[Math.floor(this.t * 2) % 2]);
    draw(ctx, 'vaks', vf, this.vaksX - 13, this.floorY - 32, { flip: true });

    Particles.draw(ctx, false);

    // vibe meter
    const mw = 160;
    panel(ctx, View.w / 2 - mw / 2 - 2, 12, mw + 4, 14);
    ctx.fillStyle = '#1a1a24';
    ctx.fillRect(View.w / 2 - mw / 2, 15, mw, 8);
    ctx.fillStyle = '#8ae08a';
    ctx.fillRect(View.w / 2 - mw / 2, 15, Math.round(mw * this.hits / this.totalBeats), 8);
    drawText(ctx, 'VIBE', View.w / 2 - mw / 2 - 26, 16, { color: '#8ae08a' });
    drawText(ctx, 'ROUND ' + Math.min(this.round + 1, this.rounds.length) + '/' + this.rounds.length, View.w / 2 + mw / 2 + 8, 16, { color: '#8a93b8' });

    // rhythm track
    if (this.phase === 'fight' || this.phase === 'rest') this.drawTrack(ctx);

    if (this.phase === 'enter' || this.phase === 'round_intro') {
      const intro = this.isGranny
        ? (this.round === 0 ? 'VIBE WITH GOGO!' : 'AGAIN! KEEP UP!')
        : (this.round === 0 ? 'VIBE WITH ME.' : 'AGAIN. FEEL IT.');
      drawText(ctx, intro, View.w / 2, 110, { color: this.isGranny ? '#ffd2e0' : '#aef2a8', scale: 2, align: 'center' });
      drawText(ctx, 'PRESS THE KEYS ON THE BEAT AS THEY REACH THE RING', View.w / 2, 134, { color: '#8a93b8', align: 'center' });
    }
    if (this.phase === 'win') {
      drawText(ctx, this.isGranny ? 'GOGO IS SATISFIED.' : 'THE VIBE LANDS.', View.w / 2, 110, { color: '#ffe49a', scale: 2, align: 'center' });
    }
    if (this.phase === 'caught') {
      dimScreen(ctx, 0.5);
      drawText(ctx, 'CHAO.', View.w / 2, 110, { color: '#ff8a8a', scale: 3, align: 'center' });
    }
    if (this.feedback) {
      drawText(ctx, this.feedback.text, this.vaksX - 20, this.floorY - 90, { color: this.feedback.color, align: 'center' });
    }
    if (this.frozen) drawText(ctx, 'THREAT FROZEN', View.w / 2, 36, { color: '#7fd0ff', align: 'center' });
    if (this.invincible) drawText(ctx, 'INVINCIBLE', View.w / 2, 44, { color: '#7fd0ff', align: 'center' });

    Barks.draw(ctx, null);
  }

  drawTrack(ctx) {
    const ty = View.h - 42;
    const ringX = this.vaksX - 28;
    ctx.fillStyle = 'rgba(10,12,24,0.7)';
    ctx.fillRect(0, ty - 14, View.w, 30);
    ctx.fillStyle = '#3a4a6a';
    ctx.fillRect(0, ty + 1, View.w, 1);
    // target ring
    ctx.strokeStyle = '#ffe49a';
    ctx.lineWidth = 1;
    ctx.strokeRect(ringX - 9, ty - 9, 18, 18);

    const r = this.rounds[Math.min(this.round, this.rounds.length - 1)];
    const interval = 60 / r.bpm;
    const speed = 90 / interval; // px per second toward the ring

    for (const p of this.prompts) {
      const dtTo = p.hitT - this.t;
      const x = ringX + dtTo * speed;
      if (x < -20 || x > View.w + 20) continue;
      let alpha = 1;
      if (p.state === 'hit') alpha = 0.25;
      if (p.state === 'miss') alpha = 0.35;
      const k = p.key;
      if (k.sprite === 'key_space') draw(ctx, 'key_space', 0, x - 13, ty - 5, { alpha });
      else draw(ctx, 'arrow', k.frame, x - 6, ty - 6, { alpha });
      if (p.state === 'miss') drawText(ctx, 'X', x, ty - 16, { color: '#ff8a8a', align: 'center' });
    }
  }
}
