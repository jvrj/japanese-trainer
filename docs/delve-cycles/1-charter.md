# Delve 1 — Conversation-Practice Mode for Isshin

## Domain

Isshin's north-star is that the user can *hold a basic spoken Japanese conversation*. Every mode shipped so far drills toward that obliquely — Recall (SM-2), Sentence Coach (single-turn translate→verdict), Nuance, Forms ladder, Memory, and the hands-free vocab-spam loop that *is* the app. None of them is an actual **back-and-forth**: a partner says something, you understand it, you reply, it reacts to *your* reply. That gap is the whole reason this delve exists.

The user's load-bearing ask, verbatim:

> *"design a conversation-practice mode... HOW do we implement a genuine back-and-forth conversation-practice mode that fits this architecture and actually builds toward conversational ability — what's the interaction design, the turn loop, the AI's role, scaffolding for a near-beginner, and how it ties into the existing SRS/vocab?"*

**Refining direction (user, via /interactive — load-bearing, verbatim):**

> *"i do like the idea of a free chat, but as a beginner, we dont know what to say... so i dont want to be LEADING the conversation. ideally the AI or whatever it is we are doing, can probe the user and generate responses from the user. and the user can learn like that? can we delve this process?"*

This pins the **spine**: the conversation is **AI-LED**. The AI drives — it probes the learner with simple questions and supplies/scaffolds the learner's possible answers — rather than the learner having to initiate. The free-chat *feel* is kept, but the AI owns topic control so it never asks something outside the learner's ~50-word range. The delve's primary job is to design *how* this AI-led probing loop works in detail. Tasks 1, 2 and 5 below now carry the user's locked leanings (the delve refines and pressure-tests them; it does not re-pick them from scratch).

Hard, non-negotiable constraints (carried from project memory + the code):
- **Single-file vanilla-JS PWA** — `index.html` (~1.1MB), no framework, no build step. New code is plain functions + a `render()` screen, inline `onclick="globalFn()"`.
- **Kana-only output** — all Japanese the app shows or speaks is hiragana/katakana (+ emoji), **never kanji**. The user cannot read kanji.
- **Tight ~50-word core pool** — examples and expected production draw from a small, automatic vocabulary; one new word per batch with reuse. Open-ended production will exceed what the learner can say.
- **Hands-free voice loop is THE app** — the template UX (project memory `feedback_japanese_trainer_spam_mode_template`) is audio-led, mic-driven, low-tap.
- **No English prompts in drills** — the prompt the learner responds to must be picture/audio/JP; English meaning lives behind a peek button (`feedback_japanese_trainer_no_english_prompts`).

Existing infra the design MUST reuse (verified anchors in `index.html`):
- API call idiom — `_coachCall(promptStr)` (line 9187): POST to `api.anthropic.com/v1/messages`, `anthropic-dangerous-direct-browser-access`, `state.settings.anthropicKey`, model `state.settings.anthropicModel` (`claude-haiku-4-5-20251001`), `max_tokens: 800`, single-message body.
- Multi-turn history already exists — `state.askClaude = {messages:[]}` (line 3017), persisted (line 3270).
- STT — `startVoice(onResult, onEnd, 'ja-JP')` (line 5274); TTS — `speakJP(text, rate)` (line 5221).
- SRS — `recordAttempt(wordId, correct, mode, extras)` (line 7294) + `smGrade(st, grade)` (line 3472) over `state.stats`; `getActiveWords()` (line 3564).
- Closest precedent — Sentence Coach (`startSentenceCoach` 9116 / `renderSentenceCoach` 9251): single-turn, expected-answer-aware leniency, STT-noise forgiveness, kana-only enforced in the prompt. The conversation mode is its multi-turn evolution.

## Stacked REVISED callouts

None — this is Delve 1.

## Primary

**Mode:** Opus-only (decision/spec/prose; no code spike — the output is an implementation-ready design the user will build via `/hydra-forge`).

### Investigation tasks

Each task must end in a **final A-vs-B (or A/B/C) lock**, not a discussion.

