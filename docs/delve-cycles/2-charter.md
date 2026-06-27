# Delve 2 — Progressive Vocabulary Access for Isshin

## Domain

The user wants vocabulary to **unlock as you progress** — start with a beginner-sized slice of the deck, earn access to more over time, so the app paces content instead of dumping everything at once.

The user's load-bearing ask, verbatim:

> *"being able to unlock MORE content on the app, as in more WORDS. for example, we have like 10000 words as a number, but if you just started learning, you only have access to 1500 for example. and as you progress in the app, however we can track that, more things unlock."*

(The 10,000 figure is illustrative — the user confirmed: *"i meant 10000 as an example. i know we dont have that, nor do we need that many right now."*)

**Critical ground truth (verified in `index.html`) — this is NOT a greenfield mechanic:**
- **Deck size:** ~**1,809 words** total — **1,301 N5 · 488 N4 · 20 N3** (each `WORDS`/`N5_PACK` entry carries `jlpt`, `theme`, `pos`, `register`). N5_PACK starts at line 629; the N4 tier is appended at ~line 1919.
- **A progressive-unlock system ALREADY EXISTS** — `MODULES` (line 6650): **11 theme modules** (Greetings → Food & Numbers → Family → … → Feelings & Expressions, the last `catchAll:true`). You unlock the next module by reaching **`MODULE_UNLOCK_PCT = 80`** mastery on the current one (`moduleProgress(moduleId)` line 6759), with a **`MODULE_MIN_TO_UNLOCK = 5`** floor and an **"unlock anyway"** bypass (`unlockBypassed` setting). So content-gating-by-progress is real today — it is just framed as **theme modules**, not as a legible "X of Y words unlocked" meter.
- **The load-bearing seam:** `getActiveWords()` (line 3701) is the single pool **every** drill draws from (spam loop, Recall, Nuance, Forms, Memory, おしゃべり seed). Any unlock gate must filter *through* this without breaking the existing section/theme/POS/register filters.
- **A second progression meter just shipped:** おしゃべり conversation level `convoLevel`/`convoXp` (はじめて→じょうず) [[project_japanese_trainer_scope_decision]]. The module-% unlock and the conversation level are **two progress signals that already coexist** — a vocab-unlock meter would be a *third* unless deliberately unified.

So the real problem is **not "invent an unlock engine"** — it is **decide how progressive vocab access relates to the systems already here (theme modules, JLPT tiers, conversation level) without shipping a third overlapping progression bar**, and make it *legible*. Kana-only output invariant applies [[feedback_no_kanji]]; single-file vanilla-JS PWA, no backend; persistence under `state.settings` or own LS key (not bare `state.*`).

## Stacked REVISED callouts

None binding. Delve 1 (conversation mode) shipped `convoLevel`/`convoXp`; this delve must treat that as an existing progress signal to reconcile, not duplicate.

## Primary

**Mode:** Opus-only (design/decision/prose → an implementation-ready spec a later `/hydra-forge` builds).

### Investigation tasks

Each ends in a **final lock**, not a discussion.

1. **The core decision — extend, replace, or layer the existing module system? — LOCK one.** Given theme-modules + 80% unlock already exist:
   - **A — Reframe/extend modules** as THE vocab-access system (surface them as a legible "X of Y words" progression; possibly reorder/retune), no new gating axis.
   - **B — Add a JLPT-tier gate** (N5 → N4 → N3) as the primary axis, modules become a sub-grouping.
   - **C — Frequency/importance-ranked meter** (a single ordered list; "top N unlocked", N grows with progress), independent of theme.
   - **D — Hybrid** (e.g. JLPT tier as the coarse gate, modules within it).
   Lock one and state explicitly what happens to the current module-unlock behaviour (kept / retired / wrapped).

2. **Progress metric that unlocks the next batch — LOCK, and reconcile the meters.** What *earns* more vocab?
   - mastered-word count (SRS `state.stats`), module %, conversation level/XP, total XP, or a new dedicated counter.
   - The binding constraint: **ONE legible progress meter or a clear hierarchy** — decide whether vocab-unlock reuses an existing signal (module %, or convoLevel) or introduces its own, and how the user sees it without three competing bars. Lock the relationship.

3. **Starting allocation & step size — LOCK.** What does a brand-new user get on day one (which initial subset, chosen how — first module? all N5-greetings? a frequency floor?), how big is each subsequent unlock, and is there a hard cap vs unlock-to-end.

4. **`getActiveWords()` integration & backward-compat — LOCK (the load-bearing point).** Exactly how the locked/unlocked state filters the universal pool, layered with the existing section/theme/POS/register filters; and how a CURRENT user (who already has module progress + SRS history in localStorage) migrates without losing access or being suddenly re-locked. Define the data shape (where "unlocked-up-to" lives — `state.settings`).

5. **Legibility & anti-frustration UX — LOCK.** How "X of Y unlocked / next unlock at …" is surfaced (a vocab map/progress view? a line on home?), how a locked word the user *wants* is handled (the existing "unlock anyway" escape — keep/extend), and how an unlock moment is celebrated (mirror the module-unlock toast / conversation level-up).

