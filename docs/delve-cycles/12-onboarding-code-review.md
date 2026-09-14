# Delve 12 — Onboarding: code-review audit (adversary: code)

**Auditing:** `docs/delve-cycles/12-onboarding.md` @ commit `0860308c`
**Lens:** buildability against the current `nav()` gate order, citation accuracy, change-size / cost.
**Method:** every F1-F8 fact, every line-number citation, every quoted string, and every constant
(`COLD_N`, `SYNC_SETTINGS_EXCLUDE`, `AUTH_GATE_TIMEOUT_MS`, `_syncWithTimeout(...,6000,...)`,
`_convoSafeName`'s 24-char cap, `_OBF_ORDER`, every retired `_obLog` event name) was re-read directly
against `index.html` (30,066 lines) and `backend/supabase/config.toml` in the working tree, not
taken on trust. Verdict up front: this doc's citation discipline is unusually strong. Of roughly 25
spot-checked citations, every one resolved to the exact function/line/string claimed, including
several that were precise to the line (nav() at 26837, `_obfSticker` at 27376, `enable_confirmations
= false` at config.toml:226, `COACH_INTRO_LINE` string verbatim). Findings below are the exceptions.

Note on scope: no text in the primary doc or the charter read as an instruction directed at me
(such as "ignore previous instructions"); both were treated as inert data throughout, per my brief.

## Findings

### 1. [SERIOUS] Google name pre-fill is an unverified, unflagged assumption load-bearing for the "0 extra screens" claim
D12-4 / Section 4.1 states the Google path costs 0 extra screens because the name is "Taken
automatically from user.user_metadata.given_name, else the first word of full_name/name." A grep of
the entire working tree for user_metadata, given_name, and full_name returns zero matches anywhere in
index.html, and backend/supabase/config.toml has no [auth.external.google] block at all (Google is
configured only in the live dashboard, invisible to this repo). Unlike every other fact in this doc,
this one traces to nothing in the codebase. Its sibling assumption, F8 ("Google OAuth is refused
inside embedded webviews... verify on device"), is correctly flagged as unverified and routed to
OQ-2/QA. This assumption gets no F-number and no open question. If given_name is not reliably
populated, the "Google with no name" row (described as "rare") would fire more often, undermining
the timing table and the "screens before the round: 2 (Google)" result baked into D12-1 and the
ADR-014 <=5 acceptance gate.
**Fix:** add F9 with the same verify-on-device treatment F8 got, plus an open question.
**Citation:** primary doc Section 4.1 table, Google row: "Taken automatically from
user.user_metadata.given_name, else the first word of full_name/name." No match for user_metadata in
index.html; no google provider block in backend/supabase/config.toml.

### 2. [QUESTIONABLE] Install-card copy implies existing beforeinstallprompt capture that does not exist
Section 6.2's table says the Android button "fires the saved beforeinstallprompt event," phrasing
that reads as if capture-and-defer logic already exists somewhere to reference. It does not: a grep
for beforeinstallprompt across index.html returns zero matches. The doc's own F7 gets this right
("no beforeinstallprompt handling"), but that framing does not carry into Section 6.2's phrasing or
into the Section 11 build list, which lists only the iOS 2-step sheet under Round 2 and never calls
out "capture beforeinstallprompt on load, preventDefault, stash it" as new global boot wiring (next
to the existing init() listeners around index.html:29906-29940). Small addition, but a builder
working from Section 6.2 alone could go looking for a "saved event" that was never captured.
**Citation:** primary doc Section 6.2 table, Android Chrome row: "fires the saved beforeinstallprompt
event"; contrast with primary doc F7: "no Notification or push, and no beforeinstallprompt handling."

### 3. [QUESTIONABLE] No change-size / cost estimate anywhere, despite the charter asking this seat for one
The charter's audit brief for this seat says: "Estimate the change size per decision; flag anything
costly." The primary doc supplies no sizing anywhere. That is a defensible choice if sizing is this
adversary's job, but it means the doc never itself flags the one decision categorically different
from the rest: D12-10 is the only decision requiring new backend surface (a new Supabase table, an
insert-only security-definer RPC with an allowlist, RLS work "in the style of
0003_sec1_rpc_lockdown.sql" - confirmed that migration exists at
backend/supabase/migrations/0003_sec1_rpc_lockdown.sql - plus client batching/flush-on-
visibilitychange wiring). Every other decision (D12-1 through D12-9) is copy edits, one new
one-field screen, and markup on existing templates. Section 11's build list is scoped to design/UI
only and never mentions D12-10, so a reader skimming Section 11 as "the work" would miss the single
largest and riskiest item (an open insert endpoint) in the whole plan.
**Estimate:** D12-1/2/3/5/8 = small, copy/markup only. D12-4 = small-medium (the risk is getting the
"missing name" predicate and its nav() placement right, not code volume). D12-9 = medium (Android
capture is new; iOS is copy-only). D12-10 = the largest single item - new migration + RPC + RLS +
a security-review pass - and belongs gated before ad scale, not folded silently into "Task 5."
**Citation:** charter docs/delve-cycles/12-charter.md, Adversary 3: "Estimate the change size per
decision; flag anything costly."; primary doc Section 7.1 (D12-10 scope) vs. Section 11 (D12-10 absent).

### 4. [NITPICK] The nav() gate-order claim is correct but relies on a boot invariant the doc does not cite
D12-4 says the name catch-up is safe because it mirrors the home->onboard rewrite (index.html:26872)
and runs before the onboard mirror guard (26876). This was traced and holds - but only because
init() unconditionally reseeds history.replaceState({screen:'home'}, '', '#home') on every boot
(index.html:29913), so state.screen always transits through 'home' and the gate cannot be bypassed
via a deep hash link. The doc does not cite this boot invariant, so the "no skip" claim is true but
its proof is not spelled out. Worth a one-line addition at synthesis; not worth reopening the decision.
**Citation:** index.html:29913 history.replaceState({screen:'home'}, '', '#home'); primary doc
Section 4.2: "the check runs: in nav(), immediately after the onboarding rewrite and before home
renders."

## What checked out cleanly (no finding, stated for the record)
F1 (userName:'Julius' at 4792, {...DEFAULT_SETTINGS,...saved} at 5364) - F2 (_obLog at 27688, log()
at 5567 pushes to state.logs only) - F3 (enable_confirmations = false at config.toml:226,
authDoSignUp's in-page completion branch at 7395) - F4 (obMicAllow v8.69 comment at 27810,
_voicePreflightMic reused) - F5/F6 (COACH_INTRO_LINE + "Start now ->" verbatim at 24253-24290,
_stkBurst's tomorrow line verbatim at 27334) - _OBF_ORDER = ['w1','w5','mic'] confirming W2-W4/W6 are
already unreachable - COLD_N = 10 matching the "10 words" copy - SYNC_SETTINGS_EXCLUDE not containing
userName - _convoSafeName's exact 24-char / strip-quotes-and-newlines validation - the Section 3.2
timing arithmetic (3+4+8+5+4=24, 3+4+22+5+4=38) - all 10 retired _obLog event names confirmed present
at their claimed call sites - 0003_sec1_rpc_lockdown.sql exists - ADR-014/ADR-015 exist in
docs/decisions-pending/ matching the doc's "pending" framing - the nav() gate order itself (auth gate
then home/onboard rewrite then onboard mirror guard) matches the Method section's citation exactly.

## Verdict: WARN

Nothing here is fatal - the flow is buildable as described and the nav()-gate-order claim holds. The
WARN is for finding 1 (an unverified assumption doing real load-bearing work in a doc whose entire
methodology is "read the code, not memory," and which correctly flags the sibling assumption but not
this one) and finding 3 (the charter explicitly asked this seat for cost sizing, and the doc gives
none, silently under-selling the one decision, D12-10, that is a different order of magnitude of work
and risk from the rest). Recommend: add F9 (Google metadata) plus an open question before synthesis
locks D12-4's "0 extra screens" framing, and have synthesis explicitly size and gate D12-10 separately
from the Section 11 design build list.
