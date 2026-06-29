# ADR-007 — Native wrapper choice (Capacitor, CONDITIONAL on iOS WKWebView mic spike)

- **Status:** Proposed (PENDING — filed by Delve 4 synthesis; not promoted to `docs/decisions/`; awaiting user signoff)
- **Date:** 2026-06-28
- **Source:** Delve 4 — `docs/delve-cycles/4-productization-architecture.md` (§6, §10; Round 1 synthesis)
- **Supersedes / superseded by:** none

## Context

The single-file PWA must become two store binaries (Apple App Store + Google Play) without imposing a bundler/framework on the deliberately build-free app code. Options: Capacitor (iOS+Android, reuses `index.html` in a WebView), TWA (Android-only, no iOS), PWABuilder (thinner native-plugin control). The hands-free voice loop depends on `getUserMedia` mic capture inside the WebView. The devils-advocate flagged that the primary doc **LOCKed Capacitor while admitting the load-bearing iOS `WKWebView` `getUserMedia` capability is unverified**, and that "any platform gap blocks the entire native plan" — locking on an unproven critical assumption is premature.

## Decision

1. **Capacitor** is the chosen wrapper (one codebase → iOS + Android), loading the existing `index.html` from a local `www/` directory (not a remote URL → avoids the App Store "thin web wrapper" rejection risk; the binary genuinely contains the app). No bundler/framework imposed on the app code.
2. **The lock is CONDITIONAL.** Because a mic gap would block the entire native plan, the **first task of Phase 3 is a spike** that proves iOS `WKWebView` `getUserMedia` mic capture works under Capacitor 6+ against the actual `_whisperVoiceListen` path. This spike gates the rest of the native lift.
3. **Fallback if the spike fails:** a native-recorder Capacitor plugin feeding the existing `_whisperTranscribe` flow — NOT a different wrapper (no better cross-platform option exists). Capacitor remains chosen either way.
4. **Required plugins:** mic / `getUserMedia`, `@revenuecat/purchases-capacitor` (IAP), Meta SDK (app events + SKAdNetwork), `@capacitor/push-notifications` (optional v1), `@capacitor/preferences`/Keychain/Keystore for the session token. The real OpenAI/Anthropic keys never reach the device (ADR-004).
5. **Internal-test-track promotion exit criteria:** mic permission granted on both platforms · `_whisperVoiceListen` completes one full STT round-trip in the WebView · drill loop runs end-to-end (item → speak → grade → next) on a real iOS and a real Android device · offline banner + recovery behave per §7.

## Consequences

- One codebase reused as two binaries with no build step for the app itself; native capabilities added as a thin layer.
- The unverified-dependency risk is contained: the native lift cannot proceed past the spike if mic capture fails, and there is a defined fallback that keeps Capacitor.
- Cost: Apple Developer $99/yr + Google Play $25 one-time.
- Native wrap is Phase 3, gated behind the web-first paid validation (decision-note).

## Acceptance gate (numeric)

Accept iff the Phase-3 mic spike passes on a real iOS device (1 of 1 — `_whisperVoiceListen` completes ≥ 1 full STT round-trip via WebView `getUserMedia`), AND the internal-test-track smoke test passes all **5** checklist items on both platforms before any store promotion.

## Reversal trigger (numeric)

Revisit the wrapper choice only if the mic spike fails AND the native-recorder-plugin fallback also fails to achieve a working STT round-trip on iOS in **≤ 2** focused attempts — at which point the native-iOS plan (not the wrapper) is escalated to the owner as a go/no-go decision.
