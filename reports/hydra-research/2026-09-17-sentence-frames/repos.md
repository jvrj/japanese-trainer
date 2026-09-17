# Repo-mining pass — sentence-frames research (2026-09-17)

Read-only metadata resolution for repos surfaced during the sentence-frames scan. Mention counts are the orchestrator's, unchanged.

| Repo | Mentions | Stars | Last commit | Classification | Note |
|---|---|---|---|---|---|
| taishi-i/awesome-japanese-nlp-resources | 1 | 1008 | 2026-09-15 | other (curated list) | Curated list of Japanese NLP resources — libraries, LLMs, dictionaries, corpora, datasets; includes Claude Code skills to search them. |
| jamsinclair/open-anki-jlpt-decks | 4 | 241 | 2026-03-12 | tool (Anki deck generator) | Open-source, updatable JLPT vocabulary Anki decks. |
| davidluzgouveia/kanji-data | 1 | 232 | 2026-02-27 | tool (dataset) | JSON kanji dataset with updated JLPT levels and WaniKani info. |
| aiko-tanaka/grammar-dictionaries | 1 | 95 | 2023-11-04 | other (dataset, no description) | Grammar dictionaries repo; no README description surfaced via API. |
| elzup/jlpt-word-list | 1 | 93 | 2023-04-04 | other (dataset, fork) | Japanese word list from JLPT vocabulary; flagged as a fork upstream. |
| coolmule0/jlpt-n5-n1-japanese-vocabulary-anki | 1 | 62 | 2026-08-25 | tool (Anki deck generator) | Script generating a JLPT N5–N1 Japanese vocabulary Anki deck (published on AnkiWeb). |
| anchori/jlpt-kanji-dictionary | 5 | 38 | 2025-05-02 | tool (dataset) | Structured Kanji/vocabulary JSON datasets by JLPT level with English/Russian translations, for language apps/NLP/study tools. |
| naghim/awesome-japanese-study-materials | 1 | 43 | 2026-09-07 | other (curated list) | Study materials/resources for JLPT prep, beginner through advanced. |
| bluskyo/jlpt_vocabulary | 5 | 25 | 2026-07-15 | tool (dataset) | tanos.co.uk vocabulary lists converted to JSON/CSV. |
| renairisu/jlpt_kanji_json_msgpack | 1 | 11 | 2025-08-21 | tool (dataset) | Kanji dataset for JLPT N1–N5 filtered from kanjiapi.dev; JSON + MessagePack formats for fast lookup in learning apps. |
| smallsan/jlpt_kanji_json_msgpack | 1 | 11 | 2025-08-21 | tool (dataset, transferred) | Same repo as above — GitHub API redirects this owner/name to the canonical `renairisu/jlpt_kanji_json_msgpack` (repo transfer); metadata is shared. |
| kananinirav/jlptbenkyo | 1 | 8 | 2026-04-16 | other (study materials) | Free JLPT N5–N1 study materials: vocabulary, kanji, grammar. |
| mxggle/anki-jlpt-n1-grammar-example-sentences | 1 | 5 | 2026-08-13 | tool (Anki deck) | JLPT N1 grammar example sentences with audio and word-by-word breakdown, packaged as an Anki deck (Chinese-authored README). |
| a-anderson/jlpt-vocab-builder | 3 | 1 | 2026-08-30 | tool (build pipeline) | Builds a ~6,000-word JLPT N4–N1 vocab CSV for Anki from Jitendex/JMdict + Kanjium/NHK pitch accent + local Ollama LLM for furigana/translation. |
| agascocompte/noken | 1 | 0 | 2026-09-16 | other (study guide, Spanish) | Spanish-language JLPT N5 reference guide (Minna no Nihongo I): vocab, grammar, verbs, kanji, exercises. |

Notes:
- All 15 repos resolved successfully via the GitHub REST API (no rate-limit/404 misses).
- `smallsan/jlpt_kanji_json_msgpack` returns HTTP 301 → `renairisu/jlpt_kanji_json_msgpack` (same underlying repository ID); both rows are kept per the orchestrator's dedup input but share identical metadata.
- None of these are skill/agent/hook/plugin/mcp-server infra — all are JLPT vocabulary/kanji/grammar datasets, Anki deck generators, or curated study-material lists (crossCreator:false across the board, consistent with the sentence-frames/vocab research lens).
