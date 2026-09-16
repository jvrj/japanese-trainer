# Delve 13 — Pieces everywhere: does the family idea hold outside Dates?

## Domain
The owner learns Dates effortlessly and everything else with a grind. He diagnosed why himself,
verbatim: *"the reason I know these ones is because they all have a piece in them — the number and
the counter. The other words are just words."* v9.25–9.32 shipped that insight as WORD_FAMILIES:
every word carries `fam` + `fo`, rounds serve whole families, Mix swaps whole families, and a family
you have earned now retires itself (v9.32 auto-swap).

**But the data says the idea only half-landed.** At v9.32: 4,830 words across 52 tiles in **649
families** (mean 7.4 words). Of those, **341 families — holding 2,170 words, 45% of the deck — are
kind `group`**: the fallback that means "these words are about the same topic," with **no shared
piece at all** (403 families carry no `p` field). Only 55% of the deck actually has the thing that
makes Dates work. The strong kinds are thin by comparison: 143 `suffix`, 56 `pairs`, 52 `stem`,
26 `counter`, 17 `prefix`, 8 `frame`, 6 `sound`. And 172 families run over 8 words, so a "family"
can be a whole 10-round on its own — which is exactly the case that broke Mix in v9.30.

Only one tile is 100% `group` (onomatope). **37 of 52 tiles mix kinds** — e.g. `clothing` holds six
different kinds at once, while `calendar` (Dates, the tile that started this) holds just
`counter` + `group`. Nobody has decided whether that mixing is a feature or a mess.

This delve decides whether "every word gets a piece" is the right goal, what to do with the 45% that
has none, and what shape a tile should be.