1. **Turn-loop / interaction model — LEANING LOCKED: AI-LED probing chat.** The user has chosen an AI-led conversation (AI probes, learner answers; learner never has to initiate). The delve's job is NOT to re-pick A/B/C but to **design the AI-led probing loop concretely** and answer the questions that choice raises:
   - What exactly is one round? (AI question → learner answer → AI reaction/follow-up vs AI question → answer → next question.)
   - How does the AI keep every probe **answerable inside the learner's known vocab** (seed the AI with the learner's active/due word list; constrain question complexity)? This is the load-bearing risk.
   - Does it run as a **loose goal-scoped scene** (gives the probes a thread — café, directions, weekend) or as **topic-free rolling probes**? Pick.
   - How does the AI react to a *wrong/empty/English* answer so the learner still moves forward (re-ask simpler? model the answer? offer it as a chip?)? Pick the recovery behaviour.
   Output a single locked turn-loop spec.

2. **Scaffolding for a near-beginner — LEANING LOCKED: hybrid (floor + stretch).** The user chose "both — speaking earns more": **2–3 tappable suggested replies always present as a floor** (tap → TTS speaks it → counts the turn), **free STT accepted as a stretch that scores higher**. The delve refines the mechanics, it does not re-pick:
   - How are the 2–3 suggestions generated — by the same per-turn AI call, or templated from the learner's vocab? Lock it.
   - What's the exact scoring delta (chip-tap vs spoken-self vs spoken-and-correct) and how does it map to the SRS grade in task 5?
   - Hands-free behaviour: after the AI's TTS, does the mic auto-open (spam-mode style) with chips visible as a fallback? Lock the default.

3. **Comprehension support for the AI's turn (no-English-prompt rule).** How does the learner understand what the partner just said, without English on the face?
   - Options to disposition: audio-first (TTS auto-plays, replay button), peek-translation behind a tap, slow-replay, a tiny known-word gloss. Lock the default-on set vs behind-peek set.

4. **AI role & generation contract.** Decide the request shape:
   - **A — Stateless per-turn:** each turn is one `_coachCall` with the running transcript inlined into the prompt (mirrors Sentence Coach; no `messages[]` array).
   - **B — Native multi-turn:** maintain a `messages[]` array (reuse the `askClaude` pattern) sent to the API each turn.
   Lock one, and lock the **output schema** (what JSON the model returns per turn: its JP line + the suggested replies + per-turn feedback + a "did the learner's reply land" judgment). Also lock the **no-key fallback** (scripted/templated conversation vs feature simply gated off).

5. **SRS / vocab tie-in — LEANING LOCKED: seed + score (A).** The user chose "use due words & score them": conversations are **seeded** from due/learned words (`getActiveWords` + SM-2 due), and a word the learner successfully uses in a reply gets `recordAttempt(true)` + `smGrade('good')`. The delve refines, it does not re-pick:
   - Exactly *which* signal counts as "used a word successfully" (appears in a spoken reply? in a tapped chip? AI-confirmed correct use?) — and how that interacts with the chip-vs-spoken scoring delta from task 2.
   - How the seed picks words (due-first like `_buildSpamPick`? cap per session?) and how the AI is told to build probes around them without exceeding the pool.
   - Whether a *post-session* recap layer (B) is added on top (extract words that appeared → quick self-check) — adopt or defer.

