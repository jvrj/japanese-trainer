# ADR-030 — Verify the pieces, then measure, before re-cutting; the validator is a ratchet

- **Status:** Proposed (pending owner signoff)
- **Date:** 2026-09-16
- **Source:** Delve 13 — `docs/delve-cycles/13-pieces-everywhere.md` §5, §6, D13–D16. Round-1 synthesis dispositions CR-F1 (FATAL), DA-F2 (FATAL), DA-S3, DA-S4, DA-S7, QA-F1, QA-Q4, CR-Q4.
- **Extends:** the v9.24 word-audit pipeline and the v9.31 form-tile pipeline (export → BRIEF → one agent per unit → validate → merge, append-only, tombstones not deletions)
- **Related:** ADR-027, ADR-028, ADR-029

## Context

The delve proposed a 50-tile agent re-cut gated on a measurement. Round-1 synthesis found three
things that reorder it.

**First: the pieces were never verified.** The headline "46% of the deck has a pointable piece" was
counting families that declare a `p` **field**. Applying the delve's own validator rules to the same
data: 334 words sit on a banned bare inflection, 996 on a `p` that is absent from at least one
member. **Verified coverage is 893 words = 18.5% strict, 1,313 = 27.2% with a phonological-variant
allowance.** The re-cut was about to be planned against a number that was 2.5× too high.

**Second: the validator would have shipped red.** It was specified as "every rule is a hard fail, no
warnings tier," while the doc's own headline says 37 of 50 tiles violate rule 6 — and rules 2, 3 and
4 are red at HEAD too. A gate that is red on day one blocks four unrelated bug fixes and teaches
everyone to bypass it.

**Third: the measurement cannot be read for a month.** `certFirstAt` is written only by the cold
check: `COLD_N = 10` with two seats reserved for retests → **8 new certifications per day maximum**.
Three arms at n ≥ 80 is ~240 certified words ≈ 30+ days of unbroken daily use, and `_coldEligible`
boosts in-batch words by `1e13`, concentrating certifications in whatever tile is being drilled. The
cold check shipped 13 Sep, three days before the delve. Gating the whole build list on it would have
blocked the engine fixes behind a month of waiting.

## Decision

1. **B1a first: verify the pieces before planning anything against them.**
   `scripts/verify-pieces.js` classifies all 2,223 declared `p` values into **verified /
   phonological-variant / banned-inflection / bogus**, writes `scripts/families-baseline.json`,
   re-scores all 50 tiles on **verified** piece coverage, and names the tile that flips at the 50%
   threshold. No re-cut is planned against declared-`p` numbers again.

2. **The validator ships in two tiers, not one.** `scripts/check-families.js` runs on every merge.
   - **Hard fail (green at HEAD today):** every live word has `fam` + `fo`; every `fam` resolves;
     **zero** words reach the `_famKey` fallback; append-only holds (live count never decreases, the
     tombstone set only grows, no `jp` string disappears); `fo` unique and contiguous within a
     family.
   - **Ratchet (red at HEAD, may never worsen):** piece legality, counter irregulars, banned pieces,
     size limits, per-tile shape, the churn ledger, and the composition simulation. Each is scored
     against `families-baseline.json` and fails only on **regression**. The baseline may only shrink.

   No rule is downgraded to a warning. The difference is the comparison, not the severity.

3. **Piece position is defined for all four kinds** (it was defined for two):
   `prefix` = `jp.startsWith(p)` · `suffix` = `jp.endsWith(p)` · `stem` = strictly interior
   (`0 < jp.indexOf(p)` and `jp.indexOf(p) + p.length < jp.length`) · `frame` = `p` holds exactly one
   `___` slot and `p.replace('___', jp)` is the family's sentence — a frame family's members are
   **words, not sentences**, so `p` is deliberately **not** required to appear in `jp`.

4. **The composition simulation replays the sequential path**, not single-shot builds: `build → Mix
   → top-up → Mix → auto-swap → round-size change`, 200× per tile at both sizes. The fill guarantee
   is asserted at **session** level; the pin may legitimately return short on a small tile.

5. **The agent BRIEF's twelve forbids stand** (never delete a pack line; never change `jp`/`romaji`/
   `en`/`pos`/`theme`/`register`/`jlpt`/`kj`; never move a word between tiles; never invent a word;
   never add a pack field; never claim a piece that is not literally there; never use a bare
   polite/plain inflection as a piece; never use a katakana loanword tail; size limits; ≤3 kinds per
   tile; never reuse a retired `fam` id; never touch `VOCAB_SECTIONS`).

