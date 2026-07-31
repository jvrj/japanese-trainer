# Delve 10 — QA/verification-design audit (Adversary 3)

**Target:** `docs/delve-cycles/10-avatar-presence.md` (committed d7b5964)
**Charter audit prompts (§Adversaries → Adversary 3):** (1) every state transition
(incl. error/interrupt/mic-denied) has a defined avatar behavior — no frozen faces;
(2) missing/slow asset fallback; (3) reduced-motion + small-viewport (320px)
behavior; (4) keyless demo parity.

**Untrusted-data note:** both the primary doc and the charter were read as data.
Neither contains embedded instructions directed at this auditor (the primary doc's
own "Charter-as-data note" in §2 is itself a compliant example of this discipline,
not an attempt to redirect me). No prompt-injection finding to report.

**Method:** cross-checked every code citation the primary doc relies on against
`index.html` (v8.44, confirmed at `index.html:680`), `sw.js`, and `TEST_CHECKLIST.md`
in the actual repo tree (no git history diving needed — working tree matches d7b5964
for these files). Most citations verified clean (`CONVO_PARTNERS` 2844–2861,
`_convoPickPartner` 2864–2866, `_convoPartnerHeader` 11423–11444, `_convoOrbHeader`
11449–11469, `_convoHeader` 11473–11475, `ORB_HUE` 11492–11497, `_orbSet` 11822, all
11 seam call sites, `sw.js` `CACHE_NAME 'jp-trainer-v844'`, Settings row 22423,
`bindScreen` gate 23083–23086, SCENES ids for the §7.2 host table, `assets/` absent
from the tree). The findings below are the material gaps found during that
cross-check, not citation errors.

---

## Findings

### F1 — SERIOUS: Thinking-ladder filler/apology TTS lines produce audio with a portrait the doc's own table says has "no other motion" — a frozen face during speech

The primary doc's Task 3 map (§5.2) assigns the **thinking** row: *"Portrait: breath
slows (6s); no other motion. The existing thinking LADDER (2.5s filler / 6s wobble /
12s apology, armed inside `_orbSet`) stays logic-side and untouched — its visible
effect in portrait mode is aura-only."*

But the ladder's filler and apology rungs are not silent. `_orbMaybeFiller`
(`index.html:11781-11789`) and `_orbApology` (`index.html:11800-11814`) each call
`ss.speak(u)` on a real `SpeechSynthesisUtterance` — kana lines "んー…",
"そうですね…", "ちょっと まってね" (filler) and "ごめんね、いま かんがえてるよ"
(apology) — **without ever calling `_orbSet('speaking', …)`**. State stays
`'thinking'` throughout. Per the primary doc's own table, that means during these
audio events the portrait sits perfectly rigid (no sway, no lip movement by design)
while the learner hears the partner's voice — the exact "frozen face while it's
clearly talking" failure mode the charter told this auditor to check for (charter
Adversary 3, item 1: "no frozen faces"). The devils-advocate/code lens may not catch
this since it requires tracing the ladder timers' actual TTS calls, not just the
`_orbSet` call sites the doc's Method section lists.

This is pre-existing orb behavior (the orb has always had this mismatch), but the
primary doc newly ships a **face** into that gap — an abstract blob not-sway-ing
during a filler line reads as ambient; a static human face not moving while a voice
comes out of it reads as broken/uncanny, which is precisely the Praktika failure mode
D1 was designed to avoid (§3.2: "it cannot be uncanny because it is overtly a
drawing" — true for lip-sync, not obviously true for a face that never moves *at all*
while clearly speaking).

**Citation:** primary doc §5.2 table, thinking row — `"no other motion... its visible
effect in portrait mode is aura-only"`; source `index.html:11772` (filler armed),
`index.html:11781-11789` (`_orbMaybeFiller` → `ss.speak`), `index.html:11800-11814`
(`_orbApology` → `ss.speak`), neither calling `_orbSet('speaking', …)`.