6. **Session shape, progression & hands-free fit.** Lock: finite (N turns, then a wrap-up card) vs endless; fixed scenario bank vs adaptive difficulty; and how the mic loop runs hands-free (auto-listen after the AI's TTS finishes, like spam mode) vs tap-to-talk. Define the "done"/wrap-up state.

7. **Naming, entry point & Daily Path slot.** Lock the mode name (kana + emoji tile, Dark Aurora), where it enters (home tile + a Daily Path step?), and whether it *replaces* or *sits beside* Sentence Coach (risk of two overlapping "talk to the AI" modes).

### Output

Primary doc: `docs/delve-cycles/1-conversation-mode.md`

Sections (in order):
1. Charter — restate scope + constraints
2. Method — Opus-only + adversary panel + synthesis ownership
3. Turn-loop / interaction model — decision + rationale (task 1)
4. Scaffolding for a near-beginner (task 2)
5. Comprehension support (task 3)
6. AI role, generation contract & output schema (task 4)
7. SRS / vocab tie-in (task 5)
8. Session shape, progression & hands-free fit (task 6)
9. Naming, entry point & Daily Path slot (task 7)
10. Implementation sketch — concrete function names, `state` shape, screen, prompt template, where it slots into `index.html` (so `/hydra-forge` can build directly)
11. Decisions reached — bulleted locks with one-line rationale
12. Open questions still open
13. Foundation doc updates — what synthesis will patch
14. ADR proposals — framed placeholders (filed pending in synthesis)

## Adversaries

### Adversary 1: devils-advocate (LEAD)
**Read:** `docs/delve-cycles/1-conversation-mode.md`, charter, project memory constraints.
**Audit:**
1. Does the locked interaction model produce a *genuine* back-and-forth, or a re-skinned Sentence Coach / vocab-spam loop? Name where it collapses to single-turn.
2. Will a real ~50-word, kana-only near-beginner actually complete a session, or will scaffolding either over-rail it (just tapping chips = no production) or under-support it (free STT = constant failure)? Find the dead-end turn.
3. Is the mode redundant with Sentence Coach? Argue the case that we should extend Coach instead of adding a 7th mode.
4. Does "builds toward conversational ability" survive scrutiny, or is the SRS tie-in cosmetic?
**Output:** `docs/delve-cycles/1-conversation-mode-devils-advocate.md` — ≤400 lines, finding list w/ file:line citations.

### Adversary 2: code-reviewer
**Read:** primary doc + the cited `index.html` anchors.
**Audit:**
1. Does the design fit single-file vanilla JS (render-map screen, `state` persistence rules — new persistent state under `state.settings` or its own LS key, NOT a bare `state.*` field)? Flag any framework-shaped assumption.
2. API budget & latency: per-turn `_coachCall` round-trips on mobile — is the turn loop responsive? Token/cost per session? Failure/timeout handling mid-conversation.
3. Reuse vs reinvent: is it genuinely reusing `_coachCall`/`startVoice`/`speakJP`/`recordAttempt`, or quietly duplicating them?
**Output:** `docs/delve-cycles/1-conversation-mode-code-review.md` — ≤400 lines.

### Adversary 3: qa-tester
**Read:** primary doc.
**Audit:**
1. Concrete failure modes on a Pixel 9 / Android Chrome: STT mishears kana, TTS races the mic, no-key state, offline, mid-conversation reload (does it resume or lose state?).
2. Walk one full scripted session turn-by-turn as a beginner — does every turn have a clear next action and an escape hatch?
3. Edge states: empty deck, learner says nothing, learner says English, learner taps every chip without speaking.
**Output:** `docs/delve-cycles/1-conversation-mode-qa-design.md` — ≤400 lines.

## Synthesis

`## Synthesis (Round 1 close — Delve 1)` appended to the primary doc. Verify every adversary citation against `index.html` source; disposition each finding (adopt / contest / defer); lock the final design. 
Foundation doc updates: this charter's decisions reflected back into the primary doc's §11; update project memory `project_japanese_trainer_scope_decision` with the conversation-mode lock.
ADR proposals likely (filed **pending** under `docs/decisions-pending/`): "Conversation mode interaction model & scaffolding", "Conversation mode SRS-coupling policy".

## Definition of done
- [ ] Primary doc + all sections incl. an implementation sketch a forge run can build from
- [ ] 3 adversary docs filed
- [ ] Synthesis appended with citation verification
- [ ] ADR proposals filed pending
- [ ] Open-questions log updated
- [ ] User signoff

## Files this delve touches
- `docs/delve-cycles/1-conversation-mode.md` (+ 3 adversary docs) — new
- `docs/decisions-pending/*` — new ADR proposals
- No `index.html` changes in this delve (design only; build is a later `/hydra-forge`)
