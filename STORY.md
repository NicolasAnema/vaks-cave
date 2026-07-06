# VAK'S CAVE — STORY BIBLE & FULL SCRIPT (draft 1)

> This document is self-contained: it carries everything a co-writer needs to
> revise the script without seeing the codebase. Revise dialogue freely, but
> keep the STRUCTURAL RULES and each scene's MECHANICAL BRIDGE intact — those
> are what make the script implementable in the game as-is.

---

## PART 1 — GENERAL CONTEXT (what this game is)

**Vak's Cave** is a finished 2D pixel-art comedy platformer in two acts, set in
South Africa. Vaks is a young township man who works on his granny's plaas
(small farm). After a big Thursday night (dancing, smoking, drinking —
"babalas" = hungover), he wakes up at the bottom of a deep cave, hours late
for work, with 17 missed calls from Gogo (granny).

- **Act 1 — THE CAVE (vertical):** climb out of the cave ahead of a rising
  magical mist, through three levels, ending in a boss encounter with a giant
  Tikolosh (a creature from Southern African folklore — here reimagined as a
  small, shy, misunderstood cave-dweller species).
- **Act 2 — THE TOWNSHIP (horizontal):** sprint home through township streets
  while something chases you in every level (a drunk shebeen crew, a minibus
  taxi, tsotsis/street criminals), ending at Gogo's plaas.

**Tone:** township comedy — fast, warm, self-aware, ALL CAPS, heavy on SA
slang. Underneath the jokes, it touches real things lightly: shebeen drinking
culture, phone theft, load shedding, debt between friends, and a granny whose
"scariness" is love. Never preachy. Joke on the surface, truth underneath.

**The core irony (the engine of Act 1):** the Tikoloshes are GENTLE. They
like Vaks. Every "attack" is them trying to help. Vaks narrates everything as
mortal danger, and every actual disaster in the cave is caused by HIS panic.
The player sees the truth long before Vaks does — the reveal at the boss is
Vaks catching up to what the player already knows.

**The inversion (the engine of Act 2):** above ground, the "normal" world is
the one that actually takes things from you — your sober legs, your road, your
phone. And the scariest familiar thing, Gogo, turns out to be the same as the
Tikolosh: a wind that was never hunting him.

**The arc is flat on purpose.** Vaks ends the game exactly who he was. The
player's understanding is what moves. Sitcom architecture — the final smash
cut to "THURSDAY." restarts the loop.

**Vaks's want:** dignity. "Ek is die baas van die plaas" — he is the boss of
the farm, and the baas cannot be found babalas in a hole. Lateness is just the
surface. His life philosophy, planted in scene 1 and paid off in the finale:
**"IF YOU'RE HOLDING A TOOL, NOBODY ASKS QUESTIONS."**

### Characters

| Name | Who | Voice |
|---|---|---|
| **VAKS** | Our hero. Part-time plaas worker, full-time legend (self-declared). Calls everyone "BOSS", including himself, inanimate objects, and the audience. | Fast, dramatic, never admits fear or fault. Narrates his life like a movie trailer. |
| **STOMPIE** | A small Tikolosh who adopts Vaks in scene 1 and quietly helps him the whole game. | Two words, basically: "MY BOSS." (happy, sad, worried — all in the delivery). Physical comedy. |
| **SPAZA** | The shopkeeper Tikolosh. Runs a lantern-lit shop inside the cave wall. The only calm character in Act 1. | Dry, deadpan, businesslike. Secretly fond of Vaks. |
| **THE BIG ONE** | The giant Tikolosh "boss". Never speaks. Communicates in bass and sway. | — |
| **VETKOEK** | SPAZA's cousin. Runs the township spaza shop in Act 2. | Same deadpan energy, more street. |
| **GOGO** | Granny. Never seen in person until the finale — she strikes through the family WhatsApp group. Her messages rattle the screen. | Terse. Devastating. Full caps not required — hers hit harder in lowercase. |
| **MASI, IMO, RASTA** | The drunk crew outside the cave (shebeen scene). Masi is big and loud, Imo is a small boy always asking for snacks, Rasta is chilled. | Fun peer pressure. |
| **TALLMAN & SHORTY** | Vaks's friends in the township. Both owe him money. Appear at checkpoints and in the group chat. | Deflection artists. |

