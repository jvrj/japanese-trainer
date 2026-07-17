# Delve 1 — Conversation-Practice Mode for Isshin (Primary)

> Round 1 · PRIMARY investigation doc · Opus-only.
> Adversary panel and synthesis are later items; this doc is what they audit.

---

## 1. Charter — scope + constraints

**North-star.** Isshin exists so the user can *hold a basic spoken Japanese conversation*. Every shipped mode (Recall/SM-2, Sentence Coach, Nuance, Forms ladder, Memory, the hands-free vocab-spam loop that *is* the app) drills toward that obliquely. **None is an actual back-and-forth** — a partner says something, you understand it, you reply, it reacts to *your* reply. Closing that gap is this delve's whole reason to exist.

**Load-bearing user direction (verbatim, via /interactive — this pins the spine):**

> *"i do like the idea of a free chat, but as a beginner, we dont know what to say... so i dont want to be LEADING the conversation. ideally the AI ... can probe the user and generate responses from the user. and the user can learn like that?"*

So the conversation is **AI-LED**: the AI drives, probes the learner with simple questions, and *supplies/scaffolds the learner's possible answers*. The free-chat feel is kept, but the AI owns topic control so it never asks something outside the learner's range. The delve's job is to design *how* this AI-led probing loop works — not to re-pick the spine.

**Hard, non-negotiable constraints (project memory + code):**

- **Single-file vanilla-JS PWA** — `index.html` (~1.1MB), no framework, no build step. New code = plain functions + a `render()` screen entry + inline `onclick="globalFn()"`.
- **Kana-only output** — every Japanese the app shows or speaks is hiragana/katakana (+ emoji), **never kanji**.
- **Tight ~50-word core pool** — examples and expected production draw from a small, automatic vocabulary; one new word per batch with reuse. Open-ended production exceeds what the learner can say.
- **Hands-free voice loop is THE app** — audio-led, mic-driven, low-tap (the spam-mode template, `feedback_japanese_trainer_spam_mode_template`).
- **No English prompts in drills** — the prompt the learner answers must be picture/audio/JP; English meaning lives behind a peek button (`feedback_japanese_trainer_no_english_prompts`).
- **App-scope mandate** (`project_japanese_trainer_scope_decision`) — the hands-free voice drill loop IS the app; this mode must *strengthen that loop*, not spawn a parallel UI paradigm.

**Existing infra the design MUST reuse (verified anchors in `index.html`):**

| Need | Anchor | Line |
|---|---|---|
| API call | `_coachCall(promptStr)` — single user message, `max_tokens:800`, Haiku | 9187 |
| Multi-turn store (precedent) | `state.askClaude = {messages:[]}`, persisted | 3270 / 3359 |
| JSON parse | `_aiJsonExtract(raw)` | (used 9235) |
| STT | `startVoice(onResult,onEnd,'ja-JP')` / `stopVoice()` | 5274 |
| TTS | `speakJP(text, rate)` | 5221 |
| SRS write | `recordAttempt(wordId,correct,mode,extras)` + `smGrade(st,grade)` + `smStatFor(id)` | 7294 / 3472 |
| Word pool | `getActiveWords()` | 3564 |
| Due-first seed | `_buildSpamPick(arr, n)` | 14082 |
| Closest precedent | `startSentenceCoach` / `renderSentenceCoach` (single-turn, expected-answer leniency, STT forgiveness, kana enforced in prompt) | 9116 / 9251 |
| Screen dispatch | `render()` render-map object keyed by `state.screen`; `nav(screen)` | 17963 / 17969 |
| Persistence | `save()` writes a fixed set of `LS.*` keys | 3262 |

This mode is the **multi-turn evolution of Sentence Coach** — it reuses Coach's *idioms and surrounding infra* (STT/TTS, JSON parse, SRS writes, kana-in-prompt discipline, screen/nav pattern) but is **not** a thin re-skin: contract B (§6.1) adds a net-new `_convoCall`, a windowed `messages[]`, an `LS.convo` store, a new screen, and a scoring path. "Reuse where it can, build what multi-turn genuinely needs" (devils Q5).

---

## 2. Method

**Mode:** Opus-only — decision/spec/prose. No code spike: the output is an implementation-ready design the user will build via `/hydra-forge`. Resolution standard: every investigation task ends in a **lock** (A-vs-B chosen, not surveyed).

**Adversary panel (later items, named here so this doc writes for them):**
- *devils-advocate (LEAD)* — does the locked loop produce a genuine back-and-forth or a re-skinned Coach? Will a real 50-word beginner finish a session? Is it redundant with Coach? Is the SRS tie-in cosmetic?
- *code-reviewer* — fits single-file vanilla JS? persistence rules (own LS key, not bare `state.*`)? per-turn `_coachCall` latency/cost on mobile? genuinely reusing infra vs duplicating?
- *qa-tester* — Pixel 9/Android Chrome failure modes (STT mishears, TTS↔mic race, no-key, offline, mid-session reload), one full beginner walk-through, edge states (empty deck, silence, English, all-chips).

**Synthesis ownership.** Round-1 synthesis (a later item) appends `## Synthesis (Round 1 close — Delve 1)` to THIS file: verify every adversary citation against `index.html`, disposition each finding (adopt/contest/defer), lock the final design, reflect decisions into §11, update memory `project_japanese_trainer_scope_decision`, and file the two ADR proposals **pending** under `docs/decisions-pending/`. This primary doc must give synthesis a concrete target to cut against — so the locks below are deliberately decisive, not hedged.

---

## 3. Turn-loop / interaction model (task 1) — LOCKED

The spine (AI-LED probing) is fixed by the user. The remaining picks:

### 3.1 What is one round? — LOCK: **probe → answer → micro-react-then-next-probe (fused)**

One round = **AI probe (JP, spoken) → learner answer (chip or speech) → AI reaction folded into the next probe**, as a *single* model call per round. The AI's next turn both (a) gives a one-beat acknowledgement of what the learner said and (b) asks the next probe. We do **not** spend a separate round/API call on pure reaction — that doubles latency and cost for a beginner who needs momentum.

> Example (kana): AI「いま なんじ ですか?」 → learner「ろくじ です」 → AI「ろくじ ですね! あさごはん は たべましたか?」

Rationale: a *genuine* back-and-forth requires the AI to react to the learner's actual content (this is what separates it from Sentence Coach's blind single-turn verdict). Fusing react+probe into one turn keeps the conversation flowing at one round-trip per round, which the mobile latency budget (see §6) demands. The reaction is the thing the devils-advocate will test for "does it collapse to single-turn" — the contract (§6/§10) makes the acknowledgement **mandatory and content-specific**, not a canned "いいですね".

