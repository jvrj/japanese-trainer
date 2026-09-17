# Topic Discovery: Beginner-to-N4 Japanese Sentence Frames

**Research Date:** 2026-09-17  
**Scope:** YouTube discovery scan across 6 targeted queries  
**Discovery Method:** `yt-dlp ytsearch20:` across grammar/sentence-pattern domain queries

## Executive Summary

Discovered 6 channels appearing in 2+ queries across Japanese grammar/sentence-frame teaching domain. Top 3 by aggregate view count:

1. **Learn Japanese with JapanesePod101.com** (12.4M total views, 3 queries, 5 videos found)
2. **ToKini Andy** (3.4M total views, 2 queries, 9 videos found)
3. **ゲーム言語** (Game Gengo) (2.7M total views, 4 queries, multiple videos found)

## Search Queries Used

1. "Japanese sentence patterns N5 JLPT grammar"
2. "Genki textbook Japanese grammar lesson"
3. "classroom Japanese beginner sentence frames"
4. "Japanese verb ending patterns particles"
5. "Minna no Nihongo grammar introduction"
6. "N4 grammar Japanese language learning"

## Discovery Hits: Channels in 2+ Queries

### [LENS] Primary Grammar Teaching Channels

- **Learn Japanese with JapanesePod101.com** → 3 queries, 12.4M views, strong signal for JLPT/structured grammar
- **ToKini Andy** → 2 queries, 3.4M views, classroom-context appeal
- **ゲーム言語 (Game Gengo)** → 4 queries, 2.7M views, creative verb-pattern approach
- **Organic Japanese with Yuta** → 2 queries, sentence-pattern methodical teaching
- **Japanese Ammo with Misa** → 2 queries, explanation-heavy format
- **Genki Study Resource** → 2 queries, direct textbook alignment

## Key Observations

### [LENS] Classroom-Aligned Content

Channels appearing in both "classroom Japanese" + "Genki/Minna no Nihongo" queries indicate textbook-aware teaching. ToKini Andy notably surfaces in this intersection — suggests classroom integration signal.

### [LENS] Sentence Frames vs. Vocabulary

Discovery search terms separate cleanly:
- **Pattern-focused queries** ("sentence patterns", "verb endings", "frames") → grammar-explanation channels
- **Textbook-specific** ("Genki", "Minna no Nihongo") → structured-syllabus channels  
- **JLPT-level** (N5/N4) → test-prep channels

This domain split suggests content is organized by TEACHING APPROACH (grammar-first vs. textbook-chapter vs. test-prep), not by frame inventory itself.

## Gaps Identified (Against [LENS] Requirements)

### [LENS] Open Item 1: "hou ga ii" Frame

**Status:** Not yet pinned in discovery. JapanesePod101 likely covers (structural frequency in JLPT N4-N3), but specific video + lesson number not yet isolated.

**Required sources:**
- JapanesePod101 explicit lesson on "V-ta hou ga ii / V-nai hou ga ii" (advice frame)
- Relationship to "A yori B no hou ga" (comparison) — source stating both use "hou" but function differently
- JLPT Sensei or Genki index clarifying level assignment for each

### [LENS] Open Item 2: Classroom Lesson Order

**Status:** Genki discovery hit confirmed, but Minna no Nihongo syllabus still unresolved (prior pass fetched links-only page).

**Required sources:**
- Genki I & II chapter-by-chapter grammar progression (verified against JapanesePod101 lesson numbering)
- Minna no Nihongo vol. 1–2 lesson order (primary school textbook curriculum)
- Cross-check: do both introduce N5-core patterns in same order or diverge?

### [LENS] Open Item 3: Closed Slot Sets with Exact Membership

**Status:** Not yet enumerated. Genki I ch.4 position words example = foundation, but other sources disagree on completeness.

**Required sources:**
- Genki I ch.4 nine position words (verified list)
- Secondary sources (JLPT Sensei, Organic Japanese with Yuta) listing position-word set + any additions
- Discrepancies documented with citations

### [LENS] Open Item 4: Frames That Recombine

**Status:** Not discovered in this pass. Reasoning clauses, sequencing, quotation frames likely covered by textbooks but not yet isolated.

**Required sources:**
- Genki/Minna no Nihongo sections on "reason/because" frames (Nから、Nので, Nため)
- Sequencing frames (V-te, V-ta ato de, Nを通して)
- Quotation frames (V-sou / Xと言う)
- Cross-references showing which frames feed other frames (e.g., quotation takes whole sentences as slots)

### [LENS] Open Item 5: JLPT Grammar Datasets (JSON/CSV)

**Status:** No datasets discovered in YouTube scan (not applicable medium). Requires direct web search.

**Next steps:**
- GitHub search: "JLPT grammar" + "JSON" OR "CSV" OR "dataset"
- License audit: CC0, CC-BY, MIT, or proprietary

---

## Recommendations for Next Phase

1. **Direct channel dive:** Extract 5 most-viewed videos from each of the 3 top channels, focusing on:
   - Explicit frame definitions (with video timestamps)
   - Closed vs. open slot identification
   - Textbook chapter cross-references

2. **Lens gap closure:**
   - Web search "Genki I chapter 4 position words complete list" → source a definitive version
   - Web search "Minna no Nihongo lesson breakdown grammar order" → find the lesson index
   - Targeted search: "hou ga ii N4 JLPT advice pattern Genki" → pin level and cross-reference

3. **Dataset discovery:** Shift to GitHub/Kaggle/Zenodo scans:
   - `JLPT` + `grammar` + `dataset` + `JSON`
   - License requirements per [LENS] item 5

---

## Raw Discovery Data

**Total videos scanned:** 60 (10 per query × 6 queries)  
**Channels identified:** 6 unique channels in 2+ queries  
**Views aggregate (top 3):** 18.5M  
**Queries per channel:** Range 2–4

---

**Report compiled:** 2026-09-17  
**Next action:** Deep-dive phase + web research on specific lens items
