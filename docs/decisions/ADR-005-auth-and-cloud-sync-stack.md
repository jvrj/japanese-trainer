# ADR-005 — Auth & cloud-sync stack (Supabase Auth, JSONB user_state, per-item SRS merge, safe seed migration)

- **Status:** Accepted (promoted to `docs/decisions/` 2026-06-29 — user signoff)
- **Date:** 2026-06-28
- **Source:** Delve 4 — `docs/delve-cycles/4-productization-architecture.md` (§4; Round 1 synthesis)
- **Supersedes / superseded by:** none

## Context

Today all SRS progress lives in `localStorage`. `save()` (`index.html:3418-3437`) writes **16** discrete JSON blobs (verified this session, correcting the primary doc's "~13"): `words`, `stats`, `settings`, `notes`, `logs`, `streak`, `askClaude`, `formStats`, `kanaStats`, `sentenceStats`, `phraseStats`, `particleStats`, `variationStats`, `similarStats`, `snapshots`, `convo`. This is a bag of independent blobs, not a normalized model.

Going to a multi-device paid product needs accounts + cloud sync. The primary doc proposed last-write-wins (LWW) per top-level key, asserting SRS stats are "additive/monotonic so LWW rarely loses progress." Both devils-advocate and qa-tester showed this is **false by construction** — blob LWW *replaces* a key, it does not *add*, so two offline sessions on two devices end with the later sync silently discarding the earlier device's whole study session for that subsystem. For a learning app, progress loss is the cardinal sin. The code-reviewer also flagged that `LS.convo` (in-flight conversation session state) and `LS.logs` (device-local diagnostics) must not sync, and the qa-tester flagged the migration had no failure path.

## Decision

1. **Auth = Supabase Auth** with Sign in with Apple + Google + email magic-link (no passwords). Apple sign-in mandatory once any social login is offered (App Store 4.8).
2. **Cloud state = Supabase Postgres**, one `user_state(user_id PK, state_json JSONB, updated_at, schema_version)` row per user, RLS by `auth.uid()`. `localStorage` stays the working cache; Postgres is the sync target. Do NOT normalize SRS into relational tables (large refactor, no near-term payoff).
3. **Conflict resolution = per-item MAX/additive merge for SRS state, NOT blob LWW.** Monotonic counters (per-word `reps`, `lapses`, streak, per-mode `*Stats` tallies) merge by **max**; scheduling fields (`interval`, `ease`, `due`, `lastSeen`) merge **most-recent-review-wins per item**. Plain LWW-by-`updated_at` is retained ONLY for genuinely scalar settings. This delivers the monotonic property that was previously merely asserted. Full CRDT remains rejected as over-engineering.
4. **Synced keys:** `words(user)`, `stats`, `settings`, `notes`, `streak`, `askClaude`, `formStats`, `kanaStats`, `sentenceStats`, `phraseStats`, `particleStats`, `variationStats`, `similarStats`, `snapshots`. **Excluded from sync:** `convo` (ephemeral session state — would revive an orphaned conversation on device B) and `logs` (device-local diagnostics).
5. **Migration = non-destructive idempotent seed.** First authenticated launch with no `user_state` row → upload local as initial `state_json` (`schema_version` stamped). `localStorage` stays authoritative throughout; the client sets `migrated:true` only after the server confirms 2xx; on any failure it retries with backoff, never blocks the drill, never deletes local data. If a row already exists, apply the per-item merge rather than blind overwrite.
6. **Offline-first writes:** `save()` keeps writing `localStorage` synchronously (loop never blocks on network); a debounced push (5–10s after activity, and on `visibilitychange`/`pagehide`) syncs to Postgres. A dropped connection cannot interrupt a drill.

## Consequences

- Cross-device progress is preserved even with concurrent offline sessions — the merge is monotonic, not last-writer-wins-clobbers.
- No premature normalization; the existing read/write paths change minimally.
- Ephemeral/device-local state never pollutes cloud state; migration cannot lose the owner's real SRS history.
- Cost folded into the Supabase line (ADR-004).

## Acceptance gate (numeric)

Accept iff: a two-device concurrent-offline test (device A does X items, device B does Y items, both sync) results in **0** lost graded items (final merged counters = A∪B by max, not A or B alone); the sync include/exclude set matches §4 exactly (`convo` and `logs` excluded — 2 of 2); and a forced mid-migration upload failure leaves **100%** of local data intact with `migrated` unset and the drill still running.

## Reversal trigger (numeric)

Revisit toward a normalized relational model or full CRDT if the JSONB `state_json` for a real user exceeds **~1 MB** (sync payload cost) or if post-launch telemetry shows **≥ 3** distinct user-reported progress-loss incidents traceable to the per-item merge being insufficient.
