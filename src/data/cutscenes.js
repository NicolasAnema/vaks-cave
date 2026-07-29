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
    id: 'cold_open', name: 'THURSDAY WAS BIG', music: 'township', bg: 'shebeen_night', noSkip: true,
    actors: {
      vaks: { sheet: 'vaks', anim: 'dance', x: 256, y: 205, flip: false },
      masi: { sheet: 'masi', anim: 'loop', x: 90, y: 222, flip: false },
      rasta: { sheet: 'rasta', anim: 'loop', x: 146, y: 222, flip: false },
      imo: { sheet: 'imo', anim: 'loop', x: 205, y: 222, flip: false },
      watcher: { sheet: 'tiko_shadow', anim: 'loop', x: 446, y: 215, flip: true, head: 'tiko_shadow', alpha: 0.58 },
      pbot1: { sheet: 'bottle', anim: 0, x: 264, y: 203, flip: false, scale: 1.25 },
      pbot2: { sheet: 'bottle', anim: 1, x: 320, y: 218, flip: false },
      pbot3: { sheet: 'bottle', anim: 3, x: 345, y: 218, flip: false },
      bot1: { sheet: 'bottle', anim: 0, x: 178, y: 219, flip: false },
      bot2: { sheet: 'bottle', anim: 0, x: 258, y: 219, flip: false },
      bot3: { sheet: 'bottle', anim: 0, x: 300, y: 219, flip: false },
      shoe: { sheet: 'loose_shoe', anim: 0, x: 326, y: 219, flip: true },
      phone: { sheet: 'hand_phone', anim: 0, x: 306, y: 200, flip: false, scale: 1.25 },
      stalk: { sheet: 'tiko_shadow', anim: 'loop', x: 540, y: 220, flip: true, head: 'tiko_shadow', alpha: 0.62 },
      tiko: { sheet: 'tiko', anim: 'loop', x: 560, y: 240, flip: true, head: 'tiko' },
    },
    steps: [
      ['show', 'bot1', false], ['show', 'bot2', false], ['show', 'bot3', false],
      ['show', 'shoe', false], ['show', 'phone', false],
      ['show', 'stalk', false], ['show', 'tiko', false],
      ['letterbox', true],
      ['fade', 'in', 0.5],
      ['fx', 'flashback'],
      ['note', 'THURSDAY - 11:47 PM'],
      ['wire', 'm_going_deep'],
      ['dance', 'vaks', true, 9],
      ['dance', 'masi', true, 6],
      ['dance', 'rasta', true, 5],
      ['dance', 'imo', true, 8],
      ['camera', 242, 190, 1.25, 0.8],
      ['dance', 'vaks', false],
      ['anim', 'pbot1', 1],
      ['move', 'pbot1', 266, 192, 0.3],
      ['note', 'VAKS TAKES A BIG PULL OF HIS ZAMALEK.'],
      ['anim', 'pbot1', 0],
      ['move', 'pbot1', 264, 203, 0.25],
      ['dance', 'vaks', true, 9],
      ['say', 'vaks', "YOH I'M FEELING LEKKA MY BRU."],
      ['dance', 'vaks', false],
      ['glide', 'pbot1', 344, 218, 0.8],
      ['move', 'vaks', 334, 220, 0.8],
      ['camera', 370, 205, 1.45, 0.7],
      ['say', 'vaks', 'WHAT IS THIS BOSS?'],
      ['sprite', 'vaks', 'vaks', 'babalas'],
      ['glide', 'pbot1', 418, 255, 0.45],
      ['move', 'vaks', 408, 257, 0.45],
      ['sfx', 'glass_break'],
      ['shake', 6],
      ['show', 'vaks', false], ['show', 'masi', false], ['show', 'rasta', false],
      ['show', 'imo', false], ['show', 'watcher', false],
      ['show', 'pbot1', false], ['show', 'pbot2', false], ['show', 'pbot3', false],
      ['bgset', 'black'],
      ['fx', 'fallTunnel', 1.25],
      ['fade', 'out', 0.12],
      ['bgset', 'cave_floor'],
      ['music', 'darkcave'],
      ['fx', 'flashback_end'],
      ['camreset', 0.1],
      ['teleport', 'vaks', 210, 218],
      ['sprite', 'vaks', 'vaks_sleep', 'loop'],
      ['show', 'vaks', true],
      ['show', 'bot1', true], ['show', 'bot2', true], ['show', 'bot3', true],
      ['show', 'shoe', true],
      ['fade', 'in', 0.35],
      ['note', 'FRIDAY - 06:12'],
      ['camera', 214, 210, 1.8, 2.0],
      ['fx', 'zzz', 1.6],

      // He wakes, checks the damage, sees how far the cave climbs, and very
      // briefly decides that going back to sleep is still a valid strategy.
      ['sprite', 'vaks', 'vaks', 'babalas'],
      ['camera', 220, 214, 1.35, 0.8],
      ['move', 'vaks', 226, 218, 0.5],
      ['move', 'vaks', 196, 218, 0.5],
      ['move', 'vaks', 236, 218, 0.6],
      ['say', 'vaks', 'SHO. THIS IS NOT MY CAVE, BOSS. SE MISTAKE.'],
      ['move', 'vaks', 190, 218, 0.5],
      ['move', 'bot1', 194, 197, 0.35],
      ['wait', 0.55],
      ['move', 'bot1', 176, 219, 0.3],
      ['camera', 318, 208, 1.7, 0.7],
      ['move', 'vaks', 296, 218, 0.9],
      ['move', 'shoe', 311, 219, 0.25],
      ['teleport', 'phone', 306, 200],
      ['show', 'phone', true],
      ['note', 'VAKS SWITCHES ON HIS PHONE TORCH.'],
      ['camera', 270, 145, 1.25, 0.8],
      ['fx', 'phoneLight', 1.7],
      ['show', 'phone', false],
      ['camreset', 0.5],
      ['teleport', 'vaks', 220, 218],
      ['sprite', 'vaks', 'vaks_sleep', 'loop'],
      ['wait', 0.7],
      ['sfx', 'alert'],
      ['shake', 3],
      ['sprite', 'vaks', 'vaks', 'babalas'],
      ['call_choice', 'GRANNY', 5],
      // Answering lets Granny ask where he is. Declining skips directly here.
      // Both paths then converge on the existing 35.36s voice note.
      ['voice_note', 'vaks', 'm_big_days', [
        [0, "BUT BOSS TODAY I'M FEELING LAZY YOHH. I'M FEELING LAZY BECAUSE BABALAS YESTERDAY. BIG PARTY! DANCING, DANCING SMOKING, DRINKING."],
        [13.0, "WOWWW... THIS IS A BIG DAYS BOSS. THAT'S WHY I'M FEELING IRIE... NICE AND WHAM. NICE BOSS, THANK YOU BOSS. OKAY BOSS."],
        [28.0, "YOU MUST WORKING HARD BOSS AND THEN AT THE SAME TIME YOU GONNA BE GOOD BOSS, I TOLD YOU BOSS. SHAP BOSS."],
      ], 35.36, [
        [0.8, 'move', 'vaks', 180, 218, 0.8],
        [2.4, 'move', 'bot1', 187, 198, 0.35],
        [4.1, 'move', 'bot1', 166, 219, 0.3],
        [5.0, 'move', 'vaks', 296, 218, 1.1],
        [6.1, 'teleport', 'phone', 306, 200],
        [6.2, 'show', 'phone', true],
        [6.4, 'camera', 270, 145, 1.25, 0.9],
        [6.6, 'fx', 'phoneLight', 3.2],
        [10.1, 'show', 'phone', false],
        [10.3, 'camreset', 0.8],
        [11.0, 'move', 'vaks', 110, 218, 1.0],
        [13.0, 'teleport', 'stalk', 430, 218],
        [13.0, 'show', 'stalk', true],
        [14.0, 'camera', 238, 205, 1.18, 0.8],
        [15.0, 'move', 'stalk', 382, 219, 3.0],
        [16.0, 'move', 'vaks', 82, 218, 0.8],
        [20.0, 'face', 'vaks', -1],
        [21.0, 'show', 'stalk', false],
        [22.0, 'teleport', 'stalk', 325, 220],
        [22.1, 'show', 'stalk', true],
        [24.0, 'move', 'stalk', 272, 220, 3.0],
        [28.0, 'sprite', 'vaks', 'vaks_sleep', 'loop'],
        [28.0, 'teleport', 'vaks', 190, 218],
        [28.2, 'teleport', 'stalk', 252, 220],
        [28.3, 'move', 'stalk', 222, 220, 5.0],
        [34.0, 'show', 'stalk', false],
        [34.0, 'sprite', 'vaks', 'vaks', 'babalas'],
      ]],
      // The territorial Tikolosh cashes in the background stalking gag.
      ['show', 'tiko', true],
      ['teleport', 'tiko', 560, 240],
      ['camera', 252, 224, 2.1, 0.12],
      ['move', 'tiko', 300, 240, 0.3],
      ['flash', '#fff8e0', 0.4],
      ['shake', 3],
      ['sfx', 'hazard_warning'],
      ['face', 'vaks', 1],
      ['say', 'tiko', 'HELLO VAKS. I AM ONE OF YOUR TIKOLOSHES.'],
      ['say', 'vaks', "JY!! HAIBO, WENA. I'LL MOER YOU."],
      // Vaks grabs a Zamalek, winds up, and throws it directly at the Tikolosh.
      ['camera', 238, 216, 1.55, 0.55],
      ['face', 'vaks', 1],
      ['anim', 'vaks', 'celeb'],
      ['move', 'bot2', 198, 200, 0.3],
      ['note', 'VAKS THROWS THE BOTTLE AT THE TIKOLOSH.'],
      ['move', 'bot2', 296, 212, 0.42],
      ['shards', 296, 214, ['#2f7b46', '#83c96b', '#d7e7aa'], 16],
      ['show', 'bot2', false],
      ['sfx', 'glass_break'],
      ['flash', '#c8ffc0', 0.16],
      ['shake', 4],
      ['move', 'tiko', 332, 240, 0.22],
      ['anim', 'vaks', 'babalas'],
      ['fx', 'mistStir', 1.6],
      ['note', 'THE CAVE WAKES UP.'],
      ['say', 'tiko', "THIS IS MY CAVE, VAKS. NOT YOURS. LET'S SEE IF YOU CAN ESCAPE."],
      ['laugh', 'tiko', true, 11],
      ['wait', 1.4],
      ['laugh', 'tiko', false],
      ['say', 'vaks', 'YOH... WE CLIMB NOW.'],
      // Vaks visibly starts the climb while the Tikolosh pursues from below.
      ['camreset', 0.8],
      ['move', 'vaks', 44, 220, 0.65],
      ['sprite', 'vaks', 'vaks', 'climb'],
      ['glide', 'vaks', 44, 132, 1.25],
      ['glide', 'tiko', 82, 176, 1.2],
      ['fade', 'out', 1.2],
    ],
  },

  hole_wall: {
    id: 'hole_wall', name: 'THE HOLE IN THE WALL', music: 'darkcave', bg: 'shop_nook',
    actors: {
      warning: { sheet: 'tiko_shadow', anim: 'loop', x: 430, y: 232, flip: true, alpha: 0.68 },
      vaks: { sheet: 'vaks', anim: 'idle', x: 52, y: 292, flip: false },
      spaza: { sheet: 'tiko_shop', anim: 'loop', x: 360, y: 274, flip: true, head: 'tiko_shop' },
      cig: { sheet: 'spliff', anim: 'loop', x: 187, y: 222, flip: false },
      shelfbot: { sheet: 'bottle', anim: 0, x: 350, y: 96, flip: false },
      shelfshoe: { sheet: 'loose_shoe', anim: 0, x: 390, y: 96, flip: true },
      rat: { sheet: 'rat', anim: 'loop', x: 450, y: 242, flip: true },
    },
    // the actual hand-painted sign, hung on the back wall — the words live on
    // the plank now, not just in a caption
    props: [
      { type: 'sign', x: 240, y: 60, w: 152, hang: 12, text: 'SMOKING ALLOWED ONLY IF YOU OFFER OWNER A PUFF' },
    ],
    steps: [
      ['show', 'warning', false],
      ['show', 'spaza', false],
      ['show', 'cig', false],
      ['show', 'rat', false],
      ['letterbox', true],
      ['fade', 'in', 0.8],
      // Hold on the empty shaft mouth first, then let Vaks physically pull
      // himself over the lip. The slower vertical travel makes this a climb,
      // not an entrance from the bottom of frame.
      ['camera', 72, 226, 1.55, 0.3],
      ['wait', 0.25],
      ['sprite', 'vaks', 'vaks', 'climb'],
      ['move', 'vaks', 72, 236, 1.35],
      ['sprite', 'vaks', 'vaks', 'babalas'],
      ['shake', 1.2],
      ['wait', 0.65],
      ['face', 'vaks', 1],
      // Warm light flickers at the other end of the ledge. Vaks stops and the
      // camera follows his gaze to the improbable business in the cave wall.
      ['camera', 240, 188, 1.05, 1.3],
      ['fx', 'shopDiscovery', 1.6, 360, 154],
      // Establish that he is smoking before the sign becomes the joke.
      ['anim', 'vaks', 'smokePuff'],
      ['fx', 'puff', 0.75],
      ['anim', 'vaks', 'idle'],
      ['move', 'vaks', 154, 236, 1.35],
      // Keep Vaks and the sign in one composition: he stops beneath it, takes
      // another puff and visibly has time to read the owner's rule.
      ['camera', 210, 143, 1.25, 0.8],
      ['anim', 'vaks', 'smokePuff'],
      ['fx', 'puff', 0.8],
      ['wait', 1.0],
      // Pull back before Spaza appears so both men share the reveal.
      ['camera', 226, 208, 1.22, 0.7],
      ['wait', 0.7],
      ['teleport', 'spaza', 360, 274],
      ['show', 'spaza', true],
      ['glide', 'spaza', 360, 238, 0.35],
      ['sfx', 'alert'],
      ['flash', '#ffbd55', 0.18],
      ['say', 'spaza', 'AWEH. A CUSTOMER.'],
      // Vaks absolutely loses it. The stock and resident rat react with him.
      ['camera', 150, 214, 1.75, 0.25],
      ['teleport', 'cig', 164, 218],
      ['show', 'cig', true],
      ['anim', 'vaks', 'hurt'],
      ['glide', 'cig', 160, 242, 0.4],
      ['glide', 'shelfbot', 326, 242, 0.6],
      ['glide', 'shelfshoe', 370, 241, 0.52],
      ['show', 'rat', true],
      ['glide', 'rat', -24, 242, 1.1],
      ['sfx', 'hazard_warning'],
      ['shake', 3.5],
      ['move', 'vaks', 126, 202, 0.18],
      ['fx', 'frightBurst', 0.45],
      ['move', 'vaks', 92, 236, 0.28],
      ['anim', 'vaks', 'babalas'],
      ['face', 'vaks', 1],
      ['wait', 0.3],
      // The fright gets its close-up; the conversation does not. Hold both
      // characters in frame so every reaction remains part of the exchange.
      ['camera', 226, 210, 1.22, 0.55],
      ['say', 'spaza', "WHY YOU SCREAMING? I'M THE ONE WHO SHOULD SCREAM. LOOK AT YOU."],
      ['say', 'vaks', '...YOU LOOK LIKE A TIKOLOSH.'],
      ['say', 'spaza', 'MY NAME IS SPAZA. I AM A BUSINESSMAN.'],
      ['dance', 'spaza', true, 5],
      ['say', 'spaza', 'YOU BUYING OR BROWSING BHUTI?'],
      ['dance', 'spaza', false],
      // Vaks creeps forward without taking his eyes off Spaza.
      ['move', 'vaks', 150, 236, 0.5],
      ['say', 'vaks', '...HOW MUCH FOR A JOINT?'],
      ['move', 'vaks', 196, 236, 0.5],
      ['camera', 238, 210, 1.28, 0.35],
      ['sfx', 'shop_buy'],
      ['price', 312, 226],
      ['say', 'spaza', 'HUNDRED MANO.'],
      ['say', 'vaks', "YOH, THAT'S A LOT OF MANO?!"],
      ['price', false],
      ['move', 'vaks', 236, 236, 0.5],
      ['say', 'vaks', '...BETTER BE WORTH IT.'],
      ['say', 'spaza', "IT'S A LONG WAY UP BHUTI."],
      ['mood', 'danger'],
      ['teleport', 'warning', 430, 232],
      ['show', 'warning', true],
      ['glide', 'warning', 250, 232, 1.25],
      ['camera', 244, 208, 1.28, 0.55],
      ['sfx', 'hazard_warning'],
      ['say', 'spaza', 'THE TIKOLOSH TAKES NO PRISONERS.'],
      ['show', 'warning', false],
      ['mood', false],
      ['flash', '#ffd779', 0.18],
      ['say', 'spaza', 'SHOP SMARTLY.'],
      ['fade', 'out', 0.7],
    ],
  },

  green_lung: {
    id: 'green_lung', name: 'THE GREEN LUNG', music: 'darkcave', bg: 'shop_nook',
    actors: {
      vaks:   { sheet: 'vaks', anim: 'idle', x: 208, y: 236, flip: false },
      spaza:  { sheet: 'tiko_shop', anim: 'loop', x: 318, y: 238, flip: true, head: 'tiko_shop' },
      bag:    { sheet: 'shop_bag', anim: 0, x: 300, y: 234, flip: false, scale: 1.15 },
      weed:   { sheet: 'weed', anim: 0, x: 330, y: 228, flip: false, scale: 1.3 },
      spliff: { sheet: 'spliff', anim: 'loop', x: 300, y: 234, flip: false, scale: 1.3 },
      tiko:   { sheet: 'tiko_shadow', anim: 'loop', x: 52, y: 246, flip: false, head: 'tiko_shadow', alpha: 0.72 },
    },
    steps: [
      ['show', 'bag', false],
      ['show', 'weed', false],
      ['show', 'spliff', false],
      ['show', 'tiko', false],
      ['letterbox', true],
      ['fade', 'in', 0.6],
      // Continue the transaction physically: Spaza slides the packed goods
      // across the counter instead of a caption telling us it happened.
      ['camera', 270, 208, 1.42, 0.6],
      ['show', 'bag', true],
      ['glide', 'bag', 232, 232, 0.8],
      ['anim', 'vaks', 'celeb'],
      ['sfx', 'shop_buy'],
      ['wait', 0.8],
      ['anim', 'vaks', 'idle'],
      ['say', 'spaza', 'THE WAY TO YOUR GARDEN IS UP.'],
      // The back of the spaza opens onto a green-lit route labelled GARDEN.
      ['route', 424, 218],
      ['flash', '#7dff95', 0.18],
      ['camera', 286, 192, 1.16, 0.8],
      ['wait', 0.8],
      ['say', 'spaza', 'TO GET THERE, YOU NEED TO BE IRIE.'],
      // The quoted price flips into a deadpan free-sample offer.
      ['camera', 282, 207, 1.34, 0.6],
      ['price', 270, 228, '100 MANO'],
      ['wait', 0.55],
      ['sfx', 'shop_buy'],
      ['price', 270, 228, 'FIRST ONE FREE'],
      ['fx', 'sparkle', 0.45, 306, 207],
      // Herb hits the counter and the finished joint wriggles into view.
      ['show', 'weed', true],
      ['glide', 'weed', 296, 230, 0.35],
      ['fx', 'sparkle', 0.4, 298, 228],
      ['show', 'weed', false],
      ['show', 'spliff', true],
      ['dance', 'spliff', true, 18],
      ['wait', 0.5],
      ['dance', 'spliff', false],
      ['sfx', 'shop_buy'],
      ['say', 'spaza', "FIRST ONE'S ON THE HOUSE."],
      ['price', false],
      // The recurring Tikolosh spies from the cave entrance while the sample
      // arcs into Vaks's hand. It is tracking an advantage, not admiring him.
      ['camera', 240, 205, 1.14, 0.65],
      ['show', 'tiko', true],
      ['glide', 'tiko', 68, 246, 0.6],
      ['anim', 'vaks', 'celeb'],
      ['move', 'spliff', 262, 224, 0.45],   // up over the counter
      ['move', 'spliff', 222, 230, 0.4],    // down into Vaks's hand
      ['fx', 'sparkle', 0.5, 220, 228],
      ['sfx', 'shop_buy'],
      ['wait', 0.3],
      ['anim', 'vaks', 'idle'],
      ['say', 'vaks', 'SHO. YOU MUST KNOW DANKO.'],
      ['say', 'vaks', "JAH PROVIDES. IT'S TIME TO PRAY."],
      // Vaks feels the stare; the Tikolosh ducks before he can catch it.
      ['wait', 0.5],
      ['face', 'vaks', -1],
      ['show', 'tiko', false],
      ['wait', 0.45],
      ['face', 'vaks', 1],
      // Vaks keeps the joint as he crosses the shop to the marked route.
      ['camera', 326, 194, 1.22, 0.65],
      ['glide', 'spliff', 390, 222, 1.3],
      ['move', 'vaks', 378, 236, 1.3],
      ['say', 'vaks', 'IRIE FOR SAFARI'],
      ['fx', 'sparkle', 0.35, 390, 218],
      // The joint remains with him as he climbs through the exit, setting up
      // Level 2's automatic skin-up without duplicating the ritual.
      ['sprite', 'vaks', 'vaks', 'climb'],
      ['glide', 'spliff', 434, 116, 1.15],
      ['move', 'vaks', 424, 116, 1.15],
      ['show', 'vaks', false],
      ['show', 'spliff', false],
      ['wait', 0.25],
      // Hostile warning first, laugh second, then it follows Vaks upstairs.
      ['teleport', 'tiko', 52, 246],
      ['show', 'tiko', true],
      ['glide', 'tiko', 118, 246, 0.9],
      ['camera', 120, 236, 1.4, 0.8],
      ['wait', 0.8],
      ['say', 'tiko', 'THE CAVE ONLY GETS HARDER FROM HERE.'],
      ['laugh', 'tiko', true, 11],
      ['wait', 1.0],
      ['laugh', 'tiko', false],
      ['camera', 240, 205, 1.05, 0.55],
      ['move', 'tiko', 430, 232, 1.2],
      ['fade', 'out', 0.7],
    ],
  },

  follower: {
    id: 'follower', name: 'THE FOLLOWER', music: 'darkcave', bg: 'cave_ganja',
    actors: {
      vaks: { sheet: 'vaks', anim: 'idle', x: 84, y: 286, flip: false },
      tornbag: { sheet: 'shop_bag_torn', anim: 0, x: 124, y: 218, flip: false },
      tiko: { sheet: 'tiko', anim: 'loop', x: 58, y: 220, flip: false, head: 'tiko' },
      lootbag: { sheet: 'money_sack', anim: 0, x: 74, y: 220, flip: false, scale: 1.1 },
      c1: { sheet: 'r2', anim: 0, x: 126, y: 218, flip: false, scale: 1.25 },
      c2: { sheet: 'r2', anim: 0, x: 154, y: 218, flip: false, scale: 1.25 },
      c3: { sheet: 'r2', anim: 0, x: 182, y: 218, flip: false, scale: 1.25 },
      c4: { sheet: 'r2', anim: 0, x: 210, y: 218, flip: false, scale: 1.25 },
      c5: { sheet: 'r2', anim: 0, x: 238, y: 218, flip: false, scale: 1.25 },
    },
    props: [
      { type: 'sign', x: 430, y: 150, w: 72, hang: 10, text: 'SPAZA  ->', bg: '#4f3a25', ink: '#ffe38a' },
    ],
    steps: [
      ['show', 'tornbag', false],
      ['show', 'tiko', false],
      ['show', 'lootbag', false],
      ['show', 'c1', false],
      ['show', 'c2', false],
      ['show', 'c3', false],
      ['show', 'c4', false],
      ['show', 'c5', false],
      ['letterbox', true],
      ['fade', 'in', 0.65],
      // Vaks pulls himself onto the rest ledge carrying the packet from Spaza.
      // The last of Level 2's irie rush visibly drains away around him.
      ['camera', 120, 204, 1.42, 0.45],
      ['sprite', 'vaks', 'vaks', 'climb'],
      ['move', 'vaks', 110, 220, 1.0],
      ['show', 'tornbag', true],
      ['anim', 'vaks', 'celeb'],
      ['fx', 'irieFade', 1.25],
      ['say', 'vaks', "YOH BOSS I'M RICHH."],
      // He walks while admiring himself. The torn packet follows his hand and
      // drops a real R2 trail one coin at a time behind him.
      ['camera', 240, 202, 1.05, 0.75],
      ['anim', 'vaks', 'run'],
      ['glide', 'vaks', 250, 220, 1.4],
      ['glide', 'tornbag', 264, 218, 1.4],
      ['wait', 0.18],
      ['show', 'c1', true], ['sfx', 'shop_buy'],
      ['wait', 0.18],
      ['show', 'c2', true], ['sfx', 'shop_buy'],
      ['wait', 0.18],
      ['show', 'c3', true], ['sfx', 'shop_buy'],
      ['wait', 0.18],
      ['show', 'c4', true], ['sfx', 'shop_buy'],
      ['wait', 0.18],
      ['show', 'c5', true], ['sfx', 'shop_buy'],
      ['wait', 0.5],
      ['anim', 'vaks', 'idle'],
      // The Tikolosh followed him through Level 2. It emerges behind the trail
      // and offers its completely unsolicited financial service.
      ['show', 'tiko', true],
      ['glide', 'tiko', 92, 220, 0.65],
      ['wait', 0.65],
      ['say', 'tiko', "YOU DROPPED YOUR MANO. I'LL HOLD IT FOR YOU."],
      // Every stolen coin makes the sack visibly fatter.
      ['show', 'lootbag', true],
      ['glide', 'lootbag', 116, 220, 0.2],
      ['move', 'tiko', 126, 220, 0.2],
      ['show', 'c1', false], ['sfx', 'shop_buy'],
      ['glide', 'lootbag', 144, 220, 0.18],
      ['move', 'tiko', 154, 220, 0.18],
      ['show', 'c2', false], ['anim', 'lootbag', 1], ['sfx', 'shop_buy'],
      ['glide', 'lootbag', 172, 220, 0.18],
      ['move', 'tiko', 182, 220, 0.18],
      ['show', 'c3', false], ['sfx', 'shop_buy'],
      ['glide', 'lootbag', 200, 220, 0.18],
      ['move', 'tiko', 210, 220, 0.18],
      ['show', 'c4', false], ['anim', 'lootbag', 2], ['sfx', 'shop_buy'],
      ['glide', 'lootbag', 228, 220, 0.18],
      ['move', 'tiko', 238, 220, 0.18],
      ['show', 'c5', false], ['sfx', 'tsotsi_grab'],
      ['glide', 'lootbag', 366, 216, 0.55],
      ['move', 'tiko', 350, 216, 0.55],
      ['camera', 292, 204, 1.24, 0.6],
      ['say', 'vaks', 'NO MAN. THIS BLOODY TIKOLOSH IS A TSOTSI.'],
      ['say', 'tiko', 'NOW YOU POOR MY BOSS.'],
      ['say', 'vaks', 'DON\'T "MY BOSS" ME.'],
      // Vaks puts up his fists and advances. The little tsotsi mirrors every
      // step, then stands still while Vaks's head-first charge rebounds.
      ['anim', 'vaks', 'celeb'],
      ['glide', 'tiko', 324, 216, 0.35],
      ['move', 'vaks', 286, 220, 0.35],
      ['shake', 1.5],
      ['anim', 'vaks', 'hurt'],
      ['move', 'vaks', 309, 196, 0.18],
      ['fx', 'impactBurst', 0.3, 315, 194],
      ['move', 'vaks', 278, 220, 0.28],
      ['shake', 3.5],
      // Its tiny body does not react. Tikolosh takes a beat to enjoy the failed
      // attack, then visibly deploys a ridiculous counter-psyop against Vaks.
      ['glide', 'vaks', 230, 220, 0.8],
      ['wait', 0.55],
      ['laugh', 'tiko', true, 14],
      ['wait', 0.5],
      ['mood', 'tiko_psyop'],
      ['sfx', 'alert'],
      ['wait', 1.45],
      ['laugh', 'tiko', false],
      ['mood', 'tiko_meme'],
      ['sfx', 'hazard_warning'],
      ['wait', 0.8],
      ['say', 'tiko', 'YOU CAN\'T HIT ME, VAKS. I\'M IN YOUR MEEZING.'],
      ['mood', false],
      ['anim', 'vaks', 'babalas'],
      ['say', 'vaks', 'TJERRRRR, SIYAHAMBA NGOKU MEFTU.'],
      // Tikolosh escapes toward the marked spaza with the full sack. Vaks
      // follows to recover his Mano, making the scene title work both ways.
      ['camera', 330, 202, 1.05, 0.65],
      ['glide', 'lootbag', 520, 216, 1.0],
      ['move', 'tiko', 505, 220, 1.0],
      ['anim', 'vaks', 'run'],
      ['move', 'vaks', 540, 220, 1.2],
      ['fade', 'out', 0.7],
    ],
  },

  load_shedding: {
    id: 'load_shedding', name: 'LOAD SHEDDING', music: 'darkcave', bg: 'cave_deep',
    actors: {
      vaks: { sheet: 'vaks', anim: 'idle', x: 230, y: 222, flip: false },
      tiko: { sheet: 'tiko', anim: 'loop', x: -80, y: 240, flip: false, head: 'tiko' }, // approaches from the dark
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
      ['camera', 236, 202, 1.3, 1.0],
      // he brandishes the lucky stick as he shouts
      ['move', 'stick', 222, 214, 0.2],
      ['move', 'stick', 222, 222, 0.2],
      ['say', 'vaks', "WHO'S THERE! I'LL MOER YOU WITH MY LUCKY STICK."],
      // the tiko comes SLOWLY out of the dark right, then LUNGES
      ['teleport', 'tiko', 540, 240],
      ['move', 'tiko', 360, 240, 2.4],
      ['camera', 300, 226, 1.6, 0.14],  // hard punch on the lunge
      ['flash', '#fff8e0', 0.4],
      ['shake', 2.5],
      ['sfx', 'hazard_warning'],
      ['move', 'tiko', 300, 240, 0.25],
      ['say', 'tiko', 'ME BOSS!!'],
      ['say', 'vaks', 'JY STAY BACK, WENA!'],
      // Vaks hurls his zamalek — it arcs across, misses, hits the chain
      ['teleport', 'bot', 230, 205],
      ['face', 'vaks', 1],
      ['move', 'bot', 330, 116, 0.35],
      ['move', 'bot', 392, 122, 0.3],
      ['sfx', 'glass_break'],
      ['flash', '#ffffff', 0.4],
      ['show', 'bot', false],
      // pull wide and up to watch the whole chain go dark — the money shot
      ['camera', 232, 152, 1.12, 0.6],
      // THE LANTERNS DIE ONE BY ONE
      ['show', 'l5', false], ['wait', 0.3],
      ['show', 'l4', false], ['wait', 0.3],
      ['show', 'l3', false], ['wait', 0.3],
      ['show', 'l2', false], ['wait', 0.3],
      ['show', 'l1', false], ['wait', 0.3],
      ['bgset', 'black'],
      ['wait', 0.9],
      ['wait', 0.9],
      ['note', 'EISH.'],
      // the tiko's little lantern flickers and dies — the camera finds it in the black
      ['camera', 300, 224, 1.55, 0.8],
      ['teleport', 'tl', 300, 236],
      ['show', 'tl', true], ['wait', 0.3],
      ['show', 'tl', false], ['wait', 0.3],
      ['show', 'tl', true], ['wait', 0.3],
      ['show', 'tl', false], ['wait', 0.3],
      ['say', 'tiko', '...MY BOSS.'],
      // Vaks's cat eyes light the dark
      ['bgset', 'cave_deep'],
      ['camera', 240, 208, 1.7, 0.5],   // push onto the two glowing cat-eyes
      ['fx', 'sparkle', 0.3, 236, 200],
      ['fx', 'sparkle', 0.3, 246, 200],
      ['say', 'vaks', 'GOOD THING VAKS HAS CAT EYES.'],
      ['camreset', 0.8],
      ['say', 'vaks', 'FINAL LEVEL, BOSS. WE CLIMB. NOW IN THE DARK.'],
      ['fade', 'out', 0.7],
    ],
  },

  boss_intro: {
    id: 'boss_intro', name: 'THE CAVE MOUTH', music: 'boss', bg: 'cave_mouth',
    actors: {
      vaks:  { sheet: 'vaks', anim: 'idle', x: 360, y: 226, flip: true },
      spaza: { sheet: 'tiko_shop', anim: 'loop', x: 440, y: 230, flip: true, head: 'tiko_shop' }, // strolls in
      big:   { sheet: 'tiko_big', anim: 'loop', x: -80, y: 240, flip: true, scale: 3, head: 'tiko_big' },
      t1:    { sheet: 'tiko', anim: 'loop', x: 40, y: 251, flip: false, head: 'tiko' },       // the queue
      t2:    { sheet: 'tiko', anim: 'loop', x: 74, y: 251, flip: false, head: 'tiko' },
      t3:    { sheet: 'tiko', anim: 'loop', x: 108, y: 251, flip: false, head: 'tiko' },
      t4:    { sheet: 'tiko', anim: 'loop', x: 142, y: 251, flip: false, head: 'tiko' },
      t5:    { sheet: 'tiko', anim: 'loop', x: 176, y: 251, flip: false, head: 'tiko' },
      tiko:  { sheet: 'tiko', anim: 'loop', x: 210, y: 251, flip: false, head: 'tiko' }, // the fan, front row
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.8],
      ['camera', 344, 214, 1.35, 1.0],
      ['note', 'THE TOP OF THE CAVE. ALMOST OUT.'],
      ['say', 'vaks', 'THIS IS THE END.'],
      // the tikoloshes file in from both edges to a seated row — pan to the queue
      ['camera', 150, 222, 1.2, 1.2],
      ['teleport', 't1', -40, 251], ['move', 't1', 40, 251, 0.6],
      ['teleport', 't2', 540, 251], ['move', 't2', 176, 251, 0.7],
      ['teleport', 't3', -40, 251], ['move', 't3', 74, 251, 0.6],
      ['teleport', 't4', 540, 251], ['move', 't4', 142, 251, 0.7],
      ['teleport', 't5', -40, 251], ['move', 't5', 108, 251, 0.7],
      ['say', 'vaks', "WHAT ARE THOSE TIKOLOSHES DOIN'?"],
      // spaza strolls in slow from the left
      ['teleport', 'spaza', -40, 230],
      ['move', 'spaza', 300, 230, 1.6],
      ['say', 'spaza', "THEY'RE QUEUEING."],
      ['say', 'vaks', 'FOR WHAT?'],
      ['say', 'spaza', 'THE BOSS LEVEL.'],
      // THE BIG ONE rises from below — the ground shakes, the camera holds on
      // the spot where his huge face crests into view
      ['camera', 150, 224, 1.4, 0.6],
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
      // pull back to take in the whole arena — the crowd, Vaks, the boss
      ['camera', 214, 214, 1.12, 0.9],
      ['say', 'spaza', 'HE NEVER WANTED TO FIGHT.'],
      ['say', 'spaza', 'HE JUST WANTED TO VIBE.'],
      // front row: the little tikolosh loses his mind, a proud fan (silent bounce)
      ['teleport', 'tiko', 210, 251],
      ['move', 'tiko', 210, 243, 0.15],
      ['move', 'tiko', 210, 251, 0.15],
      ['move', 'tiko', 210, 243, 0.15],
      ['move', 'tiko', 210, 251, 0.15],
      ['say', 'vaks', 'VIBE? VIBE WITH ME?'],
      ['wire', 'm_vibe'],    // the vibe-off row keeps its scene home (audio fires in the fight)
      ['wire', 'm_cat_die'], // rehomed: this was boss_intro's only reference
      ['say', 'spaza', 'DALA VAKS. DALA WHAT YOU MUST.'],
      ['move', 'vaks', 320, 226, 0.8],
      ['note', 'VAKS PLANTS HIS FEET. THE CROWD GOES QUIET.'],
      ['note', 'TIME TO VIBE...'],
      ['music', null],
      ['fade', 'out', 0.6],
    ],
  },

  boss_resolve: {
    id: 'boss_resolve', name: "IT'S LIKE THE WIND", music: 'ascend', bg: 'cave_mouth_dawn',
    actors: {
      vaks: { sheet: 'vaks', anim: 'idle', x: 300, y: 226, flip: true },
      big:  { sheet: 'tiko_big', anim: 'loop', x: 150, y: 238, flip: false, scale: 3, head: 'tiko_big' },
      tiko: { sheet: 'tiko', anim: 'loop', x: -80, y: 246, flip: false, head: 'tiko' }, // slides in between them
      coin: { sheet: 'ceppy', anim: 0, x: -40, y: 230, flip: false, scale: 1.4 },     // the mano handed back
    },
    steps: [
      ['show', 'coin', false],
      ['letterbox', true],
      ['fade', 'in', 1.2],
      // frame the two of them square-on for the vibe-off
      ['camera', 224, 210, 1.4, 1.2],
      ['face', 'vaks', -1],
      ['face', 'big', 1],
      ['say', 'vaks', 'OH, YOU WANT TO GO? WENA? IN YOUR OWN CAVE?'],
      // THE DANCE-OFF — both start jiving; the Big One lunges a stamp, Vaks answers
      ['dance', 'big', true, 5],
      ['move', 'big', 182, 238, 0.5],  // stamp in
      ['shake', 4],
      ['dance', 'vaks', true, 7],
      ['shake', 2],
      ['note', 'VAKS STAMPS BACK. THE SMALL ONES GO OOH.'],
      // Vaks trades moves — steps right in on the Big One, kicks back out, jiving
      ['move', 'vaks', 258, 226, 0.55],
      ['move', 'vaks', 296, 226, 0.5],
      // the trades quicken — stamps land on the beat
      ['shake', 3], ['wait', 0.32],
      ['shake', 4], ['wait', 0.3],
      ['move', 'vaks', 252, 226, 0.4],  // steps in beside him for the finish
      ['shake', 3], ['wait', 0.22],
      ['say', 'vaks', "...EY. THAT'S MY MOVE."],
      // THE SYNC — same move, same beat, side by side, then they freeze on it
      ['dance', 'big', false],
      ['dance', 'vaks', false],
      ['anim', 'vaks', 'celeb'],
      ['flash', '#fff8e0', 0.4],
      ['shake', 3],
      ['fx', 'confetti', 2.6],
      ['note', 'THE BEAT LOCKS. THE WHOLE CAVE SWAYS.'],
      ['camera', 214, 202, 1.6, 0.8], // push into the locked groove, both in frame
      ['wait', 0.7],
      // the tiny one slides in between them and loses it — dancing too
      ['teleport', 'tiko', 214, 244],
      ['dance', 'tiko', true, 8],
      ['shake', 1],
      // the music drops out; only the wind
      ['music', null],
      ['fx', 'wind', 2.5],
      ['wait', 1.0],
      ['say', 'vaks', 'm_wind', "...IT'S LIKE THE WIND, BOSS."],
      ['wire', 'm_wind_malawi'], // preserve the boss-resolution follow-up row
      ['dance', 'tiko', false],
      ['anim', 'vaks', 'idle'],
      // the little tsotsi speaks its heart — camera pushes in close on it
      ['camera', 226, 214, 1.7, 0.8],
      ['say', 'tiko', 'I CHASED YOU UP MY WHOLE CAVE THINKING YOU WERE A STRANGER.'],
      ['say', 'tiko', "BUT STRANGERS DON'T VIBE LIKE THAT, BOSS."],
      ['say', 'tiko', 'YOU WERE ONE OF US FROM THE START. WELCOME HOME, MY SON.'],
      // it hands every coin back — the whole pile passes into Vaks's hands
      ['say', 'tiko', 'HERE, BOSS. TAKE YOUR MONEY BACK. ALL OF IT...'],
      ['fx', 'sparkle', 0.4, 214, 228],
      ['teleport', 'coin', 214, 228],
      ['show', 'coin', true],
      ['move', 'coin', 248, 224, 0.5],
      ['sfx', 'shop_buy'],
      ['say', 'tiko', 'WELL. MOST OF IT. BUY A ZAMALEK FOR THE ROAD.'],
      ['show', 'coin', false],
      ['say', 'vaks', 'I WAS ALSO WRONG ABOUT YOU. KEEP HALF OF MY MANO.'],
      ['say', 'vaks', 'PAYING RESPECT TO THE CAVE.'],
      // the Big One points one huge arm at the dawn
      ['camera', 205, 206, 1.35, 1.0],
      ['move', 'big', 132, 238, 1.0],
      ['face', 'big', -1],
      ['note', 'THE BIG ONE POINTS ONE HUGE ARM AT THE DAWN.'],
      ['fx', 'dawn', 2.0],
      // Vaks walks into the light
      ['camreset', 1.0],
      ['move', 'vaks', 380, 226, 1.2],
      ['sfx', 'alert'],                // the phone buzzing again — granny
      ['say', 'vaks', 'THE SUN. THE SUN IS UP, BOSS.'],
      ['say', 'vaks', 'GRANNY...'],
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
      vaks:    { sheet: 'vaks', anim: 'idle', x: 120, y: 236, flip: false },
      vetkoek: { sheet: 'vetkoek', anim: 'loop', x: 382, y: 240, flip: true },
      tallman: { sheet: 'tallman', anim: 'idle', x: 540, y: 226, flip: true },
      shorty:  { sheet: 'shorty', anim: 'idle', x: 566, y: 232, flip: true },
    },
    steps: [
      ['letterbox', true],
      ['fade', 'in', 0.8],
      // hold on the open street in front of the hatch — keep them clear of the shop
      ['camera', 250, 214, 1.3, 1.0],
      ['move', 'vaks', 190, 236, 1.0],
      ['say', 'vetkoek', 'AWEH. YOU MUST BE VAKS.'],
      ['say', 'vaks', '...WHAT IS THIS PLACE?'],
      ['note', 'TALLMAN AND SHORTY SLIDE IN.'],
      // the two slide in from the right, casual, stopping in the street (not the shop)
      ['move', 'tallman', 244, 226, 1.0],
      ['move', 'shorty', 282, 232, 1.1],
      ['say', 'tallman', 'VAKS! MY BRA! LOOKING STRONG! LOOKING FAST!'],
      ['say', 'vaks', "TALLMAN. YOU OWE ME. WHERE'S MY FIFTY RAND. NO STORIES."],
      ['say', 'tallman', 'MONTH END, BRA. YIMA BHUTI.'],
      ['say', 'vaks', "IT'S BEEN MONTH END SINCE FEBRUARY, BOSS."],
      ['face', 'shorty', 1],
      ['say', 'shorty', "I'LL EFT YOU."],
      // both of them bolt off together, cackling — Tallman right behind Shorty
      ['face', 'tallman', 1],
      ['move', 'shorty', 600, 232, 0.9],
      ['move', 'tallman', 600, 226, 1.0],
      ['shake', 1],
      ['say', 'vetkoek', 'BEWARE OF THE TSOTSIS, MY BOSS. AND TAXIS - THEY WILL RUN YOU OVER.'],
      // a distant hooter — Vaks flinches
      ['sfx', 'granny_chase_start', 'horn'],
      ['shake', 1.5],
      ['say', 'vaks', 'SHAP. VAKS IS STRONG.'],
      ['say', 'vaks', 'VAKS ALWAYS HAS RIGHT OF WAY.'],
      // exits frame right on his last word
      ['camreset', 0.5],
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
      vetkoek: { sheet: 'vetkoek', anim: 'loop', x: 382, y: 240, flip: true }, // leans from the hatch
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
      ['chat', 'tallman', "he's coming granny. i saw him. very fast. like a tikoloshh."],
      ['chat', 'shorty', 'i saw him by the shebeen'],
      ['chat', 'vaks', 'SHORTY YOU SNITCH.'],
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
      ['say', 'vaks', 'LET THEM TRY, BOSS.'],
      ['say', 'vaks', '...AND IF THEY STEAL IT, SHORTY WILL BUY ME A NEW ONE.'],
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
      // the crew's live commentary — one text per line, that WhatsApp rhythm
      ['chat', 'tallman', "granny relax, he's coming."],
      ['chat', 'tallman', 'i can see him from the roof.'],
      ['chat', 'tallman', "he's looking strong and irie."],
      ['chat', 'shorty', 'also just saw him'],
      ['chat', 'shorty', 'he jumped a fence and did a backflip.'],
      ['chat', 'shorty', 'small wobble on the landing.'],
      ['chat', 'sys', 'GRANNY IS TYPING...'],
      ['wait', 1.6],
      ['chat', 'sys', '...'],
      ['wait', 0.8],
      ['phone', false],
      ['say', 'vaks', 'm_granny_spy', "JY GRANNY'S SPYING ON ME."],
      ['sfx', 'glass_break'],
      ['shake', 1.6],
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
      tiko:    { sheet: 'tiko', anim: 'loop', x: 404, y: 206, flip: true, head: 'tiko' },
      coin:    { sheet: 'r2', anim: 0, x: 330, y: 224, flip: false, scale: 1.3 }, // the 5c fare
    },
    steps: [
      ['show', 'coin', false],
      ['letterbox', true],
      ['fade', 'in', 0.5],
      ['sfx', 'granny_chase_start', 'horn'],
      ['shake', 2.0],
      // frame the taxi and the crew flagging it down
      ['camera', 320, 224, 1.35, 0.9],
      ['note', 'A HOOTER BLARES. TALLMAN AND SHORTY FLAG THE TAXI.'],
      ['say', 'tallman', "GO, BRA. WE'LL HANDLE THIS. ONE LOCAL, DRIVER!"],
      // Shorty counts the fare into his palm, five cents at a time — push in close
      ['camera', 328, 226, 1.75, 0.6],
      ['show', 'coin', true],
      ['teleport', 'coin', 320, 224],
      ['fx', 'sparkle', 0.25, 320, 224], ['sfx', 'shop_buy'],
      ['move', 'coin', 332, 224, 0.3],
      ['fx', 'sparkle', 0.25, 332, 224], ['sfx', 'shop_buy'],
      // ...and fumbles one — it tumbles to the dirt
      ['move', 'coin', 342, 240, 0.35],
      ['sfx', 'shop_buy'],
      ['say', 'shorty', 'FIVE... TEN... EISH, DROPPED ONE. STARTING OVER.'],
      ['show', 'coin', false],
      ['say', 'vaks', "THAT'S NOT FIFTY, BOSS."],
      ['say', 'tallman', "WE DON'T HAVE YOUR FIFTY, BRA. WE WORKING ON IT."],
      // the camera drifts up to the taxi roof — a tikolosh is riding along, waving
      ['camera', 404, 208, 1.7, 0.9],
      ['dance', 'tiko', true, 6],
      ['note', 'ON THE TAXI ROOF, UNNOTICED: A TIKOLOSH, RIDING ALONG. IT WAVES.'],
      ['wait', 1.0],
      // back to Vaks, who has clearly seen it
      ['dance', 'tiko', false],
      ['camera', 224, 224, 1.5, 0.7],
      ['note', 'VAKS BLINKS. SAYS NOTHING.'],
      ['camreset', 0.6],
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
      ['say', 'vaks', 'LOOK GRANNY. THERE WAS A CAVE.'],
      ['say', 'vaks', 'THERE WAS A TIKOLOSH.'],
      ['say', 'vaks', 'THERE WERE TAXIS AND TSOTSIS. WAIT...'],
      ['wait', 0.6],
      // the weak dance — up and immediately stopped
      ['anim', 'vaks', 'celeb'],
      ['fx', 'sparkle', 0.8],
      ['say', 'vaks', '...VIBE WITH ME GRANNY?'],
      ['anim', 'vaks', 'idle'],
      // THE POINT — granny stares, one sparkle on the rake, then finally speaks
      ['anim', 'granny', 'stare'],
      ['shake', 1.2],
      ['fx', 'sparkle', 0.5, 330, 240],
      ['wait', 0.8],
      ['say', 'granny', 'TIME TO VIBE VAKS.'],
      ['say', 'vaks', 'OKAY... THE PLAAS NEEDS ITS BAAS.'],
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
      tiko:   { sheet: 'tiko', anim: 'loop', x: 360, y: 250, flip: true, head: 'tiko' },
    },
    steps: [
      ['show', 'teacup', false],
      ['show', 'tiko', false],
      ['letterbox', true],
      ['fade', 'in', 1.0],
      ['note', 'THE PLAAS, TENDED. VAKS RAKES THE ROWS, CAP SKEW.'],
      ['camera', 202, 232, 1.3, 2.2],   // slow, warm push on the tended plaas
      ['wait', 0.8],
      // granny walks the rows, pausing to inspect
      ['camera', 300, 236, 1.15, 1.2],
      ['move', 'granny', 340, 248, 1.0],
      ['anim', 'granny', 'stare'],
      ['wait', 0.7],
      ['anim', 'granny', 'idle'],
      ['move', 'granny', 250, 248, 1.0],
      // the crooked row: she stops and looks at him
      ['anim', 'granny', 'stare'],
      ['wait', 0.6],
      ['face', 'granny', -1],
      ['note', 'GRANNY WALKS THE ROWS.'],
      // Vaks hurries over and re-rakes it
      ['camera', 236, 236, 1.4, 0.9],
      ['move', 'vaks', 232, 252, 0.6],
      ['sprite', 'vaks', 'vaks_rake', 'loop'],
      ['fx', 'sparkle', 0.4, 244, 240],
      ['anim', 'granny', 'idle'],
      ['move', 'granny', 208, 248, 1.0],
      ['wait', 1.2],
      ['say', 'granny', 'HMMPH. ...GOOD BOY, VAKS.'],
      ['say', 'vaks', 'm_baas_plaas'],
      // she hands him the tea — the cup passes from her hand into his
      ['camera', 220, 236, 1.6, 0.9],
      ['teleport', 'teacup', 214, 248],
      ['show', 'teacup', true],
      ['fx', 'sparkle', 0.3, 214, 244],
      ['move', 'teacup', 228, 250, 0.6],
      ['fx', 'sparkle', 0.4, 228, 244],
      ['move', 'granny', 470, 248, 1.6],
      ['show', 'granny', false],
      // golden hold on Vaks alone with his tea
      ['camera', 232, 232, 1.7, 1.6],
      ['fx', 'dawn', 2.0],
      ['wait', 1.6],
      // behind the fence, the tikolosh springs up holding a ceppie
      ['camera', 298, 234, 1.35, 0.3],
      ['teleport', 'tiko', 360, 260],
      ['show', 'tiko', true],
      ['move', 'tiko', 360, 248, 0.2],
      ['flash', '#fff8e0', 0.3],
      ['shake', 2],
      ['say', 'tiko', 'm_spying', "MY BOSS! I'M SPYING ON YOU BOSS!"],
      ['wait', 0.5],
      ['smash', 'garden_thursday'],
      ['camreset', 0.01],
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
  vetkoek: { face: 'face_vetkoek', name: 'VETKOEK' }, // spaza-window fat-cake vendor (W2), his own man
  tallman: { face: 'face_tallman', name: 'TALLMAN' },
  shorty: { face: 'face_shorty', name: 'SHORTY' },
  masi: { face: 'face_masi', name: 'MASI' },
  imo: { face: 'face_imo', name: 'IMO' },
  rasta: { face: 'face_rasta', name: 'RASTA' },
};
