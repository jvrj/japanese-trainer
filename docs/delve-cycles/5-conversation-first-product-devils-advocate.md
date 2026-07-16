# Delve 5 — Devils-Advocate audit (LEAD adversary)

**Target:** docs/delve-cycles/5-conversation-first-product.md (committed a520830a)
**Lens:** Challenge the premise — right problem? Fragile / over-built / wrong-by-construction?
**Injection check:** No text resembling instructions-to-the-auditor was found in the primary
doc or charter. Both read as good-faith design data.

---

## F1 — FATAL (premise / sequencing): the hero conversation is a 5-turn canned script for the exact buyer this restructure targets

The whole restructure makes おしゃべり the Home hero and markets it as the soul of the product.
Store copy is **locked** as: “real conversations from your very first minute” and
“Speak Japanese from your first minute — with a friend who never judges” (§8.2, L9).

But in source, convoTurn (index.html:9643) has a **no-key fallback**:
“rawStr = key ? await _convoCall(...) : _convoScript(cv.sceneId, cv.turn)”, and
_convoScript (9452) just cycles _CONVO_SCRIPT_TURNS — a **fixed bank of exactly 5 lines**
(こんにちは！おなまえは… → またはなしましょう！, index.html:9466) via
“(turnIdx) % _CONVO_SCRIPT_TURNS.length”. With no Anthropic key there is no AI, no free-form
reply — a canned demo loop.

The stated audience is a **stranger from a Facebook ad** ([[project_japanese_trainer_commercial]]),
and the memory headline is that the **BYO-API-key architecture will not work for paying
customers** — the hosted backend that makes conversation real is Delve-4 Phase-1 and is
**explicitly out of scope** here (§1.3: “Nothing in this delve may depend on the Delve-4
backend existing”). So this delve locks a conversation-first front door and store copy for a
product whose hero, for every keyless universal-phone user, is a 5-line script. The restructure
polishes the shop window before the thing on sale exists.

**Citation:** §8.2 “Speak Japanese from your first minute...” + _CONVO_SCRIPT_TURNS
(index.html:9466, 5 entries) reached via index.html:9643.
**What would change my mind:** if the doc gated public/ad launch behind Phase-1 and scoped this
as owner-now + store-copy-draft. Instead §10 L9 marks positioning **locked** and §8.2 store
copy **locked**. Fix: add an explicit “public launch blocks on Phase-1 backend; until then the
hero degrades to demo-script and the ad funnel stays off” lock, and de-lock store copy.

---

## F2 — SERIOUS (owner is the only proven user): the deletion is LOCKED before the veto is collected

L2 (§10) **locks** “TRUE deletion (code removal) of library, similar, variations,
variationBlitz, particles.” Yet Open Question #4 (§11) asks: “does the owner use
particles/similar/variations enough to stay his own power user? One-line confirmation
before Stage E.” The decision to delete is recorded as a lock; the permission that should
precede it is still open. That is backwards — you locked removing tools the **only proven daily
user** may use, contingent on a veto you have not gathered. The charter Adversary-1 attack
(“does the IA wreck the owner own workflow — the only proven user?”) is answered for the
resume chip but **not** for these deletions.

**Citation:** §10 L2 “incl. TRUE deletion (code removal) of library, similar, variations,
variationBlitz, particles” vs §11 OQ #4 “One-line confirmation before Stage E”.
**Fix:** demote the L2 deletion clause to Proposed-pending-veto; only the surviving-IA half is a
true lock.

---

## F3 — SERIOUS (evidence quality): the positioning identity is locked on absence-of-evidence, which is binary, not directional

The entire identity — L9, §8.1 “Japanese-first, conversation-first, judgment-free” — rests on
H2: “No app is Japanese-primary + conversation-first,” graded in the doc table as
**“[UNVERIFIED-EVIDENCE] — absence-of-evidence across review blogs.”** The blanket hedge in the
doc (§1.2: “the direction not the number is load-bearing”) **does not apply** to a white-space
claim: white space is not a tunable number that is “directionally safe if slightly off” — it is
**binary** (the niche is either occupied or it is not). If one competitor already is
Japanese-primary + conversation-first, the whole differentiation and store angle collapse, and
the L9 reversal condition (“Store A/B post-launch”) means you discover it only **after** building
the product around it.

**Citation:** §1.2 table row H2 “[UNVERIFIED-EVIDENCE] — absence-of-evidence across review blogs”
+ §10 L9.
**Fix:** before locking identity, run one falsification pass (actively try to name a
Japanese-primary conversation-first app) rather than resting on blog silence.

---

## F4 — QUESTIONABLE (de-sprawl theater): 2 doors is a counting trick; the felt sprawl is mostly moved, and 4 of 5 deletions are already invisible

