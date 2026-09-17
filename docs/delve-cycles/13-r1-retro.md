# Delve 13 — Round 1 retro verdict (verbatim)

Recorded here because round 2 cites it and it otherwise existed only in the run output.
Source: the round-1 retro devils-advocate gate, run `wf_be3843a1-7ac`, 2026-09-16.

**Verdict: FAIL** — held at PAUSED instead of COMPLETE (delivery gap, not a rethink).

**Reason, verbatim:**

> Charter intent largely delivered and measurement is verifiably honest, but D8/D9/D10 are
> arithmetically impossible at roundSize 10 (43 of 76 ladders hold 11–12 words), and 2 adversary
> findings were mis-accounted as a clean 21/21 sweep. Round 2 warranted.

**Round-1 run facts (from the same result):**

| | |
|---|---|
| Commits | primary `e1e0a01` · adversaries `3967c24e` · synthesis `701b4466` — all three backstop PASS |
| Findings / dispositions | 21 / 21 |
| Citation audit | 21 adopted findings checked, **0 fabricated**, 0 self-reported unverified |
| Claimed artefacts | 4 checked, 0 false claims |
| ADRs filed (pending) | ADR-027 tile is a shelf of pieces · ADR-028 three tiers · ADR-029 family size tiered · ADR-030 verify then measure |
| Charter gate (r1) | WARN — "55%-piece is inflated by just-shipped form tiles (really 40%), task 1 is leading, the tile-vs-piece axis question is missing, and measurement isn't a gate" |

**Note on the "2 mis-accounted findings":** the retro states the count but not which two, and it
produced no per-finding artefact. Round 2 must therefore re-audit **all 21 independently** and report
the true count, whatever it turns out to be — including the possibility that the retro's count is
wrong. The number 2 is recorded here as provenance, not as a target.
