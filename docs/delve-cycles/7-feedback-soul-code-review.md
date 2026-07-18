# Delve 7 -- Code-Reviewer Adversary Report

> Audits `docs/delve-cycles/7-feedback-soul.md` (primary, committed 31a51fc3) against
> `index.html` v8.13 (working tree at commit b5dc525, the same tree the primary doc
> claims to have read) and `docs/decisions/ADR-009-judgment-free-interaction-spec.md`.
> Lens: correctness, citation discipline, evidentiary standard, internal consistency,
> patch-insertion coherence. Per charter Adversary 3 audit prompts (schema-extension
> enumeration, mic-choreography implementability, module-structure mapping,
> token/latency budget).

**Note on scope-of-trust:** both the primary doc and the charter were read as
untrusted data per instructions. Neither contains any embedded instruction-like text
directed at this reviewer; no prompt-injection finding to report.

## Findings

### F1 -- FATAL: MODULES is already a live top-level const; L13/Stage-F4 collide with it
The primary doc's L13 lock (section 6, section 9) and Stage F4 implementation sketch
(section 8) state: "the `SCENES` bank **becomes** the `MODULES` bank... `startConvo(sceneId)`
keeps its signature... zero call-site churn" and "Stage F4 -- `SCENES` -> `MODULES` rows."

`index.html` already declares `const MODULES = [...]` at **index.html:6495** (a
pre-existing, unrelated "Modules (v6.16) -- themed progression with linear unlock"
feature for Vocab Blitz/Build Mode topic-gating), consumed by roughly 20 functions
(`moduleById` 6590, `firstModule` 6533, `orderedModules`, `moduleOrderList` 6522,
`MODULE_UNLOCK_PCT` 6510, `toggleModulesEnabled` 6767, render call sites at
19769-19874 and 20146-20152) and exposed in Settings as "Module path (guided unlock)"
(index.html:20578-20579, `state.settings.modulesEnabled`, default `false`, declared at
index.html:2785-2788). `SCENES` is declared earlier in the same `<script>` block
(index.html:2859). Since the whole app is one `<script>` tag (index.html:669) with no
function-wrapper around either declaration, reassigning/renaming `SCENES` to `MODULES`
as literally specified produces a second top-level `const MODULES` in the same scope --
`SyntaxError: Identifier 'MODULES' has already been declared`, which breaks the entire
single-file app on load. If instead the intent is a differently-scoped or renamed
constant, the doc never says so, and the reused name still collides at the UX layer
with the existing Settings "Module path (guided unlock)" toggle -- a second,
unrelated "Modules" concept shown to the same user. Section 6.1 claims the anti-sprawl
check is "enforceable at review" and Task 4's audit brief explicitly asks the
code-reviewer to "map it onto existing SCENES/state... enumerate the functions each
stage touches" -- this pre-existing `MODULES` global is exactly the kind of
existing-state collision that enumeration was supposed to surface, and it was missed
entirely. Not a cosmetic naming nit: as literally written the lock is not shippable.
**Citation:** primary doc section 6.2 "the `SCENES` bank **becomes** the `MODULES`
bank" and section 8 Stage F4 "`SCENES` -> `MODULES` rows... (2859)"; source:
`index.html:6495` "const MODULES = [", `index.html:2859` "const SCENES = [".

### F2 -- FATAL: the confirm feedback signal is orb-exclusive, and the orb is off by default
Section 3.4's rendering table gives **confirm** exactly one channel: "Orb: one warm
gold pulse... that landed" -- TTS is "the confirm IS the reply" (no distinct signal)
and Text is explicitly "none." So for the single most common feedback event
(`judged.score == 2`, nothing to fix -- ordinary comprehended speech), the orb pulse is
the entire delta versus today's feedback-void baseline.

