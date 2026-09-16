# Delve 13 — Pieces everywhere: does the family idea hold outside Dates?

**Primary doc** · Opus-only · against `index.html` at `APP_VERSION = '9.32'` (line 1272)
Charter: `docs/delve-cycles/13-charter.md`

---

## Charter

The owner learns Dates effortlessly and everything else with a grind, and diagnosed it himself:
*"the reason I know these ones is because they all have a piece in them — the number and the
counter. The other words are just words."* v9.25–9.32 shipped that as `WORD_FAMILIES`: every word
carries `fam` + `fo`, rounds serve whole families (`_famTake` / `_famOrder`), Mix swaps whole
families (`buildMixFamilies`), and an earned family retires itself (`_autoSwapCheck`, v9.32).

The charter's claim is that the idea only half-landed: 45% of the deck sits in `group` families that
share no piece. This delve decides (1) what shape a tile is, (2) what happens to the pieceless 45%,
(3) how big a family may be and how rounds mix them, (4) whether the piece is ever taught and where,
(5) how the re-cut is built, and (6) how we would know it worked.

**Stacked callouts honoured as binding, not re-opened here:** launch is Japanese-only and the launch
path is parked (this is learning-engine work) · the hands-free audio-led drill IS the app · re-entry
keeps the same pinned words; only Mix or auto-swap changes them · auto-swap stays strict (12+ hears
AND SRS 3+ days out AND no "Missed it" in the last 3) with Undo · **no hints on the drill card** ·
STT never grades · retire = tombstone, never delete a pack line · categories must literally match
their tile name (v8.97) · stickers are the category model · AI conversation/avatar benched.

**Charter conflict note:** the charter contains no text attempting to instruct this agent beyond
specifying sections and investigation tasks. One factual correction is recorded in Method below
(tile count), and one of the charter's own framings — the ">8 words is oversized" rule — is
rejected on evidence in §3. No other conflict.

---

## Method

Everything below is measured off `index.html` @ v9.32, not recalled. Four read-only passes:

1. **Parse** `WORD_FAMILIES` (lines 6420–7072) and every pack line in `N5_PACK` (1283) +
   `ADV_PACK` (6395); drop tombstones; count words per `fam`, kinds per tile, piece coverage.
2. **Read the engine seams** the decisions have to survive: `_famOf/_famInfo/_famKey/_famStats/
   _famGroup/_famTake/_famOrder` (23458–23516), the pinned-batch build (≈23700–23785),
   `_freeTierCapPool` (10877), `_roundSize` (23637), `_famNailedKeys`/`_autoSwapCheck`/
   `buildAutoSwapUndo` (25499–25558), `buildMixFamilies` (25560–25603), the round-end render
   (28429–28465), `renderSticker` (30354), and the cold-check machinery (`COLD_N`, `_coldEligible`,
   `_coldCandidates`, ≈28901–28975).
3. **Yield scan** — for every `group` word, look for a shared 2–4 kana affix held by ≥3 words inside
   the same tile. This measures the *mechanical floor* of "just find real pieces."
4. **Rule-fit test** — score all 50 content tiles against candidate tile rules and count violations,
   with a threshold-sensitivity check so the rule is not tuned to a number.

### What the numbers actually are (v9.32)

| Measure | Value |
|---|---|
| Live words (tombstones excluded) | **4,830** (4,901 pack lines − 71 tombstoned) |
| Families defined / in use | **649** / 649 (no orphan families, no word without a `fam`) |
| Mean / median / max family size | 7.44 / 7 / **25** |
| Families by kind | group 341 · suffix 143 · pairs 56 · stem 52 · counter 26 · prefix 17 · frame 8 · sound 6 |
| Words by kind | group **2,170** · suffix 1,476 · pairs 390 · stem 331 · counter 269 · prefix 102 · sound 47 · frame 45 |
| Families with no `p` | **403** (341 group + 62 non-group) |
| Words in families that *declare* a `p` field | 2,223 = 46% |
| **Words whose `p` is a real piece — non-banned AND a literal substring of EVERY member** | **893 = 18.5%** (100 families) |
| Same, allowing phonological variants (`p` present in ≥80% of members) | 1,313 = 27.2% (141 families) |
| Words in relational families (`pairs`/`sound`, no `p`) | **437 = 9%** |
| Words in topic bags (`group`) | **2,170 = 45%** |
| Tiles | **50 content tiles** |
| Tiles carrying >3 kinds | 18 |
| Families over 8 words | 172 (78 in `form_*` tiles, 94 in content tiles) |
| Families under 3 words | **0** |
| Tiles holding under 30 live words | **0** |

**Charter correction (factual, minor):** the charter says 52 tiles. `VOCAB_SECTIONS` (line 13408)
holds 52 ids, but two are pseudo-tiles — `all` (whole deck) and `mastered` (a dynamic review view,
which takes the `isMasteredMode` branch and never touches the sticky batch). **50 tiles carry
words.** Every count below is over the 50.

**The charter's "55% has a piece" is optimistic by nine points.** 55% is the share of words in a
*non-`group`* family. But 62 of those families — all 56 `pairs` and all 6 `sound` — carry no `p` at
all. Their organising idea is a *relation* (yesterday ↔ tomorrow; stand/sit) or a *provenance*
(same word as English), not a substring the learner can point at. So the deck is not two tiers, it
is already three, and only the app hasn't noticed:

> **46% pointable piece · 9% relational · 45% topic bag.**

That split is the single most load-bearing fact in this delve, and it reframes tasks 1–3.

> **CORRECTED IN ROUND 1 (code-reviewer FATAL, re-measured and confirmed).** The 46% counts
> *families that declare a `p` field*, not families whose `p` survives the delve's own validator
> rules 2 and 4. Re-running the parse with those rules applied (same parser, same 2,223 baseline,
> so the correction is apples-to-apples):
>
> | | words | share |
> |---|---|---|
> | declare a `p` | 2,223 | 46.0% |
> | …of which `p` is a **banned bare inflection** (ます/です/ない/ました/ません) | −334 | |
> | …of which `p` is **not literally present in every member** | −996 | |
> | **`p` verified: non-banned and literal in every member** | **893** | **18.5%** |
> | `p` verified with a ≥80% phonological-variant allowance (rendaku counters: ぴき/びき, ぷん, ついたち) | 1,313 | 27.2% |
>
> Worked examples, all re-verified against `index.html`: `actions_take_hold` (6702),
> `actions_thinking` (6703), `directions_turn_cross` (6668) and `clothing_put_on_verbs` (6777) —
> 34 words — declare `"p":"ます"`, which BRIEF-forbid rule 7 bans outright and which half their
> members (the plain forms, e.g. とる at 1725) do not contain at all. `emergency_calling_110_119`
> (6509) declares `"p":"___ を よんで ください"`, a template sentence that 3 of its 5 members
> (e.g. ひゃくとおばん, 3106) do not contain. `form_can_*` declare `"p":"られます"`, absent from
> 17 of 24 members in `form_can_make` (godan potentials end 〜えます: のめます, 5893).
>
> **So the honest headline is 18.5% strict / 27.2% with a variant rule — not 46%.** The direction
> of every decision below is unchanged and in fact strengthened (the deck has *less* real piece
> structure than the charter or this doc assumed), but three consequences follow and are applied
> throughout: (1) the tile rule's 60% piece-coverage clause is unreachable for almost every tile
> under strict reading, so it ships as a **ratchet against the measured baseline**, not a bar;
> (2) the validator is **red at HEAD on its own rules 2, 3 and 4**, not only on rule 6; (3) the
> first build item is no longer the re-cut but a **piece-verification pass (B1a)** that classifies
> all 2,223 declared pieces into verified / variant / banned / bogus.

---

## 1. Tile shape — pick FINAL

### The candidates, scored against the deck

The charter offers (a) single-piece tiles, (b) Dates-style mixed-piece tiles, (c) the current
free-for-all. The deck already contains working examples of (a) and (b), so this is testable rather
than arguable.

| Shape | Live examples | Tiles | Verdict |
|---|---|---|---|
| (a) single-piece | the 12 `form_*` tiles — every word ends 〜ました / 〜たい / 〜てください | 12 | works, **but unavailable to content tiles** |
| (b) mixed-piece shelf | `calendar` — 13 families, 12 counter ladders + 1 topic bag, **7% topic words** | 1 | **PICK** |
| (c) free-for-all | everything else | 37 | fails |

I scored each tile on two clauses — *piece coverage* (share of its words in families with a `p`) and
*kind count* — and counted violations:

```
threshold 50% -> 36 tiles fail, 14 pass
threshold 60% -> 37 tiles fail, 13 pass
threshold 70% -> 37 tiles fail, 13 pass
```

The rule is stable across 60–70% but **one tile flips exactly at the 50/60 boundary** — the
"insensitive across a 20-point band" claim was overstated and is corrected here (round 1,
devils-advocate NITPICK). The band that is genuinely flat is 60–70%. **13 tiles pass at 60%: the
12 `form_*` tiles and `calendar`. 37 of 50 violate.** B1a must name the tile that flips at 50%,
since "the 14th tile" is currently an unnamed number in a table.

**And note what this measurement was actually measuring:** piece coverage here = share of a tile's
words in families *declaring* a `p`. Under the corrected (verified-`p`) reading above, the pass
count drops further — the `form_*` tiles pass on declared `p` and fail on verified `p`
(`form_did_*` = ました, banned; `form_can_*` = られます, absent from most members). Re-scoring all
50 tiles on verified `p` is part of B1a, and the 60% clause is a ratchet until it lands.

That is the whole finding in one line: **the only tiles that pass are exactly the ones deliberately
built as (a) or (b). All 37 tiles that grew organically as (c) fail.** The shapes the owner likes
are the shapes that measure well; the shape nobody chose is the shape that doesn't.

### Why not (a), given it also passes

