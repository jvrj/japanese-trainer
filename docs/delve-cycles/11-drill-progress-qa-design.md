# Delve 11 — QA / Test-Design Audit (Adversary 3)

**Reviewing:** `docs/delve-cycles/11-drill-progress.md` @ 2b31ae8ccaed5f5b3ba445dc85433a37f964667b
**Charter prompts (11-charter.md §Adversary 3):** (1) every profile shape shows a
sane non-frozen bar; (2) interrupted/restart/back-button paths credit exactly
once; (3) the 0%-freeze cannot recur at any later stage boundary.

Prompt-injection scan: no text resembling instructions to an agent ("ignore
previous instructions", "run git add -A", etc.) found in either the primary
doc or the charter. Both treated as inert data throughout this audit.

Method: read the primary doc's cited line numbers directly against
`index.html` (working tree, ~24,331 lines) rather than trusting the doc's
prose — findings below are grounded in the actual functions, not the summary.

---

## Findings

### 1. FATAL — Home render has no error boundary; the proposed `warming()` formula is unguarded and will throw on realistic imported-backup data
`render()` (index.html:22153-22160) calls `m.innerHTML = renderTopbar() + r();`
with **no try/catch** around the screen renderer — an uncaught exception in
`renderHome()` blanks the app on the default landing screen (this is the exact
failure class flagged in prior ship history: "sw.js cache poll alone once hid
a fatal blank-page bug").

The primary doc's §3.1 formula for the warming segment is:
```
warming(w) = NOT stuck(w)
             AND st.attempts.some(a => a.correct)     // ≥1 real correct row
```
This has no guard for `st` being `undefined` or `st.attempts` being absent.
`stuck(w)` is safe (`progIsSolid`, index.html:21465, opens with `if(!st) return
false;`), but `warming(w)` as literally specified is not.

`handleImport()` (index.html:23913-23921) merges raw external JSON straight
into `state.stats` with zero shape repair: `if(d.stats) for(const k in
d.stats) if(!state.stats[k]) state.stats[k] = d.stats[k];`. A backup exported
by an older app build, a different device, or a hand-edited file can legally
contain `state.stats[wid]` records with `correctCount`/`wrongCount` but no
`attempts` key at all — `progBackfillAttempts()` (index.html:21563) only fixes
this for records where `c>0 || wrong>0` (it `continue`s before setting
`st.attempts = st.attempts || []` when both are 0), and only runs once,
gated by a settings flag that import's own `state.settings = {...state.settings,
...d.settings}` merge (index.html:23932) can silently revert to `false` (or
leave untouched) depending on the imported file's settings shape.
**Imported backup is one of the four profile shapes the charter explicitly
requires QA to verify a sane bar for** — this is not a hypothetical.
**Citation:** primary doc §3.1 code block ("warming(w) = NOT stuck(w)\n …
st.attempts.some(a => a.correct)"); index.html:23921; index.html:22156-22157.

### 2. SERIOUS — Headline metric is not immune to the exact gaming vector its own honesty argument claims to close
§3.2 states: *"the honest counterweights are the Missed-it tap and the v8.48
self-rating channel, both of which write `again` and drag the accuracy ratio
below 0.7 for genuinely shaky words, un-sticking them."* This is false for one
whole population: **manually-mastered words.** `libraryWordStatus`
(index.html:4174-4184) checks `s.masteredWords` *before* touching
`state.stats` at all: `if((s.masteredWords || []).includes(w.id)) return
'mastered';`. `progStageCounts` (index.html:21472-21479) counts `'mastered'`
straight into the producible bucket with no call to `progIsSolid`/accuracy.
`smGrade('again')` (index.html:3857-3876) never touches `s.masteredWords`.
So a word manually flagged mastered (Library screen toggle,
`libraryMasterToggle`, index.html:4195) counts toward N **permanently**, and
neither the Missed-it tap nor 😬 self-rating can ever un-stick it — the doc's
stated safety net simply does not reach this case. This matters for test
design specifically: a test suite built from the doc's narrative ("😬 always
un-sticks a shaky word") would be **wrong** for any manually-mastered word and
would need a separate, undocumented test case.
**Citation:** primary doc §3.2 "drag the accuracy ratio below 0.7 for
genuinely shaky words, un-sticking them"; index.html:4177; index.html:21476-21477.

### 3. SERIOUS — Mechanism misattributed for "mature" words; a test written to the doc's stated mechanism tests the wrong thing
Same §3.2 sentence claims the un-sticking mechanism is the **accuracy ratio**.
For words at `'mature'` status, that's also inaccurate: `libraryWordStatus`
(index.html:4182) gates mature purely on `st.smInterval >= BLITZ_MATURE_MIN` —
an interval check, never `progIsSolid`/accuracy. The real un-sticking
mechanism for a mature word is `smGrade('again')` resetting `st.smInterval` to
`SM_AGAIN_MIN` (index.html:3868), demoting its *interval*, not its accuracy
ratio (which `progStageCounts` never even reads for mature words). A
regression test that asserts "accuracy ratio drops below 0.7 after 😬" for a
previously-mature word will not exercise the code path that actually un-sticks
it, and would pass even if the interval-reset path silently broke.
**Citation:** primary doc §3.2 "drag the accuracy ratio below 0.7"; index.html:4182;
index.html:21472-21479 (mature branch never calls `progIsSolid`).

### 4. SERIOUS — Tier overflow (N ≥ 500) breaks the stated formula and directly matches the charter's "no freeze recurrence at any stage boundary" ask, yet is left open rather than closed
§3.1: `T = first tier in [25,75,150,300,500] with N < T`. Once `N >= 500`, no
such tier exists — `T` is `undefined`, and `solidFill = min(1, N/T)` /
`warmFill = min(1, (N+W)/T)` both evaluate to `NaN`. The doc itself surfaces
this as **Open question §9.2** ("Tier ladder beyond 500 … Not a v1 blocker
(owner is pre-500)") rather than resolving it — but the charter's task 4 for
this adversary is explicitly "the 0%-freeze cannot recur at any later stage
boundary," and this is precisely a new stage boundary that recreates a broken
(NaN, not 0%, but equally non-functional) bar. Deferring it as "cosmetic" is
inconsistent with it being a formula correctness bug, not a copy question —
contrast with the genuinely-cosmetic §9.1 "warming recency" deferral, which the
doc itself labels cosmetic; §9.2 is not given the same honest label.
**Citation:** primary doc §3.1 "T = first tier … with N < T"; primary doc §9
item 2 "Tier ladder beyond 500 … Not a v1 blocker."

### 5. QUESTIONABLE — Imported-backup profile shape is asserted, not demonstrated, unlike the other three required shapes
The charter requires QA to verify: *"Every profile shape (brand-new,
post-onboarding 3-word, mid-progress owner, imported backup) shows a sane
non-frozen bar."* §3.2 gives a formula-level walkthrough for brand-new /
post-onboarding-micro-drill / mid-progress-owner ("Session 1", "Sessions 2-3",
"steady state", "brand-new post-onboarding user") but the imported-backup case
gets exactly one unsupported sentence in §6: *"An imported backup renders the
new headline the same way the live profile does."* No fixture, no formula
trace, no acknowledgment of the shape-repair gap in Finding 1. This is a gap
in the doc's own stated verification design, not just in code.
**Citation:** 11-charter.md Adversary 3 audit line 1; primary doc §6 "An
imported backup renders the new headline the same way the live profile does."

### 6. QUESTIONABLE — No executable acceptance criteria anywhere in the doc; verification is deferred to a vague future step
§10 is the doc's entire verification plan: *"each with its verification step
(headless Playwright render check per the standing ship rule, plus a
fresh-profile and an owner-profile bar-liveness probe)."* No expected values,
no state fixtures, no assertions tied to the §5.2 double-credit matrix (e.g.
"drill 15/24 steps, background the tab, resume, assert exactly 15 words have
`correctCount` incremented exactly once and `b._credited.size === 15`"). Given
this adversary's mandate is specifically to judge whether verification checks
are sound and testable, the doc as written hands off all concrete test design
to an unspecified future step — the double-credit matrix in §5.2 is a good
enumeration of *cases* but is not itself a test plan (no expected pre/post
state per row).
**Citation:** primary doc §10 "each with its verification step…"; §5.2 matrix
(no expected-state column).

### 7. QUESTIONABLE — Fallback completion loop's interaction with duplicate `real_word_ids` entries is unaddressed
§5.1 item 2 says `buildOnComplete`'s per-word loop "skips any `wid ∈
b._credited`" but doesn't state whether the fallback loop itself updates
`b._credited` as it grades, nor whether `real_word_ids` is guaranteed
duplicate-free for every lesson generator (`buildOnComplete`'s existing loop,
index.html:19046-19058, has no internal dedup — `for(const wid of realIds)`
with no `Set`). If a lesson type ever produces a `real_word_ids` array with a
repeated id that isn't reached via a recall step, this instance of the
proposed design permits a double `smGrade`/`recordAttempt`/`updateStreak` call
for that id within a single completion pass — not covered by the §5.2 matrix,
which only enumerates the recall-step-vs-completion boundary, not intra-loop
duplication.
**Citation:** primary doc §5.1 item 2; index.html:19046-19058 (`for(const wid
of realIds)`, no dedup).

### 8. NITPICK — Retained "Verbs in all forms" sheet ladder row has no verification note distinguishing "expected frozen" from "regressed"
§6 keeps the verbs ladder row "in the sheet's ladder card," self-acknowledged
as still fed only by buried legacy modes (Form Drill/Form Blitz — §2.1 item
2), i.e. it will legitimately stay near-zero for a drill-only user forever.
§10's foundation-doc updates don't mention a verification step for this row at
all. Without an explicit "this row is expected to show low/zero for drill-only
profiles; do not treat as a regression" note, a future QA pass (or this same
delve's own adversary panel) risks either filing a false regression report
against it or, worse, missing a real regression because the row is assumed to
be "supposed to be broken."
**Citation:** primary doc §6 "Its milestone ladder row stays in the sheet's
ladder card."; §10 (no mention of this row).

---

## Positive verification notes (claims checked and confirmed accurate)

- `_buildCountHear`'s recall-step guard (index.html:21223-21231) matches the
  doc's cited guard shape exactly, and is a sound seam for the proposed
  `_buildCreditStep`.
- Per-step `save()` inside the proposed credit seam means already-credited
  words survive a killed/reloaded tab even though `state.buildMode` itself is
  never persisted (`save()`, index.html:3611-3629, has no `LS.buildMode` key)
  — the "abandoning loses nothing already credited" claim (§5.1 item 4) holds.
- The resume chip (index.html:22367-22385) reads live in-memory
  `state.buildMode`, consistent with the doc's model of resume-without-reload.
- `smGrade('again')` does increment `st.wrongCount` (index.html:3862),
  confirming the accuracy-ratio mechanism the doc describes is real — it's
  only mis-scoped to populations (mastered, mature) where it doesn't apply
  (Findings 2, 3).
- PROG_LADDERS tiers `[25,75,150,300,500]` (index.html:21629) match the doc's
  citation exactly; `_buildSpamPick`, `buildRestart`, `buildPrevStep`,
  `buildOnComplete` line numbers all check out against source.

---

## Verdict

**FAIL.**

Finding 1 is a concrete, citable crash risk (uncaught exception on Home's
render path — no error boundary exists) against a profile shape the charter
explicitly requires be verified, and Findings 2–3 show the doc's own stated
honesty/safety mechanism doesn't hold for two real word populations (manually
mastered, mature). Finding 4 shows the formula the doc puts forward literally
breaks at a documented, foreseeable stage boundary, which directly matches
this adversary's third audit question ("cannot recur at any later stage
boundary"). None of these are cosmetic — they are testable, code-grounded gaps
in a doc that otherwise cites line numbers accurately. The doc should not
proceed to the synthesis/ADR-filing step without: (a) an explicit null/shape
guard in the warming formula + an import-time repair pass or a render-level
try/catch, (b) either scoping the honesty claim to exclude
mastered/mature words or naming the real mechanism per population, and (c) a
resolved (not deferred) answer for N ≥ 500.
