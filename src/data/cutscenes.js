// ============================================================
// CUTSCENE SCRIPTS — pure data. Each scene: backdrop, staged
// actors, and a list of timed commands the cutscene player
// executes. 'say' lines starting with m_ are manifest rows
// (typewriter dialogue + the row's audio event); other strings
// are staging dialogue. Every scene skips with Enter and
// unlocks in the gallery.
// ============================================================

export const CUTSCENES = {

  cold_open: {
    id: 'cold_open', name: 'COLD OPEN', music: 'darkcave', bg: 'cave_floor', noSkip: true,
    actors: {
      vaks: { sheet: 'vaks_sleep', anim: 'loop', x: 210, y: 218, flip: false },
      tiko: { sheet: 'tiko', anim: 'loop', x: -80, y: 244, flip: false }, // offscreen until the jump scare
      // last night's dead soldiers, scattered around the sleeper (frame 0 = upright)
      bot1: { sheet: 'bottle', anim: 0, x: 178, y: 219, flip: false },
      bot2: { sheet: 'bottle', anim: 0, x: 258, y: 219, flip: false },
      bot3: { sheet: 'bottle', anim: 0, x: 300, y: 219, flip: false },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 1.4],
      ['fx', 'zzz', 2.4],
      ['note', 'VAKS SLEPT PEACEFULLY AT THE BOTTOM OF A CAVE.'],
      ['note', 'ONE TOO MANY ZAMALEKS LAST NIGHT.'],
      ['wait', 0.9],
      // wakes, hauls himself up, paces in a hungover panic
      ['sprite', 'vaks', 'vaks', 'babalas'],
      ['move', 'vaks', 226, 218, 0.5],
      ['move', 'vaks', 196, 218, 0.5],
      ['move', 'vaks', 236, 218, 0.6],
      ['say', 'vaks', 'SHO. THIS IS NOT MY ROOM, BOSS. SE MISTAKE.'],
      // GRANNY CALLING — staged as an incoming-call frame, then declined
      ['sfx', 'alert'],
      ['shake', 2.5],
      ['sfx', 'alert'],
      ['shake', 2],
      ['note', 'GRANNY CALLING...'],
      ['say', 'vaks', 'NOT NOW, BOSS. NOT NOW.'],
      // he records a voice note instead — the locked LISTEN box is the joke
      ['voice_note', 'vaks', 'm_big_days'],
      // JUMP SCARE — the small tikolosh rushes in from offscreen right
      ['teleport', 'tiko', 560, 240],
      ['move', 'tiko', 288, 240, 0.35],
      ['flash', '#fff8e0', 0.4],
      ['shake', 3],
      ['sfx', 'hazard_warning'],
      ['face', 'vaks', 1],
      ['say', 'tiko', 'YOU MAY BE DIE BAAS VAN DIE PLAAS. BUT EK IS DIE BAAS VAN DIE CAVE.'],
      ['say', 'vaks', "HAIBO, WENA. I'LL MOER YOU."],
      // scrambles back, knocks a bottle rolling — the cave answers
      ['move', 'vaks', 150, 218, 0.4],
      ['move', 'bot1', 148, 221, 0.25],
      ['sfx', 'glass_break'],
      ['shake', 2.5],
      ['fx', 'mistStir', 1.6],
      ['wire', 'm_going_deep'],
      ['note', 'BELOW: THE CAVE RUMBLES. THE GROUND SHAKES.'],
      ['say', 'vaks', 'YOH... WE CLIMB, BOSS. WE CLIMB NOW.'],
      // runs to the wall and starts climbing as it fades
      ['move', 'vaks', 44, 220, 0.8],
      ['sprite', 'vaks', 'vaks', 'climb'],
      ['fade', 'out', 0.9],
    ],
  },

  hole_wall: {
    id: 'hole_wall', name: 'THE HOLE IN THE WALL', music: 'darkcave', bg: 'shop_nook',
    actors: {
      vaks:  { sheet: 'vaks', anim: 'idle', x: 70, y: 268, flip: false },
      spaza: { sheet: 'tiko_shop', anim: 'loop', x: 360, y: 238, flip: true },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.8],
      // Vaks hauls onto the ledge from the bottom-left edge, wheezing
      ['sprite', 'vaks', 'vaks', 'climb'],
      ['move', 'vaks', 118, 236, 1.0],
      ['sprite', 'vaks', 'vaks', 'babalas'],
      ['move', 'vaks', 176, 236, 0.8],
      ['note', 'A HAND-PAINTED SIGN: "SMOKING ALLOWED IN THE SHOP. ONLY IF YOU OFFER ME."'],
      ['say', 'spaza', 'AWEH. A CUSTOMER.'],
      // Vaks screams, jumps back, half-hides at the frame edge
      ['flash', '#fff8e0', 0.3],
      ['sfx', 'hazard_warning'],
      ['shake', 2.5],
      ['move', 'vaks', 92, 236, 0.3],
      ['face', 'vaks', 1],
      // lights a cigarette with shaking hands (babalas read + a spark)
      ['fx', 'sparkle', 0.6, 92, 222],
      ['wait', 0.7],
      ['say', 'spaza', "SIGN SAYS YOU OFFER ME ONE, BOSS. AND WHY YOU SCREAMING? I'M THE ONE WHO SHOULD SCREAM. LOOK AT YOU."],
      // spaza taps the sign
      ['fx', 'sparkle', 0.4, 180, 50],
      ['say', 'vaks', '...YOU LOOK LIKE A TIKOLOSH.'],
      ['say', 'spaza', "NO, MAN. I'M A BUSINESSMAN. BIG DIFFERENCE."],
      ['say', 'spaza', 'YOU BUYING OR BROWSING BHUTI?'],
      // creeps forward toward the counter, step by step
      ['move', 'vaks', 138, 236, 0.5],
      ['say', 'vaks', '...HOW MUCH FOR THE CEPPIE?'],
      ['move', 'vaks', 178, 236, 0.5],
      ['say', 'spaza', 'HUNDRED MANO.'],
      ['say', 'vaks', "YOH THAT'S A LOT OF MANO?!"],
      ['move', 'vaks', 224, 236, 0.5],
      ['say', 'vaks', '...THIS BETTER BE WORTH IT.'],
      ['say', 'spaza', "THAT OTHER TIKOLOSH IS THE ONE YOU NEED TO WORRY ABOUT. IT'S A LONG WAY UP BHUTI. SHOP SMARTLY."],
      ['fade', 'out', 0.7],
    ],
  },

  green_lung: {
    id: 'green_lung', name: 'THE GREEN LUNG', music: 'darkcave', bg: 'shop_nook',
    actors: {
      vaks:  { sheet: 'vaks', anim: 'idle', x: 200, y: 236, flip: false },
      spaza: { sheet: 'tiko_shop', anim: 'loop', x: 340, y: 238, flip: true },
      tiko:  { sheet: 'tiko', anim: 'loop', x: -80, y: 246, flip: false }, // peeks from a rock at the edge
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.8],
      ['note', 'VAKS PACKS HIS BUYS. SPAZA LEANS ON THE COUNTER.'],
      ['say', 'spaza', "UP FROM HERE IS YOUR GARDEN, MY BOSS. THE AIR UP THERE IS HEAVY. YOU DON'T WALK IT SOBER."],
      // the joint slides across the counter into Vaks's hand
      ['fx', 'sparkle', 0.4, 300, 240],
      ['sfx', 'shop_buy'],
      ['fx', 'sparkle', 0.4, 244, 240],
      ['sfx', 'shop_buy'],
      ['fx', 'sparkle', 0.6, 200, 222],
      ['say', 'spaza', "FIRST ONE'S ON THE HOUSE."],
      ['say', 'vaks', "YOU MUST KNOW DANKO. JAH PROVIDES. IT'S TIME TO PRAY."],
      // the tikolosh peeks in at the frame edge, then ducks when Vaks turns
      ['teleport', 'tiko', 42, 246],
      ['wait', 0.8],
      ['face', 'vaks', -1],
      ['show', 'tiko', false],
      ['wait', 0.5],
      ['face', 'vaks', 1],
      // the garden above: green haze, Vaks climbs off the top of frame
      ['bgset', 'cave_ganja'],
      ['fx', 'mistStir', 1.4],
      ['fx', 'sparkle', 0.5, 200, 210],
      ['sprite', 'vaks', 'vaks', 'climb'],
      ['say', 'vaks', 'SALA KAKHULE MY BOSS.'],
      ['move', 'vaks', 200, -24, 1.2],
      // the tikolosh creeps back out and watches him climb away — quiet, hopeful
      ['show', 'tiko', true],
      ['move', 'tiko', 120, 246, 0.9],
      ['wait', 0.6],
      ['say', 'tiko', '...MY BOSS.'],
      ['wait', 0.5],
      ['fade', 'out', 0.7],
    ],
  },

  follower: {
    id: 'follower', name: 'THE FOLLOWER', music: 'darkcave', bg: 'cave_ganja',
    actors: {
      vaks: { sheet: 'vaks', anim: 'idle', x: 210, y: 220, flip: false },
      tiko: { sheet: 'tiko', anim: 'loop', x: 400, y: 198, flip: true }, // waving from the top
      // a rising trail of coins up the wall
      c1: { sheet: 'ceppy', anim: 0, x: 252, y: 216, flip: false },
      c2: { sheet: 'ceppy', anim: 0, x: 290, y: 210, flip: false },
      c3: { sheet: 'ceppy', anim: 0, x: 330, y: 206, flip: false },
      c4: { sheet: 'ceppy', anim: 0, x: 366, y: 202, flip: false },
      c5: { sheet: 'ceppy', anim: 0, x: 398, y: 200, flip: false },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.8],
      ['say', 'vaks', "YOH BOSS I'M RICHH."],
      ['note', 'A TRAIL OF COINS. SOMETHING AT THE TOP, WAVING.'],
      ['say', 'tiko', 'JY BOSS!'],
      // THE SNATCH — it races down the trail, each coin winks out
      ['move', 'tiko', 398, 200, 0.2],
      ['show', 'c5', false], ['fx', 'sparkle', 0.2, 398, 200], ['sfx', 'shop_buy'],
      ['move', 'tiko', 366, 204, 0.15],
      ['show', 'c4', false], ['fx', 'sparkle', 0.2, 366, 202], ['sfx', 'shop_buy'],
      ['move', 'tiko', 330, 208, 0.15],
      ['show', 'c3', false], ['fx', 'sparkle', 0.2, 330, 206], ['sfx', 'shop_buy'],
      ['move', 'tiko', 290, 212, 0.15],
      ['show', 'c2', false], ['fx', 'sparkle', 0.2, 290, 210], ['sfx', 'shop_buy'],
      ['move', 'tiko', 252, 218, 0.15],
      ['show', 'c1', false], ['fx', 'sparkle', 0.2, 252, 216], ['sfx', 'tsotsi_grab'],
      // hugs the whole pile and races back to the top
      ['move', 'tiko', 400, 198, 0.5],
      ['say', 'vaks', 'NO MAN. THIS BLOODY TIKOLOSH IS A TSOTSI.'],
      // Vaks chases two steps and stops dead
      ['move', 'vaks', 250, 220, 0.4],
      ['move', 'vaks', 272, 220, 0.35],
      ['say', 'tiko', 'BOSS! BOSS!'],
      ['say', 'vaks', 'DON\'T "MY BOSS" ME. I\'M WATCHING YOU.'],
      // the mock-off — Vaks shouts, the tiko mirrors, cackling
      ['anim', 'vaks', 'celeb'],
      ['shake', 1],
      ['say', 'tiko', '"I\'M WATCHING YOU! I\'M WATCHING YOU!"'],
      ['shake', 1],
      ['anim', 'vaks', 'idle'],
      ['shake', 2],
      ['say', 'vaks', 'SIYAHAMBA NGOKU MEFTU.'],
      ['anim', 'vaks', 'run'],
      ['move', 'vaks', 540, 220, 1.0],
      ['fade', 'out', 0.7],
    ],
  },

  load_shedding: {
    id: 'load_shedding', name: 'LOAD SHEDDING', music: 'darkcave', bg: 'cave_deep',
    actors: {
      vaks: { sheet: 'vaks', anim: 'idle', x: 230, y: 222, flip: false },
      tiko: { sheet: 'tiko', anim: 'loop', x: -80, y: 240, flip: false }, // approaches from the dark
      // the chain of lanterns along the wall — the only light
      l1: { sheet: 'lantern', anim: 'loop', x: 70, y: 132, flip: false },
      l2: { sheet: 'lantern', anim: 'loop', x: 150, y: 120, flip: false },
      l3: { sheet: 'lantern', anim: 'loop', x: 230, y: 126, flip: false },
      l4: { sheet: 'lantern', anim: 'loop', x: 310, y: 120, flip: false },
      l5: { sheet: 'lantern', anim: 'loop', x: 390, y: 132, flip: false },
      tl: { sheet: 'lantern', anim: 'loop', x: 600, y: 236, flip: false }, // the tiko's little lantern
      bot: { sheet: 'bottle', anim: 0, x: 600, y: 205, flip: false },      // the thrown zamalek
      stick: { sheet: 'rake', anim: 0, x: 222, y: 222, flip: false },      // the lucky stick, in hand
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.8],
      ['note', 'DEEPER. A CHAIN OF LANTERNS. THE ONLY LIGHT.'],
      // he brandishes the lucky stick as he shouts
      ['move', 'stick', 222, 214, 0.2],
      ['move', 'stick', 222, 222, 0.2],
      ['say', 'vaks', "WHO'S THERE! I'LL MOER YOU WITH MY LUCKY STICK."],
      // the tiko comes SLOWLY out of the dark right, then LUNGES
      ['teleport', 'tiko', 540, 240],
      ['move', 'tiko', 360, 240, 2.4],
      ['flash', '#fff8e0', 0.4],
      ['shake', 2.5],
      ['sfx', 'hazard_warning'],
      ['move', 'tiko', 300, 240, 0.25],
      ['say', 'tiko', 'MY BOSS! LIGHT, MY BOSS!'],
      ['say', 'vaks', 'JY STAY BACK, WENA!'],
      // Vaks hurls his zamalek — it arcs across, misses, hits the chain
      ['teleport', 'bot', 230, 205],
      ['face', 'vaks', 1],
      ['move', 'bot', 330, 116, 0.35],
      ['move', 'bot', 392, 122, 0.3],
      ['sfx', 'glass_break'],
      ['flash', '#ffffff', 0.4],
      ['show', 'bot', false],
      // THE LANTERNS DIE ONE BY ONE — the load-shedding money shot
      ['show', 'l5', false], ['wait', 0.3],
      ['show', 'l4', false], ['wait', 0.3],
      ['show', 'l3', false], ['wait', 0.3],
      ['show', 'l2', false], ['wait', 0.3],
      ['show', 'l1', false], ['wait', 0.3],
      ['bgset', 'black'],
      ['wait', 0.9],
      ['wait', 0.9],
      ['note', 'EISH.'],
      // the tiko's little lantern flickers and dies
      ['teleport', 'tl', 300, 236],
      ['show', 'tl', true], ['wait', 0.3],
      ['show', 'tl', false], ['wait', 0.3],
      ['show', 'tl', true], ['wait', 0.3],
      ['show', 'tl', false], ['wait', 0.3],
      ['say', 'tiko', '...MY BOSS.'],
      // Vaks's cat eyes light the dark
      ['bgset', 'cave_deep'],
      ['fx', 'sparkle', 0.3, 236, 200],
      ['fx', 'sparkle', 0.3, 246, 200],
      ['say', 'vaks', 'GOOD THING VAKS IS HALF CAT.'],
      ['say', 'vaks', 'FINAL LEVEL, BOSS. WE CLIMB. NOW IN THE DARK.'],
      ['fade', 'out', 0.7],
    ],
  },

  boss_intro: {
    id: 'boss_intro', name: 'THE CAVE MOUTH', music: 'boss', bg: 'cave_mouth',
    actors: {
      vaks:  { sheet: 'vaks', anim: 'idle', x: 360, y: 226, flip: true },
      spaza: { sheet: 'tiko_shop', anim: 'loop', x: 440, y: 230, flip: true }, // strolls in
      big:   { sheet: 'tiko_big', anim: 'loop', x: -80, y: 240, flip: true, scale: 3 },
      t1:    { sheet: 'tiko', anim: 'loop', x: 40, y: 251, flip: false },       // the queue
      t2:    { sheet: 'tiko', anim: 'loop', x: 74, y: 251, flip: false },
      t3:    { sheet: 'tiko', anim: 'loop', x: 108, y: 251, flip: false },
      t4:    { sheet: 'tiko', anim: 'loop', x: 142, y: 251, flip: false },
      t5:    { sheet: 'tiko', anim: 'loop', x: 176, y: 251, flip: false },
      tiko:  { sheet: 'tiko', anim: 'loop', x: 210, y: 251, flip: false }, // the fan, front row
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.8],
      ['note', 'THE TOP OF THE CAVE. ALMOST OUT.'],
      ['say', 'vaks', 'THIS IS THE END, BOSS.'],
      // the tikoloshes file in from both edges to a seated row
      ['teleport', 't1', -40, 251], ['move', 't1', 40, 251, 0.6],
      ['teleport', 't2', 540, 251], ['move', 't2', 176, 251, 0.7],
      ['teleport', 't3', -40, 251], ['move', 't3', 74, 251, 0.6],
      ['teleport', 't4', 540, 251], ['move', 't4', 142, 251, 0.7],
      ['teleport', 't5', -40, 251], ['move', 't5', 108, 251, 0.7],
      // spaza strolls in slow from the left
      ['teleport', 'spaza', -40, 230],
      ['move', 'spaza', 300, 230, 1.6],
      ['say', 'spaza', "THEY'RE NOT HUNTING, MY BRA. THEY'RE QUEUEING."],
      ['say', 'vaks', 'QUEUEING FOR WHAT?'],
      ['say', 'spaza', 'THE BOSS LEVEL.'],
      // the Big One rises from below, the shake building as he climbs
      ['teleport', 'big', 150, 340],
      ['sfx', 'boss_vibe'],
      ['shake', 2],
      ['move', 'big', 150, 300, 0.8],
      ['shake', 3],
      ['move', 'big', 150, 270, 0.8],
      ['shake', 4],
      ['move', 'big', 150, 238, 0.9],
      ['flash', '#fff8e0', 0.4],
      ['shake', 5],
      ['say', 'spaza', 'HE JUST WANTS TO VIBE.'],
      // front row: the little tikolosh loses his mind, a proud fan
      ['teleport', 'tiko', 210, 251],
      ['move', 'tiko', 210, 243, 0.15],
      ['move', 'tiko', 210, 251, 0.15],
      ['move', 'tiko', 210, 243, 0.15],
      ['move', 'tiko', 210, 251, 0.15],
      ['say', 'tiko', "THAT'S MY BOSS! THAT'S MY BOSS!!"],
      ['say', 'vaks', 'THE VIBE? BOSS... I ONLY KNOW ONE MOVE.'],
      ['wire', 'm_vibe'],    // the vibe-off row keeps its scene home (audio fires in the fight)
      ['wire', 'm_cat_die'], // rehomed: this was boss_intro's only reference
      ['say', 'spaza', 'THEN DALA, MY BRA. DALA WHAT YOU MUST.'],
      ['move', 'vaks', 320, 226, 0.8],
      ['note', 'VAKS PLANTS HIS FEET. THE CROWD GOES QUIET.'],
      ['music', null],
      ['fade', 'out', 0.6],
    ],
  },

  boss_resolve: {
    id: 'boss_resolve', name: "IT'S LIKE THE WIND", music: 'ascend', bg: 'cave_mouth_dawn',
    actors: {
      vaks: { sheet: 'vaks', anim: 'idle', x: 300, y: 226, flip: true },
      big:  { sheet: 'tiko_big', anim: 'loop', x: 150, y: 238, flip: false, scale: 3 },
      tiko: { sheet: 'tiko', anim: 'loop', x: -80, y: 246, flip: false }, // slides in between them
      coin: { sheet: 'ceppy', anim: 0, x: -40, y: 230, flip: false },     // the mano handed back
    },
    steps: [
      ['show', 'coin', false],
      ['letterbox', true],
      ['fade', 'in', 1.2],
      ['face', 'vaks', -1],
      ['face', 'big', 1],
      ['say', 'vaks', 'OH, YOU WANT TO GO? WENA? IN YOUR OWN CAVE?'],
      // the dance battle — trading stamps
      ['move', 'big', 200, 238, 0.6],
      ['shake', 4],                    // the Big One stamps
      ['anim', 'vaks', 'celeb'],
      ['shake', 2],                    // Vaks stamps back
      ['note', 'VAKS STAMPS BACK. THE SMALL ONES GO OOH.'],
      // circling — Vaks arcs around the Big One
      ['move', 'vaks', 150, 232, 0.7], ['face', 'vaks', 1],
      ['move', 'vaks', 110, 226, 0.6], ['face', 'vaks', 1],
      // faster and faster trades
      ['shake', 3], ['wait', 0.4],
      ['shake', 2], ['wait', 0.3],
      ['shake', 3], ['wait', 0.25],
      // THE SYNC — the same move, the same beat, then they freeze
      ['anim', 'vaks', 'celeb'],
      ['say', 'vaks', "...EY. THAT'S MY MOVE."],
      ['anim', 'vaks', 'celeb'],
      ['flash', '#fff8e0', 0.4],
      ['wait', 1.2],
      ['fx', 'sparkle', 0.6],
      ['note', 'THE BEAT LOCKS. THE WHOLE CAVE SWAYS.'],
      // the locked groove: confetti, and a tiny one slides in between them
      ['fx', 'confetti', 2.0],
      ['teleport', 'tiko', 250, 244],
      ['shake', 1],
      // the music drops out; only the wind
      ['music', null],
      ['fx', 'wind', 2.5],
      ['wait', 1.2],
      ['say', 'vaks', 'm_wind', "...IT'S LIKE THE WIND, BOSS."],
      ['wire', 'm_wind_malawi'], // preserve the boss-resolution follow-up row
      // the tsotsi gives it all back — a coin passed to Vaks
      ['fx', 'sparkle', 0.4, 250, 230],
      ['say', 'tiko', 'MY BOSS.'],
      ['teleport', 'coin', 250, 230],
      ['show', 'coin', true],
      ['move', 'coin', 290, 226, 0.5],
      ['sfx', 'shop_buy'],
      ['show', 'coin', false],
      ['say', 'vaks', '...KEEP HALF. YOU EARNED IT, TSOTSI.'],
      // the Big One points at the dawn
      ['move', 'big', 90, 238, 1.0],
      ['face', 'big', -1],
      ['note', 'THE BIG ONE POINTS ONE HUGE ARM AT THE DAWN.'],
      ['fx', 'dawn', 2.0],
      ['say', 'vaks', '...OK, BOSS. WE GO BEFORE YOU CHANGE YOUR MIND.'],
      // Vaks walks into the light
      ['move', 'vaks', 380, 226, 1.2],
      ['sfx', 'alert'],                // the phone buzzing again — granny
      ['say', 'vaks', 'THE SUN. THE SUN IS UP, BOSS. GRANNY...'],
      ['fade', 'out', 0.6],
    ],
  },

  chase_begins: {
    // Township Scent plays the whole scene (Township Riddem takes over in L4-L6).
    // Granny NEVER shows up in person — she strikes through the family WhatsApp
    // group, her message firing alert.mp3 and rattling the handset. Then it's a
    // runner: Vaks records a voice note and bolts.
    id: 'chase_begins', name: 'ONE FOR THE ROAD', music: 'township', bg: 'ridge',
    actors: {
      vaks:  { sheet: 'vaks', anim: 'idle', x: 210, y: 230, flip: false },
      imo:   { sheet: 'imo', anim: 'idle', x: 60, y: 233, flip: false },   // the small boy
      masi:  { sheet: 'masi', anim: 'idle', x: 108, y: 232, flip: false },  // the fat one
      rasta: { sheet: 'rasta', anim: 'idle', x: 314, y: 232, flip: true },  // dreads + tam
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 1.0],
      ['note', 'OUT OF THE CAVE. STRAIGHT INTO THE DRINK CREW.'],
      ['say', 'masi', 'EYTA VAKS! YOU MADE IT OUT, MY BRA! SIT! DRINK! MWAHAHA!'],
      ['say', 'rasta', 'IRIE, BREDREN. DOWN THIS ONE WITH I AND I. JAH BLESS.'],
      ['say', 'imo', 'CAN I HAVE SAVANNA, BHUTI VAKS? AND NDICELA KFC!'],
      ['say', 'vaks', "NO MAN, BOSS. MY GRANNY IS WAITING. SHE'S GOING TO MOER ME INTO NEXT WEEK."],
      ['say', 'masi', "ONE FOR THE ROAD, BRA. IT'S TRADITION. IT'S THE LAW."],
      // Vaks steps over to Masi and caves — the tipsy hit
      ['move', 'vaks', 132, 230, 0.8],
      ['shake', 2.6],
      ['flash', '#ffd86a', 0.5],
      ['sprite', 'vaks', 'vaks', 'babalas'],
      ['note', 'VAKS TAKES A HUGE SIP. THE WHOLE RIDGE TILTS.'],
      ['wait', 0.5],
      // the drunk wobble
      ['move', 'vaks', 146, 230, 0.3],
      ['move', 'vaks', 128, 230, 0.3],
      ['sprite', 'vaks', 'vaks', 'idle'],
      ['say', 'vaks', 'WAIT. WAIT. I NEED TO DO SOMETHING.'],
      // the crew leans in
      ['move', 'imo', 96, 233, 0.4],
      ['move', 'masi', 120, 232, 0.4],
      ['move', 'rasta', 300, 232, 0.4],
      // he pulls up the family group and records a voice note
      ['phone', true],
      ['say', 'vaks', "GRANNY. IT'S VAKS. VIBE WITH ME, GRANNY."],
      ['chat', 'sys', 'GRANNY IS TYPING...'],
      ['wait', 1.5],
      ['chat', 'granny', 'WHERE ARE YOU VAKS. HOME. NOW.', 'alert'],
      ['wait', 0.9],
      ['phone', false],
      ['say', 'vaks', 'm_coming_boss', "SHIT... I'M COMING BOSS I'M COMING BOSS I'M COMING BOSSSS."],
      // Vaks bolts, the crew scrambling after him — the handoff into L4
      ['anim', 'vaks', 'run'],
      ['move', 'vaks', 540, 228, 1.0],
      ['move', 'masi', 560, 230, 0.9],
      ['move', 'imo', 560, 232, 0.8],
      ['move', 'rasta', 560, 230, 1.0],
      ['fade', 'out', 0.7],
    ],
  },

  // S9 — spaza window. Vetkoek (the shopkeeper body) fronts a debt-economy gag
  // with Tallman & Shorty, then warns Vaks about the tsotsis and taxis ahead.
  babalas_economics: {
    id: 'babalas_economics', name: 'BABALAS ECONOMICS', music: 'township', bg: 'spaza_street',
    actors: {
      vaks:    { sheet: 'vaks', anim: 'idle', x: 150, y: 236, flip: false },
      vetkoek: { sheet: 'tiko_shop', anim: 'loop', x: 372, y: 238, flip: true },
      tallman: { sheet: 'tallman', anim: 'idle', x: 540, y: 226, flip: true },
      shorty:  { sheet: 'shorty', anim: 'idle', x: 566, y: 232, flip: true },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.8],
      ['move', 'vaks', 214, 236, 1.0],
      ['say', 'vetkoek', 'AWEH. YOU MUST BE THE VAKS.'],
      ['say', 'vaks', '...WHAT IS THIS PLACE?'],
      ['note', 'TALLMAN AND SHORTY SLIDE IN.'],
      // the two of them slide in, casual, overlapping
      ['move', 'tallman', 300, 226, 1.0],
      ['move', 'shorty', 336, 232, 1.1],
      ['say', 'tallman', 'VAKS! MY BRA! LOOKING STRONG! LOOKING FAST!'],
      ['say', 'vaks', "TALLMAN. YOU OWE ME. WHERE'S MY FIFTY RAND. NO STORIES."],
      ['say', 'tallman', 'MONTH END, BRA. MONTH END. YIMA BHUTI.'],
      ['say', 'vaks', "IT'S BEEN MONTH END SINCE FEBRUARY, BOSS."],
      ['face', 'shorty', 1],
      ['say', 'shorty', "I'LL EFT YOU."],
      // Shorty bolts off, cackling
      ['move', 'shorty', 600, 232, 1.0],
      ['shake', 1],
      ['say', 'vetkoek', 'BEWARE OF THE TSOTSIS, MY BOSS. AND TAXIS - REMEMBER THEY OWN THE ROAD.'],
      // a distant hooter — Vaks flinches
      ['sfx', 'granny_chase_start', 'horn'],
      ['shake', 1.5],
      ['say', 'vaks', 'SHAP. EK IS DIE BAAS REMEMBER. VAKS ALWAYS HAS RIGHT OF WAY.'],
      // exits frame right on his last word
      ['anim', 'vaks', 'run'],
      ['move', 'vaks', 560, 236, 1.0],
      ['fade', 'out', 0.7],
    ],
  },

  // S10 — a quiet corner. 74 unread, granny spamming, the crew "helping", and a
  // tsotsi in the alley eyeing the phone. Vaks swears by the phone.
  airtime: {
    id: 'airtime', name: 'AIRTIME', music: 'township', bg: 'spaza_street',
    actors: {
      vaks:    { sheet: 'vaks', anim: 'idle', x: 220, y: 230, flip: false },
      tsotsi:  { sheet: 'tsotsi_knife', anim: 'idle', x: -60, y: 236, flip: false },
      vetkoek: { sheet: 'tiko_shop', anim: 'loop', x: 372, y: 238, flip: true }, // leans from the hatch
    },
    steps: [
      ['show', 'vetkoek', false],
      ['letterbox', true],
      ['fade', 'in', 0.8],
      ['note', 'A QUIET CORNER BETWEEN THE SHACKS. THE PHONE IS ON 2%.'],
      ['sfx', 'alert'], // the 2% look
      ['phone', true],
      ['chat', 'sys', '74 UNREAD'],
      ['chat', 'granny', 'where are you'],
      ['chat', 'granny', 'where are you'],
      ['chat', 'granny', 'WHERE ARE YOU'],
      ['chat', 'tallman', "he's coming granny. i saw him. very fast. like a bullet."],
      ['chat', 'shorty', 'i saw him by the shebeen'],
      ['chat', 'vaks', 'SHORTY YOU SNAKE.'],
      ['wait', 0.8],
      ['phone', false],
      // an alley silhouette watching the phone — it takes one slow step closer
      ['teleport', 'tsotsi', 20, 236],
      ['shake', 1.2],
      ['note', 'IN THE ALLEY, SOMETHING WATCHES THE PHONE.'],
      ['move', 'tsotsi', 52, 236, 1.4],
      // Vetkoek leans out from the hatch
      ['show', 'vetkoek', true],
      ['say', 'vetkoek', 'HOLD THAT PHONE TIGHT ON THE HOME STRETCH, MY BOSS.'],
      ['say', 'vaks', 'LET THEM TRY, BOSS. THIS PHONE IS MY WHOLE FAMILY.'],
      ['say', 'vaks', "...AND IF IT BREAKS, SHORTY'S BUYING ME A NEW ONE."],
      // pockets the phone and walks off
      ['fx', 'sparkle', 0.3, 220, 222],
      ['anim', 'vaks', 'run'],
      ['move', 'vaks', 560, 230, 1.0],
      ['fade', 'out', 0.7],
    ],
  },

  // ---- SIDE SCENES (mid-level breathers; M.push overlay, no music) ----

  // SS1 (L4) — the crew's live match commentary in the group chat, granny
  // typing then nothing, and the bottles clink as the chase resumes.
  ss_commentary: {
    id: 'ss_commentary', name: 'THE COMMENTARY', bg: 'ridge',
    actors: {
      vaks: { sheet: 'vaks', anim: 'idle', x: 220, y: 230, flip: false },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.5],
      ['note', 'VAKS BENDS OVER, CATCHING HIS BREATH. THE PHONE BUZZES.'],
      ['phone', true],
      ['chat', 'tallman', "granny relax, he's coming. i can see him from the roof. he's looking strong and irie."],
      ['chat', 'shorty', 'also just saw him, he jumped a fence and did a backflip. 8/10. small wobble on the landing.'],
      ['chat', 'sys', 'GRANNY IS TYPING...'],
      ['wait', 1.6],
      ['chat', 'sys', '...'],
      ['wait', 0.8],
      ['phone', false],
      ['say', 'vaks', 'm_granny_spy', "JY GRANNY'S SPYING ON ME."],
      ['sfx', 'glass_break'],
      ['shake', 1.6],
      ['note', 'BOTTLES CLINK OFFSCREEN.'],
      ['say', 'vaks', 'NDIYABALEKA BOSS.'],
      ['fade', 'out', 0.5],
    ],
  },

  // SS2 (L5) — the crew flag the taxi and try to pay Vaks's fare in 5c coins.
  // A tikolosh rides the roof, waving.
  ss_small_change: {
    id: 'ss_small_change', name: 'SMALL CHANGE', bg: 'ridge',
    actors: {
      vaks:    { sheet: 'vaks', anim: 'idle', x: 200, y: 230, flip: false },
      taxi:    { sheet: 'taxi', anim: 'loop', x: 404, y: 234, flip: true },
      tallman: { sheet: 'tallman', anim: 'idle', x: 300, y: 226, flip: true },
      shorty:  { sheet: 'shorty', anim: 'idle', x: 336, y: 232, flip: true },
      tiko:    { sheet: 'tiko', anim: 'loop', x: 404, y: 206, flip: true },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.5],
      ['sfx', 'granny_chase_start', 'horn'],
      ['shake', 2.0],
      ['note', 'A HOOTER BLARES. TALLMAN AND SHORTY STEP INTO THE ROAD AND FLAG THE TAXI.'],
      ['say', 'tallman', "GO, BRA. WE'LL HANDLE THIS. ONE LOCAL, DRIVER!"],
      // Shorty counts out the fare in five-cent coins
      ['fx', 'sparkle', 0.3, 330, 224], ['sfx', 'shop_buy'],
      ['fx', 'sparkle', 0.3, 342, 224], ['sfx', 'shop_buy'],
      ['say', 'shorty', 'FIVE... TEN... EISH, DROPPED ONE. STARTING OVER.'],
      ['fx', 'sparkle', 0.3, 336, 228], ['sfx', 'shop_buy'],
      ['say', 'vaks', "THAT'S NOT FIFTY, BOSS."],
      ['say', 'tallman', "WE DON'T HAVE YOUR FIFTY, BRA. WE WORKING ON IT."],
      ['note', 'ON THE TAXI ROOF, UNNOTICED: TIKOLOSH RIDING ALONG. IT WAVES.'],
      ['wait', 0.8],
      ['note', 'VAKS BLINKS. SAYS NOTHING.'],
      ['note', 'THE TAXI WAITS.'],
      ['fade', 'out', 0.5],
    ],
  },

  // SS3 (L6) — Tallman blocks the alley while Shorty hawks a "fresh phone".
  // The fifty remains theoretical.
  ss_the_wall: {
    id: 'ss_the_wall', name: 'THE WALL', bg: 'ridge',
    actors: {
      vaks:    { sheet: 'vaks', anim: 'idle', x: 220, y: 230, flip: false },
      tallman: { sheet: 'tallman', anim: 'idle', x: 96, y: 226, flip: false },
      shorty:  { sheet: 'shorty', anim: 'idle', x: 128, y: 232, flip: false },
      sil1:    { sheet: 'tsotsi_gun', anim: 'idle', x: 300, y: 236, flip: true },
      sil2:    { sheet: 'tsotsi_knife', anim: 'idle', x: 340, y: 236, flip: true },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.5],
      ['note', 'FAST FOOTSTEPS BEHIND. TALLMAN STEPS INTO THE ALLEY MOUTH AND JUST... STANDS.'],
      ['say', 'shorty', 'FRESH PHONE HERE, GENTS! BARELY STOLEN!'],
      // Shorty bolts — the fastest move in the scene
      ['face', 'shorty', -1],
      ['move', 'shorty', -60, 232, 0.7],
      ['note', 'SILHOUETTES PEEL OFF AFTER SHORTY. HE BOLTS, CACKLING.'],
      // the silhouettes peel off after him
      ['move', 'sil1', -60, 236, 0.9],
      ['move', 'sil2', -60, 236, 1.0],
      ['say', 'vaks', "THAT'S A CHAPPIES BOX WITH A SCREEN PROTECTOR."],
      // Tallman takes one step to fill the alley, facing the camera
      ['move', 'tallman', 200, 226, 0.8],
      ['face', 'tallman', 1],
      ['say', 'tallman', 'WE TRYING TO GET YOUR 50.'],
      ['say', 'vaks', "...SO WE'RE EVEN, BOSS?"],
      ['say', 'tallman', 'MONTH END, BRA. MONTH END.'],
      ['note', 'THE FIFTY REMAINS THEORETICAL.'],
      ['fade', 'out', 0.5],
    ],
  },

  // S11 — home gate, golden hour, GRANNY still. No music (the boss track is
  // stopped). Vaks blusters, granny says nothing and points at the rake and the
  // unraked rows; Vaks concedes, picks up the rake and steps through the gate.
  granny_corner: {
    id: 'granny_corner', name: 'CORNERED AT THE PLAAS', bg: 'garden',
    actors: {
      vaks:   { sheet: 'vaks', anim: 'run', x: -20, y: 252, flip: false },
      granny: { sheet: 'granny', anim: 'idle', x: 300, y: 248, flip: true },
      rake:   { sheet: 'rake', anim: 0, x: 330, y: 252, flip: false }, // leaning by the gate
    },
    steps: [
      ['letterbox', true],
      ['music', null],
      ['fade', 'in', 0.7],
      // approaches the gate in two hesitant steps
      ['move', 'vaks', 120, 252, 0.9],
      ['wait', 0.6],
      ['move', 'vaks', 180, 252, 0.9],
      ['wait', 0.4],
      ['anim', 'vaks', 'idle'],
      ['say', 'vaks', 'GRANNY! HEY! HAIBO! YOU LOOK... RESTED!'],
      ['wait', 1.2],
      ['say', 'vaks', 'LOOK GRANNY. THERE WAS A CAVE. THERE WAS A MIST. THERE WAS A VERY BIG GUY, LOVELY GUY ACTUALLY...'],
      ['wait', 1.2],
      // the weak dance — up and immediately stopped
      ['anim', 'vaks', 'celeb'],
      ['fx', 'sparkle', 0.8],
      ['say', 'vaks', '...VIBE WITH ME, GRANNY?'],
      ['anim', 'vaks', 'idle'],
      // THE POINT — granny stares, one sparkle on the rake, silence
      ['anim', 'granny', 'stare'],
      ['shake', 1.2],
      ['fx', 'sparkle', 0.5, 330, 240],
      ['wait', 0.8],
      ['note', 'GRANNY RAISES ONE ARM AND POINTS. AT THE RAKE. AND THE UNRAKED ROWS.'],
      ['say', 'vaks', '...THE PLAAS NEEDS ITS BAAS, BOSS.'],
      // walks to the rake, picks it up, steps through the gate
      ['move', 'vaks', 326, 252, 1.2],
      ['fx', 'sparkle', 0.4, 330, 240],
      ['show', 'rake', false],
      ['sprite', 'vaks', 'vaks_rake', 'loop'],
      ['move', 'vaks', 250, 252, 1.0],
      ['fade', 'out', 0.8],
    ],
  },

  // S12 — THE TEA. Wordless but for two scripted lines: the plaas is tended,
  // granny inspects, hands Vaks a cup of tea and walks to the stoep; the
  // tikolosh pops up behind the fence, SMASH CUT to Thursday, and snoring.
  ending: {
    id: 'ending', name: 'BAAS VAN DIE PLAAS', music: 'ending', bg: 'garden',
    actors: {
      vaks:   { sheet: 'vaks_rake', anim: 'loop', x: 150, y: 252, flip: false },
      granny: { sheet: 'granny', anim: 'idle', x: 430, y: 248, flip: true },
      teacup: { sheet: 'teacup', anim: 'loop', x: 196, y: 250, flip: false },
      tiko:   { sheet: 'tiko', anim: 'loop', x: 360, y: 250, flip: true },
    },
    steps: [
      ['show', 'teacup', false],
      ['show', 'tiko', false],
      ['letterbox', true],
      ['fade', 'in', 1.0],
      ['note', 'THE PLAAS, TENDED. VAKS RAKES THE ROWS, CAP SKEW.'],
      ['wait', 0.8],
      // granny walks the rows, pausing to inspect
      ['move', 'granny', 340, 248, 1.0],
      ['anim', 'granny', 'stare'],
      ['wait', 0.7],
      ['anim', 'granny', 'idle'],
      ['move', 'granny', 250, 248, 1.0],
      // the crooked row: she stops and looks at him
      ['anim', 'granny', 'stare'],
      ['wait', 0.6],
      ['face', 'granny', -1],
      ['note', 'GRANNY WALKS THE ROWS. SHE STOPS AT A CROOKED ONE. SHE LOOKS AT HIM.'],
      // Vaks hurries over and re-rakes it
      ['move', 'vaks', 232, 252, 0.6],
      ['sprite', 'vaks', 'vaks_rake', 'loop'],
      ['fx', 'sparkle', 0.4, 244, 240],
      ['note', 'VAKS HURRIES OVER AND RE-RAKES IT. GRANNY CONTINUES.'],
      ['anim', 'granny', 'idle'],
      ['move', 'granny', 208, 248, 1.0],
      ['wait', 1.2],
      ['say', 'granny', 'HMMPH. ...GOOD BOY, VAKS.'],
      ['say', 'vaks', 'm_baas_plaas'],
      // she hands him the tea and walks to the stoep
      ['show', 'teacup', true],
      ['fx', 'sparkle', 0.5, 196, 240],
      ['move', 'granny', 470, 248, 1.6],
      ['show', 'granny', false],
      // golden hold on Vaks alone
      ['fx', 'dawn', 2.0],
      ['wait', 1.6],
      // behind the fence, the tikolosh springs up holding a ceppie
      ['teleport', 'tiko', 360, 260],
      ['show', 'tiko', true],
      ['move', 'tiko', 360, 248, 0.2],
      ['flash', '#fff8e0', 0.3],
      ['shake', 2],
      ['say', 'tiko', 'm_spying', "MY BOSS! I'M SPYING ON YOU BOSS!"],
      ['wait', 0.5],
      ['smash', 'garden_thursday'],
      ['show', 'tiko', false],
      ['show', 'teacup', false],
      ['sprite', 'vaks', 'vaks', 'idle'],
      ['teleport', 'vaks', 200, 252],
      ['note', 'THURSDAY.'],
      ['fx', 'zzz', 2.6],
      ['wait', 1.4],
      ['fade', 'out', 1.4],
    ],
  },
};

