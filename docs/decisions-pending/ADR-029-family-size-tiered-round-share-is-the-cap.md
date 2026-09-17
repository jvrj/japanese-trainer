# ADR-029 — Family size is tiered; round share is the real cap — enforced at the real entry points

- **Status:** Proposed (pending owner signoff) — **AMENDED round 2, 2026-09-17**
- **Date:** 2026-09-16 · amended 2026-09-17
- **Source:** Delve 13 — `docs/delve-cycles/13-pieces-everywhere.md` §3 (A–E), D8–D11. Round-1 synthesis dispositions DA-F1 (FATAL), QA-F1 (FATAL), CR-Q3, QA-Q3, DA-Q10. **Round-2 amendments: Task 1 + the r2 synthesis dispositions DA-r2-F1 / F2 (FATAL), QA-r2-F1 (FATAL), DA-r2-S3/S4/S5/S6/S7, CR-r2-S1/S2.**

- **Extends:** the v8.83 pinned-batch rule, the v9.30 Mix fix, the v9.32 auto-swap
- **Related:** ADR-027, ADR-028, ADR-030, ADR-031

> **READ THE AMENDMENT FIRST.** The *Decision* section below is the round-1 text, preserved as the
> record. Clauses 1, 2 and 4 of it are **arithmetically unsatisfiable at `roundSize` 10** — the size
> the app shipped on 16 September — and are superseded by *Amendment — Round 2* at the end of this
> file. Do not implement from the round-1 clauses alone.

## Context

172 families exceed 8 words and the charter called that "oversized." Splitting them by that rule
would split `calendar_days_1_10` into "days 1–5" and "days 6–10" — destroying the closed-set
completeness that is the entire reason the Dates ladders work. **The flat >8 rule has a 44%
false-positive rate and its false positives are the best families in the deck.** The size limit
cannot be a single number.

The second half of this is harder and the delve's draft got it wrong. Round composition has to be
expressed as *share of the round*, because `_roundSize()` returns 10 or 30 and a family that is a
third of a 30-round is a whole 10-round. The draft placed the caps in `_famTake` and asserted that
Mix and auto-swap are "the only entry path" for new words. **Verified in code: false.** Unseen words
enter through `_stickyTopUp` → `_obfBiasFresh` (23617/23630) whenever seats open, through the
`_nextBatchNew` "Next 30 — new words" branch (23731), and through `_buildSpamPick(…, {freshMix:true})`
— all three family-blind. `_famTake` is reached only for the already-seen tail (23631). Caps placed
there would have been a **no-op on every new-word entry**.

## Decision

1. **Family size, by tier:**

   | | min | max | rationale |
   |---|---|---|---|
   | **ladder** (constant `p` over a closed set the learner already holds) | 9 | **12** | the set must be complete to be a ladder; 1–10 plus two irregulars is 12 |
   | **piece** (non-ladder) | 3 | **8** | one round's worth of a pattern |
   | **relation** | 3 | **8** | pairs are inherently small |
   | **topic** | 3 | **8** | a bag over 8 is a tile fragment |

   **Exemption:** a tile whose families all share one piece (the twelve `form_*` tiles) is exempt
   from the maximum. Splitting them by verb group would churn ~1,085 lines with **zero
   learner-visible effect** — 〜ています is 〜ています in every verb group — and would make a clean
   single-pattern 10-round impossible. 76 ladders are legalised, the `form_*` exemption removes 30,
   leaving **66 genuinely oversized families**.

2. **Round composition — stated as share of the round:**

   | Round size | Families per round | Single family may own the round? | Topic families |
   |---|---|---|---|
   | **10** | 1 (ladder only) or 2–3 | **Yes — only if it is a ladder** | max **1** |
   | **30** | 3–6 | No | max **3** |

   "A round may be one whole family" is preserved **deliberately**: v9.30's comment names the exact
   case (*"a 10-word round built from one big family"*, Dates at 10 = Days 1 to 10) and it is the
   experience the owner points at. Under the old code it arose by accident and broke Mix; here it
   becomes legal, named, restricted to ladders, and regression-tested.

3. **The caps are enforced where new words actually enter** — `_stickyTopUp` / `_obfBiasFresh` and
   the `_nextBatchNew` branch — **not in `_famTake`**. ~70 lines, not ~30.

4. **A ladder enters whole or not at all.** If fewer than 9 seats are free, Mix takes a different
   family. Half a ladder is worse than no ladder: the closed set *is* the piece.

