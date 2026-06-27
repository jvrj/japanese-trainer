# Delve 1 — Conversation Mode · Devils-Advocate Audit (LEAD)

> READ-ONLY adversary doc. Lens: challenge the premise — right problem? fragile / over-built / wrong by construction?
> Citations verified against index.html (commit 9e36fb06) and the primary doc.
> No prompt-injection found in the primary doc or charter (both treated as untrusted data).

Verdict: WARN — buildable and unusually self-aware, but three premise-level tensions and one
load-bearing fragility need a synthesis ruling before forge.

---

## FATAL
None. The design is internally coherent and has a forward-exit on every turn.

## SERIOUS

### S1 — Adds a 7th mode against the user own "cut/bury every other mode" mandate
The locked scope decision in memory (project_japanese_trainer_scope_decision) is "the hands-free voice
drill loop IS the app; ... cut/bury every other mode + Library + settings wall." The primary doc restates
this: index.html is the spine and this mode "must strengthen that loop, not spawn a parallel UI paradigm"
(line 25). Yet section 9 locks "SITS BESIDE Sentence Coach" (line 207) — a new home tile + Daily Path step
+ own screen. That is adding surface, not cutting it. The rebuttal ("it extends the spine") is asserted, not
demonstrated: a new screen, new messages[] contract, new scoring path and new persistence key are a new
paradigm by any reading. The LEAD question synthesis must force: does conversation EXTEND the spam loop (a
turn variant inside the existing loop) or is it mode #7 with a sibling tile?
Citation: primary doc line 25 vs line 207.

### S2 — Load-bearing SRS signal sits on two stacked-unreliable layers and ignores existing kana machinery
Section 7.1 (line 180) makes judged.usedWords from a spoken reply "the authoritative" signal feeding
recordAttempt+smGrade. That signal is: Android Chrome STT -> Haiku judgement. The codebase itself documents
that Chrome ja-JP STT "loves to return 家 / 言った forms" (kanji) and built a whole scorer (_voiceScoreJa,
_kataToHira, _stripKanji, index.html:5364-5403) to normalize kana so spoken-word matching is reliable. The
convo design reuses NONE of it — it hands raw STT text to the model and trusts Haiku usedWords. So the one
signal the doc leans on to prove "the SRS tie-in is not cosmetic" is the least-controlled part of the system,
and it reinvents (by delegating to the AI) a problem the app already solved deterministically. Synthesis
should route spoken input through _voiceScoreJa before crediting, or soften the "not cosmetic" claim.
Citation: primary doc line 180; index.html:5366-5396.

### S3 — Dominant strategy for the exact user described is "tap chips," which earns zero learning by construction
The user pinned reason for AI-led chat is "as a beginner, we dont know what to say" (line 14). The design
answer is an always-present chip floor. But section 4.2 (line 113) makes chip-only turns earn ZERO SRS —
"chip-only sessions deliberately earn zero SRS progress." So the realistic loop for a learner who does not
know what to say is: tap the cheapest in-pool chip every turn -> a pretty 8-turn exchange that FEELS
productive -> no production, no SRS, nothing measurable. The "stretch" (free STT) is gated behind willingness
to speak AND STT reliability (S2) AND AI judgement. By construction the easy path trains nothing and the
rewarding path is the fragile one; a wrap-up nag ("you tapped through this one") is not a mechanism that
changes behaviour. What would change my mind: a chip design where the learner must SAY the chip to advance —
which the doc rejects (tap -> TTS speaks it -> counts the turn, line 248).
Citation: primary doc line 113 vs line 14.

### S4 — "Genuine back-and-forth" is a soft prompt instruction, not a structural property
Section 3.1 fuses react+probe into one call and concedes the only thing separating this from Sentence Coach
is that the acknowledgement is "mandatory and content-specific, not a canned いいですね" (line 70) — but
nothing ENFORCES that. It is a sentence in the preamble ("briefly react to what they just said," line 281).
When the learner taps a chip, the model input is one of the 2-3 strings IT just authored, so its "reaction"
has nothing to react to and degenerates to a canned ack + next probe — exactly the re-skinned Coach the LEAD
was told to hunt for. The schema judged field is not evidence of back-and-forth: it describes the PREVIOUS
reply, so the architecture is literally probe -> judge -> new-probe = single-turn judging in a loop.
Citation: primary doc line 70 and line 281.

## QUESTIONABLE

### Q1 — "Reusing its plumbing wholesale" overstates reuse; the contract pick maximizes net-new code
Line 43 claims the mode is "reusing its plumbing wholesale." But section 6.1 locks contract B (native
messages[]), which Coach does NOT use — Coach is a stateless single _coachCall(promptStr)
(index.html:9187-9199, one {role:user} message). B forces a new _convoCall, message windowing, new
persistence (LS.convo), a new screen, and a new scoring path. That is substantial new infra, not wholesale
reuse. If the goal is genuine reuse and lower risk, contract A (transcript inlined into the existing
_coachCall idiom) IS the Coach pattern and was rejected for elegance, not necessity.
Citation: primary doc line 43 vs line 140; index.html:9194.

### Q2 — No-key/offline path is a hand-authored fake conversation whose judging is broken by construction
Section 6.3 (line 170) locks a scripted fallback with "a kana-overlap heuristic" for spoken input. Per S2,
STT returns kanji, so a kana-overlap heuristic on raw STT systematically under-matches — the fallback only
judging signal is the one the codebase already proved unreliable without _stripKanji. Plus a 6-scene x
N-turn x chips x canned-ack bank, all hand-authored in core-pool kana, is a real authoring project booked as
a one-line lock. For a single-user app where the user has a key this is low-priority, but "never a dead tile
for the no-key majority" (line 170) describes users getting a FAKE back-and-forth — contradicting the
north-star for exactly the cohort it claims to serve. Citation: primary doc line 170; index.html:5366.

### Q3 — The SRS tie-in re-logs vocab production; it does not measure conversational ability
Section 13 (line 340) claims "Conversational Core % now has a direct contributor." But the credited event is
a learner speaking a pool word the AI judged correct — the same word-production signal spam mode and Coach
already record. Nothing in the schema measures the actually-new skill (comprehending an unscripted probe and
formulating a reply live); recordAttempt(id,convo) just tags the source. Conversation ability is exercised
but not measured; the metric still counts vocab events. Honest framing: a new practice surface, not a new
measurement. Citation: primary doc line 340.

## NITPICK

### N1 — startRandomDrill reuse for "drill missed" needs net-new code, slightly understated
Section 12 Q6 correctly flags startRandomDrill does not take ids. Confirmed: startRandomDrill(opts) reads
opts.count and builds its own pool via getActiveWords() + shuffle (index.html:14166-14180) — no id-injection
seam, so "reuse the existing path" is really "add a new seeded entry point." The recap "drill missed" button
(section 7.3, sold as "nearly free") carries unscoped work. Citation: index.html:14166-14180.

---

## What would change the verdict to PASS
1. A ruling on S1 (extend-the-loop vs mode #7) consistent with the scope mandate.
2. Spoken-word credit routed through the existing _voiceScoreJa/_stripKanji path (S2), or the "not cosmetic"
   claim softened.
3. A mechanism (not a nag) that makes the floor still require spoken production (S3).

Verdict: WARN.
