// ============================================================
// LEVEL RUNTIME — one screen serves both orientations: movement,
// camera, threats, hazards, pickups, checkpoints, HUD, intro
// card, deaths/respawns, clear sequence, easter-egg triggers.
// ============================================================

import { CONFIG } from '../config.js';
import { View, dimScreen } from '../engine/render.js';
import { Input } from '../engine/input.js';
import { Camera } from '../engine/camera.js';
import { draw, spr } from '../engine/sprites.js';
import { drawText, LINE_H } from '../engine/font.js';
import { Particles } from '../engine/particles.js';
import { makeCaveLayers, makeTownLayers, drawLayers } from '../engine/bg.js';
import { AudioManager, Barks } from '../systems/audio.js';
import { Player } from './player.js';
import { Mist, Granny } from './threats.js';
import { Bottle, Rat, Tiko, Tsotsi, TsotsiBullet, Pickup, Checkpoint, NPC } from './entities.js';

const barkStartSafari = Barks.wire('m_irie_safari', 'level.js: W1 level start variant');
const barkStartBaas = Barks.wire('m_baas_plaas', 'level.js: W2 level start variant');
const barkStartPool = Barks.wire('m_start_pool', 'level.js: level start variant pool');
const barkListenUp = Barks.wire('m_listen_up', 'level.js: tutorial prompts');
const barkClear = Barks.wire('m_finished_room', 'level.js: level clear');
const barkChao = Barks.wire('m_chao', 'level.js: death stinger');
const barkRespawn = Barks.wire('m_coming_boss', 'level.js: respawn');
const barkFish = Barks.wire('m_fish', 'level.js: hazard warning near gaps');
const barkImGood = Barks.wire('m_im_good', 'level.js: idle check-in');
const barkIdlePool = Barks.wire('m_idle_pool', 'level.js: idle check-in pool');
const barkPiper = Barks.wire('m_peter_piper', 'level.js: rare random bark');
const barkZombie = Barks.wire('m_zombie', 'level.js: rare random bark');
const barkGlitch = Barks.wire('m_video_cutting', 'level.js: fake screen-glitch gag');
const barkPhone = Barks.wire('m_america_phone', 'level.js: ringing payphone (L5)');
const barkChiefs = Barks.wire('m_chiefs', 'level.js: TV showing the match');
const barkSchool = Barks.wire('m_school', 'level.js: school in the background');
const barkCatEyes = Barks.wire('m_cat_eyes', 'level.js: cat eyes activate (L3)');
const barkSushiHit = Barks.wire('m_sushi', 'level.js: first sushi hit');
const barkIrie = Barks.wire('m_irie_feel', 'level.js: irie pickup');
const barkIriePool = Barks.wire('m_irie_pool', 'level.js: irie pickup variants');
const barkTooStrong = Barks.wire('m_too_strong', 'level.js: overstack');
const barkMano = Barks.wire('m_ceppies', 'level.js: first mano of the level');
const barkCheckpoint = Barks.wire('m_wheres_boss', 'level.js: checkpoint reached');
const barkRattexKill = Barks.wire('m_rattex_kill', 'level.js: rattex active, rat dies on touch');
const barkTsotsiSpot = Barks.wire('m_tsotsi_spot', 'level.js: tsotsi first sighted');
const barkTsotsiPhone = Barks.wire('m_tsotsi_phone', 'level.js: phone snatcher contact');
const barkTsotsiViceroy = Barks.wire('m_tsotsi_viceroy', 'level.js: viceroy pusher forced sip');
const barkTsotsiStomp = Barks.wire('m_tsotsi_stomp', 'level.js: tsotsi stomped');

export class LevelScreen {
  constructor(level, run, cb) {
    this.level = level;
    this.run = run;       // { lives, score, mano, hats, irieStash, faintCharm }
    this.cb = cb;         // { onClear(stats), onGameOver(), onPause() }
    this.o = level.orientation;
    this.debug = { invincible: false };

    this.cam = new Camera(this.o, level.width, level.height);
    this.player = new Player(level, this);
    this.cam.snapTo(this.player.x, this.player.y);

    this.layers = this.o === 'vertical' ? makeCaveLayers(level.id) : makeTownLayers(level.id);
    this.threat = this.o === 'vertical' ? new Mist(level) : new Granny(level);
    if (this.o === 'horizontal' && run.faintCharm) {
      this.threat.charm = CONFIG.granny.charmBonus;
      run.faintCharm = false;
    }

    this.pickups = level.pickups.map((d) => new Pickup(d));
    this.rats = level.rats.map((d) => new Rat(d));
    this.tikos = level.tikos.map((d) => new Tiko(d));
    this.checkpoints = level.checkpoints.map((d) => new Checkpoint(d));
    this.npcs = level.npcs.map((d) => new NPC(d));
    this.tsotsis = (level.tsotsis || []).map((d) => new Tsotsi(d));
    this.tsotsiBullets = [];
    this.tsotsiSeen = false;
    this.bottles = [];
    this.sushi = level.sushi.map((s) => ({ ...s, hit: false }));
    this.props = level.props.map((p) => ({ ...p, fired: false, t: Math.random() * 5 }));
    this.tutorials = level.tutorials.map((t) => ({ ...t, fired: false }));

    // ground segments -> collision rects
    this.groundRects = level.grounds.map((g) => ({ x: g.x, y: level.groundY, w: g.w, ground: true }));
    this.crumbleState = new Map(); // platform -> { timer, gone, respawn }

    this.respawnPoint = { x: level.spawn.x, y: level.spawn.y };
    this.ganjaUsed = false; // G: burn a life for an irie rush, once per level
    this.time = 0;
    this.manoCollected = 0;
    this.deaths = 0;
    this.firstMano = false;

    this.introT = CONFIG.timers.introCard;
    this.deathT = 0;
    this.clearT = 0;
    this.cleared = false;
    this.hitStopT = 0;
    this.glitchT = 0;
    this.idleBarkAlt = false;
    this.fishWarned = false;
    this.stallDone = false;
    this.catEyesAnnounced = false;
    this.bottleTimer = 1.5;
    this.rareTimer = CONFIG.timers.rareBarkMin + Math.random() * (CONFIG.timers.rareBarkMax - CONFIG.timers.rareBarkMin);
    this.glitchTimer = CONFIG.timers.glitchMin + Math.random() * (CONFIG.timers.glitchMax - CONFIG.timers.glitchMin);

    AudioManager.playMusic(level.music);
    this.started = false;

    // irie stash from the shop: start the level holding one
    if (run.irieStash) { run.irieStash = false; this.player.irieT = CONFIG.irie.duration; }
    // rattex from the shop: this level, rats die if they touch Vaks
    this.rattex = false;
    if (run.rattex) { run.rattex = false; this.rattex = true; }
  }

