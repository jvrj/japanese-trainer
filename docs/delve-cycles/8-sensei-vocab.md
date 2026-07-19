# Delve 8 — The Sensei Layer & Vocab Access

> Primary investigation doc. Round 1. Charter: `docs/delve-cycles/8-charter.md`.
> Engine line numbers cite `index.html` @ v8.25 (`APP_VERSION` at 680, the working
> tree this delve read).

---

## 1. Charter — scope + fixed constraints

### 1.1 Scope

Two owner directions converge on one question: **how does Isshin actively teach?**

1. **Vocab access (re-opens pending ADR-003).** Today all ~1,702 words
   (`N5_PACK` at 685 + `ADV_PACK` at 2535, both default-on at 3369–3371) are
   drillable from minute one; a non-locking coverage meter (v7.96,
   index.html:20736–20749, reading `vocabAccessStats()` at 6777) shows
   absorption. The owner leans toward a literal **hard lock** ("only 1,500
   words unlocked — more controlled") but mandated it be *studied before
   deciding* (owner call 2026-07-19). ADR-003 itself anticipated this: its
   reversal trigger (ADR-003:40) fires on "the user explicitly requests
   access-locking" — **that trigger has now fired.** This delve resolves the
   deferred hard-lock arm (ADR-003:26) into a final lock.
2. **The sensei mandate (owner, verbatim, 2026-07-19):** *"the AI teaches you
   actively, for example if you say something incorrectly, or close, it will
   tell you, you say it like this with these words because of X..Y..Z. and even
   mentions nuances? that would be an actual SENSEI"* — and *"feedback is how
   you learn essentially."* Current state (Delve 7 F2, shipped, live at v8.25):
   the six-key contract classifies every utterance (confirm/recast/clarify,
   `_convoPreamble` 9407–9434), but recasts are **deliberately invisible** —
   woven into `jp`, nuance note capped at 8 English words, peek-only
   (index.html:9414, 11069). Delve 7 chose invisibility to protect flow; the
   owner now wants **explicit, explanatory teaching with the why and the
   nuance**. That is a genuine amendment to the Delve-7 lock (L3/L4), not a
   bigger note field.
3. **The teaching loop:** how 1 + 2 compose into speak → teach → absorb →
   unlock → speak with more words, without mode-sprawl or a Library.

### 1.2 Fixed constraints (owner-decided — not re-litigated)

- **Judgment-free stands (ADR-009, accepted).** A sensei *explains the natural
  way and why* — never verdicts, grades, red ✗, accuracy stats. Teaching
  register, not marking register. `docs/specs/correction-copy-style-guide.md`
  is the enforcement doc; conversation surfaces (class 1) stay
  verdict-word-free; the runtime scrub in `_convoNormFeedback` (9666) extends
  to every new teach string.
- **STT is a turn-trigger, never a grader** (v8.03 doctrine). Explicit teaching
  RAISES the mishear stakes — a confident explanation of a phantom error is
  worse than silence. Confidence gating must *strengthen*, not weaken
  (clarify-degrade before any teach). §4.5 answers this explicitly.
- **Nuance pairing is doctrine:** every taught word/form carries its usage
  nuance (direction, formality, state-vs-event…).
- Kana-only learner content / English-primary chrome (v8.22 boundary): a
  teach's *explanation* is English; the taught *form* is kana.
- Hands-free audio-led loop must survive; single-file PWA, no backend (works
  today, improves with Phase 1); universal phone, not Pixel-only.
- **ADR-011 is still pending its keyed-probe acceptance gate.** The sensei
  layer is written as a **staged extension the keyed field session can still
  validate** — the F2 contract is not rewritten, and every sensei surface has a
  named dial-back lever (§4.8) so the probe can shrink it without killing it.

### 1.3 Ground truth carried in (verified against v8.25 source)

- Engine: `_convoPreamble` six-key contract + FEEDBACK rules (9342–9435, rules
  at 9417–9423), `_convoNormFeedback` deterministic ladder (9654–9697: score
  cross-check, symmetric echo guard with abstain, 1-in-3 throttle, note scrub),
  `convoTurn` feedback bookkeeping (10006–10105), recap pipeline (`convoEnd`
  10200–10272 with recastLog-first notes 10224–10230 and v8.24
  `saidHighlights` 10254; `_renderConvoRecap` 11176–11244), deck plumbing
  (`getActiveWords` 3564, `_buildSpamPick` 15522, spam-lesson widening ladder
  15554–15561, convo pool seed 9838–9839), SRS write path (`convoApplyScore`
  10148–10193 — conversation speech already writes `recordAttempt`+`smGrade`),
  coverage meter (20736–20749) + `vocabAccessStats` (6777), `modulesEnabled`
  false-by-default legacy gate (2789).
- Grounding docs: `docs/decisions-pending/ADR-003` + `ADR-011`,
  `docs/decisions/ADR-009`, `docs/delve-cycles/7-feedback-soul.md`,
  `docs/specs/correction-copy-style-guide.md`,
  `reports/hydra-research/2026-07-16/REPORT.md` (H3: judgment-free is
  engineered via framing; Jumpspeak false-positive anti-pattern; free tier =
  one real conversation/day, "not a locked demo").
- SLA prior art (from Delve 7 §2, reused honestly): Lyster & Ranta 1997 —
  recasts are frequent but low-uptake for beginners unless salient; explicit
  metalinguistic feedback produces higher uptake for form accuracy (Ellis,
  Loewen & Erlam 2006 direction); clarification is the mishear safety valve.
  The sensei layer is exactly "make the recast salient + explain it" — the SLA
  case for the owner's instinct is real, not retrofitted.

---

## 2. Method

1. **Read the engine, not the docs' memory of it.** Every current-behavior
   claim is anchored to a line read in `index.html` v8.25 this session.
2. **Resolve, don't survey.** Each task ends in a final lock; alternatives are
   dispositioned inline with the reason they lost.
3. **Prior locks are load-bearing until explicitly amended.** Where this delve
   amends a Delve 7 lock, the entry is tagged AMENDS-D7 with the specific lock
   id; ADR-009 is never amended, only inherited. ADR-003's own reversal
   trigger is the governance route for the vocab re-open (§3.1).
4. **Owner verbatims are the acceptance oracle.** §4.7 and §5.4 replay the
   owner's exact words against the locked design.
5. **Adversary bait left visible.** Each lock notes the attack it expects
   (judgment-creep, false-teach, flow-cost, lock-frustration, premature-depth)
   so the panel hits load-bearing joints directly.

---

## 3. Vocab access (Task 1) 🔒 — the rolling-frontier lock

### 3.1 Governance: how this re-opens ADR-003 honestly

ADR-003 (pending, never promoted) locked the non-locking coverage meter and
recorded hard-locking as a **deferred arm** (ADR-003:26) with a named reversal
trigger: *"Revisit (toward the deferred hard-lock arm) if, after ship, the user
explicitly requests access-locking"* (ADR-003:40). The owner's 2026-07-19 call
is that explicit request. So this is not a mood-flip against a standing
decision — it is the decision's own OFF-ramp being taken, by the authority it
named. What ADR-003 got permanently right is preserved: the v7.69 module-gate
force-off stays (2789, migration at 3335), no selector is rewired through
`getDrillableWords`, and the "random words" bug class
([[project_japanese_trainer_scope_modulelock]]) must be impossible by
construction (§3.5).

### 3.2 The candidates, dispositioned

| Candidate | Verdict | Why |
|---|---|---|
| (a) Keep the meter, add "controlled feel" cosmetics | **rejected** | The owner's instinct is about *deck shape*, not display: 1,702 drillable words on day one is an ocean. A meter can't make an ocean feel like a path. This candidate is the status quo ADR-003's trigger just fired against. |
| (b) Re-enable the module gate (`modulesEnabled`) by default | **rejected** | Reverses v7.69, resurrects the exact intersection-emptied-pool defect the owner already had fixed, contradicts the topics-first scope mandate. Dead on arrival per ADR-003's context section — nothing changed. |
| (c) Tier/topic-pack unlock units | **rejected** | Topic-shaped locks are the proven bug class (topic ∩ locked = empty pool, v7.68). Locks must compose at the deck level, orthogonal to topic filters. |
| (d) **Rolling-frontier hard lock at the deck choke point** | **LOCKED** | See §3.3. Delivers the controlled feel, survives FOLLOW-THE-LEARNER, kills the empty-pool class structurally, and is a pure derivation over existing SRS state — almost no new persisted state. |

### 3.3 The lock — rolling frontier, demand always wins

**The unlocked deck is a derived set, recomputed on read (like the meter — no
giant persisted arrays):**

```
unlocked(w) =
     started(w)                    // any SRS attempt: state.stats[w.id].attempts.length > 0
  ∨  manuallyUnlocked(w)           // state.settings.unlockedExtra (id array, additive)
  ∨  frontier(w)                   // the first FRONTIER_N unstarted, non-manual words
                                   // in deterministic deck order (N5_PACK order, then ADV_PACK)
```

- **Unlock unit = the word**, admitted in a rolling frontier of
  `FRONTIER_N = 80` unstarted words. Not tiers, not topic packs (§3.2c). 80
  satisfies ADR-003's day-one variety floor (≥ ~80 unique drillable words,
  ADR-003:26) *by construction* — a brand-new profile's deck is exactly the
  frontier. **Owner-signoff flag (synthesis; promoted from OQ-1 on an
  adversary catch):** the owner's verbatim is "only 1,500 words unlocked" —
  a ~12% trim of the 1,702-word deck — while frontier-80 is a ~95% cut for a
  fresh profile. The frontier MECHANIC is N-agnostic; the 80-vs-1,500 gap is
  a product call this delve cannot settle for the owner. ADR-012 presents
  both readings side-by-side as an explicit signoff item; 80 ships as the
  proposal, never a fait accompli.
