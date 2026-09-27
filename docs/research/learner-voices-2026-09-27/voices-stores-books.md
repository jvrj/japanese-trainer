# Learner voices from app stores (and the book stores that blocked us). Harvested 27 Sep 2026

**What this is:** a congruence check. Earlier rounds gave us eleven claims (C1 to C11) about what Japanese learners want. This round tests them against new ground: Google Play and App Store reviews of apps nobody had pulled yet. Each claim is tagged **CONFIRMS**, **CONTRADICTS** or **NEW**.

---

## 1. Scope

### What was pulled

**Google Play:** raw reviews pulled with the `google-play-scraper` library, newest first, from the US, UK and AU stores. Where an app teaches many languages, only reviews that mention Japanese (or hiragana, katakana, kanji or nihongo) count as "Japanese" reviews.

| App (Play) | Reviews pulled | Mention Japanese |
|---|---|---|
| Babbel | 40,000 | 863 (and about 456 of those are asking *why there is no Japanese*) |
| Pimsleur | 6,128 | 240 |
| JapanesePod101 (Innovative Language app) | 8,000 (capped) | 374 |
| Teuida | 8,000 (capped) | 466 |
| Airlearn | 8,000 (capped) | 183 |
| Ling (all-language app) | 5,501 | 57 |
| Ling: Learn Japanese | 382 | 382 (Japanese-only app) |
| Speechling | 480 | 4 |
| Glossika (new app + Legacy) | 10 + 139 | 2 |
| JA Sensei (the "learn Japanese" study app) | 6,506 | 6,506 (Japanese-only) |
| Learn Japanese phrasebooks (Silvermoon 1,128; Endevlab 26; KPdev 1) | 1,155 | 1,155 (Japanese-only) |
| Japanese dictionaries (Takoboto 3,803; Mazii 2,950) | 6,753 | 6,753 (Japanese-only) |
| **Play total** | **91,054** | **16,962** |

**App Store (RSS feed, US, GB, AU, CA, NZ and IE, "most recent" and "most helpful"):** Apple's feed only serves a few pages, so the counts are small.

| App (iOS) | Reviews pulled | Mention Japanese |
|---|---|---|
| Babbel | 757 | 23 |
| Pimsleur | 520 | 40 |
| Teuida | 400 | 74 |
| Speak | 147 | 6 |
| **iOS total** | **1,824** | **143** |

**Grand total:** 92,878 reviews, of which 17,105 are Japanese reviews.

**Caveat on the Japanese pool:** about 13,000 of the 17,105 come from dictionaries and JA Sensei, which are study-at-your-desk apps. Most of those reviews say nothing about speaking, commuting or money. So the hand-read counts below are much smaller than the pool.

### Blocked, and not bypassed

- **Amazon** (phrasebooks, Genki, *Japanese for Busy People*, Pimsleur and Michel Thomas CDs): every product page and review page came back as a **CAPTCHA** page, and the fetch tool got a 503 error. Nothing was taken.
- **Goodreads:** search pages came back empty (HTTP 202, a bot check). Book and review pages came back as a **sign-in wall**. Nothing was taken. Search-engine summaries of Goodreads reviews were *not* used, because they are paraphrases, not the reviewers' words.
- **Skipped as instructed:** Rosetta Stone, Mondly, Busuu, Kanji Study and Reddit. "Nihongo" (the dictionary) is an iPhone-only app with no Play listing and no RSS id in scope, so Takoboto and Mazii were used as the dictionary stand-ins.

### How it was counted

1. A script tagged every review against a keyword pattern for each claim. That gives the **"script hits"** number.
2. Then the Japanese hits were read by hand, and off-topic ones were thrown out. For example, "overwhelming" usually meant "lots of content", not "a pile of reviews". That gives the **"on-topic"** number.
3. Where a claim barely shows up in Japanese reviews but is loud across all languages (car use, trial billing), the all-language count is given too and labelled.

All quotes are verbatim and under 15 words (spelling left as written). They were checked against the raw review text with a script. References read as *app / store / stars / date*.

---

## 2. Congruence table

