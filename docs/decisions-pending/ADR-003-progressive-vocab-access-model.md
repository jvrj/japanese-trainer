# ADR-003 — Progressive vocabulary access ships as a non-locking coverage meter

- **Status:** Proposed (PENDING — filed by Delve 2 synthesis; not promoted to `docs/decisions/`; awaiting user signoff)
- **Date:** 2026-06-27
- **Source:** Delve 2 — `docs/delve-cycles/2-progressive-vocab.md` (Round 1 synthesis, §14)
- **Supersedes / superseded by:** consolidates the primary doc's framed ADR-P1 + ADR-P2 (P2 demoted to a decision-note)

## Context

The user asked for vocabulary to "unlock MORE content as you progress" — start with a small slice, earn access to more. The primary delve doc locked **Option A**: keep the existing theme-module 80%-mastery gate as the access mechanism and add only a legible "X of Y words unlocked" meter ("already 80% built — the missing 20% is legibility").

The adversary panel (all three heads, independently) showed this premise is **false against source**, verified in `index.html` (21,216 lines):

1. The module gate is **OFF by default** — `modulesEnabled:false` (index.html:3025) — and a **v7.69 one-time migration force-disables it for every existing user** (index.html:3508). The in-source rationale: *"The guided module-unlock path … was the source of the 'random words' confusion (picking a topic then drilling intersected to an empty/locked pool). The user wants to tap any subject and drill it immediately."* (index.html:3501–3507).
2. The **core hands-free loop does not route through the gate**: `buildGenerateVocabSpamLesson` (15046) builds from `vocabSectionFilter(getActiveWords())`; `startRandomDrill` (15107) pulls raw `getActiveWords()` and explicitly *"ignores section + module gating"* (15104); `blitzCounts` (7205) and `formEligibleVerbs` (7141) consult the deck independently. Module gating applies only in the `'all'` branch of `getDrillableWords` and in scattered independent `activeModuleWordIdSet()` (6838) callers.

So delivering Option A as written would require reversing v7.69 (re-enable `modulesEnabled` by default) AND adding module-gating to the spam/random/convo selectors — which **resurrects the exact "random words" defect the user already had fixed** ([[project_japanese_trainer_scope_modulelock]]) and **contradicts the app scope mandate** ([[project_japanese_trainer_scope_decision]]: "tap any subject and drill immediately").

## Decision

1. **Progressive vocab access ships as a NON-LOCKING, derived *coverage* meter.** The default experience locks no words out of any drill. The meter is a pure read-only derivation over existing SRS state (`state.stats`) and `getActiveWords()` — e.g. **"`mastered` of `total` · `started` of `total`"** plus per-theme coverage — a number that grows as the user progresses (and as the deck grows). This delivers the requested "more as you progress" shape as **reach achieved**, not **access withheld**.
2. **v7.69 is NOT reversed.** `modulesEnabled` stays `false` by default; the force-off migration stays. Hard module-gating remains the **opt-in** Settings path it is today (KEPT, unchanged). The 30→186→…→1,809 unlock curve applies only to that opt-in path.
3. **No selector is rewired.** The spam/random/convo/form pool selectors are left as-is (no forced route through `getDrillableWords()`), preserving form-drill's independent verb scoping.
4. **Only additive display state.** The single new persisted setting is a display toggle under `state.settings` (additive merge via `{...DEFAULT_SETTINGS, ...loaded}`); no data migration, no version-gated transform, no new gate field.
5. **Meter denominator = active filtered pool** (`getActiveWords().length`, post theme/POS/register/katakana filters) so it stays honest under user filters.
6. **Deferred (hard-lock) arm:** if the user, on signoff, confirms they want *true* hard-locking-by-default (the literal reading of "only have access to 1,500"), that is a separate costed decision — re-enable modules default + gate the spam/random/convo selectors + add a day-one variety floor (proposed ≥ ~80 unique drillable words before any lock) + re-validate the v7.69 "random words" bug class — recorded here as the rejected/deferred alternative, not built in this pass.

## Consequences

- The user-facing progression contract is **coverage, not access-locking**; the meter cannot contradict the hands-free loop (it reports the same deck everyone can already drill). The `convoLevel` conversation-depth meter is unaffected; the two coexist as coverage vs depth, two domains, no orphan third bar.
- Zero migration / regression risk: nothing is locked, the v7.69 fix is preserved, the scope mandate is honored.
- The literal "1,500 of 10,000 locked" interpretation is **not** delivered by default; the tension is surfaced to the user for an explicit call (DoD "user signoff" remains the gate).

## Acceptance gate (numeric)

Accept iff, with the meter shipped: **0** drill surfaces (spam loop, Random Drill, Recall, Nuance, Forms, Memory, おしゃべり seed) have any word removed from their pool relative to pre-change behaviour (non-locking invariant holds), **0** new persisted `state.settings` fields beyond the additive display toggle, and the meter's reported `total` equals `getActiveWords().length` for **100%** of filter combinations tested.

## Reversal trigger (numeric)

Revisit (toward the deferred hard-lock arm) if, after ship, the user explicitly requests access-locking, OR if usage shows **≥ 3** distinct sessions where the user manually re-enables `modulesEnabled` seeking a gated experience — signalling the non-locking meter under-delivers the "locked until earned" motivation the ask implied.