**Recommendation:** either (a) route the filler/apology lines through the same
`_orbSet('speaking', {chars})` → `_orbSet('listening'/'thinking')` transition used by
`_convoSpeakJP`, giving the portrait its sway during these lines too (zero new call
sites — reuses the existing seam, consistent with the doc's own L-rule), or (b) if
kept aura-only by design, add a minimal portrait cue (e.g. the breath-slow continues
but doesn't freeze solid) and record this explicitly as an accepted trade-off rather
than silently asserting "no other motion" covers it.

### F2 — SERIOUS: Reduced-motion claim ("all motion stops") is contradicted by the doc's own gold-bloom carry-over

§5.3 states: *"`@media (prefers-reduced-motion: reduce)`: all portrait/aura *motion*
stops; state remains fully communicated by aura **color**... This falls out of the CSS
renderer for free."*

§5.2 separately states the confirm/recast gold bloom is unchanged: *"Confirm gold
bloom stays exactly as shipped: the `_pulseTs < 700ms` render-window bloom
(`index.html:11428`) applies to the presence frame identically in all renderers —
zero new mechanism."*

Verified in source: `@keyframes convoGoldBloom` (`index.html:523`) animates a
`filter:drop-shadow(...)` from 0 → 16px glow → 0 over 0.45s. The file's only two
`prefers-reduced-motion` rules (`index.html:535` and `604`, confirmed by direct
search) target `.home-v8>*,.drill-card` and `.bring-fill` respectively — **neither
covers `convoGoldBloom`**. So a reduced-motion user will still see the drop-shadow
bloom fire on every confirm/recast inside the new presence frame, directly
contradicting "all portrait/aura motion stops... falls out for free." The doc's own
Q3 (§9) flags that the canvas orb ignores reduced-motion entirely, but doesn't
connect that the **same pre-existing gap rides into the new portrait/aura frame
unchanged** via the explicitly-reused gold-bloom mechanism — this isn't a new bug the
build item introduces, but it is a live contradiction inside the primary doc's own
reduced-motion claim, and it undermines the doc's confidence language ("free").

**Citation:** primary doc §5.3 `"all portrait/aura *motion* stops... falls out of the
CSS renderer for free"` vs §5.2 `"gold bloom stays exactly as shipped... applies to
the presence frame identically in all renderers — zero new mechanism"`; source
`index.html:523` (`@keyframes convoGoldBloom`), `index.html:535`, `index.html:604`
(the file's only two reduced-motion rules, neither matching).

### F3 — QUESTIONABLE: §6.4's "standard headless render check... the ship gate this
project already mandates" overstates what the repo actually has

The repo's only documented ship gate is `TEST_CHECKLIST.md`, whose header reads:
*"Manual regression checklist / Run after every deploy. Takes ~3 minutes."* It is a
human-executed list of 21 manual steps (open on phone, tap buttons, eyeball results)
— there is no committed Playwright/headless config or script in the repo (checked
`scripts/`: only `check-accuracy-surfaces.js` and `check-banned-words.js`, neither a
render/viewport check). `TEST_CHECKLIST.md` has no 320px-viewport item and no
avatar/portrait item today. §6.4's claim that the 320px "128px frame... fits above
the fold" will be "verified... during build with the standard headless render check"
therefore names a verification mechanism that isn't codified as claimed — this is the
QA lens's core concern ("are the proposed verification checks sound and
non-hallucinated?"). It may be a real informal practice this session, but as written
in a doc meant to survive to synthesis/ADR, it reads as an existing automated gate
that doesn't exist in this repo's checked-in artifacts, and the doc adds no new
checklist line item for it going forward on a change that touches every default
user's core screen.

**Citation:** primary doc §6.4 `"verified against the existing convo layout stack
during build with the standard headless render check (the ship gate this project
already mandates)"`; source `TEST_CHECKLIST.md:1-3` (`"Manual regression checklist...
Run after every deploy. Takes ~3 minutes"`), no 320px/portrait item in its 21 steps.

**Recommendation:** add an explicit `TEST_CHECKLIST.md` line item (320px viewport +
`prefers-reduced-motion` + emoji-fallback render) at build time, and stop describing
the manual checklist as a "headless render check" in doc language that will get
copied into the ADR/foundation-doc updates at synthesis.

### F4 — QUESTIONABLE: Q2's install-time `cache.addAll` risk is framed as a thing to
"confirm," but it is deterministic browser behavior, not a maybe

§9-Q2 says: *"confirm GitHub Pages + `sw.js` addAll behave on install failure (one 404
in `addAll` rejects the whole install)."* `Cache.addAll()` is specified/documented to
reject the entire install atomically if **any** request 404s — this is not
environment-dependent behavior needing confirmation, it is guaranteed. If the 8
avatar paths are added to `sw.js`'s `STATIC_ASSETS` (`sw.js:3`, currently
`['./manifest.json','./icon-192.png','./icon-512.png']`) per §4.3's literal
instruction ("add the 8 paths to `sw.js STATIC_ASSETS`"), a single missing/renamed
portrait file breaks the **entire app's** offline install, not just avatars — this is
a bigger blast radius than the "open question, doesn't block D1-D5" framing suggests,
since D2 (§4.3) currently prescribes the exact mechanism that triggers it.

**Citation:** primary doc §9-Q2 `"confirm GitHub Pages + sw.js addAll behave on
install failure"` and §4.3 `"add the 8 paths to sw.js STATIC_ASSETS (install-time
cache.addAll, sw.js:7)"`; source `sw.js:3` (`STATIC_ASSETS`), `sw.js:7`
(`cache.addAll(STATIC_ASSETS)`).

**Recommendation:** promote from "open question to confirm" to a hard requirement in
D2/ADR-020: runtime-cache the 8 avatar paths (not `addAll`), or wrap `addAll` in a
per-file tolerant `Promise.allSettled`, before the `STATIC_ASSETS` change ships —
otherwise a single bad filename regresses offline load for the whole app, silently,
on next `CACHE_NAME` bump.

### F5 — NITPICK: Q5 (portrait swap during live TTS) has no defined pass/fail test

§9-Q5 raises a real concern (`"Portrait swap onload during a live TTS utterance —
confirm no visible pop at 320px; consider a 150ms opacity fade on swap"`) but
specifies no test procedure (device class, network throttle, or objective
"pop"/no-pop criterion) and is left as an open question the way the doc explicitly
allows (§9 header: "none block D1–D5"). Flagging only so it's not lost at synthesis:
this needs a concrete repro step (e.g. throttle to Slow 3G, load convo screen, watch
for a layout/opacity jump) before it can be called verified.

**Citation:** primary doc §9-Q5.

### F6 — QUESTIONABLE: §4.2 acceptance gate is entirely manual/subjective with no
defined test size matching the shipped frame

The gate criterion "(2) legible at 96px" is checked at a size (96px) that does not
match where the portrait actually ships: §6.1 places the frame at
`min(40vw, 170px)` — larger than 96px on every viewport ≥240px wide, meaning the
96px legibility bar is stricter than production (fine) but the gate never explicitly
checks legibility at the *actual* smallest shipped size (128px at 320px viewport per
§6.4). Not a blocker, but the gate's stated test size and the shipped size are two
different numbers with no explicit reconciliation — worth a one-line fix at build
time (check legibility at the real minimum render size, not just 96px).

**Citation:** primary doc §4.2 `"(2) legible at 96px"` vs §6.1
`"circular frame min(40vw, 170px)"` vs §6.4 `"128px frame (40vw)"`.

---

## Verdict

No FATAL findings — the doc's seam-reuse discipline, error/mic-denied handling
(`_orbSet('idle')` fires correctly on every verified error path, including the fatal
`not-allowed`/`service-not-allowed` STT branch at `index.html:11263`, with
`cv.error = _sttErrMsg(err)` carrying the human-visible message outside the presence
layer), and keyless structural parity all check out against source. But two SERIOUS
gaps (F1 frozen-face-during-audio in the thinking ladder, F2 reduced-motion
contradiction) are concrete, source-verified regressions in the doc's own acceptance
story for the exact two things this auditor's charter prompt named ("no frozen
faces," "reduced-motion... behavior"), plus a verification-mechanism overstatement
(F3) that affects whether the panel can trust the doc's "verified at build" claims.

**WARN** — findings are fixable without reopening D1–D5 (F1/F2 are CSS/logic-routing
fixes at build time, not design reversals), but they should not be filed to synthesis
as already-resolved.

**Type:** qa · **Doc:** `docs/delve-cycles/10-avatar-presence-qa-design.md`