  // entry barks fire on the first update so screen transitions can't clear them
  start() {
    AudioManager.play('level_start', 'L' + this.level.id);
    const useSignature = Math.random() < 0.5;
    if (this.o === 'vertical') (useSignature ? barkStartSafari : barkStartPool)({ subtitle: true, speaker: 'VAKS', force: true });
    else (useSignature ? barkStartBaas : barkStartPool)({ subtitle: true, speaker: 'VAKS', force: true });
  }

  // ---- hooks used by player/entities ----
  shake(m) { this.cam.addShake(m); }
  hitStop() { this.hitStopT = CONFIG.fx.hitStop; }
  fxJump() {}
  fxLand() { this.cam.addShake(0.4); }
  meow(x, y) {
    for (const r of this.rats) {
      const dx = r.x - x, dy = (r.y - 4) - y;
      if (dx * dx + dy * dy < CONFIG.player.meowRadius * CONFIG.player.meowRadius) r.flee(x);
    }
  }
  killY() {
    return this.o === 'vertical' ? this.threat.topY + 40 : this.level.groundY + 70;
  }

  // ---- tsotsi hooks (called by the entities) ----
  tsotsiSpotted(ts) {
    if (this.tsotsiSeen) return;
    this.tsotsiSeen = true;
    AudioManager.play('tsotsi_alert', ts.kind);
    barkTsotsiSpot({ anchor: this.player, force: true });
  }

  tsotsiShoot(ts) {
    AudioManager.play('tsotsi_shoot', 'L' + this.level.id);
    this.tsotsiBullets.push(new TsotsiBullet(ts.x + ts.dir * 11, ts.y - CONFIG.tsotsi.gun.bulletY, ts.dir));
    this.shake(0.8);
  }

  solidPlatforms() {
    const out = [];
    for (const p of this.level.platforms) {
      const st = this.crumbleState.get(p);
      if (st && st.gone) continue;
      out.push(p);
    }
    for (const g of this.groundRects) out.push(g);
    return out;
  }

  standOn(p) {
    if (p.type === 'crumble') {
      let st = this.crumbleState.get(p);
      if (!st) {
        const delay = CONFIG.crumble.delayByLevel?.[this.level.id] ?? CONFIG.crumble.delay;
        st = { timer: delay, gone: false, respawn: 0 }; this.crumbleState.set(p, st);
      }
    }
  }

  // ---- death / respawn / clear ----

  die() {
    if (this.player.dead || this.cleared || this.debug.invincible || this.player.irie) return;
    this.player.dead = true;
    this.deaths++;
    this.run.lives--;
    this.deathT = 1.5;
    AudioManager.play('death', 'L' + this.level.id);
    barkChao({ subtitle: true, speaker: 'VAKS', force: true });
    this.shake(CONFIG.fx.shakeImpact);
    Particles.shards(this.player.x, this.player.y - 10, ['#7ec8ff', '#9a6a42', '#2e3f96']);
  }

  doRespawn() {
    this.player.respawn(this.respawnPoint.x, this.respawnPoint.y);
    if (this.o === 'vertical') this.threat.resetTo(this.respawnPoint.y);
    else this.threat.resetTo(this.respawnPoint.x);
    this.cam.snapTo(this.player.x, this.player.y);
    AudioManager.play('respawn', 'L' + this.level.id);
    barkRespawn({ anchor: this.player, force: true });
  }

  startClear() {
    if (this.cleared) return;
    this.cleared = true;
    this.clearT = 2.0;
    this.player.celebrating = true;
    AudioManager.play('level_clear', 'L' + this.level.id);
    barkClear({ anchor: this.player, force: true });
    Particles.confetti(this.player.x, this.player.y - 20);
  }