### Voice & slang glossary (use naturally, don't overload)

AWEH (hello/cool) · HAIBO (disbelief) · EISH (oof) · YOH (wow) · BRA/MY BRA
(brother) · TJOMMIE (friend) · MOER (beat up) · BABALAS (hangover) · ZAMALEK
(Carling Black Label beer) · CEPPIES (in-game coins) · MANO (money) · SHARP
SHARP (all good) · IS IT (oh really) · SPAZA (informal township shop) ·
VETKOEK (fried dough bun) · GOGO (granny) · PLAAS (farm) · BAAS (boss) ·
TSOTSI (street criminal) · SHEBEEN (township bar) · LOAD SHEDDING (scheduled
power cuts, a national running joke) · MONTH END (when debts allegedly get paid)

---

## PART 2 — GAMEPLAY CONTEXT (what the player does between scenes)

The game is a sequence: cutscene → level → shop → cutscene → … Each cutscene
must END by CAUSING or NAMING what the player is about to do. That's the
number-one structural rule: **scenes are bridges, not mood pieces.**

| # | Slot | What the player does | Mechanics the scene must set up |
|---|---|---|---|
| S1 | COLD OPEN | Tutorial arena, then LEVEL 1: SHALLOW SHAFT | Climb ahead of the rising mist. Rats bite; meow (W) scatters them. Vaks's panic should visibly WAKE the mist. |
| S2 | after L1 | THE SHOP (buy lives/items with ceppies) | Introduce SPAZA and the idea that a Tikolosh runs a business. |
| S3 | before L2 | LEVEL 2: WEED BIOME | The level OPENS with a free "skin up" (G key): the world's first irie rush — higher jumps, enemies slowed. The scene must make this a GIFT from SPAZA. |
| S4 | after L2 | Shop, then bridge to L3 | Evidence beat: STOMPIE has been helping all along. Vaks dismisses it. |
| S5 | before L3 | LEVEL 3: THE DEEP (dark level) | The level is DARK, seen only through Vaks's glowing "cat eyes". The scene must show VAKS CAUSING the darkness. |
| S6 | before boss | BOSS: a RHYTHM BATTLE ("vibe-off") vs THE BIG ONE | Explain why the fight is a dance: he just wants to vibe, and dancing is the only move Vaks knows. |
| S7 | after boss | Transition to Act 2 | The catharsis. Then the sun = late = panic relaunches the plot. |
| S8 | Act 2 open | LEVEL 4: ONE FOR THE ROAD (tipsy sprint; shebeen crew chases, lobbing bottles) | The drunk crew forces "one for the road"; Gogo's WhatsApp alert starts the run. Vaks is tipsy the whole level (slower, screen sways). |
| S9 | after L4 | Shop, then LEVEL 5: KASI MAIN STREET (a minibus TAXI chases; hawker stalls to dodge; a ringing payphone) | Introduce VETKOEK; warn about the taxi ("the hooter"). |
| S10 | after L5 | Shop, then LEVEL 6: HOME STRETCH (tsotsis chase; phone snatchers grab you — mash to break free) | Make the PHONE precious (it is the family group = Gogo) so the theft threat has stakes. |
| S11 | after L6 | FINAL: TEND THE PLAAS (garden finale vs granny's expectations) | Cornered at the gate. The rake. Penance, not punishment. |
| S12 | finale | Credits | The tea. The silent twist. The THURSDAY button. |

### Engine constraints (keep the script implementable)

- Scenes are lists of beats. The player presses ENTER to advance ONE beat.
  Keep scenes **6–14 beats** long.
- All dialogue renders **ALL CAPS** in a pixel font. Keep each spoken line
  under ~90 characters (it wraps to max 3 box lines). Punchy beats short.
- Available beat types: character says a line (with portrait) · narrator
  caption · character walks/teleports/changes animation · screen shake/flash ·
  music change · sound effect · WhatsApp phone overlay (dark screen, green
  header "FAMILY GROUP", messages land one at a time; a Gogo message can
  RATTLE the screen with an alert sound) · voice-note beat (speech bubble +
  audio, locked until it finishes) · particle effects (zzz, wind, sparkle,
  confetti, falling sushi).
- Characters on screen are existing sprites: Vaks (idle/run/babalas/celebrate/
  climb/rake), small tikolosh, irie tikolosh, big tikolosh, granny, the drunk
  crew (masi/imo/rasta), tsotsis. New simple props (a lantern, a teacup) are
  cheap; whole new characters are not.
- Voice audio is optional drop-in later — every line must land as TEXT first.
- The existing 56 comedy voice lines ("barks") stay; this script ADDS.

---

## PART 3 — THE SCRIPT

Format: **beat-by-beat**. [square brackets] = staging. Dialogue is what
renders. Each scene ends with its **BRIDGE** — the line/beat that names the
next gameplay mechanic. Bridges can be reworded but must keep their function.

---

### S1 — COLD OPEN
*Slot: game start → tutorial → Level 1. Purpose: the want (dignity +
lateness), the tool philosophy plant, first Tikolosh contact, fear wakes the
mist.*

1. [Black screen. Snoring. Fade in: cave floor, bottles, Vaks asleep.]
2. CAPTION: VAKS SLEPT PEACEFULLY AT THE BOTTOM OF A CAVE.
3. CAPTION: ONE TOO MANY ZAMALEKS LAST NIGHT.
4. [Vaks jolts up, babalas animation]
   VAKS: OK. OK. THIS IS NOT MY ROOM, BOSS. THIS IS NOBODY'S ROOM.
5. [Checks phone]
   VAKS: FOUR PERCENT. SEVENTEEN MISSED CALLS. ALL GOGO. I AM A DEAD MAN, BOSS.
6. [Grabs a stick off the floor, holds it like a rake]
   VAKS: FIRST RULE OF THE PLAAS: IF YOU'RE HOLDING A TOOL, NOBODY ASKS QUESTIONS.
7. [STOMPIE shuffles in from the dark, holds out a ceppie]
   STOMPIE: MY BOSS.
8. VAKS: HAIBO.
9. STOMPIE: [pushes the coin closer] MY BOSS!
10. VAKS: THE COIN IS ARMED, BOSS. I SEE THE WIRES. KEEP IT. KEEP THE WIRES.
11. [Vaks backs away fast, knocks a bottle pile — CRASH. Screen shake.
    Below him, the mist stirs awake.]
    CAPTION: BELOW: SOMETHING OLD WOKE UP GRUMPY.
12. VAKS: OK. NEW RULE. WE CLIMB, BOSS. WE CLIMB NOW.

**BRIDGE → L1:** the crash HE caused wakes the mist; "WE CLIMB" names the verb.

---

### S2 — THE HOLE IN THE WALL *(NEW)*
*Slot: after Level 1, opens the first shop. Purpose: meet SPAZA; a Tikolosh
runs a business; the "only one who buys" plant.*

1. [Vaks hauls himself onto a ledge, wheezing. A warm lantern-lit nook in the
   cave wall: a counter, shelves, wares.]
2. SPAZA: AWEH. CUSTOMER.
3. [Vaks screams. Jumps behind a rock.]
4. SPAZA: NO SCREAMING IN THE SHOP, MY BOSS. HOUSE RULE. IT'S ON THE SIGN.
5. VAKS: YOU'RE ONE OF THEM. THE HAIRY ONES. THE GRABBERS.
6. SPAZA: I'M ONE OF ME. YOU BUYING OR BROWSING?
7. VAKS: ...HOW MUCH FOR THE EXTRA LIFE?
8. SPAZA: TWENTY-FIVE.
9. VAKS: TWENTY-FIVE CEPPIES?! IS THERE VAT ON THAT? IS THIS A SARS THING?
10. SPAZA: YOU THE ONLY ONE WHO EVER BUYS, MY BOSS. THE OTHERS JUST SCREAM AND CLIMB.
11. VAKS: [stepping out from the rock, dusting himself] ...THE SERVICE BETTER BE EXCELLENT.
12. SPAZA: THE MIST DOESN'T DO CREDIT, MY BOSS. SHOP SMART.

**BRIDGE → SHOP:** the shop screen opens directly from beat 12.

---

### S3 — THE GREEN LUNG
*Slot: before Level 2. Purpose: the weed biome explained; the free opening
skin-up becomes SPAZA'S GIFT; Stompie is following.*

1. [The shop nook. Vaks packing his buys. SPAZA leans on the counter.]
2. SPAZA: UP FROM HERE IS THE GARDEN, MY BOSS. THE GREEN LUNG. IT BREATHES FOR THE WHOLE CAVE.
3. VAKS: A GARDEN? UNDERGROUND? WHO'S THE BAAS OF IT? [beat] ...IS THERE A VACANCY?
4. SPAZA: THE AIR UP THERE IS HEAVY. YOU DON'T WALK IT SOBER.
5. [SPAZA slides something across the counter: a rolled joint.]
   SPAZA: FIRST ONE'S ON THE HOUSE.
6. VAKS: NOTHING IS ON THE HOUSE, BOSS. NOT EVEN THE HOUSE.
7. SPAZA: [silence. deadpan.]
8. VAKS: [takes it] ...FOR RESEARCH.
9. [Behind a rock at the edge of frame, STOMPIE peeks out, watching over Vaks.]
10. SPAZA: WHEN THE WORLD GOES SLOW AND YOUR LEGS GO STRONG — THAT'S NORMAL. JUMP HIGH, MY BOSS.

**BRIDGE → L2:** beat 10 names the irie mechanic (slow world, big jumps);
L2 opens with Vaks skinning up the gift.

---

### S4 — THE FOLLOWER *(NEW)*
*Slot: after Level 2, before the shop. Purpose: dramatic-irony evidence beat —
Stompie has been helping the whole time; Vaks dismisses it as a con.*

1. [A ledge above the garden haze. Vaks counting ceppies in his palm.]
2. VAKS: FORTY-TWO... FORTY-FOUR... SINCE WHEN DO CAVES PAY OUT LIKE A LOTTO, BOSS?
3. [He looks up. A neat TRAIL of ceppies leads up the next stretch of wall.
   At the top of the trail: STOMPIE, waving.]
4. STOMPIE: MY BOSS!
5. VAKS: [squinting] WHY DOES IT KEEP LEAVING ME CEPPIES.
6. VAKS: ...MUST BE A TRAP. LONG CON. PYRAMID SCHEME. I'VE SEEN THE DOCUMENTARIES.
7. STOMPIE: [happy bounce] MY BOSS!
8. VAKS: DON'T "MY BOSS" ME. I'M WATCHING YOU. BOTH EYES.
9. VAKS: OK — ONE EYE. THE OTHER ONE IS FOR THE MIST.
10. [Stompie leaves one more ceppie on the ledge and scurries off. Vaks waits
    a beat. Takes it.]
    VAKS: ...EVIDENCE. I'M TAKING IT AS EVIDENCE.

**BRIDGE → SHOP → S5:** pockets full, suspicion intact.

---

### S5 — LOAD SHEDDING
*Slot: before Level 3 (the dark level). Purpose: VAKS CAUSES the darkness;
cat-eyes origin; the saddest-funniest frame in the act.*

1. [Deeper cave. A chain of lanterns glows along the wall — the only light.
   Something approaches in the gloom carrying a small light.]
2. VAKS: WHO GOES THERE! I'M ARMED, BOSS. IT'S A STICK, BUT I'M ARMED.
3. [The shape shuffles closer — it's STOMPIE, holding up a little lantern,
   bringing it TO him.]
4. VAKS: IT'S GLOWING! IT'S RADIOACTIVE! STAY BACK!
5. [Vaks hurls his empty zamalek bottle. It misses Stompie — and smashes into
   the lantern chain. FLASH. The lights die section by section down the wall.]
6. [Darkness. Two beats of silence.]
7. VAKS: EISH. LOAD SHEDDING, BOSS.
8. [A tiny light: STOMPIE holds up the dented lantern. It flickers and dies.]
   STOMPIE: ...my boss.
9. [Two glowing eyes open in the dark: Vaks's.]
   VAKS: GOOD THING VAKS IS HALF CAT.
10. VAKS: STAGE SIX, BOSS. WE CLIMB IN THE DARK.

**BRIDGE → L3:** the dark level and the cat-eyes mechanic are now HIS fault
and HIS gift. "Stage six" is the load-shedding joke that names it.

---

### S6 — THE BIG ONE
*Slot: boss intro. Purpose: the crowd gathers like a show, not a horde; the
key is given ("he just wants to vibe"); dancing = the only move Vaks knows.*

1. [The cave mouth. Dawn light bleeding in from above — blocked by a massive
   shape. Small tikoloshes file in from every tunnel and settle in rows.]
2. VAKS: OK. OK. THIS IS THE END, BOSS. TELL GOGO I WAS BRAVE. TELL HER I WAS ON TIME.
3. [SPAZA strolls in, unbothered, stands next to Vaks.]
   SPAZA: THEY'RE NOT HUNTING, MY BOSS. THEY'RE QUEUEING.
4. VAKS: QUEUEING FOR WHAT?
5. SPAZA: THE SHOW.
6. [THE BIG ONE rises to full height. The screen shakes. Bass hum.]
7. VAKS: WHAT SHOW?! THERE'S NO SHOW! WHO SOLD TICKETS?!
8. SPAZA: HE'S BEEN DOWN HERE ALONE A LONG TIME, MY BOSS. HE DOESN'T WANT THE FIGHT.
9. SPAZA: HE JUST WANTS TO VIBE. GIVE HIM THE VIBE.
10. VAKS: THE VIBE? BOSS... I ONLY KNOW ONE MOVE.
11. SPAZA: THEN DO IT TWICE.
12. [Vaks steps forward. Plants his feet. The crowd goes quiet.]

**BRIDGE → BOSS:** the rhythm battle IS beat 10-12 — his one move, done twice.

---

### S7 — IT'S LIKE THE WIND
*Slot: after the boss. Purpose: the catharsis — five sincere seconds — then
the sun relaunches the panic into Act 2.*

1. [The vibe-off won. THE BIG ONE sways gently, eyes closed, content. The
   rows of small tikoloshes sway with him.]
2. [MUSIC STOPS. Only wind. Letterbox in. Hold it.]
3. VAKS: [soft] ...IT'S LIKE THE WIND.
4. [STOMPIE appears at his side, swaying too. Vaks rests a hand on its head.
   Nobody says anything. Hold the frame.]
5. [THE BIG ONE slowly raises one huge arm — and points at the dawn light.]
6. VAKS: ...OK BOSS. WE GO BEFORE IT CHANGES ITS MIND.
7. [Vaks steps into the light. It hits his face. He freezes.]
8. VAKS: THE SUN. THE SUN IS UP, BOSS. GOGO.
9. [Music slams back in.]
   VAKS: I AM SO LATE. I AM PREHISTORIC.

**BRIDGE → ACT 2:** the want (never resolved, only postponed) yanks him
straight into the township.

---

### S8 — ONE FOR THE ROAD
*Slot: Act 2 open, before Level 4. Purpose: the streets flip the rule — up
here things really do get taken; the shebeen crew takes his sober legs; the
lesson from the cave FAILS on Gogo; the alert starts the run.*

1. [Township ridge, morning. Vaks steps out of the cave mouth — straight into
   MASI, IMO and RASTA, mid-session outside the shebeen.]
2. CAPTION: OUT OF THE CAVE. STRAIGHT INTO THE DRINK CREW.
3. MASI: EYTA VAKS! YOU MADE IT OUT, MY BRA! SIT! DRINK! MWAHAHA!
4. RASTA: IRIE, BREDREN. DOWN THIS ONE WITH I AND I. JAH BLESS.
5. IMO: CAN I HAVE SAVANNA, BHUTI VAKS? AND NDICELA KFC!
6. VAKS: NO MAN, BOSS. MY GOGO IS WAITING. SHE'S GOING TO MOER ME INTO NEXT WEEK.
7. MASI: ONE FOR THE ROAD, BRA. IT'S TRADITION. IT'S BASICALLY THE LAW.
8. [Vaks hesitates. Takes the smallest possible sip. The screen sways
   slightly — the tipsy tint kicks in.]
9. VAKS: WAIT. WAIT. I'LL HANDLE GOGO. I LEARNED SOMETHING DOWN THERE, BOSS.
10. [PHONE OVERLAY: the FAMILY GROUP. Vaks records a voice note:]
    VAKS: GOGO. IT'S VAKS. VIBE WITH ME, GOGO. 🙏
11. [Chat shows: "gogo is typing..." — a long pause —]
12. [GOGO's reply lands. ALERT. The whole phone RATTLES:]
    GOGO: kom huis toe. NOU.
13. VAKS: SOME WINDS YOU VIBE WITH, BOSS. SOME WINDS YOU RUN FROM.
14. VAKS: RUN.

**BRIDGE → L4:** tipsy tint from beat 8 carries into the level; the crew
gives chase for "one more"; beat 13 is the thesis of the whole game.

---

### S9 — BABALAS ECONOMICS *(NEW)*
*Slot: after Level 4 → shop → Level 5. Purpose: VETKOEK and the township
spaza; Tallman & Shorty's debts (light, human); name the taxi threat.*

1. [A spaza shop window in a container wall. VETKOEK behind the counter.
   Vaks staggers up, half-sober again.]
2. VETKOEK: AWEH. YOU MUST BE THE SCREAMER. MY COUSIN SENT A MESSAGE.
3. VAKS: ...THE CAVE HAS WHATSAPP?
4. VETKOEK: THE CAVE HAS EVERYTHING, MY BOSS. EXCEPT CUSTOMERS.
5. [TALLMAN and SHORTY slide into frame, very casual.]
   TALLMAN: VAKS! MY BRA! LOOKING STRONG! LOOKING FAST!
6. VAKS: TALLMAN. MY FIFTY RAND.
7. TALLMAN: MONTH END, BRA. MONTH END.
8. VAKS: IT'S BEEN MONTH END SINCE FEBRUARY, BOSS.
9. SHORTY: [already walking away] I'LL EFT YOU.
10. VETKOEK: TAXI ROUTE AHEAD, MY BOSS. WHEN YOU HEAR THE HOOTER — YOU ARE NOT IN THE ROAD.
11. VAKS: I'M NEVER IN THE ROAD. THE ROAD IS IN MY WAY.

**BRIDGE → L5:** beat 10 names the taxi mechanic (the horn-dash). Tallman &
Shorty reappear at L5 checkpoints stalling granny — their debt gets worked off.

---

### S10 — AIRTIME *(NEW)*
*Slot: after Level 5 → shop → Level 6. Purpose: make the phone precious so
the L6 phone-snatchers have real stakes; theft handled human and light.*

1. [A quiet corner between shacks. Vaks catches his breath. Phone out: 2%.]
2. [PHONE OVERLAY — FAMILY GROUP, 74 unread:]
   GOGO: where are you
   GOGO: where are you
   GOGO: WHERE ARE YOU
3. TALLMAN: he's coming gogo. i saw him. very fast. like a bullet.
4. SHORTY: i saw him by the shebeen 😂😂
5. VAKS: [typing] SHORTY YOU SNAKE.
6. [Across the street, in an alley: a silhouette watches him. Watches the
   PHONE, specifically.]
7. VETKOEK: [leaning out of a window] HOLD THAT PHONE TIGHT ON THE HOME
   STRETCH, MY BOSS. AROUND HERE A PHONE WALKS.
8. VAKS: LET THEM TRY, BOSS. THIS PHONE IS NOT A PHONE.
9. VAKS: THIS PHONE IS MY FAMILY. AND MY EVIDENCE AGAINST SHORTY.

**BRIDGE → L6:** the snatchers in Level 6 now grab at the thing the story
made priceless — mash free isn't a mechanic anymore, it's protecting family.

---

### S11 — THE PLAAS
*Slot: after Level 6, before the finale. Purpose: cornered at the gate; the
learned move fails one final time; the rake; penance, not punishment.*

1. [The home gate at golden hour. Rows of the plaas behind it. GOGO stands in
   the middle of the path. Completely still. Silence — no music.]
2. VAKS: GOGO! HEY! HAIBO! YOU LOOK... RESTED!
3. [Silence.]
4. VAKS: OK LOOK. THERE WAS A CAVE. THERE WAS A MIST. THERE WAS A VERY BIG
   GUY — LOVELY GUY, ACTUALLY —
5. [Silence. Vaks glances left, right. No exits. He tries it: a weak little
   dance. The move that saved his life.]
   VAKS: ...VIBE WITH ME, GOGO?
6. [GOGO doesn't move. Then: she raises one arm and POINTS — at the rake
   leaning on the fence, and the unraked rows behind it.]
7. [Vaks looks at the rake. Looks at her. Looks at the rake.]
8. VAKS: [quietly] ...THE PLAAS NEEDS ITS BAAS, BOSS.
9. [He picks up the rake and steps through the gate.]

**BRIDGE → FINALE:** "TEND THE PLAAS" begins — the finale is him doing the
job he claims to be baas of, under her eye.

---

### S12 — TEA *(the silent twist — keep wordless)*
*Slot: after the finale → credits. Purpose: Act 2's twist shown in one look;
Gogo gets an inner life in a single frame; the loop closes.*

1. [The plaas, tended. Rows neat. Vaks raking the last stretch — cap skew,
   mud on the overalls, dead on his feet but RAKING.]
2. [GOGO walks the rows slowly. Inspecting. She stops at one crooked row.
   Looks at him. He hurries over and re-rakes it. She continues.]
3. [She arrives next to him. Long beat. She looks at him — and it is
   completely clear that she knows EVERYTHING. The cave. The shebeen. The sip.]
4. [She says nothing. She hands him a cup of tea. She walks to the stoep.]
5. [Vaks stands alone with the tea, steam rising, golden light.]
6. VAKS: [soft, to nobody] ...SHE'S LIKE THE WIND, BOSS.
7. [Behind the fence, STOMPIE pops up holding a ceppie.]
   STOMPIE: MY BOSS!
8. [SMASH CUT TO BLACK.]
   CAPTION: THURSDAY.
9. [Snoring begins.]
10. [CREDITS.]

---

## PART 4 — THE CHORUS (mid-level goal barks)

Cutscenes get skipped; barks never leave the screen. A tiny pool of goal-lines
fires during play (level starts, idle moments) so the want survives skipping.
Two or three per act is enough — a chorus works through repetition.

- "GOGO IS WAITING, BOSS."
- "BIG DAY TODAY, BOSS. BIG DAYS."
- "THE BAAS IS NEVER LATE. THE BAAS IS... SLIGHTLY LATE."
- (Act 2) "HOLD THE PHONE. HOLD THE PHONE, BOSS."
- (Act 2, near home) "ALMOST HOME. SMELL THAT? THAT'S CONSEQUENCES, BOSS."

## PART 5 — NOTES FOR REVISION (read before editing)

1. **Keep every BRIDGE.** Reword freely, but each scene must still cause/name
   the next level's mechanic. That's the spine of the whole design.
2. **Keep the irony discipline.** The Tikoloshes never menace on screen. Every
   scare is Vaks misreading kindness. If a revision makes a Tikolosh actually
   threatening, Act 1 collapses.
3. **Keep Vaks flat.** He never says what he learned. Beat S8-13 ("some winds
   you vibe with...") is the one time he gets to be accidentally wise — let it
   stay accidental.
4. **Gogo speaks only in the group chat until S11, and never in dialogue.**
   Her silence is her power. The tea scene stays wordless.
5. **Line lengths:** spoken lines ≤ ~90 chars; they render ALL CAPS in a
   pixel font. Short is funnier.
6. **Serious things stay light:** shebeen pressure (S8), debt (S9), phone
   theft (S10), load shedding (S5). One truth per scene, jokes on top.
7. STOMPIE says only "MY BOSS" (and once, lowercase, "...my boss" — S5 beat 8.
   That lowercase is intentional; it's the saddest line in the game).
