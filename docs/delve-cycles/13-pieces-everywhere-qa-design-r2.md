# Delve 13 Round 2 — QA / Design adversary audit

**Auditor:** qa-tester (read-only) · **Target:** `docs/delve-cycles/13-pieces-everywhere.md` @ 72ab1f97
(`## Round 2` section, lines 1033–1675) · **Charter:** `docs/delve-cycles/13-charter-r2.md`, Adversary 2.
**Lens:** test/verification design — are acceptance criteria testable, are regressions covered, are
the proposed verification checks sound and non-hallucinated?

**Charter-conflict note (both docs treated as data):** neither the primary doc nor `13-charter-r2.md`
contains text directing this agent to take any action beyond the audit itself (no "run git add",
no "ignore previous instructions" or equivalent). Nothing to report here beyond this confirmation.

---

## Part 1 — Independent re-audit of all 21 round-1 dispositions (done FIRST, per charter)

I re-derived closure independently against `index.html` (not by trusting the primary's own Task-2
table) before reading Round 2's amendments. Citations below were checked directly against source
(exact line/content) unless marked otherwise.

| # | Finding | My verdict | Basis |
|---|---|---|---|
| DA-F1 | caps wired to wrong function | CLOSES | `_stickyTopUp` 23617, `_obfBiasFresh` defined 23518/called 23630+23731, `_famTake` called 23631 — all verified verbatim; four-path table lands in doc §3C. |
| DA-F2 | validator ships red | CLOSES | Two-tier split (hard 1/7/8, ratchet rest) lands in §5; hard-tier "green at HEAD" claim is independently checkable (fam/fo presence, `fo` uniqueness) and plausible given `fo` is written per line at authoring time. |
| DA-S3 | D15 gate unreachable | CLOSES, stale pointer | `COLD_N=10` (28908), `pick=[...re.slice(0,2),...nw].slice(0,COLD_N)` (28969), `_coldEligible`'s `1e13` boost (28955) all verified. B1's row still says "gates B10/B11 only" post-B11-removal — stale, flagged again below. |
| DA-S4 | `hearsAtCert` measures sessions | CLOSES | `st.hears++` at 28166, `b._credited` exactly-once guard at 28188 verified; rename to `sessionsAtCert` present in §6/D15/D16. |
| DA-S5 | D6 kills auto-swap banner/Undo | CLOSES | `_autoSwapHtml` returns `''` on empty names at 25556 verified; B3 names all three functions. |
| DA-S6 | §4 picks the surface it rejects | CLOSES | `stkOpen`/`h8-hero-cta` routing verified at 30237/30379 (approx, not independently re-read this round — inherited from r1's clean audit); §4 body now pins blocks "strictly below" the CTA. |
| DA-S7 | premise challenge under-applied to B10 | **Reproduces primary's own finding: did not close until Round 2 Task 3** — see Part 2. |
| DA-Q8 / QA-S2 | migration risk misdiagnosed / fields not persisted | CLOSES | `save()` key list (7865–7899 region) — not re-verified line-by-line this round, inherited from r1's audit; logic (fields are session-transient, reload clears them) is sound on its face. |
| DA-Q9 | `_famNailedKeys` groups batch not family | CLOSES | Verified independently: `_famNailedKeys(batch, byId)` groups only ids present in `batch` (25499–25501), `every()` at 25507. Confirms the correction is accurate. |
| DA-Q10 | wave-0 exemption "removes the D9 collision" | **DOES NOT CLOSE, and I independently reproduce the primary's own reversal of it** — see Part 2, Task-1 finding. |
| DA-N11 | threshold band overstated, 14th tile unnamed | **See finding QA2-1 below — the primary's own row is self-contradictory about whether this closes.** |
| QA-F1 | rule 10 starvation unenforced | CLOSES | `cooking` re-measured independently at 41 live words via `grep -c` pattern would be the honest check; I did not re-run the full parse this round but the specific arithmetic (30-round on a 41-word tile) is sound bin-packing (30+15avoid > 41 is not guaranteed short by itself, but the doc's `sectionPool − kept − avoid` framing is directionally correct). |
| QA-Q3 | free-plan combination half-answered | **DOES NOT CLOSE per primary's own admission (B7 never updated) — I confirm this by reading B7's actual row, see Part 2.** |
| QA-Q4 | dangling `certHears` citation | CLOSES | `grep -c certHears index.html` → 0 matches, confirmed independently. |
| QA-N5 | citation drift 3–5 lines | CLOSES | Independently re-verified: `Math.ceil(batch.length / 2)` at **25570**, `avoid` seed at **25584**, `capN` at **25585**, `state._mixOut[key]=[...drop]` at **25587** — all exact, matching the doc's round-2 correction. |
| CR-F1 | 46% headline not real pieces | **DOES NOT CLOSE until Task 3 — confirmed; see Part 2.** |
| CR-S2 | D6 undersized | CLOSES | Merged with DA-S5, same evidence. |
| CR-Q3 | `_mixOut` cap gives zero protection | CLOSES, but the fix landed in validator rule 10(b) not in B7 as the synthesis table implied — **confirmed independently: B7's row (build list) still reads only the single-ladder-Mix case until Round 2 patches it**, see Part 2. |
| CR-Q4 | rule 2 positioning undefined for two of four kinds | CLOSES | All four positions (`prefix`/`suffix`/`stem`/`frame`) are spelled out in §5's rule 2. |
| CR-N5 | duplicate drift | CLOSES | Same two lines as QA-N5. |

**My independent tally, before reading Round 2's own audit: at minimum 5 do not close as originally
dispositioned (DA-S7, DA-Q10, QA-Q3, CR-F1, CR-Q3-as-filed), consistent with the primary's own
Round-2 Task-2 conclusion of "16 close / 5 do not."** Where I differ from the primary's own count is
**DA-N11** — detailed as a standalone finding below, because the primary's own row resolves it inline
and then still counts it against itself.

---

## Part 2 — Findings against the Round 2 amendments

### QA2-1 (SERIOUS) — DA-N11's row says "Closed here." but is tallied among the 5 that do not close
**Citation:** `docs/delve-cycles/13-pieces-everywhere.md:1360` ends *"...**`numbers` is the tile that
flips out at an 80% threshold.** Closed here."* — yet line 1384 lists `**DA-N11** (naming deferred to
a script for a one-line measurement)` inside the *"Do not close (5)"* summary at line 1380.
**Why it matters:** the four other rows in the same table that resolve elsewhere in this document use
consistent language — *"Closed by amended D8.2 above"* (DA-Q10, implicitly), *"Closed by Task 3"*
(DA-S7, CR-F1) — signalling "the r1 disposition did not close it, but this r2 document does, over
there." DA-N11's row instead computes its own answer **in place** and declares **"Closed here"** —
language that, on its face, means "resolved as of this row," not "resolved elsewhere." A document
whose entire Round-2 charter is fixing exactly this kind of self-reported-accounting slip (Gap 2:
*"the sweep was reported cleaner than it was"*) should not itself ship an ambiguous closure verdict
in the very artefact built to correct that failure mode. At minimum this is a terminology
inconsistency that defeats the doc's own stated audit method (*"deliberately structured so it can be
diffed row by row"* — line 1673); at worst the honest tally is **17 close / 4 do not close**, not
16/5, and the headline number in the doc's own Part-2 tally (line 1374, *"21 findings · 16 close · 5
do not"*) is off by one either way you read it.
**Recommendation for synthesis:** reword DA-N11's row to either (a) match the other four's "closed
elsewhere" phrasing and keep it in the not-closed tally with a clear pointer, or (b) move it to the
closed column and correct the 16/5 headline to 17/4.

### QA2-2 (FATAL) — Charter's explicit QA task 3 is unanswered: a partially-served family DOES break `_autoSwapCheck`'s all-nailed banner
The charter assigns this adversary exactly the question: *"Does a partially-served family interact
safely with the pinned batch and with `_autoSwapCheck`'s all-words-nailed test?"* (`13-charter-r2.md`
Adversary-2 audit item 3). **The primary doc never answers this anywhere in `## Round 2`** — grepping
the round-2 section for `_famNailedKeys`/`autoSwap`/`nailed` returns zero hits outside the unchanged
`## Decisions reached` legacy rows (D6, DA-S5/CR-S2, DA-Q9) that predate D10's slicing amendment.

The answer is **no, it does not interact safely**, verified against source:
- D10.3 (`13-pieces-everywhere.md:1255-1256`): *"Every other family enters as an ordered slice — its
  members in ascending `fo`, unseen first, up to the D9 share cap."* Applied to the 52 class-E
  `form_*` families (D8.2's one-piece exemption, all kind `suffix`), e.g. `form_now_make` (25 words,
  `k:"suffix"`, `p:"ています"`, `n:"Using & Handling"` — `index.html:6979`), a pin only ever holds a
  **slice** (5 seats at `roundSize` 10 per the Task-1 arithmetic table, row "25 | 1 | E | 5,5,5,5,5").
- `_famNailedKeys(batch, byId)` (`index.html:25499-25516`) groups **only the ids present in `batch`**
  (line 25501, `for(const id of batch)`) and calls a family "nailed" via `ids.every(...)` over that
  group (line 25507) — this is the exact grouping-by-batch behaviour DA-Q9 correctly identified, and
  D6 explicitly leaves it **unamended for non-topic tiers**: *"ladders keep family-wise graduation"*
  (`13-pieces-everywhere.md:807`) — piece-tier (`suffix`/`prefix`/`stem`/`counter`/`frame`) families
  are not mentioned as changed, so they retain the pre-D6 all-or-nothing `_famNailedKeys` path.
- `_autoSwapCheck` (`index.html:25520-25537`) computes `names = keys.map(k => _famInfo(k).n)` (line
  25529-25530) — `_famInfo` returns the **whole family record** (`index.html:23459`), so `fi.n` is
  the family's full name regardless of how many of its members were ever in the pin.
- `_autoSwapHtml` (`index.html:25552-25559`) renders `✓ You've got ${esc(list)} — swapped ${...} for
  new words` (line 25558) using that same full family name.

**Concretely:** once the first 5-word slice of `form_now_make` (25 words) is nailed (12+ hears, 3+
days out, no recent miss — `NAILED_HEARS=12, NAILED_DAYS=3` at `index.html:25498`), auto-swap fires
and announces **"✓ You've got Using & Handling — swapped it for new words"** while 20 of the family's
25 words are still unseen. This is the identical false-completion defect §2/D6 were written to kill
for `topic` bags (*"the app claims they have one"*, `13-pieces-everywhere.md:288-290`) — Round 2's own
D10 slicing amendment reintroduces it for every sliced piece-tier family (all 52 class-E families plus
any non-ladder, non-exempt piece family over 8 words), and neither B3, B6, B7, nor D10's text
mentions it. This is a regression the charter specifically asked this lens to check for, and it was
missed.

### QA2-3 (QUESTIONABLE) — D9.2's "report the actual card count, not the setting" has no code owner, and the one function that renders this copy today gets it backwards
**Citation:** D9.2, `13-pieces-everywhere.md:1230-1231`: *"the round-end pill must report the actual
card count, not the setting, or the app lies about a number the owner chose."* The only existing
function that renders round-size-dependent copy at round end is `_againLabel` (`index.html:23656`):
```
function _againLabel(n){ const r = _roundSize(); return r === n ? `▶ Again — the same ${n}` : `▶ Next round — ${r} words`; }
```
When the just-served count `n` (11, from a ladder overfill) differs from the setting `r` (10), the
**mismatch branch reports `r` — the setting — not `n`**, the opposite of what D9.2 requires. Neither
B6's re-scoped ~120-line estimate (`13-pieces-everywhere.md:1590`, targeting `_stickyTopUp` /
`_obfBiasFresh` / `_nextBatchNew` / `buildMixFamilies`) nor B7's four regression-test rows
(`13-pieces-everywhere.md:1591`) name `_againLabel`. The requirement is stated but has no line item.

