# Delve 4 — Productization & Monetization Architecture for Isshin

> Primary investigation doc. Round 1. Opus-only design/decision delve.
> Status: PRIMARY drafted; adversary panel + synthesis pending.

---

## 1. Charter

### Scope
Lock the architecture that turns **Isshin** — today a single-file (`index.html`, ~1.1MB vanilla-JS PWA, no backend, no build step) study tool gated on a **bring-your-own (BYO) API key** in `localStorage` — into a **paid subscription product** distributed on the **Apple App Store + Google Play**, acquired via **Facebook/Meta ads**.

### Ground truth (verified against the code this session)
- **The blocker, stated plainly:** a customer who arrives from an ad will not paste an API key. The app must perform Whisper/AI calls on the user's behalf, behind a paid account. That single requirement pulls in: a backend, accounts, cloud sync, in-app purchases (IAP), a native wrapper, and ad instrumentation — none of which exist.
- **Current external API call sites (the surface to redirect):**
  - `_whisperTranscribe(blob, hint)` — `index.html:5801`. POSTs `multipart/form-data` to `https://api.openai.com/v1/audio/transcriptions` (`index.html:5814`), model `gpt-4o-mini-transcribe`, `Authorization: Bearer ` + `whisperKey()` (`:5816`). **This is the cost-dominant call.** ~$0.003/min (model already cost-optimized from whisper-1, per the in-code comment `:5805`).
  - `_coachCall(promptStr)` — `index.html:9409`; POSTs to `https://api.anthropic.com/v1/messages` (`:9413`).
  - `_convoCall(messages, systemStr)` — `index.html:9512`; POSTs to `https://api.anthropic.com/v1/messages` (`:9516`). Deliberately duplicates `_coachCall`'s body (`:9504-9505`).
  - Additional Anthropic fetch sites at `:4730`, `:15792`, `:21184` (ask-Claude / misc).
  - **CORRECTED (synthesis, CR-2):** only `_convoCall` has a scripted no-key fallback (`_convoScript`, `:9617/:9722/:9723`). `_coachCall` (`:9411`) **hard-throws `new Error('nokey')`** with no fallback; its caller (`:10217`) surfaces the string "The coach needs a Claude API key" (`:10225`). So the coach / Build-Mode AI-QA path needs an **explicit offline + no-entitlement branch** added in the refactor — it is NOT already covered.
- **BYO-key UI to remove/replace:** Settings cards `anthropicKeyInput` (`index.html:20667`) and `openaiKeyInput` (`:20717`), persisted via the save handlers at `:20774` / `:20798`. Copy at `:20666` / `:20723` explicitly tells the user the key is stored in localStorage and audio goes "directly to api.openai.com".
- **Persistence model to migrate:** `save()` at `index.html:3418-3437` writes **16** discrete `localStorage` keys (CORRECTED, CR-3): `LS.words`, `LS.stats`, `LS.settings`, `LS.notes`, `LS.logs`, `LS.streak`, `LS.askClaude`, `LS.formStats`, `LS.kanaStats`, `LS.sentenceStats`, `LS.phraseStats`, `LS.particleStats`, `LS.variationStats`, **`LS.similarStats`, `LS.snapshots`, `LS.convo`**. All SRS progress lives here. This is a **bag of independent JSON blobs**, not a normalized model — a fact that shapes the sync design. Note: `LS.convo` (in-flight conversation session state) and `LS.logs` (diagnostic ring buffer) are **ephemeral / device-local and must be EXCLUDED from cloud sync** (§4).

### Locked owner decisions (inputs, NOT open questions) — 2026-06-28
From [[project_japanese_trainer_commercial]]:
- **Business model = subscription**, target band ~$5–10/mo (recurring revenue covers recurring per-user Whisper/AI cost).
- **Distribution = native app stores** (Apple App Store + Google Play), not web-only.
- Native digital subscriptions **must** use Apple/Google IAP (15–30% cut), **not** Stripe-in-app.
- **Universal-phone** design (any modern smartphone), not Pixel-only.
- The hands-free voice drill loop **is** the product [[project_japanese_trainer_scope_decision]]; kana-only core UX [[feedback_no_kanji]].
- STT reliability is a **separate, parallel, gating** functional track — out of scope here, but this delve must not assume it away.

### Non-negotiable constraint
The app must stay **shippable incrementally** — the live hands-free loop must never break mid-migration. **Staged rollout, not a big-bang rewrite.**

---

## 2. Method

- **Primary:** Opus-only reasoning from the existing code + well-established product patterns. No external scan lanes (hydra-research is miscalibrated for this non-AI-coding domain — verified this session). Genuinely-current externals (exact store cuts, ATT/SKAN mechanics, RevenueCat pricing tiers) are **flagged for a targeted web-search top-up at synthesis**, not treated as binding here.
- **Adversary panel (round 1):** `devils-advocate` (LEAD — over-engineering / unit-economics / premature-scale / Apple-rejection), `code-reviewer` (refactor fit / non-breaking staging / sync correctness / WebView platform gaps), `qa-tester` (cold-start funnel / migration / payment edges / connectivity / cross-device).
- **Synthesis ownership:** synthesis verifies every adversary citation against `index.html` and this doc, dispositions each finding (adopt / contest / defer), locks the final architecture + staged roadmap, flags any stale-external lock, files ADR proposals PENDING under `docs/decisions-pending/`, and patches foundation memory [[project_japanese_trainer_commercial]].
- **ADR posture:** ADR proposals are **framed as placeholders** in §14 of this doc; they are **filed** (as files) only in the synthesis step, never auto-promoted to `docs/decisions/`.

---

## 3. Backend stack & host (Task 1)

### The job
A backend must: (a) proxy audio → Whisper and text → AI, holding the real API keys server-side; (b) authenticate the caller as a paying user; (c) validate IAP receipts; (d) be cheap at low volume and solo-maintainable.

### The decisive constraint: the audio relay
`_whisperTranscribe` ships a `multipart/form-data` blob (`webm`/`mp4`, typically a few seconds, well under ~1MB) and waits synchronously for the transcription. The backend must accept that upload, forward it to OpenAI, and return JSON — within request-timeout limits.

- A short utterance (~2–8s, sub-MB) **fits comfortably in a single request** on every serverless platform. Cloudflare Workers' request body limit (100MB on paid, 100MB free) and ~30s+ CPU budget on paid easily cover a one-shot Whisper relay. No presigned-upload dance is needed for utterance-length audio.
- **Presigned upload (client → object storage → backend reads) is rejected** for the live drill path: it adds a round-trip and latency to the single most latency-sensitive call, for a payload that already fits inline. (Keep it on the table only if a future "upload a long recording" feature appears — out of scope.)

### LOCK
**Backend = Supabase Edge Functions (Deno) + Supabase Postgres + Supabase Auth — one platform.** Audio relay = **multipart passthrough** (client → Edge Function → OpenAI, streamed/buffered in-function, JSON back).

