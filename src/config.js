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

  irie: { duration: 4.0, slowFactor: 0.45, overstackTime: 2.0, swayAmp: 16, swayHz: 1.7 },

  catEyes: { radius: 82, darkness: 0.93, lanternRadius: 48 },

  mist: {
    startGap: 240,                    // mist starts this far below spawn
    rate: { 1: 16, 2: 24, 3: 30 },    // rise px/s per level (difficulty dial)
    resetGap: 215,                    // gap below checkpoint after a death
    catchPad: 6,
    dangerFracs: [0.5, 0.3, 0.16],    // gauge fractions firing danger_close_1/2/3
  },

  granny: {
    speed: { 4: 96, 5: 114, 6: 130 }, // base px/s — always < player.runSpeed
    burstMul: 1.6, burstTime: 0.75, stareTime: 0.65,
    burstEvery: { 4: 8.5, 5: 7, 6: 5.5 },
    faintEvery: { 4: 11, 5: 9, 6: 7.5 },
    faintLen:   { 4: 3.6, 5: 2.8, 6: 2.1 },
    startGap: 215, resetGap: 235, catchDist: 12,
    dangerFracs: [0.5, 0.3, 0.16],
    charmBonus: 2.2,                  // faint charm: extra seconds on next faint
  },

  bottles: { speed: 62, interval: { 1: 4.8, 2: 3.4, 3: 2.8 }, maxActive: 6, spinHz: 6 },
  rats:    { speed: 36, fleeSpeed: 115, fleeTime: 1.7 },
  tiko:    { irieSpeed: 26, irieBobAmp: 9, shadowSpeed: 34 },
  crumble: { delay: 0.55, respawn: 4.0, shakeAmp: 1.4 },
  sushi:   { stunTime: 0.55 },

  lives: { start: 3, max: 9, ceppiesPerLife: 25 },

  score: {
    ceppy: 100, crystal: 50, ratStomp: 150, levelClear: 500, timeBonusPerSec: 8,
    parTime: { 1: 80, 2: 100, 3: 125, 4: 55, 5: 70, 6: 85 },
  },

  shop: { prices: { life: 24, irie: 14, charm: 18 }, ceppyValue: 2 },

  boss: {
    rounds: [ { beats: 4, bpm: 58 }, { beats: 5, bpm: 70 }, { beats: 6, bpm: 82 } ],
    hitWindow: 0.18, perfectWindow: 0.07,
    startDist: 210, catchDist: 42, advanceMiss: 30, retreatHit: 12, driftSpeed: 5,
  },

  camera: { lerp: 6, lookUp: 36, lookAhead: 48, shakeDecay: 9 },

  barks: {
    bubbleMaxW: 132,
    holdBase: 1.1, holdPerChar: 0.045,
    charsPerSec: { slow: 13, normal: 26, fast: 44 },
    defaultCooldown: 6,
    cooldown: {
      idle_checkin: 16, menu_idle: 14, meow: 2.4,
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
