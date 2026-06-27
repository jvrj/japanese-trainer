# QA Adversary — Delve 1: Conversation-Practice Mode

> Adversary type: qa-tester
> Primary doc: `docs/delve-cycles/1-conversation-mode.md` (commit 9e36fb06)
> Lens: are acceptance criteria testable, are regressions covered, are the verification checks sound?

---

## Scope

The charter (§Adversary 3) asks me to audit:
1. Concrete failure modes on Pixel 9 / Android Chrome
2. Walk one full session turn-by-turn as a beginner
3. Edge states: empty deck, silence, English, all-chips

Where I found untestable or absent acceptance criteria I also flag them.

---

## Findings

### F1 — SERIOUS: `speakJP` exposes no callback; hands-free TTS→mic chain is unimplementable as spec'd

**Citation:** `"TTS onend -> if convoHandsFree: convoToggleListen() (auto-open mic) + show chips"` (§10.3 turn flow pseudocode)

The design's core hands-free loop requires triggering `convoToggleListen()` when the TTS utterance ends. But `speakJP(text, rate)` (line 5221) has an internal `u.onend` that only updates `speakingFlag` — it accepts no callback parameter. There is no way for `renderConvo` or `convoTurn` to be notified when the utterance finishes using the cited function.

The pattern that works elsewhere in the codebase is `_buildSpeakJP(text, onDone)` (line ~14420), which wires `u.onend = fire; u.onerror = fire` around a caller-supplied `onDone`. The design would need to either use `_buildSpeakJP` or extend `speakJP` with a callback parameter. Neither alternative is mentioned, and `convoReplay(slow)` is also sketched as calling `speakJP` without accounting for this.

This is the critical path for the feature's defining UX promise. A forge build that follows the spec as written will produce a mode where the mic never auto-opens.

---

### F2 — SERIOUS: `startRandomDrill` ignores an `ids` filter; "drill missed words" will silently drill random words

**Citation:** `"an optional 'drill the ones you missed' button that hands the un-✅ ids to the existing startRandomDrill({ids})-style path"` (§7.3)

`startRandomDrill(opts)` at line 14166 reads `(opts && opts.count) || 30` for count, then builds its pool as `getActiveWords().filter(...)` — it does not read `opts.ids` at all. Passing `{ids: [...]}` has zero effect.

§12 open question 6 acknowledges the gap ("doesn't take ids today — needs a small param add"), but characterises it as a small addition. It is not: `startRandomDrill` constructs an entire session object (`lesson`, `state.buildMode`) from a randomly-filtered `getActiveWords()` pool. Injecting a specific id-list requires replacing the pool-building logic, not just adding a param.

Consequence: if built as-is, the "drill missed words" button would drill 30 random deck words, not the words the learner missed. The SRS recap (§7.3) which is locked as "ADOPT" depends on this working correctly.

---

### F3 — SERIOUS: No acceptance criterion for `_aiJsonExtract` returning null mid-session

**Citation:** `"convoTurn: append user msg -> window -> _convoCall -> _aiJsonExtract -> convoApplyScore(judged, viaVoice) -> recovery ladder on judged.landed"` (§10.3)

`_aiJsonExtract` (line 9096) returns `null` on any parse failure — markdown fence not fully stripped, model adds a preamble phrase, malformed kana in a string. The schema is non-trivial (nested `judged`, array `suggested`); parse failures are realistic on a constrained Haiku call.

The primary doc has no handling path for `null`. `convoApplyScore(judged, viaVoice)` would immediately throw when it tries to read `judged.usedWords`. The recovery ladder at §3.4 is keyed on `judged.landed` — but `judged` is null so that branch is never reached.

No acceptance criterion is defined for: "what does the UI show when the AI's turn fails to parse?" No test case for: API returns 200 but model output is a prose sentence, not JSON.

---

### F4 — SERIOUS: `judged.usedWords` schema allows kana surfaces but `recordAttempt` expects word IDs

**Citation:** `"usedWords": ["wordId or kana surface of pool words the learner correctly used"]` (§6.2 schema)