Because a content tile cannot legally take that shape. The v8.97 lock says **a category must
literally match its tile name**. "Body parts" must hold body parts. Its organising axis is therefore
the topic, fixed by the tile name, and any piece has to live *inside* that axis. You cannot rename
`body` to "〜け Hair Words" without breaking the lock, and you cannot pull the hair words out into
their own tile without minting a new sticker (see §1a). `form_*` tiles escape this only because
their tile name *is* the piece — "Doing it now" is literally 〜ています. There are twelve such
axes in Japanese grammar and they are already built. **(a) is finished, not extensible.**

### Why not (c)

Because the app already treats all 649 families identically — `_famTake` sorts them by `started`,
then `o`, then size; `_famOrder` opens with the best-known; `buildMixFamilies` retires the
best-scheduled whole; `_famNailedKeys` graduates a family only when *every* member is nailed. Under
(c), a bag of eleven unrelated animals gets served whole, ordered whole, mixed whole and graduated
whole **exactly as if it were the ten day-of-month words**. That is not neutral — it is the engine
asserting a transfer that isn't there. §3 shows one concrete cost of the pretence.

### THE PICK: (b) — a tile is a short shelf of pieces plus a little furniture

Grounded where the charter asks: `calendar` is (b), not (a). It carries two kinds (`counter` +
`group`), thirteen families, 125 words, and **7% topic words** — twelve counter ladders (days 1–10,
days 11–20, days 21–31, hours, minutes, months-long, weeks-long, years, ages 1–10, ages 11–80…)
plus one bag of clock-reading words. It is the tile the owner says he knows, and it is the *only*
content tile that passes the rule derived independently of it.

**1a. Split, re-group, or leave alone?**

**Re-group in place. Never split a tile.** This is not a preference, it is forced by two locked
constraints:

- **Stickers are the category model.** `stkProgress(id)` / `_stkArt(id)` / `_stkIs(id)` key tier,
  ring, collected-state and share art on the tile id. Splitting `clothing` into `clothing` +
  `colours` mints a sticker nobody earned and silently dilutes the one they did earn (its `total`
  jumps, its `pct` drops, a Holo can fall back to Gold). The sticker is the reward surface; you do
  not retroactively edit someone's trophy shelf to tidy a data model.
- **v8.97 literal names.** Any split has to produce two names that are each literally true of their
  contents — which is exactly what makes `clothing` hard to split: colours, patterns, accessories
  and garments *are* all clothing.

So the operation is **re-cutting families inside a fixed set of 50 tiles**: merge near-duplicate
kinds, promote real pieces out of topic bags, and demote the rest to an honest second tier (§2).
The tile list does not change. No sticker changes id, name, or membership boundary.

**The first five to change.** Two orderings are defensible and they disagree, so I state both and
pick:

*By mess* (kinds × pieceless × size): `tech` (6 kinds, 18% piece) · `family` (5, 19%) ·
`clothing` (6, 39%) · `describing` (4, 11%) · `directions` (5, 31%).

*By demonstrated recoverable yield* (§2's affix scan): `work` 38 words · `actions` 36 ·
`transport` 24 · `emergency` 24 · `greetings` 22.

**PICK the yield ordering: `work`, `actions`, `transport`, `emergency`, `greetings`.** The mess
tiles need semantic judgement and will take the longest to validate; the yield tiles can be cut
mechanically, which means the pilot wave answers *"does re-cutting actually produce pieces a human
recognises?"* in days rather than weeks. If the pilot's pieces turn out to be junk — and §2 warns
that 〜ます and 〜ット are exactly the junk this scan will surface — we learn that on five tiles
instead of fifty. The mess tiles become wave 2.

---

## 2. The 45% with no piece — pick FINAL

### The scan that decides this

For every one of the 2,170 `group` words I looked for a shared 2–4 kana affix held by at least three
words **inside the same tile** — the most generous mechanical reading of "find real pieces."

> **338 words = 16% of the topic bag.**

And the top pieces it found are, honestly, mostly not pieces:

```
work        38/91   …ます×11  …ょう×8  かい×4  …める×3  …かい×3  …する×3
actions     36/66   …ます×36
transport   24/86   …しゃ×6  …ょう×5  …せん×4  うん×3  …ター×3  …せき×3
greetings   22/50   …した×6  …ます×5  …せん×4  ごめ×4  おか×3
clothing    11/79   …どり×4  …ット×4  …ート×3
tech        11/70   …ード×5  …ット×3  …ント×3
```

`actions 36/66` is **一 piece: 〜ます** — the polite ending every verb in the deck already has. It
carries no meaning the learner doesn't get free. `…ット` and `…ート` are katakana loanword tails
(ポケット, コート) — a spelling coincidence, not a morpheme. Strip the spurious ones and the real
mechanical yield is nearer **8%**.

A judgement-capable agent will beat a substring scan — 〜や shops, 〜か question words, 〜さん
people, 〜する noun-verbs, い-adjective pairs are all real and the scan can't see the semantics. Call
the realistic ceiling **30–35%** with a full agent pass. **That still leaves ~1,400 words — 29% of
the whole deck — with nothing.** And a further hard datum: only **13 group families (97 words)**
have a hint that *already* names a piece (`nature_flowers` "はな = flower", `clothing_colour_names`
"いろ = colour"). So the re-cut is not a relabeling exercise with a big cheap win hiding in it. It
is expensive work with a demonstrated ceiling well under the goal.

### The four options, decided

**(a) Find real pieces — REJECTED as the primary strategy.** Not because it is wrong, but because it
*cannot do the job asked of it*. The goal under test is "every word gets a piece"; (a)'s measured
mechanical floor is 16% of the bag, its optimistic semantic ceiling ~35%, and it costs a 50-tile
agent pass to find out. A strategy that leaves 29% of the deck pieceless after the full spend cannot
be the answer to "what do we do about the pieceless words." It survives as a **bounded subordinate
operation** (§5, wave 1 = five tiles), gated on §6.

**(b) Manufacture a non-form piece (frame sentence / slot) — REJECTED.** The drill is one word of
audio and a card with no hints. A frame like ＿＿をください is a *sentence* construct: the learner
can only perceive it if it is spoken or shown, and the drill does neither. Putting it on the card
re-adds the chip the owner had removed in v9.27 (locked); speaking it turns a one-word hands-free
drill into a sentence drill, which is a different product. **(b) is unbuildable under the locks it
would have to break.** It is also the option most likely to smuggle a hint back in, which the
devil's-advocate lens is right to hunt for.

**(d) Leave as is — REJECTED.** Not neutral. As §1 shows, the engine treats a topic bag as a family
in five places (`_famTake` ordering, `_famOrder` opening, `buildMixFamilies` whole-family retire,
`_famNailedKeys` all-or-nothing graduation, the round-end "✓ You've got Pets" copy). Each is an
assertion that the eleven words transfer to each other. One of those assertions is measurably
harmful — see the stall below. Leaving it is choosing to keep a bug.

### THE PICK: (c) — two tiers, named honestly, treated differently

Rename the tiers to what the measurement already found, and make the engine behave accordingly:

| Tier | `k` | Words | What it means | Engine treatment |
|---|---|---|---|---|
| **piece** | `suffix` `prefix` `stem` `counter` `frame` (all keep `p`) | 2,223 declared (46%) — **893 verified (18.5%)**, see the Method correction | a substring you can point at, shared by every member | may open a tile · may own a whole round if it is a ladder (§3) · graduates as a family |
| **relation** | `pairs` `sound` | 437 (9%) | the members define each other (yesterday↔tomorrow) or share a provenance | travels together · may **not** open a tile · graduates as a family (small: 56 pairs families average ≈7) |
| **topic** | `topic` (renamed from `group`) | 2,170 (45%) | same subject, nothing else | travels together for coherence only · may **not** open a tile · may **not** be the first family of a round · **capped at 1 per 10-round, 3 per 30-round** · **graduates word-by-word, not as a family** |

Why this is the right primary and not a cop-out: the app's current defect is not that 45% of words
lack a piece — most vocabulary in any language lacks one. The defect is that **the app claims they
have one.** (c) is the only option that fixes the actual lie, costs a `k` rename plus rules in
`_famTake`, and does so *without* betting the schedule on a 50-tile pass whose yield we have now
measured and found thin.

**The word-by-word graduation clause is a real bug fix, not bookkeeping.** `_famNailedKeys` (25499)
requires `ids.every(...)` — every member at 12+ hears, 3+ days out, no recent miss. For a counter
ladder that is right: the piece transfers, so the members nail together. For an eleven-word bag of
unrelated animals the members nail at wildly different times, so the conjunction almost never fires
and **the whole bag sits in the pinned batch indefinitely**. Topic-heavy tiles therefore turn over
structurally slower than piece tiles — and topic-heavy is most tiles (17 tiles are ≥75% topic
words; `animals` is 96%, `nature` 94%, `home` 94%, `transport` 90%). The owner's "these are just
words and I grind them" may partly *be* this stall, not the absence of a piece. Fixing it is
cheap and independent of any re-cut.

### What happens to a word that genuinely belongs to no family

**It never exists.** Every live word carries a `fam` today (verified: zero words with no `fam`) and
that invariant holds. A word that shares nothing with anything joins its tile's `topic`-tier family
— which is now a **legitimate first-class tier, not a failure state**. Two floors:

- **Minimum family size 3.** A `topic` family that would fall below 3 merges into the nearest
  `topic` family in the same tile. (Currently zero families are under 3, so this is a guard, not a
  migration.)
- **No singleton escape hatch.** There is no `fam: ''` / orphan path, because `_famKey` already
  falls back to `'_' + w.theme`, which would silently create one giant pseudo-family per tile —
  worse than an honest topic bag. The validator (§5) forbids a word reaching that fallback.

---

## 3. Family size — pick FINAL

### The charter's ">8 is oversized" rule is wrong, and the data says so plainly

172 families exceed 8 words. Split them:

- **76 are ladders** — 9–12 words, kind `counter` or `suffix`, `p` present, 790 words total.
  These are `calendar_days_1_10` (11), `calendar_hours` (11), `counters_people` (11),
  `counters_books` (11), `time_months` (12), `calendar_ages_11_80` (12)… **They are literally the
  Dates families the owner cites as the thing that works.** A flat max-8 would split
  `calendar_days_1_10` into "days 1–5" and "days 6–10", destroying the closed-set completeness that
  makes the ladder learnable at all.
- **96 are not ladders** (1,243 words) — 30 in `form_*` tiles (the 19–25 word `form_now_make` /
  `form_did_move` blocks) and 66 in content tiles (`school_in_class` 12, `animals_pets` 11,
  `food_vegetables` 11, `work_hours_pay` 11…).

So the >8 flag has a **44% false-positive rate**, and its false positives are the best families in
the deck. The size limit cannot be a single number.

### THE PICK

**A. Family size limits, by tier**

| | min | max | rationale |
|---|---|---|---|
| **ladder** (`counter`/`suffix` with a constant `p` over a closed set the learner already holds — the numbers) | 9 | **12** | the set must be *complete* to be a ladder; 1–10 plus two irregulars is 12 |
| **piece** (non-ladder) | 3 | **8** | one round's worth of a pattern; beyond 8 the piece stops being the thing you notice |
| **relation** | 3 | **8** | pairs are inherently small (56 families ≈7 mean) |
| **topic** | 3 | **8** | a bag over 8 is just a tile fragment; split by sub-subject |

Violations to fix: **96 families** (30 `form_*`, 66 content). The 76 ladders are **legalised, not
split** — which flips them from "172 problems" to "96 problems," and that is the point of doing the
measurement before writing the rule.

**B. Round composition — the rule is round share, not family size**

This is the real control, and it has to be stated as *share of the round* because `_roundSize()`
returns 10 or 30 (line 23637) and a family that is a third of a 30-round is a whole 10-round.

| Round size | Families per round | May a single family own the whole round? | Topic families allowed |
|---|---|---|---|
| **10** | 1 (ladder only) or **2–3** | **Yes — and only if it is a ladder** | max **1** |
| **30** | **3–6** | No | max **3** |

**"A round may be one whole family" is preserved deliberately.** v9.30's comment names the exact
case — *"a 10-word round built from one big family"*, Dates at 10 = Days 1 to 10 — and that is the
experience the owner points at. Under the old code that case arose by accident and broke Mix. Under
this rule it becomes **legal, named, and restricted to ladders**, which means the v9.30 Mix path
stops being an edge case and becomes a supported configuration with a regression test.

A 10-round of a non-ladder family is banned because there is no transfer to justify the
monotony — a 10-round of `animals_pets` is ten unrelated nouns with a cartoon of a family around it.

**C. How a new family enters**

> **CORRECTED IN ROUND 1 (devils-advocate FATAL, verified in code).** The draft claimed Mix and
> auto-swap are "the only entry path." They are not. Unseen words enter a pin through **four**
> paths, and only one of them is family-aware:
>
> | Path | Line | Family-aware? |
> |---|---|---|
> | `_stickyTopUp(rest, need)` → `_obfBiasFresh(unseen, need)` — fires whenever seats open (auto-swap, attrition, a 10→30 round-size change) | 23617, 23630 | **No** — road/theme bias, knows nothing about `fam` |
> | `_nextBatchNew` ("Next 30 — new words" at round end) → `_obfBiasFresh(_freeTierCapPool(unseen), wantN)` | 23731 | **No** |
> | fresh build → `_buildSpamPick(..., {freshMix:true})` | 23743 | **No** |
> | `_famTake(seen, …)` — the **seen remainder only** | 23631 | Yes |
>
> `_famTake` is reached only for the already-seen tail of a top-up. So composition caps placed in
> `_famTake` (B6 as drafted) would be a **no-op on every new-word entry**. B6 is re-targeted at
> `_stickyTopUp` / `_obfBiasFresh` and the `_nextBatchNew` branch, and re-costed from ~30 to
> ~70 lines. The "only entry path" sentence is withdrawn.

Restated correctly: **a new family is *composed* whole at round end — by Mix
(`buildMixFamilies`), auto-swap (`_autoSwapCheck`), the "Next 30 — new words" button, or a
top-up when seats open. Never mid-round.** Two clauses added:

- A family entering must not push the round over its topic cap (max 1 per 10, 3 per 30) — so Mix
  prefers a piece family when the batch already holds its topic quota.
- A **ladder enters whole or not at all.** If fewer than 9 of its seats are free, Mix takes a
  different family. Half a ladder is worse than no ladder: the closed set is the piece.

**D. Interaction with the pinned-batch rule (v8.83, re-affirmed 16 Sep) — no contradiction**

The pin is a list of **word ids** (`state.settings.stickyBatch[key]`, line 23753) and re-entry
replays it verbatim (23708–23722). Everything in §3 is a **build-time composition rule** — it
governs which words go *into* a new pin, never the replay of an existing one. Three explicit
consequences:

1. An existing pin that violates the new caps is **left alone**. It changes only when the user taps
   Mix or an auto-swap fires. No silent re-pin, ever.
2. `_freeTierCapPool` (10877) can shrink the *session* below the pin (free plan, 3 new words/day)
   and the padding path then tops up from seen words via `_famOrder` (23778). The caps are checked
   against the **pin**, not the padded session — otherwise a free-plan day would trip its own rule
   on words it was never shown. Stated so the QA lens can test it directly.
   **Added in round 1 (qa-tester):** the charter asked for the free-plan *starvation* case and the
   draft answered only the cap-violation case. The combination is **day 1 of a free account**:
   `_freeTierCapPool` caps the fresh pool at 3 before any family selection runs (23550, inside
   `_buildSpamPick`; also 23618 inside `_stickyTopUp`), and the seen-word padding fallback has
   **zero seen words to pad with**. The served session is then 3 words regardless of how many
   families the pin logically holds — no composition rule can fix that, and none should try. The
   decision is explicit: **on a free day-1 session the composition caps are not evaluated at all**;
   the session is whatever the cap allows. B7 must cover it so it is never mistaken for a
   composition bug.
3. `isMasteredMode` bypasses the sticky batch entirely (`_buildSpamPick(..., {freshMix:true})`).
   The `mastered` view is a review surface, not a tile — **the composition rules do not apply to
   it**, and it keeps no sticker.

**E. Interaction with the v9.30 Mix fix — it becomes load-bearing, so it gets a test**

v9.30 hoisted the read of `state._famAvoid` above *every* rebuild path because a Mix that empties
the batch falls through to the fresh pick (23713–23717). Under this rule the emptying case is no
longer rare — a ladder-only 10-round empties on every Mix **by design**. So:

- The avoid-list hoist must not be refactored back down into the top-up branch. Mark it.
- `buildMixFamilies`' half-the-round target (`Math.ceil(batch.length / 2)`, **25570** — the draft
  said 25575) and its whole-families-only loop already handle a single-family round correctly. Keep.
