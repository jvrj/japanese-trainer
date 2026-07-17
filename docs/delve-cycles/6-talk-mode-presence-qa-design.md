# Delve 6 — QA / Test-Design Audit (Adversary 2)

**Target:** `docs/delve-cycles/6-talk-mode-presence.md` (committed 720548b5)
**Lens:** test/verification design — are the locks testable, are regressions covered, are
the verification checks sound and non-hallucinated?
**Method:** read the primary doc in full; verified its line-number citations against the
live `index.html` (20,562 lines) at four walks the charter assigns to this seat (minute-one
beginner, mishear-twice hands-free, endless-session-to-natural-death, owner's day-1).

**Prompt-injection check:** scanned the primary doc and the charter for text resembling
instructions directed at me (e.g. "ignore previous instructions", "run git add -A"). Found
none — both read as ordinary project prose/design content, not adversarial input. No
finding filed for this.

---

## Findings

### FATAL — Keyless "endless" session is not endless; it hard-ends every 5 turns

The doc locks (L7, §4.2, §9): *"the end condition ... stops ending the session ... a session
now ends only by [farewell / tap-to-end / silence→sleep→auto-end]"* and (§6.2) claims for the
no-key case *"the orb presents identically"* using the existing `_convoScript` fallback, with
only a content-bank expansion scoped for later (T5, described as *"content work, no
architecture"*).

Source contradicts this. `_convoScript` (`index.html:9331-9348`) returns:

```
sceneDone: !!(turn.sceneDone) || (turnIdx >= 4),
```

(`index.html:9344`). This unconditionally forces `sceneDone: true` once `turnIdx >= 4` (the
5th turn), **independent of the scripted bank's length** — expanding
`_CONVO_SCRIPT_TURNS` from 5 to ~15 entries (the T5 plan) does not remove this wall, because
the comparison is a hardcoded turn-index threshold, not tied to array length. Since the
primary doc's own plan re-purposes `sceneDone` (via `_convoPreamble` prose, §5.1) as the
farewell signal that ends a *live* session, the keyless path's `sceneDone` origin is entirely
separate JS logic that never touches the preamble — so the redefinition does nothing for it.

**Consequence for testability:** the keyless stranger — one of the doc's own "two real
users" it explicitly designs for (§2.4) and the explicit subject of minute-one defense point
5 (§7: *"the keyless stranger still gets a partner"*) — gets a session that
`convoEnd()`-terminates on turn 5 every cycle, not an endless one. Stage T2's acceptance
criterion *"a session survives 40+ turns with flat per-turn payload"* (§8) will fail if run
against the keyless path, and the doc never scopes fixing `_convoScript`'s threshold as part
of any stage (T2's build list touches `_convoPreamble`, the live end-condition at 9609, and
the stall/sleep ladder — never `_convoScript`/9344). This is a build-and-test gap that will
surface as a real regression, not a hypothetical.

**Citation:** `index.html:9344` (`sceneDone: !!(turn.sceneDone) || (turnIdx >= 4)`); primary
doc §4.2, §6.2, §7 point 5, §8 Stage T2 acceptance line *"a session survives 40+ turns"*.

---

### SERIOUS — The new silence-stall design collides with an existing, uncited hard-close mic timer

Primary doc §4.3's table locks: *"6s silence in listening (mockup value, kept): **stall**:
chips overlay fades in ... mic stays open"* and §4.4 claims the silence-stall detector and
the mishear/`forceChips` detector are *"two orthogonal detectors, kept orthogonal."*

Source shows a **third**, already-shipped detector the doc never cites or reconciles:
`convoToggleListen` (`index.html:9775-9794`) arms a *"~6-second hard-silence timeout
(belt-and-braces...)"* per its own comment — if STT delivers nothing for 6s, the timer fires
`convoStopListen()` (`index.html:9768-9772`), which sets `cv.listening = false` and calls
`stopVoice()`, **closing the mic**. This is the identical 6-second threshold the new stall
design assumes will instead leave the mic open while chips fade in.

As specified, at t=6s the existing code already stops listening and the mic is closed —
directly contradicting the locked behavior *"mic stays open."* The primary doc's Method
§2.1 citation list (which enumerates the engine seams it claims to have read against source:
`slice(-6)` 9524, double-miss 9559-9575/9487/9970, downshift 9577-9600, end condition 9609,
hands-free chain 9622-9626, etc.) does not include `9775-9794`, and Stage T2's build list
(§8) does not mention modifying `convoToggleListen` or its `_armSilenceTimer`/`_silenceTimer`
at all. So the interplay-lock in §4.4 is incomplete on its own terms — it names two
detectors it keeps orthogonal but misses a third, pre-existing one that directly conflicts
with the new one's core behavior at the same threshold value. Stage T2's acceptance
criterion *"silence path reaches sleep then auto-recap"* cannot be verified as designed
without first resolving (and testing) this collision, which the doc doesn't scope as work.

**Citation:** `index.html:9775-9794` (`convoToggleListen`, `_armSilenceTimer`,
`_silenceTimer` timeout), `index.html:9768-9772` (`convoStopListen`); primary doc §4.3 row
*"6s silence in listening ... mic stays open"*, §4.4 *"two orthogonal detectors, kept
orthogonal."*

---

### QUESTIONABLE — Guided-chips mode (minute-one scaffold) doesn't specify mic state, leaving the core walk-1 acceptance untestable

§7.2 (L11) locks: for tier-1 learners' first 3 sessions, chips are *"always visible ... every
turn is answerable by tap."* But the doc never states whether hands-free auto-listen
(`convoHandsFree`, `index.html:2789`, wired through the seams in §5.2) stays **active in
parallel** with always-visible chips, or is suppressed while guided mode is on. If the mic
stays armed, a nervous beginner who freezes (says nothing, taps nothing) can still walk the
existing silence/mishear ladders (§4.3, §5.3: double-empty-listen re-ask, `voiceMissStreak`
apology) even though the chip escape hatch is meant to make freezing survivable — the
"floor above bail" claim in §7 point 4 is not actually locked for this specific interaction.
This is exactly the residual risk the primary doc itself flags to this seat (§7, last
paragraph: *"the residual risk — a nervous beginner who freezes even with chips — is exactly
what the qa-tester adversary walk ... must pressure-test"*) — and the spec as written doesn't
give me an unambiguous behavior to test against.

**Recommended acceptance test (not in the doc, should be added):** *"Tier-1 guided session:
learner speaks and taps nothing for 90s. Verify the orb never reaches an apology/mishear
state (no false `voiceMissStreak` accrual from silence) and only surfaces warm re-prompts +
persistent chips."*

**Citation:** primary doc §7.2 (*"chips are always visible ... every turn is answerable by
tap"*), §7 closing paragraph (residual-risk hand-off to this seat); no source citation — this
is a spec gap, not a code contradiction.

---

### QUESTIONABLE — XP-per-turn "lock" (L in §4.5) appears to already be current behavior, mistargeting its own acceptance test

§4.5's table states: *"XP: currently awarded in `convoEnd`. LOCKED: XP accrues per advanced
turn ... An endless session that dies by tab-kill loses nothing."* Source shows
`convoApplyScore` (`index.html:9631-9677`) already calls `convoAddXp(1)` per resolved word
(`index.html:9668`) and is already invoked **inside `convoTurn`** at the start of each new
turn (`index.html:9505`, applying the *previous* turn's judged result), not only from
`convoEnd` (which just flushes any final dangling `judged` at session close,
`index.html:9684-9686`). If XP already accrues turn-by-turn today, the "LOCKED" row isn't
describing a change, and a forge run that writes a regression test asserting *"XP survives
tab-kill because of this delve's change"* will find the behavior already present — the
actual net-new, testable delta in §4.5 is the `convoLog` checkpoint-every-10-turns behavior,
not XP. Low material impact (mislabeled premise, not a broken lock), but it should be
corrected so Stage T2's acceptance criteria target the real diff.

**Citation:** `index.html:9505` (`convoApplyScore(cv.judged, cv.viaVoice);` inside
`convoTurn`), `index.html:9668` (`convoAddXp(1)` inside `convoApplyScore`); primary doc §4.5
table, XP row.

---

## Walks performed (per charter Adversary-2 prompts)

1. **Minute-one nervous beginner** — mechanically well-defended (onboarding-before-orb,
   speak-first partner, always-visible guided chips); see QUESTIONABLE finding above for the
   one unlocked interaction (mic-parallel-to-chips) that leaves the beginner's actual freeze
   point untested.
2. **Mishear-twice hands-free** — verified sound. `forceChips` (`index.html:9559-9575,
   9970`) already suppresses the hands-free auto-mic chain (`index.html:9624`,
   `!state.convo.forceChips` guard) before the orb's new "bow" dip is layered on; no
   collision found. STT stays a pure trigger throughout, consistent with the doc's claim.
3. **Endless session to natural death** — **FAILS** for the keyless path (FATAL finding
   above); the live/keyed path's soft-wrap → daily-budget → dev-readout ladder (§4.5) is
   internally consistent and its cost arithmetic is plausible, though this seat did not
   re-derive the per-token pricing (that's Adversary 1's cost-burn attack, charter-assigned).
   The silence→sleep→auto-end ladder collides with an existing timer (SERIOUS finding
   above) before it can be said to reach "natural death" as specified.
4. **Owner's day-1** — checked structurally sound: `resumeChip`
   (`index.html:18755,18805`) and `startedTs` (`index.html:9485`) both exist as cited: the
   "≤1 gesture worse, resume chip topmost in drawer" claim is buildable against real
   anchors, no contradiction found.

## Citation spot-check (hallucination scan)

Spot-verified a sample of the primary doc's cited line numbers against source:
`APP_VERSION` at 676 ✓, `sceneDone` key/guideline at 9288/9296 ✓, `_convoScript` at 9331 ✓,
`slice(-6)` at 9524 ✓, `forceChips` set at 9569 ✓, `cv.turn >= cv.maxTurns` end condition at
9609 ✓, hands-free auto-mic guard at 9624 ✓, `convoApplyScore`/`convoAddXp` at 9631-9677 ✓,
`_renderConvoRecap` at 10002 ✓. No hallucinated citation found in the sampled set — the
doc's line-number discipline is otherwise good; the two SERIOUS/FATAL findings above are
*omissions* (uncited conflicting code), not miscited numbers.

---

## Verdict: WARN

The doc's locks are mostly well-cited and buildable, and two of the four charter walks
(mishear-twice, owner's day-1) hold up cleanly against source. But one locked promise (L7,
endless sessions) demonstrably fails for the keyless-stranger path on a hardcoded line
(`index.html:9344`) the doc never surfaces or schedules a fix for, and the stall-detection
interplay lock (§4.4) omits a real, conflicting existing timer
(`index.html:9775-9794`). Both are concrete, source-verified contradictions that will
produce failing or unbuildable acceptance tests exactly where the doc claims coverage —
synthesis should require both be scoped into Stage T2 (or explicitly re-locked with the
`_convoScript` threshold and the `_armSilenceTimer` collision named) before the forge brief
ships.
