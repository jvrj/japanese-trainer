# Academic Research Lane: Praktika App Analysis
**Date:** 2026-07-17  
**Lane:** Semantic Scholar (READ-ONLY)

## Status
**BLOCKED — API Rate Limiting**

The Semantic Scholar Graph REST API (keyless access) returned HTTP 429 (Too Many Requests) on all query attempts, even after 10+ second throttle periods. Without an API key, the rate limits are prohibitively strict and prevent query execution.

### Queries Attempted
1. `query=Praktika%20AI%20avatar%20language%20tutor%20conversation&limit=15`
2. `query=conversational%20AI%20language%20learning&limit=10`
3. `query=language%20learning%20agent&limit=5`
4. `query=dialog%20system&limit=5`

All returned HTTP 429.

## Recommendation
To resume this lane:
- **Option A:** Supply a Semantic Scholar API key (via `~/.claude/settings.local.json` or environment configuration) to access higher rate limits.
- **Option B:** Increase backoff and retry strategy beyond practical session execution time (~1 min per paper = 40+ papers × throttle time).

## Project Lens — Attempted Coverage
Per the project lens, this lane was designed to surface papers on:
- [LENS] AI-agent conversational capability (free-form vs. scripted dialogue)
- [LENS] LLM-based language tutoring systems
- [LENS] Dialogue system scaffolding for language learners
- [LENS] Language learning retention mechanics (streaks, emotional bonding)

None of these were retrievable due to API blocking.

## Partial Findings
**None.** No paper metadata was successfully fetched.

---

**Sources:** 0 papers successfully retrieved.  
**Confidence:** N/A (no data collected).
