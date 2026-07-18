# Delve 7 — QA/Design Adversary Audit

> Adversary: qa-tester. Read: primary doc `docs/delve-cycles/7-feedback-soul.md` (committed
> 31a51fc3). Cross-checked cited `index.html` line numbers against the working-tree source
> where a finding depended on it. Charter and primary doc scanned for embedded-instruction
> injection attempts — none found (searched for "ignore previous", "disregard", "git add -A",
> "git commit", etc.; no matches).

## Method

Walked the four charter scenarios (nervous-beginner first session, mishear-twice-with-feedback-on,
owner's-exact-complaint tap count, one full module to completion) against the doc's locked
mechanics, then verified the mechanics the walkthroughs depend on against the actual engine code
the doc itself cites, since a scenario is only as sound as the code path it claims exists.

---

## Findings

### 1. SERIOUS — Module progress counter can advance on turns that communicated nothing

**Citation:** `index.html:9711-9719` (the "(c) Low landed" branch of the downshift ladder inside
`convoTurn`) vs. primary doc §6.3, quote: *"score never gates progress (a clarify-retry turn
simply doesn't advance, exactly as today's ladder already works)."*

The doc's Task-4 walkthrough answer ("does progress feel real") rests entirely on this claim. But
reading the cited ladder: `parsed.landed >= 2` → `cv.turn++` (path a); `parsed.landed === 1` → no
advance (path b, the *only* non-advancing branch); `else` (i.e. `landed === 0`, an unparseable or
totally-missed turn) → **`cv.turn++` again** (path c, labeled in-source "Low landed: correct and
advance"). So `cv.turn` — the doc's chosen "task" unit (§6.3: *"A 'task' = one advanced
exchange — `cv.turn` increment, the engine's existing progress atom (9699)"*) — advances on BOTH
score-2 *and* score-0 turns, and only score-1 blocks it. Two consequences the doc doesn't address:

- A learner who repeatedly says something the model can't parse at all (score 0, the double-miss
  streak lane) still fills the module's progress arc — "sit in it for X tasks" can complete
  without a single successful exchange. This is precisely the failure mode charter audit #4 asks
  to check ("does progress feel real").
- Per §3.1's own clarify-firing rule, `clarify` also fires on **score-2** turns with an
  implausible/garbled transcript (the exact worked mishear case in §3.6). Since score 2 always
  hits the advancing path (a), a clarify-because-mishear turn *does* advance the module counter —
  directly contradicting the "clarify-retry turn simply doesn't advance" claim, which is only true
  for score-1 clarifies, not score-2-garbled ones.

The lock (L14, §6.3) needs either a corrected claim or a code change (out of scope for this doc to
make, but the *design* as written doesn't match the engine it cites, and the acceptance criterion
"progress = production volume, never accuracy" is stated as already-true when it's actually
already-false for the score-0 case).

### 2. SERIOUS — the "deterministic" false-correction gate is partly a prompt instruction, not enforced code

**Citation:** primary doc §3.6, quote: *"1. Score gate (client, deterministic): recast only ever
on `judged.score == 2` turns."* vs. §3.3's enumerated consumer list (the only concrete client-side
checks named are: `_convoNormFeedback` defaulting absent/malformed/unknown-`type` to `none`, and
the echo guard). Also §8 Stage F2's implementation list, which enumerates `_convoNormFeedback` +
echo guard as the only new normalization code.

