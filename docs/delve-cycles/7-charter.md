# Delve 7 — The Feedback Soul & Conversation Feel

> **Repo root:** `C:\Users\Julius\Documents\GitHub\japanese-trainer` — every repo-relative path in this charter resolves against that root, and ALL git operations (status, add, commit, show, ls-files) must run with that directory as cwd (`cd` there first).

## Domain

v8.13 is live (orb T1 opt-in, endless sessions T2, free-form FOLLOW-THE-LEARNER contract). The owner field-tested it 2026-07-18 and delivered four findings. One is a config accident (his phone had no API key, so every session silently ran the canned `_CONVO_SCRIPT_TURNS` loop — his "doesn't respond to what I said" verdict was the script, not the engine; the ADR-010 L12a probe must re-run keyed). Three are real product truths that survive the accident:

1. **The feedback void (owner, verbatim):** *"signal to me that ive said something correctly or correct ME? this is very vital i think… i can say something and it doesnt give feedback. i think the whole premise of this concept is the feedback that is the soul of the idea."* The engine judges every utterance internally (judged.score 0/1/2 → SRS) but the learner never sees, hears, or feels any of it. Judgment-free (ADR-009) was meant to kill shame; it accidentally killed the learning loop.
2. **The mic punishes thinking (owner, verbatim):** *"it just goes straight into listening, and im thinking of what to say, it ends, i click again."* Hands-free auto-opens the mic the instant TTS ends; Android STT gives up after ~5s of silence; a beginner needs 15–30s to compose. The app currently punishes exactly the thinking time it should protect.
3. **Silent fake-AI is a trust bug:** keyless mode plays the canned script with zero indication. (A minimal honesty banner ships independently of this delve; the delve designs the full offline/no-key UX.)

Plus one feature direction: *"modes that i can select or modules that i can select and we sit in that for an X amount of tasks"* — purposeful modules with duration and in-module progress, vs. generic drifting. Overall mandate: *"I want to make this less robotic… can we explore avenues."*

