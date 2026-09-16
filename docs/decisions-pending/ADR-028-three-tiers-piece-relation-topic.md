# ADR-028 — Three tiers: piece, relation, topic — and topic families graduate word-by-word

- **Status:** Proposed (pending owner signoff)
- **Date:** 2026-09-16
- **Source:** Delve 13 — `docs/delve-cycles/13-pieces-everywhere.md` §2, §4, D4–D7, D12. Round-1 synthesis dispositions CR-F1 (FATAL), DA-S5, CR-S2, DA-Q9, DA-S6.
- **Extends:** the v9.25 family model; the v9.32 auto-swap contract (`_famNailedKeys` / `_autoSwapCheck`)
- **Related:** ADR-027, ADR-029, ADR-030

## Context

The app treats all 649 families identically: `_famTake` orders them, `_famOrder` opens with the
best-known one, `buildMixFamilies` retires a whole one, `_famNailedKeys` graduates one only when
**every** member is nailed, and the round-end copy says "✓ You've got Pets". Every one of those is
an assertion that the members transfer to each other.

For a counter ladder that assertion is true. For a bag of eleven unrelated animals it is false, and
the app says it anyway. **The defect is not that 45% of the deck lacks a piece — most vocabulary in
any language does. The defect is that the app claims they have one.**

The charter said the split is 55/45. The delve measured 46/9/45 (a third tier exists: `pairs` and
`sound` families carry no `p` at all — their organising idea is a relation, not a substring).
**Round-1 synthesis re-measured again and found the 46% is itself the count of families *declaring*
a `p` field, not families whose `p` is real:** 334 words sit on a banned bare inflection
(`"p":"ます"` on four `stem` families; `"p":"ました"`/`"ません"`/`"ない"` across `form_*`), and 996
sit on a `p` absent from at least one member (`form_can_*` declares `られます`, absent from 17 of 24
members of `form_can_make`; `emergency_calling_110_119` declares a whole template sentence that 3 of
its 5 members do not contain). **Verified: 893 words = 18.5% strict, 1,313 = 27.2% allowing
phonological variants.**

## Decision

1. **Three tiers, named honestly, treated differently.**

   | Tier | `k` | Words (declared / verified) | Engine treatment |
   |---|---|---|---|
   | **piece** | `suffix` `prefix` `stem` `counter` `frame` (all keep `p`) | 2,223 declared · **893 verified** | may open a tile · may own a whole round if it is a ladder · graduates as a family |
   | **relation** | `pairs` `sound` | 437 | travels together · may **not** open a tile · graduates as a family |
   | **topic** | `topic` (renamed from `group`) | 2,170 | travels together for coherence only · may **not** open a tile · may **not** be a round's first family · capped 1 per 10-round / 3 per 30-round · **graduates word-by-word** |

2. **`group` is renamed `topic`** in `WORD_FAMILIES` (341 entries, data-only). The rename is the
   whole point: the tier is a legitimate first-class thing, not a failure state.

3. **The three rejected strategies stay rejected, on the record.**
   - *(a) Find real pieces everywhere* — demoted to a bounded, gated follow-on. Measured mechanical
     yield 16%, optimistic semantic ceiling ~35%, leaving ~29% of the deck pieceless after a
     50-tile spend.
   - *(b) Manufacture a frame-sentence piece* — **unbuildable under the locks it would have to
     break.** The drill is one word of audio and a card with no hints; a frame is only perceivable
     if spoken or shown, and doing either re-adds the v9.27 chip or turns a word drill into a
     sentence drill.
   - *(d) Leave as is* — an active defect, not neutrality.

4. **Every live word keeps a `fam`.** Minimum family size 3; a `topic` family falling below 3 merges
   into the nearest `topic` family in the same tile. **No singleton escape hatch** — `_famKey`'s
   `'_' + w.theme` fallback would silently mint one giant pseudo-family per tile, and the validator
   forbids any word reaching it.

5. **Topic families graduate word-by-word; piece and relation families graduate as families.**
   `_famNailedKeys` requires `ids.every(...)`; for an unrelated bag the members nail at wildly
   different times, so the conjunction rarely fires and the bag sits in the pin. *(Scope corrected
   in round 1: the conjunction is over the **pinned** members, not the whole family — so the stall
   bites at `roundSize` 30, where a whole bag is pinned, and is weaker at 10.)*

6. **Word-wise graduation must carry the whole auto-swap surface, not just `_famNailedKeys`.**
   `_autoSwapCheck` builds its drop-set from family keys and its banner names from `_famInfo`
   (25530); `_autoSwapHtml` renders **nothing** when that name list is empty (25556). Shipping
   word-wise graduation without this would make a word retirement **silent and un-undoable** —
   violating the in-code contract at 25496 ("Only whole families leave, only at round end, always
   announced, always undoable") and the locked strict-auto-swap-with-Undo. So the change spans
   `_famNailedKeys` + `_autoSwapCheck`'s drop-set + `_autoSwapHtml`'s copy (which needs a
   single-word phrasing) + `buildAutoSwapUndo`'s restore. **~60 lines, not ~15.**

7. **The piece is named on exactly one surface: the sticker / category page** (`renderSticker`),
   by grouping the existing YOUR WORDS list into family blocks headed by the family name and its
   existing `h`. **Placement is part of the decision:** blocks sit strictly **below** the
   `▶ Practice <name>` launch button, at every viewport; nothing is inserted between the tile tap
   and that button; unthemed tiles (which launch audio directly) get nothing. Drill card is locked
   (v9.27). Round end is full. Any proposal to also badge the piece elsewhere is scope creep
   against this ADR.

## Numeric acceptance gate

- **Rename:** all **341** `group` entries become `topic`, with **0** words changing `fam`, **0**
  words changing tile, and **0** pack-line fields other than none (the rename is in
  `WORD_FAMILIES`, not on pack lines).
- **Graduation fix:** on the owner's exported state, replaying `_famNailedKeys` word-wise must
  release **≥1 word per topic-heavy tile** that the family-wise conjunction never released — across
  the 17 tiles that are ≥75% topic words, **≥10 tiles** must show at least one such word. If fewer,
  the stall was not the bottleneck and D6's justification fails.
- **Undo survives:** a scripted auto-swap of a single topic word must produce a non-empty banner and
  a working Undo in **100%** of 20 simulated fires. Zero silent removals.
- **Sticker page:** headless render of 10 random tiles shows the `▶ Practice` button above the fold
  and above every piece block in **10 of 10**.

## Reversal trigger

- The graduation gate above misses (**<10 of 17** topic-heavy tiles show a released word) → D6 is
  wrong about the stall; revert to family-wise graduation everywhere and keep the tier rename only.
- Auto-swap fires **<1 time per 10 rounds** in the owner's logged usage → the whole graduation
  question is premature and this ADR's §5–§6 should be parked until it fires often enough to matter.
  *(This number is currently unmeasured — v9.32 shipped the day before the delve — and measuring it
  is a precondition of shipping §5.)*
- Verified piece coverage falls below **15%** after B1a's classification → the "piece" tier is too
  small to justify differential engine treatment and the model collapses to two tiers.

## Consequences

- The app stops asserting transfer it cannot support. The round-end "✓ You've got Pets" copy becomes
  true only where it is earned.
- `_autoSwapCheck` gains a mixed unit type (family keys **and** word ids). That is the one place this
  delve genuinely complicates a seam that v9.32 just stabilised, and it is accepted knowingly.
- The 18.5% figure is now the load-bearing number for every downstream decision. It was produced by
  synthesis rather than by an independent lens and should be re-derived before it is relied on.