  // ---- update ----

  update(dt) {
    if (!this.started) { this.started = true; this.start(); }
    if (Input.wasPressed('Escape') && this.introT <= 0 && !this.cleared && this.deathT <= 0) {
      this.cb.onPause();
      return;
    }
    if (Input.wasPressed('KeyI')) this.debug.invincible = !this.debug.invincible;
    if (Input.wasPressed('KeyT')) this.threat.frozen = !this.threat.frozen;

    if (this.introT > 0) { this.introT -= dt; Barks.update(dt); return; }
    if (this.hitStopT > 0) { this.hitStopT -= dt; return; }

    if (this.cleared) {
      this.clearT -= dt;
      this.player.update(dt);
      Particles.update(dt);
      Barks.update(dt);
      this.cam.follow(this.player.x, this.player.y, dt);
      if (this.clearT <= 0) {
        const timeBonus = Math.max(0, Math.round((CONFIG.score.parTime[this.level.id] - this.time) * CONFIG.score.timeBonusPerSec));
        this.run.score += CONFIG.score.levelClear + timeBonus;
        this.cb.onClear({ time: this.time, mano: this.manoCollected, deaths: this.deaths, timeBonus });
      }
      return;
    }

    if (this.deathT > 0) {
      this.deathT -= dt;
      Particles.update(dt);
      Barks.update(dt);
      if (this.deathT <= 0) {
        if (this.run.lives < 0) this.cb.onGameOver();
        else this.doRespawn();
      }
      return;
    }

    this.time += dt;

    // G: burn a life for an emergency ganja rush — once per level, and
    // only when not already irie (spending a life to overstack is a trap).
    if (Input.wasPressed('KeyG')) {
      if (!this.ganjaUsed && !this.player.irie && this.run.lives > 0) {
        this.ganjaUsed = true;
        this.run.lives--;
        this.player.startIrie();
        AudioManager.play('powerup_irie', 'ganja_burn');
        (Math.random() < 0.5 ? barkIrie : barkIriePool)({ anchor: this.player, force: true });
        Particles.sparkle(this.player.x, this.player.y - 10, '#6ac24a', 10);
        this.shake(1.5);
      } else if (!this.player.irie) {
        Barks.note(this.ganjaUsed ? 'ONE IRIE BURN PER LEVEL, BOSS' : 'NO LIVES TO BURN');
      }
    }

    const slow = this.player.worldScale();

    this.player.update(dt);
    this.threat.update(dt, this.player, this);

    // crumbling platforms
    for (const [p, st] of this.crumbleState) {
      if (!st.gone) {
        st.timer -= dt;
        if (st.timer <= 0) {
          st.gone = true; st.respawn = CONFIG.crumble.respawn;
          Particles.shards(p.x + p.w / 2, p.y + 5, ['#9a8468', '#6b5a44'], 7);
        }
      } else {
        st.respawn -= dt;
        if (st.respawn <= 0) this.crumbleState.delete(p);
      }
    }

    // bottles (W1)
    if (this.level.bottles && this.o === 'vertical') {
      this.bottleTimer -= dt * slow;
      if (this.bottleTimer <= 0 && this.bottles.length < CONFIG.bottles.maxActive) {
        this.bottleTimer = CONFIG.bottles.interval[this.level.id] || 4;
        const top = this.cam.y - 20;
        const cands = this.level.platforms.filter((p) => p.y > top - 90 && p.y < top + 10);
        if (cands.length) {
          const p = cands[Math.floor(Math.random() * cands.length)];
          this.bottles.push(new Bottle(p.x + p.w / 2, p.y - 6, Math.random() < 0.5 ? -1 : 1));
          AudioManager.play('bottle_spawn', 'L' + this.level.id);
        }
      }
    }
    for (let i = this.bottles.length - 1; i >= 0; i--) {
      const b = this.bottles[i];
      b.update(dt, this, slow);
      if (b.dead) { this.bottles.splice(i, 1); continue; }
      if (this.hitEntity(b.x - 5, b.y - 12, 10, 12) && this.player.invuln <= 0) {
        b.shatter();
        if (this.player.hurt(b.x)) {
          // beer = babalas: slower and weaker until it wears off
          this.player.babalasT = CONFIG.babalas.time;
          Barks.note('BABALAS! LEGS LIKE PAP.');
        }
      }
    }

    // rats
    for (const r of this.rats) {
      if (r.dead) continue;
      r.update(dt, this, slow);
      if (r.squishT > 0) continue;
      const hb = r.hitbox();
      if (this.hitEntity(hb.x, hb.y, hb.w, hb.h)) {
        if (this.rattex) {
          // deadly pellets in pocket: any touch kills the rat, not Vaks
          r.stomp(this, true);
          this.run.score += CONFIG.score.ratStomp;
          barkRattexKill({ anchor: this.player });
          Particles.shards(r.x, r.y - 4, ['#d61f1f', '#f2c91e'], 5);
        } else if (this.run.hats?.beanie && r.scale < CONFIG.hats.beanie.smashUnder) {
          // beanie strength: small rats get run straight through
          r.stomp(this);
          this.run.score += CONFIG.score.ratStomp;
        } else if (this.player.vy > 50 && this.player.y - 8 < hb.y + 3) {
          r.stomp(this);
          this.run.score += CONFIG.score.ratStomp;
          this.player.vy = -210;
          this.player.sqX = 0.85; this.player.sqY = 1.15;
        } else if (this.player.invuln <= 0) {
          this.player.hurt(r.x);
        }
      }
    }
    this.rats = this.rats.filter((r) => !r.dead);

    // township tsotsis (W2): want the phone, push the viceroy
    for (const ts of this.tsotsis) {
      ts.update(dt, this, slow);
      if (ts.stunT > 0 || ts.cd > 0) continue;
      const hb = ts.hitbox();
      if (this.hitEntity(hb.x, hb.y, hb.w, hb.h)) {
        if (this.player.vy > 50 && this.player.y - 8 < hb.y + 6) {
          // stomped: he sits down hard and rethinks his career
          ts.stomp();
          this.run.score += CONFIG.tsotsi.scoreStomp;
          AudioManager.play('tsotsi_stomp', ts.kind);
          barkTsotsiStomp({ anchor: this.player, force: true });
          this.player.vy = -210;
          this.player.sqX = 0.85; this.player.sqY = 1.15;
        } else if (this.player.invuln <= 0 && !this.player.irie) {
          ts.cd = 1.2;
          if (ts.kind === 'viceroy') {
            // forced sip of viceroy: instant babalas
            if (this.player.hurt(ts.x)) {
              this.player.babalasT = CONFIG.babalas.time;
              AudioManager.play('tsotsi_drink', 'forced sip');
              barkTsotsiViceroy({ anchor: this.player, force: true });
            }
          } else if (this.player.hurt(ts.x)) {
            if (ts.kind === 'knife') {
              const grab = Math.min(this.run.mano, CONFIG.tsotsi.knife.steal);
              if (grab > 0) { this.run.mano -= grab; Barks.note('THE TSOTSI GRABBED ' + grab + ' MANO!'); }
              barkTsotsiPhone({ anchor: this.player, force: true });
            }
          }
        }
      }
    }
    // the gunman's bullets: slow, straight, jumpable
    for (let i = this.tsotsiBullets.length - 1; i >= 0; i--) {
      const b = this.tsotsiBullets[i];
      b.update(dt, this, slow);
      if (b.dead) { this.tsotsiBullets.splice(i, 1); continue; }
      if (this.hitEntity(b.x - 3, b.y - 2, 6, 4)) {
        this.tsotsiBullets.splice(i, 1);
        if (this.player.invuln <= 0) this.player.hurt(b.x);
      }
    }

    // tikolosh variants: contact = caught
    for (const t of this.tikos) {
      t.update(dt, this, slow);
      const hb = t.hitbox();
      if (this.hitEntity(hb.x, hb.y, hb.w, hb.h)) this.die();
    }

    // sushi (W2): china's food
    for (const s of this.sushi) {
      if (Math.abs(this.player.x - s.x) < 10 && Math.abs(this.player.y - s.y) < 14 && this.player.invuln <= 0 && !this.player.irie) {
        if (!s.hit) { s.hit = true; barkSushiHit({ anchor: this.player, force: true }); }
        this.player.hurt(s.x);
        this.player.stun = CONFIG.sushi.stunTime;
      }
    }

    // pickups
    for (const pk of this.pickups) {
      if (pk.taken) continue;
      pk.update(dt, this);
      const dx = this.player.x - pk.x, dy = (this.player.y - 10) - pk.bobY();
      if (dx * dx + dy * dy < 15 * 15) this.collect(pk);
    }

    // checkpoints
    for (const cp of this.checkpoints) {
      cp.update(dt);
      // a checkpoint counts as soon as Vaks PASSES it — touching the
      // lantern or simply climbing above it / running beyond it
      const near = Math.abs(this.player.x - cp.x) < 16 && Math.abs(this.player.y - cp.y) < 26;
      const passed = this.o === 'vertical'
        ? this.player.y < cp.y - 28
        : this.player.x > cp.x + 24;
      if (!cp.active && (near || passed)) {
        cp.active = true;
        this.respawnPoint = { x: cp.x, y: cp.y };
        AudioManager.play('checkpoint', 'L' + this.level.id);
        barkCheckpoint({ anchor: this.player, force: true });
        Particles.sparkle(cp.x, cp.y - 8, '#ffcf6a');
        // the scripted Tallman & Shorty beat: they stall granny
        if (this.level.scriptedStallAt && !this.stallDone &&
            Math.abs(cp.x - this.level.scriptedStallAt.x) < 8) {
          this.stallDone = true;
          this.threat.stall(5.0);
          Barks.note('TALLMAN AND SHORTY STALL GRANNY OVER THEIR DEBTS. RUN!');
        }
      }
    }

    // NPCs
    for (const n of this.npcs) {
      n.update(dt, this);
      if (n.met && n.kind === 'tallman' && !n.evFired) { n.evFired = true; AudioManager.play('npc_tallman'); }
      if (n.met && n.kind === 'shorty' && !n.evFired) { n.evFired = true; AudioManager.play('npc_shorty'); }
    }

    // prop easter eggs
    for (const pr of this.props) {
      pr.t += dt;
      if (pr.fired) continue;
      const near = Math.abs(this.player.x - pr.x) < 70;
      if (!near) continue;
      if (pr.kind === 'payphone') { pr.fired = true; pr.ringing = 3; barkPhone({ subtitle: true, speaker: 'VAKS', force: true }); }
      else if (pr.kind === 'tv') { pr.fired = true; barkChiefs({ anchor: this.player, force: true }); }
      else if (pr.kind === 'school') { pr.fired = true; barkSchool({ anchor: this.player, force: true }); }
    }

    // tutorials
    for (const tz of this.tutorials) {
      if (tz.fired) continue;
      if (this.player.x > tz.x && this.player.x < tz.x + tz.w &&
          this.player.y > tz.y && this.player.y < tz.y + tz.h) {
        tz.fired = true;
        barkListenUp({ anchor: this.player, force: true });
        Barks.note(tz.text);
      }
    }

    // cat eyes announcement (L3)
    if (this.level.dark && !this.catEyesAnnounced && this.time > 1.2) {
      this.catEyesAnnounced = true;
      barkCatEyes({ anchor: this.player, force: true });
    }

    // gap warning (W2): you are a fish, careful
    if (this.o === 'horizontal' && !this.fishWarned) {
      const aheadX = this.player.x + 50;
      const over = this.groundRects.some((g) => aheadX >= g.x && aheadX <= g.x + g.w);
      const onG = this.groundRects.some((g) => this.player.x >= g.x && this.player.x <= g.x + g.w);
      if (onG && !over) { this.fishWarned = true; barkFish({ anchor: this.player, force: true }); }
    }

    // idle check-ins
    if (this.player.idleT > CONFIG.timers.idleAfter) {
      this.player.idleT = 0;
      this.idleBarkAlt = !this.idleBarkAlt;
      (this.idleBarkAlt ? barkImGood : barkIdlePool)({ anchor: this.player });
    }

    // rare random barks
    this.rareTimer -= dt;
    if (this.rareTimer <= 0) {
      this.rareTimer = CONFIG.timers.rareBarkMin + Math.random() * (CONFIG.timers.rareBarkMax - CONFIG.timers.rareBarkMin);
      (Math.random() < 0.5 ? barkPiper : barkZombie)({ anchor: this.player });
    }

    // the video is cutting
    this.glitchTimer -= dt;
    if (this.glitchTimer <= 0) {
      this.glitchTimer = CONFIG.timers.glitchMin + Math.random() * (CONFIG.timers.glitchMax - CONFIG.timers.glitchMin);
      this.glitchT = CONFIG.timers.glitchLen;
      barkGlitch({ subtitle: true, speaker: 'VAKS', force: true });
    }
    if (this.glitchT > 0) this.glitchT -= dt;

    // threat catches (irie makes Vaks invincible, like debug invincibility)
    const invincible = this.debug.invincible || this.player.irie;
    if (!invincible) {
      if (this.threat.caught(this.player)) {
        if (this.o === 'horizontal') { AudioManager.play('granny_caught'); this.threat.onCaught(); }
        this.die();
      }
      // fell into a gap
      if (this.o === 'horizontal' && this.player.y > this.level.height + 30) this.die();
    } else if (this.o === 'horizontal' && this.player.y > this.level.height + 30) {
      this.player.respawn(this.respawnPoint.x, this.respawnPoint.y);
    }

    // exit
    const e = this.level.exit;
    if (this.player.x > e.x && this.player.x < e.x + e.w &&
        this.player.y > e.y - 6 && this.player.y < e.y + e.h + 8) {
      this.startClear();
    }

    Particles.update(dt);
    Barks.update(dt);
    this.cam.follow(this.player.x, this.player.y, dt);
  }