- **Earn mechanic = doing, through SRS state that already exists.** A word
  leaves the frontier the moment it is started — by a drill attempt OR by
  being spoken unaided in conversation. **Corrected at synthesis (the panel's
  unanimous FATAL):** `convoApplyScore` writes `recordAttempt`+`smGrade` on
  voice turns (10179–10181) **for pool words only** — it resolves
  `judged.usedWords` solely against `cv.pool` and silently drops anything
  unresolved (10175), and the model contract only asks for pool-word ids
  (9412). As shipped, speech unlocks nothing outside the seeded 8-word pool.
  **S3 therefore REQUIRES two widening changes (§6 S3) before the
  speech-promotes path is true:** (i) the contract's `usedWords` line grows
  to admit the kana surface of ANY word the learner clearly used, pool or
  not; (ii) `convoApplyScore` gains a fallback resolver over the full word
  registry (`state.words`) using the existing normalized-kana match,
  accepting only a UNIQUE match (homonym-ambiguous surfaces stay dropped —
  never guess an id). Writes stay gated exactly as today (`viaVoice` +
  score ≥ 1). The frontier then refills from the ordered remainder. No new
  counters, no new earn currency: **progress in the app IS the unlock
  mechanic.** Conversation and drills feed it equally once (i)+(ii) land —
  until then, only drills do.
- **FOLLOW-THE-LEARNER wins — structurally, not by exception (the
  lock-frustration answer).** The lock has **no refusal path**:
  1. The conversation never consults the lock for comprehension or response —
     the partner responds to anything (preamble rule at 9400–9403, untouched).
     Off-pool speech is *promoted*, not blocked: speaking a locked word writes
     an attempt → the word is now started → unlocked. **Using a word IS
     unlocking it** — contingent on the S3 resolver widening above (a
     REQUIRED build item; not shipped behavior).
  2. Browse/search shows locked words greyed with a 🔒→tap-to-add affordance
     (one tap appends to `unlockedExtra`). A learner who needs 「びょういん」
     today gets it in one tap — the #1 store-review complaint genre ("the app
     won't let me learn the word I need") has no surface to land on.
  3. Any selector that would come up thin against the unlocked deck
     auto-widens (§3.5) — and the widened draw is *recorded as unlocked*
     (demand-unlock), so the deck follows the learner.
  The lock is therefore **default pacing, never a wall** — which is the only
  hard lock compatible with Delve 7's FOLLOW-THE-LEARNER doctrine.
- **What locked looks like: visible horizon, greyed teaser — never invisible.**
  Commercial framing: a paying customer's progress reads "**214 unlocked ·
  1,702 on the road**" — the lock is the progress mechanic made legible. The
  existing coverage meter is *re-labelled*, not replaced: same
  `vocabAccessStats`-style derivation, now showing
  `unlocked / total` with `started` as the fill. Invisible locking is rejected:
  it deletes the aspiration surface that makes a lock feel like progression
  instead of poverty (Praktika/Duolingo both show the road ahead; the research
  report's free-tier finding — "a real conversation/day, not a locked demo" —
  generalizes: never hide the product).
- **Beginner default: lock ON for new profiles.** The first-session deck is 80
  frequency-ordered N5 words — a knowable pond, aligned with the ~50-word core
  doctrine ([[feedback_japanese_vocab_lockdown]]) while meeting the variety
  floor.
- **Escape hatch:** one Settings toggle (`vocabLock`, like `showCoverageMeter`
  at 2799) turns the lock off entirely and restores today's behavior exactly.
  Judgment-free: turning it off is a preference, never framed as skipping
  ahead.

### 3.4 How each consumer reads the unlocked set (the whole surface, enumerated)

The single choke point is `getActiveWords()` (3564) — **every** relevant
selector already routes through it, which is precisely why this lock cannot
reproduce the module-gate bug (that gate lived in scattered
`activeModuleWordIdSet()` branches; this one lives where all roads already
pass):

