# ADR-016 — Trial clock lazy-start & the day-7 client contract (extends ADR-004 §5 client-side)

- **Status:** Proposed (pending owner signoff)
- **Date:** 2026-07-24
- **Source:** Delve 9 — `docs/delve-cycles/9-commercial-spine.md` §5, §8 (D5–D8, D11);
  Round-1 synthesis dispositions DA-2, DA-6, QA-7, QA-8
- **Extends:** ADR-004 §5 (gate contract — client behavior side);
  amends `backend/supabase/migrations/0002_trial.sql` semantics (migration 0003)
- **Related:** ADR-006 (subscription layer), ADR-009 (judgment-free copy)

## Context

The owner locked a 7-day no-card trial gating only live AI chat. The R0 model
started `trial_started_at` at signup, so a user could burn all "7 free days of
talk" on free surfaces without ever talking live — failing the delve's own G4
honesty gate (devils-advocate DA-2, accepted). The day-7 surface, countdown
register, and 402/401/429/503 client behavior also needed a single decided
contract.

## Decision

1. **D11 — Lazy-start trial clock:** `profiles.trial_started_at` becomes
   NULL at signup and is set by the FIRST entitlement-gated live-talk call
   (migration 0003 + `gate.ts` + `entitlement.mjs` null path). "7 free days
   of talk" is thereby literally usage-honest.
2. **Day-7 surface (D5):** pre-convo offer state is primary; mid-convo 402
   runs the normal recap-first close, then the offer; scripted practice is
   always one tap away. Never an interrupt, never a dead end.
3. **Countdown (D6):** quiet static line only; pre-trial it reads "7 free
   days of live talk — the clock starts when you do"; zero urgency
   mechanics. The banned-mechanics list is enforced by a token scan over a
   single `OFFER_COPY` constant inside `_spineSelfTest()` (QA-7).
4. **Offer copy (D7):** the §5.3 verbatim strings, judgment-free register,
   `trial_ended` + `no_access` variants.
5. **Client contract (D8):** the §5.4 table verbatim — including the bounded
   503 retry (2 retries, 2s/8s, then a manual card; QA-8). The client never
   decides entitlement.

## Acceptance gate (numeric)

- `backend/tests/entitlement.test.mjs` extended for the null/lazy path:
  **≥ 12 tests, all green** (was 10/10), covering: null clock + no sub →
  entitled-and-starts, started clock day 6/7/8 boundaries, sub overrides.
- Manual probe: forced mid-convo 402 shows recap THEN offer (not a toast) in
  **1/1** scripted run; `_spineSelfTest()` banned-token scan reports **0**
  hits on the shipped offer strings.

## Reversal trigger (numeric — placeholder band, calibrate on first cohort)

- Trial→paid conversion materially below the **~2–5%** freemium baseline
  over the first **≥100** trial starts AND **>30%** of trial users hit day 7
  without a live convo → fix the first-run funnel (ADR-014), NOT urgency
  mechanics (banned by ADR-009 — not a reversal path).
- If lazy-start proves gameable in a way that materially raises burn (e.g.
  clock-dodging beyond the ADR-017 tiered-breaker floor), fall back to
  clock-at-signup WITH the real end date shown on S0 (the honest-copy
  variant), never to silent calendar decay.