  hitEntity(x, y, w, h) {
    const hb = this.player.hitbox();
    return hb.x < x + w && hb.x + hb.w > x && hb.y < y + h && hb.y + hb.h > y;
  }

  collect(pk) {
    pk.taken = true;
    const v = CONFIG.money.values[pk.kind];
    if (v) {
      this.run.mano += v; this.manoCollected += v;
      this.run.earned = (this.run.earned || 0) + v;
      this.run.score += v * CONFIG.score.perRand;
      Particles.sparkle(pk.x, pk.y, v >= 50 ? '#ffe49a' : (v >= 10 ? '#8ae08a' : '#ff8a8a'), v >= 50 ? 8 : 4);
      if (!this.firstMano) { this.firstMano = true; barkMano({ anchor: this.player }); }
      // every R{manoPerLife} EARNED across the run = an extra life
      const per = CONFIG.lives.manoPerLife;
      if (Math.floor(this.run.earned / per) > Math.floor((this.run.earned - v) / per) &&
          this.run.lives < CONFIG.lives.max) {
        this.run.lives++;
        Barks.note('R' + per + ' EARNED! EXTRA LIFE, BOSS!');
        Particles.confetti(pk.x, pk.y, 8);
      }
    } else if (pk.kind === 'weed') {
      const result = this.player.startIrie();
      if (result === 'overstack') {
        AudioManager.play('powerup_overstack');
        barkTooStrong({ anchor: this.player, force: true });
        this.shake(2);
      } else {
        AudioManager.play('powerup_irie');
        (Math.random() < 0.5 ? barkIrie : barkIriePool)({ anchor: this.player, force: true });
      }
      Particles.sparkle(pk.x, pk.y, '#6ac24a', 8);
    }
  }

