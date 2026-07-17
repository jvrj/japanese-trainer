# ADR-006 — Subscription / IAP layer (RevenueCat, server-side entitlement gate, refund handling)

- **Status:** Accepted (promoted to `docs/decisions/` 2026-06-29 — user signoff)
- **Date:** 2026-06-28
- **Source:** Delve 4 — `docs/delve-cycles/4-productization-architecture.md` (§5; Round 1 synthesis)
- **Supersedes / superseded by:** none

## Context

Native digital subscriptions must use Apple/Google IAP (15–30% cut), not Stripe-in-app. That means two native billing APIs, two receipt-validation flows, and two renewal/grace/refund event models — a heavy surface for a solo developer. The authoritative entitlement check must be server-side (a tampered client must never be able to spend the API budget). The qa-tester found the primary doc covered trial expiry / failed renewal / restore but **omitted the refund path entirely** — a distinct RevenueCat webhook event that fires after the user has consumed the entitlement, with no defined server response or client UX.

## Decision

1. **RevenueCat** as the cross-platform IAP abstraction over StoreKit 2 (iOS) + Play Billing (Android). One SDK + one webhook collapses both billing models — the solo-maintainability lever. Free tier until past a tracked-revenue threshold (exact number is a [STALE-EXTERNAL] top-up).
2. **Authoritative gate is server-side.** The §-ADR-004 proxy checks `entitlements.active` for `auth.uid()` before spending on OpenAI/Anthropic. Client gating is UX-only (show/hide paywall). No entitlement ⇒ no AI call.
3. **Entitlement truth flows from the webhook:** RevenueCat webhook → Supabase Edge Function → upsert `entitlements(user_id PK, active, product_id, expires_at, source, raw_receipt)`. Reconcile store identity ≠ app identity by setting RevenueCat `app_user_id` = Supabase `user_id`.
4. **Refund / cancellation handling (previously absent):**
   - **Refund (`CANCELLATION` with refund / chargeback) →** webhook **immediately** sets `entitlements.active = false`; next gated call returns HTTP 402 (ADR-004 contract) → paywall. No grace.
   - **Voluntary cancel (auto-renew off, not yet expired) →** entitlement **stays active until `expires_at`** (period was paid for).
   - **Billing issue / grace →** keep `active = true` through the RevenueCat-reported grace window, then expire.
   - The client NEVER decides revocation — it is purely webhook-driven.
5. **Trial = 7-day store-native free trial** surfaced via RevenueCat; trial users pass the entitlement gate (trial spend is real spend), so the fair-use cap (ADR-004) applies during trial. A usage-gated free "taste" (first N items) precedes signup/paywall to bound non-converter trial cost.
6. **Restore = RevenueCat `restorePurchases()`** on a new device re-asserts entitlement → server upsert.

## Consequences

- One integration surface for both stores; renewal/grace/refund/restore handled, not hand-rolled.
- Budget cannot be drained by a tampered client (server gate) or by a refunder (immediate revoke).
- All four payment edge cases the charter required (trial expiry, failed renewal, restore, refund) now have defined server + client behaviour.
- IAP is Phase 4 (needs auth + native wrap + server gate); gated behind the web-first paid validation (decision-note).

## Acceptance gate (numeric)

Accept iff all **4** payment edge cases pass an end-to-end test against RevenueCat sandbox — trial-expiry → gate flips to 402, failed-renewal → grace then 402, restore-on-new-device → entitlement re-asserted, refund → `active=false` within one webhook delivery — and **0** of these transitions require a client-side decision (100% webhook-driven).

## Reversal trigger (numeric)

Revisit (toward raw StoreKit 2 + Play Billing direct) if RevenueCat's revenue-share once past free tier exceeds **~1%** of tracked revenue AND monthly tracked revenue is high enough that that share exceeds the cost of maintaining two native billing integrations directly (estimate: revisit above **~$10k/mo** tracked revenue).
