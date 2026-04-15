# Japanese Trainer — Design & Roadmap

**Live:** https://jvrj.github.io/japanese-trainer/
**Goal:** Conversational fluency with Japanese people (not JLPT).

## Learning philosophy

Active recall is the spine. Wrap it in:
- **Input** — hear natives (TTS + native clips eventually)
- **Output** — speak answers (voice input with feedback)
- **Feedback** — correctness + JAPANEASY teacher review on flagged content

All Japanese in hiragana/katakana for now. No kanji study yet (defer until teacher says otherwise).

## v3 (shipped)

447 hand-collected words, single-word drill, capture-to-deck, add-word. Tagged `v3` in git.

## v4 (current build — mega drop)

### Safety
- Export/Import JSON (backup deck, stats, notes)
- SW cache-bust + network-first for `index.html`
- Schema `jp4_*` with v3→v4 migration
- Input sanitization
- Git tag every deploy

### Mastery & correctness
- WaniKani-style ladder: New → Learning → Apprentice → Guru → Master → Burned
- Recency-weighted (last 10 attempts), not lifetime
- Voice attempts weigh 1.5× (production > recognition)
- Missing at Guru drops to Apprentice (ghost review)
- Fisher-Yates shuffle
- Tighter `chk()` — no more "a" matching "apple"

### Audio
- **TTS** button on every card (ja-JP)
- **Voice input** (browser SpeechRecognition, ja-JP) — prominent on every card
- Fuzzy hiragana match + confidence scoring
- Graceful hide if unsupported

### Content
- Keep single-word drill (hammer-it-in use case)
- ~400-word curated N5 pack (opt-in)
- Tags: POS, theme, register, JLPT, custom
- Multi-tag filter: "N5 + verbs + weakest 20"
- Study modes: random / by tag / weakest / newly added
- Conversation Mode — 8 scenarios (café, station, self-intro, doctor, shopping, exchange, class, friend plans)
- Sentence Mode — 25 templates + 30 curated examples
- Casual / polite / formal register toggle

### Learning mechanics
- Tiered concept hints (category → scenario → opposite → emoji)
- User-writable hint per word
- Streak counter (low-floor, streak-freeze)
- "Unverified" flag on AI content for teacher review
- **Smart wrong-answer feedback** — if typed answer is a real word in our deck, show its meaning ("you wrote X which means Y — answer was Z"). Turns mistakes into double-learning moments.

### UX
- Notes folder (floating 💭 button, export/import)
- Event log for instrumentation (v4.5 will analyze)

## v4.11 (shipped — real-use feedback from v4.10)

- **Self-grade on JP→EN cards** — strict English matching gives false negatives on synonyms (e.g. ちょっと待って → "wait a moment" rejects "wait a second"). Show card, tap "got it / missed it" (Anki/WaniKani style). Keep strict match for EN→JP production, where precision matters. No per-word alt-answer lists to maintain.

- **Burst sessions replace quick/deep time modes.** Time-based modes create clock anxiety without enforcing recall. Replace with:
  - Default burst = **5 new words**. Pass criterion: each word correct **2× in the burst**, shuffled between attempts (once = luck, twice = sticking).
  - Next burst = **5 new + 3 review**. Review picks come from the mastery ladder (weakest Apprentice/Learning from recent bursts), not from a separate burst-history system — avoids two competing "what to show next" mechanisms.
  - Burst size picker (3/5/10) deferred to v4.12; start hardcoded at 5.
  - **Remove** quick-mode / deep-mode time toggles entirely.

- **Sentence mode → active EN→JP drill.** Currently the screen just displays a JP sentence + Listen/Speak buttons with no prompt or input, so it's unclear what to do. Reshape: show English prompt → user types Japanese in hiragana → Enter submits → flash feedback → auto-advance. Generated sentences are templated (one intended answer per prompt), so strict match is fair. Hand-curated examples stay as reference below. This pulls EN→JP production forward from v4.5 specifically for Sentence mode.

