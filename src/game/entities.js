// ============================================================
// Entities: bottles, rats, tikolosh variants, pickups,
// checkpoints, NPCs. Sushi is static data handled by the level.
// ============================================================

import { CONFIG } from '../config.js';
import { draw } from '../engine/sprites.js';
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

  stomp(lr) {
    this.squishT = 0.7;
    barkStomp({ anchor: lr.player });
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
    const sp = this.fleeT > 0 ? CONFIG.rats.fleeSpeed : CONFIG.rats.speed;
    this.x += this.dir * sp * d;
    if (this.x < this.minX) { this.x = this.minX; this.dir = 1; }
    if (this.x > this.maxX) { this.x = this.maxX; this.dir = -1; }
    if (!this.seen && lr.cam.sees(this.x, this.y, 8)) {
      this.seen = true;
      barkRat({ anchor: lr.player });
    }
  }

  hitbox() { return { x: this.x - 6, y: this.y - 8, w: 12, h: 8 }; }

  draw(ctx, cam) {
    if (!cam.sees(this.x, this.y, 16)) return;
    if (this.squishT > 0) { draw(ctx, 'rat_squish', 0, this.x - 7, this.y - 8, { flip: this.dir < 0 }); return; }
    draw(ctx, 'rat', Math.floor(this.t * 8) % 2, this.x - 7, this.y - 8, { flip: this.dir < 0 });
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
  }

  update(dt, lr, slow) {
    const d = dt * slow;
    this.t += d;
    if (this.kind === 'irie') {
      // lazy unpredictable drift
      const span = this.maxX - this.minX;
      const u = (Math.sin(this.t * 0.45 + this.phase) + Math.sin(this.t * 0.23 + this.phase * 2) * 0.5) / 1.5;
      this.x = this.minX + span * (0.5 + u * 0.5);
      this.y = this.baseY + Math.sin(this.t * 1.1) * CONFIG.tiko.irieBobAmp - 16;
      if (Math.random() < 0.04) Particles.wisp(this.x, this.y + 10, 'rgba(176,127,224,0.4)');
    } else {
      // shadow patrol along its ledge
      this.x += this.dir * CONFIG.tiko.shadowSpeed * d;
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
    if (this.kind === 'shadow' && alpha > 0.05) {
      ctx.globalAlpha = Math.min(1, alpha + 0.3);
      ctx.fillStyle = '#c8ffc8';
      ctx.fillRect(Math.round(this.x - 7), Math.round(this.y - 5), 2, 2);
      ctx.fillRect(Math.round(this.x + 5), Math.round(this.y - 5), 2, 2);
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
    if (this.taken || !cam.sees(this.x, this.y, 16)) return;
    const y = this.bobY();
    if (this.kind === 'ceppy') draw(ctx, 'ceppy', 0, this.x - 5, y - 4);
    else if (this.kind === 'crystal') draw(ctx, 'crystal', Math.floor(this.t * 3) % 2, this.x - 4, y - 6);
    else draw(ctx, 'weed', 0, this.x - 6, y - 6);
  }
}

// ---------------- checkpoints ----------------

export class Checkpoint {
  constructor(d) { this.x = d.x; this.y = d.y; this.active = false; this.t = 0; }
  update(dt) { this.t += dt; }
  draw(ctx, cam) {
    if (!cam.sees(this.x, this.y, 30)) return;
    const f = this.active ? 1 + (Math.floor(this.t * 4) % 2) : 0;
    draw(ctx, 'flag', f, this.x - 7, this.y - 26);
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
