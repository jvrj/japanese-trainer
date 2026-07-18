# Delve 7 — The Feedback Soul & Conversation Feel

> Primary investigation doc. Round 1. Charter: `docs/delve-cycles/7-charter.md`.
> Engine line numbers cite `index.html` @ v8.13 (the working tree this delve read).

---

## 1. Charter — scope + fixed constraints

### 1.1 Scope

v8.13 is live: orb T1 opt-in, endless sessions T2, FREE-FOLLOW-THE-LEARNER contract.
The owner field-tested 2026-07-18 and delivered four findings. One is a config accident
(his phone had no API key, so every session silently ran `_CONVO_SCRIPT_TURNS`
(index.html:9385) — the "doesn't respond to what I said" verdict was the script, not
the engine; the ADR-010 L12a probe is UNKEYED-TAINTED and must re-run keyed). Three
survive the accident and are this delve's tasks:

1. **The feedback void** (owner, verbatim): *"signal to me that ive said something
   correctly or correct ME? this is very vital i think… the feedback that is the soul
   of the idea."* The engine judges every utterance internally (`judged.score` 0/1/2 →
   SRS via `convoApplyScore`, index.html:9764) but the learner never sees, hears, or
   feels any of it. Judgment-free (ADR-009) accidentally became feedback-free.
2. **The mic punishes thinking** (owner, verbatim): *"it just goes straight into
   listening, and im thinking of what to say, it ends, i click again."* Hands-free
   auto-opens the mic the instant TTS ends; a 6-second silence timer
   (`_armSilenceTimer`, index.html:9927–9934) then closes it. A beginner needs 15–30s
   to compose. The app punishes exactly the thinking time it should protect.
3. **Silent fake-AI is a trust bug.** Keyless mode plays the canned script; a minimal
   banner already shipped (`_convoScriptedBanner`, index.html:10463); this delve
   designs the full honest no-key/offline UX.

Plus one feature direction: *"modes… or modules that i can select and we sit in that
for an X amount of tasks"* — and the overall mandate: *"I want to make this less
robotic."*

### 1.2 Fixed constraints (owner-decided — not re-litigated)

- **Feedback is the soul — the delve decides HOW, not whether.** Judgment-free
  feedback only: the confirm / recast / clarify repertoire of a patient native
  friend — corrections woven into replies, never grades, never red ✗, never accuracy
  stats. ADR-009 stands in full.
- **STT is a turn-trigger, never a grader** (standing doctrine, v8.03). No
  pronunciation scoring, ever. Grammar/word-choice feedback operates on the transcript
  and MUST be confidence-aware: never confidently "correct" what may be a
  mis-transcription — degrade to clarification.
- Kana-only learner-facing Japanese; the hands-free loop must never break
  mid-migration; universal phone, not Pixel-only; single-file no-build PWA; no backend
  (Phase-1 out of scope — designs must work on today's stack and *improve* with
  Phase 1, never *require* it).
- The orb (Delve 6) is the presence layer this feedback layer renders through where
  possible. Orb pulse/color as a feedback channel is in scope; replacing the orb is not.
- Modules must not resurrect the Library / mode sprawl Stage E deleted.

### 1.3 Ground truth carried in

- Engine: `_convoPreamble` five-key contract (index.html:9307–9314), `convoTurn`
  downshift ladder (9697–9719), double-miss `forceChips` rule (9680–9691),
  `_isConvoFarewell` end path (9407), FREE_SCENE pseudo-scene (2874, engine-only),
  `_convoScript` keyless fallback (9362), `convoToggleListen` auto-open at three call
  sites (9510, 9752, 9967), Web Speech plumbing (`getRecognition` 5169 with
  `continuous:true`, `startVoice` 5186, `_sttErrMsg` 9114).
- Grounding docs: `docs/delve-cycles/6-talk-mode-presence.md` (orb state machine §3.3,
  latency ladder §3.4, silence/sleep ladder §4.3, stall × double-miss interplay §4.4),
  `docs/decisions/ADR-009-judgment-free-interaction-spec.md`,
  `docs/decisions-pending/ADR-010-talk-mode-orb-front-door.md`,
  `reports/hydra-research/2026-07-17-praktika/REPORT.md` (the ad-vs-reality trap;
  voice > avatar; judgment-free bond is the retention hook).
- SLA corrective-feedback literature (cited honestly in §2).

---

## 2. Method

1. **Read the engine, not the docs' memory of it.** Every claim about current behavior
   below is anchored to a read line in `index.html` v8.13 (working tree).
2. **Read the prior locks.** Delve 6's §3.3/§3.4/§4.3/§4.4 are load-bearing for tasks
   1–2; where this delve *amends* a Delve 6 lock, the amendment is explicit (§9 ledger
   entries marked AMENDS-D6) — never a silent override.
