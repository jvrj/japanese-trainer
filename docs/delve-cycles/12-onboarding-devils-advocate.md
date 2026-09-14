# Delve 12 — Onboarding: devils-advocate audit (LEAD adversary)

- **Target:** `docs/delve-cycles/12-onboarding.md` @ 0860308c · charter `12-charter.md` §Adversaries (devils-advocate)
- **Lens:** premise, fragility, over/under-build, strongest objection. Material findings only.
- **Injection check:** neither the primary nor the charter contains instruction-like text aimed at reviewers. Nothing to report.
- **Verdict:** **WARN**. The screen cuts are sound. But one code fact is wrong, and the return mechanism and the instant-account decision each have an unexamined failure mode.

## The good (brief)
- Cutting W1, W5 and the mic ask is well argued. F4 (the mic is not used in round 1) and F5 (the round teaches itself) check out against the code.
- The strict wall is kept, and the "loose taste = banned micro-drill" argument is correct. No banned special drill comes back in.
- F1 is real: `index.html:4792 userName:'Julius',`. This is a genuine customer-facing defect and the doc was right to find it.
- Hiding Google inside the FB/IG webview is the right call, if OQ-2 confirms it on a device.

## Charter audit questions, answered
1. *Does every added screen pay for itself?* Mostly, except the unskippable Name screen N (Q6). The new install card is not a screen, but it has a hidden cost (S4).
2. *Is the required name worth it, or vanity?* The cheap part (fixing the default, Google pre-fill) is worth it. Making it *required* is not proven (Q6).
3. *Does it quietly re-add a banned drill or question funnel?* No drill. But screen N is literally a question screen ("What should we call you?") that cannot be skipped, and every existing tester will see it (Q6).
4. *Would a total beginner understand every screen in 3 s?* Mostly. "cold" in the new round-end line is jargon (N10).

---

## SERIOUS

### S1. F2 / §7.1 "the ad test is blind" is false. A Meta Pixel with StartTrial is already live, and the doc never mentions it
- Primary cites: `**No onboarding event ever leaves the phone.** The ad test currently can't see drop-off at all.` (line 69), and §7.1 `the ad test is blind today` (line 249).
- Source: `index.html:21-22` runs `fbq('init', '1539713041242150'); fbq('track', 'PageView');`. `index.html:7109` fires `window.fbq('track', 'StartTrial', ...)` in `_metaTrackStartTrialOnce` on a brand-new account's first sign-in.
- **Why it matters:**
  - The doc's own grounding says trial start is the event ad spend is optimised against. That event already reaches Meta, and PageView -> StartTrial already *is* the E1->E3 wall conversion, split by ad set.
  - The doc builds a second, bespoke sink, calls it a launch gate (D12-10), and leaves out the pixel entirely. The two funnels will disagree (different dedup, ad blockers, webview behaviour), and nobody has decided which one is the truth.
- **Alternative:**
  - Treat the Pixel as the wall funnel (E1-E3) and say so.
  - Keep the Supabase sink only for what Meta cannot see (E6-E10, D1 return), and cut E1/E2 from it.
  - Name which system owns which bar in §7.3.
  - If the sink stays, E3 must fire from the same hook as `_metaTrackStartTrialOnce`, so the two counts can be reconciled.

### S2. Instant accounts poison the ad-optimisation signal
- Primary cites: `**Cost accepted:** typo'd or fake emails create real accounts.` (line 185).
- Source: StartTrial fires for any account whose `created_at` is under 10 minutes old (`index.html:7105-7109`). With `enable_confirmations = false` (`backend/supabase/config.toml:226`), a junk or typo'd email counts as a conversion.
- **Why it matters:**
  - Meta's algorithm optimises toward whoever produces StartTrial. Junk sign-ups teach it to buy more junk sign-ups. The "cost accepted" is framed as a password-reset nuisance, but the real cost is ad spend.
  - It also makes the 7-day no-card trial endlessly renewable with throwaway emails. That is minor, since progress does not carry over, but the doc does not mention it.