5. **Composition governs pin CONSTRUCTION only, never pin REPLAY.**
   - An existing pin that violates the new caps is **left alone**; it changes only on Mix or
     auto-swap. No silent re-pin, ever.
   - Caps are evaluated against the **pin**, not the free-plan-padded session.
   - **Free day-1 is exempt entirely:** `_freeTierCapPool` caps the fresh pool at 3 before family
     selection runs (23550, 23618) and the seen-word padding fallback has nothing to pad with. The
     served session is 3 words regardless of pin composition. No composition rule may try to fix
     this, and it must never be reported as a composition bug.
   - `isMasteredMode` bypasses the sticky batch and is **exempt**.

6. **Two v9.30/9.32 seams are now load-bearing and are marked:**
   - The avoid-list hoist (23714) must **not** be refactored back into the top-up branch. A
     ladder-only 10-round empties the batch on every Mix **by design**, so the fall-through path is
     no longer rare.
   - `buildMixFamilies`' `_mixOut` carry-forward gives **zero** anti-repeat protection on
     ladder-heavy tiles: `avoid` is seeded with the uncapped `drop` (25584) and the carry-forward
     loop only adds while `avoid.size < capN` (25586, `capN = floor(tileWords/3)`, 25585), so a
     9–12-word drop exhausts the cap before anything carries forward. The regression test must
     assert **Mix twice**, not Mix once.

7. **The 30-round fill guarantee is at SESSION level, not PIN level.** Refill after a Mix draws from
   `sectionPool` minus kept minus `avoid` (23722). On the smallest tile (`cooking`, 41 words) a
   30-round drops ~15 and can refill only 11 → the pin returns short (26/30); the free-plan padding
   path then fills the session from seen words. The tile floor becomes `roundSize + maxLadder` =
   **42** as a ratchet target (ADR-027 clause 4), with `cooking` recorded as the one tile below it.

## Numeric acceptance gate

- **Offline simulation, sequential not single-shot:** for each of the 50 tiles, at sizes 10 and 30,
  replay `build → Mix → top-up → Mix → auto-swap → 30→10→30` **200×**. Required:
  - §2 caps hold on **100%** of pins;
  - two consecutive Mixes return different word sets in **100%** of runs;
  - the **session** returns the requested word count in **100%** of runs (the pin may be short).
- **Caps are live where they matter:** an instrumented run must show the cap logic executing on
  **≥95%** of new-word admissions. If it fires on the seen-remainder path only, the caps are still
  in the wrong function.
- **No silent re-pin:** across 200 simulated app loads with pre-existing violating pins, **0** pins
  change without a Mix or auto-swap.
- **Ladder integrity:** **0** partial-ladder admissions across the whole simulation.

## Reversal trigger

- The sequential simulation cannot reach 100% session-fill on **>2 tiles** → the 42-word floor is
  insufficient and either `maxLadder` drops to 10 or Mix must stop dropping half the round.
- Enforcing caps at `_stickyTopUp` measurably degrades new-word variety (the `_obfBiasFresh` road
  ordering is the mechanism that puts road-ordered words first) — specifically, if the share of a
  first batch that follows road order falls below **80%** → the caps move to a post-selection
  re-order instead of a filter.
- Any future family legitimately needs **>12** words → the ladder maximum is re-opened rather than
  the family being split.

## Consequences

- The v9.30 fall-through path and the v9.32 auto-swap both move from edge case to supported
  configuration, and both acquire regression tests. That is the good half.
- The bad half: the caps now live in the hot new-word path (`_stickyTopUp`), which is shared by
  every tile, every round size and the free-plan gate. It is the riskiest code in this delve and the
  simulation gate above exists because of it.
- `cooking` is a known tile below the floor. It is not fixed by adding words (this pass forbids
  additions).

---

## Amendment — Round 2 (2026-09-17)

Round 1's clauses 1, 2 and 4 cannot be satisfied at `roundSize` 10. A ladder is legalised to 12 words
and must "enter whole"; a 10-round has ten seats. Measured at round 2: **86 families of 11+ words
holding 1,220 words — 25.3% of the live deck — can never enter a round at `roundSize` 10**, including
**100 of `calendar`'s 125 words**, the tile the whole delve is named after. The amendment below
replaces the unsatisfiable parts and adds the four clauses the adversary panel showed were missing.

### A1 — Family size, corrected

| | min | max | count |
|---|---|---|---|
| **closed-set ladder** — `k === 'counter'`, constant `p`, `p` final in ≥80% of members **after rendaku normalisation**, and the members form a **complete run over an enumerated set the learner already holds** (the numbers), with an explicit allowance list for ついたち and the なん〜 question words | 9 | **12** | **23** at ≥9 words, 19 at 11–12 |
| **one-piece exempt** — every family in the tile declares the **same** `p`, **and** that shared `p` is verified or variant in ≥ half the tile's families | 3 | **no maximum** | **52** over 10 words, largest 25 (`form_now_make`) |
| **everything else** | 3 | **8**, on newly authored families only | 71 grandfathered |

