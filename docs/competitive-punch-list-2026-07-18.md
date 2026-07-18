# Competitive punch list — mined from the 2026-07-16 hydra-research scan

Source: `reports/hydra-research/2026-07-16/REPORT.md` (Praktika/Langua/Speak/TalkPal teardown + voice-stack + pricing scan).
Evidence caveat carried forward: most findings are **[UNVERIFIED-EVIDENCE]** — app-affiliated review blogs
(Langua = Languatalk ranked itself #1), zero cross-creator validation. Treat numbers as priors, not targets.

## What the scan VALIDATES (already built — don't churn these)

- **<90s first spoken exchange onboarding** — the category convergence bar (60–90s); Isshin's Stage-B onboarding already hits it.
- **$8.99/mo single SKU** — correctly placed in the $8.99–14.99 battleground (Praktika ~$8, Langua ~$12.50). Don't chase TalkPal's $4.99 floor.
- **Recast framing** ("a natural way to say it — not a mistake") — exactly the H3 "I heard X, did you mean Y?" pattern; volume-language scoring (turns, not accuracy %) matches the spec the scan recommends.
- **Honest modes (F3 script-end card)** — directly avoids the Praktika ad-vs-reality trap the scan names.
- **"Days together" streak, hideable, no leagues** — matches the M3 optional/no-shame recommendation verbatim.
- **STT-is-not-a-grader** — Jumpspeak's false-positive STT is the category anti-pattern; Isshin's turn-trigger design sidesteps it. Never reintroduce scoring.

## Punch list (ranked by leverage × phase)

### → Phase 1 (backend) — blocking commercial

1. **Japanese STT benchmark before committing a transcribe provider** (~$50, ~1 week).
   Whisper Large-v3 (~10% JP WER) vs Deepgram Nova (no published JP benchmark) vs Google Cloud, on real learner
   audio incl. pitch-accent minimal pairs. Web Speech API is ~65.7% for non-native speakers — fine as the
   turn-trigger, not fine as the production comprehension layer. Gates the `backend/supabase/functions/transcribe` design.
2. **Avoid OpenAI Realtime for the proxy** — its per-turn context re-billing makes a 10-turn session cost ~10×
   turn 1. Cascaded STT→LLM→TTS (600–800ms is enough) or Gemini Live Flash (~$0.023/min) keep cost linear.
   Bake a per-minute cost model + the global spend ceiling into the proxy spec (ADR-004/005).
3. **Free tier = one full functional conversation per day** — not a locked demo. Habit first, paywall day 3–5.
   A/B at launch: 3-day opt-out trial (LTV) vs 7-day opt-in (conversion rate) — the two lanes genuinely disagree; test, don't copy.
4. **PPP tier support in the payments architecture** (RevenueCat handles it) — build the capability now,
   defer India/Brazil campaigns until JP-learner demand there is validated.

### → Phase 2 (store polish)

5. **Correction-copy style guide** — codify the judgment-free strings as a spec (feedback optional per
   conversation, corrections as observations/questions, no grades). Mostly built; formalize + audit every error/feedback string against it.
6. **TTS warmth is load-bearing** — "robotic TTS undermines 'caring' regardless of system prompt." Current device
   `speechSynthesis` is the weakest link on non-Pixel phones (v8.21 hint helps but doesn't fix warmth).
   Decision needed: hosted TTS (ElevenLabs / CosyVoice 2 has streaming human-parity JP) behind the Phase-1 proxy vs device-only. Latency budget <500ms felt.
7. **Japanese-tuned VAD / silence tolerance** — the scan says VAD (150–300ms), not model choice, drives felt
   turn-taking, and NO competitor markets it. The F1 patient-mic ladder is already this — extend it with JP-specific
   silence patterns and market it ("waits like a patient friend").
8. **Positioning copy**: "Japanese-first · conversation-first · judgment-free" — the unowned white space (every rival
   is 8–57-language-wide, none differentiate on JP depth). Cite Jeon 2023 (32-study review backing conversational-partner
   pedagogy) in store listing / landing copy.

### → Phase 4+ (native wrap)

9. **Character-voiced, non-guilt reminders** — gentle daily nudge at the user's usual practice time + weekly
   volume summary ("you talked 45 min this week"), never FOMO. Needs push (native wrap).

### Owner actions (no build)

10. **Langua teardown session** — one paid month, run a JP session, screen-record onboarding + live correction
    behavior + post-chat feedback screen. It's the #1-ranked rival (self-affiliated ranking — verify by using it).
11. **Watch-list**: sub-scale JP-first entrants (LinguaLive, Aoi, "Japanese Ai") — the niche is being probed; window is 2026–2027.

## Avoid list (explicit anti-patterns from the scan)

- OpenAI Realtime for long tutoring sessions (context re-billing blow-up).
- False-positive STT "corrections" (Jumpspeak) — erodes the exact trust judgment-free sells.
- Dual-tier SKU confusion (Jumpspeak's Premium + Premium AI backfired) — one clear SKU.
- Public leaderboards / guilt-based push (Duolingo Lily effect) — undercuts the brand.
- Avatar-led *tutoring* UX (Praktika) — conflicts with the hands-free voice-drill mandate; the orb is Isshin's presence answer.
- Silent script looping in the keyless demo (already fixed, F3) — never regress.
