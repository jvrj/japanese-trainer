# Delve 12 — Onboarding QA / Test-Design Audit (Adversary 2)

- **Audits:** `docs/delve-cycles/12-onboarding.md` (primary, committed 0860308c)
- **Charter scope (verbatim):** "(1) No dead ends: mic denied, no speech support (iOS), email link
  opened on another device, Google cancelled, back button mid-flow, app closed mid-onboarding.
  (2) Existing accounts (testers, no-name users) get a sane path and lose no progress."
- **Method:** read the primary doc and the charter as data; verified every line-number/function-name
  citation and every quoted research figure against the working tree (`index.html`, `backend/supabase/
  config.toml`, `reports/hydra-research/...`) rather than trusting the doc's own claims. No prompt-
  injection attempt was found in either the primary doc or the charter — both stayed in-scope prose.

---

## Verified as accurate (not findings, stated for the record)

`nav()` gate order (index.html:26837-26878), `_obEnsure`/`_obLog`/`obGoto` region (27668-27712),
`_OBF_ORDER = ['w1','w5','mic']` (27745), `obfFinish` (27756), `_voicePreflightMic` + its existing
"mic blocked" recovery toast (22361-22406), `COACH_INTRO_LINE` (24253), `_stkBurst`/`_obfSticker`/
`coldCheckDue`/`_coldAutoPop`, `authDoSignUp`'s existing "already registered" / anti-enumeration
branch (7385-7409), `enable_confirmations = false` (backend/supabase/config.toml:226), `_convoSafeName`'s
24-char cap (4860-4863), and `userName` not being in `SYNC_SETTINGS_EXCLUDE` (7518) all check out
exactly as cited. `state.screen` defaults to `'home'` on every fresh load (no persisted mid-round
resume across a reload) — this actually *supports* the doc's claim that a "before Home" catch-up
screen placement (§4.2) will reliably catch every reopen.

---

## Findings

### 1. SERIOUS — Grounding cites a statistic its own source explicitly retracted
**Citation:** `docs/delve-cycles/12-onboarding.md:57` — `"82% of trial starts are Day 0 and 84% of
cancellations land by Day 1"` presented as report grounding, no caveat.
**Source:** `reports/hydra-research/2026-08-27-gating-model/REPORT.md:119` — `"The '82% of trial
starts on Day 0' figure did NOT survive re-fetch — it does not appear on the cited page. ... Use
the verified half."`
**Detail:** The QA lens exists precisely to catch this: the primary doc's Method section (§2) quotes
a figure as verified evidence for urgency, when the cited report's own H1 verify gate marked that
exact figure as unconfirmed and told downstream readers to use the *other* half of the sentence only
(the 55.4%/84% cancellation figures, which the primary doc separately and correctly uses in §3.2).
This doesn't flip any FINAL decision — the 84% figure alone still carries the urgency argument — but
a doc whose job is to defend budgets/targets against contested figures should not restate a debunked
number as fact. Synthesis should strike the "82%" clause from §2 or mark it unverified.

### 2. SERIOUS — Two charter-mandated dead-end scenarios are entirely unaddressed
**Citation:** charter `docs/delve-cycles/12-charter.md` §Adversary 2: `"back button mid-flow, app
closed mid-onboarding"`. Grep of the primary doc for "back button", "goBack", "history.back",
"popstate" returns zero matches; "app closed mid-onboarding" is never discussed either (§11's
"Error / dead-end states" list covers Google-cancelled, offline, account-exists, and the email
fallback only).
**Detail:** This is the exact audit task the charter assigns to this seat, and the primary doc is
silent on both. Two concrete unresolved cases:
- **Back button mid-flow:** the front door → Create-account → [Name screen] → First sticker sequence
  is new. What does a back-press do from the Create-account form (loses typed fields? returns to
  front door?), and from the Name screen (`§4.1` says it "can't be skipped" via its own Continue
  button, but says nothing about the system/browser back button escaping it)?
- **App closed mid-onboarding (new N-step case):** `state.onboard` is transient/in-memory-only
  (index.html:27623 comment: "Transient pass state: state.onboard (in-memory only, see
  `_obEnsure()`)"). §4.2's "missing name" catch-up is specified only for accounts where
  `onboard.done` is already `true` ("shows once, on the next app open, before Home"). For a **Google
  sign-up with no name** who closes the app between account creation and the Name screen
  (`onboard.done` still `false`), the doc never states whether `_obEnsure()`'s fresh rebuild on
  reopen re-derives "name still missing → show N" or silently skips straight to the sticker step,
  leaving the account nameless through the *other* pathway the doc didn't design a catch for.