Nowhere in §3.3 or §8 is there a client-side check that cross-validates `feedback.type` against
`judged.score` (e.g. "if `parsed.feedback.type === 'recast'` but `parsed.judged.score !== 2`,
downgrade to `none`"). Both `judged` and `feedback` are produced by the *same* model call under
instruction, not independently verified — labeling this "client, deterministic" overstates what's
actually enforced. The charter's own audit item 2 for this adversary asks to "walk the
mishear-twice path... does the clarify-degrade actually fire" — the honest answer per the doc as
written is: *maybe*, because the primary defense (§3.6 Layer 2, "plausibility instruction (model)")
is pure prompt compliance with no proposed verification method (no eval fixture set of known
garbled transcripts, no fallback if the model ignores the instruction and confidently recasts a
transcription artifact anyway). The worked example in §3.6 shows the *intended* outcome, not a
guaranteed one — it is not a test, it's a hope.

### 3. QUESTIONABLE — no frequency/fatigue throttle on recast density across a session

**Citation:** primary doc §3.1 (recast fires whenever `judged.score == 2` AND "a fixable form gap"
is detected) vs. §7.2 (*"explicit anti-template rule: 'never open two consecutive turns with the
same word'"* — a throttle the doc DOES apply to openers but not to feedback).

A genuine beginner produces frequent grammar/form errors. Nothing in the recast-firing condition
caps how often it fires per session (`cv.recastLog` at cap 10 is a storage cap, not a display-rate
throttle). If recast fires on most turns, the learner sees a correction-adjacent signal
(underline glow + peek) on nearly every turn for an entire session. Despite the "never red, same
pulse as confirm" framing, a near-constant per-turn correction cue is a plausible source of the
exact "feels graded" reaction charter audit #1 asks the walkthrough to hunt for — the doc's
mitigation (identical pulse color, no counters) addresses accumulation/visibility, not frequency.

### 4. QUESTIONABLE — no first-use explainer for the new feedback UI signals

**Citation:** primary doc §3.4 (gold pulse, soft-underline glow, tap-to-peek sheet) — no onboarding,
tooltip, or first-occurrence explainer is specified anywhere in §3 or §8's Stage F2 sketch.

Walking the nervous-beginner first session (charter audit #1): the very first recast a learner
encounters is an unexplained visual change under the partner's text with no context. The doc
relies on the learner discovering "tap it to peek" unprompted. A silent, unexplained highlight
appearing on your own utterance's echo — before you know it's benign — risks reading as "something
you did wrong flagged it" on exactly the session where first impressions matter most, working
against the anti-judgment goal the whole section exists to serve.

### 5. QUESTIONABLE — module completion has no deterministic trigger or fallback

**Citation:** primary doc §6.3, quote: *"at `cv.turn >= target` the partner wraps in-character on
its next turn (preamble directive...)"* — contrast with the double-miss mechanism it's adjacent to
(`cv.forceChips`, `index.html:9680-9691`), which IS client-enforced.

Completion is entirely a model-obeyed preamble directive with no client-side fallback described if
the model's next turn ignores the wrap instruction and just continues the scene normally (LLMs
routinely under-attend to conditional preamble rules buried among many others — this doc's own
§3 preamble already carries five-plus behavioral rules competing for attention). Charter audit #4
asks whether "exit/re-entry behave" — re-entry is well specified (§6.3, fresh start, no debt), but
completion *itself* firing reliably is not verified or given a fallback (e.g., a client-side check
"turn >= target + 1 and no wrap detected → force the completion card anyway").

### 6. QUESTIONABLE — echo-guard downgrade silently reverts to the feedback void on noisy-STT turns

**Citation:** primary doc §3.4's rendering table (rows: confirm/recast/clarify only) vs. §3.3's
echo guard, quote: *"the feedback is downgraded to `none` client-side."*

The rendering table has no `none` row — implying no pulse, no highlight at all when `type` is
`none`. When the echo guard fires (STT noise made `heard` not overlap the real transcript), a
`judged.score == 2` turn that the model *tried* to acknowledge (confirm or recast) loses ALL
rendering, not just the recast-specific highlight. On a noisy-STT session — which is exactly when
the learner most needs to feel heard — the safety net that protects against false correction also
silently deletes the positive-confirmation signal for that turn, reintroducing a narrow slice of
the original feedback void the whole task exists to close. Not addressed in §3.3 or §3.4.

### 7. NITPICK — silent-restart mechanism must reset the existing single-fire dedup guard, unaddressed in the doc

**Citation:** `index.html:9945-9951` (`convoToggleListen`'s STT callback: `if(!cv || cv._ended)
return; cv._ended = true;`) vs. primary doc §4.2, quote: *"onend with empty `_best`, or
`onerror('no-speech')` ... silently restart `rec.start()`."*

The existing callback already guards against the Web Speech API's known onerror-then-onend double
fire via `cv._ended`, short-circuiting the *second* invocation. The doc's 90s silent-restart loop
needs `cv._ended` (and the equivalent listening-session state) reset before each `rec.start()`
retry, or the guard that exists specifically to prevent double-processing will also silently
swallow every restart attempt after the first no-speech event, quietly capping the "90 second
patient window" at whatever a single no-speech timeout is (~5-8s per the doc's own platform note
in §4.1) — which would falsify the doc's own acceptance claim in §4.5 (*"Tap count for his exact
complaint session: 0"*), since the mic would die and require a manual tap well before 90s. This is
implementation plumbing more than design, but it directly affects whether the Scenario-3
walkthrough's stated result is achievable as specced.

---

## Verdict

**WARN.** The four charter walkthroughs surface one SERIOUS design/source contradiction (module
progress can complete on zero successful exchanges — finding 1) and one SERIOUS overstatement of
what's actually enforced vs. merely instructed (the false-correction gate — finding 2), both of
which affect the doc's own stated acceptance criteria ("progress feels real", "clarify-degrade
actually fires"). Neither is a wholesale rejection of the locks — both are fixable with either a
corrected claim or a small enforced check — but as currently written the doc asserts two
verification-critical claims (§6.3's "score never gates progress" and §3.6's "client, deterministic"
score gate) that don't match the code they cite or the model-dependent mechanism they actually
describe. The remaining findings are real but narrower UX/edge-case gaps (frequency, onboarding,
completion fallback, echo-guard blind spot, restart-guard interaction) that a forge implementer
should track but that don't block the round.