- **Alternative:**
  - Keep instant accounts (the drop-off argument is right).
  - Monitor the ratio of StartTrial to round-1 finishers (E8), and consider moving the Meta optimisation event to E8 or D1 once volume allows.
  - Add this as a reversal trigger in ADR-P12c.

### S3. Instant accounts plus automatic identity linking: possible pre-account takeover, and no security adversary is on this panel
- Primary cites: D12-7 `**Instant accounts** (no confirmation link)` (line 322), together with D12-8 (Google as the main button).
- **Mechanism to verify:**
  - Supabase links identities that share an email automatically (`enable_manual_linking = false` at `config.toml:180` only covers *manual* linking).
  - With confirmations off, a password sign-up is treated as confirmed. An attacker could register `victim@gmail.com` with their own password before the victim arrives. When the victim later taps "Continue with Google", the identities may be merged, and the attacker's password then opens the victim's account and its Stripe subscription/portal.
- **Why it matters:** the charter panel is devils/qa/code only. D12-7 is an auth-security change with no security review, and the doc's "cost accepted" paragraph does not consider it.
- **Alternative:** before filing ADR-P12c, confirm Supabase's linking behaviour for auto-confirmed emails against its current docs or a live test. If it links, either keep verification only for accounts that later add Google or checkout, or route D12-7 through a security review. At minimum, add it to Open questions.

### S4. Pick 2 ("Open in Chrome" / install) sends the user into a fresh, signed-out browser at exactly the moment of return
- Primary cites: `The button becomes **"Open in Chrome"** / **"Open in Safari"** with the ⋮ instruction.` (line 222), and `It turns a throwaway webview tab into an app icon.` (line 228).
- **Why it matters:**
  - The FB/IG webview, Chrome, and an iOS home-screen web app each keep separate storage. A user who signed up in the webview has no session in Chrome.
  - On the email path, which §5.3 makes the *main* path for ad traffic, the password was typed into a webview that usually does not save it. So on day 2 the new icon opens to the front door and asks them to sign in again: a second wall, at the most fragile moment.
  - Progress reaches the cloud only through a 45 s debounced push (`index.html:7519 const SYNC_DEBOUNCE_MS = 45000;`) plus a best-effort flush on `visibilitychange`. Jumping out to Chrome right after round end is exactly when that push can be lost, taking the round-1 words and the promised morning-check card with them.
  - The success story for pick 2 assumes the session carries over. It does not.
- **Alternative (stronger):**
  - Do the webview escape at the **front door, before sign-up**. Make "Open in Chrome/Safari" the *main* in-app action instead of a quiet hint line. Then Google works, password autofill works, install works, and there is one storage context for life. The cost is one drop point at a moment when nothing is invested yet, which is far cheaper than losing a user who has already finished round 1.
  - If the handoff stays at round end: force a sync push before showing the card, and hand over a signed-in link (for example a magic link) rather than a bare "Open in browser" instruction.
  - QA should test the full webview -> Chrome -> day-2 path.

### S5. The day-2 diagnosis rests on 3 testers, none shown to have come from an ad webview
- Primary cites: `The failure is **finding the app again tomorrow**.` (line 201), and `Testers baseline: 1 of 3 = 33%.` (line 279).
- **Why it matters:**
  - The evidence (3 testers, 1 returned) says nothing about *why* two did not come back. The doc swaps in a plausible story (lost tab) for data and then designs both day-2 mechanisms around it.
  - If the real cause is value (a 5-minute Greetings round did not feel worth repeating), then a home-screen icon and a dated promise will not fix anything, and D1 will fail with no diagnosis.
  - A 50-account cohort gives a 95% interval of about ±14 points around 40%. That cannot tell a "route" failure from a "value" failure.
- **Alternative:**
  - Ask the two non-returning testers why before locking D12-9.
  - Add one diagnostic that separates the two causes (D1 return for install-accepted vs. not).
- **What would change my mind:** tester answers like "forgot where it was" or "could not find the link".

---

## QUESTIONABLE

