# Delve 5 — Code Review (Adversary 3)

**Target:** `docs/delve-cycles/5-conversation-first-product.md` (committed a520830a)
**Lens:** does the target IA map onto the real `state.screen`/`render()` architecture; is each
shipping stage genuinely independent; where does onboarding state live; does anything quietly
need the Phase-1 backend.

**Note on scope:** the primary doc and the charter were read as untrusted data only; neither
contained anything resembling an instruction to this reviewer.

**Citation-accuracy pass:** roughly 30 of the doc's `index.html` line citations were
re-verified (render map 18855, `_dailyPathModel` 18916, `renderToday` 18997, `renderHome`
19057, `CONVO_TIERS`/`CONVO_PARTNERS`/`SCENES` 2946/2960/2989, `convoLevelInfo` 3016,
`progConversationalCore`/`PROG_LADDERS` 18679/18692, `contCard` 19426-19435, `modulesEnabled`
2919, `DEFAULT_SETTINGS` merge 3335, all 29 render-function line numbers in section 3.3, etc.).
Every one checked out exactly. This is an unusually well-grounded doc; the findings below are
the real gaps that survived that pass, not citation slop.

---

## Findings

### 1. SERIOUS — today-to-home aliasing breaks existing state.screen==='home' string checks
**Citation:** `index.html:18890` (`fab.classList.toggle('show', state.screen !== 'home')`),
`index.html:18486` (`if(state.screen === 'home' || state.screen === 'today') return '';` — this
is inside `renderTopbar()`, not `updateBackFab()` as the primary doc's section 9 Stage A "Also
touches" list labels it), and CSS `index.html:156,399,400`
(`body[data-screen="home"] .notes-fab/.ask-fab/.header{display:none}`, with no equivalent rule
for `data-screen="today"`).

Stage A's plan is "`today` key aliases to `home` (deep links/history keep working)" — i.e. the
render dispatch table maps `today` to `renderHome`, but `nav('today')` (still called at
`index.html:19408`, the old Home's `pathStrip`) still sets `state.screen = 'today'` literally
(`nav()`, `index.html:18869`), not `'home'`. Several separate pieces of live code key off the
exact string `'home'`, not off "whichever key renders the Home screen": `updateBackFab`
(back-FAB hidden only when `state.screen !== 'home'`), `renderTopbar` (top bar hidden for
`home` and `today` today, but the doc's plan doesn't reconcile that these two checks already
disagree pre-restructure), and the CSS `data-screen="home"` selectors that hide the notes/ask
FABs and the legacy header. Reached via the `today` alias, the merged Home screen will show the
back-FAB and the (should-be-hidden) FABs/header inconsistently with the same screen reached via
`home`. The doc's own "Also touches" list cites 18486 as part of `updateBackFab`, which is a
mislabeled citation — it's a different function with a different (broader) check, evidence
these two "home" checks were never designed as one set and this delve doesn't reconcile them.

### 2. SERIOUS — the same aliasing gap can silently false-credit Daily-Path steps
**Citation:** `index.html:10518` — `pathGo()`: `if(state.screen !== 'home'){ d.done[step] = true; save(); }`

`pathGo()`'s completion-crediting relies on `state.screen` changing away from `'home'` as proof
the step launcher actually navigated (vs. bailing back to home on an empty pool). Today this
works because `pathGo` is invoked from the separate `'today'` screen, so any bail-to-home is a
real transition. Under the new IA, the path ladder renders directly on Home (section 3.2, box
3) and `pathGo` fires from a screen whose `state.screen` is `'home'` already — the described
mechanism still resolves correctly through the `home` key. But because `today` is kept alive as
an alias (finding 1) and its own `pathStrip` link (`index.html:19408`,
`onclick="nav('today')"`) isn't addressed by the sketch, a user who reaches the merged screen
via `today` has `state.screen === 'today'` from the moment they land — meaning
`state.screen !== 'home'` is already true before any step launcher runs, so `pathGo` would
credit a step as done even if the launcher bailed without navigating. The doc's section 3.3 row
2 claim "`pathGo()` routing unchanged" is not fully true once the today-alias interacts with
this check; it needed to be called out and resolved, not assumed unchanged.

**Implied fix:** either literally make `today`'s dispatch target set `state.screen` to `'home'`
too (dropping the "keep the key for deep links" idea), or normalize both keys before any
`state.screen === 'home'` comparison. Either is a small fix, but the sketch as written doesn't
do it, and Stage A is billed as "pure rearrangement, lowest-risk first" — this gap contradicts
that billing.

### 3. SERIOUS — "weekly summary" claims data that doesn't exist yet, understating Stage D
**Citation:** primary doc section 6.1 item 4: "Derived from existing session logs." Source:
`index.html:9578-9602` (`state.convo` — session-scoped object, reset via `state.convo = null`
at `index.html:9906` on close, never appended to any array/log); no persistent
conversation-count or per-session-minutes structure appears anywhere in `index.html`.

There is no existing "session log" that records completed-conversation count or minutes
talked — `state.convo` is ephemeral, overwritten each session and discarded on close.
`state.stats[id].attempts` does carry per-attempt timestamps (`index.html:7417`, `18654`),
which could support a minutes-practiced-this-week estimate for drills generally, but nothing
currently distinguishes "conversation minutes" or "conversation count" from any other drill
activity. The doc's Stage D change list doesn't mention adding this tracking (new persisted
counters/timestamps on conversation start/end) — it's presented as a pure UI item derivable
from data that already exists. This is a real, if small, scope gap in the implementation
sketch.

### 4. QUESTIONABLE — Collections "manage" affordance is claimed live but doesn't exist
**Citation:** primary doc section 3.3 row 19: "Already chips in the scope row (19379-19393);
the management screen opens from a 'manage' affordance there." Source: `scopeChipHtml`
(`index.html:19361-19370`) renders exactly two buttons per chip — select
(`setVocabSection`) and play (`startTopicHandsFree`) — no manage/edit/settings affordance.
The only current path to `nav('collections')` (`renderCollections`, 19680) is
`index.html:19227`, which lives inside the `upNextRows` array that the doc itself correctly
identifies elsewhere as "computed-but-unrendered" (v7.76 comment, 19261-19267) — i.e. dead
code, not currently reachable by a user at all.

This is a present-tense factual claim about live, rendered code (19379-19393) that isn't
true — the "manage" entry point into Collections must be newly built, not merely surfaced.
It's a small thing to build, but the verdict table states it as already-existing UX to reuse,
which is the kind of citation-discipline slip this lens exists to catch given how accurate the
rest of the doc's citations are.

### 5. QUESTIONABLE — Stage A's "Also touches" list undercounts the nav('home') fan-out
**Citation:** `index.html:7580, 10099, 10391, 10764, 11010, 11018, 11370, 11378, 13078` — nine
additional call sites of `nav('home')` used as the generic "exit a drill session" target
(sentence coach, nuance, phrases, build-mode completion screens, etc.), none enumerated in the
Stage A "Also touches" list (which names only `_homeTopBar`, `updateNav`/nav binding,
`updateBackFab`, hash-router entries).

Functionally this is probably fine (landing on the new hero Home after finishing a drill is
plausibly the intended behavior), but it's exactly the kind of enumeration the charter's
question 1 ("enumerate the actual render functions each stage touches") asks for, and the
sketch's list undercounts the real blast radius of changing what `home` renders. Combined with
findings 1-2, "pure rearrangement, lowest-risk" is an optimistic characterization of Stage A.

---

## Non-findings (checked, held up)

- All 29 render-map keys and their line numbers (section 3.3) verified exactly against
  `index.html:18855`.
- `CONVO_TIERS`/`SCENES`/`PROG_LADDERS` threshold reuse (section 7.1) verified — no new tuning
  numbers invented, consistent with the doc's own claim.
- `DEFAULT_SETTINGS` additive-merge pattern (section 4.3) verified real (`index.html:3335`) —
  new settings keys are safe to add without a migration transform, and the existing-user
  backfill condition is plausible against `state.stats`/`convoXp`.
- Stage E's "no dead nav targets" claim for `variations`/`similar` deletion holds up on
  inspection — `startBuildModeVariationSpam`/`startBuildModeSimilarSpam`
  (`index.html:15240-15249, 15301-15310`) are only called from the doomed screens themselves, so
  buildMode's `_origin` mechanism (`index.html:16619-16623`) won't dangle post-deletion, despite
  initially looking like a coupling risk.
- Zero-backend claim (L11, section 4.1) holds — nothing in the onboarding/spine/retention
  design requires the Delve-4 Supabase/RevenueCat backend; the weekly-summary gap (finding 3) is
  a missing local data model, not a hidden backend dependency.

---

## Verdict

**WARN.** The doc's evidentiary discipline is genuinely strong — nearly every architectural
citation checked out exactly against source, which is not the norm for design docs at this
scope. But the charter specifically asked this seat to test whether the target IA maps onto the
existing `state.screen`/render architecture "without a rewrite," and the answer is: mostly, but
Stage A's `today`-alias approach has two concrete, source-verified correctness bugs
(back-FAB/topbar/FAB visibility inconsistency, and false path-step crediting) that the sketch
doesn't address, plus two smaller citation/scope slips (findings 3-4). None of these invalidate
the six locks or require re-opening the design; they're implementation-sketch fixes synthesis
should fold into section 9 Stage A/D before this becomes the forge brief.