| # | Claim | Verdict | Count | Their words |
|---|---|---|---|---|
| **C1** | They want to say it out loud, and flashcard apps don't do this | **CONFIRMS** | 39 script hits, about 24 on-topic, 0 against | "the app speaks, and i speak back. Fantastic for car driving" · "something other apps have yet to do for me" (Pimsleur / Play / 5★ / 2021-06-05). Flashcard gap: "option for flash cards with sound only" (Takoboto / Play / 5★ / 2021-02-15, wishing for it) |
| **C2** | Dead time turned into learning is the top love, and audio is loved for the commute | **CONFIRMS (strong)** | 43 script hits, about 38 on-topic. Across all languages, another 55 ask for a "driving mode" or hands-free use | "you dont have to watch your phone so you can learn while cleaning" (JapanesePod101 / Play / 5★ / 2021-10-06) · "I typically just use it on drives or when I'm on the treadmill" (Pimsleur / Play / 5★ / 2026-01-06) |
| **C3** | "The app decides, I just show up" is loved | **CONFIRMS, with a catch** | 54 script hits, about 30 praise a clear set path. About 6 push back: *don't make me redo what I know* | "I like the structured courses which give me a clear path" (JapanesePod101 / Play / 5★ / 2022-06-15). Catch: "No skipping past parts you already know" (Airlearn / Play / 2★ / 2026-04-29) · "it still started me from the very beginning no matter what" (Teuida / Play / 4★ / 2025-04-25) |
| **C4** | Pay once or lifetime is preferred, and subscription and trial traps anger people | **CONFIRMS (strong)**, with a lifetime catch | Lifetime: 77 script hits, about 30 praise pay-once, about 10 are lifetime buyers who got burned. Trial and renewal charges (all languages): **111** (Babbel 71, Pimsleur 21, Ling 12, Airlearn 4, Speak 2, Teuida 1) | "I truly hate monthly; yearly subscriptions" (Takoboto / Play / 4★ / 2021-12-03) · "App Store gives no warning to when the week is up" (Babbel / iOS / 2025). Catch: "\"Pay once and yours forever\" I paid for premium access a long time ago" (JA Sensei / Play / 1★ / 2025-01-06) |
| **C5** | A review pile burns people out | **NOT CONFIRMED here (thin and mixed)** | 0 in the Japanese pool. Across all languages: 3 for, 3 against (people asking for *more* review) | For: "It wants me to do 15 reviews per day, or it accumulates" (Babbel / Play / 1★ / 2020-06-10). Against: "it is severely lacking in the repetition needed" (Babbel / Play / 3★ / 2024-05-18). *These apps have no big review queues, so this source can't really test C5. The earlier WaniKani and Bunpro evidence still stands.* |
| **C6** | "Years of apps and I still can't speak" is the top pain | **CONFIRMS (moderate)** | About 7 on-topic in the Japanese pool | "i couldn't transfer what i learned into a real-life conversation" (Pimsleur / Play / 3★ / 2025-06-25) · "I’ve been learning Japanese for years now but I can only read well" (Teuida / iOS / 5★ / 2026-02-11) |
| **C7** | Motivation collapses into restart cycles | **CONFIRMS**, plus a NEW twist | About 15 on-topic ("on and off for years", "coming back", "gave up") | "I have been through... 9 or more Japanese learning apps" (JA Sensei / Play / 5★ / 2022-01-27) · "I'm sorry I gave up learning Japanese I don't have the time" (JapanesePod101 / Play / 3★ / 2020-11-01). Twist: people who come back praise the product that didn't charge them while they were away: "Love the lifetime option, I'm jumping back in after 5 years" (JA Sensei / Play / 5★ / 2023-09-05) |
| **C9** | Duolingo's forced order, hearts and streak guilt are disliked | **MIXED: partly CONTRADICTS** | Streak and nagging complaints: about 5. Forced order and hearts: 0. **16** Babbel reviewers say they're going *back* to Duolingo because it has Japanese or is free | For: "I was using Duolingo but it became nerve wracking after a year" (Babbel / Play / 2★ / 2022-09-22) · "Just keeps bugging me about streak" (Airlearn / Play / 1★ / 2026-07-06). Against: "Duolingo is way better because its free." (Babbel / Play / 1★ / 2023-07-12) |
| **C10** | A robotic voice is disliked, and a warm native voice is loved | **CONFIRMS**, and it's getting louder | About 9 on-topic, 0 against. Most are from 2025–26 and are aimed at *AI* voices | "the voices are using natural non Ai voices" (Ling / Play / 4★ / 2026-09-05) · "'real humans' in the videos and not just AI slop" (Teuida / Play / 5★ / 2026-08-29) · "Using AI for voices for languages that are pitch dependant" (Airlearn / Play / 2★ / 2026-04-29) |
| **C11** | Driving while learning raises safety worries | **CONFIRMS, reshaped** | 4 in the Japanese pool. About 60 across all languages: 31 about Android Auto or CarPlay, and about 6 name danger outright | "It has a driving icon. Don't use it when driving - it's downright dangerous." (Pimsleur / Play / 1★ / 2025-12-01) · "not only a hazard, but illegal to use my phone while driving in my state" (Pimsleur / Play / 3★ / 2023-04-01). **The worry is not listening while driving. The worry is having to touch the phone.** |

