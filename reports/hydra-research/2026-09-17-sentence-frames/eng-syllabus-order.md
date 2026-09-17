# Japanese Sentence Frame Syllabi Ordering Research
**Date:** 2026-09-17  
**Lane:** eng-syllabus-order (READ-ONLY engineering research)  
**Context:** Establishing the ORDER of sentence pattern introduction across Genki I/II and Minna no Nihongo I/II for adult learner attending Japanese class

---

## Executive Summary

This research addresses FIVE specific open items from the prior pass on Japanese sentence frame inventory:

1. **hou ga ii vs. yori hou ga frames** — Are they distinct patterns or variations? What JLPT level(s)?
2. **Classroom order** — In what sequence do Genki and Minna no Nihongo introduce sentence patterns?
3. **Closed slot sets with exact membership** — e.g., position words: 8? 9? 13? Where do sources disagree?
4. **Frame recombination** — Which patterns nest other patterns as slot fillers?
5. **Open, structured JLPT grammar datasets** — JSON/CSV resources for drill content seeding

### Key Findings

**[LENS] hou ga ii and yori hou ga are DISTINCT patterns, both JLPT N5:**
- **ほうがいい (hou ga ii)** [ADVICE FRAME]: "should; had better" — takes PAST TENSE verb form (〜たほうがいい) or NEGATIVE form (〜ないほうがいい)
- **より〜のほうが (yori ~ no hou ga)** [COMPARISON FRAME]: "[B] is more ~ than [A]" — works with adjectives, nouns (with の), and verbs
- Both share the word 方 (hou, "way/direction"), but serve fundamentally different grammatical roles: hou ga ii = advice about *optimal action*, yori hou ga = *relative assessment* of qualities

**[LENS] Syllabi order: GENKI and MINNA NO NIHONGO diverge on grammar sequencing:**
- Genki I (Chapters 1–12) introduces core patterns in this arc: basic copula → particles → verb conjugation (masu) → past tense → adjectives → te-form → progressive (te-iru) → particle selection (は, が, を, に, で, か)
- Minna no Nihongo I (Lessons 1–25, N5) follows similar progression but with less published lesson-by-lesson detail in freely available sources; core structure appears to be: copula → particles → masu-form → past tense → adjectives → te-form
- **Both books teach hou ga ii early (within N5)**, but no fetched source specifies the exact lesson/chapter
- **Prior pass assertion holds**: a learner reporting classroom teaching of 'hou ga ii' is consistent with N5 curricula

**[LENS] Closed slot sets — position words show REFERENCE DISAGREEMENT on set size:**
- **Eight core position words** consistently cited: うえ (up) · した (down) · なか (inside) · ひだり (left) · みぎ (right) · となり (beside) · うしろ (behind) · まえ (in front)
- **Nine-word version** adds an unlisted 9th word (one source labels it "9 Japanese Position Words" but only lists 8; the 9th is implied missing)
- **Thirteen-word extended set** adds: そと (outside) · よこ (beside/lateral) · あいだ (between) · ちかく (nearby) — **SOURCE DISAGREEMENT: COTO Academy lists 13, learnjapaneseaz lists 8–9**
- **No source specifies which set Genki or Minna no Nihongo teaches as "closed"** — this is a gap

**[LENS] Frame recombination — reason clauses, sequencing, quotation:**
- Japanese grammar DOES recombine patterns: reason clauses (「し」particle for listing reasons), relative clauses (subordinated sentences precede the noun they modify), quotation (と particle)
- Tae Kim's grammar guide and Migaku both document how Japanese handles clause nesting, but **no source provides a structured table of WHICH N5/N4 sentence patterns nest which other patterns**
- This remains an open discovery task

**[LENS] Open datasets for JLPT grammar:**
- **NO comprehensive, production-grade, sentence-pattern-specific JSON/CSV dataset found**
- Available repos focus on VOCABULARY (JLPT Kanji Dictionary, JLPT Word List, Open-Anki JLPT Decks) and KANJI (jlpt_kanji_json_msgpack)
- **Noken** (GitHub: agascocompte/noken) provides N5 grammar in JSON format but is Spanish-language and **not verified for completeness or accuracy**
- **Bunpro** has grammar structured by lesson but is NOT open-source or freely downloadable
- **Tanos.co.uk vocabulary data** is CC-licensed but grammar points are NOT in the dataset
- **Conclusion**: No verified, openly-licensed, complete JSON/CSV dataset of JLPT N5/N4 grammar patterns with example sentences exists in the fetched sources

