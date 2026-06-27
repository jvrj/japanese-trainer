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

This mode is the **multi-turn evolution of Sentence Coach**, reusing its plumbing wholesale.

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
| **Tap a chip** (floor) | turn counts, momentum kept | *no* `recordAttempt` for a chip-only turn (recognition, not production) — see §7 contest note |
| **Spoke it themselves**, AI judges *understandable/correct* (stretch) | full | `recordAttempt(wordId,true,'convo')` + `smGrade(st,'good')` for each pool word the AI confirms used |
| **Spoke it, AI judges *correct* AND unprompted** (no chip shown matched) | full + "💪 said it yourself" flag | as above, plus session-recap highlight |

The delta is *recognition-of-effort*, not points inflation: chips keep you moving but only **production** (speech the AI confirms) feeds SM-2. This directly answers the devils-advocate "just tapping chips = no production" attack — chip-only sessions deliberately earn *zero* SRS progress, surfaced in the wrap-up card ("you tapped through this one — try speaking next time 🎤").

### 4.3 Hands-free default — LOCK: **mic auto-opens after the AI's TTS finishes; chips visible as fallback**

After the AI's probe TTS `onend` fires, the mic auto-opens (spam-mode style), a listening banner shows, and the chips remain on screen. If STT returns nothing within the silence window (or errors), we *don't* fail — we surface the chips prominently ("tap one, or 🎤 again"). This is the spam-mode template applied to dialogue: hands-free is the default, chips are the always-present escape hatch. A settings toggle `convoHandsFree` (default `true`) lets a user force tap-to-talk.

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

**But** `_coachCall` currently sends a single `{role:'user'}` message. So B requires a *small* sibling call, `_convoCall(messages)`, that posts the array (same headers/model/`max_tokens`, factored to share the fetch with `_coachCall`). The **system framing** (kana-only rule, pool, scene, schema spec) is sent as the first user turn / system preamble and held constant. To cap tokens/latency on mobile we **window** the array: keep the system preamble + last ~6 turns; older turns are dropped (a 50-word beginner's session is short, so this rarely bites). This answers the code-reviewer's token-budget attack: bounded context, ~800 max output, one call per round.

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
- `judged` — describes the learner's *previous* reply (null on the opening turn). Drives the recovery ladder (§3.4) and the SRS write (§7). `usedWords` is the authoritative "learner successfully used these" signal.
- `sceneDone` — model raises it when the scene has reached a natural close; orchestrator may also force-close at the turn cap (§8).

### 6.3 No-key fallback — LOCK: **scripted templated mini-conversation** (not gated off)

If `state.settings.anthropicKey` is empty, the mode still runs a **scripted fallback**: a small hand-authored bank of scene scripts (probe + fixed chips + canned acknowledgements) built entirely from core-pool words, driven by the same render/turn machinery but with `_convoCall` swapped for a local `_convoScript(scene, turnIdx)`. Reason: the hands-free loop is THE app; a key-less user must still get *a* conversation (even a rigid one), and the scripted bank doubles as the offline path (§ qa: offline). It loses real reaction (chips are fixed, no free-STT judging beyond a kana-overlap heuristic) — acceptable for a fallback, and it keeps the feature from being a dead tile for the no-key majority. A one-line banner notes "add a key for live chat 🔑".

---

## 7. SRS / vocab tie-in (task 5) — LOCKED

Spine fixed by user: **seed + score (A)** — conversations are seeded from due/learned words, and a word the learner successfully uses gets `recordAttempt(true)` + `smGrade('good')`.

### 7.1 What counts as "used a word successfully" — LOCK: **AI-confirmed use in a SPOKEN reply only**

A pool word credits SM-2 iff it appears in `judged.usedWords` **and** the turn's input came from **speech** (not a chip tap). Concretely, per turn: for each id in `judged.usedWords`, if `turn.viaVoice === true` → `recordAttempt(id, true, 'convo', {scene})` + `smGrade(smStatFor(id), 'good')`. Chip-taps and English/empty turns write nothing. This is the tightest defensible signal: it requires *production* (speech) *and* correctness (AI judgement), so the SRS tie-in is not cosmetic — it is gated on the exact thing the north-star measures.

> **Contest note for synthesis:** an alternative is to credit chip-taps as a weak `recordAttempt(id,true,'convo',{chip:true})` *without* an SM-2 grade bump (recognition exposure). Left as an open question (§12) — the conservative lock above (no chip credit) is the default; synthesis decides whether weak chip-exposure logging is worth it.

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
  done: false, _best: '', _ended: false
};
```

**Persistence — LOCK (answers code-reviewer):** an *in-progress* convo persists under its **own LS key** `LS.convo` added to `save()` (NOT a bare `state.*` that's lost on reload), so a mid-session reload can resume (qa item). SM-2 writes go through `recordAttempt`/`smGrade` into `state.stats` (already persisted). No new fields under `state.settings` except the toggles `convoHandsFree` and (recap drill reuse) nothing else.

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
function convoApplyScore(judged, viaVoice)  // for each usedWords id when viaVoice: recordAttempt(id,true,'convo')+smGrade('good'); fill results{}
function convoEnd()                     // turn cap or sceneDone -> done=true, build recap, render
function _convoScript(scene, turnIdx)   // no-key/offline fallback returning same {jp,suggested,...} shape
function renderConvo()                  // the screen (probe card, audio controls, chips, mic banner, wrap-up)
```