  // ---- draw ----

  draw(ctx) {
    const cam = this.cam;
    // overstack screen sway
    let swayX = 0, swayY = 0;
    if (this.player.overstacked) {
      swayX = Math.sin(this.player.swayPhase) * 3;
      swayY = Math.cos(this.player.swayPhase * 0.7) * 2;
    }

    drawLayers(ctx, this.layers, cam.ox(), cam.oy(), this.o);

    ctx.save();
    ctx.translate(-cam.ox() + swayX, -cam.oy() + swayY);

    this.drawProps(ctx, cam);
    this.drawPlatforms(ctx, cam);

    for (const pk of this.pickups) pk.draw(ctx, cam);
    for (const cp of this.checkpoints) cp.draw(ctx, cam);
    for (const n of this.npcs) n.draw(ctx, cam);
    this.drawExit(ctx);
    for (const r of this.rats) r.draw(ctx, cam);
    for (const t of this.tikos) {
      let alpha = 1;
      if (this.level.dark && t.kind === 'shadow') {
        const dx = t.x - this.player.x, dy = t.y - this.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        alpha = Math.max(0, Math.min(1, 1.25 - dist / CONFIG.catEyes.radius));
      }
      if (alpha > 0.02) t.draw(ctx, cam, alpha);
    }
    for (const b of this.bottles) b.draw(ctx, cam);
    for (const ts of this.tsotsis) ts.draw(ctx, cam);
    for (const b of this.tsotsiBullets) b.draw(ctx, cam);
    for (const s of this.sushi) {
      if (cam.sees(s.x, s.y, 16)) draw(ctx, 'sushi', 0, s.x - 6, s.y - 7);
    }
    this.player.draw(ctx);
    this.threat.draw(ctx, cam);
    Particles.draw(ctx, false);

    ctx.restore();

    if (this.level.dark) this.drawDarkness(ctx, cam);
    if (this.player.irie) this.drawIrieTint(ctx);

    this.drawHUD(ctx);
    Barks.draw(ctx, cam);

    if (this.glitchT > 0) this.drawGlitch(ctx);
    if (this.introT > 0) this.drawIntroCard(ctx);
    if (this.deathT > 0) this.drawDeath(ctx);
    if (this.cleared) {
      drawText(ctx, 'LEVEL CLEAR!', View.w / 2, 80, { color: '#ffe49a', scale: 2, align: 'center' });
    }
  }