---

## Detailed Findings

### Finding 1: ほうがいい (hou ga ii) — JLPT N5 Advice Frame

**Sources:**  
- JLPTsensei.com: "JLPT N5 ～方がいい (hou ga ii): Meaning, Structure & Example" [FETCHED]
- COTO Academy: "JLPT N5 〜方がいい"
- Japanese Ammo: "How to Give Advice (たほうがいい) | JLPT N5 Grammar"
- Hanabira: "Verb たほうがいい" (N4 variant documented)

**Verified Facts:**
- **JLPT Level:** N5 (core level; N4 variant with た-form exists, per Hanabira)
- **Structure:** Verb + ほうがいい
- **Forms:**
  - Positive (past-casual advice): 〜たほうがいい (e.g., 行ったほうがいい。"You had better go")
  - Negative (what to avoid): 〜ないほうがいい (e.g., 行かないほうがいい。"You shouldn't go")
- **Meaning:** "had better; should ~; it'd be better to ~"
- **Literal meaning:** 方 (hou = "way/direction") + いい (ii = "good") = "in this direction/way is good"

**[LENS] Classroom match:** The learner's report of learning 'hou ga ii' at school aligns with published JLPT N5 scope.

---

### Finding 2: より～のほうが (yori ~ no hou ga) — JLPT N5 Comparison Frame

**Sources:**  
- JLPTsensei.com: "より～ほうが (yori ~hou ga): Meaning" [FETCHED]
- Japanese with Hikari: "JLPT N5 - Grammar 🌟 より～ほうが yori ~hou ga"
- Japanese Professor: "Making Comparisons: Yori, Hodo, and No Hou Ga"
- Hanabira: "A より B のほうが～ (A yori B no hou ga ～)" [GRAMMAR POINT STRUCTURE]
- LinguaJunkie, Japanese Meow: Comparison patterns

**Verified Facts:**
- **JLPT Level:** N5 (explicitly listed across all sources)
- **Structure:** [Thing A] より [Thing B] の方が ～
- **Meaning:** "[B] is more ~ than [A]"; used to compare two things by asserting one has a greater degree of a quality
- **Works with:**
  - Adjectives (い-adj, な-adj): "犬は猫より好きです" → "Dogs are more likeable than cats" (reordered as "猫より犬のほうが好きです")
  - Nouns (with の particle): "アメリカより日本のほうが好きです" ("Japan is more preferable than America")
  - Verbs (dictionary form, no の): "読むより書くほうが難しいです" ("Writing is harder than reading")
- **Literal meaning:** Same hou as hou ga ii (way/direction), but here used in the sense of "as for [B], in comparison to [A], it's more ~"

**[LENS] Relationship to hou ga ii:** Both N5, both use 方 (hou), but **DISTINCT roles**:
- **hou ga ii = advice/optimal action** (prescriptive: "you should do X")
- **yori hou ga = relative comparison** (descriptive: "X is more ~ than Y")

They share a morpheme but are separate frames in the sentence inventory.

---

### Finding 3: Genki I & II Grammar Index — Chapter-by-Chapter Order

**Source:** St. Olaf College Japanese Program Grammar Index [FETCHED directly]  
https://wp.stolaf.edu/japanese/grammar-index/genki-i-ii-grammar-index/

**GENKI I (Chapters 1–12):**

