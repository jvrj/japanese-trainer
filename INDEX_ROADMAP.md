# Isshin — Roadmap

**Goal:** A **world-class** Japanese *conversation-learning* app → **sellable v1 in the App Store + Play Store**.
Model (Delve 4, owner-locked): subscription ~$8.99/mo, fair-use cap ~300 graded items/day, BYO-key killed.
**Division of labor:** owner drives ads / distribution / willingness-to-pay testing; build effort goes to the product + store-readiness.

North-star metric: users reaching real spoken-conversation ability (Conversational Core %).

---

## Open work (sequenced)

- **Phase 0 · De-sprawl to ONE product** — conversation-first IA, <90s onboarding, judgment-free spec, spine, staged A–E build (A–E shipped v8.08–v8.11). No backend. → parent IA record: `docs/delve-cycles/5-conversation-first-product.md` (its §3 front door superseded by Delve 6; other locks intact per Delve 6 §6.5).
- **Phase 0.5 · Talk-mode orb front door** — canvas orb presence + endless session + Talk-as-boot-screen, gated: the L12a interim probe after stage T2 decides whether the IA flips. **L12a probe status: UNKEYED-TAINTED (2026-07-18 field test ran the canned script) — re-runs KEYED per Delve 7 §8.** → **spec + forge brief: `docs/delve-cycles/6-talk-mode-presence.md`** (Delve 6, round 1 synthesized; forge brief = its §8; ADR-010 pending).
- **Phase 0.6 · Feedback soul + conversation feel** — **F-TRAIN COMPLETE, all five stages SHIPPED 2026-07-18**: F1 patient mic v8.16 · F2 feedback layer v8.17 · F3 honest modes v8.18 · F4 modules v8.19 · F5 anti-robotic v8.20 (OQ-4 injection review PASS → closed). Awaiting: owner keyed field session on **v8.23+** (v8.20–8.22 keyed convo 400-ed on every turn — empty/assistant-first API window, fixed v8.23; the 2026-07-19 field attempt hit this) = the Delve-7 calibration verdict + start of the keyed L12a probe, then OQ-1 ladder tuning + OQ-3 non-Pixel probe. → **spec: `docs/delve-cycles/7-feedback-soul.md`** (ADR-011 pending).
- **Phase 1 · Capped AI proxy + auth** — Supabase Edge Functions proxy w/ global spend ceiling + rate-limit; account/auth; remove BYO-key Settings cards. **Owner-sequenced 2026-07-19: runs AFTER talk-loop depth + store-polish (below).** Pricing working assumption: chess.com-shaped tier — drills free/unlimited, 1 full AI conversation/day free, ~$8.99/mo unlimited; trial length = launch A/B. → `docs/decisions/ADR-004`, `ADR-005`, punch-list items 2–4.
- **Phase 0.7 · Sensei layer + vocab frontier lock** — Delve 8 locks (r1 synthesized 2026-07-19): forge stages S1 card → S2 breath → keyed probe → S3 lock → S4 recap close. → **spec + forge brief: `docs/delve-cycles/8-sensei-vocab.md` §6** (ADR-012/ADR-013 pending).
- **Phase 2 · Store-readiness product polish** — **first sweep SHIPPED v8.25 2026-07-19**: correction-copy style guide (`docs/specs/correction-copy-style-guide.md`, punch item 5) + audit fixes (speak-drill badge, alerts→toasts), store-listing copy draft (`docs/store-listing-copy.md`, item 8), 320px no-overflow verified. Still open: item 7 JP-silence tuning (**waits for keyed field data**, = OQ-1), item 6 hosted-TTS (backlog, needs backend), OQ-3 physical-device probe, offline behavior pass. → `docs/competitive-punch-list-2026-07-18.md`.
- **Phase 3 · iOS mic spike** — prove WKWebView `getUserMedia` capture works. **GATES the whole native plan.** → `ADR-007`.
- **Phase 4 · Native wrap + IAP** — Capacitor + RevenueCat entitlement gate (StoreKit 2 / Play Billing). → `ADR-006`, `ADR-007`.
- **Phase 5 · Store submission** — Apple sign-in (Guideline 4.8), ATT + SKAdNetwork, privacy policy, in-app account deletion. → `docs/delve-cycles/4-market-facts.md`.

## Investigation backlog

- **Japanese STT benchmark** (~$50, ~1wk): Whisper Large-v3 vs Deepgram Nova vs Google on learner audio — gates the Phase-1 transcribe-provider choice. **Owner call 2026-07-19: deferred until the backend scaffold exists.** → punch-list item 1.
- **Hosted-TTS decision** (ElevenLabs / CosyVoice 2 vs device-only) — TTS warmth carries the judgment-free feel; weakest on non-Pixel. → punch-list item 6, folds into Phase 1/2.
- ~~Vocab hard-lock vs coverage meter deep-dive~~ — **RESOLVED by Delve 8 (r1 synthesized 2026-07-19)**: rolling-frontier hard lock + sensei layer → `docs/delve-cycles/8-sensei-vocab.md`; ADR-012/ADR-013 pending signoff.

## Live decisions (awaiting owner signoff)

- **ADR-003 · Progressive vocab access** — its reversal trigger FIRED (owner explicit lock request, 2026-07-19); resolution proposed as ADR-012 below. → `docs/decisions-pending/ADR-003`.
- **ADR-012 · Rolling-frontier vocab hard lock** — resolves/supersedes ADR-003; **explicit signoff item inside: FRONTIER_N 80 vs the owner's verbatim 1,500**. → `docs/decisions-pending/ADR-012-rolling-frontier-vocab-lock.md`.
- **ADR-013 · Sensei teaching layer** — teach card + spoken breath, AMENDS Delve-7 invisibility; stacks on PENDING ADR-011 (one keyed session validates both). → `docs/decisions-pending/ADR-013-sensei-teaching-layer.md`.
- **ADR-010 · Talk-mode orb front door** — supersedes ADR-008's two-door portion, evidence-gated (L12a probe after T2; L12 7-day verdict; L12a re-runs keyed — see its Delve-7 pointer). → `docs/decisions-pending/ADR-010`.
- **ADR-011 · Corrective-feedback layer** — amends ADR-009 rule 5 (judgment-free feedback IN the conversation); owner-authority pre-cohort amendment, keyed-probe acceptance gate. → `docs/decisions-pending/ADR-011`.

## Recently decided

- ADR-008 (two-door IA) + ADR-009 (judgment-free spec) — **Accepted, promoted 2026-07-17** → `docs/decisions/`; deletion veto collected same day (all 4 modes cleared for Stage-E removal).

## Recently closed

- **Talk-loop depth pass** (v8.24, 2026-07-19): topic beats ×14, partner self-disclosure flavor, richer recap ("You said" + topic/partner/minutes) — first of the two owner-sequenced pre-backend tracks; **store-polish is next**.
- **UI chrome language decided + shipped** (v8.22, 2026-07-18): owner call — English-primary chrome, kana demoted to accents; learning content stays kana-only.
- Example sentences for 134 function words + 💬 peek (v8.06, **uncommitted**).
- Vocab dedupe + gloss cleanup → 1702 words (v8.04–8.05).
- STT downgraded to a turn-trigger, not a grader (v8.03).
