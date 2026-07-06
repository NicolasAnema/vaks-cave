# VAK'S CAVE - Design Document

This document is the source of truth for WHAT the game is. Where it is silent (level layouts, enemy and chase behavior, code architecture, cutscene direction, game feel details), the builder makes strong, consistent calls. Everything in this document ships in the one-shot build except audio playback, which is stubbed.

## Pitch

A 2D pixel-art platformer in two acts, shipped as a finished indie game: cutscenes, full menus and UI, a shop, polish. Vaks, a legendary Xhosa gardener, wakes up babalas at the bottom of a cave after a big Thursday session. Act one: he climbs out, Donkey Kong style, with the Tikolosh's mist rising beneath him and Thursday's bottles tumbling down the platforms. At the cave mouth he learns the truth: the Tikolosh was never hunting him. It's like the wind. Act two: the real chase. He is late for work, granny has spotted him, and he sprints through the township to reach the plaas and look busy before she catches him.

Tone: a genuinely good platformer carrying a layer of inside jokes. The comedy lives in the mechanics, the barks, and the easter eggs. Game feel comes first.

## Core loop (locked)

Two movement grammars, one per world. Gameplay inputs: arrow keys, spacebar (jump), W (meow). Enter confirms in menus and skips cutscenes; Esc pauses. Lives: start with 3, mid-level checkpoints, ceppies grant extras.

### World 1: the climb (vertical)