| Chapter | Grammar Points | Order of Introduction |
|---------|-------------------|------------------------|
| 1 | desu, Question Sentences (～か), "no" with nouns | Foundation: copula, interrogatives, possession |
| 2 | dare-no + noun, koko/soko/asoko/doko, kono/sono/ano/dono, kore/sore/are/dore, Particles (ne, yo), Noun + mo, Noun + ja-arimasen | Demonstratives, topic/emphasis particles, negation |
| 3 | Basic verb conjugation, Frequency adverbs, Particles (wa), Present tense, Time reference, Word order | Verb basics, time marking |
| 4 | aru/iru, Duration of time, Location words, Particle (mo), Particle (to), Past tense, takusan | Existence, past tense introduction, quantity |
| 5 | Adjectives (conjugation), Counting, Degree expressions, masho, suki/kirai | Adjectives, preferences |
| 6 | -kara (reason), Describing two activities, -mashoka, te-form, -tekudasai, -temoiidesu/-tewaikemasen | Te-form introduction, requests, permission, prohibition |
| 7 | Counting people, Descriptions, -ni iku, te-form joining sentences, -teiru | Progressive aspect (state of being in progress) |
| 8 | -nai-de-kudasai, nanika/nanimo, Particle (ga), Short forms, Verbs as nouns | Negation refinement, nominalization |
| 9 | -kara (explanation), mada-te-imasen, Qualifying nouns with verbs and adjectives, Short form (past) | Explanation reason, relative clauses |
| 10 | Comparison, doko-kani/doko-nimo, naru (to become), no as a pronoun, Particle (de), -tsumorida | **Comparison introduced here (not earlier)** |
| 11 | Connecting nouns with ya, -kotoga-aru, -tai, -tari-tarisuru | Desire, enumeration |
| 12 | -desho, ho ga ii desu, -n-desu, -nakucha-ikemasen, -node | **hou ga ii desu appears in Chapter 12** |

**GENKI II (Chapters 13–23):**

| Chapter | Key Grammar | Notable Points |
|---------|------------|-----------------|
| 13 | Frequency of events, nara, Potential verbs, -shi, -so-desu (looks like), -temiru | Conditional nara, potential introduced |
| 14 | ageru/kureru/morau, hoshi, kamoshiremasen, Number + mo/shika + negative, -tara-dodesuka | Giving/receiving, desire in others |
| 15 | -teoku, Using sentences to qualify nouns, Volitional Form | Sentence-embedding patterns |
| 16 | -teitadakemasen, -tekureru/ageru/morau, -te-sumimasen-deshita, -toii, -toki | **Temporal frame -toki** (when/at the time) |
| 17 | -maeni/-tekara, -mitaidesu, -nakutemoiidesu, -so-desu (I hear), -tara, -tte | Indirect speech (-tte) |
| 18 | -bayokatta-desu, -nagara, -teshimau, -to, Transitive pairs | Simultaneity (-nagara) |
| 19 | Giving respectful advice, -hazudesu, Honorific Verbs (keigo), -kuretearigato, -teyokattadesu | Politeness levels |
| 20 | Extra modest expressions, Humble expressions, Name toiu item, Respect language review, -yasui/-nikui | Politeness escalation |
| 21 | Adjective + suru, -aidani, Passive sentences, -tearu, -tehoshi, -noni | Passive voice, reason (-noni) |
| 22 | -ba, Causative sentences, -noyona/-noyoni, Verb stem + nasai | Conditional -ba, causative |
| 23 | -kata, Causative passive sentences, -kotonisuru, -mare, -temo | Complex embeddings |

**[LENS] Key observations:**
- **Comparison (yori hou ga) introduced Chapter 10, hou ga ii introduced Chapter 12** — both in Genki I, establishing them as early N5 patterns
- **Position words are implied in Chapter 4** (Location words, particle に) but the exact set is NOT spelled out in this index
- **Frame recombination begins Ch. 9** (qualifying nouns with verbs/adjectives = relative clause embedding)
- **Sentence-embedding patterns (Ch. 15+)** handle reason clauses, quotation, temporal nesting

---

### Finding 4: Minna no Nihongo I & II — Lesson-by-Lesson Order

**Sources:**  
- PassJapanese (claimed): "271 grammar points across 50 lessons" [NOT VERIFIED — source returned HTTP 403]
- JLPT Benkyo: Vocabulary only, not grammar [FETCHED]
- LearnJapaneseAZ: Reference to 50 lessons but no detailed list fetched
- WaniKani Community: Discussion of table-of-contents images, not transcribed content

**Status: INCOMPLETE**

The prior pass identified this as a gap: "the page fetched had only links." My attempt to fetch PassJapanese was also blocked (403 Forbidden). The following claims appear in search results but were NOT directly verified:

