# ADR-019 — Character presence: portrait-in-aura, default ON (Gate-0-gated)

- **Status:** Proposed (pending owner signoff; Gate 0 mockup approval is a hard
  precondition for ANY build work and ANY ad spend featuring a face)
- **Date:** 2026-07-31
- **Source:** Delve 10 — `docs/delve-cycles/10-avatar-presence.md` (D1 + D4, as
  amended by the Round-1 synthesis: Gate 0 added, reversal triggers made
  owner-verdict-based, mount-path restructuring disclosed)
- **Supersedes (scoped):** the character-avatar half of Delve 6 §1.2's presence
  lock ("never a character, mascot…"), re-opened by the owner's 2026-07-31 ask.
  The **photoreal + lip-sync prohibition is retained permanently.**
- **Amends:** ADR-010 (talk-mode orb front door, pending) — the orb is demoted
  from sole presence to one renderer option under the 3-way `presence` setting;
  its state language (`ORB_HUE`, `_orbSet` seam) becomes the shared contract.

## Context

The owner asked for Praktika-style "an avatar that the speaking can look at" —
themed. The cast (`CONVO_PARTNERS`, 8 kana-named personas with colors + flavors)
already exists faceless. The Delve 6 orb shipped opt-in and produced zero default
exposure ("an opt-in presence cannot be evaluated"). The Praktika research
(`reports/hydra-research/2026-07-17-praktika/REPORT.md`) shows avatar complaints
cluster on lip-sync lag, uncanny valley, and can't-disable — animation-realism
failures, not facelessness-vs-face. The adversary panel's strongest objection
(shipping any avatar surrenders a documented no-avatar differentiator) is
answered in the primary doc §3.2: the evidence protects avoidance of the
liability cluster, and form C retains every protected property.

## Decision

1. **Form (D1):** hybrid portrait-in-aura. One STATIC illustrated 2D bust per
   partner (flat/cel-shaded, overtly non-photoreal) inside a circular frame whose
   aura ring carries the four `ORB_HUE` states. **No mouth ever moves; the art
   never animates** — all motion is aura + rigid-card CSS transforms.
2. **Default + placement (D4):** new setting `presence: 'chara' | 'orb' | 'min'`,
   default `'chara'`, replacing `orbMode` (migration: `orbMode:true → 'orb'`,
   else `'chara'`). Center-stage frame `min(40vw, 170px)` replacing the emoji
   header; `'min'` renders the exact legacy 46px header — the permanent one-tap
   escape hatch the AVOID list requires. Keyless/scripted parity is structural
   (same seam wrap-points).
3. **Seam contract unchanged; mount plumbing restructured:** `_orbSet` stays the
   sole entry point (closed enum, numbers-only meta, 5 call sites). The
   `bindScreen` mount gate generalizes to 3-way renderer dispatch (today
   `o.mounted` is set only by the canvas-only `_orbInit`, so the portrait
   renderer would never receive state without this restructuring — r1
   code-review finding, accepted).
4. **Gate 0 (precondition):** generate 1–2 portraits, compose ONE static mockup
   of the frame on a real convo screenshot, owner reviews. Approval unlocks the
   build; rejection kills or reshapes D1 at the cost of a mockup.
5. **Ad tie-in:** with presence ON, the positioning-v1 real-session recording
   shows the partner's face — never a staged shot; §4.2 licensing check must
   pass before any paid placement.

## Amendment 2026-08-02 (owner-driven, Gate 0 outcome)

Gate 0 ran as a LIVE animated demo (`avatar-demo.html`) rather than a static
mockup, and the owner's approval attached to the animated form. Two clauses of
Decision 1 are superseded by explicit owner direction:

1. **"No mouth ever moves; the art never animates" is superseded.** The
   approved presence is a 4-frame procedural loop per partner — `base / half /
   talk / blink` — flapped at ~115ms while TTS is active plus an idle blink
   loop. This is classic cartoon flap, NOT phoneme lip-sync; the **photoreal +
   phoneme-lip-sync prohibition is retained permanently** (it is exactly the
   Praktika complaint cluster the research flagged).
2. **Style is no longer flat/cel.** Owner rejected the flat style as "stale and
   boring" (2026-08-01), shortlisted 3 of 10 explored styles, and locked
   **stylized 3D animated-movie render tuned toward Praktika-Skye realism**
   (2026-08-02). あおい regenerated female + characterful in that style;
   accepted on the live demo.

Frame assets are procedurally derived from each portrait (PIL patches + cv2
TELEA inpaint), so each partner ships 4 images, not 1 — asset-weight numbers in
ADR-020 apply per frame set. Everything else (3-way `presence` setting,
`_orbSet` seam contract, `'min'` escape hatch, ad tie-in) stands.

## Acceptance gate (numeric)

- Gate 0: **CLOSED 2026-08-02** — owner YES on the live animated demo
  (supersedes the static-mockup form of the gate).
- Post-ship: owner completes **≥5** field sessions within **14 days** on default
  `'chara'` and gives a positive/neutral felt-difference verdict.

## Reversal trigger (numeric)

- Gate 0 rejection, OR **≥2** negative owner field reports (e.g. "clutter",
  "childish", "I look at the text anyway") within the first **14 days** →
  default flips to `'orb'` (or `'min'`) — **1** enum-default line, zero code
  removal; portrait assets remain for users who opt in. The app ships zero
  telemetry, so owner verdict is the only trigger that can fire (r1 synthesis —
  the earlier "measurable drop" trigger was unfalsifiable and is deleted).
