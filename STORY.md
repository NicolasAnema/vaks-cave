# VAK'S CAVE — STORY BIBLE & FULL SCRIPT (draft 2 — World 1 revised)

> This document is self-contained: it carries everything a co-writer needs to
> revise the script without seeing the codebase. Revise dialogue freely, but
> keep the STRUCTURAL RULES and each scene's MECHANICAL BRIDGE intact — those
> are what make the script implementable in the game as-is.
>
> **Draft 2 status:** World 1 (S1–S7) is the revised version. World 2 (S8–S12)
> is still draft 1 and awaits the same treatment. `[FILL]` marks open slots.

---

## PART 1 — GENERAL CONTEXT (what this game is)

**Vak's Cave** is a finished 2D pixel-art comedy platformer in two acts, set in
South Africa. Vaks is a young township man who works on his granny's plaas
(small farm). After a big Thursday night (dancing, smoking, drinking —
"babalas" = hungover), he wakes up at the bottom of a deep cave, hours late
for work, dodging Gogo's calls.

- **Act 1 — THE CAVE (vertical):** climb out of the cave ahead of a rising
  magical mist, through three levels, ending in a boss encounter with a giant
  Tikolosh (a creature from Southern African folklore — here reimagined as
  cave-dwellers with their own turf, their own rules, and one shared dance).
- **Act 2 — THE TOWNSHIP (horizontal):** sprint home through township streets
  while something chases you in every level (a drunk shebeen crew, a minibus
  taxi, tsotsis/street criminals), ending at Gogo's plaas.

**Tone:** township comedy — fast, warm, self-aware, ALL CAPS, heavy on SA
slang. Underneath the jokes, it touches real things lightly: shebeen drinking
culture, phone theft, load shedding, debt between friends, and a granny whose
"scariness" is love. Never preachy. Joke on the surface, truth underneath.

