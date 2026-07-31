# Delve 10 — Adversary: code review

**Target:** docs/delve-cycles/10-avatar-presence.md (committed d7b5964145f3c9f4aae33e260157244b5e722795)
**Lens:** seam reuse / zero-new-logic-paths, asset loading on a single-file PWA, render cost, HTML-sink exposure.
**Method:** every line-numbered claim in the primary doc's Method section and per-task citations was re-verified against the live index.html (23,206 lines) and sw.js (62 lines) in the working tree. Charter also read for embedded-instruction risk; none found.

## Citation-accuracy pass (housekeeping, not a finding)
Every specific index.html or sw.js line citation checked (2798, 2844-2861, 2864-2866, 10291, 10309, 10618, 10651, 10671, 10693, 10875, 10957, 11155, 11193, 11263, 11423-11444, 11449-11469, 11473-11475, 11477-11850, 11488-11490, 11492-11497, 11822-11826, 22423, 23083-23086, sw.js 1-7, APP_VERSION at 680) resolved to exactly what the doc claims. This is an unusually well-sourced primary doc; the findings below are architectural/logical, not citation fabrications.

## Findings

### 1. SERIOUS: the "unchanged orbSet seam" claim does not actually deliver state to the new default (portrait) renderer as designed
Citation (primary doc), section 5.1: the orbSet(state, meta) function "remains the ONLY entry point... Internally the presence module dispatches to the active renderer: canvas orb (existing code, untouched) or portrait (new)... the closed-enum guard and no-op-when-unmounted contract at index.html:11822-11826 apply unchanged."

Citation (source):
- index.html:11824 -- "if(!o.mounted) return; /* no-op: not mounted (orbMode off / navigated away) */"
- index.html:23086-23089 (bindScreen) -- "if(state.screen === 'convo' && state.settings.orbMode){ const orbEl = document.getElementById('orbCanvas'); if(orbEl) _orbInit(orbEl); else _orbUnmount(); } else { _orbUnmount(); }"
- index.html:11522-11562 (_orbInit) -- canvas-specific setup only: canvasEl.getContext('2d'), DPR sizing, glow-canvas + ring-canvas creation. No non-canvas mount path exists in the current source.

o.mounted (the flag every orbSet call is gated on at line 11824) is currently set true exclusively by _orbInit, and _orbInit is currently called exclusively when state.settings.orbMode is truthy AND an #orbCanvas element exists in the DOM (an element only _convoOrbHeader renders). Under the primary doc's own D4 pick, the new default presence value is 'chara' (portrait), not 'orb'. The portrait renderer's markup (section 3.3: circular frame, img tag, aura ring -- no canvas element) will not produce an #orbCanvas element, so under the bindScreen logic quoted above, _orbInit is never called for the default mode, o.mounted stays false, and every orbSet(...) call from the five wrap-points becomes a documented no-op for the default user.

That means the entire section 5.2 aura state map -- the load-bearing mechanic of D1/D3, where the aura is supposed to supply "WHAT'S HAPPENING" -- would not render for anyone on the new default, unless bindScreen's gate and/or _orbInit's canvas-only setup are restructured to also mount for presence === 'chara'. That restructuring is itself new logic in bindScreen/_orbInit that the doc's own Method rule ("if a proposal would need a new call site or a new state, it is rejected in-line") does not cover, because the gap is in the mounting plumbing around the seam, not in the seam's call sites or its enum. The doc asserts this plumbing "applies unchanged" without addressing that "unchanged" is precisely what breaks the default renderer. This is the single biggest engineering gap in an otherwise well-grounded design and should be resolved (a new mount predicate, or explicit acknowledgment that _orbInit/bindScreen need modification) before D3/D4 go to ADR-019.