### 3.2 Keeping every probe answerable inside known vocab — LOCK: **seed + hard constraint in the system prompt** (the load-bearing risk)

Every call is seeded with the learner's **active/due word list** (the same due-first selection `_buildSpamPick` produces), and the prompt **constrains the AI to build probes whose expected answer uses only those words + a tiny closed set of "free" survival words** (numbers, はい/いいえ, です/ます scaffolding, わたし/あなた). The prompt explicitly forbids introducing vocab outside `WORD_POOL ∪ FREE_SET`. The AI is told the pool is the learner's *entire* expressive range.

This is enforced two ways (belt + braces):
1. **Generation-side:** the system prompt lists the pool and says "the learner can ONLY say these words; never ask a question they cannot answer with them."
2. **Scaffolding-side (the real guarantee):** because the AI *also* returns 2–3 suggested replies built from the pool (§4), even if a probe drifts, the learner always has an in-pool answer on screen. Scaffolding is the safety net that makes a generation slip non-fatal.

### 3.3 Scene vs rolling probes — LOCK: **loose goal-scoped scene** (thin thread, not a script)

Each session opens on a **lightweight scene** ("カフェ ☕", "weekend あさ", "じこしょうかい / introductions") that gives the probes a thread. It is *not* a branching script: the scene is a single seed line in the prompt ("setting: a café; keep questions natural to it") and the AI free-probes within it. A thread beats topic-free rolling probes because (a) it gives the AI a reason for the *next* question (more natural reactions), and (b) it lets us pre-bias the seed words toward the scene, raising the chance the due words actually fit. Scene is chosen at session start from a small fixed bank (§8) — cheap, no AI call to pick it.

### 3.4 Recovery from wrong / empty / English — LOCK: **graceful down-shift ladder, never a hard fail**

The AI's reaction branch (same call, driven by the per-turn judgment in §6 schema) follows a fixed ladder so the learner always moves forward:
1. **Empty / silence / "I don't know":** the AI *models the answer itself* in kana, then re-asks the same probe simpler — and the chips stay so a tap completes the turn. (No score, but the turn advances.)
2. **English / romaji detected:** AI gently nudges in kana + repeats the chips ("にほんご で どうぞ 🙂"), turn does not advance until an in-JP attempt or a chip-tap.
3. **Wrong but Japanese:** AI gives a one-beat correct model folded into the acknowledgement ("ああ、〜の ほうが いいですよ"), *counts the turn as attempted*, advances. Long-term SRS only credits a clean use (§7).

Locked because the qa-tester's "find the dead-end turn" attack is answered structurally: **there is no turn without a forward exit** — chips are always present, and "model + advance" is always available.

**§3 single locked spec:** *AI-led, scene-threaded probing. One round = one `_coachCall` returning a fused react+next-probe plus 2–3 in-pool suggested replies and a per-turn judgment. Every probe is answerable from the seeded pool; scaffolding guarantees an in-pool answer even on generation slip; recovery is a down-shift ladder that always advances.*

---

## 4. Scaffolding for a near-beginner (task 2) — LOCKED

Spine fixed by user: **hybrid floor + stretch** — 2–3 tappable suggested replies always present (the floor); free STT accepted as a higher-scoring stretch.

### 4.1 How are the 2–3 suggestions generated? — LOCK: **same per-turn AI call** (not templated)

The suggestions come back in the *same* `_coachCall` that produces the probe (`suggested[]` in the schema, §6). Reason: the suggestions must be *valid answers to this specific probe* — only the model that wrote the probe can guarantee that. Templating from the vocab list would produce grammatical but off-topic chips ("apple" offered as a reply to "what time is it"), which is worse than no scaffold. The prompt constrains each suggestion to the pool, so they stay in-range. (Cost: zero extra calls — they ride the existing turn call.)

### 4.2 Scoring delta + SRS mapping — LOCK: **three tiers**

| Learner action | Turn credit | SRS write (§7) |
|---|---|---|
| **Silent tap** of a chip (the floor of last resort) | turn counts, momentum kept | *no* `recordAttempt` (recognition only) |
| **Tap-then-ECHO the chip aloud** (scaffolded production), STT confirms it | full | `recordAttempt(wordId,true,'convo',{chip:true})` for each pool word — **no `smGrade` bump** (scaffolded exposure, weaker than unaided) |
| **Spoke it themselves**, AI judges *understandable/correct* (stretch) | full | `recordAttempt(wordId,true,'convo')` + `smGrade(smStatFor(wordId),'good')` for each pool word the AI confirms used |
| **Spoke it, AI judges *correct* AND unprompted** (no chip shown matched) | full + "💪 said it yourself" flag | as above, plus session-recap highlight |

The delta is *recognition-of-effort*, not points inflation, and it is graded by **how much the learner produced**, not whether they were scaffolded. This resolves the devils-advocate's strongest attack ("the easy path — silent chip-tap — trains nothing, so a rational beginner taps every turn for a pretty exchange with zero learning"): the floor now has a **cheap production rung** — after tapping a chip to *hear* it, the learner echoes it aloud and earns SRS exposure (`recordAttempt`, no ease bump). So the active path (say something) is also the *low-friction* path; only a fully silent tap-through earns nothing, and that is surfaced in the wrap-up card ("you tapped through this one — try speaking next time 🎤"). This also resolves open question §12 Q1 (weak chip-exposure logging) in favour of *logging on echo, not on silent tap*.

### 4.3 Hands-free default — LOCK: **mic auto-opens after the AI's TTS finishes; chips visible as fallback**

After the AI's probe TTS finishes the mic auto-opens (spam-mode style), a listening banner shows, and the chips remain on screen. **Implementation note (verified):** `speakJP(text,rate)` has **no `onend` callback** (its internal `u.onend` only clears `speakingFlag`) — the auto-play MUST use `_buildSpeakJP(jp, onDone)` (index.html:14409), whose `onDone` arms the mic. The bare `speakJP` is fine only for the manual replay buttons (§5) where no handoff is needed. The **silence window** is a single hard timeout (default **~6 s**) reusing the spam-mode belt-and-braces pattern (the Android Chrome bug where `rec.onend` silently drops, index.html:14598); on timeout/error we *don't* fail — we surface the chips prominently ("tap one, or 🎤 again"). This is the spam-mode template applied to dialogue: hands-free is the default, chips are the always-present escape hatch. A settings toggle `convoHandsFree` (default `true`, seeded in `DEFAULT_SETTINGS` AND read as `!== false` so a fresh install is hands-free) lets a user force tap-to-talk.

---

## 5. Comprehension support (task 3) — LOCKED

How the learner understands the AI's turn **without English on the face**:

- **Default-ON (on the face):** (1) **TTS auto-plays** the AI's JP line when the turn renders (audio-first is the spine); (2) a **replay 🔊** button; (3) a **slow-replay 🐢** button (`speakJP(text, 0.7)`); (4) the AI's line shown as **kana text** (so a learner who reads faster than they hear can scan it).
- **Behind a tap (peek):** (5) **English gloss** of the AI's line — peek button, never auto-shown (`feedback_japanese_trainer_no_english_prompts`); (6) **per-word known-word gloss** — tapping a word in the AI's line shows its EN from the deck *only if it's a word the learner has studied* (recognition aid, not new teaching).

Lock rationale: audio-first + kana-on-face + replay/slow covers the 90% case hands-free; English and word-gloss are *recovery* affordances gated behind an explicit tap so the drill stays JP-faced. The gloss text is produced by the *same per-turn call* (`glossEn` in schema, §6) — no extra round-trip, and it's already kana-safe since the model wrote both.

---

## 6. AI role, generation contract & output schema (task 4) — LOCKED

### 6.1 Request shape — LOCK: **B (native multi-turn `messages[]`)**, with a capped window

Lock **B**: maintain a `messages[]` array (reusing the `askClaude` pattern) sent each turn. Reasons over A (stateless transcript-inlining):
- A *genuine* multi-turn react loop wants the model to actually see the dialogue as a conversation; `messages[]` is the API-native way and avoids hand-rolling transcript serialization each turn.
- The `askClaude` precedent already persists a `{messages:[]}` shape, so the pattern (and its persistence) is proven in this codebase.

**But** `_coachCall` currently sends a single `{role:'user'}` message. So B requires a *small* sibling call, `_convoCall(messages)`. **It DUPLICATES `_coachCall`'s 7-line fetch body rather than refactoring it** (synthesis lock — see decision-note): `_coachCall` (index.html:9187-9199) is load-bearing for Sentence Coach and only 13 lines; an in-place extraction risks silently breaking Coach (wrong headers/model/key-check) for no real saving. The **system framing** (kana-only rule, pool, scene, schema spec) is sent via the Anthropic **top-level `system` field** (not as `messages[0]`) so it is *structurally* impossible for windowing to drop it — this closes the qa off-by-one risk (a windowed-out preamble would silently lose the kana-only rule + pool). To cap tokens/latency on mobile we **window only the turn array** (`messages[]`): keep the last ~6 turns; the constant `system` preamble is never windowed. This answers the code-reviewer's token-budget attack: bounded context, ~800 max output, one call per round.

### 6.2 Per-turn output schema — LOCK

The model returns **ONLY** a JSON object (no fence), parsed by the existing `_aiJsonExtract`:

```json
{
  "jp": "kana-only Japanese the partner says this turn (react + next probe fused)",
  "glossEn": "plain-English meaning of jp (peek only, never auto-shown)",
  "suggested": [
    {"jp": "kana-only candidate reply", "glossEn": "short EN (peek)"},
    {"jp": "...", "glossEn": "..."}
  ],
  "judged": {
    "landed": "yes | partial | no | english | empty",
    "usedWords": ["wordId or kana surface of pool words the learner correctly used"],
    "note": "<=8 words, plain EN, optional micro-feedback (peek)"
  },
  "sceneDone": false
}
```

- `jp` — spoken via `speakJP` on render; the only thing auto-played.
- `suggested` — the 2–3 chips (floor). Always present (2 minimum) so there is never a chip-less turn.
- `judged` — describes the learner's *previous* reply (`null` on the opening turn — every consumer MUST null-guard; `convoApplyScore(null,…)` and the recovery ladder both no-op on null). Drives the recovery ladder (§3.4) and the SRS write (§7). `usedWords` is the authoritative "learner successfully used these" signal — but entries may come back as **either a wordId or a kana surface** (the model can't always emit ids), and raw `ja-JP` STT additionally returns **kanji** forms. So `usedWords` is NOT directly a key for `recordAttempt`: it MUST first be normalized to a real wordId by folding both the entry and each pool word through `_kataToHira`+`_stripKanji` (index.html:5334/5342, the same machinery `_voiceScoreJa` already uses) and matching against the seeded pool; unresolved entries are dropped, never written. Skipping this corrupts `state.stats` under phantom keys (qa S4 / devils S2).
- `sceneDone` — model raises it when the scene has reached a natural close; orchestrator may also force-close at the turn cap (§8).

### 6.3 No-key fallback — LOCK: **scripted templated mini-conversation** (not gated off)

If `state.settings.anthropicKey` is empty, the mode still runs a **scripted fallback**: a small hand-authored bank of scene scripts (probe + fixed chips + canned acknowledgements) built entirely from core-pool words, driven by the same render/turn machinery but with `_convoCall` swapped for a local `_convoScript(scene, turnIdx)`. **Framing (honesty fix, devils Q6):** this is *guided scripted practice*, not a live conversation — the banner says so ("scripted practice · add a key for live chat 🔑"), and it is explicitly the **offline / no-key floor**, not a feature pretending to be the real loop. Its free-STT judging uses a **kana-overlap heuristic that MUST route the spoken input through `_stripKanji`/`_kataToHira` first** (raw `ja-JP` STT returns kanji, so a naive overlap systematically under-matches — same root cause as §6.2). **Scope note:** this app is single-user-with-key on a Pixel 9 (project memory), so the no-key path is a thin safety floor, not a primary surface — keep the scripted bank small (the ~6 scenes, a few turns each), don't over-author it.

---

## 7. SRS / vocab tie-in (task 5) — LOCKED

Spine fixed by user: **seed + score (A)** — conversations are seeded from due/learned words, and a word the learner successfully uses gets `recordAttempt(true)` + `smGrade('good')`.

### 7.1 What counts as "used a word successfully" — LOCK: **AI-confirmed use in a SPOKEN reply only**

A pool word credits SM-2 (`smGrade` ease/interval bump) iff it appears in `judged.usedWords`, **resolves to a real wordId** (normalization in §6.2), **and** the turn's input was **unaided speech** (`viaVoice===true`, not a chip echo). Concretely, per turn, for each *resolved* id in `judged.usedWords`:
- `viaVoice===true` (free speech) → `recordAttempt(id, true, 'convo', {scene})` + `smGrade(smStatFor(id), 'good')`.
- **chip echoed aloud** (`{chip:true}`, §4.2) → `recordAttempt(id, true, 'convo', {scene, chip:true})` **only** — exposure logged, *no* `smGrade` (scaffolded, so it should not advance the SM-2 schedule as if unaided).
- silent chip-tap / English / empty → nothing.

This is the tightest defensible signal that still rewards effort: an unaided ease-bump requires *production* + correctness; a scaffolded echo logs exposure without inflating the schedule.

