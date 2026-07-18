# Delve 7 - Devil's-Advocate Audit (LEAD)

> Read-only adversary doc. Audits docs/delve-cycles/7-feedback-soul.md @ commit 31a51fc.
> Lens: challenge the premise. Is this solving the right problem? What is fragile, over-built,
> or wrong by construction? Citations verified against index.html v8.13 and ADR-009.

Source-accuracy note: the primary doc line citations are unusually faithful - _convoScript modulo
loop (9363), five-key contract (9307-9314), 6s _armSilenceTimer (9927-9934), the per-turn key
ternary (9643), 6-message window (9636), singleton continuous recognizer (5169) all check out.
No prompt-injection text found in the primary doc or the charter. The problems below are premise-
and design-level, not citation fraud.

---

## FATAL
None that break at runtime. The premise problems below are SERIOUS, not fatal.

## SERIOUS

### S1 - Reverses a promoted ADR against that ADR own numeric reversal gate, on one tainted data point
ADR-009 rule 5 is explicit: "Feedback placement: never mid-conversation." The doc ADR-011 proposal
openly reverses it (primary section 12): "a reversal of a promoted ADR clause." But ADR-009 defines
the numeric bar for exactly this move (ADR-009 line 34, Reversal trigger): "Revisit (toward stronger
explicit feedback) if within the first cohort of >= 10 real users, >= 3 independently report wanting
explicit correctness feedback." The trigger here is ONE owner, and by the doc own section 1.1 that
session was UNKEYED-TAINTED - he never experienced the keyed engine. The doc cites ADR-009
consequences ("requires a new delve + decision record") but silently skips the reversal-trigger
clause in the same ADR that says WHEN the reversal is earned. You are tripping a governed reversal
you have not earned by the governing document own gate.
Citation: primary section 12 "a reversal of a promoted ADR clause" vs ADR-009:34 ">= 10 real users, >= 3 independently report".

### S2 - The soul (F2) is built BEFORE the one cheap experiment that would validate it
Section 8 post-F2 gate: "the ADR-010 L12a felt-difference probe re-runs keyed ... after F1+F2." So
the six-key schema, recast highlight, peek sheet, and intensity dial - the entire load-bearing lock
- are specified and built before the owner has heard the keyed engine reply once. The cheapest
experiment (owner runs ONE keyed session) is deferred until after the two largest stages ship.
Worse, section 3.5 position 1 concedes "implicit recast lives on in the reply - you can't make a
native friend speak wrongly": a keyed reply ALREADY recasts implicitly. A keyed session alone may
close most of the "correct ME" half of the void, making the highlight/peek/dial apparatus
over-built. Build-then-measure is inverted: the keyed probe should GATE F2, not follow it.
Citation: primary section 8 "the ADR-010 L12a felt-difference probe re-runs keyed ... after F1+F2".

### S3 - The echo guard is designed to silently eat TRUE recasts, re-opening the void it closes
Section 3.3 echo guard drops a recast to none client-side if feedback.heard "shares no content
overlap with the learner actual transcript (no common token >=2 kana)." But Android ja-JP STT
routinely returns kanji, and the engine own _stripKanji (5254) empties those to sparse kana; the
model heard is kana-only by contract. Comparing a kanji-stripped transcript against a kana echo
will spuriously find "no overlap" on exactly the particle/conjugation fixes recasts exist for -
dropping a legitimate correction to none INVISIBLY. Since the design fails toward silence (section
3.2), the failure is undetectable to the learner: the void quietly returns for the hardest cases.
Needs a concrete overlap-on-kanji trace before this locks.
Citation: primary section 3.3 "shares no content overlap with the learner's actual transcript (no common token >=2 kana)".

### S4 - The 90s cycling-mic window is LOCKED on platform behavior the doc admits is unverified
Section 4.2 locks a 90-second window that silently restarts the singleton continuous recognizer up
to 20x per turn, asserting "does not re-prompt on Android Chrome" and restart gaps are "inaudible
because nothing signals it." But section 10 OQ-3 admits: "Does the restart loop cumulative
recognizer churn misbehave on any non-Pixel Android (e.g. Samsung SR service)? Needs one cheap
device probe." You cannot both LOCK the 90s window (L8) and hold its core platform assumption open
as an OQ - Samsung and other SR services are known to emit start/stop chimes and re-arm differently.
The charter constraint is "universal phone, not Pixel-only" (section 1.2), yet the lock is verified
only against Pixel-class assumptions. Lock the shape; gate the 90s number and silent-restart on the
device probe.
Citation: primary section 4.2 "does not re-prompt on Android Chrome" vs section 10 OQ-3 "misbehave on any non-Pixel Android ... Needs one cheap device probe".

