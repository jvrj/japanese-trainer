# Delve 11 — Progress that moves: the tracking system for the drill-first paid v1

**Primary investigation doc · Round 1 · 2026-08-06**
All line numbers reference `index.html` at the working tree this doc was written against (~24,331 lines, v8.49 era). Charter: `docs/delve-cycles/11-charter.md`.

---

## 1. Charter

Scope (restated from `11-charter.md`): the Home progress surface — "Your path to a
real conversation" (Stage C, v8.09) — is a bottleneck-min over three tracks
(producible words, verbs-in-all-forms, sentences drilled). Two of the three are fed
only by buried legacy modes, so the bar is **frozen at 0%** regardless of how much
the owner drills. The v8.46 Sentences drills write no progress credit at all, and
word credit is all-or-nothing at round completion. Owner's ask, verbatim: *"how is
the tracking going, it still shows 0% progress. What is with that? What can we do
here?"* The question to settle: **what should "progress" mean — and show — in a
paid app whose product IS the hands-free drill loop**, measured only by things that
loop actually produces.

Standing constraints cited from the charter's stacked REVISED callouts — every
decision below was made inside them:

- **REVISED 2026-08-03 (owner anchor, supersedes Delve 5's conversation-first
  Home):** the core drill app ships as the paid v1; AI conversation + avatar are
  BENCHED. The spine's "path to a real conversation" framing predates this.
- **REVISED per Delve 9 (locked, not re-openable):** $8.99/mo + ~$59.99/yr;
  judgment-free register — no urgency-guilt mechanics in any progress/streak copy.
- **LOCKED (owner, standing):** STT is never a grader (v8.03); the self-rating
  check-in 😬🙂💪 is the honest grade channel (v8.48); the full ~1702-word deck is
  the default, frontier lock opt-in (v8.35); EN-primary chrome (v8.22).

## 2. Method

- **Primary (this doc):** Opus-only single head. Investigated the live code before
  deciding: the whole PROGRESS block (L21440–22160), the spine model + self-test
  (L21649–21960), Home render (L22367–22452), Build-Mode credit paths
  (`buildOnComplete` L21021ff, `buildNextStep` L18968, `buildRestart` L18999,
  `recordAttempt` L7986, `smGrade` L3857), the v8.48 self-rating block
  (L21205–21292), the v8.46 sentence drills (L13590–13704), the due-first picker
  `_buildSpamPick` (L17462), streak plumbing (`updateStreak` L6407 + all seven
  call sites), and the v8.49 onboarding micro-drill (L22603–22645).
- **Adversary panel (next item, separate heads):** devils-advocate (LEAD — honesty
  of the metric, no conversation re-lead, gameability, judgment-free register),
  code (formula computability from flat `state.stats`, credit change points,
  migration safety), qa (every profile shape shows a live bar; exactly-once
  credit across interrupt/restart/back; no recurrence of the 0%-freeze). Each
  files its own `11-drill-progress-*.md`.
- **Synthesis (final item):** `## Synthesis (Round 1 close — Delve 11)` appended
  to THIS doc by the synthesis head, which alone owns foundation-doc patches
  (DO_THIS_NEXT.md) and ADR filing (docs/decisions-pending/, sequential
  numbering). Nothing in this primary item files ADRs or patches foundation docs.

### 2.1 Ground truth — why the bar is frozen (verified in code)

The freeze is fully explained; this is not speculative:

1. `_spineStagePct(stageN)` (L21718) is a **bottleneck-min** of three ratios
   against `_spineRequirement(stageN)` (L21704). For every stage ≥ 2 the
   requirement includes `verbsAllForms` and `sentences` (tiers indexed from
   `PROG_LADDERS`, L21628).
2. `verbsAllForms` (via `progVerbFormStats`, L21483) requires
   `state.formStats[w.id][form].smInterval >= FORM_BLITZ_MATURE_MIN` across all
   four core forms — `formStats` is written only by Form Drill / Form Blitz
   (`updateStreak`/`recordAttempt` call sites at L8895/L9448), both buried
   legacy modes.