- **Full functional audit — findings from v4.10 static pass:**
  - **`esc()` HTML-escape bug in inline `onclick`.** `esc()` at index.html:1053 HTML-escapes (`'` → `&#39;`). Browser decodes entities in attribute values before JS parses, so `onclick="speakJP('${esc(x)}')"` with any apostrophe in `x` produces a syntax error → handler silently dies. Affected call sites: 1646, 1647, 1648, 1669, 1694, 1829, 1882, 1897, 1927, 2124, 2134, 2229. **Fix:** add `jsEsc(s)` that backslash-escapes `\`, `'`, `"`, newlines — use it for JS-string interpolation; keep `esc()` only for HTML text content. Better long-term fix: switch hot paths to `data-*` attributes + one delegated `click` listener.
  - **`render()` not exported to `window`.** Called inline at 1635 and 1886. Usually works in classic scripts (top-level function declarations land on window), but add `window.render = render` defensively — costs nothing.
  - **TTS root-cause hypotheses for "nothing plays":**
    1. Unconditional `speechSynthesis.cancel()` at 1376 races with the following `.speak()` on iOS Safari — only call `cancel()` when `speechSynthesis.speaking` is true.
    2. Voice list loads async; first speak may fire before `getVoices()` populates. Add one-time `onvoiceschanged` wait with a timeout fallback.
    3. iOS mute switch silently drops TTS audio. Detect: if `onstart` fires but no `onend` within N×expected-duration, or if neither fires after speak(), show a "Check your mute switch / volume" banner.
    4. Some Android Chrome builds require `u.voice` explicitly set to a loaded voice; falling back to default sometimes no-ops. Pick any ja voice if present, else any voice, else warn.
  - **Per-screen pass/fail:**
    - Home: handlers OK. "Quick 5-min / Deep 20-min" buttons being removed this version (see burst-session item).
    - Drill: handlers OK aside from the `esc()` risk on hints containing English punctuation.
    - Convo / ConvoDetail: `speakJP` called with `esc(t.jp)` and `esc(s.jp)` — hiragana-safe but scenario notes with English apostrophes would break if ever passed.
    - Sentence: Listen/Speak dead — see esc() bug + TTS root cause. Plus no input UX — see Sentence reshape item.
    - Particles: Listen button passes `d.jp.replace('___',d.blank)` through `esc()` — same bug class.
    - Settings: filter + data buttons OK.
    - Notes modal: Save/Delete/Close handlers OK.

- **Auto-advance after submit — zero extra taps.** Currently Next Card requires a second tap in an awkward spot. Flow: type → Enter submits → feedback flashes briefly (~800ms correct, ~1500ms incorrect so you can read it) → next card loads automatically. No second keypress, no screen tap. Input refocuses on the new card.

## v4.5 (after real-use feedback)

- SRS-lite (lastSeen + interval)
- Particle drills (は/が/を/に/で/へ)
- Fill-in-blank mode
- EN→JP production mode
- Example sentence per word
- Usage log dashboard + weekly review
- Quick-mode (5 min) / Deep-mode toggle
- Swipe gestures
- Variant badges ("also: なぜ, どうして")
- LLM feedback layer on spoken answers
- Whisper/Azure voice upgrade (pitch accent, phoneme scoring)
- Remaining ~400 N5 words

## Deferred (only if teacher confirms need)

Kanji, pitch accent obsession, counters, full verb conjugation tables.

## Research-validated direction

From r/LearnJapanese, app reviews, language-acquisition research:
- **Biggest gap in the market:** speaking-with-feedback. Voice = our differentiator.
- **Steal:** WaniKani mastery ladder, Bunpro ghost reviews, Pimsleur audio→speak→confirm, Memrise "learn from locals."
- **Avoid:** leaderboards, high-floor streaks, Duolingo guilt UX, Anki setup tax.

## Deploy checklist

1. `git tag v<N>` before changes
2. Bump `CACHE_NAME` in sw.js (e.g. `jp-trainer-v4`)
3. Commit, push with PAT
4. Verify live at jvrj.github.io/japanese-trainer
5. Regression-test 5 golden flows (see `TEST_CHECKLIST.md` — to be added)
