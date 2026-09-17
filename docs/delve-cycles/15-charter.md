# Delve 15 — Coming back: the app has no idea you were gone

## Domain
The owner describes his own usage, verbatim: *"I'm the type of person that gets in the car, notices I
have time to use the app and practice — and this is my main repetitive source to learn from — and get
busy. I am like this with gym, boxing, work."* Bursts of real intensity, then life takes over, then a
return. Two things follow. First, the drill is **layered onto occupied time** — driving, eyes and
hands busy — which is podcast territory, not app territory, and is why the hands-free loop is the
product rather than a feature of it. Second, the learner is **inconsistent but persistent**: the
pattern that consecutive-day streak mechanics are least equipped to serve, since they reward
regularity and punish intensity-in-bursts.

Measured this session with `scripts/probe-lapsed-return.cjs` (committed `1825d49`; seeds a returning
user — 268 words practised, mid-batch in `food`, streak 11 — then opens the app after N days):

- **No review flood.** After 60 days away with 268 words overdue, the first round back is still 10
  words. Good — but **incidental**: the pinned sticky batch causes it, nothing decided it, and any
  change to selection could remove the property without anyone noticing.
- **The streak cannot break.** Away 14 days → still 11. Away **60 days → still 11**. `updateStreak`'s
  v8.10 silent freeze asks "is a freeze left this week?" and never "how many days were missed" —
  and on a gap the weekly budget is *reset first* (`freezeWeekKey !== wk`), so a 60-day absence costs
  exactly one freeze. **The headline fire number reads 11 while the learner practised 11 of the last
  71 days.** It is dishonest in the forgiving direction, and it is on screen at every open.
- **Home after 60 days is byte-identical to home after 1 day** — same greeting, same card — and it
  tells a 268-word user *"Let's make your first words stick"*.
- **The overdue pile has no path back.** Reviews reach the learner only through the pinned batch of
  whichever category is opened; Practice is a topic browser and there is no due/catch-up entry point
  in the main flow. Words learned two months ago rot while the app knows they are overdue.

A second dishonest measure sits alongside: `stkProgress` awards sticker tiers
(paper→bronze→silver→gold→holo) on words **heard at least once** — hear a word one time and it counts
toward gold. Meanwhile v9.32's auto-swap test (12+ hears · SRS 3+ days out · no "Missed it" in the
last three) is a genuinely honest signal that **already exists and is already computed**.

## Stacked callouts (binding, not re-openable here)
> **LOCKED:** launch is Japanese-only; the launch path is PARKED (owner, 16 Sep) · the hands-free
> audio drill loop IS the app · re-entry keeps the SAME pinned words — only Mix or auto-swap changes
> them · auto-swap stays STRICT with Undo · no hints on the drill card · no bespoke micro-drills or
> question screens (killed v8.98) · STT never grades · stickers are the category model and no tile is
> ever split (delve 13 D2 — sticker identity) · AI conversation/avatar benched.
> **Delve 13 is binding where it overlaps** (tiers, family sizing, round composition, and D16 — no new
> pack field and no new stats field; argue explicitly if a return mechanic needs one).
> **The no-flood property is a requirement, not a nicety:** every proposal must be re-run through
> `scripts/probe-lapsed-return.cjs` at 3 days, 3 weeks and 3 months and shown not to break it.
> Grounding: `scripts/probe-lapsed-return.cjs`, `docs/delve-cycles/13-pieces-everywhere.md`,
> `docs/delve-cycles/12-onboarding.md`. In `index.html`: `updateStreak`, `weekStart`, `stkProgress`,
> `renderHome`, `renderPractice`, `_buildSpamPick`, `buildGenerateVocabSpamLesson`, `_autoSwapCheck`.

## Primary
**Mode:** Opus-only

### Investigation tasks

1. **What the app says when you come back — pick FINAL.** Define the behaviour at 3 days, 3 weeks and
   3 months: what the home screen says (it currently says *"Let's make your first words stick"* to a
   268-word user, identically at 1 day and 60 days), whether the half-finished category is offered
   back, and what — if anything — acknowledges the gap. Decide the thresholds and the copy. Beware
   the obvious trap: a "welcome back, here's what you missed" screen is a new screen, and delve 12's
   rule that every extra step loses people applies on return too. "Say nothing, just work" is a
   legitimate FINAL answer and must be argued, not assumed.

