# Adversary 2: Code Review — Delve 1 Conversation-Practice Mode

> Adversary type: code-reviewer. Primary doc: docs/delve-cycles/1-conversation-mode.md
> Lens: Correctness, citation discipline, evidentiary standard, internal consistency,
> whether proposed patch insertion points are coherent. Verdict at bottom.

---

## Citation verification

All cited line numbers verified against index.html (20,029 lines, working tree).

| Anchor | Claimed line | Verified |
|---|---|---|
| _coachCall(promptStr) | 9187 | CORRECT |
| state.askClaude={messages:[]} | 3270/3359 | PARTIAL: save=3270 load=3359 OK; declaration at 3017 not cited |
| _aiJsonExtract(raw) (used 9235) | 9235 | CORRECT: defined 9096 used 9235 |
| startVoice(onResult,onEnd,lang) | 5274 | CORRECT |
| speakJP(text, rate) | 5221 | CORRECT |
| recordAttempt(wordId,correct,mode,extras) | 7294 | CORRECT |
| smGrade(st,grade) | 3472 | CORRECT -- two required args confirmed |
| getActiveWords() | 3564 | CORRECT |
| _buildSpamPick(arr, n) | 14082 | CORRECT |
| startSentenceCoach | 9116 | CORRECT |
| renderSentenceCoach | 9251 | CORRECT |
| render() map object | 17961/17963 | CORRECT |
| nav(screen) | 17969 | CORRECT |
| save() | 3262 | CORRECT |
| Daily Path step===sentence | ~9608 | CORRECT |
| renderHome | ~18011+ | CORRECT |
| startRandomDrill({ids}) open Q6 | N/A | CONFIRMED: only opts.count; no ids param |

---

## Findings

### F1 -- SERIOUS: smGrade called with wrong arity in the implementation sketch

Citation from primary doc section 10.2 (verbatim):
  function convoApplyScore(judged, viaVoice)  // for each usedWords id when viaVoice: recordAttempt(id,true,convo)+smGrade(good); fill results{}

The comment shows smGrade(good) with one argument. The real signature at index.html:3472
is smGrade(st, grade) where st is the stat object retrieved via smStatFor(id).
Section 7.1 of the same primary doc correctly writes smGrade(smStatFor(id), good).
The implementation sketch in section 10.2 contradicts section 7.1 and the source.

Why it matters: /hydra-forge reads section 10 as the build blueprint. A forge run that
trusts the section 10.2 comment will call smGrade with a string as the first argument.
ensureSm(st) inside smGrade attempts reviewCount++ on a string primitive; JS silently
no-ops the property write. SM-2 state never advances for any conversation word.
The SRS tie-in locked in section 7 as non-cosmetic will be inert. The bug produces
silent data corruption visible only as stale SM-2 schedules days later.

Fix: change the section 10.2 comment to match section 7.1:
  recordAttempt(id,true,convo,{scene}) + smGrade(smStatFor(id),good)

---

### F2 -- SERIOUS: speakJP has no onend callback; TTS-to-mic handoff has no implementation path

Citation from primary doc section 10.3 turn flow pseudocode (verbatim):
  TTS onend -> if convoHandsFree: convoToggleListen() (auto-open mic) + show chips

speakJP(text, rate) at index.html:5221 accepts two arguments and returns undefined.
Its internal u.onend handler at lines 5234-5237 only clears speakingFlag and calls
updateSpeakBtn(). There is no third callback parameter, no returned promise, no event
emitter. The caller cannot know when TTS has finished.

Why it matters: hands-free is the mode north-star UX. Section 4.3 locks this verbatim:
  After the AI probe TTS onend fires, the mic auto-opens (spam-mode style)
and section 8 repeats the same dependency. Both assume a completion signal that does
not exist in speakJP. The spam-mode precedent the doc invokes uses a fixed setTimeout
of ~2800ms (index.html:7815) and setTimeout(_blitzVoiceListen, 80) at line 7604 --
not a TTS completion hook. For conversation mode the gap matters more: if the mic opens
before TTS finishes STT picks up the TTS audio and submits the AI speech as the learner
reply, producing a garbled self-loop.

The design must lock one concrete path:
  (a) Modify speakJP to accept a third onend callback fired from u.onend
  (b) Lock setTimeout(convoToggleListen, estimatedDuration) and define how duration
      is estimated from text length and rate
  (c) Poll speakingFlag on a short interval