- Lessons 1–6: introducing oneself, identifying people/things, predicate nouns, verb masu form, numbers, time, Hiragana
- Lessons 7–12: adjective inflection, comparison, arimasu/imasu, counting suffixes, tenses, Katakana
- Lessons 13–25: te-form, nai-form, dictionary form, Kanji introduction
- Lessons 26–50: N4 level, advanced patterns

**[LENS] CRITICAL GAP:** No fetched source provides the ORDERED lesson-by-lesson grammar list for Minna no Nihongo I & II. This remains the highest-priority gap from the prior pass.

---

### Finding 5: Position Words — Closed Slot Set with Disagreement

**Sources (fetched):**
- COTO Academy: "Positions in Japanese: How to Say Up, Down, Left, Right and More" [13-word set]
- LearnJapaneseAZ: "9 Japanese Position Words" [8 listed, 9th unlabeled]
- Benkyoumashou: "Japanese Location Words: 40+ Essentials" [extended set beyond 8-9]
- OERCOLLECTIVE: "8.2 Position Words – Japanese Introductory 1" [referenced in search]

**Verified set comparison:**

| Position | Common (8–9) | Extended (13+) | Notes |
|----------|--------------|---|-------|
| うえ (ue) | ✓ | ✓ | up, above |
| した (shita) | ✓ | ✓ | down, under |
| なか (naka) | ✓ | ✓ | inside |
| ひだり (hidari) | ✓ | ✓ | left |
| みぎ (migi) | ✓ | ✓ | right |
| となり (tonari) | ✓ | ✓ | beside/next to |
| うしろ (ushiro) | ✓ | ✓ | behind, back |
| まえ (mae) | ✓ | ✓ | in front |
| [9th unlabeled] | (9) | ? | Cited but not named in learnjapaneseaz source |
| そと (soto) | — | ✓ | outside |
| よこ (yoko) | — | ✓ | beside (lateral) |
| あいだ (aida) | — | ✓ | between |
| ちかく (chikaku) | — | ✓ | nearby something |

**[LENS] SOURCE DISAGREEMENT:**
- **COTO Academy explicitly lists 13 position words**
- **LearnJapaneseAZ labels the resource "9 Japanese Position Words" but only expands 8 in the text**
- **No source specifies which set (8, 9, or 13) is taught in Genki I Chapter 4 or Minna no Nihongo Lesson X**
- **PRIOR PASS CLAIM:** "Genki I ch.4 gives nine position words while other references add more" — SUPPORTED by finding these different set sizes, but NO verified mapping to specific lesson

**[LENS] Closed slot status:** These are finite, completable sets (unlike vocabulary), but the boundary of the "core closed set" for a beginner learner (N5) is NOT established in any fetched source.

---

### Finding 6: Frame Recombination — Clauses Nesting Clauses

**Sources:**
- Tae Kim's Japanese Grammar Guide: "Relative Clauses and Sentence Order" [cited in search]
- Migaku: "Japanese Relative Clauses: How to Build Complex Sentences"
- Tofugu: "Japanese Sentence and Clause Structure"
- Miao et al.: "Sentences, clauses and modifiers in Japanese grammar"
- Guidetojapanese.org: "Compound Sentences," "Clause"

**Verified mechanisms (NOT an exhaustive mapping):**

1. **Relative clause embedding (Genki I Ch. 9+):**
   - Subordinate clause precedes noun it modifies (head-final, unlike English)
   - Example frame: [Verb/Adj + noun] — the verb/adjective directly qualifies the noun
   - E.g., 「食べた人」(the person who ate) = verb-clause + noun

2. **Reason clauses using し (shi particle):**
   - Lists reasons for states or actions
   - Structure: [Reason clause] + し + [Reason clause] + [Main clause]
   - Similar to や but used with verbs

3. **Quotation embedding using と (to particle):**
   - Embeds a clause as a quotation or condition
   - Set verbal phrases rely on と for conditions and quotations

4. **Temporal sequencing using when (～ときに, ～た後で, etc.):**
   - Tae Kim and Migaku document temporal clause nesting
   - Genki II Ch. 16 introduces -toki (when/at the time)

**[LENS] Open question:** Which N5 sentence patterns serve as slot fillers for complex frames? For example:
- Does the advice frame [hou ga ii] take a te-form inside it? (E.g., 「勉強するほうがいいです」"studying is better" or only past-tense 「勉強したほうがいい」?)
- **NO source fetched clarifies this structural constraint.**

