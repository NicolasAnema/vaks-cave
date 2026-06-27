// ============================================================
// GARDEN BOSS — "TEND THE PLAAS". The granny finale, a completely
// different game from the vibe-off: weeds sprout in the garden plots
// and you pull each one (press its key) before it overgrows. Let too
// many overgrow and gogo loses patience and catches you. It speeds up
// as you go, so it lands as hard as the vibe-off that came before.
// ============================================================

import { CONFIG } from '../config.js';
import { View, dimScreen, panel } from '../engine/render.js';
import { Input } from '../engine/input.js';
import { drawText } from '../engine/font.js';
import { draw, VAKS, GRANNY } from '../engine/sprites.js';
import { drawScene } from '../engine/bg.js';
import { Particles } from '../engine/particles.js';
import { AudioManager, Barks } from '../systems/audio.js';

// one key per plot (left-to-right): arrows then space
const PLOT_KEYS = [
  { code: 'ArrowLeft', sprite: 'arrow', frame: 1 },
  { code: 'ArrowDown', sprite: 'arrow', frame: 3 },
  { code: 'ArrowUp', sprite: 'arrow', frame: 2 },
  { code: 'ArrowRight', sprite: 'arrow', frame: 0 },
  { code: 'Space', sprite: 'key_space', frame: 0 },
];

const lerp = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));

export class GardenBossScreen {
  constructor(run, cb) {
    this.run = run;
    this.cb = cb; // { onWin(), onCaught(), onPause() }
    this.cfg = CONFIG.gardenBoss;
    this.t = 0;
    this.phase = 'enter'; // enter | play | win | caught
    this.phaseT = 1.3;
    this.floorY = 206;
    this.weeds = [];          // { plot, t, max }
    this.pulled = 0;
    this.anger = 0;
    this.sproutT = 0.8;
    this.feedback = null;
    this.shakeT = 0; this.shakeMag = 0;
    this.frozen = false; this.invincible = false;
    this.started = false;
    this.plots = [];          // plot centre x positions
    const n = this.cfg.plots;
    for (let i = 0; i < n; i++) this.plots.push(Math.round(58 + i * (364 / (n - 1))));
    AudioManager.playMusic('boss');
  }

  weedAt(plot) { return this.weeds.find((w) => w.plot === plot); }

  pull(w) {
    this.weeds = this.weeds.filter((x) => x !== w);
    this.pulled++;
    this.run.score += 60;
    this.feedback = { text: 'PULLED!', color: '#8ae08a', t: 0.5 };
    Particles.sparkle(this.plots[w.plot], this.floorY - 14, '#8ae08a', 6);
    Particles.dust(this.plots[w.plot], this.floorY, 3);
  }

  overgrow(w) {
    this.weeds = this.weeds.filter((x) => x !== w);
    this.anger++;
    this.shakeT = 0.3; this.shakeMag = CONFIG.fx.shakeImpact;
    this.feedback = { text: 'OVERGROWN!', color: '#ff8a8a', t: 0.6 };
    Particles.shards(this.plots[w.plot], this.floorY - 10, ['#3f7a4a', '#7fc98a'], 5);
  }

  // a wrong key — its plot has no weed — frays gogo's patience and docks
  // score, so you can't just mash all five keys: aim for the weed.
  misinput(plot) {
    this.anger += this.cfg.misinputAnger;
    this.run.score = Math.max(0, this.run.score - this.cfg.misinputScore);
    this.shakeT = 0.22; this.shakeMag = CONFIG.fx.shakeImpact * 0.6;
    this.feedback = { text: 'WRONG PLANT!', color: '#ff8a5a', t: 0.5 };
    Particles.dust(this.plots[plot], this.floorY - 6, 4);
  }

  update(dt) {
    if (!this.started) {
      this.started = true;
      Barks.note('TEND MY GARDEN, VAKS! PULL EVERY WEED OR ELSE!', 'GRANNY');
    }
    if (Input.wasPressed('Escape') && this.cb.onPause) { this.cb.onPause(); return; }
    if (Input.wasPressed('KeyI')) this.invincible = !this.invincible;
    if (Input.wasPressed('KeyT')) this.frozen = !this.frozen;

    this.t += dt;
    this.phaseT -= dt;
    this.shakeT = Math.max(0, this.shakeT - dt);
    if (this.feedback) { this.feedback.t -= dt; if (this.feedback.t <= 0) this.feedback = null; }
    Particles.update(dt);
    Barks.update(dt);

    if (this.phase === 'enter') { if (this.phaseT <= 0) this.phase = 'play'; return; }
    if (this.phase === 'win') {
      if (Math.random() < 0.3) Particles.sparkle(40 + Math.random() * 400, this.floorY - 20, '#8ae08a', 2);
      if (this.phaseT <= 0) this.cb.onWin();
      return;
    }
    if (this.phase === 'caught') { if (this.phaseT <= 0) this.cb.onCaught(); return; }

    // ---- play ----
    const C = this.cfg;
    const p = this.pulled / C.target; // progress 0..1, drives the ramp

    // pull input (one key per plot). Hitting a plot's key with no weed in it
    // is a wrong press — it penalises you (no free mashing).
    for (let i = 0; i < this.plots.length; i++) {
      if (!Input.wasPressed(PLOT_KEYS[i].code)) continue;
      const w = this.weedAt(i);
      if (w) this.pull(w);
      else this.misinput(i);
    }

    if (!this.frozen) {
      // grow existing weeds; overgrow at full height
      for (const w of [...this.weeds]) {
        w.t += dt;
        if (w.t >= w.max) this.overgrow(w);
      }
      // sprout new weeds, faster as the garden fills up
      this.sproutT -= dt;
      if (this.sproutT <= 0) {
        this.sproutT = lerp(C.sproutStart, C.sproutEnd, p);
        if (this.weeds.length < C.maxWeeds) {
          const empty = this.plots.map((_, i) => i).filter((i) => !this.weedAt(i));
          if (empty.length) {
            const plot = empty[Math.floor(Math.random() * empty.length)];
            this.weeds.push({ plot, t: 0, max: lerp(C.growStart, C.growEnd, p) });
          }
        }
      }
    }

    if (this.pulled >= C.target) {
      this.phase = 'win'; this.phaseT = 1.6;
      AudioManager.play('boss_resolve', 'garden');
      Particles.confetti(240, this.floorY - 40, 20);
    } else if (!this.invincible && this.anger >= C.angerMax) {
      this.phase = 'caught'; this.phaseT = 1.4;
      AudioManager.play('death', 'garden');
      Barks.fire('m_chao', { subtitle: true, speaker: 'VAKS', force: true });
    }
  }