None of these is locked or mentioned anywhere in the primary doc.

---

### F3 -- QUESTIONABLE: Dead state fields _best and _ended in section 10.1 state shape

Citation from primary doc section 10.1 (verbatim):
  done: false, _best: "", _ended: false

Neither _best nor _ended is referenced in section 10.2 (function descriptions),
section 10.3 (turn flow pseudocode), section 7 (SRS write logic), section 8
(session shape), or section 11 (decision locks). They appear to be copy-paste
artifacts from the spam or blitz session state shape.

Why it matters: the forge initializes all fields in the state schema. A forge agent
may wire _best into STT transcript tracking by analogy with spam mode, causing
undocumented divergence from the design. At minimum they are dead fields persisted
to LS.convo on every save.

Fix: remove _best and _ended from the state shape, or define their role explicitly.

---

### F4 -- QUESTIONABLE: _convoCall refactor requires editing _coachCall but no shared-helper shape is given

Citation from primary doc section 10.5 (verbatim):
  Shared fetch | factor _coachCall fetch so _convoCall reuses headers/model (9187)

Section 6.1 prose also says: factored to share the fetch with _coachCall.
_coachCall at index.html:9187-9199 is a self-contained 13-line function. Extracting
a shared helper requires restructuring it in place. The design shows neither the
extracted helper name, its signature, nor its body.

Why it matters: _coachCall is load-bearing for Sentence Coach. An incorrect refactor
could silently break Coach (wrong headers, missing key check, model default mismatch).
The doc should show the shared helper shape, or explicitly allow _convoCall to
duplicate the fetch body as the safer default in a single-file codebase.

---

### F5 -- QUESTIONABLE: convoApplyScore(null, false) on the opening turn -- no null-guard specified

Citation 1 from primary doc section 6.2 (verbatim):
  judged -- describes the learner previous reply (null on the opening turn)

Citation 2 from primary doc section 10.3 turn flow (verbatim):
  -> convoApplyScore(judged, viaVoice) -> recovery ladder on judged.landed

The schema specifies judged=null for the first API response. The turn flow calls
convoApplyScore(judged, viaVoice) after every response without a guard. convoApplyScore
is described as iterating over judged.usedWords; if judged is null this throws TypeError.

Fix: add an explicit null-guard note in section 10.2 or 10.3:
  convoApplyScore returns early if judged is null.

---

### F6 -- NITPICK: Persistence phrasing is technically inaccurate

Citation from primary doc section 10.1 (verbatim):
  an in-progress convo persists under its own LS key LS.convo added to save()
  (NOT a bare state.* that is lost on reload)

state.convo is a top-level state field, identical in pattern to state.blitz and
state.formDrill. The parenthetical incorrectly implies no top-level state property
is added. The meaningful distinction is that it is also written to localStorage.

---

## Internal consistency check

- Section 7.1 and section 10.2 are inconsistent on smGrade arity (F1).
- Sections 4.3, 8, and 10.3 all specify mic auto-opens after TTS onend;
  speakJP at 5221 exposes no such hook (F2). Three sections share this gap.
- Section 10.1 state shape has _best/_ended not referenced elsewhere (F3).
- Section 6.2 schema nulls judged on turn 1; section 10.3 does not guard it (F5).
- Section 6.1 and section 10.5 agree the fetch is shared; neither shows the helper shape (F4).
- All other cross-references (turn-loop section 3 vs 11, SRS section 7 vs 11,
  session shape section 8 vs 11, naming section 9 vs 11) are internally consistent.
- No injection-attempt text detected in either the primary doc or the charter.

---

## Verdict: WARN

The architecture is sound and 16 of 17 cited line numbers are accurate. Two SERIOUS
issues must be resolved before /hydra-forge can build from this doc without producing
silently broken output: (F1) the smGrade arity bug in section 10.2 produces silent SM-2
corruption because JS silently drops property writes on primitives; (F2) the TTS-to-mic
handoff is specified in terms of a speakJP onend hook that does not exist in the codebase.
Three QUESTIONABLE issues (F3 dead state fields, F4 missing shared-helper shape, F5
missing null-guard) each force the forge to make undocumented design choices. Fix F1
and F2 before the forge step; F3-F5 can be addressed in synthesis disposition.