### S5 - The module anti-sprawl rule is contradicted by the module spec in the same section
Section 6.1 states the enforceable guarantee: "any proposed module that needs custom UI, a schema
change, or an engine branch is rejected by definition." Then section 6.3 specifies, for modules: an
orb progress arc (new render), a completion card (new UI), a target-reached preamble directive (a
new engine behavior branch), and a convoLog module id (new persisted field). By the doc OWN
definition those are custom UI + schema + engine branch - i.e. modules-as-specced would be "rejected
by definition." The shared-loop point is real and the Library distinction has merit, but the "zero
custom UI / rejected by definition" firewall is false on the doc own terms, so it cannot be the
load-bearing anti-sprawl guarantee it is sold as.
Citation: primary section 6.1 "needs custom UI, a schema change, or an engine branch is rejected by definition" vs section 6.3 "a thin arc around the orb fills per advanced turn".

## QUESTIONABLE

### Q1 - The intensity dial reintroduces self-judgment; the doc own OQ-6 proves it, and it is over-built
Charter adversary prompt 1 asked whether the dial reintroduces self-judgment. The doc answer is to
rename it "conversation style" (section 3.5). But a three-pole scale with a "thorough" top pole
makes picking positions 1-2 an implicit "not thorough" self-assessment - and section 10 OQ-6
confirms the doc reads dial position AS a judgment signal: "if >50% of early users pick [just talk]
... (feedback overshot)." You cannot claim the dial is judgment-neutral while mining its position
for an overshoot verdict. Simpler and safer for a pre-market single-owner app: ship position 2 for
everyone, no dial, add it only if the owner asks. The dial is a knob built before there is a second
user to want it.
Citation: primary section 10 OQ-6 "if >50% of early users pick ... (feedback overshot)".

### Q2 - cv.facts is LOCKED (L15) while its security mitigation is still an open question (OQ-4)
Section 7.3 injects normalized learner transcripts into the per-turn system string; L15 locks it.
But section 10 OQ-4 admits: "cv.facts prompt-injection surface - learner utterances enter the system
string. Mitigation sketch ... needs the code-reviewer eye." Locking a mechanic whose safety is
unresolved is premature, and per the project own commercial trajectory (hosted-key backend for
paying users) system-prompt injection becomes a real abuse/cost vector. Lock the callback goal;
defer the ledger mechanic to OQ-4 resolution.
Citation: primary section 10 OQ-4 "learner utterances enter the system string. Mitigation sketch ... needs the code-reviewer's eye".

### Q3 - "Tap count: 0" is asserted, not demonstrated, and ignores the >90s tail
Section 4.5 claims "Tap count for his exact complaint session: 0." But the 90s window still requires
the learner to eventually speak; if compose time exceeds 90s (beginners stall longer than the doc
own "15-30s"), the section 4.3 ladder routes to a "are you still there" probe whose resolution IS a
chip tap. "0" holds only for sub-90s turns but is presented as absolute. State it as "0 within the
window."
Citation: primary section 4.5 "Tap count for his exact complaint session: 0 (was: 1 per thought-pause)".

## What would change my mind
- On S1/S2: if the doc GATED F2 on a keyed re-test (build F1 mic-patience only, run the keyed probe,
  THEN decide whether the six-key schema is needed) - the sequencing objection dissolves and the
  ADR-009 reversal earns its evidence.
- On S3: a worked overlap trace on a kanji-returning transcript showing legitimate recasts survive.
- On S4/S5: locking only the shape (ladder skeleton; module = shared-loop data row) and marking the
  90s number, silent-restart, orb arc, and completion card as forge-time/device-gated.

## Verdict: WARN
The delve is rigorous, source-honest, and its instincts (patience-first, recast-inside-jp, no second
API call, no counters) are sound. But it (a) reverses a promoted ADR against that ADR own numeric
reversal gate on a self-declared tainted data point, (b) sequences the entire "soul" before the one
cheap keyed experiment that would validate the premise, and (c) contains two internal contradictions
where a locked guarantee is refuted by the spec it protects (echo guard, module firewall). Not a
rethink - but F2 build must be gated on the keyed probe, and S3/S4/S5 resolved, before this becomes
a forge brief.