  drawPlatforms(ctx, cam) {
    const theme = this.level.theme;
    for (const p of this.level.platforms) {
      if (p.y + 12 < cam.y - 8 || p.y > cam.y + View.h + 8) continue;
      const st = this.crumbleState.get(p);
      if (st && st.gone) continue;
      let ox = 0, oy = 0;
      if (st && !st.gone) {
        ox = (Math.random() * 2 - 1) * CONFIG.crumble.shakeAmp;
        oy = (Math.random() * 2 - 1) * CONFIG.crumble.shakeAmp * 0.5;
      }
      const sheetName = p.type === 'crumble' ? 'plat_crumble' : theme;
      const tiles = Math.max(1, Math.round(p.w / 8));
      for (let i = 0; i < tiles; i++) {
        const f = i === 0 ? 0 : (i === tiles - 1 ? 2 : 1);
        draw(ctx, sheetName, f, p.x + i * 8 + ox, p.y + oy);
      }
      if (p.type === 'crumble') {
        ctx.fillStyle = 'rgba(40,30,20,0.55)';
        ctx.fillRect(Math.round(p.x + 3 + ox), Math.round(p.y + 4 + oy), p.w - 6, 1);
      }
    }
    // walls (W1 shaft edges)
    for (const w of this.level.walls) {
      const y0 = Math.max(w.y, cam.y - 10), y1 = Math.min(w.y + w.h, cam.y + View.h + 10);
      if (y1 <= y0) continue;
      ctx.fillStyle = '#171209';
      ctx.fillRect(w.x, Math.round(y0), w.w, Math.round(y1 - y0));
      ctx.fillStyle = '#2c2218';
      ctx.fillRect(w.x === 0 ? w.w - 2 : w.x, Math.round(y0), 2, Math.round(y1 - y0));
    }
    // ladders + vines
    for (const ld of this.level.ladders) {
      if (ld.y + ld.h < cam.y - 8 || ld.y > cam.y + View.h + 8) continue;
      const units = Math.ceil(ld.h / 8);
      for (let i = 0; i < units; i++) {
        draw(ctx, ld.vine ? 'vine' : 'ladder', 0, ld.x, ld.y + i * 8);
      }
    }
    // grounds (W2)
    for (const g of this.groundRects) {
      if (g.x + g.w < cam.x - 8 || g.x > cam.x + View.w + 8) continue;
      const tiles = Math.ceil(g.w / 16);
      for (let i = 0; i < tiles; i++) {
        const tx = g.x + i * 16;
        if (tx + 16 < cam.x || tx > cam.x + View.w) continue;
        draw(ctx, 'ground_w2', 0, tx, g.y);
      }
    }
  }

