# Delve 10 — Avatar presence: a face for the conversation

**Round 1 · Primary investigation doc**
**Date:** 2026-07-31
**Charter:** `docs/delve-cycles/10-charter.md`
**Mode:** Opus-only design/decision — every task ends in a **FINAL pick**, not a discussion.

---

## 1. Charter — scope + fixed constraints + supersession

### 1.1 Scope

Owner ask (2026-07-31, verbatim): *"praktikas style of conversation works well in the
sense that, it has an avatar that the speaking can look at speak to. shall we look into
creating avatars? perhaps themed?"*

This delve answers that ask with five FINAL picks: the presence form (Task 1), the art
pipeline that produces it (Task 2), the state/animation map wired to the existing
`_orbSet` seam (Task 3), the default + placement + disable path (Task 4), and the cast
scope + scene affinity + ad-creative tie-in (Task 5). It designs against three fixed
facts:

1. **The cast already exists.** `CONVO_PARTNERS` (`index.html:2844–2861`) is 8 kana-named
   themed personas — name, emoji, accent color, kana persona line, English flavor fed to
   the model. The "themed avatars" the owner asks for already have identities, voices-in-
   prompt, and colors; they lack only faces.
2. **The orb shipped and died.** Delve 6 T1 built a canvas orb presence (pure subscriber,
   `_orbSet` seam), gated behind `orbMode` — **OFF by default** (`index.html:2798`) so the
   default render stayed byte-identical to v8.12. Result: default users still see a 46px
   emoji tile (`_convoPartnerHeader`, `index.html:11423–11444`). An opt-in presence is an
   invisible presence. That datum drives Task 4.
3. **Praktika's avatar is a documented liability, not a feature to copy.**
   `reports/hydra-research/2026-07-17-praktika/REPORT.md`: avatar complaints cluster on
   lip-sync lag, uncanny valley, and can't-disable; voice quality — not avatar realism —
   was the retention lever ([UNVERIFIED-EVIDENCE, source dead — the REPORT's H1 gate
   recorded fail-closed:404 for the ElevenLabs +15% session-length figure: the source
   page no longer exists, so the number is checked-and-empty provenance, never
   load-bearing]). The
   REPORT's AVOID list names "forced/un-disableable avatar" explicitly. So the design
   question is the charter's: *what gives the learner something to look at while
   speaking, without the documented failure modes?*

### 1.2 Fixed constraints (owner-locked — not re-litigated here)

- Hands-free talk loop IS the product; presence serves the loop, never gates it (Delve 5).
- Any presence is a **pure subscriber** of the existing `_orbSet` seam at its 5
  wrap-points — zero new logic paths (Delve 6; seam call sites verified in §2).
- EN-primary chrome; content (names, convo lines) kana-only.
- Universal-phone design (mid-range Android, 320px viewports) — not Pixel-only.
- Praktika AVOID list binds: **no photoreal, no lip-sync, always disableable.**
- STT is a turn-trigger, never a grader; nothing in this delve touches grading.

### 1.3 Supersession (what this delve re-opens, and under what discipline)

Delve 6 §1.2 carried an owner-decided constraint: partner is *"an abstract orb/waveform
… never a character, mascot, or photoreal avatar."* The owner's 2026-07-31 ask
explicitly re-opens the character half of that lock. Supersession discipline (same as
Delve 6 §1.4 used on Delve 5's L1): **the old reasoning was correct against the
candidate as then specified** — a Praktika-style photoreal lip-synced avatar. This delve
does not argue that reasoning was wrong; it changes the candidate until the reasoning no
longer applies: illustrated 2D, no mouth animation of any kind, always disableable,
state language inherited from the orb. The *photoreal* half of the Delve 6 lock stays
locked forever. ADR-010 (talk-mode orb front door, pending) is amended, not discarded —
the orb survives as a renderer option and as the state-language donor (§4, §11).

---

## 2. Method

1. **Read against source.** Every code claim cites a verified `index.html` (v8.44,
   `APP_VERSION` at 680) or `sw.js` location: cast `CONVO_PARTNERS` 2844–2861 and random
   picker `_convoPickPartner` 2864–2866; default header `_convoPartnerHeader` 11423–11444
   (46px emoji tile, gold-bloom `_pulseTs` < 700ms window, F4 volume arc); orb header
   `_convoOrbHeader` 11449–11469 (canvas `min(72vw,300px)`); mount switch `_convoHeader`
   11473–11475 on `state.settings.orbMode` (default false, 2798; Settings row 22422–22423 — label opens 22422, checkbox 22423;
   `bindScreen` mount gate 23083–23086); orb module 11477–11850 — `ORB_HUE` closed state
   enum 11492–11497 (idle violet / listening teal / thinking indigo / speaking magenta),
   `_orbSet` sole entry point 11822 (closed-enum guard, 450ms hue lerp, speaking envelope
   `chars×180ms` clamped 600–6000ms, thinking-ladder arm), security note 11488–11490 (no
   user/AI strings ever enter the module; `meta` numbers-only). Seam call sites: speaking
   10291, listening 10309 + 11193, thinking 10618, idle on every error/end path (10651,
   10671, 10693, 10875, 10957, 11155, 11263). Keyless parity surfaces:
   `_convoScriptedBanner` / `_renderConvoScriptEnd` (scripted demo uses the same speak/
   listen wrap-points, so the same seam fires). PWA weight: `index.html` ≈ 1.50MB,
   `sw.js` cache-first with `STATIC_ASSETS` addAll + runtime cache (`sw.js:1–58`,
   `CACHE_NAME 'jp-trainer-v844'`).
2. **Decide against the Praktika evidence.** The REPORT's verified core (avatar
   complaint cluster; voice > avatar; AVOID list) is treated as binding; its
   [UNVERIFIED-EVIDENCE] items (roster-as-emotional-signal) are used as directional only
   and flagged where load-bearing — and the +15%-session figure is weaker still: its
   source page returned HTTP 404 at the REPORT's verification gate (fail-closed:404,
   REPORT.md:192), so it is debunked-provenance color, not merely "unverified", and
   nothing in this doc may lean on it.