- Camera scrolls upward. Zigzag platform shafts connected by ladders and root-vines.
- Left/right moves, up/down climbs ladders, spacebar jumps.
- The Tikolosh mist rises steadily from below. Touching it means caught: lose a life. Hesitation kills (this carries the pressure that crumbling floors gave the original horizontal design).
- Bottles tumble down the platform zigzags as the rolling hazard (the Donkey Kong barrel analog, themed as Thursday's debris).
- Some platforms crumble shortly after Vaks stands on them (a platform type, used for spice).
- Reach the exit at the top of the shaft.

### World 2: the sprint (horizontal)

- Camera scrolls right. Granny chases from the left edge of the screen.
- Left/right moves, spacebar jumps.
- Granny periodically faints ("granny faints because she works too hard, she needs to rest"), creating a safe window to bank distance or grab pickups.
- Reach the level exit before she catches you.

Meow (W): Vaks meows. Cosmetic bark, and rats within a small radius flee briefly.

Difficulty dials: mist rise speed / granny speed, platform and gap spacing, hazard density, darkness (World 1), faint frequency and length (World 2).

## Structure

World 1: The Cave (levels 1-3), vertical, ends at the cave-mouth boss.
World 2: The Township (levels 4-6), horizontal, ends at granny's plaas.
After every level clear, the Tikolosh shop appears before the next level loads.

### Level sketch

1. **Shallow shaft.** Teaches move, jump, and climb. Slow mist, sparse bottles. The intro Tikolosh looms visibly in the mist below, heavily telegraphed.
2. **Weed biome shaft.** Irie power-up introduced; the Irie Tikolosh drifts lazily across platforms. Faster mist, more bottles. Overstack taught here.
3. **The deep.** Dark shaft, cat eyes auto-activate, Shadow Tikoloshes patrol platforms and are visible only inside the glow, rats on ledges, crumbling platforms throughout. The top of the shaft opens into the boss arena at the cave mouth.

**BOSS: Big Tikolosh.** A vibe-off at the cave mouth. Vaks stops climbing, turns to face it, and the player must hold ground and time inputs to a rhythm as it approaches. Succeed and it calms. "It's like the wind." Dawn breaks and Vaks steps onto the surface. (Design intent: the mist and the variants always behaved like weather rather than hunters; the player only realises this here.)

4. **Township outskirts, dawn.** Granny spots Vaks emerging and the chase begins. Gentle granny speed, generous faint windows, sushi hazards introduced.
5. **Kasi main street.** Faster granny, rats, denser hazards, kasi flavor in the backgrounds (taxis, washing lines, the ringing payphone, a TV showing Kaizer Chiefs). Tallman and Shorty cameo at checkpoints, including one scripted beat where they stall granny over their debts, buying Vaks a window.
6. **Home stretch.** Fastest granny, short faints, every hazard stacked. Ends in the garden: Vaks grabs the rake and looks busy the instant before granny arrives. "Ek is die baas van die plaas." Closing beat: back at work by Thursday, spying on his bosses.

## Cutscenes and story beats

A data-driven cutscene system: scripts are data, like levels. Staged character sprites with movement and timing commands, typewriter dialogue boxes with pixel portraits, letterbox bars, and screen effects. Every cutscene is skippable with Enter and replayable from the scene gallery once unlocked.

1. **Cold open** (before L1). Black screen, snoring. Vaks wakes at the bottom of the cave, babalas. "It's a big days boss... I'm feeling lazy because babalas yesterday. Big party! Dancing, smoking, drinking." He recalls going deep ("I'm going deep today boss, I'm going deep"). He looks up at a distant speck of light. The mist stirs below.
2. **Doubt beats** (short interstitials after L1 and L2). Two or three dialogue lines each. The Tikoloshes keep missing him, and keep herding him toward ceppies and bottles. Doubt creeps in.
3. **Boss intro** (top of L3). The Big Tikolosh fills the cave mouth. "Your cat is gonna dieeee." Then the prompt: "vibe with me."
4. **Boss resolution.** The vibe lands, the Tikolosh calms, wind ripples through the arena. "It's like the wind." Dawn light pours in.
5. **Chase begins** (world transition). Vaks steps into the dawn, stretches, sees the township below. Granny appears on the ridge. The stare. "I'm coming boss, I'm coming boss!" He runs.
6. **Ending and credits.** The garden. Rake grab, instant innocent gardening pose. Granny arrives and finds him hard at work. "Ek is die baas van die plaas." Smash cut: Thursday again, Vaks filming his bosses from the bushes. "I'm spying on you boss." Credits roll.

## The Tikolosh shop

After each level clear, a calm shopkeeper Tikolosh waits in a lantern-lit nook. Spend ceppies on: an extra life, an irie stash (start the next level holding one weed), and a faint charm (World 2 only: granny's next faint lasts longer). First-visit bark: "Hey Tikolosh, why you not told me when you're going to shop?" The shopkeeper is friendly from level 1 onward and quietly foreshadows the boss resolution.

## Menus and UI

All UI in the same refined pixel style, fully navigable by keyboard.

- **Title screen:** animated garden scene with parallax, Vaks raking. Bark: "Eyta boss, look at your garden, so beautiful, super day."
- **Main menu:** Play (continue / new game), Level select (unlocked progressively), Jukebox, Scene gallery, Settings, Credits.
- **Jukebox:** lists the music slots by name, selectable now, silent until tracks are uploaded. Bark: "New song, listen to this."
- **Scene gallery:** replay any unlocked cutscene.
- **Settings:** master, music, and voice volume sliders (functional, ready for audio), screen shake toggle, bark text speed.
- **Loading screen:** progress bar, music slot, rotating Vaks tips ("Tip: granny faints because she works too hard").
- **HUD:** lives as cap icons, ceppy counter, score, irie meter with an overstack warning state, and a threat gauge (mist depth in World 1, granny distance in World 2).
- **Pause menu:** resume, restart level, settings, quit to menu.
- **Level intro cards:** level name plus a meme tagline.
- **Level clear screen:** time, ceppies collected, deaths.
- **Death/respawn and game over screens.**

## Bark system

The build ships silent, so every voice line renders as a bark: a pixel speech bubble above the speaker, or a subtitle bar for off-screen lines. Bark text is the actual quote. Barks fire through the same AudioManager events, with per-event cooldowns so they never spam. When real audio lands later, barks remain as subtitles.

## Meme and easter egg manifest

Every row must be wired to a trigger. In debug mode the game logs a coverage report on boot listing any unwired row; the build ships with zero unwired rows.

| Line / meme | Trigger / placement |
|---|---|
| "It's a big days boss... babalas yesterday. Big party!" | Cold open |
| "I'm going deep today boss, I'm going deep" | Cold open flashback |
| "Irie for safari" | World 1 level start variant |
| "Ek is die baas van die plaas" | World 2 level start variant, ending |
| "Enjoy your tea party" / "Every Tuesday" / "Culud Vaks" / "live for faam" | Level start variant pool |
| "It's good to be feel irie" | Irie pickup |
| "Smoke ganja every day" / "this is all my ganja" / "lucky stick" | Irie pickup variant pool |
| "Where's my ganjaaa" | Approaching a weed pickup |
| "This thing is too strong, boss" | Overstack state |
| Cat / dog / bird "gonna die, eat poison" trio | danger_close_1/2/3, escalating threat proximity |
| "Your cat is gonna dieeee" | Boss intro |
| "Vibe with me" | Boss vibe prompt |
| "It's like the wind" | Boss resolution |
| "How's the Wind of Malawi" | Boss resolution follow-up bark |
| "Rrrattax!" | Rat appears |
| "I'm not scared boss, I can kill it" | Rat stomped |
| "You are a fish! Careful!" | Hazard warning near water or gaps |
| "I'm coming boss, I'm coming boss" | Respawn, chase-begins cutscene |
| "I'm finished your room my boss" | Level clear |
| "Chao" | Death stinger, scene transitions |
| "Where's my boss?" | Checkpoint reached |
| "Hey Tikolosh, why you not told me when you're going to shop?" | First shop visit |
| Per-item shop quips ("Where's my ten rand ganja?", "Kaizer Chiefs hat!", etc.) + general muttering | Browsing a shop item |
| "Eish, I'm broke, boss. Tallman still owes me money." | Tried to buy without enough mano |
| "Granny faints because she works too hard, she needs to rest" | Granny faint |
| "Tell your gogo she must not disturb me" | Granny caught / chase bark |
| Granny spy lines | Chase start, granny stare telegraph |
| "Tallman owes me money, he's a crook" | Tallman NPC |
| "Shorty steal my plate, he's a crook" | Shorty NPC |
| "That lytie is stout" | Shorty NPC follow-up |
| "I'm a cat now boss, meow" / "meeoww" / "you forget to buy your cat, say meow" | W key meow, variant pool |
| "Eyta boss, look at your garden, so beautiful, super day" | Title screen |
| "Hello boss... I'm good, I'm good, I'm good. Chao." | Idle check-in pool |
| "It's you" / "what's up boss" / "life update" / "status like" | Idle check-in pool (menus, standing still) |
| "Listen up boss" | Tutorial prompts |
| "New song, listen to this" | Jukebox |
| "America, I know you heard. Pick up the phone." | Rare: ringing payphone in level 5 |
| Peter Piper tongue twister | Rare random bark |
| "The video is cutting" | Rare: brief fake screen-glitch gag |
| "You're a zombie servant" | Rare random bark |
| "Why not go to school? You must got to school!" | Rare: school building in township background |
| Kaizer Chiefs / TV | Background easter eggs: TV in a window showing a match, billboard |
| Sushi = "china's food" | Sushi hazard, bark on first hit |
| Yellow cat eyes | Night vision mechanic, level 3 |
| Ceppies | Collectible caps |
| "I'm spying on you boss" | Ending smash cut |
| "Eita! Tsotsi ahead, boss!" / "These okes want my boss phone" | Tsotsi first sighted in a level |
| "Hey! It's my boss's phone!" / "Not the phone, bra!" | Phone snatcher contact (steals mano) |
| "Viceroy?! No ways, I'm on duty!" / "That stuff gives babalas, bra" | Viceroy pusher forces a sip |
| "Sit down, tsotsi" / "I'm not scared of tsotsis, boss" | Tsotsi stomped and stunned |
| "He's got me, boss! He's got me!" / "Let go, bra! My boss needs me!" | Tsotsi grabs Vaks (mash to break free) |

## Player states

- **Normal**
- **Irie** (weed pickup): roughly 4 seconds where the world slows around Vaks while he keeps near-full speed. In World 1 the mist and bottles slow; in World 2 granny slows. Warm psychedelic tint.
- **Too strong** (grabbing a second weed while already irie): about 2 seconds of wobble, loose or swapped controls, screen sway. Especially dangerous mid-climb.
- **Babalas**: cosmetic state for the cold open and respawn flavor only.

## Collectibles and hazards

- **Ceppies (caps):** main collectible and shop currency, score plus an extra life per N collected
- **Weed:** the power-up (see player states)
- **Bottles** (World 1): tumble down the zigzag, knock Vaks off platforms on contact
- **Tikolosh mist** (World 1): rises steadily, instant catch on contact
- **Sushi** (World 2): touch damage, "china's food"
- **Rats:** small ground enemy, stompable, flee from meows, both worlds
- **Tsotsis** (World 2): township gangsters working their stretch of street. Contact = **grabbed**: Vaks is pinned to the tsotsi and must mash arrows/space to wrestle free while granny keeps coming — the hold is the punishment. Three kinds: the **phone snatcher** (knife: chases when close, drains mano the whole time he holds you), the **gunman** (holds his corner, telegraphs with a muzzle glint, fires a slow jumpable bullet that hurts; his grab is a hold-up), and the **viceroy pusher** (shuffles over; wriggle free of him and you're babalas anyway — he got a sip down). The grip auto-slips after a few seconds so there is no soft-lock; granny is the cost. All stompable — they sit down hard and see stars, never die. Chase speed sits below Vaks's run speed, so clean play always escapes.
- **Granny** (World 2): the chaser, see granny system
- Crumbling platforms, gaps, darkness (World 1)

## Tikolosh system (World 1)

The mist is the Tikolosh's presence and the constant pressure. Variants behave like weather, each themed to its shaft and testing one skill:

- Intro Tikolosh (L1): looms in the mist, telegraphed
- Irie Tikolosh (L2): lazy unpredictable drift across platforms
- Shadow Tikolosh (L3): patrols platforms, invisible without cat eyes
- Shopkeeper Tikolosh: friendly, between levels
- Big Tikolosh (boss): the vibe-off

## Granny system (World 2)

- Chases from the left. Her base speed sits below Vaks's run speed, so clean play always escapes; she punishes hesitation, fumbled jumps, and hazard hits.
- When close she telegraphs with a brief stare, then a short speed burst. The stare is the player's readable warning.
- Faint windows: she stops fully. Frequency and length shrink per level.
- Caught: lose a life, respawn at the checkpoint with granny reset to the screen edge.

## Cat eyes

In dark zones (level 3) Vaks's yellow cat eyes activate automatically: a glow radius lights the platforms around him and reveals Shadow Tikoloshes.

## Art direction

Refined pixel art: modern indie warmth at a readable resolution.

- Character sprites around 32px base, rendered crisp at integer scale, with multi-frame animations (idle, run, jump, climb, land, celebrate, babalas stumble).
- Rich palettes (roughly 24-40 colors per world), soft dithering in backgrounds, ambient lighting. Avoid chunky low-res 8-bit.
- World 1: browns, greens, dark warm cave tones; the mist a sickly green haze; lantern and crystal light sources. World 2: warm dawn township light, long shadows.
- Parallax backgrounds, at least 3 layers per world. Ambient particles: mist wisps and dust in the cave, leaves and smoke in the township.
- Vaks: light blue jersey as the single high-contrast pop so he always reads on screen, cap, yellow cat eyes.
- Tikoloshes: horned silhouettes, sickly green accents. Granny: small, quick, headscarf silhouette, instantly readable against the dawn palette.
- ALL visuals are generated in code: pixel arrays, drawing routines, or runtime-generated sprite sheets, the builder's choice of technique. No external image files.

## Juice and polish

- Squash and stretch on jump and land, dust puffs on landing, hit-stop frames on damage.
- Screen shake (toggleable in settings) on impacts and granny's speed bursts.
- Smooth camera follow with lookahead: upward bias in World 1, forward bias in World 2.
- Irie state: world desaturates into a warm psychedelic grade. Cat-eye glow: soft radial light in darkness. Bottle shatter particles.
- Animated tiles (flickering lanterns, swaying vines, township washing lines).
- Scene transitions: pixel wipes and fades between all screens.

## Audio architecture (stubbed, zero audio files in v1)

A central AudioManager. Every sound is a named event routed through it, and every voice event also drives a bark. In v1 nothing plays (optional: tiny synth blips for core feedback), but every event must fire at the correct moment and log when debug mode is on. A manifest (JSON) maps event name to bark text plus a future filename, so real voice notes drop in later with zero code changes.

Required events: level_start, world_transition, powerup_irie, powerup_overstack, danger_close_1, danger_close_2, danger_close_3, bottle_spawn, rat_appear, rat_stomp, hazard_warning, respawn, level_clear, death, boss_vibe, boss_resolve, granny_chase_start, granny_faint, granny_caught, checkpoint, shop_enter, shop_browse, shop_buy, meow, idle_checkin, npc_tallman, npc_shorty, menu_idle, tutorial_prompt, jukebox_select, easter_egg_rare, glitch_gag, ending, tsotsi_alert, tsotsi_shoot, tsotsi_stomp, tsotsi_drink, tsotsi_grab. Plus music slot hooks: title, loading, world1, world2, boss, ending.

## Screens and flow

Boot -> title -> main menu -> loading screen -> cold open -> L1 -> shop -> L2 -> shop -> L3 -> boss intro -> boss -> resolution -> chase begins -> L4 -> shop -> L5 -> shop -> L6 -> ending -> credits -> back to menu. Pause available in all gameplay. Level select, jukebox, gallery, settings, and credits reachable from the main menu. The camera system handles both orientations cleanly.

## Debug mode (required)

- Keys 1-6: jump to that level
- B: jump to boss
- C: cycle cutscenes
- I: invincibility toggle
- T: freeze the active threat (mist or granny)
- Debug overlay showing fps and last fired audio event
- On boot in debug mode: log the manifest coverage report (any unwired rows)
- All gameplay tunables (gravity, jump velocity, climb speed, move speed, mist rise rate, granny speeds, faint timing, bottle spawn rate, irie duration, glow radius, bark cooldowns, etc.) live in ONE config object at the top of the codebase.