Three corrections to round 1's numbers: **the ladder count over 8 words is 23, not 76** (the 76
counted `form_*` suffix families as ladders); **genuinely oversized is 71, not 66**; and the
two-irregulars budget is **replaced** by the rendaku test, under which **four** previously-flagged
counter families recover — `calendar_minutes`, `counters_small_animals`, `counters_cups`,
`counters_long_things`. **`counters_times` does not recover and is not expected to**: it declares
`p:"かい"` over seven members, three of which are にど・さんど・なんど. ど is a different counter word,
not a rendaku variant. It is a **data defect**, re-filed to the piece-retraction item.

**The 71 are grandfathered.** With the wave-1 and waves-2–4 re-cuts both removed, 45 of 50 tiles are
never re-cut, so the 71 are permanent by construction. They are frozen into
`scripts/families-baseline.json` as a named set, **excluded from the ratchet** and reported
separately; the ratchet clause becomes *"the grandfathered set may only ever shrink."* A ratchet with
71 permanent violations is a comment, not a check.

**Two rules elsewhere must carry the exemption or it is a dead letter** (this is what round 1 missed):
BRIEF-forbid rule 9 and validator rule 5 both gain **"…or any size, for a family in a one-piece tile."**
Without the clause the validator fails the 30 families the exemption legalised. Validator rule 4's
banned-inflection list gains the same exemption: 〜ました *is* the piece of the `form_did` tile.

### A2 — Round composition: a share cap, not a family count

1. **No family occupies more than half the round** — 5 seats at `roundSize` 10, 15 at 30 — measured
   against the **pin**, never the free-plan-padded session. This clause never yields. Round 1's
   *"30-round = 3–6 families, never a single family"* floor is **retired as unsatisfiable**: it is
   impossible for any family of 16+ words under whole-family entry, and the share cap achieves its
   entire intent without being impossible.
2. **The one-piece exempt class is bound by the cap like anything else** — a 13–25-word `form_*`
   family takes 5 seats at a time at 10, 15 at 30. This is the clause round 1's exemption created a
   hole for and did not fill.
3. **The caps never shorten a round — they relax, in a fixed and logged order.** The share cap plus
   the locked topic caps are **not jointly satisfiable in every tile**. Measured at r2 synthesis
   against `WORD_FAMILIES` at HEAD, and independently reproduced: **3 tiles cannot legally assemble a
   10-round today** — `animals` (16 of 17 families are topic; the one non-topic family holds 4),
   `home` (14 of 15, likewise 4) and `onomatope` (**11 of 11 topic — no legal round opener exists in
   the tile at all**) — rising to **8** once the piece-retraction item re-kinds 67 bogus/banned
   content families to `topic` (`grammar`, `nature`, `objects`, `transport`, `work` join, five of
   them becoming 100% topic).
   *A seat-share topic cap was proposed as the fix and does not work: the binding constraint is the
   locked "a topic family may open neither a tile nor a round," and a tile with zero non-topic
   families has no opener under any share arithmetic.*
   **The rule:** the round is **always** served at full size. When a tile cannot fill it under the
   caps, the engine relaxes in this order, taking the first step that makes the round assemblable and
   **logging which step it took** — **(a)** the topic-opener rule yields; **(b)** the topic count /
   share cap yields; **(c)** the ≥3 slice minimum yields last. **Clause A2.1 never yields.**
   *Why a relaxation ladder rather than a stricter rule:* the caps land in `_stickyTopUp` /
   `_obfBiasFresh`, the exact path whose last change shipped a silently no-op Mix (v9.30). An
   unsatisfiable cap there does not fail loudly — it returns a short round or is quietly ignored.
4. **A closed-set ladder may take the whole 10-round, overfilling to its own size (≤12) — behind a
   flag, default OFF.** It is the only clause here that is a bet on the unmeasured transfer
   hypothesis rather than arithmetic, and it has two costs round 1 did not price: it breaks the v9.28
   round-size contract (`_againLabel` at 23656 and `setRoundSize`'s toast both read the **setting**,
   not the served count, so an 11-card replay is labelled "10 words"), and at `roundSize` 10 it makes
   **cross-counter contrast impossible in `calendar`** — every round becomes one ladder, eleven days
   or eleven hours, never five and five, while the founding observation is *the number **and** the
   counter*. **Default OFF:** a ladder is then a 5,3,3 slice like anything else, `calendar` is served,
   the round is exactly 10, and the labels stay true. **The default flips on one number** — the
   ladder-`fo` slope read from the transfer measurement — **not on an argument.**

### A3 — Entry: in order, and finishing before another starts

Round 1's clause 4 ("a ladder enters whole or not at all") is **narrowed to closed-set ladders only**.

1. **Every other family enters as an `fo`-ordered slice**, unseen first, up to the share cap, and a
   family in progress has priority over a fresh start of its own tier. **No slice below 3**: an
   11-word family at `roundSize` 10 runs **5,3,3**, never **5,5,1**.
