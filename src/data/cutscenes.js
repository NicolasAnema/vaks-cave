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
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 1.4],
      ['fx', 'zzz', 2.4],
      ['note', 'VAKS SLEPT PEACEFULLY AT THE BOTTOM OF A CAVE.'],
      ['note', 'ONE TOO MANY ZAMALEKS LAST NIGHT.'],
      ['wait', 0.9],
      ['sprite', 'vaks', 'vaks', 'babalas'],
      ['move', 'vaks', 226, 218, 0.5],
      ['say', 'vaks', 'SHO. THIS IS NOT MY ROOM, BOSS. SE MISTAKE.'],
      // GRANNY CALLING — staged as an incoming-call frame, then declined
      ['sfx', 'alert'],
      ['shake', 2.5],
      ['note', 'INCOMING CALL: GOGO.'],
      ['say', 'vaks', 'NOT NOW, BOSS. NOT NOW.'],
      // he records a voice note instead — the locked LISTEN box is the joke
      ['voice_note', 'vaks', 'm_big_days'],
      // JUMP SCARE — the small tikolosh lunges into frame
      ['teleport', 'tiko', 132, 244],
      ['flash', '#fff8e0', 0.4],
      ['shake', 3],
      ['sfx', 'hazard_warning'],
      ['face', 'vaks', -1],
      ['say', 'tiko', 'YOU MAY BE DIE BAAS VAN DIE PLAAS. BUT EK IS DIE BAAS VAN DIE CAVE.'],
      ['say', 'vaks', "HAIBO, WENA. I'LL MOER YOU."],
      // scrambles back — the cave answers
      ['sfx', 'glass_break'],
      ['shake', 2.5],
      ['fx', 'mistStir', 1.6],
      ['wire', 'm_going_deep'],
      ['note', 'BELOW: THE CAVE RUMBLES. THE GROUND SHAKES.'],
      ['say', 'vaks', 'YOH... WE CLIMB, BOSS. WE CLIMB NOW.'],
      ['fade', 'out', 0.9],
    ],
  },

  hole_wall: {
    id: 'hole_wall', name: 'THE HOLE IN THE WALL', music: 'darkcave', bg: 'cave_deep',
    actors: {
      vaks:  { sheet: 'vaks', anim: 'idle', x: 150, y: 230, flip: false },
      spaza: { sheet: 'tiko_shop', anim: 'loop', x: 360, y: 238, flip: true },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.8],
      ['move', 'vaks', 214, 230, 1.0],
      ['note', 'A WARM GLOW IN THE CAVE WALL. A COUNTER. A HAND-PAINTED SIGN:'],
      ['note', '"SMOKING ALLOWED IN THE SHOP. ONLY IF YOU OFFER ME."'],
      ['say', 'spaza', 'AWEH. A CUSTOMER.'],
      // Vaks jumps back, screaming
      ['flash', '#fff8e0', 0.3],
      ['shake', 2.5],
      ['face', 'vaks', -1],
      ['say', 'vaks', 'AAAAH!'],
      ['face', 'vaks', 1],
      ['say', 'spaza', "SIGN SAYS YOU OFFER ME ONE, BOSS. AND WHY YOU SCREAMING? I'M THE ONE WHO SHOULD SCREAM. LOOK AT YOU."],
      ['say', 'vaks', '...YOU LOOK LIKE A TIKOLOSH.'],
      ['say', 'spaza', "NO, MAN. I'M A BUSINESSMAN. BIG DIFFERENCE."],
      ['say', 'spaza', 'YOU BUYING OR BROWSING BHUTI?'],
      ['say', 'vaks', '...HOW MUCH FOR THE CEPPIE?'],
      ['say', 'spaza', "CEPPIES AREN'T FOR SALE, BHUTI. CEPPIES ARE THE MONEY."],
      ['say', 'vaks', '...THEN HOW MUCH IS THE MONEY?'],
      ['say', 'spaza', "YES. EXACTLY. IT'S A LONG WAY UP BHUTI. SHOP SMARTLY."],
      ['fade', 'out', 0.7],
    ],
  },

  green_lung: {
    id: 'green_lung', name: 'THE GREEN LUNG', music: 'darkcave', bg: 'cave_deep',
    actors: {
      vaks:  { sheet: 'vaks', anim: 'idle', x: 200, y: 230, flip: false },
      spaza: { sheet: 'tiko_shop', anim: 'loop', x: 340, y: 238, flip: true },
      tiko:  { sheet: 'tiko', anim: 'loop', x: -80, y: 246, flip: false }, // peeks from a rock at the edge
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.8],
      ['note', 'VAKS PACKS HIS BUYS. SPAZA LEANS ON THE COUNTER.'],
      ['say', 'spaza', "UP FROM HERE IS YOUR GARDEN, MY BOSS. THE AIR UP THERE IS HEAVY. YOU DON'T WALK IT SOBER."],
      ['fx', 'sparkle', 0.6],
      ['say', 'spaza', "FIRST ONE'S ON THE HOUSE."],
      ['say', 'vaks', 'BOSS, YOU MUST KNOW DANKO. JAH PROVIDES. TIME TO PRAY.'],
      ['teleport', 'tiko', 42, 246], // tiko peeks in at the frame edge
      ['say', 'vaks', 'SALA KAKHULE MY BOSS.'],
      ['fade', 'out', 0.7],
    ],
  },

  follower: {
    id: 'follower', name: 'THE FOLLOWER', music: 'darkcave', bg: 'cave_ganja',
    actors: {
      vaks: { sheet: 'vaks', anim: 'idle', x: 210, y: 220, flip: false },
      tiko: { sheet: 'tiko', anim: 'loop', x: 400, y: 198, flip: true }, // waving from the top
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.8],
      ['say', 'vaks', "YOH BOSS I'M RICHH."],
      ['note', 'A TRAIL OF COINS. SOMETHING AT THE TOP, WAVING.'],
      ['say', 'tiko', 'JY BOSS!'],
      // the snatch
      ['move', 'tiko', 252, 218, 0.4],
      ['sfx', 'tsotsi_grab'],
      ['fx', 'sparkle', 0.4],
      ['move', 'tiko', 400, 198, 0.5],
      ['say', 'vaks', 'NO MAN. THIS BLOODY TIKOLOSH IS A TSOTSI.'],
      ['say', 'tiko', 'BOSS! BOSS!'],
      ['say', 'vaks', 'DON\'T "MY BOSS" ME. I\'M WATCHING YOU.'],
      ['say', 'tiko', '"I\'M WATCHING YOU! I\'M WATCHING YOU!"'],
      ['shake', 2],
      ['say', 'vaks', 'SIYAHAMBA NGOKU MFETHU.'],
      ['fade', 'out', 0.7],
    ],
  },

  load_shedding: {
    id: 'load_shedding', name: 'LOAD SHEDDING', music: 'darkcave', bg: 'cave_deep',
    actors: {
      vaks: { sheet: 'vaks', anim: 'idle', x: 230, y: 222, flip: false },
      tiko: { sheet: 'tiko', anim: 'loop', x: -80, y: 240, flip: false }, // lunges from the dark
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.8],
      ['note', 'DEEPER. A CHAIN OF LANTERNS. THE ONLY LIGHT.'],
      ['say', 'vaks', "WHO'S THERE! I'LL MOER YOU WITH MY LUCKY STICK."],
      // JUMP SCARE — tiko lunges out holding a little lantern
      ['teleport', 'tiko', 150, 240],
      ['flash', '#fff8e0', 0.4],
      ['shake', 2.5],
      ['sfx', 'hazard_warning'],
      ['say', 'tiko', 'MY BOSS! LIGHT, MY BOSS!'],
      ['say', 'vaks', 'JY STAY BACK, WENA!'],
      // Vaks hurls his zamalek — the lights die
      ['sfx', 'glass_break'],
      ['flash', '#ffffff', 0.4],
      ['bgset', 'black'],
      ['wait', 1.6],
      // the dented lantern flickers and dies
      ['flash', '#ffcf6a', 0.35],
      ['say', 'tiko', '...MY BOSS.'],
      ['wait', 0.6],
      // Vaks's cat eyes light the dark
      ['bgset', 'cave_deep'],
      ['fx', 'sparkle', 0.6],
      ['say', 'vaks', 'GOOD THING VAKS HAS CAT EYES.'],
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
      t1:    { sheet: 'tiko', anim: 'loop', x: 40, y: 250, flip: false },       // the queue
      t2:    { sheet: 'tiko', anim: 'loop', x: 74, y: 252, flip: false },
      t3:    { sheet: 'tiko', anim: 'loop', x: 108, y: 250, flip: false },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.8],
      ['note', 'THE TOP OF THE CAVE. ALMOST OUT.'],
      ['say', 'vaks', 'THIS IS THE END, BOSS.'],
      ['move', 'spaza', 300, 230, 1.2],
      ['say', 'spaza', "VAKS MY BRA. THEY'RE QUEUEING."],
      ['say', 'vaks', 'QUEUEING FOR WHAT?'],
      ['say', 'spaza', 'THE BOSS LEVEL.'],
      // the Big One rises
      ['move', 'big', 150, 238, 2.4],
      ['shake', 3],
      ['sfx', 'boss_vibe'],
      ['say', 'vaks', 'WHA?!'],
      ['say', 'spaza', "HE'S BEEN DOWN HERE ALONE A LONG TIME, MY BRA. HE DOESN'T WANT A FIGHT."],
      ['say', 'spaza', 'HE JUST WANTS THE VIBE. GIVE HIM THE VIBE.'],
      ['say', 'vaks', 'm_vibe', 'VIBE? BOSS... VIBE WITH ME.'],
      ['wire', 'm_cat_die'], // rehomed: this was boss_intro's only reference
      ['say', 'spaza', 'DALA MY BROTHER VAKS. DALA WHAT YOU MUST.'],
      ['move', 'vaks', 320, 226, 0.8],
      ['note', 'VAKS PLANTS HIS FEET. THE CROWD GOES QUIET.'],
      ['fade', 'out', 0.6],
    ],
  },

  boss_resolve: {
    id: 'boss_resolve', name: "IT'S LIKE THE WIND", music: 'ascend', bg: 'cave_mouth_dawn',
    actors: {
      vaks: { sheet: 'vaks', anim: 'idle', x: 300, y: 226, flip: true },
      big:  { sheet: 'tiko_big', anim: 'loop', x: 150, y: 238, flip: false, scale: 3 },
      tiko: { sheet: 'tiko', anim: 'loop', x: -80, y: 246, flip: false }, // slides in between them
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 1.2],
      ['face', 'vaks', -1],
      ['face', 'big', 1],
      ['say', 'vaks', 'OH, YOU WANT TO GO? WENA? IN YOUR OWN CAVE?'],
      // trading stamps
      ['move', 'big', 200, 238, 0.6],
      ['shake', 2],
      ['note', 'VAKS STAMPS BACK. THE SMALL ONES GO OOH.'],
      // the same move, the same beat
      ['say', 'vaks', "...EY. THAT'S MY MOVE."],
      ['anim', 'vaks', 'celeb'],
      ['fx', 'sparkle', 0.6],
      ['note', 'THE BEAT LOCKS. THE WHOLE CAVE SWAYS.'],
      ['teleport', 'tiko', 250, 244], // tiny version of the move
      // the music drops out; only the wind
      ['music', null],
      ['fx', 'wind', 2.5],
      ['wait', 1.2],
      ['say', 'vaks', 'm_wind', "...IT'S LIKE THE WIND, BOSS."],
      ['wire', 'm_wind_malawi'], // preserve the boss-resolution follow-up row
      // the tsotsi gives it all back
      ['fx', 'sparkle', 0.4],
      ['say', 'tiko', 'SORRY MY BOSS. YOU WERE THE BOSS THE WHOLE TIME.'],
      ['say', 'vaks', '...KEEP HALF. YOU EARNED IT, TSOTSI.'],
      // the Big One points at the dawn
      ['move', 'big', 90, 238, 1.0],
      ['face', 'big', -1],
      ['note', 'THE BIG ONE POINTS ONE HUGE ARM AT THE DAWN.'],
      ['fx', 'dawn', 2.0],
      ['move', 'vaks', 380, 226, 1.2],
      ['say', 'vaks', 'THE SUN. THE SUN IS UP, BOSS. GRANNY...'],
      ['fade', 'out', 1.0],
    ],
  },

  chase_begins: {
    // Township Scent plays the whole scene (Township Riddem takes over in L4-L6).
    // Granny NEVER shows up in person — she
    // strikes through the family WhatsApp group: Shorty, then Tallman, then GOGO,
    // whose message fires alert.mp3 and shakes the screen. Then it's a runner.
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
      ['note', 'OUT THE CAVE, STRAIGHT INTO THE DRUNK CREW: MASI, IMO AND RASTA.'],
      ['say', 'masi', 'EYTA VAKS! YOU MADE IT OUT, MY BRA! SIT, DRINK OUR ZAMALEKS, MWAHAHA!'],
      ['say', 'rasta', 'IRIE, BREDREN... DOWN THIS VICEROY WITH I AND I. JAH BLESS.'],
      ['say', 'imo', 'CAN I HEV SAVANA, BHUTI VAKS? AND NDICELA KFC!'],
      ['say', 'vaks', "NO MAN, BOSS... MY GOGO IS WAITING. SHE'S GONNA MOER ME."],
      ['say', 'masi', 'AG, VIVO VICEROY! JUST ONE SIP, MY BRA. RELAX.'],
      ['say', 'vaks', 'WAIT... LET ME JUST CHECK MY PHONE QUICK.'],
      // the family group blows up
      ['phone', true],
      ['chat', 'sys', "IT'S FRIDAY!"],
      ['chat', 'shorty', 'WHERE IS MY BOSS?'],
      ['chat', 'tallman', 'YOU MUST KNOW'],
      ['chat', 'granny', "I'M GONNA BEAT YOU", 'alert'],
      ['wait', 0.9],
      ['phone', false],
      ['say', 'vaks', "HAIBO! GOGO IS ON THE GROUP! SHE KNOWS! I'M FINISHED... I MUST RUN!"],
      ['anim', 'vaks', 'run'],
      ['move', 'vaks', 540, 228, 1.0],
      ['fade', 'out', 0.7],
    ],
  },

  ending: {
    id: 'ending', name: 'BAAS VAN DIE PLAAS', music: 'ending', bg: 'garden',
    actors: {
      vaks: { sheet: 'vaks', anim: 'run', x: -20, y: 252, flip: false },
      granny: { sheet: 'granny', anim: 'run', x: -60, y: 248, flip: false },
      rake: { sheet: 'rake', anim: 'loop', x: 250, y: 252, flip: false },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.6],
      ['move', 'vaks', 238, 252, 1.0],
      ['show', 'rake', false],
      ['sprite', 'vaks', 'vaks_rake', 'loop'],
      ['fx', 'sparkle', 0.4],
      ['note', 'RAKE: ACQUIRED. INNOCENCE: MAXIMUM.'],
      ['move', 'granny', 150, 248, 1.1],
      ['anim', 'granny', 'stare'],
      ['wait', 1.2],
      ['note', 'GRANNY FINDS VAKS HARD AT WORK. EVERY DAY BOSS.'],
      ['anim', 'granny', 'idle'],
      ['say', 'granny', 'HMMPH. ...GOOD BOY, VAKS.'],
      ['say', 'vaks', 'm_baas_plaas'],
      ['fx', 'confetti', 1.0],
      ['wait', 0.8],
      ['smash', 'garden_thursday'],
      ['sprite', 'vaks', 'vaks', 'idle'],
      ['teleport', 'vaks', 180, 252],
      ['show', 'granny', false],
      ['face', 'vaks', 1],
      ['note', 'THURSDAY. AGAIN.'],
      ['say', 'vaks', 'm_spying'],
      ['wait', 1.0],
      ['fade', 'out', 1.4],
    ],
  },

  granny_corner: {
    id: 'granny_corner', name: 'CORNERED AT THE PLAAS', music: 'level1', bg: 'garden',
    actors: {
      vaks: { sheet: 'vaks', anim: 'run', x: -20, y: 252, flip: false },
      granny: { sheet: 'granny', anim: 'run', x: 540, y: 248, flip: true },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.7],
      ['move', 'vaks', 180, 252, 1.0],
      ['anim', 'vaks', 'idle'],
      ['say', 'vaks', 'THE PLAAS! I MADE IT! NOW LET ME LOOK BUSY, QUICK...'],
      ['move', 'granny', 340, 248, 1.0],
      ['anim', 'granny', 'stare'],
      ['shake', 1.8],
      ['note', 'GOGO BLOCKS THE GATE. NO ESCAPE NOW.'],
      ['say', 'granny', 'NOT SO FAST, VAKS. YOU THINK GOGO IS SLOW?'],
      ['say', 'vaks', 'HAIBO. OK GOGO... ONE MORE VIBE.'],
      ['fade', 'out', 0.6],
    ],
  },

  granny_outro: {
    id: 'granny_outro', name: 'GOGO IS SATISFIED', music: 'level1', bg: 'garden',
    actors: {
      vaks: { sheet: 'vaks', anim: 'idle', x: 200, y: 252, flip: false },
      granny: { sheet: 'granny', anim: 'idle', x: 320, y: 248, flip: true },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.6],
      ['anim', 'granny', 'stare'],
      ['wait', 0.8],
      ['note', 'VAKS HELD THE VIBE. EVEN GOGO CANNOT STAY CROSS.'],
      ['say', 'granny', 'HMMPH. YOU STILL GOT THE RHYTHM, BOY.'],
      ['anim', 'granny', 'idle'],
      ['say', 'vaks', 'ALWAYS, GOGO. ALWAYS.'],
      ['fx', 'sparkle', 0.5],
      ['wait', 0.6],
      ['fade', 'out', 1.0],
    ],
  },
};

// gallery order (story order)
export const SCENE_ORDER = ['cold_open', 'hole_wall', 'green_lung', 'follower', 'load_shedding', 'boss_intro', 'boss_resolve', 'chase_begins', 'granny_corner', 'granny_outro', 'ending'];

// actor id -> portrait + display name for dialogue boxes
export const SPEAKERS = {
  vaks: { face: 'face_vaks', name: 'VAKS' },
  granny: { face: 'face_granny', name: 'GRANNY' },
  big: { face: 'face_tiko', name: 'BIG TIKOLOSH' },
  tiko: { face: 'face_tiko', name: 'TIKOLOSH' },     // the recurring small tikolosh
  spaza: { face: 'face_shop', name: 'SPAZA' },        // the shopkeeper businessman
  shopkeeper: { face: 'face_shop', name: 'SHOPKEEPER' },
  tallman: { face: 'face_tallman', name: 'TALLMAN' },
  shorty: { face: 'face_shorty', name: 'SHORTY' },
  masi: { face: 'face_masi', name: 'MASI' },
  imo: { face: 'face_imo', name: 'IMO' },
  rasta: { face: 'face_rasta', name: 'RASTA' },
};
