# ADR-023 — Legacy-track disposition + spine retirement (migration = none)

- **Status:** Accepted (owner signoff 2026-08-11)
- **Date:** 2026-08-06
- **Source:** Delve 11 — `docs/delve-cycles/11-drill-progress.md` §4 + §6 (as
  amended by the Round-1 synthesis: corrected `_spineModel` consumer map,
  expected-frozen verification note, demonstrated imported-backup path)
- **Related:** ADR-021 (the surface replacing the spine), ADR-022 (credit
  plumbing); supersedes the Delve 5-era "path to a real conversation" Home
  framing (owner anchor 2026-08-03: conversation + avatar BENCHED for paid v1).

## Context

The Home spine header ("Your path to a real conversation", five kana stages,
bottleneck-min bar) gates every stage ≥2 on tracks only buried legacy modes can
feed — the 0% freeze itself — and re-leads Home with the benched conversation
product. Nothing visible may depend on stores the shipped surface cannot feed.

## Decision

1. **Spine retired:** header replaced by the ADR-021 card; the five kana
   stages are buried (removed from Home AND the detail sheet); the
   "conversation" H1 framing removed. `_spineModel`/`_spineSelfTest`/
   `SPINE_STAGES` go **dormant** (uncalled, not deleted — cheap reversibility;
   verified sole callers are `_spineHeaderHtml` + the console self-test, so
   deletion later cannot touch the sheet). `placedStage` stays in state.
2. **Legacy tracks:** verbs-in-all-forms → keep-in-sheet (honest, still
   earnable; *expected-frozen* for drill-only users — verification must not
   read its stasis as regression); sentences-drilled → display removed, data
   kept; **Conversational Core % → display removed everywhere** (sheet
   headline card, Practice meta line); weekly snapshots keep recording all
   fields.
3. **Migration = none:** no store renamed, rewritten, or deleted; export
   schema (version:6) untouched; the owner's profile unfreezes by arithmetic
   alone. Backfills that would fabricate word-credit from non-word-keyed
   stores are rejected as a one-way door. Imported-backup tolerance lives on
   the READ side (null-guarded formula), never in import-time mutation.

## Acceptance gate (numeric)

- Post-ship grep: **0** render-path call sites for `_spineStagePct` /
  `_spineHeaderHtml` / Conversational Core % display (self-test excluded).
- Owner profile: bar renders **> 0%** where today it renders 0%.
- Export→import round-trip on a pre-change backup: **0** schema-field
  differences (envelope stays version:6) and **0** uncaught exceptions on
  first Home render.
- Detail sheet: verbs Conjugation card renders finite values (**0** NaN) on
  all 4 fixtures, including one with empty `formStats`.

## Reversal trigger (numeric)

- If a production-shaped sentence drill ships and feeds a sentence store
  within **2 releases**, reopen the sentences-display removal (the data was
  kept for exactly this).
- If conversation un-benches, the stage/journey framing may return via the
  dormant `_spineModel` — reinstatement requires reopening this ADR and
  ADR-021's reopen-before-unbench clause together (**both**, not either).
- Dormant spine code may be deleted only after **1 full release cycle** with
  **0** owner requests for the stage view.
