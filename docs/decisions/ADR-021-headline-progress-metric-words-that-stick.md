# ADR-021 — Headline progress metric: words-that-stick milestone ladder (interim proxy, spacing-floored)

- **Status:** Accepted (owner signoff 2026-08-11)
- **Date:** 2026-08-06
- **Source:** Delve 11 — `docs/delve-cycles/11-drill-progress.md` §3 (as amended
  by the Round-1 synthesis: spacing floor, 14-day warming window, tier
  extension + maxed state, null-guarded reads)
- **Related:** ADR-022 (credit plumbing that feeds this metric), ADR-023 (spine
  retirement that makes room for it); supersedes the **Conversational Core %**
  as the user-facing progress number.

## Context

The Home progress bar is frozen at 0%: it bottleneck-mins over two tracks only
buried legacy modes can feed. The paid v1 is the hands-free drill loop (owner
anchor 2026-08-03), so the headline metric must be 100% fed by that loop,
honest under the locked STT-never-grades posture (v8.03), and alive from the
first session (including the 3-word onboarding micro-drill).

## Decision

1. **The one Home number is N = "Words that stick":** words that are
   mature/★mastered, OR learning-path words passing `progIsSolid` (≥3 correct
   at ≥70% accuracy, unchanged) **AND** having correct attempts on **≥2
   distinct local days** (spacing floor — pure exposure in one sitting can
   never cross "stick").
2. **A second, translucent "warming" segment** (≥1 correct attempt in the last
   14 days, not yet stuck) gives first-session life. It is visual-only, never
   part of the number, and renders short of the bar's end-cap — a full bar only
   ever means a milestone reached.
3. **Milestone tiers `[25,75,150,300,500,750,1000,1400]`** plus a terminal
   "maxed" state; the tier-selection function is total (no NaN at any N).
4. **All reads are null-guarded** (legacy imported records may lack
   `attempts[]`); the headline card builder is wrapped so a malformed record
   cannot blank Home.
5. **Manually-★mastered words count into N by user declaration** and are
   immune to automatic un-sticking — the ★ toggle is the same self-honesty
   channel as the 😬 rating.
6. **Interim-proxy scope:** this metric measures vocabulary breadth, not
   conversational competence. It is explicitly an interim proxy while
   conversation is benched — see the reversal trigger.
7. Rejected: weighted composite (the incumbent failure), daily-goal ring
   (measures effort, needs new state).

## Acceptance gate (numeric)

- Headless render probe passes on **4/4 fixture profiles** (brand-new,
  post-onboarding 3-word, owner-like mid-progress, legacy imported backup)
  with **0 uncaught exceptions** and the expected N/W/bar values asserted.
- Owner's real profile shows **N ≥ 1** (bar non-zero) on first render after
  update, with **0 store writes** required.
- Formula totality: for every N in 0…1800, tier selection returns a finite
  fill (**0 NaN/undefined**).
- Spacing floor: a fixture word with 3 same-day corrects shows **N contribution
  = 0**; the same word with corrects on 2 distinct days shows **= 1**.

## Reversal trigger (numeric)

- If after **30 days** of owner use with **≥20 completed rounds** the headline
  N has moved **< 5%**, the metric fails its own "progress that moves" charter
  — reopen the headline decision.
- **Reopen-before-unbench:** if AI conversation is un-benched (ADR-008 surface
  returning) with **0** production/conversation-shaped signals designed into
  the progress surface, this ADR must be reopened FIRST — word-count is never
  the permanent definition of progress.
