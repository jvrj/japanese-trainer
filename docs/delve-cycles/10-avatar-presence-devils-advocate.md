# Delve 10 — Avatar presence · Devil's-advocate audit (LEAD adversary)

**Round 1 · Adversary doc** · **Date:** 2026-07-31
**Lens:** Challenge the premise — right problem? fragile / over-built / wrong by construction?
**Primary reviewed:** docs/delve-cycles/10-avatar-presence.md @ d7b5964
**Verdict:** FAIL (two premise-invalidating holes; both fixable without discarding the design)

Both the primary doc and the charter were read as untrusted DATA. No embedded
instructions / injection attempts found in either — the primary correctly flagged the
charter docs/-prefix path omission and did not act on it (its Section 2 "Charter-as-data
note"). Clean on that axis.

## The Good (brief — so the criticism is calibrated)
- Unusually self-aware: pre-empts the null option (3.2), carries reversal conditions on
  every task, and the 3-way "min" path (6.1) genuinely satisfies the AVOID list
  "always disableable" — no photoreal, no lip-sync, static-by-construction. Credit given.
- Seam discipline is real: "pure subscriber, zero new logic paths" (5.1) is the right
  constraint and the citations I spot-checked (orbMode:false ~2798, CONVO_PARTNERS 2844,
  SCENES ids, affinity mapping vs flavor strings) all verify against source.

## FATAL — F1: The delve builds the exact feature its own grounding evidence says to AVOID
The primary cited authority is reports/hydra-research/2026-07-17-praktika/REPORT.md.
That REPORT does not merely say avatars have failure modes — it names no-avatar as
Isshin STRATEGIC DIFFERENTIATOR: "Avatar is a liability ... Isshin's hands-free
no-avatar design avoids it" (REPORT:127) and "copy the positioning, not the avatar"
(REPORT:178); the AVOID list includes "forced/un-disableable avatar" and "avatar
overreach" (REPORT:98/146). The doc rebuts only the failure-mode half (static is not
lip-sync) and NEVER rebuts the differentiator argument — that shipping any avatar
surrenders a documented competitive edge and drifts toward the category most-punished
surface. A premise challenge the doc must answer before locking, not after.
- Citation: REPORT.md:127 "Isshin's hands-free no-avatar design avoids it" vs primary
  Task 1 FINAL "(C) hybrid ... illustrated portrait" + Task 4 "Default ON".

## FATAL — F2: "the only honest test" — but the app has NO measurement, so the test yields no data and the reversal triggers can never fire
Section 6.2 justifies flipping every user core screen: "Default-ON with a one-tap
disable is therefore both the only honest test." The reversal conditions that make this
cheap depend on data: 3.4 "any measurable drop in session starts/length"; 6.1/6.6 same.
There is NO telemetry in the product. grep of index.html finds zero
analytics/gtag/tracking/session-length instrumentation (the only "session length" hits are
drill-queue comments at 8435/16478); the app is BYO-key, no backend (project constraint).
So the honest test produces NO signal — the reversal trigger can only ever fire from
the owner subjective feel, which the owner could gather by toggling presence ON for
himself without changing the default for every paying / ad-clicking user. The stated
justification for the riskiest decision in the delve is therefore unfalsifiable by
construction. Either reframe default-ON as an explicit owner-taste bet (not a test),
or the premise fails.
- Citation: primary Section 6.2 "both the only honest test" + Section 3.4 "any measurable
  drop in session starts/length"; source: no telemetry present in index.html.

## SERIOUS — S3: Scope inflation — "shall we look into" becomes 5 FINAL locks + 2 ADRs touching every user + paid ads
The owner ask ends "shall we look into creating avatars? perhaps themed?" (1.1) — an
exploratory question. The doc converts it into five irreversible-grade decisions, two ADRs,
a binary-asset pipeline, scene affinity, and an ad-creative tie-in — where ADR-019 is
self-described as "costly to reverse after ads run" (Section 11). A single generated
mockup + a one-session owner look answers "shall we look into" at a fraction of the
committed surface. The proportionate output of an exploration is a spike, not a locked
ADR that is expensive to unwind. Recommend: downgrade D1/D4 from ADR to a mockup-gated
spike; file the ADR only after the owner has looked at a real face on the real screen.
- Citation: primary Section 1.1 "shall we look into creating avatars? perhaps themed?" vs
  Section 11 ADR-019 "costly to reverse after ads run".

