# Delve 4 — Productization & Monetization Architecture for Isshin

## Domain

Isshin (`index.html`, single-file vanilla-JS PWA, ~1.1MB, no backend, no build) is today a personal study tool gated on a **bring-your-own OpenAI/Anthropic API key** (stored in `localStorage`). The owner ([[project_japanese_trainer_commercial]]) is taking it to market as a **paid product**: a **subscription** app distributed on the **Apple App Store + Google Play**, with paid user acquisition via **Facebook ads**.

The load-bearing blocker, stated plainly: **a customer who arrives from an ad will not paste an API key.** The app must do the Whisper/AI calls on the user's behalf, behind an account they pay for. That single requirement pulls in a backend, accounts, cloud data sync, in-app subscriptions, a native wrapper, and ad instrumentation — none of which exist yet.

This delve **locks the architecture** for that transformation. It is a design/decision delve (Opus reasoning + adversary panel → an implementation-ready spec + ADRs), **not** an external market scan (hydra-research is miscalibrated for this non-AI-coding domain — verified this session). It reasons from the existing code and well-established product patterns; genuinely-current external specifics (exact store cuts, ATT mechanics) are flagged for a targeted web-search top-up at synthesis, not scraped by lanes.

**Ground truth / constraints carried in:**
- The app must stay **shippable incrementally** — the working hands-free loop must never be broken mid-migration. Staged rollout, not a big-bang rewrite.
- Decisions already locked by the owner (2026-06-28): **subscription** model; **native app stores** distribution. These are inputs, not open questions.
- Native digital subscriptions generally **must** use Apple/Google in-app purchase (15-30% cut), **not** Stripe-in-app — the architecture must assume IAP.
- The hands-free voice drill loop **is** the product [[project_japanese_trainer_scope_decision]]; kana-only core UX [[feedback_no_kanji]]; universal-phone design, not Pixel-only [[project_japanese_trainer_commercial]].
- The core STT loop reliability work is a **separate, parallel, gating** functional track — not in scope here, but this delve must not assume it away.

## Stacked REVISED callouts

None binding. This is the first round of a new delve.

## Primary

**Mode:** Opus-only (design/decision/prose → an implementation-ready spec a later `/hydra-forge` builds from).

### Investigation tasks

Each ends in a **final lock**, not a discussion. Each lock must state cost, build-effort, and the staged-migration implication.

1. **Backend stack & host — LOCK one.** What runs the API proxy (audio → Whisper, text → AI), holds the secret keys, and validates IAP receipts? Candidates: serverless (Cloudflare Workers / Vercel Functions / Supabase Edge Functions) vs a small always-on Node service (Railway / Render / Fly). Optimize for: cheap at low volume, can stream/relay audio to OpenAI within timeout limits, trivial to attach auth, solo-maintainable. Lock one + name the audio-relay approach (multipart passthrough vs presigned upload).

2. **Auth & accounts + data migration — LOCK one.** How users sign in (email/password, magic link, Google/Apple sign-in) and how per-user state (SRS `state.stats`, `state.settings`, decks) moves from `localStorage` to cloud sync. Candidates: Supabase (auth+Postgres), Firebase (auth+Firestore), Clerk/Auth0 + own DB. Lock one + define the **migration path for the owner's existing localStorage data** and an offline-first sync stance (the app must still work mid-drill on a flaky connection).

3. **Subscription / IAP layer — LOCK one.** Native stores force Apple/Google IAP for digital subscriptions. RevenueCat (cross-platform abstraction) vs direct StoreKit 2 + Play Billing. Define: entitlement gating in the client, **server-side receipt validation**, free-trial mechanics, and restore-purchases. Lock one.

4. **Native wrap — LOCK one.** How the single-file web app becomes two store binaries. Candidates: Capacitor (iOS+Android, reuses `index.html` in a WebView), TWA (Android-only), PWABuilder. Enumerate required native plugins (microphone, IAP/RevenueCat, Meta SDK, push notifications, secure storage). Lock one + the app-shell structure.

5. **Client → server refactor of the PWA — LOCK the approach.** How `index.html` stops calling `api.openai.com` directly and instead calls the owned backend; how the BYO-key Settings cards (`anthropicKeyInput`, `openaiKeyInput`) are removed/replaced; how the `_whisperTranscribe`/`_coachCall`/`_convoCall` fetch idioms are redirected. Must be **staged** so each step ships without breaking the live app. Lock the sequence.

6. **Unit economics & pricing — LOCK a band.** Model per-user monthly cost (Whisper @ ~$0.003/min × usage + AI turns + hosting) against subscription price, the ~30% store cut, and a plausible Facebook cost-per-acquisition. Lock a **price band** and any **usage caps / fair-use limits** that protect margin, plus the trial length that balances conversion vs free AI spend.

7. **Meta ads instrumentation & compliance — LOCK the minimum.** What the native app needs for Facebook App Promotion campaigns: Meta SDK + standard app events (install, signup, trial-start, subscribe), iOS **ATT prompt + SKAdNetwork/AEM** setup, and the **privacy policy + data-use disclosures** Meta and the app stores require (voice audio sent to OpenAI; account/payment data). Lock the minimum viable set.

