# Delve 6 - Devils Advocate audit (LEAD adversary)

Target: docs/delve-cycles/6-talk-mode-presence.md @ 720548b. Date: 2026-07-17.
Lens: challenge the premise. Right problem? What is fragile, over-built, or wrong by construction?

Provenance check: every source citation in the primary doc was spot-verified against index.html and is
accurate (preamble 9275-9278, end-cond 9609, sceneDone guideline 9296, model default 9314, slice(-6)
9524, tiers 2816-2819, SCENES 2858-2865). No prompt-injection text found in the primary doc or charter.
The doc is unusually honest about its weakest point (section 1.4, OQ-1); this audit attacks where that
honesty DEFERS a problem rather than resolving it.

---

## FATAL
None. Nothing causes data loss and the frontDoor setting (6.4) preserves a rollback, so the worst
structural flaws are recoverable. The strongest objections are ranked SERIOUS.

## SERIOUS

### S1 - The justifying measurement sits downstream of the build it should gate
L12 collects the felt-difference verdict only AFTER the orb, the endless engine, the new Talk screen,
the IA flip, and retirement of the convo chat screen are all built. But T1 alone already proves presence
in the owners current flow within one stage. The cheapest read of the central hypothesis (does presence
move the verdict?) is available at the end of T1, before any IA risk. Locking L10 (retire convo screen,
demote shipped Home, supersede ADR-008) and committing ADR-010 ahead of the T1 evidence inverts the
gate: you build the irreversible-feeling layer first and measure the premise last. Fix: gate the whole
section-6 IA supersession on a felt-difference read taken after T1/T2 on the existing screen.
- Citation: >>Felt-difference probe (L12): after 7 days of T4.1<< (section 8, Stage T4)

### S2 - Whiplash on shipped code; superseding a not-yet-accepted ADR
Delve 5 is dated 2026-07-16 and its stages A-E are all shipped (v8.08-v8.11) per section 1.3. Delve 6
retires that IA one day later. Not paper-to-paper: the 2-tab nav and Home hero are in production and are
demoted a day after shipping. Worse, 6.5 lists the superseded lock as L1 two-door IA (ADR-008 pending)
and section 12 proposes ADR-010 to supersede it, so you are superseding a decision never formally
accepted. The charter churn question (what stops delve 7 from flipping it back?) is answered only by a
self-declared guard (L12 does NOT trigger IA churn). Nothing structural stops the next owner
mood-of-the-day from reversing this; decision cadence exceeds validation cadence.
- Citation: >>L1 two-door IA (ADR-008 pending) | superseded<< (section 6.5)

### S3 - sceneDone overloaded as the sole endless-end signal: fragile by construction
The endless contracts only model-driven end is a single boolean whose meaning is changed by prose alone
while the JSON contract stays byte-identical. The live guideline at 9296 is: sceneDone = true only when
the scene has reached a natural close (>=3 turns) - a strong prior toward FREQUENT closes. Re-pointing
that flag at learner-said-goodbye on a small default model (claude-haiku-4-5) invites the false-positives
OQ-3 admits: a beginner practising matane mid-chat ends the session. The failure is asymmetric (premature
ends annoy, missed ends burn money) and rides on one unreliable bit. The farewell tokens are already
enumerated; a deterministic client-side transcript match is cheaper and cannot be hallucinated. Trusting
the model here is wrong by construction.
- Citation: >>the existing sceneDone key (9288) is re-purposed ... only prose semantics shift<< (4.2.1)

### S4 - The minute-one scaffold undercuts the products own thesis
The owner verbatim goal is: learn through speaking to the AI (section 1.1). Section 7 defeats premise P1
(production-incapable) by making chips always visible for the first 3 tier-1 sessions, every turn
answerable by tap. But tapping a chip that TTS then reads aloud is selection, not the learner producing
speech. The harder you scaffold minute-one, the LESS the beginner speaks: the scaffold that saves the
bail-point erodes the value proposition. The doc never reconciles always-answerable-by-tap with
learn-through-speaking, and OQ-2 concedes the psychological freeze is untested. This is the real
solving-the-right-problem tension, not a mechanics gap.
- Citation: >>chips are always visible - not stall-gated - for their first 3 completed sessions<< (section 7 point 2)

## QUESTIONABLE

### Q1 - Cost guard is localStorage theater; endless worsens the known commercial blocker
The tier-2 daily budget meter is state.convoDailyTurns, a date-keyed counter in client state, cleared by
clearing localStorage and editable by the user (the owner can raise his own). That is not a meter, it is
a suggestion. The known BIG commercial blocker is exactly that BYO-key has no server metering. Locking an
endless (unbounded-turn) session now multiplies the cost surface that already blocks shipping, and every
guard here is void once Phase-1 arrives (Phase-1 server metering replaces tier 2 wholesale). Locking an
endless shape against a BYO key you know cannot ship commercially is investing in a layer slated for a
rebuild.
- Citation: >>Daily budget meter: state.convoDailyTurns (date-keyed counter)<< (section 4.5 tier 2)

### Q2 - Filler-TTS at 2.5s races the real reply inside the 2-6s window
The mask fires one filler TTS at 2.5s, but the round-trip is 2-6s. When a reply lands at 2.6-3s,
_convoSpeakJP is invoked while the filler may still be queued or speaking. speechSynthesis.speak queues
utterances; without an explicit cancel the real reply is delayed behind the filler, and a cancel cuts the
filler audibly. The spec locks the filler timing but never specs the collision handling: a concrete
hands-free glitch in the common case.
- Citation: >>2.5s | one filler TTS<< (section 3.4 table)

### Q3 - The premise concession is deferred, not resolved
Section 1.4 and OQ-1 concede presence alone may not fix no-difference: latency and voice are what only
Phase 1 fully addresses. That candour is a strength, but the delve still commits five locks and an ADR to
an experience layer while conceding the actual bottleneck may lie elsewhere. Steelman: L12 makes it
falsifiable and a null result is a finding, not a failure. Rebuttal: a finding that costs five build
stages to obtain is an expensive way to learn Phase-1 was the lever (see S1). What would change my mind:
run T1 alone, read the verdict, then decide the rest.
- Citation: >>presence alone may not fix "no difference"<< ... >>only Phase 1 fully addresses<< (section 1.4)

## NITPICK

### N1 - No prompt caching is a cheaper cost lever than the 40-entry cap
_convoCall sends the full preamble as system with no cache_control (body at 9317). The preamble is the
largest per-turn cost (~1.2k of the estimated ~1.8k input) and is near-static; a cache breakpoint would
cut input cost roughly 90% on repeat turns, a far bigger lever than the vanity 40-entry array cap the doc
frets over (5.5). Cheaper endless economics are available before Phase-1.
- Citation: >>6-msg window + 40-entry array cap; no rolling-summary call<< (section 9, L9)

---

## Verdict: WARN

The doc is coherent, source-accurate, and unusually self-critical: the orb spec, honest-illusion
reactivity, and never-break staging are genuinely sound. But four material issues should be resolved
before a forge run: S1 move the felt-difference gate ahead of the irreversible IA build; S2 justify a
one-day supersession of shipped code and do not supersede a pending ADR; S3 replace the overloaded
sceneDone end-signal with a deterministic farewell match; S4 reconcile chips-as-crutch with the
learn-by-speaking thesis. None is fatal, but shipping the section-8 stages as-locked bakes S1 and S3 in.
