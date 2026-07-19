# Delve 8 - Adversary: code-reviewer

> Audits `docs/delve-cycles/8-sensei-vocab.md` (committed 4c04f825) against
> `index.html` v8.25 source. Lens: schema/latency cost, lock-touch enumeration
> completeness, recap-teach storage safety, migration correctness.

No prompt-injection content found in the primary doc or the charter
(`docs/delve-cycles/8-charter.md`) -- both read as inert data throughout.

**Method note:** every citation below was checked against the actual line
content in `index.html` (v8.25, `APP_VERSION` confirmed at 680). The primary
doc's citation discipline is unusually strong -- dozens of spot-checked line
numbers (685, 2535, 2789, 3335, 3369/3371, 6777, 9414, 9429, 9492, 9654,
9662, 9666, 9669-9671, 9684-9689, 9838-9839, 10085-10087, 10148, 10179-10181,
10200, 10254, 11176, 11192/11218, 15556, 20737) matched source exactly or
within one line. Two citations in the one table this review was specifically
asked to verify did not, and one design claim is internally contradicted by
the code it cites. Findings below focus on those.

---

## FATAL

### F1 -- "Speaking a locked word unlocks it" is not implemented by the code the doc cites, and no stage adds it

Section 3.3 bullet 1 / Lock L3 states, as the **non-exceptional, structural**
answer to the lock-frustration attack: *"speaking a locked word writes an
attempt -> the word is now started -> unlocked. **Using a word IS unlocking
it.**"*

This does not hold against the actual write path. `convoApplyScore`
(`index.html:10148`) resolves `judged.usedWords` **only against `cv.pool`**:

```
const pool = (cv && cv.pool) || [];
...
const directMatch = pool.find(w => w.id === raw);
```
(`index.html:10151`, `10160`) -- both the direct-id match and the
kana-normalized fallback match search `pool`, never `state.words` /
`getActiveWords()`. `cv.pool` is the ~8-word WORD_POOL seeded at
`index.html:9839` (`_buildSpamPick(getActiveWords(), 8)`) -- under the lock
this is *already* the unlocked deck (per the doc's own section 3.4 table
row). Worse, the model is structurally incapable of reporting an off-pool
word at all: the six-key contract's own instruction at `index.html:9412`
reads *"wordId of **each pool word** the learner used"* -- the model is
never given an id for any word outside WORD_POOL/FREE_SET, so it cannot
name a locked word in `usedWords` even if it wanted to.

