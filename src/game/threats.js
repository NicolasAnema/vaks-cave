// ============================================================
// THREATS — one interface, two weathers.
// Mist (vertical): a rising line of Tikolosh presence.
// Granny (horizontal): the chaser with stare/burst/faint cycle.
// Both expose: update, caught(player), gaugeFrac(player),
// draw(ctx, cam, t), frozen (debug T).
// ============================================================

import { CONFIG } from '../config.js';
import { View } from '../engine/render.js';
import { draw, drawImoHead, TIKO_HEAD_RECT, TSOTSI } from '../engine/sprites.js';
import { Particles } from '../engine/particles.js';
import { Barks, AudioManager } from '../systems/audio.js';

const barkDanger = Barks.wire('m_danger_trio', 'threats.js: danger_close escalation');
const barkGogo = Barks.wire('m_gogo', 'threats.js: chaser caught');
const barkShebeen = Barks.wire('m_shebeen_drink', 'threats.js: L4 shebeen crew shouts');
const barkTsotsiChase = Barks.wire('m_tsotsi_chase', 'threats.js: L6 tsotsi crew chase taunts');
const barkTaxi = Barks.wire('m_taxi_shout', 'threats.js: L5 taxi tsotsi driver shouts');
// kept wired (coverage) though the township no longer uses the granny chase
const barkFaint = Barks.wire('m_granny_faints', 'threats.js: legacy granny faint (unused)');
const barkSpy = Barks.wire('m_granny_spy', 'threats.js: legacy granny stare (unused)');

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

// THE TOWNSHIP CHASER — one pursuer per W2 level, each a different person with
// a signature move, but all sharing the proven chase/stare/burst + rubber-band
// mechanic (so the verifier can still prove clean play always escapes):
//   shebeen (L4) — the drink crew; lobs a bottle ahead that shatters into a slick
//   taxi    (L5) — a reckless minibus; the wind-up HONKS, then a brutal horn-dash
//   tsotsi  (L6) — the phone-snatch crew; periodically flanks a fast runner up
const CHASER_ANNOUNCE = {
  shebeen: 'THE CREW WANTS A ROUND. BUY OR RUN, VAKS!',
  taxi:    'TAXI! TAXI! HE WANTS TO SCOOP YOU UP!',
  tsotsi:  'TSOTSIS ON YOUR TAIL — THEY WANT THE PHONE!',
};

export class Chaser {
  constructor(level) {
    this.level = level;
    const C = CONFIG.chaser;
    this.kind = C.kindByLevel[level.id] || 'shebeen';
    this.label = C.label[this.kind] || 'CHASER';
    this.x = level.spawn.x - C.startGap;
    this.y = level.groundY;
    this.base = C.speed[level.id] || 96;
    this.state = 'chase'; // chase | stare | burst | stalled
    this.stateT = 0;
    this.burstTimer = C.burstEvery[level.id];
    this.frozen = false;
    this.t = 0; this.animT = 0;
    this.danger = new DangerEscalation();
    this.announced = false;
    // signature-move timers
    this.lobTimer = (C.shebeen.lobEvery || 4) * (0.6 + Math.random() * 0.4);
    this.flankTimer = (C.tsotsi.flankEvery || 8) * (0.6 + Math.random() * 0.4);
    this.shoutTimer = 2.5 + Math.random() * 2;          // L4 crew dialogue cadence
    this.anchor = { x: this.x, y: this.y - 30, bubbleH: 6 }; // tracks the crew for speech bubbles
  }

  resetTo(cpX) { this.x = cpX - CONFIG.chaser.resetGap; this.state = 'chase'; this.stateT = 0; }

  // scripted beat: Tallman & Shorty stall the chaser over their debts
  stall(secs) { this.state = 'stalled'; this.stateT = secs; }

  // mid-level side-scene breather: on resume, shove the chaser back to the
  // fresh-start gap (never FORWARD) and clear any wind-up/burst so the chase
  // resumes calm. Only ever helps the player, so verify.js is unaffected.
  breather(playerX) {
    this.x = Math.min(this.x, playerX - CONFIG.chaser.startGap);
    this.state = 'chase';
    this.stateT = 0;
    this.burstTimer = CONFIG.chaser.burstEvery[this.level.id];
  }

  speed() {
    const C = CONFIG.chaser;
    if (this.state === 'stalled') return 0;          // only the scripted stall fully stops it
    if (this.state === 'burst') return this.base * (C.burstMul[this.level.id] || 1.6);
    if (this.state === 'stare') return this.base * 0.85; // wind-up, but it keeps flowing
    return this.base;
  }

