# Delve 9 — Commercial spine: onboarding, sign-in & paywall UX

## Domain
Isshin is going commercial (app-store v1, Facebook ads). The backend trial gate
is built (backend/, 7-day no-card trial, 402 contract); what is NOT designed is
everything the user *feels*: the first-run flow, where sign-in sits, what the
paywall moment looks like, and which of Praktika's documented failures we gate
v1 against. Grounding: `reports/hydra-research/2026-07-21/REPORT.md` (Praktika
teardown — thesis validated at $35.5M/1.2M-MAU scale; its verified weaknesses
are our differentiation list). Owner's load-bearing asks, verbatim:
*"sign in up front"* (2026-07-20), *"7 days / free days for everyone, no card"*
(2026-07-21), and the standing scope mandate: *"the hands-free voice drill loop
IS the app."*

## Stacked REVISED callouts
> **REVISED 2026-07-16 per Delve 4** — productization architecture: hosted
> relay (ADR-004), account + sync model (ADR-005). Binding for endpoints/gate.
> **REVISED 2026-07-17 per Delve 5** — conversation-first product structure;
> Home = talk. Any onboarding must land the user in the talk loop, not a menu.
> **LOCKED (owner, /interactive 2026-07-20/21, not re-openable here):**
> $8.99/mo + ~$59.99/yr · sign-in up front pre-trial · trial gates ONLY live AI
> chat (drills + scripted practice free forever) · 7-day no-card trial.

## Primary
**Mode:** Opus-only

### Investigation tasks
1. **First-run flow — pick FINAL:** (A) 2-tap skippable goal pick (Praktika's
   proven <5-min goal-first onboarding, minus its progress-reset failure) vs
   (B) straight into the scripted first conversation, goals never asked. Must
   honor the scope mandate (loop IS the app) AND the sign-in-up-front lock —
   decide what a brand-new install shows in the first 60 seconds, screen by
   screen.
2. **Sign-in mechanics — pick FINAL:** Google-only at v1 vs Google+Apple from
   day one (Apple mandatory for iOS store build — decide the PWA/Android
   interim); sign-in BEFORE any content vs after one scripted taste
   (up-front lock interpreted strictly vs loosely). Output: the exact
   auth screen + Supabase OAuth flow spec.
3. **The day-7 moment — pick FINAL:** how trial expiry surfaces (in-convo card
   vs pre-convo offer screen), countdown copy in the judgment-free register
   (no urgency-guilt mechanics — name the line), and the exact 402
   `trial_ended` client behavior (fall back to scripted practice + offer,
   never a dead end).
4. **Praktika-gap ship gates — adopt or reject each as a v1 gate:** audio-first
   default (already true), vocab continuity (frontier — verify felt in convo),
   non-destructive topic switching (verify no state loss today), trust-bug
   zero-tolerance list (data loss, voice drift). For each: PASS today / needs
   work / rejected-with-reason.
5. **BYO-key retirement — pick FINAL:** when the Settings key cards disappear
   (at backend flip-on vs at store build), and the owner's own migration path
   (personal key → owner soft-secret relay).

### Output
Primary doc: `delve-cycles/9-commercial-spine.md`
Sections: Charter · Method · one per task (1–5) · Decisions reached ·
Open questions · Foundation doc updates · ADR proposals.

## Adversaries
### Adversary 1: devils-advocate (LEAD)
**Read:** primary doc, REPORT.md, backend/README.md, DO_THIS_NEXT.md
**Audit:** (1) Does the first-run flow survive the scope mandate, or is it a
settings-wall reborn? (2) Is "sign-in up front" costing more installs than the
trial funnel gains? (3) Is the day-7 copy honestly judgment-free or dressed-up
urgency? (4) Which Praktika-gap gates are table-stakes vs vanity?
**Output:** `9-commercial-spine-devils-advocate.md`

### Adversary 2: security
**Read:** primary doc, backend/supabase/**, gate.ts, entitlement.mjs
**Audit:** (1) OAuth redirect flow on a GitHub-Pages PWA (no custom domain) —
token handling, storage, logout. (2) Can the trial be trivially reset
(new Google account, cleared storage)? Name the accepted abuse floor.
(3) 402/401 client handling leaks nothing sensitive.
**Output:** `9-commercial-spine-security-review.md`

### Adversary 3: qa
**Read:** primary doc, index.html first-run paths
**Audit:** (1) Every decision's screen-by-screen flow has no dead ends
(airplane mode, denied OAuth, expired trial mid-convo). (2) Existing-user
migration (current phone install → account) loses nothing.
**Output:** `9-commercial-spine-qa-design.md`

## Synthesis
`## Synthesis (Round 1 close — Delve 9)` appended to primary doc.
Foundation docs: DO_THIS_NEXT.md, backend/README.md, store-listing-copy.md.
ADR proposals likely: onboarding flow; sign-in mechanics; day-7 UX;
Praktika-gap v1 gates; ADR-004/005 pricing amendment.

## Definition of done
- [ ] Primary doc + 5 task sections
- [ ] 3 adversary docs filed
- [ ] Synthesis appended
- [ ] Foundation docs patched
- [ ] ADR proposals filed (pending dir, sequential numbering)
- [ ] User signoff

## Files this delve touches
Creates: delve-cycles/9-* (5 docs), docs/decisions-pending/*.
Modifies: DO_THIS_NEXT.md, backend/README.md, docs/store-listing-copy.md.
