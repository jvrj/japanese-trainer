# ADR-008 — Conversation-first two-door IA (Home hero + Practice drawer)

- **Status:** Accepted (promoted 2026-07-17 — owner signoff; deletion veto collected same day: NONE — all four modes (`library`, `similar`, `variations`/`variationBlitz`, `particles`) cleared for Stage-E code removal, so the point-3 conditional is resolved and Stage E is unblocked)
- **Date:** 2026-07-16
- **Source:** Delve 5 — `docs/delve-cycles/5-conversation-first-product.md` (locks L1 + L2, verdict table §3.3, staged sketch §9, Round-1 synthesis dispositions)
- **Related:** ADR-003 (spine stays advisory until its signoff), Delve-4 ADR-004..007 (backend/productization inputs)

## Context

Isshin routes **29 screens** through the render map (`index.html:18855`) behind ~15 first-class doors — a workshop, not a product. The owner's thesis (2026-07-16): the endgame is a real conversation with an AI friend, zero subconscious judgment; every surface must BE that conversation or visibly train for it. The research REPORT (2026-07-16) grounds a "Japanese-first, conversation-first, judgment-free" positioning (H2, [UNVERIFIED-EVIDENCE] — a pre-launch competitor sweep is now a publication gate per synthesis).

The adversary panel materially amended the original lock: the keyless hero today is a 5-line scripted bank (`_convoScript`/`_CONVO_SCRIPT_TURNS`, index.html:9453/9472), so the sellable-funnel claim is Phase-1-gated; and TRUE deletion was locked before the owner's veto was collected — now inverted.

## Decision

1. **Bottom nav collapses 3 tabs → 2 + settings gear:** **Home** (spine header + おしゃべり hero CTA + today's path ladder + resume chip) and **Practice** (topics grid with scope row + 6 fixed tiles). Full navigation map: primary doc §3.2.
2. **Every one of the 29 render-map keys gets exactly one verdict** — hero / path-step / practice-drawer / settings-buried / deleted — per the §3.3 table.
3. **Deletion is conditional:** `library`, `similar`, `variations`, `variationBlitz`, `particles` ship as burial now; **code removal (Stage E) executes only after the owner's deletion-veto answer is collected** (blocking precondition). `modules` stays settings-buried.
4. **`today` aliases to `home` with normalization:** `nav('today')` sets `state.screen='home'` — required so `updateBackFab` (18890), the CSS `body[data-screen="home"]` rules (156/399/400), and `pathGo()` bail-detection (10518) keep working.
5. **Owner-routine invariant:** the hands-free topic-drill routine survives at ≤1 extra tap (fresh pick) and 0 extra taps (resume chip reproducing the Continuing card, 19426).
6. **Sequencing:** Stages A–E (§9) ship now for the owner/BYO users; the paid-ads + store funnel opens only when the Phase-1 backend makes the hero conversation real for keyless buyers.

## Consequences

- Onboarding (§4), the spine (§7), store screenshots and every later phase build on this IA; reversing it after Stage E deletes code paths (git history is the parts bin).
- The only proven daily user's habits are retrained; the resume chip is the contract that keeps his routine intact.
- Store copy claiming live conversation is embargoed until Phase 1 — false-by-construction ad claims are a brand and App-Store-review risk.

## Acceptance gate (numeric)

Accept iff after Stage A ships: doors reachable within one tap of open = **2** tabs (+ gear); owner's fresh-topic routine costs **≤ 1** extra tap and the resume case **0** extra taps vs pre-restructure; headless render-verify passes on **100%** of surviving render-map keys; **0** dead nav targets in the scripted `nav(key)` sweep; and `nav('today')` leaves `state.screen === 'home'` in **100%** of entry paths (back-FAB/CSS/pathGo checks all keyed off one string).

## Reversal trigger (numeric)

Reverse (restore a 3-tab IA or re-surface buried modes) if within **14 days** of Stage-A ship the owner's daily routine measurably regresses (> **1** extra tap on the common case, or the owner bails to muscle-memory dead ends on **≥ 3** distinct days), or post-launch stranger D1 activation (first spoken exchange completed) falls below **25%** of installs for **2** consecutive weeks.