> **Resolved (was a contest note; closes §12 Q1):** synthesis ADOPTS weak chip-exposure logging *on echo*, rejects it on *silent* tap. See §4.2.

### 7.2 How the seed picks words — LOCK: **due-first via `_buildSpamPick`, capped ~8/session**

Session seed = `_buildSpamPick(getActiveWords()-filtered, N)` with **N≈8** target words (a short convo can't naturally exercise 30). Filter mirrors spam mode: drop suspended/mastered, respect the active section. The 8 seed words + the FREE_SET are handed to the prompt as `WORD_POOL`; the AI is told to build probes that *invite* those words as answers. Cap keeps the conversation inside what 6–10 turns can plausibly cover.

### 7.3 Post-session recap (B) — LOCK: **ADOPT, lightweight**

After the wrap-up, show a **recap strip**: the seed words, marked ✅ (AI-confirmed spoken use), 🎤-but-off, or — (never produced). The ✅ words already got their SM-2 bump live (§7.1); the recap is *display only* + an optional "drill the ones you missed" button that hands the un-✅ ids to the existing `startRandomDrill({ids})`-style path. Adopted because it's nearly free (data already collected) and it visibly connects the conversation to the deck — directly rebutting "is the SRS tie-in cosmetic?".

---

## 8. Session shape, progression & hands-free fit (task 6) — LOCKED

- **Finite, not endless — LOCK.** A session is **N turns** (default 8, = seed size) then a **wrap-up card**. Endless chat has no "done" and no recap; a beginner needs a finish line. `sceneDone` from the model can end it early; the turn cap is the hard stop.
- **Fixed scenario bank, not adaptive-difficulty engine — LOCK (v1).** A small fixed bank of ~6 scenes (café, self-intro, time/daily-routine, shopping numbers, weekend, directions). "Difficulty" is implicit in the seed words (which already rotate by SRS). A real adaptive-difficulty engine is out of scope for v1 (deferred, §12).
- **Hands-free loop — LOCK.** After the AI probe TTS `onend`: auto-open mic (`startVoice`), show listening banner + chips. Learner speaks → `stopVoice` → `_convoCall` with the appended user turn → render next probe → TTS auto-plays → repeat. Tap-to-talk available via `convoHandsFree=false`. This is literally the spam-mode loop with a chat turn in place of a flashcard.
- **"Done"/wrap-up state — LOCK.** Wrap-up card shows: turns completed, words spoken ✅ vs tapped, the recap strip (§7.3), and two buttons: "もう いちど (again, new scene)" and "drill missed words". Mirrors the spam-mode end card.

---

## 9. Naming, entry point & Daily Path slot (task 7) — LOCKED

- **Name — LOCK: 「おしゃべり」 (oshaberi = "chatting/chat") · 💬.** Kana-only, friendly, not a command. Tile in the Dark Aurora drill grid alongside the others.
- **Entry — LOCK: home drill tile + one Daily Path step.** A `convo` tile on the home grid; and a Daily Path step (after `sentence`) so the daily flow ends in an actual conversation. (`render()` step dispatch already routes `else if(step==='sentence') startSentenceCoach()` near line 9608 — add `else if(step==='convo') startConvo()`.)
- **Coach overlap — LOCK: SITS BESIDE Sentence Coach, with a framing split, NOT a replacement.** Sentence Coach = *single-turn precision* ("did THIS sentence land, how would a native say it"). おしゃべり = *multi-turn flow* ("keep the exchange going"). They are different skills (accuracy vs fluency) and the user explicitly wants the conversation experience Coach can't give. **Risk acknowledged for the devils-advocate** (item 3 "extend Coach instead"): the rebuttal is that bolting multi-turn state, chips, scene threading, and a hands-free turn loop *onto* Coach would turn Coach into this mode while making its clean single-turn use worse — two clear tiles beat one overloaded one. Synthesis owns the final call; the lock is "beside".

---

## 10. Implementation sketch (for `/hydra-forge`)

Single-file vanilla JS. New code slots next to Sentence Coach (~line 9116–9250) and registers in the render map / nav / Daily Path.

### 10.1 State shape

New ephemeral session state (not persisted bare — see persistence note):

```js
state.convo = {
  scene: 'cafe',              // chosen from SCENES bank
  messages: [],              // {role, content} — API-native, windowed to last ~6 + preamble
  pool: [/* wordIds */],     // seed from _buildSpamPick, ~8
  freeSet: [/* kana */],     // numbers, はい/いいえ, です, わたし...
  turn: 0, maxTurns: 8,
  current: null,             // last parsed turn JSON {jp,glossEn,suggested,judged,sceneDone}
  listening: false, interim: '', viaVoice: false,
  loading: false, error: null,
  peekGloss: false,          // English gloss reveal (per-turn, resets each turn)
  results: {},               // wordId -> 'spoken-ok' | 'spoken-off' | 'tapped' | 'missed'
  done: false
};
```

**Persistence — LOCK (answers code-reviewer):** `state.convo` is a top-level state field (like `state.blitz`/`state.formDrill`); the load-bearing point is that it is **also written to `localStorage` under its own `LS.convo` key inside `save()`** — unlike ephemeral fields that `save()` omits and that are therefore lost on reload. So a mid-session reload can resume. SM-2 writes go through `recordAttempt`/`smGrade` into `state.stats` (already persisted). New `state.settings` keys: only `convoHandsFree` (seeded `true` in `DEFAULT_SETTINGS`).

**Resume UX — LOCK (qa Q8):** on reload into an in-progress `state.convo`, do **NOT** auto-fire TTS or auto-arm the mic (a cold-load TTS→mic race would submit garbage). Instead `renderConvo()` shows the frozen probe card with the replay 🔊 button focused and an explicit **「つづける」/Continue** tap; tapping it re-enters the hands-free loop (replays the probe via `_buildSpeakJP`, then arms the mic on `onDone`).

### 10.2 Functions (concrete names)

```js
function startConvo(sceneId)            // pick scene (random or arg), seed pool via _buildSpamPick,
                                        // build preamble, reset state.convo, nav('convo'), kick first turn
window.startConvo = startConvo;

async function _convoCall(messages)     // sibling of _coachCall: POST messages[] (shared fetch helper)
function _convoPreamble(pool, freeSet, scene)  // returns the system/first-user framing string (schema spec)
async function convoTurn(userText, viaVoice)   // append user turn, window messages, call, parse via
                                        // _aiJsonExtract, apply recovery ladder + SRS writes, render
function convoTapChip(i)                // tap a suggested reply -> speakJP it -> convoTurn(chip.jp, false)
function convoToggleListen()            // mirrors scToggleListen: startVoice -> on end convoTurn(heard,true)
function convoReplay(slow)              // speakJP(current.jp, slow?0.7:1)
function convoPeek()                    // toggle peekGloss, render
function convoWordGloss(surface)        // known-word gloss tap (only if studied)
function convoApplyScore(judged, viaVoice)  // GUARD: if !judged return. Normalize each judged.usedWords entry (kana surface OR id)
                                        // to a real wordId via the pool kana-fold (_kataToHira+_stripKanji) BEFORE writing; skip unresolved.
                                        // when viaVoice: recordAttempt(id,true,'convo',{scene})+smGrade(smStatFor(id),'good'); fill results{}
function convoEnd()                     // turn cap or sceneDone -> done=true, build recap, render
function _convoScript(scene, turnIdx)   // no-key/offline fallback returning same {jp,suggested,...} shape
function renderConvo()                  // the screen (probe card, audio controls, chips, mic banner, wrap-up)
```

### 10.3 Turn flow (hands-free)

```
startConvo -> convoTurn(null,false)            // opening probe, judged=null
  render probe -> _buildSpeakJP(jp, onDone) auto   // audio-first; onDone is the REAL handoff (speakJP has no onend cb)
  onDone -> if convoHandsFree: convoToggleListen() (auto-open mic) + show chips
learner speaks -> convoToggleListen end -> convoTurn(heard,true)
  OR taps chip -> convoTapChip -> _buildSpeakJP(chip,onDone) -> (learner may ECHO it aloud for scaffolded credit, §4.2) -> convoTurn(chip.jp,false)
convoTurn: append user msg -> window -> _convoCall -> _aiJsonExtract
           -> if parse===null: retry once, then surface "もう いちど?" + chips (NEVER freeze)
           -> convoApplyScore(judged, viaVoice)   // judged===null on opening turn -> guarded no-op
           -> recovery ladder on judged.landed
           -> turn++ ; if turn>=maxTurns || current.sceneDone -> convoEnd() else render+TTS
```

### 10.4 Prompt template (preamble, first user turn)

```
You are a warm Japanese conversation partner for a near-beginner (≈JLPT N5).
Write ALL Japanese in HIRAGANA and KATAKANA ONLY — never kanji.
SETTING: {scene human label}. Keep the chat natural to it.
The learner can ONLY use these words plus basic survival words
(numbers, はい/いいえ, です/ます, わたし/あなた): {WORD_POOL kana list}.
NEVER ask a question they cannot answer with those words. Keep each of your
turns to ONE short sentence: briefly react to what they just said, then ask
ONE simple next question.
Each turn reply with ONLY a JSON object (no markdown):
{ "jp": "...kana...", "glossEn": "...", "suggested":[{"jp":"...kana...","glossEn":"..."}, ...2-3],
  "judged": {"landed":"yes|partial|no|english|empty","usedWords":[...],"note":"<=8 words"},
  "sceneDone": false }
"suggested" = 2-3 natural in-pool replies to YOUR question. "judged" describes the
learner's LAST message (use null on the first turn). If they said nothing / English,
set landed accordingly, MODEL a correct answer inside "jp", and re-ask simply.
```

### 10.5 Where it slots into `index.html`

| Edit | Location |
|---|---|
| New functions block | after `renderSentenceCoach` region (~9250+) |
| Render-map entry | add `convo: renderConvo` to the object at **line 17963** |
| Daily Path **dispatch** | add `else if(step === 'convo') startConvo()` near **line 9608** |
| Daily Path **visible step list** | add `{ key:'convo', mode:'おしゃべり', title:'…', meta:'…' }` to the step array at **line 18230** — WITHOUT this the step never renders and the dispatch is unreachable (qa Q6) |
| Home tile | add a 💬 おしゃべり tile in `renderHome` drill grid (~18011+) |
| Persistence | add `LS.convo` + `localStorage.setItem(LS.convo, JSON.stringify(state.convo||null))` in `save()` (**3262**) and a load line near **3359** |
| `_convoCall` fetch | **DUPLICATE** `_coachCall`'s 7-line fetch body in `_convoCall` (do NOT refactor `_coachCall` in place — it's load-bearing for Coach); send the constant framing via the top-level `system` field, the windowed turns via `messages[]` (9187 for the shape to copy) |
| Settings toggle | seed `convoHandsFree: true` in `DEFAULT_SETTINGS` (**line 2960**) and read it as `state.settings.convoHandsFree !== false`; Settings → AI / Voice |
| SRS write call | use `smGrade(smStatFor(id), 'good')` — two args (`smGrade(st, grade)` at **3472**); a one-arg `smGrade('good')` silently no-ops and never advances SM-2 (code-review S1) |
| `usedWords` normalization | fold via `_kataToHira`/`_stripKanji` (**5334/5342**) to a real wordId before `recordAttempt` (**7294**) (§6.2) |

