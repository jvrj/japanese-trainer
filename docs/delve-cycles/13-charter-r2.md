# Delve 13 — Round 2: make the size rules survive a round of ten

## Domain
Round 1 is committed: primary `e1e0a01`, adversaries `3967c24e`, synthesis `701b4466`; 21 findings
dispositioned, citation audit clean (0 fabricated), ADR-027…030 filed to `docs/decisions-pending/`.
The retro held it at PAUSED for a **delivery gap, not a rethink** — verbatim verdict and run facts in
`docs/delve-cycles/13-r1-retro.md`. Round 2 is narrow: fix what the retro caught, change nothing else.

**Gap 1 — the size rules are arithmetically impossible at `roundSize` 10, and the hard case is not
the calendar.** D8 legalises a *ladder* at 9–12 words; D9 lets a 10-round be "one ladder"; D10 says a
ladder "enters whole or not at all." Ten cannot hold twelve. Verified independently in `index.html`
this session, the real size distribution above 10 is:

```
11 words  48 families    incl. every calendar ladder: calendar_days_1_10 11 · calendar_months 11 ·
12 words   8 families          calendar_weeks 11 · calendar_hours 11 · calendar_minutes 11 ·
>=13      30 families          calendar_years 11 · calendar_days_21_31 11 · calendar_ages_1_10 11 ·
                               numbers_zero_to_ten 11 · numbers_things 11 ·
                               time_months 12 · time_oclock 12 · calendar_ages_11_80 12
```

**All 30 families of 13+ words are `form_*`, and twelve of them hold 23–25 words** — every
`form_<x>_make` family (`form_now_make` 25, `form_did_make` 24, … `form_mayi_make` 24). D8's round-1
amendment exempts one-piece tiles from max-8, which makes these a **third size class that is neither
"ladder 9–12" nor "everything else 3–8" — and D9/D10 contain no composition clause for it at all.**
A 24-word family cannot be served whole at either round size. Per the owner's standing direction more
ending tiles are wanted, so **this class is the one that grows.**

**Gap 2 — the sweep was reported cleaner than it was.** The retro found findings mis-accounted:
recorded as resolved when the disposition does not close them. It gave a count but named none and
produced no per-finding artefact, so round 2 must re-audit **all 21 from scratch** and report the true
number — including that the retro may be wrong.

**Gap 3 — the coverage figure that gates the re-cut is unsettled, and the charter's own history of
it is a cautionary tale.** The r1 charter claimed **55%**; D4 corrected it to 2,223 words / **46%**;
then finding **CR-F1 (FATAL, ACCEPTED)** applied the document's own validator rules and landed on
**893 words = 18.5% strict, 1,313 = 27.2% with a phonological-variant allowance.** Independently
reproduced this session. Meanwhile **all 1,192 `form_*` words across 96 families carry a piece by
construction (100%)** — so any "exclude the pre-conjugated tiles" framing must exclude the whole
class (giving ≈28.3% on the 46% basis), not just the four newest, or it is an authorship-recency line
wearing a construction rationale. **The live honest figure is 18.5%/27.2%, not 46% and not 55%.**
The open question is therefore not "what is the number" but what survives it.

## Stacked callouts (binding, not re-openable here)
> **LOCKED — round 1 stands.** D1–D7, D11–D16, ADR-027…030, the tile rule and every accepted
> disposition are settled. Round 2 may amend **only** D8, D9, D10, plus **D3's 60% piece-coverage
> floor** (explicitly carved out of the D1–D7 lock for task 3), and anything that provably depends on
> the corrected coverage figure. Do not re-open the tier model, the no-split-tiles rule, the teaching
> surface (D12), the measurement design (D15), or D16.
> **ESCAPE CLAUSE — the lock does not fence the conclusion.** If the corrected coverage figure means
> the re-cut is not worth doing, that finding **supersedes the build-list lock**. Say so plainly and
> amend the build list accordingly; a locked artefact is not a reason to recommend work that the
> evidence no longer supports.
> Also binding: `roundSize` is 10 or 30 and both are real (v9.28) · re-entry keeps the SAME pinned
> words · auto-swap stays strict with Undo · no hints on the drill card · STT never grades ·
> tombstones, never deletions.
> Grounding: `docs/delve-cycles/13-pieces-everywhere.md` (+ the three adversary docs),
> `docs/delve-cycles/13-r1-retro.md`, `docs/decisions-pending/ADR-027…030`, and in `index.html`:
> `WORD_FAMILIES` (~6420), `_famTake`, `_stickyTopUp`, `_obfBiasFresh`,
> `buildGenerateVocabSpamLesson`, `buildMixFamilies`, `_autoSwapCheck`, `setRoundSize`.

## Primary
**Mode:** Opus-only

### Investigation tasks

