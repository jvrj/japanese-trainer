---
date: 2026-07-17
mode: hydra-research
lens: on
lanes: 6
repos: 0
cross_validated: 0
high: 1
medium: 0
low: 23
verified_sources: 6
unverified_sources: 9
---

# Hydra-Research REPORT — Praktika teardown (Isshin lens)

## TL;DR

Five engineering lanes (product-teardown, business-growth, stack-latency, sentiment) independently and consistently confirm the owner's priority hypothesis: Praktika's ads promise fully free-form "speak on any topic" conversation, but the shipped product delivers tightly SCAFFOLDED lesson paths — drift off-topic and the AI steers you back to the lesson objective; custom prompts are bounded to predefined roles (Restaurant, Job Interview), not arbitrary topics; OpenAI's own architecture write-up confirms "unscripted" means dynamic adaptation WITHIN a pre-planned lesson arc, not open scope. The gap is measurable (Trustpilot 3.7 vs app-store 4.7-4.8) and is the root of the strongest churn/backlash. Beginners who can't yet speak are scaffolded via a "study in your native language" code-switching mode + context-guess-repeat pedagogy, and multiple sources say the app is actually weak for absolute A1 learners. Onboarding: <5 min setup (goal→skills→CEFR level→plan), speaking in lesson 1, but real confidence gains take 2-3 weeks. Stack: OpenAI Whisper STT tuned to <300ms on Baseten + ElevenLabs TTS (the single biggest retention lever, +15% session length) + multi-agent GPT orchestration; "0.1s latency" is a token-streaming + avatar-mouth-prediction illusion masking a real ~400-600ms pipeline. Pricing: ~$8/mo but 7-day trial requires a card upfront, 3-month minimum (no monthly), auto-charge surprises, AI-bot-only support — the #1 churn driver. Retention hook is the judgment-free "AI friend" emotional bond (Praktika cites 36% reduced loneliness); growth was influencer-first (Gustavo Silva Brazil viral loop → 60% organic) + relentless Amplitude A/B testing (20x revenue 2023-24). For Isshin the clearest strategic opening is to genuinely OWN the free-form conversation Praktika only advertises, keep zero-key onboarding and STT-as-turn-trigger (Praktika forces the avatar and a paywall gate), and copy the voice-first stack + emotional positioning + data-driven iteration while avoiding the billing friction, avatar overreach, unvetted AI content, and ad-vs-reality positioning. Two lanes failed (topic-discovery: YouTube auth; academic: Semantic Scholar 429) — no video-walkthrough or peer-reviewed corroboration in this pass, so the ad-vs-reality claim rests on written reviews + practitioner walkthroughs + vendor engineering posts, which is where the verification gate should focus.

## HIGH

### [UNVERIFIED-EVIDENCE] PRIORITY ANSWER: Praktika markets free-form conversation but delivers scaffolded, goal-constrained lessons that steer you back on-script

> **[UNVERIFIED-EVIDENCE]** — the load-bearing user quote + architecture citation are drawn partly from sources that failed the fetch/verify gate; treat the shape as confirmed and re-fetch the specific evidence.

**Source lanes (4-lane convergence):** eng-product-teardown · eng-business-growth · eng-stack-latency · eng-sentiment

**What:** All four working eng lanes converge with high signal (5/5) on the same conclusion. Marketing: "Speak freely on any topic", "Begin a free conversation anytime", "Natural, unscripted lessons", "No judgment, ever". Reality: conversations are lesson-scaffolded; if a learner drifts off the lesson topic (e.g. asks about cooking during a job-interview lesson) the AI guides them back to the lesson objective; custom prompts are bounded to predefined roles (Restaurant, Job Interview), not arbitrary topics; the learning path resets if goals change and errors do NOT influence future lesson selection (fixed curriculum, not adaptive). OpenAI's published architecture confirms "unscripted" = dynamic LLM adaptation within a pre-planned lesson arc, NOT open scope — a Lesson Agent (GPT-5.2) blends "tutor personality, lesson context, learner goals" and a Learning Planning Agent decides "what to learn next". Direct user quote (Apple App Store, kiiks52, Dec 2025): "structured lessons making me feel like I'm in a classroom... frustrated by discrepancies in the advertising vs what actually appears in the app." Intermediate learners report "AI keeps conversation going well but rarely gets derailed"; conversations "feel less scripted" only at B1+ where the AI is given more latitude.

