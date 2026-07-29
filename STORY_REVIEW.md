# Vak's Cave — Story Review

This is the working checklist for the cutscene-by-cutscene story pass.
`DESIGN.md` remains the source of truth for the finished game. This file tracks
discussion, approvals and unfinished work so approved material is not
accidentally rewritten.

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

1. **Watch** — review the current scene from beginning to end.
2. **Story pass** — agree on:
   - how Vaks arrives;
   - what he wants;
   - what changes or goes wrong;
   - the main joke;
   - how the scene hands off to the next level or scene.
3. **Dialogue pass** — the user revises the text; approved lines are then locked.
4. **Blocking pass** — stage entrances, reactions, eyelines and both sides of conversations.
5. **Graphics pass** — improve backgrounds, props, effects and visual jokes.
6. **Timing pass** — tune holds, camera movement, voice notes and music.
7. **Review** — watch the implemented scene together and make focused notes.
8. **Verify** — run `node tools/check.mjs` and confirm a clean preview.

## Status key

- `[x]` approved/completed
- `[>]` next or currently being revised
- `[ ]` not reviewed

## Act 1 — The Cave

- [x] **THURSDAY WAS BIG** (`cold_open`)
  - Story, dialogue, blocking, graphics and voice-note timing revised.
  - Establishes the jol, the fall, Granny and the hostile Tikolosh.
- [x] **THE HOLE IN THE WALL** (`hole_wall`)
  - Shop discovery, Spaza encounter, fright, pricing and warning revised.
  - Approved dialogue preserved.
- [x] **THE GREEN LUNG** (`green_lung`)
- [x] **THE FOLLOWER** (`follower`)
- [>] **LOAD SHEDDING** (`load_shedding`) — next
- [ ] **THE CAVE MOUTH** (`boss_intro`)
- [ ] **IT'S LIKE THE WIND** (`boss_resolve`)

## Act 2 — Above Ground

- [ ] **ONE FOR THE ROAD** (`chase_begins`)
- [ ] **THE COMMENTARY** (`ss_commentary`, mid-level scene)
- [ ] **BABALAS ECONOMICS** (`babalas_economics`)
- [ ] **SMALL CHANGE** (`ss_small_change`, mid-level scene)
- [ ] **AIRTIME** (`airtime`)
- [ ] **THE WALL** (`ss_the_wall`, mid-level scene)
- [ ] **CORNERED AT THE PLAAS** (`granny_corner`)
- [ ] **BAAS VAN DIE PLAAS** (`ending`)

## Whole-story checks

- [ ] Every cutscene clearly connects to what happened immediately before it.
- [ ] Every cutscene clearly motivates what the player does immediately afterward.
- [ ] Vaks and the Tikolosh relationship escalates consistently toward the vibe-off.
- [ ] Granny's pressure is felt before the above-ground chase begins.
- [ ] Recurring jokes develop or pay off instead of merely repeating.
- [ ] Shops and side scenes feel like part of the journey, not detached sketches.
- [ ] The ending pays off Granny, the cave escape and the earned Tikolosh respect.

## Current review

### THE GREEN LUNG

Approved and completed.

#### Story function

- Continue directly from the Spaza encounter and shop.
- Introduce the free joint that causes Level 2's opening irie rush.
- Show that the Tikolosh is spying on Vaks, not warming to him yet.
- Send Vaks physically out of the shop and into the Weed Biome.

#### What currently works

- Spaza explaining that the route continues upward.
- The businessman offering a free sample after quoting a high price.
- A physical handover across the counter.
- The Tikolosh secretly witnessing the transaction.

#### Current problems

- A caption says Vaks packs his purchases, but nothing is staged.
- Spaza knows about Vaks's garden without the scene establishing how.
- The R100 quote followed by "first one's on the house" is not visually connected.
- The joint disappears immediately after the handover.
- Vaks never visibly prepares to use the item that powers the next level.
- The Tikolosh dances and says "...BOSS" admiringly, which breaks the hostile relationship arc.
- The background abruptly changes while Spaza remains standing in the new cave.
- Vaks does not visibly leave the shop or discover the entrance to Level 2.

#### Proposed scene beats

1. Resume at the same counter after the shop interaction. Show Spaza packing or
   sliding goods instead of narrating it.
2. Reveal a green-lit shaft or curtained passage behind/above the shop. Spaza
   indicates that this is the route upward.
3. Pay off the price joke visually: the `100 MANO` placard flips to
   `FIRST ONE FREE` as Spaza produces the sample.
4. Make the rolling and handover a clear pixel-art performance. Keep Vaks and
   Spaza in the same composition.
5. Let Vaks retain and inspect the joint. End with him preparing to light it so
   Level 2's automatic skin-up feels caused by this scene.
