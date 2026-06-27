# Delve 2 — QA / Test-Design Adversary
**Primary doc:** `docs/delve-cycles/2-progressive-vocab.md`
**Lens:** Are acceptance criteria testable? Are regressions covered? Are verification checks sound and non-hallucinated?
**Verdict:** FAIL

---

## F-1 (FATAL) — `modulesEnabled` defaults to `false`; the feature ships broken for every user

**Source:** `index.html` line 3002:
```
modulesEnabled:false,  // v7.69 — topics-first: guided unlock path OFF by default
```

The primary doc locks "day-one allocation = first module (~30 words)" (L3) and derives the entire vocab-meter formula from `activeModuleWordIdSet()`. But `activeModuleWordIdSet()` returns `null` when `modulesEnabled` is `false` (line 6817), and the meter's denominator formula (`set ? set.size : total`) then reads "1,809 of 1,809 unlocked" for everyone.

The spec adds only `vocabMeterEnabled: true` to DEFAULT_SETTINGS (§9) — it never flips `modulesEnabled`. Under the actual default state, the 30-word cold-start is impossible to observe, the 80% gate never fires, and "next +N" is never computed. The feature cannot be tested against its own locked contract.

**Required resolution:** the forge build must flip `modulesEnabled` to `true` for new users (or define an explicit opt-in onboarding trigger), and the migration must handle existing users who have `modulesEnabled: false` stored. The spec is silent on both.

---

## F-2 (SERIOUS) — Vocab Spam mode never routes through `getDrillableWords()`; locked words leak

**Source:** `index.html` lines 15034–15038 (`buildGenerateVocabSpamLesson`):
```js
const tries = [
  () => vocabSectionFilter(getActiveWords()).filter(w => ...),
  () => vocabSectionFilter(getActiveWords()).filter(w => ...),
  () => getActiveWords().filter(w => ...),
  () => getActiveWords().filter(w => ...)
];
```

All four fallback levels call `getActiveWords()`, not `getDrillableWords()`. For the `'all'` section (default), `vocabSectionFilter` passes through all active words (`if(!sec.themes) return words;` at line 6993), so `activeModuleWordIdSet()` is never consulted. The module gate does not apply to Vocab Spam.

The spec's §9 explicitly says: _"Confirm... that all hands-free spam-loop / Recall / Nuance / Forms / Memory selectors route through `getDrillableWords()`."_ This verification would fail immediately on Vocab Spam. The spec does not resolve the tension between §6's statement ("composition surfaces intentionally draw from `getActiveWords()` without module gating") and §9's obligation for spam-loop.

**Testable gap:** a brand-new user (30 words unlocked) starting a Vocab Spam session in the `'all'` section will receive cards from all 1,809 words. No acceptance criterion distinguishes "intended bypass" from "regression."

---

## F-3 (SERIOUS) — `startRandomDrill` is explicitly documented to ignore module gating; spec omits it

**Source:** `index.html` lines 15081–15083 (source comment):
```
/* Random Drill — ignores section + module gating, pulls 30 random words from
   the entire active deck and runs them as Build Mode Spam ... The "I just want
   a hands-free shuffle" entry point. */
```
Line 15108: `pool = getActiveWords().filter(w => ...)` — no `activeModuleWordIdSet()` check.

Random Drill is an explicit hands-free mode that bypasses gating by documented design. The primary doc never mentions Random Drill in the per-mode leak audit (§9 lists "spam-loop / Recall / Nuance / Forms / Memory" without naming Random Drill). There is no acceptance criterion for whether locked-word exposure in Random Drill is acceptable or requires a fix.

---

## F-4 (SERIOUS) — Function name discrepancy: `maybeUnlockNext()` vs. `modulesMaybeUnlockNext()`

**Primary doc §1 citation:** _"`maybeUnlockNext()` path (6852–6860): when current module ≥ 80%, pushes next into `unlockedModules`."_

**Source:** `index.html` line 6848:
```js
function modulesMaybeUnlockNext(){
```