### Why
- **One vendor covers Task 1 + Task 2.** Auth, Postgres (cloud state), and the function runtime are the same project — the single biggest solo-maintainability win. No glue between an auth vendor and a separate compute host.
- **Cheap at low volume:** free tier covers pre-revenue and the first paying cohort; Edge Functions billed per-invocation. The cost that matters is OpenAI usage (§8), not hosting.
- **Trivial auth attach:** Edge Functions receive the Supabase JWT; row-level security (RLS) gates Postgres by `auth.uid()` with near-zero code.
- **Deno fetch** forwards `FormData` to OpenAI with no SDK — mirrors the existing client fetch idiom almost line-for-line, easing the refactor (Task 5).

### Runner-up & why not
- **Cloudflare Workers + (separate) auth + (separate) DB** — best raw latency/cost, but forces a second vendor for auth+DB and the glue between them; loses the one-platform win.
- **Always-on Node (Railway/Render/Fly)** — simplest mental model, but a paid idle box from day one and you still bolt on auth+DB separately. Rejected for low-volume cost + ops surface.

### Cost / effort / staged implication
- **Cost:** ~$0 pre-revenue (free tier); ~$25/mo Supabase Pro once past free limits. OpenAI spend dominates (§8).
- **Build effort (solo):** ~3–5 focused days for the two relay endpoints + receipt-validation endpoint + RLS schema.
- **Staged implication:** the proxy can ship **before** account auth exists, letting the client cut over off BYO-key first; account auth is layered on top (Phase 2) without re-touching the relay — **BUT NOT uncapped/unauthed (see security gate below).**