**Scorecard:** 7 claims confirmed (C1, C2, C3, C4, C6, C10, C11). One is confirmed with a twist (C7). One is mixed (C9). One could not be tested here (C5). None was flatly overturned.

---

## 3. New themes (not in C1–C11)

**N1. Speech grading that won't hear you is the top complaint about speaking apps.** *(Strong. This backs WordStick's rule that the microphone never grades.)*
Teuida has **416** microphone and recognition complaints in 8,000 reviews (about 5%), Pimsleur has 101 and Airlearn 21. At least 25 of them are about Japanese specifically. The pattern: people love speaking practice, then quit when the app marks a correct answer wrong.
"it never picks up my voice correctly" (Teuida / Play / 2★ / 2025-08-25) · "The AI voice coach is infuriating" (Pimsleur / Play / 3★ / 2025-09-10) · "I DEFINITELY spoke it correctly" (Pimsleur / Play / 5★ / 2023-03-02) · "You can say the right word over and over again, and it doesn't pick it up." (Teuida / Play / 3★ / 2026-08-24)

**N2. Big, unmet demand for Japanese inside Babbel.** About **456** Babbel reviews ask for Japanese or leave because it's missing. Many of these people wanted something *better than Duolingo* and went back to it only because nothing else fit.
"Still no Japanese, three years after my last try" (Babbel / Play / 1★ / 2025-08-31) · "Doesnt have japanese I was hoping to find something better than duolingo" (Babbel / Play / 1★ / 2024-03-09) · "I don't want to go back to Duolingo because I don't like how it works" (Babbel / Play / 3★ / 2026-04-23). *A Babbel-style buyer (pays, wants structure, dislikes Duolingo) who wants Japanese is a ready-made audience.*

**N3. Car integration *is* the commute feature.** People don't just want audio. They want it to start from the car screen without picking up the phone. 31 reviews mention Android Auto or CarPlay, and 55 ask for a "driving mode". Pimsleur gets praise when this works and one-star reviews when it doesn't.
"Can it appear on Android Auto?" (JapanesePod101 / Play / 4★ / 2024-03-04) · "I drive to work and cannot be on my phone for obvious reasons" (Babbel / Play / 4★ / 2020-10-14) · "Open on phone to continue, um if I had phone at hand…" (Pimsleur / Play / 3★ / 2026-01-22)

**N4. Daily lesson caps make free users angry.** Teuida's "one key a day" and Airlearn's "5 lessons a day" limits draw about 38 complaints each (script count). Keen learners want to binge.
"only one key i can get but put 5 keys" (Teuida / Play / 1★ / 2026-08-30) · "Only 5 lessons a day." (Airlearn / Play / 2★ / 2026-04-29)

**N5. Lifetime buyers fear losing access.** About 10 lifetime buyers say their purchase vanished on a new phone, or features were moved behind a new paywall afterwards (Mazii's AI grammar check, Babbel's lifetime terms). *If WordStick ever sells lifetime, "restore purchase" has to be bulletproof.*
"Lifetime subscription (us old timers used to call that \"buying\")" (Mazii / Play / 2★ / 2022-07-21)

**N6. Month-to-month is wanted. Being forced into a year or three months is resented.** Babbel's lack of a monthly plan is a repeated complaint. This is a *warning* about "yearly-first" framing: offer yearly first, but a visible monthly option keeps trust.
"please... please just allow me to pay on a per month basis" (Babbel / Play / 2★ / 2025-09-09)

**N7. When they *are* looking at the screen, they want the words, not a blank player.** Pimsleur's full-screen timer draws hate, and many ask for transcripts.
"I can't stare at a clock 1h a day for years" (Pimsleur / Play / 1★ / 2021-10-23)

**N8. Stop means stop.** "Please make the daily listening lesson end and not auto play" (Pimsleur / Play / 3★ / 2024-07-30). A day's round should end cleanly, which matches WordStick's round-stops-at-30 design.

---

## 4. Money lines (what they call fair and what they call a rip-off)

