# Delve 8 Adversary — QA/Test-Design Audit

> Adversary 2 (qa-tester). Reads only the primary doc
> (`docs/delve-cycles/8-sensei-vocab.md`, commit `4c04f825`) per charter scope.
> Lens: are acceptance criteria testable, are regressions covered, are the
> proposed verification checks sound and non-hallucinated? Line/behavior
> citations below were cross-checked against the working-tree `index.html`
> the primary doc itself cites as ground truth (v8.25, `APP_VERSION` at 680).

**Prompt-injection scan:** no text resembling an instruction to this auditor
(e.g. "ignore previous instructions", "run git add") was found in the primary
doc or the charter. Nothing to report on that axis.

---

## Findings

### F1 (FATAL) — "Using a word IS unlocking it" is not supported by the cited mechanism

§3.3 point 1 states the lock's core no-refusal-path claim for conversation:
*"speaking a locked word writes an attempt → the word is now started →
unlocked. **Using a word IS unlocking it.**"* This is L3, called out as "the
acceptance-gate core" for the proposed ADR-012 (§10).

Tracing the actual pathway the doc itself cites (§1.3: *"SRS write path
(`convoApplyScore` 10148–10193 — conversation speech already writes
`recordAttempt`+`smGrade` on voice turns)"*):

- The model contract instructs `judged.usedWords` to list only **pool**
  words: `'"judged": {"usedWords": ["<wordId of each pool word the learner
  used>"], ...'` (index.html:9412, verified verbatim).
- `convoApplyScore` (index.html:10148–10193) resolves every `usedWords`
  entry **only against `cv.pool`** — both the direct-id match
  (`pool.find(w => w.id === raw)`) and the normalized-surface fallback
  (`pool.find(w => ... wNorm === w.jp normalized)`) search `pool`, never
  `state.words`/`getActiveWords()`. Anything that doesn't resolve is
  dropped silently ("Drop unresolved entries silently — never write stats
  for unknown ids").
- Under the lock design, `cv.pool` (WORD_POOL) is specced in §3.4 as
  *"due-first 8 from the unlocked deck"* — by construction it cannot
  contain a locked word.

So a learner who speaks a locked, off-pool word mid-conversation (the exact
「びょういん」 scenario §3.3 uses to sell the no-refusal-path claim) gets
**no `recordAttempt` written** via this pathway as currently coded — the
model isn't even asked to report it, and the resolver wouldn't match it if
it were reported. The implementation sketch (§6, Stage S3) touches
`getActiveWords()`, `buildGenerateVocabSpamLesson`, browse/search rows, the
coverage meter, and Settings — it never proposes changing `_convoPreamble`'s
`judged` contract or `convoApplyScore`'s pool-scoped resolution. A concrete
acceptance test ("say a locked word aloud in conversation; assert
`state.stats[wordId].attempts.length > 0` afterward") would **fail** against
the spec as written. This is the load-bearing invariant the doc names as the
ADR-012 acceptance-gate core, so it is FATAL rather than a nitpick — either
the mechanism needs a stated fix (extend `judged.usedWords`/`convoApplyScore`
to resolve against the full active-word registry, not just `cv.pool`), or
the "using = unlocking" claim needs to be scoped down to "browse tap-to-add
only" for the conversation surface, which is a materially weaker
lock-frustration answer than what §3.3/L3 currently promises.

**Citation:** `index.html:9412` (`"usedWords": ["<wordId of each pool word the learner used>"]`); `index.html:10148-10193` (`function convoApplyScore`, pool-only resolution + silent-drop comment); primary doc §3.3 point 1 ("Using a word IS unlocking it"), §7 L3.

---

### F2 (SERIOUS) — Teach-gate ladder has no deterministic fixture-test acceptance criterion, unlike the precedent it extends

ADR-011 (the standing acceptance-gate precedent this delve stacks on) requires,
as part of its numeric acceptance gate: *"A ≥12-case fixture set (malformed
feedback objects, score/type mismatches, kanji-heavy transcripts, garbled-STT
recast attempts) normalizes correctly in 100% of cases"* (ADR-011, Acceptance
gate). The Delve 8 teach-gate ladder (§4.3) is materially *more* complex than
what that fixture set covered — four rungs (teach / implicit-recast / clarify
/ none-confirm), a new `why` scrub + 160-char cap, and the positive-echo-match
requirement that additionally gates teach vs. implicit. Yet §4.8 ("Premature-
depth honesty") only extends the **keyed field probe** — two subjective
yes/no questions asked of the owner across an unspecified number of sessions
— with no equivalent deterministic fixture-test proposal for the teach
boundary itself (e.g., transcript truncated + confident `why` → must render
as `teach`, not silently downgrade; kanji-emptied transcript + confident
`why` → must cap at implicit tier; score 1 → `why` must never appear). Given
the doc positions itself as "an implementation-ready spec a later
`/hydra-forge` builds from" (charter Primary/Mode), this is a real gap between
what's claimed testable and what's actually specified as a test.

**Citation:** `docs/decisions-pending/ADR-011-corrective-feedback-layer.md` Acceptance-gate section ("≥12-case fixture set... 100%"); primary doc §4.3 (rung table), §4.8.

---

### F3 (SERIOUS) — §4.8's reversal-lever trigger is numerically underspecified

§4.8: *"the second failing twice triggers lever (2) automatically (mirror of
ADR-011's reversal discipline)."* ADR-011's own reversal discipline it claims
to mirror is explicit: *"Owner's keyed verdict across **≥3** of **5** keyed
sessions"* (ADR-011, Acceptance gate) — a stated numerator AND denominator.
Delve 8's "failing twice" states neither a session-count denominator nor a
time window, so as written it's ambiguous whether "twice" means twice out of
2, twice out of 5, or twice ever across the product's lifetime — each yields
a different (and untestable-as-stated) reversal behavior. This directly
undercuts the doc's own claim that the extension "mirrors" ADR-011's
discipline, since the thing that makes ADR-011's discipline testable (a fixed
ratio) is exactly what's missing here.

**Citation:** primary doc §4.8 ("the second failing twice triggers lever (2) automatically (mirror of ADR-011's reversal discipline)"); `docs/decisions-pending/ADR-011-corrective-feedback-layer.md` Acceptance-gate ("≥3 of 5 keyed sessions").

---

### F4 (QUESTIONABLE) — Citation imprecision in the "whole surface, enumerated" table

§3.4's consumer table states: *"Random Drill | raw `getActiveWords()` (15107
region)."* The actual `startRandomDrill()` call to `getActiveWords()` is at
`index.html:15630` (`pool = getActiveWords().filter(w => !suspendedSet.has(w.id) && !masteredSet.has(w.id) && _isVocabDrillSurface(w));`); line 15107 in the
current source is inside an unrelated form-drill-cycle assembly block, not
Random Drill. The underlying claim (Random Drill does call `getActiveWords()`
directly) checks out, but the table's stated purpose — proving no consumer is
missed, "precisely why this lock cannot reproduce the module-gate bug" — is a
precision claim, and a ~500-line-off citation in that specific table weakens
confidence that every row was re-verified at commit time rather than carried
from memory.