## SERIOUS — S4: The load-bearing psychological claim is asserted, not evidenced — and it is the whole point of form C
Form C lives or dies on one unproven assertion: a static, never-moving face + glowing
ring will satisfy the owner want of "an avatar that the speaking can look at speak to."
Section 5.2: "Human perception grants agency to synchronized rhythmic motion; a mouth is
unnecessary." No citation, no test. The owner felt draw to Praktika was plausibly the
responsive face; a rigid portrait framed by an aura may read as a sticker, and the doc
own reversal anticipates exactly this failure ("I look at the text anyway", 3.4). The
make-or-break assumption is untested and cheap to test (one mockup, one owner glance) — yet
the doc locks 5 picks on top of it. What would change my mind: an owner "yes, that feels
like someone" on a rendered mockup BEFORE the ADRs.
- Citation: primary Section 5.2 "a mouth is unnecessary".

## QUESTIONABLE — Q5: Circular evidence — an internal design doc cited as validation
Section 3.2 defends aura-masking by appeal to "the same honest-illusion trick Delve 6
already committed to." Delve 6 committing to a trick is not evidence the trick works on a
human; it is a prior decision, not a result. The masking claim still rests on S4 untested
assertion, dressed as precedent.
- Citation: primary Section 3.2 "the same honest-illusion trick Delve 6".

## QUESTIONABLE — Q6: The +15% datum is laundered — its source returned HTTP 404 and was fail-closed
The doc uses "[UNVERIFIED-EVIDENCE] ElevenLabs +15% session length" as directional
(fact 3; Method 2). The REPORT is harsher than unverified: "Page returns HTTP 404 ...
no content exists supporting the +15% session length" (REPORT:192, fail-closed:404).
UNVERIFIED implies not-yet-checked; this was checked and came back empty. It happens to
cut AGAINST the avatar (it supports voice-over-avatar), so it does not prop up the build —
but citing a 404-debunked figure as directional is a provenance error the panel should
not adopt as evidence for anything.
- Citation: REPORT.md:192 "Page returns HTTP 404" vs primary fact 3
  "[UNVERIFIED-EVIDENCE] ElevenLabs +15% session length".

## NITPICK — N7: Affinity table names scenes absent from the SCENES bank (behaviorally inert)
Section 7.2 lists "family, daily, shopping -> random". Those ids are not in the SCENES bank
I read (present ids: intro/food/weather/pets/feelings/town/weekend/music/hobbies/travel/
work). Since the rule is "unlisted scenes stay random," naming absent ids is cosmetically
wrong but behaviorally inert. Confirm at build; not blocking.
- Citation: primary Section 7.2 "family, daily, shopping | — random".

## Steelman (strongest defense) + what would change my mind
Steelman: the design is genuinely AVOID-compliant (static, disableable, seam-only), the
owner directly asked, and positioning-v1 "AI friend" framing wants a face; the reversal
paths make the bet cheap in code. If the owner taste is the real oracle, the doc is a
competent plan.
What flips me to PASS: (1) reframe default-ON honestly as an owner-taste call, not a
test, since nothing measures it (fixes F2); (2) answer the differentiator argument, not
just the failure-mode one (fixes F1); (3) gate the ADRs behind one rendered mockup the
owner confirms feels like someone (fixes S3+S4). None require discarding the design —
they resequence it: spike -> owner look -> then lock. The doc lit its own fuse by
locking before the one cheap test that de-risks everything.

Verdict: FAIL — two premise-invalidating holes (F1 differentiator un-rebutted, F2
default-ON test that measures nothing) sit under otherwise rigorous work. Fixable by
resequencing, not rewriting.