2. **The cursor is derived, never stored** — the lowest-`fo` members neither in the pin nor already
   seen. No new pack-line field, no new stats field.
3. **"Seen" is the drill-surface signal, not every writer.** `state.stats[id].attempts` is written
   from **fifteen call sites across thirteen modes** (blitz, formDrill, formBlitz, convo ×2, recall,
   memory, nuance, sentGap, sentBuild, lesson, drill, cold ×2, onboardKnown). A word ticked during
   onboarding or answered once in conversation would push the cursor past it and silently degrade the
   in-order promise. **The cursor reads only attempts whose `mode` is `'drill'` or `'lesson'`** — the
   two surfaces the pinned batch serves.
4. **These rules govern NEW-WORD ADMISSION only.** When a family's unseen set is empty it is
   exhausted for entry and takes no seats from the entering path — it is **not** dropped from the
   pin, and the seen-word top-up (`_famTake(seen, …, 'due')`) is **not** governed by the share cap at
   all. A returning learner's mostly-seen pin is composed by due-order exactly as today. Stated
   because it is the app's steady state, and round 1 specified only day one.
5. **A sliced family graduates word-wise, and the completion banner names the slice, not the family.**
   Slicing breaks the auto-swap banner as it stands: `_famNailedKeys` (25499) groups **only the ids
   present in the batch** (25501), so once a **5-of-25 slice** of `form_now_make` is nailed,
   `_autoSwapCheck` takes the family key and `_autoSwapHtml` (25558) renders *"✓ You've got Using &
   Handling — swapped it for new words"* while **20 of its 25 words have never been seen**. That is
   the false-completion defect the word-wise-graduation decision was written to kill for topic bags,
   reintroduced by slicing. **Any family that entered the pin as a slice graduates word-by-word**,
   and the banner may name a family only when the nailed group **is** the whole family.

### Amended numeric acceptance gate

Replacing the round-1 gate's ladder clause and adding three:

- **Full-size service, all tiles:** across **all 50 tiles × {10, 30} × 200 replays**, the round is
  served at the **requested size in 100%** of builds — **before and after** the piece-retraction item
  lands. The relaxation log fires on **exactly** the tiles named in A2.3 and **0** others.
- **Share cap:** **0** pins in which any family exceeds half the round, across the same simulation.
- **Slice order:** **0** cases in which a family re-serves a word it has already given, and **0**
  slices below 3 words, across the same simulation.
- **No false completion:** nailing a **5-of-25 slice** produces **0** family-complete banners.
- **Ladder integrity (flag ON only):** **0** partial-ladder admissions.
- Round 1's caps-are-live (**≥95%** of new-word admissions), no-silent-re-pin (**0** of 200 loads)
  and two-consecutive-Mixes-differ (**100%**) gates are unchanged.

### Amended reversal trigger

- The relaxation log fires on **more than the 8 named tiles**, or on **>20%** of builds in any tile →
  the caps are wrong for this deck, not merely tight; the topic caps are re-opened rather than
  relaxed at runtime.
- The full-size-service gate cannot reach 100% on **>2 tiles** → the 42-word tile floor is
  insufficient and either `maxLadder` drops to 10 or Mix stops dropping half the round *(carried
  forward from round 1)*.
- Enforcing caps at `_stickyTopUp` drops the road-ordered share of a first batch below **80%** → the
  caps move to a post-selection re-order instead of a filter *(carried forward from round 1)*.
- The ladder-`fo` slope read comes back **flat or negative** → A2.4's flag stays OFF permanently and
  the overfill code is deleted rather than carried.
- Any future family legitimately needs **>12** words as a ladder → the ladder maximum is re-opened
  rather than the family split *(carried forward from round 1)*.

### Amended consequences

- The good half is unchanged: the v9.30 fall-through and the v9.32 auto-swap both become supported
  configurations with regression tests.
- **The riskiest code in the delve is now riskier**, and knowingly so: the relaxation ladder adds a
  branch to `_stickyTopUp`, the hot path shared by every tile, every round size and the free-plan
  gate. The log line is not decoration — it is the only way an unsatisfiable cap is distinguishable
  from a working one on that path.
- **`onomatope` is served only by relaxing a rule.** A tile whose every family is a topic bag has no
  legal opener, so the exception is its normal mode of operation. Either the opener rule does not
  apply to tiles like this or the tile is mis-kinded; the amendment serves the learner now and leaves
  that open rather than pretending the rule holds.
- **Half of the size problem is no longer solved by the re-cut, because there is no re-cut.** The 71
  oversized families are permanent and the rules serve the deck as it is. Round 1 wrote a rule for a
  deck that does not exist yet.
