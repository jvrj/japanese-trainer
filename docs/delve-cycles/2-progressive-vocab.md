# Delve 2 — Progressive Vocabulary Access for Isshin (Primary)

> Round 1 primary investigation doc. Opus-only. Decision-forcing: each task ends in a **LOCK**, not a survey. Adversary panel + synthesis follow as separate items; ADRs are FRAMED here, filed PENDING in synthesis.

---

## 1. Charter — scope + ground truth

### The ask (verbatim)
> *"being able to unlock MORE content on the app, as in more WORDS. for example, we have like 10000 words as a number, but if you just started learning, you only have access to 1500 for example. and as you progress in the app, however we can track that, more things unlock."*

The 10,000 figure is illustrative; the user confirmed the deck is smaller and doesn't need to be that big *yet*. The mechanic must **scale** as words are added, but doesn't require a giant deck to ship.

### Ground truth (verified in `index.html`, v7.77)
- **Deck:** ~**1,809 words** total (1,301 N5 · 488 N4 · 20 N3). Each `WORDS`/`N5_PACK` entry carries `jlpt`, `theme`, `pos`, `register`. Per-theme tag counts (verified by grep) drive the module sizes below.
- **A progressive-unlock system ALREADY EXISTS** as **theme modules**:
  - `MODULES` (line 6650): **11 modules**, theme-routed, last one `catchAll:true`.
  - `MODULE_UNLOCK_PCT = 80` (6665), `MODULE_MIN_TO_UNLOCK = 5` (6666).
  - `moduleProgress(moduleId)` (6759): graded mastery %, weighted by SM-2 bucket (`MODULE_MASTERY_WEIGHT`, 6758) so practice shows immediately but 80% still needs genuine maturity.
  - `moduleIsUnlocked(id)` (6798): first module always open; others gated by `unlockedModules` ∪ `unlockBypassed`; hidden modules always open.
  - `modulesMaybeUnlockNext()` path (6852–6860): when current module ≥ 80%, pushes next into `unlockedModules`.
  - **"Unlock anyway"** bypass (`unlockModuleAnyway`, 6886; `unlockBypassed` setting, 3005) — the existing anti-frustration escape.
  - `modulesUnlockBackfill()` (6827): on load, backfills `unlockedModules`/`currentModuleId` from existing mastery so returning users aren't re-locked.
- **The load-bearing seam is actually two functions, not one:**
  - `getActiveWords()` (3701) — the universal pool. Filters `removedWords`, `activeThemes`, `activePOS`, `activeRegister`, katakana. **It does NOT apply module gating.**
  - `getDrillableWords()` (3741) — wraps `getActiveWords()`, then strips suspended/mastered/non-drill-surface words **and applies module gating via `activeModuleWordIdSet()`** (3745, 3770–3775) — but **only for the `'all'` guided section**. Topic scopes, collections, and the mastered-review section deliberately **bypass** module gating (3749–3768, see v7.68 comment) so an explicit "study clothing now" doesn't return an empty pool.
  - `activeModuleWordIdSet()` (3815): returns the Set of word IDs in the current + every unlocked (+ hidden) module, or `null` (= no filter) when `modulesEnabled` is off.
  - **Correction to the charter's framing:** vocab gating lives in `getDrillableWords()`, not `getActiveWords()`. This matters for the integration sketch — the unlock filter must hook the *same layer* the module filter already uses, not the raw pool (otherwise composition surfaces — Build Mode, Sentences, おしゃべり seed — would suddenly lose locked words they currently keep).
- **A second progression meter already shipped:** おしゃべり `convoLevel`/`convoXp` (3007–3008, `convoLevelInfo()` 3098). It gates conversation *scenes* by `minLevel`. So two progress signals already coexist; a naïve vocab meter would be a **third**.
- **Invariants:** kana-only output [[feedback_no_kanji]]; single-file vanilla-JS PWA, no backend; persistence under `state.settings` (DEFAULT_SETTINGS 2961, save 3398, load 3417) or an own LS key — never bare `state.*`.

### The real problem
Not "invent an unlock engine" — **decide how progressive vocab access relates to the systems already here (theme modules, JLPT tiers, conversation level) without shipping a third overlapping progression bar, and make it legible.** The mechanic exists; it is just framed as opaque "modules" instead of a readable "X of Y words unlocked."

