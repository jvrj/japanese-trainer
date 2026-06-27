# Delve 2 Code-Review Adversary: Progressive Vocabulary Access

Lens: cited line-number correctness, filter-integration logic, backward-compat claims,
function-name accuracy, internal consistency of the implementation sketch.
All citations verified against index.html at HEAD.

---

## FATAL-1 -- modulesEnabled:false default voids L3 day-one allocation claim

**Severity:** FATAL

**Citation (primary doc):**
Section 5 LOCK: Day-one allocation: the first module unlocked (~30 words)
Section 6: User with zero SRS history (brand-new): backfill leaves them on module 1
-- 30 of 1,809

**What the code says:**

DEFAULT_SETTINGS line 3002 sets modulesEnabled:false with comment
v7.69 topics-first: guided unlock path OFF by default; every topic is always open.
A v7.69 migration block at line 3485 then forces modulesEnabled = false for ALL existing
users who had it on, setting state.settings._topicsFirstV1 = true as a one-time flag.
Modules are therefore off for every user class: new users (default) and existing users
(forced off by the migration at line 3485).

When modulesEnabled is false, activeModuleWordIdSet() returns null (line 6817).
The proposed vocabAccessStats() formula treats null as everything available --
const unlocked = set ? set.size : total -- producing a day-one display of
1,809 of 1,809 words unlocked for every user including brand-new ones.
The L3 lock (30 of 1,809) is therefore wrong for 100% of current and new users.

The spec adds vocabMeterEnabled:true (display toggle only) but never addresses
modulesEnabled. If modulesEnabled stays false the progressive gate is permanently
inert. The user explicitly asked for restricted day-one access; the proposal cannot
deliver it without turning modules on -- contradicting v7.69 intent the spec ignores.

**Required resolution for synthesis:**
Decide whether enabling vocabMeterEnabled also sets modulesEnabled:true (and how to
handle the v7.69 migration), or propose a new gating mechanism not dependent on
modulesEnabled. Leaving this implicit makes L3 a false claim and the forge output
inert by default.

---

## SERIOUS-1 -- Wrong function name: maybeUnlockNext does not exist

**Severity:** SERIOUS

**Citation (primary doc):** Section 1: maybeUnlockNext() path (6852-6860)
-- repeated in Sections 3, 6, and 9.

