# Verification audit: learner-voices study (27 Sep 2026)

Adversarial re-derivation from the raw pulls. Scripts: `scratchpad/verify/*.py` (load.py, c1*.py ... c8.py, tt.py, tt2.py). TikTok re-pull: `scratchpad/verify/tt_repull.json`.

## 0. Base corpus: reproduced exactly
- Store reviews: **92,878** (Play 91,054 + iOS 1,824). "Japanese" pool **17,105**. Both reproduced exactly. 0 duplicate ids, 11 duplicate long texts.
- Stars: 5★ 60,559 · 4★ 11,752 · 3★ 5,697 · 2★ 4,005 · 1★ 10,865. The median review is 56 characters, and 40% are under 40 characters.
- Babbel is 40,757 of 92,878 (44%). Any "all-language" count is mostly a Babbel count.
- The original 111 / 416 / 55 counts were made with ad-hoc `allq.py` regexes at the command line. Those regexes were **not saved**. Exact numbers can only be approximated, not replayed.
- No raw TikTok or Facebook text was saved. There are only hand notes (tt-notes.md, fb-notes.md) and an empty `tt/` folder, so no TikTok/FB quote or count can be checked against raw data. I re-pulled TikTok comments for the 11 named videos through the public comment API.

## 1. "111 angry about a charge after a forgotten free trial": OVERSTATED (count is fine, framing isn't)
- Across 8 plausible definitions the count runs from 73 to 345. Examples: trial + charge words at ≤3★ = **212**, and the union with auto-renew complaints at ≤3★ = **345**. `trial & (charg|bill|renew) & ≤2★` = 107 (Babbel 58, Pimsleur 29, Ling 12). So 111 is a reasonable mid-range figure, but it can't be replayed.
- Denominator: 345 / 92,878 = **0.37%** of all reviews. Babbel 0.62%, Pimsleur 0.60%, Ling 0.53%, Teuida 0.01%. **Only 6 are Japanese reviews.**
- **What the anger is about** (keyword buckets across the 345; one review can fall in several):
  - refund refused: 92
  - can't cancel, or cancelled and still charged: 53
  - charged immediately or during the trial: 51
  - **forgot / no reminder: 48 (14%)**
  - surprise annual charge: 47
  - card required up front: 10
  - price only, with no process complaint: **20 (6%)**