### Module word counts (verified — drives the unlock curve)
| # | Module | Themes | Words |
|---|--------|--------|------:|
| 1 | 👋 Greetings | greetings | 30 |
| 2 | 🍱 Food & Numbers | food, numbers, counters | 156 |
| 3 | 👨‍👩‍👧 Family & People | family, people | 110 |
| 4 | ⏰ Time & Travel | time, travel | 156 |
| 5 | 🏠 Home & Places | home, places | 138 |
| 6 | 🧳 Everyday Things | objects | 143 |
| 7 | 🌿 Body & Nature | body, weather, nature, animals, health | 180 |
| 8 | 🔤 Adjectives | adjectives | 78 |
| 9 | 🎨 Colors & Clothing | colors, clothing | 73 |
| 10 | 💼 Work, School & Tech | work, school, tech | 255 |
| 11 | 💭 Feelings & Expressions (catchAll) | feelings, grammar, adverbs, onomatope, phrases, verbpairs | 489 |

Cumulative unlocked-word curve (kana-only after katakana filter trims a little): **30 → 186 → 296 → 452 → 590 → 733 → 913 → 991 → 1,064 → 1,319 → ~1,809**. Day-one ≈ 1.7% of the deck — a genuinely small beginner slice, exactly the requested shape (the user's "1,500 of 10,000" maps to "30 of 1,809" here, and the curve scales as words are added).

---

## 2. Method

- **Opus-only** design/decision/prose → an implementation-ready spec a later `/hydra-forge` builds. No code is shipped in this delve.
- **Adversary panel (Round 1):** devils-advocate (LEAD — redundancy/third-bar attack, beginner pacing, do-nothing case, gameability), code-reviewer (filter integration + backward-compat + reuse-vs-reimplement), qa-tester (cold start, locked-content frustration, edge states, per-mode leak audit). Each ≤400 lines with file:line citations.
- **Synthesis ownership:** the synthesis head (a later item) verifies every adversary citation against `index.html`, dispositions each finding (adopt / contest / defer), locks the final design, updates the foundation memory, and files the ADR proposals PENDING under `docs/decisions-pending/`. This primary doc owns the *initial* locks; synthesis owns the *final* locks after adversarial pressure.

---

## 3. Core decision — extend / replace / layer the existing module system (Task 1)

> **REVISED (Synthesis R1 — see §14).** The premise under this lock is FALSE as written: the module gate is **OFF by default** (`modulesEnabled:false`, index.html:3025) and was **deliberately force-disabled for every user in v7.69** (index.html:3508) because the guided gate *was the source of the "random words" confusion* and "the user wants to tap any subject and drill it immediately." The core hands-free loop (Build-Mode Vocab Spam, Random Drill) does **not** route through the gate. Delivering "keep the module machinery as the gate" therefore requires reversing v7.69 + adding gating to the spam loop — re-risking a shipped fix and contradicting the app scope mandate. **Synthesis re-locks to a NON-LOCKING coverage meter (L1′).** Read §14 before building from this section.

### LOCK (original — SUPERSEDED by L1′): **A — Reframe & extend the existing theme-module system as THE vocab-access system.** Keep the module machinery as the gate; add a derived, legible "X of Y words" meter on top of it. **No new gating axis.**

**What happens to current module-unlock behaviour:** **KEPT, unchanged.** `unlockedModules`, `MODULE_UNLOCK_PCT=80`, `moduleProgress`, `modulesMaybeUnlockNext`, `unlockBypassed`, `modulesUnlockBackfill`, `activeModuleWordIdSet` all stay as-is. The vocab meter is a **read-only projection** of that state — it adds display, not a second source of truth.

### Why the alternatives lose
- **B — JLPT-tier gate (N5→N4→N3) as primary axis.** Rejected. The deck is 1,301 N5 / 488 N4 / 20 N3. A pure JLPT gate gives a brand-new user **all 1,301 N5 words at once** — that is not pacing a beginner, it's the dump the user explicitly wants to avoid. JLPT tier is too coarse to pace *within* the beginner band (which is the entire early experience). It also fights the user's stated principle that "modules must have words relative to the topic." JLPT can be a *secondary ordering hint* (prefer N5 words earlier — already implicitly true since early modules skew N5), but never the gate.
- **C — Frequency/importance-ranked single meter ("top N unlocked").** Rejected as the *axis*, **adopted for its legibility.** A flat frequency list throws away theme coherence (the user wants topical grouping) and requires a frequency rank we don't have for 1,809 words (sourcing/ranking is a content project, not a mechanic). But its *presentation* — a single "N of Total" number that grows — is exactly the legibility fix Option A was missing, so we borrow the **count-based meter** while keeping modules as the unit of unlock.
- **D — Hybrid (JLPT coarse gate + modules within).** Rejected. Adds a second gating dimension and the bookkeeping/legibility cost of two nested progress concepts, for no beginner-pacing benefit that A doesn't already deliver (early modules already skew N5). Violates the no-third-bar constraint in spirit.

### The unifying insight
The app already gates content by progress. The user's request is **already 80% built** — the missing 20% is **legibility** ("I can't see that I have 30 of 1,809 words and that finishing this module unlocks ~156 more"). So the correct move is *not* to build a parallel system (which would create the exact redundancy the devils-advocate will attack) but to **surface the existing one as a vocabulary-access meter.** This is the answer that satisfies the ask AND the no-third-bar constraint simultaneously.

---

## 4. Progress metric & meter reconciliation (Task 2)

### LOCK: **Vocab unlock is earned by module mastery % (the existing 80% gate). No new counter is introduced. The "vocab meter" is a DERIVED display, not a stored signal.**

**What earns more vocab:** reaching `MODULE_UNLOCK_PCT` (80%) graded mastery on the current module — the *existing* mechanic (`moduleProgress` → `modulesMaybeUnlockNext`). We reuse this verbatim. Rejected metric candidates and why:
- *mastered-word raw count* — already feeds `moduleProgress` indirectly; exposing it as a *second* gate would double-count.
- *conversation level/XP* — wrong domain (see reconciliation). Conversation depth ≠ vocab breadth.
- *total XP / session count* — **gameable** (the devils-advocate's gameability attack): sessions/XP can be farmed without learning the words. Mastery % is the least-gameable proxy because `moduleProgress` weights by SM-2 maturity (`MODULE_MASTERY_WEIGHT`), and 80% genuinely requires spaced reviews, not grinding. We explicitly choose the **non-gameable** metric.
- *a new dedicated counter* — rejected; it would be the third bar.

### Meter reconciliation — the two-axis model (this is the no-third-bar contract)
There are exactly **two progression axes**, in **two different domains**, each with **one derived display**:

| Axis | Domain | Stored signal (existing) | Derived display | Where it lives |
|------|--------|--------------------------|-----------------|----------------|
| **Vocabulary breadth** | how many *words* you can drill | `unlockedModules` + `moduleProgress` | **"X of Y words unlocked · next +N at 80%"** | Vocab home / a vocab-map view |
| **Conversation depth** | how *far* you can talk | `convoLevel` / `convoXp` | "はじめて→じょうず" tier bar | おしゃべり surface only |

**The vocab meter is `activeModuleWordIdSet().size` / `getActiveWords().length`** — computed live, zero new state. It is **not** a third bar because:
1. It reads the *same* `unlockedModules` state the module unlock already owns — it cannot drift from it.
2. It lives in the vocab domain; convoLevel lives in the conversation domain. They never appear side-by-side competing for the same screen real estate.
3. The existing per-module 80% mastery strip (line 19317) stays as the "next unlock at 80%" indicator — we relabel/reframe it, not add to it.

So the user sees **one number for "how much vocab"** and **one bar for "how far in conversation"** — two meters, two domains, no orphan third.

---

## 5. Starting allocation & step size (Task 3)

> **REVISED (Synthesis R1 — see §14).** "Day-one = 30 words" is factually wrong under the real default: `modulesEnabled:false` ⇒ `activeModuleWordIdSet()` returns `null` ⇒ the meter reads **1,809 of 1,809**, not 30. Under L1′ (non-locking meter) there is **no day-one lock**: the full deck stays drillable and the meter reports *coverage* ("0 of 1,809 mastered · 0 started"). The cold-start / anti-starvation question is therefore **moot** (nothing is starved when nothing is locked). The 30→186→… curve below applies ONLY to the opt-in `modulesEnabled:true` path, unchanged.

### LOCK (original — SUPERSEDED by L1′ for the default path)
- **Day-one allocation:** the **first module unlocked** (currently 👋 Greetings, ~30 words) — i.e. the *existing* default (`modulesUnlockBackfill` already unshifts `chain[0]` into `unlockedModules` and sets `currentModuleId = chain[0]`). No change to the default; we just surface it as "30 of 1,809 unlocked."
- **Step size:** **one module per unlock** (the existing chain). The visible step is "+N words" where N is the next module's size (e.g. finishing Greetings unlocks Food & Numbers = +156). This is more motivating than a fixed-count drip because the user sees a concrete topical reward.
- **Cap:** **unlock-to-end** — there is no hard cap; the 11th module completes the deck. The meter tops out at "1,809 of 1,809."
- **Anti-starvation guard (new, small):** 30 words is a thin cold-start for a hands-free drill loop (the QA + devils-advocate "starvation" attack). **Decision:** keep the *gate* at module 1 but seed the cold-start so drills don't feel repetitive — see Open Questions Q1 for the two candidate sizings; the primary recommendation is **start with module 1 unlocked + currentModuleId on module 1 (unchanged), and rely on the existing topic-scope bypass** (v7.68) so a beginner who explicitly picks any topic isn't blocked — but flag to QA whether the *guided* cold start should ship the first **two** modules unlocked (30 → 186) to give the spam loop enough variety. Locked default: **module 1 only**; the two-module starter is the fallback if QA's cold-start walk shows starvation.

**Rationale:** reusing the existing default means zero migration risk for the day-one path and a curve (30→186→…→1,809) that matches the requested "small slice grows over time" shape precisely.

---

## 6. `getActiveWords()` integration & backward-compat / migration (Task 4) — the load-bearing point

### LOCK: hook the unlock filter at the **`getDrillableWords()` / `activeModuleWordIdSet()` layer** (where module gating already lives), **NOT** at raw `getActiveWords()`. Reuse the existing `activeModuleWordIdSet()` — do not reimplement gating.

### Why not `getActiveWords()`
`getActiveWords()` is the *universal* pool that composition surfaces (Build Mode, Sentence Blitz, おしゃべり seed, Phrases) intentionally draw from **without** module gating today. Filtering locked words there would silently strip vocabulary from those surfaces and break the v7.68 topic-scope bypass. The unlock gate must apply **only on the drilling path**, exactly where `activeModuleWordIdSet()` is already consulted (`getDrillableWords` 3770–3775). **There is essentially no new filter to write** — the unlock state *is* `unlockedModules`, and `activeModuleWordIdSet()` already returns "current + unlocked words." The work is display + relabel, not a new gating branch.

### Data shape — where "unlocked-up-to" lives
**No new persistent field is required for the gate** — `unlockedModules` (array of module ids, already in `state.settings`, 3003) IS the unlocked-up-to record. We add only **display/config** settings under `state.settings`:
```js
// added to DEFAULT_SETTINGS (line 2961)
vocabMeterEnabled: true,      // show the "X of Y words unlocked" surface
// (no new gate state — unlockedModules + currentModuleId already exist)
```
If the anti-starvation "two-module starter" fallback is chosen, that is a one-line change to `modulesUnlockBackfill` seeding, not new state.

### Backward-compat / migration
- **Returning user with module progress + SRS history:** `modulesUnlockBackfill()` (6827) already reconstructs `unlockedModules`/`currentModuleId` from existing mastery on every load. A current user who has unlocked, say, 4 modules will immediately read as "452 of 1,809 unlocked" — **no re-locking, no loss of access.** This is the critical safety property and it is already implemented.
- **User who never used modules (`modulesEnabled` off):** `activeModuleWordIdSet()` returns `null` (= no gate) and the meter reads "1,809 of 1,809" (everything available). The meter must handle the `null` case as "all unlocked" so module-disabled users see no regression.
- **User with zero SRS history (brand-new):** backfill leaves them on module 1 → "30 of 1,809." Correct.
- **Migration step:** purely additive — `state.settings = {...DEFAULT_SETTINGS, ...loaded}` (3417) backfills `vocabMeterEnabled:true` for everyone automatically. **No data migration, no version bump gate, no destructive transform.** This is the cleanest possible backward-compat posture and is a direct consequence of choosing Option A (reuse) over a new engine.

---

## 7. Legibility & anti-frustration UX (Task 5)

### LOCK
- **Primary surface — a "Vocabulary" line on the home/start screen:** `🔓 30 of 1,809 words unlocked · finish 👋 Greetings to unlock 🍱 Food & Numbers (+156)`. One line, kana-safe (English chrome is UI, not Japanese content — consistent with existing UI labels). The "+N" makes the next reward concrete.
- **Optional vocab-map view** (reuse the existing module list UI at ~19317 which already renders per-module mastery strips + 🔒 locked footers, 19334): add a header total ("X of Y unlocked") above the existing module list. **Reuse, don't rebuild** — the module list already is the vocab map; it just needs the aggregate header to become legible as "vocab access."
- **Locked word the user wants:** **keep and surface the existing "Unlock anyway" escape** (`unlockModuleAnyway`, 6886; `unlockBypassed`). Extend its discoverability: the locked-module footer already exists (19334); ensure the home line's "next unlock" is tappable to the module list where "Unlock anyway" lives. Also: the v7.68 **topic-scope bypass** already means picking a specific topic isn't blocked by the gate — document this as the second escape hatch so a motivated user is never hard-walled.
- **Unlock celebration:** **mirror the existing module-unlock toast** (`showToast`, e.g. 6873) and the conversation level-up pattern (`leveledUpTo`, 3129). On crossing 80% and unlocking module N+1, fire a toast: `🎉 Unlocked 🍱 Food & Numbers — +156 new words!`. Reuse the existing toast machinery; do not build new celebration UI.

### Anti-frustration principles (for QA to pressure-test)
1. Never a dead end: every locked state has a visible escape (Unlock anyway + topic-scope bypass).
2. The reward is concrete and topical (+N words of a named theme), not an abstract bar.
3. The meter is honest: it reads the real `unlockedModules`, so it can't lie about access.

---

## 8. Deck-expansion scope (Task 6)

### LOCK: **OUT of scope for the build that follows this delve.** This delve + its forge build deliver the **mechanic only** — the legible meter + reframed module access — designed to **scale automatically** as words are added (the meter is `unlocked/total`, both computed live, so new words simply raise the denominator and flow into their theme's module via `moduleForWord`).

**Rationale:** 1,809 words is ample headroom for the unlock curve (30 → 1,809 is a long ladder). Sourcing/adding/ranking more words is a **content project** with its own quality bar (kana-only, theme/pos/register tagging, dedupe) and is independent of the access mechanic. Bundling it would bloat the forge build and couple a UI feature to a data-sourcing effort.

**Follow-up (note, not this build):** when motivation to "unlock more" outpaces the deck, file a separate content task — "expand the deck beyond 1,809 (N4/N3 fill, frequency-tagged)" — into `INDEX_ROADMAP`. The mechanic shipped here will absorb it with zero code change because new words route to modules by theme automatically.

---

## 9. Implementation sketch (for the forge build)

**No `index.html` changes in THIS delve — this is the spec the later `/hydra-forge` builds.**

### New/changed settings (under `state.settings`, DEFAULT_SETTINGS ~line 2961)
```js
vocabMeterEnabled: true,   // toggle the vocab-access surface
// unlockedModules / currentModuleId / unlockBypassed already exist — reused as-is
```

### New helpers (place near the module functions, ~6745)
```js
// Aggregate vocab-access numbers — pure derivation from existing state.
function vocabAccessStats(){
  const total = getActiveWords().length;                 // denominator (respects theme/pos/register/katakana filters)
  const set   = activeModuleWordIdSet();                 // null => modules disabled
  const unlocked = set ? set.size : total;               // null = everything available
  const cur   = moduleById(state.settings.currentModuleId || firstModule().id);
  const next  = /* next locked module in orderedModules() after cur, or null */;
  const nextCount = next ? moduleWords(next.id).length : 0;
  return { unlocked, total, cur, next, nextCount,
           pct: total ? Math.round(100*unlocked/total) : 100 };
}
```

### The filter hook
**None new on the gate.** Drilling already filters through `activeModuleWordIdSet()` in `getDrillableWords()` (3770–3775). Confirm (and add a regression note) that **all hands-free spam-loop / Recall / Nuance / Forms / Memory selectors route through `getDrillableWords()`**, not raw `getActiveWords()`, so locked words never leak into drills. (This is the qa-tester's per-mode leak audit; the sketch's only *code* obligation is to verify/repair any selector that bypasses `getDrillableWords()`.)

### Where it slots into `index.html`
1. **Home/start render** — add the one-line vocab-access surface using `vocabAccessStats()`; make "next unlock" tap to the module list.
2. **Module list view (~19317–19367)** — prepend an aggregate header ("X of Y words unlocked") above the existing per-module strips; relabel the existing 80% strip as "next unlock at 80%."
3. **Unlock event** (`modulesMaybeUnlockNext`, ~6858) — on a newly-pushed `unlockedModules` entry, fire the `showToast` celebration with "+N new words."
4. **DEFAULT_SETTINGS** — add `vocabMeterEnabled`.

### Migration step
Additive only: the existing `{...DEFAULT_SETTINGS, ...loaded}` merge (3417) backfills `vocabMeterEnabled`. `modulesUnlockBackfill()` (6827, already called on load) reconstructs unlock state for returning users. **No destructive migration, no version-gated transform.**

---

## 10. Decisions reached (locks)

- **L1 (Task 1):** Reframe & EXTEND the existing theme-module system as the vocab-access system (Option A). Module machinery KEPT unchanged; add a derived count meter. JLPT/frequency/hybrid rejected as gating axes (frequency's *presentation* borrowed).
- **L2 (Task 2):** Vocab unlock is earned by the existing 80% module-mastery gate. No new counter. The vocab meter is a DERIVED display (`activeModuleWordIdSet().size / getActiveWords().length`). Two-axis model: vocab breadth (modules) vs conversation depth (convoLevel) — two domains, no third bar.
- **L3 (Task 3):** Day-one = first module (~30 words, existing default). Step = one module per unlock, shown as "+N words." Cap = unlock-to-end. Anti-starvation fallback (two-module starter) deferred to QA's cold-start walk.
- **L4 (Task 4):** Hook at `getDrillableWords()`/`activeModuleWordIdSet()`, not raw `getActiveWords()`. `unlockedModules` IS the unlocked-up-to state (no new gate field). Migration is additive; `modulesUnlockBackfill` already prevents re-locking. Only new setting: `vocabMeterEnabled`.
- **L5 (Task 5):** One-line home surface ("X of Y unlocked · next +N"), reuse the module list as the vocab map, keep "Unlock anyway" + topic-scope bypass as escapes, reuse `showToast` for unlock celebration.
- **L6 (Task 6):** Deck expansion OUT of scope for the build; mechanic scales automatically; file content expansion as a separate `INDEX_ROADMAP` follow-up.

---

## 11. Open questions still open

- **Q1 (cold-start size):** Is module 1 alone (~30 words) enough variety for the hands-free spam loop on day one, or should cold start seed the first **two** modules (30 → 186)? Resolve via QA's cold-start walk.
- **Q2 (meter denominator):** Should the "Y total" denominator be the full deck (~1,809) or only the user's *active* filtered pool (`getActiveWords().length`, which shrinks if they've restricted themes/pos)? Recommendation: use the active-pool denominator so the meter stays honest under user filters — confirm with the user.
- **Q3 (catchAll module):** Module 11 (Feelings & Expressions, 489 words) is huge and `catchAll`. Should "100% unlocked" require mastering it, or should the meter treat catchAll specially so the deck reads as "complete" sooner? Defer to synthesis.
- **Q4 (modules-disabled users):** Confirm the meter's "everything unlocked" behavior when `modulesEnabled` is off is the intended UX (vs hiding the meter entirely).

---

## 12. Foundation doc updates (to apply in synthesis, not here)

- **[[project_japanese_trainer_scope_decision]]** — record: progressive vocab access is delivered by **reframing the existing theme-module 80% gate as a legible "X of Y words unlocked" meter** (Option A), NOT a new engine; two-axis progression model locked (vocab breadth via modules · conversation depth via convoLevel) — no third progress bar.
- (No change to [[feedback_no_kanji]] / [[feedback_japanese_trainer_spam_mode_template]] — invariants respected, not altered.)

---

## 13. ADR proposals (framed here; filed PENDING in synthesis)

> Framed as placeholders only. The synthesis item files these under `docs/decisions-pending/` after citation verification. NOT filed in this primary item.

- **ADR-P1 — "Progressive vocabulary access model & meter reconciliation."**
  - *Decision:* adopt Option A (reframe/extend theme modules as the vocab-access system); vocab unlock earned by the existing 80% module gate; vocab meter is a derived `unlocked/total` display; two-axis progression (vocab breadth vs conversation depth) with no third bar.
  - *Status:* PENDING. Load-bearing (defines the user-facing progression contract) → warrants a numbered ADR.
- **ADR-P2 — "getActiveWords unlock-filter & migration contract."**
  - *Decision:* gate on the drilling path only (`getDrillableWords`/`activeModuleWordIdSet`), never raw `getActiveWords()`; `unlockedModules` is the unlocked-up-to state; migration is additive and re-lock-safe via `modulesUnlockBackfill`.
  - *Status:* PENDING. Costly-to-reverse (touches the universal pool seam every drill uses) → warrants a numbered ADR.

---

*End primary doc — Round 1. Adversary panel and synthesis follow as separate delve items.*

---

## 14. Synthesis (Round 1 — Delve 2)

Synthesis head, fresh window. Every adversary citation was re-checked against `index.html` (21,216 lines) before adoption. **Citation-drift note:** both the primary doc and all three adversary docs were written against a slightly earlier `index.html` revision, so nearly every cited line number is **~22–23 lines low** relative to the current file (e.g. `modulesEnabled:false` is at **3025**, not the cited 3002/3485; `activeModuleWordIdSet` is defined at **6838**, not 3815/6815; `unlockModuleAnyway` at **6906**, not 6886/6883; `buildGenerateVocabSpamLesson` at **15046**, not 15023/15034). In every case the **quoted token exists verbatim** at the drifted location, so the findings are substantively verified; the line numbers are stale, not invented. The function-name error is real and corrected throughout: there is **no `maybeUnlockNext`** — the function is **`modulesMaybeUnlockNext`** (index.html:6871).

### 14.1 The load-bearing reversal

Three adversaries independently land the same FATAL: **the design's central premise is false.** Verified facts:
- `modulesEnabled` **defaults to `false`** (index.html:3025) and a **v7.69 one-time migration force-sets it `false` for every existing user** (index.html:3508), with the in-source rationale: *"The guided module-unlock path … was the source of the 'random words' confusion … The user wants to tap any subject and drill it immediately."*
- The **core hands-free loop does not route through the gate**: `buildGenerateVocabSpamLesson` (15046) builds its pool from `vocabSectionFilter(getActiveWords())`; `startRandomDrill` (15107) pulls from raw `getActiveWords()` and its own comment says it *"ignores section + module gating"* (15104); `blitzCounts` (7205) and `formEligibleVerbs` (7141) each consult the deck independently. Module gating applies only in the `'all'` branch of `getDrillableWords` and in scattered independent `activeModuleWordIdSet()` callers.

Therefore "keep the module machinery as the gate, add only legibility (the missing 20%)" is **not buildable as written.** It would require (a) reversing v7.69 by re-enabling `modulesEnabled` by default, and (b) adding module-gating to the spam / random / convo selectors — which **resurrects the exact "random words" defect the user already had fixed** ([[project_japanese_trainer_scope_modulelock]]) and **contradicts the app scope mandate** ([[project_japanese_trainer_scope_decision]]: "tap any subject and drill immediately"). The "20% legibility" framing collapses.

### 14.2 L1′ — the re-lock (supersedes L1)

**LOCK L1′: Progressive vocab access ships as a NON-LOCKING, derived *coverage* meter (the devils-advocate's gate-free option).** The default experience locks **no** words out of any drill. The meter answers *"how much of the deck have you opened up / are you working through"* by reading existing SRS state — e.g. **"`mastered` of `total` · `started` of `total`"**, plus per-theme coverage — a number that **grows as you progress** (and as the deck grows), which is exactly the "as you progress, more unlocks" shape the user asked for, *expressed as reach achieved rather than access withheld.* No `modulesEnabled` flip, no spam-loop change, no migration, no v7.69 reversal, no cold-start starvation risk.

Hard module-gating (`modulesEnabled:true`) remains the **opt-in** Settings path it is today — untouched, KEPT for users who want the ordered ladder. The 30→186→…→1,809 curve in §1/§5 describes that opt-in path only.

**Product tension flagged for USER SIGNOFF (DoD still open):** the user's verbatim ask ("you only have access to 1,500") literally implies *hard-locking*, which conflicts with the shipped scope decision + v7.69 fix. Synthesis cannot silently pick the locking interpretation because it reverses a shipped fix. L1′ delivers the *visible progression* the ask wants without that reversal. If the user, on signoff, confirms they want true hard-locking-by-default, that is a **separate, costed decision** (re-enable modules default + gate the spam/random/convo selectors + add a cold-start guard so day-one ≥ a viable variety floor + re-validate the v7.69 bug class) recorded in ADR-003's "rejected/deferred" arm — not in this build.

### 14.3 Disposition of every finding

**devils-advocate**
1. *FATAL — premise false (gate OFF by default + v7.69 force-off):* **ACCEPTED.** Verified 3025/3508. Drives L1′.
2. *FATAL — primary spam loop bypasses getDrillableWords/gating:* **ACCEPTED.** Verified 9590 / 15046 / 15104. There IS a new gating branch needed to lock — which L1′ avoids by not locking.
3. *SERIOUS — gate-free meter (Option E) never analyzed:* **ACCEPTED.** It is now the locked design (L1′).
4. *SERIOUS — §5 factual error (day-one reads 1,809/1,809, not 30):* **ACCEPTED.** §5 banner added.
5. *SERIOUS — re-enabling gate re-creates the "random words" bug:* **ACCEPTED.** Verified v7.69 comment at 3501–3507. Core reason L1′ does not reverse v7.69.
6. *QUESTIONABLE — "meter can't lie about access" is false:* **ACCEPTED.** Under L1′ the meter no longer claims access-locking, so it cannot overstate locking; §7 principle 3 reworded in spirit by L1′.
7. *NITPICK — "exactly two progression axes" undercounts:* **ACCEPTED-DEFERRED.** Rhetorical; soften to "two *primary* axes (coverage vs conversation depth) above several secondary stats." No build impact.

**code-reviewer**
1. *FATAL — modulesEnabled:false voids L3 day-one:* **ACCEPTED.** Dup of devils-1/4; drives L1′ + §5 banner.
2. *SERIOUS — wrong function name `maybeUnlockNext`:* **ACCEPTED.** Verified `maybeUnlockNext` does not exist; actual `modulesMaybeUnlockNext` (6871). Corrected throughout the doc.
3. *SERIOUS — `activeModuleWordIdSet()` cited at 3815, actually 6838:* **ACCEPTED.** Def confirmed at 6838 (reviewer's "6815" is itself ~23 low, same drift). The 3815 transposition is real.
4. *SERIOUS — "all modes via getDrillableWords" inaccurate; correct invariant is each selector calls `activeModuleWordIdSet()`:* **ACCEPTED.** Verified `formEligibleVerbs` (7141) calls `activeModuleWordIdSet` (7144) independently; ~10 independent callers exist. Under L1′ no refactor is attempted, so the mis-framed "route everything through getDrillableWords" audit is dropped entirely (it would have risked breaking form-drill's verb scoping, exactly as warned).
5. *QUESTIONABLE — `vocabAccessStats().next` is an unimplemented stub:* **ACCEPTED.** Relevant only to the opt-in module path now; if built there, `next` must traverse `orderedModules()` for the first module after `currentModuleId` not in `unlockedModules`, handling last-module/hidden-module as `null`. Recorded as decision-note.
6. *NITPICK — `unlockModuleAnyway` cited 6886, decl 6883:* **ACCEPTED.** Actual decl 6906; consistent drift.

**qa-tester**
1. *FATAL — modulesEnabled defaults false, feature ships broken:* **ACCEPTED.** Dup; drives L1′.
2. *SERIOUS — Vocab Spam never routes through getDrillableWords; locked words leak:* **ACCEPTED.** Verified 15046 / `vocabSectionFilter` 7004 / `if(!sec.themes) return words` 7016. Moot under L1′ (nothing locked), but the leak audit's factual core is correct.
3. *SERIOUS — startRandomDrill documents ignoring gating; absent from leak audit:* **ACCEPTED.** Verified 15104. Moot under L1′.
4. *SERIOUS — function name maybeUnlockNext vs modulesMaybeUnlockNext:* **ACCEPTED.** Verified 6871; corrected.
5. *SERIOUS — blitzCounts() home "unseen" bypasses gating; meter vs CTA contradiction:* **ACCEPTED.** Verified 7205 uses `vocabSectionFilter(getActiveWords())` without gating. Under L1′ both numbers are coverage-domain (unseen vs mastered/started), so they reconcile rather than contradict — the new meter must be worded as coverage, not access.
6. *QUESTIONABLE — vocabAccessStats next stub / "+N words" unspecced:* **ACCEPTED.** Same as code-reviewer-5; decision-note.
7. *QUESTIONABLE — Q2 meter denominator unresolved:* **ACCEPTED → RESOLVED.** Decision-note below: denominator = **active filtered pool** (`getActiveWords().length`) so the meter stays honest under user theme/POS/register filters.
8. *QUESTIONABLE — cold-start threshold deferred without numeric criteria:* **ACCEPTED-DEFERRED.** Moot under L1′ (no locking ⇒ no starvation). If hard-lock-by-default is ever chosen on signoff, the numeric floor lands in that follow-up (proposed: ≥ ~80 unique drillable words day-one before any lock ships).
9. *NITPICK — per-mode leak audit not enumerated; renderMemory is display not selector:* **ACCEPTED.** Correct distinction; moot under L1′ since the audit's purpose (no locked-word leak) is satisfied by *not locking*.

### 14.4 Decision-notes (local / cheaply-reversible — not ADR-worthy)

- **Meter denominator = active filtered pool.** *Decision:* the meter's "of Y" uses `getActiveWords().length` (post theme/POS/register/katakana filters), not the raw 1,809. *Why:* keeps the reading honest when the user restricts themes/POS. *Reversal cost:* one expression in `vocabAccessStats()`; trivial, local.
- **`vocabAccessStats().next` traversal spec (opt-in path only).** *Decision:* `next` = first module in `orderedModules()` after `currentModuleId` not yet in `unlockedModules`; `null` when none / hidden. *Why:* removes the blank stub the forge would otherwise hallucinate. *Reversal cost:* one helper; only reached when `modulesEnabled:true`.
- **No selector refactor.** *Decision:* do NOT rewire spam/random/convo/form selectors to route through `getDrillableWords()`. *Why:* under L1′ nothing is locked, and forcing the route would break form-drill's independent verb scoping (code-reviewer-4). *Reversal cost:* none taken; the path is left as-is.
- **getActiveWords/getDrillableWords hook contract is NOT promoted to an ADR.** *Decision:* the former ADR-P2 ("unlock-filter & migration contract") is downgraded to this note. *Why:* L1′ adds no gate to the default path, so there is no filter-seam contract to enshrine; the only persistent settings change is an additive display toggle. *Reversal cost:* if hard-locking is later chosen, ADR-003's deferred arm covers it.

### 14.5 ADR filed (PENDING)

- **ADR-003 — Progressive vocab access ships as a non-locking coverage meter** (`docs/decisions-pending/ADR-003-progressive-vocab-access-model.md`). Load-bearing: it defines the user-facing progression contract, preserves the v7.69 determinism/scope posture, and reverses this delve's original Option-A framing — other work will cite it. The earlier ADR-P1/ADR-P2 framing is consolidated into this one ADR (P2 demoted to a decision-note above).

### 14.6 Foundation docs

No repo foundation doc patched in this synthesis (the charter named none patchable; `docs/decisions/` is off-limits by invariant — and does not exist in this repo). The project-memory reflection into `[[project_japanese_trainer_scope_decision]]` is held until **user signoff** on L1′, since L1′ changes the answer the original delve recorded and the locking-vs-coverage tension is explicitly the user's call.

*End Synthesis — Round 1.*
