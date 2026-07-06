# VAK'S CAVE

A complete 2D pixel-art platformer in two acts. Vaks, a legendary Xhosa
gardener, wakes up babalas at the bottom of a cave after a big Thursday
session. Act one: climb out, Donkey Kong style, ahead of the rising
Tikolosh mist. Act two: sprint through the township to the plaas before
granny catches you.

Every visual is generated in code — zero asset files, zero dependencies,
zero build step. Audio is stubbed (every event fires and drives on-screen
barks; real voice notes drop in later via the manifest with no code changes).

## Run

```
npx serve .
```

Open the printed URL. That's it.

## Controls

| Key | Action |
|---|---|
| Arrow keys | Move (up/down climbs ladders in the cave) |
| Space | Jump |
| W | Meow (rats hate it) |
| G | Burn a life for an irie rush (once per level) |
| Enter | Confirm / skip cutscene |
| Esc | Pause |
| F | Toggle fullscreen |

## Debug mode (on by default, `CONFIG.debug` in src/config.js)

- **1-6** jump to level, **B** boss, **C** cycle cutscenes
- **I** invincibility, **T** freeze the active threat
- Boot logs the manifest coverage report and the completability verifier
- URL params for automation: `?jump=level3|boss|shop|menu|jukebox|gallery|settings|credits|levelselect|gameover|clear|cutscene:<id>` and `?ff=<seconds>` (fast-forward)

## Dev verification (not needed to play)

- `node tools/check.mjs` — imports the full module graph headlessly, prints
  the manifest wiring table (52/52 rows) and re-proves every level beatable
  from CONFIG physics (reachability graph + mist/granny timing margins).
- `tools/drive*.mjs` — CDP drivers that play the served game with real key
  events and assert a clean console.

## Layout

```
index.html            boots src/main.js, nothing else
src/config.js         every gameplay tunable, one object
src/data/             levels, cutscene scripts, meme manifest (pure data)
src/engine/           renderer, camera, input, bitmap font, sprites, bg, particles
src/systems/          AudioManager stub + barks, save
src/game/             player, threats (mist/granny), entities, level runtime,
                      boss vibe-off, cutscene player, shop
src/ui/menus.js       title, menus, settings, loading, pause, game over, clear
src/verify.js         completability prover (runs on boot in debug)
tools/                dev-only headless checks
```
