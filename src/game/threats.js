// ============================================================
// THREATS — one interface, two weathers.
// Mist (vertical): a rising line of Tikolosh presence.
// Granny (horizontal): the chaser with stare/burst/faint cycle.
// Both expose: update, caught(player), gaugeFrac(player),
// draw(ctx, cam, t), frozen (debug T).
// ============================================================

import { CONFIG } from '../config.js';
import { View } from '../engine/render.js';
import { draw, drawImoHead, TIKO_HEAD_RECT, GRANNY } from '../engine/sprites.js';
import { Particles } from '../engine/particles.js';
import { Barks, AudioManager } from '../systems/audio.js';

const barkDanger = Barks.wire('m_danger_trio', 'threats.js: danger_close escalation');
const barkFaint = Barks.wire('m_granny_faints', 'threats.js: granny faints');
const barkGogo = Barks.wire('m_gogo', 'threats.js: granny caught');
const barkSpy = Barks.wire('m_granny_spy', 'threats.js: chase start + stare telegraph');

// shared: escalating danger_close_1/2/3 barks off the threat gauge
class DangerEscalation {
  constructor() { this.tier = 0; this.cd = 0; }
  update(dt, frac, anchor) {
    this.cd -= dt;
    const fr = CONFIG.mist.dangerFracs;
    let tier = 0;
    if (frac < fr[2]) tier = 3; else if (frac < fr[1]) tier = 2; else if (frac < fr[0]) tier = 1;
    if (tier > 0 && (tier > this.tier || this.cd <= 0)) {
      if (tier !== this.tier || this.cd <= 0) {
        barkDanger({ line: tier - 1, event: 'danger_close_' + tier, anchor });
        this.cd = 7;
      }
    }
    if (tier < this.tier && frac > fr[0] + 0.1) this.tier = 0;
    else this.tier = Math.max(this.tier, tier);
    if (tier === 0) this.tier = 0;
  }
}

export class Mist {
  constructor(level) {
    this.level = level;
    this.topY = level.spawn.y + CONFIG.mist.startGap;
    this.rate = CONFIG.mist.rate[level.id] || 16;
    this.frozen = false;
    this.t = 0;
    this.danger = new DangerEscalation();
  }

  resetTo(cpY) { this.topY = cpY + CONFIG.mist.resetGap; }

  update(dt, player) {
    this.t += dt;
    const slow = 1; // irie no longer slows the mist — only rats & tikolosh
    if (!this.frozen) {
      let rise = this.rate;
      // rubber band: hurry up if Vaks has raced too far ahead, easing back to
      // the base rate at the threshold (proportional => never overtakes him)
      const M = CONFIG.mist;
      const lead = this.topY - player.y;   // how far the mist sits below Vaks
      if (lead > M.maxLead) rise += Math.min(M.catchUpMax, (lead - M.maxLead) * M.catchUpK);
      this.topY -= rise * dt * slow;
    }
    // ambient wisps at the surface
    if (Math.random() < 0.25) {
      Particles.wisp(20 + Math.random() * (this.level.width - 40), this.topY + Math.random() * 30);
    }
    this.danger.update(dt, this.gaugeFrac(player), player);
  }

  caught(player) { return player.y >= this.topY + CONFIG.mist.catchPad; }

  gaugeFrac(player) {
    return Math.max(0, Math.min(1, (this.topY - player.y) / 230));
  }

  draw(ctx, cam) {
    const top = this.topY;
    const camBot = cam.y + View.h;
    if (top > camBot + 40) return;
    const x0 = cam.ox(), y0 = Math.round(top);
    // rippling edge
    ctx.fillStyle = 'rgba(143,208,124,0.5)';
    for (let x = 0; x < View.w; x += 6) {
      const wob = Math.sin(this.t * 2.2 + x * 0.07) * 4 + Math.sin(this.t * 3.7 + x * 0.13) * 2;
      ctx.fillRect(x0 + x, y0 + wob - 4, 6, 8);
    }
    // body gradient
    const h = Math.max(0, camBot - top + 20);
    const g = ctx.createLinearGradient(0, y0, 0, y0 + Math.min(h, 200));
    g.addColorStop(0, 'rgba(143,208,124,0.55)');
    g.addColorStop(0.4, 'rgba(74,143,74,0.8)');
    g.addColorStop(1, 'rgba(26,46,30,0.97)');
    ctx.fillStyle = g;
    ctx.fillRect(x0, y0 + 2, View.w, h);
    // the intro Tikolosh looms in the mist (level 1, heavily telegraphed)
    if (this.level.introTiko) {
      const tx = this.level.width / 2 + Math.sin(this.t * 0.5) * 90;
      const ty = top + 26 + Math.sin(this.t * 0.9) * 8;
      draw(ctx, 'tiko', Math.floor(this.t * 2) % 2, tx - 20, ty, { alpha: 0.55, scale: 2 });
      // HD photo head draws in screen space (queueHD bypasses the ctx camera
      // transform), so subtract the camera offset to keep it over the body
      drawImoHead(ctx, 'tiko', tx - 20 + TIKO_HEAD_RECT.x * 2 - cam.ox(), ty + TIKO_HEAD_RECT.y * 2 - cam.oy(),
        TIKO_HEAD_RECT.w * 2, TIKO_HEAD_RECT.h * 2, false, 0.55);
      // glowing eyes punch through (photo head eye line, x2 scale).
      // Tracks the enlarged head: same bottom-centre anchor, so the eyes
      // ride higher and spread wider, and the glints grow with the face.
      ctx.fillStyle = 'rgba(174,242,168,0.9)';
      ctx.fillRect(Math.round(tx - 20 + 11), Math.round(ty + 9), 6, 6);
      ctx.fillRect(Math.round(tx - 20 + 25), Math.round(ty + 9), 6, 6);
    }
  }
}

