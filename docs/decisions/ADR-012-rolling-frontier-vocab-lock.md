# ADR-012 — Vocabulary access becomes a rolling-frontier hard lock at the deck choke point

- **Status:** Accepted (owner signoff 2026-07-19 — **FRONTIER_N = 80**, option (a) of the explicit signoff item below)
- **Date:** 2026-07-19
- **Source:** Delve 8 — `docs/delve-cycles/8-sensei-vocab.md` (§3, L1–L5, Round 1 synthesis)
- **Supersedes / superseded by:** resolves and supersedes pending **ADR-003** (non-locking coverage meter) via ADR-003's own reversal trigger — "the user explicitly requests access-locking" — which fired on the owner call of 2026-07-19. ADR-003's permanent wins are preserved (v7.69 module-gate force-off stays; no `getDrillableWords` rewiring; the v7.68 empty-pool bug class must stay impossible).

## Context

All ~1,702 words (N5_PACK + ADV_PACK) are drillable from minute one; the
ADR-003 coverage meter shows absorption but locks nothing. The owner has now
explicitly requested a hard lock ("only 1,500 words unlocked — more
controlled") while mandating study before decision. Delve 8 studied the
candidates (cosmetic meter, module-gate revival, tier/topic packs, rolling
frontier) and locked the rolling frontier; the Round-1 adversary panel then
corrected two load-bearing implementation claims (both folded in below).

## Decision

1. **Unlocked deck is a derived set, recomputed on read:**
   `unlocked(w) = started(w) ∨ manuallyUnlocked(w) ∨ frontier(w)` — where
   started = any SRS attempt in `state.stats`, manual = the additive
   `state.settings.unlockedExtra` id array, and frontier = the first
   `FRONTIER_N = 80` unstarted, non-manual words in deterministic global deck
   order (N5_PACK then ADV_PACK). No persisted word arrays beyond
   `unlockedExtra`.
2. **Single choke point with one narrow bypass.** The lock is one filter
   inside `getActiveWords()` behind a `vocabLock` setting (default ON for new
   profiles; Settings toggle = full escape hatch). `getActiveWords` gains an
   optional `{ignoreLock:true}` argument used by EXACTLY two callers: the
   choke-point widening backstop and `vocabAccessStats`'s denominator. Every
   existing zero-arg call site behaves identically.
3. **No refusal path (FOLLOW-THE-LEARNER):** (a) conversation never consults
   the lock; off-pool speech is promoted — speaking a locked word writes an
   attempt and unlocks it, **which REQUIRES the S3 resolver widening** (panel
   FATAL, all three heads): the `_convoPreamble` `usedWords` contract grows to
   admit kana surfaces of clearly-used non-pool words, and `convoApplyScore`
   gains a fallback resolver over the full `state.words` registry accepting
   only a UNIQUE normalized-kana match (ambiguous ⇒ dropped; writes stay
   gated by `viaVoice` + score ≥ 1). (b) Browse/search shows locked words
   greyed with one-tap add to `unlockedExtra`. (c) **Choke-point `minViable`
   backstop** (panel correction — the r1 per-surface rung covered only the
   spam ladder): inside `getActiveWords()`, if the post-lock pool is smaller
   than `minViable` (10), the next deck-ordered locked words passing the
   other active filters are admitted and appended to `unlockedExtra`
   (demand-unlock), so EVERY consumer inherits the floor.
4. **Visible horizon:** locked words render greyed, never hidden; the
   coverage meter re-labels to `unlocked / total` with `total` read via
   `{ignoreLock:true}` (else it collapses to 100% — panel catch). "Words
   unlocked" is the growth number; it is earned by doing, never by paying.
5. **Migration = flag-set only:** one versioned migration sets
   `vocabLock: true`; the derivation unlocks the owner's entire drilled/spoken
   history automatically; zero stats writes; fully reversible via the toggle.
6. **Scope:** Spam loop, Random Drill, Vocab Blitz (new-card intake narrows
   to the frontier — by design), convo WORD_POOL, and chips inherit the lock
   through the choke point. Form/particle drills (`formEligibleVerbs`) stay
   independent in v1.

### Explicit owner-signoff item — `FRONTIER_N`

The owner's verbatim is **"only 1,500 words unlocked"** (~12% trim of 1,702);
this ADR proposes **frontier-80** (~95% cut for a fresh profile) anchored to
ADR-003's ≥ ~80 variety floor. The mechanic is N-agnostic; the number is the
owner's call. Signoff must choose: (a) 80 as proposed, (b) a larger N
honoring the literal 1,500 reading, or (c) an owner-tuned value after a felt
session. This line exists so the divergence cannot ship silently.

## Consequences

- The progression contract becomes **access earned by doing** on every vocab
  drill surface, while conversation remains unrestricted (respond-to-anything
  is untouched).
- The v7.68 "random words" bug class is killed at the choke point, not per
  surface; no selector rewiring beyond the single options argument.
- Reversal is a flag-flip: the derivation writes no data, so turning
  `vocabLock` off restores today's behavior exactly.
- Speech-driven unlocking depends on the `convoApplyScore` widening; until
  that lands, only drills advance the frontier (stated, not hidden).

## Acceptance gate (numeric)

Accept iff, with S3 shipped:
- **0** refusal surfaces: conversation responds to off-pool speech unchanged;
  browse-add is ≤1 tap; a fixture where the learner speaks a locked word with
  a unique kana match writes exactly **1** `recordAttempt` and the word is
  unlocked on next read.
- **No** drill surface (spam, Random Drill, Blitz, WORD_POOL seed) renders
  fewer than `minViable = 10` words under the lock for **100%** of a tested
  filter matrix (every theme × lock ON, plus POS/register combos).
- Meter `total` equals `getActiveWords({ignoreLock:true}).length` for
  **100%** of tested filter combinations.
- Migration writes **0** `state.stats` entries and exactly **1** settings
  flag; on the owner's profile, **100%** of previously-attempted words are
  unlocked on arrival.

## Reversal trigger (numeric)

Revert the default to meter-only (flag-flip; keep the derivation code) if:
- **≥3 of the first 10** real-user cohort members report the lock as friction
  ("couldn't drill what I wanted"), OR
- the owner turns the `vocabLock` escape hatch OFF and leaves it off for
  **≥3 consecutive sessions**, OR
- the choke-point backstop fires on **>20%** of drill launches in normal use
  (signal that the frontier is mis-sized, not merely mis-felt — retune
  `FRONTIER_N` before reverting).
