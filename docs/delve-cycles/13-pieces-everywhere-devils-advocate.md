# Delve 13 — Devil's advocate (LEAD)

Audit of `docs/delve-cycles/13-pieces-everywhere.md` @ `e1e0a01`, against `index.html` @ v9.32.
Read-only. Every number in the primary doc's Method was re-derived independently before attacking it.

**Prompt-injection check:** neither the primary doc nor `13-charter.md` contains text directing this
agent (no "ignore previous instructions", no staging/commit directives). Clean. Nothing written outside this file.

## The good (brief)

I re-parsed `WORD_FAMILIES` and both packs myself. Every Method number checks out: 649 families;
`group 341 · suffix 143 · pairs 56 · stem 52 · counter 26 · prefix 17 · frame 8 · sound 6`; 403 with
no `p`; 4,830 live words; `group 2170 · suffix 1476 · pairs 390 · stem 331 · counter 269 ·
prefix 102 · sound 47 · frame 45`; 0 families under 3; 172 over 8; max 25; 0 words without `fam`;
0 tiles under 30 live words; `VOCAB_SECTIONS` = 52 ids, 50 with `themes`. The 46/9/45 re-split, the
tile-count correction and "`h` exists on all 649 families" are all correct — best-measured doc yet.
Which is exactly why the failures below matter: the measurement is sound and the **wiring is not**.

## FATAL

### F1 — The round-composition caps are attached to the wrong function. New words do not enter through `_famTake`.

D7/D9/D10 are the operative half of this delve, and B6 budgets "~30 lines" in `_famTake` plus a
clause in `buildMixFamilies`. But the path that actually puts new words into a pin is
`_stickyTopUp` (index.html:23617), and its new-word branch is **family-blind**:

    23630:  const fresh = _obfBiasFresh(unseen, need);
    23631:  return fresh.length >= need ? fresh.slice(0, need) : [...fresh, ..._famTake(seen, need - fresh.length, 'due')];

`_obfBiasFresh` ranks unseen words by road/theme bias; it knows nothing about `fam`. Every unseen
seat in every top-up — after auto-swap, after attrition, after a round-size change from 10 to 30 —
is filled one arbitrary word at a time. So D10's "**A new family enters whole, at round end, via Mix
or auto-swap only.** Unchanged from v9.30/9.32 and re-affirmed as the only entry path" describes
behaviour the code does not have today, and the D7/D9 caps would ship as a no-op on the most common
entry path. `_stickyTopUp` and `_obfBiasFresh` appear nowhere in the doc's Method read-list, which
starts at "≈23700–23785" — 80 lines below the function that matters.

**Fix:** re-target B6 at `_stickyTopUp`/`_obfBiasFresh` (family-aware unseen intake, whole families
or an explicit partial-entry rule), re-cost it — it is not 30 lines — and delete the "only entry
path" sentence, which is factually wrong about v9.32.

### F2 — The validator ships red. 37 of 50 tiles fail rule 6 the day it lands.

D14/B4: "Ships **before** wave 1 and runs on every merge. Every rule is a hard fail, no warnings
tier," and rule 6 is "**Per tile:** 3 kinds max · 60% of words in families with `p` · 3 families
min". The doc's own headline: "**At v9.32, 13 of 50 tiles pass** … 37 violate." A gate that is red at
HEAD and stays red until wave 4 completes is not a gate — it is a thing everyone learns to bypass —
and it blocks B2/B3/B5/B8, which have nothing to do with tile shape, behind an aspiration. This is
how a validator dies in month one.

**Fix:** two tiers of rules. **Invariants** that already hold at HEAD (every word has a resolvable
`fam`; `p` is a literal substring; append-only; `fo` contiguity) stay hard fails. **Tile-shape
targets** (rule 6) become a **ratchet**: fail only if a tile's piece coverage or kind count gets
*worse* than the committed baseline. Enforceable from day one, still converges.

## SERIOUS

### S1 — D15's gate cannot reach its own numbers for months, and it blocks the whole build list.

"**Proves** … with **n ≥ 80 words per arm**" — three arms, ~240 certified words. The cold check is
the only source of `certFirstAt`, and it is rate-limited by construction: `const COLD_N = 10;`
(index.html:28908), once a day, two of the ten seats reserved for retests — **8 new certifications
per day at most** — and it only shipped at v9.06 (13 Sep, three days before this delve). At a
perfect daily streak, arm power arrives in **a month or more**, and `_coldEligible` boosts in-batch
words by `1e13`, so certifications concentrate in whatever the owner is currently drilling instead
of spreading across tiers. Meanwhile D15 says the measurement "runs on existing v9.32 data before
any re-cut ships" and B1 "gates B6+". Net: the entire build list is parked behind a statistic that
cannot exist yet — or is read at n of about 30 and treated as a verdict.

