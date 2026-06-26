// ============================================================
// Entities: bottles, rats, tikolosh variants, pickups,
// checkpoints, NPCs. Sushi is static data handled by the level.
// ============================================================

import { CONFIG } from '../config.js';
import { draw, drawImoHead, TIKO_HEAD_RECT, TSOTSI } from '../engine/sprites.js';
import { Particles } from '../engine/particles.js';
import { Barks } from '../systems/audio.js';

const barkRat = Barks.wire('m_rrattax', 'entities.js: rat appears on screen');
const barkStomp = Barks.wire('m_not_scared', 'entities.js: rat stomped');
const barkTallman = Barks.wire('m_tallman', 'entities.js: Tallman NPC');
const barkShorty = Barks.wire('m_shorty', 'entities.js: Shorty NPC');
const barkStout = Barks.wire('m_stout', 'entities.js: Shorty follow-up');
const barkGanja = Barks.wire('m_wheres_ganja', 'entities.js: approaching weed pickup');

export { barkStomp };

// ---------------- bottles (Thursday's debris) ----------------

export class Bottle {
  constructor(x, y, dir) {
    this.x = x; this.y = y;
    this.vx = dir * CONFIG.bottles.speed;
    this.vy = 0;
    this.t = Math.random() * 4;
    this.dead = false;
    this.grounded = false;
  }

  update(dt, lr, slow) {
    const d = dt * slow;
    this.t += d;
    this.vy = Math.min(CONFIG.physics.maxFall, this.vy + CONFIG.physics.gravity * d);
    const prevY = this.y;
    this.x += this.vx * d;
    for (const w of lr.level.walls) {
      if (this.y > w.y && this.y - 10 < w.y + w.h && this.x + 4 > w.x && this.x - 4 < w.x + w.w) {
        this.vx *= -1;
        this.x = this.x < w.x + w.w / 2 ? w.x - 4 : w.x + w.w + 4;
      }
    }
    this.y += this.vy * d;
    this.grounded = false;
    if (this.vy >= 0) {
      for (const p of lr.solidPlatforms()) {
        if (prevY <= p.y + 0.01 && this.y >= p.y && this.x + 4 > p.x && this.x - 4 < p.x + p.w) {
          if (this.vy > 150) Particles.dust(this.x, p.y, 2);
          this.y = p.y; this.vy = 0; this.grounded = true;
          break;
        }
      }
    }
    if (this.y > lr.killY()) this.dead = true; // swallowed below
  }

  shatter() {
    this.dead = true;
    Particles.shards(this.x, this.y - 6, ['#3f7a4a', '#7fc98a', '#c9a86a']);
  }

  draw(ctx, cam) {
    if (!cam.sees(this.x, this.y, 20)) return;
    const f = this.grounded ? Math.floor(this.t * CONFIG.bottles.spinHz) % 4 : Math.floor(this.t * 10) % 4;
    draw(ctx, 'bottle', f, this.x - 4, this.y - 13);
  }
}

// ---------------- rats ----------------

export class Rat {
  constructor(d) {
    this.x = d.x; this.y = d.y;
    this.minX = d.minX; this.maxX = d.maxX;
    this.dir = Math.random() < 0.5 ? -1 : 1;
    // each rat gets its own size — some big, some small (data can pin it)
    const sizes = CONFIG.rats.sizes;
    this.scale = d.scale ?? sizes[Math.floor(Math.random() * sizes.length)];
    this.fleeT = 0;
    this.squishT = 0;
    this.dead = false;
    this.seen = false;
    this.t = Math.random() * 5;
    this.bubbleH = 12;
  }

  flee(fromX) {
    this.fleeT = CONFIG.rats.fleeTime;
    this.dir = this.x >= fromX ? 1 : -1;
  }

  stomp(lr, silent = false) {
    this.squishT = 0.7;
    if (!silent) barkStomp({ anchor: lr.player });
    Particles.dust(this.x, this.y, 4);
  }