3. `sentences` (via `progSentencesDrilled`, L21505) counts keys of
   `state.sentenceStats` + `state.phraseStats` — written only by Sentence Blitz
   (L14365) and Phrase Blitz (L14981), both buried legacy modes.
4. The v8.46 Sentences drills the owner actually uses (`sentGapPick` L13601,
   `sentCountPick` L13684) write **no store at all** — they mutate only the
   in-memory round object (`g.correct++`) and speak the sentence.
5. The core hands-free loop credits words **only** in `buildOnComplete`
   (L19021): one `smGrade(good|again)` + one `recordAttempt(mode:'lesson')` per
   word in `_meta.real_word_ids`, gated by `!l._completed`. An interrupted round
   writes nothing except `st.hears` (`_buildCountHear`, called from
   `buildNextStep` at L18972).
6. Bonus finding, load-bearing for §7: **the core loop never feeds the streak.**
   `updateStreak` (L6407) is called from exactly seven places — Vocab Blitz
   (L8001), Form Drill (L8895), Form Blitz (L9448), the Recall screen (L12796),
   Kana Blitz (L13986), Sentence Blitz (L14365), Phrase Blitz (L14981) — and
   never from any Build-Mode path. A user who does nothing but the core drill
   loop has a permanently-zero streak today.

So the owner drills the core loop daily; producible moves (completion credit
feeds `smGrade` → `correctCount` → `progIsSolid`, L21465), but the Home bar for
any stage ≥ 2 is `min(…, ~0, ~0)` = 0%, and the streak flame never lights.
Every one of these is addressed by a decision below.

---

## 3. Headline metric — FINAL: (A) words-that-stick milestone ladder

**Decision: option (A).** The one Home number is **"Words that stick"** — the
count of producible words — displayed against the existing milestone tiers
`[25, 75, 150, 300, 500]` (`PROG_LADDERS.producible.tiers`, L21629), with a
two-segment bar (solid = stuck, translucent = warming) toward the next tier.

**Rejected — (B) weighted composite:** this is the incumbent failure.
`progConversationalCore()` (L21615) IS a weighted composite
(`PROG_WEIGHTS` 0.5/0.3/0.2, L21449) over two tracks the core loop cannot feed
(§2.1 items 2–3). Any composite that keeps those tracks inherits the freeze; any
composite that drops them collapses to (A) with extra indirection. A composite
also fails the honesty test: a number derived from weights nobody can explain is
a vanity number by construction.

**Rejected — (C) daily-goal ring + words count:** measures effort, not learning
— a ring that fills by showing up re-introduces exactly the "did my time"
register the judgment-free spec avoids, and it requires new state
(goal target, day rollover) where (A) requires none. A daily surface is a
*retention* question, handled (and deferred) in §7.

### 3.1 The exact formula — existing fields only

Both segments are computable today from the flat `state.stats` shape with no new
writes (fields: `correctCount`, `wrongCount`, `attempts[]`, `smInterval` — all
already present):

```
// Segment 1 — STUCK (the headline number N). This is exactly the existing
// progWordsProducible() (L21481) over progStageCounts() (L21472):
stuck(w)   = libraryWordStatus(w) ∈ {mature, mastered}
             OR ( libraryWordStatus(w) === 'learning'
                  AND st.correctCount >= 3
                  AND st.correctCount / (st.correctCount + st.wrongCount) >= 0.7 )
                  // = progIsSolid(st), L21465, unchanged
N          = count of active words where stuck(w)

// Segment 2 — WARMING (visual life, never part of the headline number):
warming(w) = NOT stuck(w)
             AND st.attempts.some(a => a.correct)     // ≥1 real correct row
W          = count of active words where warming(w)

// Bar toward the next tier T = first tier in [25,75,150,300,500] with N < T:
solidFill  = min(1, N / T)
warmFill   = min(1, (N + W) / T)      // rendered translucent beyond solidFill
headline   = "N words that stick"  ·  sub-label "next milestone: T"
```

