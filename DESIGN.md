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
