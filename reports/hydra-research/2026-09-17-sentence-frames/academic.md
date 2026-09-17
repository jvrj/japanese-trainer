# Academic Research: Japanese Sentence Frames for Language-Drill Apps
**Date:** 2026-09-17  
**Scope:** Semantic Scholar API search (1 successful query; 2+ hits rate-limited)

---

## Executive Summary

Academic literature on Japanese sentence-frame pedagogy and structured grammar learning is dominated by **computer-assisted language learning (CALL) system design** rather than pure pedagogy. The literature heavily emphasizes **automatic extraction and detection** of sentence patterns using NLP/ML techniques (CRF machine learning, morphological analysis) rather than studying **what frames are actually taught in classrooms or in what order**.

**Key findings:**
1. **Specific sentence patterns documented in teaching contexts** (N4-N5 level): タイ desu (たい desu), テモ ii desu (ても いい です), ナケレバ narimasen (なければ なりません) appear in empirical studies of Japanese learners.
2. **Frame taxonomy by JLPT level** is embedded in CALL system design papers but not in dedicated pedagogical references.
3. **No dedicated academic source** was found establishing the exact classroom order of frame introduction in Genki or Minna no Nihongo.
4. **Closed vs. open slot membership** is not formally studied in the papers retrieved; the literature assumes patterns themselves are the unit of analysis, not the slot-filling architecture.
5. **Rate limiting prevented exhaustive search:** Further queries on Minna no Nihongo textbook pedagogy, frame recombination, and JLPT grammar datasets failed to return data.

---

## Findings by Lens Item

### [LENS] 1: The "hou ga ii" Frame and Comparison Frame ("yori" hou)

**Status:** Not located in the academic search results. **[UNVERIFIED]** — no direct peer-reviewed source identified this frame or its JLPT level in the papers retrieved.

**Partial context from indirect sources:**
- Liu et al. (2022) describe a **bilingual corpus** of Japanese sentence patterns tagged by JLPT difficulty level using CRF machine learning, but do not enumerate the specific frame inventory (abstract provided; full pattern table not accessible via search result).
- Sukaesih & Utari (2026) empirically studied three specific patterns (たい desu, ても ii desu, なければ なりません) taught to N4-N5 learners, but did NOT include ほうがいい as a measured pattern, suggesting it may fall outside their research scope or be taught at a different level.

**Recommendation:** Consult the full paper by Liu et al. (2022, DOI 10.1109/PRML56267.2022.9882244) to verify whether their bilingual corpus enumerates ほうがいい or related comparative frames (ほう).

---

### [LENS] 2: Classroom Order (Genki, Minna no Nihongo)

**Status:** NOT FOUND in academic literature.

**What the search revealed:**
- No papers in the Semantic Scholar results **cite or analyze the Genki or Minna no Nihongo syllabus by lesson**.
- Liu et al. (2022) mention "Genki I ch.4" in the context of position words (mentioned in prior pass context as nine position words), but this reference does NOT appear in the retrieved abstracts; confirmation requires accessing the full papers.
- The prior single-agent pass correctly identified a gap: textbook lesson-by-lesson analysis is absent from academic literature on Japanese language teaching.

**Why the gap exists:**
- Academic literature on second-language grammar teaching typically focuses on **generalized learning strategies, cognitive load, or technology-assisted delivery**, not on **textbook-specific progression**.
- Textbook progression is usually documented **in instructor manuals and curriculum guides** (publisher proprietary materials), not peer-reviewed journals.

**Alternative sources to consult:**
- Genki instructor manuals (published separately by Japan Times).
- Minna no Nihongo teacher's guide (published separately by 3A Corporation).
- Grammar indexes at the end of each textbook.

---

### [LENS] 3: Closed Slot Membership Sets (e.g., Nine Position Words)

**Status:** Mentioned but not systematized in academic papers.

**Evidence:**
- Sukaesih & Utari (2026) examined three **specific sentence patterns** (たい desu, ても ii desu, なければ なりません) in a quasi-experimental N4-N5 teaching context. This establishes that **individual patterns CAN be empirically tested for teachability**, but does not enumerate the slot-filling sets within each pattern.
- Liu et al. (2022) designed a corpus with "detailed information such as surface form, dictionary form, pronunciation, difficulty level," implying that slots may be annotated, but abstracts do not reveal the closed-set taxonomy.
- Zahra et al. (2021) developed JLPT N4 quiz media including "bunpou (sentence patterns), kotoba (vocabulary), and kanji," treating vocabulary as a separate category from patterns—suggesting a distinction between **fixed pattern structure** and **open vocabulary slot fillers**, but without formal definition.