The function does not exist as `maybeUnlockNext()`. A forge build that hooks or calls `maybeUnlockNext()` to fire the unlock toast (as implied by §7's "mirror the existing module-unlock toast") will get a runtime error. The cited line range (6852–6860) is close to the actual body of `modulesMaybeUnlockNext()` but names a non-existent function. Any test verifying the unlock celebration event will need to know the real name.

---

## F-5 (SERIOUS) — `blitzCounts()` home-screen "unseen" bypasses module gating; meter and CTA subtitle will contradict

**Source:** `index.html` lines 7187–7199 (`blitzCounts`):
```js
const active = vocabSectionFilter(getActiveWords());
...
if(!st || !st.attempts?.length){ unseen++; continue; }
```

`blitzCounts` uses `getActiveWords()` without module gating. On day-one with 30 words unlocked, the home CTA subtitle will show "1,779 unseen · 0 due" while the new meter shows "30 of 1,809 unlocked." These numbers are technically consistent (there ARE 1,779 unseen words) but will read as contradictory to a beginner: "I only have 30 words but the app says 1,779 are waiting?" The spec adds the "X of Y" meter but never reconciles it with the pre-existing `blitzCounts` display. No acceptance criterion covers this pairing.

---

## F-6 (QUESTIONABLE) — `vocabAccessStats()` sketch has an unimplemented `next` field

**Primary doc §9 citation:**
```js
const next  = /* next locked module in orderedModules() after cur, or null */;
```

The "+N words" part of the home surface (`"next +156"`) depends entirely on `next` and `nextCount`. The spec provides a comment stub rather than an implementation. The forge build will need to derive this independently — creating a divergence risk where the implementation finds `next` differently from the intended behaviour (e.g. skipping hidden modules, handling the last module, handling bypassed modules). No test spec exists for edge cases: next when all modules are unlocked, next when current module is not the highest-numbered, next when a module is hidden.

---

## F-7 (QUESTIONABLE) — Open Question Q2 (denominator) is unresolved; meter is not lockably testable

**Primary doc §11:** _"Q2 (meter denominator): Should 'Y total' be the full deck (~1,809) or only the user's active filtered pool? Recommendation: use the active-pool denominator — confirm with the user."_

Leaving this open means two valid implementations produce different meter readings. If a user filters to `activeThemes: ['food']`, does the meter show "30 of 156" (active pool) or "30 of 1,809" (full deck)? Without a locked answer, QA cannot write a passing test. The primary doc calls this a "recommendation" and defers to user confirmation, but it was not locked before the adversary panel was launched.

---

## F-8 (QUESTIONABLE) — No cold-start acceptance threshold defined; Q1 deferred without criteria

**Primary doc §5:** _"flag to QA whether the guided cold start should ship the first two modules unlocked (30 → 186) to give the spam loop enough variety."_

**Primary doc §11 Q1:** _"Is module 1 alone (~30 words) enough variety for the hands-free spam loop on day one?"_

No acceptance criterion is provided: no minimum unique-card count per session, no maximum repeat-rate threshold, no definition of "starvation." The anti-starvation fallback (two-module starter) is described as an option but is not locked. QA cannot write a passing or failing test for cold-start without a numeric boundary. This is the most user-visible edge state in the spec and has the least testable specification.

---

## F-9 (NITPICK) — Per-mode leak audit list is incomplete and non-enumerable

**Primary doc §9 citation:** _"Confirm (and add a regression note) that all hands-free spam-loop / Recall / Nuance / Forms / Memory selectors route through `getDrillableWords()`."_

"Nuance" and "Memory" are named but neither `startNuanceDrill` nor the Memory view (`renderMemory`, line 10562) is audited against source. `renderMemory` at line 10566 uses `getActiveWords()` but is a display function, not a drill selector. Without a complete enumeration of mode entry points and an explicit pass/fail for each, a regression note cannot be written. The spec should name each function under audit.

---

## Summary

The spec's fundamental flow (30 words day-one → progressive unlock → legible "X of Y" meter) is untestable as written because `modulesEnabled` defaults to `false` in the shipped source. Every acceptance criterion that assumes a gated starting allocation is void under the default. Beyond that structural gap, two named hands-free modes (Vocab Spam and Random Drill) provably bypass module gating, the unlock hook is named incorrectly, the home-screen "unseen" count contradicts the meter, the `next` field in the implementation sketch is a stub, and Q2 is unresolved. The spec needs the default-flip resolved and the per-mode leak status explicitly decided (intended bypass or regression) before any acceptance tests can be written.

**Verdict: FAIL**
