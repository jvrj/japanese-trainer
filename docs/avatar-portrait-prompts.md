# Avatar portrait prompts — style-locked batch (Delve 10 / ADR-020, amended 2026-08-02)

Source of truth: `docs/delve-cycles/10-avatar-presence.md` §4.2 (style-lock
contract) + §4.3 (asset spec), as amended by ADR-019/020 Amendment 2026-08-02.
**Gate 0 is CLOSED** — あおい passed owner review (style 4 "stylized 3D",
Praktika-Skye-tuned, live demo approved 2026-08-02). This doc now carries the
locked template for the remaining 7.

## Tool + licensing note
Locked generator: **OpenAI gpt-image-1** (Images API, `quality: high`,
1024×1024) — commercial use of outputs is permitted under OpenAI's terms
(re-check on generation day; record generator + date in the asset commit
message before any paid ad use). Rate limit: **5 images/min** — batch ≤5 or
sleep 65s between batches. Generate all remaining portraits in ONE session so
the style stays consistent.

## Output spec (what to save)
- 1024×1024 PNG (downscaled to 512×512 WebP ≤80KB later — that conversion is a build step).
- One character per image, no text anywhere in the image.
- Filenames: `aoi` (done), `haruto`, `yui`, `ken`, `sakura`, `riku`, `mio`, `sora`.
- Each accepted portrait then gets talk/half/blink frames built procedurally
  (PIL + cv2 TELEA inpaint — see `.state` scratch scripts; per-face coordinate
  map required, so regenerating a portrait invalidates its frame set).

## The locked template (do not vary between characters)
Only the two `{...}` slots change per character. Everything else is the lock.
This is the exact wording that produced the accepted あおい.

> Glossy stylized 3D animated movie render, premium mobile app avatar.
> Natural realistic facial proportions with moderately sized expressive eyes
> (NOT oversized anime eyes), soft subsurface skin, realistic strand-detailed
> hair, soft cinematic studio lighting, high polish.
> Character: {CHARACTER DESCRIPTOR}.
> Bust portrait, slight 3/4 view facing viewer, warm genuine closed-mouth
> smile, light natural blush, plain circular vignette background in
> {ACCENT COLOR}, no text, no logo, no watermark.

**Why the old template died:** its locked "age-neutral adult" descriptor
produced stale, ambiguously-male faces (owner rejection, 2026-08-01). The cast
is now explicitly gendered and characterful — balanced 4 women / 4 men.

## Per-character descriptors (drop into the template)

### 1. あおい (aoi) — ✅ DONE (Gate 0)
Accent: soft violet purple (#9d5cff). Descriptor: a charming young adult
Japanese woman art student, long dark hair with a soft violet streak,
paint-flecked apron over a cream top, holding a sketchbook.
Accepted asset: `.state/gate0/styles/aoi_final_c2.png` (+ `_talk/_half/_blink`).

### 2. はると (haruto)
Accent: warm pink (#ff5d9e). Descriptor: a cheerful young adult Japanese man
cook, short tousled dark hair, chef's apron over a rolled-sleeve shirt, bright
energetic warmth.

### 3. ゆい (yui)
Accent: sky blue (#5cc8ff). Descriptor: a bubbly young adult Japanese woman
singer, shoulder-length softly wavy dark hair, headphones around her neck,
chatty sparkling warmth.

### 4. けん (ken)
Accent: soft mint green (#9fe9cf). Descriptor: a quiet thoughtful young adult
Japanese man programmer, neat dark hair, round glasses, comfy hoodie, calm
low-key warmth.

### 5. さくら (sakura)
Accent: warm amber yellow (#fbbf24). Descriptor: a kind Japanese woman teacher
in her early thirties, neat shoulder-length dark hair, soft cardigan, holding
a book, patient encouraging warmth.

### 6. りく (riku)
Accent: warm coral orange (#ff8a5c). Descriptor: an energetic young adult
Japanese man adventurer, short sporty dark hair, light outdoor jacket, upbeat
weekend-ready energy.

### 7. みお (mio)
Accent: fresh leaf green (#7ee787). Descriptor: an easy-going young adult
Japanese woman gardener, loose dark hair under a straw sun hat, linen shirt,
relaxed gentle warmth.

### 8. そら (sora)
Accent: soft lavender (#c9b3ff). Descriptor: a friendly young adult Japanese
man traveler, slightly wavy dark hair, small backpack strap visible over a
casual jacket, bright open expression.

## Acceptance gate (owner review, all 8 side-by-side)
1. Reads as ONE artist's set — same render polish, lighting, palette temperature.
2. Legible at 128px (the smallest shipped render size).
3. Stylized-3D stays stylized: no photoreal drift, no uncanny render.
4. Background tint matches the partner's accent color above.
5. Characterful but ad-safe: nothing suggestive, no brand lookalikes.

Any single portrait that fails ships as the emoji fallback instead — it never
blocks the release. If ≥4 of 8 fail across two batches, we stop and ship the
aura-framed emoji as v1 (reversal condition, §4.5).
