# Delve 13 -- Code-review adversary audit

Against `docs/delve-cycles/13-pieces-everywhere.md` (committed e1e0a015) and `index.html` @
`APP_VERSION = '9.32'` (line 1272). Method: re-derived the primary doc own headline statistics
(word counts, kind breakdowns, threshold table, tile pass/fail) from `N5_PACK`+`ADV_PACK`+
`WORD_FAMILIES` by extracting and evaluating the literal data (not re-typing it), then read every
engine seam the doc cites at its stated line number. Charter-conflict check: neither the primary
doc nor the charter contains any text resembling an instruction to this agent; nothing to report
on that front.

Headline: the doc arithmetic is exceptionally accurate. Every quantitative claim I
independently re-derived matched exactly: 4,901 pack lines / 71 tombstones / 4,830 live, 649
families in use with zero orphans, mean/median/max 7.44/7/25, the full kind-by-kind family and
word breakdown, 403 families with no `p` (341 group + 62 non-group), 2,223/437/2,170 word split
(46%/9%/45%), 52 `VOCAB_SECTIONS` ids, 18 tiles with more than 3 kinds, 172 families over 8 (78
form_* + 94 content), 0 families under 3, 0 tiles under 30 words, the 50/60/70 percent
threshold-sensitivity table (14/36, 13/37, 13/37 with the exact tile lists), the yield-scan
numbers for actions/work/transport/greetings, the 17-tiles-over-75pct-topic list, and every cited
counter-ladder size (time_months 12, calendar_ages_11_80 12, calendar_days_1_10/calendar_hours/
counters_people/counters_books 11, counters_people exact 2 irregulars hitori/futari). Every
engine-seam line citation I checked (ensureSm 8332, WORD_FAMILIES 6420-7072, ADV_PACK 6395,
_famOf/_famInfo/_famKey/_famTake/_famOrder ~23449-23517, _roundSize 23637, _freeTierCapPool
10877, stickyBatch[key] assignment 23753, _famNailedKeys/_autoSwapCheck/buildAutoSwapUndo
25499-25547, buildMixFamilies 25560, renderSticker 30354, _coldEligible 28936, COLD_N 28908)
resolved to the claimed content within 0-1 lines. This is not a doc that recalled numbers from
memory; it visibly parsed the file.

Given that baseline, my findings below are concentrated on (1) one place where the doc own
foundational metric (D4 46 percent split) counts data it elsewhere says should not count, (2) two
buildability/sizing gaps against the v9.30/9.32 seams, and (3) minor citation drift.

---

## Findings
### FATAL -- The piece tier (D4 headline 46%) includes families whose p is not a real,
literal, non-banned piece -- contradicting the doc own BRIEF rule 6/7 and validator rule 2/4

The doc defines piece (Section 2 tier table) as families whose `p` is "a substring you can point
at, shared by every member," and proposes validator rule 2 ("p must be a literal substring of
every member jp... at the right end") and BRIEF-forbid rule 7 ("Never use 〜ます... as a piece...
This kills the scan largest false positive"). But the current `WORD_FAMILIES` data -- which the
Method four read-only passes parsed to produce the 2,223-word/46% figure -- already contains
`stem`-kind families whose declared `p` is literally the banned string `"ます"`, and whose members
mostly do NOT contain it:

- `index.html:6702` -- `"actions_take_hold":{"n":"Take & Hold","k":"stem",...,"p":"ます"}` -- of its
  10 members, 6 are plain-form verbs (`とる` 1725, `もつ` 1726, `つかう` 1727, `ひろう` 1929,
  `なくす` 1965, `おとす` 1966) that do not contain `ます` at all.
- `index.html:6703` -- `"actions_thinking"` -- same shape, `p":"ます"`, 4 of 8 members plain-form
  (`わかる`, `しる`, `おもう`, `えらぶ`) with no `ます` substring.
- `index.html:6668` -- `"directions_turn_cross"` -- `p":"ます"`, 4 of 8 members plain-form.
- `index.html:6777` -- `"clothing_put_on_verbs"` -- `p":"ます"`, 4 of 8 members plain-form.