  update(dt, lr, slow) {
    this.t += dt;
    if (this.squishT > 0) {
      this.squishT -= dt;
      if (this.squishT <= 0) this.dead = true;
      return;
    }
    const d = dt * slow;
    this.fleeT -= dt;
    const R = CONFIG.rats;
    let sp;
    if (this.fleeT > 0) {
      sp = R.fleeSpeed;                       // meow: scatter (dir already set away)
    } else {
      // charge Vaks when he's close on this ledge; otherwise lazy patrol
      const p = lr.player;
      const dx = p.x - this.x;
      if (!p.dead && Math.abs(dx) < R.aggroX && Math.abs(p.y - this.y) < R.aggroY) {
        this.dir = dx >= 0 ? 1 : -1;
        sp = R.chaseSpeed;
      } else {
        sp = R.speed;
      }
    }
    this.x += this.dir * sp * d;
    if (this.x < this.minX) { this.x = this.minX; this.dir = 1; }
    if (this.x > this.maxX) { this.x = this.maxX; this.dir = -1; }
    if (!this.seen && lr.cam.sees(this.x, this.y, 8)) {
      this.seen = true;
      barkRat({ anchor: lr.player });
    }
  }

  hitbox() {
    const s = this.scale;
    const { hbW, hbH } = CONFIG.rats;
    return { x: this.x - hbW * s / 2, y: this.y - 8 * s, w: hbW * s, h: hbH * s };
  }

  draw(ctx, cam) {
    if (!cam.sees(this.x, this.y, 16 * this.scale)) return;
    const s = this.scale;
    // sprite is 14x8: x-7*s keeps it centered, y-8*s keeps the feet at y
    if (this.squishT > 0) { draw(ctx, 'rat_squish', 0, this.x - 7 * s, this.y - 8 * s, { flip: this.dir < 0, scale: s }); return; }
    draw(ctx, 'rat', Math.floor(this.t * 8) % 2, this.x - 7 * s, this.y - 8 * s, { flip: this.dir < 0, scale: s });
  }
}

// ---------------- township tsotsis (W2 gangsters) ----------------
// Three kinds working their stretch of street: the phone snatcher
// (knife — chases, grabs mano on contact), the gunman (holds his
// ground, telegraphs, fires jumpable bullets), and the viceroy
// pusher (shuffles over to force a sip: instant babalas).
// Stompable, never killable — they sit down hard and see stars.

export class Tsotsi {
  constructor(d) {
    this.kind = d.kind; // 'knife' | 'gun' | 'viceroy'
    this.x = d.x; this.y = d.y;
    this.minX = d.minX; this.maxX = d.maxX;
    this.dir = Math.random() < 0.5 ? -1 : 1;
    this.t = Math.random() * 5;
    this.stunT = 0;
    this.cd = 0; // post-release grace so he can't re-grab instantly
    this.fireT = CONFIG.tsotsi.gun.fireEvery * (0.5 + Math.random() * 0.5);
    this.telegraphT = 0;
    this.chasing = false;
    this.holding = false; // got Vaks in his grip
    this.drainAcc = 0;    // knife: fractional mano drained while holding
    this.seen = false;
    this.bubbleH = 30;
  }

  hitbox() { return { x: this.x - 7, y: this.y - 26, w: 14, h: 26 }; }

  stomp() {
    this.stunT = CONFIG.tsotsi.stunTime;
    this.telegraphT = 0;
    this.chasing = false;
    Particles.dust(this.x, this.y, 5);
  }

