# Delve 10 — Avatar presence: a face for the conversation

## Domain
Owner ask (2026-07-31, verbatim): "praktikas style of conversation works well in
the sense that, it has an avatar that the speaking can look at speak to. shall we
look into creating avatars? perhaps themed?" This re-opens Delve 6's presence
decision — the canvas orb (presentation-only, opt-in via `orbMode`, OFF by
default) — which shipped but is effectively invisible: default users still see an
emoji header. Meanwhile the cast already exists (CONVO_PARTNERS: 8 kana-named
themed personas with colors + flavors fed to the model). Grounding evidence:
`reports/hydra-research/2026-07-17-praktika/REPORT.md` — Praktika's avatar is a
LIABILITY (lip-sync lag, uncanny valley, can't disable; voice quality, not avatar
realism, drove +15% session length), so the question is not "avatar like
Praktika?" but "what presence form gives the learner something to look at while
speaking, without the documented failure modes?"

## Stacked REVISED callouts
> **REVISED 2026-07-17 per Delve 5** — conversation-first: the talk loop IS the
> app; presence serves the loop, never gates it.
> **REVISED per Delve 6** — orb = pure subscriber, never drives session logic;
> `_orbSet` seam at 5 wrap-points (speak start/end/error, listening, turn). Any
> new presence MUST reuse this seam, not add logic paths.
> **LOCKED (owner):** hands-free loop is the product; EN-primary chrome, content
> kana-only; universal-phone design (not Pixel-only); Praktika AVOID list binds:
> no photoreal, no lip-sync, always disableable.

## Primary
**Mode:** Opus-only

### Investigation tasks
1. **Presence form — pick FINAL:** (A) illustrated 2D character portraits,
   state-animated "VTuber-lite" (no mouth sync) vs (B) evolved orb promoted to
   default vs (C) hybrid (portrait framed by orb-state aura). Decide against the
   Praktika evidence + what a learner mid-speech actually looks at.
2. **Art pipeline — pick FINAL:** AI-generated portraits (owner generates from
   style-locked prompts; PNG/WebP assets in repo + sw.js cache) vs in-code
   SVG/CSS characters vs commissioned art deferred to v2. Must resolve: style
   consistency across the cast, asset weight budget on the PWA, fallback when an
   asset is missing, upgrade path from emoji.
3. **State & animation map — pick FINAL:** exact animation per state
   (idle/listening/thinking/speaking) driven ONLY by the existing `_orbSet`
   seam; how "speaking" reads as alive without a mouth; reduced-motion respect.
4. **Default & placement — pick FINAL:** default ON vs opt-in (orb's opt-in made
   it dead — decide with that datum); replaces `_convoPartnerHeader` vs a larger
   center-stage layout; disable path in Settings; keyless/scripted-mode parity.
5. **Cast scope — pick FINAL:** all 8 partners at v1 vs launch subset (3);
   partner↔scene affinity (cook hosts food talk?) vs current random pick;
   whether the avatar appears in the Facebook ad creative (positioning-v1 tie-in).

### Output
Primary doc: `delve-cycles/10-avatar-presence.md`
Sections: Charter · Method · one per task (1–5) · Decisions reached ·
Open questions · Foundation doc updates · ADR proposals.

## Adversaries
### Adversary 1: devils-advocate (LEAD)
**Read:** primary doc, Praktika REPORT, 6-talk-mode-presence.md, positioning-v1.md
**Audit:** (1) Is an avatar solving a real retention problem or copying a
competitor's liability? (2) Does any pick violate the AVOID list under pressure
(scope creep toward lip-sync)? (3) Is the art pipeline honest about the owner's
time + style-consistency risk? (4) Default-ON vs the orb's death: right lesson?
**Output:** `10-avatar-presence-devils-advocate.md`

### Adversary 2: code
**Read:** primary doc, index.html (orb module, renderConvo, _convoHeader, sw.js)
**Audit:** (1) Seam reuse — zero new logic paths, pure subscriber preserved.
(2) Asset loading on a single-file PWA (cache, offline, first-paint). (3) Render
cost on mid-range phones (not Pixel-only). (4) No HTML-sink exposure from asset
paths/names.
**Output:** `10-avatar-presence-code-review.md`

### Adversary 3: qa
**Read:** primary doc, index.html convo render paths
**Audit:** (1) Every state transition (incl. error/interrupt/mic-denied) has a
defined avatar behavior — no frozen faces. (2) Missing/slow asset fallback.
(3) Reduced-motion + small-viewport (320px) behavior. (4) Keyless demo parity.
**Output:** `10-avatar-presence-qa-design.md`

## Synthesis
`## Synthesis (Round 1 close — Delve 10)` appended to primary doc.
Foundation docs: DO_THIS_NEXT.md, docs/positioning-v1.md (ad-creative line).
ADR proposals likely: presence form + default; art pipeline.

## Definition of done
- [ ] Primary doc + 5 task sections
- [ ] 3 adversary docs filed
- [ ] Synthesis appended
- [ ] Foundation docs patched
- [ ] ADR proposals filed (pending dir, sequential numbering)
- [ ] User signoff

## Files this delve touches
Creates: delve-cycles/10-* (4 docs), docs/decisions-pending/*.
Modifies: DO_THIS_NEXT.md, docs/positioning-v1.md.