No framework, no build step, no new dependency.

---

## 11. Decisions reached (locks)

- **AI-LED scene-threaded probing loop** — user-pinned spine; one round = one call that fuses react + next probe, so it stays a true back-and-forth at one round-trip/turn.
- **One round = react+next-probe fused** — content-specific acknowledgement is mandatory in the schema, preventing collapse to single-turn.
- **Probes constrained to seeded pool + FREE_SET; scaffolding is the real guarantee** — chips give an in-pool answer even if generation drifts.
- **Loose goal-scoped scene from a fixed ~6-bank** — gives probes a thread + biases seed words; no AI call to pick.
- **Recovery = down-shift ladder (model+advance / nudge / correct+advance)** — structurally no dead-end turn.
- **Scaffolding hybrid: chips floor + free-STT stretch; only UNAIDED speech bumps SM-2** — a chip *echoed aloud* logs exposure (no ease bump), a *silent* tap earns nothing — so the active path is also low-friction and tap-through can't fake unaided production (revised R1, §4.2).
- **Suggestions generated by the same per-turn call** — only the prober can guarantee on-topic, in-pool chips; zero extra cost.
- **Comprehension: audio auto-play + kana-on-face + replay/slow ON; EN gloss + word-gloss behind peek** — JP-faced, hands-free, no-English-prompt rule honoured.
- **Generation contract B (native `messages[]`), windowed; `_convoCall` sibling of `_coachCall`** — API-native multi-turn, bounded tokens/latency.
- **Locked per-turn JSON schema** (`jp/glossEn/suggested/judged/sceneDone`) — single call yields probe, chips, gloss, judgement, end-signal.
- **No-key/offline → scripted templated fallback** — feature never a dead tile; doubles as offline path.
- **SRS credit only on AI-confirmed word use in a SPOKEN reply** — tie-in gated on production+correctness, not cosmetic.
- **Seed ≈8 due-first words via `_buildSpamPick`; post-session recap ADOPTED (display + drill-missed)** — visibly connects convo to deck.
- **Finite N=8-turn session + wrap-up card; fixed scene bank (no adaptive engine in v1)** — gives a finish line and a recap.
- **Hands-free: mic auto-opens after TTS, chips as fallback; `convoHandsFree` toggle** — the spam-mode template applied to dialogue.
- **Name 「おしゃべり」💬; home tile + Daily Path step; SITS BESIDE Sentence Coach** — distinct fluency skill vs Coach's precision; don't overload Coach.
- **In-progress session persists under its OWN `LS.convo` key** — survives mid-session reload; not a bare `state.*`.