**What the code says:** The actual function is modulesMaybeUnlockNext() at line 6848:

    function modulesMaybeUnlockNext(){   // line 6848

No function named maybeUnlockNext exists in index.html (confirmed by grep).

**Why it matters:** The spec is the direct input to a /hydra-forge build. Any generated
code calling maybeUnlockNext() will be a runtime error (undefined function). The wrong
name appears in four separate locations, including the Section 9 unlock-event integration
point where the forge is told to wire the unlock celebration toast.

---

## SERIOUS-2 -- activeModuleWordIdSet() cited at line 3815; actual definition is line 6815

**Severity:** SERIOUS

**Citation (primary doc):** Section 1: activeModuleWordIdSet() (3815)

**What the code says:** Line 3815 is inside libraryFocusToggle(), an unrelated library
helper. The function activeModuleWordIdSet() is defined at line 6815:

    function activeModuleWordIdSet(){   // line 6815

Digit transposition 3815 vs 6815, confirmed by grep.
Note: the call-site references (3745, 3770-3775) inside getDrillableWords() are correct
-- only the function definition citation is wrong.

**Why it matters:** The integration sketch directs the forge to hook at this function.
A builder navigating to line 3815 finds unrelated library code. This is the central
function of the entire filter integration plan.

---

## SERIOUS-3 -- All-modes-via-getDrillableWords claim is architecturally inaccurate

**Severity:** SERIOUS

**Citation (primary doc):** Section 9 implementation sketch:
all hands-free spam-loop / Recall / Nuance / Forms / Memory selectors
route through getDrillableWords(), not raw getActiveWords()

**What the code says:** Form Drill and Form Spam do NOT route through getDrillableWords().
They use formEligibleVerbs() (line 7118), which calls getActiveWords() directly
(line 7136) and applies activeModuleWordIdSet() independently (line 7121).
The verb-section chip-count renderer at line 8088 also calls activeModuleWordIdSet()
independently via getActiveWords().filter() at lines 8088-8094.

**Why it matters:** The forge audit is framed as repair any selector that bypasses
getDrillableWords() -- but that is not the correct invariant. The correct invariant is:
every pool selector must call activeModuleWordIdSet() and apply
(!moduleIds || moduleIds.has(w.id)). Form-mode selectors already satisfy this correctly.
Framing the audit as a getDrillableWords() routing check may cause the forge to
incorrectly refactor formEligibleVerbs() into getDrillableWords(), breaking form
drill verb-only filter and verb-section scoping logic.

---

## QUESTIONABLE-1 -- vocabAccessStats() next variable is an unimplemented placeholder

**Severity:** QUESTIONABLE

**Citation (primary doc):** Section 9 implementation sketch:
    const next = /* next locked module in orderedModules() after cur, or null */;

**Why it matters:** The spec declares itself implementation-ready for the forge build,
but the core display computation -- the next module name and word count for the
+N new words line -- is a blank comment. The forge cannot safely derive this;
the correct implementation must traverse orderedModules(), find the first module after
currentModuleId not yet in unlockedModules, and handle last-module and hidden-module
edge cases. Leaving this blank risks the forge hallucinating a different traversal.

---

## NITPICK-1 -- unlockModuleAnyway cited at line 6886; function declaration is line 6883

**Severity:** NITPICK

**Citation (primary doc):** Section 1: unlockModuleAnyway, 6886

**What the code says:**
    function unlockModuleAnyway(moduleId){  // line 6883
      const m = moduleById(moduleId);       // line 6884
      if(!m) return;                        // line 6885
      if(!confirm(...)) return;             // line 6886 -- body, not declaration

Function declaration is 6883; 6886 is the confirm dialog inside the body.
Minor three-line offset consistent with the broader pattern of citation drift.

---

## Confirmed-correct citations

The following cited anchors are verified accurate against source:

- getActiveWords() at line 3701 -- correct
- MODULES at 6650; MODULE_UNLOCK_PCT = 80 at 6665; MODULE_MIN_TO_UNLOCK = 5 at 6666 -- correct
- moduleProgress(moduleId) at 6759; MODULE_MASTERY_WEIGHT at 6758 -- correct
- moduleIsUnlocked(id) at 6797 -- correct
- getDrillableWords() at 3741; module filter at 3770-3775; call site at 3745 -- correct
- modulesUnlockBackfill() at 6827 -- correct
- convoLevel / convoXp in DEFAULT_SETTINGS at lines 3007-3008 -- correct
- convoLevelInfo() at 3098 -- correct
- DEFAULT_SETTINGS at 2961; unlockBypassed at 3005 -- correct
- Module list mastery bar at ~19317; locked footer / Unlock-anyway at 19334-19336 -- correct
- showToast usage example at 6873 (inside setCurrentModule) -- valid call-site reference

---

## Verdict: WARN

The integration strategy is sound and the high-level design locks are defensible.
Three issues must be resolved before the forge build:

1. (FATAL) modulesEnabled:false default + v7.69 migration: no progressive gating is
   delivered for any user class. Synthesis must add an explicit gate-enabling decision,
   or L3 must be requalified to reflect the actual default experience.

2. (SERIOUS) maybeUnlockNext does not exist. Correct to modulesMaybeUnlockNext in all
   four locations before the forge run.

3. (SERIOUS/QUESTIONABLE) The vocabAccessStats() next computation must be written out,
   not left as a comment, so the forge has a determinate algorithm to implement.

None of these are fundamental design flaws -- they are spec-quality gaps that would
cause a forge build to produce broken or non-functional code. All are fixable in a
short editorial pass.