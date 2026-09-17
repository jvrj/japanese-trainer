# Delve 13 · Round 2 — Devil's advocate (LEAD)

**Target:** `docs/delve-cycles/13-pieces-everywhere.md` @ `72ab1f97` · **Charter:** `docs/delve-cycles/13-charter-r2.md` **Lens:** challenge the premise · what is
fragile, over-built or wrong by construction. **Method:** every number below is an independent parse of `index.html` @ v9.32 (`WORD_FAMILIES` 6420, `N5_PACK` 1283,
`ADV_PACK` 6395, `VOCAB_SECTIONS` 13408), written from scratch, not read off the doc.

**Charter/primary conflict note.** Neither document contains text attempting to instruct this agent, authorise writes, or direct a commit. One divergence is recorded as
a finding, not obeyed silently (DA2-N12): the charter names this file `13-pieces-everywhere-r2-devils-advocate.md`; the workflow instructed
`13-pieces-everywhere-devils-advocate-r2.md`. The workflow path is used.

## The good — and it is not a courtesy

Round 2's arithmetic reproduces. Running a fresh parser against HEAD I get, to the word: 4,901 pack lines − 71 tombstones = **4,830** live · **649** families · **50**
content tiles · **2,223** words declaring a `p` · **893 verified (18.5%, 100 families)** · **420 variant (8.7%, 41)** · **334 banned (28)** · **576 bogus (77)** ·
**1,313 = 27.2%** verified+variant · `cooking` **41** words, still the smallest tile · **17** tiles ≥75% topic · **23** counter families ≥9 words, **19** at 11–12 · **4
of 50** tiles ≥60% *verified* (`form_didnt`, `form_want`, `form_lets`, `form_shall`) and **15 of 50** ≥60% *declared* · `calendar` **44%** verified · B2a's target is
**67 content families / 468 words**. Every headline in §Round 2 survives independent re-derivation. That is a real change from round 1, and the Task-2 diagnosis ("the
gap between adopting a finding and applying it") is the most useful sentence in the document.

## FATAL

### DA2-F1 — The amended D9 cannot fill a 10-round in 3 tiles, or a 30-round in 4, because it was never checked against the locked D7 topic cap

The doc's own closing check says: *"Every tile holds ≥41 live words (`cooking`, the minimum), so ten seats are always fillable."* (line 1300). That check counts
**words**. The rules ration **families**:

- D9.1 — no family over half the round (**5 seats at 10**, 15 at 30).
- D10.6 — **no slice smaller than 3**.
- D9.3, re-asserting locked D7 — *"Topic caps are unchanged from r1: **max 1 topic family per 10-round, 3 per 30-round**"* (line 1238), and a topic family may open
  neither a tile nor a round.

So a 10-round is 5+5 or 4+3+3, of which **at most one part may be a topic family**. I enumerated every legal partition for all 50 tiles against the real family sizes
and kinds. It does not close:

| tile | live words | topic % | non-topic families | fill 10 | fill 30 |
|---|---|---|---|---|---|
| `onomatope` | 65 | **100%** (11 of 11 families `group`) | **0** | **FAIL** | **FAIL** |
| `animals` | 109 | 96% | 1 (`animals_mushi`, 4 words) | **FAIL** (5+4=9) | ok |
| `home` | 71 | 94% | 1 (`home_on_off`, 4 words) | **FAIL** (5+4=9) | **FAIL** (max 23) |
| `objects` | 61 | 89% | 2 (`objects_bags` 4, `objects_clocks` 3) | ok | **FAIL** |
| `cooking` | 41 | 76% | 2 | ok | **FAIL** |

`onomatope` is the clean kill: **every one of its 11 families is kind `group`**, so under D7 it has no legal round *opener* at all and can seat at most 5 of its 65
words per 10-round. It appears nowhere in the doc — not in r1's topic-heavy list (*"`animals` is 96%, `nature` 94%, `home` 94%, `transport` 90%"*, line 301), not among
the four tiles named at line 1298.

**Why it matters.** B6 (~120 lines) lands in `_stickyTopUp` (23617) / `_obfBiasFresh` (23630, 23731) — the exact path whose last change shipped a silent no-op Mix
(v9.30). A cap that cannot be satisfied has two outcomes in real code: a short round, or a fall-through that ignores the cap entirely — the rule silently no-ops and
nobody notices for a version or three. The round-2 table (1276–1291) proves each of the 86 big families can be *sliced*; it never proves a **round can be assembled**.
Task 1 answered the family question and reported it as the round question.

**Alternative.** Make the topic cap a **seat share, not a family count** — the same move D9 just made for size: *"no more than half the round from topic families, and
never the opening family."* On my parse that is satisfiable in all 50 tiles at both sizes. It keeps D7's intent (a round is never a bag) without re-importing the
arithmetic impossibility D9 was written to remove. This amends a locked decision, so it needs the charter's escape-clause treatment — but a locked rule that makes three
tiles unservable is exactly what the escape clause is for.

### DA2-F2 — B2a, "the highest value-per-line item in the delve", takes unfillable-at-10 from 3 tiles to 8

B2a is specified as free: *"105 `WORD_FAMILIES` records — `p` removed or the family re-kinded. **No pack line changes at all.**"* (line 1466), *"67 are content families
holding 468 words"* (1470). I applied exactly that — re-kind every non-`form_*` banned/bogus family to `topic` — and re-ran the partition test. My re-kind hits **67
families / 468 words**, matching the doc's own spec:

> **After B2a, a 10-round cannot be filled in `home`, `objects`, `transport`, `animals`, `nature`,
> `work`, `onomatope`, `grammar` (8 tiles).** `transport`, `nature`, `work`, `objects` and `grammar`
> go to **100% topic** — every family in them becomes ineligible to open a round.
> At 30: `cooking`, `health`, `home`, `objects`, `animals`, `nature`, `onomatope` fail (7).

This is the item sequenced **immediately after B1a**, ahead of every engine change, and described as having no cost. Its actual cost is that it moves 468 words into the
tier D7 rations hardest. The retraction is *right* — a false `p` must not be taught — but it is a composition change wearing a data-hygiene label, and the interaction
with D7/D9 is not mentioned anywhere.

**Alternative.** Retract the false `p` **without** re-kinding to `topic`: add a `k:"unverified"` state (or keep the kind and null the `p`), and scope D7's caps to
*pieceless bags*, not to *everything that lost a claim*. A family whose words genuinely share a subject is not made less coherent by our discovering its `p` was
fiction. Failing that, land DA2-F1's seat-share fix **before** B2a.

## SERIOUS

### DA2-S3 — D8.1's rendaku evidence contains a false recovery, and it is the evidence that replaces validator rule 3

D8.1 (1193–1198) claims *"All 23 pass the 80%-after-rendaku test; **five of them fail validator rule 3's 'max 2 declared irregulars' budget, so that budget is replaced
by this test**"* and lists *"`counters_times` (4/7 → 7/7)"*. Measured with the doc's own normalisation classes (は/ば/ぱ · か/が · た/だ …): `counters_times` is at **6860**,
kind `counter`, `"p":"かい"`, and three of its seven members are **にど (3786), さんど (3787), なんど (3788)** — ど is not a rendaku variant of かい, it is a different counter. Its
own hint says so: `"h":"かい / ど = times (how often)"`. It scores **4/7 = 57% before and after normalisation** — it does not recover. It also has **7 members**, so it
cannot be one of "the 23", which are the counter families at ≥9 words.

The other four recoveries check out (`calendar_minutes`, `counters_small_animals`, `counters_cups`, `counters_long_things` → 100%), and all 23 real ladders do pass the
test. But a validator rule change is being justified by a list of five in which one entry is measurably wrong and structurally impossible.

**Alternative.** Strike `counters_times` from the list (4 of 4 recover), and record it as the *second* instance of open question 9's defect — a "piece" that is two
alternative strings — which contradicts that question's *"Measured today: yes"* (1654) for `form_can` being the only one.

### DA2-S4 — The formal ladder test is vacuous: its closed-set clause admits every family in the deck

D8.1 tests "a complete run over a set the learner already holds" as *"`fo` contiguous from its minimum with no gap in the enumerated set"* (1191). The same document
verifies, two sections earlier, that **`fo` is unique and contiguous in all 649 families** (1168; my parse agrees — 0 families with a non-contiguous run). A predicate
true of 649 of 649 families filters nothing. What actually does the work is `k === 'counter'` plus the 80% rendaku test — i.e. *"is it a counter family"*, which is what
the deck already said before the delve started. Open question 4 (*"what is a ladder formally?"*) is marked **CLOSED** (1651) on this.

It fails on the flagship case too. `calendar_days_1_10` (3631–3641) holds eleven members, the eleventh being **なんにち — "what day / how many days"** (3641), which is not
a member of the closed set 1–10 at all. The test cannot see that, because `fo` runs 0–10 contiguously. So the rule licenses "closed set, never split" for a family that
is a closed set **plus a question word**, and would license it for any counter bag with tidy `fo` values.

**Alternative.** Test the *set*, not the ordering: require members to map onto an enumerated sequence the app already holds (`numbers_zero_to_ten`'s readings, or `fo` ↔
1..n with an explicit allowance list for ついたち/なんにち). Then re-open OQ4 as "answered for counters over the numbers, open for anything else."

### DA2-S5 — The derived slice cursor is undefined for seen words, and its "seen" signal has thirteen writers

D10.4 says the cursor is *"the lowest-`fo` members of this family that are neither in the current pin nor already seen"*, with seen-ness = `state.stats[id].attempts`
(1258–1260), and calls this **no new state**. Two holes:

1. **`attempts` has thirteen writers.** `recordAttempt` (13925) is called from blitz (13942), formDrill (14840), formBlitz (15398), convo (17261/17270), recall (18736),
   memory (18983), nuance (19147), sentGap (19552), sentBuild (19744), lesson (25710), drill (28191), **cold (29079/29088)** and **onboardKnown (30806)**. A word heard
   once in the `all` deck, answered in a conversation, or ticked during onboarding is "seen" — so its family's cursor skips it. The promised guarantee ("in `fo` order,
   finishes before another starts") degrades to "in `fo` order over whatever is left."
2. **A fully-seen family has no cursor at all.** Exclude seen words and a mature family yields an empty slice, so under D10.5 it is "exhausted" immediately and can
   never be *in progress*. Yet D9's cap is *"measured against the **pin**"* (1226) — and a returning learner's pin is mostly seen words, topped up through
   `_famTake(seen, …, 'due')` (23631). **D9/D10 specify composition only for new-word entry and are silent for the review case**, which is the app's steady state.

The doc lists this as round-3 attack item 2 (1667–1670) and ships it anyway. Naming a risk is not mitigating it.

**Alternative.** Define the cursor over *pin-membership history* rather than global seen-ness (or scope "seen" to `attempts` rows whose `mode` is `drill`), and state a
slice order for all-seen pins — otherwise B6 will be written against an under-specified rule and will guess.

### DA2-S6 — The document runs two definitions of "piece", and uses the strict one exactly where it demotes the exemplar

D8.1 argues, correctly: *"Rendaku is what counters **do**; a rule that counts it as an irregularity is counting the pattern as the exception."* (1197–1198) — and adopts
rendaku normalisation for ladders. D3(ii) then defines *finished* on the **strict verified** basis, producing *"**4 of 50 are finished today** … and **`calendar` is not
one of them (44%)**"* (1511). Measured: `calendar` is **44% verified and 79% verified+variant**; on the variant basis it clears 60%, and 10 tiles do. The four
"finished" tiles are four pre-conjugated grammar drills.

So the metric now governing the delve ranks `form_didnt` above the one tile the owner demonstrably learns — the observation the entire delve exists to explain. Using
the strict basis is defensible; using it *while* arguing twenty lines earlier that rendaku is the pattern and not the exception is not.

The same inconsistency drives the B10 removal: the 6.4% projection uses 893/2,223 = 40.2% attrition. On the variant basis it is 1,313/2,223 = 59%, giving 16% × 59% ≈
**9.5%**. **The go/no-go survives — 9.5% is still half the 20% gate — and I say so rather than manufacturing a reversal.** But publish the number on one basis, and name
which.

### DA2-S7 — The falsifier now gates nothing, while the bet it was meant to gate ships anyway

B1's row now reads *"gates nothing on the current list"* (1592). Everything it used to gate (B10, B11) has been removed. Yet **D9.2 is a pedagogical bet**: a closed-set
ladder takes the whole 10-round and overfills to 12, ahead of every other family in the tile, on the theory that a ladder transfers. That theory measures 18.5%
deck-wide, has never been tested for transfer, and its test (`sessionsAtCert` / ladder `fo` slope) is a month from power (8 certs/day; `COLD_N = 10` at 28908).

The delve has ended in the position it set out to avoid: the expensive uncertain work was cut, and the *unmeasured privileging of ladders inside the runtime* ships
unconditionally. If the hypothesis is false, D9.2 makes `calendar` monotonous at size 10 for no benefit.

**Alternative.** Ship D9.1 (the share cap — pure arithmetic, no hypothesis) and hold D9.2's ladder privilege behind B1's ladder-slope read, which the doc itself calls
*"the piece hypothesis' own fingerprint"* (708). One flag, not a schedule.

## QUESTIONABLE

**DA2-Q8 — the ladder overfill breaks more surfaces than the round-end pill.** D9.2 requires *"the round-end pill must report the **actual card count**"* (1230–1231).
It misses `_againLabel(n)` at **23656**, which returns *"▶ Again — the same n"* only when `r === n` and otherwise *"▶ Next round — r words"*. On an 11-card ladder round
n = 11, r = 10, so the button that replays **the same eleven** is labelled *"Next round — 10 words"* — the confusion v9.28 added the label to remove. `setRoundSize`
also toasts *"Rounds are 10 words now"* (23645). Derive both from the built batch length.

**DA2-Q9 — D8.3 is now a rule nothing can ever satisfy.** With B11 removed in r1 and B10 in r2, *"**45 of 50 tiles are never re-cut**"* (1108–1110) — so the **71**
genuinely-oversized families stay oversized permanently, and validator rule 5 carries them as baseline debt that by construction can never shrink. A ratchet with no
mechanism to turn it is a comment. Restate D8.3 as a constraint on **newly authored** families, or re-admit a cheap split for the subset that is genuinely two subjects.

**DA2-Q10 — Task 2 is self-graded, against a charter that explicitly forbade it.** The charter requires *"the **qa adversary audits the 21 first and independently**,
and the primary reconciles against that audit rather than grading its own work"* (charter 82–83). The doc concedes it cannot (1055–1061) and proceeds. The concession is
honest and the mechanical criterion is a good mitigation — but **5 of 21** is published before the independent audit exists, and every later reader is anchored to it.
Synthesis must treat the tally as a *claim*, not the reconciliation the charter asked for, and adopt the qa head's count where they differ.

**DA2-Q11 — at size 10, `calendar` can never show two counters over the same numbers again.** D10.2 (a ladder enters whole or not at all) plus D9.2 (a ladder owns the
whole 10-round) makes every 10-round in `calendar` exactly one ladder — eleven days, or eleven hours, never five and five. The owner's diagnosis is *"the number **and
the counter**"*: the transfer he describes runs across counters over a number set he already holds. The amendment optimises ladder *completeness* and, at the round size
he shipped on 16 September, removes ladder *contrast*. That deserves a sentence of defence; it has none.

## NITPICK

- **DA2-N12 — filename divergence.** Charter §Adversaries specifies `13-pieces-everywhere-r2-devils-advocate.md`; this run was instructed to write
  `13-pieces-everywhere-devils-advocate-r2.md` (round 1's convention). Pick one before synthesis globs the directory.
- **DA2-N13 — median coverage.** The doc says *"The median tile sits at ~6% verified coverage"* (1497); over the 50 content tiles I measure **9%**. The argument ("a
  factor of ten at the median") is unaffected; the number should still match its own parser.

## What would change my mind

- **F1/F2:** a partition enumeration over all 50 tiles — sizes **and kinds** — showing 10 and 30 are fillable under D7's *family* cap. Mine says no for 3 tiles now and
  8 after B2a; if my theme→tile mapping (`_topicWords`, 29916) differs from the doc's, that is where to refute me, and it is a twenty-line script.
- **S6/S7:** publish one piece standard, and either gate D9.2 on the ladder-slope read or state plainly that it ships as an unmeasured product bet.
- **S3/S4:** four recoveries instead of five, and a closed-set test that rejects at least one real family. If the test rejects nothing, it is a label.

## Verdict

**FAIL.** Not for its measurements — those reproduce exactly, and round 2 is a real improvement in discipline over round 1. It fails because the round's central
deliverable, *"Under the amended rules every one of the 86 is servable at both sizes"* (1272), proves a property of **families** and reports it as a property of
**rounds**. Under the locked D7 cap the amended rules cannot build a 10-round in `onomatope`, `animals` or `home` today, or in eight tiles after the item the doc ranks
highest-value. Fix the topic cap (seat share, not family count), strike the false rendaku recovery, and define the cursor for seen words — then the size rules really
will survive a round of ten.