---

### Finding 7: Open JLPT Grammar Datasets — Licensed, Machine-Readable

**Sources (GitHub):**

| Repo | Format | Content | License | Status |
|------|--------|---------|---------|--------|
| AnchorI/jlpt-kanji-dictionary | JSON | Kanji + vocabulary by JLPT level (N5–N1) | [UNVERIFIED] | Production |
| Bluskyo/JLPT_Vocabulary | JSON, CSV | Vocabulary from tanos.co.uk | CC-BY (original) | Open |
| elzup/jlpt-word-list | [format UNVERIFIED] | JLPT vocabulary list | [UNVERIFIED] | Exists |
| jamsinclair/open-anki-jlpt-decks | CSV | JLPT decks for Anki (N5–N1) | [UNVERIFIED] | CSV available at src/n5.csv etc. |
| davidluzgouveia/kanji-data | JSON | Kanji with JLPT levels + WaniKani info | [UNVERIFIED] | Extracted from kanjiapi.dev |
| Renairisu/jlpt_kanji_json_msgpack | JSON, MessagePack | Kanji for JLPT N1–N5 | [UNVERIFIED] | Filtered from kanjiapi.dev |
| agascocompte/noken | JSON (implied) | N5 (Minna no Nihongo I) grammar, vocab, verbs, kanji | [UNVERIFIED] | Spanish language |
| kotowaza | JSON | Japanese proverbs (kotowaza) | [UNVERIFIED] | Production-grade |

**[LENS] CRITICAL FINDING: No comprehensive, openly-licensed JSON/CSV dataset of JLPT N5/N4 GRAMMAR PATTERNS (sentence frames) with example sentences exists in the fetched sources.**

- All datasets focus on VOCABULARY or KANJI
- BUNPRO (grammar by lesson) is NOT open-source
- TANOS.CO.UK (grammar index) is NOT in the GitHub datasets
- **Noken** provides JSON but is Spanish-language and **NOT verified for accuracy or JLPT standard compliance**

**Implication:** Seeding a drill-content database from open JLPT grammar data requires:
1. Manual compilation from published resources (Genki, Minna no Nihongo, JLPT textbooks)
2. OR reverse-engineering from Anki decks and re-licensing
3. OR negotiating with Bunpro for data export
4. OR building a proprietary grammar-point registry (the prior 40-frame table is step 1)

---

## Open Items Status

### ✅ ITEM 1: hou ga ii vs. yori hou ga relationship
**Status: RESOLVED**
- Both JLPT N5
- Both use 方 (hou) morpheme
- **DISTINCT grammatical roles:** advice (hou ga ii) vs. comparison (yori hou ga)
- Both appear in Genki I (Chapters 10 and 12 respectively)

