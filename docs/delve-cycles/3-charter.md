# Delve 3 — Speech-to-Text Architecture for Isshin's Core Voice Loop

## Domain

The hands-free voice drill loop **is** the app [[project_japanese_trainer_scope_decision]]. Its correctness depends entirely on speech-to-text working. It does not: on the user's Pixel 9 Pro (Android Chrome), recognition fails for the overwhelming majority of answers.

The user's load-bearing report, verbatim:

> *"it has caught some words but 90% of the time it doesnt recognize what ive even said"* … *"honestly i dont think it recognizes it at all right now"*

**Critical ground truth (verified in `index.html`):**
- **Two STT engines already exist.** The dispatcher `_buildVoiceListen()` (line ~15531) routes to **Whisper** (`_whisperVoiceListen`, ~5818) when `whisperAvailable()` (5633) is true, else **Web Speech** (`_buildVoiceListenWebSpeech`, ~15539). Whisper is gated on `state.settings.voiceSttEngine !== 'webspeech'` **AND** an OpenAI key (`state.settings.openaiKey`) **AND** online **AND** `MediaRecorder` present. With no key, the app silently uses Web Speech.
- **Web Speech is the failing path.** It uses `webkitSpeechRecognition` at `lang='ja-JP'` via `getRecognition()`/`startVoice()` (5417/5435). Two configs have now been tried on-device and **both fail**: `continuous=true` (≤v7.97) → ~90% miss; `continuous=false` (v7.98) → recognizes ~nothing. A code comment records that `continuous=false` was *previously* abandoned for cutting speakers off — i.e. the team has already cycled both settings. **Signal: this is the Android JP recognizer itself, not a tunable knob.**
- **Whisper (OpenAI) is the strong candidate.** Records audio via `MediaRecorder` → POSTs to OpenAI Whisper → far better Japanese accuracy than Android Web Speech. Already wired, with a hallucination filter (`WHISPER_HALLUCINATIONS`, ~5651) and a Settings UI (~20728). Costs: an OpenAI key, ~$0.006/min, and network round-trip latency (~1–2s) per answer — which matters for a *rapid hands-free* loop.
- **Verdict + SRS coupling (downstream of STT).** When STT returns nothing the verdict is `nostt`, which records **nothing** to `state.stats` (build path ~15625) — so failed capture is both un-graded and un-tracked. When STT *does* return text the scorer `_voiceScoreJa` (5533) is deliberately generous ("close" counts correct). Session completion grades every covered word `good`/`again` into SM-2 (~16493). So STT reliability directly determines whether the app's data is real.

So the real problem is **not "tune Web Speech"** — it is **decide the durable STT architecture for the core loop**: which engine is primary, what the fallback is, how to keep hands-free flow snappy despite network STT, how a no-key/offline user is handled, and how the user supplies a key gracefully — without regressing the path that today at least *sometimes* works. Kana-only output invariant applies [[feedback_no_kanji]]; single-file vanilla-JS PWA, no backend; persistence under `state.settings` or own LS key (not bare `state.*`); primary device is Pixel 9 Pro / Android Chrome [[user_device_pixel_9_pro]].

## Stacked REVISED callouts

None binding. v7.98 shipped the `continuous=false` + fresh-recognizer + double-fire-guard change to the Web Speech path; this delve must treat the Web Speech path as the *fallback* to reconcile, and may recommend reverting the `continuous` change.

## Primary

**Mode:** Opus-only (design/decision/prose → an implementation-ready spec a later `/hydra-forge` builds).

### Investigation tasks

Each ends in a **final lock**, not a discussion.

1. **The core decision — which engine is primary? — LOCK one.**
   - **A — Whisper-primary, Web Speech fallback** (use Whisper whenever a key + network exist; fall back to Web Speech offline/no-key).
   - **B — Whisper-only** (require a key for voice; Web Speech retired).
   - **C — Keep Web Speech primary, fix it harder** (per-device tuning, restart loops) — the do-Whisper-isn't-worth-it case.
   - **D — Hybrid/adaptive** (auto-detect failure and switch).
   Lock one. State explicitly what happens to the current Web Speech path and the v7.98 `continuous` change.

2. **Latency vs the hands-free flow — LOCK.** Whisper adds a ~1–2s network round-trip per answer. Decide how the loop stays usable: streaming vs record-then-send, parallelising STT with the next prompt's TTS, a "thinking" cue, chunk sizing, timeout/abort behaviour. The binding constraint: the rapid audio-led rhythm [[feedback_japanese_trainer_spam_mode_template]] must survive.

3. **No-key / offline / cost UX — LOCK.** What a brand-new user (no OpenAI key) experiences; how/where they enter a key (the existing Settings card — keep/improve); what happens offline; whether cost is surfaced; whether any free fallback remains and how good it has to be.

4. **Reliability instrumentation — LOCK (so we stop debugging blind).** This whole problem was invisible because failures are silent. Decide a lightweight, on-device signal the user (and future debugging) can read — e.g. surfacing `voice_err` codes / nostt-rate, a tiny diagnostics readout, or an export — so "is STT working?" is answerable without a tethered device.

