# Delve 9 — Devil's-advocate audit (LEAD)

> Read-only adversary pass over 9-commercial-spine.md (committed 2679168).
> Lens: challenge the premise. Is this solving the right problem? What is
> fragile, over-built, or wrong by construction? All citations verified against
> source (index.html, backend/, REPORT.md) this pass.

## Steelman first (what is genuinely right)
The doc is unusually honest: it names the sign-in tension instead of papering
it, states cost/mitigation/measurement for the strict wall, and picks (B)
no-goal-wizard on a sound "can't reset what doesn't exist" argument. The 402/
401/429/503 table and the anti-urgency copy covenant (5.3) are the strongest
parts and I do not challenge them. Gates G1/G3 are correctly "PASS by
construction." No prompt-injection text found in the primary doc or the charter.

## Findings

### F1 — SERIOUS. "Strict up-front" is the doc's own call, propped up by a misused citation
Section 4.2 rejects the loose reading and justifies the strictest possible funnel
wall partly with: "The competitor's evidence. Praktika gates behind signup and
converts at $2M/mo scale (REPORT HIGH-2)" (4.2.4). REPORT HIGH-2 (REPORT.md:51)
is about pricing/revenue, not about a hard pre-content signup wall being a WIN —
and REPORT.md:57 explicitly warns Praktika's economics are "subsidized by a
$35.5M war chest and English-scale demand." A zero-brand PWA served from
jvrj.github.io asking for Google OAuth before a single word of content is a
categorically different funnel-risk than a venture-funded App-Store-ranked app.
The owner locked "sign in up front" (a phrase 4.2.1 itself concedes is only the
"natural reading"); strict-before-ANY-content is the DOC's interpretation, not an
owner lock — and it is the single highest-risk decision in the delve.
Why it matters: the loss-aversion is one-sided — Praktika's revenue is borrowed
as confidence while Praktika's risk-context is dropped. Alternative: the loose
reading (one scripted taste, auth at the "Keep talking" tap, S4) still satisfies
"sign-in up front pre-trial" literally (auth precedes the trial/paid surface) and
lets the ad cohort hear Japanese before handing over an identity. At minimum ship
as an A/B, not a locked FINAL.

### F2 — SERIOUS. Trial clock starts at signup, not first live-talk — "7 free days of talk" is not usage-honest
Section 3.3 S4: "the clock started at signup per profiles.trial_started_at, but
the felt moment is this tap"; the offer headline (5.3) is "Your 7 free days of
talk are done." The clock is calendar time from signup (confirmed: entitlement.mjs
returns trial_ended when ends < now, ends = signup + 7d). Because drills/scripted
practice are "free forever," a user can sign up, use only free surfaces, and
return on day 8 to find the LIVE-talk trial expired without ever having talked
live. Section 5.5's own reversal admits this class: "users hitting day 7 without
ever starting a live convo." Selling "7 free days of TALK" while the days elapse
whether or not you talk directly strains the doc's own G4 honest-surface/
billing-surprise gate (Section 6-G4). Why it matters: this is a wrong-by-
construction property of the trial MODEL, not the copy — polishing anti-urgency
wording cannot fix a clock that bills unused time. Alternative: lazy-start
trial_started_at on first successful live-talk call, or change copy to "7 days
from sign-up" and show the real end date on S0. A backend-contract question the
delve deferred instead of raising.

### F3 — SERIOUS. First-run flow contradicts the REPORT's #1 verified wedge (kana on-ramp first, not speaking-first-from-cold)
FINAL (B) lands a brand-new A0 install straight into a scripted speaking
conversation (S3 / OB-3A) and 3.2.4 cites HIGH-1: "OB-3A serves exactly that
user." But HIGH-1's actual action is the opposite: REPORT.md:33 "do NOT copy
Praktika's speaking-first-from-cold approach for true beginners" and REPORT.md:37
"Audit that the kana + core-vocab on-ramp is the FIRST thing a new user hits, not
gated behind a speaking task." The 3.3 first-60-seconds table contains NO kana
on-ramp screen — promise, path, mic, scripted speak. The doc invokes the report's
wedge while designing against it. Why it matters: the report frames kana-first as
Isshin's differentiation from Praktika's abandoned-beginner segment — the moat,
per HIGH-1. Dropping it from the first run trades away the delve's own stated
wedge. Alternative: insert the existing kana module as the A0 entry for
path:'beginner' before the scripted exchange, or argue with evidence why
speaking-first beats the report — the doc does neither.

### F4 — QUESTIONABLE. BYO-key deletion at flip-on is a big-bang cutover with no client-side rollback
Section 7.1: "the BYO call paths are deleted, not hidden." This removes the only
proven client fetch path (~10 call sites, 7.3.1) at the exact moment an untested
relay+auth+entitlement stack goes live. 7.4's rollback ("re-paste personal key")
exists only in Phase-1 code; Phase 2 has none but a git-revert redeploy. The
v8.23 keyed-mock lesson cited FOR deletion actually cuts the other way — it proved
a masked breakage, which argues for a tested fallback during the riskiest cutover,
not its removal. Alternative: dead-code BYO behind a build flag at Phase 2 (delete
at store build) so a relay failure in the first live week is a flip, not a
redeploy.

### F5 — QUESTIONABLE. Precision funnel-UX designed pre-deploy / pre-PMF (sequencing risk)
The entire commercial spine — anti-urgency copy covenant, banned-mechanics gate,
S0-instrumentation plan — is specified while the backend is "blocked today on the
DO_THIS_NEXT 'keys ready' accounts step" (7.4): not yet deployed or smoke-tested.
None of it is buildable or measurable until the relay ships and an ad cohort
exists. Why it matters: the highest-leverage unknown is "does anyone convert at
all," which needs the relay live plus a handful of real users, not a polished
paywall covenant. Alternative: gate Section 5 copy-precision behind "relay
deployed + first 20 real trials observed"; ship the minimal offer screen first.

### F6 — NITPICK. Reversal thresholds are invented, presented as decided gates
"S0 completion < ~60%" (4.2.5), "completion below ~50%" (3.4), "below the ~2-5%
freemium baseline" (5.5) carry no derivation. Fine as placeholders, but they read
as committed gates. Label them "to be calibrated on first cohort" so they are not
cargo-culted into ADR-P1/P2/P3.

## What would change my mind
- F1: evidence (even one comparable indie PWA) that a pre-content OAuth wall from
  a cold ad converts better than one-taste-then-auth. The doc has none.
- F2: a backend change to usage-start the clock, OR copy that states "7 days from
  sign-up" — either removes the honesty gap.
- F3: an explicit, evidenced argument that speaking-first-from-cold beats the
  report's kana-first wedge for A0 users.

## Verdict: WARN
Thorough, honest, mostly well-reasoned — but three SERIOUS premise issues stand:
a strict signup wall justified by a misapplied revenue citation (F1), a trial
clock that bills unused time against a "7 free days of talk" promise the doc's own
G4 gate should reject (F2), and a first-run flow that contradicts the delve's own
#1 verified wedge (F3). None fatal-by-construction, but all three should be
resolved (or explicitly accepted with reasons) before ADR-P1/P2/P3 are filed.
