# Delve 2 — Devil's Advocate (LEAD adversary)

> Read-only audit of `docs/delve-cycles/2-progressive-vocab.md` (committed fde248d) against the charter and `index.html`. Lens: challenge the premise — is this solving the right problem? What is wrong by construction? All citations verified against source.

## The Good (brief)
- Correctly refuses to invent a parallel engine and correctly identifies gating must hook the same layer module-gating uses, not raw `getActiveWords()`.
- Picks the least-gameable metric (SM-2-weighted mastery) over XP/sessions — that part of the gameability attack is well answered.
- Deck-expansion correctly scoped out.
- No prompt-injection text found in either the primary doc or the charter.

## FATAL Issues

### F1 — Premise false by construction: the "already-built" gate is OFF BY DEFAULT and was deliberately killed
The doc rests on "A progressive-unlock system ALREADY EXISTS ... already 80% built — the missing 20% is legibility." But the module gate is disabled by default:
`index.html:3002` — `modulesEnabled:false,       // v7.69 — topics-first: guided unlock path OFF by default; every topic is always open.`
And it is force-disabled for every user by a one-time migration at `index.html:3485` (`state.settings.modulesEnabled = false;`), whose comment (`index.html:3479-3482`) says the guided module-unlock path "was the source of the 'random words' confusion ... The user wants to tap any subject and drill it immediately, so force the guided path OFF once."
So the mechanism the doc reframes as the headline feature is not live and load-bearing — it was switched off on purpose for a documented UX reason. Option A ("Keep the module machinery as the gate") cannot show "30 of 1,809" without setting `modulesEnabled:true`, i.e. reversing v7.69. The doc never mentions the default or the force-off migration anywhere.
Alternative: treat gating as a NEW choice that reverses a recent decision and argue it on those terms — or (stronger, S3) drop gating and ship a non-gating meter.

### F2 — The app's primary surface (hands-free spam loop) does NOT route through `getDrillableWords()` / module gating
L4 and §9 assert "Drilling already filters through `activeModuleWordIdSet()` in `getDrillableWords()`" and "There is essentially no new filter to write ... The work is display + relabel, not a new gating branch." Source contradicts this for the surface that IS the app:
- おしゃべり seed: `index.html:9567` — `const pool = _buildSpamPick(getActiveWords(), 8);` (raw pool, no module set).
- Build-Mode Vocab Spam: `index.html:15034-15038` builds its pool from `vocabSectionFilter(getActiveWords())` / `getActiveWords()`; `activeModuleWordIdSet()` is never called in `buildGenerateVocabSpamLesson`.
- Random Drill: `index.html:15081` comment — "ignores section + module gating, pulls 30 random words from the entire active deck"; pool at `index.html:15108` from `getActiveWords()`.
Module gating in `getDrillableWords()` applies in exactly ONE branch — the `'all'` guided section (`index.html:3770-3775`); mastered/collection/topic-scope branches bypass (3749-3768). To make locked words actually not appear in the core loop, the build must ADD gating to the spam/convo/random paths — exactly the "new gating branch" the doc says doesn't exist. The "20% legibility" framing collapses; this is a behavioral change to the hands-free loop with real risk (it must reconcile with the progressive-widening fallback at 15032-15052).
Alternative: scope the real work honestly, or don't gate at all.

## SERIOUS Concerns

### S3 — The strongest option — a NON-gating "words" meter — is never analyzed (charter demanded the do-nothing case)
Charter Adversary task 3: "Make the case to do nothing." The verbatim ask — "unlock MORE content ... more things unlock" — is an emotional ask about watching accessible vocab grow, not necessarily about locking words away. Given v7.69 deliberately removed gating and the app mandate is "tap any subject and drill immediately," the lowest-risk design is a meter that counts words learned/available and grows, with ZERO locking — satisfying the feeling of progression without re-introducing the killed gate. The doc forecloses this in §3 ("Keep the module machinery as the gate") and never weighs a gate-free meter as Option E.
Alternative (Option E): derive "N words seen/mastered of 1,809" from existing SRS stats as a pure display; no `modulesEnabled` flip, no spam-loop change, no migration risk. Only a user statement that they want words WITHHELD would change my mind toward gating.

### S4 — §5 contains a concrete factual error about the default
§5 LOCK: "Day-one allocation: the first module unlocked (currently 👋 Greetings, ~30 words) — i.e. the existing default ... No change to the default; we just surface it as '30 of 1,809 unlocked.'" The actual default is `modulesEnabled:false` ⇒ `activeModuleWordIdSet()` returns `null` (`index.html:6817`) ⇒ the meter reads 1,809 of 1,809, not 30. There is no "30 of 1,809" day-one state without re-enabling modules. The locked starting allocation is built on a wrong reading of the current default.

### S5 — Re-enabling the gate re-creates a bug the user already had fixed
The doc cites the v7.68 topic-scope bypass (3759-3765) as a supporting escape hatch but does not acknowledge that v7.69 then disabled modules wholesale for the same class of failure (`index.html:3479-3481`: gating "was the source of the 'random words' confusion (picking a topic then drilling intersected to an empty/locked pool)"). User memory records this as a fixed defect [[project_japanese_trainer_scope_modulelock]]. Turning the gate back on to power a meter risks resurrecting "categories show random words."

## QUESTIONABLE

### Q6 — The "meter is honest, it can't lie about access" claim is false
§7 anti-frustration principle 3: "The meter is honest: it reads the real `unlockedModules`, so it can't lie about access." It can. Because Random Drill / spam / convo draw from the full `getActiveWords()` (F2), a user on "30 of 1,809 unlocked" can already drill any of the 1,809 words via the hands-free loop. The meter would overstate how much is locked — the opposite of honest — unless F2 is fixed first.

## NITPICK

### N7 — "Exactly two progression axes" undercounts existing signals
§4 asserts "There are exactly two progression axes." The app already surfaces SRS mastery stats, a streak, module %, and convoLevel. The "no third bar" value is reasonable, but "exactly two" is rhetorical, not factual.

## Overall Verdict
FAIL — rethink the premise. Two FATAL findings invalidate the core claim: (F1) the module gate is OFF by default and was deliberately killed in v7.69, and (F2) the app's primary hands-free loop never honors module gating — so "no new filter to write / just legibility" is wrong, and Option A silently reverses a recent user-driven decision. Before any forge build, synthesis must either (a) reframe this as a deliberate reversal of v7.69 with the spam-loop gating work scoped in, or (b) adopt a gate-free "words learned/available" meter (Option E) that satisfies the growth ask without locking, without flipping `modulesEnabled`, and without re-creating the "random words" bug.
