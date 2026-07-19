# Delve 8 — The Sensei Layer & Vocab Access

> **Repo root:** `C:\Users\Julius\Documents\GitHub\japanese-trainer` — every repo-relative path in this charter resolves against that root, and ALL git operations (status, add, commit, show, ls-files) must run with that directory as cwd (`cd` there first).

## Domain

Two owner directions converge on one question: **how does Isshin actively teach?**

1. **Vocab access (re-opens ADR-003, pending since the meter shipped).** Current state: all ~1,700 words (N5_PACK/ADV_PACK) are available; a non-locking coverage meter shows core absorption. Owner leans toward a literal **hard lock** ("only 1,500 words unlocked — more controlled") but mandated it be *studied before deciding* (owner call 2026-07-19). The lock/meter choice shapes drill pools, the conversation WORD_POOL, chip suggestions, and how progress is felt by a paying customer — costly to reverse post-launch.
2. **The sensei mandate (owner, verbatim, 2026-07-19):** *"the AI teaches you actively, for example if you say something incorrectly, or close, it will tell you, you say it like this with these words because of X..Y..Z. and even mentions nuances? that would be an actual SENSEI"* — and *"feedback is how you learn essentially."* Current state (Delve 7, shipped v8.17): the six-key contract classifies every utterance (confirm/recast/clarify), but recasts are **deliberately invisible** — woven into the reply, nuance note capped at 8 English words, peek-only. Delve 7 chose invisibility to protect flow; the owner now wants **explicit, explanatory teaching with the why and the nuance**. That is a genuine amendment to the Delve-7 lock, not a bigger note field.

**Owner-decided constraints (FIXED — do not re-litigate):**
- **Judgment-free stands (ADR-009).** A sensei *explains the natural way and why* — never verdicts, grades, red ✗, or accuracy stats. Teaching register, not marking register. The correction-copy style guide (`docs/specs/correction-copy-style-guide.md`) is the enforcement doc; conversation surfaces stay verdict-word-free.
- **STT is a turn-trigger, never a grader.** Explicit teaching RAISES the mishear stakes — a confident explanation of a phantom error is worse than silence. Confidence gating must strengthen, not weaken (clarify-degrade before any teach).
- **Nuance pairing is doctrine:** every taught word/form carries its usage nuance (direction, formality, state-vs-event…) — the owner's standing rule.
- Kana-only learner content / English-primary chrome (v8.22); hands-free audio-led loop must survive; single-file PWA, no backend (design works today, improves with Phase 1); universal phone.
- **ADR-011 is still pending its keyed-probe acceptance gate** — the sensei spec must be written as a staged extension that the keyed field session can still validate, not a rewrite that obsoletes the un-validated layer.

**Ground truth / constraints carried in:**
- Engine: `_convoPreamble` six-key contract + FEEDBACK rules (index.html ~9407–9434), `_convoNormFeedback` ladder, recap pipeline (`convoEnd` / `_renderConvoRecap`, v8.24 saidHighlights), N5_PACK/ADV_PACK + coverage-meter code, SRS plumbing.
- Grounding docs: `docs/decisions-pending/ADR-003` + `ADR-011`, `docs/decisions/` ADR-009, `docs/delve-cycles/7-feedback-soul.md`, `docs/specs/correction-copy-style-guide.md`, `reports/hydra-research/2026-07-16/` Praktika teardown.
- Prior art to draw on: SLA research on explicit vs implicit corrective feedback for beginners; how incumbents (Praktika, Speak, Pimsleur, Duolingo) gate vocab and surface corrections — cite honestly, no cargo-culting.

## Stacked REVISED callouts

None binding. First round of a new delve.

## Primary

**Mode:** Opus-only (design/decision/prose → an implementation-ready spec a later `/hydra-forge` builds from).

### Investigation tasks

Each ends in a **final lock**, not a discussion.

