# Delve 13 — QA / test-design audit of `13-pieces-everywhere.md`

Adversary: qa (charter §Adversary 2). Read: primary doc (commit e1e0a015), charter
`13-charter.md`, and `index.html` @ v9.32 (source, not recalled) for every cited line
range and every data claim I could cheaply re-derive.

**Prompt-injection check:** neither the primary doc nor the charter contains text that
reads as an instruction to this agent (e.g. no "ignore previous instructions" / tool-use
directives). The primary doc's own "Charter conflict note" (lines 28–31) is a normal
editorial aside, not an injection. Nothing to report here.

**Data-integrity spot check (positive):** I independently re-parsed `WORD_FAMILIES`,
`N5_PACK`, `ADV_PACK` out of `index.html` (v9.32, confirmed at `APP_VERSION = '9.32'`,
line 1272) and reproduced the doc's headline numbers exactly: 649 families, kind
breakdown (group 341 / suffix 143 / pairs 56 / stem 52 / counter 26 / prefix 17 / frame 8
/ sound 6), 403 families with no `p`, 4,830 live words, 172 families over 8 words
(78 form / 94 content), the 76-ladder / 96-non-ladder split, mean family size 7.44, max
25 (`form_now_make`). None of the doc's quantitative claims I checked are hallucinated.
My findings below are about verification/test-design soundness, not data accuracy.

---

## Findings

### 1. [FATAL] The validator's own "never starves a 30-round" guarantee (rule 10) is not actually enforced by the stated rules
The primary doc's tile rule requires ≥30 live words per tile (§5 validator rule 6,
"`Verify no tile can starve` ... the validator must keep it that way (§5 rule 6)", §3E),
and separately legalises ladder families up to 12 words (D8, §3A: "ladder ... 9 / 12").
But `buildMixFamilies()` (index.html 25560–25603) drops a whole family per tap, then
tops up the vacated seats from `sectionPool` **excluding both the already-pinned words
and the just-dropped family** (`_notAvoided`, consumed in the pin-rebuild at
23716–23722). Algebraically: refill only succeeds if `tileSize − roundSize ≥
size-of-dropped-family`. With `roundSize=30` and a legal 12-word ladder, that requires
`tileSize ≥ 42` — but the validator's floor (§5 rule 6, quoted above) only requires
`tileSize ≥ 30`, twelve short. Rule 10's "round-composition simulation" (`_famTake`'s
grouping run 200×, quoted: "assert every build ... never returns fewer than the
requested words") only exercises a *single* build call — it never simulates the
post-Mix top-up path that actually manifests the shortfall. Today's data doesn't trip
this (I independently measured the smallest tile, `cooking`, at 41 live words with a
max family of 8 — safe margin), but nothing in the stated rule set (§5 items 1–10)
blocks a wave-1..4 agent from legally creating a 9–12-word ladder inside a tile near
the 30-word floor, which the validator would then *accept* even though it produces a
round that silently serves fewer than `roundSize` words after one Mix tap. This is
exactly the case charter Adversary-2 prompt #3 asks to find ("Can any tile end up
unable to fill a 30-round?") and the primary doc's answer ("All 50 tiles hold ≥30 live
words today ... so the 30-round is always fillable") conflates "fillable once" with
"fillable after every Mix," which are different guarantees.
**Citation:** primary doc §3E ("the validator must keep it that way (§5 rule 6)") and
§5 rule 6/10; `index.html:25560-25603` (`buildMixFamilies`), `index.html:23716-23722`.