- The headline **number** is only ever N — warming is visual, sub-labelled
  ("+W warming up"), and cannot be mistaken for achievement. This is the honesty
  line the devils-advocate should probe: N requires 3 correct grades at ≥70%
  accuracy (`progIsSolid` unchanged), which passive idling cannot reach faster
  than the SRS write path allows, and which the 😬 self-rating (`smGrade 'again'`
  → `wrongCount++`, L21257→L3862) actively pushes back down through the
  accuracy ratio.
- No new tuning constants: tiers, solidity thresholds, and status boundaries are
  all pre-existing (`PROG_LADDERS`, `progIsSolid`, `libraryWordStatus`).

### 3.2 Fed 100% by the core loop — movement proof for a real usage profile

Under the defaults that actually ship — full ~1702-word deck (v8.35), due-first
picker `_buildSpamPick` (L17462: seen words sorted by `smNext` ascending, then
fresh words shuffled in), 24-word vocabSpam rounds (L17579) — with the §5
credit-at-recall-step decision in place:

- **Session 1 (day 1):** 24 words each get one credited recall pass →
  `correctCount 0→1` → W jumps 0→24. Bar shows warm fill ≈ 24/25 on tier 1.
  *Visible movement: first session, first minute of finishing.*
- **Sessions 2–3 (same evening or day 2):** `_buildSpamPick` re-serves the same
  words (their `smNext` is the soonest — learning steps are minutes-scale,
  L3880–3888) → each pass adds a correct → words cross `correctCount >= 3` →
  N starts climbing; each crossing converts translucent fill to solid fill.
- **Steady state (owner-like profile, 1–2 rounds/day):** every completed round
  moves W (new words drilled in) and/or N (words crossing solid) and/or converts
  warm→solid fill. There is no session shape under the due-first picker that
  leaves both N and W unchanged, because every completed round credits ≥1 word
  whose `correctCount`/`attempts` changes — the freeze mechanism (bottleneck on
  never-fed tracks) has no analogue here: **both segments read only
  `state.stats`, and the core loop writes `state.stats` every round.**
- **Brand-new post-onboarding user (micro-drill = 3 words):** the micro-drill
  runs the real Build engine with `real_word_ids` (L22638) → 3 × `correctCount=1`
  → N=0 but W=3 → the bar already shows a translucent 3/25 with copy like
  "3 words warming up". The §4 requirement ("the bar must already show life") is
  met by the formula, not by a special case.

Accuracy caveat, stated plainly for the adversaries: in hands-free autoplay the
default per-word grade is 'good' unless the user taps "Missed it" (L19044-based
`_missed` semantics preserved per-step in §5) — so N is "words that stick" under
exposure + self-honesty, not machine-verified recall. That is the v8.03 locked
posture (STT never grades); the honest counterweights are the Missed-it tap and
the v8.48 self-rating channel, both of which write `again` and drag the accuracy
ratio below 0.7 for genuinely shaky words, un-sticking them.

## 4. Home surface — FINAL: retire the spine, lead with "Words that stick"

**Decision:** the collapsed spine header (`_spineHeaderHtml`, L22112) is
**replaced**, not restyled. Piece by piece:

| Piece | Fate | Rationale |
|---|---|---|
| "Your path to a real conversation" H1 (L22134) | **Removed.** | Re-leads Home with the benched conversation product; explicitly superseded by the 2026-08-03 owner anchor. |
| Five kana stages (`SPINE_STAGES` L21692, rows L22118) | **Buried** — removed from Home and from the detail sheet. | Their AND-gates (`_spineRequirement`) sit on the two never-fed tracks; every stage ≥2 is unreachable from the core loop. Rebranding them onto producible tiers would duplicate the milestone ladder card that already exists (L22075). |
| Bottleneck bar (`_spineStagePct` fill, L22141) | **Replaced** by the §3 two-segment bar. | The freeze itself. |
| Detail sheet (expand → `renderProgress()`, L22148) | **Retargeted** — kept, one tap away, with §6 sheet edits. | The sheet's cards (deck stand, milestones, consistency, charts) are honest and already read `state.stats`. |
| `_spineModel()` + `_spineSelfTest()` (L21755/L21834) | **Dormant** — no longer called by Home; code and self-test left in place this ship. | Cheap reversibility; deleting is a follow-up cleanup, not a v1 gate. Advisory-only posture (ADR-003 non-locking) meant nothing else consumes it — verified: render-side consumers are `_spineHeaderHtml`/`renderProgress` only. |
| `placedStage` (router seed, L21769) | **Kept in state, unused by the new header.** | It's an onboarding record; destroying it forecloses future placement features for zero benefit. |