  drawProps(ctx, cam) {
    for (const pr of this.props) {
      if (!cam.sees(pr.x, pr.y, 80)) continue;
      const k = pr.kind;
      if (k === 'taxi') draw(ctx, 'taxi', 0, pr.x - 28, pr.y - 26);
      else if (k === 'payphone') {
        const f = pr.ringing > 0 ? Math.floor(pr.t * 8) % 2 : 0;
        if (pr.ringing > 0) { pr.ringing -= 1 / 60; if (Math.random() < 0.15) Particles.sparkle(pr.x, pr.y - 30, '#ffd84d', 1); }
        draw(ctx, 'payphone', f, pr.x - 8, pr.y - 28);
      }
      else if (k === 'tv') { draw(ctx, 'plat_w2', 1, pr.x - 8, pr.y - 10); draw(ctx, 'tv', Math.floor(pr.t * 2) % 2, pr.x - 10, pr.y - 26); }
      else if (k === 'billboard') draw(ctx, 'billboard', 0, pr.x - 26, pr.y - 36);
      else if (k === 'school') draw(ctx, 'school', 0, pr.x - 35, pr.y - 48);
      else if (k === 'washing') draw(ctx, 'washing', Math.floor(pr.t * 1.4) % 2, pr.x - 23, pr.y - 64);
      else if (k === 'bush') draw(ctx, 'bush', 0, pr.x - 11, pr.y - 14);
      else if (k === 'gate') draw(ctx, 'gate', 0, pr.x - 22, pr.y - 48);
    }
  }

  drawExit(ctx) {
    const e = this.level.exit;
    if (this.o === 'vertical') {
      // glowing cave opening
      const g = ctx.createRadialGradient(e.x + e.w / 2, e.y + e.h / 2, 4, e.x + e.w / 2, e.y + e.h / 2, 50);
      g.addColorStop(0, 'rgba(255,236,170,0.85)');
      g.addColorStop(1, 'rgba(255,236,170,0)');
      ctx.fillStyle = g;
      ctx.fillRect(e.x - 40, e.y - 40, e.w + 80, e.h + 80);
      ctx.fillStyle = '#fff3cc';
      ctx.fillRect(e.x + 6, e.y + 4, e.w - 12, e.h - 4);
      drawText(ctx, 'OUT', e.x + e.w / 2, e.y - 10, { color: '#ffe49a', align: 'center' });
    }
  }

