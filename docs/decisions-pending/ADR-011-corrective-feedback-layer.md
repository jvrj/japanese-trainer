# ADR-011 — Judgment-free corrective feedback in the conversation (amends ADR-009 rule 5)

- **Status:** Proposed (pending owner signoff; keyed-probe-gated — see acceptance gate)
- **Date:** 2026-07-18
- **Source:** Delve 7 — `docs/delve-cycles/7-feedback-soul.md` (locks L1–L7, §3 spec,
  Round-1 synthesis dispositions DA-1/DA-3/DA-6, QA-2/QA-3/QA-6, CR-2/CR-3/CR-4)
- **Amends:** ADR-009 "Judgment-free interaction spec" (Accepted 2026-07-17) —
  **rule 5's placement clause only** ("Feedback placement: never mid-conversation",
  ADR-009:18). Every other ADR-009 rule (score language, banned words, blame-owning,
  latency budgets, privacy) is inherited verbatim and extended to the new surface.
- **Related:** ADR-010 (orb front door — the L12a probe this layer's gate rides on),
  STT-is-not-a-grader doctrine (v8.03)

## Context

The owner's 2026-07-18 field test surfaced the product's deepest gap in his own words:
*"signal to me that ive said something correctly or correct ME? … the feedback that is
the soul of the idea."* The engine already judges every utterance (`judged.score` →
SRS) but the learner never sees, hears, or feels any of it — ADR-009's judgment-free
posture had accidentally produced a feedback-free conversation.

**Governance honesty (Delve 7 synthesis, DA-1/CR-4):** ADR-009's own numeric reversal
trigger (ADR-009:34) asks for ≥10 real users with ≥3 independent reports before
revisiting toward stronger explicit feedback. That gate has NOT fired — the trigger
here is one owner report, from a session the delve itself marks UNKEYED-TAINTED (his
phone had no API key; every session ran the canned script). This ADR therefore does
not claim ADR-009's gate fired. It is an **owner-authority amendment**, made
pre-cohort: the owner fixed "feedback is the soul — the delve decides HOW, not
whether" as a charter constraint, and the ≥10-user cohort that could fire ADR-009's
gate does not exist yet (the owner is currently the entire user base). To keep the
governance honest, this ADR carries its own numeric acceptance gate (keyed, so the
tainted evidence is never load-bearing) and a numeric reversal trigger that restores
rule 5's original placement if real users report feeling judged.

## Decision

Judgment-free feedback moves INTO the conversation, specified by Delve 7 §3 (L1–L7):

1. **Repertoire = confirm / recast / clarify** (SLA-grounded; Lyster & Ranta 1997,
   Long 1996, Mackey & Philp 1998). Explicit correction stays permanently banned
   (ADR-009 rule 3). Score-0 turns get no feedback move.
2. **Contract: five keys → six.** Optional top-level `feedback` object
   (`type/heard/better/note`); absent/malformed normalizes to `none`; recast's
   `better` must appear verbatim inside `jp` (the correction is *spoken*, never
   meta-announced); no second API call ever; `max_tokens` 400→500.
3. **Deterministic client gates in `_convoNormFeedback`:** score cross-check (recast
   only on `landed >= 2`), symmetric-normalized echo guard (abstains when
   kanji-stripping empties the transcript; fires → downgrade to `confirm`, preserving
   the confirmation signal), 1-in-3 recast throttle, opener force-`none`.
4. **Rendering invariants:** identical gold pulse for confirm and recast (orb, with a
   non-orb partner-header bloom fallback since `orbMode` defaults off); soft
   underline glow + tap-to-peek for recast (one-time first-use explainer); clarify's
   `jp` is spoken on score-1 turns (engine branch change); **no counters, streaks,
   tallies, or red anywhere**; feedback is ephemeral per turn.
5. **Intensity dial** (「ただ はなす」/「ともだち」/「しっかり」): design locked,
   beginner default = position 2 「ともだち」; the Settings row is **deferred** until
   a demand signal — F2 ships position 2 hard-defaulted for everyone.
6. **SRS boundary:** `feedback` never writes SRS/mastery. Sole route to review =
   `cv.recastLog` → recap ≤3 celebration-first opt-in notes → existing missed-drill
   pathway (exactly the route ADR-009 rule 5 already sanctioned).

## Acceptance gate (numeric)

Accept iff, after Stage F2 ships and the KEYED probe protocol runs (Delve 7 §8 —
the UNKEYED-TAINTED evidence is void and never load-bearing):

- Banned-word grep (ADR-009 list) over all new user-facing strings incl. every
  `note` template and peek-sheet copy returns **0** matches.
- A ≥**12**-case fixture set (malformed feedback objects, score/type mismatches,
  kanji-heavy transcripts, garbled-STT recast attempts) normalizes correctly in
  **100%** of cases — no recast renders on `landed < 2`, no recast survives a failed
  echo check, kanji-emptied transcripts abstain rather than suppress.
- With `orbMode` off (the default), the confirm signal is perceptible on **100%** of
  landed turns in a 10-turn demo (non-orb fallback proven — the CR-2 void stays closed).
- Owner's keyed verdict across **≥3** of **5** keyed sessions: "did it signal you
  said something correctly / correct you?" answered YES, AND "did any moment feel
  like being graded?" answered NO.
- Turn RTT stays ≤ **5s** max (ADR-009 rule 6 budget) with the +~100-token contract;
  first cut on regression is the `note` field.

## Reversal trigger (numeric)

Restore ADR-009 rule 5's original placement (recap-only feedback — one preamble flag
+ render flag; schema stays, surfacing stops) if:

- within the first **≥10** real users, **≥3** independently report feeling judged,
  graded, or corrected-at mid-conversation (the mirror of ADR-009:34's gate), **or**
- once the style dial ships, >**50%** of active users sit at 「ただ はなす」 over any
  30-day window (Delve 7 OQ-6 — feedback overshot), **or**
- the owner's keyed acceptance probe above fails twice.

A reversal is recorded in the delve line with the evidence; re-flipping again then
requires new-cohort evidence, not mood.

## Consequences

- Schema + preamble + rendering + recap pathway move together — this is the
  costly-to-reverse surface that justifies ADR status (the OFF ramp above is cheap
  precisely because it was designed in).
- ADR-009 stays the governing judgment-free spec; its banned-word list, blame-owning
  copy, latency budgets and privacy rules now bind the feedback layer too.
- The keyed calibration session after F1 (Delve 7 §8) may shrink F2's rendering
  surface; it cannot cancel the layer (owner-fixed premise).
- Promotion to `docs/decisions/` and the INDEX_ADR row are a human step — this file's
  presence in `docs/decisions-pending/` changes nothing in `docs/decisions/`.
