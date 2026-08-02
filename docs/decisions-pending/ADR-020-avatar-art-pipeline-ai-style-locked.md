# ADR-020 — Avatar art pipeline: AI-generated, style-locked, repo-committed

- **Status:** Proposed (pending owner signoff; executes only if ADR-019's Gate 0
  passes)
- **Date:** 2026-07-31
- **Source:** Delve 10 — `docs/delve-cycles/10-avatar-presence.md` (D2, as
  amended by the Round-1 synthesis: caching respecified away from
  `STATIC_ASSETS`/`addAll`, gate size corrected to 128px)
- **Related:** ADR-019 (consumes these assets); positioning-v1 (licensing rule
  binds paid ad placement)

## Context

Eight distinct, consistent faces are needed. Hand-authored SVG is beyond the
craft budget of a single-file no-build PWA; commissioned art adds cost + weeks
to a pre-revenue launch. AI generation by the owner from a style-locked prompt
sheet is hours-not-weeks with regenerate-until-right — and the pipeline is
designed so commissioned v2 art is a filename-compatible drop-in. This is the
app's first binary-asset directory, so the caching posture is load-bearing:
`cache.addAll` is atomic, and one missing portrait (a legitimate outcome of the
acceptance gate) must never break the whole app's offline install.

## Decision

1. **Generation:** owner generates all 8 in one batch session from the single
   style-lock prompt template (primary doc §4.2), per-partner descriptors drawn
   from existing `flavor` strings. Age-neutral adults, ad-safe, non-photoreal.
2. **Acceptance gate (per portrait, owner review, all 8 side-by-side):** one
   artist's set (line weight/shading/palette); legible at **128px** (the
   smallest shipped render size); no photoreal drift; accent color matches the
   partner's `color`. **A failing portrait ships as emoji fallback — never
   blocks the release.**
3. **Assets:** WebP 512×512 q~80, target ≤60KB, hard cap **80KB** each; full
   cast ≤**640KB**. Paths `assets/avatars/<id>.webp` with a new compile-time
   ASCII `id` per partner (asset paths only — display stays kana-only; ids never
   come from user/model strings, extending the Delve 6 no-dynamic-strings
   security posture).
4. **Caching (r1 respec):** portraits are **NEVER added to `sw.js
   STATIC_ASSETS`** (atomic `addAll` would make one 404 kill the entire offline
   install). Tolerant precache instead — `Promise.allSettled` of individual
   `cache.add` calls (or runtime cache-on-first-fetch) — plus `CACHE_NAME` bump.
   First paint never waits on a portrait: emoji-in-frame renders instantly,
   portrait swaps `onload` with a 150ms fade, fixed-size frame ⇒ zero CLS.
5. **Licensing rule:** before any portrait appears in PAID ad creative, verify
   the generator's commercial-use terms at generation time and record generator
   + date in the asset commit message.
6. **v2 upgrade path:** commissioned artist receives the 8 generated portraits
   as the style brief; deliverables replace files at the same paths; no code
   change.

## Amendment 2026-08-02 (Gate 0 outcome — generator, style, cast)

1. **Generator locked by practice:** OpenAI **gpt-image-1** (Images API,
   `quality: high`, 1024×1024), driven via API rather than owner-manual
   generation. Commercial use of outputs permitted under OpenAI terms
   (re-verify + record generator/date in the asset commit per Decision 5).
   Operational note: 5 images/min rate limit.
2. **"Age-neutral adults" is superseded.** That locked descriptor was the root
   cause of the rejected stale/male-reading あおい. The cast is explicitly
   gendered and characterful — balanced 4 women / 4 men — per the rewritten
   `docs/avatar-portrait-prompts.md`.
3. **Style lock is now stylized 3D** (Praktika-Skye-tuned animated-movie
   render), not flat/cel. "No photoreal drift" gate item still applies.
4. **Per-partner frame sets:** each accepted portrait gets procedurally built
   `talk/half/blink` frames (PIL + cv2 TELEA). Asset spec applies per frame
   (4 files per partner); regenerating a portrait invalidates its frame
   coordinate map.

## Acceptance gate (numeric)

- **≥5 of 8** portraits pass the per-portrait gate within **≤2** generation
  batches; every shipped file **≤80KB**; total added asset weight **≤640KB**;
  licensing check recorded **before** the first paid ad impression.

## Reversal trigger (numeric)

- **≥4 of 8** portraits fail the gate across **2** full batches → stop: ship
  the aura-framed **emoji** presence as v1 (form C survives), reclassify
  portrait art as the commissioned v2 item, note in DO_THIS_NEXT.md. Any single
  portrait drawing owner/user negative reaction → delete that **1** file ⇒
  automatic emoji fallback, cast intact.
