# ADR-027 — A tile is a shelf of pieces, and no tile is ever split or minted

- **Status:** Proposed (pending owner signoff)
- **Date:** 2026-09-16
- **Source:** Delve 13 — `docs/delve-cycles/13-pieces-everywhere.md` §1, §1a, "The tile rule"; D1–D3. Round-1 synthesis dispositions DA-F2, DA-N11, QA-F1, CR-F1.
- **Extends:** the v9.25 family model (`WORD_FAMILIES`) and the v8.97 literal-category rule
- **Related:** ADR-028, ADR-029, ADR-030

## Context

`VOCAB_SECTIONS` holds 52 ids, two of which (`all`, `mastered`) are pseudo-tiles; **50 tiles carry
words**. They grew organically, and nobody had ever decided what a tile structurally *is*. Measured
at v9.32: 37 of 50 tiles mix kinds freely, 18 carry more than three kinds, and the only tiles with a
coherent shape are the twelve `form_*` tiles (one piece each, built deliberately) and `calendar`
(Dates — twelve counter ladders plus one small bag of clock words, 7% topic).

The owner's own diagnosis names `calendar` as the tile he knows. It is also the only content tile
that passes a shape rule derived independently of it. That coincidence is the evidence base here.

Two constraints are locked and force the shape of any answer: **stickers key on tile id**
(`stkProgress` / `_stkArt` / `_stkIs`), so splitting a tile edits a trophy someone already earned;
and **v8.97** requires a category name to be literally true of its contents, so a piece can never
become a tile of its own.

## Decision

1. **A tile is a short shelf of pieces, plus a little furniture** — charter option (b), the
   `calendar` shape. You must be able to describe it in one sentence as *"N pieces, each with a
   handful of words."*

2. **The tile rule — five clauses.** A tile is valid when all five hold:
   1. **≥60% of its words sit in families with a piece you can point at** (`p`), scored on
      **verified** `p` (see ADR-030 §1), not on the presence of a `p` field.
   2. **At most 3 family kinds.**
   3. **Every family has 3–8 words**, except a *ladder* (one constant piece over a closed set the
      learner already holds), which may run to 12 — and except a tile whose families all share one
      piece, which is exempt from the maximum entirely.
   4. **At least 42 live words in at least 3 families.** 42 = `roundSize` (30) + `maxLadder` (12),
      so a 30-round survives a Mix without the pin coming back short. *(Raised from 30 during
      round-1 synthesis; the arithmetic is in §3E of the delve.)*
   5. **Its name is literally true of its contents** (v8.97).

3. **No tile is ever split, merged, renamed, re-emojied or created.** `VOCAB_SECTIONS` is frozen by
   this ADR. Re-cutting happens **inside** the fixed 50 tiles: merge near-duplicate kinds, promote
   real pieces out of topic bags, demote the rest to the honest second tier (ADR-028). No sticker
   changes id, name, or membership boundary.

4. **The rule ships as a RATCHET, not a bar.** At v9.32, 13 of 50 tiles pass on *declared* pieces
   and fewer on *verified* pieces. A rule that fails 37 tiles the day it lands is bypassed, not
   obeyed. So the validator scores each tile against a committed baseline
   (`scripts/families-baseline.json`) and fails only on **regression**. The baseline may only ever
   shrink.

5. **First five tiles to change (yield order, not mess order):** `work`, `actions`, `transport`,
   `emergency`, `greetings`. They can be cut mechanically, so the pilot answers *"does re-cutting
   produce pieces a human recognises?"* in days. The judgement-heavy tiles (`tech`, `family`,
   `clothing`, `describing`, `directions`) wait.

## Numeric acceptance gate

- **Baseline written and green:** `scripts/check-families.js` runs on HEAD and reports **0
  regressions** against `scripts/families-baseline.json`, with the baseline recording the exact
  per-tile violation counts (expected: 37 tiles failing clause 1 on declared `p`, 1 tile —
  `cooking`, 41 words — failing clause 4).
- **The rule is not tuned:** re-scoring at thresholds 60% and 70% must move the pass count by **≤1
  tile**. (At 50% it moves by 1; that tile must be named in the B1a report.)
- **Pilot clears:** after wave 1, the five pilot tiles show a **net reduction of ≥5 clause
  violations** across them, with **0 sticker ids changed** and **0 words moved between tiles**
  (both assert-checked, not reviewed by eye).

## Reversal trigger

Reverse or re-open this ADR if **any** of:

- The wave-1 pilot produces **<20% new verified piece coverage** across the five tiles (the delve's
  own stop-gate) — the shelf-of-pieces shape is then unreachable for content tiles and the rule
  should be demoted to a reporting metric.
- Raising clause 4 to 42 words forces **>3 tiles** below the floor once verified-`p` re-scoring
  lands, i.e. the floor is doing more harm than the short-pin case it prevents.
- Any decision requires splitting or minting a tile — at which point the sticker-identity argument
  must be re-litigated in the open rather than worked around.

## Consequences

- `VOCAB_SECTIONS` becomes an append-nothing, change-nothing structure. Any future "this tile is too
  big" instinct must be answered inside the tile.
- Clause 1 cannot be evaluated until pieces are verified (ADR-030 §1). Until then it is a ratchet
  against a baseline of declared pieces, which is honest but weaker than it looks.
- `cooking` (41 words) is a known, recorded exception to clause 4. It is not fixed by adding words
  (this pass forbids additions); it is recorded and left.