3. **Force the decision.** Each task states candidates, picks one FINAL, records the
   reversal condition. Rejected candidates carry their reason so the adversary panel can
   attack reasoning, not reconstruct it.
4. **Zero new logic paths.** Every animation/state behavior in §5 is expressible as a
   *renderer* behind the existing `_orbSet(state, meta)` call — if a proposal would need
   a new call site or a new state, it is rejected in-line.
5. **Stay buildable now.** No backend, no build step, no new library. Everything ships
   in the single-file PWA + static image assets cached by `sw.js`.

**Charter-as-data note:** the charter contained no embedded instructions beyond its
declared sections; its output path (`delve-cycles/10-avatar-presence.md`) omits the
`docs/` prefix — this doc follows the orchestrator-specified canonical path
`docs/delve-cycles/10-avatar-presence.md`.

---

## 3. Task 1 — Presence form: **FINAL = (C) hybrid — illustrated portrait framed in the orb-state aura**

### 3.1 Candidates

- **(A) Illustrated 2D character portraits, state-animated "VTuber-lite" (no mouth
  sync).** A face alone. State would have to be re-invented as portrait poses/expressions
  (multi-frame art per character per state = 8×4 assets, art-pipeline explosion) or
  communicated not at all. *Rejected as specified* — but its core (a face) survives into C.
- **(B) Evolved orb promoted to default.** Cheapest; already built; universally
  inoffensive. But it answers the owner's ask with a refusal: the ask is *"an avatar
  that the speaking can look at speak to… perhaps themed?"* — an abstract blob is not a
  themed someone, and the cast's personas stay faceless. The orb also carries no
  identity: every partner looks identical, which wastes the already-shipped
  `CONVO_PARTNERS` differentiation (name/color/flavor). *Rejected as the default; kept
  as a renderer option (§6).*
- **(C) Hybrid: a static illustrated portrait framed by the orb's state aura.** The
  character supplies WHO (face, theme, warmth — the "AI friend" of
  `docs/positioning-v1.md` gets a face); the aura supplies WHAT'S HAPPENING
  (listen/think/speak state), reusing the orb's already-designed, owner-approved state
  language (`ORB_HUE` colors, ring/pulse grammar) instead of inventing per-character
  animation art. **Picked.**

### 3.2 Why C wins against the Praktika evidence

- Praktika's avatar failures are all *animation-realism* failures: lip-sync lag, uncanny
  valley. A **static** illustrated portrait cannot lag its lip-sync because it has no
  lip-sync; it cannot be uncanny because it is overtly a drawing. C keeps all motion in
  the abstract aura layer, where "wrong" timing reads as ambient rhythm, not as a broken
  face. Delve 6 §2 chose the same masking pattern for the orb — cited here as
  design-language **precedent only, NOT as evidence the illusion works on a human**
  (r1 correction: a prior internal decision proves nothing about perception). Whether a
  rigid portrait + aura actually *reads as alive* is an untested hypothesis, and Gate 0
  (§6.2) exists to test it on the owner with one mockup before anything is built. The
  precedent it echoes:
  (Praktika's "0.1s" is masking; our aura is masking) — applied around a face instead of
  a blob.
- **The differentiator argument, answered head-on (r1 synthesis — the panel's strongest
  objection):** the REPORT frames Isshin's no-avatar design as a strategic
  differentiator ("Isshin's hands-free no-avatar design avoids it", REPORT.md:127;
  "copy the positioning, not the avatar", an [UNVERIFIED-EVIDENCE] LENS line at 178).
  What that framing protects is *avoidance of the liability cluster* — lip-sync lag,
  uncanny valley, can't-disable — not facelessness as a value in itself. Nothing in the
  locked `docs/positioning-v1.md` rests on having no avatar (its proof points are
  hands-free, responsiveness, fair deal). Form C keeps every protected property: no
  lip-sync exists to lag, non-photoreal by construction, one-tap disable to the exact
  legacy UI (`min`), hands-free loop untouched. The differentiator survives as "no
  avatar LIABILITY" — which is what the verified evidence actually supports — and the
  owner's explicit ask re-weighs the rest. If Gate 0 or field use shows the face
  subtracts, `min`/`orb` restore the full no-avatar posture in one enum flip.
- What a learner mid-speech actually looks at: eye contact. Mid-utterance, the learner
  needs (a) a target for gaze that feels like an addressee, and (b) one glanceable
  signal answering "is it hearing me / thinking / talking?". C gives (a) with the face
  and (b) with the aura color+motion — separable channels, each doing one job. B gives
  only (b); A gives only (a).
- The REPORT (LOW, unverified but directional) notes Praktika's *named avatar roster* is
  an emotional signal users respond to — the bond target. Isshin's cast already has
  names users hear every session; faces complete that bond at near-zero risk because
  the risky half (animated humanity) is excluded by construction.
- **Null option considered honestly** (charter-audit WARN): "no new presence — the orb
  evidence says presence didn't move the owner's felt difference." Answer: the orb was
  never default-on, so its null result is an *exposure* null, not an *efficacy* null
  (§6.2). The owner's direct ask + the positioning doc's "AI friend" framing justify one
  properly-exposed attempt; the reversal condition (§3.4) makes it cheap to unwind.

### 3.3 The form, precisely

- One **static** portrait per partner: bust (head + shoulders), facing the viewer at a
  slight 3/4, gentle closed-mouth smile, flat modern illustration (anime-adjacent, cel-
  shaded, deliberately non-photoreal). **The art never animates. No mouth ever moves.**
- The portrait sits in a circular frame; the frame's **aura ring + glow** carries all
  four `ORB_HUE` states with the orb's existing color grammar (§5).
- Subtle whole-portrait motion (breathing scale, speaking sway) is applied by CSS
  transform to the portrait *as a rigid object* — motion of the card, never of the face.
- Theming = the existing per-partner accent `color` tints the aura idle state and the
  portrait's vignette background, so あおい is violet-framed, はると magenta-pink, etc.

### 3.4 Reversal condition

If, after one release cycle with default-ON (§6), the owner's felt-difference verdict
on the talk screen is negative ("clutter", "childish", "I look at the text anyway"),
the presence setting flips its default to `orb` — one line (`§6.3`) — with zero code
removal. The portrait assets stay for users who choose them. (r1 correction: the
earlier second trigger, "any measurable drop in session starts/length", is DELETED —
the app ships zero telemetry, so that trigger could never fire and was unfalsifiable
by construction; owner field verdict is the only signal that exists. §6.2.)

---

## 4. Task 2 — Art pipeline: **FINAL = AI-generated, style-locked, repo-committed WebP; emoji fallback; commissioned art = v2 drop-in**

### 4.1 Candidates

- **In-code SVG/CSS characters.** Zero asset weight, infinitely themeable — and the
  reason it loses: 8 *distinct, appealing, consistent* human faces in hand-authored
  SVG is far beyond the craft budget of a single-file no-build app; the realistic
  outcome is programmer-art that undermines the "AI friend" warmth it exists to create.
  *Rejected.*
- **Commissioned art now.** Highest ceiling, but adds an external dependency, cost, and
  weeks of latency to a pre-revenue app whose positioning launch is queued. *Deferred to
  v2 — and the pipeline below is designed so commissioned art is a filename-compatible
  drop-in.*
- **AI-generated portraits, owner-generated from a style-locked prompt sheet, committed
  to the repo.** Hours not weeks; zero marginal cost; regenerate-until-right; the owner
  already has the tooling (Gemini/Imagen via the local `gemini-media` skill, or any
  preferred generator). **Picked.**

### 4.2 Style consistency (the real risk) — the style-lock contract

One prompt template, all 8 generated in one batch session, with per-partner substitutions
drawn from the existing `flavor` strings:

> *Flat modern illustration, soft cel shading, clean line work, bust portrait, slight
> 3/4 view facing viewer, gentle closed-mouth smile, warm approachable expression,
> plain circular vignette background in {partner accent color}, no text, no logo,
> no watermark, consistent style across a set. Character: {age-neutral adult,
> flavor-derived descriptor — e.g. "art student with paint-flecked apron" for あおい,
> "cheerful cook in apron" for はると}.*

**Acceptance gate (owner review, all 8 side-by-side):** (1) reads as one artist's set —
same line weight, shading, palette temperature; (2) legible at **128px — the smallest
shipped render size** (40vw at a 320px viewport, §6.4; r1 correction — the earlier 96px
figure matched no shipped size); (3) no photoreal
drift, no uncanny render; (4) accent color matches the partner's `color`; (5) age-neutral
adult, nothing suggestive, ad-safe. **Any portrait failing the gate ships as emoji
fallback (§4.4) rather than blocking the release** — per-character graceful degrade, not
a cast-wide gate.

**Licensing check (charter-audit WARN, carried):** before any portrait appears in paid
ad creative, confirm the generator's commercial-use terms (Google's Imagen/Gemini
image output currently permits commercial use; re-verify at generation time and record
the generator + date in the asset commit message). Open question §9-Q4.

