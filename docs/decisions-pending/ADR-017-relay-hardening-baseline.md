# ADR-017 — Relay hardening baseline (blocks Phase-2 flip-on)

- **Status:** Proposed (pending owner signoff; the SEC-1 fix is a hard
  blocker for any public exposure of the relay)
- **Date:** 2026-07-24
- **Source:** Delve 9 — Round-1 security review
  (`docs/delve-cycles/9-commercial-spine-security-review.md`, verdict FAIL);
  synthesis dispositions SEC-1..SEC-6, D12; primary doc §9 OQ-3 (restated)
- **Amends:** the shipped Phase-0 backend (`backend/supabase/migrations/`,
  `functions/`) via a new migration 0003 + function changes
- **Related:** ADR-004 (relay + gate contract — this fulfills its "never
  reachable uncapped/unauthed" invariant against the PostgREST side door)

## Context

The security round found the gate's whole premise bypassable: Supabase
exposes public-schema functions as PostgREST RPCs, and Postgres grants
EXECUTE to PUBLIC on new functions by default — neither migration revokes
it. Any holder of the public anon key can call `add_spend(999)` directly
(one-request whole-product 503 DoS) or `get_access(<any uuid>)` (IDOR).
Further: the chat function trusts a client-chosen `model` while pricing
spend as Haiku, and the trial-abuse floor reasoning ignored that
`GLOBAL_DAILY_USD` is one ceiling shared with paying subscribers.

## Decision

Migration 0003 + function changes, ALL required before `REQUIRE_ENTITLEMENT`
flips true (Phase-2 flip-on):

1. **SEC-1 (FATAL):** `REVOKE EXECUTE` on `bump_request`, `bump_item`,
   `add_spend`, `get_access`, `handle_new_user` from `public`, `anon`,
   `authenticated`; grant to `service_role` only. (Edge functions use the
   service-role client, so behavior is unchanged.)
2. **SEC-2:** server-side model allow-list in `chat/index.ts` — a model not
   on the list → `400`; `estUsd` prices by the allow-listed model used.
3. **SEC-3:** tiered spend breaker — trial-tier callers shed (503) at a soft
   threshold (default **80%** of `GLOBAL_DAILY_USD`); subscribers ride to
   the hard ceiling. Plus-address email normalization at signup. Accepted
   abuse floor: abusers can burn the trial tier's slice, never a
   subscriber's service.
4. **SEC-4:** `SET search_path = public` on all five SECURITY DEFINER
   functions.
5. **SEC-5:** the vendored supabase-js UMD is exact-version pinned with a
   recorded SHA-256, and `index.html` gains a CSP meta tag (self + the
   Supabase project origin).
6. **SEC-6 (deferred, rides the build list not the gate):** length caps on
   `system` (~4KB) and per-message content (~8KB); reject non-string
   content.

## Acceptance gate (numeric)

- Direct PostgREST probe with the anon key against all **5** functions
  returns permission-denied/404 — **0 of 5** callable.
- `POST /chat` with a non-allow-listed model returns **400** in **1/1**
  probe; allow-listed request still succeeds.
- Tiered-breaker unit test: at ≥80% spend, trial caller → 503 while
  subscriber caller passes; at 100%, both → 503 (**all green**).

## Reversal trigger

- None for items 1–2 and 4–5 (pure hardening; no legitimate caller uses the
  revoked paths — if a future feature needs a client-callable RPC it gets
  its own explicitly-granted, `auth.uid()`-scoped function, never a blanket
  re-grant).
- Item 3: if **> 5%** of legitimate trial sessions in a week are shed by the
  soft threshold while subscribers used **< 50%** of the ceiling, re-tune
  the 80% split (it is an env knob, not a code change).