**Fix:** put the power calculation and the earliest honest read date in the doc. Un-gate the items
that do not depend on the hypothesis (B2, B5, a corrected B6) from B1. Add a higher-n interim proxy
(matched-exposure `smInterval` growth per tier, available today) and make the cold-based verdict a
later checkpoint, not a pre-condition.

### S2 — `hearsAtCert` is not hears. The primary metric counts sessions.

D15 defines it as the count of attempts whose `ts` is at or before `st.certFirstAt`, and calls it
"**derivable from existing data, retroactively, with no new field**". Derivable, yes; hears, no. In
the drill an attempt is recorded **once per word per session**:

    28188:    if(b._credited.has(step.word_id)) return;  /* exactly-once per session per word */
    28191:    recordAttempt(step.word_id, !missed, 'drill', ...)

while exposure increments per play (`28166: st.hears = (st.hears || 0) + 1;`). The metric therefore
counts *rounds the word appeared in*, and the plays-per-session gap is **tier-correlated** — the doc
itself says piece families open rounds and are served earlier, which is exactly the population whose
within-session replays go uncounted. Two further contaminants: synthesized backfill rows (28727,
tagged `synthesized: true`) and the cold attempt itself (29079, `recordAttempt(w.id, true, 'cold')`),
whose timestamp lands on the boundary of the comparison. The 25% / 10% thresholds are calibrated
against a quantity nobody has looked at.

**Fix:** name the metric what it is (`sessionsAtCert`), exclude `synthesized` and `mode:'cold'` rows,
and either snapshot a real hears value at `_coldApply` (one site — D16's no-new-field rule is costing
more than it saves here) or drop the hears framing.

### S3 — D6 is the only decision shipping unconditionally, and it is the unmeasured one with a broken UI contract.

