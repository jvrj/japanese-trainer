# Delve 12 — Onboarding: the first five minutes of WordStick

## Domain
WordStick launches Japanese-only to strangers from Facebook/Instagram ads ($8.99/mo · $59.99/yr,
7-day no-card trial, then free plan = 3 new words/day). The onboarding decides whether an ad click
becomes a habit. Today (v9.17) the flow is: sign-up wall (welcome → email+password or Google →
confirm email) → Welcome ("ears, not thumbs", tap to hear みず) → "Tap words you already know" →
microphone ask → "Here's your first sticker" → standard 30-word round. Three question screens
(Why Japanese / Where are you starting / When would you practise) exist in code but are skipped.
Real tester data (14 Sep): 3 testers each did ONE session (32–46 words) on day 1; only one returned.
Owner asks, verbatim: *"the app should ensure a name is used"*, *"perhaps include it into the
onboarding"*, *"every extra step loses some people"*.

## Stacked callouts (binding, not re-openable here)
> **LOCKED:** sign-in up front (before content) · 7-day no-card trial · free plan 3 new words/day ·
> first round = the standard 30-word round (bespoke micro-drills and question screens were killed
> v8.98 — owner: never re-add special drills) · STT never grades · stickers are the category model ·
> AI conversation/avatar benched · English-primary chrome, kana+romaji+English content.
> Grounding: `reports/hydra-research/2026-08-27-gating-model/`, `reports/hydra-research/2026-07-21/REPORT.md`
> (Praktika teardown), `docs/delve-cycles/9-commercial-spine.md`, index.html onboarding
> (`renderOnboard` ~28028, `obGoto` ~27694, `obfFinish` ~27756, `startOnboardMicroDrill` ~27846,
> `_obfSticker` ~27376, auth screens `renderAuth` ~28043).

## Primary
**Mode:** Opus-only

### Investigation tasks
1. **Screen list — pick FINAL:** the exact screen-by-screen flow from ad click to the end of the first
   round, with copy for each. Decide which current screens stay, go, merge or reorder (Welcome, word
   check, mic, first sticker), and whether any skipped question screen (why/level/when) earns a place.
   Budget: time-to-first-spoken-word target in seconds, stated and defended.
2. **Name — pick FINAL:** where the required name is asked (inside onboarding right after Welcome vs
   after the first round vs at sign-up), how Google names pre-fill, how existing no-name accounts are
   caught, and where the name is then USED (so asking it earns its cost).
3. **Sign-up wall — pick FINAL:** keep full sign-up before any content vs one taste first (e.g. hear
   and say 3 words, then sign up) — within the sign-in-up-front lock, interpret strictly vs loosely and
   decide. Also: email-confirm link vs instant account; Google placement.
4. **Day-1 → day-2 return — pick FINAL:** what the end of the first round and the first Home visit do
   to bring people back tomorrow (sticker progress, streak, reminder/notification ask, "prove it
   tomorrow" morning check). Pick at most two mechanisms; reject the rest with reasons.
5. **Measurement:** the minimal onboarding events to log so the ad test shows where people drop
   (map to existing `_obLog` events), and the success number for v1.

### Output
Primary doc: `docs/delve-cycles/12-onboarding.md`
Sections: Charter · Method · one per task (1–5) · Final flow (screen table with copy) ·
Decisions reached · Open questions · Build list for Claude Design Round 1–2 · ADR proposals.

## Adversaries
### Adversary 1: devils-advocate (LEAD)
**Read:** primary doc, the two research reports, index.html onboarding + auth code
**Audit:** (1) Does every added screen pay for itself against drop-off from ad traffic? (2) Is the
required name worth its cost, or vanity? (3) Does the flow quietly re-add a banned special drill or
question-screen funnel? (4) Would a total beginner understand every screen in 3 seconds?
**Output:** `12-onboarding-devils-advocate.md`

### Adversary 2: qa
**Read:** primary doc, index.html first-run + auth paths
**Audit:** (1) No dead ends: mic denied, no speech support (iOS), email link opened on another
device, Google cancelled, back button mid-flow, app closed mid-onboarding. (2) Existing accounts
(testers, no-name users) get a sane path and lose no progress.
**Output:** `12-onboarding-qa-design.md`

### Adversary 3: code
**Read:** primary doc, index.html onboarding/auth/nav gate
**Audit:** (1) Is each decision buildable in the current architecture without breaking the nav()
gate order (auth → onboard → home)? (2) Estimate the change size per decision; flag anything costly.
**Output:** `12-onboarding-code-review.md`