| Consumer | Route today | Under the lock |
|---|---|---|
| Spam loop | `vocabSectionFilter(getActiveWords())` (15556) | unlocked deck ∩ topic, with the §3.5 widening rung |
| Random Drill | raw `getActiveWords()` (call at 15630, fn `startRandomDrill` at 15606 — the r1 "15107" was ADR-003's older-revision line, corrected at synthesis) | unlocked deck — floor guaranteed by the §3.5 choke-point backstop |
| Vocab Blitz (home primary) | `vocabSectionFilter(getActiveWords())` (`blitzCounts` 7150 + session pool, same route) | **inherits the lock — by design** (row missing in r1; adversary catch): due words are started ⇒ unlocked ⇒ unaffected; NEW-card intake narrows to the frontier — exactly the pacing the lock exists to provide |
| Convo WORD_POOL | `_buildSpamPick(getActiveWords(), 8)` (9839) | due-first 8 from the unlocked deck — the partner automatically anchors in words the learner is absorbing; frontier words rotate in as they start |
| Chips | model-suggested from WORD_POOL + live context (9429) | unchanged — chips inherit the pool's frontier bias for free |
| Coverage meter | `vocabAccessStats()` over active words (6777; `total: active.length` at 6791) | re-labelled `unlocked / total` — **the denominator must bypass the lock** (adversary catch: with the filter inside `getActiveWords()`, `total` would collapse to the unlocked count and the meter would read 100% immediately): `vocabAccessStats` reads `getActiveWords({ignoreLock:true})` for `total` |
| SRS / stats | `state.stats` keyed by word id | **untouched** — the lock reads SRS state, never writes it |
| Forms / particles / other drills | independent scope via `formEligibleVerbs` (7086) + `startFormDrill` (8230) — re-verified at synthesis: no `getActiveWords()` route (the r1 "7141, 7205" were ADR-003's older-revision lines) | **untouched in v1** — verb-form and particle drills teach grammar over small closed sets, not deck breadth; locking them adds risk for no felt control |

One filter, added inside `getActiveWords()` behind the `vocabLock` setting —
with **one narrow, explicit bypass** (adversary catch: `getActiveWords()` is
zero-parameter at every call site, so r1's "no rewiring" and §3.5's "relax
the lock" contradicted each other with no specified mechanism): the function
gains an optional options argument, `getActiveWords({ignoreLock:true})`,
default-locked, used by EXACTLY two callers — the §3.5 choke-point backstop
and `vocabAccessStats`'s denominator. Every existing zero-arg call site
behaves identically; no other selector rewiring, no second scheduling gate,
no new scheduling authority.

### 3.5 The empty-pool defense (killing the v7.68 bug class by construction)

The v7.68 defect was `topic ∩ locked-pool = ∅` → "categories show random
words". The frontier lock composes with topic filters, so thin intersections
WILL occur (e.g. a niche topic whose words are all beyond the frontier). The
defense is deterministic and already half-built:

- **Corrected at synthesis (adversary catch: r1's widening rung lived on ONE
  surface only):** the spam ladder (15554–15561) is real, but Random Drill
  and the convo WORD_POOL have no ladder, and the frontier is computed in
  GLOBAL deck order while `getActiveWords()` applies theme/POS/register
  filters (3569–3572) — so frontier ∩ niche-filter could still empty a
  non-ladder surface: the exact v7.68 shape r1 claimed to kill. The backstop
  therefore moves **INTO the choke point itself**: inside `getActiveWords()`,
  after the lock filter, if the surviving pool is smaller than `minViable`
  (10), admit the next deck-ordered LOCKED words that pass the other active
  filters until the floor is met, appending them to `unlockedExtra` —
  **demand-unlock at the choke point**. Every consumer (spam, Random Drill,
  Blitz, WORD_POOL) inherits the floor with zero per-surface code; the spam
  ladder keeps its own rungs above it unchanged (they widen section/mastered
  filters, which the choke point cannot see).
- Invariant (acceptance-gate material): **no drill surface can ever render
  fewer words under the lock than `minViable`** — enforced at the single
  choke point, so an empty locked pool is unrepresentable on EVERY surface,
  not merely on the one that had a widening ladder.

### 3.6 Existing-user migration (the owner's 1,702-word profile)

- One-time versioned migration sets `vocabLock: true` and nothing else.
  Because `unlocked` is derived, the owner's history does the work: every word
  he has ever drilled or spoken (`attempts.length > 0`) is unlocked on arrival.
  His deck on migration day = his real vocabulary + an 80-word frontier —
  nothing he uses disappears, and the meter's `started` count is unchanged.
- Words he has browsed but never attempted grey out — one tap restores any of
  them (`unlockedExtra`). Zero data transforms, zero stats writes, fully
  reversible via the Settings toggle.
- Edge cases: `removedWords`/`suspendedWords`/`masteredWords` interact only
  through `getActiveWords`/existing filters — the lock is orthogonal (a
  mastered word is trivially started, hence unlocked). A profile with a
  restored old backup degrades gracefully: derivation recomputes from whatever
  `state.stats` says.

### 3.7 Commercial framing (what a paying user sees as progress)

- **The number that grows is "words unlocked"** — monotone, earned by doing,
  never by paying. The recap gains a `+N words unlocked` line (§5.3) making
  every session end with visible expansion.
- The lock makes the free/paid boundary *legible later* (Phase 1 can meter
  conversation minutes, never vocabulary — locking words behind payment would
  be the "locked demo" anti-pattern the research report flags), while the
  frontier gives every user, free or paid, the same earned-progress contract.
- Meter + frontier + recap line replace nothing and add no screen — the
  progression story lives in surfaces that already exist.

---

## 4. Sensei layer (Task 2) 🔒 — explicit teaching that survives a mishear

### 4.1 What changes from Delve 7, exactly (AMENDS-D7)

Delve 7 locked recast-invisibility to protect flow: L3 (recast lives inside
`jp`, key is UI metadata), L4 (peek-only note, ≤8 English words, identical
pulse). The owner's mandate amends the *surfacing*, not the machinery:

- **KEPT verbatim:** six-key contract; confirm/recast/clarify repertoire;
  `_convoNormFeedback`'s deterministic gauntlet (score cross-check, echo
  guard, throttle, note scrub); recast spoken inside `jp` by TTS; identical
  gold pulse; no counters/tallies; feedback never writes SRS (L7); no second
  API call.
- **AMENDED (AMENDS-D7 L4):** when a teach qualifies (§4.3), the explanation
  becomes **explicit and self-opening** — a teach card with the why — instead
  of a tap-to-peek 8-word note. The peek remains the fallback rendering for
  recasts that don't reach teach grade.
- **NEW:** a `why` field (the X..Y..Z), a spoken one-breath teach line, a
  session teach log feeding the recap (§5.3).

### 4.2 The contract change — one optional sub-field, not a new schema

The top-level contract stays **six keys exactly** (ADR-011's staged-extension
constraint). `feedback` gains one optional sub-field:

```json
"feedback": {
  "type": "confirm" | "recast" | "clarify" | "none",
  "heard": "<learner's phrase as understood, kana-only>",
  "better": "<the natural kana form — recast only>",
  "note":  "<≤8 English words naming the nuance>",
  "why":   "<recast only, optional: ≤25 English words explaining WHY the
            natural form is used — the because. Kana for any Japanese
            example. Nuance direction (formality/tense/direction/
            state-vs-event) named explicitly. Never a verdict word.>"
}
```

Preamble rule additions (exact contract language for the forge): `why` is
offered **only** when you are confident the learner actually said `heard`
(speech recognition may mishear — when unsure, omit `why` or use clarify);
`why` explains the Japanese, never evaluates the learner; the ADR-009 banned
list applies to `why` verbatim.

**Cost sizing (the latency attack — design ESTIMATES, not measurements;
re-labelled at synthesis on an adversary catch):** +~6 preamble lines ≈ +70
input tokens on a ~1.4k preamble. Output: `why` ≈ +30–40 tokens, on recast
turns only (≤1-in-3 by the existing throttle). `max_tokens` in `_convoCall`
(9492) bumps 500 → 560. Worst-case RTT impact ≈ +0.2–0.4s on teach turns —
inside ADR-009's 5s max, masked by the think ladder. These figures are
unmeasured arithmetic; **S1's acceptance includes measuring the actual keyed
RTT delta on teach turns** before S2 ships. **First cut on any measured
regression is `why`** (falls back to Delve-7 note-only recast); the schema
stays.

### 4.3 When a teach fires — a STRICTER gate than the recast it rides

A **teach** is a recast that clears additional deterministic hurdles in
`_convoNormFeedback` (client-owned, never prompt hope). The full rung ladder,
strongest evidence to weakest:

| Rung | Evidence state | Surfacing |
|---|---|---|
| **teach** | recast survived score gate + throttle, `better` ∈ `jp`, echo guard **positively matched** (bigram overlap confirmed, 9684–9689), AND model supplied a scrub-clean `why` | teach card auto-opens (§4.4) + spoken teach line (§4.6) |
| **implicit recast** (Delve 7 behavior) | recast survived, but echo guard **abstained** (transcript stripped to <2 kana — overlap unverifiable) or `why` absent/scrubbed | underline glow + tap-to-peek, exactly as shipped |
| **clarify** | score 1, or model judged the transcript garbled | clarification question spoken, owns the confusion |
| **none/confirm** | everything else | gold pulse / nothing |

The key inequality: **explicit teaching demands positive transcript
corroboration; invisibility is the ceiling for unverifiable turns.** Delve 7's
abstain rule let a recast *stand* when the echo guard couldn't verify (9642 —
correct for an invisible enrichment); an *explanation* confidently delivered on
unverifiable evidence is exactly the phantom-error lecture the charter bans, so
abstain now caps surfacing at the implicit tier. Clarify-degrade is thereby
strengthened, not weakened: the mishear ladder gains a rung *below* teach
before anything is explained.

**What the echo guard does and does NOT corroborate (scoped honestly at
synthesis; adversary catch):** the guard (9684–9689) compares the TRANSCRIPT
to the model's `heard` — two renderings of the same STT output — so a
positive match proves only that the model reasoned about what STT delivered
(it kills a model-INVENTED `heard`), never that STT heard the learner
correctly. An STT-level mishear, where transcript and `heard` carry the same
error, passes the gate by construction. The containment for THAT class is
not the gate but the evidence surfaces: the card's 「きこえたのは」 line, the
spoken breath naming the heard form (§4.6), the model-side
plausibility/clarify rules (9422), and the 1-in-3 throttle. §4.5 cases 1 and
4 are exactly this residual, and they are accepted BECAUSE the evidence
self-discloses — not because the gate prevents them. "Positive transcript
corroboration" therefore means corroboration against the transcript-as-
delivered, and nothing stronger.

### 4.4 Where the explanation lives — the teach card (and why the alternatives lost)

| Candidate | Verdict | Why |
|---|---|---|
| Inline spoken full explanation (partner speaks the X..Y..Z) | **rejected** | 2 sentences of English mid-loop breaks the audio rhythm that IS the app, and breaks the kana-only partner persona (the partner is a Japanese friend, not a lecturer — the *sensei voice is the app's, not the character's*). |
| Tap-"why?" expansion of the existing peek | **rejected as the primary** | That's opt-in invisibility with an extra step — the owner's verbatim is "it will TELL you"; a hidden expander re-creates the void for anyone who doesn't tap. Survives as the fallback tier (§4.3). |
| Recap-only teaching | **rejected as the primary** | Feedback displaced entirely to the recap is pre-ADR-011 behavior; the owner already rejected that void. The recap is the *depth* home (§5.3), not the only home. |
| **Visual teach card under the reply + one spoken breath** | **LOCKED** | Explicit without hijacking the loop: the card renders in dead time (the 2–6s think gap + mic re-arm), reading is optional, audio carries one short line, depth waits in the recap. |

**The teach card** (auto-opens on teach-grade turns, replaces the peek sheet
rendering at 11082 for that turn; ephemeral — dismissed on next turn like
`_recastPeek` today):

```
🖋 きこえたのは: 「きのう すし たべる」          ← heard (evidence, always shown)
   しぜんな いいかた: 「きのう すし を たべた」   ← better (kana, bold)
   Why: yesterday = past, so たべる → たべた.     ← why (≤25 EN words)
   Nuance: casual past — polite is たべました.    ← note (the pairing doctrine)
```

- Line 1 **always shows the evidence** (`heard`). This is the deepest
  false-teach containment: a phantom teach self-discloses its input
  (「きこえたのは」 = "what I heard" — the card owns the hearing, style-guide
  class-2 discipline imported into a class-1 surface without verdict words).
  The learner can see at a glance "that's not what I said" and discount it —
  the app's ear takes the blame, never the learner's mouth.
- English chrome, kana content (v8.22): labels + why in English, forms in kana.
- Card copy templates are fixed strings; `heard/better/why/note` are
  model-derived and render **esc()-escaped only** (same discipline as
  `_renderConvoRecap`, 11175); `why` additionally passes the banned-word scrub
  (9666's regex, applied to `why` in the normalizer) and a 160-char hard cap.
- No history stack on screen: one card at a time, replaced next turn. The
  session's teach history lives in `cv.teachLog` (§5.3) — data, not UI.

### 4.5 The false-teach (mishear) attack, walked concretely

1. **Truncation:** learner says 「きのう すし を たべました」, STT emits
   「きのう すし を たべま」. Model plausibility rule says truncation →
   clarify (9422, kept). If the model recasts anyway with a confident `why`
   ("polite past: tabemashita"): echo guard positively matches (たべ overlap)
   → teach fires. Containment: the card leads with
   きこえたのは「…たべま」 — the learner sees the phone dropped a syllable;
   the why ("polite past is tabemashita") is *about Japanese*, states a true
   fact, and evaluates nobody. Failure mode degraded from "confident
   explanation of a phantom error" to "true information delivered on visibly
   wrong evidence" — mildly redundant, not wounding. This residual is
   irreducible client-side (the client cannot know truth) and is accepted
   *because* the evidence line makes it self-correcting.
2. **Kanji-heavy final:** STT returns kanji, `_stripKanji` empties it → echo
   guard abstains → **teach ineligible** (§4.3), implicit recast only. The
   phantom-lecture path on unverifiable audio is structurally closed.
3. **Garbled:** model follows the garble rule → clarify; score 1 → the
   normalizer forbids recast entirely (9669–9671). No teach can exist below
   score 2 — unchanged, deterministic.
4. **Wrong-word mishear with overlap** (learner said おさけ, STT heard おさら):
   worst case — teach fires explaining the wrong word. Containment as (1):
   evidence line + judgment-free register + 1-in-3 throttle bounds exposure;
   and the spoken line (§4.6) always names the heard form, so even audio-only
   users get the evidence. Residual accepted and monitored via the keyed probe
   (§4.8).

### 4.6 TTS behavior — the partner stays in character; the sensei gets one breath

- The **partner voice** (JP TTS, `_convoSpeakJP` 9724) speaks only `jp` —
  unchanged. The natural form is still *heard in context* inside the reply
  (Delve 7 L3 kept).
- On teach-grade turns only, after `jp` finishes and **before the mic re-arms**,
  a new `_speakTeachLine` helper speaks **one English breath, ≤12 words**,
  derived client-side from fixed templates + `heard`/`note`/`better` (never
  raw free-text), and **evidence-first — the template names the heard form**
  (synthesis fix: §4.5.4's audio-only containment depends on the spoken line
  carrying the evidence, and the r1 template dropped it): e.g. *"I heard:
  taberu — more natural: tabeta."* (≤12 words holds). Implementation:
  same `speechSynthesis` path with an EN voice pick (every Android/iOS ships
  EN voices; graceful no-op when TTS is unavailable, like `_convoSpeakJP`
  9732).
- Rationale: the owner's "it will tell you" is literal — hands-free users
  aren't looking at the card. One breath keeps the audio-led loop intact
  (adds ~2s on ≤1-in-3 turns); the full X..Y..Z is never spoken mid-loop.
- Skips: `forceChips` turns, `just-talk` dial position, and the recap. The
  patient-window clock starts after the teach line ends (mic never fights TTS).
- **This is its own shipping stage (S2, §6) with its own OFF ramp** — it is
  the single most flow-invasive element, so it must be independently
  pullable without touching the card.

### 4.7 Intensity dial, depth, and the owner-verbatim replay

- **Dial (extends Delve 7 L5, same three positions, still one hard-defaulted
  value, Settings row still deferred):** 「ただ はなす」= everything off
  (existing normalizer gate, 9662). 「ともだち」 **(default)** = full sensei:
  teach card + spoken line + implicit-recast fallback. 「しっかり」= reserved
  (recap teach cap raised; no extra mid-loop volume — *more* mid-loop teaching
  than default would cross into marking register). The dial's judgment-creep
  risk is unchanged from Delve 7 (DA-6): deferred row, no shame framing.
- **Depth per teach: exactly one nuance** (one `why`, one `note`). X..Y..Z is
  the recap's job (§5.3), where a moment can carry its full because without a
  clock running. One-point-per-correction is standard focused-CF practice —
  and it is what fits a card a learner glances at in 3 seconds.
- **What feeds SRS: nothing new (Delve 7 L7 kept verbatim).** `teachLog` (like
  `recastLog`, which it extends) → recap → opt-in practice-these → existing
  missed-drill pathway. A teach never writes `state.stats`.
- **Owner-verbatim replay:** *"if you say something incorrectly, or close, it
  will tell you"* → teach card auto-opens + one spoken breath, no tap needed.
  *"you say it like this with these words"* → better, in kana, spoken in the
  reply and shown bold. *"because of X..Y..Z"* → `why` on the card, full
  structure in the recap. *"and even mentions nuances"* → `note` line on every
  teach (pairing doctrine enforced by template — a teach card without a
  nuance line cannot render). **That is the SENSEI.**

### 4.8 Premature-depth honesty (ADR-011's un-validated base)

The keyed field session that validates F2 has still not run. The sensei layer
is deliberately shaped so that session can still measure everything ADR-011
gates, plus the new surface:

- The contract remains six keys; `why` is optional — a keyed session with
  Delve-7-era behavior is a strict subset (absent `why` ⇒ shipped behavior).
- Named dial-back levers, weakest-first: (1) pull S2 (spoken line) — one
  helper call; (2) demote the card from auto-open to tap-open — one flag;
  (3) drop `why` from the preamble — restores F2 exactly. None of these
  touches the vocab lock or the recap.
- The keyed probe protocol (Delve 7 §8 / ADR-011 gate) extends with two
  questions: "did the explanation help you say it better?" and "did any teach
  feel like being marked?" — the second failing **in ≥2 of the 5 keyed
  sessions** (same denominator as ADR-011's "≥3 of 5" gate; synthesis fix —
  bare "twice" was window-less and untestable) triggers lever (2)
  automatically.
- **Deterministic fixture gate (synthesis addition, mirroring ADR-011's own
  ≥12-case discipline):** S1 ships with a **≥12-case fixture set** exercising
  the teach/implicit/clarify ladder — positive echo-match, abstain
  (kanji-stripped <2 kana), scrubbed `why`, absent `why`, over-length `why`,
  score-1, throttle-suppressed, and banned-word probes — and the normalizer
  must land every case on the correct rung in **100%** of runs. Client-side,
  keyless, runnable in CI/console.
- **Cohort honesty (named, not hidden):** the keyed probe samples the owner —
  a 7th-year self-directed learner, not a nervous first-time beginner.
  Auto-open teach stays defaulted ON through the probe; the beginner-
  population check is ADR-012/ADR-013's first-real-user-cohort reversal
  triggers, which sample exactly that population.

---

## 5. Teaching loop (Task 3) 🔒 — one loop, closed through existing pathways

### 5.1 The composed loop

```
speak ──▶ teach (card + breath)          [sensei, §4]
  ▲            │
  │            ▼
  │       absorb: recap "what you learned" + opt-in practice-these
  │            │                          [recap, §5.3 → existing missed-drill]
  │            ▼
  │       drill/speak writes state.stats  [existing recordAttempt/smGrade]
  │            │
  │            ▼
  └──── unlock: frontier advances ◀── started words leave the frontier [lock, §3]
              (WORD_POOL + chips now seed from the grown deck → speak with more words)
```

Every arrow is an existing pathway or a §3/§4 lock — the loop adds **zero new
screens, zero new modes, zero new schedulers**. The Library stays dead; the
recap and the deck do the composing.

### 5.2 Do teaches accelerate unlocks? **No — locked.**

A teach never advances the frontier directly. Rationale (decision-forcing, not
hedging): (a) teach targets are model judgments over possibly-misheard
transcripts — wiring them to unlocks makes STT a grader *by proxy*, the exact
doctrine violation L7 exists to prevent; (b) if corrections earned unlocks,
being corrected becomes instrumentally *good*, which quietly converts the
teaching register into a scoring economy (judgment-creep through the back
door); (c) the loop already closes without it — a taught form practiced via
the recap's one-tap drill writes real attempts, and *those* unlock. Teaching
informs; **doing unlocks.** The sensei teaches *toward* the frontier only in
the soft sense that WORD_POOL (due-first from the unlocked deck) keeps the
conversation anchored where the learner's edge is.

### 5.3 The recap becomes the daily "what you learned" surface

Builds directly on v8.24's recap (blocks at 11217–11223 「You said」, 11191
notes) — extended, not redesigned:

- **cv.teachLog** (supersedes-and-extends `recastLog`, same cap-10 shape,
  10085–10087): `{heard, better, note, why, taught:bool}` — every recast
  logged, teach-grade ones flagged.
- Recap block order: 🗣 **You said** (saidHighlights, exists) → 🖋 **What you
  learned today** (≤3 teach moments, celebration-register: better bold in
  kana, why + nuance under it — the full X..Y..Z home) → **+N words unlocked**
  (frontier delta this session, §3.7) → practice-these (exists, now fed
  teach-first via the same `_recapNotes` seam at 10224–10230).
- This IS the daily surface: session-end is the one moment depth costs no
  flow. No standalone "lessons learned" screen — the recap is already visited,
  already celebration-first, already opt-in to drilling.
- Grind check: on a session with zero teaches and zero unlocks, both blocks
  simply don't render (the recap shrinks to today's shipped shape) — no empty
  states, no guilt.