## 12. Open questions still open

1. ~~**Weak chip-exposure logging**~~ — **RESOLVED (synthesis R1):** log exposure on a chip *echoed aloud* (`{chip:true}`, no `smGrade`), write nothing on a *silent* tap. See §4.2/§7.1.
2. **STT mishear vs genuine error** in `judged` — **RESOLVED to adopt:** reuse Coach's voice-leniency prompt block so the AI forgives recognizer artifacts (synthesis R1); fold spoken input through `_stripKanji`/`_kataToHira` before any matching (§6.2).
3. **Scene selection** — random per session, or due-words-biased pick of the scene whose vocab best matches the due set? (v1 = random; synthesis may upgrade — still open.)
4. **maxTurns tuning** — 8 chosen to match seed size; needs a real Pixel-9 walk-through (qa) to confirm it isn't fatiguing/too short. (Open — empirical.)
5. **Adaptive difficulty** (deferred) — when, if ever, does the scene bank give way to a difficulty engine? (Open — out of v1 scope.)
6. **Recap "drill missed" reuse** — **CONFIRMED net-new (not free):** `startRandomDrill(opts)` (index.html:14166) reads only `opts.count` and builds its own pool via `getActiveWords()` — it has **no id-injection seam**. Reusing it for "drill the ones you missed" requires extending its pool-building to accept an explicit id list (or a small new seed helper), scoped as build work, not a one-line param read. (Open — implementation task for forge.)

## 13. Foundation doc updates (what synthesis will patch)

- **Project memory `project_japanese_trainer_scope_decision`** — record the conversation-mode lock: 「おしゃべり」is an AI-led, scene-threaded, hands-free multi-turn loop that *extends* the voice-drill spine (it does not violate the "voice drill loop IS the app" mandate); it sits beside Sentence Coach.
- **Project memory `project_japanese_trainer_goal`** — note that おしゃべり is a new **production *practice* surface** (not a new *measurement*): it contributes the same word-level SRS signal (AI-confirmed spoken pool-word use) that spam/Coach already record, now exercised inside a live exchange. It *exercises* live comprehension + reply-formulation but does not yet *measure* them — honest framing per devils Q7; Conversational Core % gains a contributor at the word-production layer, not a new metric for conversational ability.
- **This doc §11** — synthesis reflects any contested/deferred items back into the locks after adversary disposition.
- **(No `index.html` change in this delve — build is a later `/hydra-forge`.)**

## 14. ADR proposals (framed placeholders — filed PENDING in synthesis, not here)

> These are *framings* only. Synthesis files them under `docs/decisions-pending/` (never auto-promoted to `docs/decisions/`).

