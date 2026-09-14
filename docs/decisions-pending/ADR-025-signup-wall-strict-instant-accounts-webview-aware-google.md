# ADR-025 — Sign-up wall: strict wall, gated instant accounts, webview-aware Google

- **Status:** Proposed (pending owner signoff + security check OQ-9)
- **Date:** 2026-09-14
- **Source:** Delve 12 — `docs/delve-cycles/12-onboarding.md` §5 (D12-6, D12-7, D12-8); Round-1 synthesis dispositions DA-2, DA-3, QA-6
- **Amends:** pending ADR-015 (sign-in mechanics and provider staging)
- **Keeps:** pending ADR-014 §2 (sign-in before content)
- **Related:** ADR-024 (flow), ADR-026 (measurement)

## Context

FB/IG ads open in in-app browsers. There, an inbox round-trip for a confirmation link is the largest drop point, and Google OAuth is refused (`disallowed_useragent`).
- `backend/supabase/config.toml` already has `enable_confirmations = false` (line 226) and `enable_manual_linking = false` (line 180).
- A Meta Pixel `StartTrial` fires for any account created less than 10 minutes ago (index.html 7104–7109), so it is the ad-optimisation signal.
- The panel raised a possible pre-account takeover: a password sign-up is treated as a confirmed email, and automatic identity linking by email could merge a later Google sign-in into the attacker's account. The panel had no security seat.

## Decision

1. **Strict wall (D12-6):** no learning state before an account. The front door may carry the promise plus one tap-to-hear sample that writes no state.
2. **Instant accounts (D12-7), gated:** no confirmation link, and the live project must match the config. **They don't ship to ad traffic until OQ-9 passes.** OQ-9 is a live test: password sign-up as X, then Google sign-in as X; the password must not open the Google-linked account. If the test fails, pick one mitigation before ads:
   - (a) keep confirmations on for password sign-ups, or
   - (b) drop an unconfirmed password identity when Google links to its address.
3. **Google placement (D12-8):** Google is the main button in normal browsers. It is hidden in FB/IG in-app browsers (UA `FBAN`/`FBAV`/`Instagram`), where email leads and an "Open in Chrome ⋮" hint shows. This is FINAL pending the OQ-2 device check. If detection proves unreliable, email leads everywhere.

## Acceptance gate (numeric)

- OQ-9 identity-linking test: **0/1** takeovers, or the chosen mitigation passes the same test at 0/1.
- Live dashboard shows email confirmations **off** (or mitigation (a) chosen deliberately): **1/1** owner check.
- In-app detection hides Google on **4/4** device combos (FB and IG × Android and iOS), and shows it on **2/2** normal browsers (Chrome Android, Safari iOS).

## Reversal trigger (numeric — placeholder band, calibrate on cohorts)

- Pixel `PageView` → `StartTrial` **< 50%** (60% placeholder bar minus a 10-point miss) in **two consecutive cohorts of ≥ 100** front-door views → reopen strict vs loose.
- `StartTrial` ÷ E8 `round1_done` **> 2 : 1** over **≥ 100** StartTrials → junk accounts are training the ads; move optimisation to a round-1-finished Pixel event.
- Any confirmed account-takeover report, or OQ-9 failing on a later Supabase version → turn confirmations back on for password sign-ups within one release.
