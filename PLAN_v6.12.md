# Isshin v6.12 — integration spine + content expansion

*Replaces the prior "Build Mode honesty pass" plan, which over-pivoted to tap-to-reveal and missed the real complaints.*

## What Julius actually wants

1. Vocab list (Library / what I'm learning) **automatically integrated** into Build Mode lessons
2. **Build Mode is lackluster** — "fruit, apple, I like this/that" — content domain ceiling
3. Sequential build-up: words I learned in Blitz → drilled in Build Mode
4. Cross-mode revisit: see learned words again after a day / few days / week
5. **"Mastered this" button** — graduate a word out
6. Vocab Blitz "**NO recalling**" — answer 10 words 3 times each, never see them again. Cumulative across sessions = zero recall

(#6 confirmed: SM-2 multiplies interval by ease (~2.5) per correct grade — `smGrade` at index.html:1713. New card 10m → 25m → 62m → days, exit session permanently after 3 corrects. Compounding cohort effect = real bug.)

## Already built — just not wired

- `state.settings.masteredWords / suspendedWords / focusWords` — exist
- `getDrillableWords()` at **index.html:1782** — Vocab Blitz, Library, Sentence Blitz already filter
- `libraryWordStatus()` at **1790** — single source of truth
- `libraryMasterToggle()` at **1839**
- Form Drills (per-verb-form SM-2) at **1742, 2419, 2919** — exists, gate removed v4.28, but Julius has never used it (discoverability problem, not feature gap)
- SM-2 itself — exists; ramps too fast for new vocab

---

## Ship list (in implementation order — smallest blast radius first)

### Item 1 — `_aiAttempted` reset (kept from prior plan)
**Bug.** `_aiAttempted = true` is set eagerly at **index.html:5865** before the network call at 5915. Any STT/network glitch permanently scripts the step.

**Fix.**
- Remove eager set at 5865.
- Set `step._aiAttempted = true` only on successful Claude response in `_buildAiQaSendToClaude` (5915 success branch).
- STT failure at `_buildAiQaListen` (5877) does not set the flag.
- On lesson resume, walk steps and reset `_aiAttempted` / `_aiMode` for non-completed steps.
- Add `_aiFailCount` cap (3 retries) so it can't loop forever.

~15 LOC. Ship first.

---

### Item 2 — Anki-style learning steps for new Vocab Blitz cards (THE "no recalling" fix)

**Problem.** `smGrade` at **1697** does `st.smInterval = round(st.smInterval * st.ease)` on every `'good'`. New card seeded at `SM_BASE_MIN` (10 min) × ease 2.5 → 25m → 62m → 156m → days. Three corrects and the word's gone. Each new cohort gets identical treatment, so prior cohorts never resurface. Julius's "zero recall" verdict is mathematically accurate.

**Fix.** Pre-graduation learning steps. New card stays in tight rotation `[1m, 5m, 15m]` for ~3 successful pulls before SM-2 takes over. Forces actual recall under increasing delay.

**Targets.**
- Add constant `SM_LEARNING_STEPS_MIN = [1, 5, 15]` near **1672**.
- `smDefault()` at **1677**: add `learningStepIdx: 0`, `inLearning: true`.
- `ensureSm()` at **1685**: lazy-init. **Migration safety: only set `inLearning: true` if `correctCount === 0`** so existing learners aren't disrupted mid-flow.
- `smGrade()` at **1697**: branch on `st.inLearning`.
  - `'again'` → reset `learningStepIdx = 0`, `smInterval = SM_LEARNING_STEPS_MIN[0]`.
  - `'good'` → advance index. If past last step: `inLearning = false`, seed `smInterval = SM_BASE_MIN * st.ease` and let normal SM-2 take over from next grade.
  - `'easy'` → exit learning immediately, normal SM-2.
- `smIntervalLabel()` at **1723**: already handles minutes; verify `1` renders as "1 min" not "1.0 min".
- `blitzPickNext` at **2581**: in-learning words should be eligible regardless of `smNext`, since their interval is sub-session.
- `buildBlitzPool` (referenced at **2545**, find definition): include all `inLearning` words alongside due ones.

~40 LOC. Highest user-felt impact of any item.

---

### Item 3 — Non-food template expansion (the OTHER lackluster fix)

**Problem.** Templates are a kitchen.
- `BUILD_TEMPLATES` (5155–5167): 8 of 11 food/objects.
- `BUILD_COMPLEX_TEMPLATES` (5175–5184): all 8 food/drink.
- `BUILD_VARIATION_GROUPS`: 5 of 5 food (per DA).
- `BUILD_QA_TEMPLATES`: 6 of 6 food (per DA).

Recency dedup alone won't break the "I'm at a restaurant again" feeling — the entire universe is restaurants.

**Fix.** Add ~20 non-food templates spanning:
- **Time** — `いま なんじ ですか` / `あした なにを しますか`
- **Weather** — `きょうは あつい` / `あめが ふっています`
- **Location-of-self** — `いま {P}に います`
- **Daily routine** — `まいにち {V}`
- **Greetings / closings** — `おはよう` / `また あした`
- **Simple emotions / states** — `つかれた` / `さびしい` / `うれしい`
- **Transit / distance** — `{P}まで どのくらい かかりますか`
- **People / family** — `{F}の {N}` (my friend's car, etc.)

**Targets.**
- New blocks `BUILD_TIME_TEMPLATES`, `BUILD_WEATHER_TEMPLATES`, `BUILD_GREETING_TEMPLATES` near **5155**, OR extend `BUILD_TEMPLATES` array directly with new `slotThemes`.
- Verify deck has vocab for new themes (`time`, `weather`, `places`, `family`) — Julius's deck includes these (per existing `slotThemes` references).
- Add ~3 non-food `BUILD_QA_TEMPLATES` and ~2 non-food `BUILD_VARIATION_GROUPS`.

~80 lines pure data, low risk.

---

### Item 4 — Build Mode reads Library status (integration spine)

**Problem.** Build Mode picks any deck noun (`eligibleForPair` at **5532**, `buildPoolForCfg`, `buildGenerateLesson` at **5521**). Ignores `masteredWords`, `suspendedWords`, `focusWords`. Julius's complaint: "Build Mode and Vocab are disconnected."

**Fix.**
- `eligibleForPair` (**5532**) and `buildPoolForCfg` (find via grep): filter out `masteredWords` and `suspendedWords`.
- `buildPickRandom` / seed logic (**5559**): if any eligible word is in `focusWords`, pick from focused first; fall through to full pool only if focused subset < 3.
- **Callback selection** (**5566–5612 area**): sort previously-introduced words by `state.stats[w.id].smNext` ascending. Words about to come due in Vocab Blitz get pulled into today's Build Mode lesson as callbacks. **This is the cross-mode revisit (#4) — using existing SM-2, not a new system.**
- Item 2's `inLearning` words also get callback priority (they need recall pressure most).

~40 LOC.

---

### Item 5 — One-tap "mastered" button in Vocab Blitz post-answer

**Problem.** Library has the toggle but it's 3+ taps away. Julius wants it inline.

**Fix.** After correct answer, next to "Continue ↵" button at **index.html:2856**, add small secondary button: `Master ★`. Tap → `libraryMasterToggle(w.id)` → advance. Word vanishes from future sessions (already filtered via `getDrillableWords` at 1786, and via Item 4 in Build Mode).

Optional: also surface in the wrong-answer path's continue button — but only after the user has typed the correct answer (don't let "I missed this" become "actually I'm done with it" with one tap).

~15 LOC + 5 LOC CSS.

---

### Item 6 — Surface Form Drills properly (discoverability)

**Problem.** Home at **6894–6898** says "Conjugate verbs you've mastered in Vocab Blitz." This copy is outdated (gate removed in v4.28) AND Julius has never tapped it. Form Drills *is* the "ace one verb across forms" mode he asked for (#7).

**Fix.**
- Reword card to: "Drill ます / ました / て / た / ない / たい / ている — independent SRS per (verb × form)."
- Add small "X verbs · Y due" stat pulled from `state.formStats`.
- Move Grammar card above Practice section (Particle drills); demote Particles below.
- Consider renaming "Grammar" → "Verbs" — clearer entry point.

~20 LOC.

---

## Cut / deferred

| Item | Disposition | Reason |
|---|---|---|
| Tap-to-reveal AI-off flow (prior Item 1) | Defer v6.13+ | Content expansion (Item 3) addresses bigger felt complaint; tap-to-reveal is correct but expensive |
| Recency dedup (prior Item 2) | Re-evaluate end of v6.12 | Probably unnecessary once template count doubles |
| Similar-words discrimination mode (Julius #6) | Defer | If built, do no-API 3-way multiple choice version |
| Sentence-correction with rationale (Julius #9) | Defer or kill | "With why + alternatives" is Claude-API-only — re-enters v6.11 key-walled fragility |
| FSRS / streak surface | Defer | Item 2's learning steps gives most of the felt FSRS benefit |
| New "form mastery" mode (Julius #7) | Already exists | Item 6 surfaces existing Form Drills |

## Risk register

| Risk | Mitigation |
|---|---|
| Learning-steps migration breaks existing learners | `ensureSm` sets `inLearning: true` ONLY when `correctCount === 0` |
| New template themes lack deck vocab | `eligibleForPair` returns 0 → falls through to next template (existing behavior) |
| Mastered button fat-finger | Smaller secondary button; only show on correct path; status visible in header |
| Form Drills promotion adds home clutter | Demote Particles below; Particles is less central than verb conjugation |
| Learning-steps + SM-2 callback priority cause same word to appear too often | Cap "in-learning OR due-soon" callbacks at 1–2 per Build Mode lesson |

## Ship checklist

1. Item 1 (`_aiAttempted`)
2. Item 2 (learning steps) — ship; observe a day
3. Item 5 (mastered button) — pure UI add
4. Item 4 (Build Mode reads Library / SM-2)
5. Item 3 (templates) — bulk content drop
6. Item 6 (Form Drills surface)
7. Bump `APP_VERSION` to `6.12`, bump `CACHE_NAME` in `sw.js` lockstep
8. Smoke tests:
   - New card in Vocab Blitz: 1m → 5m → 15m → graduates to SM-2 (~6.25 min). Same word should reappear within session.
   - Master button: word vanishes from next session.
   - Build Mode: focused words preferred, mastered words excluded, in-learning words appear as callbacks.
   - Build Mode lesson: at least one non-food template across a 6-step sequence.
   - Form Drills: visible on home with due count.
9. Tag, commit, push.