  update(dt, player, lr) {
    const C = CONFIG.chaser;
    this.t += dt;
    if (!this.announced) {
      this.announced = true;
      Barks.note(CHASER_ANNOUNCE[this.kind] || 'RUN, VAKS!', this.label);
    }
    if (this.frozen) return;

    this.stateT -= dt;
    const gap = player.x - this.x;

    switch (this.state) {
      case 'chase': {
        this.burstTimer -= dt;
        // rubber band like the mist: hurries up proportionally when Vaks gets
        // more than maxLead ahead, capped just under runSpeed so it stays on his
        // heels but a flat-out runner still escapes.
        let sp = this.base;
        if (gap > C.maxLead) sp = Math.min(CONFIG.player.runSpeed - C.catchUpCap, this.base + (gap - C.maxLead) * C.catchUpK);
        this.x += sp * dt;
        this.animT += dt * 9;
        if (this.burstTimer <= 0 && gap < 260) {
          this.state = 'stare';
          this.stateT = C.stareTime;
          this.burstTimer = C.burstEvery[this.level.id];
          // the taxi HONKS its wind-up; the others just lunge
          AudioManager.play('granny_chase_start', this.kind === 'taxi' ? 'horn' : 'lunge');
        }
        break;
      }
      case 'stare':
        this.x += this.speed() * dt;   // keep flowing during the wind-up
        this.animT += dt * 9;
        if (this.stateT <= 0) {
          this.state = 'burst';
          this.stateT = C.burstTime[this.level.id] || 0.8;
          lr.shake(CONFIG.fx.shakeBurst);
        }
        break;
      case 'burst':
        this.x += this.speed() * dt;
        this.animT += dt * 16;
        if (Math.random() < 0.5) Particles.dust(this.x - 6, this.y, 1);
        if (this.stateT <= 0) this.state = 'chase';
        break;
      case 'stalled':
        if (this.stateT <= 0) this.state = 'chase';
        break;
    }

    this.anchor.x = this.x; this.anchor.y = this.y - (this.kind === 'taxi' ? 60 : 30);
    this.signature(dt, player, lr, gap);
    this.danger.update(dt, this.gaugeFrac(player), player);
  }

  // each chaser's unique move, fired only when it's close enough to matter
  signature(dt, player, lr, gap) {
    if (this.state === 'stalled' || gap > 340 || gap < 30) return;
    if (this.kind === 'shebeen') {
      this.lobTimer -= dt;
      if (this.lobTimer <= 0) {
        this.lobTimer = CONFIG.chaser.shebeen.lobEvery;
        lr.spawnLobBottle(this.x, player.x);
      }
      // the crew shouts for Vaks to drink with them (manifest m_shebeen_drink)
      this.shoutTimer -= dt;
      if (this.shoutTimer <= 0) { this.shoutTimer = 4 + Math.random() * 3; barkShebeen({ anchor: this.anchor }); }
    } else if (this.kind === 'tsotsi') {
      this.flankTimer -= dt;
      if (this.flankTimer <= 0) {
        this.flankTimer = CONFIG.chaser.tsotsi.flankEvery;
        lr.spawnFlankTsotsi(this.x);
      }
      // the crew taunts Vaks as they chase him for the phone (manifest m_tsotsi_chase)
      this.shoutTimer -= dt;
      if (this.shoutTimer <= 0) { this.shoutTimer = 4 + Math.random() * 3; barkTsotsiChase({ anchor: this.anchor }); }
    } else if (this.kind === 'taxi') {
      // the tsotsi at the wheel shouts for Vaks's mano (manifest m_taxi_shout);
      // the dash/horn part of its signature lives in the burst tuning + draw swerve
      this.shoutTimer -= dt;
      if (this.shoutTimer <= 0) { this.shoutTimer = 3.5 + Math.random() * 2.5; barkTaxi({ anchor: this.anchor }); }
    }
  }

  onCaught() { barkGogo({ subtitle: true, speaker: 'VAKS', force: true }); }

  caught(player) {
    if (this.frozen || this.state === 'stalled') return false;
    return player.x <= this.x + CONFIG.chaser.catchDist && player.y >= this.level.groundY - 46;
  }

  gaugeFrac(player) {
    return Math.max(0, Math.min(1, (player.x - this.x) / (CONFIG.chaser.startGap * 1.5)));
  }

  draw(ctx, cam) {
    const x = Math.round(this.x), y = Math.round(this.y);
    if (!cam.sees(x, y, this.kind === 'taxi' ? 140 : 70)) return;
    const bursting = this.state === 'burst';
    if (this.kind === 'taxi') this.drawTaxi(ctx, x, y, bursting);
    else if (this.kind === 'tsotsi') this.drawTsotsiCrew(ctx, x, y, bursting);
    else this.drawCrew(ctx, x, y, bursting);
    if (this.state === 'stare') {
      // readable wind-up warning (the taxi's is a honk glyph)
      ctx.fillStyle = this.kind === 'taxi' ? '#ffd84d' : '#ff5a5a';
      ctx.fillRect(x - 1, y - 42, 3, 8);
      ctx.fillRect(x - 1, y - 31, 3, 3);
    }
  }