- **Steady-state honesty (synthesis addition — the charter's "walk a week"
  probe extended to the end of the road):** when the deck is exhausted (all
  ~1,702 words started) the frontier is empty and "+N words unlocked"
  permanently stops appearing — by the same empty-safe rule as the grind
  check, it stops rendering rather than showing +0. That is graduation, not
  grind: the growth number hands over to the meter's `started → mastered`
  fill (which keeps moving for months after the last unlock), and deck growth
  (new packs; OQ-6's ranked order) re-opens the road. No new surface needed;
  the commercial framing (§3.7) rests on TWO axes and only one retires.

### 5.4 Owner-verbatim replay (the loop)

*"feedback is how you learn essentially"* → every correction now has a
because, a nuance, a recap home, and a one-tap route into practice; practice
grows the deck; the deck grows the conversation. The learner can narrate their
own progress: "I said it → it taught me → I drilled it → new words opened →
we talked about more." That narration is the Conversational-Core loop the
north star asks for.

---

## 6. Implementation sketch — staged shipping order

Each stage shippable alone; each independently revertible; order = owner pain
× risk. All changes additive to `index.html`; existing sessions survive every
stage (new `cv.*`/settings fields guard-defaulted on read).

### Stage S1 — Teach card (the sensei's face; no audio change, no lock)
- `_convoPreamble` (9407–9434): `why` sub-field + rules (§4.2).
- `_convoCall` (9492): `max_tokens` 500 → 560.
- `_convoNormFeedback` (9654–9697): `why` scrub (banned regex + 160-char cap);
  teach eligibility flag — positive-echo-match required, abstain ⇒ implicit
  tier (§4.3). Returns/mutates `feedback.teach = true|false`.
- `convoTurn` bookkeeping (10076–10093): `cv.teachLog` replaces `recastLog`
  writes (same seam; `recastLog` name kept as alias for one version to spare
  the recap fallback).
- `renderConvo` (11069/11082 region): teach card component auto-opens when
  `cv.feedback.teach` (ephemeral, esc()-only interpolation); non-teach recasts
  keep the shipped underline+peek unchanged.
- Migration: none. Absent `why` ⇒ shipped F2 behavior byte-for-byte.

### Stage S2 — The spoken breath (own stage, own OFF ramp)
- `_speakTeachLine(fb)` helper: template-derived ≤12-word EN line; EN voice
  pick with graceful no-op; sequenced after `jp` TTS `onDone`, before the
  patient-window mic arm (the existing hands-free continuation seam in
  `_convoSpeakJP`'s onDone chain, 9744–9748).
- Skip conditions: `forceChips`, `just-talk`, recap, TTS-unavailable.
- Pull lever: delete one call site. Nothing else references it.

### Stage S3 — Rolling-frontier vocab lock
- `getActiveWords()` (3564): `vocabLock` filter — derived unlocked set
  (started ∪ `unlockedExtra` ∪ frontier(80), deck-ordered) — plus the
  **in-function `minViable` backstop with demand-unlock write-back (§3.5)**
  and the optional `{ignoreLock:true}` argument (two callers only, §3.4).
  Memoize per render pass if profiling demands (1,702 × stats lookups is
  cheap but hot).
- **`convoApplyScore` resolver widening (§3.3 — REQUIRED for L3's
  speech-promotes path; synthesis addition):** fallback resolution of
  `usedWords` against the full `state.words` registry (unique
  normalized-kana match only; ambiguous ⇒ dropped), and the `_convoPreamble`
  `usedWords` contract line (9412) grows to admit kana surfaces of
  clearly-used non-pool words. Without this, speech cannot unlock.
- `buildGenerateVocabSpamLesson` tries ladder (15554–15561): unchanged above
  the choke-point backstop (its rungs widen section/mastered filters, which
  the choke point cannot see).
- Browse/search word rows: greyed 🔒 state + tap-to-add for locked words.
- Coverage meter (20736–20749): re-label to `unlocked / total`, fill =
  started; `vocabAccessStats` (6777) reads `getActiveWords({ignoreLock:true})`
  for the denominator (the `total: active.length` return at 6791) so `total`
  stays 1,702-shaped under the lock (§3.4 meter row).
- Settings: `vocabLock` toggle row (escape hatch); default ON for new
  profiles.
- Migration: one-time versioned flag-set `vocabLock: true` for existing
  profiles (§3.6). Derivation does the rest; fully reversible.
- **Ships after S1/S2 deliberately:** the sensei is the owner's hottest ask
  and carries no data-shape risk; the lock touches every drill surface and
  deserves its own release + probe window.

### Stage S4 — The loop's recap close
- `convoEnd` (10236–10256): recap gains `taught` (≤3 teach moments from
  `teachLog`) + `unlockedDelta` (frontier ids started this session — computed
  by diffing a session-start snapshot `cv._startedSnapshot`, captured in
  `startConvo`).
- `_renderConvoRecap` (11176): 「What you learned today」 block + 「+N words
  unlocked」 line, both empty-safe (§5.3); practice-these seam reads
  teach-first (10224 region, existing fallback preserved).
- Migration: old recaps lack the fields → blocks don't render (existing
  pattern, e.g. `saidHighlights` guard at 11217).

**Keyed probe placement:** the ADR-011 keyed field session runs **after S1+S2**
(it validates F2 *and* the sensei surface in one protocol, §4.8) and **before
S3 ships to the owner's profile** — so the lock's migration lands on a
validated conversation layer, and any sensei dial-back (§4.8 levers) is
settled before the release that touches every drill pool.

---

## 7. Decisions reached (locks)

| # | Lock | Where |
|---|---|---|
| L1 | ADR-003 resolves to the **hard-lock arm** via its own reversal trigger (owner's explicit request, 2026-07-19); the meter's derivation machinery is retained and re-labelled | §3.1, §3.3 |
| L2 | Lock shape = **rolling frontier at the `getActiveWords` choke point**: unlocked = started ∪ manual ∪ frontier(`FRONTIER_N`=80, deck-ordered); derived on read, no persisted word arrays beyond `unlockedExtra` | §3.3–3.4 |
| L3 | **Demand always wins — the lock has no refusal path:** speech promotes (using = unlocking — REQUIRES the S3 `convoApplyScore` resolver widening, a named build item, NOT shipped behavior), browse tap-to-add, thin pools demand-unlock via the choke-point `minViable` backstop inside `getActiveWords()`; empty-locked-pool unrepresentable on every surface | §3.3, §3.5 |
| L4 | Locked words render as **greyed teaser with visible horizon** ("X unlocked · Y on the road"), never invisible; `vocabLock` Settings toggle is the escape hatch; new profiles default ON | §3.3 |
| L5 | Existing-profile migration = flag-set only; history self-unlocks through the started-derivation; forms/particle drills untouched in v1 | §3.4, §3.6 |
| L6 | Sensei = **teach card** (auto-open, evidence-first 「きこえたのは」, better+why+nuance, esc()+scrub, ephemeral) + **one spoken EN breath ≤12 words**; partner voice never teaches; full X..Y..Z lives in the recap (AMENDS-D7 L4 surfacing) | §4.4, §4.6 |
| L7 | Contract stays six keys; `feedback.why` (≤25 EN words, recast-only, optional) is the only schema growth; `max_tokens` 500→560; first cut on RTT regression is `why` | §4.2 |
| L8 | **Teach gate is stricter than recast:** positive echo-match required; abstain caps surfacing at Delve-7 implicit tier; clarify-degrade gains a rung below teach; no teach below score 2 ever | §4.3, §4.5 |
| L9 | Depth = exactly one nuance per teach; nuance line mandatory on every teach card (pairing doctrine enforced by template) | §4.7 |
| L10 | Dial extends D7 L5 unchanged in posture: 「ともだち」 hard-default carries the full sensei; Settings row still deferred; 「しっかり」 adds recap depth only, never more mid-loop volume | §4.7 |
| L11 | **Teaches never unlock and never write SRS** (D7 L7 kept): teaching informs, doing unlocks; the loop closes through recap → practice-these → attempts → frontier | §5.2 |
| L12 | Recap is the loop's daily surface: You-said → What-you-learned (≤3, full why) → +N-unlocked → practice-these; zero new screens/modes; empty-safe | §5.3 |
| L13 | Ship order **S1 card → S2 breath → S3 lock → S4 recap close**; keyed probe after S1+S2, before S3; each stage independently revertible with named levers | §6, §4.8 |

## 8. Open questions still open

- **OQ-1:** `FRONTIER_N = 80` is a design estimate anchored to ADR-003's
  variety floor — field-tune against the owner's felt "controlled" (the whole
  point); only the frontier *mechanic* is locked. **Promoted at synthesis:**
  the 80-vs-owner's-1,500 gap is now an explicit ADR-012 signoff item (§3.3),
  not merely a tuning note.
- **OQ-2:** EN TTS voice availability/quality for the spoken breath on
  non-Pixel Androids — cheap device probe alongside the existing OQ-3 (D7)
  device pass; fallback = card-only (lever 1).
- **OQ-3:** Does Haiku produce *good* `why` lines (true, one-point, ≤25
  words)? Prompt-iteration risk, not architecture risk; measured in the keyed
  probe; fallback = template-composed why from `note` (client-side).
- **OQ-4:** Teach-card legibility at phone widths with four lines — forge-time
  visual call (mirrors D7 OQ-2).
- **OQ-5:** Should the browse screen's locked-word grey state show en-glosses
  or fully tease? (Commercial curiosity vs overwhelm — defer to forge + a
  glance test.)
- **OQ-6:** Frontier ordering = pack order today; a frequency-ranked order
  would be pedagogically better — needs a ranked list that doesn't exist yet;
  parked until after S3 proves the mechanic.
- **OQ-7:** Does the demand-unlock write-back (§3.5) need a visible toast
  ("+12 words joined your deck") or is silence better? Probe-time call.

## 9. Foundation doc updates

*(Framed here; applied at synthesis/later items, not by this doc.)*

- `INDEX_ROADMAP.md`: the "Vocab hard-lock vs meter deep-dive" open row and
  the ADR-003 backlog row (INDEX_ROADMAP:26,30) resolve to → this doc + the
  ADR-012 proposal; new open-work row "Delve 8 sensei+vocab locks → forge
  stages S1–S4 (doc §6)".
- `docs/decisions-pending/ADR-003`: status note — reversal trigger fired
  2026-07-19 (owner explicit request); superseded by the Delve-8 resolution
  ADR (below). Pointer only, no rewrite.
- `docs/decisions-pending/ADR-011`: pointer note — sensei layer (Delve 8)
  stacks on this pending ADR; the keyed acceptance gate extends per §4.8;
  gate protocol now also covers the teach surface. No rewrite.
- `docs/specs/correction-copy-style-guide.md`: class-1 row gains the teach
  register (evidence-first card copy, 「きこえたのは」 owns the hearing;
  banned list applies to `why`); re-run the audit sweep when S1 ships (the
  guide's own standing rule).
- `docs/delve-cycles/7-feedback-soul.md`: no in-place edit; AMENDS-D7 entries
  (L6/L8 here) live in this doc and the eventual ADR, per delve convention.

## 10. ADR proposals (heuristic policy — placeholders only, filed at synthesis)

- **ADR-012 (propose at synthesis): Vocabulary access is a rolling-frontier
  hard lock (resolves + supersedes pending ADR-003).** Scope: L1–L5. Load-
  bearing: reshapes deck admission for every drill surface + the conversation
  seed pool, defines the commercial progression contract ("words unlocked" as
  the growth number), and carries a migration touching every existing profile
  — costly to reverse post-launch (the charter's own framing). Must record:
  the ADR-003 reversal trigger firing as the governance route; the
  no-refusal-path invariant as the acceptance-gate core (0 refusal surfaces;
  no selector below `minViable`; meter total = derivation for 100% of filter
  combos); reversal trigger (numeric): if within the first real-user cohort
  ≥3 of 10 report the lock as friction, or the owner flips the escape hatch
  and leaves it off ≥3 sessions, revert default to meter-only (the derivation
  makes reversal a flag-flip).
- **ADR-013 (propose at synthesis): The sensei layer — explicit teaching
  surface (amends Delve 7's invisibility lock; stacks on PENDING ADR-011).**
  Scope: L6–L10. Load-bearing: schema growth + a new rendered surface + a new
  TTS behavior + the recap pathway move together, and it amends the surfacing
  posture of a promoted delve lock. **Flag prominently: this stacks on an
  ADR that is itself pending an un-run keyed acceptance gate** — ADR-013 must
  merge its gate into ADR-011's keyed protocol (one field session validates
  both layers, §4.8/§6) rather than minting a second un-runnable gate; its
  reversal levers are the §4.8 dial-backs, ordered and named.
- **Everything else stays inline decision-notes** (this doc, §7): teach-gate
  strictness (L8) is normalizer tuning inside standing doctrine;
  teaches-don't-unlock (L11) is an application of the existing
  STT-not-a-grader + L7 doctrines; recap composition (L12) and ship order
  (L13) are sequencing craft. None meets the costly-to-reverse bar alone;
  minting ADRs for them would be inflation.

---

## Synthesis (Round 1 — Delve 8)

Panel: devils-advocate (FAIL, 7 findings) · qa-tester (WARN, 7) ·
code-reviewer (FAIL, 5). Every citation was re-verified against
`index.html` v8.25 and the named docs before adoption; the fixes for every
**accepted** finding are applied inline above (marked "synthesis"). The
panel's unanimous FATAL was real and is the round's headline correction.

### Dispositions — devils-advocate

| # | Finding | Disposition | Rationale |
|---|---|---|---|
| DA-1 | "Using a word IS unlocking it" false by construction (FATAL) | **accepted** | Verified: `convoApplyScore` resolves only against `cv.pool` and silently drops the rest (10175); contract asks for pool ids only (9412). r1 presented a required build change as existing behavior. Fixed: §3.3 corrected; S3 gains the resolver-widening + contract change as a REQUIRED item; L3 re-worded; carried into ADR-012's acceptance gate. |
| DA-2 | Echo guard cannot detect STT mishears (SERIOUS) | **accepted** | Verified 9684–9689: transcript vs model-`heard` are correlated by construction; the guard only kills model-invented `heard`. Fixed: §4.3 now scopes the claim honestly — STT-level mishear containment is the evidence surfaces (card line + spoken heard-form + clarify rules + throttle), not the gate. |
| DA-3 | Owner asked 1,500; design ships 80 and reframes the number (SERIOUS) | **accepted** | Verified charter:9 verbatim + ADR-003 Decision §6 "literal reading". The mechanic is N-agnostic but the 20× divergence is the owner's call, not the delve's. Fixed: promoted from OQ-1 to an explicit ADR-012 signoff item presented side-by-side (§3.3); 80 stays the proposal only. |
| DA-4 | "Empty-pool unrepresentable" overclaims — rung on one surface only (SERIOUS) | **accepted** | Verified: ladder exists only in `buildGenerateVocabSpamLesson` (15554–15561); `startRandomDrill` (15606) has none; frontier-order vs `getActiveWords` filters (3569–3572) interplay was unspecified. Fixed: §3.5 moves the `minViable` backstop INTO `getActiveWords()` so every consumer inherits it; frontier declared global-deck-ordered with the choke point handling intersections. |
| DA-5 | Audio-only teach drops the evidence line §4.5.4 depends on (SERIOUS) | **accepted** | Verified doc-internal contradiction (§4.5.4 vs §4.6's r1 template naming `better` only). Fixed: §4.6 template is now evidence-first ("I heard: taberu — more natural: tabeta."), restoring the audio-only containment. |
| DA-6 | "Hard lock" may be a relabeled meter + narrowed draw (QUESTIONABLE) | **contested** | The meter re-labelling is display-only, but the lock's behavior deltas are concrete: a new profile's drillable deck is 80 words, not 1,702; Blitz NEW-card intake, Spam, Random Drill, and WORD_POOL all narrow to the unlocked deck; browse greys with tap-to-add. That IS deck-shape control, which is what the owner's instinct names. Whether 80-worth of control satisfies him is exactly the DA-3 signoff item — the residue of this finding folds there. |
| DA-7 | Sensei ships before ADR-011's base is keyed-validated (QUESTIONABLE) | **accepted-deferred** | Real sequencing risk, already priced in: §6 places the keyed probe after S1+S2 and BEFORE S3; §4.8's ordered levers (incl. full F2 restore) are the containment. Resolution defers to the keyed field session by design; no doc change beyond the §4.8 strengthening already applied. |

### Dispositions — qa-tester

| # | Finding | Disposition | Rationale |
|---|---|---|---|
| QA-1 | Speech-unlock claim unsupported by cited mechanism (FATAL) | **accepted** | Same defect as DA-1/CR-1, independently confirmed with the sharpest citation (9412's "pool word" contract). Fixed as DA-1. |
| QA-2 | Teach ladder lacks a deterministic fixture-test gate (SERIOUS) | **accepted** | Verified ADR-011:69's ≥12-case/100% precedent. Fixed: §4.8 gains a ≥12-case fixture gate over the teach/implicit/clarify ladder, 100% pass, client-side/keyless; carried into ADR-013's acceptance gate. |
| QA-3 | "Failing twice" reversal trigger window-less (SERIOUS) | **accepted** | Verified ADR-011:75's "≥3 of 5" precedent vs r1's bare "twice". Fixed: defined as "in ≥2 of the 5 keyed sessions" (§4.8); mirrored in ADR-013. |
| QA-4 | "15107 region" citation ~500 lines off (QUESTIONABLE) | **accepted** | Verified: actual call at 15630 (`startRandomDrill` 15606). Provenance found at synthesis: the stale numbers were inherited from ADR-003's older-revision read (its §Context cites 15107/7141/7205 against a 21,216-line index.html), i.e. recalled, not re-verified — the qa-tester's suspicion was exactly right. Table corrected. |
| QA-5 | "Week of the loop" never walked to steady state (QUESTIONABLE) | **accepted** | True: frontier exhaustion silently retires the "+N unlocked" axis. Fixed: §5.3 steady-state note — empty-safe non-render (graduation, not grind), growth hands over to the meter's started→mastered fill; §3.7's two-axis framing keeps one axis live. |
| QA-6 | Widening rung has no mechanism against zero-param `getActiveWords()` (QUESTIONABLE) | **accepted** | Verified zero-param signature at 3564; r1's "no rewiring" and "relax the lock" did contradict. Fixed: §3.4 specifies the single `{ignoreLock:true}` options-arg bypass (two callers) + the §3.5 in-function backstop — the invariant now has a testable mechanism. |
| QA-7 | Beginner validation rests on an owner-only probe (NITPICK) | **accepted-deferred** | True and now named in §4.8 (cohort honesty note); the beginner-population check is deliberately the ADR-012/013 first-real-user-cohort reversal triggers — deferred to the population that can actually answer it. |

### Dispositions — code-reviewer

| # | Finding | Disposition | Rationale |
|---|---|---|---|
| CR-1 | Speech-unlock not implemented by cited code (FATAL) | **accepted** | Same as DA-1/QA-1; CR adds the decisive point that the model never even HAS an id for off-pool words. The S3 fix covers both halves (contract + resolver). |
| CR-2 | Meter "unlocked / total" unreachable — total collapses under the lock (SERIOUS) | **accepted** | Verified: `vocabAccessStats` (6777) sets `active = getActiveWords()` (6778) and returns `total: active.length` (6791). Fixed: §3.4 meter row + S3 — denominator reads `getActiveWords({ignoreLock:true})`. |
| CR-3 | Random Drill citation does not verify (SERIOUS) | **accepted** | Duplicate of QA-4; corrected to 15606/15630 with provenance noted. |
| CR-4 | Forms-row citations (7141, 7205) do not verify (SERIOUS) | **accepted** | Substance verified with one correction to the finding itself: 7141 sits in `formCounts` (7128) — `blitzCounts` opens at 7150, 9 lines below CR's claim — but the material points hold: the cited lines demonstrate nothing about form drills, and Vocab Blitz DOES route through `vocabSectionFilter(getActiveWords())` (~7156) so it inherits the lock. Fixed: table row re-cited to `formEligibleVerbs` (7086, re-verified: no `getActiveWords` route — "untouched in v1" stands for forms/particles) + `startFormDrill` (8230), and a new Vocab Blitz row states the inherited lock as intended behavior (new-card intake = frontier). |
| CR-5 | Cost figures stated with unearned confidence (QUESTIONABLE) | **accepted** | Fixed: §4.2 re-labelled as unmeasured design estimates; S1 acceptance now includes measuring the actual keyed RTT delta before S2 ships; the first-cut-is-`why` lever unchanged. |

### Decision-notes (heuristic ADR gate — recorded here, no ADR minted)

- **Vocab Blitz inherits the lock; forms/particles stay independent.**
  Decision: Blitz's `getActiveWords()` route is kept under the lock (new-card
  intake = frontier — the desired pacing); form/particle drills stay outside
  it via `formEligibleVerbs`. Why: due words are started ⇒ unlocked, so Blitz
  reviews are untouched; only intake narrows. Reversal cost: trivial — one
  `{ignoreLock:true}` at Blitz's call site if field data objects.
- **Frontier exhaustion is a graduation state, not a grind state.** Decision:
  "+N words unlocked" simply stops rendering when the road ends; growth hands
  over to the meter fill; no new surface. Why: empty-safe is the recap's
  existing discipline. Reversal cost: local copy/render change only.
- **Spoken teach line is evidence-first.** Decision: the ≤12-word template
  names the heard form before the better form. Why: audio-only users' sole
  mishear containment. Reversal cost: template string edit.
- **§4.2 figures are estimates until S1 measures.** Decision: keep the
  arithmetic, label it, gate S2 on the measured keyed RTT delta. Why:
  unearned precision flagged by two heads. Reversal cost: none — it is a
  measurement obligation, not a mechanism.

The doc's §10 pre-declared notes stand as written: L8 (teach-gate strictness),
L11 (teaches-don't-unlock), L12 (recap composition), L13 (ship order) remain
inline decision-notes; none was promoted.

### ADRs filed by this synthesis

- **ADR-012** (`docs/decisions-pending/ADR-012-rolling-frontier-vocab-lock.md`)
  — rolling-frontier hard lock, resolves + supersedes pending ADR-003; carries
  the DA-1 resolver-widening as an acceptance-gate line and the DA-3
  FRONTIER_N signoff item.
- **ADR-013** (`docs/decisions-pending/ADR-013-sensei-teaching-layer.md`)
  — the sensei layer, AMENDS-D7 surfacing, stacks on PENDING ADR-011 (flagged);
  carries the QA-2 fixture gate and the QA-3 quantified reversal trigger.

Foundation patches this round: `INDEX_ROADMAP.md` (backlog row resolved to
this doc; ADR-012/013 added to live decisions; Delve-8→forge open-work row).
ADR-003/ADR-011 pointer notes (§9) are deferred to the promotion/forge step —
this synthesis touches no pending-ADR text other than filing the two new ones.