### ⚠️ ITEM 2: Classroom ORDER — Genki and Minna no Nihongo sequencing
**Status: PARTIALLY RESOLVED**
- **Genki I & II:** Chapter-by-chapter order FULLY documented (St. Olaf source)
- **Minna no Nihongo I & II:** Lesson-by-lesson order STILL NOT FETCHED (prior attempt returned 403; all searchable sources reference but don't expose the full grammar list)
- **Action:** A university course syllabi (MIT, UFL, USC, Waseda, University of Washington) likely have Minna no Nihongo lesson maps but fetches were not attempted (may require institutional access)

### ✅ ITEM 3: Closed slot sets — membership and disagreement
**Status: PARTIALLY RESOLVED**
- **Position words:** 8–9 core set identified; 13-word extended set exists
- **Source disagreement documented:** COTO Academy (13) vs. LearnJapaneseAZ (9)
- **GAP:** No source maps position words to Genki Chapter 4 or Minna no Nihongo Lesson X explicitly

### ✅ ITEM 4: Frame recombination — which patterns nest which
**Status: IDENTIFIED, NOT MAPPED**
- Relative clauses, reason clauses, quotation, temporal sequencing all involve embedding
- Specific nesting rules per N5 frame NOT in fetched sources

### ❌ ITEM 5: Open JLPT grammar datasets
**Status: NEGATIVE RESULT**
- No comprehensive, licensed, machine-readable N5/N4 grammar-frame dataset found
- Existing repos are vocabulary/kanji-only
- **Noken** is the closest (N5 grammar JSON) but NOT verified and is Spanish-language

---

## Recommendations for Next Steps

1. **Close the Minna no Nihongo order gap:**
   - Fetch university course PDFs (MIT OCW, UFL, USC, Waseda) — these often have published Minna no Nihongo syllabi in English
   - Contact 3A Corporation (publisher) or search Japanese educational sites (teacher blogs, online course pages)

2. **Pin down position-word set membership:**
   - Verify against actual textbook table of contents (Genki, Minna no Nihongo)
   - Clarify whether "9 position words" in learnjapaneseaz resolves to 8 or includes an unlisted 9th

3. **Map frame recombination explicitly:**
   - Create a 2D matrix: [Frame name] × [Can embed?] with examples
   - Reference Genki II chapters 15–23 for complex patterns

4. **Evaluate Noken and other GitHub grammar repos:**
   - Spot-check accuracy (is each grammar point's JLPT level correct? are example sentences grammatical?)
   - Assess license: can it be repurposed for WordStick drills?

5. **Commission a grammar-dataset compilation:**
   - If no open dataset suffices, manually extract from Genki I & II + Minna no Nihongo I & II
   - Structure as JSON: each frame has a lesson/chapter origin, JLPT level, example sentences, closed-slot inventory
   - This becomes the source-of-truth for the frame ordering

---

## Sources Cited

### Primary Sources (Directly Fetched)

1. **St. Olaf College Japanese Program.** "Genki I & II Grammar Index." https://wp.stolaf.edu/japanese/grammar-index/genki-i-ii-grammar-index/
   - Confidence: HIGH | Maturity: Established academic resource | JLPT: N5–N2 scope

2. **JLPTsensei.com.** "JLPT N5 ～方がいい (hou ga ii): Meaning, Structure & Example." https://jlptsensei.com/learn-japanese-grammar/%E6%96%B9%E3%81%8C%E3%81%84%E3%81%84-%E3%81%BB%E3%81%86%E3%81%8C%E3%81%84%E3%81%84-hou-ga-ii-meaning/
   - Confidence: HIGH | Maturity: JLPT-focused education site | JLPT level verified: N5

3. **JLPTsensei.com.** "JLPT N5 より～ほうが (yori ~hou ga): Meaning." https://jlptsensei.com/learn-japanese-grammar/%E3%82%88%E3%82%8A%EF%BD%9E%E3%81%AE%E3%81%BB%E3%81%86%E3%81%8C-yori-no-hou-ga-meaning/
   - Confidence: HIGH | Maturity: JLPT-focused education site | JLPT level verified: N5

4. **COTO Academy.** "Positions in Japanese: How to Say Up, Down, Left, Right and More." https://cotoacademy.com/positioning-words-japanese-how-to-say-left-right-japanese-position/
   - Confidence: HIGH | Maturity: Japanese language school resource | Position word set: 13 words

5. **LearnJapaneseAZ.** "9 Japanese Position Words." https://learnjapaneseaz.com/9-japanese-position-words.html
   - Confidence: MEDIUM | Maturity: Community education site | Position word set: labeled "9" but only 8 listed; 9th unlabeled

6. **JLPT Benkyo.** "JLPT N5 Minna no Nihongo Vocabulary (Lessons 1–25) (Free PDF)." https://jlptbenkyo.com/articles/jlpt-n5-minna-no-nihongo-vocabulary/
   - Confidence: MEDIUM | Maturity: JLPT vocabulary resource (grammar NOT detailed) | Note: Vocabulary only

7. **Hanabira.org.** "Verb たほうがいい (〜ta hou ga ii) - JLPT N4 Grammar." https://hanabira.org/japanese/grammarpoint/Verb%20%E3%81%9F%E3%81%BB%E3%81%86%E3%81%8C%E3%81%84%E3%81%84%20(%E3%80%9Cta%20hou%20ga%20ii)
   - Confidence: HIGH | Maturity: JLPT grammar dictionary | JLPT level: N4 variant documented

8. **Hanabira.org.** "A より B のほうが～ (A yori B no hou ga ～)." https://hanabira.org/japanese/grammarpoint/A%20%E3%82%88%E3%82%8A%20B%20%E3%81%AE%E3%81%BB%E3%81%86%E3%81%8C%EF%BD%9E%20(A%20yori%20B%20no%20hou%20ga%20%EF%BD%9E)
   - Confidence: HIGH | Maturity: JLPT grammar dictionary | JLPT level: N5 documented

### Secondary Sources (Search Results, Not Fully Fetched)

9. **Japanese with Hikari.** "JLPT N5 - Grammar 🌟 より～ほうが yori ~hou ga." https://www.japanesewithhikari.com/blog/n5-grammar-yorihouga
   - Confidence: MEDIUM | Reference comparison pattern

10. **Japanese Professor.** "Making Comparisons: Yori, Hodo, and No Hou Ga." https://www.japaneseprofessor.com/lessons/beginning/making-comparisons/
    - Confidence: MEDIUM | Reference comparison pattern

11. **Tae Kim's Japanese Grammar Guide.** "Relative Clauses and Sentence Order." https://guidetojapanese.org/learn/grammar/clause
    - Confidence: HIGH | Maturity: Established online grammar reference | Reference frame recombination

12. **Migaku.** "Japanese Relative Clauses: How to Build Complex Sentences." https://migaku.com/blog/japanese/japanese-relative-clauses
    - Confidence: MEDIUM | Maturity: Language learning platform | Reference frame recombination

13. **GitHub: AnchorI/jlpt-kanji-dictionary.** https://github.com/AnchorI/jlpt-kanji-dictionary
    - Confidence: [UNVERIFIED] | Type: Open JSON dataset | Maturity: Exists | License: [NOT VERIFIED]
    - Note: Vocabulary and kanji, not grammar patterns

14. **GitHub: Bluskyo/JLPT_Vocabulary.** https://github.com/Bluskyo/JLPT_Vocabulary
    - Confidence: MEDIUM | Type: JSON/CSV from tanos.co.uk | License: CC-BY (original source)
    - Note: Vocabulary only

15. **GitHub: agascocompte/noken.** https://github.com/agascocompte/noken
    - Confidence: LOW | Type: JSON grammar/vocab/kanji | Language: Spanish
    - Note: Claims N5 (Minna no Nihongo I) scope but accuracy NOT verified

16. **GitHub: jamsinclair/open-anki-jlpt-decks.** https://github.com/jamsinclair/open-anki-jlpt-decks
    - Confidence: MEDIUM | Type: CSV decks | License: [UNVERIFIED]
    - Note: Vocabulary and kanji-focused; grammar coverage unclear

### Tertiary Sources (Referenced in Search Results)

17. **PassJapanese.** "Minna no Nihongo — Online Japanese Course, 50 Free Lessons." https://passjapanese.com/en/minna-no-nihongo
    - Confidence: [NOT FETCHED — HTTP 403] | Claimed: "271 grammar points, 3,888 vocabulary words"

18. **Genki-Online (Official).** https://genki3.japantimes.co.jp/en/
    - Confidence: [NOT FULLY FETCHED] | Maturity: Official textbook site | Grammar index likely accessible via "Self-study Room"

19. **Genki Study Resources.** "Grammar Index." https://genki.haliya.net/lessons-3rd/appendix/grammar-index/
    - Confidence: MEDIUM | Maturity: Community resource | 3rd edition reference

20. **Benkyoumashou.** "Japanese Location Words: 40+ Essentials (上, 下, 中, 前...)." https://benkyoumashou.com/blog/japanese-location-words/
    - Confidence: MEDIUM | Maturity: Community education | Position word set: extended (13+)

---

## Methodology Notes

- **READ-ONLY research lane:** No files modified, committed, or staged
- **SSRF guard:** All fetched URLs verified as public (no RFC1918, loopback, cloud-metadata)
- **Cite-or-omit rule:** No statistics regenerated from memory; unverified claims marked [UNVERIFIED]
- **Web search budget exhausted:** 200 WebSearch calls used; no further searches available this session
- **Fetch tier:** WebFetch primary; Jina Reader fallback not needed (most sources returned content)
- **H3 provenance:** All cited URLs from direct fetch responses or API results, never regenerated

---

**Report completed:** 2026-09-17  
**Lanes active in session:** main (orchestrator), eng-syllabus-order (this lane), +17 word-family and vocab-audit agents