**The engine of Act 1 — the turf game:** the cave isn't hunting Vaks; it's
PLAYING with him. The Tikolosh jump-scares him, flexes on him ("EK IS DIE
BAAS VAN DIE CAVE"), robs him for a laugh — it's turf banter, the way boys
test a new arrival. Vaks reads all of it as mortal danger, and every actual
disaster in the cave (the mist waking, the lights going out) is caused by HIS
panic, not their play. The player clocks the game long before Vaks does; the
boss "fight" is where Vaks finally joins it.

**The inversion (the engine of Act 2):** above ground, the "normal" world is
the one that actually takes things from you — your sober legs, your road, your
phone. And the scariest familiar thing, Gogo, turns out to be the same as the
Tikolosh: a wind that was never hunting him.

**The arc is flat on purpose.** Vaks ends the game exactly who he was. The
player's understanding is what moves. Sitcom architecture — the final smash
cut to "THURSDAY." restarts the loop.

**Vaks's want:** dignity. "Ek is die baas van die plaas" — he is the boss of
the farm, and the baas cannot be found babalas in a hole. Lateness is the
surface; the dodged call in S1 is the wound. The Tikolosh's counter-claim —
baas van die CAVE — makes Act 1 a turf story between two self-declared bosses.

### Characters

| Name | Who | Voice |
|---|---|---|
| **VAKS** | Our hero. Part-time plaas worker, full-time legend (self-declared). Calls everyone "BOSS", including himself, inanimate objects, and the audience. | Fast, dramatic, never admits fear or fault. Narrates his life like a movie trailer. Mixes English, Afrikaans, isiXhosa freely. |
| **TIKOLOSH** | The small Tikolosh who claims the cave as his turf and adopts Vaks as his favourite toy — jump-scares him, robs him, mimics him, and quietly watches over him the whole climb. | Mostly barks: "BOSS!", "MY BOSS!", "JY BOSS!" + cackles. Speaks full sentences only when flexing (S1) and once, sincerely, at the end (S7). |
| **SPAZA** | Runs the lantern-lit shop in the cave wall. Looks a LOT like a Tikolosh. Insists he is a businessman. The distinction matters to him. | Dry, deadpan, businesslike. Calls Vaks "bhuti"/"my bra". Secretly fond of him. |
| **THE BIG ONE** | The giant Tikolosh "boss". Never speaks. Communicates in bass, stamps and sway. | — |
| **VETKOEK** | SPAZA's cousin. Runs the township spaza shop in Act 2. | Same deadpan energy, more street. |
| **GOGO** | Granny. Never seen in person until the finale — she calls (declined), then strikes through the family WhatsApp group. Her messages rattle the screen. | Terse. Devastating. Hers hit harder in lowercase. |
| **MASI, IMO, RASTA** | The drunk crew outside the cave (shebeen scene). Masi is big and loud, Imo is a small boy always asking for snacks, Rasta is chilled. | Fun peer pressure. |
| **TALLMAN & SHORTY** | Vaks's friends in the township. Both owe him money. Appear at checkpoints and in the group chat. | Deflection artists. |

### Voice & slang glossary (use naturally, don't overload)

AWEH (hello/cool) · HAIBO (disbelief) · EISH (oof) · YOH (wow) · SHO (whew) ·
WENA (you!) · JY (you, Afrikaans) · BRA/MY BRA (brother) · BHUTI (brother,
isiXhosa) · TJOMMIE (friend) · MOER (beat up) · DALA (do it) · DANKO (thanks) ·
SALA KAKHULE (stay well, isiXhosa) · SIYAHAMBA (we're going) · BABALAS
(hangover) · ZAMALEK (Carling Black Label beer) · CEPPIES (in-game coins) ·
MANO (money) · SHAP/SHARP (all good) · IS IT (oh really) · SPAZA (informal
township shop) · VETKOEK (fried dough bun) · GOGO (granny) · PLAAS (farm) ·
BAAS (boss) · TSOTSI (street criminal) · SHEBEEN (township bar) · LOAD
SHEDDING (scheduled power cuts, a national running joke) · MONTH END (when
debts allegedly get paid)

---

## PART 2 — GAMEPLAY CONTEXT (what the player does between scenes)

The game is a sequence: cutscene → level → shop → cutscene → … Each cutscene
must END by CAUSING or NAMING what the player is about to do. That's the
number-one structural rule: **scenes are bridges, not mood pieces.**

| # | Slot | What the player does | Mechanics the scene must set up |
|---|---|---|---|
| S1 | COLD OPEN | Tutorial arena, then LEVEL 1: SHALLOW SHAFT | Climb ahead of the rising mist. Rats bite; meow (W) scatters them. Vaks's panic should visibly WAKE the mist. The dodged Gogo call sets the want. |
| S2 | after L1 | THE SHOP (buy lives/items with mano) | Introduce SPAZA and the shop. |
| S3 | before L2 | LEVEL 2: WEED BIOME | The level OPENS with Vaks mid-skin-up (G/irie mechanic: higher jumps, enemies slowed): SPAZA's gift. |
| S4 | after L2 | Shop, then bridge to L3 | The beef: TIKOLOSH robs Vaks for a laugh. The player sees it's a game; Vaks declares war. (Mano returns in S7.) |
| S5 | before L3 | LEVEL 3: THE DEEP (dark level) | The level is DARK, seen through Vaks's glowing "cat eyes". The scene must show VAKS CAUSING the darkness. |
| S6 | before boss | BOSS: a RHYTHM BATTLE ("vibe-off") vs THE BIG ONE | Explain why the fight is a dance: he just wants the vibe, and dancing is the only move Vaks knows. |
| S7 | after boss | Transition to Act 2 | Beef → brotherhood: the dance-scrap syncs into one shared move; mano comes back; the sun relaunches the panic. |
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
  audio, locked until it finishes — S1 uses the real "big days" recording) ·
  particle effects (zzz, wind, sparkle, confetti, falling sushi).
- Characters on screen are existing sprites: Vaks (idle/run/babalas/celebrate/
  climb/rake), small tikolosh, irie tikolosh, big tikolosh, granny, the drunk
  crew (masi/imo/rasta), tsotsis. New simple props (a lantern, a teacup, a
  ringing phone) are cheap; whole new characters are not.
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
lateness), the dodged call and the "big days" voice note, first Tikolosh
contact as a jump-scare flex, Vaks's panic wakes the cave.*

