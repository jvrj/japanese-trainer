# What Japanese learners LIKE about structured beginner apps + immersion tools

Research date: 27 Sep 2026. Group: LingoDeer, Busuu, Memrise, Drops, Mondly, Rosetta Stone, Human Japanese, Japanese!/Obenkyo-style apps, Satori Reader, Migaku, Language Reactor, LingQ, Todaii, NHK Easy, Mochi (Kana/Kanji), plus kana drillers (Kana app, MARU, Luli "Japanese!!"). renshuu is included as a close "Nihongo-style" neighbour. It dominates the Play Store corpus, so its counts are shown separately where they would skew a theme.

## How this was built (so the counts can be trusted or discounted)

- **Store corpus:** 4,920 positive (4–5★) Japanese-relevant reviews, all real text pulled by script:
  - Google Play: `google-play-scraper`, 12 apps, about 10.7k reviews.
  - App Store: the public RSS feed, 15 apps.
  - For multi-language apps (Busuu, Memrise, Mondly, Rosetta, LingoDeer, LingQ), only reviews that mention Japanese, kana, kanji or hiragana were kept.
  - The Satori, Todaii and NHK-Easy App Store feeds came back empty. Web pages cover them instead.
- **Web sources:**
  - All Language Resources reviews
  - Tofugu reviews and database pages
  - Trustpilot (Busuu, Drops, Migaku)
  - Hacker News comments (Algolia API)
  - Chrome Web Store
  - YouTube comments from 7 review videos (`yt-dlp --write-comments`)
  - Reddit was not fetched (it has a bot check).
- **"Mentions"** means the number of positive reviews whose text matches the theme, found by keyword regex. Treat these as rough counts. **"Apps"** means the number of distinct apps where the theme appears. **"Web"** means the number of distinct non-store sources.
- All quotes are verbatim fragments under 15 words. Store quotes link to the app's listing page, because store reviews have no per-review URL.

Store link key:

- GP-LD = play.google.com/store/apps/details?id=com.lingodeer
- GP-DROPS = ...id=com.languagedrops.drops.learn.learning.speak.language.japanese.kanji.katakana.hiragana.romaji.words
- GP-OBK = ...id=com.Obenkyo
- GP-MK = ...id=com.mochimochi.android.an (MochiKanji)
- GP-MKANA = ...id=com.mochimochi.kana
- GP-TOD = ...id=mobi.eup.jpnews (Todaii)
- GP-REN = ...id=com.renshuu.renshuu_org
- GP-MIG = ...id=com.migaku.android
- GP-MEM = ...id=com.memrise.android.memrisecompanion
- GP-BUS = ...id=com.busuu.android.enc
- GP-RS = ...id=air.com.rosettastone.mobile.CoursePlayer
- GP-MON = ...id=com.atistudios.mondly.languages
- AS-KANA = apps.apple.com/us/app/id1454200955
- AS-MARU = apps.apple.com/us/app/id1208009110
- AS-LULI = apps.apple.com/us/app/id1014955564
- AS-MIG = apps.apple.com/us/app/id1664096855
- AS-SAT = apps.apple.com/us/app/satori-reader/id1382950847?see-all=reviews

---

## (1) Like-themes ranked by frequency