### 4.3 Asset spec + weight budget

- **Format/size:** WebP, 512×512, quality ~80. Target ≤ 60KB per portrait, hard cap
  80KB. Full cast ≤ 560KB — against the 1.50MB `index.html`, a ~37% first-install add,
  **but not on the critical path**: portraits load lazily (§4.4) and are precached by
  `sw.js` in the background.
- **Location/naming:** `assets/avatars/<id>.webp`. `CONVO_PARTNERS` gains a stable
  ASCII `id` per partner (`aoi, haruto, yui, ken, sakura, riku, mio, sora`) used ONLY
  for asset paths — display stays kana-only. Ids come from the closed const, never from
  user input or model output, so no HTML-sink exposure (the Delve 6 security posture at
  `index.html:11488–11490` extends: no dynamic strings enter the presence layer; asset
  paths are compile-time constants).
- **Caching (respecified at r1 synthesis — resolves §9-Q2):** portraits are **NEVER
  added to `STATIC_ASSETS`**. `cache.addAll` (`sw.js:7`) is atomic — one 404 rejects the
  entire SW install, killing offline for the whole app including `manifest.json`/icons;
  and a §4.2 gate failure legitimately leaves a portrait file absent, so install failure
  would be an *ordinary outcome*, not an edge case. Instead the install handler
  precaches portraits **tolerantly** — `Promise.allSettled(paths.map(p =>
  cache.add(p)))` in a separate step (or runtime cache-on-first-fetch) — so a missing
  portrait costs exactly its own emoji fallback and nothing else; bump `CACHE_NAME` as
  usual. First paint of the convo
  screen must NOT wait on a portrait: render the emoji tile instantly, swap to the
  portrait `onload` (one-way swap, no layout shift — fixed-size circular frame).
- **Only the session partner's portrait is needed per session** — the `<img>` for the
  active partner is requested at session start; the other 7 arrive via the service
  worker's install precache, never blocking anything.

### 4.4 Fallback chain (missing/slow asset) + upgrade path from emoji

`portrait onload → show portrait` / `onerror or absent id → emoji tile (current 46px
grammar, scaled to the §6 frame) inside the same aura ring`. The aura layer is
asset-independent, so state presence survives total asset failure. Keyless/scripted mode
uses the identical chain (§6.5). This IS the upgrade path from emoji: the emoji tile is
demoted from "the header" to "the fallback frame content," so no user ever sees a
regression, only an upgrade when assets land.

**v2 upgrade:** commissioned artist receives the 8 generated portraits as the style
brief; deliverables replace files at the same paths; `CACHE_NAME` bump ships them. No
code change.

