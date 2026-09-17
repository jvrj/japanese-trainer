# Delve 14 — Which words first, and where does a stranger start?

## Domain
WordStick launches Japanese-only to strangers from paid ads. The owner, asked directly who those
strangers are, verbatim: *"it doesn't have to be zero beginners, but obviously they would be new to
the app — I don't know who will be signing up for this."* That is the honest position. Signups may
arrive with no Japanese at all, with a year of it, or anywhere between, and the ad targeting (not yet
built) is what will largely decide. **The app today has exactly one answer: everyone starts at the
beginning.**

**A level already exists on every word, and nothing reads it.** All 4,901 pack lines carry `jlpt`:
**N5 3,047 · N4 1,220 · N3 565 · N2 70**. The only other occurrence of the string in `index.html` is
a section comment at ~2532 — **zero engine code consults it.** So the premise "words have no level"
is false; the true premise is *a level has been sitting on every word since the deck was built and
has never once influenced what a learner is served.*

**But `jlpt` is a curriculum tier, not a usefulness rank, and it discriminates unevenly.** Measured
this session per tile:

```
food      104 words   N5 72%     work     111 words   N5 34%
greetings  98 words   N5 71%     animals  109 words   N5 25%
clothing   90 words   N5 59%     travel    53 words   N5 43%
```

In `work` and `animals` it splits the tile usefully. In `food` it leaves a single undifferentiated
bucket of **75 N5 words** — and a beginner's first ten in Food is a choice *inside* that bucket.
So `jlpt` is a real free signal that solves part of the problem and cannot solve the rest.

**Ordering exists at the tile level only.** `ROAD_ORDER` sequences the 52 tiles (greetings → phrases
→ food → numbers → time → …). Inside a tile nothing ranks: in Food, やさい (vegetable) and だいこん
(daikon radish) are peers. The free plan's 3-new-words-a-day therefore has no way to pick the three
that matter, and `_obfBiasFresh` biases only by theme, never by usefulness.

**Placement is twelve words wide.** Onboarding runs `_OBF_ORDER = ['w1','w5','mic']` (verified live).
Step `w5` is a 12-word "tap any words you already know" grid (`OB_CHECK_WORDS`: みず ねこ すし いぬ
おちゃ くるま ほん あめ さかな えき ともだち たべます) and a tap grants an SM-2 head start on **that
word only**. Someone with two years of Japanese taps all twelve, gets 12 of 4,830 marked known, and
still begins at みず. There is no other placement anywhere in the app.

## Stacked callouts (binding, not re-openable here)
> **LOCKED:** launch is Japanese-only; the launch path is PARKED (owner, 16 Sep) · the hands-free
> audio drill loop IS the app · onboarding was deliberately cut to the bone in delve 12 and *"every
> extra step loses some people"* — pending ADR-024/ADR-025 describe that flow and any change here
> must name which of them it touches · no bespoke micro-drills or question screens (killed v8.98) ·
> no hints on the drill card (v9.27) · STT never grades · re-entry keeps the SAME pinned words ·
> categories literally match their tile name (v8.97) · stickers are the category model · retire =
> tombstone, never delete a pack line.
> **Delve 13 is binding where it overlaps:** the tile rule, the three tiers (piece/relation/topic),
> family sizing and round composition, and **D16 — no new field on any pack line and no new stats
> field.** If a level answer needs a new field, it must argue against D16 explicitly, not ignore it.
> Grounding: `docs/delve-cycles/13-pieces-everywhere.md`, `docs/decisions-pending/ADR-027…030`,
> `docs/delve-cycles/12-onboarding.md`. In `index.html`: pack lines with `jlpt` (from ~1285),
> `ROAD_ORDER`, `_obfBiasFresh`, `_buildSpamPick`, `_freeTierCapPool`, `OB_CHECK_WORDS` (~30667),
> `_OBF_ORDER` (~30768), `obGoto` (~30717).

## Primary
**Mode:** Opus-only

### Investigation tasks