6. Have the Tikolosh spy on the handover from the darkness. It follows because
   it wants to stalk, steal from or torment Vaks—not because it admires him.
7. Vaks says goodbye to Spaza inside the shop, then physically enters the
   green-lit route. Spaza stays behind.
8. End on a match-cut opportunity: ember or lighter spark here, green irie
   ritual at the start of Level 2.

#### Dialogue to review

- `THE WAY TO YOUR GARDEN IS UP.` — useful purpose; clarify how Spaza knows.
- `TO GET THERE, YOU NEED TO BE IRIE.` — useful gameplay setup; support it visually.
- `FIRST ONE'S ON THE HOUSE.` — keep the joke, but connect it to the R100 quote.
- `SHO. YOU MUST KNOW DANKO.` — user review.
- `JAH PROVIDES. IT'S TIME TO PRAY.` — user review for tone.
- `SALA KAKHULE MY BOSS.` — confirm wording and tone.
- `...BOSS.` — revise or make unmistakably sarcastic/hostile.

#### Graphics opportunities

- A green-lit exit breathing mist behind a bead curtain or battered hatch.
- A hand-painted price board that physically flips to `FIRST ONE FREE`.
- An exaggerated rolling sequence with paper, herb, sparks and Spaza's deadpan face.
- A persistent joint in Vaks's hand after the handover.
- A Tikolosh silhouette whose eyes track the joint from the edge of the shop.

### THE FOLLOWER

Implemented with revised dialogue; awaiting visual approval.

#### Story function

- Show Vaks emerging from Level 2 with an irie afterglow and newly earned Mano.
- Escalate the recurring Tikolosh from stalker to shameless petty thief.
- Let the Tikolosh appear to torment Vaks while quietly drawing him toward the next shop.
- Pay off the title by ending with the Tikolosh visibly following or leading Vaks onward.

#### What currently works

- Vaks declaring himself rich immediately before losing loose money.
- `YOU DROPPED SOMETHING. ALL OF IT. I'LL HOLD IT FOR YOU.`
- Vaks calling the Tikolosh a tsotsi.
- Vaks rejecting the Tikolosh's sarcastic use of “boss.”
- The idea of a childish “I'm watching you” mock-off.

#### Current problems

- Vaks does not visibly arrive from Level 2 or retain any irie afterglow.
- A caption explains the coin trail while competing with the dialogue box.
- The trail uses the old ceppy sprite and does not look like actual R2/Mano.
- The Tikolosh that followed Vaks is already waiting ahead without any setup.
- It steals every visible coin but never visibly holds or carries the money.
- It is unclear whether the scene steals real player Mano or merely loose change.
- The mock-off has dialogue but no mirrored physical performance.
- The scene lasts about fifty seconds after a joke that lands around twenty seconds.
- Vaks exits alone; the “follower” remains behind.
- The green cave background is visually flat for most of the conversation.

#### Proposed scene beats

1. Vaks pulls onto a rest ledge after Level 2. The irie colour and bubbles fade
   off him while he counts the Mano he has just earned.
2. A torn pocket or packet drops a line of real R2 coins behind him. Vaks is too
   busy celebrating to notice. Remove the explanatory caption.
3. The Tikolosh creeps along the trail from behind, then darts ahead and acts
   innocent when Vaks finally looks up.
4. Keep the dry “I'll hold it for you” line. Give the Tikolosh a visible sack or
   bulging pocket as it vacuums up the coins.
5. Vaks chases it onto the same ledge so the confrontation is physical and both
   characters share the frame.
6. Stage the “I'm watching you” exchange as an actual mirror-off: Vaks points,
   steps and shouts; the Tikolosh copies every movement one beat later.
7. The Tikolosh bolts toward the next tunnel/shop with the full sack. Vaks
   follows to recover his money.
8. End with both characters leaving through the same route. The Tikolosh still
   appears hostile, but it has quietly herded Vaks onward.

#### Dialogue to review

- `YOH BOSS I'M RICHH.` — strong setup; likely keep.
- `YOU DROPPED SOMETHING. ALL OF IT. I'LL HOLD IT FOR YOU.` — strong theft joke; keep.
- `NO MAN. THIS BLOODY TIKOLOSH IS A TSOTSI.` — likely keep.
- `NOW YOU POOR MY BOSS.` — delivered with fake innocence.
- `DON'T "MY BOSS" ME.` — Vaks follows it with a failed physical attack.
- `YOU CAN'T HIT ME, VAKS. I'M IN YOUR MEEZING.` — Tikolosh retaliates with
  a deliberately over-produced cave-CCTV psyop.
- `TJERRRRR, SIYAHAMBA NGOKU MEFTU.` — retained after the confrontation.

#### Graphics opportunities

