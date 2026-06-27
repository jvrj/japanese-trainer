# ADR-001 — Conversation mode (おしゃべり) interaction model & scaffolding

- **Status:** Proposed (PENDING — filed by Delve 1 synthesis; not promoted to `docs/decisions/`)
- **Date:** 2026-06-27
- **Source:** Delve 1 — `docs/delve-cycles/1-conversation-mode.md` (Round 1 synthesis)
- **Supersedes / superseded by:** none

## Context

Isshin's north-star is holding a basic spoken Japanese conversation, but no shipped mode is an actual back-and-forth. The user (≈50-word kana-only beginner) pinned the spine via /interactive: the conversation is **AI-LED** — the AI probes and scaffolds the learner's answers; the learner does not lead. The mode must fit the single-file vanilla-JS PWA, stay kana-only, and *strengthen* the hands-free voice-drill loop that IS the app rather than fork a new UI paradigm. The adversary panel (devils-advocate LEAD, code-reviewer, qa-tester) stress-tested the locked design and returned WARN×3 with 23 findings, all accepted with revisions.

## Decision

1. **AI-led, scene-threaded probing loop.** One round = a single `_convoCall` returning a **fused react+next-probe** plus 2–3 in-pool suggested replies and a per-turn `judged` block. One round-trip per turn (mobile latency budget). A loose scene from a fixed ~6-bank threads the probes; the seeded due-first pool (`_buildSpamPick`, ~8) + a closed FREE_SET bound the expected vocabulary.
2. **Built as the spam-loop shell with a chat turn replacing the flashcard** — distinct tile, but the same hands-free audio-led loop; it strengthens the spine, does not fork it.
3. **Scaffolding = chip floor + STT stretch with an echo rung.** 2–3 tappable suggested replies always present (never a chip-less turn). A *silent* tap keeps momentum but trains nothing; **tap-then-echo-aloud** earns scaffolded production credit; unaided free speech is the full-credit stretch. (SM-2 consequences in ADR-002.)
4. **Recovery = down-shift ladder, never a hard fail** (model-the-answer+advance / nudge-to-JP / correct-model+advance) — structurally no dead-end turn.
5. **TTS→mic handoff via `_buildSpeakJP(jp, onDone)`** (NOT bare `speakJP`, which has no `onend` callback). On cold reload, no auto-TTS/auto-mic — an explicit 「つづける」/Continue tap re-enters the loop.
6. **Generation contract B (native `messages[]`), constant framing in the top-level Anthropic `system` field** (never windowed out); only turns are windowed (last ~6). `_convoCall` duplicates `_coachCall`'s fetch (no in-place refactor of the load-bearing Coach call).
7. **Sits beside Sentence Coach** (fluency vs precision); does not replace it.

## Consequences

- One round-trip per turn keeps mobile cost/latency bounded; no dead-end turns; tap-through cannot fake unaided production.
- Net-new code: `_convoCall`, windowed `messages[]`, `LS.convo`, a new screen, scoring path — reuse is of idioms/infra, not a thin re-skin.
- Alternatives rejected: learner-led free chat (beginner can't initiate), a separate react turn (2× latency/cost), templated chips (off-topic), contract A transcript-inlining (loses native multi-turn awareness).

## Acceptance gate (numeric)

Accept iff a Pixel-9 walk-through of one full default session shows: **≥ 8 of 8 turns** each present **≥ 2 chips**, the mic auto-opens within **≤ 1 s** of TTS end on **≥ 9 of 10** turns, and **0** turns dead-end (every turn has a forward exit).

## Reversal trigger (numeric)

Revisit if, across the first **≥ 5** real sessions, **≥ 50%** of turns are silent chip-taps (scaffold not converting to production) OR median turn round-trip latency exceeds **4 s** on the target device — either signals the loop is not delivering an active back-and-forth and the model/scaffolding must be re-picked.
