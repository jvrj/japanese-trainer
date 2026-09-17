# ADR-031 — A declared piece is a claim, and 910 words currently make a false one

- **Status:** Proposed (pending owner signoff)
- **Date:** 2026-09-17
- **Source:** Delve 13 round 2 — `docs/delve-cycles/13-pieces-everywhere.md` Task 3 and the round-2 synthesis. Proposed in the primary as "ADR-P6"; promoted to a number at synthesis. Findings behind it: CR-F1 (r1, FATAL), DA-r2-S3, DA-r2-S6, CR-r2-S1, CR-r2-S3.
- **Extends:** ADR-027 (a tile is a shelf of pieces), ADR-028 (three tiers: piece · relation · topic)
- **Related:** ADR-029 (amended r2), ADR-030 (verify then measure before re-cutting)

## Context

The delve began from a real observation: the owner learns Dates effortlessly *"because they all have
a piece in them."* Round 1 measured how much of the deck has one and reported **46%**. Round 1's own
code-review lens then applied the delve's validator rules to that figure and found it counts
**declarations**, not pieces. Re-derived twice since, by two independent parsers, and again at
round-2 synthesis:

| Bucket | Test | Families | Words | Share |
|---|---|---|---|---|
| **verified** | `p` is a literal substring of **every** live member | 100 | **893** | **18.5%** |
| **variant** | literal in ≥80% (rendaku counters, ついたち) | 41 | 420 | 8.7% |
| **banned** | a bare inflection (ます/です/ない/ました/ません) | 28 | 334 | 6.9% |
| **bogus** | absent from more than a fifth of members | 77 | 576 | 11.9% |
| none | no `p` at all | 403 | 2,607 | 54.0% |

The headline moved **55% → 46% → 18.5%** across three tellings, and each correction came from
applying the project's own rules rather than from new data. That history is the reason this decision
exists: the number was never the problem, the **absence of a definition** was.

**banned + bogus = 910 words in 105 families — 18.8% of the deck — assert a piece that is not
there.** That bucket is almost exactly the size of the verified tier, and nothing in the tier model
named it. It is not inert: the teaching surface heads a family block with the family's name and its
`h`, so for these 105 families the app would tell a beginner that words share a pattern they do not
share. Two concrete instances found while writing this: four `p:"ます"` stem families over unrelated
verbs, and `counters_times`, which declares `p:"かい"` over seven members of which three are
にど・さんど・なんど — a **different counter word**, not a rendaku variant.

## Decision

1. **A `p` is a claim with a truth value, and the value is one of four: `verified` · `variant` ·
   `banned` · `bogus`.** The validator computes it from the live pack lines. It is derived, never
   authored — no new pack-line field and no new family field.

2. **`verified` is the single published standard.** Every gate, every baseline, every coverage
   figure and the *finished* label are scored on verified coverage and on nothing else. This settles
   the inconsistency that let one document rank four pre-conjugated grammar drills above `calendar`
   on one basis while arguing rendaku tolerance on another.

3. **Rendaku normalisation is scoped to exactly one place — the closed-set-ladder test** — where the
   unit under test is a counter and rendaku is what counters do. It never re-scores tile coverage,
   never moves the ratchet, and never promotes a tile to *finished*. **`variant` is reported, never
   enforced**, so the honest statement *"`calendar` is 44% verified and 79% on a rendaku-tolerant
   basis"* can be made without either number quietly becoming the gate.

4. **The teaching surface renders the first two and only the first two.** A family whose `p` is
   `banned` or `bogus` renders as a plain list with **no piece header** until its record is
   corrected. Teaching a piece that is not there is worse than teaching nothing.

5. **Retracting a false piece outranks manufacturing a true one**, on both cost and certainty:

   | | scale | cost | certainty |
   |---|---|---|---|
   | **Create** piece structure (the re-cut) | 529 words / 5 tiles, 2.5% → 20% target | ~360 words re-familied, 5 agent runs | projected yield **6.4%** against a **20%** gate |
   | **Retract** false structure | **910 words** | **105 family records**, zero pack lines, zero agent runs | fully determined by a script |

   Therefore the retraction ships **first**, ahead of every engine change, and the re-cut ships only
   on a measured reading — never on an argument.