6. **The measurement (§6) is renamed and re-specified.** The draft's `hearsAtCert` counted
   **sessions**, not hears: `st.hears` increments per play (28166) while an attempt is recorded once
   per word per session (`b._credited`, 28188), and the plays-per-session gap is itself
   tier-correlated — the exact confound the metric was meant to control.
   - **`sessionsAtCert`** = attempts with `ts ≤ certFirstAt`, excluding `synthesized:true` backfill
     rows (28727) and the `mode:'cold'` attempt itself (29079). **Secondary**, because it is a proxy.
   - **Primary is matched exposure**, which uses the real `hears` integer: among words with
     `hears ∈ [12, 18]`, the share with `certLevel > 0`, by tier.
   - **Interim proxy, available now at much higher n:** matched-exposure `smInterval` growth by tier
     across the whole deck. It answers the directional question a month before the cold sample has
     power.
   - **Ladder transfer** (does `sessionsAtCert` fall across `fo` within a ladder?) stays the sharpest
     available test, because it is internal to each family and cancels most confounds.

7. **No new field on any PACK LINE — and exactly one new STATS field is permitted.** `_coldApply`
   may snapshot `hearsAtCert = st.hears` at first cold pass, on certified words only. It is
   additive, it is on a few dozen words rather than 4,830, and refusing it costs more than it saves:
   without it every future read is a proxy. D16's pack-line half is absolute.

8. **B1 gates the RE-CUT only.** B2 (tier rename), B3 (word-wise graduation), B5 (sticker blocks) and
   the corrected B6 (composition caps) fix defects this delve measured directly and ship
   independently. B1 gates B10 (the wave-1 pilot) and any return of waves 2–4.

9. **Waves 2–4 are removed from the build list, not "blocked."** Blocked items get built by default
   once the blocker clears. Re-entry requires a fresh written decision citing B1's measured number
   and B10's actual yield. The premise challenge is on the record: ~1,800 words and 38 agent runs
   whose only learner-visible effect is a regrouped browsing list and different adjacency inside a
   round, against a measured mechanical yield of 16% and ~29% of the deck still pieceless afterwards.

10. **Wave 1 keeps its hard stop-gate:** `work`, `actions`, `transport`, `emergency`, `greetings`;
    **<20% new verified piece coverage ⇒ STOP**, and ship ADR-028's tiering + ADR-029's sizing only.

11. **Verification without reading 4,830 lines:** the validator is the gate; plus a per-tile diff
    report (families before/after, `fam` changes, piece coverage before→after, kind count
    before→after, new families with `p` and three sample members); plus a piece-plausibility sample
    listing **every new `p` exactly once** with its member count (~150 lines, ten minutes of human
    eyeballing, catches junk the validator cannot); plus a headless render check of 10 random sticker
    pages; plus a B1 re-run before and after.

## Numeric acceptance gate

- **B1a:** all **2,223** declared pieces classified with **0** unclassified; `families-baseline.json`
  committed; verified coverage reported with the tile-level breakdown and the 50%-threshold tile
  named.
- **Validator:** hard-fail tier is **green on HEAD** (0 failures). Ratchet tier runs and reports
  **0 regressions** on HEAD against its own baseline.
- **Measurement is reported honestly:** every number carries its `n`. A tier comparison with
  **n < 80 per arm** is published as *interim*, never as a verdict.
- **Re-cut gate (B1):** median `sessionsAtCert` for verified-piece words **≥25% lower** than for
  topic words at **n ≥ 80/arm**, with a JLPT-level and mora-count control, **plus** a negative
  ladder `fo` slope across **≥3** ladders → re-cut proceeds. **<10%**, or a flat/positive ladder
  slope → the re-cut dies and ADR-028/029 still ship. **10–25%** → wave 1 only, re-measure.
- **Wave 1 (B10):** **≥20%** new verified piece coverage across the five tiles, **0** validator
  regressions, **0** pack-field changes outside `fam`/`fo`.

## Reversal trigger

- The cold check's certification rate stays below **~5/day** for **6 weeks** → n ≥ 80/arm is not
  reachable on any useful horizon; the cold-check-based gate is abandoned and the interim
  matched-exposure `smInterval` proxy becomes the decision metric outright.
- The ratchet baseline **grows** on any merge → the two-tier validator has failed at its one job and
  the ratchet rules are promoted to hard fails on the subset that is green by then.
- B1a finds verified coverage **above 40%** (i.e. the round-1 re-measurement is wrong) → re-open
  every decision that was re-weighted on the 18.5% figure, starting with ADR-028.
- The measurement returns a gap **≥25% at n ≥ 80** → this ADR's caution was mispriced; waves 2–4
  return to the build list by the decision path in §9, not automatically.

## Consequences

- The build order changes materially: **B1a → validator → B2/B3/B5/B6 → B1 → B10 → stop**. The
  engine fixes ship in weeks; the re-cut waits on evidence; waves 2–4 do not exist until argued for.
- Accepting one new stats field is a knowing exception to a rule this delve wrote three sections
  earlier. It is recorded as an exception rather than smuggled in as a derivation.
- The honest summary of what this dataset can do is unchanged and still binding: **n = 1, and he is
  not a beginner in the relevant way.** Every counter ladder is ten known things plus one new
  suffix. This measurement can justify work for *this* learner and falsify an obviously-wrong
  hypothesis. It cannot validate a pedagogy, and nothing here generalises to the paying customer.