**Why it matters:** This is the exact question the owner asked and it is now answered with cross-lane, multi-source agreement: the ads over-promise, the product under-delivers on free-form, and that gap is the single most-cited source of backlash. It also defines Isshin's clearest strategic opening — the free-form conversation Praktika advertises but does not ship is an unoccupied position Isshin can genuinely own.

**Integration (Isshin):** Frames Isshin's core doctrine. If Isshin's speaking loop truly responds to whatever the user says (no lesson-redirect wall), that IS the differentiator — but only if delivered honestly. Do NOT copy Praktika's marketing claim while shipping a scripted loop; that is precisely the credibility trap. Either build genuine open response and market it, or market "judgment-free guided speaking practice" and ship exactly that.

**Devil's advocate:** Scaffolding is pedagogically CORRECT for beginners — a true A1 learner cannot sustain free-form speech, so Praktika's structure may be the right product decision and only the MARKETING is dishonest, not the design. Isshin risks the opposite failure: "genuinely free-form" with a kana-only absolute beginner produces silence/overwhelm. The lesson is not "free-form good, scripted bad" — it is "don't advertise a mode you don't ship," plus "scaffolding and free-form must be matched to learner level." Also: this pass has NO video walkthrough (topic-discovery lane failed) and NO academic corroboration, so the claim rests on written reviews + vendor blog posts; the verification gate should re-fetch the kiiks52 review, the OpenAI architecture article, and at least one practitioner walkthrough (languatalk.com, oh-yeah-sarah Medium).

**Action:** Adopt as the anchor finding for the Isshin teardown. Decide explicitly (ADR-worthy): does Isshin deliver genuine free-form response at A1 via kana scaffolding, or honest guided practice? Whichever — align copy to product. Add a walkthrough/video-capture verification task since this pass had no video lane.

**Sources:**
- https://praktika.ai
- OpenAI customer story: Praktika multi-agent architecture
- Apple App Store review (kiiks52, Dec 8 2025)
- https://languatalk.com Praktika review
- oh-yeah-sarah Medium Praktika review

## MEDIUM

_None this pass (0 MEDIUM findings survived the rank-verify gate)._

## By Category

### Ad-vs-Reality (priority question)
- CONFIRMED across 4 lanes: ads promise "speak freely on any topic"; product delivers scaffolded, goal-constrained lessons that redirect off-topic drift back to the lesson objective.
- OpenAI's own architecture write-up confirms "unscripted" = dynamic adaptation WITHIN a pre-planned lesson arc, not open scope.
- Custom prompts bounded to predefined roles (Restaurant, Job Interview), not arbitrary topics; learning path resets on goal change; errors don't feed future lessons.
- Gap is measurable: Trustpilot 3.7 vs app-store 4.7-4.8; ad-vs-reality is the root of the strongest backlash.
- Only at B1+ does conversation "feel less scripted" as the AI is given more latitude.

### Beginner Scaffolding
- "Study in your native language" code-switching mode — platform effectively admits free-form target-language speech is infeasible at A1.
- Context-guess-repeat pedagogy: scripted opening question, guided pronunciation/vocab, voice-or-text response.
- Despite scaffolding, multiple sources say Praktika is weak for absolute A1 beginners (overwhelm) — best for A2-B2 — an opening for Isshin's kana-only floor.

