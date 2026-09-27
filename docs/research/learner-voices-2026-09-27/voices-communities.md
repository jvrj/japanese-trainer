# Learner voices from new communities: congruence check

Date: 27 Sep 2026. Product tested: WordStick (hands-free Japanese words; the app says English, you say the Japanese out loud, then you hear the answer; built for the commute; no review pile; $8.99/mo or $59.99/yr with a card-required 7-day trial; buyer is 35+).

The goal was to check whether claims from the earlier research (Reddit, YouTube, app stores, Audible, the WaniKani and Bunpro forums, HN, Trustpilot) still hold in communities we had not looked at yet. Each piece of evidence is tagged **CONFIRMS**, **CONTRADICTS** or **NEW**.

---

## 1. Scope

| Source | What was collected | Useful learner voices | Notes |
|---|---|---|---|
| Steam reviews (appreviews JSON API, English) | 3,479 reviews across 18 Japanese-learning games: Learn Japanese To Survive (Hiragana, Katakana, Kanji), Shashingo, Wagotabi, Koe, PLAYNESE, Learn Japanese RPG, Let's Learn Japanese (3), Kagami, Nihongo Heroes, Kanji Industry, Kanji Cats, Kanji Training Game, Kanji Drive and others | about 60 | The richest source. "Kanji Sensei" is not on Steam under that name. Koe has only 22 English reviews. |
| Bluesky (api.bsky.app public search) | 1,101 unique posts from 17 searches (e.g. "pimsleur japanese", "duolingo japanese", "japanese commute", "japanese still can't speak") | about 70 | The second-richest source. |
| Mastodon (public hashtag timelines on 4 servers, which federate) | 1,814 posts (#LearnJapanese, #learningjapanese, #JapaneseLearning and others) | about 8 | Mostly teachers and bots posting phrases. Very few learner stories. |
| Lemmy (public search API, 5 instances) | 716 posts and comments | about 6 | Mostly off-topic matches. A few open-source app launches and comments. |
| Japanese Language Stack Exchange (API, main site and meta) | 393 questions, plus answers on 8 method questions | about 4 | The site bans study-method questions (see New themes), so there's little here. |
| Hacker News (Algolia API) | 8 threads not used before, 532 comments. Examples: "Ask HN: take advantage of time spent driving" (114 comments), "Ask HN: became fluent in a second language" (201), "Show HN: Japanese learning app" (117), YapCards voice flashcards, "literal Duolingo Killer" | about 20 | The Issen AI tutor thread was left out because it's already in likes-ai-speaking.md. The 5 threads in voices-elsewhere.md were skipped. |
| Substack comments (public API) | 727 comments from 9 Japanese-related newsletters | about 2 | Almost all come from Real Gaijin, a Japan news newsletter, so they're off-topic. Substack started rate-limiting (429) partway through. |

**Blocked or empty (no workarounds were tried):**
- **Product Hunt**: reviews only load through JavaScript. The plain pages are empty, and the Pimsleur page had no reviews when opened in a browser. Nothing was collected.
- **Tofugu and Tokini Andy**: neither blog has a public comment section any more. Nothing to collect.
- **Migaku community forum**: returned "429 Too Many Requests" every time, so it wasn't pushed. No public Discourse forum was found for Satori Reader or Natively.
- **Bluesky**: `public.api.bsky.app` returned 403, but `api.bsky.app` worked. Asking for a second page of results also returned 403, so each search is capped at about 100 posts.
- **Substack**: rate-limited after about 150 requests. The rest of the Real Gaijin comments weren't fetched, but they were off-topic anyway.

Reddit was not touched. No logins, CAPTCHAs or bot checks were bypassed.

**How the counts work:** each count is a hand-checked piece of evidence, meaning one learner making the point. Keyword hits aren't counted. Where a person is selling something (an app maker or a teacher), the quote is labelled as a maker.

---

## 2. Congruence table

| Claim | Verdict | Count | Quotes (verbatim, under 15 words) |
|---|---|---|---|
| **C1** Learners want to say it out loud (English, then say the Japanese, then hear the answer), and flashcard apps don't do this | **CONFIRMS** | 14 confirm / 3 contradict | "this would be a total blast with mic support and voice recognition!" ([Steam, Kanji Combat](https://steamcommunity.com/profiles/76561197971085858/recommended/759440/)) · "the gap between my japanese reading ability and speaking ability could not be bigger" ([Bluesky](https://bsky.app/profile/genpoe.bsky.social/post/3macfmwy2ss2n)) |
| | | | Against: "chucking in speaking exercises" before you've "even said “konnichiwa”" ([Mastodon](https://howdee.social/@jonspark/114099815495125457)). Speaking too early, with no warm-up, annoys people. |
| **C2** Turning dead time into learning is the top love; audio courses are loved for the commute | **CONFIRMS** (it's loved, but "top" isn't proven here) | 10 confirm / 3 contradict | "Only thing I found that is compatible with driving is the pimsleur stuff" ([Bluesky](https://bsky.app/profile/bennettelder.net/post/3mdqurnjaf22o)) · "it's got a handsfree mode so I can learn while driving" ([Bluesky](https://bsky.app/profile/garfie.zone/post/3lvluj5g73s27)) |
| | | | Against: after years of passive audio, "none of that was a substitute for actually talking to people everyday" ([HN](https://news.ycombinator.com/item?id=12776929)). Here, what people love most is speaking practice. The commute is how they fit it in. |
| **C3** "The app decides, I just show up" is loved | **WEAK CONFIRM** (thin) | 3 confirm / 0 contradict | "an app like duolingo where i get to do daily lessons" ([Bluesky](https://bsky.app/profile/deimosphoibus.bsky.social/post/3mqifctr4l22y)) · "if you aligned it with the JLPT I would subscribe" ([HN](https://news.ycombinator.com/item?id=33829046)) |
| **C4** Pay-once/lifetime is preferred; subscription and trial traps anger people | **MIXED** | 8 confirm / 5 contradict | "No subscriptions, no life system, no ads and no AI. You pay once" ([Steam, Learn Japanese RPG](https://steamcommunity.com/profiles/76561198271919148/recommended/1114950/)) · "without getting stuck in a free trial you forget to cancel" ([Lemmy](https://sopuli.xyz/comment/2779040)) |
| | | | Against: "I’m going to get the monthly sub for the next 4 months" before a trip ([Bluesky](https://bsky.app/profile/onyxminor.bsky.social/post/3mgv3t2pwqs2j)) · "i don't mind if it's paid!" ([Bluesky](https://bsky.app/profile/deimosphoibus.bsky.social/post/3mqifctr4l22y)). People get angry about hidden or forgotten charges, not about paying. Learners with a deadline happily pay monthly. |
| **C5** A review pile burns people out | **CONFIRMS** (mild) | 5 confirm / 2 contradict | "after my Anki burnout I switched to Chinese" ([Bluesky](https://bsky.app/profile/winterwoman112.bsky.social/post/3lo5c2xvjas2o)) · "wanikani (which I completely fell off of)" ([Bluesky](https://bsky.app/profile/clarity.flowers/post/3mro3cgojcs2u)) |
| | | | Against: "8,000 new words and 130,000 reviews over the last 2 years" said with pride ([Bluesky](https://bsky.app/profile/davideager.bsky.social/post/3mkjyhldi4s2y)) |
| **C6** "Years of apps and still can't speak" is the top pain | **CONFIRMS** (strong) | 11 confirm / 0 contradict | "Day 1026 on Duolingo. I still can’t speak Japanese" ([Bluesky](https://bsky.app/profile/rinthpress.bsky.social/post/3lar7a4a2o22w)) · after 800 days: "I absolutely was not learning any Japanese on Duolingo" ([Bluesky](https://bsky.app/profile/adamchristopher.me/post/3mvwl4tobes2g)) |
| **C7** Motivation collapses and people restart | **CONFIRMS** | 9 confirm / 0 contradict | "I'm back into learning Japanese, again, for the millionth time." ([Bluesky](https://bsky.app/profile/garfie.zone/post/3lvluj5g73s27)) · "I try every year and give up" ([Bluesky](https://bsky.app/profile/onidraws.bsky.social/post/3mgqhxl7rls2p)) |
| **C9** Duolingo's forced order, hearts and streak guilt are disliked | **CONFIRMS, with a twist** | 12 confirm / 5 contradict | "that’s literally the only reason he’s using the app" (about a 562-day streak, [Bluesky](https://bsky.app/profile/momomiya.bsky.social/post/3mmkyulqils2m)) · "I can't do this prison-Duolingo shit much longer." ([Bluesky](https://bsky.app/profile/zillathetrill.bsky.social/post/3lyoluikhpk2q)) |
| | | | Against: "every time I try to leave Duolingo" she stops "learning altogether for a year+" ([Bluesky](https://bsky.app/profile/thehanniecorner.bsky.social/post/3mqdfgl6kkc2a)). People dislike the streak, but for many it's the only thing keeping them going. |
| **C10** Robotic TTS is disliked; a warm native voice is loved | **CONFIRMS** | 10 confirm / 2 contradict | "badly AI generated voices can actually hurt your Japanese learning" ([Steam, Wagotabi](https://steamcommunity.com/profiles/76561197971169024/recommended/2701720/)) · "The audio pronunciations from native speakers added an authentic touch" ([Steam, Kanji Combat](https://steamcommunity.com/profiles/76561197999629349/recommended/759440/)) |
| | | | Against: "robotic but clear and easy to understand" ([Steam, Wagotabi](https://steamcommunity.com/profiles/76561197982748375/recommended/2701720/)). Clear beats warm for some people. |
| **C11** Learning while driving raises safety worries | **CONFIRMS** (mostly from non-learners) | 4 confirm / 3 contradict | "Please don't try to do in depth learning while you are driving." ([HN](https://news.ycombinator.com/item?id=13011521)) · "I almost wrecked my car tonight laughing at the Pimsleur" app ([Bluesky](https://bsky.app/profile/rampantcollide.bsky.social/post/3lk7xdeodus22)) |
| | | | Against: language "works better when i'm not able to distract myself" ([HN](https://news.ycombinator.com/item?id=13001565)) |
| **C13** An AI partner that remembers you is wanted; the pain is that it cuts in or won't slow down | **CONTRADICTS** (in these communities) | 2 confirm / 13 contradict | "You shouldn't rely on a chatbot to do a job" native speakers do better ([Bluesky](https://bsky.app/profile/unseenjapan.com/post/3mpaoio4lwd22)) · "it makes mistakes and the student has no way of knowing" ([HN](https://news.ycombinator.com/item?id=43991047)) |
| | | | For: "GPT 4o has been incredibly useful in learning Japanese" ([Lemmy](https://halubilo.social/post/2393761)). Nobody here talked about memory or about being cut off. The AI talk was almost all about distrust. |

---

## 3. New themes

1. **Anti-AI backlash drives people to leave, and it's new since the earlier research.** Long Duolingo streaks were given up over AI, not over difficulty. Examples: "I have just deleted my profile because of the CEO's stance on "AI first"" (2,509-day streak, [Bluesky](https://bsky.app/profile/trans-roll-chan.bsky.social/post/3lwqszi53uk2u)), and "their AI usage to voice lessons made the experience really annoying" ([Bluesky](https://bsky.app/profile/dowser.bsky.social/post/3mvovho6lb22t)). One buyer puts a condition on paying: "i might as well open my wallet if they promise to not use AI translations" ([Bluesky](https://bsky.app/profile/deimosphoibus.bsky.social/post/3mqifctr4l22y)). Makers now advertise "All learning materials 100% AI-free" ([Lemmy](https://sopuli.xyz/post/42079199)), and a Steam reviewer praises a game with "no AI". **What this means for WordStick:** don't lead with "AI". Say "real voices" and "checked words", and keep the AI teacher (Talk) as something people find later, not the headline.
2. **Pimsleur tops out: too few words.** Pimsleur is loved for speaking, but "pimsleur doesn't teach many words (3..5 words per 30 minutes)" ([JLSE meta](https://japanese.meta.stackexchange.com/questions/540/learning-japanese-looking-for-a-better-than-pimsleur-method)), and another learner says "I find it hard at a certain point (maybe 30 lessons in" ([Bluesky](https://bsky.app/profile/mcconnell.bsky.social/post/3mjavhx6rfc2f)). Wanting Pimsleur's speaking style with a much bigger word count is exactly the gap WordStick fills.
3. **When a streak breaks, people go shopping.** "My Duolingo streak reset. What are folks using to learn Japanese" ([Bluesky](https://bsky.app/profile/benlk.com/post/3mt4tvizguc2r)) and "Fuck Duolingo for ruining my streak" ([Bluesky](https://bsky.app/profile/gwopiton.bsky.social/post/3mu3ds6ghbk2s)). A broken streak is when a Duolingo user is most open to switching. That makes it a good hook for ad copy.
4. **Stacking one-off games on top of a free app.** Steam learners often pair a cheap game with Duolingo, and they judge price against subscriptions: "costs less than a month of most subscriptions" ([Steam, Wagotabi](https://steamcommunity.com/profiles/76561198153016183/recommended/2701720/)). The price they have in mind for something bought once is $2 to $20.
5. **Travellers with a deadline accept monthly billing.** The trip buyer plans a set number of months ("monthly sub for the next 4 months"). This backs having a monthly plan for the traveller type even if the yearly plan is shown first.
6. **Free, hands-free competitors through libraries.** "I'm using Mango cuz it's free through my library" and "it's got a handsfree mode" ([Bluesky](https://bsky.app/profile/garfie.zone/post/3lvluj5g73s27)). A hands-free option at $0 already exists for some buyers.
7. **Players ask games to listen.** Several Steam reviewers ask for a microphone mode ("the ability to turn on microphone to practice speaking", [Steam, Shashingo](https://steamcommunity.com/profiles/76561197982872131/recommended/1632490/)). The wish to say it out loud is showing up even in games.
8. **Audio-only learners feel the pull to read.** "I need to lean in to reading though, cuz I'm mostly doing listening" ([Bluesky](https://bsky.app/profile/garfie.zone/post/3lvluj5g73s27)). Kana and kanji shown on the card is worth keeping.
9. **Japanese Language Stack Exchange won't discuss study methods.** Its rules say it is "particularly harsh on "how do I keep myself motivated?"-type questions" ([meta](https://japanese.meta.stackexchange.com/questions/1239/are-questions-about-learning-suitable-for-main)). That's a dead end for research and for marketing.

---

## 4. Sources

**Steam** (review page URLs follow `steamcommunity.com/profiles/<id>/recommended/<appid>/`)
- 759440 Kanji Combat; 438270 Hiragana Battle; 554600 Katakana War; 1632490 Shashingo; 2701720 Wagotabi; 1114950 Learn Japanese RPG; 672430 Koe; 3764890 PLAYNESE; 997720 / 1018900 / 1208030 Let's Learn Japanese; 2340320 Kagami; others listed in scratch `steam_all.json`
- Reviews quoted: [1](https://steamcommunity.com/profiles/76561197971085858/recommended/759440/), [2](https://steamcommunity.com/profiles/76561198271919148/recommended/1114950/), [3](https://steamcommunity.com/profiles/76561197971169024/recommended/2701720/), [4](https://steamcommunity.com/profiles/76561197999629349/recommended/759440/), [5](https://steamcommunity.com/profiles/76561197982748375/recommended/2701720/), [6](https://steamcommunity.com/profiles/76561198153016183/recommended/2701720/), [7](https://steamcommunity.com/profiles/76561197982872131/recommended/1632490/)

**Bluesky**
- https://bsky.app/profile/genpoe.bsky.social/post/3macfmwy2ss2n
- https://bsky.app/profile/bennettelder.net/post/3mdqurnjaf22o
- https://bsky.app/profile/garfie.zone/post/3lvluj5g73s27
- https://bsky.app/profile/deimosphoibus.bsky.social/post/3mqifctr4l22y
- https://bsky.app/profile/onyxminor.bsky.social/post/3mgv3t2pwqs2j
- https://bsky.app/profile/winterwoman112.bsky.social/post/3lo5c2xvjas2o
- https://bsky.app/profile/clarity.flowers/post/3mro3cgojcs2u
- https://bsky.app/profile/davideager.bsky.social/post/3mkjyhldi4s2y
- https://bsky.app/profile/rinthpress.bsky.social/post/3lar7a4a2o22w
- https://bsky.app/profile/adamchristopher.me/post/3mvwl4tobes2g
- https://bsky.app/profile/onidraws.bsky.social/post/3mgqhxl7rls2p
- https://bsky.app/profile/momomiya.bsky.social/post/3mmkyulqils2m
- https://bsky.app/profile/zillathetrill.bsky.social/post/3lyoluikhpk2q
- https://bsky.app/profile/thehanniecorner.bsky.social/post/3mqdfgl6kkc2a
- https://bsky.app/profile/rampantcollide.bsky.social/post/3lk7xdeodus22
- https://bsky.app/profile/unseenjapan.com/post/3mpaoio4lwd22
- https://bsky.app/profile/trans-roll-chan.bsky.social/post/3lwqszi53uk2u
- https://bsky.app/profile/dowser.bsky.social/post/3mvovho6lb22t
- https://bsky.app/profile/mcconnell.bsky.social/post/3mjavhx6rfc2f
- https://bsky.app/profile/benlk.com/post/3mt4tvizguc2r
- https://bsky.app/profile/gwopiton.bsky.social/post/3mu3ds6ghbk2s

**Mastodon**
- https://howdee.social/@jonspark/114099815495125457
- https://urusai.social/@moleSG/114428993108701967
- https://infosec.exchange/@goncalor/116957836631523240

**Lemmy**
- https://sopuli.xyz/comment/2779040
- https://sopuli.xyz/post/42079199
- https://halubilo.social/post/2393761

**Hacker News**
- https://news.ycombinator.com/item?id=13000859 (driving thread): comments 13001565, 13002697, 13009219, 13011521
- https://news.ycombinator.com/item?id=12716549 (fluency thread): comments 12716804, 12776929
- https://news.ycombinator.com/item?id=33822950 (Japanese app): comments 33825939, 33827867, 33829046
- https://news.ycombinator.com/item?id=43990868 (YapCards): comment 43991047
- https://news.ycombinator.com/item?id=46043972, https://news.ycombinator.com/item?id=48671886

**Japanese Language Stack Exchange**
- https://japanese.meta.stackexchange.com/questions/540/learning-japanese-looking-for-a-better-than-pimsleur-method
- https://japanese.meta.stackexchange.com/questions/1239/are-questions-about-learning-suitable-for-main
- https://japanese.stackexchange.com/questions/95692/is-duolingos-pronunciation-decent-or-good

Raw pulls and scripts are in `C:\Users\Julius\AppData\Local\Temp\claude\C--Users-Julius\36a450df-a989-4eed-9c2a-3b31a91bb4e1\scratchpad\congruence-misc\` (steam_all.json, bsky.json, masto.json, lemmy.json, se.json, hn.json, substack.json).
