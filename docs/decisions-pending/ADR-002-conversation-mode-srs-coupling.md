# ADR-002 — Conversation mode (おしゃべり) SRS-coupling policy

- **Status:** Proposed (PENDING — filed by Delve 1 synthesis; not promoted to `docs/decisions/`)
- **Date:** 2026-06-27
- **Source:** Delve 1 — `docs/delve-cycles/1-conversation-mode.md` (Round 1 synthesis)
- **Supersedes / superseded by:** none

## Context

The conversation mode must tie into the existing SM-2 SRS without inflating progress, and without corrupting `state.stats`. The adversary panel surfaced three load-bearing risks: (a) the SRS signal delegated word-matching to the AI and ignored the codebase's existing kana-fold machinery (`_kataToHira`/`_stripKanji`/`_voiceScoreJa`, index.html:5334/5342/5371) that exists precisely because Chrome `ja-JP` STT returns kanji forms; (b) `judged.usedWords` may contain a kana surface rather than a wordId, so writing it directly to `recordAttempt(wordId,…)` (index.html:7294) creates phantom `state.stats` keys; (c) the §10.2 sketch called `smGrade('good')` with one arg, but `smGrade(st, grade)` (index.html:3472) is two-arg — a one-arg call silently no-ops and never advances SM-2.

## Decision

1. **Seed** the session with ~8 due-first words via `_buildSpamPick(getActiveWords()-filtered, N≈8)`; the pool + FREE_SET are handed to the prompt as the learner's full expressive range.
2. **Normalize before writing.** Every `judged.usedWords` entry (kana surface OR id) and each pool word are folded through `_kataToHira`+`_stripKanji` and matched against the seeded pool to resolve a **real wordId**; unresolved entries are dropped, never written. Raw STT input is likewise stripped of kanji before any matching.
3. **Graded write tiers** (per resolved id, per turn):
   - **Unaided speech** (`viaVoice===true`): `recordAttempt(id,true,'convo',{scene})` + `smGrade(smStatFor(id),'good')` — full SM-2 ease/interval bump.
   - **Chip echoed aloud** (`{chip:true}`): `recordAttempt(id,true,'convo',{scene,chip:true})` only — exposure logged, **no `smGrade`** (scaffolded, must not advance the schedule as if unaided).
   - **Silent chip-tap / English / empty / opening turn (`judged===null`):** nothing.
4. **`smGrade` is always called with two args** — `smGrade(smStatFor(id),'good')`.
5. **Post-session recap**: display the seed words ✅/🎤-off/—; the ✅ words already bumped live. "Drill missed" is build work (`startRandomDrill` has no id seam, §12 Q6), not free.
6. **No-key/offline fallback** judges spoken input by a kana-overlap heuristic that MUST also route through `_stripKanji`; it is scripted practice, not a graded conversation.

## Consequences

- SM-2 advancement requires production + correctness; scaffolded echoes log exposure without inflating the schedule; phantom-key corruption is structurally prevented by the normalization step.
- The SRS tie-in measures **word production**, not conversational ability per se — honest framing carried into project memory `project_japanese_trainer_goal`.

## Acceptance gate (numeric)

Accept iff, in a scripted test session, **100%** of `smGrade` bumps trace to a `viaVoice===true` turn, **0** `recordAttempt` calls land on an id not in `getActiveWords()` (no phantom keys), and **every** kana-surface `usedWords` entry in the test fixtures resolves to its correct wordId.

## Reversal trigger (numeric)

Revisit if post-ship audit finds **≥ 1%** of `convo`-sourced `state.stats` writes on unresolvable/phantom keys, OR if conversation-credited words show review-success rates **≥ 15 percentage points** below the same words drilled in spam mode (signalling convo credit is too loose and inflating SM-2).