6. **Deck-expansion scope — LOCK in or out.** Progressive access is only motivating if there's headroom to unlock. Decide: is sourcing/adding more words (beyond 1,809) **in scope for the build that follows**, or is this delve purely the *mechanic* (designed to scale as words are added later)? If out, say so and note the content task as a separate follow-up.

### Output

Primary doc: `docs/delve-cycles/2-progressive-vocab.md`

Sections (in order):
1. Charter — scope + ground truth (existing module/JLPT/getActiveWords/convoLevel systems)
2. Method — Opus-only + adversary panel + synthesis ownership
3. Core decision: extend/replace/layer modules (task 1)
4. Progress metric & meter reconciliation (task 2)
5. Starting allocation & step size (task 3)
6. getActiveWords integration & backward-compat/migration (task 4)
7. Legibility & anti-frustration UX (task 5)
8. Deck-expansion scope (task 6)
9. Implementation sketch — function names, `state.settings` shape, the `getActiveWords` filter hook, where it slots into `index.html`, migration step
10. Decisions reached (locks)
11. Open questions still open
12. Foundation doc updates
13. ADR proposals (framed; filed PENDING in synthesis)

## Adversaries

### Adversary 1: devils-advocate (LEAD)
**Read:** `docs/delve-cycles/2-progressive-vocab.md`, charter, the cited `index.html` anchors (MODULES, MODULE_UNLOCK_PCT, getActiveWords, convoLevel).
**Audit:**
1. **Redundancy attack:** the app ALREADY gates content by module at 80% mastery. Argue that the locked design is a *reskin* of what exists — or worse, a **third overlapping progression meter** (module % + convoLevel + vocab-unlock). Where does it duplicate rather than unify?
2. Does it actually pace a *beginner* well, or does it either starve them (too few words to have real conversations / drills feel repetitive) or unlock so fast the gate is meaningless?
3. Is gating words behind progress a net negative for THIS user (a motivated solo learner on his own app) vs just showing everything? Make the case to do nothing.
4. Does "as you progress … more unlocks" survive if the metric is gameable (e.g. unlock-by-sessions could be farmed)?
**Output:** `docs/delve-cycles/2-progressive-vocab-devils-advocate.md` — ≤400 lines, findings w/ file:line citations.

### Adversary 2: code-reviewer
**Read:** primary doc + `getActiveWords` (3701), `MODULES`/`moduleProgress` (6650/6759), DEFAULT_SETTINGS, save/load.
**Audit:**
1. Does the `getActiveWords()` filter integration fit cleanly (single-file vanilla JS), or does it tangle with the existing section/theme/POS/register filter stack? Performance over ~1,809 words on every drill draw.
2. Backward-compat: does the migration preserve a current user's module progress + SRS history? Any path where existing users get re-locked or lose access? New persistent state under `state.settings`/own LS key (not bare `state.*`).
3. Does it reuse the existing module/unlock machinery or silently reimplement it?
**Output:** `docs/delve-cycles/2-progressive-vocab-code-review.md` — ≤400 lines.

### Adversary 3: qa-tester
**Read:** primary doc.
**Audit:**
1. New-user cold start: day-one experience with the starting allocation — too small/large? Walk it.
2. Locked-content frustration: user wants a word/topic that's locked — clear path? Does "unlock anyway" cover it?
3. Edge states: nothing unlocked, everything unlocked (deck exhausted), an existing user mid-module on first load after the update, a user with zero SRS history.
4. Interaction with おしゃべり seed + Nuance + spam loop — do they only ever surface unlocked words? Any mode that leaks locked words?
**Output:** `docs/delve-cycles/2-progressive-vocab-qa-design.md` — ≤400 lines.

## Synthesis

`## Synthesis (Round 1 close — Delve 2)` appended to the primary doc. Verify every adversary citation against `index.html`; disposition each finding (adopt / contest / defer); lock the final design.
Foundation doc updates: reflect the vocab-access lock into project memory [[project_japanese_trainer_scope_decision]].
ADR proposals likely (filed PENDING under `docs/decisions-pending/`): "Progressive vocabulary access model & meter reconciliation", possibly "getActiveWords unlock-filter & migration contract".

## Definition of done
- [ ] Primary doc + all sections incl. an implementation sketch a forge run can build from
- [ ] Explicit decision on extend/replace/layer the existing module system
- [ ] Meter reconciliation (no third orphan progress bar)
- [ ] Backward-compat/migration defined
- [ ] 3 adversary docs filed
- [ ] Synthesis appended with citation verification
- [ ] ADR proposals filed pending
- [ ] User signoff

## Files this delve touches
- `docs/delve-cycles/2-progressive-vocab.md` (+ 3 adversary docs) — new
- `docs/decisions-pending/*` — new ADR proposals
- No `index.html` changes in this delve (design only; build is a later `/hydra-forge`)
