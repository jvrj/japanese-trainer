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
  - `maybeUnlockNext()` path (6852–6860): when current module ≥ 80%, pushes next into `unlockedModules`.
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

### LOCK: **A — Reframe & extend the existing theme-module system as THE vocab-access system.** Keep the module machinery as the gate; add a derived, legible "X of Y words" meter on top of it. **No new gating axis.**

**What happens to current module-unlock behaviour:** **KEPT, unchanged.** `unlockedModules`, `MODULE_UNLOCK_PCT=80`, `moduleProgress`, `maybeUnlockNext`, `unlockBypassed`, `modulesUnlockBackfill`, `activeModuleWordIdSet` all stay as-is. The vocab meter is a **read-only projection** of that state — it adds display, not a second source of truth.

### Why the alternatives lose
- **B — JLPT-tier gate (N5→N4→N3) as primary axis.** Rejected. The deck is 1,301 N5 / 488 N4 / 20 N3. A pure JLPT gate gives a brand-new user **all 1,301 N5 words at once** — that is not pacing a beginner, it's the dump the user explicitly wants to avoid. JLPT tier is too coarse to pace *within* the beginner band (which is the entire early experience). It also fights the user's stated principle that "modules must have words relative to the topic." JLPT can be a *secondary ordering hint* (prefer N5 words earlier — already implicitly true since early modules skew N5), but never the gate.
- **C — Frequency/importance-ranked single meter ("top N unlocked").** Rejected as the *axis*, **adopted for its legibility.** A flat frequency list throws away theme coherence (the user wants topical grouping) and requires a frequency rank we don't have for 1,809 words (sourcing/ranking is a content project, not a mechanic). But its *presentation* — a single "N of Total" number that grows — is exactly the legibility fix Option A was missing, so we borrow the **count-based meter** while keeping modules as the unit of unlock.
- **D — Hybrid (JLPT coarse gate + modules within).** Rejected. Adds a second gating dimension and the bookkeeping/legibility cost of two nested progress concepts, for no beginner-pacing benefit that A doesn't already deliver (early modules already skew N5). Violates the no-third-bar constraint in spirit.

### The unifying insight
The app already gates content by progress. The user's request is **already 80% built** — the missing 20% is **legibility** ("I can't see that I have 30 of 1,809 words and that finishing this module unlocks ~156 more"). So the correct move is *not* to build a parallel system (which would create the exact redundancy the devils-advocate will attack) but to **surface the existing one as a vocabulary-access meter.** This is the answer that satisfies the ask AND the no-third-bar constraint simultaneously.

---

## 4. Progress metric & meter reconciliation (Task 2)

### LOCK: **Vocab unlock is earned by module mastery % (the existing 80% gate). No new counter is introduced. The "vocab meter" is a DERIVED display, not a stored signal.**

**What earns more vocab:** reaching `MODULE_UNLOCK_PCT` (80%) graded mastery on the current module — the *existing* mechanic (`moduleProgress` → `maybeUnlockNext`). We reuse this verbatim. Rejected metric candidates and why:
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

### LOCK
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
3. **Unlock event** (`maybeUnlockNext`, ~6858) — on a newly-pushed `unlockedModules` entry, fire the `showToast` celebration with "+N new words."
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