**Owner-decided constraints (FIXED — do not re-litigate):**
- **Feedback is the soul.** The delve's job is HOW, not whether. But it must be judgment-free feedback: the confirm / recast / clarify repertoire of a patient native friend — corrections woven into replies, never grades, never red ✗, never accuracy stats (ADR-009 stands).
- **STT is a turn-trigger, never a grader** (standing doctrine). No pronunciation scoring, ever. Grammar/word-choice feedback operates on the transcript and MUST be confidence-aware: never confidently "correct" what may be a mis-transcription — degrade to clarification ("I heard X — did you mean…?").
- Kana-only learner-facing Japanese; hands-free loop must never break mid-migration; universal phone, not Pixel-only; single-file no-build PWA, no backend (Phase-1 backend out of scope — design must work on today's stack and improve with Phase 1).
- The orb (Delve 6) is the presence layer this feedback layer renders through where possible (orb pulse/color as a feedback channel is in scope; replacing the orb is not).

**Ground truth / constraints carried in:**
- Engine: `_convoPreamble` (five-key JSON contract: jp / glossEn / suggested / judged{usedWords,score} / sceneDone), `convoTurn` downshift ladder, double-miss forceChips rule, `_isConvoFarewell` end path, FREE_SCENE pseudo-scene (engine-only, no UI entry yet), `_convoScript` keyless fallback, hands-free `convoToggleListen()` auto-open at three call sites.
- Grounding docs: `docs/delve-cycles/6-talk-mode-presence.md` (orb + endless session + engine layering locks), `docs/decisions/` ADR-009 (judgment-free spec), `docs/decisions-pending/ADR-010` (orb front door, L12a gate pending a KEYED probe), `reports/hydra-research/2026-07-17-praktika/REPORT.md` (incumbents' scripted-conversation sin; voice > avatar).
- Prior art to draw on: SLA corrective-feedback research (recasts, clarification requests, explicit correction and their trade-offs for beginners) — cite honestly, no cargo-culting.

## Stacked REVISED callouts

None binding. First round of a new delve.

## Primary

**Mode:** Opus-only (design/decision/prose → an implementation-ready spec a later `/hydra-forge` builds from).

### Investigation tasks

Each ends in a **final lock**, not a discussion.

1. **Feedback layer — LOCK the corrective-feedback spec (the load-bearing task).** The move repertoire (confirm-by-using-it / recast / clarify), when each fires, and how it renders: schema extension to the five-key contract (e.g. a `feedback` key with move type + target + corrected form — sized against prompt/latency cost), UI surfacing (recast word highlighted in the reply? orb pulse for "that landed"? tap-to-peek the correction?), TTS behavior (does the partner *say* the recast naturally — it should), a learner-facing intensity dial (from "just talk to me" to "correct everything"), STT-confidence gating per the fixed constraint, and what (if anything) newly feeds SRS. Must define the beginner default.
2. **Turn-taking choreography — LOCK the mic rhythm.** Protect thinking time: grace period before auto-listen, silent auto-restart on no-speech timeout (how many times? battery/permission UX?), tap-when-ready vs auto-listen as default, a visible "take your time" listening state on the orb, and the interplay with hands-free setting + double-miss rule + endless-session stall detection (Delve 6 lock). Must work within Android/Chrome Web Speech constraints (no backend STT yet).
3. **Honest modes — LOCK the no-key / offline UX.** How the app discloses scripted mode (banner copy, capability framing), whether keyless おしゃべり should exist at all vs. redirect to drills + "connect AI" onboarding, the Settings key-entry flow a non-technical user can survive, and how this folds into Phase-1 (hosted key kills the problem; design the bridge, not a monument).
4. **Modules — LOCK the module structure.** What a module IS (purpose + target exchanges + felt progress within it), relationship to SCENES and FREE_SCENE, selection UI, "sit in it for X tasks" mechanics (what counts as a task? when does it end? what does completion feel like?), and how modules feed the spine/SRS without re-growing the mode-sprawl that Stage E just deleted (hard constraint: this must not resurrect the Library).
5. **Anti-robotic synthesis — LOCK the feel.** Name the specific mechanics that make the loop feel like a person across a whole session: response variability (no template openers), within-session memory callbacks ("you said earlier you like ramen"), prosody/pacing with today's TTS, latency masking (Delve 6's ladder) — and an honest boundary: which "robotic" residue is unfixable without Phase-1 (streaming, better voices) so the owner knows what to expect now vs later.

### Output

Primary doc: `docs/delve-cycles/7-feedback-soul.md`

Sections (in order):
1. Charter — scope + fixed constraints
2. Method
3. Corrective-feedback spec (task 1)
4. Turn-taking choreography (task 2)
5. Honest modes (task 3)
6. Module structure (task 4)
7. Anti-robotic synthesis (task 5)
8. Implementation sketch — staged shipping order (each stage shippable alone), which `index.html` functions/screens change per stage, existing-user migration
9. Decisions reached (locks)
10. Open questions still open
11. Foundation doc updates
12. ADR proposals (heuristic policy — only load-bearing locks become ADRs)

## Adversaries

### Adversary 1: devils-advocate (LEAD)
**Read:** primary doc, this charter, `docs/decisions/` ADR-009, `docs/delve-cycles/6-talk-mode-presence.md`, `reports/hydra-research/2026-07-17-praktika/REPORT.md`, `index.html` (convo engine: `_convoPreamble`, `convoTurn`, `_convoCall`, `_convoScript`, STT plumbing).
**Audit:**
1. **Judgment-creep attack:** every graded-learning app starts with "gentle feedback" and ends with red ✗ and streak anxiety. Where does this spec leak judgment back in, and what structurally prevents the creep? Does the intensity dial itself reintroduce self-judgment ("I had to turn corrections off")?
2. **False-correction attack:** STT mishears are routine; press hard on the confidence gating — walk concrete mishear cases and show where the spec would confidently correct a phantom error. That failure is WORSE than the feedback void.
3. **Latency/complexity attack:** a fatter schema + feedback reasoning per turn = more tokens, more latency, on an already 2–6s round trip with no streaming. Does the soul cost the rhythm?
4. **Module-sprawl attack:** Stage E just deleted four modes to make ONE product; task 4 proposes selectable modules. Is this the sprawl regrowing under a new name? What's the structural difference?
**Output:** `docs/delve-cycles/7-feedback-soul-devils-advocate.md` — ≤400 lines, citations required.

### Adversary 2: qa-tester
**Read:** primary doc.
**Audit:**
1. Walk a nervous beginner's first keyed session with the beginner-default feedback settings — does any moment feel like being graded? Where do they bail?
2. Walk the mishear-twice path with feedback ON — does the clarify-degrade actually fire, or does the learner get corrected for the transcriber's mistake?
3. Walk the owner's exact complaint session: mic opens, he thinks for 20s, composes, speaks — is the thinking time now protected end-to-end? Count the taps.
4. Walk one full module ("sit in it for X") to completion — does progress feel real, and does exit/re-entry behave?
**Output:** `docs/delve-cycles/7-feedback-soul-qa-design.md` — ≤400 lines.

### Adversary 3: code-reviewer
**Read:** primary doc + `index.html` (five-key contract sites: `_convoPreamble`, `convoTurn` parse path, `_aiJsonExtract`, `renderConvo`, orb `_orbSet` seams, STT/TTS plumbing, `_convoScript`).
**Audit:**
1. Schema extension: enumerate every parse/render/fallback site the new `feedback` key touches; does `_convoScript` (keyless) and the parse-retry path stay coherent?
2. Mic choreography: is silent STT auto-restart actually implementable on Android Chrome Web Speech (permission re-prompts? the no-speech event contract?) — or does the design quietly need backend STT?
3. Module structure: map it onto existing SCENES/state without a rewrite — enumerate the functions each stage touches.
4. Token/latency budget: measure the preamble growth the feedback contract adds; does anything here quietly require Phase-1?
**Output:** `docs/delve-cycles/7-feedback-soul-code-review.md` — ≤400 lines.

## Synthesis

`## Synthesis (Round 1 close — Delve 7)` appended to the primary doc. Verify every adversary citation; disposition each finding; lock feedback spec + mic rhythm + honest modes + module structure + anti-robotic mechanics. The staged implementation sketch becomes the brief for the follow-on `/hydra-forge`. Foundation updates: `INDEX_ROADMAP.md` row; note the ADR-010 L12a probe is UNKEYED-TAINTED and re-runs after key entry (pointer in the pending ADR, not a rewrite). ADR policy **heuristic** — likely exactly 1 ADR (the corrective-feedback layer as an amendment/extension to ADR-009's judgment-free spec); everything else inline decision-notes.

## Definition of done
- [ ] Primary doc with all 5 locks + staged implementation sketch a forge run can build from
- [ ] Feedback spec that survives the judgment-creep and false-correction attacks explicitly
- [ ] Mic choreography implementable on today's Web Speech stack (code-reviewer confirmed)
- [ ] Module design that answers the sprawl attack explicitly
- [ ] 3 adversary docs filed
- [ ] Synthesis appended with citation verification
- [ ] ADRs (heuristic) filed pending
- [ ] User signoff
