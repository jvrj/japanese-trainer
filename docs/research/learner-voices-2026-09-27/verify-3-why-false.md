# Trying to prove the learner-voice findings FALSE (revealed preference check)
27 Sep 2026. Adversarial pass over docs/what-learners-love-2026-09-27.md + reddit-buyer-words-2026-09-27.md.
Rule used: what people PAY for / KEEP using beats what they SAY in comments.

**Tooling limits (read first):** no WebFetch tool was available in this session; the WebSearch budget (session-wide) ran out partway through; the Meta Ad Library returned a JavaScript bot-challenge to curl (not scrapable). The Duolingo Q2 2026 numbers were verified directly from the SEC filing text. Everything else comes from search-result snippets and third-party sites, so treat single-source numbers (Latka ARR, Sensor Tower estimates) as rough to within about 2x.

---

## Verdict table

| # | Finding | Verdict | Key revealed-preference number |
|---|---|---|---|
| A | "Years of apps and still can't speak" is the #1 pain | **WEAKENED** | Duolingo Q2 2026: 58.7M DAU (+23%), 12.7M paid (+17%), $298.5M revenue (+18%). The pain doesn't make people leave. It's also internally mis-ranked: motivation collapse has ~460 mentions against ~250 for can't-speak. |
| A2 | AI-first backlash hurt Duolingo | **Real but temporary** | DAU growth slowed to 40% in Q2 2025 (vs ~60% a year before), and the CEO admitted it was "dampened". Growth re-accelerated to 23% by Q2 2026 and paid subs never stopped growing. |
| B | AI split / "don't say AI in ads" | **WEAKENED (as a hard rule)** | Speak at ~$100M ARR (Nov 2025), $1B valuation. Praktika ~$20M ARR, 14M downloads. Duolingo Max ~9% of paid subs (~1M), and Video Call is now bundled into most new Super subs. Ad-attitude surveys split about one-third like / one-third neutral / one-third dislike, and older adults are the most *indifferent*. |
| C1 | People don't mind paying | **SURVIVES** | Category-wide: Duolingo 12.7M payers. Speak plans $80-200. Pimsleur sells at $550. |
| C2 | Anger = forgotten trials | **SURVIVES** | RevenueCat: Education refund rate 4.86%, among the highest categories. |
| C3 | Card-required trial is fine for cold traffic | **UNPROVEN, and the benchmarks people cite don't answer it** | Opt-out (card) trials convert 48.8% vs 18.2% opt-in (Adapty), and RevenueCat's 5-9-day trials sit at a 37.4% median. BUT those numbers are *conditional on the trial having started*, and they come from app stores where the card is already on file (one tap). WordStick asks for manual Stripe card entry from a cold Facebook click. That step has no public benchmark, and it is where the funnel will leak. Duolingo itself reports "longer free trials... good early results" (Q2 2026). |
| D | Dead time / driving / hands-free is what 35+ buyers love | **WEAKENED: real niche, not the mass hook** | Pimsleur app is about $1.3M/month (Sensor Tower estimate), about $15M/yr in app stores. That's roughly 1% of Duolingo's revenue. It's a durable 50-year niche and an Audible bestseller. Duolingo removed its audio podcasts and still grew. The doc itself says "real driving threads are thin". |
| E | Pimsleur has too few words; people want more | **WEAKENED / likely backwards** | Pimsleur Japanese L1 = ~303 words, all 5 levels about 2,000. It still sells for 50 years, is the most-liked app among your buyer type (~58 Reddit likes), and charges premium prices. People *say* "more words" but *buy* "speaking in 30 days". |
| F | Speech grading is hated; "mic never marks you" sells | **Half FALSE** | ELSA: 34M+ users, $60M raised, and pronunciation scoring IS the product. Speak (feedback on pronunciation) reached $100M ARR. What's hated is *bad* recognition, not grading. The evidence behind "hated" is only 5 forum sources. Caveat: ELSA and Speak money is mostly Asian ESL learners, not US 35+ Japan tourists. |
| G1 | Review pile is weak; don't lead with it | **Ad advice SURVIVES; the product claim is FALSE** | WaniKani ($9/mo, $299 lifetime) is a review-pile app and is the most-liked app in your Reddit pass (~60). Most "Anki burnout" sources are competitors' SEO blogs. No incumbent ad leads with spaced repetition, so "don't lead with it" holds. |
| G2 | "It decides for me" | **SURVIVES strongly** | Duolingo's 2022 switch from a skill tree to a fixed path removed choice and was followed by its best quarter up to then, with better beginner completion. This directly contradicts the doc's 14,000-like "no forced order" wish, which is Exhibit A for likes != behaviour. |
| H | Messaging angles in long-running ads | **Could not verify directly** (Ad Library blocked) | Secondary evidence: incumbents lead with a *positive, time-boxed speaking promise*: Babbel "Start speaking a new language in 3 weeks", Pimsleur "speak... in 30 days / 30 minutes a day / while driving, at the gym, cooking", Duolingo "free, fun, 15 minutes a day". Pimsleur's French App Store title is "Pimsleur - Language for Travel". Speak leads with an AI tutor (Meta case study, Korea). **Nobody found leads with the pain framing ("years of apps and you still can't")**. That framing is untested. |

