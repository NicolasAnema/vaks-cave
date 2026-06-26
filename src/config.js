// ============================================================
// VAK'S CAVE — CONFIG
// Every gameplay tunable lives in this one object (hard rule).
// Level GEOMETRY lives in src/data/levels.js; every dial that
// changes how the game plays lives here.
// ============================================================

export const CONFIG = {
  debug: true, // coverage report + verifier on boot, debug keys, overlay

  view: { w: 480, h: 270 },

  physics: { gravity: 980, maxFall: 400 },

  player: {
    hbW: 10, hbH: 22,            // hitbox
    walkSpeed: 105,              // World 1 — deliberate
    runSpeed: 165,               // World 2 — urgent (granny must stay below)
    runAccel: 1500, runDecel: 2000,
    jumpVel: 330, jumpCutMul: 0.45,
    coyoteTime: 0.09, jumpBuffer: 0.12,
    climbSpeed: 85, ladderGrabPad: 7,
    knockbackX: 130, knockbackY: 190, stunTime: 0.4, invulnTime: 1.4,
    meowRadius: 84, meowCooldown: 1.4,
  },

  irie: { duration: 4.0, slowFactor: 0.45, jumpMul: 1.35, overstackTime: 2.0, swayAmp: 16, swayHz: 1.7 },

  // babalas: bottle-hit hangover — slower and weaker until it wears off.
  // jumpMul floor: 330*0.85 -> 40px apex, still >= MAX_UP(38) so no soft-lock.
  babalas: { time: 2.8, speedMul: 0.6, jumpMul: 0.85 },

  catEyes: { radius: 82, darkness: 0.93, lanternRadius: 48 },

  // Playback gain per channel, multiplied on top of the 0-10 sliders.
  // >1 needs Web Audio (HTMLMediaElement.volume caps at 1.0). Vaks's
  // voice notes ("sfx") punch through the music at 2x.
  // eventGain: per-event multiplier layered on sfxGain (1 = default).
  audio: { sfxGain: 3.0, musicGain: 0.75, eventGain: { jump: 0.28 } },

  mist: {
    startGap: 70,                     // mist starts this far below spawn (close — it's on you early)
    rate: { 1: 31, 2: 31, 3: 32 },    // rise px/s per level (difficulty dial)
    resetGap: 150,                    // gap below checkpoint after a death
    catchPad: 6,
    // rubber band: a fast climber can't leave the mist far behind. When the
    // mist sits more than maxLead below Vaks it hurries up (proportional, so it
    // eases back to the base rate at the threshold and never overtakes him).
    maxLead: 150, catchUpK: 1.3, catchUpMax: 170,
    dangerFracs: [0.5, 0.3, 0.16],    // gauge fractions firing danger_close_1/2/3
  },

  granny: {
    speed: { 4: 122, 5: 138, 6: 140 }, // base px/s — always < player.runSpeed (L6 at the verifier cap)
    burstMul: 1.65, burstTime: 0.8, stareTime: 0.6,
    burstEvery: { 4: 7.2, 5: 5.8, 6: 4.6 },
    faintEvery: { 4: 12.5, 5: 10.5, 6: 9 },
    faintLen:   { 4: 3.0, 5: 2.3, 6: 1.7 },
    startGap: 215, resetGap: 235, catchDist: 12,
    dangerFracs: [0.5, 0.3, 0.16],
    charmSlow: 0.85,                  // charm: gogo runs this much slower for the run
    // rubber band (same idea as the mist): when Vaks gets more than maxLead
    // ahead, gogo hurries up proportionally, capped at runSpeed-catchUpCap so a
    // flat-out runner still slowly escapes but she is always right behind.
    maxLead: 105, catchUpK: 0.9, catchUpCap: 3,
  },

  bottles: { speed: 74, interval: { 1: 3.4, 2: 2.4, 3: 1.9 }, maxActive: 9, spinHz: 6 },
  // rats: patrol their ledge, but CHARGE Vaks when he comes within aggro
  // range (chaseSpeed). Meow makes them flee. Bigger knockback than before.
  // meowScareChance: a meow only scares each in-range rat this often — some
  // rats just don't care, so the meow is a gamble (adds chaos to the climb).
  rats:    { speed: 66, fleeSpeed: 130, fleeTime: 1.7, aggroX: 92, aggroY: 26, chaseSpeed: 112, meowScareChance: 0.68, hbW: 16, hbH: 9, sizes: [1.1, 1.4, 1.7, 2.1, 2.5], knockMul: 3.4 },
  // tiko ("birds"): drift/patrol, but HOME toward Vaks within homeRange at
  // homeSpeed (kept well under walkSpeed=105 so clean play escapes). Contact
  // is still instant death — meow is the counter: it repels them (fleeSpeed).
  // fleeSpeed/fleeTime: a meow only shoves a tikolosh back a little for a short
  // moment (not a full reset) — it comes homing back, so you must meow again.
  tiko:    { irieSpeed: 26, irieBobAmp: 9, shadowSpeed: 34, shadowChase: 70, homeRange: 96, homeSpeed: 48, fleeSpeed: 78, fleeTime: 1.1, meowRadius: 120 },
  crumble: { delay: 0.55, delayByLevel: { 1: 0.4 }, respawn: 4.0, shakeAmp: 1.4 },
  sushi:   { stunTime: 0.55 },

  // township tsotsis (W2): phone snatcher (knife), gunman, viceroy pusher.
  // chaseSpeed stays below player.runSpeed — clean play always escapes.
  // Contact = GRABBED: Vaks is held in place (mash to break free) while
  // granny closes in. The hold is the punishment, not damage.
  tsotsi: {
    walkSpeed: 34, chaseSpeed: 118,
    aggroX: 140, aggroY: 42, calmX: 200,
    stunTime: 2.6, scoreStomp: 200,
    grab: {
      mash: 7,          // arrow/space presses to wrestle free
      holdMax: 3.2,     // auto-slip after this long (no soft-lock; granny punishes)
      regrabCd: 2.2,    // tsotsi can't re-grab for this long after a release
      breakHopX: 130, breakHopY: 200, // escape hop away from the grabber
    },
    knife:   { stealPerSec: 4 },  // mano drained per second while he holds Vaks
    gun:     { range: 190, fireEvery: 2.4, telegraph: 0.55, bulletSpeed: 150, bulletY: 14 },
    viceroy: { lungeMul: 1.15 },  // wriggle free of HIM and you're babalas anyway
  },

  // mano = South African Rand. Denomination -> value:
  // R2 kudu coin, R10 green note, R20 light-brown note, R50 red note,
  // R100 blue note (the current one)
  money: { values: { r2: 2, r10: 10, r20: 20, r50: 50, r100: 100 } },

  // money economy — how dense pickups are across the run. Lower = scarcer
  // mano, so the shop is a real choice instead of a guaranteed sweep.
  // (difficulty dial — read by the level builders in data/levels.js)
  economy: {
    // The chances below only shape WHERE pickups appear. The actual mano
    // total per level is governed authoritatively by levelBudget: a level
    // that overshoots is trimmed (biggest notes drop first), one that
    // undershoots is topped up (coins upgrade up the denomination ladder).
    // See normalizeMoney() in data/levels.js.
    levelBudget: { 1: 76, 2: 82, 3: 86, 4: 90, 5: 92, 6: 96 }, // mano collectable per level: fairer, fuller early game (was 50..100, too lean up front and too top-heavy)
    w1CoinChance: 0.26,   // vertical: chance a wide plank carries an R2 run (was 0.42)
    w1CoinMax: 2,         // vertical: ...of 1..this coins per run (was up to 3)
    w1NoteChance: 0.10,   // vertical: chance a plank carries a lone R10 (was 0.16)
    w1DecoyBonus: 0.28,   // vertical: chance of an extra R2 beside a decoy note (was 0.5)
    w2BreatherMax: 2,     // horizontal: ground breather coins, 1..this (was up to 4)
    w2BreatherNote: 0.12, // horizontal: chance of a stray R20 on a breather (was 0.22)
    w2RaisedNote: 0.28,   // horizontal: chance of a 2nd note on a raised run (was 0.45)
  },

  lives: { start: 3, max: 9, manoPerLife: 200 }, // every R200 EARNED = extra life

  score: {
    perRand: 5, ratStomp: 150, levelClear: 500, timeBonusPerSec: 8,
    parTime: { 1: 80, 2: 100, 3: 125, 4: 55, 5: 70, 6: 85 },
  },

  // priced to value: consumables cheap-ish, run-long upgrades premium
  shop: { prices: { life: 100, charm: 80, rattex: 60 } },

  // ability caps sold in the shop (own them for the rest of the run).
  // Priced as aspirational: with mano now scarcer, a cap is a real goal.
  hats: {
    propeller: { price: 140, jumpMul: 1.18 },   // jump higher
    beanie:    { price: 110, smashUnder: 1.5 }, // stronger: run through rats smaller than this scale
    chiefs:    { price: 180, speedMul: 1.22 },  // faster like a tikolosh (premium merch)
  },

  boss: {
    // Big Tikolosh vibe-off — properly hard: 5 fast rounds, tight timing, and it
    // creeps in fast so every miss bites.
    rounds: [ { beats: 7, bpm: 96 }, { beats: 8, bpm: 112 }, { beats: 9, bpm: 128 }, { beats: 10, bpm: 146 }, { beats: 11, bpm: 164 } ],
    hitWindow: 0.09, perfectWindow: 0.045,
    startDist: 210, catchDist: 44, advanceMiss: 66, retreatHit: 11, driftSpeed: 17,
  },

  // granny finale — a different game entirely: TEND THE PLAAS. Weeds sprout in
  // the garden plots; pull each (its key) before it overgrows. Too many
  // overgrow and gogo catches you. As hard as the vibe-off that came before.
  gardenBoss: {
    plots: 5, target: 30, angerMax: 7, maxWeeds: 4,
    sproutStart: 1.1, sproutEnd: 0.42,   // seconds between sprouts (eases down with progress)
    growStart: 1.45, growEnd: 0.8,       // seconds for a weed to overgrow (eases down)
  },

  camera: { lerp: 6, lookUp: 36, lookAhead: 48, shakeDecay: 9 },

  barks: {
    bubbleMaxW: 132,
    holdBase: 1.1, holdPerChar: 0.045,
    charsPerSec: { slow: 13, normal: 26, fast: 44 },
    defaultCooldown: 6,
    cooldown: {
      idle_checkin: 16, menu_idle: 14, meow: 2.4, shop_browse: 4,
      hazard_warning: 9, rat_appear: 7, danger_close_1: 6, danger_close_2: 6, danger_close_3: 6,
    },
  },

  timers: {
    idleAfter: 8, menuIdleAfter: 9,
    rareBarkMin: 26, rareBarkMax: 50,
    glitchMin: 40, glitchMax: 75, glitchLen: 0.55,
    loading: 1.7, introCard: 2.4,
  },

  fx: { hitStop: 0.08, shakeImpact: 3, shakeBurst: 2.4 },
};

// Derived physics facts (used by gameplay AND the completability verifier,
// so the math that builds levels is the math that checks them).
export function jumpStats(speed) {
  const v = CONFIG.player.jumpVel, g = CONFIG.physics.gravity;
  const h = (v * v) / (2 * g);          // apex height
  const t = (2 * v) / g;                // full-arc air time
  return { maxJumpH: h, airTime: t, maxJumpDist: speed * t };
}