That is 34 words counted inside D4 piece tier via a piece value the doc own Section 2 argument
calls worthless ("actions 36/66 is 1 piece: 〜ます... It carries no meaning the learner does not
get free") -- the doc makes that exact argument about a different (group-tier) case in Section 2
without noticing the same string is already sitting as the declared `p` on four stem-tier
families it counted toward the 46%.

Separately, `frame`-kind `p` values are full template sentences, not substrings:
`index.html:6509` -- `"emergency_calling_110_119":{"k":"frame",...,"p":"___ を よんで ください"}`
-- of its 5 members, 2 literally contain the phrase (`きゅうきゅうしゃ を よんで ください` 4584,
`けいさつ を よんで ください` 4585) and 3 do not at all (`ひゃくとおばん` 3106,
`ひゃくじゅうきゅうばん` 3107, `つうほうします` 4645). This family mixes genuine frame-sentence
instances -- which Section 2 explicitly rejects building as strategy (b), calling it "unbuildable
under the locks it would have to break" -- with plain topic vocabulary, inside one family counted
as "piece."

A broader mechanical scan (literal-substring check, allowing /-separated p variants) across all
649 in-use suffix/prefix/stem/frame families finds 105 families where at least one member jp
does not contain p. Many of those are explainable by regular Japanese sound-shift (godan/ichidan
te-form rendaku: のむ becomes のんで; form_can_* declared p:"られます" not appearing in godan
potentials like のめます/かけます) and are defensible as "the same grammatical piece" to a reader
who knows the rule -- but the doc validator rule 2 states the literal-substring requirement with
NO exception clause for morphophonemic variation, and "every rule is a hard fail, no warnings
tier" (Section 5). Taken together with the ます/frame cases above, which have no phonological
excuse:

1. D4 "single most load-bearing fact... 46% pointable piece" is measured as "family has a p
   field," not "every member literally has the piece." The true share of words with a verified
   literal, non-banned piece is measurably lower than 2,223/46%, and the doc never states this
   gap despite four dedicated read-only passes.
2. The validator (Section 5) would either hard-fail against tiles the doc calls "finished, not
   extensible" (the form_can_*/form_now_*/etc. families under D1 flagship shape (a)) or it needs
   an undocumented scope limit / morphology exception that Section 5 never states. Rule 6
   ("Per tile: ... at least 60% of words in families with p") is silent on whether "with p" means
   "family has a p field" (current baseline reading, includes the actions_take_hold-style false
   positives) or "member jp literally contains p" (the stricter reading rule 2 demands for new
   cuts) -- the two readings disagree on real data, and neither is picked.

This directly answers one of my assigned questions ("is the validator... sufficient to catch a
bad re-cut before it ships?") in the negative as currently specified: it is not unambiguous even
against words already in the deck, so it cannot reliably gate 3,300 lines of new fam
assignments.

### SERIOUS -- D6 word-by-word topic graduation is undersized in the Section 5 estimate; it also
touches the auto-swap UI copy layer, not just _famNailedKeys

`_autoSwapCheck` (`index.html:25520`) computes `drop` as WHOLE FAMILIES: `const keys =
_famNailedKeys(batch, byId)` then `drop = new Set(batch.filter(id => ... keys.includes(_famKey(w))))`.
The undo/toast state is also family-shaped: `state._autoSwapUndo = { key, batch: batch.slice(),
names }` and `_autoSwapHtml()` renders "You have got {names} -- swapped {them/it} for new words"
where `names` comes from `_famInfo(k).n` per dropped family key (`index.html:25547-25554`).

D6 proposes topic families graduate word-by-word while piece/relation families keep
family-wise graduation (Section 2 tier table; D6 in Decisions reached). That means
`_famNailedKeys` must return a MIXED unit type -- family keys for piece/relation, individual
word ids for topic -- and every downstream consumer of its output (_autoSwapCheck drop
construction, the names list built for the swap banner, state._autoSwapUndo restore path) has to
handle both unit shapes. The Section 5 size table attributes this whole change to "Code -- topic
tier: word-wise graduation in _famNailedKeys ~15 lines" and does not mention
_autoSwapCheck/_autoSwapHtml/buildAutoSwapUndo at all, even though those are exactly the
functions the doc own Method list names as part of "the engine seams the decisions have to
survive." There is also an unaddressed UX question the doc does not raise: what does the swap
banner copy say when a single topic word (not a family) retires -- does it get its own line per
word, one per round-end, or does it need batching logic that does not exist today? Not fatal to
the decision, but the roughly-15-line estimate and the "buildable without touching the v9.30/
9.32 seams" framing understate the actual surface touched.

### QUESTIONABLE -- Section 3E _mixOut cap claim does not hold for max-size ladders, and gives
zero protection exactly when the current claim says it is load-bearing

Section 3E states: "a tile of 30 words caps avoid at 10, which is one ladder... the validator
must keep it that way." Checking `buildMixFamilies` (`index.html:25560-25588`):

```
const avoid = new Set(drop);                       // 25583 -- current mix drop, UNCAPPED
let capN = Math.floor((_topicWords(sec)||[]).length / 3);  // 25585
for(const id of prevOut){ if(avoid.size >= capN) break; avoid.add(id); }  // 25586
```

Two problems with "capped at 10, which is one ladder": (1) D8 sets ladder max at 12
(time_months, calendar_ages_11_80 are both verified 12-word ladders), so a 10-word cap on a
30-word tile is less than one full-size ladder, not "one ladder." (2) More importantly, `avoid`
is seeded with the CURRENT, uncapped `drop` set before the cap is even checked -- the loop
only adds from `prevOut` (the memory of the previous mix) while `avoid.size < capN`. On exactly
the ladder-heavy 30-round scenario Section 3E calls out as now load-bearing, `drop.size` (a whole
ladder, 9-12 words) already meets or exceeds `capN` (10 on a 30-word tile), so the loop adds ZERO
words from `prevOut` -- the "remember the previous mix so tapping Mix twice moves forward"
guarantee (the comment at `index.html:25581-25583`) silently provides no protection in that case.
This is not a starvation risk (the doc own "all 50 tiles hold at least 30 live words" fallback
covers that), it is a correctness gap in the anti-repeat guarantee the doc explicitly asks the
validator to "keep... that way" (Section 5 rule 10) without the validator rule actually testing
for it (rule 10 checks fill and cap compliance, not "does the second Mix ever repeat the first").

### NITPICK -- Citation line-number drift

`Math.ceil(batch.length / 2)` is cited at 25575 in Section 3E; it is actually at
`index.html:25570` (a 5-line drift). `state._mixOut[key] = [...drop]` is cited at 25588; it is
actually at `index.html:25587` (1-line drift, negligible). Neither changes the finding it
supports, but per the charter citation-discipline standard these are worth a pass before the ADR
filing step, since an independent auditor checking 25575 will land one line short of the actual
statement.

### QUESTIONABLE -- Validator rule 2 "positioned correctly" is defined for only 2 of the 4 kinds
it governs

Section 5 validator rule 2: "suffix/prefix/stem/frame MUST have p; p must be a literal substring
of every member jp, positioned correctly (prefix at start, suffix at end)." Position is defined
for prefix and suffix only; stem (piece in the middle, e.g. health_pain `いた` inside `いたい`/
`いたみ`/`いたみどめ`) and frame (a template with a ___ slot, not really a "position" at all --
see the FATAL finding above) are left unspecified. Given rule 2 is a hard fail with no warnings
tier, an agent implementing scripts/check-families.js from this spec alone would have to invent
the stem/frame position check, which is exactly the kind of ambiguity the validator is supposed
to remove before wave 1.

---

## Summary

The data-analysis work in this primary doc is unusually rigorous and verifiably accurate --
every headline statistic I independently re-derived from index.html matched exactly, and every
engine-seam line citation resolved correctly. The delve shape (D1-D3 tile rule, D8-D11
round/family size, D12 sticker-page teaching surface, D13-D16 measure-before-building process)
is well-grounded and internally coherent. The material problem is narrower but real: the doc
own foundational metric (D4 46%/9%/45% split, called "the single most load-bearing fact in this
delve") counts some words as "piece" via family p values the doc own later rules (BRIEF rule 7,
validator rule 2) would reject -- concretely, four stem families (34 words) carry the banned,
non-literal p:"ます", and one frame family mixes genuine template instances with plain topic
words. That gap, plus the undersized estimate for D6 UI-copy surface and the imprecise _mixOut
cap claim, mean the validator as specified (Section 5) is not yet sufficient to safely gate a
3,300-line re-cut -- it needs a stated scope (which families it validates), an exception rule for
morphophonemic variation, and a stem/frame position definition before wave 1 ships. None of this
invalidates D1-D3, D8-D16; it narrows confidence in D4 exact percentage and in the "validator
ships before wave 1" plan current completeness.

## Verdict: WARN