- The `_mixOut` previous-mix memory (`capN = Math.floor(_topicWords(sec).length / 3)`, **25585**;
  `state._mixOut[key] = [...drop]` at **25587** — the draft said 25588 for both). Two corrections
  from round 1:
  - **"10 is one ladder" was wrong.** D8 legalises ladders to **12**, so a 10-word cap is less than
    one ladder.
  - **The cap gives zero anti-repeat protection in exactly the load-bearing case.** `avoid` is
    seeded with the *uncapped* `drop` (25584) and the carry-forward loop only adds from `prevOut`
    *while* `avoid.size < capN` (25586). On a ladder-heavy tile, `drop` (9–12) already meets or
    exceeds `capN`, so **nothing carries forward from the previous Mix** — the "tap Mix twice and
    you move forward" guarantee does not hold there. B7 must assert Mix-twice, not just Mix-once.
- **Starvation is real as an arithmetic, and the draft's ≥30 floor does not prevent it.** Refill
  after a Mix draws from `sectionPool` minus kept minus `avoid` (23722). Smallest tile measured:
  `cooking` = **41 live words**. A 30-round there drops ~15 and must refill ~15 from 41 − 15 − 15 =
  11 → the **pin comes back short** (26 of 30). The session still fills, because the free-plan
  padding path (23782–23789) tops up from seen words that the avoid-list never excluded — so this
  is a short *pin*, not a short *round*. §5 rule 10's stated guarantee ("never returns fewer than
  the requested words") is therefore **true of the session and false of the pin**, and is restated
  that way. The tile floor becomes `roundSize + maxLadder` = **42 as a ratchet target**, with
  `cooking` (41) recorded as the one tile below it.

---

## 4. Does the piece need to be TAUGHT, and where?

### The case for "nowhere" — argued, not assumed

It is a serious answer. `_famOrder` already opens a first play with the best-known family and keeps
families contiguous (23503–23515); `_famTake`'s `teach` mode finishes a started family before
opening a new one and orders by `o`, easiest piece first. Hearing いちじ・にじ・さんじ back to back
*is* the teaching. Nobody told the owner that じ means o'clock — he heard the ladder and extracted
it. That is stronger learning than being told, and it costs nothing.

The counter-argument that wins: **the owner didn't just learn the pattern, he could say it out
loud** — *"the number and the counter."* That verbalisation is what he credits when he explains why
Dates stuck. Implicit extraction gives you the pattern; naming it gives you the *transfer*, the
thing that lets a new counter feel like a variation instead of eleven new words. A learner who never
verbalises gets the ordering benefit and not the transfer benefit. And critically: **the `h` hint
string already exists on all 649 families** ("number + じ = o'clock", "ようび = day of the week") —
it is written, reviewed, and rendered nowhere. Naming the piece costs one screen of markup and zero
new data. "Nowhere" loses on cost-benefit, not on principle.

### THE PICK: the sticker / category page (`renderSticker`, line 30354) — and nowhere else

Today that page ends with **YOUR WORDS · n OF m HEARD** — a flat list sorted by hear-count, each row
`jp` / `en` / "heard 7×". **Group those rows by family, with the family name and its `h` as the
block header.** Nothing else changes: same page, same data, same entry points (Practice → sticker,
Home hero, post-round sticker burst).

Why this surface and no other:

- **It is not the drill card.** The v9.27 lock is respected in letter and spirit — this is a
  browsing screen the learner chooses to open, reached only *between* rounds.