  drawDarkness(ctx, cam) {
    // dark mask with cat-eye glow + lantern pools
    if (!this._mask) {
      this._mask = document.createElement('canvas');
      this._mask.width = View.w; this._mask.height = View.h;
    }
    const m = this._mask.getContext('2d');
    m.clearRect(0, 0, View.w, View.h);
    m.fillStyle = `rgba(2,3,6,${CONFIG.catEyes.darkness})`;
    m.fillRect(0, 0, View.w, View.h);
    m.globalCompositeOperation = 'destination-out';
    const px = this.player.x - cam.ox(), py = this.player.y - 12 - cam.oy();
    const r = CONFIG.catEyes.radius;
    let g = m.createRadialGradient(px, py, r * 0.25, px, py, r);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    m.fillStyle = g;
    m.fillRect(px - r, py - r, r * 2, r * 2);
    // checkpoint lanterns cut light pools: lit ones a full pool,
    // unlit ones a faint glimmer so they can be found in the dark
    for (const cp of this.checkpoints) {
      const lx = cp.x - cam.ox(), ly = cp.y - 6 - cam.oy();
      if (lx < -60 || lx > View.w + 60 || ly < -60 || ly > View.h + 60) continue;
      const lr = cp.active ? CONFIG.catEyes.lanternRadius : 20;
      g = m.createRadialGradient(lx, ly, 4, lx, ly, lr);
      g.addColorStop(0, `rgba(0,0,0,${cp.active ? 0.95 : 0.5})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      m.fillStyle = g;
      m.fillRect(lx - lr, ly - lr, lr * 2, lr * 2);
    }
    m.globalCompositeOperation = 'source-over';
    ctx.drawImage(this._mask, 0, 0);
    // cat eyes glint on top of the dark
    ctx.fillStyle = '#ffd84d';
    const fx = Math.round(px + (this.player.facing < 0 ? -4 : -2)), fy = Math.round(py - 12);
    ctx.fillRect(fx, fy, 2, 1);
    ctx.fillRect(fx + 4, fy, 2, 1);
  }

  drawIrieTint(ctx) {
    const a = Math.min(0.22, this.player.irieT > 0.6 ? 0.22 : this.player.irieT * 0.36);
    ctx.fillStyle = `rgba(255,150,60,${a})`;
    ctx.fillRect(0, 0, View.w, View.h);
    ctx.fillStyle = `rgba(160,60,200,${a * 0.45})`;
    const wob = Math.sin(performance.now() / 300) * 10;
    ctx.fillRect(0, 0, View.w, 30 + wob);
    ctx.fillRect(0, View.h - 30 + wob, View.w, 30);
  }

  drawGlitch(ctx) {
    for (let i = 0; i < 7; i++) {
      const y = Math.random() * View.h, h = 2 + Math.random() * 5;
      const off = (Math.random() * 2 - 1) * 16;
      ctx.fillStyle = ['rgba(255,0,80,0.18)', 'rgba(0,255,180,0.16)', 'rgba(255,255,255,0.1)'][i % 3];
      ctx.fillRect(off, y, View.w, h);
    }
    if (Math.random() < 0.4) {
      ctx.fillStyle = 'rgba(8,8,14,0.5)';
      ctx.fillRect(0, Math.random() * View.h, View.w, 8);
    }
  }

  drawHUD(ctx) {
    // lives as weed icons
    for (let i = 0; i < Math.max(0, this.run.lives); i++) {
      draw(ctx, 'weed', 0, 6 + i * 16, 4);
    }
    // rattex armed: the box rides along next to the lives
    if (this.rattex) draw(ctx, 'rattex', 0, 8 + Math.max(0, this.run.lives) * 16 + 4, 3);
    // mano counter + score
    draw(ctx, 'r2', 0, 6, 19);
    drawText(ctx, 'R' + this.run.mano, 21, 22, { color: '#ffe49a' });
    drawText(ctx, 'SCORE ' + this.run.score, View.w - 6, 6, { color: '#f4f0e0', align: 'right' });
    // ganja burn hint (G: spend a life for an irie rush, once per level)
    if (!this.ganjaUsed && this.run.lives > 0 && !this.player.irie) {
      drawText(ctx, 'G:BURN LIFE>IRIE', 6, 32, { color: '#6ac24a' });
    }

    // irie meter
    if (this.player.irie || this.player.overstacked) {
      const w = 56;
      const frac = this.player.overstacked ? 1 : this.player.irieT / CONFIG.irie.duration;
      ctx.fillStyle = '#1a1a24'; ctx.fillRect(View.w / 2 - w / 2 - 1, 7, w + 2, 7);
      ctx.fillStyle = this.player.overstacked ? '#ff5a5a' : '#6ac24a';
      ctx.fillRect(View.w / 2 - w / 2, 8, Math.round(w * frac), 5);
      drawText(ctx, this.player.overstacked ? 'TOO STRONG!' : 'IRIE', View.w / 2, 16, {
        color: this.player.overstacked ? '#ff8a8a' : '#8ae08a', align: 'center',
      });
    }

    // threat gauge
    const frac = this.threat.gaugeFrac(this.player);
    const danger = frac < 0.3;
    const col = danger ? '#ff5a5a' : (frac < 0.55 ? '#ffd84d' : '#8ae08a');
    if (this.o === 'vertical') {
      const h = 80;
      ctx.fillStyle = '#1a1a24'; ctx.fillRect(View.w - 13, 40, 8, h + 2);
      ctx.fillStyle = col;
      const fh = Math.round(h * (1 - frac));
      ctx.fillRect(View.w - 12, 41 + (h - fh), 6, fh);
      drawText(ctx, 'MIST', View.w - 3, 40 + h + 6, { color: col, align: 'right' });
    } else {
      const w = 80, gy = 20;
      ctx.fillStyle = '#1a1a24'; ctx.fillRect(View.w / 2 - w / 2 - 1, gy, w + 2, 8);
      ctx.fillStyle = col;
      const fw = Math.round(w * (1 - frac));
      ctx.fillRect(View.w / 2 - w / 2 + (w - fw), gy + 1, fw, 6);
      drawText(ctx, 'GOGO', View.w / 2 - w / 2 - 26, gy + 1, { color: col });
      if (this.threat.state === 'faint') drawText(ctx, 'GOGO IS RESTING...', View.w / 2, gy + 11, { color: '#8ae08a', align: 'center' });
    }

    if (this.threat.frozen) drawText(ctx, 'THREAT FROZEN', View.w / 2, 24, { color: '#7fd0ff', align: 'center' });
    if (this.debug.invincible) drawText(ctx, 'INVINCIBLE', View.w / 2, 32, { color: '#7fd0ff', align: 'center' });
  }

  drawIntroCard(ctx) {
    const t = 1 - this.introT / CONFIG.timers.introCard;
    const a = t < 0.15 ? t / 0.15 : (t > 0.8 ? (1 - t) / 0.2 : 1);
    dimScreen(ctx, 0.78 * a);
    ctx.globalAlpha = a;
    drawText(ctx, 'WORLD ' + this.level.world + (this.level.world === 1 ? ' - THE CAVE' : ' - THE TOWNSHIP'),
      View.w / 2, 92, { color: '#8a93b8', align: 'center' });
    drawText(ctx, 'LEVEL ' + this.level.id + ': ' + this.level.name, View.w / 2, 112, { color: '#f4f0e0', scale: 2, align: 'center' });
    drawText(ctx, '"' + this.level.tagline + '"', View.w / 2, 140, { color: '#ffe49a', align: 'center' });
    ctx.globalAlpha = 1;
  }

  drawDeath(ctx) {
    const a = Math.min(1, (1.5 - this.deathT) * 2.5);
    dimScreen(ctx, 0.55 * a);
    drawText(ctx, 'CHAO.', View.w / 2, View.h / 2 - 14, { color: '#ff8a8a', scale: 3, align: 'center', alpha: a });
    if (this.run.lives >= 0) {
      drawText(ctx, 'LIVES LEFT: ' + this.run.lives, View.w / 2, View.h / 2 + 18, { color: '#f4f0e0', align: 'center', alpha: a });
    }
  }
}