  update(dt, lr, slow) {
    this.t += dt;
    const T = CONFIG.tsotsi;
    if (this.stunT > 0) { this.stunT -= dt; return; }
    if (this.holding) { this.telegraphT = 0; this.chasing = false; return; } // busy gripping Vaks
    if (this.cd > 0) this.cd -= dt;
    const d = dt * slow;
    const p = lr.player;
    const dx = p.x - this.x, dy = p.y - this.y;

    if (!this.seen && lr.cam.sees(this.x, this.y - 14, 12)) {
      this.seen = true;
      lr.tsotsiSpotted(this);
    }

    if (this.kind === 'gun') {
      // holds his corner: face Vaks, telegraph, fire a jumpable bullet
      this.chasing = false;
      if (Math.abs(dx) < T.gun.range && Math.abs(dy) < T.aggroY && !p.dead) {
        this.dir = dx >= 0 ? 1 : -1;
        if (this.telegraphT > 0) {
          this.telegraphT -= d;
          if (this.telegraphT <= 0) lr.tsotsiShoot(this);
        } else {
          this.fireT -= d;
          if (this.fireT <= 0) { this.fireT = T.gun.fireEvery; this.telegraphT = T.gun.telegraph; }
        }
      } else {
        this.telegraphT = 0;
        this.x += this.dir * T.walkSpeed * 0.5 * d;
        if (this.x < this.minX) { this.x = this.minX; this.dir = 1; }
        if (this.x > this.maxX) { this.x = this.maxX; this.dir = -1; }
      }
      return;
    }

    // knife + viceroy: patrol the turf, come for Vaks when he's close
    this.chasing = !p.dead && Math.abs(dx) < T.aggroX && Math.abs(dy) < T.aggroY && Math.abs(dx) > 2;
    if (this.chasing) {
      this.dir = dx >= 0 ? 1 : -1;
      const sp = this.kind === 'viceroy' ? T.chaseSpeed * 0.6 * T.viceroy.lungeMul : T.chaseSpeed;
      this.x += this.dir * sp * d;
    } else {
      this.x += this.dir * T.walkSpeed * d;
    }
    // territorial: never leaves his stretch (and never walks into a gap)
    if (this.x < this.minX) { this.x = this.minX; if (!this.chasing) this.dir = 1; }
    if (this.x > this.maxX) { this.x = this.maxX; if (!this.chasing) this.dir = -1; }
  }

  draw(ctx, cam) {
    if (!cam.sees(this.x, this.y - 14, 30)) return;
    let f;
    if (this.stunT > 0) f = TSOTSI.stun;
    else if (this.holding) f = TSOTSI.aim; // arm up: got him by the jersey
    else if (this.kind === 'gun' && this.telegraphT > 0) f = TSOTSI.aim;
    else f = TSOTSI.walk[Math.floor(this.t * (this.chasing ? 9 : 4)) % 2];
    draw(ctx, 'tsotsi_' + this.kind, f, this.x - 10, this.y - 28, { flip: this.dir < 0 });
    // muzzle glint while telegraphing — the tell to jump
    if (this.telegraphT > 0 && Math.floor(this.t * 12) % 2 === 0) {
      ctx.fillStyle = '#ffd84d';
      ctx.fillRect(Math.round(this.x + this.dir * 9), Math.round(this.y - CONFIG.tsotsi.gun.bulletY), 2, 2);
    }
  }
}

// the gunman's bullet: slow, straight, jumpable
export class TsotsiBullet {
  constructor(x, y, dir) {
    this.x = x; this.y = y;
    this.vx = dir * CONFIG.tsotsi.gun.bulletSpeed;
    this.t = 0;
    this.dead = false;
  }

  update(dt, lr, slow) {
    this.t += dt;
    this.x += this.vx * dt * slow;
    if (this.t > 4 || !lr.cam.sees(this.x, this.y, 60)) this.dead = true;
  }

  draw(ctx, cam) {
    if (!cam.sees(this.x, this.y, 8)) return;
    draw(ctx, 'tsotsi_bullet', 0, this.x - 2, this.y - 1, { flip: this.vx < 0 });
  }
}

// ---------------- tikolosh variants (irie drifter, shadow patroller) ----------------