// gallery order (story order). Side scenes sit at the level where they fire.
export const SCENE_ORDER = [
  'cold_open', 'hole_wall', 'green_lung', 'follower', 'load_shedding',
  'boss_intro', 'boss_resolve', 'chase_begins', 'ss_commentary', 'babalas_economics',
  'ss_small_change', 'airtime', 'ss_the_wall', 'granny_corner', 'ending',
];

// actor id -> portrait + display name for dialogue boxes
export const SPEAKERS = {
  vaks: { face: 'face_vaks', name: 'VAKS' },
  granny: { face: 'face_granny', name: 'GRANNY' },
  big: { face: 'face_tiko', name: 'BIG TIKOLOSH' },
  tiko: { face: 'face_tiko', name: 'TIKOLOSH' },     // the recurring small tikolosh
  spaza: { face: 'face_shop', name: 'SPAZA' },        // the shopkeeper businessman
  shopkeeper: { face: 'face_shop', name: 'SHOPKEEPER' },
  vetkoek: { face: 'face_shop', name: 'VETKOEK' },    // spaza-window shopkeeper (W2)
  tallman: { face: 'face_tallman', name: 'TALLMAN' },
  shorty: { face: 'face_shorty', name: 'SHORTY' },
  masi: { face: 'face_masi', name: 'MASI' },
  imo: { face: 'face_imo', name: 'IMO' },
  rasta: { face: 'face_rasta', name: 'RASTA' },
};