**Citation:** primary doc §3.4 table, "Random Drill" row ("15107 region"); actual site `index.html:15630`.

---

### F5 (QUESTIONABLE) — Charter's "walk a week of the teaching loop" audit item is not actually walked

The charter's QA-audit item 4 asks: *"Walk a week of the teaching loop — do
unlocks/recap-teachings feel like real progress or a grind?"* The primary doc
answers this only with a single-session narration (§5.4: "I said it → it
taught me → I drilled it → new words opened → we talked about more") and a
single-session "grind check" for the zero-teach/zero-unlock case (§5.3). No
scenario addresses the multi-session/longitudinal case the charter explicitly
asked for — in particular the eventual steady state once the frontier is
exhausted (all ~1,702 words unlocked): the recap's "+N words unlocked" line
and the meter's "X unlocked · Y on the road" framing (§3.3, §3.7 — "the number
that grows is 'words unlocked'") permanently stop advancing for a completionist
long-term user, silently removing one of the two progress axes the commercial
framing leans on, with no design note or test scenario for that end state.
OQ-6 acknowledges frontier ordering is unresolved but doesn't address this.

**Citation:** `docs/delve-cycles/8-charter.md` Adversary 2 audit item 4 ("Walk a week of the teaching loop"); primary doc §5.3 ("Grind check"), §5.4, §3.7 ("The number that grows is 'words unlocked'").

---

### F6 (QUESTIONABLE) — The lock-widening rung's mechanism is unspecified against `getActiveWords()`'s actual signature

§3.5 requires a new widening-ladder rung that "relax[es] `vocabLock` last,"
and treats the resulting invariant ("no drill surface can ever render fewer
words under the lock than `minViable`") as "acceptance-gate material." But
§3.4 also states the lock is "**One filter, added inside `getActiveWords()`**
... No selector rewiring, no second gate." `getActiveWords()` is called with
zero arguments at every current call site (`function getActiveWords(){`,
index.html:3564, confirmed across all ~30 call sites). To add a rung that can
draw words *without* the lock applied (needed to relax it "last"), something
must be able to call a pre-lock version of the word set — which requires
either a parameter on `getActiveWords()` (selector rewiring) or a second
accessor (a second gate), both explicitly disclaimed by §3.4. As written,
it's unclear how a test for the §3.5 invariant would even be constructed,
since the mechanism that would make the invariant true isn't specified.

**Citation:** primary doc §3.4 ("One filter, added inside `getActiveWords()`... No selector rewiring, no second gate"), §3.5 ("relax `vocabLock` last"); `index.html:3564` (`function getActiveWords(){` — zero-parameter signature, confirmed at all call sites).

---

### F7 (NITPICK) — Nervous-beginner validation relies on a single-user keyed probe, not a beginner cohort

Charter QA-audit item 1 asks whether any teach "feel[s] like being graded"
for a nervous beginner. The design (auto-opening teach card + spoken breath,
hard-defaulted ON at 「ともだち」) ships before any beginner-specific
validation; the only proposed check is §4.8's keyed field probe, which per
ADR-011's own precedent is the **owner's own sessions** (a single, experienced
user), not a naive-beginner test. This is a soft gap, not a design flaw — the
doc is explicit that the keyed probe is the field-validation step for this
whole layer (§4.8) — but "does this feel like grading to someone who has
never used the app" is a materially different question than "does the owner,
who wrote the judgment-free doctrine himself, feel judged," and the doc
doesn't flag that distinction.

**Citation:** `docs/delve-cycles/8-charter.md` Adversary 2 audit item 1; primary doc §4.7 (「ともだち」 default), §4.8 (keyed probe extension).

---

## Verdict

**WARN.**

F1 is a citation-grounded FATAL: the specific mechanism the doc names as the
acceptance-gate core for the vocab-lock's most important promise
(no-refusal-path via conversational use) does not do what §3.3/L3 claims when
traced through the actual code the doc itself cites, and the implementation
sketch never proposes the fix. F2/F3 are real acceptance-criteria gaps
relative to this repo's own established gate precedent (ADR-011). None of
these are fatal to the *idea* of the design — the rolling-frontier lock and
teach-card concepts are sound — but as an "implementation-ready spec," the
document overstates how testable/verified its core invariants currently are.
Recommend synthesis require: (a) an explicit fix or scope-down for F1 before
Stage S3 ships, (b) a fixture-test proposal alongside the keyed probe for the
teach ladder, (c) a numeric denominator for the §4.8 reversal lever.
