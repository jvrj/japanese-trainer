# ADR-024 — Onboarding v2: sticker-only pre-round flow and the name gate

- **Status:** Proposed (pending owner signoff)
- **Date:** 2026-09-14
- **Source:** Delve 12 — `docs/delve-cycles/12-onboarding.md` §3, §4, §8, §9 (D12-1, D12-2, D12-3, D12-4), §11.1; Round-1 synthesis dispositions DA-6 (contested), DA-7, QA-2, QA-3, QA-5, CR-1, CR-4
- **Supersedes:** pending ADR-014 §1, §3, §4 (scripted conversation, path pick, onboarding mic ask, kana CTA). **Keeps** ADR-014 §2 (sign-in first) and §5 (instrumented funnel). ADR-014's status change is left to the human promotion step.
- **Related:** ADR-025 (sign-up wall), ADR-026 (measurement), ADR-009 (judgment-free)

## Context

At v9.17 an ad click passes through up to 7 screens before round 1: auth welcome, create form, check email, Welcome, word check, mic ask and first sticker. Most of them duplicate what the v8.99 in-round intro already does. The mic permission they ask for isn't used by round 1. `DEFAULT_SETTINGS.userName` is hard-coded to `'Julius'`, so every customer is silently called Julius. The owner said: *"the app should ensure a name is used"* and *"every extra step loses some people"*.

## Decision

1. **Pre-round flow (D12-1):** front door → [email create form] → [Name screen, only if missing] → first sticker → standard round 1. W1 Welcome, W5 word check, the onboarding mic ask and the dead W2/W3/W4/W6 renderers are cut. No question screen returns.
2. **Time budget (D12-2):** median time from page load to first spoken JP word is **≤ 45 s on the email path (headline — ad/in-app traffic)** and **≤ 30 s on the Google path**. It is always reported split by `inapp`.
3. **Mic (D12-3):** asked in context on the first 🎙 Voice tap only.
4. **Name (D12-4):** required.
   - **Capture:** a First-name field on the email form, or pre-filled from Google `user_metadata` (provisional until verified on device). Otherwise a one-field Name screen with a *"Not you? Sign out"* exit.
   - **Missing** = durable, synced `settings.nameSet !== true`. `DEFAULT_SETTINGS.userName = ''`. One-time backfill: a non-empty name other than exactly `'Julius'` → set; owner device → set.
   - **Gate order in `nav()`:** auth → name → onboard(sticker) → home. The name gate runs for any signed-in account whether or not `onboard.done` is set. It can't be skipped because every boot passes `history.replaceState({screen:'home'})` (index.html 29913).

## Acceptance gate (numeric)

- A scripted fresh-account run per path counts **2 screens (Google) / 3 screens (email) / +1 when the name is missing** before the first TTS word, with **0** renders of W1/W5/mic. That's 3/3 runs.
- `nav()` gate probe, **5/5** land on the specified screen:
  1. fresh email sign-up
  2. Google account with no name data
  3. app closed after the account but before the name
  4. deep link `#home` with the name missing
  5. a non-owner who saves the name "Julius" and reopens (must reach Home, not Name)
- The §11.1 back/closed-app table: **5/5** rows land as specified.
- The live Google `user_metadata` payload is checked on **≥ 1 personal + 1 Workspace** account before the pre-fill ships (OQ-11).

## Reversal trigger (numeric — placeholder band, calibrate on cohorts)

- Median E7 time-to-first-word **> 60 s** on either path over **≥ 50** accounts → reopen the screen list.
- E3 → E6 (account → round starts) **< 80%** (placeholder bar 90% minus a 10-point miss) in **two consecutive cohorts of ≥ 50** → a pre-round screen is broken or unclear.
- Name screen shown → name saved (E4 `source:screen|catchup`) **< 85%** over **≥ 30** shows in two cohorts → make the name optional with name-free fallback copy (owner sign-off required, since it reverses his directive).
