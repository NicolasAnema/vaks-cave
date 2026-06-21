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
    id: 'cold_open', name: 'COLD OPEN', music: 'world1', bg: 'cave_floor',
    actors: {
      vaks: { sheet: 'vaks_sleep', anim: 'loop', x: 210, y: 218, flip: false },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 1.4],
      ['fx', 'zzz', 2.4],
      ['note', 'ONE TOO MANY ZAMALEKS LAST NIGHT...'],
      ['wait', 1.2],
      ['sprite', 'vaks', 'vaks', 'babalas'],
      ['move', 'vaks', 230, 218, 0.9],
      ['voice_note', 'm_big_days', 'BIG DAYS BOSS...'],
      ['say', 'vaks', 'GRANNY GOING TO KILL ME. I AM SO LATE. HAIBO.'],
      ['flash', '#fff8e0', 0.4],
      ['fx', 'flashback', 0.1],
      ['wire', 'm_going_deep'],
      ['say', 'vaks', 'BUT WAIT… I CAN FEEL SOMETHING.'],
      ['say', 'vaks', 'A BLOODY TIKOLOSH.'],
      ['flash', '#fff8e0', 0.4],
      ['fx', 'flashback_end', 0.1],
      ['anim', 'vaks', 'idle'],
      ['wait', 0.5],
      ['fx', 'mistStir', 1.6],
      ['shake', 1.5],
      ['note', 'BELOW HIM: THE TIKOLOSH AWAKES.'],
      ['say', 'vaks', 'YOH. WE CLIMB, BOSS. WE CLIMB NOW.'],
      ['fade', 'out', 0.9],
    ],
  },

  doubt1: {
    id: 'doubt1', name: 'DOUBT I', music: 'world1', bg: 'cave_deep',
    actors: {
      vaks: { sheet: 'vaks', anim: 'idle', x: 220, y: 220, flip: false },
      tiko: { sheet: 'tiko', anim: 'loop', x: 420, y: 250, flip: true },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.8],
      ['fx', 'sushi', 3.0],
      ['move', 'tiko', 320, 246, 2.2],
      ['face', 'vaks', -1],
      ['say', 'vaks', "WHAAATTTT IS THIS??? CHINA'S FOOD BOSS!"],
      ['say', 'vaks', 'TJERRRRR, I NEED TO GET OUT OF HERE.'],
      ['fade', 'out', 0.7],
    ],
  },

  doubt2: {
    id: 'doubt2', name: 'DOUBT II', music: 'world1', bg: 'cave_ganja',
    actors: {
      vaks: { sheet: 'vaks', anim: 'idle', x: 230, y: 220, flip: false },
      tiko: { sheet: 'tiko_irie', anim: 'loop', x: 60, y: 200, flip: false, faceOverlay: 'face_vaks' },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.8],
      ['say', 'vaks', "EISH WENA… THIS TIKOLOSH LOOKS LIKE ME. AND HE'S IRIE TOO."],
      ['move', 'tiko', 120, 196, 2.0],
      ['say', 'vaks', 'WHY SO MUCH GANJA DOWN HERE, BOSS?'],
      ['say', 'vaks', '...OH. BECAUSE I PLANTED IT LAST SEASON. SE MISTAKE.'],
      ['fade', 'out', 0.7],
    ],
  },

  boss_intro: {
    id: 'boss_intro', name: 'THE CAVE MOUTH', music: 'boss', bg: 'cave_mouth',
    actors: {
      vaks: { sheet: 'vaks', anim: 'idle', x: 360, y: 226, flip: true },
      big: { sheet: 'tiko_big', anim: 'loop', x: -80, y: 240, flip: true, scale: 3 },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.8],
      ['note', 'THE TOP OF THE CAVE. ALMOST OUT.'],
      ['move', 'big', 100, 238, 2.4],
      ['shake', 3],
      ['say', 'big', 'm_cat_die'],
      ['say', 'vaks', 'm_meow_pool', 'MY CAT?! WENA, I AM THE CAT. MEEEOOWW.'],
      ['wait', 0.4],
      ['say', 'big', 'm_vibe'],
      ['fade', 'out', 0.6],
    ],
  },

  boss_resolve: {
    id: 'boss_resolve', name: "IT'S LIKE THE WIND", music: 'ending', bg: 'cave_mouth_dawn',
    actors: {
      vaks: { sheet: 'vaks', anim: 'idle', x: 350, y: 226, flip: true },
      big: { sheet: 'tiko_big', anim: 'loop', x: 110, y: 238, flip: true, scale: 3 },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 1.2],
      ['fx', 'wind', 2.5],
      ['note', 'THE BIG TIKOLOSH. CALM, NOW.'],
      ['say', 'vaks', 'm_wind'],
      ['say', 'vaks', 'IT WAS NEVER HUNTING ME. NONE OF THEM WERE.'],
      ['fx', 'wind', 2.0],
      ['say', 'vaks', 'm_wind_malawi'],
      ['move', 'big', 60, 200, 2.6],
      ['fx', 'dawn', 2.0],
      ['note', 'DAWN OVER THE GUGULETHU HILLS.'],
      ['anim', 'vaks', 'celeb'],
      ['wait', 1.0],
      ['fade', 'out', 1.0],
    ],
  },

  chase_begins: {
    id: 'chase_begins', name: 'THE CHASE BEGINS', music: 'world2', bg: 'ridge',
    actors: {
      vaks: { sheet: 'vaks', anim: 'run', x: -20, y: 230, flip: false },
      granny: { sheet: 'granny', anim: 'idle', x: 520, y: 224, flip: true },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 1.0],
      ['move', 'vaks', 150, 228, 1.2],
      ['anim', 'vaks', 'celeb'],
      ['say', 'vaks', 'SURFACE! FRESH AIR! YHO, WHAT A DAY!'],
      ['anim', 'vaks', 'idle'],
      ['say', 'vaks', 'WAIT. SUN IS ALREADY UP. WHAT TIME IS IT? I AM FINISHED.'],
      ['move', 'granny', 420, 222, 1.0],
      ['anim', 'granny', 'stare'],
      ['shake', 1.5],
      ['note', 'ON THE RIDGE: GRANNY SPYING.'],
      ['say', 'granny', 'm_granny_spy'],
      ['wait', 0.3],
      ['say', 'vaks', 'm_coming_boss'],
      ['anim', 'vaks', 'run'],
      ['move', 'vaks', 520, 228, 1.0],
      ['anim', 'granny', 'run'],
      ['move', 'granny', 560, 224, 1.2],
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
};

// gallery order
export const SCENE_ORDER = ['cold_open', 'doubt1', 'doubt2', 'boss_intro', 'boss_resolve', 'chase_begins', 'ending'];

// actor id -> portrait + display name for dialogue boxes
export const SPEAKERS = {
  vaks: { face: 'face_vaks', name: 'VAKS' },
  granny: { face: 'face_granny', name: 'GRANNY' },
  big: { face: 'face_tiko', name: 'BIG TIKOLOSH' },
  tiko: { face: 'face_tiko', name: 'TIKOLOSH' },
  shopkeeper: { face: 'face_shop', name: 'SHOPKEEPER' },
  tallman: { face: 'face_tallman', name: 'TALLMAN' },
  shorty: { face: 'face_shorty', name: 'SHORTY' },
};