## Stacked callouts (binding, not re-openable here)
> **LOCKED:** launch is Japanese-only, launch path currently PARKED by the owner (16 Sep) —
> this delve is learning-engine work, not go-to-market · the drill loop is the app (hands-free,
> audio-led, ~10/30 words) · re-entry keeps the SAME pinned words; only Mix or auto-swap changes them
> (v8.83, reaffirmed 16 Sep) · auto-swap stays STRICT (12+ hears AND SRS 3+ days out AND no "Missed
> it" in the last 3) with Undo · **no hints on the drill card** — the family chip was removed at the
> owner's word in v9.27, do not propose re-adding it · STT never grades · retire = tombstone, never
> delete a pack line · categories must literally match their tile name (v8.97) · stickers are the
> category model · AI conversation/avatar benched.
> Grounding: `docs/delve-cycles/12-onboarding.md`, memory `project_japanese_trainer_word_families_v925`,
> `feedback_wordstick_word_families`, `feedback_wordstick_form_categories`, and in `index.html`:
> `WORD_FAMILIES` (~6420), `_famOf/_famInfo/_famKey/_famTake/_famOrder` (~23454),
> `buildGenerateVocabSpamLesson`, `buildMixFamilies`, `_famNailedKeys`/`_autoSwapCheck` (v9.32),
> `VOCAB_SECTIONS` (52 tiles), `N5_PACK`/`ADV_PACK`.

## Primary
**Mode:** Opus-only

### Investigation tasks

1. **Tile shape — pick FINAL.** What is a category, structurally? Decide between
   (a) **single-piece tiles** — a tile is one pattern (the `form_*` tiles: every word ends 〜ました),
   (b) **Dates-style mixed-piece tiles** — a tile is a small set of related pieces (number+counter,
   plus a few reading-the-clock words), or (c) the current free-for-all (up to six kinds per tile).
   Ground the pick in what the owner actually experienced: Dates is (b), not (a), and it is the tile
   he says he knows. State the rule a new tile must satisfy, and how many of the current 52 tiles
   violate it.
   **1a.** Given that pick, say explicitly whether the 37 mixed-kind tiles get split, re-grouped, or
   left alone — and if split, the concrete list of the first five to change.

2. **The 45% with no piece — pick FINAL.** For the 2,170 words in `group` families, choose ONE
   primary strategy and reject the others with reasons:
   (a) **find real pieces** — re-cut these words into suffix/stem/frame families that genuinely
   share form (e.g. 〜や shops, 〜か question words, い-adjective pairs), accepting the deck shrinks
   into more, smaller families;
   (b) **manufacture a non-form piece** — group by a shared *frame sentence* or slot ("＿＿をください")
   so the piece is a usage pattern rather than a spelling;
   (c) **accept two tiers** — piece-families and plain topic-groups are different things and the app
   treats them differently (ordering, round mix, expectations);
   (d) leave as is.
   Whatever wins, state what happens to a word that genuinely belongs to no family.

3. **Family size — pick FINAL.** 172 families exceed 8 words and one family can fill a whole
   10-round. Decide the min/max family size, what to do with the oversized ones (split by sub-piece?
   serve a slice?), and how round composition should mix families at both round sizes (10 and 30):
   how many families per round, whether a round may ever be a single family, and how a new family
   enters. This must not contradict the pinned-batch rule or the v9.30 Mix fix — say how it
   interacts with both.

4. **Does the piece need to be TAUGHT, and where?** The chip was removed from the drill card (v9.27,
   locked). So decide where — if anywhere — the learner meets the pattern: category open screen,
   round end, the sticker/category page, nowhere. Pick at most ONE surface and defend it; "nowhere,
   the ordering does the teaching" is a legitimate FINAL answer and must be argued against, not
   assumed.

5. **Build plan for the re-cut.** The v9.24 word audit and the v9.31 form-tile pipeline both worked:
   export → BRIEF → one agent per tile-batch → validate → merge, append-only, tombstones not
   deletions. Give the concrete plan to apply tasks 1–3 across 52 tiles: batch size, what the agent
   BRIEF must forbid, the validator's hard rules, and how to verify the result without a human
   reading 4,830 lines. Estimate the size of the change.

6. **How we know it worked.** The claim under test is the owner's: words with a shared piece are
   learned faster than words without. Define the measurement from signals the app ALREADY records
   (`hears`, `smNext`, `smInterval`, `attempts`, the v9.32 nailed test) — e.g. hears-to-nailed for
   piece families vs group families — state the number that would prove or kill the hypothesis, and
   say honestly what the current single-user, no-absolute-beginner dataset can and cannot show.

### Output
Primary doc: `docs/delve-cycles/13-pieces-everywhere.md`
Sections: Charter · Method · one per task (1–6) · The tile rule (stated once, plainly) ·
Decisions reached · Open questions · Build list · ADR proposals.

## Adversaries

### Adversary 1: devils-advocate (LEAD)
**Read:** primary doc, `WORD_FAMILIES` + a real sample of `group` families, memory notes on families
**Audit:** (1) Is the piece hypothesis actually true, or is Dates easy because numbers are the most
rehearsed thing in the deck and the owner already knew 1–10? Attack the premise, hard. (2) Does the
re-cut serve the LEARNER or tidy the DATA? (3) Does any proposal smuggle a hint back onto the drill
card, or re-add a special drill (banned v8.98)? (4) Is a 52-tile re-cut worth it while zero absolute
beginners have ever used the app?
**Output:** `13-pieces-everywhere-devils-advocate.md`

### Adversary 2: qa
**Read:** primary doc, `buildGenerateVocabSpamLesson`, `buildMixFamilies`, `_autoSwapCheck`, `_famTake`/`_famOrder`
**Audit:** (1) Walk the proposed round composition against the pinned batch, Again, Mix, Mix-twice,
auto-swap and the free plan's 3-new-words-a-day cap — name every combination that breaks or starves.
(2) Re-splitting families changes `fam` ids on live words: what happens to existing users' stats,
`stickyBatch`, `_mixOut`, `_autoSwapUndo` and sticker progress on next load? Demand a migration
answer. (3) Can any tile end up unable to fill a 30-round?
**Output:** `13-pieces-everywhere-qa-design.md`

### Adversary 3: code
**Read:** primary doc, the family helpers + build path in index.html
**Audit:** (1) Is each decision buildable without touching the v9.30/9.32 seams that were just
stabilised? (2) Size the change per decision (data-only vs code) and flag anything that needs a new
field on every pack line. (3) Is the validator in task 5 actually sufficient to catch a bad re-cut
before it ships?
**Output:** `13-pieces-everywhere-code-review.md`