`recordAttempt(wordId, correct, mode, extras)` at line 7294 uses `wordId` to key into `state.stats[wordId]`. If the AI returns a kana string (e.g. `"たべる"`) instead of a word ID (e.g. `"n5_12"`), `recordAttempt` writes to `state.stats["たべる"]` — a phantom key that `getActiveWords()` never resolves.

The schema's permissive "wordId or kana surface" dual-format creates a branch that is never validated. The design says `convoApplyScore` loops over `usedWords` and calls `recordAttempt(id, true, 'convo', {scene})` — but no normalization step maps kana surfaces to real IDs.

No acceptance criterion is given for: "what happens when the AI returns a kana surface that matches multiple pool words?" or "what happens when `id` resolves to nothing in `state.stats`?"

---

### F5 — QUESTIONABLE: System preamble delivery in `messages[]` is ambiguous; windowing may drop it

**Citation:** `"The system framing (kana-only rule, pool, scene, schema spec) is sent as the first user turn / system preamble and held constant"` (§6.1)

The Anthropic Messages API has a top-level `system` string field separate from `messages[]`. `_coachCall` (line 9187–9201) sends no `system` field — only `{messages:[{role:'user', content: promptStr}]}`.

§6.1 says the preamble is "held constant" via windowing: "keep the system preamble + last ~6 turns". But if the preamble is a user-turn in position 0, and windowing means "drop turns beyond index 0 + last 6", the preamble stays only because it is at index 0. A bug in the window implementation (drop from the front instead of the middle) would silently remove the kana-only constraint, pool list, and JSON schema spec. No acceptance criterion is defined for: "after 6 turns, is the kana-only rule still in effect?"

The correct pattern for persistent instructions is the API `system` field. Using it would also slightly reduce per-turn token cost since the system field is cached on the API side.

---

### F6 — QUESTIONABLE: Daily Path UI step list is incomplete in the implementation sketch

**Citation:** `"Daily Path dispatch: add else if(step==='convo') startConvo() near line 9608"` (§10.5)

The `pathGo` dispatch at line 9608 is correct. But the Daily Path UI builds its visible step list from a separate array near line 18230 (`{key:'sentence', mode:'Sentence Coach', ...}`). Without adding `{key:'convo', mode:'おしゃべり', ...}` to that array, the step will never appear in the UI for the user to tap, making the dispatch unreachable.

The implementation sketch (§10.5) does not list this add point. A forge build following the sketch exactly would have an invisible step.

---

### F7 — QUESTIONABLE: `convoHandsFree` default in `state.settings` not seeded in `DEFAULT_SETTINGS`

**Citation:** `"A settings toggle convoHandsFree (default true) lets a user force tap-to-talk."` (§4.3)

The design stores `convoHandsFree` under `state.settings`, which is persisted and loaded from `LS.settings`. But `DEFAULT_SETTINGS` (line ~2971) does not include `convoHandsFree`. On first install, `state.settings.convoHandsFree` will be `undefined`. The check `if(state.convo.listening...)` or `if(convoHandsFree)` evaluates `undefined` as falsy — hands-free will be OFF on first use, contradicting the stated default of `true`.

No acceptance criterion is defined for the first-install / fresh-settings case.

---

### F8 — QUESTIONABLE: Mid-session reload resume spec is silent on TTS and UI state

**Citation:** `"an in-progress convo persists under its own LS key LS.convo added to save()"` (§10.1)

The persistence plan correctly identifies `LS.convo` as the resume key. But `state.convo` includes `listening: false, loading: false` (good — flags reset cleanly) AND `current` (the last parsed turn JSON including `jp`).

On reload:
- The AI probe text (`current.jp`) will be on screen from persisted `state.convo.current`
- TTS will NOT auto-replay (the page just loaded; the auto-TTS fires on `render()` after `convoTurn` completes, not on `renderConvo()` itself)
- The mic will not be armed (hands-free loop is not re-entered)

The learner sees a frozen probe with no audio and no mic. No acceptance criterion is defined for this state: does the resume show a "Replay 🔊" tap target prominently? Does it re-enter the hands-free loop? Or does the user have to manually restart?

