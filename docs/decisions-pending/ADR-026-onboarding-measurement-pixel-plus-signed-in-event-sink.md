# ADR-026 — Onboarding measurement: Pixel owns the wall, signed-in event sink, v1 D1 number

- **Status:** Proposed (pending owner signoff + security review of the RPC)
- **Date:** 2026-09-14
- **Source:** Delve 12 — `docs/delve-cycles/12-onboarding.md` §7, §11.2 (D12-10, D12-11); Round-1 synthesis dispositions DA-1, DA-8, DA-9, CR-3
- **Implements:** pending ADR-014 §5 (instrumented funnel)
- **Security scope:** in the style of `backend/supabase/migrations/0003_sec1_rpc_lockdown.sql`
- **Related:** ADR-024, ADR-025

## Context

`_obLog` only writes on the device, so nothing after account creation is visible to the ad test. A Meta Pixel already reports `PageView` and `StartTrial` per ad set. An anonymous insert endpoint would add an unauthenticated write surface on the $0 free tier, plus a pre-consent device id.

## Decision

1. **Two sources, one job each:**
   - The **Pixel** owns ad click → account (`PageView` → `StartTrial`, the ad-optimisation signal).
   - A **Supabase sink** owns the product funnel after the account.
2. **Sink:** `public.onboard_events(id bigserial, user_id uuid not null, evt text, ms int, meta jsonb, created_at timestamptz default now())`.
   - Written only through a `security definer` RPC granted to `authenticated` (never `anon`).
   - The RPC sets `user_id = auth.uid()`, checks `evt` against an **8-event allowlist**, caps `meta` at **1 KB**, and rate-limits to **≤ 300 events/user/day**.
   - No client select.
   - Client sends in batches that never block; a failure drops silently.
3. **Events:** the 8-event allowlist:

   | Event | Meta |
   |---|---|
   | `signup_done` | method, new, inapp |
   | `name_set` | source |
   | `sticker_shown` | — |
   | `round1_start` | — |
   | `first_word_spoken` | ms_from_load, inapp |
   | `round1_done` | n, mins |
   | `install_card` | action |
   | `d2_open` | check, standalone |

   `signup_done` fires at the same auth choke point as `_metaTrackStartTrialOnce`. Legacy `_obLog` funnel events retire.
4. **Privacy:** the privacy policy gets a paragraph naming the Pixel events and the signed-in product events.
5. **v1 success number (D12-11):** D1 return **≥ 40%** (labelled placeholder). It's measured as the share of `round1_done` accounts that fire `d2_open` on the next local calendar day, over **≥ 50** accounts, split installed vs not.
6. **Trigger rule:** at these cohort sizes, a bar counts as missed only when it is missed by **≥ 10 points in the same direction across two consecutive cohorts**.

## Acceptance gate (numeric)

- Migration probes, **4/4** pass:
  1. an `anon`-role call returns permission denied
  2. an unknown `evt` is rejected
  3. `meta` over 1 KB is rejected
  4. the 301st event in a day for one user is rejected
- Offline client probe: **0** user-visible errors, and the session is unaffected when the sink is unreachable.
- A security review of the RPC and RLS is signed off (**1/1**) before ad spend scales.
- One test cohort shows all **8/8** event types arriving.

## Reversal trigger (numeric)

- Sink insert error rate **> 5%** over any 7 days → fix, or fall back to Pixel-only custom events.
- `onboard_events` growth **> 50 MB/month** (10% of the 500 MB free-tier database) → cut meta or sample events.
- Pixel `StartTrial` and sink `signup_done` counts diverge by **> 20%** in two consecutive cohorts → name one source of truth for account counts in a follow-up decision.
- D1 return **< 30%** (40% placeholder minus 10) in two cohorts of ≥ 50 → test reminder email or web push (Delve 12 OQ-4). This triggers new return work, not a change to this sink.
