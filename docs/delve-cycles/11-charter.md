# Delve 11 — Progress that moves: the tracking system for the drill-first paid v1

## Domain
The Home progress surface ("Your path to a real conversation", Stage C v8.09) is a
bottleneck-min over three tracks — producible words, verbs-in-all-forms, sentences
drilled — and two of the three are fed only by buried legacy modes, so the bar is
**frozen at 0%** no matter how much the owner drills. The v8.46 Sentences drills
write no progress credit at all, and word credit is all-or-nothing at round
completion. Owner's ask, verbatim: *"how is the tracking going, it still shows 0%
progress. What is with that? What can we do here?"* The question to settle: **what
should "progress" mean — and show — in a paid app whose product IS the hands-free
drill loop**, measured only by things that loop actually produces.

## Stacked REVISED callouts
> **REVISED 2026-08-03 (owner anchor, supersedes Delve 5's conversation-first
> Home):** core drill app ships as the paid v1; AI conversation + avatar BENCHED.
> The spine's "path to a real conversation" framing predates this.
> **REVISED per Delve 9 (locked, not re-openable):** $8.99/mo + ~$59.99/yr;
> judgment-free register — no urgency-guilt mechanics in any progress/streak copy.
> **LOCKED (owner, standing):** STT is never a grader (v8.03); the self-rating
> check-in 😬🙂💪 is the honest grade channel (v8.48); full ~1702-word deck is the
> default, frontier lock opt-in (v8.35); EN-primary chrome (v8.22).

## Primary
**Mode:** Opus-only

### Investigation tasks
1. **Headline metric — pick FINAL:** what the one Home number/bar measures.
   (A) words-that-stick milestone ladder (reuse existing 25/75/150/300/500 tiers
   over producible words) vs (B) weighted composite vs (C) daily-goal ring +
   words count. Must be fed 100% by the core loop under the default full-deck,
   due-first picker — give the exact formula from existing `state.stats` fields
   and show it moves every completed session for a real usage profile.
2. **Home surface — pick FINAL:** fate of the spine header, the five kana stages,
   and the detail sheet (retarget / rebrand / bury). Screen-by-screen: collapsed
   state, expanded state, and what a brand-new post-onboarding user sees
   (micro-drill = 3 words → the bar must already show life).
3. **Credit plumbing — pick FINAL:** per-word credit at recall-step pass vs
   completion-only (interrupted rounds currently earn zero); whether the v8.46
   sentence drills write credit and to which store; no double-credit with the
   completion path or the self-rating SM-2 writes.
4. **Legacy tracks + migration — pick FINAL:** disposition of verbs-in-all-forms,
   sentences-drilled, and Conversational Core % (keep-in-sheet / rebrand /
   remove); existing profiles (the owner's real phone profile) must not reset or
   lose anything — name the migration, if any.
5. **Retention surfaces for v1 — adopt or defer each:** streak (exists,
   hideable), daily goal, session count, per-round "words kept" recap. For each:
   ship in v1 / defer / reject — anchored to what retains in paid drill apps,
   within the judgment-free register.

### Output
Primary doc: `delve-cycles/11-drill-progress.md`

Sections (in order):
1. Charter — restate scope + cite REVISED callouts
2. Method — primary mode + adversary panel + synthesis ownership
3–7. One section per investigation task (1–5)
8. Decisions reached — bulleted list of locks with one-line rationale
9. Open questions still open
10. Foundation doc updates
11. ADR proposals

## Adversaries
### Adversary 1: devils-advocate (LEAD)
**Read:** primary doc, index.html progress/spine region (~L21440–22160)
**Audit:** (1) Is the chosen metric honest, or a vanity number that inflates
without learning? (2) Does anything re-lead Home with the benched conversation
product? (3) Is per-step credit gameable (autoplay idling = progress)? (4) Are
the retention surfaces judgment-free or dressed-up guilt?
**Output:** `11-drill-progress-devils-advocate.md`

### Adversary 2: code
**Read:** primary doc, index.html (`smGrade`, `buildOnComplete`,
`_buildSpamPick`, `progIsSolid`, `_spineModel`, sentGap/sentCount handlers)
**Audit:** (1) Formula actually computable from the flat `state.stats` shape as
claimed. (2) Credit-plumbing change points named correctly (no double-fire with
`l._completed`, restart, self-rating). (3) Migration touches nothing it
shouldn't.
**Output:** `11-drill-progress-code-review.md`

### Adversary 3: qa
**Read:** primary doc, index.html first-run + drill paths
**Audit:** (1) Every profile shape (brand-new, post-onboarding 3-word,
mid-progress owner, imported backup) shows a sane non-frozen bar.
(2) Interrupted rounds, restarts, and back-button paths credit exactly once.
(3) The 0%-freeze cannot recur at any later stage boundary.
**Output:** `11-drill-progress-qa-design.md`

## Synthesis
`## Synthesis (Round 1 close — Delve 11)` appended to primary doc.
Foundation doc updates: DO_THIS_NEXT.md.
ADR proposals likely: headline progress metric; credit-at-step policy;
legacy-track disposition.

## Definition of done
- [ ] Primary doc + 5 task sections
- [ ] 3 adversary docs filed
- [ ] Synthesis appended
- [ ] Foundation docs patched
- [ ] ADR proposals filed (pending dir, sequential numbering)
- [ ] User signoff

## Files this delve touches
Creates: delve-cycles/11-* (5 docs), docs/decisions-pending/*.
Modifies: DO_THIS_NEXT.md.
