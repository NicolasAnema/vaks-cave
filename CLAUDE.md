# CLAUDE.md

## Project

Vak's Cave: a complete, finished 2D pixel-art platformer in two acts, a vertical climb world and a horizontal chase world, with cutscenes, full menus and UI, a shop, and a wired-in meme manifest. DESIGN.md is the source of truth for content and mechanics. Where DESIGN.md is silent, make a strong call yourself and keep it consistent across the codebase.

## Stack (constraints locked, choice open)

- The engine is your call: vanilla Canvas, Kaplay, Phaser, or anything else you can fully vouch for. Justify the choice in your plan. If there is any uncertainty about a library's current API, choose vanilla Canvas and own the whole renderer.
- Whatever you choose: the game runs from a plain static server (`npx serve`) at the repo root. No build step, no install step. Dependencies are either zero or loaded from a CDN with pinned versions.
- index.html plus JS modules. Levels, cutscene scripts, and the meme manifest are pure data, separate from engine and systems code. Levels declare their orientation (vertical or horizontal).
- One engine core serves both worlds: movement, camera, and threat systems read the level's orientation rather than forking into two codebases.

## Hard rules

- No external asset files of any kind. All visuals are code-generated (pixel arrays, drawing routines, or runtime-generated sprite sheets). All audio routes through the AudioManager stub; never load or reference an audio file.
- Every voice line renders as a bark (on-screen text) wired to its audio event, so the comedy ships in the silent build.
- The meme manifest in DESIGN.md lands in full: every row wired to a trigger. In debug mode, log a coverage report on boot; ship with zero unwired rows.
- Gameplay controls are locked: arrow keys (including up/down for ladder climbing), spacebar, M to meow. Enter confirms and skips cutscenes, Esc pauses. Plus the debug keys.
- Granny's base speed must stay below Vaks's run speed. Clean play always escapes; she punishes mistakes.
- Zero console errors or warnings on boot and during play.
- All gameplay tunables live in one CONFIG object at the top of the codebase.
- Every audio event listed in DESIGN.md must exist and fire at the correct moment, even though silent.

## Definition of done

- Boots clean from a static server with an empty console
- The full loop is completable: title -> cold open -> levels 1 through 6 with shops between -> boss -> ending -> credits -> menu
- Every menu is navigable end to end by keyboard: main menu, level select, jukebox, scene gallery, settings (settings apply within the session), pause
- Every cutscene plays, skips with Enter, and unlocks in the gallery
- The manifest coverage report shows zero unwired rows
- Every level is beatable, verified mathematically per orientation: in World 1, every platform and ladder is reachable given the jump and climb physics in CONFIG, and the mist rise rate permits a clean route to the top; in World 2, every gap clears given jump physics, and granny's speed permits escape
- The two movement grammars feel distinct: the climb reads as deliberate, the sprint reads as urgent
- Debug keys work: 1-6 level jump, B boss, C cutscene cycle, I invincibility, T threat freeze
- Stable 60fps on a mid-range laptop
