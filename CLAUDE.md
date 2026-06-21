# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Vak's Cave — a finished 2D pixel-art platformer in two acts (a vertical Donkey-Kong climb out of a cave ahead of rising mist, then a horizontal township sprint from granny). Pure vanilla Canvas: **zero dependencies, zero build step, all visuals generated in code** (no image asset files). `DESIGN.md` is the content/mechanics source of truth; `README.md` covers controls and player-facing detail.

## Commands

- **Run the game:** `npx serve .` from the repo root, then open the printed URL. There is no install or build step. `package.json` has no scripts.
- **Verify (do this after any gameplay change):** `node tools/check.mjs` — imports the full module graph in Node, prints the manifest coverage table (must be **52/52 wired, 0 unwired**) and re-proves every level beatable from CONFIG physics. Exits non-zero on failure.
- **Regenerate audio index** after adding/removing files under `assets/audio/`: `node tools/audio_index.mjs` (rewrites `assets/audio/index.json`).
- **Headless play-test:** `tools/drive*.mjs` are CDP drivers for headless Edge that press real keys, screenshot, and fail on any console error/warning. Launch Edge with `msedge --headless --remote-debugging-port=9333 --user-data-dir=%TEMP%\vaks-edge-cdp` first. They use Node's built-in WebSocket (no deps).

## Architecture

**No-DOM-at-top-level rule.** Every module's top level must be DOM-free so the whole game imports cleanly under Node (that's how `check.mjs` works). Browser-only work goes inside `boot()` in [src/main.js](src/main.js), which only runs when `typeof document !== 'undefined'`. Don't touch `window`/`document`/`Audio` at module scope.

**One CONFIG, one physics model.** [src/config.js](src/config.js) holds *every* gameplay tunable in one object (hard rule — don't scatter magic numbers into game code). Level *geometry* lives in [src/data/levels.js](src/data/levels.js); everything that changes how the game *plays* lives in CONFIG. `jumpStats(speed)` in config.js is the canonical ballistic math — it is used both by the level builders that *construct* layouts and by the verifier that *checks* them, so the math that builds is the math that proves.

**One engine, two orientations.** A level declares `orientation: 'vertical' | 'horizontal'`. The single [src/game/level.js](src/game/level.js) `LevelScreen` reads orientation rather than forking — movement, camera, threats (Mist vs Granny), and hazards branch on it. Don't create a second level runtime for World 2.

**Screen manager + linear flow.** [src/main.js](src/main.js) has a tiny stack-based screen manager `M` (each screen is an object with `update(dt)`/`draw(ctx)`; `M.replace` does pixel-wipe transitions, `M.push`/`M.pop` for overlays like pause). The whole game is the `FLOW` array (cutscene → level → shop → boss → … → credits); `goFlow(i)` dispatches each node type. Run state (`lives`, `mano`, `hats`, charms) lives in a single `run` object threaded into screens; progress persists via [src/systems/save.js](src/systems/save.js) (localStorage).

**Fixed-timestep loop.** 1/60s steps with accumulator, max 4 steps/frame, render after. `Input.endFrame()` is called per step so `Input.wasPressed()` edge-detection works.

**The meme manifest + bark system** (the comedy engine — read [src/systems/audio.js](src/systems/audio.js) and [src/data/manifest.js](src/data/manifest.js)):
- Every voice line is a row in `MANIFEST` (id, text variants, audio event, trigger, future filename). 52 rows.
- Call sites claim a row at *module-init* time via `Barks.wire(rowId, where)`, which returns a fire function. Rows referenced only from pure data (cutscene scripts) are registered by the data scanner `wireDataRows()` in main.js. The boot **coverage report** lists any row nobody wired — the build invariant is **zero unwired rows**. If you add a manifest row, you must wire it or `check.mjs` fails.
- `Barks.fire()` shows on-screen text (speech bubble anchored to an entity, or bottom subtitle) **and** calls `AudioManager.play(event)`. The silent build is fully playable: barks always render as text even with no audio files.

**Audio is optional drop-in.** [src/systems/audio.js](src/systems/audio.js) `AudioManager` routes every sound through named events. Real files placed under `assets/audio/` and listed in `index.json` play automatically (voice notes punch above music via a Web Audio gain graph, since `HTMLMediaElement.volume` caps at 1.0); with the folder empty the game stays silent, playable, and console-clean. Never hard-require an audio file.

**Levels are constructed-then-proven.** The builders in [src/data/levels.js](src/data/levels.js) use a seeded RNG and actively *guarantee* connectivity (each platform is within a CONFIG-derived jump reach of the previous, or joined by a ladder). [src/verify.js](src/verify.js) then independently re-proves it from the emitted data: World 1 builds a reachability graph (jump arcs from the real ballistic equations + ladder links), checks every platform reachable, Dijkstras the spawn→exit route, and compares route×safety-margin against the mist rise time (and per-checkpoint restart). World 2 checks every gap/raised platform against the run-speed arc and that granny's burst-cycle *average* speed stays below `runSpeed`. **Granny/threats must never out-run clean play** — that's a load-bearing invariant the verifier enforces.

## Directory map

- `src/engine/` — renderer (`render.js`, fixed 480×270 internal view scaled to the canvas), `camera.js`, `input.js`, bitmap `font.js`, code-generated `sprites.js`, parallax `bg.js`, `particles.js`.
- `src/game/` — `player.js`, `threats.js` (Mist + Granny), `entities.js` (rats, bottles, tsotsis, pickups…), `level.js` runtime, `boss.js` (rhythm vibe-off), `cutscene.js` player, `shop.js`.
- `src/data/` — `levels.js`, `cutscenes.js`, `manifest.js`, `audio_map.js` (filename aliases), embedded photo data (`*_photo.js`).
- `src/ui/menus.js` — title, main menu, level select, jukebox, scene gallery, settings, loading, pause, game over, clear, inventory, how-to-play.
- `tools/` — dev-only headless checks/drivers and asset-baking scripts; **not loaded by the game**.

## Conventions & gotchas

- **Console must stay 100% clean** on boot and during play (errors *and* warnings). The drivers and headless checks treat any console output as failure. `index.html` mirrors uncaught errors into a `#boot-log` element so headless checks can see them. The `<link rel="icon" href="data:,">` is intentional — it prevents a 404.
- **Entry barks fire on a screen's first `update()`, not in its constructor** — `M.replace` clears all barks *after* construction, so a bark queued in the constructor gets wiped.
- **Controls are locked:** arrows (incl. up/down to climb), Space jump, M meow, G burn a life for an irie rush, Enter confirm/skip cutscene, Esc pause, F fullscreen. Plus debug keys.
- **Debug** (`CONFIG.debug`, on by default): keys **1-6** jump to level, **B** boss, **C** cycle cutscenes, **I** invincibility, **T** freeze active threat. Boot logs the coverage + verifier reports. URL params for automation: `?jump=level3|boss|shop|menu|jukebox|gallery|settings|credits|levelselect|gameover|clear|cutscene:<id>` and `?ff=<seconds>` (synchronous fast-forward before first draw — needed because Edge's virtual-time barely advances rAF).