---

## A. Duolingo: does the #1 pain show up in behaviour?
- Q2 2026 (SEC 8-K, verified in the filing text): DAUs 58.7M (+23%, accelerating 2 pts), MAUs 140.6M (+10%), paid subscribers 12.7M (+17%), revenue $298.5M (+18%), total bookings $289.1M (+8%). Current User Retention Rate at an all-time high of 84%. https://www.sec.gov/Archives/edgar/data/1562088/000162828026053299/q2fy26duolingo6-30x26share.htm
- FY2025 revenue $1,037.6M (+39%), 12.2M paid at year end.
- Backlash: the April 2025 "AI-first" memo. On the Q2 2025 call von Ahn said growth was "dampened". DAU growth was 40% against ~60% in Q2 2023 and Q2 2024, concentrated among younger US/Canada users. https://www.customerexperiencedive.com/news/duolingo-ai-first-consumer-backlash-lessons/757133/ and https://www.classcentral.com/report/duolingo-2025/
- The weak spot is monetisation, not users: bookings +8% vs DAU +23%, and the stock fell ~9-12% after Q2 2026. That came from a deliberate "free experience first" strategy. https://tradune.com/earnings/duolingo-q2-2026/
- **Attack result:** the "can't speak" pain is real, but it is *compatible with* continued usage and payment. It describes people who stay in apps and add a second one, not people who quit the category. So it's a good *switcher* message aimed at existing app users. There is no evidence it is what makes a *cold, non-app-using* 35+ trip planner buy. Also, your own table ranks it #1 while listing motivation collapse (~460 mentions) as "the loudest pain".

## B. AI tutors: loud minority or real split?
- Speak: $78M Series C at $1B (Dec 2024). ~$100M annualised revenue by Nov 2025, up from ~$24M in 2023. ~15M downloads. https://www.speak.com/blog/series-c , https://finance.yahoo.com/news/1-billion-ai-startup-backed-144613265.html , https://getlatka.com/companies/speak.com
- Praktika: $35.5M Series A. ~$20M annualised, 14M downloads, 1.2M MAU (May 2024). https://techcrunch.com/2024/05/22/praktika-raises-35-5m-to-use-ai-avatars-to-make-learning-languages-feel-more-natural , https://getlatka.com/companies/praktika.ai
- Duolingo Max: 7% of paid subs in Q1 2025, ~9% by mid-2025. In Q2 2026, "most new Super Duolingo subscribers now have access to Video Call", which is being moved *down* into the main tier. https://www.classcentral.com/report/duolingo-2025/ + SEC link above
- Babbel launched the AI voice feature "Babbel Speak" in Sep 2025. Babbel headcount is down ~27% since 2023 (Revelio). The one incumbent that is shrinking is not the AI-native one. https://www.reveliolabs.com/companies/babbel-group/employees
- Ad attitudes: about one-third like / one-third neutral / one-third dislike AI in advertising. Older consumers lean dislike-or-indifferent and are *less likely to notice*. Only 27% of 50+ shoppers trust AI companies with data. https://www.zappi.io/web/blog/how-consumers-feel-about-the-use-of-ai-in-advertising , https://yougov.com/en-us/articles/53808-american-trust-in-ai-for-retail-consumer-sentiment-in-2025
- **Attack result:** the Duolingo backlash was about *AI replacing people and making the content*, not about an AI tutor as a feature. AI-tutor apps are the fastest-growing revenue in the category. The main caveat: Speak's and Praktika's revenue is mostly Asia/LatAm English learners. "Don't say AI" is fine as a *default for the drill ad*, because the drill isn't AI. It is not a proven law, and for Talk it may be the hook. That needs its own test later.

