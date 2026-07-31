# Avatar portrait prompts — style-locked batch (Delve 10 / ADR-020)

Source of truth: `docs/delve-cycles/10-avatar-presence.md` §4.2 (style-lock
contract) + §4.3 (asset spec). Generate **all 8 in ONE session with the same
tool** so the style stays consistent. For **Gate 0** you only need the first
two (あおい + はると) — generate those, send them back, and a mockup gets
composed before anything else is made.

## Tool + licensing note
Recommended: **Google Gemini (Imagen)** — its image output currently permits
commercial use, which we need before the portraits touch a paid ad. Re-check
the terms on the day you generate, and note the tool + date when you hand the
images over (it goes in the asset commit message).

## Output spec (what to save)
- Square image, ideally 1024×1024 or larger (it gets downscaled to 512×512 WebP later — I do that part).
- One character per image, no text anywhere in the image.
- Filenames: `aoi`, `haruto`, `yui`, `ken`, `sakura`, `riku`, `mio`, `sora` (any format — conversion is my job).

## The locked template (do not vary between characters)
Only the two `{...}` slots change per character. Everything else is the lock.

> Flat modern illustration, soft cel shading, clean line work, bust portrait,
> slight 3/4 view facing viewer, gentle closed-mouth smile, warm approachable
> expression, plain circular vignette background in {ACCENT COLOR}, no text,
> no logo, no watermark, consistent style across a set.
> Character: an age-neutral adult, {CHARACTER DESCRIPTOR}.

## Per-character prompts (copy-paste ready)

### 1. あおい (aoi) — GATE 0
Flat modern illustration, soft cel shading, clean line work, bust portrait, slight 3/4 view facing viewer, gentle closed-mouth smile, warm approachable expression, plain circular vignette background in soft violet purple (#9d5cff), no text, no logo, no watermark, consistent style across a set. Character: an age-neutral adult art student with a paint-flecked apron and a sketchbook, gentle and curious.

### 2. はると (haruto) — GATE 0
Flat modern illustration, soft cel shading, clean line work, bust portrait, slight 3/4 view facing viewer, gentle closed-mouth smile, warm approachable expression, plain circular vignette background in warm pink (#ff5d9e), no text, no logo, no watermark, consistent style across a set. Character: an age-neutral adult cheerful cook in a chef's apron, bright and energetic.

### 3. ゆい (yui)
Flat modern illustration, soft cel shading, clean line work, bust portrait, slight 3/4 view facing viewer, gentle closed-mouth smile, warm approachable expression, plain circular vignette background in sky blue (#5cc8ff), no text, no logo, no watermark, consistent style across a set. Character: an age-neutral adult singer with headphones around the neck, bubbly and chatty.

### 4. けん (ken)
Flat modern illustration, soft cel shading, clean line work, bust portrait, slight 3/4 view facing viewer, gentle closed-mouth smile, warm approachable expression, plain circular vignette background in soft mint green (#9fe9cf), no text, no logo, no watermark, consistent style across a set. Character: an age-neutral adult quiet thoughtful programmer in a comfy hoodie, calm and warm in a low-key way.

### 5. さくら (sakura)
Flat modern illustration, soft cel shading, clean line work, bust portrait, slight 3/4 view facing viewer, gentle closed-mouth smile, warm approachable expression, plain circular vignette background in warm amber yellow (#fbbf24), no text, no logo, no watermark, consistent style across a set. Character: an age-neutral adult kind teacher type holding a book, patient and encouraging.

### 6. りく (riku)
Flat modern illustration, soft cel shading, clean line work, bust portrait, slight 3/4 view facing viewer, gentle closed-mouth smile, warm approachable expression, plain circular vignette background in warm coral orange (#ff8a5c), no text, no logo, no watermark, consistent style across a set. Character: an age-neutral adult energetic adventurer in a light outdoor jacket, upbeat and ready for the weekend.

### 7. みお (mio)
Flat modern illustration, soft cel shading, clean line work, bust portrait, slight 3/4 view facing viewer, gentle closed-mouth smile, warm approachable expression, plain circular vignette background in fresh leaf green (#7ee787), no text, no logo, no watermark, consistent style across a set. Character: an age-neutral adult easy-going outdoorsy gardener in a sun hat, relaxed and gentle.

### 8. そら (sora)
Flat modern illustration, soft cel shading, clean line work, bust portrait, slight 3/4 view facing viewer, gentle closed-mouth smile, warm approachable expression, plain circular vignette background in soft lavender (#c9b3ff), no text, no logo, no watermark, consistent style across a set. Character: an age-neutral adult friendly traveler with a small backpack strap visible, bright and open.

## Acceptance gate (owner review, all 8 side-by-side — after Gate 0 passes)
1. Reads as ONE artist's set — same line weight, shading, palette temperature.
2. Legible at 128px (the smallest shipped render size).
3. No photoreal drift, no uncanny render.
4. Background tint matches the partner's accent color above.
5. Age-neutral adult, nothing suggestive, ad-safe.

Any single portrait that fails ships as the emoji fallback instead — it never
blocks the release. If ≥4 of 8 fail across two batches, we stop and ship the
aura-framed emoji as v1 (reversal condition, §4.5).