`_orbSet` (index.html:10429) is gated: "if(!o.mounted) return; /* no-op: not mounted
(orbMode off / navigated away) */" (index.html:10431). `o.mounted` is set true only
inside the orb mount path (index.html:10162), reached only when
`state.settings.orbMode` is truthy (index.html:10081, 10091). `orbMode` **defaults to
false** (index.html:2790: "orbMode:false, // ...OFF by default so legacy renderConvo
output stays byte-identical to v8.12"). The non-orb header, `_convoPartnerHeader`
(index.html:10053-10062), is a static emoji circle plus name label with no animated
element to repurpose for a pulse. Consequently, for every user who has not manually
opted into the experimental orb toggle (Settings, index.html:20442) -- i.e. the
default state for all existing users and any new user until they find that toggle --
the confirm move renders zero perceptible change from the pre-delve baseline. That
reproduces the exact owner complaint ("signal to me that ive said something
correctly") the delve exists to fix, for the majority case, by default. The charter's
own framing -- "the orb... is the presence layer this feedback layer renders through
where possible" -- implies a non-orb fallback should exist; section 3.4 defines none,
and section 8 Stage F2 does not list any change to `_convoPartnerHeader` or add a
non-orb confirm signal. **Citation:** primary doc section 3.4 table (confirm row:
"Orb ... that landed"; Text row: "none"); source: `index.html:2790` "orbMode:false",
`index.html:10431` "if(!o.mounted) return;", `index.html:10053` "function
_convoPartnerHeader(cv){".

### F3 -- SERIOUS: the clarify move's own primary trigger path (score==1) currently skips TTS and hides jp behind an English hint, contradicting section 3.4's TTS claim
Section 3.6 layer 1 (score gate) fires **clarify** on `judged.score == 1`. Section
3.4's rendering table says clarify's TTS channel is "question spoken normally." But
the existing downshift ladder in `convoTurn` (index.html:9693-9719) branches on
`parsed.landed`: the `landed === 1` branch (index.html:9705-9710) does not set
`didAdvance`, and `_convoSpeakJP(aiJP, ...)` only fires when `aiJP && didAdvance`
(index.html:9750) -- so on exactly the turns where clarify is specified to fire most,
the model's `jp` (the clarification question) is never spoken, and it is not even
shown as the primary reply: `cv.error` is instead set to an English hint string,
"'ヒント: ' + parsed.glossEn" (index.html:9707), and the orb explicitly reflects idle,
not listening or a question state (index.html:9754-9758, "reflect idle explicitly").
Section 3.3's own heading promises "Parse + fallback coherence (the whole surface,
**enumerated**)" but this branch -- precisely the branch clarify's spec depends on --
is absent from that enumeration and from the Stage F2 sketch (section 8), which lists
no change to index.html:9705-9710's TTS-skip / English-hint-override behavior. As
written, shipping F2 without touching this branch means clarify never gets spoken and
the learner sees an English hint instead of the natural JP question the spec assumes.
**Citation:** primary doc section 3.1 clarify row ("judged.score == 1"), section 3.4
clarify/TTS cell ("question spoken normally"); source: `index.html:9705` "} else
if(parsed.landed === 1){", `index.html:9707` "cv.error = parsed.glossEn ? 'ヒント: ' +
parsed.glossEn : ...", `index.html:9750` "if(aiJP && didAdvance){".

### F4 -- QUESTIONABLE: section 12's citation of ADR-009's consequences section overstates what that section says, and sits alongside an unreconciled "ADR-009 stands in full" claim
Section 1.2 (repeating the charter verbatim) asserts "ADR-009 stands in full." Section
12 then justifies ADR-011 by calling the corrective-feedback layer "a reversal of a
promoted ADR's clause... exactly what ADR-009's own consequences section says requires
a new delve + decision record." ADR-009's actual Consequences section
(docs/decisions/ADR-009-judgment-free-interaction-spec.md:24) reads: "Any future
change that re-adds an accuracy stat, a verdict word, or a leaderboard is a visible
**decision reversal** requiring a new delve" -- three enumerated triggers, none of
which is feedback placement. The clause actually being reversed is ADR-009 rule 5
(docs/decisions/ADR-009-judgment-free-interaction-spec.md:18): "**Feedback
placement:** never mid-conversation; post-conversation recap..." -- Task 1's entire
spec is mid-conversation feedback (per-turn orb pulses, per-turn text highlights,
recasts spoken inside the live reply). That is a legitimate thing for a delve to
decide to change, and running this delve is itself a defensible way to get a "new
delve + decision record" -- but the doc's own citation for why that process was
required does not match the text it cites (placement is not one of the three listed
reversal triggers), and section 1.2's "ADR-009 stands in full" is not reconciled
anywhere against the fact that rule 5 is structurally overridden, not merely extended.
This is a citation-accuracy / internal-consistency gap, not a process violation -- the
doc should either cite rule 5 directly (not the narrower consequences clause) or
soften "stands in full" in section 1.2. **Citation:** primary doc section 12 "exactly
what ADR-009's own consequences section says requires a new delve + decision record"
vs. section 1.2 "ADR-009 stands in full"; source:
`docs/decisions/ADR-009-judgment-free-interaction-spec.md:24` and `:18`.

### F5 -- QUESTIONABLE: _convoNormFeedback is specified to run in _convoOpenProbe too, where the feedback semantics do not apply
Section 3.3 says the normalizer "applied right after parse in `convoTurn` and
`_convoOpenProbe`." `_convoOpenProbe` (index.html:9475) is the opening turn -- "AI
asks the first question (no user turn)" -- so there is no learner transcript yet for
confirm/recast/clarify to react to, and the echo guard (section 3.3's "shares no
content overlap with the learner's actual transcript") has nothing to compare
against. The doc does not call out that the opener's `feedback` key should simply be
ignored or forced to `none` rather than normalized symmetrically with `convoTurn`; as
written it reads as if the two call sites are handled identically, which is a minor
but real coherence gap in the "enumerate every ... site" claim of section 3.3.
**Citation:** primary doc section 3.3 "applied right after parse in `convoTurn`... and
`_convoOpenProbe`"; source: `index.html:9474` "/* _convoOpenProbe -- AI asks the
first question (no user turn) */".

## Verified-accurate citations (spot-checked, not exhaustive)
The great majority of the primary doc's engine citations check out exactly against
`index.html` at the commit it claims to have read (b5dc525, one before 31a51fc3, tree
clean at review time): the five-key contract (9307-9314), `_convoCall`/`max_tokens:
400` (9336-9343), `_convoScript` modulo cycling (9362-9364), `_armSilenceTimer` 6s
timer (9927-9934), `_sttErrMsg` no-speech copy (9114-9118), `_aiJsonExtract`
(9120-9126), the fabricated joined-alt confidence values (5213, 5220-5225 --
genuinely fabricated `conf:1`/`conf:0.9`, correctly characterized as decorative),
`_isConvoFarewell` (9407), `FREE_SCENE` declared outside `SCENES` (2874),
`convoHandsFree` default true (2789), the ADR-009 banned-word list (verbatim match to
docs/decisions/ADR-009-judgment-free-interaction-spec.md:16), and the downshift
ladder structure (9693-9719, aside from the TTS-skip nuance in F3). The mic-restart
design (`rec.start()` post-onend not re-prompting on a granted-permission origin) is
a reasonable, appropriately-hedged claim, and OQ-3 already flags the main residual
risk (cumulative-restart misbehavior on non-Pixel SR services) -- no separate finding
raised there.

## Verdict

**FAIL** -- two FATAL findings. F1 means the module-structure lock as written will
not load (duplicate top-level const) without at minimum a rename the doc never
specifies, directly contradicting the charter's own instruction to map onto existing
state without a rewrite. F2 means the flagship confirm feedback signal -- the fix for
the owner's literal top complaint -- is invisible by default because it depends
entirely on an opt-in, off-by-default orb, with no fallback channel specified. Both
are cheap to fix (rename the module constant; add a non-orb confirm affordance or
flip the default) but must be fixed before this doc is treated as forge-ready, since
Stage F2/F4 as written would either crash the app or silently fail to solve the
stated problem for most users.