### Q6. The *required* name is mostly repairing the Julius-default bug. "Required" and "no skip" are not justified
- Primary cites: `(disabled when empty). No skip.` (line 301), and `An optional field ends up blank for most people, and the uses in 4.3 then read awkwardly.` (line 137).
- **Why it matters:**
  - The owner request that "a name is used" is fully explained by F1: customers were being called Julius. Removing the default and pre-filling from Google fixes that at zero friction.
  - Making the field *required* adds a blocking field to the email form, which is the main path for ad traffic because Google is hidden in webviews.
  - The catch-up adds an unskippable question screen for every existing account, when question screens were banned at v8.97/98.
  - "Reads awkwardly" is a copy problem (the round-end headline works fine without a name), not a reason to block.
  - The ADR-P12b trigger (`> 5 points`, line 380) cannot be detected at n=50-100 (see Q8), so the "cut the name if it costs" safety valve is not real.
- **Alternative:** at v1, *capture* the name (email field shown, Google pre-fill) but do not require it, with name-free fallback copy. Record E4 fill rate, and let the owner choose "required" knowing the friction trade-off. At minimum, give the catch-up screen a quiet "Skip".

### Q7. The headline time target is for the path most ad traffic cannot use
- Primary cites: `**Target: ≤ 30 s on the Google path · ≤ 45 s on the email path` (line 98), and `(autofill helps)` (line 105).
- **Why it matters:**
  - §5.3 hides Google in the FB/IG in-app browser, which is where paid-social clicks land. So the email path is effectively *the* ad path, and the 30 s Google number is the flattering one.
  - "Autofill helps" is weakest inside in-app webviews.
  - The 3 s shell load assumes a warm load, but `index.html` is 2,172,061 bytes: a cold first load in a webview on 4G, before the service worker is installed.
- **Alternative:** make the headline target the in-app email path. Measure E7 split by `inapp`, and budget a realistic cold load.

### Q8. The bars and reversal triggers are unsourced, and several cannot be measured at the stated cohort sizes
- Primary cites: `over the first cohort of ≥ 100 front-door views` (line 176), and `**Headline: D1 return ≥ 40%**` (line 277).
- **Why it matters:**
  - A 60% hard-wall conversion from cold paid-social views is optimistic and unsourced. If it fires straight away, the "locked" strict wall is reopened by the doc itself.
  - A 5-point trigger (ADR-P12b) is well inside the noise at n≈100.
  - OQ-8 asks this adversary to find a benchmark. My answer: do not block on one. Label every bar as a calibration placeholder, and size each trigger to what the cohort can detect (≈±10-14 points).
- **Alternative:** judge each trigger on the direction of change across two cohorts, not a single-cohort point threshold.

### Q9. The anonymous public insert RPC is a new unauthenticated write surface, and privacy gets "one line"
- Primary cites: `security definer` (line 253), and `The privacy policy gets one line.` (line 256).
- **Why it matters:**
  - An allowlist and a meta size cap do not stop volume abuse. Anyone with the public anon key can flood the table and eat into the $0 free tier.
  - A pre-consent persistent `anon_id` joined to `user_id`, alongside the Meta Pixel, deserves more than one line for EU/AU ad audiences.
- **Alternative:** per S1, shrink the sink to post-sign-in events only (authenticated, rate-limited per `user_id`), and let the Pixel cover E1/E2.

## NITPICK

### N10. "cold" is jargon to a total beginner
- Primary cites: `10 of these words, cold.` (line 207).
- **Why it matters:** this fails charter audit Q4 (a beginner should understand every screen in 3 s) and the outcome-first, zero-jargon copy rule.
- **Alternative:** "Tomorrow, {Name}: a 1-minute check on 10 of these words — no hints."

---

## What would change my verdict to PASS
1. §2 F2 and §7 are corrected to account for the live Meta Pixel and StartTrial, and each bar has one named source of truth (S1).
2. The Supabase identity-linking risk from auto-confirmed emails is checked or routed to security review before D12-7 is filed (S3).
3. The webview escape moves to the front door, or the round-end handoff keeps the session and progress (S4).
4. The day-2 diagnosis is backed by the two non-returning testers giving their own reasons (S5).

## Overall verdict: **WARN**
Fix S1-S4 before synthesis files ADR-P12c/d/e. The ADR-P12a screen cuts (D12-1..3) can go ahead as written.