### 3. SERIOUS — The "missing name" heuristic can trap a real customer named Julius forever
**Citation:** `docs/delve-cycles/12-onboarding.md:141` — `"the name is missing when userName
trimmed is empty, or equals 'Julius' while ownerMode !== true"` (D12-4, `:319`).
**Detail:** This rule exists to catch accounts poisoned by the current `DEFAULT_SETTINGS.userName =
'Julius'` bug (F1). But going forward it is also literally true for any real, non-owner customer
whose actual first name is Julius. That person hits the forced, un-skippable Name screen (§4.1: "It
can't be skipped"), types their real name "Julius", saves it — and on every subsequent app open the
same `userName === 'Julius'` check re-fires and shows the screen again, forever, because the rule
has no way to distinguish "still the stale default" from "correctly re-entered by its owner." This
is a small population but a concrete, testable, self-inflicted infinite loop with no exit in the
current spec, and it isn't listed among the Open Questions (§10).

### 4. QUESTIONABLE — Install-card mechanism (pick 2) assumes an event that may not exist yet on a cold first visit
**Citation:** `docs/delve-cycles/12-onboarding.md:220` — `"Android Chrome | The button 'Add to home
screen' fires the saved beforeinstallprompt event."` (D12-9, §6.2).
**Detail:** Chrome's installability heuristics commonly require some prior engagement/visit signal
before firing `beforeinstallprompt` — it is not guaranteed to have fired by the end of the very
first round of a user's very first session from a cold ad click, which is exactly when this card is
shown (§6.2: "On the first round-end burst only"). Grep of `index.html` finds **no existing
`beforeinstallprompt` listener at all** (this is 100% new code), so there is no prior art to lean on
for how often the event is actually available at that moment. The environment table in §6.2 defines
states for Android Chrome / iOS Safari / in-app browser / already-installed, but not "event never
fired yet" — which, for a first-session ad visitor, may be the *common* case, silently degrading the
button to a no-op with no stated fallback copy.

### 5. QUESTIONABLE — Google name auto-fill leans on an unverified Supabase payload shape
**Citation:** `docs/delve-cycles/12-onboarding.md:130` — `"Taken automatically from
user.user_metadata.given_name, else the first word of full_name/name."`
**Detail:** Grep of `index.html` for `given_name` / `user_metadata` returns zero hits — this is new,
untested code, not an existing pattern being reused. Supabase's default Google OAuth scope does not
reliably populate `given_name` in `user_metadata` (commonly only `full_name`/`name` and `avatar_url`
are present unless extra profile scopes are explicitly requested). The doc's fallback to "first word
of full_name/name" likely covers the common case, but Task 2 is marked FINAL for the Google path
without the on-device verification of the actual OAuth payload that would confirm the primary field
even exists — this belongs next to OQ-2 as a build-blocking check, not an implicit assumption.

### 6. QUESTIONABLE — Sign-up-wall Google placement (D12-8) is FINAL while its own detection mechanism is marked unverified in the same doc
**Citation:** `docs/delve-cycles/12-onboarding.md:192` (webview UA sniff) vs. `:335` OQ-2 — `"Is
in-app-browser detection (FBAN/FBAV/Instagram user agent) reliable on current FB and IG builds for
Android + iOS, and does Google OAuth really fail there today? | QA adversary, then a device check"`.
**Detail:** §9's decision table and §12's ADR-P12c both list D12-8 (Google main-button-except-webview
placement) as FINAL, yet the mechanism that decides which button is "main" is simultaneously flagged
as unconfirmed two sections later. Nothing here is wrong per se — flagging it as an open question is
correct practice — but a "FINAL" decision whose central detection primitive is explicitly unverified
should say so at the decision site (§5.3), not only in the open-questions table, so a reader scanning
§9's decision list doesn't mistake it for fully closed.

---

## Verdict

**WARN.** No fabricated line numbers or function names were found — every code citation checked out.
The doc's own reversal triggers and Method are sound in general shape. But one grounding figure is
cited as fact after being explicitly retracted by its own source's verify gate (finding 1), two of
the charter's named dead-end scenarios are simply absent (finding 2), and one FINAL decision
(D12-4's name-missing rule) contains a self-inflicted infinite loop for a real, if narrow, user
population (finding 3) — that combination is more than cosmetic and should come back through
synthesis before ADR-P12a–c are filed as-is.
