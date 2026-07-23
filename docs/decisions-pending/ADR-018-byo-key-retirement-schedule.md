# ADR-018 — BYO-key retirement at Phase-2 flip-on (amends ADR-004 §3 — fulfills its scheduled endpoint)

- **Status:** Proposed (pending owner signoff)
- **Date:** 2026-07-24
- **Source:** Delve 9 — `docs/delve-cycles/9-commercial-spine.md` §7, §8 (D10);
  Round-1 synthesis disposition DA-4
- **Amends:** ADR-004 §3 — the "BYO stays until the cap exists" invariant
  reaches its scheduled endpoint at flip-on
- **Related:** ADR-015 (sign-in must be live at flip-on), ADR-017 (hardening
  must be applied at flip-on), the v8.23 keyed-mock-probe lesson

## Context

The Settings BYO-key cards and their ~10 call sites are the pre-commercial
substrate. Keeping them alongside the relay doubles the auth/error matrix
exactly when the 402 contract must be the only truth (the v8.23 lesson:
parallel paths hide breakage). The devils-advocate round pressed the
rollback gap of deleting them at cutover; the synthesis answered with
sequencing preconditions rather than a resident fallback.

## Decision

1. **Key cards + BYO code paths are DELETED at Phase-2 flip-on** (the
   release where sign-in ships and `REQUIRE_ENTITLEMENT=true`), not at
   store build.
2. **Phase 1 (interim):** owner-only migration — one repurposed connection
   card holding `APP_SOFT_SECRET`; public users stay on BYO unchanged;
   rollback at any point is re-pasting the personal key.
3. **Cutover preconditions (DA-4):** flip-on ships only after **≥7 days**
   of Phase-1 owner production relay use, and the BYO deletion lands as an
   **isolated commit** (nothing else rides it) so rollback is one clean
   `git revert` + SW update. A dual-path build flag is explicitly rejected
   (a resident never-run path is the masked-breakage shape).
4. **Legacy keys:** at flip-on first run, a one-time notice tells the user
   their stored personal key is no longer read; it is never silently
   deleted.

## Acceptance gate (numeric)

- At the flip-on release: grep for `anthropicKey`/`openaiKey` live call
  sites in `index.html` returns **0** (the one-time-notice read excepted);
  the Phase-1 soak log shows **≥7 days** of owner relay use with **0**
  unresolved relay failures.
- The deletion commit touches only the BYO retirement (**1** commit,
  revertable in isolation).

## Reversal trigger (numeric)

- A relay outage class in the first live week that a revert would fix →
  `git revert` the isolated deletion commit (restores BYO wholesale), fix
  forward, re-flip.
- Phase 2 slips **> ~6 weeks** after Phase 1 AND other testers are needed →
  do NOT widen the soft secret; pull sign-in forward (preferred) or issue
  per-tester secrets with per-secret caps (ADR-004 §3b).