### 2. QUESTIONABLE: D2's committed spec bakes in the exact install-time cache.addAll mechanism that section 9 Q2 flags as unverified, and does not reconcile it with section 4.2's per-portrait graceful-degrade
Citation (primary doc), section 4.3: "add the 8 paths to sw.js STATIC_ASSETS (install-time cache.addAll, sw.js:7)... bump CACHE_NAME" and section 8 D2 row: "WebP <= 60KB x 8 at assets/avatars/<id>.webp, sw.js precache..." versus section 9 Q2: "one 404 in addAll rejects the whole install. Mitigation to verify at build: runtime-cache portraits instead of install-time addAll, or tolerate-failure wrapper."

Citation (source): sw.js:7 -- "caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))". Cache.addAll is atomic-or-nothing: if any one request in the array fails, the entire promise rejects and nothing (including the pre-existing manifest.json/icons) gets cached.

The doc's own section 4.2 gate explicitly allows a partial cast: "Any portrait failing the gate ships as emoji fallback... per-character graceful degrade, not a cast-wide gate." A partner whose portrait fails the gate has no committed file at assets/avatars/<id>.webp. If section 4.3's spec is followed literally -- all 8 paths listed in STATIC_ASSETS regardless of gate outcome -- the missing file(s) will 404 inside cache.addAll and, per the source semantics and per the doc's own Q2 admission, fail the entire service-worker install, silently regressing existing offline behavior for manifest.json/icons too. Section 4.3 presents the mechanism as settled while section 9 Q2 treats the very same mechanism as an open risk requiring a different approach -- the FINAL decision and the open question are in tension, and the doc does not note that the most likely trigger for Q2's risk is its own section 4.2 partial-cast/fallback path, not just a flaky network. This should be resolved (e.g. only list gate-passed paths in STATIC_ASSETS, or switch to runtime caching) before D2 is treated as fully specified.

### 3. QUESTIONABLE: thinking-ladder side effects (audible filler/apology TTS) are attributed to "aura-only" visible effect, understating that they are audible, and inherit the same mounting gap as Finding 1
Citation (primary doc), section 5.2 table, "thinking" row: "The existing thinking LADDER (2.5s filler / 6s wobble / 12s apology, armed inside _orbSet) stays logic-side and untouched -- its visible effect in portrait mode is aura-only."

Citation (source): index.html:11772 -- "o.timers.filler = setTimeout(_orbMaybeFiller, 2500)" and lines 11781-11796 / 11800-11815 -- _orbMaybeFiller/_orbApology call speechSynthesis.speak(...) with filler lines and an apology line, i.e. they produce audio, not just visual state.

Calling this "visible effect... aura-only" undersells that the ladder's real effect is an extra spoken utterance queued into speechSynthesis -- a session-audible behavior, not a rendering detail. This is pre-existing Delve 6 behavior so it is not new, but the phrasing implies the ladder is inert-except-visually in portrait mode, when in fact (assuming Finding 1 is fixed so orbSet actually runs for 'chara' mode) a user on the new default would newly start hearing these filler/apology lines for the first time in the shipped product, since they were previously latent behind an OFF-by-default orbMode. That behavior change deserves an explicit call-out rather than being folded into "zero new mechanism."

### 4. NITPICK: Settings row citation is one line off
Citation (primary doc), section 6.1: "The Settings row (at the current orbMode row's slot, index.html:22423)".
Citation (source): index.html:22422 is the label/word-row line containing "Talk orb (beta)"; 22423 is the checkbox input inside it. Not material -- the row spans both lines -- but strictly the row's opening tag is 22422, not 22423.

## Verdict rationale
No FATAL findings: the doc's line-level citation discipline is excellent (every specific index.html/sw.js reference checked resolved correctly), the seam's call sites are genuinely unchanged, and no HTML-sink/security regression was found (asset ids are closed-const strings, never user/model input, consistent with the existing orbSet security posture at 11488-11490). But Finding 1 is a real, verifiable gap between "the seam is unchanged" and what the DEFAULT presence mode actually requires from bindScreen/_orbInit to work at all -- it should be fixed or explicitly scoped into the build item before ADR-019/020 are filed, and Finding 2 shows the D2 FINAL spec directly conflicts with its own flagged open question rather than resolving it.

**Verdict: WARN**
