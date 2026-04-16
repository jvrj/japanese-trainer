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

## v4.21 (shipped — Blitz auto-grading)

Vocab Blitz now auto-grades from `checkAnswer()` instead of asking the user to self-rate. One less decision per card; feedback is the whole UX.

- Submit → `checkAnswer()` verdict is authoritative. Match → SM-2 `good`. No match → SM-2 `again`. Easy removed from Blitz (still lives in `smGrade` for Form Drills).
- Feedback card: green border + "Correct" on match, red border + "Wrong" + correct answer on miss. Auto-advances after 900ms correct / 2000ms wrong. `Continue ↵` button focuses immediately so Enter/Space advances early.
- `blitzReveal()` ("I don't know") applies `again` immediately and enters the same feedback state.
- Removed: `blitzGrade()`, the three-button grade row, the per-grade interval previews (`dryAgain/Good/Easy`), the 1/2/3 shortcut for Blitz. Form Drill keeps its self-graded buttons and 1/2/3 shortcut — conjugation has real synonym/nuance cases that auto-match can't judge.
- Advance timer is a module-level `blitzAdvanceTimer` so it survives `save()`-time JSON without polluting state. Cleared on every entry/exit point (advance, skip, end).
- SW cache `jp-trainer-v420` → `jp-trainer-v421`.

### Decision — why auto-grade Blitz but not Form Drills
Julius's own read: the self-grade buttons were asking him to repeat a judgment the auto-match already made. For EN/JP recall in Blitz, `checkAnswer()` is objective enough (exact + homograph siblings + Levenshtein-1 + subset). For conjugation in Form Drills, strict `normJP()` is less forgiving and the learner's self-read still matters (e.g. group-classification errors are a different signal than pure form errors). Different problems, different UX.

## v4.20 (shipped — Vocab Blitz + Form Drills)

Two new core features. Home restructured so Vocab Blitz is the primary entry point; Form Drills sit under a Grammar section; burst and pattern packs demoted to the Practice row.

### Vocab Blitz (SRS recall)
- SM-2 scheduler on `state.stats[wordId]`. New fields: `smInterval` (minutes), `ease` (default 2.5, floor 1.3), `reviewCount`, `correctCount`, `wrongCount`, `lastReviewed`, `smNext`. Lazy-migrated via `ensureSm()`; old SRS-lite fields (`srsInterval`, `nextReview`) are left in place so the burst scheduler keeps working.
- Rating rules: **Again** → interval = 1 day, ease −0.2 (floor 1.3); **Good** → interval × ease; **Easy** → interval × ease × 1.3, ease +0.15. New cards start at 10 min. Cap 1 year.
- Session shape = default 20 reviews (due) + 10 new (unseen), configurable in settings. Scheduler picks most-overdue first, fills with unseen, shuffles.
- JP → EN default with per-session toggle. User types, then self-grades via Again/Good/Easy. Typed input auto-checked with existing `checkAnswer()` for a green/orange "match" badge — but the rating is always the user's call (follows Anki). Each button shows the preview interval it will produce.
- Blitz attempts are mirrored into `stats[wordId].attempts[]` (`{blitz:true}` tag) so the mastery ladder and dashboard stats stay consistent.
- Keyboard: Enter submits, then 1 / 2 / 3 grade.

### Form Drills (per-form per-verb SRS)
- Sub-sections per verb form: `ます / ました / ません / ましょう / ませんか / たい / て / た / ている / ない`.
- Eligibility: only verbs whose Vocab Blitz `smInterval ≥ 7 days` show up. Keeps form drills from surfacing verbs you haven't learned the meaning of yet.
- Independent SRS per (word, form) pair in `state.formStats[wordId][formId]` — same SM-2 shape. Does NOT touch Vocab Blitz stats, so drilling て-form on たべる can't demote たべる's vocab interval.
- Drill: dictionary form shown, user types conjugated form in hiragana, strict `normJP()` compare for the auto-match badge, same Again/Good/Easy self-grade. Group classification (1/2/3) surfaced on the result screen so the user learns to identify godan / ichidan / irregular.
- Conjugation helpers (new): `aStem`, `toNai` (with ある→ない exception), `toMashou`, `toMasenka`, `toTe` (full godan branching + いく→いって exception), `toTa`, `toTeiru`, `verbGroupInfo`. Existing helpers (`iStem`, `toMasu`, `toMashita`, `toMasen`, `toTai`) reused.

### Data / storage
- New LS key `jp4_form_stats`. Round-trips through `exportJSON` / `handleImport` (merge strategy: existing entries kept). Cleared by Reset All.
- SW cache `jp-trainer-v419` → `jp-trainer-v420`.

### Decisions
- Kept the existing SRS-lite fields side-by-side with SM-2. The two schedulers operate on different screens (burst uses SRS-lite, Vocab Blitz uses SM-2), so no collision. Migration is lazy via `ensureSm()`.
- Self-grade in both directions for Vocab Blitz (not just JP→EN). Consistent UX; `checkAnswer()` is still used for the informational badge.
- Form Drills do NOT feed `stats[wordId].attempts[]`. Keeps Vocab Blitz's SRS clean — conjugation struggle is a different signal than meaning-recall struggle.
- Kept burst + pattern packs reachable from Home (Practice section). Both still work and fill a different niche than SRS.

## v4.12 (shipped — seamless/smooth polish)

- **Fade transitions between cards** (150ms opacity) — avoid HTML-flash feel when burst shuffles to the next word.
- **Stable button positions across states.** Reveal and Got-it/Missed-it share the same slot; Submit and feedback share the same slot. No button jumping between renders.
- **Consistent card frame / no reflow.** Feedback renders *inside* the drill card, not as a new card below it — card height doesn't jump.
- **Feedback linger: 1000ms correct / 2200ms wrong.** Long enough to actually read; Enter or tap dismisses instantly.
- **Remove training wheels panel entirely.** Redundant — toggling direction to EN→JP shows the English, and Reveal already covers the "I forgot" case. Cuts visual noise at the top of drill. Drop `trainingWheels` setting, `shouldShowWheels`, `getWheelsWords`, `cycleWheels`, `renderWheels` UI.

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
