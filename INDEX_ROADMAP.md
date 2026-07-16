# Isshin — Roadmap

**Goal:** A **world-class** Japanese *conversation-learning* app → **sellable v1 in the App Store + Play Store**.
Model (Delve 4, owner-locked): subscription ~$8.99/mo, fair-use cap ~300 graded items/day, BYO-key killed.
**Division of labor:** owner drives ads / distribution / willingness-to-pay testing; build effort goes to the product + store-readiness.

North-star metric: users reaching real spoken-conversation ability (Conversational Core %).

---

## Open work (sequenced)

- **Phase 0 · De-sprawl to ONE product** — conversation-first 2-door IA (Home hero + Practice), <90s onboarding, judgment-free spec, spine, staged A–E build. No backend. *The first act of "world-class."* → **spec: `docs/delve-cycles/5-conversation-first-product.md`** (Delve 5, round 1 synthesized; forge brief = its §9; ADR-008/009 pending).
- **Phase 1 · Capped AI proxy + auth** — Supabase Edge Functions proxy w/ global spend ceiling + rate-limit; account/auth; remove BYO-key Settings cards. → `docs/decisions/ADR-004`, `ADR-005`.
- **Phase 2 · Store-readiness product polish** — onboarding, empty states, world-class UX pass, offline behavior, universal-phone (non-Pixel STT/TTS fallbacks).
- **Phase 3 · iOS mic spike** — prove WKWebView `getUserMedia` capture works. **GATES the whole native plan.** → `ADR-007`.
- **Phase 4 · Native wrap + IAP** — Capacitor + RevenueCat entitlement gate (StoreKit 2 / Play Billing). → `ADR-006`, `ADR-007`.
- **Phase 5 · Store submission** — Apple sign-in (Guideline 4.8), ATT + SKAdNetwork, privacy policy, in-app account deletion. → `docs/delve-cycles/4-market-facts.md`.

## Live decisions (awaiting owner signoff)

- **ADR-003 · Progressive vocab access** — non-locking coverage meter *(current)* vs literal hard-lock ("only 1,500 words unlocked"). → `docs/decisions-pending/ADR-003`.
- **ADR-008 · Conversation-first two-door IA** + **ADR-009 · Judgment-free spec** — Delve-5 locks, pending. → `docs/decisions-pending/ADR-008`, `ADR-009`.
- **Deletion veto (blocks Stage E)** — owner: still use `particles`/`similar`/`variations`? One line before any code removal. → Delve 5 §11 OQ #4.

## Recently closed

- Example sentences for 134 function words + 💬 peek (v8.06, **uncommitted**).
- Vocab dedupe + gloss cleanup → 1702 words (v8.04–8.05).
- STT downgraded to a turn-trigger, not a grader (v8.03).
- Conversation mode (おしゃべり) + progressive-vocab meter — **built & shipped**.