**Recommendation:** The full papers (especially Liu et al. 2022 bilingual corpus) likely contain pattern inventories; however, academic sources do not appear to formalize the **closed-slot taxonomy** in a single authoritative reference.

---

### [LENS] 4: Frame Recombination (Frames as Slot Fillers)

**Status:** NOT DIRECTLY STUDIED in retrieved papers.

**Related concept:** Liu et al. (2022) on "Japanese example sentence simplification" discusses **replacement of difficult patterns with simple patterns or phrases**—which touches on hierarchical pattern composition, but does not explicitly study which patterns take other patterns as slot fillers (e.g., reason clauses embedding conditionals).

**Why absent:** Recombination is a linguistic-generative phenomenon; the academic corpus retrieved focuses on **pattern identification and CALL design**, not on **compositional grammar theory**.

---

### [LENS] 5: Open, Reusable Datasets (JSON/CSV) of JLPT Grammar

**Status:** PARTIALLY FOUND; license terms [UNVERIFIED].

**Papers describing datasets:**
1. **Liu et al. (2022, DOI 10.1109/PRML56267.2022.9882244)** — "Construction of a Japanese-Chinese Bilingual Corpus for Learning Japanese Sentence Patterns"
   - Describes a **bilingual corpus** with POS tagging and JLPT difficulty level annotations.
   - Explicitly designed for **CALL tool development**.
   - NO LICENSE TERMS stated in abstract; availability unclear.
   - **Accessibility:** Full paper must be consulted for data-sharing/license section.

2. **Liu et al. (2022, DOI 10.1109/icnlp55136.2022.00068)** — "Design and Construction of a Knowledge Database for Learning Japanese Grammar"
   - Describes a **grammar knowledge database** constructed for JLPT learners.
   - Uses CRF machine learning + manual rules.
   - NO LICENSE TERMS stated in abstract; availability unclear.

3. **Zahra et al. (2021, DOI 10.2991/assehr.k.211119.078)** — "A Development of Instagram Filter as Japanese Language Learning Medium"
   - Developed JLPT N4 quiz content (bunpou, vocabulary, kanji).
   - Open-access PDF available; **license: CC-BY-NC** (implies non-commercial use allowed but not commercial redistribution).
   - Does NOT appear to be a publicly released dataset; content embedded in Instagram filter platform.

**Critical note:** The search did not identify a **standalone, publicly released, freely licensable JSON/CSV dataset** of JLPT grammar frames with example sentences. The datasets mentioned are either embedded in CALL systems or proprietary.

---

## Specific Sentence Patterns Documented in Literature

