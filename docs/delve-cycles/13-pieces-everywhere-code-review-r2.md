# Delve 13 Round 2 -- Code-review adversary audit

**Target:** `docs/delve-cycles/13-pieces-everywhere.md` (Round 2 section, committed `72ab1f9`)
**Charter:** `docs/delve-cycles/13-charter-r2.md`, Adversary 3 (code)
**Method:** re-derived every headline count independently from `index.html` (v9.32, 33,177 lines)
via a fresh parse of `N5_PACK` (1283), `ADV_PACK` (6395) and `WORD_FAMILIES` (6420), not recalled
from the doc. Spot-checked roughly 15 line citations against source. No text in the primary doc or
the charter attempted to instruct this agent; nothing to report on that front.

## Headline: the arithmetic is unusually solid

Independent re-derivation reproduced, exactly, every load-bearing round-2 number checked: 4,830 live
words / 649 families / 71 tombstones; the 48-at-11 / 8-at-12 / 30-at-13-plus split and that all 30
are `form_*`; the 86-family / 1,220-word (25.3%) total; the 19/52/15 class split (L/E/O) and their
word totals 212/839/169; the 96-family / 1,192-word `form_*` total; the `cooking`=41 floor; and the
verified/variant/banned/bogus bucket table (893+420+334+576+2,607 = 4,830, and 334+576=910). This is
a well-measured document. The findings below are the material exceptions.

## Findings

### 1. [SERIOUS] D8.1's "ready to paste" ladder test fails its own worked example (counters_times)

D8.1 states the ladder test as `p` final in >=80% of members "after rendaku normalisation" using an
explicit, closed list of collapse classes (h/b/p, k/g, s/z, t/d pairs), then claims "All 23 pass the
80%-after-rendaku test" and cites `counters_times (4/7 -> 7/7)` as one of five families the new test
rescues from the old irregulars budget. Source (`WORD_FAMILIES` record for `counters_times`, `p` =
kai in kana) shows the family mixes two etymologically unrelated counters: 4 members end literally in
the kai reading, the other 3 (nido, sando, nando; index.html:3786-3788) end in the do reading -- a
different word, not a phonological variant of kai under any of the listed collapse classes. Applying
the stated rule literally to this family gives 4/7 = 57%, not 7/7 = 100%, so it fails the doc's own
80% bar. The other four cited examples (calendar_minutes, counters_cups, counters_small_animals,
counters_long_things) were independently re-verified and DO pass under the listed collapse classes --
this is not a blanket error, it is specific to counters_times, whose real defect (two distinct
counter words sharing one family) the rendaku fix cannot address. Consequence:
`scripts/check-families.js` rule 3, implemented exactly as specified, will still red-flag
counters_times after the "fix" ships -- the claim that the two-irregulars budget is fully "replaced"
by a passing test is not implementable as written for this family. A secondary, smaller
inconsistency in the same passage: the sentence structure ("23 families qualify at >=9 words... five
of them fail...") implies counters_times is one of the 23, but it measures at 7 words (index.html
fo:0-6) -- below the >=9 threshold that defines the set it is cited as belonging to.
**Citation:** `docs/delve-cycles/13-pieces-everywhere.md`, Task 1, D8.1 amendment block, verbatim
"counters_times (4/7 -> 7/7)" -- cross-checked against `index.html:3786-3788` (the nido/sando/nando
entries) and the `WORD_FAMILIES` record `"counters_times":{"n":"Times",...}` whose declared `p` is
the kai reading only.

### 2. [SERIOUS] Round 2 diagnoses "adopted-but-not-applied" drift, then repeats it against its own amendments

Task 2's process fix states plainly that "an adoption is complete only when the change is present in
the artefact, so a synthesis should verify dispositions against the body, not only citations against
source." Round 2 amends D8/D9/D10, but the original section-3 body -- read by anyone who does not
reach the "Round 2" heading -- still carries the pre-amendment rules verbatim, with no forward
pointer:
- Section 3A's own text still reads "Violations to fix: 96 families (30 form_*, 66 content). The 76
  ladders are legalised, not split..." -- both numbers are numbers round 2 itself supersedes
  (genuinely oversized is now 71; the ladder count is now 23, with round 2 explicitly stating that
  "r1's '76 ladders' silently counted form_* families as ladders").
- Section 3B's round-composition table still reads "30 | 3-6 | No | max 3" and "10 | 1 (ladder only)
  or 2-3 | Yes..." -- the exact family-count floor D9 (round 2) calls "retired as unsatisfiable" and
  replaces with a share cap.
- Section 5's numbered lists still read, verbatim and un-amended, "9. Never create a family under 3
  words, over 8 (or over 12 for a declared ladder)." and "5. Size: 3-8, or 9-12 for a family flagged
  ladder:true..." -- the exact two rules round 2's own D8 amendment says "must be amended to match,
  or the exemption is a dead letter" (restating DA-Q10, which Task 2 marks DOES NOT CLOSE for
  precisely this reason). Leaving BRIEF rule 9 and validator rule 5 unedited at their canonical
  definition site means an implementer who reads section 5 in isolation -- exactly how B4 /
  `scripts/check-families.js` is meant to be built -- implements the stale rule.
