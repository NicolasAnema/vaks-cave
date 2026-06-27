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
const barkMeowCombo = Barks.wire('m_meow_combo', 'player.js: meow-combo easter egg');

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
    this.smokeT = 0; this.smokeTotal = 0; this.smokeEmit = 0; // G skin-up ritual
    this.stun = 0; this.invuln = 0;
    this.babalasT = 0;
    this.meowCd = 0; this.meowFlash = 0;
    this.idleT = 0;
    this.animT = 0; this.landT = 0;
    this.sqX = 1; this.sqY = 1;
    this.bubbleH = 36;
    this.dead = false;
    this.celebrating = false;
    this.grabbedBy = null;   // tsotsi holding Vaks (W2)
    this.grabGrip = 0;       // mash presses left to break free
    this.grabHoldT = 0;
  }

  get irie() { return this.irieT > 0; }
  get overstacked() { return this.overT > 0; }
  get babalas() { return this.babalasT > 0; }
  // mid skin-up ritual (G): frozen and untouchable until the joint's lit
  get smoking() { return this.smokeT > 0; }
  // irie no longer slows the whole world — only the rats and tikolosh crawl
  // (enemySlow). The mist, granny, bottles and Vaks himself stay at full speed.
  enemySlow() { return this.irie ? CONFIG.irie.enemySlow : 1; }
  hats() { return this.lr.run?.hats || {}; }
  // irie powers the legs (ladders optional); babalas saps them;
  // the propeller hat lifts every jump, the chiefs hat is tikolosh speed
  jumpScale() {
    const base = this.irie ? CONFIG.irie.jumpMul : (this.babalas ? CONFIG.babalas.jumpMul : 1);
    return base * (this.hats().propeller ? CONFIG.hats.propeller.jumpMul : 1);
  }
  speedScale() {
    const base = this.babalas ? CONFIG.babalas.speedMul : 1;
    return base * (this.hats().chiefs ? CONFIG.hats.chiefs.speedMul : 1);
  }

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

  // G: begin the skin-up ritual — plant his feet and run the timeline. He's
  // frozen and invincible the whole way; the level lights the rush (onSmokeDone)
  // the instant the timer runs out.
  startSmoke() {
    const S = CONFIG.irie.smoke;
    this.smokeTotal = S.pull + S.roll + S.light + S.smoke;
    this.smokeT = this.smokeTotal;
    this.smokeEmit = 0;
    this.smokeLit = false; // fires the inhale the moment the joint reaches his lips
    this.vx = 0; this.vy = Math.max(0, this.vy); // plant him, never launch
    this.climbing = false; this.ladder = null;
    // untouchable through the ritual even before the irie kicks in
    this.invuln = Math.max(this.invuln, this.smokeTotal + 0.2);
  }

  // which beat of the ritual we're on, and how far the joint has burned (0..1)
  smokeState() {
    const S = CONFIG.irie.smoke;
    const e = this.smokeTotal - this.smokeT; // elapsed
    if (e < S.pull) return { phase: 'pull', burn: 0 };
    if (e < S.pull + S.roll) return { phase: 'roll', burn: 0 };
    if (e < S.pull + S.roll + S.light) return { phase: 'light', burn: 0 };
    const start = S.pull + S.roll + S.light;
    return { phase: 'smoke', burn: Math.min(1, (e - start) / S.smoke) };
  }

  hurt(fromX, power = 1, noLift = false) {
    // irie = invincible; while grabbed the hold IS the punishment.
    // power scales the bounce (rats hit harder than a stray bottle).
    // noLift = pure sideways knock, no upward pop (rats just shove him aside).
    if (this.invuln > 0 || this.dead || this.irie || this.smoking || this.grabbedBy) return false;
    const P = CONFIG.player;
    const dir = this.x >= fromX ? 1 : -1;
    this.vx = dir * P.knockbackX * power;
    this.vy = noLift ? 0 : -P.knockbackY * 0.7 * power;
    this.stun = P.stunTime * Math.min(power, 1.3);
    this.invuln = P.invulnTime;
    this.onGround = false; this.climbing = false;
    this.lr.hitStop();
    // bigger hits (the rat derail) kick the camera harder — extra wow
    this.lr.shake(CONFIG.fx.shakeImpact * Math.min(power, 2.2));
    return true;
  }

  respawn(x, y) {
    this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.dead = false; this.climbing = false; this.onGround = true;
    this.stun = 0; this.invuln = 1.6; this.irieT = 0; this.overT = 0;
    this.smokeT = 0;
    this.babalasT = 1.4;
    this.grabbedBy = null;
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

    // ---- grabbed by a tsotsi: pinned to him, mash to wrestle free ----
    if (this.grabbedBy) {
      const ts = this.grabbedBy;
      const GR = CONFIG.tsotsi.grab;
      this.grabHoldT += dt;
      this.meowFlash -= dt; this.landT -= dt;
      // every press chips his grip
      for (const k of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space']) {
        if (Input.wasPressed(k)) {
          this.grabGrip--;
          this.sqX = 1.15; this.sqY = 0.88; // struggle jolt
        }
      }
      this.sqX += (1 - this.sqX) * Math.min(1, 12 * dt);
      this.sqY += (1 - this.sqY) * Math.min(1, 12 * dt);
      // pinned in front of the grabber, facing him
      this.x = ts.x + ts.dir * 10;
      this.y = ts.y;
      this.vx = 0; this.vy = 0;
      this.facing = -ts.dir;
      this.onGround = true; this.climbing = false;
      if (this.grabGrip <= 0 || this.grabHoldT >= GR.holdMax) {
        this.lr.tsotsiRelease(ts, this.grabGrip <= 0);
      }
      return;
    }

    this.meowCd -= dt; this.invuln -= dt; this.landT -= dt;
    this.irieT = Math.max(0, this.irieT - dt);
    this.overT = Math.max(0, this.overT - dt);
    this.babalasT = Math.max(0, this.babalasT - dt);
    this.swayPhase += dt * CONFIG.irie.swayHz * Math.PI * 2;
    this.meowFlash -= dt;

    // ---- skin-up ritual (G): pinned in place, untouchable, running the
    // timeline. A full early-return (like the tsotsi grip) so NO physics touches
    // him — a jump buffered just before he pressed G can't fire, and gravity
    // can't drop him off a crumbling ledge. He just stops and rolls; the level
    // lights the rush (onSmokeDone) the instant it's done.
    if (this.smoking) {
      this.smokeT = Math.max(0, this.smokeT - dt);
      this.vx = 0; this.vy = 0;
      this.animT += dt * 3;
      this.sqX += (1 - this.sqX) * Math.min(1, 12 * dt); // squash relaxes to neutral
      this.sqY += (1 - this.sqY) * Math.min(1, 12 * dt);
      const ss = this.smokeState();
      if (ss.phase === 'light' || ss.phase === 'smoke') { // joint's at his lips now
        if (!this.smokeLit) { this.smokeLit = true; this.lr.onJointLit?.(); } // -> inhale SFX
        this.smokeEmit -= dt;                                                 // + smoke wisps
        if (this.smokeEmit <= 0) {
          this.smokeEmit = 0.1;
          Particles.smoke(this.x + this.facing * 7, this.y - 23);
        }
      }
      if (this.smokeT === 0) this.lr.onSmokeDone?.(); // burned to the Rodger — rush lands
      return;
    }

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
    if (!this.celebrating && Input.wasPressed('KeyM')) {
      // easter egg: mashing M (faster than the cooldown) builds a combo
      this.meowMashT = 2.2;
      this.meowMash = (this.meowMash || 0) + 1;
      if (this.meowMash >= 6) {
        this.meowMash = 0;
        this.meowFlash = 0.6;
        barkMeowCombo({ anchor: this, interrupt: true, force: true });
        this.lr.meow(this.x, this.y);
      } else if (this.meowCd <= 0) {
        this.meowCd = P.meowCooldown;
        this.meowFlash = 0.5;
        barkMeow({ anchor: this, interrupt: true });   // the meow cuts any line mid-play
        this.lr.meow(this.x, this.y);
      }
    }
    if (this.meowMashT > 0) { this.meowMashT -= dt; if (this.meowMashT <= 0) this.meowMash = 0; }

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
        this.vy = -P.jumpVel * 0.75 * this.jumpScale();
        this.vx = dir * (this.o === 'vertical' ? P.walkSpeed : P.runSpeed) * 0.6;
        this.onGround = false;
        this.sqX = 0.85; this.sqY = 1.18;
        this.lr.fxJump(this.x, this.y);
      }
      return; // no gravity while climbing
    }

    // ---- horizontal movement ----
    if (this.o === 'vertical') {
      this.vx = stunned ? this.vx * (1 - Math.min(1, 6 * dt)) : dir * P.walkSpeed * this.speedScale();
    } else {
      const target = dir * P.runSpeed * this.speedScale();
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
      this.vy = -P.jumpVel * this.jumpScale();
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
    if (this.smoking) {
      const ph = this.smokeState().phase;
      if (ph === 'pull') return VAKS.smokePull;
      if (ph === 'roll') return VAKS.smokeRoll[Math.floor(this.animT * 1.2) % 2];
      return VAKS.smokePuff; // light + smoke: joint clamped in the lips
    }
    if (this.celebrating) return VAKS.celeb[Math.floor(this.animT * 0.6) % 2];
    if (this.grabbedBy) return VAKS.hurt; // wriggling in the grip
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
    // i-frame blink — but not while the irie/skin-up shield is up (that invuln is
    // a power state, not a hit, so he stays solid instead of flickering)
    if (this.invuln > 0 && !this.smoking && !this.irie && Math.floor(this.invuln * 14) % 2 === 0 && this.stun <= 0 && this.babalasT <= 0) return;
    const f = this.currentFrame();
    const fw = 26, fh = 32;
    const sx = this.sqX, sy = this.sqY;
    ctx.save();
    ctx.translate(Math.round(this.x), Math.round(this.y));
    ctx.scale(sx, sy);
    draw(ctx, 'vaks', f, -fw / 2, -fh, { flip: this.facing < 0 });
    this.drawHats(ctx);
    if (this.smoking) this.drawJoint(ctx, this.smokeState());
    ctx.restore();
  }

  // The blunt, drawn live (in the unflipped, player-local space drawHats uses,
  // mirrored by facing) so it can burn from a full joint down to the stinging
  // Rodger — the filter that stays clamped in his lips at the end.
  drawJoint(ctx, ss) {
    const d = this.facing; // +1 faces right, -1 faces left
    if (ss.phase === 'pull') {
      // fishing the bud + papers out of the pocket, held low in the front hand
      ctx.fillStyle = '#6ac24a'; ctx.fillRect(d > 0 ? 4 : -6, -15, 2, 2);  // bud
      ctx.fillStyle = '#efe7cf'; ctx.fillRect(d > 0 ? 6 : -8, -15, 2, 2);  // papers
      return;
    }
    if (ss.phase === 'roll') {
      // the joint takes shape between his hands at chest height
      const x = d > 0 ? 2 : -7;
      ctx.fillStyle = '#efe7cf'; ctx.fillRect(x, -15, 5, 1);
      ctx.fillStyle = '#d9cfb0'; ctx.fillRect(x, -14, 5, 1);
      ctx.fillStyle = '#7a4a24'; ctx.fillRect(d > 0 ? x : x + 4, -15, 1, 2); // Rodger end
      return;
    }
    // light + smoke: lit, clamped in the lips, burning down to the Rodger
    const my = -21;                                  // lip height
    const base = d > 0 ? 2 : -2;                      // at the corner of the mouth
    const filterLen = 2;                             // the stinging Rodger — always remains
    const paperLen = Math.round((1 - ss.burn) * 6);  // burns away to nothing
    // filter (the roach) at the lips
    ctx.fillStyle = '#7a4a24'; ctx.fillRect(d > 0 ? base : base - filterLen, my, filterLen, 2);
    ctx.fillStyle = '#5e3619'; ctx.fillRect(d > 0 ? base : base - filterLen, my + 1, filterLen, 1);
    // paper burning down
    if (paperLen > 0) {
      const px = d > 0 ? base + filterLen : base - filterLen - paperLen;
      ctx.fillStyle = '#efe7cf'; ctx.fillRect(px, my, paperLen, 2);
      ctx.fillStyle = '#d9cfb0'; ctx.fillRect(px, my + 1, paperLen, 1);
    }
    // glowing ember at the burning tip
    const ex = d > 0 ? base + filterLen + paperLen : base - filterLen - paperLen - 1;
    const flick = Math.floor((this.smokeTotal - this.smokeT) * 12) % 2;
    ctx.fillStyle = flick ? '#ff7a2a' : '#ffd24a'; ctx.fillRect(ex, my, 1, 2);
  }

  // ability caps from the shop, worn over the base cap
  drawHats(ctx) {
    const H = this.hats();
    if (H.beanie) {
      ctx.fillStyle = '#8a3c3c'; ctx.fillRect(-5, -29, 10, 4);
      ctx.fillStyle = '#6d2e2e'; ctx.fillRect(-5, -26, 10, 1);
      if (!H.propeller) { ctx.fillStyle = '#ffd84d'; ctx.fillRect(-1, -31, 2, 2); } // pom
    }
    if (H.chiefs) {
      ctx.fillStyle = '#1c1c22'; ctx.fillRect(-5, -29, 10, 2);   // black crown
      ctx.fillStyle = '#ffb84d'; ctx.fillRect(-5, -27, 10, 2);   // amakhosi gold
    }
    if (H.propeller) {
      const ph = Math.floor(this.animT * 6) % 2;
      ctx.fillStyle = '#54545f'; ctx.fillRect(-1, -31, 2, 2);    // stalk
      ctx.fillStyle = ph ? '#d64545' : '#ffd84d'; ctx.fillRect(-6, -33, 6, 2);
      ctx.fillStyle = ph ? '#ffd84d' : '#d64545'; ctx.fillRect(0, -33, 6, 2);
    }
  }
}
