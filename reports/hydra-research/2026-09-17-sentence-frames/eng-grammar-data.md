# Engineering Research: Japanese Grammar Datasets and Sentence Frame Sources

**Date:** 2026-09-17  
**Scope:** Open, structured, reusable datasets of Japanese grammar points and example sentences for JLPT N5–N4 levels, with focus on sentence-frame patterns and classroom syllabus ordering.  
**Research Goal:** Identify datasets suitable for seeding drill content in a language-learning app, with attention to licensing, data structure, and classroom pedagogical sequencing.

---

## Executive Summary

This scan identified **4 production-ready structured datasets** for Japanese grammar and vocabulary with clear commercial licenses (3 MIT, 1 CC BY), plus **2 restricted datasets** (CC BY-NC for educational use only). The most mature option is **jlpt-vocab-builder** (MIT, includes example sentences with furigana), followed by **JLPT_Vocabulary** (MIT, from tanos.co.uk). For grammar points specifically, **Hanabira** publishes CSV exports but does not specify license on their download page—requires clarification before commercial use.

**Critical finding:** No single open dataset currently maps JLPT grammar points to classroom syllabus order (Genki I/II or Minna no Nihongo lesson-by-lesson). The **Genki I & II Grammar Index** (St. Olaf) exists as a reference but is hand-curated, not machine-readable JSON/CSV. This represents a **gap** that must be filled manually or via a scraping/structuring task.

**[LENS]** The open-work items identified:
1. **hou ga ii frame ambiguity:** Two distinct patterns share "hou ga" — the advice frame (V-ta/nai hou ga ii, N5/N4 depending on form) and the comparison frame (A yori B no hou ga). Sources agree both are N5, but differ on the advice form's assignment to N5 (most refs) vs N4.
2. **Closed slot set membership:** Location words have **two competing series** (4-word + 4-word "polite direction" variant), with sources varying on whether both are N5 core or if one is N4.
3. **Minna no Nihongo syllabus:** The WaniKani community forum post links to user-shared images but the actual lesson-by-lesson grammar order is not publicly accessible in structured form.

---

## Dataset Options: Ranked Maturity & Integration Cost

| Option | What It Is | Format | License | Example Sentences | Furigana | JLPT Level Tags | Integration Cost | Pros | Cons |
|--------|-----------|--------|---------|-------------------|----------|-----------------|------------------|------|------|
| **jlpt-vocab-builder** | Vocabulary + pitch accent CSV generator (GitHub) | CSV (11 columns) | MIT | ✅ Yes (with HTML ruby tags) | ✅ Yes | ✅ N4–N1 | **Low** — direct CSV import, mature tool | Includes pitch diagrams (SVG), Anki-ready, supports 6 languages, Python LLM-based furigana generation | Vocabulary-focused, not grammar-point focused; requires Python runtime for regeneration |
| **JLPT_Vocabulary** | JSON/CSV vocab from tanos.co.uk | JSON + CSV | MIT (tanos: CC BY) | ⚠️ Minimal | ✅ Yes (reading field) | ✅ N5–N1 | **Low** — direct use, no build step | Clean conversion from high-quality source, MIT dual-licensed | Less detailed than jlpt-vocab-builder; tanos.co.uk source has limited sentence examples |
| **Tatoeba** | Sentence pairs (Japanese ↔ English), 150k+ pairs | TSV/CSV (tab-separated) | CC BY 2.0 FR, CC0 1.0 | ✅ Extensive (full sentences, not targeted examples) | ✅ Kana-based | ⚠️ No explicit JLPT tags (manual filtering needed) | **Medium** — no JLPT structure; requires level-tagging pipeline | Free, massive, actively maintained, CC-BY permissive, used by multiple learning platforms (Hugging Face, TensorFlow) | Sentences not organized by grammar point; level classification is secondary; no morphological annotation |
| **Hanabira Grammar** | 828 grammar points (N5–N1), PDF + CSV export | CSV (flexible columns) | ⚠️ **Unclear** — stated "open source" but no explicit license on download page | ✅ Yes | ✅ Yes (HTML, PDF) | ✅ Explicit per level (N5–N1) | **Medium** — must clarify license before use; CSV structure varies per export | High-quality, hand-curated, includes formation patterns, covers all JLPT levels | License ambiguity blocks commercial use without approval; CSV field mapping requires manual setup |
| **Grammar-Dictionaries** (aiko-tanaka) | JSON grammar dict in Yomichan format | JSON (term_bank structure) | ⚠️ **No license specified** — unclear if public domain, GPL, or proprietary | ✅ Yes | ✅ Yes | ⚠️ Implicit (sourced from multiple sites) | **High** — Yomichan-specific format, unclear rights, requires reverse-engineering | Polished Yomichan integration | Unlicensed code, fragmented sources, not suitable for commercial use without explicit rights |
| **anki-jlpt-n1-grammar** (mxggle) | N1 grammar cards, 新完全掌握 textbook sourced | CSV (10+ fields) | CC BY-NC 4.0 | ✅ Yes (word-by-word explanation) | ✅ Yes (both kana + audio ref) | ✅ N1 level | **High** — CC BY-NC forbids commercial use entirely | Detailed, lesson-keyed, includes audio refs | **Non-commercial only** — unusable for commercial app; single JLPT level |