export class Tiko {
  constructor(d) {
    this.kind = d.kind;
    this.baseY = d.y;
    this.minX = d.minX; this.maxX = d.maxX;
    this.x = d.x; this.y = d.y;
    this.dir = 1;
    this.t = Math.random() * 10;
    this.phase = Math.random() * 6.28;
    this.fleeT = 0; this.fleeDir = 1;
  }

  // meow repel: shoved away from Vaks for a moment, breaking any homing
  flee(fromX) {
    this.fleeT = CONFIG.tiko.fleeTime;
    this.fleeDir = this.x >= fromX ? 1 : -1;
  }

  // move at most `step` px toward (tx,ty) — caps homing speed so Vaks escapes
  stepToward(tx, ty, step) {
    const dx = tx - this.x, dy = ty - this.y;
    const m = Math.hypot(dx, dy) || 1;
    const k = Math.min(step, m) / m;
    this.x += dx * k; this.y += dy * k;
  }

  update(dt, lr, slow) {
    const d = dt * slow;
    this.t += d;
    const C = CONFIG.tiko;
    const p = lr.player;

    if (this.fleeT > 0) { // repelled by a meow
      this.fleeT -= dt;
      this.x += this.fleeDir * C.fleeSpeed * d;
      this.y = this.baseY + Math.sin(this.t * 5) * 3 - 16;
      return;
    }

    // home in on Vaks once he's within range (contact = death; meow is relief).
    // not in the dark level — you can't see them coming there, so they only patrol.
    const near = !p.dead && !lr.level.dark
      && Math.abs(p.x - this.x) < C.homeRange && Math.abs(p.y - this.y) < C.homeRange;
    if (near) {
      const sp = (this.kind === 'shadow' ? C.shadowChase : C.homeSpeed) * d;
      this.stepToward(p.x, p.y - 6, sp);
      if (this.kind === 'irie' && Math.random() < 0.06) Particles.wisp(this.x, this.y + 10, 'rgba(176,127,224,0.4)');
      return;
    }

    if (this.kind === 'irie') {
      // lazy unpredictable drift
      const span = this.maxX - this.minX;
      const u = (Math.sin(this.t * 0.45 + this.phase) + Math.sin(this.t * 0.23 + this.phase * 2) * 0.5) / 1.5;
      this.x = this.minX + span * (0.5 + u * 0.5);
      this.y = this.baseY + Math.sin(this.t * 1.1) * C.irieBobAmp - 16;
      if (Math.random() < 0.04) Particles.wisp(this.x, this.y + 10, 'rgba(176,127,224,0.4)');
    } else {
      // shadow patrol along its ledge
      this.x += this.dir * C.shadowSpeed * d;
      if (this.x < this.minX) { this.x = this.minX; this.dir = 1; }
      if (this.x > this.maxX) { this.x = this.maxX; this.dir = -1; }
      this.y = this.baseY - 13 + Math.sin(this.t * 2) * 2;
    }
  }

  hitbox() { return { x: this.x - 8, y: this.y - 12, w: 16, h: 24 }; }

  // visibility handled by the level in dark zones
  draw(ctx, cam, alpha = 1) {
    if (!cam.sees(this.x, this.y, 30)) return;
    const sheet = this.kind === 'irie' ? 'tiko_irie' : 'tiko_shadow';
    draw(ctx, sheet, Math.floor(this.t * 2) % 2, this.x - 10, this.y - 13, { alpha });
    // the HD photo head draws in screen space (queueHD bypasses the ctx
    // camera transform), so subtract the camera offset to keep it on the body
    drawImoHead(ctx, sheet, this.x - 10 + TIKO_HEAD_RECT.x - cam.ox(), this.y - 13 + TIKO_HEAD_RECT.y - cam.oy(),
      TIKO_HEAD_RECT.w, TIKO_HEAD_RECT.h, false, alpha);
    if (this.kind === 'shadow' && alpha > 0.05) {
      ctx.globalAlpha = Math.min(1, alpha + 0.3);
      // eye glow tracks the enlarged photo head (raised + spread to match)
      ctx.fillStyle = '#c8ffc8';
      ctx.fillRect(Math.round(this.x - 6), Math.round(this.y - 9), 3, 3);
      ctx.fillRect(Math.round(this.x + 2), Math.round(this.y - 9), 3, 3);
      ctx.globalAlpha = 1;
    }
  }
}

