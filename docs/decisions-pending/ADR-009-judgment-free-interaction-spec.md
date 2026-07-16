# ADR-009 — Judgment-free interaction specification (copy rules + latency budgets + failure containment)

- **Status:** Proposed (PENDING — filed by Delve 5 Round-1 synthesis; not promoted to `docs/decisions/`; awaiting owner signoff)
- **Date:** 2026-07-16
- **Source:** Delve 5 — `docs/delve-cycles/5-conversation-first-product.md` (locks L4 + L5 + L6, §5 spec, §5.4 double-miss rule, Round-1 synthesis dispositions)
- **Related:** [[project_japanese_trainer_stt_not_grader]] (v8.03 doctrine — unchanged), research H3 (judgment-free is engineered, not declared)

## Context

The brand promise is "a friend who never judges." Research H3 says the feeling is manufactured by latency + TTS warmth + correction *framing*; the anti-patterns are Jumpspeak's false-positive STT scoring and Duolingo's guilt loops. Without an enforceable spec, judgment leaks back in one stat tile at a time — the app today shows user-facing "Accuracy" percentages in at least 8 places (index.html:19342–19356, 7661, 9029, 11028–11030, 11389, 12064, 12624, 13132), one beside a literal "Wrong" label (7660). The devils-advocate also showed the original spec had no rigor route from the conversation back into review (feel good, learn nothing).

## Decision

1. **No user-facing accuracy percentage anywhere.** SRS uses correctness internally; it never wears a % badge. The removal scope of record is an exhaustive grep sweep over `index.html` UI strings, not a site checklist.
2. **Score language = production volume:** "conversations completed", "you talked 12 min", "words you said out loud", "day 4 together".
3. **Corrections are observations/questions, never verdicts.** Banned user-facing words: *wrong, incorrect, failed, mistake, error, score, accuracy, grade*. No red-X iconography, no failure buzzers; neutral reveals.
4. **The partner takes the blame for tech failures** (「ごめん、よく きこえなかった!」). **Double-miss rule:** after 2 consecutive STT misses the surface auto-switches that turn to chips/typed input; the third prompt is never another open mic; misses never accumulate visible state, never feed SRS.
5. **Feedback placement:** never mid-conversation; post-conversation recap, celebration-first, ≤3 did-you-mean notes, default ON with one-tap OFF. Each note carries a one-tap opt-in "practice these" action feeding the existing missed-drill pathway (content-derived from the LLM recap — never an STT score) so conversation weaknesses reach the drills without any surface becoming a grader.
6. **Latency/TTS budgets are product requirements:** convo turn RTT ≤3.5s target / 5s max now (thinking affordance fills the gap), ≤1.2s target / 700ms stretch at Phase 1; TTS start ≤500ms now / ≤300ms Phase 1; best local neural JP voice, never robotic default when a neural voice exists.
7. **Private by default, forever:** no leaderboards, no social comparison, no streak-loss announcements, no paid streak repair.

## Consequences

- Any future change that re-adds an accuracy stat, a verdict word, or a leaderboard is a visible **decision reversal** requiring a new delve — not a drive-by regression.
- The spec constrains every current and future surface (onboarding, drills, recap, retention copy) and the Phase-1 backend voice stack (budget inheritance).
- Rigor is preserved via drills + recap practice-these routing, so "judgment-free" cannot quietly become "feedback-free".

## Acceptance gate (numeric)

Accept iff after the Stage-D sweep: banned-word grep over user-facing UI strings returns **0** matches; user-facing accuracy-%/"Accuracy" stat-label grep returns **0** matches; the STT double-miss demo degrades to chips in **100%** of voice surfaces tested (≤2 misses before switch, 0 third open-mic prompts); and convo turn RTT ≤ **5s** max is met on-device with the thinking affordance covering ≥ **95%** of turns beyond 1.5s.

## Reversal trigger (numeric)

Revisit (toward stronger explicit feedback) if within the first cohort of **≥ 10** real users, **≥ 3** independently report wanting explicit correctness feedback or a plateau ("it never tells me when I'm wrong"), or if recap-notes OFF-toggle adoption exceeds **50%** of active users — signalling the softening overshot and the rigor balance (L5 default-ON, ≤3 notes) needs re-tuning.