- So the anger is about *process* (no warning, instant charge, can't cancel, no refund), not price. "Forgotten trial" is one of several sub-types, about 1 in 7, not the headline.
- This still matters for WordStick, because "trial rolls into a surprise yearly charge" (47) is exactly WordStick's shape.
- Counter-evidence: 191 reviews at 4-5★ mention a trial, mostly neutral or positive. Reviewers happy to have paid for a year exist but are few (~42 clear cases). The communities doc also found people who happily pay monthly for a trip.

## 2. "416 Teuida reviews complain about mic/speech grading": REPRODUCED, and it's an undercount, but misread
- My mic/recognition pattern hits **871 of 8,400 Teuida reviews (10.4%)**. A hand check of 60 random hits found about 54 genuine mic/recognition complaints (~90% precision), so the real figure is about 750.
- Other apps: Babbel 1,330 (3.3%), Pimsleur 150 (2.3%), Ling 103, Airlearn 69.
- Caveats:
  - **Only 55 of Teuida's hits are Japanese.** Teuida's reviews are overwhelmingly about Korean.
  - **About 45% of the hits are 4-5★.** People love the speak-first design and are annoyed when the recognition fails.
  - 76 hits are permission or recording bugs, not grading.
  - 301 separate 4-5★ Teuida reviews praise speaking practice. One says: "it will hear if you get anything wrong".
  - Several ask for *better* feedback ("If I'm wrong, tell me how").
- The evidence says "**grading that is wrong destroys trust**." It does **not** say "people don't want grading." Treating it as proof that "never grade" is what users want goes beyond the data.

## 3. "456 Babbel reviews ask for Japanese": REPRODUCED exactly (456), weakly interpreted
- 456 / 40,757 = **1.1%** of Babbel reviews. The pattern (`BABJP` in strict.py) is ~95% precise on a 50-sample check.
- Of the 456:
  - 203 are under 80 characters ("No Japanese")
  - 90 also ask for Korean or Chinese
  - **only 16 mention Duolingo, and 2 say "better than Duolingo"**
  - 5 mention a trip, 2 mention anime
  - 14 mention paying
- They cluster in 2020 (123), and 2026 has 20.
- The doc's "many wanted something better than Duolingo" and "a ready-made audience of payers" are **not supported**. This is a download-then-1★ reflex from an unknown mix of ages, with almost no payment signal.

## 4. Car integration, driving mode, hazard: REPRODUCED, but tiny and misframed
- Android Auto / CarPlay: **31 exactly** (Pimsleur 24, JPod101 6, Speechling 1).
  - That is 0.033% of all reviews, or 0.2% of Pimsleur + JPod reviews.
  - 1 is Japanese.
  - Several are *praise* ("integration is a game changer"), not requests.
- "Driving mode": the literal phrase appears only **27** times. Adding "hands-free" gives 58, of which 36 are at ≤3★ or are requests. "55" works only as the broad version.
- "Hazard" / "illegal": **1 review** says hazard + illegal and 1 says "downright dangerous". The other "illegal" hits are about billing. So the doc's "about 6 name danger" is closer to **2-3**.
- Counter-evidence: **262 reviews at 4-5★ talk happily about using the app while driving or commuting**. The travellers doc had 10 happy drivers and 0 worried. Phone-touching as a hazard is an anecdote (n≈2), not a finding.

## 5. Price lines: OVERSTATED (anecdotal)
- 596 reviews quote a price. 72% of them are 1-2★, and 254 contain "expensive"-type words versus 98 with "worth/fair".
- The **named willingness-to-pay statements number about 31**, and each price "line" rests on 1-5 of them:
  - **$8-10/mo:** 5 reviews
    - Pimsleur "$8 tier"
    - Ling "$10 would be nice"
    - Pimsleur "$10 seems more reasonable"
    - Babbel "$9.99/month"
    - Babbel "$9/month reasonable"
    - one Pimsleur says "no more than $7"
  - **~$40/yr:** 2 reviews (Airlearn "I'll take it!", Pimsleur "most I would pay is 40")
  - **$80/yr won't pay:** 1 review (Ling). Related: Babbel £80 "who can afford" (1), Ling £77 (1).
  - Against these: Pimsleur "$20 a month … reasonable" (5★), Babbel "worth the money … less than $10 a month".
- Selection bias: people who name a number in a review are nearly all reacting to a higher price they just saw, so the numbers they name skew low.
- These are illustrative quotes, not "lines". The $59.99 vs "$40 comfort / $80 ceiling" framing rests on 3 reviews.

## 6. "Years of apps, still can't speak" is loudest; Duolingo hate is silly sentences + no speaking, not hearts: KEYWORD ARTEFACT / CONTRADICTED
- **Stores:** a strict can't-speak pattern hits **54 of 92,878 (0.06%)**, and 6 of 17,105 Japanese reviews. That is far below mic complaints (~2,500 across apps), billing (200-345) and Babbel-no-Japanese (456). Not the loudest here.
- **Bluesky:** 53 posts match can't-speak, and **46 of them come from the search query "japanese still can't speak"**. Only 7 of the ~1,000 posts from other queries mention it (~0.7%). The headline quote "Day 1026 on Duolingo. I still can't speak Japanese" came from that seeded query.
- **Facebook** threads were found by searching "duolingo japanese can't speak" and "pimsleur japanese". **TikTok** topic pages included "japanese duolingo" and "using pimsleur". The theme was seeded on every platform where it came out "loudest".
- **Duolingo's own reviews** (gp_duo.json + ap_duo.json, 2,927 reviews, 847 at ≤2★) contradict the "not hearts" half:
  - hearts / energy / lives: **185 of 847 low-star (22%)**. Precision was checked: these are mostly energy-system rage.
  - paywall / price: ~326 (loose)
  - ads: 162
  - app updates: 124
  - AI: 121
  - silly sentences: **22**
  - can't speak (strict): **5**
- The Japanese subset shows the same order (hearts 25, silly sentences 3, can't speak 1).
- "Silly sentences, not hearts" holds **only for older forum and Facebook travellers** (small n). One caveat supports the doc: the top-liked TikTok comment (25,705 likes, "it's always apple and coffee and bread") is a silly-content complaint. But hearts are the #1 grievance among people who actually use Duolingo.

## 7. "Review pile / SRS burnout is weak outside hard-core users": REPRODUCED in direction, but untested, not disproven
- Stores: **0** clear review-pile / burnout hits. 211 reviews ask for *more* review (141 of them Babbel). 614 mention SRS, Anki or flashcards, and 82% of those are 4-5★.
- Bluesky: 7 of 1,101 posts, and the "japanese anki burnout" query returned only 3 posts.
- Sampling bias: the sampled apps have no review queues, so they can't produce this complaint. "Weak" is honest; "disproven" would not be.

## 8. AI partner split, communities 2 for vs 13 against: TOO THIN / PLATFORM-SKEWED
- 15 hand-picked items, mostly from Bluesky and HN, can't support a split. With n=15, the 95% interval on the "for" share is about 2-40%.
- Bluesky: 49 AI mentions, and 10 came from the seeded query "japanese chatgpt practice". Bluesky is a known anti-AI platform.
- **Store counter-evidence:**
  - 104 reviews mention an AI conversation partner or tutor: **53 at 4-5★ vs 34 at ≤2★**.
  - Many negatives are "it glitches" or "you removed the AI chat I liked", which is demand, not rejection.
  - Examples: Babbel "AI conversation partner is a great addition", Airlearn "AI calls gave me…".
- Anti-AI is loud among Duolingo reviewers (121 of 157 AI mentions are ≤2★), but that is backlash against AI-*generated content*, not against a voice partner.
- Verdict: the anti-*AI-content* backlash is real. The rejection of AI *partners* is not established.

## 9. TikTok, 3,109 comments from 97 videos: NOT REPRODUCIBLE (no raw data), and the re-pull shows heavy concentration
- No raw data was saved. The notes say "~20 topic pages", the doc says "35". Inconsistent.
- My re-pull of just the **11 named videos** gives **1,703 comments of 25+ characters**, which is more than half of 3,109 from 11% of the videos.
  - One video (7648538623242964244, the "Duolingo keeps emailing" meme) alone has 714.
  - **252 of 384 Duolingo/streak comments come from that one video.**
- **Likes are extremely concentrated:**
  - Top 10 comments hold **75%** of all likes, and the top 1% hold 85%. 43% of comments have 0 likes.
  - Per video, the top 5 comments hold 74-98% of likes.
- So "1,696 likes" or "1,796 likes" are single viral comments, not breadth. Theme counts (e.g. "duolingo/streak 495") mostly reflect which videos were picked.
- The audience is young and not the buyer (the doc says so itself).

## 10. Facebook, ~500 comments / 10 threads / 1 group: WEAK, can bear illustrative weight only
- The source list has **9 threads** (not 10) with 472 comments. **One thread (231) is 49% of the comments.** 8 of 9 threads come from one group (Japan Travel Tips & Planning), and the other has 6 comments.
- The threads were found through the same seeded queries ("duolingo japanese can't speak", "pimsleur japanese"), so their Pimsleur-love and can't-speak themes are partly produced by the search.
- No raw text was saved (the harvester output lived in the browser only), so quotes can't be checked against source.
- Useful for buyer language and hypotheses. Not usable for any "how common" claim. Effective n ≈ 1 group, about 3 substantive threads.

## Summary verdicts
| # | Claim | Verdict | Real number / denominator |
|---|---|---|---|
| 1 | 111 trial-charge anger | OVERSTATED (framing) | 73-345 depending on definition / 92,878 (≤0.37%); 6 Japanese; forgetting is 14%, price-only 6% |
| 2 | 416 Teuida mic | REPRODUCED (undercount) | ~750-871 / 8,400 (9-10%); 55 Japanese; ~45% from 4-5★ fans |
| 3 | 456 Babbel want Japanese | REPRODUCED | 456 / 40,757 (1.1%); 16 mention Duolingo |
| 4 | 31 AA/CarPlay, 55 driving mode, hazard | REPRODUCED (31) / LOOSE (55: literal 27) / OVERSTATED (hazard: n≈2) | 0.03% of corpus; 262 happy drivers |
| 5 | Price lines | OVERSTATED | 5 / 2 / 1 reviews behind each line, out of 596 price-mentioners |
| 6 | Can't-speak loudest; not hearts | KEYWORD ARTEFACT / CONTRADICTED | stores 54 / 92,878; Bluesky 46 of 53 from seeded query; Duolingo low-star: hearts 185 vs silly sentences 22 vs can't speak 5 |
| 7 | SRS burnout weak | REPRODUCED (direction), untestable here | 0 store hits; 7 / 1,101 Bluesky |
| 8 | AI partner 2 vs 13 | TOO THIN / platform-skewed | stores: AI partner 53 positive vs 34 negative |
| 9 | TikTok 3,109 / 97 | NOT REPRODUCIBLE | 11 videos give 1,703; top 10 comments = 75% of likes; 1 video = 66% of Duolingo comments |
| 10 | Facebook ~500 / 10 / 1 group | WEAK | 472 comments / 9 threads; 1 thread = 49% |

## Biggest methodology weaknesses
1. **The search seeded the findings.** Search queries named the hypotheses ("japanese still can't speak", "duolingo japanese can't speak", "japanese anki burnout", "japanese chatgpt practice", "learning japanese driving"). The "loudest" themes came back from exactly those queries. Hand-count verdicts (CONFIRMS x/y) never report a denominator.
2. **No denominators, and a mismatched population.** Counts are given as raw numbers ("111", "456") with no base rate (0.37%, 1.1%). All-language counts are mostly Babbel/Pimsleur, the "Japanese pool" is 76% dictionary/JA Sensei, and qualitative sources (Bluesky, TikTok, one Facebook group) are platform-skewed (anti-AI Bluesky, young TikTok). The 35+ Japan-trip buyer is directly represented only by one Facebook group and some forum threads.
3. **Not replayable, and interpretation outruns the data.** The count regexes weren't saved, and TikTok/Facebook raw text wasn't saved, so the 111 / 55 / 3,109 / FB quotes can't be audited. Findings were then stretched: mic *failures* became "don't grade", Babbel "no Japanese" 1★s became "paying Duolingo-haters", and 1-5 reviews became "price lines". The Duolingo raw data, which contradicts "not hearts", was sitting unused in the same scratchpad.