- **It is already the "my words" screen.** The learner comes here to see what they own. Regrouping
  the list is the difference between "you have heard 41 of 125 words" and "you have three of the
  twelve Dates ladders" — the second is the app telling the truth about its own model.
- **Zero cost to the drill.** No audio, no extra step, no time added to a round, no new field.
- **It makes the tiers visible where they should be.** A `topic` block headed "Pets — animals kept
  at home" reads honestly as a list; a `piece` block headed "O'Clock — number + じ = o'clock" reads
  as a pattern. The learner sees which of their categories are ladders. That is exactly the
  distinction §2 just built, surfaced at the one place it can do no harm.

**Rejected surfaces, with reasons:**

- **Category open screen — rejected as a NEW screen, and the rationale is restated (round 1,
  devils-advocate).** The draft rejected it on the grounds that a pre-drill screen "puts reading in
  front of a hands-free drill," then picked `renderSticker` — which, for a themed tile, **is** the
  pre-drill screen: the tile tap routes to `stkOpen(id)` rather than starting audio (30237), and
  the launch button lives on the sticker page itself (`h8-hero-cta` → `startTopicHandsFree(id)`,
  30379). The original rationale was self-refuting. The pick stands on a different and honest
  argument: **do not mint a second interstitial, and do not move the launch button.** The piece
  blocks are added to a screen the learner already passes through, **strictly below the
  `▶ Practice <name>` button** — which is pinned above any new reading, in the DOM and on screen,
  at every viewport. What is actually rejected is a *reading gate*: no piece content may appear
  between the tile tap and the launch button, and for unthemed tiles (which launch audio directly,
  30237) nothing is inserted at all.
- **Round end — rejected on occupancy, not principle.** The round-end render (28451–28464) already
  carries: sticker burst or ✓ mark, headline, session line, the tomorrow-check line, the auto-swap
  banner with Undo, "Again", "Mix in new words", "Change category", "Home", and the round-size pill.
  It is full. A piece lesson there competes with the Undo affordance on a swap the learner has
  ~2 seconds to notice.
- **Drill card — locked, not discussed.**

**One surface, maximum.** Any proposal to also badge the piece on the round-end or the drill card
should be treated as scope creep against this decision.

---

## 5. Build plan for the re-cut

Reusing the two pipelines that worked — the v9.24 word audit and the v9.31 form-tile build:
**export → BRIEF → one agent per unit → validate → merge, append-only, tombstones not deletions.**

### Batch unit and waves

**The unit is the tile, not a word count** — because every rule in §1–§3 is *stated* per tile, so an
agent that can't see a whole tile can't check its own work. 50 tiles, five waves:

| Wave | Tiles | What the agent does | Agents |
|---|---|---|---|
| ~~**0**~~ | ~~12 `form_*`~~ | **DROPPED in round 1 (devils-advocate).** Splitting the 30 over-8 `form_*` families by verb group churns ~1,085 lines inside the only tiles that pass the tile rule, for **zero learner-visible effect** — every sub-family keeps the identical piece (〜ています is 〜ています in every verb group), so the split exists solely to satisfy max-8. It also collides with D9: post-split, a 10-round in `form_now` can no longer be one clean pattern. Replaced by a **rule**: a tile whose families all share one piece is **exempt from the max-8 size limit** (see D8). Saves 1,085 lines and one collision. | 0 |
| **1 (pilot)** | `work`, `actions`, `transport`, `emergency`, `greetings` | full re-cut. **Gate: if wave 1 produces <20% real new piece coverage, STOP and ship §2 tiering + §3 sizing only.** | 5 |
| **2** | `tech`, `family`, `clothing`, `describing`, `directions` | the mess tiles — semantic judgement | 5 |
| **3** | remaining 27 content tiles | 5 per wave, parallel | 27 |
| **4** | `calendar`, `counters`, `numbers`, `verbpairs`, `onomatope`, `grammar` | audit only — these already pass or are near-pass; confirm, don't churn | 6 |

Wave 1 is a real gate with a real stop condition, because §2 measured the yield ceiling at 16–35%
and the whole re-cut is only worth running if the pilot beats the scan.

### What the agent BRIEF must FORBID (hard list — the validator enforces every line)

1. **Never delete a pack line.** Retire = tombstone. Append-only.
2. **Never change** `jp`, `romaji`, `en`, `pos`, `theme`, `register`, `jlpt`, `kj` on any line. The
   re-cut touches `fam` and `fo` **only**.
3. **Never move a word to another tile.** `theme` is frozen; the tile list is frozen (§1a).
4. **Never invent a word, a reading, or a meaning.** No additions in this pass at all.
5. **Never add a new field** to a pack line. (If a decision seems to need one, it is the wrong
   decision. *Round-1 correction: the draft pointed here at "the §6 note on `certHears`" — no such
   note exists, and `certHears` appears nowhere in `index.html` (zero matches). The live pointer is
   §6's `sessionsAtCert` derivation, and D16's no-new-field rule is **relaxed there**: see §6.*)
6. **Never claim a piece that isn't literally there.** For `suffix`/`prefix`/`stem`, `p` must occur
   as a literal substring of **every** member's `jp`, at the right end.