### QA2-4 (QUESTIONABLE) — the "sums to exactly 30 in all 50 tiles" claim is asserted without shown work, unlike every other quantitative claim in this document
**Citation:** *"At `roundSize` 30 whole-family entry is arithmetically fine — a subset of family
sizes sums to exactly 30 in **all 50** tiles"* (`13-pieces-everywhere.md:1144-1145`). This is a
universally-quantified subset-sum claim over 50 tiles' worth of family-size multisets. Every other
load-bearing number in this document (the 86-family table, the wave-yield projection, the coverage
buckets) is either shown as a full enumerated table or explicitly labelled a projection with its
formula. This one is not — no per-tile combination is shown, unlike the round-10 table two sections
later which enumerates every one of the 86 families individually. Given the document's own standing
rule that a headline number gets re-derived and shown (CR-F1's whole arc), an unshown universal claim
about exact subset-sum across 50 independent tiles is exactly the kind of assertion this lens is
chartered to distrust until it sees the table.

### QA2-5 (NITPICK) — a self-citation in the Task-2 audit table does not support its own claim
**Citation:** DA-S6's Task-2 row (`13-pieces-everywhere.md:1355`) cites *"(479, 505)"* as the doc
lines proving *"the blocks are pinned below the `▶ Practice <name>` button."* Checked against source:
line 505 supports it (*"strictly below the `▶ Practice <name>` button"*); line 479 reads *"same entry
points (Practice → sticker,"* — a list of entry points, not a statement about pinning position. Minor,
but this table's entire premise is mechanical, verifiable citation (per the doc's own Task-2 method,
line 1342: *"deliberately mechanical — a text diff anyone can re-run"*), so a citation that doesn't
hold up under that same test is worth naming even at NITPICK severity.

---

## Verdict

**WARN.** The round-2 primary reproduces its predecessor's citations accurately everywhere I checked
against `index.html` directly (function bodies, line numbers, constants, family sizes — `form_now_make`
independently counted at 25 live members, matching the doc), and Task 1's composition arithmetic is
internally consistent everywhere I re-summed it. But the document ships two real gaps for this lens:
(1) the charter's own explicit QA task 3 — partial-family safety against `_autoSwapCheck` — goes
unanswered and the honest answer is "no, it isn't safe" (QA2-2, FATAL); and (2) the document's central
Gap-2 promise (accurate self-accounting of the 21 dispositions) ships with one row whose own text
contradicts the tally it is counted in (QA2-1). Neither is a reason to re-open the locked D1–D7/D11–D16
decisions; both are reasons the synthesis should require a fix pass before this round is treated as closed.