## C. Money and the card-required trial
- RevenueCat SOSA 2026: trial-to-paid median 25.5% (<=4 days), 37.4% (5-9 days), 42.5% (17-32 days). Hard paywalls reach 10.7% download-to-paid vs 2.1% freemium (~5x). ~50% of paid conversions happen on Day 0. Education trial users show +50% LTV vs direct buyers. Education has the lowest share of trials started on day 0 (78.5%). Yearly plans renew at 83.4% overall, about 2x monthly. https://www.revenuecat.com/state-of-subscription-apps , https://www.revenuecat.com/state-of-subscription-apps-2026-education , https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026
- Education refund rate 4.86%, among the highest categories. https://www.revenuecat.com/state-of-subscription-apps-2025
- Adapty: freemium 2.6% / opt-in no-card trial 18.2% / opt-out card trial 48.8% trial-to-paid. Education favours annual plans. Education leads discount adoption (14.5%). https://adapty.io/blog/education-app-subscription-benchmarks/ , https://kirro.io/free-trial-conversion-rate
- Annual subscribers who cancel rarely come back (RevenueCat via 9to5Mac, May 2026). https://9to5mac.com/2026/05/27/new-report-shows-annual-app-subscribers-rarely-return-after-they-cancel/
- **Attack result:** "card trials convert better" is a *selection effect*: only committed people enter a card, so of course more of them pay. The number that decides your economics is **cost per card-entered trial from cold Facebook traffic on a web page**. None of these reports publish it, and they measure app-store trials where payment is one tap. Your research "found" that card-required is fine, but nothing in it can show that. The high education refund rate supports the "forgotten trial anger" finding. Duolingo reporting better results from *longer* trials is a mild signal against short, hard trials.

## D. Hands-free / dead time
- Pimsleur app: Sensor Tower estimate ~$1M/month iOS + ~$300k/month Android (US). Pimsleur also sells lifetime plans, web plans and Audible titles, which appear in Audible's language top-25. https://app.sensortower.com/overview/1405735469?country=us , https://www.amazon.com/Best-Sellers-Audible-Audiobooks-Language-Learning/zgbs/audible/18573292011
- Pimsleur's copy: "learn while driving, at the gym, or while cooking", "30 minutes a day", "in 30 days". https://apps.apple.com/us/app/pimsleur-language-learning/id1405735469
- **Attack result:** hands-free audio is a *profitable, durable niche*, roughly 1% of Duolingo's revenue, not the mass motive. Duolingo removed audio lessons and grew anyway. Your own doc concedes driving threads are thin. Hands-free is a credible *how* line, not the *why*. Your memory note already says "commute is only the how", and the evidence agrees.

## E. "Too few words"
- Pimsleur Japanese: ~303 words in L1, ~2,000 across 5 levels / 150 lessons. https://migaku.com/blog/japanese/pimsleur-japanese-review
- **Attack result:** the slowest, lowest-word-count product is the one your buyer type likes most and pays the most for. The complaint "too few words" comes from people who already bought and finished it (acquisition bias). A trip planner needs a few hundred usable phrases, not 3,576 words. "Far more words" may be a feature for the loyal user and noise, or even an overwhelm signal, for the cold buyer. Don't lead ads with word count.