// ---------------- pickups ----------------

export class Pickup {
  constructor(d) {
    this.kind = d.kind;
    this.x = d.x; this.y = d.y;
    this.t = Math.random() * 6;
    this.taken = false;
    this.warned = false;
  }

  update(dt, lr) {
    this.t += dt;
    if (this.kind === 'weed' && !this.warned && !this.taken) {
      const dx = lr.player.x - this.x, dy = lr.player.y - this.y;
      if (dx * dx + dy * dy < 80 * 80) {
        this.warned = true;
        barkGanja({ anchor: lr.player });
      }
    }
  }

  bobY() { return this.y + Math.sin(this.t * 3) * 2; }

  draw(ctx, cam) {
    if (this.taken || !cam.sees(this.x, this.y, 18)) return;
    const y = this.bobY();
    if (this.kind === 'r2') draw(ctx, 'r2', 0, this.x - 6, y - 5);
    else if (this.kind === 'weed') draw(ctx, 'weed', 0, this.x - 7, y - 7); // 13x13 leaf
    else draw(ctx, 'note_' + this.kind, 0, this.x - 12, y - 6); // banknotes (24x12)
  }
}

// ---------------- checkpoints ----------------

export class Checkpoint {
  constructor(d) { this.x = d.x; this.y = d.y; this.active = false; this.t = 0; }
  update(dt) { this.t += dt; }
  draw(ctx, cam) {
    if (!cam.sees(this.x, this.y, 30)) return;
    const f = this.active ? 1 + (Math.floor(this.t * 4) % 2) : 0;
    if (this.active) {
      // warm pulsing halo: the lantern burns brighter once passed
      const gx = this.x, gy = this.y - 5;
      const rad = 18 + Math.sin(this.t * 5) * 3;
      const grad = ctx.createRadialGradient(gx, gy, 2, gx, gy, rad);
      grad.addColorStop(0, 'rgba(255,200,110,0.55)');
      grad.addColorStop(1, 'rgba(255,184,77,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(gx - rad, gy - rad, rad * 2, rad * 2);
    }
    draw(ctx, 'cp_lantern', f, this.x - 5, this.y - 10);
  }
}

// ---------------- NPCs (Tallman & Shorty) ----------------

export class NPC {
  constructor(d) {
    this.kind = d.kind;
    this.x = d.x; this.y = d.y;
    this.t = Math.random() * 4;
    this.met = false;
    this.followUp = -1;
    this.bubbleH = this.kind === 'tallman' ? 44 : 28;
  }

  update(dt, lr) {
    this.t += dt;
    if (this.followUp > 0) {
      this.followUp -= dt;
      if (this.followUp <= 0) barkStout({ anchor: lr.player, force: true });
    }
    if (!this.met && Math.abs(lr.player.x - this.x) < 70) {
      this.met = true;
      if (this.kind === 'tallman') {
        barkTallman({ anchor: lr.player, force: true });
      } else {
        barkShorty({ anchor: lr.player, force: true });
        this.followUp = 2.6;
      }
    }
  }

  draw(ctx, cam) {
    if (!cam.sees(this.x, this.y, 40)) return;
    const f = Math.floor(this.t * 1.5) % 2;
    if (this.kind === 'tallman') draw(ctx, 'tallman', f, this.x - 9, this.y - 42);
    else draw(ctx, 'shorty', f, this.x - 8, this.y - 26);
  }
}
