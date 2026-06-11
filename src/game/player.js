// ============================================================
// Vaks. One movement core for both grammars: the level's
// orientation switches walk vs run physics and enables ladders.
// Position (x, y) = feet center.
// ============================================================

import { CONFIG } from '../config.js';
import { Input } from '../engine/input.js';
import { draw, VAKS } from '../engine/sprites.js';
import { Particles } from '../engine/particles.js';
import { Barks } from '../systems/audio.js';

const barkMeow = Barks.wire('m_meow_pool', 'player.js: M key meow');

export class Player {
  constructor(level, lr) {
    this.level = level;
    this.lr = lr; // level runtime hooks: fx(), shake(), hitStop()
    this.o = level.orientation;
    this.x = level.spawn.x; this.y = level.spawn.y;
    this.vx = 0; this.vy = 0;
    this.facing = 1;
    this.onGround = true;
    this.climbing = false; this.ladder = null;
    this.coyote = 0; this.jbuf = 0; this.jumpHeld = false;
    this.irieT = 0; this.overT = 0; this.swayPhase = 0;
    this.stun = 0; this.invuln = 0;
    this.babalasT = 0;
    this.meowCd = 0; this.meowFlash = 0;
    this.idleT = 0;
    this.animT = 0; this.landT = 0;
    this.sqX = 1; this.sqY = 1;
    this.bubbleH = 36;
    this.dead = false;
    this.celebrating = false;
  }

  get irie() { return this.irieT > 0; }
  get overstacked() { return this.overT > 0; }
  // world time scale: irie slows the world around Vaks
  worldScale() { return this.irie ? CONFIG.irie.slowFactor : 1; }

  hitbox() {
    const { hbW, hbH } = CONFIG.player;
    return { x: this.x - hbW / 2, y: this.y - hbH, w: hbW, h: hbH };
  }

  startIrie() {
    if (this.irie) {
      this.overT = CONFIG.irie.overstackTime;
      return 'overstack';
    }
    this.irieT = CONFIG.irie.duration;
    return 'irie';
  }

  hurt(fromX) {
    if (this.invuln > 0 || this.dead) return false;
    const P = CONFIG.player;
    const dir = this.x >= fromX ? 1 : -1;
    this.vx = dir * P.knockbackX;
    this.vy = -P.knockbackY * 0.7;
    this.stun = P.stunTime;
    this.invuln = P.invulnTime;
    this.onGround = false; this.climbing = false;
    this.lr.hitStop();
    this.lr.shake(CONFIG.fx.shakeImpact);
    return true;
  }

  respawn(x, y) {
    this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.dead = false; this.climbing = false; this.onGround = true;
    this.stun = 0; this.invuln = 1.6; this.irieT = 0; this.overT = 0;
    this.babalasT = 1.4;
  }

  findLadder() {
    for (const ld of this.level.ladders) {
      const cx = ld.x + 5;
      if (Math.abs(this.x - cx) <= 9 &&
          this.y >= ld.y - 4 && this.y <= ld.y + ld.h + 4) return ld;
    }
    return null;
  }