## F. Grading
- ELSA: 34M+ users, 195 countries, ~$60M raised. The product IS pronunciation scoring. https://elsaspeak.com/en/about-us , https://tracxn.com/d/companies/elsa-speak/__oUqt06y8Fr5r2uVOAaIrTCxiqTQTMJGQoEAHCu57JWE
- Speak gives pronunciation feedback (described as lenient) and reached $100M ARR.
- ASR research: *failed recognition of correct speech* drives frustration and abandonment. Framing matters: "you were understood" beats "73%". https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1210187/full , https://medium.com/design-bootcamp/beyond-pronunciation-scores-designing-identity-first-ux-for-ai-language-coaches-eac865c4cc0d
- **Attack result:** "grading is hated" is false as a market statement. "Wrong grading is hated" survives. Keeping STT out of grading is a sound *product* decision because phone STT will mis-hear Japanese from beginners. But "the mic never marks you" as an *ad claim* is unproven. A cold buyer could just as easily read it as "so how do I know I'm right?" The morning check answers that, so sell the check, not the absence of grading.

## G. Review pile / decides for me
- WaniKani is a paid ($9/mo, $89/yr, $299 lifetime) review-pile app and the most-liked tool in your own Reddit pass. https://www.wanikani.com/
- The "Anki burnout" literature found by search is almost entirely competitor content marketing (wordrop, my-senpai, draftandarc, etc.), so it's weak evidence.
- Duolingo 2022 path redesign: removed choice, improved beginner completion, and was followed by its best quarter to date. https://duoplanet.com/duolingo-new-learning-path-review/ , https://medium.com/@farahhariri/duolingos-app-update-2022-breaking-boundaries-f4abbde429d0
- **Attack result:** the review pile is *loved by committed learners*. Your buyer isn't one yet, so "don't lead with it" survives as ad advice. "It decides for me" is the strongest-supported finding in the whole set, because a billion-dollar company proved it with behaviour. The 14,000-like "no forced order" wish is exactly the kind of stated preference that behaviour overrules. Don't build order freedom because of it.

## H. What long-running ads say
- Meta Ad Library: **blocked** (JS challenge to curl; no browser/WebFetch in this session). Third-party ad-spy pages (Atria, adlibrary.com, AppFuel) surfaced only generic Duolingo lines ("free, fun, 300M learners"). Duolingo's top Meta spend is on DET (the English test: cheap, fast, online). https://www.tryatria.com/ads/meta/language-learning-ads , https://adlibrary.com/brands/duolingo , https://theappfuel.com/app/829587759
- Durable claims visible on landing pages and store listings, a proxy for what has run for years:
  - Babbel "Start speaking a new language in 3 weeks" (brand SEM page). https://www.babbel.com/pages/en-us/eg_sem_brand_flags_mobile_ame_usa-en
  - Pimsleur "30 days", "30 minutes a day", "while driving... gym... cooking". Store subtitle "Language for Travel" in France. https://apps.apple.com/FR/app/id1405735469
  - Speak: AI-tutor, speaking-first. The Meta case study (Korea) reports a 9-pt lift in action intent. https://www.facebook.com/business/success
- **Pattern:** SPEAKING outcome + a TIME box (3 weeks / 30 days / minutes a day) + where-you-do-it (Pimsleur) + TRAVEL as a use case (Pimsleur, Mondly). Price leads only for Duolingo ("free"). The *pain-first* framing your doc recommends ("years of apps and you still can't say it") does **not** appear in any incumbent line found. That doesn't prove it loses. It does mean it is your one untested bet, so test it against a positive time-boxed promise.
- To verify properly: open facebook.com/ads/library in a real browser, set country US, search each brand, sort by oldest start date, and screenshot any ad active 90+ days. That takes about 20 minutes by hand.

---