3. **SLA research, cited honestly.** The corrective-feedback taxonomy used here is the
   canonical one: Lyster & Ranta (1997, *Studies in Second Language Acquisition* 19)
   classified six CF moves and found **recasts are the most frequent teacher move but
   produce the lowest learner uptake/repair**, while **clarification requests and
   elicitation produce the most learner-generated repair**. Long's Interaction
   Hypothesis (1996) grounds why negotiated meaning (clarification) drives acquisition.
   Mackey & Philp (1998) found recasts help mainly learners *developmentally ready*
   for the target form — i.e. for absolute beginners, an unsalient recast is largely
   invisible. Design consequence: recasts must be made **salient** (visually + via
   natural TTS emphasis) without becoming verdicts, and clarification must be a
   first-class move, not a failure state. These are directional findings from a large
   literature, not magic numbers; no cargo-culting of classroom percentages onto a
   voice app.
4. **Owner verbatims are the acceptance oracle.** Each task section closes by replaying
   the owner's exact complaint against the locked design.
5. **Adversary bait left visible.** Each lock notes the attack it expects (judgment
   creep, false correction, latency, sprawl) so the panel can hit the load-bearing
   joints directly.

---

## 3. Corrective-feedback spec (Task 1) 🔒 — the load-bearing lock

### 3.1 The move repertoire

Three moves, mapped from the SLA taxonomy onto a friend's behavior (never a teacher's):

| Move | What the partner does | SLA anchor | When it fires |
|---|---|---|---|
| **confirm** (confirm-by-using-it) | Uses the learner's own word/phrase back naturally inside the reply — positive evidence, zero meta-talk. 「ラーメン すき なんだ ね!」 | implicit positive evidence; the majority move | `judged.score == 2` and nothing to fix |
| **recast** | Replies with the *natural* form of what the learner attempted, woven into the reply — never quoted as a correction, never prefixed with "actually". Learner said 「きのう すし たべる」 → partner replies 「きのう すし を たべた んだ ね!おいしかった?」 | Lyster & Ranta recast; low uptake unless salient → salience comes from UI highlight (§3.4), not from meta-talk | `judged.score == 2` AND the model detects a fixable form gap AND the transcript is plausible (§3.6) |
| **clarify** | Asks, as a friend would, what the learner meant — owns the confusion. 「ごめん、『たべる いく』って いった?」 | clarification request; highest repair rate; ALSO the mis-transcription safety valve | `judged.score == 1`, or score 2 with an implausible/garbled transcript (§3.6) |

**Explicit correction is permanently excluded** ("you should say X" / "that's wrong")
— banned by ADR-009 rule 3. Score-0 turns get **no feedback move at all**: the
existing downshift + double-miss path (index.html:9680–9719) already owns that lane,
and correcting an utterance the model couldn't even parse is exactly the
false-correction trap.

### 3.2 Schema extension — the five-key contract becomes six

One new top-level key, `feedback`, added to the contract in `_convoPreamble`
(index.html:9307–9314):

```json
"feedback": {
  "type": "confirm" | "recast" | "clarify" | "none",
  "heard": "<the learner's phrase as you understood it, kana-only>",
  "better": "<the natural kana form (recast only, else null)>",
  "note": "<≤8 English words on the nuance, e.g. 'past tense: tabeta', peek-only>"
}
```

Rules baked into the preamble (exact contract language for the forge):
- `recast`: `better` MUST also appear verbatim inside `jp` — the partner *says* the
  natural form as part of the genuine reply. The key is metadata for the UI; the
  correction itself lives in the conversation, spoken naturally by TTS.
- `clarify`: `jp` IS the clarification question; `better` null.
- At most ONE move per turn. When in doubt between recast and clarify → clarify.
  When in doubt between clarify and none → none. (Fail toward silence, never toward
  a phantom correction.)
- `note` is English, peek-only, and must be a nuance observation — the ADR-009
  banned-word list (*wrong, incorrect, failed, mistake, error, score, accuracy,
  grade*) applies to `note` verbatim and is lint-checked at review time.

**Cost sizing** (the latency attack, pre-answered): the contract addition is ~180
tokens of preamble (one schema block + 6 rule lines) on a ~1.2k-token preamble —
+15% input ≈ +$0.0002/turn at Haiku 4.5 list price (Delve 6 §4.5 math). Output grows
~40–60 tokens/turn; `max_tokens` in `_convoCall` (index.html:9343) bumps 400 → 500.
Latency impact of +60 output tokens on Haiku ≈ 0.3–0.6s worst case — inside the
ADR-009 5s max budget, masked by the Delve 6 §3.4 think ladder. **No second API call,
ever** — feedback rides the existing turn call or it doesn't exist. If the measured
RTT regresses past the ADR-009 budget, the `note` field is the first thing cut
(peek falls back to `better` alone).

### 3.3 Parse + fallback coherence (the whole surface, enumerated)

- `_aiJsonExtract` (index.html:9120) is schema-agnostic — no change.
- Every consumer treats `feedback` as **optional with default
  `{type:'none'}`**: absent key, malformed object, or unknown `type` value all
  normalize to `none` in one place (a tiny `_convoNormFeedback(parsed)` applied right
  after parse in `convoTurn` and `_convoOpenProbe`). The keyless `_convoScript`
  (9362) therefore needs **zero changes** to stay coherent — its five-key objects
  normalize to `feedback:none`. Parse-retry and recovery paths (9655–9668) untouched.