### Output

Primary doc: `docs/delve-cycles/4-productization-architecture.md`

Sections (in order):
1. Charter — scope + ground truth + the locked owner decisions
2. Method — Opus-only + adversary panel + synthesis ownership
3. Backend stack & host (task 1)
4. Auth, accounts & data migration (task 2)
5. Subscription / IAP layer (task 3)
6. Native wrap (task 4)
7. Client→server refactor sequence (task 5)
8. Unit economics & pricing (task 6)
9. Meta ads instrumentation & compliance (task 7)
10. Implementation sketch — the staged roadmap (phase order, what ships each phase, which existing `index.html` functions change), the minimal backend surface (endpoints), and the new state/data model
11. Decisions reached (locks)
12. Open questions still open (incl. anything needing a live web-search top-up)
13. Foundation doc updates
14. ADR proposals (framed; filed PENDING in synthesis)

## Adversaries

### Adversary 1: devils-advocate (LEAD)
**Read:** primary doc, charter, `index.html` (the fetch idioms `_whisperTranscribe` ~5781, `_coachCall`/`_convoCall`, the Settings key cards ~20626/20647), [[project_japanese_trainer_commercial]].
**Audit:**
1. **Over-engineering attack:** is this buildable and maintainable by a solo, non-professional developer, or does the locked stack assume a team? Is there a radically simpler path to first revenue (e.g. web-first paid beta before the native+IAP lift)?
2. **Unit-economics attack:** at the locked price band, does a heavy daily user actually lose money once Whisper + AI + 30% store cut + ad CAC are summed? Where's the break-even, and what usage cap is really required?
3. **Premature-scale attack:** are we building backend+accounts+IAP+native+ads before proving anyone will pay? What's the cheapest experiment that validates willingness-to-pay first?
4. **Apple-rejection risk:** does anything here invite App Store rejection (BYO-key remnants, external-payment links, thin-app rules for WebView wrappers)?
**Output:** `docs/delve-cycles/4-productization-architecture-devils-advocate.md` — ≤400 lines, findings with file:line / section citations.

### Adversary 2: code-reviewer
**Read:** primary doc + `index.html` (the direct-OpenAI fetch sites, the key Settings cards, `state`/`save`/`load` persistence, `_whisperVoiceListen` path).
**Audit:**
1. Does the client→server refactor (task 5) actually fit a 1.1MB single-file app without a build step, or does it force a bundler/framework the project has deliberately avoided?
2. Is the staged migration genuinely non-breaking — can each phase ship while the live app keeps working, including for the owner's existing localStorage data?
3. Auth/sync correctness: offline-first behaviour mid-drill, conflict resolution between local and cloud state, and that secrets never ship in the client bundle.
4. Does the native WebView wrapper correctly expose the microphone + IAP + Meta SDK to the existing JS, or are there platform gaps (iOS WKWebView mic/getUserMedia quirks)?
**Output:** `docs/delve-cycles/4-productization-architecture-code-review.md` — ≤400 lines.

### Adversary 3: qa-tester
**Read:** primary doc.
**Audit:**
1. Cold start from an ad: a brand-new user installs, opens — do they reach a working drill before being asked to pay? Walk the funnel.
2. Migration: the owner (existing localStorage data) updates to the account-based version — is their progress preserved? Walk it.
3. Payment edge cases: trial expiry, failed renewal, restore purchases on a new device, refund — does the app gate correctly each time?
4. Connectivity: subscribed user goes offline mid-session — does the loop degrade sanely (cached drills) or hard-fail now that STT is server-side?
5. Cross-device: same account on phone + tablet — does progress sync without corruption?
**Output:** `docs/delve-cycles/4-productization-architecture-qa-design.md` — ≤400 lines.

## Synthesis

`## Synthesis (Round 1 close — Delve 4)` appended to the primary doc. Verify every adversary citation against `index.html` / the doc; disposition each finding (adopt / contest / defer); lock the final architecture + the staged roadmap. Flag any lock that rests on a possibly-stale external fact for a targeted web-search top-up before it's treated as binding. Foundation doc updates: reflect the productization architecture into project memory [[project_japanese_trainer_commercial]].
ADR proposals likely (filed PENDING under `docs/decisions-pending/`): "Backend & API-proxy architecture", "Auth & cloud-sync stack", "Subscription/IAP layer", "Native wrapper choice", possibly "Pricing & usage-cap model".

## Definition of done
- [ ] Primary doc + all sections incl. a staged implementation roadmap a forge run can build from
- [ ] Explicit lock on each of the 7 tasks (stack, auth, IAP, wrap, refactor, pricing, ads)
- [ ] The migration path for existing localStorage data defined
- [ ] Unit economics modelled to a break-even + price band
- [ ] 3 adversary docs filed
- [ ] Synthesis appended with citation verification + stale-fact flags
- [ ] ADR proposals filed pending
- [ ] User signoff

## Files this delve touches
- `docs/delve-cycles/4-productization-architecture.md` (+ 3 adversary docs) — new
- `docs/decisions-pending/*` — new ADR proposals
- No `index.html` changes in this delve (design only; build is a later `/hydra-forge`)
