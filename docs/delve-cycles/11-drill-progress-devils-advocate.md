# Delve 11 — Devil's-Advocate audit (LEAD adversary)

**Target:** `docs/delve-cycles/11-drill-progress.md` @ 2b31ae8c · Round 1 · 2026-08-06
**Lens:** challenge the premise — right problem? fragile / over-built / wrong-by-construction?
**Boundary:** read-only; this is the only file written. Verified all cited code against the
working tree (`index.html`, v8.49 era). No injected-instruction text found in the primary doc
or charter — both read as clean design prose.

---

## Verdict: WARN

The decisions are internally coherent and the freeze diagnosis (§2.1) is correct and
code-verified. But the LEAD lens turns up three material premise problems: the headline
metric's LABEL overstates what its MECHANISM measures; the credit-plumbing rewrite (§5) is
bundled scope that the doc itself admits is not needed to fix the owner's complaint; and
"progress" is being redefined to the one dimension that is easy to feed (vocab breadth)
rather than the one the product is about (conversation). None are fatal — the design ships a
moving bar — but each should be answered before ADR-P1/P2 lock.

---

## Findings

### 1. SERIOUS — "Words that stick" is an exposure counter wearing a learning label
The headline number N = `progWordsProducible()` = solid+mature+mastered (L21481), and
`progIsSolid` (L21465-21471) requires only `correctCount >= 3` at `>= 70%` accuracy. In the
hands-free loop the product is *designed around*, the default grade is `smGrade(st, 'good')`
unless the user taps "Missed it" (L19053), and 'good' increments `correctCount` (L3878). So a
word crosses "stick" after **three autoplay passes with no tap** — accuracy stays 1.0 by
default. N is therefore, by construction, `floor(exposures/3)` for any user who does not
self-penalize. The doc concedes this ("N is 'words that stick' under exposure + self-honesty,
not machine-verified recall") but keeps the word **"stick,"** which asserts retention the
mechanism cannot observe. This is exactly the charge §3 levels at the rejected composite ("a
vanity number by construction") — a mislabeled number is arguably worse than an unexplainable
one because it makes a false learning claim to a *paying* user. The v8.03 STT-never-grades
lock makes exposure the only signal — fair — but that argues for an honest label ("words
practiced" / "words seen"), not for calling exposure "stick." Fix: rename to a claim the
mechanism supports, or gate N on the self-rating channel rather than default-good exposure.

### 2. SERIOUS — §5 credit-plumbing rewrite is bundled scope the doc admits is unneeded
The owner's complaint is "it still shows 0% progress." §6 states the fix needs no writes:
*"The owner's real phone profile unfreezes by arithmetic alone"* — swapping the metric to N
reads existing `state.stats` and is already non-zero. Yet §5 rewrites SRS credit from
completion-bulk to a new per-step seam (`_buildCreditStep`), adding an exactly-once-per-session
invariant (`b._credited`) that must hold across restart, back-step, resume, and interrupt —
the classic breeding ground for double-credit / lost-credit bugs, which the qa head is asked
to attack. The stated payoff ("interrupted rounds earn what was done") is orthogonal to the
0% complaint. Bundling a risky SRS-write-semantics change (ADR-P2) into a display-bug fix
enlarges the blast radius and couples two things that could ship independently. Fix: ship the
metric swap (§3/§4) as the actual answer to the owner; land §5 separately-gated.

### 3. SERIOUS — redefining "progress" as vocab breadth measures what is easy, not what matters
The north-star is "an AI friend/teacher you converse with"; the spine framing was "path to a
real conversation." §4 removes that framing and §6 buries verbs-in-all-forms (headline) and
removes sentences-drilled from display, collapsing the single Home number to **vocabulary
count alone.** Conversational ability is grammar + sentence production, not isolated-word
breadth — the two dropped tracks are precisely the production dimensions. The honest reason
they are dropped is that the core loop cannot feed them (§2.1.2-3): the metric is chosen for
feedability, not validity. A paying user is told "progress = you know more separate words,"
which can rise indefinitely while conversational competence does not. Steelman / what would
change my mind: with conversation explicitly BENCHED for v1 (2026-08-03 anchor), vocab
breadth is a defensible *interim* proxy and the simplicity is real — acceptable IF the doc
commits to re-introducing a production signal before conversation un-benches, and ADR-P1 does
not permanently define progress as word-count.

### 4. QUESTIONABLE — first-session bar near-full from pure idling (gaming vector sold as a feature)
§3.2 markets Session 1 as "24 words each get one credited recall pass → W jumps 0→24. Bar
shows warm fill ≈ 24/25 on tier 1. *Visible movement: first session.*" Since warming = "≥1
correct attempt" and that attempt defaults to 'good' on the timer, a brand-new user who just
presses play sees a **near-full tier-1 bar having learned nothing.** The doc's own §5.2 flags
"idling autoplay still accrues 'good' credit" as the gaming vector, then §3.2 re-sells the
same behavior as a headline win. A bar that fills from doing nothing is the textbook vanity
bar this delve exists to remove; the ≥3-correct floor protects N but not W, and W dominates
first-session fill. Fix: make warming require the self-rating channel or ≥2 attempts across
≥2 sessions, so first-run fill reflects return, not idle exposure.

### 5. QUESTIONABLE — lighting the core-loop streak reintroduces the loss-aversion the register bans
§5.1.1/§7 newly feed `updateStreak(!missed)` from the core loop (today it never does —
verified: 7 call sites at L8001/8895/9448/12796/13986/14365/14981, none in the Build path).
Delve 9 LOCKED "judgment-free register — no urgency-guilt mechanics." A count-up streak is
fine until it breaks: with freezes exhausted, `state.streak.current = 1` (L6430) — the number
visibly collapses, and loss-aversion is the mechanism whether or not a "funeral screen"
exists. 2 freezes/week does not cover a holiday. Turning on a consecutive-day counter for the
app's main loop is a register decision, not the neutral bug-fix §7 frames it as. Fix: keep
the streak hidden-by-default, or display "days practiced (lifetime)" so a break never subtracts.

### 6. NITPICK — lifetime "warming" shows a large stale bar on an abandoned profile
Open-Q1 defaults warming to lifetime-any-correct, so a year-idle profile still renders a big
warm segment implying momentum that is not there. A 14-day recency window is the cheap honest
default and worth deciding now, not post-v1.

---

## What would flip this to PASS
- Headline renamed to a claim exposure supports, OR N gated on the self-rating channel (F1).
- §5 credit rewrite split from the metric swap, or an explicit note that the 0% fix ships
  without §5 (F2).
- A committed path to a production/grammar progress signal before conversation un-benches (F3).
