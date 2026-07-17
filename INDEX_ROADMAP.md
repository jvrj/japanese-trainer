# Isshin — Roadmap

**Goal:** A **world-class** Japanese *conversation-learning* app → **sellable v1 in the App Store + Play Store**.
Model (Delve 4, owner-locked): subscription ~$8.99/mo, fair-use cap ~300 graded items/day, BYO-key killed.
**Division of labor:** owner drives ads / distribution / willingness-to-pay testing; build effort goes to the product + store-readiness.

North-star metric: users reaching real spoken-conversation ability (Conversational Core %).

---

## Open work (sequenced)

- **Phase 0 · De-sprawl to ONE product** — conversation-first IA, <90s onboarding, judgment-free spec, spine, staged A–E build (A–E shipped v8.08–v8.11). No backend. → parent IA record: `docs/delve-cycles/5-conversation-first-product.md` (its §3 front door superseded by Delve 6; other locks intact per Delve 6 §6.5).
- **Phase 0.5 · Talk-mode orb front door** — canvas orb presence + endless session + Talk-as-boot-screen, gated: the L12a interim probe after stage T2 decides whether the IA flips. → **spec + forge brief: `docs/delve-cycles/6-talk-mode-presence.md`** (Delve 6, round 1 synthesized; forge brief = its §8; ADR-010 pending).
- **Phase 1 · Capped AI proxy + auth** — Supabase Edge Functions proxy w/ global spend ceiling + rate-limit; account/auth; remove BYO-key Settings cards. → `docs/decisions/ADR-004`, `ADR-005`.
- **Phase 2 · Store-readiness product polish** — onboarding, empty states, world-class UX pass, offline behavior, universal-phone (non-Pixel STT/TTS fallbacks).
- **Phase 3 · iOS mic spike** — prove WKWebView `getUserMedia` capture works. **GATES the whole native plan.** → `ADR-007`.
- **Phase 4 · Native wrap + IAP** — Capacitor + RevenueCat entitlement gate (StoreKit 2 / Play Billing). → `ADR-006`, `ADR-007`.
- **Phase 5 · Store submission** — Apple sign-in (Guideline 4.8), ATT + SKAdNetwork, privacy policy, in-app account deletion. → `docs/delve-cycles/4-market-facts.md`.

## Live decisions (awaiting owner signoff)

- **ADR-003 · Progressive vocab access** — non-locking coverage meter *(current)* vs literal hard-lock ("only 1,500 words unlocked"). → `docs/decisions-pending/ADR-003`.
- **ADR-010 · Talk-mode orb front door** — supersedes ADR-008's two-door portion, evidence-gated (L12a probe after T2; L12 7-day verdict). → `docs/decisions-pending/ADR-010`.

## Recently decided

- ADR-008 (two-door IA) + ADR-009 (judgment-free spec) — **Accepted, promoted 2026-07-17** → `docs/decisions/`; deletion veto collected same day (all 4 modes cleared for Stage-E removal).

## Recently closed

- Example sentences for 134 function words + 💬 peek (v8.06, **uncommitted**).
- Vocab dedupe + gloss cleanup → 1702 words (v8.04–8.05).
- STT downgraded to a turn-trigger, not a grader (v8.03).
- Conversation mode (おしゃべり) + progressive-vocab meter — **built & shipped**.