export class Granny {
  constructor(level) {
    this.level = level;
    this.x = level.spawn.x - CONFIG.granny.startGap;
    this.y = level.groundY;
    this.base = CONFIG.granny.speed[level.id] || 96;
    this.state = 'chase'; // chase | stare | burst | faint
    this.stateT = 0;
    this.faintTimer = CONFIG.granny.faintEvery[level.id];
    this.burstTimer = CONFIG.granny.burstEvery[level.id];
    this.frozen = false;
    this.t = 0; this.animT = 0;
    this.charm = 0; // faint charm bonus seconds (shop item)
    this.danger = new DangerEscalation();
    this.announced = false;
  }

  resetTo(cpX) { this.x = cpX - CONFIG.granny.resetGap; this.state = 'chase'; this.stateT = 0; }

  // scripted beat: Tallman & Shorty stall her over their debts
  stall(secs) { this.state = 'stalled'; this.stateT = secs; }

  speed() {
    const C = CONFIG.granny;
    if (this.state === 'stalled') return 0;          // only the scripted stall fully stops her
    if (this.state === 'burst') return this.base * C.burstMul;
    if (this.state === 'stare') return this.base * 0.85; // wind-up, but she keeps flowing
    return this.base;
  }

  update(dt, player, lr) {
    const C = CONFIG.granny;
    this.t += dt;
    const slow = 1; // irie no longer slows granny — only rats & tikolosh
    if (!this.announced) {
      this.announced = true;
      barkSpy({ subtitle: true, speaker: 'GRANNY', force: true });
    }
    if (this.frozen) return;

    this.stateT -= dt;
    const gap = player.x - this.x;

    switch (this.state) {
      case 'chase': {
        this.burstTimer -= dt;
        // rubber band like the mist: gogo hurries up proportionally when Vaks
        // gets more than maxLead ahead, capped just under runSpeed so she stays
        // right on his heels but a flat-out runner can still escape. She never
        // faints/rests now — she only winds up bursts.
        let sp = this.base;
        if (gap > C.maxLead) sp = Math.min(CONFIG.player.runSpeed - C.catchUpCap, this.base + (gap - C.maxLead) * C.catchUpK);
        this.x += sp * dt * slow;
        this.animT += dt * 9 * slow;
        if (this.burstTimer <= 0 && gap < 260) {
          this.state = 'stare';
          this.stateT = C.stareTime;
          this.burstTimer = C.burstEvery[this.level.id];
          barkSpy({ subtitle: true, speaker: 'GRANNY' });
          AudioManager.play('granny_chase_start', 'stare');
        }
        break;
      }
      case 'stare':
        this.x += this.speed() * dt * slow;   // keep flowing during the wind-up
        this.animT += dt * 9 * slow;
        if (this.stateT <= 0) {
          this.state = 'burst';
          this.stateT = C.burstTime;
          lr.shake(CONFIG.fx.shakeBurst);
        }
        break;
      case 'burst':
        this.x += this.speed() * dt * slow;
        this.animT += dt * 16 * slow;
        if (Math.random() < 0.5) Particles.dust(this.x - 6, this.y, 1);
        if (this.stateT <= 0) this.state = 'chase';
        break;
      case 'faint':
        if (Math.random() < 0.06) Particles.zzz(this.x, this.y - 18);
        if (this.stateT <= 0) this.state = 'chase';
        break;
      case 'stalled':
        if (this.stateT <= 0) this.state = 'chase';
        break;
    }

    this.danger.update(dt, this.gaugeFrac(player), player);
  }

  onCaught() { barkGogo({ subtitle: true, speaker: 'VAKS', force: true }); }

  caught(player) {
    if (this.frozen || this.state === 'faint' || this.state === 'stalled') return false;
    return player.x <= this.x + CONFIG.granny.catchDist && player.y >= this.level.groundY - 46;
  }

  gaugeFrac(player) {
    return Math.max(0, Math.min(1, (player.x - this.x) / (CONFIG.granny.startGap * 1.5)));
  }

  draw(ctx, cam) {
    const x = Math.round(this.x), y = Math.round(this.y);
    if (!cam.sees(x, y, 60)) return;
    if (this.state === 'faint') {
      draw(ctx, 'granny_faint', 0, x - 14, y - 12);
      return;
    }
    let f = GRANNY.idle;
    if (this.state === 'stare') f = GRANNY.stare;
    else if (this.state === 'burst' || this.state === 'chase') f = GRANNY.run[Math.floor(this.animT) % 4];
    if (this.state === 'burst') {
      draw(ctx, 'granny', f, x - 16, y - 26, { alpha: 0.3 });
      draw(ctx, 'granny', f, x - 12, y - 26, { alpha: 0.5 });
    }
    draw(ctx, 'granny', f, x - 10, y - 26);
    if (this.state === 'stare') {
      // the readable warning
      ctx.fillStyle = '#ff5a5a';
      ctx.fillRect(x - 1, y - 40, 3, 8);
      ctx.fillRect(x - 1, y - 30, 3, 3);
    }
  }
}