### Screen-by-screen (collapsed / expanded / brand-new)

**Collapsed (every Home load):** one card, EN-primary chrome (v8.22):

```
Words that stick                                   ›
128  ·  next milestone: 150
[███████████████░░▒▒▒░░░░]        ← solid = 128/150, translucent += warming
+9 warming up
```

No percentages, no stage names, no conversation framing. Judgment-free: the bar
only ever fills; there is no decay display, no "you lost X", no red state.

**Expanded (tap → same `.collapsible` convention, L22131):** the §6-edited
detail sheet — milestone ladder card (all four → three ladders, §6), "Where the
deck stands" mastery distribution (L22048), Consistency card (streak stays
hideable via `hideStreak`, L22061), weekly new-words chart, Conjugation card.

**Brand-new post-onboarding user (3-word micro-drill just completed):**
collapsed card reads `0 words that stick · next milestone: 25 · +3 warming up`
with a visible translucent 3/25 fill. Life on the bar from the first minute,
produced by the ordinary formula (§3.2). A pre-onboarding user never sees Home
(nav guard L22179 routes to onboarding).

## 5. Credit plumbing — FINAL: per-word credit at recall-step pass

**Decision:** credit moves from completion-bulk to **per-word at the moment the
learner advances past that word's recall step**, exactly-once per session per
word. Completion keeps round bookkeeping and becomes the fallback creditor for
words whose lesson shapes have no recall step.

### 5.1 The change points, named precisely

1. **New credit seam — `buildNextStep` (L18968).** Immediately beside the
   existing `_buildCountHear(b, b.steps[b.stepIdx])` call (L18972) — which
   already implements the exact guard needed (`step.type === 'recall' &&
   step.word_id && real_word_ids.includes(word_id)`, L21223) — add
   `_buildCreditStep(b, step)`:
   ```
   if step.type !== 'recall' or no word_id or word_id ∉ real_word_ids → no-op
   if b._credited has word_id → no-op            // exactly-once per session
   missed = b._missed.has(word_id)               // "Missed it" tap, L17215/L19044
   smGrade(smStatFor(word_id), missed ? 'again' : 'good')
   recordAttempt(word_id, !missed, 'drill', {voice: buildVoiceMode})
   updateStreak(!missed)                          // §2.1 item 6 — the loop finally feeds the streak
   b._credited.add(word_id); save()
   ```
   STT-not-a-grader is preserved: `missed` comes only from the explicit tap,
   never from transcript matching.
2. **`buildOnComplete` (L19021) — becomes the fallback.** Its per-word loop
   (L19046–19058) skips any `wid ∈ b._credited`. Net effect: vocabSpam /
   randomDrill / onboardMicro (all recall-step-shaped) are fully credited at
   steps; structured lesson modes without per-word recall steps keep today's
   completion credit unchanged. The `!l._completed` guard, sequence push, chain
   advance, and form-recent bookkeeping stay where they are.
3. **`b._credited` lifecycle.** Initialized in `buildMakeSession` (L17223,
   beside `_missed`); **cleared in `buildRestart` (L18999)** beside
   `_rateCands`/`_completed` — "Run it again" is deliberately a fresh crediting
   session, matching today's re-completion behaviour. **Not cleared** by
   `buildPrevStep` (L18986): backing up and advancing again over the same word
   cannot double-fire (set membership), which is the exactly-once property qa
   should attack.
4. **Interrupted rounds now earn what was actually done.** A user who drills 15
   of 24 steps and takes a phone call has 15 credited words; today they have
   zero. Resuming (`resume chip`, L22375) continues crediting the remainder;
   abandoning loses nothing already credited.
