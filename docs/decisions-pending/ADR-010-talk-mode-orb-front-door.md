# ADR-010 — Talk-mode orb front door (supersedes ADR-008's two-door IA)

- **Status:** Proposed (pending owner signoff; build-gated — see acceptance gate)
- **Date:** 2026-07-17
- **Source:** Delve 6 — `docs/delve-cycles/6-talk-mode-presence.md` (locks L6–L12a, §6 IA,
  §7 scaffold, Round-1 synthesis dispositions S1/S2/S7)
- **Supersedes:** ADR-008 "Conversation-first two-door IA" (Accepted 2026-07-17) — §3.1
  front-door portion only; ADR-008's Practice-tab contents, deletions verdict, and
  onboarding locks remain in force per Delve 6 §6.5 ledger
- **Related:** ADR-009 (judgment-free spec — extended to orb copy), ADR-004 (Phase-1
  metering replaces the BYO cost guard's tier 2)

## Context

The v8.12 free-form conversation engine shipped and the owner's verdict was "no
difference" — nothing the learner sees or feels changed. On the owner's explicit
direction (2026-07-17: "OPEN the app, talk to the AI basically about anything"), Delve 6
designed an experience layer: an abstract orb partner as the app's front door, an endless
session shape, and a drawer holding the Delve-5 Home. This supersedes ADR-008's two-door
IA one day after its promotion — the adversary panel flagged the churn risk (decision
cadence exceeding validation cadence) and the risk that the justifying measurement sat
downstream of the build. Both are answered by making the supersession *evidence-gated*
rather than immediate: the IA does not flip until an interim probe on the existing screen
reads positive.

## Decision

1. **`talk` becomes the boot-default screen**: fullscreen canvas orb (Delve 6 §3 spec),
   tap-to-wake → endless free-talk session on the live v8.12 engine.
2. **The Delve-5 Home becomes the drawer** (one swipe/tap away), content intact, hero CTA
   removed; Practice and Settings unchanged, reached through the drawer.
3. **The legacy `convo` chat screen retires at stage T4** (session UI absorbed by Talk;
   recap card survives; `nav('convo')` aliases to `talk`).
4. **Per-user reversibility**: a `frontDoor:'talk'|'home'` setting; `'home'` restores
   ADR-008 behavior exactly.
5. **Build order is measurement-gated** (Delve 6 §8): T1 orb on the existing screen →
   T2 endless engine → **L12a interim probe** → only then T3 Talk screen + T4 flip.

## Acceptance gate (numeric)

- **Precondition (L12a — gates the build itself):** after Stage T2, the owner completes
  **≥5 endless orb sessions** on the existing convo screen and records a felt-difference
  read. Only a positive/promising read green-lights T3/T4. A "no difference" read
  **rejects this ADR** before any IA change ships (recorded as "Phase-1 latency/voice is
  the blocker" — a finding, not a failure).
- **Acceptance (L12 — accepts the ADR):** after **7 consecutive days** with
  `frontDoor:'talk'` as default (stage T4.1) and **≥10 completed Talk sessions** in that
  week, the owner's recorded verdict to "does it feel like talking to someone?" is
  positive AND his sessions/day did not drop below the pre-flip 7-day baseline.

## Reversal trigger (numeric)

- The owner sets `frontDoor:'home'` and keeps it there for **≥5 consecutive days** within
  the first **30 days** of T4.1, **or**
- Stranger D1 retention (once measurable) drops **>20% relative** vs the ADR-008 IA
  baseline over **≥30 first-run users**.

On reversal: boot default returns to `home` (one setting flip — the mechanism ships with
T4), the Talk screen remains reachable as a non-default surface, and the reversal
evidence is recorded in the delve doc so a delve-7 re-flip requires *new* evidence, not
mood. A rejection at the L12a gate is not a reversal — nothing shipped to reverse.

## Consequences

- All commercial artifacts (store screenshots, onboarding, ads) will depict the orb —
  this is the costly-to-reverse surface that justifies ADR status.
- The owner (only proven daily user) is retrained: open → orb → swipe up → resume chip;
  accepted cost ≤1 gesture vs today, resume chip pinned topmost in the drawer.
- ADR-008's index row and status line are updated only at promotion time (human step —
  this file's presence in `docs/decisions-pending/` changes nothing in `docs/decisions/`).

## Pointer — L12a probe status (Delve 7, 2026-07-18)

The owner's 2026-07-18 field test is **UNKEYED-TAINTED as L12a evidence**: his phone
had no API key, so every session silently ran the canned `_CONVO_SCRIPT_TURNS` script
— the "no difference / doesn't respond to what I said" read measured the script, not
the endless engine. That run is **void** for this gate (neither a positive nor a
rejecting read). L12a re-runs **KEYED**, in two touches per Delve 7
(`docs/delve-cycles/7-feedback-soul.md` §8): a calibration session immediately after
Stage F1 (mic patience), then the full ≥5-session probe after F1+F2. Pointer only —
the gate's numbers and consequences above are unchanged.
