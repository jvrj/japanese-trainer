# Isshin v6.12 — Build Mode honesty pass

**Goal:** Make the default (AI-off) Build Mode flow demand active output, so the marketing claim of "production pressure" matches the actual UX. Plus: stop the 11-template content ceiling from collapsing into rote memorization, and stop one bad mic moment from permanently scripting the AI path.

**Out of scope (defer to v6.13+):** FSRS scheduler, streak surface, JP voice availability check, two-line parser hardening, kanji guard in Claude output, full TTS↔STT race fix on Android.

---

## Item 1 — Production gate on the AI-off flow (the marquee fix)

### Problem
With `buildAutoAdvance` on (default) and `buildAiQa` off (default and only path for shared/keyless users), every Build step is karaoke: TTS plays English → `setTimeout` for `thinkMs` → JP auto-reveals → TTS plays JP → next step. No tap. No input. No scoring. `_buildPaceFactor` actively *shrinks* the think window for known words (index.html:6108–6109), so mastery is rewarded with *less* time to produce. This is weaker than Anki, which at least requires a self-grade tap.

### Fix
Replace the `setTimeout`-to-reveal with **tap-to-reveal** for any step type that asks for production. `introduce` stays passive (it's the exposure phase). New phase name: `'produce'`. New setting: `buildRequireTap` (default `true`).

### Targets
- **`index.html:6119–6124`** — `onEnDone` in `buildAutoplayStep`. Currently schedules `buildAutoReveal()` after `thinkMs`. Change: when `state.settings.buildRequireTap !== false` AND step.type ∈ `{recall, callback, build, substitute, variation, qa-non-AI}`, set phase to `'produce'` with no timer, render a "Reveal" button (large, full-width, primary color), and wait for tap. On tap → call existing `buildAutoReveal()` unchanged.
- **`index.html:6113`** — `buildAutoplayStep`: keep auto-revealing only for `introduce` and the AI-QA branch (which has its own STT-driven gate already).
- **`_buildSetPhase`** — add `'produce'` as a recognized phase (mirrors `'think'` styling but without the countdown). Find call site and the phase enum (search `_buildSetPhase`).
- **Settings UI (~index.html:7360)** — add a toggle "Require tap to reveal" under the existing Build Mode section, near the Think time slider. When off, restore old auto-reveal behavior (escape hatch for the few users who actually wanted karaoke).
- **`_buildPaceFactor` (index.html:6103)** — only used for the `linger` phase now (post-reveal pause), not the produce phase. Leave the function alone, just stop calling it on the produce path. Verify `_buildScheduleLinger` still uses it at line 6290.

### Edge cases
- `buildAutoOn()` off (manual mode) — already user-driven; this change is a no-op there.
- `_paused` mid-step — tap button must be hidden; resume restores it.
- Keyboard: Space or Enter triggers reveal. Document in card hint text.

### Out of this fix (deliberate)
- Not adding STT-for-everyone. DA flagged the STT path as fragile (race conditions, hiragana-only unverified, `_aiAttempted` permanent downgrade — see Item 3). Reusing a buggy mic path to fix a different problem compounds risk. Tap is universal, reliable, and zero-state.
- "Say it" voice option stays AI-mode-only. Once the STT path is hardened (v6.13), revisit offering it as an opt-in upgrade for keyless users.

---

## Item 2 — Recency dedup for variation/QA templates

### Problem
5 variation groups × 6 QA templates = 11 templated items. Generators at index.html:5486, 5492, 5506, 5512 use bare `Math.random()` with no recency tracking. After ~3 sessions a learner has memorized the verbatim template (`{N}が ほしい`, etc.) — they're memorizing the phrase, not internalizing the pattern.

### Fix
Ring-buffer the last K picks per generator, persist on `state.buildMode` so it survives within a lesson, and persist to localStorage so it survives across lessons. Filter candidates by `not in recent` before random pick. If filtering yields empty, fall back to full pool (don't infinite-loop).

K = `Math.max(1, Math.floor(poolSize/2))` — for 5 variation groups → K=2 (avoid last 2); for 6 QA templates → K=3 (avoid last 3). Tunable.

### Targets
- **`index.html:5480–5498`** — `buildGenerateVariationStep`. Wrap both candidate lists (preferred-word path at 5484 and free path at 5491–5495) with recency filter. Push picked group id to `state.buildMode._recent.variations` after `_buildMakeVariationStep`.
- **`index.html:5500–5518`** — `buildGenerateQaStep`. Same shape: recency filter, push picked template id.
- **State init** — wherever `state.buildMode` is constructed for a new lesson, init `_recent = { variations: [], qas: [] }`. (Search `state.buildMode = ` to find the constructor site.)
- **Persistence** — new LS key `jp4_build_recent` with shape `{variations: [...], qas: [...]}`. Load on app start; save after each push. Cap each array at K to prevent unbounded growth across the lifetime of the install.
- **Export/import (whatever the existing export key list is)** — add `jp4_build_recent` to round-trip. Or: deliberately exclude it (it's ephemeral state, not user content) and document that decision here.

### Decision needed before implementing
LS persistence vs in-session-only? In-session is simpler and self-cleaning; LS persistence is what the DA actually called for ("3 sessions" implies cross-session memory). Default to LS persistence; revisit if it feels too punishing for short pools.

---

## Item 3 — Fix `_aiAttempted` permanent-downgrade bug

### Problem
`_aiAttempted` is set to `true` at index.html:5865, *before* the network call at line 5915 (`_buildAiQaSendToClaude`). Any transient failure — STT mishearing, network blip, mic glitch — flips the flag, and `_buildAiQaActive` at line 5856–5859 then permanently routes that step (and all future visits to it) through the scripted non-AI path. The user's premium feature silently dies, with no retry surface.

### Fix
Distinguish "we tried" from "we got a real turn." Only set `_aiAttempted = true` after a *successful* Claude response (in `_buildAiQaSendToClaude`'s success branch). On transport / STT / API failure, leave the flag false so the step retries on next visit. Reset on lesson pause/resume to be safe.

### Targets
- **`index.html:5865`** — remove unconditional `step._aiAttempted = true` at start of `_buildQaAiFlow`.
- **`index.html:5915` (`_buildAiQaSendToClaude`)** — set `step._aiAttempted = true` only after successful response parse. On any error path (network, parse, empty response), do not set.
- **`index.html:5877` (`_buildAiQaListen`)** — STT failure should NOT mark `_aiAttempted`; just fall through to scripted flow for *this* visit, leave flag false for next visit.
- **Lesson pause/resume** — wherever `_paused` flips back to false, walk `b.steps` and reset `_aiAttempted` and `_aiMode` on any non-completed step. (Search `_paused` to find resume site.)

### Edge cases
- Repeated failures could loop forever. Add an in-step counter `_aiFailCount`; after 3 consecutive failures within one visit, treat as permanent downgrade (current behavior). This is "honesty without infinite retry."

---

## Risk register

| Risk | Likelihood | Mitigation |
|---|---|---|
| Tap-to-reveal feels slower / users complain | Medium | Setting toggle to disable. "Auto-advance after tap" still works (the tap is the gate, not a new screen). |
| Recency filter empties pool on small decks | Low | Fallback to full pool when filtered=∅. |
| `_aiAttempted` reset on pause/resume causes re-listen on already-completed step | Low | Only reset for steps where `b.stepIdx` hasn't advanced past them. |
| Cross-session LS state corrupts | Low | Try/catch around load; default to empty arrays on parse failure. |

## Ship checklist
1. `git tag v6.11.1` (already shipped) — start fresh branch
2. Implement Item 3 first (tiny, high-leverage, unblocks honest measurement of AI mode)
3. Implement Item 2 (no UI, easy to verify)
4. Implement Item 1 (largest UI surface, save for last)
5. Bump `APP_VERSION` to `6.12` and `CACHE_NAME` in sw.js
6. Smoke-test golden path: new lesson → introduce → recall (tap) → variation (tap, different template than last lesson) → QA non-AI (tap) → QA AI (mic glitch — verify retry on next visit)
7. Tag, commit, push
