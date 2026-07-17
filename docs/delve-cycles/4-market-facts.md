# Delve 4 — Current-Facts Research (live web, June 2026)

> Companion to `4-productization-architecture.md`. Live external facts gathered to
> validate the delve's locks against current 2026 reality (the charter flagged these
> for a targeted web-search top-up). Cross-check the delve's assumptions against this
> at synthesis. Sourced via WebSearch/WebFetch; URLs inline.

## 1. iOS/Android WebView microphone capture (CRITICAL — VERDICT: works, conditionally)

- **iOS WKWebView CAN do `getUserMedia` + `MediaRecorder`** — supported since **iOS 14.3**; WebKit exposes it when the embedding app can natively capture audio (Capacitor declares this). (webkit.org/blog/11353/mediarecorder-api/)
- **Required:** `NSMicrophoneUsageDescription` in Info.plist (missing = crash/reject). `UIBackgroundModes: audio` only if capture must survive backgrounding.
- **Must be a secure (non-`file://`) context** — MediaRecorder returns EMPTY chunks from `file://` on iOS. Capacitor serves from `capacitor://localhost` (behaves secure) — but CONFIRM non-empty blobs on a real device during QA.
- **Per-call mic prompt** — call `getUserMedia` once and keep the stream alive, don't re-request each turn.
- **Android Capacitor WebView** — mic capture works, needs `RECORD_AUDIO` manifest permission + runtime prompt. Fewer quirks than iOS.
- **Net:** "wrap the PWA" is viable on iPhone, but GATE the build on a real-device record test. Not a breaker.

## 2. App Store & Play subscription rules + cut

- **Apple standard subs:** 30% year one → auto-drops to **15%** after 12 continuous months retained.
- **Apple Small Business Program: 15% from day one** for devs < $1M/yr proceeds — **enroll, this is our rate.** (developer.apple.com/app-store/small-business-program/)
- **Google Play: 15% on all subscriptions from day one** (effectively 15% for a solo dev).
- **US external payment links:** post-Epic, currently commission-free in the US but legally unsettled (remanded Apr 2026); needs StoreKit External Purchase Link entitlement, US-only. Treat as a maybe-later, not v1.
- **Guideline 4.2 (thin-app) risk is REAL** for a bare WebView wrapper — Apple rejects apps that "feel like a browser." Mitigate with ≥3 genuine native features (native paywall, push, biometric login, offline, native nav). (mobiloud.com/blog/app-store-review-guidelines-webview-wrapper)

## 3. RevenueCat

- Cross-platform wrapper over StoreKit + Play Billing — receipt validation, entitlements, subscription state, analytics. Removes IAP backend work.
- **Free up to $2,500 monthly tracked revenue, then ~1% of revenue above** — effectively free at launch.
- Official Capacitor plugin: `@revenuecat/purchases-capacitor` (iOS+Android).
- Strong solo-dev default; also directly satisfies the 4.2 "native paywall" requirement.

## 4. iOS ATT + Facebook ad attribution

- **Expect heavily degraded iOS attribution** — most users decline ATT; operate on aggregated/modeled data, not 1:1 click→purchase.
- **SKAdNetwork 4 / AdAttributionKit** — only attribution without ATT consent; coarse, delayed (24–48h), aggregated.
- **Meta Aggregated Event Measurement (AEM)** — Meta's iOS path, up to 8 prioritized events; configure in Meta Events Manager to optimize FB campaigns.
- **Solo-dev minimum:** Meta SDK + Conversions API (server-side events) + AEM with prioritized events (install→signup→trial→purchase). Accept modeled/directional ROAS on iOS.

## 5. Backend host for relaying audio to OpenAI

- **Vercel Functions: 4.5 MB request body hard cap** — fine for short COMPRESSED clips, a footgun for raw WAV. Avoid for raw audio.
- **Cloudflare Workers: 100 MB body (Free/Pro)** — best audio headroom; OpenAI round-trip wait doesn't count against the 30s–5min CPU cap.
- **Supabase Edge Functions:** generous wall-clock (400s), ~2s CPU (async I/O excluded so OpenAI wait is OK), no small body cap. **Bundles auth + Postgres + functions** — attractive since we ALSO need accounts/subscription storage.
- **Recommendation:** **Supabase** (one platform for auth+DB+functions+audio relay) OR **Cloudflare Workers** (max audio headroom). Avoid Vercel for raw audio. Always send COMPRESSED clips regardless.

## 6. OpenAI speech options (current)

- **Cheapest STT: `gpt-4o-mini-transcribe` @ $0.003/min** — current + cheapest (confirms v8.00 choice). `gpt-4o-transcribe` / legacy Whisper = $0.006/min.
- **Realtime API (speech-to-speech):** `gpt-realtime-mini` ~$0.06–$0.15/min; full `gpt-realtime-2` ~$0.18–$0.46/min. **~20–50× the record-then-transcribe cost.**
- **Trade-off (FLAG):** Realtime = true low-latency, barge-in, natural turn-taking (better *conversation* UX) BUT 20–50× cost, needs persistent WS/WebRTC backend, and loses the per-turn STT TEXT the current drill/scoring logic depends on. **Keep record→transcribe as the economic default; Realtime = premium-tier candidate only.**

## 7. Legal minimum to run Facebook ads

- **Privacy policy mandatory** (working URL) on both store listings — disclose data collected, purpose, third-party sharing (voice→OpenAI), retention.
- **App Store Privacy Nutrition Label** — self-declare "Audio Data" + account identifiers + third-party sharing.
- **Google Play Data Safety form** — mandatory, must MATCH the privacy policy (Google audits).
- **Plus:** Terms of Service w/ auto-renewal disclosure (Apple requires), a note that audio goes to OpenAI (API data not used for training by default — state retention), Meta requires advertised apps have a compliant policy + configured SDK/AEM.

## Architecture-changing flags (read these first)

1. **iOS mic — works but conditional.** iOS 14.3+ in Capacitor WKWebView, secure context only, `NSMicrophoneUsageDescription` required. MUST be real-device record-verified before committing to wrap-the-PWA. If it returned empty blobs the whole iPhone plan breaks → gate the build on a record test.
2. **Realtime API — decision point, NOT default.** Better conversation UX, 20–50× cost, persistent connection, loses per-turn text. Default stays record→transcribe ($0.003/min); reserve Realtime for a premium tier.
3. **Guideline 4.2 thin-app risk** — bare WebView wrapper likely rejected. Native paywall (RevenueCat) + push + biometric login are REQUIRED v1 scope, not nice-to-haves.
4. **Host choice couples to audio encoding** — Vercel's 4.5MB cap rejects raw audio. Pick Supabase (auth+DB+functions in one) or Cloudflare (max audio headroom); always send compressed clips.
5. **Monetization vs attribution** — 15% store cut achievable day one (Apple SBP + Play), but iOS ad attribution is heavily modeled (most decline ATT). Budget for imprecise FB ROAS; lean on Meta CAPI + AEM, not deterministic tracking.
