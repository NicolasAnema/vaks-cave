// ============================================================
// LEVEL RUNTIME — one screen serves both orientations: movement,
// camera, threats, hazards, pickups, checkpoints, HUD, intro
// card, deaths/respawns, clear sequence, easter-egg triggers.
// ============================================================

import { CONFIG, jumpStats } from '../config.js';
import { View, dimScreen } from '../engine/render.js';
import { Input } from '../engine/input.js';
import { Camera } from '../engine/camera.js';
import { draw, spr } from '../engine/sprites.js';
import { drawText, LINE_H } from '../engine/font.js';
import { Particles } from '../engine/particles.js';
import { makeCaveLayers, makeTownLayers, drawLayers } from '../engine/bg.js';
import { AudioManager, Barks } from '../systems/audio.js';
import { Player } from './player.js';
import { Mist, Chaser } from './threats.js';
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
const barkTsotsiGrab = Barks.wire('m_tsotsi_grab', 'level.js: tsotsi grabs Vaks');

export class LevelScreen {
  constructor(level, run, cb, opts = {}) {
    this.level = level;
    this.run = run;       // { lives, score, mano, hats, faintCharm }
    this.cb = cb;         // { onClear(stats), onGameOver(), onPause() }
    this.opts = opts;     // { tutorial } — caller decides if the L1 drill plays this entry
    this.o = level.orientation;
    this.debug = { invincible: false };

    this.cam = new Camera(this.o, level.width, level.height);
    this.player = new Player(level, this);
    this.cam.snapTo(this.player.x, this.player.y);

    this.layers = this.o === 'vertical' ? makeCaveLayers(level.id) : makeTownLayers(level.id);
    this.threat = this.o === 'vertical' ? new Mist(level) : new Chaser(level);
    // the charm tires the chaser out for the whole run: it runs slower, so you
    // buy yourself breathing room
    if (this.o === 'horizontal' && run.faintCharm) {
      this.threat.base *= CONFIG.chaser.charmSlow;
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
    // L5 hawker gauntlet: stalls/people in the road — contact = a stumble (not
    // death), which lets the taxi close the gap. You weave/jump through them.
    this.hawkers = (level.hawkers || []).map((h) => ({ ...h, hit: false, t: Math.random() * 4 }));
    this.props = level.props.map((p) => ({ ...p, fired: false, t: Math.random() * 5 }));
    this.tutorials = level.tutorials.map((t) => ({ ...t, fired: false }));

    // ground segments -> collision rects
    this.groundRects = level.grounds.map((g) => ({ x: g.x, y: level.groundY, w: g.w, ground: true }));
    this.crumbleState = new Map(); // platform -> { timer, gone, respawn }

    this.respawnPoint = { x: level.spawn.x, y: level.spawn.y };
    this.checkpointActive = false; // flips true once a checkpoint lantern is lit
    this.ganjaUsed = false; // G: burn a life for an irie rush, once per level
    this.autoIrie = !!level.irieStart; // irie level: auto skin-up into the rush at the open
    this.time = 0;
    this.manoCollected = 0;
    this.deaths = 0;
    this.firstMano = false;

    // L1 only: a live, STAGED control drill — a proper walkthrough, not a wall
    // of text. The mist is held back while Vaks is taught one thing at a time:
    // move+jump (batched — that's the basic locomotion), then climb (a ladder
    // is right there), then meow — introduced the instant a practice tikolosh
    // drifts onto him, so the lesson lands exactly when it's needed. Purely
    // gated: each stage waits for Vaks to actually do it, so nobody is rushed.
    // opts.tutorial gates it to the player's first-ever arrival at L1.
    this.liveTut = (level.liveTutorial && opts.tutorial) ? {
      stage: 0,            // 0 move+hop+bigjump -> 1 climb -> 2 meow -> 3 ganja -> 4 irie->gold door
      done: false,
      moved: false, hopped: false, bigJumped: false, climbed: false, meowed: false, ganjad: false,
      // stage-0 jump-height measurement (tap vs hold, taught by doing)
      wasGround: true, groundY: level.spawn.y, launchY: 0, apexY: 0, tracking: false,
      tiko: null,          // practice tikolosh, drifts in at the meow stage
    } : null;

    this.introT = CONFIG.timers.introCard;
    this.deathT = 0;
    this.clearT = 0;
    this.cleared = false;
    this.hitStopT = 0;
    this.glitchT = 0;
    this.drunkFlashT = 0;   // bottle clonk -> screen swims drunk-yellow while it ticks down
    this.idleBarkAlt = false;
    this.fishWarned = false;
    this.stallDone = false;
    this.sideSceneFired = false;   // mid-level cutscene breather (once per instance)
    this.catEyesAnnounced = false;
    this.bottleTimer = 1.5;
    this.rareTimer = CONFIG.timers.rareBarkMin + Math.random() * (CONFIG.timers.rareBarkMax - CONFIG.timers.rareBarkMin);
    this.glitchTimer = CONFIG.timers.glitchMin + Math.random() * (CONFIG.timers.glitchMax - CONFIG.timers.glitchMin);

    AudioManager.playMusic(level.music);
    this.started = false;

    // rattex from the shop: this level, rats die if they touch Vaks
    this.rattex = false;
    if (run.rattex) { run.rattex = false; this.rattex = true; }
  }

  // entry barks fire on the first update so screen transitions can't clear them
  start() {
    if (this.level.isTutorial) return; // the drill speaks for itself — no entry bark
    AudioManager.play('level_start', 'L' + this.level.id);
    const useSignature = Math.random() < 0.5;
    if (this.o === 'vertical') (useSignature ? barkStartSafari : barkStartPool)({ subtitle: true, speaker: 'VAKS', force: true });
    else (useSignature ? barkStartBaas : barkStartPool)({ subtitle: true, speaker: 'VAKS', force: true });
  }

  // ---- hooks used by player/entities ----
  shake(m) { this.cam.addShake(m); }
  hitStop() { this.hitStopT = CONFIG.fx.hitStop; }
  fxJump() { AudioManager.play('jump'); }
  fxLand() { this.cam.addShake(0.4); }
  meow(x, y) {
    const mr2 = CONFIG.player.meowRadius * CONFIG.player.meowRadius;
    for (const r of this.rats) {
      const dx = r.x - x, dy = (r.y - 4) - y;
      if (dx * dx + dy * dy >= mr2) continue;
      // a meow is a gamble: some rats scatter, some just don't care
      if (Math.random() < CONFIG.rats.meowScareChance) r.flee(x);
      else Particles.dust(r.x, r.y - 6, 2); // little "nuh-uh" puff: this one ignored you
    }
    // the meow also scares off the tikoloshes ("birds") — wider reach since
    // they're the aerial instakill threat
    const tr = CONFIG.tiko.meowRadius;
    for (const t of this.tikos) {
      const dx = t.x - x, dy = t.y - y;
      if (dx * dx + dy * dy < tr * tr) t.flee(x);
    }
  }
  killY() {
    return this.o === 'vertical' ? this.threat.topY + 40 : this.level.groundY + 70;
  }

  // ---- chaser signature hooks (called by the Chaser) ----
  // L4 shebeen: lob a bottle that arcs ahead of Vaks and shatters into a
  // babalas hazard on the ground (reuses the W1 bottle physics + collision).
  spawnLobBottle(fromX, towardX) {
    if (this.bottles.length >= CONFIG.bottles.maxActive) return;
    const dir = towardX >= fromX ? 1 : -1;
    const b = new Bottle(fromX + dir * 10, this.level.groundY - 26, dir);
    b.vx = dir * CONFIG.chaser.shebeen.lobSpeed;
    b.vy = -CONFIG.chaser.shebeen.lobUp;
    this.bottles.push(b);
    AudioManager.play('bottle_spawn', 'shebeen');
  }

  // L6 tsotsi: detach a fast runner that flanks up from behind. Reuses the
  // Tsotsi grab (= phone snatch); it despawns once it drops off the left edge.
  spawnFlankTsotsi(fromX) {
    if (this.tsotsis.filter((t) => t.flank && !t.dead).length >= 2) return;
    const t = new Tsotsi({ kind: 'knife', x: fromX, y: this.level.groundY, minX: fromX - 20, maxX: this.level.width - 40 });
    t.flank = true;
    this.tsotsis.push(t);
    AudioManager.play('tsotsi_alert', 'flank');
  }

  // ---- live control drill (L1) ----
  // A staged walkthrough. Returns true while it's holding the mist back. Each
  // stage waits for Vaks to actually perform the control, then hands off to the
  // next — the lesson is live and paced, never a timer racing the player.
  updateLiveTutorial(dt) {
    const T = this.liveTut;
    if (!T || T.done) return false;

    if (T.stage === 0) {                       // MOVE + TAP-HOP + BIG-JUMP (taught by doing)
      const p = this.player;
      let feat = false;
      if (!T.moved && Input.dirX() !== 0) { T.moved = true; feat = true; }
      // measure jumps: capture the true ground level while grounded, then track
      // the apex from launch (leaving the ground going UP) to landing, and
      // classify the apex rise as a fraction of the sober full-jump apex.
      if (p.onGround && !p.climbing) T.groundY = p.y;
      if (T.wasGround && !p.onGround && !p.climbing && p.vy < 0 && !T.tracking) {
        T.tracking = true; T.launchY = T.groundY; T.apexY = p.y;
      }
      if (T.tracking) {
        if (p.y < T.apexY) T.apexY = p.y;        // rising -> smaller y
        if (p.onGround || p.climbing) {          // landed (or grabbed a ladder mid-air)
          const rise = T.launchY - T.apexY;
          const maxH = jumpStats(CONFIG.player.runSpeed).maxJumpH;
          if (!T.hopped && rise <= maxH * CONFIG.tutorial.hopMaxFrac) { T.hopped = true; feat = true; }
          else if (!T.bigJumped && rise >= maxH * CONFIG.tutorial.bigMinFrac) { T.bigJumped = true; feat = true; }
          // the ambiguous middle counts as neither — try again
          T.tracking = false;
        }
      }
      T.wasGround = p.onGround;
      if (T.moved && T.hopped && T.bigJumped) this.advanceTutStage();
      else if (feat) this.tutFeat();             // acknowledge each feat as it registers
    } else if (T.stage === 1) {                // CLIMB (a ladder is right there)
      if (this.player.climbing) { T.climbed = true; this.advanceTutStage(); }
    } else if (T.stage === 2) {                // MEOW (a tikolosh is on him now)
      if (Input.meowPressed()) { T.meowed = true; this.advanceTutStage(); }
    } else if (T.stage === 3) {                // GANJA: the taught rush is free
      if (this.player.irie) { T.ganjad = true; this.advanceTutStage(); }
      else if (Input.wasPressed('KeyG') && !this.player.smoking) {
        if (this.player.onGround && !this.player.climbing) this.startSkinUp(false); // no life burned
        else Barks.note('PLANT YA FEET TO SKIN UP, BOSS', 'VAKS');
      }
    } else if (T.stage === 4) {                // IRIE! jump to the gold door (exit-check hands off)
      // no timeout — the drill persists until Vaks touches the door. If the 4s
      // rush fades, G re-rushes for FREE, indefinitely, so the arena can't soft-lock.
      if (!this.player.irie && Input.wasPressed('KeyG') && !this.player.smoking) {
        if (this.player.onGround && !this.player.climbing) this.startSkinUp(false); // free, no life burned
        else Barks.note('PLANT YA FEET TO SKIN UP, BOSS', 'VAKS');
      }
    }
    return true;
  }

  // acknowledge a single completed feat (tap-hop / big-jump / first move) with
  // the same sparkle + chime a stage completion uses, so each one feels landed.
  tutFeat() {
    AudioManager.play('tutorial_prompt', 'feat');
    Particles.sparkle(this.player.x, this.player.y - 14, '#8ae08a', 6);
  }

  // step to the next stage: sparkle + chime; the practice tikolosh drifts in
  // the moment the meow stage begins (teach the counter as the threat arrives).
  advanceTutStage() {
    const T = this.liveTut;
    if (!T) return;
    AudioManager.play('tutorial_prompt', 'stage' + T.stage);
    Particles.sparkle(this.player.x, this.player.y - 14, '#8ae08a', 6);
    T.stage++;
    if (T.stage === 2) this.spawnTutorialTiko();
  }

  // a single tikolosh drifts in to give the meow a target. It's harmless for
  // the drill (the contact-kill is gated while the tutorial holds) and meow
  // shoves it back — exactly how the real ones behave higher up the shaft.
  spawnTutorialTiko() {
    if (!this.liveTut || this.liveTut.tiko) return;
    const side = this.player.x < this.level.width / 2 ? 1 : -1;
    const x = Math.max(28, Math.min(this.level.width - 28, this.player.x + side * 70));
    const t = new Tiko({ kind: 'irie', x, y: this.player.y - 24, minX: 60, maxX: this.level.width - 60 });
    this.tikos.push(t);
    this.liveTut.tiko = t;
    AudioManager.play('hazard_warning', 'tiko');
    Barks.note('TIKOLOSH! PRESS W TO MEOW AND SCARE IT BACK!');
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

  // Vaks wrestles free (escaped) or the grip slips after holdMax
  tsotsiRelease(ts, escaped) {
    if (this.player.grabbedBy !== ts) return;
    const GR = CONFIG.tsotsi.grab;
    this.player.grabbedBy = null;
    ts.holding = false;
    ts.cd = GR.regrabCd;
    // hop away from the grabber with a moment of grace
    this.player.invuln = 1.2;
    this.player.vx = ts.dir * GR.breakHopX;
    this.player.vy = -GR.breakHopY;
    this.player.onGround = false;
    AudioManager.play('tsotsi_grab', escaped ? 'break' : 'slip');
    if (ts.kind === 'viceroy') {
      // he got a sip down regardless: babalas
      this.player.babalasT = CONFIG.babalas.time;
      AudioManager.play('tsotsi_drink', 'forced sip');
      Barks.note('VICEROY BABALAS! LEGS LIKE PAP.');
    }
    Particles.dust(this.player.x, this.player.y, 6);
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
    if (this.player.dead || this.cleared || this.debug.invincible || this.player.irie || this.player.smoking) return;
    // a grabbing tsotsi lets go of a caught Vaks
    if (this.player.grabbedBy) { this.player.grabbedBy.holding = false; this.player.grabbedBy = null; }
    this.player.dead = true;
    this.deaths++;
    this.run.lives--;
    this.deathT = 1.5;
    AudioManager.stopMusic();          // cut the level music so the death sting lands clean
    AudioManager.play('death', 'L' + this.level.id);
    barkChao({ subtitle: true, speaker: 'VAKS', force: true });
    this.shake(CONFIG.fx.shakeImpact);
    Particles.shards(this.player.x, this.player.y - 10, ['#7ec8ff', '#9a6a42', '#2e3f96']);
  }

  doRespawn() {
    this.player.respawn(this.respawnPoint.x, this.respawnPoint.y);
    this.crumbleState.clear();          // restore any steps that crumbled on the way up
    if (this.o === 'vertical') this.threat.resetTo(this.respawnPoint.y);
    else this.threat.resetTo(this.respawnPoint.x);
    this.cam.snapTo(this.player.x, this.player.y);
    AudioManager.playMusic(this.level.music);  // bring the level music back after the death sting
    AudioManager.play('respawn', 'L' + this.level.id);
    barkRespawn({ anchor: this.player, force: true });
  }

  startClear() {
    if (this.cleared) return;
    this.cleared = true;
    this.clearT = 2.0;
    this.player.celebrating = true;
    AudioManager.stopMusic();          // cut the level music so the mission-pass jingle plays clean
    AudioManager.play('level_clear', 'L' + this.level.id);
    if (this.level.isTutorial) {
      // the drill is DONE — retire it and poof the harmless practice tikolosh.
      // Reserve the m_finished_room comedy line for real levels; the drill just
      // chimes its own prompt instead.
      if (this.liveTut) {
        this.liveTut.done = true;
        if (this.liveTut.tiko) {
          Particles.sparkle(this.liveTut.tiko.x, this.liveTut.tiko.y - 8, '#b07fe0', 8);
          this.tikos = this.tikos.filter((t) => t !== this.liveTut.tiko);
          this.liveTut.tiko = null;
        }
      }
      AudioManager.play('tutorial_prompt', 'done');
    } else {
      barkClear({ anchor: this.player, force: true });
    }
    Particles.confetti(this.player.x, this.player.y - 20);
  }

  // Kick off the skin-up ritual: freeze the world, roll + smoke the joint, and
  // land the irie rush when it's lit (onSmokeDone). burnLife spends a life — the
  // manual G emergency does; the irie level's auto-open does not.
  startSkinUp(burnLife) {
    if (burnLife) { this.ganjaUsed = true; this.run.lives--; }
    this.player.startSmoke();
    AudioManager.pauseMusic();      // the whole world holds while he skins up
    // the "IT'S GOOD TO BE FEEL IRIE." voice note fires the moment he commits —
    // interrupt:true barges in and cuts any line already mid-play (like the meow)
    barkIrie({ anchor: this.player, force: true, interrupt: true });
    this.shake(0.6);
  }

  // the joint reaches his lips — the inhale plays now (not before), and runs the
  // length of the burn-down (player.js calls this once, when the joint's lit)
  onJointLit() {
    AudioManager.play('skin_up');
  }

  // burned to the Rodger — the irie rush lands (player.js calls this the instant
  // the ritual finishes; the life was already burned when G was pressed)
  onSmokeDone() {
    this.player.startIrie();
    // the world (and the music) come back to life — on the irie level the Irie
    // Loop takes over from here; everywhere else the held track resumes.
    if (this.level.irieMusic) AudioManager.playMusic(this.level.irieMusic);
    else AudioManager.resumeMusic();
    Particles.sparkle(this.player.x, this.player.y - 10, '#6ac24a', 10);
    Particles.smoke(this.player.x + this.player.facing * 5, this.player.y - 24);
    this.shake(1.5);
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

    // the irie level opens with Vaks already skinning up — the rush is how you
    // start the climb, and it costs no life. Fires once, right after the intro.
    if (this.autoIrie && !this.player.smoking && !this.player.irie) {
      this.autoIrie = false;
      this.startSkinUp(false);
    }

    if (this.cleared) {
      this.clearT -= dt;
      this.player.update(dt);
      Particles.update(dt);
      Barks.update(dt);
      this.cam.follow(this.player.x, this.player.y, dt);
      if (this.clearT <= 0) {
        // the tutorial arena has no par time / score — just hand off to L1
        if (this.level.isTutorial) { this.cb.onClear({ time: this.time, mano: 0, deaths: 0 }); return; }
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
        // out of lives -> the whole game restarts (main.js); otherwise resume
        // from the last checkpoint reached, or restart the level if none is lit.
        if (this.run.lives < 0) this.cb.onGameOver();
        else if (this.checkpointActive) this.doRespawn();
        else this.cb.onRestart();
      }
      return;
    }

    if (!this.player.smoking) this.time += dt;   // the clock stops too while he skins up

    // G: burn a life to skin up — Vaks plants his feet, pulls out the blunt,
    // rolls the joint and smokes it down to the stinging Rodger in one pull.
    // The irie rush lands when it's lit (onSmokeDone). Once per level, never
    // while already irie (burning a life to overstack is a trap), and his
    // feet must be planted (no rolling mid-air or on a ladder).
    // (in the tutorial arena the drill handles G itself — free, no life burned)
    if (!this.level.isTutorial && Input.wasPressed('KeyG') && !this.player.smoking) {
      const canBurn = !this.ganjaUsed && !this.player.irie && this.run.lives > 0;
      if (canBurn && this.player.onGround && !this.player.climbing && !this.player.grabbedBy) {
        this.startSkinUp(true);
      } else if (canBurn) {
        Barks.note('PLANT YA FEET TO SKIN UP, BOSS', 'VAKS');
      } else if (!this.player.irie) {
        Barks.note(this.ganjaUsed ? 'ONE IRIE BURN PER LEVEL, BOSS' : 'NO LIVES TO BURN');
      }
    }

    // irie now slows ONLY the rats and tikolosh (eslow); everything else —
    // bottles, tsotsis, bullets, the mist, granny, Vaks — runs at full speed.
    const eslow = this.player.enemySlow();

    this.player.update(dt);

    // Skin-up ritual freezes the whole world. Only Vaks's own animation (the
    // burning joint + its smoke) and the inhale SFX keep going — threats,
    // hazards, enemies, projectiles, the clock and the music all hold until the
    // rush lands. (player.update fired onSmokeDone on the frame it ended, which
    // resumes the music, so this returns on every frame BUT that last one.)
    if (this.player.smoking) {
      Particles.update(dt);
      Barks.update(dt);
      this.cam.follow(this.player.x, this.player.y, dt);
      return;
    }

    // mid-level cutscene breather (W2): the first time Vaks crosses the mark,
    // push a cutscene overlay. M.update only ticks the top of the stack, so the
    // level and its chaser freeze for free while it plays; the done-callback
    // grants a breather (shoves the chaser back). Fires once per level instance;
    // a death-restart rebuilds the LevelScreen and may re-trigger — acceptable.
    if (this.level.sideScene && !this.sideSceneFired && this.cb.onSideScene &&
        this.player.x >= this.level.sideScene.frac * this.level.width) {
      this.sideSceneFired = true;
      this.cb.onSideScene(this.level.sideScene.id, () => this.threat.breather(this.player.x));
      return;
    }

    // live control drill (tutorial arena): Vaks plays for real but the mist is
    // held back while the drill is up
    const tutHold = this.updateLiveTutorial(dt);
    if (!tutHold) this.threat.update(dt, this.player, this);

    // crumbling platforms (held while Vaks skins up so the ledge under his
    // planted feet can't fall away mid-ritual)
    for (const [p, st] of this.crumbleState) {
      if (!st.gone) {
        if (!this.player.smoking) st.timer -= dt;
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
    if (this.level.bottles && this.o === 'vertical' && !tutHold) {
      this.bottleTimer -= dt;
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
      b.update(dt, this, 1);
      if (b.dead) { this.bottles.splice(i, 1); continue; }
      if (this.hitEntity(b.x - 5, b.y - 12, 10, 12) && this.player.invuln <= 0) {
        b.shatter();
        AudioManager.play('glass_break', 'L' + this.level.id); // file is pre-trimmed (0.2s lead-in cut), so it cracks on impact with no seek lag
        this.drunkFlashT = CONFIG.babalas.time;                     // screen swims drunk-yellow for the hangover
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
      r.update(dt, this, eslow);
      // a stomped rat is harmless for the rest of its life: skip its hitbox while
      // it's squished AND on the frame the squish expires (update flips it to
      // dead that same frame), so a flattened rat can never knock Vaks off.
      if (r.squishT > 0 || r.dead) continue;
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
          this.player.hurt(r.x, CONFIG.rats.knockMul, true); // rats shove sideways only, no upward pop
        }
      }
    }
    this.rats = this.rats.filter((r) => !r.dead);

    // township tsotsis (W2): contact = GRABBED. Vaks is pinned to the
    // tsotsi until he mashes free — and granny keeps coming the whole time.
    for (const ts of this.tsotsis) {
      ts.update(dt, this, 1);
      if (ts.holding) {
        // the knife guy picks the pocket for as long as he holds on
        if (ts.kind === 'knife' && this.run.mano > 0) {
          ts.drainAcc += dt * CONFIG.tsotsi.knife.stealPerSec;
          while (ts.drainAcc >= 1 && this.run.mano > 0) { ts.drainAcc -= 1; this.run.mano--; }
        }
        continue;
      }
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
        } else if (this.player.invuln <= 0 && !this.player.irie &&
                   !this.player.grabbedBy && !this.player.dead) {
          // GOT HIM — grip starts, mash to wrestle free
          ts.holding = true;
          ts.dir = this.player.x >= ts.x ? 1 : -1;
          ts.drainAcc = 0;
          this.player.grabbedBy = ts;
          this.player.grabGrip = CONFIG.tsotsi.grab.mash;
          this.player.grabHoldT = 0;
          this.player.vx = 0; this.player.vy = 0;
          this.player.climbing = false;
          AudioManager.play('tsotsi_grab', ts.kind);
          barkTsotsiGrab({ anchor: this.player, force: true });
          if (ts.kind === 'knife') barkTsotsiPhone({ subtitle: true, speaker: 'VAKS', force: true });
          if (ts.kind === 'viceroy') barkTsotsiViceroy({ subtitle: true, speaker: 'VAKS', force: true });
          this.hitStop();
          this.shake(CONFIG.fx.shakeImpact);
        }
      }
    }
    this.tsotsis = this.tsotsis.filter((t) => !t.dead); // drop spent flank runners
    // the gunman's bullets: slow, straight, jumpable
    for (let i = this.tsotsiBullets.length - 1; i >= 0; i--) {
      const b = this.tsotsiBullets[i];
      b.update(dt, this, 1);
      if (b.dead) { this.tsotsiBullets.splice(i, 1); continue; }
      if (this.hitEntity(b.x - 3, b.y - 2, 6, 4)) {
        this.tsotsiBullets.splice(i, 1);
        if (this.player.invuln <= 0) this.player.hurt(b.x);
      }
    }

    // tikolosh variants: contact = caught (the drill's practice tiko is harmless
    // while the tutorial holds — meow it back without dying)
    for (const t of this.tikos) {
      t.update(dt, this, eslow);
      const hb = t.hitbox();
      if (this.hitEntity(hb.x, hb.y, hb.w, hb.h) && !tutHold) this.die();
    }

    // sushi (W2): china's food
    for (const s of this.sushi) {
      if (Math.abs(this.player.x - s.x) < 10 && Math.abs(this.player.y - s.y) < 14 && this.player.invuln <= 0 && !this.player.irie) {
        if (!s.hit) { s.hit = true; barkSushiHit({ anchor: this.player, force: true }); }
        this.player.hurt(s.x);
        this.player.stun = CONFIG.sushi.stunTime;
      }
    }

    // L5 hawker gauntlet: bump a stall = a stumble (knockback + stun, no death),
    // which costs you ground while the taxi closes. Jump/weave through them.
    for (const h of this.hawkers) {
      h.t += dt;
      if (Math.abs(this.player.x - h.x) < 11 && this.player.y > this.level.groundY - 24 &&
          this.player.invuln <= 0 && !this.player.irie && !this.player.smoking) {
        if (!h.hit) { h.hit = true; Barks.note('AWE! MIND THE STALL, BOSS!'); }
        this.player.hurt(h.x);
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

    // checkpoints: passing a lantern lights it and makes it the resume point.
    // The mist resets to CONFIG.mist.resetGap below it on the next death.
    for (const cp of this.checkpoints) {
      cp.update(dt);
      if (!cp.active && Math.abs(this.player.x - cp.x) < 40 && Math.abs(this.player.y - cp.y) < 30) {
        cp.active = true;
        this.checkpointActive = true;
        this.respawnPoint = { x: cp.x, y: cp.y };
        AudioManager.play('shop_buy', 'checkpoint L' + this.level.id);
        Particles.sparkle(cp.x, cp.y - 6, '#ffc86e', 10);
        barkCheckpoint({ anchor: this.player, force: true });
      }
    }

    // scripted Tallman & Shorty beat: they stall granny when Vaks passes the spot
    if (this.level.scriptedStallAt && !this.stallDone &&
        this.player.x > this.level.scriptedStallAt.x) {
      this.stallDone = true;
      this.threat.stall(5.0);
      Barks.note('TALLMAN AND SHORTY STALL THE ' + this.threat.label + ' OVER THEIR DEBTS. RUN!');
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
    if (this.drunkFlashT > 0) this.drunkFlashT -= dt;

    // threat catches (irie makes Vaks invincible, like debug invincibility)
    const invincible = this.debug.invincible || this.player.irie || this.player.smoking;
    if (!invincible && !tutHold) {
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
      // every R{manoPerLife} EARNED across the run = an extra life. It's a
      // permanent +1: bank it so it survives the per-level life reload.
      const per = CONFIG.lives.manoPerLife;
      if (Math.floor(this.run.earned / per) > Math.floor((this.run.earned - v) / per) &&
          this.run.lives < CONFIG.lives.max) {
        this.run.lives++;
        this.run.bonusLives = (this.run.bonusLives || 0) + 1;
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
    this.drawHawkers(ctx, cam);
    this.player.draw(ctx);
    // grabbed: flashing mash prompt over the struggle
    if (this.player.grabbedBy && Math.floor(this.time * 6) % 2 === 0) {
      drawText(ctx, 'MASH!', this.player.x, this.player.y - 46, { color: '#ffd84d', align: 'center' });
    }
    this.threat.draw(ctx, cam);
    Particles.draw(ctx, false);

    ctx.restore();

    if (this.level.dark) this.drawDarkness(ctx, cam);
    if (this.player.irie) this.drawIrieTint(ctx);
    if (this.player.smoking) this.drawSmoke(ctx);
    if (this.level.tint === 'drunk') this.drawDrunkTint(ctx);
    else if (this.drunkFlashT > 0) this.drawDrunkTint(ctx, this.drunkFlashT);

    this.drawHUD(ctx);
    if (this.liveTut && !this.liveTut.done && this.introT <= 0) this.drawLiveTutorial(ctx);
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
    if (this.o !== 'vertical') return;
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
    if (this.level.isTutorial) {
      // GOLD DOOR — the irie-only tutorial finish. Warm gold glow + a simple
      // panelled door with a bright gleam, same pixel-art style as the cave exit.
      const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, 46);
      g.addColorStop(0, 'rgba(255,228,154,0.85)');
      g.addColorStop(1, 'rgba(255,228,154,0)');
      ctx.fillStyle = g;
      ctx.fillRect(e.x - 38, e.y - 38, e.w + 76, e.h + 76);
      ctx.fillStyle = '#8a6a1e'; ctx.fillRect(e.x, e.y, e.w, e.h);                 // frame
      ctx.fillStyle = '#ffe49a'; ctx.fillRect(e.x + 3, e.y + 3, e.w - 6, e.h - 3); // face
      const ph = (e.h - 14) / 2 - 2;                                              // two inset panels
      ctx.fillStyle = '#f2c65a';
      ctx.fillRect(e.x + 7, e.y + 7, e.w - 14, ph);
      ctx.fillRect(e.x + 7, e.y + 9 + ph, e.w - 14, ph);
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(e.x + 6, e.y + 6, 2, e.h - 12); // gleam
      ctx.fillStyle = '#fff3cc'; ctx.fillRect(e.x + e.w - 11, cy - 1, 3, 3);      // knob
      drawText(ctx, 'GOLD DOOR', cx, e.y - 10, { color: '#ffe49a', align: 'center' });
      return;
    }
    // glowing cave opening (real levels)
    const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, 50);
    g.addColorStop(0, 'rgba(255,236,170,0.85)');
    g.addColorStop(1, 'rgba(255,236,170,0)');
    ctx.fillStyle = g;
    ctx.fillRect(e.x - 40, e.y - 40, e.w + 80, e.h + 80);
    ctx.fillStyle = '#fff3cc';
    ctx.fillRect(e.x + 6, e.y + 4, e.w - 12, e.h - 4);
    drawText(ctx, 'OUT', cx, e.y - 10, { color: '#ffe49a', align: 'center' });
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

  // while Vaks skins up the whole screen washes green and fills with colourful
  // bubbles drifting up across it — the world's already frozen behind it.
  drawSmoke(ctx) {
    const p = this.player;
    const prog = p.smokeTotal ? 1 - p.smokeT / p.smokeTotal : 0;
    const T = performance.now() / 1000;
    // green wash, deepening as the joint burns down
    const a = 0.24 + prog * 0.16 + Math.sin(T * 3) * 0.03;
    ctx.fillStyle = `rgba(46,196,74,${a})`;
    ctx.fillRect(0, 0, View.w, View.h);

    // colourful bubbles rising and wobbling across the screen
    const COLORS = ['#ff5ea8', '#ffd84d', '#7ec8ff', '#8ae08a', '#c08aff', '#ff9a4d', '#5ef0d0'];
    const N = 28, colW = View.w + 24, span = View.h + 28;
    for (let i = 0; i < N; i++) {
      const seed = i * 12.9898;
      const speed = 16 + (i % 5) * 8;
      const sway = 14 + (i % 4) * 7;
      const x = (((i * 61 + Math.sin(T * 0.7 + seed) * sway) % colW) + colW) % colW - 12;
      const y = View.h + 14 - ((T * speed + i * 41) % span);
      const r = 2 + ((i + Math.floor(T * 1.5)) % 4);
      const al = Math.max(0.18, 0.45 + 0.3 * Math.sin(T * 2.2 + seed));
      ctx.globalAlpha = al;
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.beginPath();
      ctx.arc(Math.round(x), Math.round(y), r, 0, 6.2832);
      ctx.fill();
      ctx.globalAlpha = al * 0.7;                     // glossy highlight
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(x) - 1, Math.round(y) - r + 1, 1, 1);
    }
    ctx.globalAlpha = 1;
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

  // L4 shebeen: the whole street reads tipsy-yellow, deepening each time a
  // drink-pusher forces a sip (babalas), with a slow vignette wobble. Also reused
  // as a TRANSIENT flash elsewhere: pass the bottle-hit timer and the yellow
  // peaks on impact and swims away as the hangover wears off.
  drawDrunkTint(ctx, flash = 0) {
    let a;
    if (flash > 0) {
      a = 0.3 * Math.min(1, flash / CONFIG.babalas.time);
    } else {
      const extra = this.player.babalasT > 0 ? Math.min(0.12, 0.06 + this.player.babalasT * 0.02) : 0;
      a = 0.12 + extra;
    }
    ctx.fillStyle = `rgba(232,192,64,${a})`;
    ctx.fillRect(0, 0, View.w, View.h);
    const wob = Math.sin(performance.now() / 320) * 8;
    ctx.fillStyle = `rgba(176,118,28,${a * 0.5})`;
    ctx.fillRect(0, 0, View.w, 26 + wob);
    ctx.fillRect(0, View.h - 26 + wob, View.w, 26);
  }

  // L5 hawker stalls — red/white stand, wares on a table, a hawker behind
  drawHawkers(ctx, cam) {
    for (const h of this.hawkers) {
      if (!cam.sees(h.x, h.y, 44)) continue;
      const x = Math.round(h.x), y = Math.round(h.y);
      // table + legs
      ctx.fillStyle = '#6a4a30'; ctx.fillRect(x - 12, y - 16, 24, 4);
      ctx.fillStyle = '#3f2e1c'; ctx.fillRect(x - 11, y - 12, 3, 12); ctx.fillRect(x + 8, y - 12, 3, 12);
      // wares
      ctx.fillStyle = '#d05a4a'; ctx.fillRect(x - 9, y - 20, 4, 4);
      ctx.fillStyle = '#e0b84a'; ctx.fillRect(x - 2, y - 20, 4, 4);
      ctx.fillStyle = '#5a9a5a'; ctx.fillRect(x + 5, y - 20, 4, 4);
      // umbrella/cover + pole
      ctx.fillStyle = '#c84040'; ctx.fillRect(x - 16, y - 40, 32, 4);
      ctx.fillStyle = '#e8e8e8'; ctx.fillRect(x - 16, y - 40, 32, 1);
      ctx.fillStyle = '#2c2c3a'; ctx.fillRect(x - 1, y - 38, 2, 22);
      // the hawker behind the stand
      ctx.fillStyle = '#7a5a3a'; ctx.fillRect(x - 3, y - 30, 6, 14);
      ctx.fillStyle = '#2a1f14'; ctx.fillRect(x - 3, y - 34, 6, 5);
    }
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
    // y=30 keeps clear of the persistent mute button pinned to the top-right corner
    drawText(ctx, 'SCORE ' + this.run.score, View.w - 6, 30, { color: '#f4f0e0', align: 'right' });
    // ganja burn hint (G: spend a life for an irie rush, once per level)
    if (!this.ganjaUsed && this.run.lives > 0 && !this.player.irie && !this.player.smoking) {
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
    } else if (this.player.smoking) {
      // skin-up progress: rolling/lighting the joint before the rush
      const w = 56;
      const frac = this.player.smokeTotal ? 1 - this.player.smokeT / this.player.smokeTotal : 0;
      ctx.fillStyle = '#1a1a24'; ctx.fillRect(View.w / 2 - w / 2 - 1, 7, w + 2, 7);
      ctx.fillStyle = '#c9a23a'; ctx.fillRect(View.w / 2 - w / 2, 8, Math.round(w * frac), 5);
      drawText(ctx, 'SKINNIN UP', View.w / 2, 16, { color: '#e0c060', align: 'center' });
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
      drawText(ctx, this.threat.label || 'CHASER', View.w / 2 - w / 2 - 30, gy + 1, { color: col });
      if (this.threat.state === 'stalled') drawText(ctx, 'STALLED!', View.w / 2, gy + 11, { color: '#8ae08a', align: 'center' });
    }

    if (this.threat.frozen) drawText(ctx, 'THREAT FROZEN', View.w / 2, 24, { color: '#7fd0ff', align: 'center' });
    if (this.debug.invincible) drawText(ctx, 'INVINCIBLE', View.w / 2, 32, { color: '#7fd0ff', align: 'center' });
  }

  drawLiveTutorial(ctx) {
    const T = this.liveTut;
    const irie = this.player.irie;
    // one focused card per stage — only what Vaks needs to do right now
    let rows, title, footer, footerCol;
    if (T.stage === 0) {                 // move + tap-hop + big-jump, taught by doing
      rows = [
        ['WALK', 'LEFT / RIGHT', T.moved],
        ['SMALL HOP', 'TAP SPACE', T.hopped],
        ['BIG JUMP', 'HOLD SPACE', T.bigJumped],
      ];
      title = 'LEARN THE ROPES'; footer = 'STEP 1 OF 4'; footerCol = '#7fd0ff';
    } else if (T.stage === 1) {
      rows = [['CLIMB', 'UP / DOWN', T.climbed]];
      title = 'NOW CLIMB'; footer = 'STEP 2 OF 4'; footerCol = '#7fd0ff';
    } else if (T.stage === 2) {
      rows = [['MEOW', 'PRESS W', T.meowed]];
      title = 'SCARE IT OFF'; footer = 'STEP 3 OF 4'; footerCol = '#7fd0ff';
    } else if (T.stage === 3) {
      rows = [['SKIN UP', 'PRESS G (FREE HERE)', T.ganjad]];
      title = 'THE IRIE RUSH'; footer = 'STEP 4 OF 4'; footerCol = '#7fd0ff';
    } else {                             // stage 4 — persists until the gold door
      rows = irie
        ? [['IRIE JUMP', 'CLIMB THEN JUMP UP', true]]
        : [['RE-RUSH', 'PRESS G AGAIN (FREE)', false]];
      title = 'IRIE!';
      footer = irie ? 'JUMP TO THE GOLD DOOR!' : 'G AGAIN IF THE RUSH FADES';
      footerCol = irie ? '#ffe49a' : '#7fd0ff';
    }
    const w = 204, h = 16 + rows.length * LINE_H + 12;
    const x = Math.round(View.w / 2 - w / 2), y = 40;
    ctx.fillStyle = 'rgba(10,12,20,0.78)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(138,224,138,0.6)';
    ctx.fillRect(x, y, w, 1);
    drawText(ctx, title, View.w / 2, y + 5, { color: '#ffe49a', align: 'center' });
    let ly = y + 16;
    for (const [label, hint, ok] of rows) {
      drawText(ctx, (ok ? '* ' : '- ') + label, x + 9, ly, { color: ok ? '#8ae08a' : '#f4f0e0' });
      drawText(ctx, hint, x + w - 9, ly, { color: ok ? '#5a7a5a' : '#8a93b8', align: 'right' });
      ly += LINE_H;
    }
    drawText(ctx, footer, View.w / 2, y + h - 8, { color: footerCol, align: 'center' });
  }

  drawIntroCard(ctx) {
    const t = 1 - this.introT / CONFIG.timers.introCard;
    const a = t < 0.15 ? t / 0.15 : (t > 0.8 ? (1 - t) / 0.2 : 1);
    dimScreen(ctx, 0.78 * a);
    ctx.globalAlpha = a;
    const kicker = this.level.isTutorial
      ? 'BEFORE THE CLIMB'
      : 'WORLD ' + this.level.world + (this.level.world === 1 ? ' - THE CAVE' : ' - THE TOWNSHIP');
    const title = this.level.isTutorial ? this.level.name : 'LEVEL ' + this.level.id + ': ' + this.level.name;
    drawText(ctx, kicker, View.w / 2, 92, { color: '#8a93b8', align: 'center' });
    drawText(ctx, title, View.w / 2, 112, { color: '#f4f0e0', scale: 2, align: 'center' });
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