1. **Derive or assign — pick FINAL.** The cheap path is to **derive** a usefulness rank from what
   exists (`jlpt`, plus family membership from delve 13, plus an external frequency source) and
   hand-rank only where derivation is blind — the big N5 buckets. The expensive path is to
   **hand-assign** every word via the v9.24/v9.31 agent pipeline. Decide which, with the cost of each
   stated in words-to-touch. If external frequency data is proposed, name the actual source
   (JLPT lists already in-deck, a Japanese frequency corpus, Core2k/6k) and how it is obtained
   offline — no hand-waving at "a corpus".

2. **The level scheme — pick FINAL.** The owner's lean (this session) is **three levels, not ten**:
   L1 can't-function-without-it · L2 normal use · L3 long tail — argued on the grounds that ten
   levels cannot be assigned honestly across 4,830 words and three can. Confirm or beat it. Decide
   the criterion for each level, how many L1 words a tile should hold, what happens when a tile runs
   out of L1, how level interacts with `ROAD_ORDER` and with the free plan's 3-new-a-day, and whether
   level is ever visible to the learner (default: no). State how level and delve 13's tier
   (piece/relation/topic) combine when they disagree — a long-tail word inside a strong piece-family
   is the case to answer.

3. **Placement — pick FINAL.** Decide **where a new account starts**: everyone at L1 (today's
   implicit answer), a real placement step, self-declared level, or inferred from the first rounds and
   corrected silently. Weigh every option against *"every extra step loses some people"* — any step
   must pay for itself in seconds. Decide explicitly what happens to the 12-word `w5` check: keep,
   widen, replace, or drop. State the failure being prevented (someone with real Japanese meeting みず
   and ねこ on day one and never coming back) **and** the opposite failure (a beginner placed too high
   and drowning). Say which is worse and why.

4. **Build plan + proof.** Concrete plan to apply 1–3: what is data, what is code, batch size if
   agents are used, the validator's hard rules, and how to verify without a human reading 4,830 lines.
   Then: what evidence would show the levelling worked, drawn from signals already recorded
   (`hears`, `smNext`, `attempts`, the v9.32 nailed test) — and state honestly what five accounts and
   zero known beginners can and cannot show.

### Output
Primary doc: `docs/delve-cycles/14-which-words-first.md`
Sections: Charter · Method · one per task (1–4) · The level rule (stated once, plainly) ·
Decisions reached · Open questions · Build list · ADR proposals.

## Adversaries

### Adversary 1: devils-advocate (LEAD)
**Read:** primary doc, pack lines with `jlpt`, `ROAD_ORDER`, `_obfBiasFresh`, delve 13's decisions
**Audit:** (1) Is a usefulness rank anything more than one person's taste wearing a number? Demand an
external, checkable source or force the delve to admit it is taste. (2) Does `jlpt` plus family
membership already get 80% of the benefit for 5% of the cost — i.e. is the hand-assignment pipeline
sunk-cost thinking? (3) Placement: does any proposed step survive the delve-12 rule that every screen
loses people, or is it onboarding creep wearing a new hat? (4) **The kill question, answer it first:**
the audience is unknown, five accounts exist and three are not the market — is *any* of this
justified before real signups exist, or should the app ship as-is and learn? Argue the ship-first case
properly.
**Output:** `14-which-words-first-devils-advocate.md`

### Adversary 2: qa
**Read:** primary doc, `_buildSpamPick`, `_obfBiasFresh`, `_freeTierCapPool`, `_famTake`, onboarding
**Audit:** (1) Walk levelled selection against pinned batch × Again × Mix × auto-swap × free-plan
3-new-a-day × round size 10 and 30 — name what starves or repeats, especially a tile that runs out of
L1. (2) Placement paths: mis-placed high, mis-placed low, cancelled mid-flow, an existing account
with no level, a returning account. (3) If a new field is proposed, demand the D16 argument and the
migration for existing accounts — the owner's included.
**Output:** `14-which-words-first-qa-design.md`

### Adversary 3: code
**Read:** primary doc, the selection path and onboarding flow
**Audit:** (1) Buildable without destabilising the v9.30/9.32 seams or delve 13's pending changes?
(2) Size each decision; flag anything touching all 4,901 pack lines. (3) Does the task-4 validator
actually catch a bad ranking before it ships?
**Output:** `14-which-words-first-code-review.md`