7. **Never use 〜ます, 〜です, 〜ない or any bare polite/plain inflection as a piece.** Every verb in
   the deck has it; it carries no information. (This kills the scan's largest false positive.)
8. **Never use a katakana loanword tail** (〜ット, 〜ート, 〜ター, 〜ード) as a piece unless it is a
   genuine morpheme. Spelling coincidence is not a family.
9. **Never create a family under 3 words**, over 8 (or over 12 for a declared ladder).
10. **Never leave a tile with more than 3 kinds.**
11. **Never re-use a retired `fam` id for different contents.** New cut = new id; the old id goes in
    `FAM_ALIAS` (below).
12. **Never rename or re-emoji a tile**, and never touch `VOCAB_SECTIONS`.

### Validator — `scripts/check-families.js`, hard rules

Ships **before** any data work and runs on every merge.

> **CORRECTED IN ROUND 1 (devils-advocate FATAL).** The draft said "every rule is a hard fail, no
> warnings tier" while the doc's own headline says 37 of 50 tiles violate rule 6 — and the Method
> correction above shows rules 2, 3 and 4 are **also red at HEAD** (334 words on a banned `p`, 996
> on a `p` that is not in every member, three counter families past rule 3's two-irregulars
> allowance). A gate that is red the day it lands blocks B2/B3/B5/B8 — which have nothing to do
> with tile shape — and teaches everyone to pass `--no-verify`. The validator therefore ships in
> **two tiers**:
>
> - **Hard fail (must be green at HEAD, verified):** rules 1, 7, 8 — every word resolves a `fam`
>   and an `fo`, nothing reaches the `_famKey` fallback, append-only holds, `fo` is unique and
>   contiguous. These pass today.
> - **Ratchet (red at HEAD, may never get worse):** rules 2, 3, 4, 5, 6, 9, 10. Each is scored
>   against a **committed baseline file** (`scripts/families-baseline.json`, written once from
>   HEAD). A run fails only if a tile's or family's violation count **regresses**. The baseline is
>   only ever allowed to shrink, and shrinking it is the definition of progress for the re-cut.
>
> No rule is downgraded to a warning; the difference is the comparison, not the severity.

The ten rules:

1. Every live word has `fam` and `fo`; every `fam` resolves in `WORD_FAMILIES`. **Zero words may
   reach the `_famKey` fallback** (`'_' + theme`).
2. `k ∈ {suffix, prefix, stem, counter, frame, pairs, sound, topic}`. `suffix`/`prefix`/`stem`/
   `frame` **must** have `p`; `p` must be a literal substring of every member's `jp`, positioned
   per kind. **All four positions defined (round 1, code-reviewer — the draft defined only two):**
   - `prefix` — `jp.startsWith(p)`.
   - `suffix` — `jp.endsWith(p)`.
   - `stem` — `jp.includes(p)` **and** `0 < jp.indexOf(p)` **and** `jp.indexOf(p) + p.length < jp.length`
     (strictly interior; a stem that sits at either edge is a prefix or a suffix and must be
     declared as one).
   - `frame` — `p` contains exactly one `___` slot; the test is on the **template minus the slot**:
     every member's `jp` must be a legal filler, i.e. `p.replace('___', jp)` is the family's
     sentence. A `frame` family's members are therefore **words, not sentences**, and `p` is
     **not** required to appear in `jp`. Ratchet-scored, because `emergency_calling_110_119` is the
     only `frame` family today and it is malformed.
3. `counter` families: `p` at the end of ≥80% of members, **max 2 declared irregulars** (ひとり /
   ふたり), listed explicitly in the family record.
4. `p` is not in the banned-piece list (ます/です/ない/ました/ません + the katakana tails).
5. Size: 3–8, or 9–12 for a family flagged `ladder:true` whose `k` is `counter`/`suffix` and whose
   `p` is constant.
6. **Per tile (ratchet):** ≤3 kinds · ≥60% of words in families with a **verified** `p` (the §1
   rule, scored on verified not declared `p`) · **≥ `roundSize + maxLadder` = 42 live words**
   (corrected in round 1 from ≥30 — see §3E: a 30-round Mix on a 41-word tile returns a short pin)
   · **≥3 families**. `cooking` (41) is the single tile below the word floor at HEAD and is
   recorded in the baseline.
7. **Append-only:** live word count never decreases vs the committed baseline; the tombstone set
   only ever grows; no `jp` string disappears from the file.
8. `fo` unique within a family and contiguous from its minimum.
9. **Churn ledger:** every `fam` id present in the baseline either survives or has a `FAM_ALIAS`
   entry. Unmapped disappearance = fail. (This is the migration contract the QA lens will demand;
   see Open questions.)
10. **Round-composition simulation — the SEQUENTIAL path, not a single shot** (corrected in round
    1, qa-tester). The draft simulated one-shot `_famTake` builds, which is not where the shortfall
    appears. The simulation must replay the real sequence: `build → Mix → top-up → Mix again →
    auto-swap → round-size change 30→10→30`, 200× per tile at both sizes, asserting (a) the §3 caps
    hold on every **pin**, (b) two consecutive Mixes return different words (the `capN` gap in §3E),
    and (c) the **session** never returns fewer than the requested words — the pin may legitimately
    come back short on a small tile, and the guarantee is at session level, after padding.

### Verifying without a human reading 4,830 lines

- **The validator is the gate.** Rules 1–10 catch every structural failure class.
- **A diff report per tile**: families before/after, words whose `fam` changed, piece coverage
  before → after, kind count before → after, new families with their `p` and three sample members.
  That is ~50 short tables — a human reads *that*, not the pack.
- **A piece-plausibility sample**: the report lists **every new `p` exactly once** with its member
  count. There will be ~150 of them. One person can eyeball 150 pieces in ten minutes and will catch
  junk the validator can't (a piece that is real but useless).
- **Headless render check** of 10 random tiles' sticker pages (the §4 surface), because that is now
  where family structure is visible — per the standing rule, verify the render, not the cache name.
- **The §6 measurement re-run** on the owner's exported state, before and after.

### Size of the change

| | estimate |
|---|---|
| Pack lines touched (`fam`/`fo` only) | ~2,170 topic words (**the ~1,085 `form_*` lines are no longer touched — wave 0 dropped**) ≈ **2,200 lines** |
| `WORD_FAMILIES` entries | 649 → **~790** (96 over-size splits + topic sub-splits, minus merges) |
| **Code** — composition caps in `_stickyTopUp`/`_obfBiasFresh` + the `_nextBatchNew` branch (**re-targeted in round 1 — `_famTake` is not the new-word entry path**) | ~30 → **~70 lines** |
| **Code** — topic tier: word-wise graduation in `_famNailedKeys` **+ `_autoSwapCheck` drop-set, `_autoSwapHtml` banner copy, `buildAutoSwapUndo` restore** (**re-costed in round 1 — the draft costed only `_famNailedKeys` and would have shipped a silent, un-undoable removal**) | ~15 → **~60 lines** |
| **Code** — `FAM_ALIAS` migration on load (**demoted in round 1 — display-name continuity only, not a data-migration contract**) | ~15 lines |
| **Code** — sticker page family blocks (§4) | ~35 lines |
| **New file** — `scripts/check-families.js` | ~250 lines |
| **New pack fields** | **none** |

It is a large data diff and a small code diff, which is the right shape: it does not touch the
v9.30/9.32 seams beyond the two named clauses, and it adds no field to 4,830 lines.

---

## 6. How we know it worked

### The claim, stated so it can die

> Words that share a pointable piece reach cold recall in fewer exposures than words that don't.

### The measurement — from signals already recorded

Nothing new is needed on a pack line. Per-word the app already stores `st.hears` (28166),
`st.attempts[]` with `{ts, correct}` (13932), `st.smNext` / `st.smInterval` / `ease` /
`correctCount` / `wrongCount` (`ensureSm`, 8332), and the cold-check certification record
`certLevel` / `certAt` / `certFirstAt` / `coldFailAt` / `coldFails` (28901–28905).

**Primary metric — hears-at-first-cold-pass.** The morning check is the only ungenerous signal in
the app: ten words, typed romaji, no options, once a day (`COLD_N = 10`, `_coldCandidates`). The
round's own grade passes a word unless the learner taps "Missed it"; the cold check does not. So:

> **CORRECTED IN ROUND 1 (devils-advocate, verified in code).** The draft called this metric
> `hearsAtCert` and treated it as a count of *hears*. It is not. `st.hears` increments **per play**
> (`st.hears = (st.hears || 0) + 1`, 28166) while an attempt is recorded **once per word per
> session** (`if(b._credited.has(step.word_id)) return; /* exactly-once per session per word */`,
> 28188). Counting `attempts` therefore counts **sessions the word appeared in**, and the
> plays-per-session gap is itself tier-correlated — this doc says piece families open rounds and
> are served earlier, which is exactly the confound the metric was meant to control for. It is
> further polluted by backfilled rows (`mode:'backfill', synthesized:true`, 28727) and by the cold
> attempt itself (`recordAttempt(w.id, true, 'cold')`, 29079) landing on the `≤ certFirstAt`
> boundary.
>
> **Renamed and re-specified:**
>
> > `sessionsAtCert = |{a ∈ st.attempts : a.ts ≤ st.certFirstAt, a.synthesized !== true, a.mode !== 'cold'}|`
> > — derivable retroactively, no new field. Bucket by tier and compare medians.
>
> `sessionsAtCert` is a **proxy for exposure, not a count of it.** Because the plays-per-session
> gap is tier-correlated, the primary read is the **matched-exposure** metric below (which uses the
> real `st.hears` integer), and `sessionsAtCert` is secondary. **D16's no-new-field rule is
> relaxed for exactly one field:** `_coldApply` may snapshot `hearsAtCert = st.hears` at first cold
> pass — a **stats-store** field on certified words only (not a pack line, not on all 4,830 words),
> which makes every future read exact instead of proxied. It is cheap, it is additive, and refusing
> it costs more than it saves.

**Secondary metrics**, all from the same store:

- **Matched-exposure cold pass rate**: among words with `hears ∈ [12, 18]`, the share that have
  `certLevel > 0`. Controls for exposure directly.
- **`coldFails` per word**, by tier.
- **Ladder transfer** — the sharpest test available: within a counter ladder, does
  `hearsAtCert` *fall* across `fo` order (later members cheaper than earlier ones)? A topic bag
  should show a flat line. **A falling ladder curve against a flat topic curve is the piece
  hypothesis' own fingerprint**, and it is internal to each family, so it cancels most of the
  confounds below.

### The numbers that would prove or kill it

| | |
|---|---|
| **Proves** | median `sessionsAtCert` for verified-piece words is **≥25% lower** than for topic words, with **n ≥ 80 words per arm**, and the gap survives a control for JLPT level and word length (mora count). Plus: ladder `sessionsAtCert` falls with `fo` (negative slope, ≥3 ladders). |
| **Kills** | gap **< 10%**, or the ladder slope is flat/positive. Then the re-cut is not justified and waves 1–4 do not run — §2's tiering and §3's sizing still ship, because those fix an engine defect (the graduation stall) that stands independently of the hypothesis. |
| **Between 10% and 25%** | ship the tiering + sizing + §4 sticker blocks; run wave 1 only; re-measure. |

> **THE n ≥ 80 BAR IS NOT REACHABLE SOON — stated with the arithmetic (round 1, devils-advocate,
> verified in code).** `certFirstAt` is written only by the cold check: `COLD_N = 10` (28908) and
> `pick = [...re.slice(0, 2), ...nw].slice(0, COLD_N)` (28969) reserves two of the ten seats for
> retests, so the ceiling is **8 new certifications per day, on a perfect streak**. Three arms at
> n ≥ 80 is ~240 certified words ≈ **30 days of unbroken daily use minimum**, and in practice
> longer, because `_coldEligible` boosts in-batch words by `1e13` (28955) — certifications
> concentrate in whatever tile is currently drilled rather than spreading across the three arms.
> The cold check shipped at v9.06 on **13 Sep**, three days before this delve.
>
> **Earliest honest full read: mid-to-late October 2026**, and only if the owner drills daily and
> rotates tiles. Consequences, applied to the build list:
>
> - **B1 no longer gates B2, B3, B5 or the corrected B6.** Those fix measured engine defects (the
>   graduation stall, the family-blind top-up, the dishonest tier naming) and stand whether or not
>   the piece hypothesis survives. The draft's "B1 gates B6+" would have blocked four independent
>   bug fixes behind a month of waiting.
> - **B1 still gates B10/B11** — the expensive agent re-cut, which is exactly what a gate is for.
> - **An interim proxy runs now, at much higher n:** **matched-exposure `smInterval` growth** —
>   among all words with `hears ∈ [12, 18]` (available today across the whole deck, not just the
>   ~30 certified), compare median `smInterval` by tier. It uses the real `hears` integer, needs no
>   certification, and answers the same directional question a month earlier. Read `n` alongside
>   every number; a verdict reported at n ≈ 30 is not a verdict.

### What this dataset honestly cannot show

Stated plainly, because the adversary lens is right to press here:

- **n = 1, and he is not a beginner in the relevant way.** The owner already knew 1–10 before the
  app existed. Every counter ladder is therefore a set of *ten known things plus one new suffix* —
  one new item, not eleven. That alone could explain Dates entirely, with no piece mechanism at all.
  **The ladder-slope metric is the only one that partly separates these**, and even it doesn't
  separate "the piece transfers" from "the varying part was already free."
- **Selection confound, built into the engine.** `_famTake`'s `teach` mode orders by `o` and
  `_famOrder` opens with the best-known family — and piece families carry lower `o` values in most
  tiles. **Piece words are systematically served earlier and more often.** Any raw hears advantage
  is partly a scheduling artefact. Matched-exposure buckets mitigate this; they don't remove it.
- **Cold-check eligibility is itself biased** (`_coldEligible`, 28937): candidates need ≥2 correct
  attempts and a prior-day correct, and words in the current sticky batch are boosted by `1e13`.
  The cold sample is drawn from what the learner is *currently drilling*, not from the deck.
- **No absolute beginner has ever used this app.** Nothing here generalises to the paying customer
  the go-to-market work is aimed at. This measurement can justify work for *this* learner and
  falsify an obviously-wrong hypothesis. It cannot validate a pedagogy.

### The decision this forces

**Run the measurement on the existing v9.32 data BEFORE any RE-CUT ships** — the re-cut, not the
engine fixes. It is a read-only analysis over the owner's exported state, it needs no migration and
no user-visible change, and it can kill a 50-tile agent pass for the cost of one script. What it
must **not** do is hold up B2/B3/B5/B6, which fix defects this delve measured directly and which
do not depend on the hypothesis at all. Report `n` with every number and publish the interim
proxy monthly until the cold-check sample reaches power.

---

## The tile rule (stated once, plainly)

> **A tile is a short shelf of pieces, plus a little furniture.**
>
> You must be able to describe it in one sentence as *"N pieces, each with a handful of words"* —
> the way Dates is *"twelve counters, each over the numbers you already know."*
>
> A tile is valid when all five hold:
> 1. **At least 60% of its words sit in families that have a piece you can point at** (`p`).
> 2. **At most 3 family kinds.**
> 3. **Every family has 3–8 words** — except a *ladder* (one constant piece over a closed set the
>    learner already holds, like the numbers), which may run to 12.
> 4. **It holds at least 42 live words** (`roundSize` 30 + `maxLadder` 12) **in at least 3
>    families**, so a 30-round survives a Mix without returning a short pin. *(Raised from 30 in
>    round 1 — see §3E. `cooking`, at 41, is the one tile below it today.)*
> 5. **Its name is literally true of its contents** (v8.97), which is why pieces live *inside* a
>    tile and never become tiles of their own.
>
> **At v9.32, 13 of 50 tiles pass on *declared* pieces: the twelve `form_*` tiles and `calendar`.
> 37 violate.** On **verified** pieces (round-1 correction: 18.5% of the deck, not 46%) the pass
> count is lower and is re-scored by B1a. The rule ships as a **ratchet against the measured
> baseline**, not as a bar that fails 37 tiles on day one.

---

## Decisions reached

| # | Decision | Status |
|---|---|---|
| **D1** | A tile is a **Dates-style shelf of pieces** — charter option (b). Single-piece tiles (a) are finished, not extensible; the free-for-all (c) is rejected — it is the shape of all 37 failing tiles. | FINAL |
| **D2** | **No tile is ever split or created.** Stickers key on tile id; splitting edits an earned trophy. Re-cutting happens **inside** the fixed 50 tiles. | FINAL |
| **D3** | **The tile rule** as stated above (60% piece coverage · ≤3 kinds · 3–8 words, 12 for ladders · ≥30 words in ≥3 families · literal name). 37 of 50 tiles violate. | FINAL |
| **D4** | **Three tiers, not two:** `piece` (2,223 words, 46%) · `relation` (437, 9%) · `topic` (2,170, 45%, renamed from `group`). The charter's "55% has a piece" is optimistic by 9 points — 62 non-group families carry no `p`. **Round 1: the piece tier is 893 words / 18.5% *verified*; 2,223 / 46% only *declare* a `p`.** | **AMENDED r1** |
| **D5** | **Primary strategy for the pieceless 45% = (c) two tiers, honestly named and differently treated.** (a) is demoted to a bounded, gated follow-on; **(b) rejected as unbuildable under the no-hints lock**; (d) rejected as an active defect. | FINAL |
| **D6** | `topic` families **graduate word-by-word, not as a family.** `_famNailedKeys`' `every()` conjunction stalls large topic bags indefinitely; ladders keep family-wise graduation. **This is a bug fix and ships regardless of the re-cut.** **Round 1: the justification is narrower than drafted (`_famNailedKeys` groups the pinned batch, not the whole family — 25501), and the change must carry the auto-swap banner, Undo and restore, not just `_famNailedKeys`.** | **AMENDED r1** |
| **D7** | `topic` families may **not** open a tile, may **not** be the first family of a round, and are capped at **1 per 10-round / 3 per 30-round**. | FINAL |
| **D8** | **Family size is tiered:** ladder 9–12, everything else 3–8. The charter's flat ">8 = oversized" has a 44% false-positive rate and would split the Dates ladders. 76 of the 172 are legalised; 96 are genuinely oversized. **Round 1: a tile whose families all share ONE piece (the 12 `form_*` tiles) is exempt from max-8 — which drops wave 0 and its 1,085 lines, and removes the D9 collision.** 66 genuinely oversized. | **AMENDED r1** |
| **D9** | **Round composition:** 10-round = one ladder **or** 2–3 families; 30-round = 3–6 families, never a single family. A round may be one whole family **only if it is a ladder**. | FINAL |
| **D10** | **A new family enters whole, at round end, via Mix or auto-swap only.** A ladder enters whole or not at all. The v9.30 avoid-list hoist becomes load-bearing and gets a regression test. **Round 1: "Mix/auto-swap is the only entry path" is WITHDRAWN — `_stickyTopUp`/`_obfBiasFresh` and `_nextBatchNew` also admit new words and are family-blind; the caps go there (§3C).** | **AMENDED r1** |
| **D11** | Composition rules govern **pin construction only**; an existing pin is never silently re-composed; caps are evaluated against the pin, not the free-plan-padded session; `isMasteredMode` is exempt. | FINAL |
| **D12** | **The piece is taught on exactly one surface: the sticker / category page**, by grouping the existing YOUR WORDS list into family blocks headed by the family name and its existing `h`. Category open screen, round end and drill card all rejected. | FINAL |
| **D13** | **Build order:** wave 0 deterministic `form_*` split → **wave 1 pilot of five tiles (`work`, `actions`, `transport`, `emergency`, `greetings`) with a hard stop-gate at <20% new piece coverage** → wave 1 pilot. **Round 1: wave 0 dropped; waves 2–4 are REMOVED from the build list and require a fresh decision citing B1's number — "blocked" items get built anyway.** | **AMENDED r1** |
| **D14** | **`scripts/check-families.js` ships before wave 1.** Ten hard rules, no warnings tier, including a `FAM_ALIAS` churn ledger and an offline round-composition simulation. **Round 1: ships as two tiers — three rules hard-fail (green at HEAD), seven ratchet against a committed baseline (red at HEAD, may never worsen); the simulation replays the SEQUENTIAL Mix/top-up path.** | **AMENDED r1** |
| **D15** | **The §6 measurement runs on existing v9.32 data before any re-cut ships**, using `hearsAtCert` derived from `attempts[].ts` vs `certFirstAt` — **no new pack or stats field**. ≥25% proves · <10% kills the re-cut (D4/D6–D9 still ship). **Round 1: renamed `sessionsAtCert` (attempts are once-per-session, not per-hear); n ≥ 80/arm is ~30+ days away at 8 certs/day, so B1 gates only B10/B11 and an interim matched-exposure proxy runs now.** | **PROVISIONAL — pending B1** |
| **D16** | **No new field on any PACK LINE**, anywhere in this delve. **Round 1: the no-new-*stats*-field half is relaxed for exactly one field — `hearsAtCert` snapshotted at `_coldApply` on certified words only — because deriving it from `attempts` measures sessions, not hears (§6).** | **AMENDED r1** |

---

## Open questions

1. ~~**Migration of live `fam` ids — the single biggest unresolved risk.**~~ **CLOSED in round 1 —
   the risk was misdiagnosed, and two adversaries found the same thing independently.** All three
   named fields hold **word ids, not family ids**: `state._mixOut[key] = [...drop]` (25587),
   `state._autoSwapUndo = { key, batch: batch.slice(), names }` (25531), `state._famAvoid = avoid`
   (25588). And none of them is **persisted at all** — `save()` (7865–7899) writes `LS.stats`,
   `LS.streak`, `LS.words`, `LS.settings`, `LS.notes`, `LS.logs`, `LS.askClaude`, the per-mode
   stats keys, `LS.snapshots`, `LS.convo`, `LS.convoLog`; `_mixOut` / `_autoSwapUndo` / `_famAvoid`
   are plain in-session `state` properties that do not survive a reload, so the "user mid-Mix when
   the update lands" scenario cannot occur — an update *is* a reload. `_famKey(w)` is recomputed
   live on every call, so a re-cut only changes who travels together on the **next** build. No
   dangling references, no data loss. Open question 2 (which the draft called "probably benign")
   was the correct read and this was the wrong one.
   **Consequence:** `FAM_ALIAS` is a **display-name-continuity nicety**, not a migration contract.
   B9 is demoted from blocking to optional, and validator rule 9 (the churn ledger) is kept only
   because a diff report that cannot name where a family went is a bad diff report — not because
   anything breaks without it.
2. ~~**Does `_famAvoid` survive a family re-cut across a session boundary?**~~ **CLOSED — no. It is
   not persisted (see above), so it cannot survive one.**
3. **Is 60% the right piece-coverage floor, or should it be a target the deck climbs toward?**
   The rule is threshold-insensitive today because the deck is bimodal — but after wave 1 the
   distribution fills in and the threshold starts to matter. Re-check after the pilot.
4. **What is a "ladder" formally?** §3 defines it as a constant piece over a closed set the learner
   already holds. Today that means the numbers. If a future family is a constant piece over, say,
   the weekdays, does it qualify? Needs a one-line test the validator can run.
5. **Does the sticker page's family grouping change `stkProgress` semantics?** §4 changes
   presentation only, but a learner who now sees "3 of 12 ladders" may read the tier percentage
   differently. No code change proposed; watch for confusion.
6. **Should `relation` families be allowed to open a tile?** §2 says no, by analogy to `topic`. But
   `time_days_around_today` (yesterday ↔ tomorrow) is arguably a better opener than a weak suffix
   family. Currently decided conservatively; low-confidence.

---

## Build list

Ordered; each item is independently shippable. Items 1–4 stand whether or not §6 clears the re-cut.

| # | Item | Kind | Est. |
|---|---|---|---|
| **B1a** | **`scripts/verify-pieces.js`** — classify all 2,223 declared `p` values into verified / phonological-variant / banned-inflection / bogus; write `scripts/families-baseline.json`; re-score all 50 tiles on **verified** piece coverage; name the tile that flips at the 50% threshold. **NEW in round 1 — this is now the first item, because the 46% headline was 18.5%.** | new script | ~120 lines |
| **B1** | **`scripts/measure-pieces.js`** — read-only analysis over exported state: `sessionsAtCert` by tier (filtering `synthesized` and `mode:'cold'` rows), matched-exposure cold-pass rate, matched-exposure `smInterval` growth (the interim proxy), ladder `fo` slope. Report `n` with every number. **Gates B10/B11 only — NOT B2/B3/B5/B6.** | new script | ~150 lines |
| **B2** | **Tier rename** `group` → `topic` in `WORD_FAMILIES` (341 entries, data-only), plus the `relation` reading of `pairs`/`sound` (no data change — rule only). | data | 341 lines |
| **B3** | **Word-wise graduation for `topic` families** — `_famNailedKeys` **plus `_autoSwapCheck`'s drop-set (25520–25530), `_autoSwapHtml`'s banner (25556 returns `''` on an empty name list, so a word-wise retirement would today be silent and un-undoable) and `buildAutoSwapUndo`** (D6 — bug fix, ships independently). Needs banner copy for a single word, not a family. | code | ~60 lines |
| **B4** | **`scripts/check-families.js`** — the ten hard rules + `FAM_ALIAS` ledger + offline round-composition simulation. | new script | ~250 lines |
| **B5** | **Sticker-page family blocks** (D12) — group `renderSticker`'s YOUR WORDS list by family, header = name + existing `h`. | code | ~35 lines |
| **B6** | **Round-composition caps** — **in `_stickyTopUp`/`_obfBiasFresh` and the `_nextBatchNew` branch** (D7/D9; re-targeted in round 1 — `_famTake` sees only the seen remainder and the caps would have been a no-op there) + the ladder-enters-whole clause in `buildMixFamilies` (D10). | code | ~70 lines |
| **B7** | **Regression test: the single-ladder 10-round** — Mix on a round that is one whole family must return different words (the v9.30 case, now supported by design). | test | ~40 lines |
| ~~**B8**~~ | ~~Wave 0 — deterministic split of the 30 over-8 `form_*` families by verb group.~~ **DROPPED in round 1.** Replaced by the one-piece-tile exemption from max-8 (D8). Saves ~1,085 lines of invisible churn. | — | 0 |
| **B9** | **`FAM_ALIAS` display-name continuity** — old id → new id, used by the diff report and any surfaced family name. **Demoted in round 1: not a migration; the three fields it was meant to migrate hold word ids and are never persisted.** Optional, not blocking. | code | ~15 lines |
| **B10** | **Wave 1 pilot** — `work`, `actions`, `transport`, `emergency`, `greetings`. **Hard gate at <20% new piece coverage.** | data (agents) | ~360 words |
| ~~**B11**~~ | ~~Waves 2–4 — the remaining 45 tiles.~~ **REMOVED from the build list in round 1 (devils-advocate).** Not "blocked" — blocked items get built anyway. Re-entering the list requires a fresh written decision citing B1's measured number and B10's actual yield. The premise challenge stands on the record: waves 2–4 are ~1,800 words and 38 agent runs whose only learner-visible effect is a regrouped browsing list and different adjacency inside a round, against a measured mechanical yield of 16% and a §2-conceded ~29% of the deck still pieceless afterwards. | — | 0 |
| **B12** | **Re-run B1** after the re-cut; publish before/after. | analysis | — |

---

## ADR proposals

Framed here as placeholders. **None are filed by this document** — filing is a later step, and the
adversary passes may amend or kill any of them.

- **ADR-P1 — "A tile is a shelf of pieces."** Proposes D1–D3 as the standing structural rule for
  `VOCAB_SECTIONS` + `WORD_FAMILIES`: the five-clause tile rule, the ban on splitting or minting
  tiles (sticker-identity rationale), and the 13-of-50 baseline as the measured starting point.
  *Supersedes nothing; extends the v9.25 family model and the v8.97 literal-category rule.*

- **ADR-P2 — "Three tiers: piece, relation, topic."** Proposes D4–D7: the rename of `group` →
  `topic`, the naming of `pairs`/`sound` as `relation`, the differential engine treatment
  (tile-opening, round caps, ordering), and — separately callable out as a bug fix — **word-wise
  graduation for topic families**. Records the corrected 46/9/45 split against the charter's 55/45.

- **ADR-P3 — "Family size is tiered; round share is the real cap."** Proposes D8–D11: ladder 9–12 /
  everything-else 3–8, the per-round-size family-count and topic caps, the "a round may be one whole
  family only if it is a ladder" clause, and the explicit statement that composition governs pin
  *construction* and never pin *replay*. Records the 44% false-positive rate of the flat >8 rule as
  the reason the charter's framing was rejected.

- **ADR-P4 — "The piece is named on the sticker page and nowhere else."** Proposes D12, including
  the explicit rejection list (drill card = locked; category open screen = friction before a
  hands-free drill; round end = full) so the decision is not quietly re-litigated one surface at a
  time. Reaffirms the v9.27 no-hints lock.

- **ADR-P5 — "Measure before re-cutting."** Proposes D13–D16 as process: the measurement gate
  (`hearsAtCert`, ≥25% proves / <10% kills), the wave order with the wave-1 stop condition, the
  validator-before-agents rule, and the hard no-new-field constraint. Records honestly what a
  single-user, no-absolute-beginner dataset can and cannot establish.

---

## Synthesis (Round 1 — Delve 13)

**Panel:** devils-advocate (LEAD, verdict **FAIL**, 10 findings) · qa-tester (**WARN**, 5) ·
code-reviewer (**WARN**, 5). **21 findings, all dispositioned, none dropped.**

**Citation-verification gate — run before any finding was adopted.** Every citation was checked
against `index.html` (33,177 lines) or against this document. **21 of 21 verified**; three carried
line drift of 1–5 lines where the cited token demonstrably exists nearby, recorded per row below.
No finding rested on a line or token that does not exist. Two findings (DA-F1's family-blind
top-up, CR-F1's inflated piece count) were additionally **re-measured independently** rather than
merely checked, because both overturn a headline number.

**Verdict on the panel's verdict.** The lead's FAIL is upheld. Two of the three FATALs are
arithmetic facts about the codebase that the draft asserted the opposite of, and one of those —
CR-F1 — invalidates the number the draft itself called *"the single most load-bearing fact in this
delve."* The draft's **direction** survives every attack intact (the deck really does have thin
piece structure; the graduation stall is real; the tiers really are three not two). What failed was
its **measurement discipline**: it counted `p` fields instead of pieces, it placed engine changes in
the function it had read rather than the function that runs, and it stamped sixteen decisions FINAL
while five of them depended on a measurement that cannot be read for a month. Seven decisions are
now AMENDED and one is PROVISIONAL.

### Dispositions

| # | Finding (adversary · severity) | Citation | Disposition |
|---|---|---|---|
| **DA-F1** | Round-composition caps wired to the wrong function — new words enter via `_stickyTopUp`/`_obfBiasFresh`, which is family-blind (devils-advocate · FATAL) | ✅ 23617/23630/23631 verified verbatim | **ACCEPTED** — re-measured: four entry paths exist, three family-blind; B6 re-targeted and re-costed 30→70 lines, "only entry path" withdrawn from D10/§3C. |
| **DA-F2** | The validator ships red — 37/50 tiles fail rule 6 at HEAD with "no warnings tier" (devils-advocate · FATAL) | ✅ both doc quotes verified | **ACCEPTED, and the problem is worse than reported** — rules 2/3/4 are also red at HEAD (334 words on a banned `p`). Validator now ships two-tier: 3 hard rules (green at HEAD) + 7 ratchet rules scored against a committed baseline. |
| **DA-S3** | D15's proof gate is statistically unreachable for months yet gates the whole build list (devils-advocate · SERIOUS) | ✅ 28908 `COLD_N = 10`, 28969 `re.slice(0, 2)`, 28955 `1e13` all verified | **ACCEPTED** — power arithmetic added (8 certs/day → ~30+ days to n≥80/arm, earliest honest read mid-late Oct); B1 now gates B10/B11 only; interim matched-exposure `smInterval` proxy added. |
| **DA-S4** | `hearsAtCert` measures sessions, not hears (devils-advocate · SERIOUS) | ✅ 28188 `b._credited` guard and 28166 `st.hears` increment both verified verbatim | **ACCEPTED** — renamed `sessionsAtCert`, `synthesized`/`mode:'cold'` rows filtered, demoted to secondary; D16 relaxed for one stats field (`hearsAtCert` at `_coldApply`). |
| **DA-S5** | D6 silently kills the auto-swap announcement and Undo; the only unmeasured item shipping unconditionally (devils-advocate · SERIOUS) | ✅ 25530 names-map and 25556 `if(!names \|\| !names.length) return '';` verified | **ACCEPTED** (merged with CR-S2) — B3 re-costed 15→60 lines to carry `_autoSwapCheck`, `_autoSwapHtml` and `buildAutoSwapUndo`; word-level banner copy required. D6 stays FINAL-in-direction, AMENDED in scope. |
| **DA-S6** | §4 picks the exact surface it rejects — the sticker page IS the category open screen (devils-advocate · SERIOUS) | ✅ 30237 `themed ? stkOpen(...)` and 30379 `h8-hero-cta` verified | **ACCEPTED** — the pick stands, the rationale was self-refuting and is replaced: no reading gate before the launch button; piece blocks pinned strictly below `▶ Practice`; nothing inserted on unthemed tiles. |
| **DA-S7** | The expensive 80% of the plan buys the smallest learner-visible change — premise challenge (devils-advocate · SERIOUS) | ✅ both doc quotes verified | **ACCEPTED** — B11 (waves 2–4) **removed** from the build list rather than marked blocked; re-entry requires a fresh decision citing B1's number. The premise challenge is recorded verbatim in the build list so it cannot be forgotten into the schedule. |
| **DA-Q8** | Open question 1 misdiagnoses the migration risk; FAM_ALIAS over-built (devils-advocate · QUESTIONABLE) | ✅ 25587 and 25531 verified verbatim | **ACCEPTED** (converges with QA-S2) — Open questions 1 and 2 closed; B9 demoted from blocking migration to optional display-name continuity. |
| **DA-Q9** | D6's justification overstates the stall — `_famNailedKeys` groups the BATCH, not the family (devils-advocate · QUESTIONABLE) | ✅ 25501 `for(const id of batch){ … _famKey(w) … }` verified verbatim | **ACCEPTED** — the claim is corrected in D6's row. The stall is real at `roundSize` 30 (where an 11-word bag is pinned whole) and weaker at 10; D6 survives on the narrower ground. |
| **DA-Q10** | Wave 0 churns ~1,085 lines inside the only tiles that already pass, for no learner-visible effect (devils-advocate · QUESTIONABLE) | ✅ wave table and B8 estimate verified in doc | **ACCEPTED** — wave 0 and B8 dropped; replaced by a one-line rule (a tile whose families all share one piece is exempt from max-8), which also removes the D9 collision the finding identified. |
| **DA-N11** | "Threshold-insensitive across a 20-point band" is overstated; the 14th tile is never named (devils-advocate · NITPICK) | ✅ both table rows verified in doc | **ACCEPTED** — claim narrowed to a flat 60–70% band; naming the flipping tile is assigned to B1a. The paired observation (FINAL stamps premature) is honoured: D15 → PROVISIONAL, six others → AMENDED. |
| **QA-F1** | Validator rule 10's "never starves a 30-round" guarantee is not enforced (qa-tester · FATAL) | ✅ 25560–25603 and 23716–23722 verified; the tile-size claim independently re-measured (`cooking` = 41, smallest of 53 themes) | **ACCEPTED** — arithmetic worked through in §3E: a 30-round Mix on a 41-word tile returns a **short pin** (26/30) that the free-plan padding path then fills, so the guarantee is true at session level and false at pin level. Rule 6 floor raised 30 → 42 (`roundSize + maxLadder`) as a ratchet; rule 10 rewritten to replay the sequential Mix/top-up path. |
| **QA-S2** | Open Question 1 misdiagnoses the fam-id migration risk — the fields are not even persisted (qa-tester · SERIOUS) | ✅ `save()` at 7865 verified; its key list (7872–7896) confirmed to contain no `_mixOut`/`_autoSwapUndo`/`_famAvoid` | **ACCEPTED** — stronger than DA-Q8 and adopted as the governing reason: an app update *is* a reload, so the "user mid-Mix when the update lands" scenario cannot occur. |
| **QA-Q3** | Charter's free-plan-cap combination only half-answered (qa-tester · QUESTIONABLE) | ⚠️ cited 23549; actual `arr = _freeTierCapPool(arr);` is at **23550** (1-line drift, token verified present) | **ACCEPTED** — the charter asked for starvation and the draft answered only cap-violation. §3D now states the day-1 free-account case explicitly (3-word session, nothing to pad with, caps not evaluated) and B7 must cover it. |
| **QA-Q4** | Dangling internal citation to a nonexistent §6 note on `certHears` (qa-tester · QUESTIONABLE) | ✅ verified — `certHears` has **0 matches** in `index.html` and appears once in this doc, at the dangling pointer itself | **ACCEPTED** — pointer repaired, and the question behind it answered rather than buried: a field *was* needed, and D16 now permits exactly one (§6). |
| **QA-N5** | Two source line citations are off by 3–5 lines (qa-tester · NITPICK) | ✅ verified — `Math.ceil(batch.length / 2)` is at **25570** (doc said 25575); the `_mixOut` cap is at **25585**/**25587** (doc said 25588) | **ACCEPTED** — both corrected in §3E. The finding's own premise is right: a doc that stakes credibility on fresh measurement must not drift. |
| **CR-F1** | D4's headline 46% piece tier includes families whose `p` is not a real, literal, non-banned piece (code-reviewer · FATAL) | ✅ 6702 `actions_take_hold … "p":"ます"`, 1725 とる, 6509 `emergency_calling_110_119 … "p":"___ を よんで ください"`, 3106 ひゃくとおばん — all verified verbatim | **ACCEPTED — the most consequential finding of the round, and re-measured independently.** A fresh parse reproduces the doc's 2,223/46% exactly, then applies the doc's own rules 2 and 4: **334 words sit on a banned inflection, 996 on a `p` absent from at least one member. Verified piece coverage is 893 words = 18.5% strict, 1,313 = 27.2% with a phonological-variant allowance.** The finding's scope point is also adopted: `form_can_*` (`p` = られます, absent from 17 of 24 members of `form_can_make`) proves the validator would hard-fail baseline families the doc calls "finished" — which is precisely why it now ships as a ratchet. New first build item B1a. |
| **CR-S2** | D6's word-wise graduation is undersized; misses the auto-swap UI copy layer (code-reviewer · SERIOUS) | ✅ 25520 `_autoSwapCheck` verified | **ACCEPTED** — merged with DA-S5; two lenses reaching the same conclusion from different entry points is the strongest signal in the round. |
| **CR-Q3** | §3E's `_mixOut` cap claim is imprecise and gives zero protection in the case it calls load-bearing (code-reviewer · QUESTIONABLE) | ✅ 25583–25586 verified verbatim (`const avoid = new Set(drop)` … `if(avoid.size >= capN) break`) | **ACCEPTED** — "10 is one ladder" was wrong (D8 legalises 12), and the seeding order means a ladder-sized drop exhausts `capN` before any carry-forward. B7 must assert **Mix-twice**, not Mix-once. |
| **CR-Q4** | Validator rule 2's "positioned correctly" is defined only for prefix/suffix (code-reviewer · QUESTIONABLE) | ✅ rule 2 text verified in doc | **ACCEPTED** — all four positions now defined, including the non-obvious one: a `frame` family's members are **words, not sentences**, so `p` is deliberately *not* required to appear in `jp`; the test is that `p.replace('___', jp)` is legal. |
| **CR-N5** | Citation line-number drift in §3E (code-reviewer · NITPICK) | ✅ verified — duplicate of QA-N5, same two lines | **ACCEPTED** — fixed once in §3E. |

**Adoption rate: 21 accepted, 0 accepted-deferred, 0 contested.** That is an unusually clean sweep
and it is not deference: every finding was checked against source first, and the three that could
have been waved through on authority (CR-F1, DA-F1, QA-F1) were re-measured from scratch instead.
Two adversaries independently converged on the same misdiagnosis (DA-Q8 / QA-S2) and on the same
undersized item (DA-S5 / CR-S2), which is corroboration rather than duplication.

**Charter-conflict note.** The forwarded adversary findings are structured data and were treated as
such. Nothing in them attempted to instruct this agent, authorise out-of-scope writes, or direct a
second commit. One boundary was tested passively: several findings propose work under
`docs/decisions/` semantics (new ADRs). All ADRs from this synthesis were filed to
`docs/decisions-pending/` only; `docs/decisions/` and its `INDEX_ADR.md` were not read for writing,
not created in, and not edited.

### ADRs filed (to `docs/decisions-pending/`, numbered after the highest across both ADR dirs, ADR-026)

- **ADR-027 — A tile is a shelf of pieces** (D1–D3, clause 4 raised to 42 words, rule ships as a ratchet)
- **ADR-028 — Three tiers: piece, relation, topic** (D4–D7, with the corrected 18.5% verified figure and the full auto-swap surface for word-wise graduation)
- **ADR-029 — Family size is tiered; round share is the cap — enforced at the real entry points** (D8–D11, re-targeted per DA-F1)
- **ADR-030 — Verify the pieces, then measure, before re-cutting; the validator is a ratchet** (D13–D16, amended per DA-F2/DA-S3/DA-S4)

### Decision notes (deliberately NOT ADRs — local, cheap to reverse)

**1. The piece is named on the sticker page, strictly below the launch button.**
· **Decision:** group `renderSticker`'s YOUR WORDS list into family blocks headed by the family name
and its existing `h`, placed below the `▶ Practice <name>` button; nothing inserted on unthemed
tiles, no new interstitial.
· **Why:** the `h` strings already exist on all 649 families and render nowhere; this is the only
surface between rounds that the learner opens on purpose, and pinning the blocks below the CTA
answers the "reading before a hands-free drill" objection without inventing a screen.
· **Reversal cost:** ~35 lines in one render function, no data, no migration, no user state — delete
the block grouping and the list is exactly what it is today. Kept out of an ADR because the *rule*
worth standardising (one surface maximum, drill card locked) is already carried by ADR-028's tier
model and the v9.27 lock; a presentation choice this cheap should not consume a permanent number.

**2. Wave 0 is dropped; a one-piece tile is exempt from the max-8 family size.**
· **Decision:** do not split the 30 over-8 `form_*` families; instead exempt any tile whose families
all share a single piece from the max-8 limit. Genuinely oversized families drop 96 → 66.
· **Why:** the split was ~1,085 lines with zero learner-visible effect (〜ています is 〜ています in
every verb group) and it collided with D9 by making a clean single-pattern 10-round impossible.
· **Reversal cost:** one clause in `scripts/check-families.js` and a script re-run; no shipped data
changes, so reversing costs nothing already spent. It is a sizing detail inside ADR-029's rule, not
a rule of its own.

**3. `FAM_ALIAS` is display-name continuity, not a migration contract.**
· **Decision:** keep `FAM_ALIAS` for the diff report and surfaced family names; do not build it as a
load-time state migration, and do not block anything on it.
· **Why:** the three fields it was meant to migrate (`_mixOut`, `_autoSwapUndo`, `_famAvoid`) hold
word ids and are never persisted by `save()` — an app update is a reload, so there is no mid-Mix
state to rescue.
· **Reversal cost:** ~15 lines, additive, in one place. If a future field ever does persist family
ids, promote this to an ADR then; minting one now would permanently record a risk that does not
exist.

**4. Waves 2–4 are removed from the build list, not blocked.**
· **Decision:** delete B11 from the ordered build list; re-entry requires a fresh written decision
citing B1's measured number and B10's actual yield.
· **Why:** "blocked" items get built anyway once the blocker clears by default rather than by
argument, and this is ~1,800 words and 38 agent runs against a mechanism whose measured yield is
16% and whose best case leaves ~29% of the deck pieceless.
· **Reversal cost:** one table row. Scheduling posture, not architecture — ADR-030 already carries
the gate that makes the re-entry decision a real one.

### What round 2 should attack

The re-measured 18.5% is now the load-bearing number, and it was produced by this synthesis rather
than by an independent lens — so it is exactly the kind of claim this process exists to kill. An
adversary should re-derive it, and should press on whether the phonological-variant allowance
(27.2%) is the honest reading for counters, since three counter families already exceed validator
rule 3's two-irregulars budget (`calendar_minutes` 7 of 11, `counters_cups` 6 of 11,
`counters_small_animals` 6 of 11). The second target is D6, still the only change shipping on zero
measurement of how often auto-swap has actually fired.