1. [Black screen. Snoring. Fade in: cave floor, empty bottles, Vaks asleep.]
2. CAPTION: VAKS SLEPT PEACEFULLY AT THE BOTTOM OF A CAVE.
3. CAPTION: ONE TOO MANY ZAMALEKS LAST NIGHT.
4. [Vaks jolts up, babalas animation.]
   VAKS: SHO. THIS IS NOT MY ROOM, BOSS. SE MISTAKE.
5. [The phone lights up and rings. Screen reads: GRANNY CALLING. Vaks stares,
   panics, and DECLINES it.]
   VAKS: NOT NOW, BOSS. NOT NOW.
6. [Instead he thumbs a voice note. VOICE-NOTE BEAT — plays his classic
   "big days" recording:]
   VAKS (V/N): BUT BOSS TODAY I'M FEELING LAZY YOH. I'M FEELING LAZY BECAUSE
   BABALAS YESTERDAY. BIG PARTY. I'M DANCING, DANCING SMOKING, DRINKING,
   WOWW. THIS IS A BIG DAYS BOSS. THAT'S WHY I'M FEELING IRIE. NICE AND
   WOWHM. NICE BOSS. THANK YOU BOSS. OKAY BOSS. YOU MUST WORK HARD BOSS.
   AND AT THE SAME TIME YOU GONNA BE GOOD BOSS. I TOLD YOU BOSS. SHAP BOSS.
7. [JUMP SCARE: TIKOLOSH lunges into frame with a screech, tiny arms up.
   Vaks gets a fright.]
   TIKOLOSH: (SCREECH) YOU MAY BE DIE BAAS VAN DIE PLAAS. BUT EK IS DIE BAAS
   VAN DIE CAVE.
8. VAKS: HAIBO, WENA. I'LL MOER YOU.
9. [Vaks scrambles back, knocks a bottle pile. CRASH. Screen shake. Far
   below, the mist stirs awake.]
   CAPTION: BELOW: THE CAVE RUMBLES. THE GROUND SHAKES.
10. VAKS: YOH... WE CLIMB, BOSS. WE CLIMB NOW.

**BRIDGE → L1:** the dodged call sets the want; the crash HE caused wakes the
mist; "WE CLIMB" names the verb.

---

### S2 — THE HOLE IN THE WALL
*Slot: after Level 1, opens the first shop. Purpose: meet SPAZA; an ou runs a
business in a folklore cave; plant "that other tikolosh" (the boss) as the
real worry.*