D6 ("`topic` families graduate word-by-word … **This is a bug fix and ships regardless of the
re-cut**") rests on deduction, not measurement: the doc never counts how often `_autoSwapCheck` has
actually fired, on a feature that shipped the day before (v9.32). In a document whose thesis is
"measure before you build", the single unconditional item is the one with no number behind it. Two
concrete defects:

1. **The announcement and Undo die.** `_autoSwapCheck` builds its banner from family records —
   `25530: const names = keys.map(k => { const fi = _famInfo(k); return fi && fi.n; }).filter(Boolean);`
   — and the banner renders only if that list is non-empty (`25556: if(!names || !names.length)
   return '';`). Word-level keys resolve to no `_famInfo`, so the banner disappears and the swap
   becomes **silent and un-undoable**, against the contract three lines above the function:
   `25496: Only whole families leave, only at round end, always announced, always undoable.` The
   "~15 lines in `_famNailedKeys`/`_autoSwapCheck`" budget covers none of the UI, the Undo payload
   or the log shape.
2. **It manufactures orphans.** Drop 2 topic words, `_stickyTopUp` refills 2 seats via
   `_obfBiasFresh` (F1), and the batch now holds singleton fragments of two unrelated families —
   which `_famNailedKeys` will later graduate as "families". Drip churn, in the exact feature the
   owner asked to be strict because removal "feels like the app taking words away".

**Fix:** split D6 into (a) a measurement — auto-swaps fired per tier on the owner's state, one
afternoon — and (b) if the stall is real, a design that keeps a named, undoable unit: retire the
nailed *sub-set* under its family's name, still whole-at-round-end.

### S4 — Section 4 picks the surface it rejects. The sticker page IS the category open screen.

Section 4 rejects the category open screen because "the shape of the app is tap a tile, audio starts
… Inserting a 'here are this category's patterns' interstitial puts reading in front of a hands-free
drill. It is the single worst place to add friction." But for themed tiles the tap does **not** start
audio — it opens the sticker page (`30237: const open = noWords ? '' : (themed ? stkOpen(id) :
startTopicHandsFree(id))`) — and that page carries the launch button itself (`30379`, the
`h8-hero-cta` button whose onclick is `startTopicHandsFree(id)`, labelled "Practice <section name>").
D12 therefore puts the piece lesson on the pre-drill screen and then rejects the pre-drill screen.
The decision may still be right; its stated rationale is self-refuting, and ADR-P4 would encode it.

**Fix:** re-argue D12 as "the pre-drill category screen, below the launch button", and specify
placement so the Practice button always sits above any new reading.

### S5 — The expensive 80% of the plan buys the smallest learner-visible change.

The strongest objection, plainly: after the re-cut a learner sees (i) a differently grouped list on a
browsing page and (ii) a different adjacency order inside a round. That is all — Section 4 is proud
that there is "**Zero cost to the drill**", which is also zero visible benefit in the drill, and the
drill "IS the app". B10 plus B11 are ~2,160 words and 38 agent runs. The doc's own Section 2 measures
the mechanical yield at 16%, guesses 30-35% with judgement, and concedes ~29% of the deck ends with
nothing; Section 6 concedes Dates may be "ten known things plus one new suffix" and that "**No
absolute beginner has ever used this app**". An unvalidated mechanism, a measured-thin yield, and an
almost-invisible delivery surface — funded first.

**Fix:** delete waves 2-4 from the build list rather than marking them "blocked" (a blocked item
gets built anyway). Ship B2 + B5 + a corrected B6 + a fixed B3, observe, re-open only if B1 clears 25%.

## QUESTIONABLE

**Q1 — Open question 1 misdiagnoses the migration risk; B9 over-builds against it.** "`_famAvoid`,
`_mixOut`, `_autoSwapUndo` and every family-keyed grouping resolve through `_famKey` at read time."
They do not store families: `25587: state._mixOut[key] = [...drop];` (word ids),
`25531: state._autoSwapUndo = { key, batch: batch.slice(), names };` (word ids plus display strings),
`state._famAvoid = drop;` (a Set of word ids). Grouping resolves `_famKey` freshly at build time, so
a `fam` re-cut only changes which words travel together next build. Open question 2 ("Probably
benign (it is a word-id set)") contradicts Open question 1 and is the correct one. `FAM_ALIAS` (B9,
validator rule 9) is being built for display-name continuity, not state corruption.

**Q2 — D6's stall is smaller than argued: `_famNailedKeys` groups the BATCH, not the family.** The
doc says it "requires `ids.every(...)` — every member". The ids are batch members:
`25501: for(const id of batch){ const w = byId.get(id); ... g.get(k).push(id); }`. An 11-word
`animals_pets` bag in a 10-round contributes at most 10 ids, fewer under free-plan padding — the
conjunction is over what is pinned, not over the family. Plausibly still slow; not the categorical
defect claimed, and the difference matters because D6 rests entirely on it.

**Q3 — Wave 0 churns the only tiles that pass the tile rule, for no learner-visible reason.** B8
rewrites ~1,085 `form_*` lines to split 30 over-8 families "by verb group". Every sub-family keeps
the same piece, so the split is invisible to the learner and exists only to satisfy max-8; and under
D9 (form families are `suffix`, not ladders) a 10-round in `form_now` then stops being one family,
forcing mixed verb groups into a round that today plays as one clean pattern. Never argued. Cheaper:
exempt single-piece `form_*` tiles from the size rule (they
are 12 of the 13 passing tiles) and spend the 1,085 lines nowhere.

**Q4 — Sixteen FINAL decisions, one of which can kill five of them.** D15 can return "<10% kills the
re-cut", which guts D13, most of D3's purpose, B10 and B11 — yet all are stamped FINAL beside it.
FINAL should mean "survives either branch of the gate". Re-stamp D1/D3/D13 as provisional pending B1.

## NITPICK

- "The rule is insensitive across a 20-point band" — the table shows `threshold 50% -> 36 tiles fail,
  14 pass` and `60% -> 37 fail, 13 pass`. One tile flips exactly at the chosen threshold and is never
  named. "Insensitive" is doing rhetorical work.
- Charter adversary item 3 (hint smuggling): clean — nothing re-adds a drill-card chip, no banned
  special drill. Verified by reading.

## What would change my mind

1. A power calculation showing the cert metric reaches n>=80 per arm by a named date (kills S1).
2. A sessions-vs-hears scatter on the owner export showing the two are ~linear per tier (kills S2).
3. A count of auto-swaps fired per tier since v9.32 showing topic tiles at ~0 — D6 is then the bug
   fix it claims to be (the Undo hole still needs fixing).
4. A before/after on one pilot tile showing re-cut adjacency alone moves cold-pass rate (kills S5).

## Verdict

**FAIL** — not on the analysis, which is the most solid in this cycle, but on the build plan. Two
decisions are wired to the wrong code (F1, S3), the gate ships red (F2), and the measurement that
governs everything is both under-powered (S1) and measuring the wrong quantity (S2). Fix F1, F2 and
S1-S3 and this becomes a strong PASS; D1/D2/D4/D5/D8/D9 need no defence from me.