## Methodology weaknesses of comment/review research (and which findings they hit hardest)
1. **Self-selection / J-curve:** reviewers are the delighted and the furious; the moderate majority is silent (Hu, Pavlou & Zhang; Brandes, Godes & Mayzlin 2022). https://archive.nyu.edu/bitstream/2451/14951/2/usedbook1.pdf , https://journals.sagepub.com/doi/abs/10.1177/00222437211073579 -> hits the **billing-anger, hearts and speech-recognition** findings.
2. **Wrong population:** r/LearnJapanese, YouTube and Anki forums are committed hobbyists, often young or anime-driven. The 35+ trip planner with a date mostly *doesn't post*. -> hits **D (driving), E (more words), G1 (review pile)**.
3. **Acquisition bias:** people who complain about Pimsleur's word count already paid $150-550 for it. Their complaint describes the *loyal* user, not the *cold buyer*. -> **E**.
4. **Complaint != churn (negativity bias):** Duolingo gathers the most complaints *and* the most growth. -> **A**.
5. **Likes != people:** likes are driven by the algorithm, grow with how long a comment has been up, reward witty phrasing, and aren't independent. A 14k-like comment is one voice amplified. -> **"no forced order" (14k), hearts (4.9k), grandparents (2.3k)**.
6. **Keyword search finds what you look for:** searching "hands-free", "driving" or "can't speak" produces those themes. The doc admits its "keyword counts are rough". -> **A, D**.
7. **Stated vs revealed:** "more words", "no forced order", "lifetime" and "no card" are all stated. Behaviour (Pimsleur sales, the Duolingo path, card-trial economics) points the other way on at least two of them. -> **E, G2-counter, C3**.
8. **Mirror bias:** the research was run by a team that knows WordStick's features, and its "Already right, say it louder" section confirms nearly every current design choice. A research pass that endorses almost everything should be distrusted. -> all of section 7 of the doc.
9. **Mixed units:** "sources" range from a single Trustpilot page to a 200-comment thread, and are then ranked together. The #1/#2 pain ranking contradicts its own mention counts. -> **A**.
10. **Wrong-market transfer (applies to my attack too):** the ELSA and Speak revenue that "disproves" F and B is mostly Asian ESL learners. Neither side has clean data on US 35+ tourists learning Japanese. Only an ad test does.

**Most exposed:** E (more words), F-as-ad-copy (mic never marks you), D-as-headline (driving), C3 (card-required on cold web traffic), and the "lead with the pain" headline.
**Most robust:** G2 (app decides), C1 and C2 (people pay; trial anger is real), and the existence of the can't-speak pain (its *rank* and *conversion power* are unproven).

---

## What the $300 test should settle, because research can't
Scale reality: $300 buys roughly 150-400 clicks at typical cold CPCs. At plausible web card-entry rates that's **single-digit trials**. Paid conversion and retention *cannot* be read from this test. Pre-register this before spending:
1. **One question per variable, maximum 3 ad cells (>= $100 each), same visual, same audience, same landing page:**
   - Cell 1: positive time-boxed promise: "Say it out loud in Japan: X minutes a day, before your trip".
   - Cell 2: pain framing: "Years of apps and you still can't say it".
   - Cell 3 (optional): hands-free/how: "Learn Japanese out loud in the car / on the walk".
   Decide on **CTR and cost per landing-page view**. Those have enough volume (thousands of impressions) to separate angles; purchases don't.
2. **Instrument the card wall:** track landing view -> plans viewed -> checkout started -> card entered. The one number research can't provide is the **plans-viewed -> card-entered drop on cold web traffic**. If it's catastrophic (for example under ~10% of plans viewers), the card-required call is the problem, not the ad.
3. **Optimise Meta for an upstream event** (landing view or checkout-start), not purchase. Meta can't learn on 5 conversions.
4. **Pre-written kill/continue lines** (for example CTR under 0.8% on every cell means the message isn't landing; cost per checkout-start above $X means stop). Write them down before launch so the result can't be read with hindsight.
5. **What it still won't settle:** trial->paid, refunds, month-2 retention, and whether "mic never marks you" or "AI" help. Those need a second, larger run once one angle wins on CTR and the card wall shows a survivable drop.