5. **Verdict + SRS integrity under the chosen engine — LOCK.** Confirm the `nostt`→no-record and generous-scorer behaviour still makes sense under Whisper (which returns full transcripts, not alternatives); define how Whisper output feeds `_voiceScoreJa` / `recordAttempt` / `smGrade` correctly, normalised through `_kataToHira`/`_stripKanji` to a real wordId.

### Output

Primary doc: `docs/delve-cycles/3-stt-architecture.md`

Sections (in order):
1. Charter — scope + ground truth (the two engines, the failing path, the SRS coupling)
2. Method — Opus-only + adversary panel + synthesis ownership
3. Core decision: primary engine (task 1)
4. Latency mitigation for hands-free flow (task 2)
5. No-key / offline / cost UX (task 3)
6. Reliability instrumentation (task 4)
7. Verdict + SRS integrity (task 5)
8. Implementation sketch — function names, `state.settings` shape, the `_buildVoiceListen` dispatch change, where it slots into `index.html`
9. Decisions reached (locks)
10. Open questions still open
11. Foundation doc updates
12. ADR proposals (framed; filed PENDING in synthesis)

## Adversaries

### Adversary 1: devils-advocate (LEAD)
**Read:** primary doc, charter, the cited `index.html` anchors (`_buildVoiceListen` 15531, `whisperAvailable` 5633, `_whisperVoiceListen` 5818, `getRecognition`/`startVoice` 5417/5435, `_voiceScoreJa` 5533).
**Audit:**
1. **Cost/latency attack:** is forcing a paid, ~1–2s-per-answer network call onto the app's *highest-frequency* action actually acceptable, or does it quietly kill the rapid hands-free rhythm that is the whole point?
2. Does requiring an OpenAI key gate the core feature behind a barrier a beginner won't cross — making the app worse for the median user even if better for this one?
3. Is Web Speech *really* unsalvageable, or was it never given the standard Android fix (fresh instance + bounded restart-on-premature-end + a real warmup)? Make the case that C (fix Web Speech) beats Whisper.
4. Does the design assume network/key availability that won't always hold (commute, no signal)? What's the failure UX then?
**Output:** `docs/delve-cycles/3-stt-architecture-devils-advocate.md` — ≤400 lines, findings w/ file:line citations.

### Adversary 2: code-reviewer
**Read:** primary doc + `_buildVoiceListen`/`_whisperVoiceListen`/`_buildVoiceListenWebSpeech`, `startVoice`, DEFAULT_SETTINGS, save/load, the verdict→`recordAttempt`/`smGrade` chain.
**Audit:**
1. Does the engine-dispatch change fit cleanly in `_buildVoiceListen`, or does it tangle the other voice callers (Recall, おしゃべり, Vocab Blitz EN direction, coach)? All of them go through `startVoice` — does the architecture cover them or just build mode?
2. Whisper path correctness: `MediaRecorder` lifecycle on Android Chrome, mime/codec, abort/timeout, the hallucination filter, and that its output normalises to a real wordId before any SRS write.
3. New persistent state under `state.settings`/own LS key (not bare `state.*`). Key handling — is `openaiKey` ever logged or committed?
4. Does the v7.98 `continuous`/fresh-recognizer change help or hurt the *fallback*, and should it be reverted?
**Output:** `docs/delve-cycles/3-stt-architecture-code-review.md` — ≤400 lines.

### Adversary 3: qa-tester
**Read:** primary doc.
**Audit:**
1. Cold start, no key: does the user get *any* working voice, or a dead core feature? Walk it.
2. Network edge: key present but offline / request times out / rate-limited — does the loop hang, skip, or fall back? Walk each.
3. Latency feel: with a ~1–2s Whisper delay, does the hands-free rhythm survive a 30-word session, or does it feel broken?
4. Mixed device: does the design degrade sanely on a desktop / a non-Pixel / a browser without `MediaRecorder`?
5. Does failed capture stop silently corrupting/under-recording SRS data the way `nostt` does today?
**Output:** `docs/delve-cycles/3-stt-architecture-qa-design.md` — ≤400 lines.

## Synthesis

`## Synthesis (Round 1 close — Delve 3)` appended to the primary doc. Verify every adversary citation against `index.html`; disposition each finding (adopt / contest / defer); lock the final design.
Foundation doc updates: reflect the STT-architecture lock into project memory [[project_japanese_trainer_scope_decision]] / [[feedback_verify_render_not_cache]].
ADR proposals likely (filed PENDING under `docs/decisions-pending/`): "STT primary-engine architecture & fallback", possibly "Whisper latency/flow contract for the hands-free loop".

## Definition of done
- [ ] Primary doc + all sections incl. an implementation sketch a forge run can build from
- [ ] Explicit lock on the primary engine + fate of the Web Speech path / v7.98 change
- [ ] Latency mitigation defined so hands-free rhythm survives
- [ ] No-key / offline / cost UX defined
- [ ] Reliability instrumentation defined (stop debugging blind)
- [ ] 3 adversary docs filed
- [ ] Synthesis appended with citation verification
- [ ] ADR proposals filed pending
- [ ] User signoff

## Files this delve touches
- `docs/delve-cycles/3-stt-architecture.md` (+ 3 adversary docs) — new
- `docs/decisions-pending/*` — new ADR proposals
- No `index.html` changes in this delve (design only; build is a later `/hydra-forge`)