This is the same failure class Task 2 spent a full section diagnosing, now present in round 2's own
diff against round 1, unflagged.
**Citation:** `docs/delve-cycles/13-pieces-everywhere.md:349` -- "Violations to fix: 96 families (30
form_*, 66 content). The 76 ladders are legalised, not split" -- contradicted by the same document's
Task 1: "Genuinely oversized, after clauses 1 and 2: 71 families."

### 3. [SERIOUS] "The tile rule" callout -- the document's most-quoted box -- is not updated to round 2's own finding

"## The tile rule" states: "At v9.32, 13 of 50 tiles pass on declared pieces: the twelve form_*
tiles and calendar. 37 violate. On verified pieces (round-1 correction...) the pass count is lower
and is re-scored by B1a." Round 2's Task 3 already performed that re-score in this same document and
got a different, more specific answer: "4 of 50 on verified... and calendar scores 44% verified -- it
does not pass." Task 2's own re-audit of CR-F1 says as much: "the tile rule still leads with '13 of
50 tiles pass' and names calendar as a passing exemplar, with the verified re-score deferred to
B1a... A correction that leaves its own consequences in place is not a closed finding. Closed by
Task 3." But Task 3 closes the number, not the artefact: the callout box itself is never edited, so a
reader who stops at the boxed "stated once, plainly" summary -- explicitly designed as the
one-paragraph takeaway -- still comes away believing calendar passes the tile rule and that 13 tiles
pass, both since falsified in the same document.
**Citation:** `docs/delve-cycles/13-pieces-everywhere.md:791-792` -- "At v9.32, 13 of 50 tiles pass on
declared pieces: the twelve form_* tiles and calendar." -- contradicted by the same document's
Task 3: "calendar scores 44% verified -- it does not pass."

### 4. [QUESTIONABLE] B4's build-list row repeats the unverified "all 23 pass" claim into the implementation estimate

The build-list row for B4 (`check-families.js`) carries the same claim as finding 1 forward into the
implementation spec: "rule 3's 'max 2 declared irregulars' budget is replaced by >=80% final-p after
rendaku normalisation (all 23 counter ladders pass; five failed the old budget)." Since finding 1
shows one of the five (counters_times) does not in fact pass under the stated rule, the roughly
290-line estimate for B4 implicitly assumes a validator that "just works" once the rendaku classes
are added; in practice counters_times (and possibly other multi-morpheme counter families not
audited here -- this review checked all 5 named examples, not the remaining 21 non-form counter
families) will need either a manual ladder:true override, an explicit two-morpheme allowance, or a
size fix, none of which is currently budgeted.
**Citation:** `docs/delve-cycles/13-pieces-everywhere.md` build-list, B4 row: "all 23 counter ladders
pass; five failed the old budget."

### 5. [NITPICK] Entry-point and helper citations sampled, and they hold

Spot-verified against `index.html` at HEAD: `_stickyTopUp` (23617), `_obfBiasFresh` (23518, called
23630 and 23731), the `_nextBatchNew` branch (23723-23739), `_famNailedKeys` (25499),
`_autoSwapCheck` (25520), `_autoSwapHtml`'s empty-name-list return (25556), `buildMixFamilies`
(25560) including `Math.ceil(batch.length / 2)` (25570), `capN` (25585) and
`state._mixOut[key] = [...drop]` (25587), `state.settings.stickyBatch[key] = ...` (23753),
`_roundSize()` (23637), `save()` (7865), and the `form_can` declared-piece record across all 8
families (7031-7038). All match exactly or within the doc's own stated tolerance. No new findings
here; recorded as evidence the citation discipline is otherwise sound, per the charter's ask to
"re-verify a sample."

## Answering the charter's four questions directly

1. Implementable at the re-targeted entry points? Yes structurally -- `_stickyTopUp` /
   `_obfBiasFresh` / the `_nextBatchNew` branch already distinguish seen/unseen exactly as D10.4's
   derived cursor requires, so the composition logic has a real home. The B6 line estimate
   (~70 to ~120) is a judgment call, not independently falsifiable, and is not disputed here.
2. Any state D16 forbids? No -- the slice cursor is genuinely derivable from `fo` (verified
   unique/contiguous per family) plus `state.stats[id].attempts` plus the existing pin; nothing new
   needs to persist. This claim holds up.
3. Self-consistent with every surviving round-1 decision? Mostly, with the exceptions in findings 2
   and 3 above -- the round-2 amendment is self-consistent within the Round 2 section, but the
   original body it amends (section 3A, 3B, 5, and the tile-rule callout) is left contradicting it.
4. Round-2 citations re-verified? Sampled roughly 15 (finding 5); one worked numerical example
   (finding 1) does not hold up on independent re-derivation.

## Verdict

**WARN.** The round-2 arithmetic that was checked is exceptionally well-verified -- better than most
docs of this kind -- but one of the five worked examples backing the "ready to paste" D8.1 ladder
test does not actually pass the test as stated (finding 1), and the round otherwise repeats, against
its own amendments, the exact "disposition landed in the synthesis but not in the artefact" failure
mode that its own Task 2 spent a full section diagnosing (findings 2-3). None of these invalidate the
round's direction, but a validator or agent implementer working from the document as-is would ship a
red counters_times family and a stale BRIEF rule 9 / validator rule 5.
