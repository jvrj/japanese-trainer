# ADR-004 — Backend & API-proxy architecture (Supabase relay, no uncapped public relay, concrete gate contract)

- **Status:** Accepted (promoted to `docs/decisions/` 2026-06-29 — user signoff)
- **Date:** 2026-06-28
- **Source:** Delve 4 — `docs/delve-cycles/4-productization-architecture.md` (§3, §7, §8, §10; Round 1 synthesis)
- **Supersedes / superseded by:** none

## Context

Isshin (`index.html`, ~1.1MB single-file vanilla-JS PWA, no backend, no build step) is gated today on a bring-your-own (BYO) OpenAI/Anthropic key in `localStorage`. An ad-acquired paying customer will not paste a key, so the app must perform Whisper STT (`_whisperTranscribe` `:5814`, cost-dominant) and AI text calls (`_coachCall` `:9413`, `_convoCall` `:9516`, plus `:4730/:15792/:21184`) on the user's behalf behind a backend that holds the real keys. Utterance audio is sub-MB and latency-sensitive, so the relay must be a single-request multipart passthrough (no presigned-upload round-trip).

The devils-advocate panel found a **FATAL** flaw in the originally-drafted staging: a publicly reachable `/transcribe` behind only a "soft secret" with the per-user cap deferred to Phase 4 would spend the owner's real money for the entire Phase 1→Phase 4 window with no account, cap, or rate-limit — one scraper drains the budget. The qa-tester found the "402-style" gate response was not a testable contract.

## Decision

1. **Backend = Supabase (Edge Functions / Deno + Postgres + Auth) — one platform.** Audio relay = multipart passthrough (client → Edge Function → OpenAI → JSON back). One vendor covers proxy + auth + DB; RLS gates Postgres by `auth.uid()`. Runner-up Cloudflare Workers rejected for forcing a second auth+DB vendor; always-on Node rejected for idle cost.
2. **All third-party API keys live ONLY server-side.** They never reach the device or the client bundle.
3. **HARD INVARIANT — no uncapped/unauthed public relay.** The relay MUST NEVER be a publicly-reachable uncapped endpoint. From Phase 0 it enforces: (a) a hard global daily spend ceiling (503 circuit-breaker), (b) a per-IP / per-soft-secret rate limit, (c) a rotatable soft secret. The *public* "no-key for everyone" experience is gated on the per-user entitlement gate + daily cap (Phase 2+); in Phase 1 only the owner cuts over (his own usage), the BYO-key path stays live until the cap exists.
4. **Mandatory per-user fair-use cap enforced at the gate** (~300 graded items/day; numbers are a decision-note dial). Only a *successful* graded item increments; reset at 00:00 UTC.
5. **Concrete gate/error HTTP contract** (replaces "402-style"): `402 {error:"no_entitlement"}` → paywall · `429 {error:"daily_cap","resets_at":ISO8601}` → limit state · `503 {error:"temporarily_unavailable"}` → transient retry (NOT paywall) · `401` → re-auth. The client branches on these distinct codes.
6. **Minimal endpoint surface:** `POST /transcribe`, `POST /chat` (both gated: entitlement + cap), `POST /rc-webhook`, `GET/PUT /state`, `POST /account/delete`.

## Consequences

- One-platform solo-maintainability; the relay mirrors the existing client fetch idiom, easing the refactor.
- The open-wallet risk is closed by construction: no public path spends money without entitlement + cap + rate-limit + circuit-breaker.
- The client has a testable, unambiguous gate contract; offline/paywall/cap/outage are distinguishable.
- Cost: ~$0 pre-revenue (free tier) → ~$25/mo Supabase Pro; OpenAI usage dominates.

## Acceptance gate (numeric)

Accept iff, before any public (non-owner) cutover: the global circuit-breaker, per-IP/secret rate-limit, and rotatable secret are all live (3 of 3); a load test confirms an unauthenticated/unentitled caller can spend **$0** of OpenAI/Anthropic budget (entitlement gate rejects 100% of unentitled `/transcribe` and `/chat` calls); and the client correctly branches on **all 4** distinct status codes (402/429/503/401) in test.

## Reversal trigger (numeric)

Revisit the Supabase-single-platform choice if Edge Function cold-start or relay latency adds **> 500 ms** p95 to the STT round-trip in production, or if hosting cost exceeds **2×** the projected Supabase Pro line at the first paying cohort — either would justify re-evaluating Cloudflare Workers + separate DB.