### Security gate — NO uncapped/unauthed public relay (REVISED, synthesis DA-1, FATAL)
The original §7 Step A wording ("works with no user key for everyone" behind only a "soft secret") would expose an internet-reachable endpoint that spends the owner's real OpenAI+Anthropic money with no account, no cap, no rate-limit for the entire Phase 1→Phase 4 window — a single scraper drains the budget. **Hard invariant (folded into ADR-004):** the proxy MUST NEVER be a publicly-reachable uncapped relay. Before ANY public cutover, `/transcribe` and `/chat` must enforce, from Phase 0:
1. a **hard global daily spend ceiling** (circuit-breaker that 503s when the day's OpenAI+Anthropic spend exceeds a fixed owner-set cap),
2. a **per-IP / per-soft-secret rate limit** (e.g. ≤ N requests/min and ≤ the §8 daily-item cap), and
3. a **rotatable soft secret** (not the only line of defence).
Until those three exist, the public cutover does NOT happen — the owner-only BYO-key path stays the live path (the owner keeps his key) and the relay is exercised by the owner alone. Public "no-key for everyone" is gated on the per-user cap + entitlement gate (Phase 2+), not Phase 1.

### Entitlement-gate / cap response contract (LOCK, synthesis QA-4)
Replaces the ambiguous "402-style": the gate returns concrete, testable HTTP:
- **No active entitlement** → **HTTP 402** `{ "error": "no_entitlement" }` → client shows paywall.
- **Daily fair-use cap reached** → **HTTP 429** `{ "error": "daily_cap", "resets_at": "<ISO8601>" }` → client shows the gentle "today's practice limit" state.
- **Global circuit-breaker tripped** → **HTTP 503** `{ "error": "temporarily_unavailable" }` → client shows a transient retry state, NOT a paywall.
- **Auth missing/invalid** → **HTTP 401**. The client MUST branch on these distinct codes (402≠403≠429≠503).

---

## 4. Auth, accounts & data migration (Task 2)

### LOCK
- **Auth = Supabase Auth** with **Sign in with Apple + Sign in with Google + email magic-link** (no passwords).
  - *Apple sign-in is mandatory* per App Store Review Guideline 4.8 once any third-party/social login is offered; including it from day one avoids a rejection loop.
  - Magic-link is the low-friction email fallback; no password storage to secure.
- **Cloud state = Supabase Postgres**, one row per user keyed by `auth.uid()`, RLS-enforced.
- **Sync model = offline-first, last-write-wins per blob, with a `state` JSONB column mirroring today's localStorage bag.**

### Data model (deliberately minimal — match today's shape)
Today's persistence is a set of independent JSON blobs (§1). Do **not** prematurely normalize SRS rows into relational tables — that is a large refactor with no near-term payoff and high regression risk on a working app.

```
profiles        ( user_id PK, created_at, plan, trial_ends_at, store_origin )
user_state      ( user_id PK→profiles, state_json JSONB, updated_at, schema_version )
entitlements    ( user_id PK, active BOOL, product_id, expires_at, source, raw_receipt )
```
`state_json` holds the same keys `save()` writes today (`stats`, `settings`, `words(user)`, `streak`, `formStats`, …). The client keeps `localStorage` as the **working cache** and treats Postgres as the **sync target** — minimal change to the existing read/write paths.

### Sync stance (offline-first, non-breaking)
- **Read:** on launch, `localStorage` is authoritative for instant boot; a background fetch pulls `user_state.state_json`; if cloud `updated_at` is newer, merge-in (see conflict rule) and re-render.
- **Write:** `save()` keeps writing localStorage synchronously (the loop never blocks on network), and **debounced** (e.g. 5–10s after activity, and on `visibilitychange`/`pagehide`) pushes the merged blob to Postgres.
- **Conflict resolution (REVISED, synthesis DA-7 + QA-6):** the original "LWW-per-key ≈ monotonic" claim was **false by construction** — blob LWW *replaces* a key's value, it does not *add*, so two offline sessions on two devices end with the later sync silently discarding the earlier device's whole study session for that subsystem. Progress loss is the cardinal sin for a learning app. The fix is the middle option between blob-LWW and full CRDT: **per-record / per-counter MAX-or-additive merge for SRS state.**
  - **SRS counter & due-date fields** (per-word `reps`, `lapses`, `interval`, `ease`, `lastSeen`, `due`, streak counts, per-mode `*Stats` tallies): merge by **max** on monotonic counters and **most-recent-review-wins per item** on scheduling fields — keyed at the **per-item** level, not the per-subsystem blob. This delivers the monotonic property that was merely *asserted* before.
  - **Genuinely scalar settings** (e.g. `settings`, theme, voice engine): plain LWW by `updated_at` is fine — last edit wins, no progress to lose.
  - This is a bounded, well-understood merge (no vector clocks); full CRDT remains rejected as over-engineering.
- **Keys synced vs excluded (LOCK, synthesis CR-3):** SYNC = `words(user)`, `stats`, `settings`, `notes`, `streak`, `askClaude`, `formStats`, `kanaStats`, `sentenceStats`, `phraseStats`, `particleStats`, `variationStats`, `similarStats`, `snapshots`. **EXCLUDE from sync** = `LS.convo` (in-flight conversation session state — restoring it on device B would revive an orphaned conversation with no server-side AI context) and `LS.logs` (device-local diagnostic ring buffer, no cross-device value).
- **Mid-drill flaky connection:** because the loop reads/writes localStorage only, a dropped connection **cannot** interrupt a drill; sync simply retries later. The one thing that DOES need the network mid-drill is the STT/AI call itself (§7 covers degradation).

### Migration path for the owner's existing localStorage data
The owner already has real SRS history in localStorage on his Pixel. Path:
1. The account-aware build detects existing localStorage on first authenticated launch and **no** `user_state` row → treats local as seed, uploads it as the initial `state_json` (`schema_version` stamped). **No data loss, no manual export.**
2. If a `user_state` row already exists (e.g. signed in on a fresh device first), apply the per-key merge rule rather than blind overwrite.
3. A one-time `schema_version` lets future server-side migrations run without client coordination.

**Migration failure handling (LOCK, synthesis QA-5):** the seed upload is **non-destructive and idempotent**. `localStorage` stays authoritative throughout; the client only sets a local `migrated:true` flag **after** the server confirms the write (HTTP 2xx). On any failure (network error, timeout, oversized blob) it **retries with backoff** and keeps running on `localStorage` — never blocks the drill, never deletes local data, never marks migrated. Oversized blobs are chunked or rejected with a surfaced warning, not silently dropped. Net: the no-data-loss guarantee holds even when the first upload fails.

### Cost / effort / staged implication
- **Cost:** included in the Supabase line from §3.
- **Build effort:** ~3–4 days (auth wiring in the native shell + the sync read/write/merge layer + the migration seed).
- **Staged implication:** auth + sync ship **after** the proxy cutover (Phase 2), so the app can already be "no-BYO-key" before accounts exist. Until accounts land, the proxy uses a soft app-level secret; accounts replace it.

---

## 5. Subscription / IAP layer (Task 3)

### LOCK
**RevenueCat** as the cross-platform IAP/subscription abstraction over **StoreKit 2 (iOS) + Play Billing (Android)**, with **server-side entitlement validation via RevenueCat webhooks → Supabase `entitlements`**.

### Why RevenueCat over raw StoreKit 2 + Play Billing
- Two native billing APIs, two receipt-validation flows, two renewal/grace/refund event models — RevenueCat collapses both behind one SDK + one webhook, which is exactly the solo-maintainability lever the whole delve optimizes for.
- Free tier covers up to a meaningful monthly tracked-revenue threshold (flagged for a synthesis top-up on the exact current number) — effectively $0 until the product is actually earning.
- Restore-purchases, free-trial eligibility, grace periods, and cross-platform entitlement unification are handled, not hand-rolled.

### Entitlement gating (the truth flow)
1. RevenueCat SDK in the native shell exposes "is the `pro` entitlement active?" to the WebView JS via a small bridge.
2. **Client gating is UX only** (show/hide paywall). The **authoritative** gate is server-side: the proxy endpoints (§3) check `entitlements.active` for `auth.uid()` before spending a cent on OpenAI. **No entitlement ⇒ no Whisper/AI call.** This is what prevents a tampered client from draining the API budget.
3. RevenueCat **webhook → a Supabase Edge Function → upsert `entitlements`** keeps the server truth current on purchase/renewal/cancel/refund/billing-issue.

### Free trial / restore
- **Trial:** store-native introductory free trial (e.g. 7 days) configured in App Store Connect / Play Console and surfaced through RevenueCat. Server records `trial_ends_at`; **trial users still pass the entitlement gate** (RevenueCat reports trial as active entitlement) — so trial spend is real OpenAI spend and must be capped (§8).
- **Restore:** RevenueCat `restorePurchases()` on a new device re-links the store account → re-asserts entitlement → server upsert. Works independently of the app account (store identity ≠ app identity; reconcile by associating RevenueCat `app_user_id` = Supabase `user_id`).
- **Refund / cancellation (LOCK, synthesis QA-3 — previously absent):** RevenueCat fires distinct webhook events for `CANCELLATION` (refund / store-initiated revoke) and `EXPIRATION`. Policy:
  - **Refund (`CANCELLATION` with refund) →** the webhook handler **immediately sets `entitlements.active = false`** (the user consumed/charged-back the entitlement; no grace). The next server-gated `/transcribe`/`/chat` returns **HTTP 402** and the client shows the paywall.
  - **Voluntary cancel (auto-renew off, not yet expired) →** entitlement **stays active until `expires_at`** (the user paid for the period); no immediate revoke.
  - **Billing issue / grace period →** RevenueCat reports the entitlement as in grace; keep `active = true` until grace ends, then expire. All three are driven solely by the webhook → `entitlements` upsert; the client never decides revocation.

### Cost / effort / staged implication
- **Cost:** $0 until past RevenueCat's free revenue threshold; then a % of tracked revenue (synthesis to confirm current tier).
- **Build effort:** ~3–5 days (store product config, SDK bridge, webhook→entitlements function, paywall UI, server gate).
- **Staged implication:** IAP is **Phase 4** — it can only ship after the native wrap (Phase 3) and the server gate (needs auth, Phase 2). Until then the app is free/limited.

---

## 6. Native wrap (Task 4)

### LOCK (CONDITIONAL — synthesis DA-8)
**Capacitor** (one codebase → iOS + Android), wrapping the existing `index.html` in a `WKWebView`/Android `WebView`. Not TWA (Android-only; no iOS), not PWABuilder (thinner control over native plugins).
**The lock is CONDITIONAL on a Phase-3 spike that proves iOS `WKWebView` `getUserMedia` mic capture works under Capacitor 6+ against the actual `_whisperVoiceListen` path.** Capacitor remains the chosen wrapper regardless (no better cross-platform option), but because "any platform gap blocks the entire native plan" (§12), the mic spike is the **first task of Phase 3** and gates the rest of the native lift — if it fails, the fallback is a native-recorder Capacitor plugin feeding the existing transcribe flow, not a different wrapper.

### App-shell structure
```
isshin-app/
  ios/            (Capacitor iOS project — Xcode, App Store build)
  android/        (Capacitor Android project — Gradle, Play build)
  www/
    index.html    (the EXISTING app, near-verbatim — the WebView loads this)
  capacitor.config.ts
  package.json    (Capacitor CLI + plugins only; the app itself stays build-free)
```
The single-file app is copied into `www/` and loaded locally by the WebView (no remote URL → avoids Apple's "thin web wrapper" rejection risk; the binary genuinely contains the app). Capacitor adds a thin native layer; the ~1.1MB `index.html` keeps shipping **with no bundler/framework imposed on the app code itself**.

### Required native plugins
- **Microphone / getUserMedia:** Capacitor surfaces native mic permission; on iOS `WKWebView` `getUserMedia` works from Capacitor 6+ with `NSMicrophoneUsageDescription` set. **(Flagged for verify — historic iOS WKWebView mic quirks; adversary code-reviewer must confirm against the `_whisperVoiceListen` path.)**
- **IAP:** `@revenuecat/purchases-capacitor`.
- **Meta SDK:** Capacitor plugin / native Facebook SDK for app events + SKAdNetwork (§9).
- **Push notifications:** `@capacitor/push-notifications` (optional v1 — retention lever, not launch-critical).
- **Secure storage:** `@capacitor/preferences` (or Keychain/Keystore) for the session token; **the real OpenAI/Anthropic keys never reach the device** (they live only in the backend).

### Cost / effort / staged implication
- **Cost:** Apple Developer $99/yr + Google Play $25 one-time.
- **Build effort:** ~4–7 days to a first installable build on both stores (most of it iOS signing/provisioning + store metadata, not code).
- **Staged implication:** Phase 3 — wrap can happen **as soon as** the app no longer needs BYO-key (Phase 1 cutover), in parallel with auth (Phase 2). Wrapping does not require IAP to exist yet (can wrap a free/limited build first).

---

## 7. Client → server refactor sequence (Task 5)

### Principle
The refactor is a **localized redirect of three fetch idioms + removal of two Settings cards**, NOT a rewrite. The single-file, no-build architecture is **preserved**. Each step ships independently and keeps the live app working.

### The change set (concrete)
1. **Add a tiny config + auth-header helper** near the top of the script: `const API_BASE = '<edge-fn-url>';` and `async function _authedFetch(path, opts)` that injects the session token (Phase 1: a soft app secret; Phase 2: the Supabase JWT). One new function, ~15 lines.
2. **Redirect `_whisperTranscribe` (`:5814`)** from `https://api.openai.com/v1/audio/transcriptions` to `${API_BASE}/transcribe`, sending the **same `FormData`** but dropping the `Authorization: Bearer whisperKey()` header (server holds the key). Server returns the identical `{text}` JSON shape, so downstream hallucination filters (`:5826`/`:5835`) are untouched.
2a. **CRITICAL — rewrite the `whisperStatus()` / `whisperAvailable()` routing gate (synthesis CR-1, was missing).** `_buildVoiceListen` (`:15567-15572`) only dispatches to `_whisperVoiceListen` → `_whisperTranscribe` **when `whisperAvailable()` is true**, and `whisperAvailable()` → `whisperStatus()` returns `{ok:false}` whenever `!whisperKey()` (`:5640`). After the local key is removed, `whisperKey()` is permanently empty ⇒ `whisperAvailable()` is permanently false ⇒ the app silently routes every user to the browser Web Speech engine and **the redirect in step 2 is dead code** — the keystone "works with no user key" claim is NOT met. **Fix:** `whisperStatus()` must check **entitlement + connectivity (`navigator.onLine`, MediaRecorder support)** instead of local key presence. This is an explicit, required Phase-1 step, not optional.
3. **Redirect `_coachCall` (`:9413`) and `_convoCall` (`:9516`)** from `https://api.anthropic.com/v1/messages` to `${API_BASE}/chat`; server forwards to Anthropic and returns the same response shape. The duplicated body across the two functions is fine — both just swap URL + drop the key header.
4. **Redirect the remaining Anthropic sites** (`:4730`, `:15792`, `:21184`) through `/chat` the same way (or consolidate later — not required for cutover).
5. **Remove/replace the BYO-key Settings cards** (`anthropicKeyInput` `:20667`, `openaiKeyInput` `:20717`) and their save handlers (`:20774`, `:20798`). Replace with an **account / subscription** card (sign-in state, manage subscription, restore purchases). Update the now-false copy at `:20666`/`:20723`. **Apple-rejection note:** BYO-key remnants and any "buy a key elsewhere" text must be fully gone before store submission.
6. **`whisperKey()` / `key`-gated branches:** the `_convoCall` no-key fallback (`_convoScript`, `:9617`/`:9722`) becomes the **offline degradation path** rather than a BYO-key absence path — keep it (see degradation below). **`_coachCall` (`:9411`) currently HARD-THROWS `'nokey'` with NO fallback (synthesis CR-2)** — add an explicit branch there too: on offline or no-entitlement it must surface the same graceful offline/paywall state, not the raw "needs a Claude API key" error string (`:10225`), which is BYO-key-era copy that must be removed.

### Staged sequence (each ships live)
- **Step A (Phase 1):** stand up `/transcribe` + `/chat` behind a soft secret; flip the three fetch URLs; the app now works **with no user key** for everyone. Old BYO-key path can stay as a hidden fallback for one release to de-risk, then deleted.
- **Step B (Phase 2):** swap the soft secret for the real Supabase JWT once auth exists; add the server entitlement gate.
- **Step C (Phase 4):** remove BYO-key UI; add the account/subscription card.

### Cold-start funnel — install → first working drill (LOCK, synthesis QA-1)
Walked explicitly so it is testable. During the **Phase 1→Phase 4 window** (no accounts/paywall yet) cold-start is trivial: install → open → drill works (capped relay). The **launch (Phase 4+) funnel** is:
1. **Install from ad → open.** App opens straight into the hands-free loop — **no signup wall first.**
2. **A bounded free "taste" before any account/paywall:** the user gets **N free graded items** (lock N at the §8 trial-economics figure, e.g. ~20–30 items) on a device-scoped anonymous quota, so they feel the loop working before being asked for anything. (Usage-gated taste, not a 7-day unrestricted free-for-all — see §8 QA on trial abuse.)
3. **At the taste limit →** prompt **Sign in (Apple/Google/magic-link)** then the **paywall / start-trial** (RevenueCat). Trial start grants entitlement; the loop continues.
4. **Entitlement gate states** the client must handle from this point: 402 (no entitlement → paywall), 429 (daily cap → "come back tomorrow"), 503 (circuit-breaker → retry), 401 (re-auth). See §3 contract.

### Degradation when offline / unsubscribed (interacts with §5 gate) — acceptance criteria (LOCK, synthesis QA-2)
Concrete, testable terms (the original prose was undefined):
- **Offline detection is PROACTIVE:** `navigator.onLine === false` (and the `offline`/`online` events) flips a UI banner **before** an STT attempt; a failed `/transcribe` fetch is the reactive backstop. The app does **not** wait for a fetch timeout to tell the user.
- **"Already-loaded items" = the current session's queued SRS items already pulled into memory** (not the whole word bank). SRS *review/scheduling* of those items continues locally (it never needed the network); only the **spoken-answer STT grading** is blocked offline.
- **`_convoScript` provides scripted conversation turns without STT** — it is meaningful as a read/listen fallback but does NOT grade speech; the UI must say so ("offline — reconnect to practise speaking; you can still review").
- **Recovery:** on reconnect (`online` event) the app **re-enables Whisper routing without a restart** (re-evaluates `whisperStatus()`), and clears the banner.
- **No hard crash** in any of the above; **`_coachCall` offline path** uses the new branch from change-set step 6, not the raw throw.
- **Unsubscribed/expired:** server returns **HTTP 402** `{error:'no_entitlement'}` (see §3 contract) → client shows paywall, never a broken drill.

### Cost / effort / staged implication
- **Cost:** none beyond §3.
- **Build effort:** ~2–3 days for the client redirect (it's small); risk is in testing, not code volume.
- **Staged implication:** this is **Phase 1**, the keystone — it's what frees the app from BYO-key and unblocks everything else.

---

## 8. Unit economics & pricing (Task 6)

### Cost model (per paying user / month)
Variable cost is dominated by Whisper STT (the hands-free loop fires one transcription per spoken answer):

- **STT:** `gpt-4o-mini-transcribe` ≈ **$0.003/min** of audio (per in-code comment `:5805`). A spoken answer is ~3–6s; call it ~10s of audio billed per drill item including overhead ⇒ ~**$0.0005/item**.
- **AI turns:** `_coachCall`/`_convoCall` to Claude — short prompts/responses; with a cheap model and tight `max_tokens`, ~**$0.001–0.003 per turn**, fired far less often than STT.
- **Hosting:** ~fixed (~$25/mo Supabase Pro past free tier) amortized across all users → negligible per-user at any real scale.

**Usage scenarios (variable AI+STT only):**
| User type | Items/day | Days/mo | STT $/mo | AI $/mo | Variable $/mo |
|---|---|---|---|---|---|
| Light | 40 | 12 | ~$0.24 | ~$0.10 | **~$0.34** |
| Median | 100 | 20 | ~$1.00 | ~$0.40 | **~$1.40** |
| Heavy | 300 | 30 | ~$4.50 | ~$1.50 | **~$6.00** |
| Whale (abuse) | 1000 | 30 | ~$15.00 | ~$5.00 | **~$20.00** |

### Margin against price + store cut
At **$8.99/mo** with a **30% store cut**, net to owner ≈ **$6.29/user/mo**.
- Light/median users: strongly profitable (~$6 net vs ~$0.34–$1.40 cost).
- **Heavy user: ~break-even on variable cost alone** ($6.00 cost vs $6.29 net) — *before* CAC.
- **Whale: loss-making** (-$13.71/mo) — **this is why a usage cap is mandatory, not optional.**

### CAC reality check + cohort margin AFTER CAC (REVISED, synthesis DA-5)
Facebook app-install → subscribe CAC for a niche language app is plausibly **$15–40 per paying subscriber** (flagged for a synthesis top-up — genuinely external/current). At $6.29 net/mo, **payback is ~3–7 months**, so **subscription retention is the whole game**.
**The margin inversion (DA-5):** the cap clips the abusive whale, but the **heavy *legitimate* daily user** (~$6 variable cost vs $6.29 net = ~$0.29 contribution before CAC) is precisely the cohort that *retains* and amortizes CAC — so after CAC ($15–40) they stay **loss-making for many months**, longer than the light cohort. i.e. the best-retained users are the least profitable. Implications, now first-class levers rather than footnotes:
- **An annual plan (~$59.99/yr) is a CAC-payback lever, not optional polish** — front-loading a year of revenue collapses payback risk on exactly the heavy/retaining cohort.
- **Cheaper STT is the highest-leverage cost fix** (STT dominates variable cost) — re-evaluate model/pricing (and the §12 stale-external Whisper price) before treating $8.99 as final; $8.99 may simply be **too low** for an STT-per-utterance product if CAC lands high.
- **Net margin must be modelled per-cohort AFTER CAC amortization**, not just on variable cost, before the price is locked as final.

### Trial spend on non-converters (ADD, synthesis DA-6)
The per-trial-user spend (~$0.10–$1.40) must be multiplied by the funnel: **trial spend per *converted* user = trial_cost ÷ trial→paid conversion rate.** With low niche-app conversion, every non-converter's trial OpenAI spend (on top of their CAC) is a real cost line that was missing from the table. Mitigation locked below: a **usage-gated taste (first N free items)** instead of 7 unrestricted days defangs both this cost and store-trial abuse via fresh Apple/Google IDs.

### LOCKS
- **Price band: $7.99–$9.99/mo, anchor $8.99/mo.** (Annual plan at ~$59.99/yr later as a retention/CAC-payback lever.)
- **Fair-use cap: a daily transcription/AI ceiling that bounds the whale.** Lock a soft cap at ~**300 graded items/day** (covers any genuine learner; clips abuse) — server-enforced at the entitlement gate, returning **HTTP 429** (§3 contract) with a gentle "you've hit today's practice limit". This caps worst-case variable cost at ~**$6/mo**, killing the whale loss.
  - **Counter mechanics (LOCK, synthesis QA-7):** the cap resets at **00:00 UTC** (fixed, server-side, timezone-independent — documented in-app). **Only a SUCCESSFUL graded item increments the counter** — a failed STT call (network error / OpenAI timeout before a transcription returns) does NOT count, so a flaky connection never silently burns the user's day; conversely the server must still rate-limit raw request volume (§3) so partial-request spamming can't bypass the cap.
- **Trial: 7-day store-native free trial.** Trial spend is real OpenAI spend, so **the fair-use cap applies during trial too**, and trial users are still server-gated. 7 days balances "enough to feel the habit form" against bounded free AI spend (~$0.10–$1.40 for a trial-length engagement).

### Staged implication
Pricing/caps are **config**, not architecture — but the **server-side cap enforcement** must exist by Phase 4 (IAP launch). The cap counter is a cheap addition to the entitlement gate (per-user daily counter in Postgres).

---

## 9. Meta ads instrumentation & compliance (Task 7)

### LOCK — minimum viable set
- **Meta SDK in the native shell** with **standard app events:** `fb_mobile_activate_app` (install/open), `CompleteRegistration` (signup), `StartTrial` (trial-start), `Subscribe` / `Purchase` (subscribe). These four conversion events are the minimum for Facebook **App Promotion** optimization.
- **iOS ATT + SKAdNetwork / AEM:**
  - Show the **App Tracking Transparency** prompt (`NSUserTrackingUsageDescription`) before any cross-app tracking; if declined, attribution falls back to **SKAdNetwork / Aggregated Event Measurement** (Meta's post-ATT path). Configure SKAN conversion values for the funnel (install → trial → subscribe). *(Exact current SKAN/AEM setup steps flagged for synthesis web-search top-up — this is the most likely-stale external.)*
  - Android: standard Meta SDK install referrer / events; no ATT equivalent.
- **Wire conversion events from the server where possible** (Meta Conversions API for subscribe/renewal, sourced from the RevenueCat webhook) so paid-conversion signal survives ad-blocking / ATT decline — but the **client SDK events are the launch-minimum**; CAPI is a fast-follow.

### Compliance (store + Meta requirements)
- **Privacy policy (public URL) is mandatory** for both stores and for running Meta ads. Must disclose:
  - **Voice audio is sent to OpenAI** for transcription (third-party processor).
  - **AI text** sent to Anthropic.
  - **Account data** (email / Apple/Google identity) and **subscription/payment** data (handled by Apple/Google + RevenueCat).
  - Meta SDK / ad measurement data.
- **App Store privacy "nutrition label"** + **Google Play Data Safety form** must declare the above categories (audio, account, purchase, identifiers).
- **ATT prompt copy** + a clear in-app explanation of why mic + tracking are requested.
- **Account deletion** path (Apple requires in-app account deletion for apps with account creation) — a "delete my account & data" action hitting a Supabase function that purges `user_state`/`profiles`/`entitlements`.

### Cost / effort / staged implication
- **Cost:** none beyond ad spend; privacy policy can be a static page (host on the same Supabase/static host).
- **Build effort:** ~2–4 days (SDK wiring + event hooks + ATT prompt + privacy policy + store privacy forms + delete-account function).
- **Staged implication:** Phase 5 (pre-ad-launch). Events can be added incrementally, but **ATT + privacy disclosures + account deletion must be in place before the first store submission that collects data**, and the conversion events before the first paid campaign.

---

## 10. Implementation sketch — the staged roadmap

The order is dictated by dependency + the "never break the live app" rule. **Phase 1 delivers the core unblock for the OWNER** (he stops needing a key); a *public* no-key experience is gated on the per-user cap + entitlement gate (Phase 2+, per the §3 DA-1 security gate). Revenue isn't possible until Phase 4.

### Strategy gate before the native+IAP lift (REVISED, synthesis DA-2)
The premature-scale attack is **partially accepted**. Phases 0–2 (backend proxy, owner cutover, accounts/sync) are **low-regret** — they're needed under any monetization path and unblock the owner immediately, so they proceed. But the **expensive, hard-to-reverse native+IAP+ads lift (Phases 3–5)** should be **gated on willingness-to-pay evidence**: ship a **web-first paid validation** first (Stripe-on-web subscription against the Phase 2 account/gate — web Stripe is allowed; only *native in-app* digital subs are forced to IAP). If a small paid web beta shows no conversion/retention, the native+IAP roadmap is **reordered or paused** rather than built blind. Recorded as a decision-note; it does not change the locked stacks, only their *sequencing trigger*.

### Web tier at native cutover (REVISED, synthesis DA-3)
A permanently-free, fully-functional web twin would (a) cannibalize the paid funnel and (b) invite App Store **Guideline 4.2 "repackaged website / minimum functionality"** rejection (loading local `www/index.html` does not defeat thin-wrapper scrutiny when the identical app is free on the open web). **Decision:** once IAP launches (Phase 4), the **web path is gated to the same entitlement model** (the web app uses the §3 proxy + entitlement gate too — web subscribers pay via Stripe-on-web, free web users hit the same taste-limit + paywall). There is no free full-feature web twin at/after native cutover.

### Phases
- **Phase 0 — Backend skeleton + safety rails (no client change).** Stand up the Supabase project; deploy `/transcribe` (multipart passthrough → OpenAI) and `/chat` (→ Anthropic). **From day one** the relay carries the §3 DA-1 safety rails: a hard global daily spend ceiling (503 circuit-breaker), per-IP/per-secret rate limit, and a rotatable soft secret. Holds the real keys. *Ships nothing to users yet.*
- **Phase 1 — OWNER cutover off BYO-key (keystone).** Redirect `_whisperTranscribe`, `_coachCall`, `_convoCall` (and the other Anthropic sites) to `API_BASE`; **rewrite `whisperStatus()`/`whisperAvailable()` to gate on entitlement+connectivity, not local key (CR-1)**; add the `_coachCall` offline branch (CR-2). The **owner** immediately stops needing a key. Public "no-key for everyone" is **NOT** opened here — it waits for the per-user cap + entitlement gate (Phase 2). Old BYO path kept hidden one release, then deleted.
- **Phase 2 — Accounts + sync.** Supabase Auth (Apple/Google/magic-link); `user_state` JSONB sync (offline-first, per-key LWW); migrate existing localStorage as the seed; swap the proxy's soft secret for the JWT; add the server entitlement gate (initially "everyone allowed").
- **Phase 3 — Native wrap.** **First task: the iOS `WKWebView` mic spike (§6 conditional lock, DA-8)** — gates the rest. Then Capacitor shell, `www/index.html`, mic + secure-storage plugins; first installable iOS + Android builds (free/limited, no IAP yet) → internal test tracks. **Internal-test-track promotion exit criteria (LOCK, synthesis QA-8):** mic permission granted on both platforms · `_whisperVoiceListen` completes one full STT round-trip in the WebView · the drill loop runs end-to-end (item → speak → grade → next) on a real iOS and a real Android device · offline banner + recovery behave per §7. No promotion without this smoke-test passing.
- **Phase 4 — Subscriptions live.** RevenueCat + store products; paywall UI; webhook → `entitlements`; flip the server gate to require active entitlement; 7-day trial; **fair-use daily cap** enforced. Remove BYO-key Settings UI; add account/subscription card. *(First revenue possible.)*
- **Phase 5 — Ads instrumentation + compliance + launch.** Meta SDK + 4 conversion events; ATT/SKAN; privacy policy + store privacy forms + in-app account deletion; CAPI fast-follow. Then run the first Facebook App Promotion campaign.

### Minimal backend surface (endpoints)
```
POST /transcribe   (multipart audio) → { text }            [gate: entitlement + daily cap]
POST /chat         ({messages, system}) → Anthropic shape  [gate: entitlement + daily cap]
POST /rc-webhook   (RevenueCat events) → upsert entitlements
GET  /state        → user_state.state_json
PUT  /state        (merged blob) → upsert user_state
POST /account/delete → purge user rows
```
(Auth/session is Supabase-native; no custom auth endpoints.)

### New state / data model (recap from §4)
`profiles` · `user_state(state_json JSONB)` · `entitlements` · a per-user daily-usage counter (column on `profiles` or a small `usage` table). Client keeps `localStorage` as working cache; `state_json` mirrors today's keys 1:1.

### `index.html` functions that change
`_whisperTranscribe` (URL+header), `_coachCall` / `_convoCall` (URL+header), the misc Anthropic fetches (`:4730/:15792/:21184`), the Settings key cards + save handlers (`:20667/:20717/:20774/:20798`), `save()`/`load()` (add the debounced cloud push + launch pull + migration seed), and a new `_authedFetch` + `API_BASE` config. **No framework, no bundler introduced.**

---

## 11. Decisions reached (locks)

| # | Task | LOCK |
|---|---|---|
| 1 | Backend stack & host | **Supabase (Edge Functions + Postgres + Auth)**; audio = **multipart passthrough** |
| 2 | Auth & accounts | **Supabase Auth** (Apple + Google + magic-link); **Postgres `user_state` JSONB**, offline-first per-key LWW; existing localStorage migrated as seed |
| 3 | Subscription / IAP | **RevenueCat** over StoreKit 2 + Play Billing; **server-side entitlement gate** via webhook → `entitlements`; 7-day store trial; restore via RevenueCat |
| 4 | Native wrap | **Capacitor** (iOS+Android), WebView loads local `www/index.html`; plugins: mic, RevenueCat, Meta SDK, push (opt), secure storage |
| 5 | Client→server refactor | Localized redirect of 3 fetch idioms + remove 2 key cards; **no build step introduced**; staged A/B/C, each ships live |
| 6 | Unit economics & pricing | **$8.99/mo (band $7.99–$9.99)**; **mandatory fair-use cap ~300 items/day** (server-enforced); 7-day trial capped too; retention is the make-or-break |
| 7 | Meta ads & compliance | Meta SDK + 4 standard events; ATT + SKAN/AEM (iOS); privacy policy + store privacy forms + in-app account deletion; CAPI fast-follow |

---

## 12. Open questions still open

- **[STALE-EXTERNAL — ADDED, synthesis DA-4]** Current OpenAI `gpt-4o-mini-transcribe` STT pricing. The $0.003/min figure is sourced from an **in-code comment (`index.html:5805`)**, not live pricing — and the model is billed on **audio tokens** with possible minimum/overhead, so real per-call cost can diverge 2–3×. This is the single most load-bearing cost variable; **§8 margins, the 300-item cap, and the $8.99 anchor must be re-derived once verified.** (The Settings UI still shows the *older* `whisper-1` $0.006/min at `:20716` — a preexisting code inconsistency, CR-4.)
- **[STALE-EXTERNAL — synthesis web-search top-up]** Exact current App Store / Play store cut (15% small-business vs 30%; 15% on year-2 subscription retention) — affects §8 margin.
- **[STALE-EXTERNAL]** RevenueCat current free-tier monthly-tracked-revenue threshold + paid % — affects §5 cost claim.
- **[STALE-EXTERNAL]** Current iOS ATT / SKAdNetwork / AEM exact setup mechanics for Meta App Promotion — affects §9.
- **[STALE-EXTERNAL]** Realistic Facebook CAC for a niche language-learning app in 2026 — affects §8 payback / whole go-to-market viability.
- **[VERIFY — code-reviewer]** iOS `WKWebView` `getUserMedia` mic capture under Capacitor 6+ against the actual `_whisperVoiceListen` path — any platform gap blocks the entire native plan.
- **[OPEN — strategy]** Premature-scale: should a **web-first paid beta** (Stripe on the web, no native/IAP) validate willingness-to-pay *before* the native+IAP lift? (devils-advocate lead question — may reorder the roadmap.)
- **[OPEN]** Conflict-resolution granularity: is per-key LWW genuinely safe for SRS, or is a heavier merge needed for cross-device? (code-reviewer.)
- **[OPEN]** Is `gpt-4o-mini-transcribe` cost the real driver, or do AI turns dominate at high engagement? (re-measure once telemetry exists.)

---

## 13. Foundation doc updates

To be applied in **synthesis** (not here):
- **[[project_japanese_trainer_commercial]]** — append the locked architecture: Supabase backend + Auth + Postgres sync; RevenueCat IAP; Capacitor wrap; $8.99/mo with a ~300-item/day fair-use cap; phased roadmap (Phase 1 = BYO-key cutover keystone; revenue at Phase 4). Add the "retention is the make-or-break / CAC payback 3–7mo" framing.
- Cross-link to the new ADRs (once filed pending).
- Note the dependency on the parallel STT-reliability gating track [[project_japanese_trainer_scope_decision]].

---

## 14. ADR proposals (framed; filed PENDING in synthesis)

**FILED in synthesis** under `docs/decisions-pending/` (NOT auto-promoted to `docs/decisions/`):

- **ADR-004 — Backend & API-proxy architecture.** Supabase Edge Functions + Postgres + Auth as the single backend; multipart audio passthrough; server holds all third-party API keys; **no-uncapped-relay hard invariant (DA-1)**; **HTTP entitlement/cap contract (QA-4)**; mandatory fair-use cap gate.
- **ADR-005 — Auth & cloud-sync stack.** Supabase Auth (Apple/Google/magic-link) + `user_state` JSONB, offline-first; **per-item MAX/additive merge for SRS counters (DA-7), not blob LWW**; explicit synced/excluded key list (CR-3); non-destructive migration seed (QA-5).
- **ADR-006 — Subscription / IAP layer.** RevenueCat over StoreKit 2 + Play Billing; server-side entitlement gate via webhook; refund/cancellation handling (QA-3).
- **ADR-007 — Native wrapper choice.** Capacitor (vs TWA/PWABuilder); local `www/index.html`, no build step; **CONDITIONAL on the iOS WKWebView mic spike (DA-8)**.
- **Pricing & usage-cap model →** recorded as an inline **decision-note** in the Synthesis section (config/dials, trivially reversible), per the heuristic ADR gate — NOT minted as a standalone ADR.

---

*End of primary doc (Round 1). Synthesis appended below.*

---

## Synthesis (Round 1 — Delve 4)

**Method:** every adversary finding with a citation was verified against source BEFORE adoption. **All citations verified true** — the code-reviewer's `index.html` citations were checked directly (`whisperStatus()` `!whisperKey()` gate at `:5640` ✓; `_coachCall` `if(!key) throw new Error('nokey')` at `:9411` ✓; `save()` writes 16 keys at `:3418-3437` ✓ incl. `similarStats`/`snapshots`/`convo`; Settings `$0.006/min` at `:20716` ✓) and every devils-advocate / qa-tester citation to this primary doc was confirmed against its line. **No finding was contested on citation grounds; none was an invented line.** Net verdict across the panel: 3× WARN, all reconciled below. Accepted fixes are applied inline in §§1,3,4,5,6,7,8,10,12 above.

### Dispositions — devils-advocate (LEAD)
1. **[FATAL] Unauthenticated, uncapped client-secret proxy = open wallet — ACCEPTED.** This was wrong by construction. Fixed inline (§3 "Security gate", §10 Phase 0/1): the relay is NEVER a public uncapped/unauthed endpoint — hard global spend ceiling + per-IP/secret rate-limit + rotatable secret from Phase 0, and the *public* no-key experience is gated on the per-user cap + entitlement gate (Phase 2+), not Phase 1. Owner-only cutover in Phase 1. Folded into **ADR-004** as a hard invariant.
2. **[SERIOUS] Premature scale — locks before willingness-to-pay — ACCEPTED (partial).** Phases 0–2 are low-regret and proceed; the expensive native+IAP+ads lift (3–5) is now **gated on a web-first paid validation** (§10 "Strategy gate"). Decision-note recorded; resolves the §12 [OPEN — strategy] item. Architecture locks stand; only their sequencing trigger changed.
3. **[SERIOUS] Free web twin undermines funnel + Apple 4.2 — ACCEPTED.** §10 "Web tier at native cutover": at/after IAP launch the web path is gated to the same entitlement model (no free full-feature web twin). Decision-note recorded.
4. **[SERIOUS] Unit economics rests on a self-cited in-code comment — ACCEPTED.** Whisper STT pricing added to the §12 STALE-EXTERNAL list as the most load-bearing cost variable; §8 margins/cap/anchor flagged for re-derivation once verified.
5. **[SERIOUS] Margin inversion — best-retained heavy users least profitable after CAC — ACCEPTED.** §8 now models margin AFTER CAC per cohort; annual plan and cheaper STT promoted to first-class levers; notes $8.99 may be too low.
6. **[QUESTIONABLE] Trial spend on non-converters omitted — ACCEPTED.** §8 adds "trial spend per converted user = trial_cost ÷ conversion_rate"; mitigation = usage-gated taste (first N free items) instead of 7 unrestricted days.
7. **[QUESTIONABLE] "LWW-per-key is additive/monotonic" is false — ACCEPTED.** §4 conflict resolution rewritten to per-item MAX/additive merge for SRS counters (plain LWW only for scalar settings). Folded into **ADR-005**.
8. **[QUESTIONABLE] Native plan LOCKed despite unverified mic dependency — ACCEPTED.** §6 lock made CONDITIONAL on a Phase-3 iOS WKWebView mic spike (now the first Phase-3 task). Folded into **ADR-007**.

### Dispositions — code-reviewer
1. **[SERIOUS] `whisperAvailable()` gate makes the `_whisperTranscribe` redirect dead code — ACCEPTED.** Citation `:5640` verified. §7 adds required step 2a: rewrite `whisperStatus()`/`whisperAvailable()` to gate on entitlement+connectivity, not local key. Without this the keystone fails — highest-priority Phase-1 task. Captured in **ADR-004**.
2. **[SERIOUS] `_coachCall` has no no-key fallback; §1 claim was wrong — ACCEPTED.** Citation `:9411` verified. §1 ground-truth corrected; §7 step 6 adds an explicit `_coachCall` offline/no-entitlement branch.
3. **[QUESTIONABLE] `save()` writes 16 keys, 3 unlisted incl. ephemeral `LS.convo` — ACCEPTED.** Citation verified. §1 corrected to 16; §4 enumerates synced vs excluded (`convo`, `logs` excluded). Captured in **ADR-005**.
4. **[NITPICK] Settings UI shows superseded `$0.006/min` — ACCEPTED-DEFERRED.** Citation `:20716` verified. It is a preexisting code inconsistency (out of scope for this design delve — no `index.html` edits here); noted in §12 and queued as a pre-launch code fix for the forge build.

### Dispositions — qa-tester
1. **[SERIOUS] Cold-start funnel never walked — ACCEPTED.** §7 adds the explicit install → first-working-drill funnel with the usage-gated taste and the entitlement-gate states.
2. **[SERIOUS] Offline degradation criteria absent — ACCEPTED.** §7 adds concrete, testable acceptance criteria (proactive `navigator.onLine` detection, "already-loaded items" defined, `_convoScript` scope, restart-free recovery).
3. **[SERIOUS] Refund state absent — ACCEPTED.** §5 adds RevenueCat `CANCELLATION`/refund → immediate `entitlements.active=false` (402 next call); voluntary cancel stays active to `expires_at`; grace handled. Captured in **ADR-006**.
4. **[SERIOUS] "402-style" ambiguous — ACCEPTED.** §3 locks a concrete contract: 402 no_entitlement / 429 daily_cap / 503 circuit-breaker / 401 auth. Captured in **ADR-004**.
5. **[QUESTIONABLE] Migration failure path unspecified — ACCEPTED.** §4 adds non-destructive idempotent seed: localStorage stays authoritative, `migrated` flag only after 2xx, retry w/ backoff, never blocks/deletes.
6. **[QUESTIONABLE] Cross-device LWW not testable — ACCEPTED.** Resolved together with DA-7 (per-item merge); concrete scenario now derivable from the merge rule.
7. **[QUESTIONABLE] Cap reset time + error-counting unspecified — ACCEPTED.** §8 locks 00:00 UTC reset; only successful graded items increment; raw request volume still rate-limited.
8. **[NITPICK] Phase 3 native wrap has no exit criterion — ACCEPTED.** §10 Phase 3 adds the internal-test-track smoke-test checklist.

### Decision-notes (recorded here, not minted as ADRs — reversible / config / sequencing)
- **Pricing & usage-cap parameters.** *Decision:* $8.99/mo (band $7.99–$9.99), annual ~$59.99/yr lever, ~300 graded items/day cap (00:00 UTC reset, successful-only), usage-gated taste of ~20–30 free items, 7-day store trial capped. *Why:* config tuned by live data, not a structural contract — the *existence* of a mandatory cap is load-bearing (captured in ADR-004's gate) but the *numbers* are dials. *Reversal cost:* trivial — server config / store-product change, no code-architecture change.
- **Web-first paid validation before the native+IAP lift.** *Decision:* gate Phases 3–5 on a small Stripe-on-web paid beta showing conversion/retention. *Why:* cheapest willingness-to-pay test; de-risks the expensive lift. *Reversal cost:* low — a roadmap re-ordering, no locked stack changes.
- **Web tier gated at native cutover (no free full-feature web twin).** *Decision:* once IAP launches, the web path uses the same proxy + entitlement gate (Stripe-on-web for web subs). *Why:* protects the paid funnel and avoids Apple 4.2. *Reversal cost:* low — a gating-policy toggle on the existing entitlement gate.

### ADRs filed (PENDING — `docs/decisions-pending/`, NOT auto-promoted)
- **ADR-004** — Backend & API-proxy architecture (incl. the DA-1 no-uncapped-relay hard invariant + the QA-4 HTTP contract + the mandatory fair-use cap gate).
- **ADR-005** — Auth & cloud-sync stack (incl. the DA-7/QA-6 per-item merge + CR-3 synced/excluded keys + QA-5 migration safety).
- **ADR-006** — Subscription / IAP layer (incl. the QA-3 refund/cancellation handling).
- **ADR-007** — Native wrapper choice (Capacitor, CONDITIONAL on the DA-8 iOS mic spike).

*End of Synthesis (Round 1 — Delve 4).*