---

### F9 — NITPICK: Silence-window duration for hands-free chip reveal is unspecified and untestable

**Citation:** `"If STT returns nothing within the silence window (or errors), we don't fail — we surface the chips prominently"` (§4.3)

"Silence window" is used without a concrete duration. Android Chrome's Speech Recognition fires `rec.onend` after its own VAD timeout (typically 3–7 seconds with no speech, but OS-dependent). The design says to treat `onEnd(null)` as the "nothing heard" signal — which is correct per line 5320 — but gives no timeout duration for a "hard fallback" if `rec.onend` never fires (a documented Android Chrome bug on some Pixel builds where `onend` silently drops).

The existing spam mode uses a hard timeout as a belt-and-braces (line 14598: "Hard timeout — onend usually fires, but belt-and-braces in case it doesn't."). No equivalent hard timeout is specified for `convoToggleListen`.

---

## Turn-by-Turn Walk: 3-Turn Beginner Session

Scripting a café session with seed words `たべる, のむ, コーヒー, みず, すき, いくら, はい, いいえ`.

**Turn 0 (opening probe):**
`startConvo('cafe')` → `convoTurn(null, false)` → `_convoCall` → parse → render → TTS auto-plays: `「コーヒーは すきですか?」`

Issue: TTS fires and ends, but mic auto-open requires the onend callback (F1). If F1 is not fixed, the learner sits in silence. No next action is visible until they notice the chips.

**Turn 1 (learner taps chip `「はい、すきです」`):**
`convoTapChip(0)` → `speakJP(chip.jp)` → `convoTurn(chip.jp, false)` → `_convoCall` → parse → `judged.landed='yes'` → `convoApplyScore({...}, false)` → no SRS write (viaVoice=false) → render next probe → TTS fires.

F1 applies again. Chip-tap path: clear next action exists. Hands-free: broken without F1 fix.

**Turn 2 (learner speaks `「のみたい」` — not in pool):**
STT returns `「のみたい」` → `convoTurn('のみたい', true)` → AI judges `landed='partial'` (maybe) → recovery ladder: "correct model + advance". `judged.usedWords` = `[]` (pool word `のむ` not confirmed). `convoApplyScore` writes nothing. Correct behavior — but no acceptance test exists for the `partial` case.

If AI returns `judged.usedWords = ['のむ']` even though the learner said `のみたい` (a conjugated form not in the pool): `recordAttempt('のむ', true, 'convo')` fires. Is this correct? The design doesn't address conjugated-form matching.

**Turn 8 (wrap-up):**
`convoEnd()` → recap strip. "Drill missed words" button calls `startRandomDrill({ids: missedIds})` → silently ignores ids → drills 30 random words (F2).

---

## Verdict: WARN

The design is well-structured and the interaction model is sound. Three SERIOUS gaps (F1, F2, F3) must be resolved before a forge build can be given this spec: the hands-free TTS-to-mic chain is unimplementable as cited, the recap drill-missed path silently misfires, and there is no handling path for JSON parse failures. Two additional SERIOUS items (F4, F7) are likely to cause silent data corruption or wrong first-run defaults. QUESTIONABLE items (F5, F6, F8) are real bugs that a test suite would catch on first integration run.

Recommended synthesis actions:
- F1: Replace `speakJP` in §10 with `_buildSpeakJP(text, onDone)` or extend `speakJP` to accept a callback; add this to §10.2 and §10.3.
- F2: Upgrade §12 Q6 from "small param add" to "requires pool injection redesign"; mark as blocker for §7.3 adoption.
- F3/F4: Add an explicit null-guard in `convoTurn` and a kana→wordId normalization step in `convoApplyScore`.
- F5: Add explicit `system` field to `_convoCall` for the preamble; confirm windowing logic never drops it.
- F6: Add `{key:'convo', ...}` to the Daily Path step array at ~line 18230 in §10.5.
- F7: Add `convoHandsFree: true` to `DEFAULT_SETTINGS`.
- F8: Define the resume UX explicitly (replay button auto-focused, or hands-free re-armed, or explicit "Continue" tap).