2. **How the overdue pile comes back — pick FINAL.** 268 overdue words, ten-word rounds, and a hard
   requirement never to build a wall. Decide: does catch-up live inside the normal category flow
   (reviews seeded into the pin), or is there a dedicated entry point, or does the pile simply stay
   buried? State the per-round dose, how it interacts with the pinned batch and with delve 13's round
   composition, and what happens to a word that has been overdue for months — is it still "known", or
   does it re-enter as new? **Re-run the probe and show the no-flood property holds.**

3. **The streak — the owner has picked; build the rule and try to break it.** Asked directly this
   session which number should headline the home screen — consecutive days, sessions, weeks touched,
   words nailed, or nothing — the owner chose **words nailed**, on the v9.32 test that already
   exists (12+ hears · SRS 3+ days out · no "Missed it" in the last three). That is the decision, not
   a candidate: a count that only rises, that a two-month gap cannot punish, and that a subscriber
   can point at to justify paying. **Do not re-open the choice.** Do decide everything it leaves
   open: what the number is called on screen, whether the consecutive-day streak and its fire icon
   are removed outright or demoted somewhere secondary, what happens to the v8.10 silent freeze once
   nothing depends on it, what the number reads for an account whose words are all below the nailed
   bar (**zero is the honest answer and a bad first impression — resolve it**), and whether it can
   ever fall when a nailed word decays. Show the rule against every probe scenario. If the panel
   finds the choice is unbuildable or actively harmful, say so plainly with evidence — that is an
   escalation to the owner, not a licence to substitute a different metric.

4. **Honest progress — pick FINAL, and price it.** `stkProgress` tiers on words *heard once*; the
   v9.32 nailed test is honest and already computed. Decide whether visible progress (sticker tiers,
   the album, the headline metric) moves onto the honest measure. If yes, confront the cost head-on:
   **existing accounts, the owner's included, visibly lose progress** — quantify it for a real
   account, decide whether it is announced or silent, and note that with five accounts today this is
   the cheapest it will ever be. If no, say what the tier is then claiming to mean.

5. **Measurement.** The minimal events to log so a real ad cohort shows whether returners actually
   return — mapped to the existing log calls, no new sink. Name the success number for v1 and state
   what five accounts cannot show.

### Output
Primary doc: `docs/delve-cycles/15-coming-back.md`
Sections: Charter · Method · one per task (1–5) · The return rules (stated once, plainly) ·
Decisions reached · Open questions · Build list · ADR proposals.

## Adversaries

### Adversary 1: devils-advocate (LEAD)
**Read:** primary doc, `updateStreak`, `stkProgress`, `renderHome`, the probe and its output
**Audit:** (1) The owner has chosen **words nailed** as the headline number. Attack the consequences,
not the choice: a new account reads **0** for days before anything is nailed, where the fire streak
read **1** on day one — is that a worse first week than the dishonest number it replaces? And does
removing a daily streak cost more returns than an honest number wins? Evidence either way. (2) Does any return mechanic add a screen that
delve 12 spent a whole delve removing? (3) Retroactive progress loss (task 4) hits the owner's own
account and any real signup: is "now is the cheapest it will ever be" a reason or a rationalisation?
(4) Is the bursty-learner premise generalised from **a sample of one**? The owner has said plainly he
does not know who will sign up — attack the assumption that his pattern is the market's.
**Output:** `15-coming-back-devils-advocate.md`

### Adversary 2: qa
**Read:** primary doc, `scripts/probe-lapsed-return.cjs`, `updateStreak`, `weekStart`, `stkProgress`,
`_buildSpamPick`, `buildGenerateVocabSpamLesson`, `_autoSwapCheck`
**Audit:** (1) Re-run the probe's scenarios against every proposal — 3 days, 3 weeks, 3 months, and a
returning user who was mid-Mix when they left. **Does the no-flood property survive?** (2) Clock
edge cases the current code is exposed to: timezone change, device clock moved, `localToday()` vs
`toLocaleDateString('en-CA')` drift, a week boundary crossed mid-gap. (3) If tiers move to the honest
measure, what exactly happens on next load for an existing account — stickers already awarded, the
album, `collected` flags? Demand the migration, and demand the owner's account be named.
**Output:** `15-coming-back-qa-design.md`

### Adversary 3: code
**Read:** primary doc, `updateStreak`, `stkProgress`, `renderHome`, the selection path
**Audit:** (1) Buildable without touching the v9.30/9.32 seams or delve 13's pending changes?
(2) Size each decision; flag anything needing state D16 forbids. (3) Does the streak rule as written
have exactly one code path, or does it fork per scenario the way the freeze logic already does?
**Output:** `15-coming-back-code-review.md`