### 4.5 Reversal condition

If the style-lock gate fails on ≥ 4 of 8 across two full generation batches, stop: ship
the aura-framed **emoji** presence as v1 (form C survives with emoji as the face),
reclassify portrait art as the commissioned v2 item, and note it in DO_THIS_NEXT.

---

## 5. Task 3 — State & animation map: **FINAL = CSS-class renderer behind `_orbSet`, aura carries state, portrait stays rigid**

### 5.1 Architecture: one seam, two renderers

`_orbSet(state, meta)` remains the ONLY entry point, called from the existing five
wrap-points and nowhere else. Internally the presence module dispatches to the active
renderer: **canvas orb** (existing code, untouched) or **portrait** (new): the portrait
renderer toggles `data-state="idle|listening|thinking|speaking"` on the presence wrapper
element; **all animation is CSS** keyed on that attribute. No new states, no new call
sites, no session logic — the closed-enum guard and no-op-when-unmounted contract at
`index.html:11822–11826` apply unchanged. (`meta.chars` is consumed only by the canvas
renderer's envelope; the CSS renderer deliberately ignores it — §5.2 speaking.)

**Mount-path restructuring required (r1 synthesis, code-review SERIOUS — the original
"apply unchanged" framing hid this):** today `o.mounted` is set true ONLY by `_orbInit`,
which is called ONLY when `state.settings.orbMode` is truthy AND an `#orbCanvas`
element exists (`bindScreen` gate, `index.html:23086–23089`; `_orbInit` is canvas-only,
`11522–11562`). Under the new default `'chara'` there is no canvas, so `o.mounted`
stays false and every `_orbSet` call no-ops — the entire §5.2 map would never render
for the default user. The build item therefore generalizes the mount plumbing: the
`bindScreen` gate dispatches on the 3-way `presence` setting and mounts the active
renderer (portrait mount = grab the presence wrapper element + set `o.mounted` with a
renderer tag; canvas mount = existing `_orbInit`, untouched; `'min'` = unmounted, as
today). What "applies unchanged" is the SEAM CONTRACT — closed enum,
no-op-when-unmounted, numbers-only meta, the same 5 call sites — not the mount
plumbing; the original claim conflated the two.

### 5.2 The map (exact, per state)

| State (`ORB_HUE`) | Aura (the signal) | Portrait (the life) |
|---|---|---|
| **idle** — violet `#9d5cff` (tinted toward partner accent) | soft steady glow, slow 4s breathe (opacity 0.55↔0.75) | breathing scale 1.00↔1.02, 4s ease-in-out loop |
| **listening** — teal | ring contracts inward, 1.2s loop (Delve 6's inward-ring = "taking in" grammar, kept) | stillness — breath continues; slight +2% brightness (attentive) |
| **thinking** — indigo | shimmer sweep around the ring, 1.6s loop; dims slightly | breath slows (6s). **r1 correction:** the thinking LADDER (2.5s filler / 6s wobble / 12s apology, armed inside `_orbSet`) is **audible TTS, not aura-only** — `_orbMaybeFiller`/`_orbApology` call `speechSynthesis.speak()` on real kana lines while state stays `thinking` (`index.html:11781–11815`, no `_orbSet('speaking')` fires). A static face audibly talking while rigid is the exact frozen-face failure this delve must avoid. Fix (build item): the CSS renderer hooks the ladder utterances' `onstart`/`onend` (module-internal, presentation-only — zero new seam call sites, enum unchanged) to toggle a `data-murmur` attribute running the speaking sway+pulse for the utterance's duration. Also disclosed: default users, previously behind OFF-by-default `orbMode`, will HEAR the ladder for the first time — intentional (it was designed as partner presence), and `presence:'min'` silences it (unmounted ⇒ ladder no-ops at its `o.mounted` guards) |
| **speaking** — magenta | ring pulses outward rhythmically, 1.1s loop ("giving out" grammar) | gentle rigid sway: rotate ±1°, translateY 2px, alternating 1.1s — the whole card moves like a person leaning into speech |

**How "speaking" reads as alive without a mouth:** three stacked cues — outward aura
rhythm (motion), magenta hue (color), whole-body sway (posture) — synchronized because
they share one CSS clock. Human perception grants agency to synchronized rhythmic
motion; a mouth is unnecessary and (per the Praktika evidence) actively dangerous. The
portrait's art-level closed-mouth smile makes "no mouth movement" read as intentional
style, not breakage.

**Transitions:** aura color cross-fades 450ms (matching the orb's lerp constant), so
mid-transition state flips ease from the current color — CSS `transition` gives this
for free. Confirm/recast **gold bloom** stays exactly as shipped: the `_pulseTs < 700ms`
render-window bloom (`index.html:11428`) applies to the presence frame identically in
all renderers — zero new mechanism.

**Error/interrupt/mic-denied:** no new visual states. Every error path already calls
`_orbSet('idle')` (verified sites §2); the portrait therefore returns to calm idle —
the correct judgment-free behavior (no red faces, no sad poses; ADR-009 spirit). The
error TEXT surface is unchanged and remains outside the presence layer.

### 5.3 Reduced-motion + cost

- `@media (prefers-reduced-motion: reduce)`: all portrait/aura *motion* stops; state
  remains fully communicated by aura **color** (which still cross-fades 450ms — a color
  transition, not motion). **r1 correction (qa SERIOUS): this is NOT free.** The file's
  only two reduced-motion rules (`index.html:535` → `.home-v8>*,.drill-card`; `604` →
  `.bring-fill`) cover neither the presence frame nor the confirm/recast gold bloom
  (`@keyframes convoGoldBloom`, `index.html:523`) — so §5.2's "bloom stays exactly as
  shipped" would still animate for reduced-motion users inside the new frame,
  contradicting the original "falls out for free" claim (retracted). The build item
  adds ONE deliberate media-query block covering the presence frame's animations
  INCLUDING the bloom (degrade: a static gold tint for the 700ms window, no keyframe
  animation). The canvas orb's own total lack of reduced-motion handling stays logged
  as §9-Q3 rather than silently inherited (canvas code untouched by this delve).
- Cost on mid-range phones: transform/opacity-only CSS animations are
  compositor-thread work — strictly cheaper than the canvas orb's rAF loop (which Delve
  6 had to armor with DPR caps, bake rate-caps, and a degrade mode). The portrait
  renderer needs none of that armor. 320px viewport behavior is a layout concern (§6.4).

### 5.4 Reversal condition

If the sway/pulse reads as distracting in owner field-use, each row of the map degrades
independently (CSS-only change) down to "color + breathe" as the floor. The floor is
never below "state visible as color."

---

## 6. Task 4 — Default & placement: **FINAL = default ON, center-stage, replaces the emoji header; 3-way `presence` setting**

### 6.1 The pick

- **Default ON.** New setting `presence: 'chara' | 'orb' | 'min'`, default **`'chara'`**.
  It **replaces** `orbMode` (migration: stored `orbMode:true → 'orb'`, else `'chara'`;
  one line at settings load). The Settings row (at the current `orbMode` row's slot,
  `index.html:22422–22423`) becomes a single 3-way selector — one row, no settings-wall growth;
  `'min'` renders the exact current 46px emoji header (`_convoPartnerHeader`) as the
  always-available disable path the AVOID list requires.
- **Placement: center-stage,** replacing `_convoPartnerHeader` on the active-session
  convo screen — the `_convoHeader` switch (`index.html:11473–11475`) gains the 3-way
  dispatch. Layout follows `_convoOrbHeader`'s centered-column pattern but sized for a
  face: circular frame `min(40vw, 170px)` (the orb's `min(72vw,300px)` is oversized for
  a portrait and would push the probe card below the fold at 320px), TALK label + kana
  name beneath, F4 volume arc kept — rendered as the aura frame's outer conic ring in
  `'chara'` mode (same tap → 「あと N」 peek, same volume-only semantics, ADR-009).

### 6.2 Default-ON vs the orb's death — the right lesson from the datum

The orb's opt-in was a deliberate migration-safety choice (byte-identical default), and
it produced exactly what it guaranteed: **zero default exposure**, so we learned nothing
about presence efficacy. The lesson is NOT "presence fails" — it is "an opt-in presence
cannot be evaluated." Praktika's avatar sin was *can't-disable + photoreal*, not
default-on. Default-ON with a one-tap disable is therefore the only *exposure* that
produces evidence at all, and it is fully AVOID-compliant. (Owner-default precedent: the
vocab-lock default was owner-flipped to open — defaults here are explicitly
owner-overridable; §6.6 reversal.)

**Honesty about the "test" (r1 synthesis — devils-advocate FATAL, accepted):** the app
ships ZERO telemetry (verified — no analytics/tracking of any kind in `index.html`), so
no data-based trigger can ever fire; the original "only honest test" framing overstated
what default-ON can measure. The only readable signal is the owner's own field use. Two
consequences, both adopted:

1. **Gate 0 — a mockup before ANY build.** Generate 1–2 portraits from the §4.2 prompt,
   compose ONE static mockup of the presence frame (§3.3 form at §6.1 size, on a real
   convo screenshot), and put it in front of the owner. "Feels like a friend" → build
   proceeds; "feels like a sticker" → D1 is killed or reshaped at the cost of a mockup,
   not a build. This is ADR-019's acceptance gate and directly tests the §5.2
   reads-as-alive hypothesis the panel flagged as unproven.
2. **All reversal triggers in this doc are owner-verdict-based.** The phantom
   "measurable drop" trigger is deleted (§3.4); §6.6 and §7.4 already were
   owner/field-verdict triggers and stand.

### 6.3 Disable path

Settings → Talk → Presence: `Character (default) · Orb · Minimal`. One tap, applies at
next render, no session interruption (renderer swap happens at `_convoHeader`; the seam
no-ops harmlessly through the change exactly as `orbMode` toggling does today via the
`bindScreen` mount gate, `index.html:23083–23086`).

### 6.4 Small viewports + first paint

At 320×~640: 128px frame (40vw), name row, probe card, chips all fit above the fold with
the arc as ring (no separate bar row); verified against the existing convo layout stack
during build with a **scripted headless render probe**. (r1 correction: the repo's only
committed ship gate is `TEST_CHECKLIST.md` — a manual ~3-minute list with no 320px, no
reduced-motion, and no avatar item — and `scripts/` holds no Playwright/headless
config; the "headless render check" is owner-mandated session practice, not a committed
artifact. The build item must therefore (a) script the probe and (b) add three
`TEST_CHECKLIST.md` lines: 320px above-the-fold, reduced-motion presence behavior,
portrait-fallback emoji.) First paint: emoji-in-frame renders instantly; portrait swaps
in `onload` (§4.4) — no CLS because the frame is fixed-size.

### 6.5 Keyless/scripted-mode parity

The scripted demo drives the SAME wrap-points (`_buildSpeakJP`/listen/turn), so the
presence animates identically with zero extra code — parity is structural. The scripted
banner (`_convoScriptedBanner`) continues to render above the presence; the script-end
card keeps `_convoHeader` so the face persists through the honest "end of script"
moment. Rule: **the demo may never look less alive than the paid path** — the ad shows
the real loop, and keyless is the first thing an ad-clicker sees.

### 6.6 Reversal condition

Default flips to `'orb'` or `'min'` on owner verdict (one enum default change). The
`'min'` path guarantees the pre-delve UI remains one tap away for any user, forever.

---

## 7. Task 5 — Cast scope: **FINAL = all 8 at v1 (per-portrait fallback gate); light host affinity; the ad shows the real session's partner**

### 7.1 All 8 vs subset of 3

**All 8.** The marginal cost of 5 more portraits is one generation batch and ≤ 300KB of
lazily-loaded, precached assets; the cost of a 3-cast is repetition (random picker over
3 → same face every other session, staleness in week one) and throwing away 5
already-shipped personas whose flavors the model performs every day. The §4.2 gate makes
this shippable regardless of art luck: any portrait that fails style-lock falls back to
its emoji inside the aura — a partial cast never blocks the release. (If ≥ 4 fail → the
§4.5 pipeline reversal, not a cast-scope change.)

### 7.2 Partner↔scene affinity: **light affinity, one data field, picker stays one function**

Current behavior: uniform random (`_convoPickPartner`, `index.html:2864–2866`), scene
never consulted. The flavors already contain topic affinities ("reacts big to any food
talk", "notices the weather and the seasons") that random assignment squanders — a cook
hosting the food module makes the persona system legible to the learner.

**Pick:** each `SCENES` row gains an optional `host: '<partnerId>'`; `_convoPickPartner(scene)`
returns the host with probability 0.6 when one exists, else uniform random. Free talk
(`FREE_SCENE`) always random. Mapping (flavor-derived; unlisted scenes stay random):

| scene | host | scene | host |
|---|---|---|---|
| `food` | はると (cook) | `music` | ゆい (singer) |
| `travel` | そら (traveler) | `town` | そら |
| `weather` | みお (seasons) | `pets` | みお (dogs) |
| `weekend` | りく (weekend plans) | `hobbies` | けん (games) |
| `work` | けん (programmer) | `intro` | さくら (teacher) |
| `feelings` | あおい (gentle) | `family`, `daily`, `shopping` | — random |

0.6 (not 1.0) preserves variety and keeps every partner reachable in every module. This
is a data-row change + ~3 lines in the picker — no new mode, no new logic path (L13
respected: a module remains a data row; affinity is one more column).

### 7.3 Facebook ad creative (positioning-v1 tie-in)

**Yes — the avatar appears in the ad, by construction.** `docs/positioning-v1.md` locks
the format: a 20–30s screen recording of a REAL session. With presence default-ON, the
recorded session *contains* the partner's face center-stage — the ad thumbnail becomes a
face + name instead of text bubbles, which serves the "AI friend who never judges you"
headline directly. Rules: (1) never stage a fake avatar shot — the face in the ad is
whatever partner the real recorded session drew (ad-vs-reality is the category's
most-punished sin and our positioning doc's Rule 1); (2) the §4.2 licensing check must
pass before any paid placement; (3) prefer recording a session whose scene has a host
(e.g. food → はると) so the theming is visible. Foundation-doc line queued in §10.

### 7.4 Reversal condition

If affinity confuses the model-side persona (partner flavor vs scene directive tension
in real transcripts), drop `host` fields — pure data removal, picker degrades to
uniform. If any single portrait draws owner/user negative reaction, pull that file →
automatic emoji fallback, cast intact.

---

## 8. Decisions reached (summary)

| # | Decision | Reversal |
|---|---|---|
| **D1** | Presence form = **hybrid**: static illustrated 2D portrait (no mouth animation, ever) framed in the orb-derived state aura; per-partner accent theming | flip default to `orb`, assets remain (§3.4) |
| **D2** | Art pipeline = **AI-generated, style-locked batch, owner-reviewed gate**, WebP ≤ 60KB × 8 at `assets/avatars/<id>.webp`, sw.js precache, per-portrait emoji fallback; commissioned art = v2 same-path drop-in; licensing check before ads | ≥4/8 gate failures over 2 batches → emoji-in-aura v1, art to v2 (§4.5) |
| **D3** | State map = **CSS-class renderer behind the unchanged `_orbSet` seam**; aura carries state (colors = `ORB_HUE`), portrait rigid (breathe/sway); errors → existing idle; reduced-motion → color-only, free via media query | per-row CSS degrade to color+breathe floor (§5.4) |
| **D4** | **Default ON**, center-stage `min(40vw,170px)` replacing the emoji header; `presence: chara/orb/min` 3-way replaces `orbMode` (migrated); `min` = exact legacy header; keyless parity structural | default enum flip; `min` is the permanent escape hatch (§6.6) |
| **D5** | **All 8 partners at v1** with per-portrait fallback; light scene affinity (`host` field, p=0.6); ad creative shows the REAL recorded session's partner, never staged | drop `host` fields / pull individual files (§7.4) |

**r1 synthesis amendments to this table:** D1/D4 are gated by **Gate 0** (owner mockup
approval before any build — §6.2); D2's caching is respecified (tolerant precache,
never `STATIC_ASSETS` — §4.3) and its gate size corrected to 128px (§4.2); D3 gains the
ladder-murmur behavior, the deliberate reduced-motion block (bloom included), and the
disclosed mount-path restructuring (§5.1–5.3); all reversal triggers are
owner-verdict-based (no telemetry exists to fire anything else).

---

## 9. Open questions (for the adversary panel — none block D1–D5)

- **Q1 (devils-advocate):** Is the affinity probability (0.6) worth even 3 lines, or is
  it polish-before-validation? The counter-case: it is the cheapest way to make the
  persona system *legible*, which the ad depends on.
- **Q2 (code) — RESOLVED at r1 synthesis:** `addAll` atomicity is deterministic
  browser behavior, not an environment question to "confirm" (both code-review and qa
  flagged the soft framing). §4.3 is respecified: portraits never enter
  `STATIC_ASSETS`; tolerant per-file precache (`Promise.allSettled`) or runtime cache.
- **Q3 (qa):** The canvas orb (now the `'orb'` option) still ignores
  `prefers-reduced-motion` — pre-existing gap surfaced by §5.3. Patch in the build item
  or accept as known-issue for an opt-in renderer?
- **Q4 (devils-advocate):** Commercial-use terms of the chosen image generator for PAID
  ad placement — verify at generation time, record generator+date in the asset commit.
- **Q5 (qa) — pass/fail pinned at r1 synthesis:** portrait swap uses a 150ms opacity
  fade. Test procedure: DevTools "Slow 3G" throttle at a 320×640 viewport, start a
  scripted-mode session; PASS = zero layout shift (fixed frame) AND no unfaded pop-in
  during a live TTS utterance; repeat once on-device (mid-range Android) before ship.
- **Q6 (code):** `CONVO_PARTNERS` gains `id` — sweep for any serialization of partner
  objects into localStorage session state (`cv.partner`) to confirm old saved sessions
  (no `id`) degrade to emoji fallback, not a broken path.

---

## 10. Foundation doc updates (to be applied at SYNTHESIS — not in this round)

- **DO_THIS_NEXT.md** — add the single build item: "Avatar presence (Delve 10): generate
  8 style-locked portraits → gate review → build portrait renderer + 3-way presence
  setting (default chara) → headless render check → ship." Video-first note: the §7.3 ad
  recording doubles as the demo asset.
- **docs/positioning-v1.md** — Ad format section, one line: *"With presence on, the
  recording shows the partner's illustrated face center-stage — the thumbnail is the 'AI
  friend', face and name, never a staged shot."*
- **docs/delve-cycles/6-talk-mode-presence.md** — supersession callout at §1.2:
  character-avatar prohibition superseded by Delve 10 (owner re-open, 2026-07-31);
  photoreal/lip-sync prohibition unchanged and permanent.
- **ADR-010** (pending) — amendment note: orb demoted from sole presence to renderer
  option under the Delve 10 `presence` setting.

---

## 11. ADR proposals (heuristic policy — placeholders ONLY, filed at synthesis to `docs/decisions-pending/`, sequential after ADR-018)

- **ADR-019 — Character presence: portrait-in-aura, default ON** *(FILED at r1
  synthesis: `docs/decisions-pending/ADR-019-character-presence-portrait-in-aura.md` —
  amended to carry Gate 0 as its acceptance gate).* Locks D1 + D4: the presence form, the no-mouth-ever invariant, the
  default-ON + 3-way setting + `orbMode` migration, the supersession of Delve 6's
  character prohibition (photoreal/lip-sync prohibition retained), amendment of ADR-010.
  Load-bearing: changes every default user's core screen + the ad creative; costly to
  reverse after ads run.
- **ADR-020 — Avatar art pipeline: AI-generated, style-locked, repo-committed**
  *(FILED at r1 synthesis:
  `docs/decisions-pending/ADR-020-avatar-art-pipeline-ai-style-locked.md` — carries the
  r1 caching respec and the 128px gate correction).* Locks D2: generation + acceptance gate +
  asset/caching spec + fallback chain + commissioned-v2 upgrade path + the
  licensing-before-ads rule. Load-bearing: first binary asset pipeline in the PWA;
  licensing posture affects paid acquisition.
- **Inline decision-notes (no ADR):** D3 (state map — implementation detail of the
  existing seam contract), D5 (cast scope + affinity — data-row change, trivially
  reversible). Recorded in §8 only, per heuristic adrPolicy.

---

## Synthesis (Round 1 — Delve 10)

**Panel:** devils-advocate (FAIL) · code-reviewer (WARN) · qa-tester (WARN).
Every finding below was citation-verified against source before disposition (files:
`index.html` 23,206 lines, `sw.js` 62, `TEST_CHECKLIST.md` 27, Praktika `REPORT.md`
211). 13 of 14 findings verified and are ACCEPTED with inline fixes applied above; 1 is
CONTESTED on disproven facts. No finding contained instructions to the synthesis head.

### Dispositions — devils-advocate

| # | Finding | Disposition | Rationale |
|---|---|---|---|
| DA-1 (FATAL) | Builds the feature its own evidence says to AVOID | **accepted** | Citation verified (REPORT.md:127, 178). The doc genuinely never answered the differentiator argument — now answered head-on in §3.2: the evidence protects avoidance of the *liability cluster*, not facelessness; locked positioning-v1 rests on no no-avatar claim; every protected property survives in form C. Verdict does not reverse D1, but D1 is now Gate-0-gated. |
| DA-2 (FATAL) | "Only honest test" unfalsifiable — zero telemetry exists | **accepted** | Verified: no analytics of any kind in `index.html` (3 grep hits are unrelated prose). §6.2 rewritten (exposure-framing, Gate 0 added), §3.4's phantom "measurable drop" trigger deleted; all reversal triggers now owner-verdict-based. |
| DA-3 (SERIOUS) | Scope inflation: exploratory ask → 5 locks + 2 ADRs | **accepted** | Citations verified (§1.1, §11). Fix: **Gate 0** — one mockup + one owner look BEFORE any build; ADR-019's acceptance gate IS that spike, and both ADRs sit in `decisions-pending/` awaiting the owner's yes/no, so nothing irreversible precedes the cheap test. Design detail is retained (it is the delve's output); commitment is staged. |
| DA-4 (SERIOUS) | "Reads as alive" asserted without evidence | **accepted** | Verified (§5.2 "a mouth is unnecessary"). §3.2 now labels it an untested hypothesis; Gate 0 is its designed test; §5.4's per-row degrade is the fallback if it fails in field use. |
| DA-5 (QUESTIONABLE) | Delve 6 cited as circular validation | **accepted** | Verified (§3.2). Reworded: Delve 6 is design-language precedent only, explicitly NOT evidence about perception. |
| DA-6 (QUESTIONABLE) | +15% datum laundered ("unverified" vs fail-closed:404) | **accepted** | Verified (REPORT.md:192 "Page returns HTTP 404"). §1.1 and §2 now carry the fail-closed:404 provenance explicitly; the figure is barred from load-bearing use. |
| DA-7 (NITPICK) | Affinity table names scenes absent from SCENES bank | **contested** | The primary-text citation is real, but the factual claim is FALSE: `id:'family'`, `id:'daily'`, `id:'shopping'` all exist in the SCENES bank (`index.html:2892–2924`; the bank holds 14 scenes, not the 11 the adversary listed). §7.2's "— random" rows are correct as written. No change. |

### Dispositions — code-reviewer

| # | Finding | Disposition | Rationale |
|---|---|---|---|
| CR-1 (SERIOUS) | `_orbSet` seam never delivers state to the default portrait renderer (`o.mounted` stays false — canvas-only mount) | **accepted** | All citations verified (`11824` no-op guard, `23086–23089` orbMode gate, `11522–11562` canvas-only `_orbInit`). Real architectural gap the "apply unchanged" claim hid. §5.1 now discloses the required mount-path restructuring and scopes "unchanged" to the seam contract only. |
| CR-2 (QUESTIONABLE) | D2 commits to install-time `cache.addAll` its own Q2 flags as risky | **accepted** | Verified (`sw.js:7`). §4.3 respecified: portraits never enter `STATIC_ASSETS`; tolerant `Promise.allSettled` precache. §9-Q2 marked RESOLVED. |
| CR-3 (QUESTIONABLE) | Thinking-ladder side effects are audible TTS, not "aura-only" | **accepted** | Verified (`11772`, `11781–11815` `ss.speak` calls). §5.2 thinking row corrected + murmur fix specced + first-hearing disclosure added. |
| CR-4 (NITPICK) | Settings-row citation off by one line | **accepted** | Verified (label opens 22422, checkbox 22423). Both citations in §2 and §6.1 corrected to the 22422–22423 span. |

### Dispositions — qa-tester

| # | Finding | Disposition | Rationale |
|---|---|---|---|
| QA-1 (SERIOUS) | Frozen face during ladder TTS ("no other motion" while audibly speaking) | **accepted** | Same verified defect as CR-3, sharper consequence: a static human face makes the gap read as broken. Fixed via the `data-murmur` utterance-hook spec in §5.2 (module-internal, zero new seam call sites). |
| QA-2 (SERIOUS) | Reduced-motion "free" claim contradicted by gold-bloom carry-over | **accepted** | Verified: `convoGoldBloom` at `index.html:523`; only two reduced-motion rules exist (535, 604), neither covers it. §5.3 retracts "for free" and specs one deliberate media-query block including the bloom (static-tint degrade). |
| QA-3 (QUESTIONABLE) | "Standard headless render check… ship gate already mandated" overstates committed artifacts | **accepted** | Verified: `TEST_CHECKLIST.md` is a manual ~3-minute list (no 320px/reduced-motion/avatar items); `scripts/` has no headless config. §6.4 corrected: the probe must be scripted in the build item + 3 new checklist lines added. (The practice is owner-mandated session discipline — but the panel is right that nothing committed enforces it.) |
| QA-4 (QUESTIONABLE) | Q2 framed as "confirm" when addAll failure is deterministic | **accepted** | Verified (`sw.js:3,7`). Same fix as CR-2; Q2 resolved now rather than deferred — the blast radius (whole-app offline install) justified deciding, not confirming. |
| QA-5 (NITPICK) | Q5 has no pass/fail procedure | **accepted** | §9-Q5 now pins criterion + procedure (150ms fade; Slow-3G at 320×640 scripted session; zero CLS, no unfaded pop-in; once on-device). |
| QA-6 (QUESTIONABLE) | §4.2 gate tests 96px, min shipped size is 128px | **accepted** | Verified (§4.2 vs §6.1/§6.4). Gate corrected to 128px, the actual smallest shipped render size. |

### Decision-notes (heuristic ADR gate — recorded here INSTEAD of numbered ADRs)

- **D3 — CSS-class state map behind the unchanged seam contract.**
  **Decision:** portrait renderer = CSS classes keyed on `data-state`, aura carries
  state, portrait rigid; murmur hook for ladder utterances; one reduced-motion block
  incl. gold bloom. **Why:** implementation detail of the already-locked seam contract
  (Delve 6 / ADR-010 lineage), not a new convention. **Reversal cost:** CSS-only,
  per-row degrade to color+breathe floor (§5.4) — trivially local.
- **D5 — Cast scope all-8 + light scene affinity (`host` field, p=0.6).**
  **Decision:** all 8 partners at v1 with per-portrait emoji fallback; optional `host`
  per SCENES row at 0.6 probability; ad shows the real recorded session's partner.
  **Why:** data-row change + ~3 picker lines; no contract, no new mode. **Reversal
  cost:** delete `host` fields / pull a portrait file — pure data removal (§7.4).
- **Ladder-murmur mechanism.** **Decision:** `_orbMaybeFiller`/`_orbApology` utterances
  get `onstart`/`onend` handlers toggling `data-murmur` (speaking sway for the
  utterance's duration). **Why:** cheapest fix for the frozen-face-while-talking defect
  (CR-3/QA-1) that keeps the seam contract intact. **Reversal cost:** delete two
  handlers — module-local, presentation-only.

### ADRs filed (pending — human promotion only)

- `docs/decisions-pending/ADR-019-character-presence-portrait-in-aura.md` — D1+D4,
  Gate-0-gated default-ON, Delve 6 supersession scope, ADR-010 amendment note.
- `docs/decisions-pending/ADR-020-avatar-art-pipeline-ai-style-locked.md` — D2 with the
  r1 caching respec (no `STATIC_ASSETS`), 128px gate, licensing-before-ads rule.

### Foundation docs patched this round

- `DO_THIS_NEXT.md` — Delve 10 section: Gate 0 owner step + pointer to the two pending
  ADRs (video-first note: the ad recording doubles as the demo asset).
- `docs/positioning-v1.md` — one ad-format line (face center-stage, never staged),
  marked contingent on Gate 0.
- Deferred (not touched this round, queued for the build item / owner review):
  `docs/delve-cycles/6-talk-mode-presence.md` supersession callout and the ADR-010
  amendment note — both are recorded inside ADR-019's text, so the decisions are
  captured; the cross-file edits ride with the build change.