### 10.3 Turn flow (hands-free)

```
startConvo -> convoTurn(null,false)            // opening probe, judged=null
  render probe -> speakJP(jp) auto             // audio-first
  TTS onend -> if convoHandsFree: convoToggleListen() (auto-open mic) + show chips
learner speaks -> convoToggleListen end -> convoTurn(heard,true)
  OR taps chip -> convoTapChip -> speakJP(chip) -> convoTurn(chip.jp,false)
convoTurn: append user msg -> window -> _convoCall -> _aiJsonExtract
           -> convoApplyScore(judged, viaVoice) -> recovery ladder on judged.landed
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
| Daily Path dispatch | add `else if(step==='convo') startConvo()` near **line 9608** |
| Home tile | add a 💬 おしゃべり tile in `renderHome` drill grid (~18011+) |
| Persistence | add `LS.convo` + `localStorage.setItem(LS.convo, JSON.stringify(state.convo||null))` in `save()` (**3262**) and a load line near **3359** |
| Shared fetch | factor `_coachCall`'s fetch so `_convoCall` reuses headers/model (9187) |
| Settings toggle | `convoHandsFree` default true (Settings → AI / Voice) |

No framework, no build step, no new dependency.

---

## 11. Decisions reached (locks)

- **AI-LED scene-threaded probing loop** — user-pinned spine; one round = one call that fuses react + next probe, so it stays a true back-and-forth at one round-trip/turn.
- **One round = react+next-probe fused** — content-specific acknowledgement is mandatory in the schema, preventing collapse to single-turn.
- **Probes constrained to seeded pool + FREE_SET; scaffolding is the real guarantee** — chips give an in-pool answer even if generation drifts.
- **Loose goal-scoped scene from a fixed ~6-bank** — gives probes a thread + biases seed words; no AI call to pick.
- **Recovery = down-shift ladder (model+advance / nudge / correct+advance)** — structurally no dead-end turn.
- **Scaffolding hybrid: chips floor + free-STT stretch; chips never feed SM-2** — keeps "tap-through" from faking production.
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

1. **Weak chip-exposure logging** — credit chip-taps as a no-grade `recordAttempt(...,{chip:true})` for recognition exposure, or write nothing (current lock)? (Touches §7.1.)
2. **STT mishear vs genuine error** in `judged` — reuse Coach's voice-leniency prompt block so the AI forgives recognizer artifacts, or judge spoken input strictly? (Likely adopt Coach's block — confirm in synthesis.)
3. **Scene selection** — random per session, or due-words-biased pick of the scene whose vocab best matches the due set? (v1 = random; synthesis may upgrade.)
4. **maxTurns tuning** — 8 chosen to match seed size; needs a real Pixel-9 walk-through (qa) to confirm it isn't fatiguing/too short.
5. **Adaptive difficulty** (deferred) — when, if ever, does the scene bank give way to a difficulty engine?
6. **Recap "drill missed" reuse** — exact entry point into the existing spam/random-drill path with a specific id list (`startRandomDrill({ids})` doesn't take ids today — needs a small param add or a new seed helper).

## 13. Foundation doc updates (what synthesis will patch)

- **Project memory `project_japanese_trainer_scope_decision`** — record the conversation-mode lock: 「おしゃべり」is an AI-led, scene-threaded, hands-free multi-turn loop that *extends* the voice-drill spine (it does not violate the "voice drill loop IS the app" mandate); it sits beside Sentence Coach.
- **Project memory `project_japanese_trainer_goal`** — note that Conversational Core % now has a *direct* contributor (AI-confirmed spoken word use in convo), not only oblique drills.
- **This doc §11** — synthesis reflects any contested/deferred items back into the locks after adversary disposition.
- **(No `index.html` change in this delve — build is a later `/hydra-forge`.)**

## 14. ADR proposals (framed placeholders — filed PENDING in synthesis, not here)

> These are *framings* only. Synthesis files them under `docs/decisions-pending/` (never auto-promoted to `docs/decisions/`).

- **ADR-P1 — "Conversation mode interaction model & scaffolding."**
  Context: need a genuine back-and-forth for a 50-word kana-only beginner without the learner leading. Decision (proposed): AI-led scene-threaded probing; one fused react+probe call/round; hybrid chip-floor + STT-stretch scaffolding where chips never credit SM-2; recovery down-shift ladder. Consequences: one round-trip/turn (mobile-friendly), no dead-end turns, deliberate zero-progress for tap-through sessions. Alternatives rejected: learner-led free chat (beginner can't initiate), separate react turn (2× latency/cost), templated chips (off-topic).

- **ADR-P2 — "Conversation mode SRS-coupling policy."**
  Context: tie the conversation to SM-2 without inflating progress. Decision (proposed): seed ~8 due-first words via `_buildSpamPick`; credit `recordAttempt(true)`+`smGrade('good')` **only** on AI-confirmed word use in a **spoken** reply; post-session recap (display + drill-missed) on top. Consequences: SRS progress requires production+correctness; chip-tap and key-less/offline sessions earn no grade. Open: optional weak chip-exposure logging (§12 Q1).