5. **Self-rating (v8.48) — unchanged, and verified non-colliding.**
   `buildRateWord` (L21249) writes `again`/`easy` *on top of* step credit by
   design — it is the honest-grade channel (😬 drags accuracy down, un-sticking
   a word; 💪 spaces it out and never retires, L21220). Its own `b._rated` guard
   already prevents double-rating. No change.
6. **v8.46 sentence drills — write credit, to the word store, attempts-only.**
   - `sentGapPick` (L13601): the question object carries the target deck word
     (`q.word`, built in `_gapBuildQ` from picturable deck words, L13590–13592).
     Add `recordAttempt(q.word.id, idx === q.correctIdx, 'sentGap')`.
     **Deliberately NOT `smGrade`:** a 4-chip recognition tap is weaker evidence
     than recall; letting it move SRS intervals would inflate N. It feeds
     `attempts[]` → the warming segment, weekly charts, and accuracy history.
     No double-credit risk: no other path writes for sentGap, and step credit
     (§5.1.1) is keyed to Build-Mode sessions only.
   - `sentCountPick` (L13684): counter questions are built from `COUNT_ITEMS`,
     not deck words — there is no word to credit. **No credit in v1** (the drill
     is its own value); revisit only if counters ever join the deck.
   - Neither drill writes `state.sentenceStats`/`phraseStats` — that track is
     retired from display (§6), and feeding a retired track would recreate the
     smell this delve exists to remove.

### 5.2 Double-credit audit (the matrix qa/code should verify)

| Path | Writes | Guard |
|---|---|---|
| Recall step advance | smGrade + recordAttempt + updateStreak | `b._credited` set, once/session/word |
| Round completion | same, **only** for words ∉ `b._credited` | existing `!l._completed` + new skip |
| Back-step then forward | nothing new | set membership |
| Restart ("Run it again") | fresh session credit | intentional; `_credited` cleared with `_completed` |
| Self-rating tap | smGrade again/easy | `b._rated`, once/session/word; separate channel by design |
| sentGap chip | recordAttempt only | single call site; never smGrade |
| Micro-drill | step credit (recall steps exist, L22628) | same `_credited` path; chains already skipped (L19090) |

Gameability, acknowledged for the devils-advocate: idling autoplay still
accrues 'good' credit — per-step timing changes *when*, not *whether* (identical
to today's completion credit, bounded at 24 words/round, gated on the recall
step actually being reached and the word being a real deck word). The defense is
the accuracy ratio (Missed-it + 😬 both write `again`) and the ≥3-correct floor,
not surveillance — per the locked v8.03 posture.

## 6. Legacy tracks + migration — FINAL: keep the data, retire the displays

| Track | Disposition | Detail |
|---|---|---|
| **Verbs-in-all-forms** | **Keep-in-sheet.** | Conjugation card (L22067) stays in the detail sheet — honest data, still earnable via the Home "Verb forms" row (L22425). Removed from every headline/gate (which die with the spine, §4). Its milestone ladder row stays in the sheet's ladder card. |
| **Sentences-drilled** | **Remove from display.** | The count (`progSentencesDrilled`) reads stores only buried modes feed (§2.1.3) — keeping it visible anywhere reproduces a frozen number inside the sheet. Its ladder row (L21631) is removed. `state.sentenceStats`/`phraseStats` data is untouched. |
| **Conversational Core %** | **Remove from display.** | It is the failed composite over benched/never-fed tracks. Remove the sheet headline card (L21988), the Practice meta line (L22930), and the `PROG_WEIGHTS` usage. `progConversationalCore()` remains callable (snapshots reference its parts) but renders nowhere. |
| **Streak ladder row** (L21632) | **Keep** in the sheet ladder. | Now genuinely fed by the core loop (§5.1.1). |
| **Weekly snapshots** (`progSnapshotData`, L21546) | **Keep recording all fields.** | Additive history; `producible` is the new headline's own field. Costless continuity. |

### Migration — named: **none (read-side retarget, additive writes only)**

There is deliberately **no data migration**:

- **No store is renamed, rewritten, or deleted.** `stats`, `formStats`,
  `sentenceStats`, `phraseStats`, `kanaStats`, `snapshots`, `streak`,
  `settings.onboard` all keep their exact shapes.
- **The owner's real phone profile unfreezes by arithmetic alone:** N =
  `progWordsProducible()` over his existing `state.stats` is already non-zero —
  the first render after update shows a live bar with zero writes. Nothing
  resets; `hears`, `ratedHears`, streak history, snapshots all carry forward.
- **Export/import (version:6, L23906) is untouched** — no schema field is added
  to the backup envelope by this design (`_credited` is session-transient on
  `state.buildMode`, never exported). An imported backup renders the new
  headline the same way the live profile does.
- **No version-flag gate needed** (contrast `_attemptsBackfilledV745`, L21563,
  which stays as-is): there is no backfill, because the formula reads fields
  every historical write path already populated.

The one-way door this avoids: any "migrate sentenceStats into word credit"
backfill would fabricate attempt rows from non-word-keyed data — rejected.

## 7. Retention surfaces for v1 — adopt or defer, each

| Surface | Verdict | Rationale (within the judgment-free register) |
|---|---|---|
| **Streak** | **SHIP in v1** — with the §5 fix that the core loop actually feeds it (today it cannot, §2.1.6). | Exists (`state.streak`, L3352), hideable stays (`hideStreak`, L3166/L23550). The silent 2/week auto-freeze (L6425–6431) already absorbs missed days without shaming. Register rules locked: flame + count only ("days together" copy, L22062); no "don't lose it!" push, no broken-streak funeral screen. Streaks are the best-evidenced retention mechanic in drill apps; the guilt variant is what Delve 9 bans, not the counter itself. |
| **Daily goal (ring/target)** | **DEFER.** | Requires new state (target, day rollover, settings row) and duplicates what streak + a moving bar already communicate ("I showed up; it moved"). Revisit post-v1 with real usage data on session length. Rejecting it as the *headline* (§3) is final; deferring it as a *secondary* surface is revisitable. |
| **Session count** | **REJECT as a surface.** | Pure effort/vanity metric. The sheet's "reviews this wk" (L22064) already covers volume for the curious; promoting counts rewards idling, the exact gaming vector §5.2 flags. |
| **Per-round "words kept" recap** | **SHIP in v1.** | The completion screen (`renderBuildModeComplete`, L21294) gains one line above the self-rating panel, computed from this round's `b._credited` + the N delta: e.g. `14 words drilled · 2 newly stuck · +5 warming`. Counts only up; reinforces the headline metric at the moment of finish; zero new state. The v8.48 panel then reads as "and how well do you know these?" — recap and honest-grade channel compose instead of competing. |

## 8. Decisions reached

1. **Headline metric = words-that-stick ladder (option A):** N =
   `progWordsProducible()` unchanged, tiers `[25,75,150,300,500]`, two-segment
   bar (solid = stuck, translucent = warming = ≥1 correct attempt, not yet
   stuck). *Why:* the only candidate 100% fed by the core loop with zero new
   tuning constants; the composite is the incumbent failure; the ring measures
   effort.
2. **Warming segment is visual-only, never the number.** *Why:* first-session
   life (including the 3-word micro-drill user) without inflating the headline.
3. **Spine retired:** header replaced, five kana stages buried, conversation
   framing removed from Home; `_spineModel`/self-test left dormant, `placedStage`
   kept in state. *Why:* supersession by the 2026-08-03 owner anchor + the
   AND-gate freeze; dormant code is cheap reversibility.
