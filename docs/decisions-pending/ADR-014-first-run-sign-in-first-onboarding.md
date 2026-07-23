# ADR-014 — First-run flow: sign-in-first scripted-conversation onboarding (no goal wizard, A0 kana on-ramp)

- **Status:** Proposed (pending owner signoff)
- **Date:** 2026-07-24
- **Source:** Delve 9 — `docs/delve-cycles/9-commercial-spine.md` §3, §4.2, §8 (D1, D1a, D3);
  Round-1 synthesis dispositions DA-1, DA-3, DA-6
- **Related:** ADR-005 (auth stack), ADR-008/010 (Home = talk), ADR-009 (judgment-free),
  ADR-015 (sign-in mechanics), REPORT `reports/hydra-research/2026-07-21/REPORT.md` HIGH-1

## Context

The commercial build needs a decided first-run surface. Praktika's goal-first
onboarding converts but its verified failure is goal-change resetting progress
(REPORT MEDIUM-1), and its verified beginner failure is speaking-first-from-cold
("too advanced, speaks too quickly", HIGH-1). The owner locked "sign in up
front pre-trial"; the scope mandate locks "the loop IS the app". The
devils-advocate round surfaced that the strict reading of "up front" is the
doc's interpretation, and that HIGH-1's action line demands the kana on-ramp be
first-session content for true beginners.

## Decision

1. **No goal wizard, at v1 or later.** First run goes straight into the
   existing scripted first conversation (OB-3A/3B); the one-question path pick
   (OB-1) is retained as non-locking placement.
2. **Strict sign-in-first (D3):** S0 (reworked OB-0) = promise + sign-in on
   one screen; nothing is browsable anonymous. Flagged at signoff as the
   doc's interpretation of the owner's lock — strict stands unless the owner
   says loose.
3. **First 60 seconds:** S0 promise+sign-in → S1 path pick → S2 mic ask →
   S3 scripted 3-turn conversation (zero network) → S4 first-win card →
   Home = talk. No plan picker, no card form, no API-key field, no tour.
4. **D1a (kana wedge):** for `path:'beginner'`, S4 carries co-equal CTAs
   "Keep talking →" (live) and "Start with the letters →" (existing kana
   on-ramp), and day-1 beginner Home surfaces the kana ramp above the fold.
   The kana module is never gated behind a speaking task.
5. **S0 funnel instrumented from day one:** S0-shown vs S0-completed counted
   (privacy question OQ-5 rides the build).

## Acceptance gate (numeric)

- The delve-9 §3.3 flow ships with **≤5 screens** before Home and the
  onboarding self-test (placement non-locking: **0 drill-pool diff** across
  `placedStage` values) stays green.
- S0 instrumentation live at launch: both counters emit on the **first** ad
  cohort (≥1 recorded event each before ads scale).

## Reversal trigger (numeric — placeholders, calibrate on first cohort)

- S0 completion **< ~60%** over the first meaningful ad cohort → reopen
  strict-vs-loose with funnel data (Delve 9 §4.2.5).
- Install→first-live-convo **< ~50%** AND interviews attribute the drop to an
  orientation gap → add a 2-tap skippable goal pick as an additive filter
  (never a resettable path) per §3.4.