- **ADR-P1 — "Conversation mode interaction model & scaffolding."**
  Context: need a genuine back-and-forth for a 50-word kana-only beginner without the learner leading. Decision (proposed): AI-led scene-threaded probing; one fused react+probe call/round; hybrid chip-floor + STT-stretch scaffolding where chips never credit SM-2; recovery down-shift ladder. Consequences: one round-trip/turn (mobile-friendly), no dead-end turns, deliberate zero-progress for tap-through sessions. Alternatives rejected: learner-led free chat (beginner can't initiate), separate react turn (2× latency/cost), templated chips (off-topic).

- **ADR-P2 — "Conversation mode SRS-coupling policy."**
  Context: tie the conversation to SM-2 without inflating progress. Decision (proposed): seed ~8 due-first words via `_buildSpamPick`; credit `recordAttempt(true)`+`smGrade('good')` **only** on AI-confirmed word use in a **spoken** reply; post-session recap (display + drill-missed) on top. Consequences: SRS progress requires production+correctness; chip-tap and key-less/offline sessions earn no grade. Open: optional weak chip-exposure logging (§12 Q1).

---

## Synthesis (Round 1 — Delve 1)

> Synthesis head, fresh window. Citation-verification gate run FIRST against `index.html` (20029 lines) and against this doc. **Every cited line/token in all 23 findings verified true** — see the gate table; nothing was contested on a bad citation. The locked design survives the panel with revisions; no lock is overturned. Two ADRs filed PENDING (`docs/decisions-pending/`), three decision-notes recorded below.

### Citation-verification gate (all PASS)

| Cited anchor | Claim | Verified |
|---|---|---|
| `index.html:5221` `speakJP(text,rate)` | no `onend` callback; internal `u.onend` only clears `speakingFlag` | ✅ body 5221-5245 confirms |
| `index.html:14409` `_buildSpeakJP(text,onDone)` | the real TTS-with-callback pattern | ✅ |
| `index.html:3472` `smGrade(st,grade)` | two-arg; `ensureSm(st);st.reviewCount++` | ✅ |
| `index.html:14166` `startRandomDrill(opts)` | reads only `opts.count`, builds own pool via `getActiveWords()`, no id seam | ✅ body 14166-14185 |
| `index.html:9187-9199` `_coachCall` | single `{role:'user'}` message, `max_tokens:800`, 13-line self-contained, no `system` field | ✅ |
| `index.html:7294` `recordAttempt(wordId,correct,mode,extras)` | keys `state.stats[wordId]` | ✅ |
| `index.html:9096` `_aiJsonExtract` | returns null on parse failure | ✅ |
| `index.html:5334/5342/5371` `_kataToHira`/`_stripKanji`/`_voiceScoreJa` + comment 5366-5368 `"家"/"言った"` | existing kana-fold machinery for kanji-returning STT | ✅ |
| `index.html:2960` `DEFAULT_SETTINGS` | exists; no `convoHandsFree` key today | ✅ |
| `index.html:9608` `else if(step === 'sentence') startSentenceCoach()` | Daily Path dispatch point | ✅ |
| `index.html:18230` `{key:'sentence',mode:'Sentence Coach',…}` | the SEPARATE visible step-list array | ✅ |
| `index.html:7604/7815/14598` spam timeouts | fixed `setTimeout`/hard belt-and-braces timeout precedent | ✅ |
| primary-doc lines 14,25,43,70,113,134,165,170,180,207,232,235,248,340 | all quoted tokens present as cited | ✅ |

### Dispositions

**devils-advocate (LEAD) — verdict WARN**
1. *(SERIOUS) 7th mode vs scope mandate* — **accepted.** Rule: this is a distinct tile (mode #7 in count) but it MUST be built as the **spam-loop shell with a chat turn replacing the flashcard** (§8 already frames it so) — that is what makes it *strengthen* the voice-drill spine rather than fork a new paradigm. The user commissioned this mode directly via /interactive (charter), so adding it is sanctioned; the constraint is the build form, now explicit in §8/§10. (ADR-001 records the convention.)
2. *(SERIOUS) load-bearing SRS signal ignores existing kana machinery* — **accepted.** Strongest correctness finding. §6.2/§7.1/§10.5 now mandate folding both STT input and `judged.usedWords` through `_stripKanji`/`_kataToHira` and resolving to a real wordId before any `recordAttempt`; the kana-overlap fallback (§6.3) likewise. (Into ADR-002.)
3. *(SERIOUS) easy chip-tap path trains nothing* — **accepted.** Design changed: §4.2 adds a **tap-then-echo-aloud** rung that earns scaffolded production credit, so the active path is also low-friction; only a *silent* tap earns nothing. Resolves §12 Q1. (Into ADR-001/ADR-002.)
4. *(SERIOUS) "genuine back-and-forth" is soft, degenerates to single-turn loop* — **accepted.** Acknowledged that prompt-only enforcement can't *structurally* guarantee content-specific reaction; the structural difference from Coach is contract **B** (native `messages[]` — the model sees the whole exchange, Coach is stateless single-call). The chip-degeneration vector is closed by finding 3's echo rung. No lock overturned; framing tightened.
5. *(QUESTIONABLE) "reusing plumbing wholesale" overstates reuse* — **accepted.** §1 reworded: reuses idioms/infra, but contract B is net-new (`_convoCall`, windowed `messages[]`, `LS.convo`, screen, scoring path).
6. *(QUESTIONABLE) no-key fallback is a fake conversation; kana-overlap broken by kanji* — **accepted.** §6.3 reframed as honest *scripted practice* (banner says so), kana-overlap routed through `_stripKanji`, scope kept thin (single-user-with-key app).
7. *(QUESTIONABLE) SRS tie-in measures word production, not conversational ability* — **accepted.** §13 reworded: a production *practice* surface contributing a word-level signal; it *exercises* but does not *measure* live comprehension/reply-formulation.
8. *(NITPICK) `startRandomDrill` recap reuse is net-new, understated* — **accepted.** §12 Q6 corrected: no id seam in `startRandomDrill`; "drill missed" needs pool-builder extension, scoped as build work.

**code-reviewer — verdict WARN**
1. *(SERIOUS) `smGrade` wrong arity in §10.2 sketch* — **accepted.** §10.2 + §10.5 fixed to `smGrade(smStatFor(id),'good')`; a one-arg call silently no-ops SM-2. High-value forge-correctness fix.
2. *(SERIOUS) `speakJP` has no `onend`; TTS→mic handoff unimplementable* — **accepted.** §4.3/§8/§10.2/§10.3 now use `_buildSpeakJP(jp,onDone)` for the auto-play handoff; bare `speakJP` only for manual replay. (Same as qa-1.)
3. *(QUESTIONABLE) dead fields `_best`/`_ended`* — **accepted.** Removed from §10.1 state shape.
4. *(QUESTIONABLE) `_convoCall` refactor risks breaking `_coachCall`, no helper shape given* — **accepted.** Locked: `_convoCall` **duplicates** the 7-line fetch (no in-place refactor of load-bearing `_coachCall`). Decision-note recorded.
5. *(QUESTIONABLE) `convoApplyScore(null,…)` opening-turn null-guard missing* — **accepted.** Null-guard added to §6.2 (judged null contract), §10.2, §10.3.
6. *(NITPICK) persistence "NOT a bare state.*" phrasing misleading* — **accepted.** §10.1 reworded: `state.convo` IS top-level, the point is it's also written to `LS.convo` in `save()` vs ephemeral fields `save()` omits.

**qa-tester — verdict WARN**
1. *(SERIOUS) `speakJP` no callback — hands-free chain unimplementable* — **accepted.** Same fix as code-review-2 (`_buildSpeakJP`).
2. *(SERIOUS) `startRandomDrill` ignores ids* — **accepted.** §12 Q6 corrected (pool-builder must be extended, not a param read).
3. *(SERIOUS) no path for `_aiJsonExtract` returning null mid-session* — **accepted.** §10.3 adds: on null parse, retry once then surface "もう いちど?" + chips, never freeze.
4. *(SERIOUS) `usedWords` kana surface vs id → silent stat corruption* — **accepted.** Normalization-to-id mandated in §6.2/§7.1/§10.5 (folds into devils-2).
5. *(QUESTIONABLE) system preamble as user-turn may be windowed out* — **accepted.** §6.1 locks the Anthropic **top-level `system` field** for the constant framing; only `messages[]` turns are windowed, so the kana-only rule/pool can't be dropped.
6. *(QUESTIONABLE) Daily Path step-list add missing from sketch* — **accepted.** §10.5 adds the `line 18230` step-array edit (without it the step never renders).
7. *(QUESTIONABLE) `convoHandsFree` not in DEFAULT_SETTINGS → first-install falsy* — **accepted.** §4.3/§10.5 seed it `true` in `DEFAULT_SETTINGS` (line 2960) and read `!== false`.
8. *(QUESTIONABLE) reload resume UX undefined* — **accepted.** §10.1 locks: no auto-TTS/auto-mic on cold load; show frozen probe + replay + explicit 「つづける」/Continue tap that re-enters the loop.
9. *(NITPICK) silence-window duration unspecified/untestable* — **accepted.** §4.3 specifies a single hard timeout (~6 s) reusing the spam-mode belt-and-braces pattern (index.html:14598).

**Tally:** 23 findings — 23 accepted, 0 accepted-deferred, 0 contested. All citations verified true.

### Decision-notes (recorded here INSTEAD of an ADR — local, cheap to reverse)

- **`_convoCall` duplicates `_coachCall`'s fetch body (no shared refactor).** *Why:* `_coachCall` is load-bearing for Sentence Coach and only 13 lines; an in-place extraction risks silently breaking it for negligible saving. *Reversal cost:* trivial/local — extract a shared helper later if a third caller appears.
- **Reload resume requires an explicit 「つづける」/Continue tap (no auto-mic on cold load).** *Why:* a cold-load TTS→mic race would submit the AI's own speech as the reply. *Reversal cost:* local UI — one render branch.
- **Hands-free silence window = single hard timeout (~6 s) reusing the spam-mode belt-and-braces.** *Why:* testable, matches the existing Android-Chrome `rec.onend`-drop mitigation. *Reversal cost:* tune one constant.

### ADRs filed PENDING (docs/decisions-pending/ — NOT auto-promoted)

- **ADR-001 — Conversation mode interaction model & scaffolding** (`docs/decisions-pending/ADR-001-conversation-mode-interaction-model.md`). Load-bearing: sets the turn-loop contract, scaffolding tiers (incl. the echo rung), recovery ladder, and the TTS→mic (`_buildSpeakJP`) + `system`-field conventions the forge build and any later mode must follow.
- **ADR-002 — Conversation mode SRS-coupling policy** (`docs/decisions-pending/ADR-002-conversation-mode-srs-coupling.md`). Load-bearing: defines the SM-2 write contract (data-model/determinism posture) — seed source, kana→id normalization, unaided-speech-only ease bump, echo-only weak exposure log.

---

## Addendum A — Levelling / progression (おしゃべりレベル)  [added 2026-06-27, user-directed via /interactive]

> Folds a levelling system onto the locked design. User picks (via /interactive): **(1)** levels unlock harder scenes **AND** fade scaffolding (both); **(2)** earned by **unaided spoken-correct word use** only; **(3)** **named kana tiers + progress bar**. This resolves open questions §12 Q3 (scene selection → now level-gated) and §12 Q5 (adaptive difficulty → in scope as discrete tiers, not a continuous engine). Where this modifies an earlier lock, the override is stated; nothing about the AI-led probing spine, the SRS write contract, or the kana-only rule changes.

### A.1 Tiers — LOCK: 4 named kana tiers, monotonic (never demote)

| Lv | Name | Scenes available (cumulative) | Chips | TTS rate | Probe complexity | maxTurns |
|----|------|-------------------------------|-------|----------|------------------|----------|
| 1 | **はじめ** | greetings, cafe, self-intro | 3 always | 0.85 (slow) | one short clause, no follow-up | 6 |
| 2 | **なれる** | + time/daily-routine, shopping-numbers | 2–3 | 1.0 | may add one light follow-up | 8 |
| 3 | **がんばる** | + weekend, directions | 2 (occasionally withheld: "try without 🎤") | 1.0 | "why/when/where?" follow-ups, occasional two-clause | 9 |
| 4 | **ぺらぺら** | all + free-topic ("anything") | on-demand only (peek-to-reveal) | 1.1 (natural) | multi-clause, opinions | 10 |

These **override the fixed values** in §4.3 (chip count), §5 (TTS rate default), §8 (maxTurns=8 fixed, scene bank ungated). The scene bank itself (§8) is unchanged in membership; each scene gains a `minLevel` field and `startConvo` draws only from `scene.minLevel <= convoLevel`, then applies the existing due-word bias within the unlocked set.

### A.2 Earning — LOCK: XP = the §7.1 unaided-spoken-correct event, reused verbatim

No new judging signal. Inside `convoApplyScore` (§10.2), the **same branch that already fires `smGrade(smStatFor(id),'good')`** (resolved id, `viaVoice===true`) also does `convoAddXp(1)` per word. Chip-echo (`{chip:true}`) and silent tap add **0 XP** — identical to their SRS treatment, so a tier can never be grinded by tapping.

- Thresholds (tunable constants `CONVO_LEVEL_XP = [0, 30, 80, 160]`): cumulative XP ≥ entry of tier N ⇒ `convoLevel = N`. Monotonic; XP never decreases, level never drops.
- `convoAddXp(n)` updates `state.settings.convoXp`, recomputes `convoLevel`, and sets a transient `state.convo.leveledUpTo` if a threshold was crossed this session (surfaced at wrap-up, never mid-turn).

### A.3 Persistence — LOCK (per the §10.1 rule): durable progression lives in `state.settings`

`convoLevel` (default `1`) and `convoXp` (default `0`) are seeded in `DEFAULT_SETTINGS` (index.html:2960) — `state.settings` is already auto-persisted, so this is the correct home (NOT a bare `state.*`). `state.convo.leveledUpTo` is transient (session-scoped, lives in the `LS.convo` blob like the rest of the session).

### A.4 Prompt contract — LOCK: a LEVEL line in the §6.1 `system` field

The constant `system` preamble gains one block describing the active tier's difficulty contract, e.g.:

```
LEARNER LEVEL: なれる (2 of 4). Ask natural questions; you MAY add ONE short
follow-up. Offer 2-3 suggested replies. Keep each probe answerable from WORD_POOL.
```

At がんばる/ぺらぺら the block instructs: fewer/no chips by default, allow two-clause and "why/when/where" probes, natural pace. The kana-only rule, WORD_POOL constraint, and per-turn JSON schema (§6.2) are **unchanged** — level only tunes complexity/scaffolding *within* those invariants. (Vocab still comes from the SRS seed; tiers do NOT widen the pool — keeps the tight-pool rule intact. A future "1 stretch word at ぺらぺら" idea is deferred, not in this build.)

### A.5 UI — LOCK

- **Home 💬 tile:** shows current tier name + a thin XP progress bar to next tier (or "MAX" at ぺらぺら).
- **Wrap-up recap card (§7.3/§8):** "+N XP" this session, the bar moving, and — if a threshold was crossed — a level-up celebration line ("レベルアップ！→ がんばる 🎉"). Reuses the existing wrap-up card; no new screen.
- **In-session:** no level chrome (keeps the turn loop clean); difficulty changes are felt, not labelled.

### A.6 New/changed functions for the forge

- `state.settings.convoLevel`, `state.settings.convoXp` — new DEFAULT_SETTINGS keys.
- `convoLevelInfo()` → `{lv, name, scenes[], chips, ttsRate, maxTurns, xp, xpToNext, atMax}` — single source the renderer + startConvo + preamble all read.
- `convoAddXp(n)` — increment, recompute level, flag `leveledUpTo`.
- `startConvo` (§10.2) — now filters scenes by `minLevel`, reads `maxTurns`/`chips`/`ttsRate` from `convoLevelInfo()`.
- `_convoPreamble` (§10.2) — appends the A.4 LEVEL block.
- `renderConvo` wrap-up + the home 💬 tile — render the bar + level-up line.
- SCENES bank entries (§8) — each gains `minLevel`.

### A.7 Definition of done (levelling)
- [ ] 4 tiers gate scenes + scale chips/rate/turns/probe-complexity as A.1
- [ ] XP earned ONLY on unaided spoken-correct use; chips/taps = 0 (A.2)
- [ ] level + xp persist in `state.settings`; monotonic (A.3)
- [ ] LEVEL block in the `system` field; invariants unchanged (A.4)
- [ ] home tile bar + wrap-up level-up celebration (A.5)