1. **Big families at round size 10 — pick FINAL.** Reconcile D8/D9/D10 so the rules are satisfiable
   for **all three size classes above 10**: the 48 families at 11, the 8 at 12, and the 30 `form_*`
   families at 13–25 that D8's one-piece exemption created. Enumerate and decide between at least:
   (a) cap and split — state what breaks, e.g. `calendar_days_1_10` is a *closed set* of eleven whose
   irregulars (ようか, ここのか) are the whole difficulty, and splitting a closed set may be worse than
   the disease; (b) **slice with position memory** — a family enters in order and completes before
   another starts, so "enters whole" becomes "enters in sequence"; (c) single-family rounds are legal
   only at size 30; (d) round size flexes to the family. Then: **state the amended D8/D9/D10 verbatim,
   ready to paste**, with an explicit clause naming the exempt one-piece class, and run the arithmetic
   against **all 86 families of 11+ words** at both round sizes showing none is left unservable.

2. **Re-audit all 21 dispositions, independently.** Do not target a count. For each of the 21
   findings, state whether its disposition actually closes it, and correct the ones that do not.
   Report the honest tally whatever it is — including "the retro was wrong, all 21 close," defended
   with citations. The failure being fixed is self-reported accounting, so this task must not repeat
   it: the **qa adversary audits the 21 first and independently**, and the primary reconciles against
   that audit rather than grading its own work.

3. **What survives 18.5%?** Take the verified figures from CR-F1 (893 words = 18.5% strict / 1,313 =
   27.2% with phonological allowance) as the live number — do not re-derive a higher one, and do not
   re-anchor on 46% or 55%. If a by-construction exclusion is used anywhere, it covers all 1,192
   `form_*` words, not a recent subset. Then check every round-1 conclusion that rests on coverage:
   **D3's 60% floor** (is a 60% floor coherent when verified deck coverage is 18.5%? is it a gate or a
   target the deck climbs toward?), the "13 of 50 tiles pass" baseline, the expected yield of waves
   1–4, and the wave-1 stop-gate at <20% new piece coverage. Say plainly whether the corrected number
   changes the go/no-go on the re-cut — and if it does, invoke the escape clause.

### Output
Amend `docs/delve-cycles/13-pieces-everywhere.md` **in place** — do not create a second primary doc.
Add a `## Round 2` section carrying: the three task answers, the verbatim amended D8/D9/D10 including
the exempt-class clause, the corrected disposition tally, the coverage reconciliation, and any
build-list line whose estimate or status moved. Update the Decisions-reached Status column for amended
rows (`AMENDED r2`). Amend ADR-029 in `docs/decisions-pending/` only if D8/D9/D10 change materially;
file no new ADR unless a genuinely new load-bearing decision emerges.

## Adversaries

### Adversary 1: devils-advocate (LEAD)
**Read:** the amended primary, `13-r1-retro.md`, ADR-029, `WORD_FAMILIES` sizes, `setRoundSize`
**Audit:** (1) Does the task-1 answer work for `calendar_days_1_10` — a closed set of 11 whose
irregular days are the difficulty — or does it look tidy and teach worse? (2) Does it work for a
24-word `form_*_make` family, the class that is growing? (3) Is "slice with position memory" a new
stateful concept smuggled in under a size fix, and does it need a field D16 forbids? (4) **At 18.5%
verified coverage, is the re-cut worth doing at all** — and was round 1 partly sold on figures that
have since fallen from 55% to 46% to 18.5%? The escape clause exists; use it if the evidence says so.
**Output:** `13-pieces-everywhere-r2-devils-advocate.md`

### Adversary 2: qa
**Read:** the three round-1 adversary docs, the primary's disposition table, `_famTake`,
`_stickyTopUp`, `_obfBiasFresh`, `buildGenerateVocabSpamLesson`, `buildMixFamilies`, `_autoSwapCheck`
**Audit — do (1) FIRST and report it as a standalone table before reading the round-2 amendments:**
(1) Independently re-audit all 21 round-1 dispositions against their source findings; state which
close and which do not, with citations, and give the honest count. (2) Walk the amended rules across
**all 86 families of 11+ words** at round size 10 and 30, through pin construction × Again × Mix ×
Mix-twice × auto-swap × free-plan 3-new-a-day — name any that starves, repeats or cannot be served.
(3) Does a partially-served family interact safely with the pinned batch and with `_autoSwapCheck`'s
all-words-nailed test?
**Output:** `13-pieces-everywhere-r2-qa-design.md`

### Adversary 3: code
**Read:** the amended primary, the family helpers and the four new-word entry paths
**Audit:** (1) Is the amended rule implementable at the entry points DA-F1 re-targeted B6 onto, and
does the B6 estimate still hold? (2) Does any part require state D16 forbids? (3) Is the round-2
amendment self-consistent with every surviving round-1 decision — cite the ones it touches.
(4) Re-verify a sample of the round-2 citations against source; round 1's clean citation audit is
offered as evidence of soundness, so round 2 must not go unchecked.
**Output:** `13-pieces-everywhere-r2-code-review.md`