  // L4 shebeen crew — a rowdy pack of normal township drinkers jogging after
  // Vaks with quarts raised. Drawn from primitives (NOT granny art) so it clearly
  // reads as a group of people. The leader is out front (the catch point).
  drawCrew(ctx, x, y, bursting) {
    const bob = (ph) => Math.round(Math.sin(this.animT * 1.5 + ph) * 1.5);
    this.drawPerson(ctx, x - 23, y, bob(0.4), '#5a3f6a', '#7a5333', false, 0.6); // back of the pack
    this.drawPerson(ctx, x - 13, y, bob(2.3), '#356a86', '#8a5e38', true, 0.85); // middle, quart up
    if (bursting) this.drawPerson(ctx, x - 6, y, bob(4.0), '#7a6a2a', '#6e4a2c', false, 0.85); // a shover on the dash
    this.drawPerson(ctx, x - 1, y, bob(3.4), '#b0432e', '#915a34', true, 1);     // leader (front)
  }

  // one township person from primitives: legs (jog shuffle), shirt, arms, head,
  // optional raised quart
  drawPerson(ctx, px, footY, bob, shirt, skin, bottle, alpha) {
    const y = footY + bob;
    const prev = ctx.globalAlpha; ctx.globalAlpha = prev * alpha;
    const step = Math.floor(this.animT * 3 + px) % 2;     // little jog shuffle
    ctx.fillStyle = '#241c2e';
    ctx.fillRect(px - 3, y - 8, 3, 8 - step); ctx.fillRect(px + 1, y - 8, 3, 7 + step);
    ctx.fillStyle = shirt; ctx.fillRect(px - 4, y - 19, 9, 11);          // torso
    ctx.fillStyle = skin;  ctx.fillRect(px - 6, y - 18, 2, 7);           // back arm reaching out
    ctx.fillStyle = skin;  ctx.fillRect(px - 3, y - 27, 7, 8);           // head
    ctx.fillStyle = '#15100b'; ctx.fillRect(px - 3, y - 28, 7, 2);       // hair
    if (bottle) {
      ctx.fillStyle = skin;  ctx.fillRect(px + 4, y - 25, 2, 7);         // raised arm
      ctx.fillStyle = '#2f6a3f'; ctx.fillRect(px + 4, y - 32, 4, 8);     // green quart
      ctx.fillStyle = '#d9c27a'; ctx.fillRect(px + 5, y - 33, 2, 1);     // cap
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(px + 5, y - 31, 1, 5); // glint
    }
    ctx.globalAlpha = prev;
  }

  // L5 minibus taxi — a HUGE rust-bucket driven by a tsotsi; swerves down the
  // road with motion-blur on the horn-dash. The 56x26 cell is scaled up and
  // anchored so the nose (the catch front, x+30) stays where it always was, the
  // body grows back/up, and a knife tsotsi sits at the wheel behind the windscreen.
  drawTaxi(ctx, x, y, bursting) {
    const T = CONFIG.chaser.taxi;
    const s = T.scale || 1;
    const ds = T.driverScale || 1.25;
    const sw = Math.round(Math.sin(this.t * 5) * T.swerveAmp);
    const w = 56 * s;
    const left = Math.round((x + 30) - w);   // nose pinned to the old front edge
    const top = Math.round((y - 26 * s) + sw);
    if (bursting) {
      draw(ctx, 'taxi', 0, left - 8 * s, top, { alpha: 0.3, scale: s });
      draw(ctx, 'taxi', 0, left - 4 * s, top, { alpha: 0.5, scale: s });
    }
    draw(ctx, 'taxi', 0, left, top, { scale: s });
    // the tsotsi at the wheel: head pokes above the roof, body fills the
    // windscreen. He's SEATED, so use the static idle frame — the walk frames
    // shuffled his legs and made him look like he was walking the taxi.
    const dx = Math.round(left + 47 * s - 10 * ds);
    const dy = Math.round(top - 5);
    draw(ctx, 'tsotsi_knife', TSOTSI.idle, dx, dy, { scale: ds });
  }

  // L6 tsotsi crew — the snatcher leader, bigger; blur on the lunge
  drawTsotsiCrew(ctx, x, y, bursting) {
    const f = TSOTSI.walk[Math.floor(this.animT) % 2];
    if (bursting) {
      draw(ctx, 'tsotsi_knife', f, x - 18, y - 30, { alpha: 0.35, scale: 1.3 });
      draw(ctx, 'tsotsi_knife', f, x - 14, y - 30, { alpha: 0.5, scale: 1.3 });
    }
    draw(ctx, 'tsotsi_knife', TSOTSI.walk[Math.floor(this.t * 6) % 2], x - 26, y - 24, { alpha: 0.5 }); // a mate behind
    draw(ctx, 'tsotsi_knife', f, x - 11, y - 30, { scale: 1.3 });
  }
}
