# Isshin backend (Phase 0)

A secure relay so the app no longer needs a user-supplied API key. Holds the OpenAI +
Anthropic keys server-side and proxies calls behind a hard gate (spend ceiling, per-caller
daily cap, rate limit, auth). Built per `docs/decisions/ADR-004`.

```
backend/supabase/
  migrations/0001_init.sql           db schema + RLS + atomic counters
  migrations/0002_trial.sql          7-day trial: trial clock on signup + get_access() snapshot
  functions/_shared/gate.ts          auth + entitlement + spend ceiling + cap + rate limit
  functions/_shared/entitlement.mjs  the trial/subscription decision (pure, unit-tested)
  functions/transcribe/index.ts      POST /transcribe  -> OpenAI gpt-4o-mini-transcribe
  functions/chat/index.ts            POST /chat        -> Anthropic messages
backend/tests/entitlement.test.mjs   run: node backend/tests/entitlement.test.mjs
```

## Trial model (LOCKED 2026-07-21 · clock amended 2026-07-24, Delve 9 D11)
Every account gets **7 free days of live AI conversation — no card**
(`TRIAL_DAYS`, trial clock = `profiles.trial_started_at`).
**Lazy-start (pending migration 0003, ADR-016):** the clock is NULL at signup
and set by the FIRST entitlement-gated live-talk call — so "7 free days of
talk" is usage-honest; drills-only users never burn trial days. (The shipped
0002 signup-trigger clock is superseded by this; `get_access()` still
self-heals a missing profile row.) An active subscription
entitles regardless of trial. After trial with no sub the gate returns
`402 {error:no_entitlement, reason:'trial_ended', trial_ends_at}` — the client
shows the offer. Drills + scripted practice never call the relay, so the free
tier stays free by construction. The whole check sits behind
`REQUIRE_ENTITLEMENT` (set `true` at launch; `false` = pre-launch open door).

## Endpoints
```
POST /functions/v1/transcribe   multipart { file, prompt? } -> { text }
POST /functions/v1/chat         json { messages, system?, model?, max_tokens? } -> Anthropic shape
```
Auth: a Supabase JWT (`Authorization: Bearer <jwt>`) once accounts exist (Phase 2), OR the
interim owner soft secret (`x-app-secret: <APP_SOFT_SECRET>`) for Phase 0/1.

Gate responses (client branches on these — ADR-004 §3):
`401` re-auth · `402 {error:no_entitlement, reason:'trial_ended'|'no_access', trial_ends_at}` paywall/offer ·
`429 {error:daily_cap|rate_limited, resets_at}` · `503 {error:temporarily_unavailable}` transient (retry, NOT paywall).

**Client behavior — single source of truth:** the exact 402/401/429/503
handling table (incl. the bounded 503 retry and recap-first mid-convo close)
lives in `docs/delve-cycles/9-commercial-spine.md` §5.4 (ADR-016). Do not
fork it here.

## Phase-2 flip-on (definition — Delve 9 D10/ADR-018)
"Flip-on" is ONE release where all of these land together: sign-in live
(ADR-015) · `REQUIRE_ENTITLEMENT=true` · soft-secret rotated server-side ·
BYO key cards + call paths deleted from `index.html` (isolated commit).
Preconditions: ≥7 days of Phase-1 owner production relay use, and the
hardening list below applied.

## Hardening REQUIRED before Phase 2 (Delve 9 security round — ADR-017)
The Phase-0 schema ships a FATAL gap: Supabase exposes public-schema
functions as anon-callable PostgREST RPCs (default EXECUTE grant), so the
gate can be bypassed (`add_spend` spend-DoS, `get_access` IDOR). Migration
0003 + function changes, all blocking flip-on:
1. `REVOKE EXECUTE` on `bump_request`/`bump_item`/`add_spend`/`get_access`/
   `handle_new_user` from `public, anon, authenticated` (service_role only).
2. Model allow-list in `chat/index.ts` (non-listed model → 400; price by the
   model actually used).
3. Tiered spend breaker: trial-tier callers shed at ~80% of
   `GLOBAL_DAILY_USD`; subscribers ride to the hard ceiling. Plus-address
   email normalization at signup.
4. `SET search_path = public` on all five SECURITY DEFINER functions.
5. Lazy-start trial clock migration (see Trial model above).
6. (Deferred, non-gating) length caps on `system`/message content in chat.

## Deploy (after you've done steps 1–3 in DO_THIS_NEXT.md)

Prereqs: install the Supabase CLI — `npm i -g supabase` (or `scoop install supabase`).

```bash
cd backend
supabase login                       # opens browser
supabase link --project-ref <REF>    # REF is in your Supabase project URL / settings

# 1. apply the database schema
supabase db push

# 2. set the secrets (NEVER commit these; paste the values you copied earlier)
supabase secrets set OPENAI_KEY=sk-...           # the isshin-backend OpenAI key
supabase secrets set ANTHROPIC_KEY=sk-ant-...    # the isshin-backend Anthropic key
supabase secrets set APP_SOFT_SECRET=$(openssl rand -hex 24)   # interim owner secret — copy the output
supabase secrets set GLOBAL_DAILY_USD=15         # circuit-breaker ceiling
supabase secrets set CAP_ITEMS_PER_DAY=300       # per-user fair-use cap
supabase secrets set TRIAL_DAYS=7                # locked 2026-07-21
supabase secrets set REQUIRE_ENTITLEMENT=false   # flip to true at commercial launch
# SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are injected automatically.

# 3. deploy the functions
supabase functions deploy transcribe
supabase functions deploy chat
```

## Smoke test
```bash
# replace <REF> and <SECRET> (the APP_SOFT_SECRET you set)
curl -s -X POST "https://<REF>.functions.supabase.co/chat" \
  -H "x-app-secret: <SECRET>" -H "content-type: application/json" \
  -d '{"messages":[{"role":"user","content":"say hi in one word"}]}'
```
Expect a JSON Anthropic response. A `401` = secret mismatch; `503` = ceiling hit or upstream busy.

## Notes / next
- **Phase 1** wires the app's `_whisperTranscribe` / `_coachCall` / `_convoCall` to these
  endpoints (owner-only via the soft secret first). See ADR-004 §7 + DO_THIS_NEXT.md.
- Cost estimates in the functions are rough guards for the ceiling, not billing-accurate;
  re-tune once real usage data exists.
- Atomic counters live in SQL (`bump_request`/`bump_item`/`add_spend`) so concurrent calls
  can't race past the cap.
