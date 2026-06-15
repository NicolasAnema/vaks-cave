# Audio drop-in folder

Upload audio here, then run `node tools/audio_index.mjs` from the repo root —
the game only sees files listed in `index.json`. Formats: `.opus`, `.ogg`,
`.mp3`, `.m4a`, `.wav`, `.webm`. With this folder empty the game runs as the
silent build (barks stay as on-screen text either way).

## vo/ — Vaks voice notes

One file per manifest row, named after the row's stem (see the table printed
by the indexer, or `file:` in `src/data/manifest.js`). Examples:

- `vo/big_days.opus` — "IT'S A BIG DAYS BOSS..."
- `vo/meow.opus` — the M-key meow pool

Rows with several line variants can ship one recording per line, numbered
from 1 in the order the lines appear in the manifest:

- `vo/rattex_kill_1.opus` — "GONNA DROWN THE RATS IN THE WATER."
- `vo/rattex_kill_2.opus` — "I KILL HIIM."
- `vo/rattex_kill_3.opus` — "BREAK HIS LEG."

A single `vo/rattex_kill.opus` works too (plays for every variant); numbered
files win when both exist.

## music/ — looping tracks

- `music/title.opus` — GARDEN OF VAKS (main menu theme)
- `music/loading.opus` — BABALAS SHUFFLE
- `music/world1.opus` — DEEP CAVE RIDDIM (cave levels)
- `music/world2.opus` — KASI SPRINT (township chase)
- `music/boss.opus` — VIBE OF THE WIND
- `music/ending.opus` — BAAS VAN DIE PLAAS

## sfx/ — optional event one-shots

Any AudioManager event can get a sound: name the file after the event, e.g.
`sfx/checkpoint.opus`, `sfx/rat_stomp.opus`, `sfx/shop_buy.opus`. Full event
list is in `src/data/manifest.js` (`EVENTS`).