1. [Vaks hauls onto a ledge, wheezing. A warm lantern-lit nook in the cave
   wall: counter, shelves, a hand-painted sign: "SMOKING ALLOWED IN THE SHOP.
   ONLY IF YOU OFFER ME".]
2. SPAZA: AWEH. A CUSTOMER.
3. [Vaks screams, jumps back, lights a cigarette with shaking hands.]
4. SPAZA: [tapping the sign, unbothered] SIGN SAYS YOU OFFER ME ONE, BOSS.
   AND WHY YOU SCREAMING? I'M THE ONE WHO SHOULD SCREAM. LOOK AT YOU.
5. VAKS: ...YOU LOOK LIKE A TIKOLOSH.
6. SPAZA: NO, MAN. I'M A BUSINESSMAN. BIG DIFFERENCE.
7. SPAZA: YOU BUYING OR BROWSING BHUTI?
8. VAKS: ...HOW MUCH FOR THE CEPPIE?
9. SPAZA: `[FILL — price beat.` Proposal that dodges hardcoding a number:
   SPAZA: "CEPPIES AREN'T FOR SALE, BHUTI. CEPPIES ARE THE MONEY." /
   VAKS: "...THEN HOW MUCH IS THE MONEY?" `]`
10. VAKS: YOH THAT'S A LOT OF MANO?!
11. SPAZA: YES, BUT IT'S A LONG WAY UP BHUTI. SHOP SMARTLY.

**BRIDGE → SHOP:** the shop screen opens directly from the last beat.

---

### S3 — THE GREEN LUNG
*Slot: before Level 2. Purpose: the weed biome explained; the free opening
skin-up becomes SPAZA'S GIFT; Tikolosh is watching over him.*

1. [The shop nook. Vaks packing his buys. SPAZA leans on the counter.]
2. SPAZA: UP FROM HERE IS YOUR GARDEN, MY BOSS. THE AIR UP THERE IS HEAVY.
   YOU DON'T WALK IT SOBER.
3. [SPAZA slides something across the counter: a rolled joint.]
   SPAZA: FIRST ONE'S ON THE HOUSE.
4. VAKS: BOSS, YOU MUST KNOW DANKO. JAH PROVIDES. TIME TO PRAY.
5. [Behind a rock at the edge of frame, TIKOLOSH peeks out, watching over
   Vaks.]
6. VAKS: [heading up] SALA KAKHULE MY BOSS.

**BRIDGE → L2:** beat 2 names the irie mechanic (slow world, big jumps).
L2 opens automatically mid-skin-up: the irie world always starts on an irie.

---

### S4 — THE FOLLOWER
*Slot: after Level 2, before the shop. Purpose: the beef. Tikolosh robs Vaks
for a laugh; Vaks declares war; the player sees it's a game.*

1. [A ledge above the garden haze. Vaks counting his coins.]
   VAKS: YOH BOSS I'M RICHH.
2. [He looks up. A neat TRAIL of MANO leads up the next stretch of wall. At
   the top of the trail: TIKOLOSH, waving.]
   TIKOLOSH: JY BOSS!
3. [TIKOLOSH steals the money.]
4. VAKS: NO MAN. THIS BLOODY TIKOLOSH IS A TSOTSI.
5. [TIKOLOSH cackles, coins in his little arms.]
   TIKOLOSH: [hahahaha] BOSS! BOSS!
6. VAKS: DON'T "MY BOSS" ME. I'M WATCHING YOU.
7. [TIKOLOSH points back at him, mimicking Vaks's own voice, delighted with
   himself:]
   TIKOLOSH: [mocking] "I'M WATCHING YOU! I'M WATCHING YOU!" [cackles]
8. [Cave shakes.]
   VAKS: SIYAHAMBA NGOKU MEFTU.

**BRIDGE → SHOP → S5:** robbed, furious, climbing. (The mano comes back in S7.)

---

### S5 — LOAD SHEDDING
*Slot: before Level 3 (the dark level). Purpose: VAKS CAUSES the darkness;
cat-eyes origin; the saddest-funniest frame in the act.*

1. [Deeper cave. A chain of lanterns glows along the wall, the only light.
   A shape approaches in the gloom carrying a small light.]
2. VAKS: WHO'S THERE! I'LL MOER YOU WITH MY LUCKY STICK.
3. [JUMP SCARE: it's TIKOLOSH, lunging out of the dark holding up a little
   lantern, bringing it TO him.]
   TIKOLOSH: [proud, holding the lantern out] MY BOSS! LIGHT, MY BOSS!
4. VAKS: JY STAY BACK, WENA!
5. [Vaks hurls his empty zamalek. It misses Tikolosh and smashes the lantern
   chain. FLASH. The lights die section by section down the wall.]
6. [Darkness. Two beats of silence.]
7. VAKS: EISH. LOAD SHEDDING, BOSS.
8. [A tiny flicker: TIKOLOSH holds up the dented lantern. It flickers and
   dies.]
   TIKOLOSH: ...my boss.
   *(beat restored per your S5 bridge note — this is the lowercase saddest
   line in the game; cut it only on purpose)*
9. [Two yellow eyes open in the dark: Vaks's.]
   VAKS: GOOD THING VAKS HAS CAT EYES
10. VAKS: FINAL LEVEL, BOSS. WE CLIMB. NOW IN THE DARK.

**BRIDGE → L3:** the dark and the cat-eyes are HIS fault and HIS gift.

---

### S6 — THE BIG ONE
*Slot: boss intro. Purpose: the crowd gathers like a show, not a horde;
SPAZA gives the key; dancing is the only move Vaks knows.*

1. [The cave mouth. Dawn bleeding in from above, blocked by a massive shape.
   Small tikoloshes file in from every tunnel and settle in rows.]
2. VAKS: THIS IS THE END, BOSS.
3. [SPAZA strolls in, unbothered, leans next to Vaks.]
   SPAZA: VAKS MY BRA. THEY'RE QUEUEING.
4. VAKS: QUEUEING FOR WHAT?
5. SPAZA: THE BOSS LEVEL.
6. [THE BIG ONE rises to full height. Screen shakes. Bass hum.]
7. VAKS: WHA?!
8. SPAZA: HE'S BEEN DOWN HERE ALONE A LONG TIME, MY BRA. HE DOESN'T WANT A
   FIGHT.
9. SPAZA: HE JUST WANTS THE VIBE. GIVE HIM THE VIBE.
10. VAKS: VIBE? BOSS... VIBE WITH ME.
11. SPAZA: DALA MY BROTHER VAKS. DALA WHAT YOU MUST.
12. [Vaks steps forward. Plants his feet. The crowd goes quiet.]

**BRIDGE → BOSS:** the rhythm battle IS beats 10–12: his one move, done twice.

---

### S7 — IT'S LIKE THE WIND
*Slot: after the boss. Purpose: beef becomes brotherhood. They dance-fight,
find the same move, sync up, and become bras in the vibe. Then the sun
relaunches the panic into Act 2.*

1. [The vibe-off climaxes. Vaks throws his one move — dance. THE BIG ONE
   throws it back, bigger. They circle chest to chest, a dance that looks
   like a scrap.]
   VAKS: OH, YOU WANT TO GO? WENA? IN YOUR OWN CAVE?
2. [Big One stamps. Dust rings out. Vaks stamps back. The small tikoloshes
   go "OOH."]
3. [They trade moves faster and faster until, by accident, they hit the
   exact same move at the exact same beat. Freeze. They stare at each other.]
   VAKS: ...EY. THAT'S MY MOVE.
4. [THE BIG ONE nods slowly. It is also his move. The beat locks. They vibe
   together, in sync. The whole cave sways.]
5. [TIKOLOSH slides in between them doing a tiny version of the same move.]
6. [MUSIC STOPS. Only wind. Letterbox in. Hold it.]
   VAKS: [soft] ...IT'S LIKE THE WIND, BOSS.
7. [TIKOLOSH holds up the stolen mano. Offers it back. A peace offering.]
   TIKOLOSH: I'm sorry, you were my boss this whole time.
   *(`[ALT`, tighter + stays in his register: "SORRY MY BOSS. YOU WERE THE
   BOSS THE WHOLE TIME."`]`)*
8. VAKS: [takes it, ruffles Tikolosh's head] ...KEEP HALF. YOU EARNED IT,
   TSOTSI.
9. [THE BIG ONE slowly raises one huge arm and points at the dawn light.]
10. [Vaks steps into the light. It hits his face. He freezes.]
    VAKS: THE SUN. THE SUN IS UP, BOSS. GRANNY…

**BRIDGE → ACT 2:** the want (postponed, never resolved) yanks him into the
township. The mano callback (beats 7–8) closes the S4 beef.

---

### S8 — ONE FOR THE ROAD *(draft 1 — awaiting World 2 revision)*
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

### S9 — BABALAS ECONOMICS *(draft 1 — awaiting World 2 revision)*
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
10. VETKOEK: TAXI ROUTE AHEAD, MY BOSS. WHEN YOU HEAR THE HOOTER — YOU ARE
    NOT IN THE ROAD.
11. VAKS: I'M NEVER IN THE ROAD. THE ROAD IS IN MY WAY.

**BRIDGE → L5:** beat 10 names the taxi mechanic (the horn-dash). Tallman &
Shorty reappear at L5 checkpoints stalling granny — their debt gets worked off.

---

### S10 — AIRTIME *(draft 1 — awaiting World 2 revision)*
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

### S11 — THE PLAAS *(draft 1 — awaiting World 2 revision)*
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
7. [Behind the fence, TIKOLOSH pops up holding a ceppie.]
   TIKOLOSH: MY BOSS!
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

---

## PART 5 — CAVE SCENE IDEAS (pick and choose)

Kept verbatim from the revision, with an implementation cost/value tag per
idea so picking is easy. ★ = recommended first picks.

1. ★ **The missed-calls counter.** Vaks declines Granny's call in S1, and a
   missed-call number climbs every cutscene after: 1, then 8, then 20, then
   40-plus by the boss. Silent visual chorus, escalating dread, near-zero
   cost. Pays off in Act 2 when Granny goes quiet instead of calling.
   *(COST: trivial — one caption/phone beat per scene.)*
2. **Tikolosh the tagger.** His flex "EK IS DIE BAAS VAN DIE CAVE" is
   spray-tagged on walls all through the levels. The little guy has claimed
   the whole cave as his turf. Turns his S1 line into running worldbuilding
   and makes the cave feel lived-in rather than empty folklore.
   *(COST: medium — new wall-prop sprites in the level renderer.)*
3. **Tikolosh mirrors Vaks.** In the levels, Tikolosh copies Vaks's movements
   in the background. It plants that he already knows "the one move," so when
   THE BIG ONE also knows it in S7, the payoff reads: the move is just how
   the whole cave vibes, and Vaks was one of them all along.
   *(COST: higher — a live background entity that mimics player input.)*
4. **Spaza's radio.** A faint transistor behind the counter playing kwaito or
   gqom, always on. The cave has a soundtrack. When the boss bass hits in S6,
   it is the same station turned all the way up. Quietly foreshadows that the
   final fight is a dance. *(COST: low — a shop music slot + S6 music cue.)*
5. ★ **The zamalek as a three-act prop.** The bottle is a weapon in S1 and S5
   (thrown, causes the load-shedding). In S7 it comes back as a shared drink
   between Vaks and THE BIG ONE: the bottle that blacked out the cave now
   seals the friendship. *(COST: trivial — one S7 beat + a bottle prop.)*
6. **The altar that is a stage.** Before the boss, the levels show ominous
   offerings and shrine imagery to "that other tikolosh" that read as
   sinister. S6 reveals it was never an altar. It is the stage where everyone
   gathers to watch him vibe. Reframes the dread as anticipation in
   hindsight. *(COST: medium — L3 prop set + one S6 beat.)*
7. **A mid-cave side scene (mirrors Act 2).** A short mid-L2 irie beat, 3–5
   beats, mist frozen: while high, Vaks briefly sees the mist as friendly and
   dancing, then it snaps back to scary when the irie wears off. The one
   moment the player watches Vaks almost see the truth, and lose it.
   *(COST: medium — an in-level scripted moment, not a normal cutscene.)*

---

## PART 6 — NOTES FOR REVISION (read before editing)

1. **Keep every BRIDGE.** Reword freely, but each scene must still cause/name
   the next level's mechanic. That's the spine of the whole design.
2. **The turf game stays harmless.** The Tikolosh scares, robs and mocks —
   but never actually hurts Vaks, and the player must always be able to see
   the play behind it. If a revision makes him genuinely malicious, the S7
   peace offering stops landing.
3. **Keep Vaks flat.** He never says what he learned. S8 beat 13 ("some winds
   you vibe with...") is the one time he gets to be accidentally wise — let it
   stay accidental.
4. **Gogo speaks only in the group chat until S11, and never in dialogue.**
   Her silence is her power. The tea scene stays wordless.
5. **Line lengths:** spoken lines ≤ ~90 chars; they render ALL CAPS in a
   pixel font. Short is funnier. (S1's voice note is the one exception — it
   is a real recording and plays as audio.)
6. **Serious things stay light:** shebeen pressure (S8), debt (S9), phone
   theft (S10), load shedding (S5). One truth per scene, jokes on top.
7. **TIKOLOSH's register:** barks and cackles ("BOSS!", "MY BOSS!", "JY
   BOSS!"), full sentences only when flexing (S1) and the S7 apology. The
   lowercase "...my boss" in S5 beat 8 is the saddest line in the game —
   protect it.
8. **Open `[FILL]`s:** S2 beat 9 (the price beat) and the S7 apology line
   choice (verbatim vs tightened ALT).
