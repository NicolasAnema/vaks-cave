# Vak's Cave - Story Review

This is the working checklist for the cutscene-by-cutscene story pass. `DESIGN.md` remains the source of truth for the finished game. This file tracks discussion, approvals and unfinished work so approved material is not accidentally rewritten.

## Ground rules

- Watch the existing scene before planning changes.
- Preserve the user's dialogue unless a specific line change is requested.
- Fix story clarity with staging and graphics before adding exposition.
- Give every scene a readable entrance, development and exit into gameplay.
- Keep Vaks present and reacting during conversations.
- Use South African character humour: dry, chaotic and specific rather than cute.
- Keep Vaks and the Tikolosh hostile until the vibe-off earns mutual respect.
- Be audacious within the 2D pixel-art, code-generated visual language.
- Lock approved dialogue before polishing graphics and timing.

## Scene workflow

For each scene:

1. **Watch** - review the current scene from beginning to end.
2. **Story pass** - agree on:
    - how Vaks arrives;
    - what he wants;
    - what changes or goes wrong;
    - the main joke;
    - how the scene hands off to the next level or scene.
3. **Dialogue pass** - the user revises the text; approved lines are then locked.
4. **Blocking pass** - stage entrances, reactions, eyelines and both sides of conversations.
5. **Graphics pass** - improve backgrounds, props, effects and visual jokes.
6. **Timing pass** - tune holds, camera movement, voice notes and music.
7. **Review** - watch the implemented scene together and make focused notes.
8. **Verify** - run `node tools/check.mjs` and confirm a clean preview.

## Status key

- `[x]` approved/completed
- `[>]` next or currently being revised
- `[ ]` not reviewed

## Act 1 - The Cave

- **THURSDAY WAS BIG** (`cold_open`)
    - Story, dialogue, blocking, graphics and voice-note timing revised.
    - Establishes the jol, the fall, Granny and the hostile Tikolosh.
- **THE HOLE IN THE WALL** (`hole_wall`)
    - Shop discovery, Spaza encounter, fright, pricing and warning revised.
    - Approved dialogue preserved.
- **THE GREEN LUNG** (`green_lung`)
- **THE FOLLOWER** (`follower`)
- **LOAD SHEDDING** (`load_shedding`)
- **THE CAVE MOUTH** (`boss_intro`)
- [>] **IT'S LIKE THE WIND** (`boss_resolve`) - current

## Act 2 - Above Ground

- **ONE FOR THE ROAD** (`chase_begins`)
- **THE COMMENTARY** (`ss_commentary`, mid-level scene)
- **BABALAS ECONOMICS** (`babalas_economics`)
- **SMALL CHANGE** (`ss_small_change`, mid-level scene)
- **AIRTIME** (`airtime`)
- **THE WALL** (`ss_the_wall`, mid-level scene)
- **CORNERED AT THE PLAAS** (`granny_corner`)
- **BAAS VAN DIE PLAAS** (`ending`)

## Whole-story checks

- Every cutscene clearly connects to what happened immediately before it.
- Every cutscene clearly motivates what the player does immediately afterward.
- Vaks and the Tikolosh relationship escalates consistently toward the vibe-off.
- Granny's pressure is felt before the above-ground chase begins.
- Recurring jokes develop or pay off instead of merely repeating.
- Shops and side scenes feel like part of the journey, not detached sketches.
- The ending pays off Granny, the cave escape and the earned Tikolosh respect.

## Current Review

### IT'S LIKE THE WIND

Scene ID: `boss_resolve`

Status: Implemented; awaiting visual approval.

#### Story objective

- Continue from the exact final frame of CAVE FM instead of starting a second dance-off.
- Let Big Tikolosh acknowledge that Vaks survived the cave and earned respect through the vibe-off.
- Pay off `VIBE WITH ME`, `IT'S LIKE THE WIND`, `VIVO VICEROY` and the sincere use of `MY BOSS`.
- Return the stolen money sack and send Vaks directly into the above-ground story.

#### Revised scene

1. The converted crowd is still celebrating, but Big Tikolosh tries to remain serious while his foot taps against his will.
2. Vaks calls out the foot. Big Tikolosh denies it; the foot taps again.
3. The music drops. Wind carries the last rhythm through the cave toward the dawn.
4. Big Tikolosh delivers a monologue about the township dronkies who entered his cave and never made it out. Quick relic cutaways show an abandoned Zamalek, one vellie and car keys.
5. He tells Vaks that today he showed the power of vibing with him.
6. Vaks returns the original challenge: `VIBE WITH ME.`
7. Big Tikolosh declares that Vaks has earned respect amongst the Tikoloshes.
8. Big Tikolosh calls `VIVO VICEROY!`; the crowd answers `VICEROY!!`
9. Big Tikolosh shrinks back into the familiar thief who stalked Vaks through the cave.
10. The Tikolosh returns the actual stolen money sack and orders Vaks out before he changes his mind.
11. Dawn fills the cave mouth. Granny's phone alert sounds and Vaks realises how late he is.
12. The Tikolosh sends him off with the first sincere `RUN, MY BOSS.`

#### Dialogue

- `HAIBO. EVEN YOUR FOOT KNOWS, BOSS.`
- `SHUT UP, VAKS.`
- `...IT'S LIKE THE WIND, BOSS.`
- `VAKS. MANY TOWNSHIP DRONKIES HAVE FALLEN INTO MY CAVE.`
- `THEY COME IN SHOUTING. THEY COME IN DRINKING.`
- `THEY NEVER MAKE IT OUT.`
- `BUT TODAY, VAKS...`
- `YOU SHOWED ME THE POWER OF VIBING WITH YOU.`
- `VIBE WITH ME.`
- `YOU HAVE EARNED RESPECT AMONGST US TIKOLOSHES.`
- `VIVO VICEROY!`
- `VICEROY!!`
- `TAKE YOUR MANO.`
- `NOW GET OUT OF MY CAVE BEFORE I CHANGE MY MIND.`
- `YOH. THE SUN IS UP.`
- `GRANNY...`
- `RUN, MY BOSS.`

#### Graphics

- Persistent CAVE FM booth and converted crowd.
- Two foot-tap close-ups with no explanatory caption.
- The booth drops out after the first foot insert so the opening exchange plays
  with complete bodies instead of floating heads.
- A wider two-character monologue frame keeps both Big Tikolosh and Vaks visible.
- Portrait-free dialogue panels size themselves to the text; photographic heads
  remain sharp and are masked cleanly behind the UI.
- Wind moving dust and loose cave debris toward dawn.
- Three dark relic inserts: Zamalek, vellie and car keys.
- Vaks returning the challenge with his existing raised-hand sprite.
- A contracting dust transformation from Big Tikolosh back into the familiar small Tikolosh.
- The stolen money sack visibly handed back to Vaks, then carried out with him.
- Dawn light and the vibrating phone motivating the Act 2 transition.

#### Removed

- The redundant second dance-off.
- A duplicate small Tikolosh standing beside Big Tikolosh.
- `WELCOME HOME, MY SON.`
- The half-mano and cave-respect exchange.
- Explanatory action captions.
- The stray coin return.
