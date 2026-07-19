# ADR-013 — The sensei layer: explicit teaching surface (amends Delve 7 invisibility; stacks on PENDING ADR-011)

- **Status:** Accepted (owner signoff 2026-07-19. **Standing flag: stacks on ADR-011, which is itself pending an un-run keyed acceptance gate** — one keyed field session after S1+S2 validates both layers; this ADR deliberately mints no second un-runnable gate.)
- **Date:** 2026-07-19
- **Source:** Delve 8 — `docs/delve-cycles/8-sensei-vocab.md` (§4, L6–L10, Round 1 synthesis)
- **Supersedes / superseded by:** AMENDS the surfacing posture of Delve 7 lock L4 (recast invisibility) — machinery kept, surfacing amended. ADR-009 (judgment-free) is inherited untouched; `docs/specs/correction-copy-style-guide.md` governs all new strings.

## Context

Delve 7's F2 layer (shipped v8.17+) classifies every utterance but keeps
recasts deliberately invisible (woven into `jp`, ≤8-word peek-only note). The
owner's verbatim mandate (2026-07-19): the app should *"tell you, you say it
like this with these words because of X..Y..Z. and even mentions nuances —
that would be an actual SENSEI."* Explicit teaching raises the STT-mishear
stakes: a confident explanation of a phantom error is worse than silence.

## Decision

1. **Contract:** six keys stay; `feedback` gains ONE optional sub-field
   `why` (≤25 English words, recast-only: the because, with nuance direction
   named; ADR-009 banned list applies verbatim). `max_tokens` 500 → 560.
2. **Teach gate is STRICTER than the recast it rides** (deterministic, in
   `_convoNormFeedback`): teach fires only when the recast survived the score
   gate + throttle, `better` ∈ `jp`, the echo guard POSITIVELY matched, and
   `why` arrived scrub-clean. Echo-guard abstain caps surfacing at Delve-7's
   implicit tier; no teach below score 2 ever. **Honest scope (panel catch):**
   the echo guard corroborates the model's `heard` against the
   transcript-as-delivered — it kills model-invented `heard`, NOT STT-level
   mishears; that residual is contained by the evidence surfaces below.
3. **Surfacing = teach card + one spoken breath.** The card auto-opens under
   the reply on teach-grade turns: evidence-first (「きこえたのは」 line always
   names `heard`), then `better` (kana, bold), `why`, and a mandatory nuance
   line. Fixed templates; model strings render esc()-escaped with the
   banned-word scrub + a 160-char cap on `why`. After `jp` TTS and before the
   mic re-arms, `_speakTeachLine` speaks one **evidence-first** English breath
   ≤12 words (e.g. "I heard: taberu — more natural: tabeta.") — the heard
   form is IN the spoken line so audio-only users get the evidence (panel
   catch: the r1 template dropped it). The partner voice never teaches;
   the sensei voice is the app's.
4. **Depth:** exactly one nuance per teach; the full X..Y..Z lives in the
   session recap (≤3 teach moments, celebration register); `cv.teachLog`
   extends `recastLog`. Teaches never write SRS and never unlock (Delve 7 L7
   kept).
5. **Dial:** 「ともだち」 default carries the full sensei; 「ただ はなす」
   disables; 「しっかり」 adds recap depth only. Settings row still deferred.
6. **Ship order:** S1 card → S2 spoken breath (own stage, own OFF ramp) →
   keyed field session → S3/S4. Dial-back levers, weakest first: (1) pull S2;
   (2) demote card to tap-open; (3) drop `why` (restores F2 byte-for-byte).

## Consequences

- The owner's sensei verbatim is delivered on the existing loop: no new
  screens, no Library, no second API call; flow cost is one card in dead time
  + ≤2s of spoken breath on ≤1-in-3 turns.
- A keyed session with `why` absent is byte-for-byte shipped F2 behavior, so
  ADR-011's gate remains runnable and its verdict remains meaningful.
- The false-teach residual (same-error transcript+`heard`) is accepted and
  self-disclosing via the evidence line, never silent.

## Acceptance gate (numeric)

Accept iff:
- **Fixture gate (client-side, keyless — mirrors ADR-011's discipline; panel
  addition):** a **≥12-case** fixture set exercising the
  teach/implicit/clarify ladder (positive echo-match, abstain via
  kanji-stripped <2-kana, scrubbed `why`, absent `why`, over-length `why`,
  score-1, throttle-suppressed, banned-word probes) lands every case on the
  correct rung in **100%** of runs.
- **Keyed probe (merged into ADR-011's ≥3-of-5 protocol):** "did the
  explanation help you say it better?" affirmative in **≥3 of 5** keyed
  sessions; **0** occurrences of a banned verdict word in any rendered teach
  string across those sessions.
- **Latency:** measured median RTT delta on teach turns vs the F2 baseline
  ≤ **+0.5s**, and worst turn within ADR-009's **5s** max (the §4.2 figures
  are estimates until this measurement exists).

## Reversal trigger (numeric)

- "Did any teach feel like being marked?" fails in **≥2 of the 5** keyed
  sessions (quantified at synthesis; the r1 "twice" was window-less) →
  lever (2) fires automatically: card demoted to tap-open.
- Measured teach-turn RTT delta > **+0.5s** median → first cut is `why`
  (lever 3 for the schema payload; S2's spoken line is independently
  pullable).
- If ADR-011's own keyed gate FAILS (F2's premise invalidated), the sensei
  surface does not ship: levers run (1)→(2)→(3) to full F2 restore and this
  ADR returns to Proposed pending a re-designed base.
