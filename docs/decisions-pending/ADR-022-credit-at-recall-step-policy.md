# ADR-022 — Credit at recall-step pass: exactly-once per-word session credit

- **Status:** Proposed (pending owner signoff)
- **Date:** 2026-08-06
- **Source:** Delve 11 — `docs/delve-cycles/11-drill-progress.md` §5 (as amended
  by the Round-1 synthesis: sentBuild included, duplicate-id guard specified,
  ships as its own step AFTER the ADR-021 display swap)
- **Related:** ADR-021 (the metric this feeds), ADR-023 (display retirement);
  preserves the v8.03 STT-never-grades lock and the v8.48 self-rating channel.

## Context

Word credit today is all-or-nothing at round completion (`buildOnComplete`):
an interrupted round earns zero. The core loop also never calls `updateStreak`
(verified: 7 call sites, none in Build Mode), and the v8.46/47 Sentences drills
(Fill-the-gap, Count-it, Make-a-sentence) write no store at all. Changing SRS
write semantics is a double-credit/lost-credit bug surface, so this ships as
its own step with its own acceptance matrix — never bundled with the display
fix (devils-advocate finding, accepted).

## Decision

1. **Credit seam moves to the recall-step advance** (`buildNextStep`, beside
   `_buildCountHear`): `smGrade(good|again)` + `recordAttempt` +
   `updateStreak`, per word, guarded by a session-transient `b._credited` set
   (exactly-once per session per word). `missed` derives ONLY from the explicit
   Missed-it tap — never from transcript matching.
2. **`buildOnComplete` becomes the fallback** for lesson shapes without
   per-word recall steps: its loop skips `wid ∈ b._credited` AND adds each
   graded `wid` to the set (duplicate ids in `real_word_ids` credit exactly
   once whichever path reaches them first).
3. **Lifecycle:** `b._credited` initialized in `buildMakeSession`, cleared only
   by `buildRestart` (a rerun is a fresh crediting session); back-then-forward
   cannot double-fire (set membership). Never exported (export schema v6
   untouched).
4. **The core loop now feeds the streak** via the seam — today it cannot.
5. **Sentence drills:** sentGap and sentBuild (gap-derived questions only;
   `_bldFromGap` return gains `wordId`) write `recordAttempt` on the target
   word — **attempts-only, never `smGrade`** (recognition ≠ recall; must not
   inflate N). Count-it and counter-derived sentBuild questions write nothing.
   Nothing ever writes the retired `sentenceStats`/`phraseStats` tracks.
6. **Self-rating (v8.48) unchanged** — a separate, non-colliding channel with
   its own `b._rated` guard.

## Acceptance gate (numeric)

The §5.2 double-credit matrix runs as concrete pre/post `state.stats`
assertions — **9/9 rows pass**:

- Interrupt at step 15 of 30 → **exactly 15** words credited (15 `correctCount`
  deltas, **0** duplicates); resume → **the remaining 15** and no re-credit;
  restart → a fresh full set by design.
- Back-then-forward over the same word → **0** additional writes.
- A `real_word_ids` array with 1 duplicated id → that word credited
  **exactly once**.
- One full vocabSpam round → `updateStreak` fired ≥1 time from the Build path
  (today: 0).
- sentGap/sentBuild rounds → `attempts[]` rows only; **0** `smInterval`
  changes from those modes.

## Reversal trigger (numeric)

- **≥1 verified double-credit incident** in production (a word receiving 2+
  SRS grade writes in one session outside an explicit restart) → revert the
  seam to completion-only credit (the change is read-side isolated; reverting
  restores today's behaviour exactly).
- If interrupted-round credit measurably inflates the metric against honesty
  (owner report + fixture reproduction within **14 days** of ship), re-gate
  crediting on round completion.