| Price talked about | Fair or rip-off | Their words |
|---|---|---|
| $8–10 a month | **The price they ask for** | "$21 a month? Give me a tier for $8 a month" (Pimsleur / Play / 3★ / 2026-05-29) · "I think $10 a month would be nice." (Ling / Play / 5★ / 2026-01-15) · "Please consider adding $9.99/ monthly subscription plan" (Babbel / Play / 5★ / 2025-07-13) |
| $15–21 a month (Pimsleur, Speak $18) | **Split.** Fair next to CDs or tutors, too much next to other apps | Fair: "$15 a month compared to $1000 for the CD's?!" (Pimsleur / Play / 5★ / 2020-04-23) · "less than some people pay for streaming services" (Pimsleur / Play / 5★). Rip-off: "$20 a month it's just too much for language apps in 2025" (Pimsleur / Play / 1★ / 2025-03-29) · "$20 a month is out of my budget." (Pimsleur / Play) |
| About $40 a year | Fair, even eager | "$40 per year? I'll take it!" (Airlearn / Play / 4★ / 2026-03-01) · "the most i would pay is 40 for a year" (Pimsleur / Play / 1★ / 2023-02-15) |
| $80–130 a year (Ling, Babbel) | **Rip-off line** | "I won't pay $80 a year" (Ling / Play / 1★ / 2024-11-17) · "okay spending over $100 on an app" (Babbel / Play / 2★ / 2025-09-29, said as *no one I know would be*) |
| $150–300 per Pimsleur level | Rip-off | "Who can afford $150 in this economy" (Pimsleur / Play / 1★ / 2023-12-20) |
| One-time $10–20 (JA Sensei) | **Loved** | "The one time fee of £13 is definitely worthwhile." (JA Sensei / Play / 5★ / 2021-01-30) · "I'd pay $10 for a year and $20 for lifetime." (Ling Japanese / Play / 4★ / 2019-07-12) |
| One-time around $100 | Would pay | "please make $100.00 a one-Time-payment" (Pimsleur / Play / 3★ / 2025-08-19) · "Would pay maybe $100 max." (Pimsleur / Play) |
| Tutor as the comparison | Makes apps look cheap | "Paid $2000 for a private tutor couldn't learn the language." (Pimsleur / Play / 5★ / 2021-06-28) |
| Card-required trial that rolls into a year | **The anger point** | "Free trial is actually $20+ so don't be fooled." (Pimsleur / Play / 1★ / 2024-05-11) · "I subscribed for the 7 day trial, forgot about the app completely" (Babbel / Play / 1★ / 2026-02-04) · "No reminder for end of trial" (Speak / iOS / 1★ / 2024-08-28) |

**What this means for WordStick's prices:** $8.99 a month sits right on the "$8–10" line people name for themselves. $59.99 a year is above the "$40 a year" comfort line but well under the "$80 won't pay" line. The biggest risk is the **card-required trial that becomes a yearly charge**: that pattern produced 111 angry reviews here. A clear end-of-trial reminder, a visible monthly option and an easy cancel are what keep this from turning into the Babbel review page.

---

## 5. Sources

**Google Play listings** (`https://play.google.com/store/apps/details?id=` plus the id):
- Pimsleur: `com.simonandschuster.pimsleur.unified.android`
- Babbel: `com.babbel.mobile.android.en`
- JapanesePod101 / Innovative Language: `com.innovativelanguage.innovativelanguage101`
- Teuida: `net.teuida.teuida`
- Airlearn: `com.unacademy.antonio`
- Ling: `com.simyasolutions.ling.universal`; Ling Japanese: `com.simyasolutions.ling.ja`
- Speechling: `com.speechling.speechling`
- Glossika: `com.glossika.video`, `com.glossika.ai`
- JA Sensei: `com.japanactivator.android.jasensei`
- Phrasebooks: `com.silvermoonapps.learnjapaneselanguageguide`, `com.endevlab.japanesephrasebook`, `com.kpdev.jppb`
- Dictionaries: `jp.takoboto`, `com.mazii.dictionary`

**App Store RSS** (`https://itunes.apple.com/{cc}/rss/customerreviews/page={n}/id={id}/sortby={mostrecent|mosthelpful}/json`):
- Pimsleur `1405735469`
- Babbel `829587759`
- Speak `1286609883`
- Teuida `1457532562`

**Tried and blocked:** amazon.com product and review pages (CAPTCHA and 503), goodreads.com search, book and review pages (bot check and sign-in wall).

**Raw data and scripts** (not in the repo), in `%TEMP%\claude\…\scratchpad\congruence-stores\`: `gp_*.json`, `ios.json`, `jp_all.json`, `jp_hits.json`, `themes.py`, `strict.py`, `allq.py`, `q.txt` (the quote check).