### 2. [SERIOUS] Open Question 1 misdiagnoses the migration risk it hands to QA/code
The primary doc's Open Question 1 claims `_famAvoid`, `_mixOut`, `_autoSwapUndo` and
"every family-keyed grouping resolve through `_famKey` at read time," framing a user
"mid-Mix when the update lands" as needing a `FAM_ALIAS` migration path (also B9: "old
id → new id, applied to `_mixOut` / `_autoSwapUndo`"). I checked `save()`
(`index.html:7865-7899`), which lists every key actually persisted to `localStorage`
(`stats`, `streak`, `words`, `settings`, `notes`, `logs`, `askClaude`, `formStats`,
`kanaStats`, `sentenceStats`, `phraseStats`, `particleStats`, `variationStats`,
`similarStats`, `snapshots`, `convo`, `convoLog`). `state._mixOut`, `state._autoSwapUndo`
and `state._famAvoid` are **not in that list** — they are plain in-session JS
properties, set at `index.html:25582-25588` / `25532-25533`, read once and never
round-tripped through `save()`/load. They cannot survive a page reload at all, with or
without a re-cut, so "on next load" is not the risk surface for these three fields —
they simply don't exist on next load, re-cut or not. Worse, none of them are keyed by
family id in the first place: `_mixOut[key]`/`_famAvoid`/`_autoSwapUndo.batch` all
store **word ids** (from `batch`, itself a word-id array), not family ids — so a fam
re-cut doesn't invalidate them even within a session; `_famKey(w)` is recomputed live
from the word's current `fam` every call, there is no cached/stale family key anywhere
in these three fields. `stickyBatch` (word ids, genuinely persisted) is correctly
called safe by the doc; the doc should say the same about these three, not flag them as
"the single biggest unresolved risk" needing a design QA/code must still produce (B9).
This risks the actual build spending effort (B9, gated on Open Q1) solving a migration
problem for fields that don't need one, while under-specifying what (if anything) does
need one (e.g., `state._famPlays[key]`, a play counter also not persisted — same
non-issue, unaddressed).
**Citation:** primary doc "Open questions" item 1 (verbatim: "`_famAvoid`, `_mixOut`,
`_autoSwapUndo` and every family-keyed grouping resolve through `_famKey` at read
time"); `index.html:7865` (`function save(){`) through the persisted-key list ending
`index.html:7895`; `index.html:25582-25588`, `25532-25533`.

### 3. [QUESTIONABLE] The charter's explicit "free plan 3-new-words-a-day" combination is only half-answered
Charter Adversary-2 prompt #1 explicitly asks to "walk the proposed round composition
against the pinned batch, Again, Mix, Mix-twice, auto-swap and the free plan's
3-new-words-a-day cap — name every combination that breaks or starves." The primary
doc's §3D item 2 addresses only the **cap-violation** half ("The caps are checked
against the pin, not the padded session — otherwise a free-plan day would trip its own
rule"), not the **starvation** half: for a brand-new free-trial user on day 1,
`_freeTierCapPool` (index.html:10877 area) caps the fresh-word pool at
`FREE_NEW_WORDS_PER_DAY` before any family selection runs (`_buildSpamPick`'s first
line, `arr = _freeTierCapPool(arr);`), and the seen-word padding fallback
(`state.stats[w.id].attempts.length`) has nothing to pad with on day 1 either. So the
actual session shown can be far smaller than `roundSize` regardless of how many
families the *pin* logically contains — a case the new D7/D9 family-count-per-round
rules don't fix and the doc doesn't name as a combination to test, despite the charter
asking for exactly this. Not introduced by this delve, but the doc's acceptance
criteria/test list (B7, validator rule 10) doesn't cover it either, so "every
combination" is not actually walked.
**Citation:** primary doc §3D item 2 ("The caps are checked against the pin, not the
padded session"); `index.html:23549` (`arr = _freeTierCapPool(arr);` inside
`_buildSpamPick`).

### 4. [QUESTIONABLE] Dangling internal citation to a note that doesn't exist
§5's forbid-list item 5 reads: "Never add a new field to a pack line. (If a decision
seems to need one, it is the wrong decision — see the §6 note on `certHears`.)" I
searched §6 in full (lines 532–597) and the term `certHears` does not appear anywhere
in it, nor anywhere else in the primary doc, nor anywhere in `index.html` (confirmed
via `grep -n "certHears" index.html` — zero matches). This is a broken forward
reference in a FINAL, binding document; a reader (or the person building B9/validator)
following it finds nothing, and it's unclear whether a `certHears` field was considered
and cut, which matters given D16's blanket "no new field" claim.
**Citation:** primary doc line containing "see the §6 note on `certHears`" (§5 forbid
list, item 5).

### 5. [NITPICK] Two source citations are off by 3–5 lines
"`buildMixFamilies`' half-the-round target (`Math.ceil(batch.length / 2)`, 25575)" —
actual line is `index.html:25570`. "The `_mixOut` previous-mix memory, capped at a
third of the tile (25588)" — actual line is `index.html:25585`. Both are close enough
to locate by eye, but the doc's Method section stakes credibility on "measured off
`index.html`, not recalled," and other citations in the same doc (e.g. `APP_VERSION`
at 1272, `NAILED_HEARS`/`_famNailedKeys` at 25499) are exact — so these two read as
recalled-then-adjusted rather than freshly grepped.
**Citation:** primary doc §3E (the two parenthetical line numbers above);
`index.html:25570`, `index.html:25585`.

---

## Verdict

**WARN.**

The primary doc's *data* (family/word/tile counts, kind splits, the 76/96 ladder split)
is verifiably accurate — I independently reproduced every number I checked. The
concerns are in **test/verification design**: the validator that's supposed to gate
wave 1 (§5, "ships before wave 1 and runs on every merge") has a real, citable gap
between what it claims to guarantee (rule 10: "never returns fewer than the requested
words") and what its rules actually enforce (Finding 1), and the migration risk handed
explicitly to this lens (Open Question 1) is aimed at the wrong state fields (Finding
2), which could cost real engineering time solving a non-problem while leaving the
real one (Finding 3, and the true edge case in Finding 1) unaddressed by any proposed
test in B7/B4. None of these are data fabrications and none block the D1–D16 decisions
from being sound *as decisions* — but the build/verification plan built on top of them
(§5, B4, B7, B9) needs the gaps in Findings 1–3 closed before wave 1 ships, which is
why this is WARN rather than PASS.