**Empirically studied in teaching contexts (Sukaesih & Utari, 2026):**
- **たい desu** (want to do)
- **ても ii desu** (it's okay to; can)
- **なければ なりません** (must; have to)

All three tested on JLPT N4-N5 level learners in a quasi-experimental design comparing anime-based instruction vs. traditional methods. Results showed statistically significant improvements with anime media (p < 0.05).

**Mentioned in curriculum design (Zahra et al., 2021):**
- JLPT N4 level materials include bunpou (sentence patterns), kotoba (vocabulary), and kanji as distinct categories.

**Inferred from corpus design (Liu et al., 2022 et al.):**
- JLPT N5, N4, N3, N2, N1 difficulty levels are used as annotation categories in bilingual corpus construction.
- Patterns are decomposed by: surface form, dictionary form, pronunciation, difficulty level.

---

## Literature Trends and Gaps

### What the literature DOES emphasize:
1. **Automatic pattern detection** via NLP (POS tagging, CRF, morphological analysis, rules).
2. **CALL system design** for N4-N5 level learners.
3. **Bilingual corpus construction** (Japanese-Chinese, Japanese-English comparisons).
4. **Digital pedagogy** (Instagram filters, anime media, Tsunahiro program in Japan).
5. **Focus on Form (FoF) instruction** in digital contexts (Kim, 2025).

### What the literature DOES NOT address:
1. **Syllabus-sequencing** of Genki, Minna no Nihongo, or other major textbooks.
2. **Closed-slot taxonomy** (e.g., exact inventory of position words, polite verb endings, etc.).
3. **Frame recombination rules** (which frames embed other frames).
4. **Publicly released, freely licensable structured datasets** of JLPT grammar with example sentences.
5. **Comparative analysis** of which frames appear in which textbooks.

---

## Rate-Limit Impact on Search Completeness

**Queries executed:** 1 successful, 2+ failed (HTTP 429, rate-limited).

**Intended but unexecuted queries:**
- "JLPT N5 N4 grammar proficiency test pedagogy curriculum" (429 after ~5 min wait).
- "Genki Minna no Nihongo Japanese textbook grammar instruction" (429).
- "Language learning corpus sentence drill beginner app" (429).

**Implication:** A complete academic survey would require:
- An API key with higher rate limits (apply at https://www.semanticscholar.org/product/api#api-key-form).
- Patience for sequential queries with >= 30-second intervals.
- Direct access to full papers' reference lists to trace dataset citations.

---

## Recommendations for Next Steps

### To pin down "hou ga ii" and comparative frames:
1. Fetch the **full bilingual corpus paper** (Liu et al. 2022, PRML56267) to inspect the pattern inventory table.
2. Cross-reference against **JLPT Sensei** and **St. Olaf Genki grammar index** (already done in prior pass).
3. If discrepancies exist, report both sources with confidence/JLPT-level attribution.

### To establish classroom order:
1. Consult **official Genki I/II instructor manuals** and **Minna no Nihongo teacher's guides** directly (non-academic but authoritative).
2. If one prior pass already did this, that source (textbook progression) is **more authoritative than peer-reviewed literature** on this specific question.

### To enumerate closed-slot sets:
1. Build a **corpus of example sentences from Genki/Minna no Nihongo** and manually tag slot types.
2. Cross-reference against JLPT official test papers (if accessible).
3. Formalize disagreements between sources (e.g., "9 vs. 10+ position words") **with explicit citations**.

### To study frame recombination:
1. Consult **Japanese grammar monographs** (e.g., Tsujimura's "An Introduction to Japanese Linguistics"; Shibatani's "Japanese Syntax") rather than language-teaching literature.
2. These sources discuss **compositional grammar rules** explicitly.

### To find reusable datasets:
1. Check **GitHub repositories** tagged with "JLPT," "Japanese grammar," or "sentence corpus" (outside academic literature).
2. Inspect licenses on any corpus found; prefer CC-BY or CC0 over CC-BY-NC (non-commercial restriction).
3. If none found, **synthesize one** by:
   - Scraping JLPT Sensei (check ToS for data-use rights).
   - Manually curating Genki/Minna no Nihongo example sentences.
   - Structuring as JSON with fields: `{ frame: string, slots: {name, type, values?}, exampleSentences: [...], jlptLevel: N5|N4|N3|... }`.

---

## Conclusion

Academic literature provides **supporting evidence for CALL system design, NLP techniques, and empirical efficacy of media-rich teaching** (anime, digital platforms), but **does not directly answer the pedagogical questions the lens poses** (classroom order, closed-slot taxonomy, frame recombination). The **textbook-specific progression** and **structured slot-set inventory** are questions that **textbook publishers and classroom practitioners know**, but which **academic literature does not systematize**. A hybrid approach—combining **JLPT Sensei, textbook indexes, and grammar linguistics books**—will likely yield more complete answers than the peer-reviewed literature alone.

---

## Sources Summary

| Paper | DOI/ID | Year | Cites | Key Relevance |
|-------|--------|------|-------|---------------|
| Liu et al. | 10.1007/s10639-024-13267-w | 2025 | 4 | AI-driven framework for sentence-pattern learning (abstract elided) |
| Liu, Zhuang | 10.1109/PRML56267.2022.9882244 | 2022 | 0 | Bilingual corpus, JLPT difficulty levels, CRF extraction [HIGH RELEVANCE] |
| Liu et al. | 10.1109/ICET55642.2022.9944541 | 2022 | 1 | Pattern simplification, morphological analysis, CALL tool |
| Sukaesih, Utari | 10.30605/25409190.911 | 2026 | 0 | Anime teaching of たい, ても, なければ patterns, N4-N5 [SPECIFIC PATTERNS] |
| Liu et al. | 10.1109/icnlp55136.2022.00068 | 2022 | 7 | Grammar knowledge database, JLPT levels [HIGH RELEVANCE] |
| Liu et al. | 10.1109/ICEIT54416.2022.9690759 | 2022 | 1 | Corpus-based pattern extraction training data |
| Zahra et al. | 10.2991/assehr.k.211119.078 | 2021 | 4 | JLPT N4 Instagram filter CALL tool (CC-BY-NC) |
| Kim | 10.25022/jkler.2025.25.027 | 2025 | 0 | Focus on Form in Tsunahiro (Japan) digital program [CLASSROOM RELEVANCE] |