- A fading irie aura that links directly back to Level 2.
- Real R2 coins and a torn brown-paper packet instead of red ceppy shapes.
- A money sack that visibly swells with every stolen coin.
- A rapid coin-vacuum run with gold streaks and hard camera snaps.
- Mirrored pointing, stepping and shouting silhouettes.
- A visible tunnel or shop light that both characters exit toward.

#### Gameplay decision

- Recommended: the Tikolosh steals only loose coins shown in the scene, not the
  player's saved Mano. Deducting real currency would require an explicit,
  clearly communicated gameplay penalty before the following shop.

### LOAD SHEDDING

Audited; awaiting dialogue and scene-plan approval.

#### Story function

- Connect the second Spaza visit to the entrance of Level 3, The Deep.
- Turn Vaks's aggression toward the Tikolosh into the darkness he must now
  survive.
- Introduce the automatic cat-eye mechanic before the player enters Level 3.
- Keep the Tikolosh hostile and use the blackout to intensify its torment.

#### What currently works

- Vaks accidentally causing the literal load shedding is a strong central joke.
- The bottle striking the lantern chain gives the blackout a physical cause.
- Five lanterns dying one by one is a good visual countdown.
- The Tikolosh's tiny lantern flickering in complete darkness is a strong beat.
- Vaks's glowing cat eyes naturally introduce Level 3's visibility mechanic.

#### Current problems

- The scene does not show Vaks leaving the second shop or entering The Deep.
- The Zamalek appears from nowhere, so the bottle throw lacks setup.
- The Tikolosh's entrance is disconnected from its escape with the money sack
  in the previous scene.
- The throw is too fast to read as Vaks deliberately aiming at the Tikolosh.
- `ME BOSS!!` does not provide a strong scare or retaliation.
- `...MY BOSS.` sounds almost sympathetic rather than hostile and sarcastic.
- `GOOD THING VAKS HAS CAT EYES.` explains the mechanic too bluntly.
- `FINAL LEVEL, BOSS. WE CLIMB. NOW IN THE DARK.` is functional but does not
  give the scene a strong final joke or threat.
- The existing dark-cave background and lantern row feel more like a stage than
  a dangerous, illegally wired section of the cave.

#### Proposed scene beats

1. Vaks exits the second Spaza shop into a rough maintenance passage. The shop
   shutter closes behind him. He visibly carries a Zamalek "for the road" and
   his lucky stick.
2. A badly wired lantern chain leads toward a shaft marked `THE DEEP`. Add a
   battered cave power box and warning sign so the eventual failure is planted.
3. The stolen money sack scrapes out of the darkness before the Tikolosh does,
   continuing directly from The Follower. Vaks recognises the thief and raises
   the bottle.
4. Make the attack unmistakable: Vaks winds up, aims and throws the Zamalek
   directly at the Tikolosh. The Tikolosh ducks without urgency.
5. The bottle misses, smashes into the power box and sends sparks along the
   cable. Each lantern explodes or dies in sequence.
6. Hold complete darkness and silence. Then display an over-serious utility
   notice: `LOAD SHEDDING — STAGE VAKS`.
7. The Tikolosh's small lantern flickers on just long enough for it to point at
   Vaks: `THIS IS NOT ESKOM, VAKS. YOU BROKE IT.`
8. Vaks's cat eyes ignite and sweep across the passage, briefly revealing the
   Tikolosh, the sack and unsettling shapes deeper in the cave.
9. The Tikolosh escapes upward and turns the new mechanic into a threat:
   `THE DEEP STARTS HERE. LET'S SEE IF THOSE CAT EYES WORK.`
10. Fade directly into Level 3 with only Vaks's eye-glow and a small visibility
    radius remaining.

#### Dialogue to review

- `WHO'S THERE! I'LL MOER YOU WITH MY LUCKY STICK.` — keep the aggression, but
  motivate it with the money-sack sound and the previous theft.
- `ME BOSS!!` — replace; it is not a strong enough entrance.
- `JY STAY BACK, WENA!` — keep if paired with a clear wind-up and throw.
- Suggested blackout exchange:
  - `THIS IS NOT ESKOM, VAKS. YOU BROKE IT.`
  - `SAME DARKNESS, BOSS.`
- Replace the explicit cat-eye exposition with a visual reveal and Tikolosh's
  threatening Level 3 challenge.

#### Graphics opportunities

- A shuttered cave-spaza exit behind Vaks.
- Exposed wiring, ceramic insulators and a deeply unsafe breaker box.
- A readable bottle wind-up, Tikolosh duck and glass impact.
- Sparks racing from lamp to lamp before each pool of light collapses.
- A full-screen `STAGE VAKS` load-shedding notice.
- Cat-eye beams that scan the darkness and reveal silhouettes for a single beat.
- A final gameplay-matching spotlight around Vaks as the scene enters Level 3.