6. **The retraction is not free, and its cost is a composition cost.** Re-kinding the 67 bogus/banned
   **content** families to `topic` moves 468 words into the tier the round rules ration hardest. Its
   measured effect: tiles that cannot legally assemble a 10-round go from **3** to **8**. The
   retraction therefore **ships with or after ADR-029's relaxation ladder, never before it.** Recorded
   here because the retraction was first costed as "no pack line changes at all," which is true and
   was mistaken for "no cost."

7. **Two rule corrections follow immediately, or the standard contradicts the deck it scores:**
   - the banned-inflection list gains **"…except as the shared `p` of a one-piece tile"** — 〜ました
     *is* the piece of the `form_did` tile, and the ban exists to stop 〜ます being claimed over a bag
     of unrelated verbs, not to deny a one-piece tile its piece. Recovers **334 words** honestly.
   - a piece whose surface string **varies by verb group** is not a suffix. `form_can` declares
     `られます`, absent from 17 of the 24 members of `form_can_make` (godan potentials end 〜えます).
     It is a relation or a frame, and it is a data error — not a size or naming problem.

## Numeric acceptance gate

- The validator classifies **100%** of the 649 families into exactly one of the four states, and its
  counts reproduce **100 / 41 / 28 / 77 / 403** at HEAD. Two independent parsers already agree on
  these; a third implementation that disagrees is a bug in the validator, not a new finding.
- After the retraction, families in the `banned` or `bogus` state number **≤ 38** (the `form_*`
  residue recovered by decision 7) — i.e. **≥ 67 of 105 corrected**, and **0** content families
  remain in either state.
- Verified coverage after the retraction is **≥ 25.5%** of the live deck (18.5% + the 334 recovered
  one-piece-tile words), measured by the same script that produced 18.5%.
- **0** family blocks on the teaching surface render a piece header for a family in the `banned` or
  `bogus` state.
- Round service is unaffected: **100%** of tiles still assemble a full round at both round sizes
  **after** the retraction, with the relaxation log firing on exactly the 8 named tiles.

## Reversal trigger

- The retraction moves verified coverage by **< 5 points** (i.e. lands under **23.5%**) → the
  one-piece-tile exemption in decision 7 is doing all the work and the retraction itself is
  bookkeeping; re-open whether the `bogus` threshold (absent from >20% of members) is simply too
  strict rather than the data being wrong.
- Any tile loses **> 30%** of its round-composition headroom after the re-kind, or a tile becomes
  unservable that the relaxation ladder cannot serve → the content families are re-kinded to a new
  pieceless-but-openable kind instead of to `topic`.
- The owner reads a plain-list family block (decision 4) as a rendering bug rather than as honesty on
  **> 1** surface → the presentation changes; the standard does not.
- A measured reading ever shows **≥ 20%** reachable verified coverage on a pilot tile → decision 5's
  ordering is not reversed, but the re-cut re-enters for that tile immediately, on the number alone.

## Consequences

- **The delve's founding observation survives and is explained rather than refuted.** The owner
  learns Dates because Dates is one of the few places where the piece is real. 18.5% does not say the
  piece hypothesis is wrong; it says the structure is rare, which is why manufacturing it elsewhere
  is expensive and why claiming it falsely is cheap.
- **The deck gets smaller-sounding and more honest.** "46% of words have a piece" becomes "18.5% do,
  8.7% nearly do, and 18.8% falsely say they do." Every later decision is denominated in the third
  number, which is the one nobody had counted.
- **A standing obligation on new data.** Every family authored from here carries a claim the
  validator will score, so the BRIEF gains a rule the author must satisfy before the family lands,
  rather than a backlog item discovered a delve later.
- **This decision is cheap to state and expensive to unpick.** Once the validator, the teaching
  surface, the ratchet baseline and the retraction item are all denominated in `verified`, changing
  the standard means re-scoring all four. That is precisely why it is an ADR and not a note.