- Client-side **echo guard** (deterministic, part of the STT-confidence gate §3.6):
  if `feedback.type == 'recast'` but `feedback.heard`, normalized via the existing
  `_kataToHira + _stripKanji` pipeline, shares no content overlap with the learner's
  actual transcript (no common token ≥2 kana), the feedback is downgraded to `none`
  client-side. The model cannot recast something the learner never said.

### 3.4 Rendering — how feedback is seen, heard, felt

| Channel | confirm | recast | clarify |
|---|---|---|---|
| **TTS** | reply spoken normally (the confirm IS the reply) | reply spoken normally — the natural form is inside `jp`, so the learner *hears* it in context; no meta-utterance | question spoken normally |
| **Orb** | one warm **gold pulse** (single 300ms bloom on the existing `_orbSet` speaking entry, new meta flag) — "that landed" | same gold pulse (the turn landed; the recast is enrichment, not demotion) | no pulse (neutral) |
| **Text** | none | the `better` substring inside the rendered `jp` line gets a **soft underline glow** in the partner's color — never red, never strikethrough. Tap it → peek sheet: 「あなた: {heard}」→「しぜんな いいかた: {better}」 + `note` | none (the question is the surface) |
| **Peek** | — | tap-to-peek as above; auto-dismiss on next turn; never stacks | — |

Design invariants (judgment-creep bait, pre-answered): the pulse is **identical** for
confirm and recast — the orb never renders a "you got corrected" state distinguishable
from "you nailed it". There is **no counter, no streak, no per-session recast tally
anywhere in the UI**. Feedback is ephemeral: each turn's feedback replaces the last;
nothing accumulates visibly. The only persistence is the recap pathway (§3.7).

### 3.5 The intensity dial

A 3-position Settings row (default middle), framed as **conversation style**, never as
correction volume — the naming is the anti-self-judgment defense (a dial labelled
"correct everything" invites "I had to turn corrections off" shame):