1. **Vocab access — LOCK hard-lock vs meter (ADR-003 final).** If lock: unlock unit (word? tier? topic pack?), earn mechanic (SRS state? conversation use?), what the locked state looks like (invisible vs greyed-teaser), how WORD_POOL/chips/drills each consume the unlocked set, migration for the existing profile. If meter: what changes so it *feels* controlled enough to satisfy the owner's instinct. Must answer with the beginner default and the commercial framing (what a paying user sees as progress).
2. **Sensei layer — LOCK the explicit-teaching spec.** When a teach fires (recast-worthy + high confidence only?), **where the explanation lives** without killing the hands-free loop — inline spoken? visual card under the reply? tap-"why?" expansion of the peek? collected teaching moments in the recap? — its depth (one nuance per teach? X..Y..Z structure?), language (English explanation with kana examples — chrome/content boundary), TTS behavior (does the partner *speak* the teach or stay conversational?), an intensity dial vs a fixed default, schema cost (contract growth vs latency), and what feeds SRS. Must survive the false-teach (mishear) attack explicitly.
3. **The teaching loop — LOCK how 1+2 compose.** The sensei teaches *toward* the unlock frontier: do teaches/recasts accelerate unlocks? Does the recap become the daily "what you learned" surface (building on v8.24's saidHighlights)? One coherent loop: speak → teach → absorb → unlock → speak with more words. Must not resurrect mode-sprawl or a Library.

### Output

Primary doc: `docs/delve-cycles/8-sensei-vocab.md`

Sections (in order):
1. Charter — scope + fixed constraints
2. Method
3. Vocab access (task 1)
4. Sensei layer (task 2)
5. Teaching loop (task 3)
6. Implementation sketch — staged shipping order (each stage shippable alone), which `index.html` functions/screens change per stage, existing-user migration
7. Decisions reached (locks)
8. Open questions still open
9. Foundation doc updates
10. ADR proposals (heuristic policy — only load-bearing locks become ADRs)

## Adversaries

### Adversary 1: devils-advocate (LEAD)
**Read:** primary doc, this charter, `docs/decisions-pending/ADR-003` + `ADR-011`, `docs/decisions/` ADR-009, `docs/delve-cycles/7-feedback-soul.md`, `docs/specs/correction-copy-style-guide.md`, `index.html` (convo engine: `_convoPreamble`, `convoTurn`, `_convoNormFeedback`, pack/meter/SRS code).
**Audit:**
1. **Judgment-creep attack:** explicit teaching is one step from marking; where does "you say it like this because…" become "you were wrong"? What structurally prevents creep? Does an intensity dial itself reintroduce self-judgment?
2. **False-teach attack:** STT mishears are routine; walk concrete mishear cases through the teach trigger and show where the spec would confidently explain a phantom error. That failure is WORSE than the feedback void.
3. **Flow-cost attack:** teaching mid-conversation breaks the very loop that IS the app (scope mandate); does the sensei cost the rhythm? Is the recap the only safe home for depth?
4. **Lock-frustration attack:** hard locks are the #1 store-review complaint genre ("the app won't let me learn the word I need"); FOLLOW-THE-LEARNER says off-pool speech always wins — does a lock contradict Delve 7's most important rule?
5. **Premature-depth attack:** Delve 7's feedback layer has NEVER been field-validated keyed; is designing depth on top of an unvalidated base sound, and what must the spec leave adjustable for the keyed field session?
**Output:** `docs/delve-cycles/8-sensei-vocab-devils-advocate.md` — ≤400 lines, citations required.

### Adversary 2: qa-tester
**Read:** primary doc.
**Audit:**
1. Walk a nervous beginner's session with sensei defaults — does any teach feel like being graded? Where do they bail?
2. Walk the mishear-then-teach path — does clarify-degrade fire before the false explanation?
3. Walk a locked-vocab user who *needs* an off-pool word mid-conversation — what happens?
4. Walk a week of the teaching loop — do unlocks/recap-teachings feel like real progress or a grind?
**Output:** `docs/delve-cycles/8-sensei-vocab-qa-design.md` — ≤400 lines.

### Adversary 3: code-reviewer
**Read:** primary doc + `index.html` (`_convoPreamble`, `convoTurn` parse path, `_convoNormFeedback`, recap pipeline, N5_PACK / meter / SRS code).
**Audit:**
1. Schema/preamble growth: token + latency cost of the teach payload on the 2–6s no-streaming round trip.
2. Enumerate every site a lock touches (drills, chips, WORD_POOL, SRS, meter UI) — is this a rewrite in disguise?
3. Recap-teaching storage: kana-whitelist + esc() safety for teach strings (injection surface).
4. Migration: existing profile with 1,702-word history onto a lock — data model + edge cases.
**Output:** `docs/delve-cycles/8-sensei-vocab-code-review.md` — ≤400 lines.

## Synthesis

`## Synthesis (Round 1 close — Delve 8)` appended to the primary doc. Verify every adversary citation; disposition each finding; lock vocab access + sensei spec + teaching loop; the staged implementation sketch becomes the brief for the follow-on `/hydra-forge`. Foundation updates: `INDEX_ROADMAP.md` rows (ADR-003 backlog row resolves). ADR policy **heuristic** — likely 2 ADRs: the ADR-003 resolution + a sensei-layer amendment stacking on pending ADR-011 (flagged as amending an un-validated pending ADR); everything else inline decision-notes.

## Definition of done
- [ ] Primary doc with all 3 locks + staged implementation sketch a forge run can build from
- [ ] Sensei spec survives judgment-creep, false-teach, AND flow-cost attacks explicitly
- [ ] Vocab lock answers the lock-frustration / FOLLOW-THE-LEARNER contradiction explicitly
- [ ] 3 adversary docs filed
- [ ] Synthesis appended with citation verification
- [ ] ADRs (heuristic) filed pending
- [ ] User signoff