  update(dt) {
    const P = CONFIG.player;
    const G = CONFIG.physics;
    if (this.dead) return;

    this.meowCd -= dt; this.invuln -= dt; this.landT -= dt;
    this.irieT = Math.max(0, this.irieT - dt);
    this.overT = Math.max(0, this.overT - dt);
    this.babalasT = Math.max(0, this.babalasT - dt);
    this.swayPhase += dt * CONFIG.irie.swayHz * Math.PI * 2;
    this.meowFlash -= dt;

    // squash decay
    this.sqX += (1 - this.sqX) * Math.min(1, 12 * dt);
    this.sqY += (1 - this.sqY) * Math.min(1, 12 * dt);

    const stunned = this.stun > 0;
    if (stunned) this.stun -= dt;

    let dir = stunned || this.celebrating ? 0 : Input.dirX();
    let dirY = stunned || this.celebrating ? 0 : Input.dirY();

    // overstack: loose controls + sway
    if (this.overstacked && dir !== 0) dir *= 0.55;

    if (dir > 0) this.facing = 1;
    if (dir < 0) this.facing = -1;

    // idle tracking (for idle check-in barks)
    if (dir === 0 && dirY === 0 && this.onGround && !this.climbing) this.idleT += dt;
    else this.idleT = 0;

    // meow
    if (!this.celebrating && Input.wasPressed('KeyM') && this.meowCd <= 0) {
      this.meowCd = P.meowCooldown;
      this.meowFlash = 0.5;
      barkMeow({ anchor: this });
      this.lr.meow(this.x, this.y);
    }

    // jump buffering
    if (Input.wasPressed('Space')) this.jbuf = P.jumpBuffer;
    else this.jbuf -= dt;
    const holdingJump = Input.isDown('Space');

    // ---- ladders (vertical world) ----
    if (this.o === 'vertical' && !this.climbing && dirY !== 0 && !stunned) {
      const ld = this.findLadder();
      if (ld && (dirY < 0 ? this.y > ld.y + 2 : this.y < ld.y + ld.h)) {
        this.climbing = true; this.ladder = ld;
        this.vx = 0; this.vy = 0;
      }
    }

    if (this.climbing) {
      const ld = this.ladder;
      this.x += ((ld.x + 5) - this.x) * Math.min(1, 14 * dt);
      this.y += dirY * P.climbSpeed * dt;
      this.animT += Math.abs(dirY) * dt * 6;
      if (this.y <= ld.y) { // topped out
        this.y = ld.y; this.climbing = false; this.onGround = true; this.vy = 0;
      } else if (this.y >= ld.y + ld.h) { // reached the base
        this.y = ld.y + ld.h; this.climbing = false; this.onGround = true; this.vy = 0;
      }
      if (this.jbuf > 0) { // jump off the ladder
        this.jbuf = 0; this.climbing = false;
        this.vy = -P.jumpVel * 0.75;
        this.vx = dir * (this.o === 'vertical' ? P.walkSpeed : P.runSpeed) * 0.6;
        this.onGround = false;
        this.sqX = 0.85; this.sqY = 1.18;
        this.lr.fxJump(this.x, this.y);
      }
      return; // no gravity while climbing
    }

    // ---- horizontal movement ----
    if (this.o === 'vertical') {
      this.vx = stunned ? this.vx * (1 - Math.min(1, 6 * dt)) : dir * P.walkSpeed;
    } else {
      const target = dir * P.runSpeed;
      const a = (dir !== 0 ? P.runAccel : P.runDecel) * dt;
      if (!stunned) {
        if (this.vx < target) this.vx = Math.min(target, this.vx + a);
        else if (this.vx > target) this.vx = Math.max(target, this.vx - a);
      } else {
        this.vx *= 1 - Math.min(1, 4 * dt);
      }
    }
    if (this.overstacked) {
      this.vx += Math.sin(this.swayPhase * 1.7) * CONFIG.irie.swayAmp * 4 * dt * 10;
    }

    // ---- jump ----
    this.coyote = this.onGround ? P.coyoteTime : this.coyote - dt;
    if (this.jbuf > 0 && this.coyote > 0 && !stunned) {
      this.jbuf = 0; this.coyote = 0;
      this.vy = -P.jumpVel;
      this.onGround = false;
      this.sqX = 0.85; this.sqY = 1.18;
      this.lr.fxJump(this.x, this.y);
    }
    // variable jump height
    if (!holdingJump && this.vy < 0) this.vy *= Math.pow(P.jumpCutMul, dt * 18);

    // ---- gravity ----
    this.vy = Math.min(G.maxFall, this.vy + G.gravity * dt);

    // ---- integrate + collide ----
    const prevY = this.y;
    this.x += this.vx * dt;

    // walls
    const hb = CONFIG.player.hbW / 2;
    for (const w of this.level.walls) {
      if (this.y > w.y && this.y - 22 < w.y + w.h) {
        if (this.x + hb > w.x && this.x - hb < w.x + w.w) {
          if (this.x < w.x + w.w / 2) this.x = w.x - hb;
          else this.x = w.x + w.w + hb;
          this.vx = 0;
        }
      }
    }
    if (this.o === 'horizontal') {
      this.x = Math.max(hb, this.x); // can't run off the start
    } else {
      this.x = Math.max(hb + 16, Math.min(this.level.width - 16 - hb, this.x));
    }

    this.y += this.vy * dt;

    // one-way platforms + grounds
    const wasGround = this.onGround;
    this.onGround = false;
    if (this.vy >= 0) {
      for (const p of this.lr.solidPlatforms()) {
        if (prevY <= p.y + 0.01 && this.y >= p.y &&
            this.x + hb > p.x && this.x - hb < p.x + p.w) {
          this.y = p.y; this.vy = 0; this.onGround = true;
          this.lr.standOn(p);
          break;
        }
      }
    }
    if (this.onGround && !wasGround) {
      this.sqX = 1.22; this.sqY = 0.8;
      this.landT = 0.12;
      Particles.dust(this.x, this.y);
      this.lr.fxLand(this.x, this.y);
    }

    this.animT += dt * (Math.abs(this.vx) > 20 ? 10 : 3);
  }

  currentFrame() {
    if (this.celebrating) return VAKS.celeb[Math.floor(this.animT * 0.6) % 2];
    if (this.stun > 0) return VAKS.hurt;
    if (this.meowFlash > 0) return VAKS.meow;
    if (this.climbing) return VAKS.climb[Math.floor(this.animT) % 2];
    if (!this.onGround) return this.vy < 0 ? VAKS.jump : VAKS.fall;
    if (this.landT > 0) return VAKS.land;
    if (this.babalasT > 0 || this.overstacked) return VAKS.babalas[Math.floor(this.animT * 0.5) % 2];
    if (Math.abs(this.vx) > 20) return VAKS.run[Math.floor(this.animT) % 4];
    return VAKS.idle[Math.floor(this.animT * 0.25) % 2];
  }

  draw(ctx) {
    if (this.dead) return;
    if (this.invuln > 0 && Math.floor(this.invuln * 14) % 2 === 0 && this.stun <= 0 && this.babalasT <= 0) return;
    const f = this.currentFrame();
    const fw = 26, fh = 32;
    const sx = this.sqX, sy = this.sqY;
    ctx.save();
    ctx.translate(Math.round(this.x), Math.round(this.y));
    ctx.scale(sx, sy);
    draw(ctx, 'vaks', f, -fw / 2, -fh, { flip: this.facing < 0 });
    ctx.restore();
  }
}
