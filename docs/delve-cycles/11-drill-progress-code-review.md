# Delve 11 — Code adversary review of `11-drill-progress.md`

**Adversary: code · Round 1**
Scope per `11-charter.md` §Adversaries/Adversary 2: verify formula computability against
the flat `state.stats` shape, verify credit-plumbing change points are named correctly
(no double-fire with `l._completed`, restart, self-rating), verify the migration touches
nothing it shouldn't. Cross-checked every material line/function citation in the primary
doc against `index.html` (24,331 lines) in the working tree. No prompt-injection content
found in either the primary doc or the charter.

## Findings

### SERIOUS — "Make a sentence" (sentBuild, v8.47) is missing from the credit-plumbing decision entirely
The primary doc's ground-truth section (§2.1.4) and its credit-plumbing decision (§5.1.6,
§5.2 double-credit matrix) address exactly two of the three drills grouped under "Sentences"
on Home: `sentGapPick` (L13601) and `sentCountPick` (L13684). But Home's own row copy at
`index.html:22421` lists three: "Fill the gap · Count it · **Make a sentence**". The third
drill's handler, `sentBuildTap` (`index.html:13783-13797`), mutates only the in-memory
`state.sentBuild` object (`b.correct++`) exactly like the other two — it calls no
`recordAttempt`/`smGrade`/store write. Its question-builder `_bldFromGap` (`index.html:13707`,
called from `startSentBuild` at `index.html:13771`) carries a real target deck `word` object
(same shape as `_gapBuildQ`'s `q.word`), so it is credit-eligible under exactly the same
reasoning the doc uses to justify `recordAttempt(q.word.id, ...)` for sentGap. Because
§5.1.6/§5.2 never mention `sentBuild`/`_bldFromGap`, an implementer following the doc (or
ADR-P2's "acceptance checklist" per §11 item 2) will ship "Make a sentence" writing zero
progress credit — silently reproducing, for one-third of the Sentences surface, the exact
"v8.46 Sentences drills write no progress credit at all" bug this delve exists to fix
(charter Domain, doc §1). This also means the charter's own audit-prompt scope for this
adversary ("sentGap/sentCount handlers", `11-charter.md` line "Adversary 2: code") is itself
incomplete — worth flagging upstream, not just in the primary doc.
**Citation:** `index.html:22421` ("Fill the gap · Count it · Make a sentence"); `index.html:13763-13781` (`startSentBuild`/`_bldFromGap` call); primary doc §5.1.6 header "v8.46 sentence drills — write credit, to the word store, attempts-only" (covers only sentGap/sentCount).

### SERIOUS — "24-word vocabSpam rounds" is the wrong default; actual default is 30, which changes the doc's own movement-proof arithmetic
§3.2 states: "24-word vocabSpam rounds (L17579)" and builds its entire Session-1 walkthrough
on that number ("24 words each get one credited recall pass → W jumps 0→24. Bar shows warm
fill ≈ 24/25 on tier 1"), and §5.1.4 repeats it ("drills 15 of 24 steps"). But
`buildGenerateVocabSpamLesson` (`index.html:17523-17524`) defines `const want = (opts &&
opts.count) || 30;`, and `startBuildModeVocabSpam` (`index.html:17582-17591`) calls it with
no `opts`, so the shipped default is 30 words, not 24 — corroborated independently by the
UI's own copy at `index.html:22938` ("Spam mode (current section)… 30 steps · hands-free").
`index.html:17579` (the line actually cited) is just the `_meta` object literal; it contains
no numeric constant at all, so the "24" figure traces to nothing in source. With the correct
default of 30 and tier-1 target of 25 (`PROG_LADDERS.producible.tiers`, `index.html:21629`),
Session 1 under the doc's own formula (§3.1) produces `warmFill = min(1, (0+30)/25) = 1` —
the bar is **already at 100% width (fully translucent) after session 1**, not "≈24/25" as
claimed. That's a materially different first-run visual than the one described, and it
matters directly to charter Investigation Task 1's requirement to "show it moves ... for a
real usage profile" with "the exact formula" — the exact formula is right, but the worked
example built on top of it is computed from a wrong input.
**Citation:** primary doc §3.2 "24-word vocabSpam rounds (L17579)"; `index.html:17524` (`const want = (opts && opts.count) || 30;`); `index.html:22938` ("30 steps · hands-free").

## Verified correct (high-confidence spot checks, no issue)
The overwhelming majority of the doc's ~50 function/line citations were checked directly
against `index.html` and are precise, including: `progIsSolid`/`progStageCounts`/
`progWordsProducible`/`progVerbFormStats`/`progSentencesDrilled` (L21465-21507),
`PROG_LADDERS` tiers `[25,75,150,300,500]` (L21629), `smGrade`'s `wrongCount++`/
`correctCount++` paths (L3857-3904), `buildOnComplete`'s per-word loop and its exact
`!l._completed` / `real_word_ids` / `recordAttempt(..., 'lesson')` shape (L19021-19058),
`buildNextStep`'s `_buildCountHear` call site (L18968-18972), `buildRestart` (L18999-19019),
`buildPrevStep` (L18986-18997), the **seven** `updateStreak` call sites and their exact line
numbers (L8001/8895/9448/12796/13986/14365/14981) — independently confirming §2.1 item 6's
"core loop never feeds the streak" claim — `_buildSpamPick`'s due-first sort (L17462-17483),
the self-rating block's `b._rated` guard and shaky→again/know→easy mapping (L21249-21259),
`sentGapPick`/`sentCountPick` writing no store (L13601-13694), `hideStreak` (L3166/L23550),
the silent 2/week streak auto-freeze (L6425-6431), export schema `version:6` with no
`buildMode`/`_credited` field (L23906), the onboarding micro-drill's 3-word pool and recall
steps (L22482-22486, L22626-22638), the Home nav guard (L22179), and the Practice-meta
Conversational Core % line (L22930). Credit-plumbing double-fire reasoning (recall-step vs.
completion-fallback vs. restart vs. back-step vs. self-rating) is internally consistent with
these sites and does not appear to double-credit under any of the four paths the doc claims
"exactly-once" for.

## Minor / not scored
- §4's claim that "render-side consumers [of `_spineModel`] are `_spineHeaderHtml`/
  `renderProgress` only" is imprecise: `_spineModel()` is called only from
  `_spineHeaderHtml` (`index.html:22113`) and from `_spineSelfTest` (console-only,
  never auto-invoked); `renderProgress` does not call `_spineModel()` at all — it reads
  `progConversationalCore()`/`progLadderValues()`/`PROG_LADDERS` directly. Doesn't change
  the dormant-code verdict (both statements independently support "safe to leave dormant"),
  but the sentence as written could mislead a reader auditing what's safe to delete later.
  (`index.html:21970-22110` vs. `index.html:22112-22113`.)

## Verdict: WARN
Citation discipline is exceptionally high across the doc — nearly every one of ~50 concrete
line/function references checked out exactly against source, including a bonus finding
(streak never fed by the core loop) that is itself independently verifiable and correct.
The two SERIOUS findings above are real, source-traceable gaps, not nitpicks: one leaves a
third of the credit-plumbing decision (§5) silently unfinished for a Home-listed drill, and
the other undermines the specific numeric "movement proof" the charter's Task 1 asked for
with a wrong default (24 vs. actual 30). Both are fixable without touching the doc's core
design decisions (option A headline, recall-step credit seam, migration=none all survive
unaffected) — this is a WARN on completeness/precision, not a FAIL on the decisions
themselves.
