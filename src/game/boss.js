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
import { draw, VAKS } from '../engine/sprites.js';
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
  constructor(run, cb) {
    this.run = run;
    this.cb = cb; // { onWin(), onCaught() -> bool keepFighting, onPause() }
    this.t = 0;
    this.phase = 'enter'; // enter | round_intro | fight | rest | win | caught
    this.phaseT = 1.2;
    this.round = 0;
    this.tikoX = BOSS_ARENA.tikoStartX;
    this.vaksX = BOSS_ARENA.vaksX;
    this.floorY = BOSS_ARENA.floorY;
    this.prompts = [];
    this.totalBeats = CONFIG.boss.rounds.reduce((s, r) => s + r.beats, 0);
    this.hits = 0;
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
    const r = CONFIG.boss.rounds[this.round];
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
    if (!this.frozen) this.tikoX += CONFIG.boss.advanceMiss;
    this.lungeT = 0.3;
    this.feedback = { text: 'OFF BEAT!', color: '#ff8a8a', t: 0.6 };
  }

  hit(p, perfect) {
    p.state = 'hit';
    this.hits++;
    this.tikoX -= CONFIG.boss.retreatHit * (perfect ? 1.5 : 1);
    this.tikoX = Math.max(40, this.tikoX);
    this.feedback = { text: perfect ? 'PERFECT VIBE!' : 'VIBE!', color: perfect ? '#ffe49a' : '#8ae08a', t: 0.6 };
    Particles.sparkle(this.vaksX - 60, this.floorY - 60, perfect ? '#ffe49a' : '#8ae08a', perfect ? 10 : 5);
    this.run.score += perfect ? 200 : 100;
  }

  update(dt) {
    if (!this.started) {
      this.started = true;
      barkVibe({ subtitle: true, speaker: 'BIG TIKOLOSH', force: true });
    }
    if (Input.wasPressed('Escape') && this.cb.onPause) { this.cb.onPause(); return; }
    if (Input.wasPressed('KeyI')) this.invincible = !this.invincible;
    if (Input.wasPressed('KeyT')) this.frozen = !this.frozen;

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
        if (!this.frozen) this.tikoX += CONFIG.boss.driftSpeed * dt;

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
          if (best && bestD <= CONFIG.boss.hitWindow) {
            if (best.key.code === k.code) this.hit(best, bestD <= CONFIG.boss.perfectWindow);
            else this.miss(best);
          }
        }
        // expired prompts
        for (const p of this.prompts) {
          if (p.state === 'pending' && this.t > p.hitT + CONFIG.boss.hitWindow) this.miss(p);
        }
        // round done?
        if (this.prompts.every((p) => p.state !== 'pending')) {
          this.round++;
          if (this.round >= CONFIG.boss.rounds.length) {
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
        if (this.phaseT <= 0) this.cb.onCaught();
        break;
    }

    // caught?
    if (this.phase === 'fight' && !this.invincible &&
        this.tikoX + CONFIG.boss.catchDist >= this.vaksX - 8) {
      this.phase = 'caught';
      this.phaseT = 1.4;
      AudioManager.play('death', 'boss');
      Barks.fire('m_chao', { subtitle: true, speaker: 'VAKS', force: true });
    }
  }

  draw(ctx) {
    drawScene(ctx, 'cave_mouth', this.t);

    // mist pooling behind the big one
    const poolW = Math.max(0, this.tikoX - 20);
    if (poolW > 0) {
      const pg = ctx.createLinearGradient(0, 0, poolW, 0);
      pg.addColorStop(0, 'rgba(143,208,124,0.3)');
      pg.addColorStop(1, 'rgba(143,208,124,0)');
      ctx.fillStyle = pg;
      ctx.fillRect(0, this.floorY - 30, poolW, 50);
    }

    // Big Tikolosh (scale 3, swaying)
    const bob = Math.sin(this.swayT * 1.6) * 4;
    const lunge = this.lungeT > 0 ? 10 : 0;
    draw(ctx, 'tiko_big', Math.floor(this.swayT * 2) % 2,
      this.tikoX - 30 + lunge, this.floorY - 78 + bob - 26, { scale: 3, flip: true });

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
    drawText(ctx, 'ROUND ' + Math.min(this.round + 1, 3) + '/3', View.w / 2 + mw / 2 + 8, 16, { color: '#8a93b8' });

    // rhythm track
    if (this.phase === 'fight' || this.phase === 'rest') this.drawTrack(ctx);

    if (this.phase === 'enter' || this.phase === 'round_intro') {
      drawText(ctx, this.round === 0 ? 'VIBE WITH ME.' : 'AGAIN. FEEL IT.', View.w / 2, 110, { color: '#aef2a8', scale: 2, align: 'center' });
      drawText(ctx, 'PRESS THE KEYS ON THE BEAT AS THEY REACH THE RING', View.w / 2, 134, { color: '#8a93b8', align: 'center' });
    }
    if (this.phase === 'win') {
      drawText(ctx, 'THE VIBE LANDS.', View.w / 2, 110, { color: '#ffe49a', scale: 2, align: 'center' });
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

    const r = CONFIG.boss.rounds[Math.min(this.round, 2)];
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