Net effect: a learner who spontaneously **speaks** an off-pool/locked word
mid-conversation -- the scenario the charter's own attacks flag as the #1
store-review complaint genre, and the one FOLLOW THE LEARNER exists to
protect -- gets **no attempt written, no unlock**, contradicting the doc's
explicit claim. Only bullets 2 (browse tap-to-add) and 3 (selector widening
ladder, which only fires for structured drill pools, not live speech) of
the three-part "no refusal path" argument actually function. The
Implementation sketch (section 6, Stage S3) lists changes to
`getActiveWords()`, `buildGenerateVocabSpamLesson`, browse/search, the
meter, and Settings -- it never lists the change actually required here
(widening `convoApplyScore`'s resolution scope from `cv.pool` to the full
active/locked deck, and widening the model contract to let it name off-pool
usage). This is a Definition-of-Done item ("Vocab lock answers the
lock-frustration / FOLLOW-THE-LEARNER contradiction explicitly") that the
cited code does not actually satisfy for its most-cited case.

**Severity:** FATAL for L3 bullet 1 as written ("not by exception") -- the
overall lock design survives (bullets 2/3 + the frontier itself), but the
doc's specific, load-bearing claim about spoken off-pool words is false
against the code it cites, and the staged implementation sketch does not
fix it.

**Citation:** `index.html:10148-10151` (`convoApplyScore`, `pool` scoping),
`index.html:9412` (judged.usedWords contract line), `index.html:9839`
(`_buildSpamPick(getActiveWords(), 8)`).

---

## SERIOUS

### S1 -- Coverage-meter "unlocked / total" framing is unreachable with the single-choke-point design as specified

Section 3.3 leads with the commercial framing example *"214 unlocked . 1,702
on the road"* and section 3.4's Coverage-meter row says the re-label is
"same `vocabAccessStats`-style derivation." But `vocabAccessStats()`
(`index.html:6777`) computes:
```
const active = getActiveWords();
...
return { mastered, started, total: active.length };
```
(`index.html:6791`). The lock filter is specified to live **inside**
`getActiveWords()` itself (section 3.4: *"One filter, added inside
`getActiveWords()` behind the `vocabLock` setting"*). Under lock,
`getActiveWords()` returns only the unlocked subset, so `total` becomes the
**unlocked count**, not 1,702 -- the meter as literally re-labelled would
read "N unlocked of N" (100% immediately), not the aspirational "214 of
1,702" the doc's own headline example promises. Delivering the promised
framing requires a second, un-gated total (e.g. `state.words.length`-derived)
that bypasses the very filter the lock just added -- a real structural
addition, not the "one filter, no selector rewiring" the doc claims for this
consumer. Section 6 Stage S3 lists this as "re-label to `unlocked / total`,
fill = started" with no mention of the extra un-gated-total plumbing
actually needed.

**Citation:** `index.html:6777` (`function vocabAccessStats(){`),
`index.html:6791` (`return { mastered, started, total: active.length };`).

### S2 -- Table citation "Random Drill | raw getActiveWords() (15107 region)" does not verify

Section 3.4's enumeration table is explicitly billed as "the whole surface,
enumerated" and is exactly what this review's charter prompt #2 asks to
check. `index.html:15107` is inside unrelated Build Mode cycle-composition
code (similar-words/form-drill cycle assembly), not Random Drill. The
actual `startRandomDrill` function is at `index.html:15606`, and its
`getActiveWords()` call is at `index.html:15630`
(`pool = getActiveWords().filter(w => !suspendedSet.has(w.id) && !masteredSet.has(w.id) && _isVocabDrillSurface(w));`).
The underlying claim (Random Drill routes through `getActiveWords()`, hence
inherits the lock) is correct -- but the citation supporting it is wrong by
roughly 500 lines, which matters precisely because this table is the
artifact meant to prove exhaustive, verifiable coverage.

**Citation:** primary doc section 3.4 table row "Random Drill ... (15107
region)"; actual site `index.html:15630`.

### S3 -- Table citation "Forms / particles / other drills ... independent scopes (7141, 7205) ... untouched in v1" does not verify

`index.html:7141` is `function blitzCounts(){` -- Vocab Blitz's due-count
helper, which itself calls `vocabSectionFilter(getActiveWords())` a couple
lines later (`index.html:7155-7156`) and therefore **would** inherit the
lock, which is the opposite of "untouched." `index.html:7205` falls inside
an unrelated priority-queue loop over focus words (word selection for
Blitz/spam sessions), not any particle- or form-drill code. The real
form-drill entry point is `startFormDrill` at `index.html:8230`; no
dedicated particle-drill start function was found near either cited line.
The "untouched in v1" claim itself may still be true for the real
form-drill code path (not independently confirmed either way here), but it
is not demonstrated by the lines cited, in the one table whose entire job
is to be checkable.

**Citation:** primary doc section 3.4 table row "Forms / particles / other
drills ... (7141, 7205)"; actual content at those lines is `blitzCounts()`
and an unrelated focus-word loop; real form-drill entry is
`index.html:8230`.

---

## QUESTIONABLE

### Q1 -- Latency/token cost estimates stated with more confidence than their basis supports

Section 4.2's "Cost sizing (the latency attack, pre-answered)" gives
specific figures (+~70 input tokens, +30-40 output tokens, +0.2-0.4s RTT)
with no cited measurement, token-counter run, or historical latency sample
backing the arithmetic -- it reads as a plausible back-of-envelope estimate
labelled as if pre-validated ("pre-answered"). This is exactly the
charter's audit item #1 ("token + latency cost ... on the 2-6s
no-streaming round trip"), so the estimate not being grounded in an actual
measurement is a gap worth naming, even though the ADR-009 RTT budget it's
checked against (`docs/decisions/ADR-009-judgment-free-interaction-spec.md:19`,
"<=3.5s target / 5s max") is itself correctly cited.

**Citation:** primary doc section 4.2, "Cost sizing" paragraph; no source
citation given for the token/latency numbers themselves.

---

## What checked out cleanly (not re-litigated)

`_convoPreamble`/`_convoNormFeedback`/`convoTurn`/`convoEnd`/
`_renderConvoRecap` line citations were spot-checked extensively and
matched source precisely (often to the exact line, e.g. 9839, 10085-10087,
10179-10181, 10254, 15556, 3335). The `esc()` discipline claimed for
recap/peek rendering is real and consistent in the current code
(`index.html:11069-11082`, `11176-11244`). The echo-guard
abstain-vs-match distinction the teach-gate (section 4.3) is built on is a
faithful reading of `_convoNormFeedback`'s actual branches
(`index.html:9642`, `9684-9689`). No prompt-injection content was found in
the primary doc or charter.

---

## Verdict

**FAIL** -- one FATAL: the doc's flagship, "not by exception" answer to the
lock-frustration/FOLLOW-THE-LEARNER attack (spoken off-pool words unlock on
use) is not supported by the `convoApplyScore` code it cites, and the
staged implementation sketch never adds the fix. Combined with a real
internal contradiction in the coverage-meter framing (S1) and two
unverifiable citations inside the one table this review's charter
specifically asked to check (S2, S3), the vocab-lock section (section 3)
needs a revision pass before its locks (L1-L5) can be treated as
implementation-ready, even though the sensei-layer section (section 4) and
most of the doc's citation work is unusually solid.