4. **Credit at recall-step pass, exactly-once per session per word
   (`b._credited`), completion loop demoted to fallback for non-recall lesson
   shapes.** *Why:* interrupted rounds currently earn zero; the seam
   (`_buildCountHear`'s guard) already exists.
5. **The core loop now feeds the streak** (`updateStreak` at the credit seam).
   *Why:* verified today it never does — a drill-first paid app whose main loop
   can't light the flame ships a broken retention surface.
6. **v8.46 sentence gap drills write `recordAttempt` on the target word,
   attempts-only (never `smGrade`); Count-it writes nothing in v1.** *Why:*
   recognition ≠ recall; feeds warming/history without inflating N.
7. **Legacy tracks:** verbs → keep-in-sheet; sentences-drilled → remove display,
   keep data; Conversational Core % → remove display everywhere. *Why:* nothing
   visible may depend on stores the shipped surface can't feed.
8. **Migration = none:** read-side retarget + additive writes; no store touched,
   export schema untouched, owner profile unfreezes by arithmetic. *Why:* every
   backfill option fabricates evidence.
9. **Retention:** streak SHIP (fed + judgment-free copy rules), words-kept recap
   SHIP, daily goal DEFER, session count REJECT.
10. **STT-never-grades reaffirmed at the new seam:** per-step pass/fail derives
    only from the explicit Missed-it tap, never from transcript matching.

## 9. Open questions still open

1. **Warming recency:** should warming require a correct attempt in the last
   ~14 days, or is lifetime-any-correct fine? (Lifetime is simpler; a years-old
   abandoned profile would show a large stale warm segment. Cosmetic — panel
   input welcome, default = lifetime for v1.)
2. **Tier ladder beyond 500:** deck is ~1702; post-500 the bar needs either new
   tiers (750/1000/1400) or a "maxed" state. Not a v1 blocker (owner is
   pre-500); flagging so the next freeze isn't at 500.
3. **Dormant spine code:** delete `_spineModel`/`_spineSelfTest`/`SPINE_STAGES`
   now or next cleanup ship? (Bytes vs reversibility — code adversary to weigh.)
4. **Final copy strings** for the collapsed card, recap line, and warming
   sub-label (EN-primary chrome, judgment-free register) — copy pass at build
   time, not a design blocker.
5. **Should sentGap recognition ever upgrade to `smGrade`** once a
   production-shaped sentence drill (typed/spoken cloze) exists? Parked until
   such a drill is designed.
6. **`hears` exposure counter interplay:** should the recap line also surface
   "ready to rate" counts to pull users into the 😬🙂💪 panel? Deferred to the
   panel's UX judgment.

## 10. Foundation doc updates

*(Framed here; the synthesis item — not this one — applies them.)*

- **DO_THIS_NEXT.md** (repo root, the single dated front-door): replace any step
  referencing the spine/"path to a real conversation"/Conversational Core % with
  the words-that-stick surface; add the build steps in dependency order —
  (1) credit-at-step seam + streak feed, (2) headline card + two-segment bar,
  (3) sheet edits + display removals, (4) recap line, (5) sentGap
  `recordAttempt` — each with its verification step (headless Playwright render
  check per the standing ship rule, plus a fresh-profile and an owner-profile
  bar-liveness probe).

## 11. ADR proposals

*(Placeholders only — filed by the synthesis item into `docs/decisions-pending/`
with sequential numbering; NOT filed here.)*

1. **ADR-P1 — Headline progress metric: words-that-stick milestone ladder.**
   Locks §3: N = producible via unchanged `progIsSolid`, tiers reused, warming
   segment visual-only, composites and effort-rings rejected. Supersedes the
   Conversational Core % as a user-facing metric.
2. **ADR-P2 — Credit-at-recall-step policy.** Locks §5: exactly-once
   per-session per-word credit at the recall-step seam, completion as fallback,
   `updateStreak` fed from the core loop, self-rating channel untouched,
   sentence-gap = attempts-only. Encodes the double-credit matrix (§5.2) as the
   acceptance checklist.
3. **ADR-P3 — Legacy-track disposition + spine retirement.** Locks §4 + §6:
   spine retired (dormant code), five stages buried, verbs keep-in-sheet,
   sentences-drilled display removed, Conversational Core % display removed,
   migration = none, export schema untouched.

*(Heuristic check per adrPolicy: all three are load-bearing and costly to
reverse — each changes what paying users are told their progress is, or changes
SRS write semantics. Retention verdicts (§7) ride inside ADR-P1/P2 as
decision-notes rather than a fourth ADR.)*