| Position | Label (UI) | Behavior |
|---|---|---|
| 1 | 「ただ はなす」 *just talk* | model still replies in natural Japanese (implicit recast lives on in the reply — you can't make a native friend speak wrongly) but `feedback` is forced `none` client-side: no highlight, no peek, no pulses beyond the normal orb |
| 2 | 「ともだち」 *friend* (**default, incl. beginner default**) | full §3.1 repertoire: confirm pulses, woven recasts + highlight + peek, clarify |
| 3 | 「しっかり」 *thorough* | position 2 + the peek sheet auto-opens on every recast (no tap needed) + recap "practice these" notes rise from ≤3 to ≤5 |

The beginner default is **position 2**: Lyster & Ranta says unsalient recasts are
invisible to beginners, so shipping position 1 as default would rebuild the feedback
void; position 3 as default would over-focus form on turn one. Position 2 is exactly
the owner's ask — visible confirmation + visible correction, zero verdicts.

### 3.6 STT-confidence gating (the false-correction defense, concrete)

Platform fact: Android Chrome Web Speech `confidence` values are unreliable-to-absent
(the engine's own alt-builder at index.html:5213 already treats them as decorative;
joined alts carry fabricated conf 1/0.9 at 5220–5225). **Numeric confidence is
therefore banned as a gate input.** The gate is layered, all deterministic or
model-side:

1. **Score gate (client, deterministic):** recast only ever on `judged.score == 2`
   turns. Score 1 → clarify only. Score 0 → none (double-miss path owns it).
2. **Plausibility instruction (model):** preamble line — "The learner's words arrive
   via speech recognition and may be mis-heard. Only offer `recast` when the utterance
   is a plausible thing a learner would say AND the fix is a form/word-choice nuance.
   If the utterance looks garbled, truncated, or semantically impossible, use
   `clarify` and ask what they said. NEVER treat a possible transcription artifact as
   a learner mistake."
3. **Echo guard (client, deterministic, §3.3):** recasts whose `heard` doesn't overlap
   the real transcript are dropped to `none`.
4. **Clarify phrasing owns the blame:** clarify copy is always 「ごめん、〜って
   いった?」 — the partner takes the blame for mishearing (ADR-009 rule 4), so even a
   wrongly-fired clarify reads as the partner's ears, not the learner's mouth.

Worked mishear case (for the qa-tester): learner says 「きのう すし を たべました」,
STT emits 「きのう すし を たべま」 (truncated). Score comes back 2 (comprehensible);
model sees a "mistake" (missing した). Layer 2 catches it: truncation is a listed
transcription artifact → clarify or none, never a conjugation lecture about a syllable
the phone dropped.

### 3.7 What feeds SRS — almost nothing new, by design

- `feedback` **never** writes SRS/mastery directly. Recast targets are model judgments
  over possibly-noisy transcripts — feeding them to `smGrade` would make STT a grader
  by proxy (doctrine violation).
- New: `cv.recastLog` — an in-session array of `{heard, better, note}` (cap 10,
  newest-first). At `convoEnd`, the recap's existing celebration-first ≤3 notes
  (ADR-009 rule 5, already shipped in Stage D) draw from `recastLog` **before** the
  missed-pool-word fallback — so the recap's "practice these" one-tap opt-in now
  carries the session's actual form gaps into the existing missed-drill pathway.
  That is the ONLY route from feedback to review, it is opt-in, and it is exactly the
  route ADR-009 already sanctioned.

### 3.8 Owner-verbatim replay

*"signal to me that ive said something correctly"* → every landed turn gets the gold
pulse + the partner using your words back. *"or correct ME"* → the natural form is
spoken in the reply and glows in the transcript; tap it and see exactly what you said
vs the natural way. No grade anywhere. **Void closed.**

---

## 4. Turn-taking choreography (Task 2) 🔒 — the mic learns patience

### 4.1 The failure, precisely

Today: TTS `onend` → `convoToggleListen` (index.html:9752) → mic opens instantly →
`_armSilenceTimer` closes it after 6s of silence (9927–9934) → learner mid-thought
sees the mic die → manual tap → repeat. Android's recognizer additionally gives up
with `no-speech` after ~5–8s on its own. Two independent guillotines against a
15–30s thinking need.

### 4.2 The lock — a patient-listening window with silent restarts

**The mic stays functionally open for 90 seconds of thinking time**, implemented as a
client-side restart loop (Web Speech sessions can't be told to wait, so we re-arm
them invisibly):

- `cv._listen = { armedTs, restarts }` set when the hands-free chain arms the mic.
- When recognition dies with **no final transcript** — `onend` with empty `_best`, or
  `onerror('no-speech')` — and `now - armedTs < 90_000` and the session isn't frozen/
  chip-forced/ended: **silently restart** `rec.start()` after a 250ms guard gap.
  No error toast, no render churn, orb stays in `listening`. `no-speech` and
  `aborted` become benign codes inside the window (today `_sttErrMsg` at 9114–9117
  would toast "Didn't catch that" — that copy stops firing inside the window).
- Restart cap 20 (belt-and-braces against a pathological 250ms-death loop); hitting
  the cap falls through to the stall ladder as if the window expired.
- Any interim speech resets nothing — once the learner is talking, the existing
  continuous-mode + 6s-since-last-speech commit behavior (9927–9934, retimed to 5s
  after last interim) decides utterance end, unchanged in spirit.
- Implementability check (for the code-reviewer): `rec.start()` after `onend` on an
  https origin with granted mic permission does **not** re-prompt on Android Chrome
  (permission is per-origin, persisted); the known cost is a ~200–400ms dead gap per
  restart, which is inaudible because nothing signals it. The 90s loop holds the mic
  hardware notification icon on — that is *honest* (we are listening) and bounded by
  the ladder below. No backend STT required.

### 4.3 The merged silence ladder (AMENDS-D6 §4.3/§4.4)

Delve 6's ladder assumed the 6s timer and "double empty listen" as detectors; silent
restarts make both obsolete as *user-visible* events. The new single clock is
**seconds since TTS ended with no learner speech**:

| T (silence) | Behavior |
|---|---|
| 0–8s | pure listening. Orb listening state, nothing else. A 400ms grace gap between TTS `onend` and `rec.start()` (avoids the mic eating the speaker's tail on loud phones) |
| 8s | **take-your-time affix** fades in under the orb: 「ゆっくりで いいよ」. Orb breathing slows slightly. NEVER a countdown, spinner, or shrinking bar — visible time pressure is judgment |
| 20s | chips overlay fades in (suggestions from `cv.current.suggested`) — mic stays open, chips are an offer not a demand. *(AMENDS-D6: was 6s — 6s was the punishing value; chips at 6s read as "hurry up".)* |
| 60s | partner re-engages ONCE, simpler (existing downshift behavior): rephrases from its own `suggested` vocabulary. Mic re-arms after. |
| 90s | patient window ends → 「まだ いますか?」 probe with chips 「うん、いるよ」/「またね」 *(D6's 45s probe, moved)* |
| +30s | **sleep** (`cv._frozen`, orb → idle, mic closed) — D6 §4.3 unchanged |
| sleep +3min | auto-`convoEnd` recap — D6 §4.3 unchanged |

Interplay locks: `forceChips` (double-miss) still wins the input mode outright — no
auto-mic, no restart loop, that turn is chip-only (existing 9752 guard).
The silence clock never runs while TTS is speaking or `cv.loading` is true.
Battery: 90s of cycling recognition per silent turn is the honest cost of patience;
the ladder's sleep rung bounds it, and `document.hidden` aborts the loop immediately
(no background listening, ever).

### 4.4 Auto-listen stays the default; tap-when-ready is the setting, not the fix

Candidates: (a) flip default to tap-to-talk — rejected: hands-free is the product
(spam-mode template doctrine), and tap-per-turn re-introduces the exact friction the
orb exists to delete. (b) keep instant-open + longer timeout only — rejected: a single
long recognizer session still dies to the engine's own `no-speech` guillotine; without
restarts the fix is fake. (c) **patient window + silent restarts + pressure-free
ladder — LOCKED.** `convoHandsFree:false` (existing setting, 2789) remains the
tap-when-ready escape hatch, unchanged.

### 4.5 Owner-verbatim replay

*"im thinking of what to say, it ends, i click again"* → he now gets 90 seconds, a
「ゆっくりで いいよ」 instead of a dead mic, chips only as a quiet offer at 20s, and
zero required taps. Tap count for his exact complaint session: **0** (was: 1 per
thought-pause).

---

## 5. Honest modes (Task 3) 🔒 — never fake the AI

### 5.1 Does keyless おしゃべり exist at all?

Candidates: (a) kill it — redirect keyless users to drills + connect-AI onboarding.
Rejected: the first-minute feel of the talk loop (orb, TTS, mic rhythm) is the
product's sales pitch; a keyless user should get to *feel* it. (b) keep endless
scripted with just the banner. Rejected: an endless 5-turn-cycling script is the
Praktika trap in miniature — advertising a conversation while shipping a loop
(REPORT.md: the ad-vs-reality gap is their #1 backlash source; *"don't advertise a
mode you don't ship"*). (c) **LOCKED: keyless Talk = an honest demo.** The scripted
bank plays **one full cycle (5 turns)** with the shipped banner visible, then instead
of cycling (the modulo at 9363 silently loops today), the partner closes warmly and a
card says plainly: 「スクリプトは ここまで!」 — *"That's the whole script. Connect
an AI and this becomes a real conversation that responds to you."* Two buttons:
**AI をつなぐ** (→ §5.3 flow) and **ドリルへ** (drills, fully offline-capable).
`_isConvoFarewell` still ends it earlier if tapped. Nothing endless is faked.
(AMENDS-D6 §4.2's keyless-endless consequence: endlessness was locked for the *keyed*
engine; extending it to the script was never load-bearing and is reversed here.)

### 5.2 Disclosure framing

- The shipped banner (10463) stays, reworded to capability-framing over apology:
  「🎭 スクリプトれんしゅう」 — *"Scripted practice — replies follow a fixed script.
  Connect AI for a real conversation."* One line, one link. It renders on every
  keyless convo screen (already true) AND the orb's idle affix in keyless mode reads
  「スクリプトれんしゅう」 under the tap-to-start prompt, so the disclosure exists
  *before* the first exchange, not only during.
- **No-key ≠ offline.** Distinct copy paths: keyless (`nokey`) says "no AI connected
  on this device"; a keyed fetch failure says 「インターネットが ない みたい」 +
  retry + drills pointer. A keyed session must NEVER silently fall back to the script
  mid-conversation — the current code already never does this (the `key ?` ternary at
  9643 picks per-turn by key presence, not by failure), and this lock forbids ever
  "improving" it that way.

### 5.3 The key-entry flow a non-technical user survives

One Settings card, 「AI をつなぐ」, three numbered steps on a single screen (no
wizard, no video): 1) link out to `console.anthropic.com/settings/keys` ("create a
key — it looks like `sk-ant-…`"), 2) paste field (show/hide toggle, trims whitespace,
rejects obvious non-keys client-side), 3) **connect test** — one minimal
`_convoCall`-style ping (`max_tokens: 1`); success → orb gold pulse + 「つながった!」
and every scripted banner disappears app-wide on next render; failure → the three
real causes in plain words (wrong key / no credit on the Anthropic account / no
internet), each with its one fix. Every scripted-mode banner and the §5.1 end-card
deep-link here. Nothing else on the card — the flow is deliberately a bridge, not a
monument.

### 5.4 The Phase-1 fold

All of §5 sits behind the existing single predicate (key presence at 2762). Phase-1
hosted backend replaces that predicate with "signed in": the scripted demo then only
exists for signed-out first-launch, the key-entry card is replaced by account login,
and §5.1's end-card CTA becomes the signup CTA — same seams, swapped copy. Nothing
built here is thrown away; the demo-then-connect shape IS the future onboarding
funnel. (Design-the-bridge requirement satisfied; no Phase-1 work is required to ship
any of §5.)

---

## 6. Module structure (Task 4) 🔒 — purpose without sprawl

### 6.1 What a module IS (the structural anti-sprawl definition)

A module is **a data row consumed by the one talk loop** — never a mode, never a
screen, never an engine:

```js
{ id:'ordering', nameJP:'ちゅうもん する', en:'Ordering food',
  goalJP:'たべものを ちゅうもん できる',      // felt purpose, shown once at start
  directive:'<one preamble line steering the conversation>',
  target: 8 }                                  // advanced exchanges to completion
```

**The structural difference from the Library** (the sprawl attack, pre-answered): the
Library was parallel *engines* with parallel UIs; a module is a parameterization of
`startConvo` — same orb, same schema, same SRS path, same end paths, same screen.
Hard rule, enforceable at review: **any proposed module that needs custom UI, a
schema change, or an engine branch is rejected by definition** — it isn't a module,
it's sprawl wearing a module's name. v1 ships ≤6 modules, all derived from the
existing SCENES topics (2859–2866).

### 6.2 Relationship to SCENES and FREE_SCENE

- LOCKED: the `SCENES` bank **becomes** the `MODULES` bank (same rows + `goalJP` +
  `target`); `startConvo(sceneId)` keeps its signature (module id = scene id — zero
  call-site churn). FREE_SCENE stays exactly what it is: the default, target-less,
  goal-less front door. Free talk is NOT a module and never gets a target.
- Selection UI: the Delve 6 IA's swipe-up sheet on the Talk screen lists フリートーク
  first (default, visually primary) then the module chips — one line each
  (nameJP + goalJP). No new screen; the sheet already exists in the D6 IA as the
  resume/scene surface.

### 6.3 "Sit in it for X" mechanics

- **A "task" = one advanced exchange** — `cv.turn` increment, the engine's existing
  progress atom (9699). Nothing new is counted; score never gates progress (a
  clarify-retry turn simply doesn't advance, exactly as today's ladder already works).
- **In-module progress**: a thin arc around the orb fills per advanced turn
  (`cv.turn / target`). This is *production volume*, ADR-009's sanctioned score
  language — never accuracy. No numbers on it by default; tap the arc to peek
  「あと 3」.
- **Completion**: at `cv.turn >= target` the partner wraps **in-character** on its
  next turn (preamble directive: "when TARGET is reached, celebrate what you two
  talked about and ask if they want to keep chatting") → card:
  「{goalJP} — たくさん はなした ね!」 with chips 「もっと はなす」 (converts the
  session to free talk, same messages window, no restart) / 「べつの モジュール」
  (sheet) / 「またね」 (recap). Completion appends the module id to the convoLog row.
  Soft-cap/daily-budget guards (D6 §4.5) still apply above all of this.
- **Exit/re-entry**: leaving mid-module (farewell, sleep-death, tab-kill) is a normal
  session end — **no persisted debt, no "resume module?" nag, no partial-progress
  guilt surface**. Re-entering a module starts it fresh. (Judgment-free: unfinished
  is not a state the app remembers at the learner.)
- **SRS/spine feed**: unchanged — `convoApplyScore` per turn. v1 deliberately does
  NOT topic-bias the pool seed (`_buildSpamPick` stays); a `poolBias` tag is noted as
  an open question (§10) rather than built, because due-word scheduling beats topical
  matching for retention and the bias adds a second scheduling authority.

---

## 7. Anti-robotic synthesis (Task 5) 🔒 — what makes it feel like a person

The mechanics, ranked by felt impact per token spent:

1. **Patience (Task 2) is the single biggest de-robotizer.** Humans wait; machines
   cut you off. The 90s window + take-your-time affix does more for "less robotic"
   than any prompt engineering. (Free — no tokens.)
2. **React-then-ask (preamble rule).** Every `jp` must open with a genuine reaction
   fragment to what the learner just said (へえ!/ いいね / そうなんだ / ほんと?)
   *varied* — plus an explicit anti-template rule: "never open two consecutive turns
   with the same word; never re-ask a question the learner already answered." The
   robotic tell is the invariant opener; this kills it at the contract level.
   (~4 preamble lines.)
3. **Within-session memory callbacks.** The 6-message API window (9636) means turn 30
   cannot remember turn 3 — the deepest robotic tell in an endless session. LOCKED:
   `cv.facts` — a rolling ledger (cap 10) of the learner's landed utterances: on every
   `judged.score == 2` voice turn, push the normalized transcript. The per-turn system
   string becomes `cv.preamble + '\nTHINGS THE LEARNER SAID EARLIER (call back to one
   naturally at most every few turns): ' + facts.join('、')`. Cost ≈ ≤120 tokens.
   This buys 「さっき ラーメン すき って いった よね!」 — the moment that makes a
   partner feel real. (Note: system string becomes per-turn-composed instead of fixed
   at `startConvo`; `cv.preamble` stays the immutable base.)
4. **Prosody with today's TTS (honest ceiling).** Micro-jitter utterance rate
   (tier `ttsRate` ± 0.04 per utterance) so no two lines play at machine-identical
   speed; keep the D6 filler budget (うーん… ≤1/turn at 2.5s); prefer 「、」commas in
   the preamble style guide to force natural pause points. That is ALL this stack can
   do — `speechSynthesis` exposes no pitch contour, no emphasis, no SSML on Android
   Chrome.
5. **Feedback warmth (Task 1).** Confirm-by-using-it is itself an anti-robotic
   mechanic — parroting nothing, reacting to content.
6. **Latency masking**: D6 §3.4 ladder, unchanged, referenced not redesigned.

**The honest boundary — robotic residue that is UNFIXABLE before Phase 1** (so the
owner knows what to expect now):

| Residue | Why it's stuck | Phase-1 fix |
|---|---|---|
| 2–6s dead air before replies | non-streaming `_convoCall`; browser fetch + full-response parse | streaming + partial-TTS |
| Voice quality = whatever the phone has | `speechSynthesis` device voices; neural on Pixel, robotic on cheap Androids | server TTS (ElevenLabs-class — the Praktika retention lever) |
| No barge-in (can't interrupt the partner) | SR and TTS can't reliably run simultaneously on Android Chrome (mic picks up the TTS) | duplex audio pipeline |
| No backchannels while the learner speaks (うん、うん) | same simultaneity limit | duplex |
| Flat emotional prosody | no SSML/emotion control in Web Speech | server TTS |

The masking converts annoyance into patience; it cannot make 5s feel like 700ms
(D6 §3.4's honest bound, reaffirmed). If the owner's keyed re-test still reads
"robotic" *after* Tasks 1+2 ship, the finding is "Phase 1 is the blocker" — a
conclusion, not a failure.

---

## 8. Implementation sketch — staged shipping order

Each stage shippable alone; order = owner pain × risk. All changes are additive to
`index.html`; existing sessions survive every stage (all new `cv.*` fields are
guard-defaulted on read, and a mid-migration live session simply lacks the new
behavior until the next `startConvo`).

### Stage F1 — Mic patience (the sharpest pain, zero schema risk)
- `convoToggleListen` (9918): replace the 6s-close timer with the `cv._listen`
  patient-window state machine + silent-restart loop (§4.2); benign-code handling for
  `no-speech`/`aborted` inside the window (bypass `_sttErrMsg` toasts).
- `convoStopListen` (9906): clears the window state (explicit stop always wins).
- 400ms TTS-tail grace before `rec.start()` at the three auto-open call sites'
  shared entry (inside `convoToggleListen`, not per-site).
- Silence-ladder timers (§4.3 table) + 「ゆっくりで いいよ」 affix + 20s chips
  overlay: `renderConvo` listening banner region (10520s) + orb affix seam.
- `_orbSet` (10429): listening-state slow-breath variant after 8s (meta flag only).
- Migration: none (no state shape change beyond `cv._listen`, guard-defaulted).

### Stage F2 — Feedback layer (the soul)
- `_convoPreamble` (9244): six-key contract + §3.1/§3.6 rules + banned-word-safe
  `note` instruction. `_convoCall` (9343): `max_tokens` 400→500.
- New `_convoNormFeedback(parsed)` applied post-parse in `convoTurn` (after 9655) and
  `_convoOpenProbe` (after 9494); echo guard in the same helper.
- `renderConvo`: recast highlight inside the `jp` line + tap-to-peek sheet;
  `_orbSet` gold-pulse meta on landed turns.
- `cv.recastLog` (cap 10) + recap notes source swap in the Stage-D recap builder
  (convoEnd region, 9830s).
- Settings: the 3-position style dial row (§3.5); `state.settings.convoStyle`
  default `'friend'`.
- `_convoScript`: no change (normalizer defaults it). Keyless behavior identical.
- Migration: absent `convoStyle` reads as `'friend'`; old sessions lack `recastLog`
  → recap falls back to missed-pool notes (existing behavior).

### Stage F3 — Honest modes
- `_convoScript` (9362): cycle-complete detection (turnIdx ≥ bank length) → script-end
  card path instead of modulo loop; `_CONVO_SCRIPT_TURNS` untouched.
- Banner copy rework (10463) + keyless orb idle affix.
- Settings 「AI をつなぐ」 card: 3-step flow + connect-test ping + success/failure
  states; deep-links from banner + end card.
- Error copy split: `nokey` vs network-fail strings at the `cv.error` sites
  (9490, 9646).

### Stage F4 — Modules
- `SCENES` → `MODULES` rows (+`goalJP`, +`target`, +`directive`) (2859); FREE_SCENE
  untouched.
- `startConvo`: pass module directive + target into preamble/`cv`; completion wrap
  directive.
- Swipe-up sheet: module chips + free-talk-first layout (Talk screen surface).
- Orb progress arc (render-only, `cv.turn / cv.target`) + completion card + convoLog
  module id.
- Migration: sessions with no `cv.target` render no arc and never wrap — free talk
  unchanged.

### Stage F5 — Anti-robotic dressing
- React-then-ask + anti-template preamble rules; `cv.facts` ledger + per-turn system
  composition in `convoTurn`/`_convoOpenProbe`; TTS rate jitter in `_convoSpeakJP`
  (9443).
- Cheapest stage, but shipped LAST deliberately: its effect is only measurable once
  feedback + patience have removed the louder robotic signals.

**Post-F2 gate:** the ADR-010 L12a felt-difference probe re-runs **keyed** (the
UNKEYED-TAINTED run is void) — after F1+F2, because those two answer the owner's
actual complaints; running it before F1 re-measures the mic pain, not the design.

---

## 9. Decisions reached (locks)

| # | Lock | Where |
|---|---|---|
| L1 | Feedback repertoire = confirm / recast / clarify; explicit correction permanently excluded; score-0 turns get no feedback move | §3.1 |
| L2 | Contract extends five keys → six with optional `feedback` object; absent/malformed normalizes to `none`; keyless script unchanged | §3.2–3.3 |
| L3 | Recast lives INSIDE `jp` (spoken naturally by TTS); the key is UI metadata; no meta-utterance, no second API call, `max_tokens` 400→500 | §3.2, §3.4 |
| L4 | Rendering: identical gold pulse for confirm and recast; soft-glow highlight + tap-to-peek; zero visible accumulation/counters | §3.4 |
| L5 | Style dial 3 positions framed as conversation style; beginner default = position 2 「ともだち」 | §3.5 |
| L6 | STT-confidence gate = score gate + model plausibility rule + client echo guard + blame-owning clarify copy; numeric SR confidence banned as an input | §3.6 |
| L7 | Feedback never writes SRS; sole route to review = `recastLog` → recap ≤3 opt-in notes → existing missed-drill pathway | §3.7 |
| L8 | Patient-listening window: 90s, silent SR restarts (250ms gap, cap 20), benign `no-speech` inside the window | §4.2 |
| L9 | Merged silence ladder: 8s affix / 20s chips (AMENDS-D6 6s stall) / 60s re-engage / 90s まだいますか (AMENDS-D6 45s) / +30s sleep / +3min end; no countdown UI ever | §4.3 |
| L10 | Auto-listen stays default; tap-when-ready remains the `convoHandsFree` off-switch, not the fix | §4.4 |
| L11 | Keyless Talk = honest demo: one script cycle (5 turns) → script-end card → connect/drills CTAs; keyless-endless reversed (AMENDS-D6); keyed sessions never script-fallback mid-conversation | §5.1–5.2 |
| L12 | One-screen key-connect flow with live connect-test; distinct no-key vs offline copy; all of §5 sits behind the single key-presence predicate for the Phase-1 swap | §5.3–5.4 |
| L13 | Module = data row into the one loop (id/goal/directive/target); custom-UI/schema/engine modules rejected by definition; ≤6 in v1; SCENES becomes MODULES; free talk stays target-less default | §6.1–6.2 |
| L14 | Task = advanced exchange; progress = orb arc (volume, not accuracy); completion wraps in-character with continue-as-free-talk conversion; no persisted module debt | §6.3 |
| L15 | Anti-robotic set: react-then-ask contract rules, `cv.facts` callbacks ledger (cap 10, ≤120 tokens), TTS rate jitter, D6 ladder unchanged; Phase-1 residue table is the honest boundary | §7 |
| L16 | Ship order F1 mic-patience → F2 feedback → F3 honest modes → F4 modules → F5 dressing; ADR-010 L12a probe re-runs KEYED after F1+F2 | §8 |

## 10. Open questions still open

- **OQ-1:** Ladder numbers (8/20/60/90s) are design estimates — field-tune on the
  owner's keyed sessions; only the *shape* (affix → chips → re-engage → probe →
  sleep) is locked.
- **OQ-2:** Recast highlight legibility at 18px kana on small screens — may need the
  peek sheet to be the primary and the glow to be subtler; forge-time visual call.
- **OQ-3:** Does the restart loop's cumulative recognizer churn misbehave on any
  non-Pixel Android (e.g. Samsung's SR service)? Needs one cheap device probe;
  fallback is a shorter window on detection, not a redesign.
- **OQ-4:** `cv.facts` prompt-injection surface — learner utterances enter the system
  string. Mitigation sketch (kana-normalized, punctuation-stripped, 40-char cap per
  fact) needs the code-reviewer's eye.
- **OQ-5:** Module `poolBias` (topic-tagged pool seeding) — parked; revisit after v1
  modules prove felt-purpose without it.
- **OQ-6:** Style-dial position adoption — if >50% of early users pick 「ただ はなす」,
  that echoes ADR-009's reversal-trigger logic in the opposite direction (feedback
  overshot); instrument via convoLog, decide later.

## 11. Foundation doc updates

*(Framed here; applied at synthesis/later items, not by this doc.)*

- `INDEX_ROADMAP.md`: one open-work row — "Delve 7 feedback-soul locks → forge
  stages F1–F5 (doc §8)".
- `docs/decisions-pending/ADR-010`: append a pointer note — the L12a probe result is
  UNKEYED-TAINTED (2026-07-18 field test ran `_convoScript`); gate re-runs keyed
  after F1+F2 (L16). Pointer only, no rewrite.
- `docs/delve-cycles/6-talk-mode-presence.md`: no in-place edit; the AMENDS-D6 ledger
  entries (L9, L11) live here and in the eventual ADR, per delve convention.
- ADR-009: untouched — extended by the ADR below, never amended in place.

## 12. ADR proposals (heuristic policy — placeholders only, filed at synthesis)

- **ADR-011 (proposed): The corrective-feedback layer — an extension of ADR-009.**
  Scope: L1–L7 (repertoire, six-key contract, rendering invariants, style dial,
  confidence gate, SRS boundary). Load-bearing because it deliberately *amends the
  spirit* of judgment-free from "no feedback mid-conversation" (ADR-009 rule 5's
  placement clause) to "judgment-free feedback IN the conversation" — a reversal of a
  promoted ADR's clause, which is exactly what ADR-009's own consequences section
  says requires a new delve + decision record. Costly to reverse (schema + preamble +
  UI + recap pathway all move together).
- **Everything else stays inline decision-notes** (this doc, §9): mic choreography
  (L8–L10) is engine tuning within existing doctrine; honest modes (L11–L12) are the
  enforcement of an already-standing principle (never fake the AI); modules (L13–L14)
  are a data-shape choice inside the one-loop mandate; anti-robotic set (L15) is
  prompt/UX craft. None meets the load-bearing/costly-to-reverse bar; minting ADRs
  for them would be ADR inflation.
