# ADR-029 — Family size is tiered; round share is the real cap — enforced at the real entry points

- **Status:** Proposed (pending owner signoff)
- **Date:** 2026-09-16
- **Source:** Delve 13 — `docs/delve-cycles/13-pieces-everywhere.md` §3 (A–E), D8–D11. Round-1 synthesis dispositions DA-F1 (FATAL), QA-F1 (FATAL), CR-Q3, QA-Q3, DA-Q10.
- **Extends:** the v8.83 pinned-batch rule, the v9.30 Mix fix, the v9.32 auto-swap
- **Related:** ADR-027, ADR-028, ADR-030

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
