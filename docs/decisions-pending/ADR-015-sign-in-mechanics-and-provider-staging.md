# ADR-015 — Sign-in mechanics & provider staging (amends ADR-005 §1 staging only)

- **Status:** Proposed (pending owner signoff)
- **Date:** 2026-07-24
- **Source:** Delve 9 — `docs/delve-cycles/9-commercial-spine.md` §4 (D2, D4);
  Round-1 synthesis dispositions QA-1..QA-5, SEC-5
- **Amends:** ADR-005 §1 — staging only; the end state (Apple + Google +
  magic-link) is unchanged
- **Related:** ADR-004 (401 contract), ADR-014 (S0 surface), ADR-017 (CSP/pinning)

## Context

ADR-005 locks Supabase Auth with Apple + Google + magic-link and notes Apple
is mandatory once social login is offered — but that obligation (App Store
guideline 4.8) binds the iOS app, not the PWA/Android interim. The QA round
named four dead-ends the flow spec had not covered (offline S0, denied OAuth,
multi-account device, cross-device magic-link).

## Decision

1. **Providers at v1 (PWA/Android): Google + email magic-link.** Apple
   Sign-In lands at the iOS store build, not before. No passwords, ever.
2. **OAuth flow:** full-page redirect PKCE via a vendored, exact-version
   supabase-js v2 UMD (SHA-256 recorded; CSP meta tag per ADR-017);
   `github.io` origin allow-listed; localStorage session accepted for v1;
   logout revokes server-side and keeps local SRS cache.
3. **Dead-end guards (QA round, all specced in Delve 9 §4.3–4.4):**
   - S0 offline: honest-offline copy + disabled actions + `online`-event
     re-enable (v8.27 pattern).
   - Denied/cancelled consent: `error`-param return → clean URL → S0, quiet
     copy, no modal/loop.
   - Boot order: `getSession()` first, orthogonal to `onboard.done`; no
     session → S0 always.
   - Multi-account device: `accountUserId` recorded at first seed/sync; uid
     mismatch → NO seed-upload; per-uid namespace stash; zero cross-account
     writes.
   - Magic-link cross-device: failed PKCE exchange → named recovery copy +
     resend affordance.

## Acceptance gate (numeric)

- Manual QA matrix on the owner's device (installed-PWA Chrome/Android):
  **10/10** OAuth round-trips succeed, and **0 dead ends** across the five
  guard scenarios above (each demonstrably lands on a recoverable screen).
- Two-account switch test on one device: **0** cross-account writes,
  **0** lost local items (extends ADR-005's two-device gate).

## Reversal trigger (numeric)

- Field OAuth failure rate **> ~2%** of S0 attempts, or a recurring
  `github.io` redirect-loss class → escalate OQ-2 (custom domain) from
  cosmetic to auth-reliability and revisit session storage via an edge proxy.
- Apple obligation trigger: shipping any iOS store build **without** Apple
  Sign-In is a guideline-4.8 rejection — Apple lands with that build, no
  later.