### 1. It actually teaches the writing system: kana first, then kanji with writing practice
1,038 mentions across 14 apps. Heaviest in Obenkyo 232, MochiKanji 137, Drops 102, Todaii 89, LingoDeer 60, Kana/MARU/Luli. renshuu adds 312. Web: 3 (Tofugu Drops, Busuu Trustpilot, HN on LingoDeer).
- "finally, i found a very good app to learn hiragana and katakana" (Obenkyo, GP-OBK)
- "Taught me the kana faster than my college courses." (Kana app, AS-KANA)
- "clean design and nicely scaffolded writing practice" (Drops, https://www.tofugu.com/japanese-learning-resources-database/drops/)
- "Great job at introducing Hiragana and Katakana" (Busuu, Dylan Black, https://www.trustpilot.com/review/www.busuu.com?search=japanese)
- "I could swap between Kanji/Katakana/Hiragana at will" (LingoDeer, https://news.ycombinator.com/item?id=16823319)

### 2. Fun without being punished (games, and no hearts or energy)
731 fun/game mentions across 14 apps. Separately, 22 explicit "not punished" mentions, plus Trustpilot and YouTube. Drops 169, MochiKanji 74; renshuu 333.
- "it doesn't scream at me for being wrong like other apps" (Drops, GP-DROPS)
- "you aren't punished for making mistakes" (renshuu, GP-REN)
- "No stupid energy to limit daily study amounts" (Busuu, JJ, https://www.trustpilot.com/review/www.busuu.com?search=japanese)
- "it DOESN'T PUNISH YOU FOR BEING WRONG" (renshuu, YouTube comment, https://www.youtube.com/watch?v=DRpg-s8G8pk)
- "Very fun, actually made me want to keep playing" (Drops, GP-DROPS)

### 3. Free, generous, no ads, and no shouting about paywalls
711 pricing-word mentions. 105 explicit "no ads / free / no paywall" mentions across 11 apps: renshuu 65, Kana app 10, Drops 7, Obenkyo 7, MARU 5.
- "I cannot stress enough how much I love that it is FREE." (Kana app, AS-KANA)
- "has all katakana, hirigana, and kanji without a premium pass" (Obenkyo, GP-OBK)
- "i'm not bombarded by ads or subscription services" (Kana app, AS-KANA)
- "paid level isn't overly marketed" (renshuu, GP-REN)

### 4. The words stick (spaced repetition that feels effortless)
647 mentions across 15 apps: Drops 122, MochiKanji 64, Obenkyo 55, LingoDeer 46; renshuu 228. Web: 2 (Migaku YouTube, HN).
- "the most unique feature is the "Golden Time" algorithm" (MochiKanji, GP-MK)
- "vocabulary is being bolted into my mind almost instantly" (MochiKanji, GP-MK)
- "Duolingo...wasn't helping me remember anything for Japanese" (LingoDeer, GP-LD)
- "the words being from stuff i watch really makes it stick" (Migaku, https://www.youtube.com/watch?v=xaazQKkyBo0)
- "Years later the stuff that I learnt is still as embedded" (Human Japanese, https://news.ycombinator.com/item?id=18548835)

### 5. Cute, charming, beautiful design
350 cute/charm mentions and 481 design/visual mentions across 16 apps: MochiKanji 57, Drops 23+103, MochiKana 17; renshuu 213. Web: 4 (Tofugu LingoDeer, ALR LingoDeer, Tofugu Human Japanese, App Store Satori).
- "The illustrations are very nice and the sound design is even better" (LingoDeer, https://www.tofugu.com/japanese-learning-resources-database/lingodeer/)
- "the colors make me want to keep going" (Drops, GP-DROPS)
- "the most beautifully designed, easy to use/ understand app" (Drops, GP-DROPS)
- "Satori Reader is arranged beautifully" (AS-SAT)
- "Just shows how well an app can be designed…" (MARU, AS-MARU)

### 6. Pictures do the translating
226 mentions across 15 apps: Drops 77, Rosetta 6, MochiKana 6; renshuu 96.
- "I LOVE the images and how simple it is." (Drops, GP-DROPS)
- "You stay in the target language because you are using diagrams and pictures" (Drops, GP-DROPS)
- "learning with pictures and no tranlations !" (Rosetta Stone, https://www.youtube.com/watch?v=DRpg-s8G8pk)
- "the pictures really helped me visualize the alphabet" (MochiKana, GP-MKANA)

### 7. Praise is framed as "better than Duolingo"
285 mentions across 15 apps: LingoDeer 51, Drops 27, Busuu 10; renshuu 134. Web: 5 (HN ×3, YouTube ×2).
- "Much better than Duolingo when it comes to Japanese." (LingoDeer, GP-LD)
- "Duolingo is not good for learning East Asian languages...Try LingoDeer" (https://news.ycombinator.com/item?id=19827026)
- "lingodeer is 100% better than duolingo !" (https://www.youtube.com/watch?v=DRpg-s8G8pk)
- "I switched from Duolingo to Busuu...it's so much better." (https://news.ycombinator.com/item?id=37801626)

### 8. You control what you see: romaji off, furigana on or off, your own kana set
256 mentions across 16 apps: Todaii 70, Drops 28, LingoDeer 22, Obenkyo 20, Kana app 15; renshuu 72.
- "you can choose any combo of English characters, hiragana, and kanji" (LingoDeer, GP-LD)
- "It also allows me to omit romaji" (LingoDeer, GP-LD)
- "turn furigana off etc." (Todaii, GP-TOD)
- "allows custom selections for targeting type of characters" (Kana app, AS-KANA)
- "Satori Reader can hide furigana based on what you've already learnt" (https://news.ycombinator.com/item?id=23020146)

### 9. Native human audio and real people, not AI
358 audio mentions across 14 apps, and 33 explicit "real people / not AI" mentions across 7 apps: LingoDeer 14, Memrise 7, Busuu 4. Web: 6 (Tofugu LingoDeer, ALR LingoDeer, ALR Human Japanese, Tofugu Satori, HN Satori, Busuu Trustpilot).
- "Native speakers ,not AI." (LingoDeer, GP-LD)
- "Being able to see and hear REAL people makes a big difference." (Memrise, GP-MEM)
- "The "Learn with locals" feature sets this application apart" (Memrise, GP-MEM)
- "the voice actors are professional" (Satori Reader, https://www.tofugu.com/reviews/satori-reader/)
- "That's the killer feature of Satori Reader for me." [narration] (https://news.ycombinator.com/item?id=36674773)
- Contrast: "please use real human voices instead of .A.I." (Drops, GP-DROPS)

### 10. Clear, warm explanations of why
141 mentions in the store corpus, but the theme dominates the web sources for structured apps: LingoDeer 28, Obenkyo 18, Busuu, Bunpo. Web: 9 (ALR ×3, Tofugu ×2, HN ×2, Trustpilot, YouTube).
- "Clear and detailed notes on grammar and culture." (Busuu, KV, https://www.trustpilot.com/review/www.busuu.com?search=japanese)
- "Human Japanese is great for gentle explanations of grammar" (https://news.ycombinator.com/item?id=16827827)
- "The casual conversational tone of the writing keeps it from ever becoming too dull." (Human Japanese, https://www.alllanguageresources.com/human-japanese/)
- "like talking to me directly. Like a friend telling you not to worry" (Obenkyo, GP-OBK)
- "Now I use it mostly to look up grammar because I like the explanations." (LingoDeer, https://www.youtube.com/watch?v=JxSpN5h6Aw0)
- "The care put into each explanation and note is where Satori Reader shines" (https://www.tofugu.com/reviews/satori-reader/)

### 11. Real content and context: news, stories, your own shows
301 mentions across 8 apps: Todaii 159, LingoDeer 28, Migaku 16. Web: 8 (Satori ALR/Tofugu/App Store, Migaku HN/YouTube, Language Reactor Chrome, NHK Easy HN ×2).
- "It's the first time I've been motivated to try read the news in Japanese." (Todaii, GP-TOD)
- "NHK easy is such a fantastic resource." (https://news.ycombinator.com/item?id=37842723)
- "every single word and phrase has been annotated with detailed explanations" (Satori, AS-SAT)
- "made it a zero friction and even fun experience" (Migaku, https://news.ycombinator.com/item?id=42772783)
- "You get a double translation subtitle" (Language Reactor, https://chromewebstore.google.com/detail/language-reactor/hoombieeljmmljlkjmnheibnpciblicm/reviews)

### 12. Short sessions and "a few minutes a day"
137 mentions across 11 apps, 100 of them Drops. Loosely matched, the count is 268. Web: 2 (ALR Drops, HN).
- "Spend 5 minutes learbing, so you don't get burnt out." (Drops, GP-DROPS)
- "The 5 min timer takes away the overwhelm" (Drops, GP-DROPS)
- "The 5-10 minutes a day...a perfect pace for long-term retaining." (Drops, GP-DROPS)
- "only 5 minutes every 10 hours actually has helped me stick at it" (Drops, GP-DROPS)
- "Good app to learn kanji daily whenever you have a little bit of free time." (MochiKanji, GP-MK)

### 13. Structure: a real curriculum that builds step by step
198 mentions across 10 apps: LingoDeer 30, Drops 19, Obenkyo 15, Rosetta 9. Web: 5 (ALR Human Japanese, HN LingoDeer ×2, YouTube LingoDeer, Busuu Trustpilot).
- "The material builds on itself in a logical way." (Human Japanese, https://www.alllanguageresources.com/human-japanese/)
- "that feeling of a classroom lesson" (LingoDeer, https://news.ycombinator.com/item?id=33929965)
- "The content is very well organized." (LingoDeer, 146 likes, https://www.youtube.com/watch?v=JxSpN5h6Aw0)
- "New vocabulary / grammar is introduced methodically rather than unexpectedly." (LingoDeer, GP-LD)
- "Structured approach makes complex language manageable." (Busuu, A.C.B, Trustpilot)

### 14. The makers answer you
139 mentions across 14 apps: Todaii 20, Obenkyo 14, MochiKanji 10, Migaku 7, LingoDeer 7; renshuu 56. Web: 2 (Satori ALR and App Store).
- "Devs are very friendly and helpful." (MochiKanji, GP-MK)
- "almost every review has a response from the dev" (renshuu, GP-REN)
- "Questions are extensively answered by the staff" (Satori, https://www.alllanguageresources.com/satori-reader-review/)
- "Developer resolved my issue immediately!" (MochiKana, GP-MKANA)

### 15. Low pressure, at my own pace
100 mentions across 8 apps (renshuu 64).
- "I luv it:) and it's so cute not stressful" (MochiKanji, GP-MK)
- "introduce me to the language in a relaxed and enjoyable way" (Drops, GP-DROPS)
- "Sometimes I can do a 15 minute lesson, other times...45" (Migaku, AS-MIG)

### 16. Speaking out loud, and hands-free modes
247 speaking mentions. Hands-free or commute use is rare but pointed: about 6 reviews.
- "I absolutely adore the hands-free lessons...lying in bed" (Mondly, GP-MON; the review's language isn't stated, likely not Japanese)
- "wanted to use mondly while walking" (Mondly, Japanese learner, GP-MON; it also had trouble recognising speech)
- "I use it on commute every morning" (renshuu, GP-REN)
- "Great app for doing sentence mining while commuting" (Migaku, GP-MIG)
- "Seeing a picture, hearing the pronunciation...practicing out loud to myself" (Rosetta, GP-RS)

### 17. Offline
36 mentions, 7 apps, mostly Obenkyo.
- "lots of completely FREE and OFFLINE learning materials" (Obenkyo, GP-OBK)
- "has everything i need in such a small size and offline too" (Obenkyo, GP-OBK)
- Contrast: "you can't use it offline" (Drops free tier, GP-DROPS)

### 18. Seeing your own stats and weak spots
19 mentions, almost all Kana app.
- "the different colors on the charts to tell me what I need to work on" (Kana app, AS-KANA)
- "The way the app shows stats is awesome and keeps me motivated" (Kana app, AS-KANA)

---

## (2) Why they pay

1. **Lifetime or one-time pricing.** This is the most common purchase trigger in the corpus: LingoDeer, Drops, Todaii, Migaku, Mondly and renshuu.
   - "it's a one time payment and it comes with so many lessons" (LingoDeer, GP-LD)
   - "the lifetime license was absolutely worth it!" (Drops, GP-DROPS)
   - "loved it so much ended up paying for lifetime within a month" (renshuu, GP-REN)
   - "a lifetime subscription for a one-time fee that costs less than two annual" (LingoDeer/Rosetta, https://news.ycombinator.com/item?id=24426904)
   - Contrast: "the single language lifetime option has been removed." (Drops, GP-DROPS)
2. **The free first section sold them.**
   - "tried out the first free lessons and was convinced right away" (LingoDeer, GP-LD)
   - "LingoDeer is the first I've wanted to purchase the full mode for." (GP-LD)
3. **To remove a time cap they had come to like.** Drops' 5 minutes both hooks them and annoys them.
   - "Buy the subscription, it Is worth the money (no ads, unlimited time etc)." (GP-DROPS)
4. **Promos and discounts.** People wait for them.
   - "wait for the promo offer...The discount is worth the wait!!" (Drops, GP-DROPS)
   - "Very reasonable discount price offered." (Busuu, Dave, Trustpilot)
   - "a one time payment with 50% discount" (LingoDeer Plus, https://news.ycombinator.com/item?id=27715961)
5. **One tool replaces several.**
   - "it's replaced my subscriptions with Du, Language Reactor, Satori Reader, and Linkq" (Migaku, GP-MIG)
   - "worth every penny" (Migaku, GP-MIG)
6. **Human expertise on tap.**
   - "detailed, thoughtful responses...alone worth the price of admission" (Satori; per search snippet quoting the Tofugu review, https://www.tofugu.com/reviews/satori-reader/). Treat as reviewer paraphrase-risk.
7. **Serious goal or deadline.**
   - "Planning a trip to Japan...so I got this app" (LingoDeer, GP-LD)
   - "Bought the app to learn Japanese before travelling to Japan." (Mondly, GP-MON)
8. **"The only app I'm paying for."**
   - "It is the only app I am paying for." (Memrise, GP-MEM)

## (3) Why they stay or come back

- **Short sessions leave them wanting more.**
  - "every time it ends I end up wanting to learn more !" (Drops, GP-DROPS)
- **A forgiving streak.**
  - "I love that they have added the ability to keep your streak if you accidentally miss one day!" (Drops, 3+ years daily, GP-DROPS)
- **Memory survives a break.**
  - "I couldn't play for several months but after a short review, I remembered almost everything." (LingoDeer, GP-LD)
  - "picked it up again recently" (LingoDeer, GP-LD)
- **The app tells them when to come back.**
  - "the app always reminds you to review what you have learnt" (MochiKanji Golden Time, GP-MK)
- **Real-world payoff.**
  - "Quick update: this app made me look good." (Drops, after a dinner with Japanese customers, GP-DROPS)
- **Content they chose.**
  - "it hasn't become boring at all, its kept it fun and relevant to me" (Migaku, https://www.youtube.com/watch?v=xaazQKkyBo0)
  - "WaniKani got boring for me after like 16 levels" (same comment, contrast)
- **Fresh content every day.**
  - "The news is updated quickly." (Todaii, GP-TOD)
  - NHK Easy "updates daily" (https://www.tofugu.com/japanese-learning-resources-database/nhk-news-web-easy/)
- **Habit formation.**
  - "Feels like I can make this a habit where Anki a[...]" (Migaku, GP-MIG)
  - "Migaku helps with consistency." (AS-MIG)
- **Social pull.**
  - "the competitive nature in us kicked in" (Memrise, https://news.ycombinator.com/item?id=27671543)
- **Visible growth.**
  - "as your japanese skill grows your little pet grows" (renshuu, GP-REN)

## (4) Small delightful details

- MARU: "showing you ads only when you get something wrong - that was a great motivator!" (AS-MARU)
- LingoDeer's 50-sound chart: "provides the pronunciation of all of them with just a tap" (GP-LD)
- MochiKanji "Golden Time": "Exactly knowing where each word stands in my memory, that is genius!" (GP-MK)
- Drops varies the card format: "the way the word is shown is changed up as you learn" (GP-DROPS)
- Todaii: "audio playback control of news easy to speed up slow down" (GP-TOD)
- Language Reactor: "hotkeys to move back n forth to subtitled moments" (Chrome store). It can also blur the target line so you listen first (languavibe/classcentral).
- Kana app: "use the "lowest streak" option" to drill your weakest kana (AS-KANA)
- Memrise: "I like you have different people say the same pronunciations." (GP-MEM)
- Rosetta: pronunciation grading "also has adjustable Leniency" (GP-RS)
- renshuu: "stop in the middle of a test and still have you progress counted" (GP-REN)
- Satori: hides furigana for kanji you already know (HN 23020146). You can also see "how previous readers rated the difficulty" (ALR Satori).
- Drops: "hearing the native speaker reenforces memorization" (GP-DROPS)
- Busuu: "Happy sounds after correct answers encourage learning." (Elliot Louie, Trustpilot)

## (5) What WordStick could borrow (one line each, honest)

- **Sell the cap as a feature.** Drops users love that 5 minutes "takes away the overwhelm". WordStick's round that stops at 30 can say so out loud.
- **Name the next-morning check the way Mochi named "Golden Time".** Users praise the named timing and the reminder, not "SRS".
- **Keep a streak that forgives one missed day.** This is Drops' most-thanked retention detail. It fits the unbreakable-day-streak honesty rule if it is labelled plainly.
- **Human voices are a selling point.** "Native speakers, not AI" is praised often, and AI voice is attacked (Drops). If WordStick uses TTS, this is a real gap to be honest about.
- **No hearts, no energy, no scolding.** "Not punished" is praised across 5 or more apps. WordStick already does this, so say it in the copy.
- **Offer a lifetime tier priced under two years of annual.** It is the most-cited reason people paid. This is in tension with the locked $59.99/yr-first plan, so the owner decides.
- **A free first section that convinces before asking** is LingoDeer's documented path to paying. The card-required trial cuts against this, and that is worth knowing.
- **Tap-to-hear kana chart** (LingoDeer). It is cheap to build and much loved.
- **"Weakest words" drill** (Kana app's lowest-streak option) as an explicit button.
- **Playback speed control on the spoken word** (Todaii). This matters for audio-led, hands-free use.
- **Answer every review publicly.** renshuu's and Satori's responsiveness is itself cited as a reason to love and pay.
- **Collect real-world payoff stories** ("this app made me look good") for ads, and don't claim more than they show.
- **Treat hands-free and commute as an open lane.** Only about 6 reviews in 4,920 mention it, and Mondly's hands-free mode stumbles on speech recognition. The lane is under-served but not proven to be demanded.
- **Don't copy:** Drops-style paywall nagging ("constant ads for lifetime"), or Migaku-style bugs at €250 lifetime (Trustpilot). Both are the flip side of what users like.

## (6) Sources

Store listings (review corpora pulled by script; counts are 4–5★ Japanese-relevant):
1. https://play.google.com/store/apps/details?id=com.lingodeer
2. https://apps.apple.com/us/app/lingodeer-learn-languages/id1261193709
3. https://play.google.com/store/apps/details?id=com.languagedrops.drops.learn.learning.speak.language.japanese.kanji.katakana.hiragana.romaji.words
4. https://apps.apple.com/us/app/learn-japanese-language-drops/id1227950969
5. https://play.google.com/store/apps/details?id=com.Obenkyo
6. https://play.google.com/store/apps/details?id=com.mochimochi.android.an
7. https://apps.apple.com/us/app/id1463353686 (MochiKanji)
8. https://play.google.com/store/apps/details?id=com.mochimochi.kana
9. https://apps.apple.com/us/app/id1672956785 (MochiKana)
10. https://play.google.com/store/apps/details?id=mobi.eup.jpnews (Todaii)
11. https://play.google.com/store/apps/details?id=com.renshuu.renshuu_org
12. https://apps.apple.com/us/app/id1542730063 (renshuu)
13. https://play.google.com/store/apps/details?id=com.migaku.android
14. https://apps.apple.com/us/app/migaku-really-learn-languages/id1664096855
15. https://play.google.com/store/apps/details?id=com.memrise.android.memrisecompanion
16. https://apps.apple.com/us/app/id635966718 (Memrise)
17. https://play.google.com/store/apps/details?id=com.busuu.android.enc
18. https://apps.apple.com/us/app/id379968583 (Busuu)
19. https://play.google.com/store/apps/details?id=air.com.rosettastone.mobile.CoursePlayer
20. https://apps.apple.com/us/app/id435588892 (Rosetta Stone, CA feed)
21. https://play.google.com/store/apps/details?id=com.atistudios.mondly.languages
22. https://apps.apple.com/us/app/id987873536 (Mondly)
23. https://apps.apple.com/us/app/id1454200955 (Kana – Hiragana and Katakana, GB feed)
24. https://apps.apple.com/us/app/id1208009110 (MARU)
25. https://apps.apple.com/us/app/id1014955564 (Japanese!! Learn Kana & Kanji, Luli)
26. https://apps.apple.com/us/app/id1279720052 (Bunpo)
27. https://apps.apple.com/us/app/satori-reader/id1382950847?see-all=reviews&platform=iphone

Review sites / editorial:
28. https://www.alllanguageresources.com/lingodeer/
29. https://www.alllanguageresources.com/human-japanese/
30. https://www.alllanguageresources.com/satori-reader-review/
31. https://www.alllanguageresources.com/lingq/
32. https://www.alllanguageresources.com/language-drops-app/
33. https://www.tofugu.com/japanese-learning-resources-database/lingodeer/
34. https://www.tofugu.com/japanese-learning-resources-database/human-japanese/
35. https://www.tofugu.com/japanese-learning-resources-database/drops/
36. https://www.tofugu.com/japanese-learning-resources-database/migaku/
37. https://www.tofugu.com/reviews/satori-reader/
38. https://www.tofugu.com/japanese-learning-resources-database/nhk-news-web-easy/
39. https://www.trustpilot.com/review/www.busuu.com?search=japanese
40. https://www.trustpilot.com/review/languagedrops.com
41. https://www.trustpilot.com/review/migaku.com
42. https://chromewebstore.google.com/detail/language-reactor/hoombieeljmmljlkjmnheibnpciblicm/reviews

Hacker News comments:
43. https://news.ycombinator.com/item?id=16827827 (Human Japanese vs Memrise vs Duolingo)
44. https://news.ycombinator.com/item?id=18548835 (Human Japanese stuck)
45. https://news.ycombinator.com/item?id=13685327 (Satori "most enjoyable experience")
46. https://news.ycombinator.com/item?id=36674773 (Satori narration killer feature)
47. https://news.ycombinator.com/item?id=23020146 (Satori hides furigana)
48. https://news.ycombinator.com/item?id=16823319 (LingoDeer curriculum)
49. https://news.ycombinator.com/item?id=33929965 (LingoDeer classroom feel)
50. https://news.ycombinator.com/item?id=19827026 (Try LingoDeer for Japanese)
51. https://news.ycombinator.com/item?id=24426904 (lifetime pricing)
52. https://news.ycombinator.com/item?id=27715961 (LingoDeer Plus one-time 50%)
53. https://news.ycombinator.com/item?id=37801626 (Busuu > Duolingo for Japanese)
54. https://news.ycombinator.com/item?id=42772783 (Migaku zero friction)
55. https://news.ycombinator.com/item?id=37842723 (NHK Easy fantastic)
56. https://news.ycombinator.com/item?id=27671543 (Memrise class competition)

YouTube comment threads:
57. https://www.youtube.com/watch?v=DRpg-s8G8pk (tier list, 400 comments)
58. https://www.youtube.com/watch?v=JxSpN5h6Aw0 (LingoDeer by Japanese teacher)
59. https://www.youtube.com/watch?v=jtBVKP7X7rs (LingoDeer review)
60. https://www.youtube.com/watch?v=EP8mES6A0hg (native tries Drops)
61. https://www.youtube.com/watch?v=KyyPEsy_2Pw (Migaku review)
62. https://www.youtube.com/watch?v=xaazQKkyBo0 (2-month Migaku)
63. https://www.youtube.com/watch?v=XKix8s1ZPWw (Human Japanese review)

Raw data kept in scratchpad `rev/` (gplay.json, appstore.json, hn.txt, yt_*.info.json, themes.txt) for re-counting.
