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
      // the tipsy hit — Vaks caves and takes a huge sip
      ['shake', 2.6],
      ['flash', '#ffd86a', 0.5],
      ['sprite', 'vaks', 'vaks', 'babalas'],
      ['note', 'VAKS TAKES A HUGE SIP. THE WHOLE RIDGE TILTS.'],
      ['wait', 0.5],
      ['sprite', 'vaks', 'vaks', 'idle'],
      ['say', 'vaks', 'WAIT. WAIT. I NEED TO DO SOMETHING.'],
      // he pulls up the family group and records a voice note
      ['phone', true],
      ['say', 'vaks', "GRANNY. IT'S VAKS. VIBE WITH ME, GRANNY."],
      ['chat', 'sys', 'GRANNY IS TYPING...'],
      ['wait', 1.5],
      ['chat', 'granny', 'WHERE ARE YOU VAKS. HOME. NOW.', 'alert'],
      ['wait', 0.9],
      ['phone', false],
      ['say', 'vaks', 'm_coming_boss', "SHIT... I'M COMING BOSS I'M COMING BOSS I'M COMING BOSSSS."],
      ['anim', 'vaks', 'run'],
      ['move', 'vaks', 540, 228, 1.0],
      ['fade', 'out', 0.7],
    ],
  },

  // S9 — spaza window. Vetkoek (the shopkeeper body) fronts a debt-economy gag
  // with Tallman & Shorty, then warns Vaks about the tsotsis and taxis ahead.
  babalas_economics: {
    id: 'babalas_economics', name: 'BABALAS ECONOMICS', music: 'township', bg: 'shop_nook',
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
      ['move', 'tallman', 300, 226, 1.0],
      ['move', 'shorty', 336, 232, 1.1],
      ['say', 'tallman', 'VAKS! MY BRA! LOOKING STRONG! LOOKING FAST!'],
      ['say', 'vaks', "TALLMAN. YOU OWE ME. WHERE'S MY FIFTY RAND. NO STORIES."],
      ['say', 'tallman', 'MONTH END, BRA. MONTH END. YIMA BHUTI.'],
      ['say', 'vaks', "IT'S BEEN MONTH END SINCE FEBRUARY, BOSS."],
      ['face', 'shorty', 1],
      ['say', 'shorty', "I'LL EFT YOU."],
      ['move', 'shorty', 566, 232, 1.2],
      ['say', 'vetkoek', 'BEWARE OF THE TSOTSIS, MY BOSS. AND TAXIS - REMEMBER THEY OWN THE ROAD.'],
      ['say', 'vaks', 'SHAP. EK IS DIE BAAS REMEMBER. VAKS ALWAYS HAS RIGHT OF WAY.'],
      ['fade', 'out', 0.7],
    ],
  },

  // S10 — a quiet corner. 74 unread, granny spamming, the crew "helping", and a
  // tsotsi in the alley eyeing the phone. Vaks swears by the phone.
  airtime: {
    id: 'airtime', name: 'AIRTIME', music: 'township', bg: 'ridge',
    actors: {
      vaks:   { sheet: 'vaks', anim: 'idle', x: 220, y: 230, flip: false },
      tsotsi: { sheet: 'tsotsi_knife', anim: 'idle', x: -60, y: 236, flip: false },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.8],
      ['note', 'A QUIET CORNER BETWEEN THE SHACKS. THE PHONE IS ON 2%.'],
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
      // an alley silhouette watching the phone
      ['teleport', 'tsotsi', 42, 236],
      ['shake', 1.2],
      ['note', 'IN THE ALLEY, SOMETHING WATCHES THE PHONE.'],
      ['say', 'vetkoek', 'HOLD THAT PHONE TIGHT ON THE HOME STRETCH, MY BOSS.'],
      ['say', 'vaks', 'LET THEM TRY, BOSS. THIS PHONE IS MY WHOLE FAMILY.'],
      ['say', 'vaks', "...AND IF IT BREAKS, SHORTY'S BUYING ME A NEW ONE."],
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
      ['say', 'shorty', 'FIVE... TEN... EISH, DROPPED ONE. STARTING OVER.'],
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
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.5],
      ['note', 'FAST FOOTSTEPS BEHIND. TALLMAN STEPS INTO THE ALLEY MOUTH AND JUST... STANDS.'],
      ['say', 'shorty', 'FRESH PHONE HERE, GENTS! BARELY STOLEN!'],
      ['face', 'shorty', -1],
      ['move', 'shorty', -40, 232, 1.0],
      ['note', 'SILHOUETTES PEEL OFF AFTER SHORTY. HE BOLTS, CACKLING.'],
      ['say', 'vaks', "THAT'S A CHAPPIES BOX WITH A SCREEN PROTECTOR."],
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
    },
    steps: [
      ['letterbox', true],
      ['music', null],
      ['fade', 'in', 0.7],
      ['move', 'vaks', 180, 252, 1.0],
      ['anim', 'vaks', 'idle'],
      ['say', 'vaks', 'GRANNY! HEY! HAIBO! YOU LOOK... RESTED!'],
      ['wait', 1.2],
      ['say', 'vaks', 'LOOK GRANNY. THERE WAS A CAVE. THERE WAS A MIST. THERE WAS A VERY BIG GUY, LOVELY GUY ACTUALLY...'],
      ['wait', 1.2],
      ['anim', 'vaks', 'celeb'],
      ['fx', 'sparkle', 0.8],
      ['say', 'vaks', '...VIBE WITH ME, GRANNY?'],
      ['anim', 'vaks', 'idle'],
      ['anim', 'granny', 'stare'],
      ['shake', 1.2],
      ['note', 'GRANNY RAISES ONE ARM AND POINTS. AT THE RAKE. AND THE UNRAKED ROWS.'],
      ['say', 'vaks', '...THE PLAAS NEEDS ITS BAAS, BOSS.'],
      ['sprite', 'vaks', 'vaks_rake', 'loop'],
      ['fx', 'sparkle', 0.4],
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
      ['move', 'granny', 250, 248, 1.6],
      ['anim', 'granny', 'stare'],
      ['note', 'GRANNY WALKS THE ROWS. SHE STOPS AT A CROOKED ONE. SHE LOOKS AT HIM.'],
      ['move', 'vaks', 232, 252, 0.7],
      ['fx', 'sparkle', 0.4],
      ['note', 'VAKS HURRIES OVER AND RE-RAKES IT. GRANNY CONTINUES.'],
      ['anim', 'granny', 'idle'],
      ['move', 'granny', 208, 248, 1.0],
      ['wait', 1.2],
      ['say', 'granny', 'HMMPH. ...GOOD BOY, VAKS.'],
      ['say', 'vaks', 'm_baas_plaas'],
      // she hands him the tea and walks to the stoep
      ['show', 'teacup', true],
      ['fx', 'sparkle', 0.5],
      ['move', 'granny', 470, 248, 1.6],
      ['show', 'granny', false],
      ['fx', 'dawn', 2.0],
      ['wait', 0.8],
      // behind the fence, the tikolosh pops up holding a ceppie
      ['teleport', 'tiko', 360, 250],
      ['show', 'tiko', true],
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