§3.4 claims “From ~15 first-class doors to 2.” But the same lock immediately renders, one tap
in: a Practice tab with a **topics grid + 6 fixed tiles**, plus a Home with hero + 5-step path +
resume + spine + expandable progress sheet (§3.2). To a confused beginner the number that
matters is visible interactive surfaces, still ~13 — the 7 drawer tiles are exactly the “same
sprawl one tap deeper” the charter Adversary-4 warns about. The doc says the TRUE deletions
answer that attack “in advance,” but row 22 concedes library is **“Already de-surfaced v7.76”**
and rows 23–25 delete overlaps that are also already off Home — so the deletions largely remove
**already-hidden** code and change the felt experience of the stranger little. The real sprawl
reduction is burying, which the attack explicitly says is not focus.

**Citation:** §3.4 “From ~15 first-class doors to 2” + §3.3 row 22 “Already de-surfaced v7.76”.
**Fix:** stop advertising “2”; state honestly “2 tabs, ~13 surfaces, 7 in a drawer” and justify
each drawer tile against the thesis, or cut more.

---

## F5 — SERIOUS (judgment-free vs learning): on the hero surface nothing is measured, so rigor-in-the-drills does not cover it

§5.3 rebuts the happy-plateau risk with: “The rigor lives in the drills and the recap, so the
live conversation can stay consequence-free.” But by design (a) the conversation is
**“Never correct mid-conversation”** (§5.2 おしゃべり), and (b) spoken misses **“never feed
SRS”** (§5.4, [[project_japanese_trainer_stt_not_grader]]). So the SRS — the only rigor engine —
is structurally blind to everything the user says in the hero. A learner who mis-says the same
word every conversation is never routed back into review from the conversation; the recap is
capped at ≤3 gentle post-hoc notes that feed nothing. The mitigations (placement, ≤3 cap,
did-you-mean framing) all reduce error salience; none add rigor. On the surface the product is
named after, the plateau risk is unmitigated, not resolved.

**Citation:** §5.4 “Misses never accumulate visible state, never feed SRS” + §5.2 row おしゃべり
“Never correct mid-conversation”.
**Fix:** define a mechanism by which recurrent conversational gaps do seed drills (without
grading pronunciation) — e.g. words the user avoided or failed to produce feeding the coverage
meter — otherwise concede the hero is practice, not learning.

---

## F6 — QUESTIONABLE (ADR-003): shipping the advisory arm soft-decides the decision the doc claims it leaves open

§7.2 asserts the spine “does not decide ADR-003” — yet the same paragraph ends: “Until signoff,
Stage C ships the advisory spine only.” Shipping one arm (non-locking/advisory, celebration-led)
into the live product before the owner picks creates status-quo + sunk-cost bias toward that arm.
The charter constraint is that this delve “must not silently decide it.” Locking the L1/L8
advisory, non-gating posture and shipping it in Stage C is a de-facto decision by shipping order.

**Citation:** §7.2 “Until signoff, Stage C ships the advisory spine only.”
**Fix:** hold Stage C until ADR-003 signoff, or ship the spine display-only with the gate seam
stubbed so the hard-lock arm is not disadvantaged by having shipped its opposite.

---

## F7 — NITPICK/QUESTIONABLE (activation metric): the <90s win is triggered by any noise, decoupled from value

The celebrated first-win (“That was Japanese — you spoke it.”, §4.2 OB-4) fires because the
onboarding exchange gives “No feedback at all. Any speech advances warmly” (§5.2). The user can
mumble anything and “graduate.” That is defensible onboarding psychology, but the doc elevates
<90s-to-spoken-exchange to a **direction-load-bearing budget** (§1.2, L3). A budget measuring
“made a sound” is a vanity funnel metric; it should not be treated as evidence the pedagogy works.

**Citation:** §5.2 row Onboarding “Any speech advances warmly” + §4.2 OB-4
“That was Japanese — you spoke it.”
**Fix:** keep the frictionless onboarding, but do not cite <90s as a learning or value signal —
it is an activation signal only.

---

## Verdict: **WARN**

The IA craft is genuine and the source citations I spot-checked (render map 18855 = 29 keys;
nav 628–632; renderHome 19057; renderToday 18997; streak 19059) are accurate. But the delve
locks a **conversation-first store-marketed front door and identity (F1, F3) around a hero that
cannot serve the target buyer until an out-of-scope backend ships**, and it **locks deletions of
the tools of the only proven user before his veto (F2)**. Those are sequencing/premise faults the
synthesis must resolve before any forge build — hence WARN, not PASS. F5/F6 need explicit
answers; F4/F7 are honesty edits to the claims.