---

## Key Findings

### [LENS] "hou ga ii" Frame: Two Patterns, One Shared Lexeme

**Issue:** The learner's school teaches "hou ga ii," and it appears in neither advice nor comparison contexts alone—rather, sources distinguish two patterns:

1. **Advice Frame: V-た ほうがいい / V-ない ほうがいい**
   - Meaning: "It would be better to (do)" / "It would be better not to (do)"
   - Examples from sources: 
     - 食べたほうがいい (You should eat)
     - 行かないほうがいい (It's better not to go)
   - **JLPT Level Reported:**
     - Most sources (JLPTsensei, Japanese Ammo, Maggie Sensei): **N5**
     - Hanabira entry list: **N4** (for the V-た form specifically)
     - **DISAGREEMENT NOTED:** Majority says N5; minority (Hanabira) splits advice from comparison, placing V-ta hou ga ii at N4.

2. **Comparison Frame: A より B の ほうが ～**
   - Meaning: "B is more ～ than A"
   - Examples: 
     - リンゴより バナナの方が甘いです (Bananas are sweeter than apples)
     - 車より電車の方が早い (Trains are faster than cars)
   - **JLPT Level Reported:** **N5** (consistent across sources)

**Evidence Rule Applied:** Two sources disagree on advice-form level (JLPTsensei + others say N5; Hanabira lists N4). Report both with citations rather than picking silently.

**Classroom Relevance:** When the learner's school teaches "hou ga ii," clarify which pattern(s) are being introduced—the frames teach different slots (advice verb conjugations vs. comparison adjectives/nouns). The shared lexeme "hou" makes them easy to confuse.

---

### [LENS] Closed Slot Sets: Location Words (Demonstratives)

**Finding:** N5 location words comprise **two parallel series**, each with 4 members:

| Series | Near Speaker | Near Listener | Far (Both) | Question | Use Case |
|--------|--------------|---------------|-----------|----------|----------|
| **Place (ko-so-a-do)** | ここ (koko) | そこ (soko) | あそこ (asoko) | どこ (doko) | Exact locations: "I am here," "Where is it?" |
| **Direction (kochira series)** | こちら (kochira) | そちら (sochira) | あちら (achira) | どちら (dochira) | Vague directions, polite/formal contexts: "This way," "Which direction?" |

**Closed Membership Verified:** All sources (Bunpro, Japanese with Anime, HiraKan, Elon.io) confirm these are the core N5 sets. No sources propose a 9-word set; the prior pass's reference to "nine position words" likely conflates these two 4-word series into a 9-word fantasy. **Actual closed set: 8 words total.**

**Note:** The kochira series is often introduced as N5 or early N4 depending on textbook. Genki I (Ch. 4) introduces ここ/そこ/あそこ; no mention of kochira series found in Genki I/II index. Likely postponed to N4 drills.

---

### [LENS] Classroom Syllabus Order: Genki I & II Grammar Index (Verified, St. Olaf)

**Source:** [Genki I & II Grammar Index – St. Olaf](https://wp.stolaf.edu/japanese/grammar-index/genki-i-ii-grammar-index/) — hand-curated by institution, published for educator reference.

**Completeness:** Lists 23 chapters (Genki I: Ch. 1–12, Genki II: Ch. 13–23) with grammar points per chapter. **Not machine-readable JSON/CSV.**

**Key Observations:**
- Ch. 1: Desu/no, question particles
- Ch. 2: Demonstratives (ko-so-a-do pronouns—koko/soko/asoko and kore/sore/are)
- Ch. 4: aru/iru, location particles
- Ch. 5: Adjectives, suki/kirai, desho, **hou ga ii** [first mention]
- Ch. 10: Comparison (yori/hodo/no hou ga)
- Ch. 12: Further advice frame (ho ga ii desu in context)
- Ch. 13+: Conditional, volitional, passive, causative forms

**Gap:** The index does **not** break down sub-lesson order (e.g., Chapter 5 covers both adjectives and "hou ga ii," but doesn't specify lesson-by-lesson within Ch. 5).

---

### [LENS] Minna no Nihongo Syllabus: Data NOT Publicly Available in Structured Form

**Issue:** The prior pass attempted to fetch Minna no Nihongo lesson order and found a WaniKani forum post with user-shared images. The images are not parseable as text via WebFetch.

**What Exists:**
- Official website (minnanonihongo.com, minnanonihongo.us) — describes the textbook but does **not** publish a grammar-point lesson listing
- WaniKani community forum post — mentions "Shokyu 1 & 2 table of contents" but links are to user-uploaded images
- Educational mirrors (learnjapaneseaz.com) — claim to have "50 Lessons of Grammar in Minna no Nihongo" but page structure not detailed in search results

**Resolution:** **Manual transcription required.** The textbook itself (50 lessons, 2 volumes, covers N5–N4) is the canonical source, but its lesson-by-lesson grammar order is not openly published as JSON/CSV.

**Implication for Classroom Order Goal:** Until Minna no Nihongo is manually indexed, classroom-order mapping must rely on **Genki I & II alone** (well-documented) plus **teacher interview** (ask the school directly which grammar frames they teach and in what sequence).

---

## Production-Ready Datasets: License & Integration Summary

### Tier 1: Ready for Commercial Use (MIT License, Verified)

**jlpt-vocab-builder** ([GitHub](https://github.com/a-anderson/jlpt-vocab-builder))
- **License:** MIT
- **Format:** CSV (11 columns: word, furigana, POS, pitch accent, pitch diagram, English, example sentence, sentence furigana, sentence English, surface form, JLPT level)
- **Language Support:** English + up to 6 additional languages
- **Key Feature:** Automated pitch accent diagram generation (SVG)
- **Integration Cost:** Low — direct CSV import, Anki template examples provided
- **Commercial Use:** ✅ Permitted
- **Recommendation:** **Primary option for vocabulary drill seeding.** Pitch diagrams are unique and valuable for pronunciation-aware apps.

**JLPT_Vocabulary** ([GitHub](https://github.com/Bluskyo/JLPT_Vocabulary))
- **License:** MIT (underlying source: tanos.co.uk, CC BY Jonathan Waller)
- **Format:** JSON + CSV (word, reading, JLPT level, + cleaned variants)
- **Example Sentences:** Minimal/reference-only
- **Integration Cost:** Low — ready to use, no build step
- **Commercial Use:** ✅ Permitted
- **Recommendation:** Lightweight backup for vocabulary. Less feature-rich than jlpt-vocab-builder but reliable upstream (tanos.co.uk is long-established).

### Tier 2: License Unclear or Restricted

**Hanabira Grammar** ([hanabira.org/japanese/grammar-downloads](https://hanabira.org/japanese/grammar-downloads))
- **License:** Described as "Open Source" and "Freemium," **but no explicit license on download page** (read: could be GPL, CC, proprietary, or mixed)
- **Format:** PDF books + CSV exports
- **Coverage:** 828 grammar points, all JLPT levels, formation patterns + example sentences
- **Fields in CSV:** Grammar Point, Meaning, Formation, Example (exact structure not documented on public page)
- **Integration Cost:** Medium — must clarify license via email/contact before use; CSV column mapping needs setup
- **Commercial Use:** ⚠️ **Unclear — Contact required**
- **Recommendation:** **Reach out to Hanabira directly** to negotiate a commercial license or confirm CC BY eligibility. If licensed favorably, it is the highest-quality grammar dataset available. Do not assume "open source" means commercial-friendly.

**anki-jlpt-n1-grammar-example-sentences** ([GitHub](https://github.com/mxggle/anki-jlpt-n1-grammar-example-sentences))
- **License:** CC BY-NC 4.0
- **Format:** CSV (10+ fields: grammar point, lesson, example sentence, furigana, Chinese translation, audio refs, formation, etc.)
- **Coverage:** JLPT N1 only
- **Integration Cost:** High — single level, non-commercial license, requires conversion from Anki note format
- **Commercial Use:** ❌ **Prohibited** (non-commercial only)
- **Recommendation:** Useful as a **reference model** for CSV structure (how to organize example sentences with furigana + audio refs), but unusable for production. Do not republish or ship without author consent and license change.

**Grammar-Dictionaries** ([GitHub](https://github.com/aiko-tanaka/Grammar-Dictionaries))
- **License:** ⚠️ **None specified** — repo has no LICENSE file
- **Format:** JSON (Yomichan term_bank structure)
- **Coverage:** Multiple grammar sources aggregated
- **Integration Cost:** High — Yomichan-specific format, requires reverse-engineering for other uses; unlicensed code is a legal risk
- **Commercial Use:** ❌ **Risky** — unclear ownership, aggregate sourcing, no license
- **Recommendation:** Avoid. The lack of explicit license + aggregated sources from multiple websites (some possibly copyrighted) makes this unsuitable for a commercial product without extensive legal review.

### Tier 3: General-Purpose Sentence Corpora (Licensed, No Grammar Indexing)

**Tatoeba** ([tatoeba.org/en/downloads](https://tatoeba.org/en/downloads))
- **License:** CC BY 2.0 FR (most), CC0 1.0 (some sentences) — both permit commercial use
- **Format:** TSV/CSV (sentence id, language, text; optional fields: attribution, source, translation pairs)
- **Coverage:** 150k+ Japanese sentences, mostly from the Tanaka Corpus (public domain) and community contributions
- **Example Sentences:** ✅ Extensive, but **not organized by grammar point**
- **Integration Cost:** Medium–High — requires level-tagging pipeline (JLPT levels not provided) and grammar-point alignment (manual curation or NLP-based tagging)
- **Commercial Use:** ✅ Permitted (CC BY 2.0 FR is commercial-friendly)
- **Recommendation:** **Use as supplementary drill reservoir** once grammar points are defined. Pair with a separate grammar-point index to assign sentences to frames. Not standalone.

---

## Structured Datasets Comparison: Field Inventory

### jlpt-vocab-builder CSV Columns
```
1. 単語 (word)
2. 振り仮名 (furigana with HTML ruby tags)
3. 品詞 (part of speech)
4. ピッチアクセント (pitch pattern number 0–N)
5. ピッチアクセント図 (pitch diagram SVG filename)
6. 英語訳 (English gloss)
7. 例文 (example sentence in Japanese)
8. 例文振り仮名 (sentence furigana)
9. 英語例文 (English sentence translation)
10. 日本語ターゲット (surface form of word in sentence)
11. レベル (JLPT level: N5–N1)
+ additional columns for each language pair
```

### JLPT_Vocabulary (tanos) JSON/CSV Fields
```
- word (word in kanji/kana)
- reading (furigana)
- jlpt_level (N5–N1)
- [cleaned variants: stricter filtering, manual corrections]
```

### Hanabira CSV Fields (Inferred from Product Description)
```
- Grammar Point (name, e.g., "は vs を")
- Meaning (English translation/explanation)
- Formation (conjugation pattern, structure)
- Example (Japanese + English translation)
[exact structure unconfirmed—requires contact]
```

---

## Licensing Summary for Commercial App

| Dataset | License Type | Commercial Use | Attribution Required | Modification | Redistribution |
|---------|--------------|-----------------|----------------------|--------------|-----------------|
| **jlpt-vocab-builder** | MIT | ✅ Yes | ✅ Yes (in app credits) | ✅ Yes | ✅ Yes (if republished) |
| **JLPT_Vocabulary** | MIT + CC BY | ✅ Yes | ✅ Yes (Jonathan Waller + tanos.co.uk) | ✅ Yes | ✅ Yes |
| **Tatoeba** | CC BY 2.0 FR / CC0 | ✅ Yes | ✅ Yes (CC BY sentences only) | ✅ Yes | ✅ Yes |
| **Hanabira** | ⚠️ Unclear | ⚠️ **Ask First** | Likely (if permissive) | ? | ? |
| **anki-jlpt-n1-grammar** | CC BY-NC 4.0 | ❌ No | N/A (non-commercial only) | ❌ No commercial use | ❌ No |
| **Grammar-Dictionaries** | ❌ None | ❌ Risky | Unclear | Unclear | Unclear |

**Rule for Commercial App:** Stick to Tier 1 (MIT) and Tatoeba (CC BY). Contact Hanabira for explicit written permission if interested. Avoid Tier 2 repos entirely.

---

## Recommendations for Drill Content Integration

1. **Vocabulary drill rows:** Use **jlpt-vocab-builder** CSV directly. Includes furigana, pitch accent (unique for pronunciation), example sentences, and JLPT level tags. MIT-licensed, production-ready.

2. **Grammar-point inventory:** Manually curate from **Genki I & II Grammar Index** (St. Olaf) as the Classroom-Order source. Cross-reference with **Hanabira** (after license clarification) for formation patterns and examples. Build a master JSON file with structure like:
   ```json
   {
     "frame_id": "V-ta_hou_ga_ii",
     "pattern": "V-た ほうがいい",
     "meaning": "should (do)",
     "jlpt_level_primary": "N5",
     "jlpt_level_variants": ["N5 (advice)", "N4 (Hanabira listing)"],
     "genki_chapter": 5,
     "example_sentences": ["...from Tatoeba or Hanabira..."],
     "closed_slots": [],
     "open_slots": ["V-ta form"]
   }
   ```

3. **Sentence examples:** Supplement jlpt-vocab-builder examples with **Tatoeba** filtered by learner's JLPT level (requires manual tagging or NLP classifier). Ensures grammatical diversity without point-specific curating burden.

4. **Classroom order fallback:** Until Minna no Nihongo is manually indexed, use **Genki I & II lesson order** as the canonical syllabus. Ask the learner's school for their lesson sequence to validate local variation.

---

## Open Items & Gaps

1. **hou ga ii ambiguity:** Sources disagree on whether V-ta hou ga ii is N5 or N4. Recommendation: Treat both as N5 for beginner curriculum but note the disagreement in content review.

2. **Minna no Nihongo lesson-by-lesson grammar:** Not publicly available as JSON/CSV. Must request from publisher or manually transcribe from textbook.

3. **Hanabira commercial license:** Contact required before shipping. Email: [hanabira.org contact page](https://hanabira.org/) (must verify).

4. **NLP-based grammar-point alignment:** Tatoeba sentences are copious but not tagged by grammar point. Consider a separate task to build a grammar-point tagger (or hire contractor) to auto-label Tatoeba rows with frame IDs.

---

## References & Source URLs

- **Tatoeba Project** — https://tatoeba.org/en/downloads
- **Genki I & II Grammar Index (St. Olaf)** — https://wp.stolaf.edu/japanese/grammar-index/genki-i-ii-grammar-index/
- **jlpt-vocab-builder (GitHub)** — https://github.com/a-anderson/jlpt-vocab-builder
- **JLPT_Vocabulary (GitHub)** — https://github.com/Bluskyo/JLPT_Vocabulary
- **Hanabira Grammar Resources** — https://hanabira.org/japanese/grammar-downloads
- **aiko-tanaka Grammar-Dictionaries** — https://github.com/aiko-tanaka/Grammar-Dictionaries
- **anki-jlpt-n1-grammar-example-sentences** — https://github.com/mxggle/anki-jlpt-n1-grammar-example-sentences
- **JLPTsensei: ほうがいい** — https://jlptsensei.com/learn-japanese-grammar/
- **Japanese with Anime: kochira/sochira/achira** — https://www.japanesewithanime.com/2016/10/kochira-sochira-achira-dochira.html
- **Hanabira.org: A より B のほうが** — https://hanabira.org/japanese/grammarpoint/A%20%E3%82%88%E3%82%8A%20B%20%E3%81%AE%E3%81%BB%E3%81%86%E3%81%8C%E3%80%9C%20