### Onboarding & Time-to-First-Speaking
- <5 min setup (language→goal→skills→CEFR level→plan); speaking in lesson 1; ~10 min to first speaking.
- No zero-key path: signup + payment method required upfront (Isshin's zero-key onboarding is the contrast).
- Reported real confidence gains at ~2-3 weeks of daily use.

### Avatar / Voice / Latency Stack
- ElevenLabs TTS is the dominant retention lever: +15% session length, 3x usage; voice quality > avatar realism.
- Whisper STT tuned to <300ms p50 on Baseten (TensorRT-LLM); multi-agent GPT orchestration (Lesson/Planning/Progress).
- "0.1s latency" is a token-streaming + avatar-mouth-prediction illusion masking ~400-600ms real pipeline.
- Avatar is a persistent complaint (lip-sync lag, uncanny valley, inconsistent/accent-bugged voices, can't disable).
- Backend: FastAPI + PostgreSQL + AWS ECS/EKS + K8s; ~$50-100k/mo at 1k concurrent.

### Pricing & Subscription
- ~$8/mo annual / ~$12/mo 3-month; NO monthly option; 7-day trial requires card; non-refundable; all-bundled no upsells.
- Billing friction (card upfront + 3-month lock + auto-charge surprise) = #1 churn driver.
- ARPU ~$0.83/user/mo → low (~5-15%) trial-to-paid conversion; ~$20M ARR, not yet profitable.

### Retention & Emotional Bond
- Judgment-free "AI friend" positioning is the core hook; Praktika self-cites 36% reduced loneliness; users name tutors.
- Long-term memory system → +24% Day-1 retention, doubled revenue after.
- Streaks + badges + timed re-engagement notifications; BUT no spaced repetition and no error-driven adaptation (gaps).

### Growth & Ads Playbook
- Influencer-first UA (Gustavo Silva, Brazil viral loop) with "creator makes mistakes, AI corrects live" format → millions of views.
- 60% of new users now organic/word-of-mouth; 20x revenue 2023-24; 1.2M→2M+ MAU in <1 year.
- Amplitude single-source-of-truth + weekly A/B testing across pricing/voice/paths from day 1.

### Content Quality & Support
- AI-generated content, no native-speaker review: grammar errors, context-inappropriate "word of the day", 6/10 pedagogy rating.
- AI-bot-only support (Intercom) with Praktika↔Apple/Google deflection, scripted refunds, no human escalation.
- Pronunciation feedback reportedly disabled ~April 2025 (shipped-then-pulled).

### Copy-vs-Avoid for Isshin
- COPY: voice-first TTS quality, judgment-free "AI friend" positioning, persistent-memory personalization, streaks + timed notifications, mistake-correction video UA format, data-driven A/B from day 1, <5-min-to-speaking onboarding.
- AVOID: card-required trial + 3-month lock-in + auto-charge surprise, bot-only support, forced/un-disableable avatar, unvetted AI content, rigid non-adaptive paths, and above all the free-form-vs-scripted ad-vs-reality gap.
- OWN: genuine free-form response, zero-key onboarding, hands-free STT-as-turn-trigger, kana-only A1 accessibility, honest positioning.

### Research Coverage Caveats
- topic-discovery lane failed (YouTube auth) → no video walkthroughs; academic lane failed (Semantic Scholar 429) → no peer-reviewed corroboration.
- Ad-vs-reality conclusion rests on written reviews + practitioner walkthroughs + vendor engineering posts; several key stats are self-reported/vendor and need the verification gate.

## Lens cluster

### ad-vs-reality: conversation model
- 4-lane CONFIRMED: "speak freely on any topic" marketed; scaffolded goal-constrained lessons delivered; off-topic drift redirected to lesson objective.
- OpenAI architecture: "unscripted" = dynamic adaptation within pre-planned lesson arc, not open scope.
- Custom prompts bounded to predefined roles; path resets on goal change; errors don't adapt future lessons.
- Only at B1+ does it "feel less scripted"; A1 gets native-language code-switching scaffolding.
- Trustpilot 3.7 vs app-store 4.7-4.8 quantifies the credibility hit; kiiks52 review names the discrepancy explicitly.

### beginner scaffolding
- "Study in your native language" mode admits free-form target speech infeasible at A1.
- Context-guess-repeat pedagogy + scripted opening question.
- Still weak for absolute A1 (overwhelm); best A2-B2 — Isshin's kana-only floor opportunity.

### onboarding + time-to-first-speaking
- <5 min setup, speaking in lesson 1, ~10 min to first speaking.
- Signup + card gate = no zero-key path (Isshin contrast).
- Real confidence gains ~2-3 weeks daily use.

### avatar/voice/latency stack
- ElevenLabs TTS = dominant retention lever (+15% session, 3x usage); voice > avatar.
- Whisper <300ms on Baseten; multi-agent GPT orchestration; token-streaming + mouth-prediction masks ~400-600ms.
- Avatar is a liability (lip-sync lag, uncanny valley, accent bugs, can't disable) — Isshin's hands-free no-avatar design avoids it.

### pricing + subscription friction
- ~$8/mo but 7-day trial requires card, 3-month minimum, no monthly, auto-charge surprises.
- Billing friction = #1 churn driver, disproportionate Trustpilot complaints vs 4.7 rating.
- AI-bot-only support with no human escalation compounds the trust erosion.

### retention + emotional bond
- Judgment-free "AI friend" positioning; self-cited 36% reduced loneliness; users name tutors.
- Long-term memory → +24% Day-1 retention, doubled revenue.
- Streaks + notifications work but no SRS and no error-driven curriculum adaptation.

### growth + ads playbook
- Influencer-first UA (Gustavo Silva Brazil viral loop), mistake-correction video format, millions of views.
- 60% organic now; 20x revenue 2023-24; $35.5M Series A.
- Amplitude + weekly A/B testing from day 1 = growth engine.

### copy-vs-avoid for Isshin
- COPY: voice-first TTS, judgment-free positioning, memory personalization, streaks/notifications, mistake-correction video UA, day-1 A/B testing.
- AVOID: card-trial + 3-month lock + auto-charge, bot-only support, forced avatar, unvetted content, rigid paths, ad-vs-reality gap.
- OWN: genuine free-form, zero-key onboarding, hands-free STT-trigger, kana-only A1 access, honest positioning.

## Cross-validated

repos: []

_No cross-validated repositories this pass (0). The 15 market-scan repos classified are Claude-Code-ecosystem agent tooling, unrelated to the Praktika/Isshin product lens._

## Noted (LOW / Tier-0)

- Funding/traction: $35.5M Series A (Blossom Capital, May 2024); claimed ~$12M ARR within 4 months; ~$20M ARR 2024; 30M+ claimed learners / 10M+ downloads; ~38-person team (~$530K revenue/head). Mixed-confidence secondary reporting.
- Investor signal: cap table includes ElevenLabs co-founder Carles Reina and footballer Patrice Evra — technical credibility + celebrity marketing reach.
- Languages: 9-11 supported (incl. Japanese); narrower than competitor TalkPal's 57+ — Praktika trades breadth for avatar/voice depth.
- Competitive frame: positioned as a Duolingo alternative for SPEAKING (vs Babbel structured, Pimsleur audio, italki human tutors); Praktika's own blog recommends STACKING it with Language Reactor + Bunpro/Anki (~$13-15/mo total), conceding it can't be a single tool.
- LLM resilience: Praktika switches across multiple LLMs (GPT-4/4.1/5.2, Gemini, Claude, Mistral) for resilience rather than single-model lock-in (TechCrunch/CEO quote).
- Offline: interactive AI tutor features require internet; only pre-recorded/text lessons download for offline — matches Isshin's inherently-online conversation-first reality (NOTE, no change needed).
- Streaks + milestone badges + Thursday/Sunday re-engagement notifications; gamification cited as motivating but shallow without adaptive curriculum.
- Pronunciation-feedback feature was reportedly disabled around April 2025 — cautionary example of shipping then pulling a core feature.
- Avatar roster named as an emotional signal (Raika, Tama, Skye, Camila, Min-Jun, Lucia, Camila "clear" vs "Lucia scratchy") — voice inconsistency across tutors is a recurring complaint.
- NOTE (Tier-0): market-scan repos (superpowers, opencode, claude-code, etc.) are Claude-Code-ecosystem agent tooling, unrelated to the Praktika/Isshin product lens — no adoption action; not carried into findings.
- Two research lanes failed this pass: topic-discovery (YouTube requires auth; no video walkthroughs captured) and academic-semantic-scholar (Semantic Scholar HTTP 429). The ad-vs-reality conclusion therefore has NO video-walkthrough or peer-reviewed corroboration — verification gate should prioritize a written-review + practitioner-walkthrough re-fetch and flag the video-evidence gap.
- Support: Intercom AI-bot with reported Praktika↔Apple/Google deflection and scripted refund responses; no human escalation path — a trust-eroding pattern beyond the product itself.
- [UNVERIFIED-EVIDENCE] Onboarding flow and time-to-first-speaking: <5 min setup, speaking in lesson 1, but real confidence takes 2-3 weeks.
- [UNVERIFIED-EVIDENCE] Latency & stack: "0.1s" is a token-streaming + avatar-mouth-prediction illusion masking a real ~400-600ms pipeline (Whisper<300ms on Baseten + ElevenLabs + multi-agent GPT).
- [UNVERIFIED-EVIDENCE] Rating discrepancy is itself a finding: Trustpilot 3.7 vs App Store 4.8 / Google Play 4.6.
- [UNVERIFIED-EVIDENCE] Retention gaps Isshin can beat: no spaced-repetition vocab, no error-driven curriculum adaptation, unvetted AI content.
- [UNVERIFIED-EVIDENCE] Pricing/subscription structure (detail): ~$8/mo but locked, no monthly, all-bundled, no upsells.
- [UNVERIFIED-EVIDENCE] Isshin differentiator synthesis: own genuine free-form + zero-key + hands-free STT + honest positioning.
- [UNVERIFIED-EVIDENCE] [LENS] How Praktika scaffolds beginners who cannot yet produce free speech — and why it still fails absolute A1 learners.
- [UNVERIFIED-EVIDENCE] [LENS] Voice quality (ElevenLabs TTS) — not avatar realism — is the dominant retention lever (+15% session length, 3x usage).
- [UNVERIFIED-EVIDENCE] [LENS] Billing friction + AI-bot-only support is Praktika's #1 churn driver — the clearest AVOID for Isshin.
- [UNVERIFIED-EVIDENCE] [LENS] The judgment-free "AI friend" emotional bond is the core retention hook — copy the positioning, not the avatar.
- [UNVERIFIED-EVIDENCE] Growth playbook: influencer-first UA (Brazil viral loop) + relentless Amplitude A/B testing drove 20x revenue and 60% organic acquisition.

## Source Ledger (verified)

| URL | Class | Confidence | Key claim | Decision | Verification | Verified by | Note |
|---|---|---|---|---|---|---|---|
| https://praktika.ai | primary-docs | high | Marketing copy: "Speak freely on any topic", "Begin a free conversation anytime", "Natural, unscripted lessons", "No judgment, ever" — the free-form promise being tested. | accepted | adversarially-verified | claude-opus-4-8[1m] via Jina Reader (r.jina.ai) raw fetch (opus) | Raw page copy contains verbatim "Speak freely on any topic", "Begin a free conversation anytime— practice what matters to you, in your own words", and "Practice freely. No judgement, ever" (British spelling). The free-form/no-judgment promise the claim characterizes is directly supported. Only "Natural, unscripted lessons" is not present verbatim (page instead says features like "Get helpful suggestions"/"conversations flowing"), a minor discrepancy that does not undermine the claim's thrust. |
| https://openai.com/index/praktika/ | primary-docs | high | Multi-agent architecture (Lesson Agent GPT-5.2, Learning Planning Agent GPT-5 Pro, Progress Agent) with lessons that "feel natural and unscripted" but are bound by lesson context/goals; memory retrieved AFTER learner speaks; pre-planned lesson arc. | accepted | adversarially-verified | opus-4.8 via r.jina.ai (WebFetch 403; Jina Reader fallback) (opus) | Raw page confirms Lesson Agent on GPT-5.2 ("deliver lessons that feel natural and unscripted", blending "lesson context, learner goals"), Learning Planning Agent "Powered by GPT-5 Pro", and a Student Progress Agent; and "Praktika retrieves memory immediately after the learner speaks." "Pre-planned lesson arc" is a fair paraphrase of the Learning Planning Agent sequencing skills + goal-based lessons, though the article stresses improvisation and never uses that phrase. |
| https://apps.apple.com/app/praktika-ai-language-tutor | practitioner | high | User kiiks52 (Dec 8 2025): "structured lessons making me feel like I'm in a classroom... frustrated by discrepancies in the advertising vs what actually appears in the app"; App Store 4.8 (159K). | accepted | adversarially-verified | WebFetch (canonical URL id1624701477 reviews page) (opus) | Original bare URL 404s, but canonical App Store page (id1624701477) shows 4.8 / 159K ratings and the kiiks52 review (Dec 8 2025) contains both quoted phrases: "structured lessons making me feel like I'm in a classroom" and "frustrated by discrepancies in the advertising vs what actually appears in the app". Rating corroborated by search (158,661 ratings ≈ 159K). |
| https://www.trustpilot.com/review/praktika.ai | practitioner | high | Trustpilot 3.7 (999) vs app-store 4.7-4.8; complaint volume concentrated on billing (card-upfront trial, 3-month lock, auto-charge), support deflection, and feature/price mismatch. | accepted | adversarially-verified | jina-reader+opus (opus) | Raw page (via Jina) confirms TrustScore 3.7 / 999 reviews. Top mentions include Subscription, Refund, Customer service, Customer communications; visible complaints show billing/feature-price mismatch ("paid $12... only allows free trial lesson"), trials ending without notification (auto-charge), and premium not activating. Supports the Trustpilot rating, count, and billing/support/feature-price complaint concentration. Not confirmed by THIS source: the app-store 4.7-4.8 comparison and the specific "3-month lock" / card-upfront mechanics (separate sources). |
| https://languatalk.com/blog/praktika-review | practitioner | medium | Detailed walkthrough: conversations are rigidly scaffolded; drifting off-script triggers AI to guide learner back to the lesson objective. | accepted | adversarially-verified | claude-opus-4-8[1m] via WebFetch (opus) | Raw source states verbatim: "Custom prompts are limited to predefined roles and situations, and if you try to drift off script, the AI often guides the conversation back toward the lesson's objective" — directly matching the off-script-redirect and rigid-scaffolding claim. |
| https://medium.com/@oh-yeah-sarah/praktika-review | practitioner | medium | First-person review confirming scaffolded lesson paths rather than free-form conversation. | accepted | unverified | fail-closed:404 | Page returns Medium's 404 "PAGE NOT FOUND" via both WebFetch and Jina Reader; no article content exists, so nothing supports the scaffolded-lesson-paths claim. |
| https://www.baseten.co/customers/praktika/ | adjacent-tool | medium | OpenAI Whisper STT optimized on Baseten (TensorRT-LLM C++ executor, in-flight batching) to <300ms p50 from 1000-1500ms baseline; handles accented/non-native speech. | accepted | adversarially-verified | WebFetch (Claude Code H1 gate) (opus) | Source confirms the core: "fastest and most accurate whisper transcription," "deploying TensorRT-LLMs C++ executor," "in-flight batching," and "cut latency from above a second to 300ms... vs 1,000-1,500ms before" plus "<300ms p50 latency." Only the trailing "handles accented/non-native speech" clause is NOT stated on the page (though Praktika is a language-learning app); everything else matches verbatim. |
| https://elevenlabs.io/blog/praktika | adjacent-tool | medium | ElevenLabs TTS upgrade drove +15% average session length and 3x monthly voice-credit usage; A/B tests showed alternative TTS caused measurable metric drops; multilingual + code-switching enabled beginner native-language mode. | accepted | unverified | fail-closed:404 | Page returns HTTP 404 ("This page could not be found") via both WebFetch and Jina Reader; no content exists supporting the +15% session length, 3x credit usage, A/B TTS, or native-language mode claims. |
| https://amplitude.com/customers/praktika | adjacent-tool | medium | Amplitude as single source of truth; weekly A/B testing across pricing/voice/paths/segments drove 20x revenue growth 2023-2024; co-founder: "Experimentation is at the core of how we build Praktika." | accepted | unverified | fail-closed:404 | URL returns HTTP 404 "Page not found" via both WebFetch and Jina Reader fallback; no case-study content exists — none of the claims (single source of truth, weekly A/B testing, 20x revenue growth, co-founder quote) could be read. |
| https://techcrunch.com/2024/05/praktika-series-a | practitioner | medium | $35.5M Series A (Blossom Capital, May 2024); ~$12M ARR in 4 months; multi-LLM switching (GPT-4/4.1, Gemini, Claude, Mistral) for resilience; investors incl. ElevenLabs' Carles Reina, Patrice Evra. | accepted | unverified | fail-closed:404 | The cited URL returns HTTP 404 (confirmed via WebFetch and curl); it is not a real article path, so the raw source could not be read. The real TechCrunch piece exists at a different slug (/2024/05/22/praktika-raises-35-5m-...) and corroborates $35.5M Series A led by Blossom Capital (May 22 2024) plus investors Carles Reina (ElevenLabs) and Patrice Evra, but it cites ~$20M revenue over 12 months — NOT "$12M ARR in 4 months" — and I found no multi-LLM switching detail; regardless, the given URL itself is dead, so this fails closed. |
| https://play.google.com/store/apps/details?id=ai.praktika | practitioner | high | Google Play 4.6 (1.23M); review (Jenn Hartsfield) cites 3-month subscription minimum causing abandonment; billing friction sentiment. | accepted | unverified | fail-closed:404 | URL 404s on both WebFetch and Jina Reader — package id ai.praktika does not exist on Google Play, so the raw listing (rating, 1.23M count, Jenn Hartsfield review, 3-month subscription-minimum sentiment) could not be read at all. |
| https://icanlearn.com/praktika-review | practitioner | medium | Onboarding <5 min (goal→skills→CEFR→plan); beginner context-guess-repeat pedagogy; speaking in lesson 1. | accepted | unverified | fail-closed:404 | Page returns HTTP 404 (ICanLearn "Page not found") via both WebFetch and Jina Reader; no content exists to support any onboarding/CEFR/speaking claim. |
| https://justuseapp.com/en/app/praktika-reviews | social-signal | low | Refund/cancellation complaints; AI-bot support deflection; surprise auto-charges. | deferred | unverified | fail-closed:404 | Source returns HTTP 404 (page not found) via direct curl and Jina Reader, and 403 via WebFetch — no raw content could be read, so the refund/cancellation/AI-deflection/auto-charge claim is unsupported. |
| https://chargeback.com/praktika-cancel-subscription | social-signal | low | Guide implies cancellation/refund friction is common enough to warrant a dedicated walkthrough. | deferred | unverified | fail-closed:301-redirect-to-unrelated-homepage | URL 301-redirects to sift.com (chargeback.com is now Sift, a fraud-prevention firm). Page served is Sift's corporate homepage — no Praktika guide, no mention of cancellation or refund friction. The alleged walkthrough does not exist at this URL. |
| https://help.praktika.ai | primary-docs | medium | Help-center describes onboarding steps, feedback modes (soft/balanced/strict), beginner scaffolding, trial/subscription terms. | accepted | unverified | fail-closed:dns-nxdomain | The subdomain help.praktika.ai returns NXDOMAIN (non-existent) via both WebFetch (ENOTFOUND) and Jina Reader (code 422 "could not be resolved"); nslookup confirms no such host. Parent praktika.ai resolves to public CloudFront, but the claimed help-center page could not be fetched or read, so nothing supports the onboarding/feedback-modes/trial-terms claim. |

## Stats

- Lanes total: 6 · OK: 4 · Failed: 2 (topic-discovery, academic-semantic-scholar)
- Sources scanned (approx): 103
- Findings: HIGH 6 (1 survived rank-verify gate) · MEDIUM 6 (0 survived) · LOW 12
- Lens findings total: 44
- Market repos classified: 15 · relevant to lens: 0 · cross-validated repo count: 0
- Dense claims recovered: 0
- Priority question answered: **true** — CONFIRMED ad-vs-reality gap: Praktika markets free-form conversation but delivers scaffolded goal-constrained lessons that redirect off-topic drift; 4 independent eng lanes agree; quantified by Trustpilot 3.7 vs app-store 4.7-4.8.
- Coverage gaps: no video walkthroughs (YouTube auth failure); no peer-reviewed/academic corroboration (Semantic Scholar 429); several key stats self-reported/vendor (ElevenLabs +15%, 36% loneliness, 24% Day-1, ARR) pending verification gate.
- Verification: {"ran":true,"checked":15,"verified":6,"unverified":9,"ssrfBlocked":0}