  draw(ctx) {
    ctx.save();
    if (this.shakeT > 0) {
      ctx.translate(Math.round((Math.random() * 2 - 1) * this.shakeMag), Math.round((Math.random() * 2 - 1) * this.shakeMag));
    }
    drawScene(ctx, 'garden', this.t);

    // plots, weeds, and the key glyph above each
    for (let i = 0; i < this.plots.length; i++) {
      const x = this.plots[i], y = this.floorY;
      ctx.fillStyle = '#5a4330'; ctx.fillRect(x - 16, y, 32, 6);
      ctx.fillStyle = '#42301f'; ctx.fillRect(x - 16, y + 4, 32, 2);
      const w = this.weedAt(i);
      if (w) {
        const f = w.t / w.max;              // 0..1 growth
        const h = Math.round(6 + f * 24);
        const danger = f > 0.62;
        const col = danger ? (Math.floor(this.t * 12) % 2 ? '#ff8a5a' : '#e0d24a') : '#4a8f4a';
        ctx.fillStyle = col;
        ctx.fillRect(x - 2, y - h, 4, h);
        ctx.fillRect(x - 6, y - h + 5, 4, 3);
        ctx.fillRect(x + 2, y - h + 9, 4, 3);
      }
      const k = PLOT_KEYS[i];
      if (k.sprite === 'key_space') draw(ctx, 'key_space', 0, x - 13, y - 46);
      else draw(ctx, 'arrow', k.frame, x - 6, y - 44);
    }

    // Vaks tending (left), gogo watching (right, big)
    const vf = this.phase === 'win' ? VAKS.celeb[Math.floor(this.t * 4) % 2]
      : (this.phase === 'caught' ? VAKS.hurt : VAKS.idle[Math.floor(this.t * 2) % 2]);
    draw(ctx, 'vaks', vf, 16, this.floorY - 26);
    const gf = this.phase === 'caught' ? GRANNY.run[Math.floor(this.t * 8) % 4] : GRANNY.stare;
    draw(ctx, 'granny', gf, 430, this.floorY - 52, { flip: true, scale: 2 });

    Particles.draw(ctx, false);
    ctx.restore();

    // meters: GARDEN progress + GOGO patience
    const mw = 150, mx = View.w / 2 - mw / 2;
    panel(ctx, mx - 2, 12, mw + 4, 14);
    ctx.fillStyle = '#1a1a24'; ctx.fillRect(mx, 15, mw, 8);
    ctx.fillStyle = '#8ae08a'; ctx.fillRect(mx, 15, Math.round(mw * Math.min(1, this.pulled / this.cfg.target)), 8);
    drawText(ctx, 'GARDEN', mx - 44, 16, { color: '#8ae08a' });
    panel(ctx, mx - 2, 28, mw + 4, 12);
    ctx.fillStyle = '#1a1a24'; ctx.fillRect(mx, 31, mw, 6);
    ctx.fillStyle = '#ff6a6a'; ctx.fillRect(mx, 31, Math.round(mw * Math.min(1, this.anger / this.cfg.angerMax)), 6);
    drawText(ctx, 'GOGO', mx - 44, 30, { color: '#ff8a8a' });

    if (this.phase === 'enter') {
      drawText(ctx, 'TEND THE PLAAS!', View.w / 2, 92, { color: '#ffd2e0', scale: 2, align: 'center' });
      drawText(ctx, "HIT A PLOT'S KEY TO PULL ITS WEED BEFORE IT OVERGROWS", View.w / 2, 114, { color: '#8a93b8', align: 'center' });
      drawText(ctx, 'THE WRONG PLANT ANGERS GRANNY. AIM, NOT MASH BUTTONS', View.w / 2, 126, { color: '#ff9a7a', align: 'center' });
    }
    if (this.phase === 'win') drawText(ctx, 'THE GARDEN IS PERFECT.', View.w / 2, 92, { color: '#ffe49a', scale: 2, align: 'center' });
    if (this.phase === 'caught') { dimScreen(ctx, 0.5); drawText(ctx, 'WEEDS WIN. CHAO.', View.w / 2, 100, { color: '#ff8a8a', scale: 2, align: 'center' }); }
    if (this.feedback) drawText(ctx, this.feedback.text, View.w / 2, 70, { color: this.feedback.color, align: 'center' });
    if (this.frozen) drawText(ctx, 'FROZEN', View.w / 2, 48, { color: '#7fd0ff', align: 'center' });
    if (this.invincible) drawText(ctx, 'INVINCIBLE', View.w / 2, 56, { color: '#7fd0ff', align: 'center' });

    Barks.draw(ctx, null);
  }
}
