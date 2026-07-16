# Delve 5 — Conversation-First Product Restructure (the world-class de-sprawl)

> **Repo root:** `C:\Users\Julius\Documents\GitHub\japanese-trainer` — every repo-relative path in this charter resolves against that root, and ALL git operations (status, add, commit, show, ls-files) must run with that directory as cwd (`cd` there first).

## Domain

Isshin (`index.html`, single-file vanilla-JS PWA, ~21k lines, no build) has a working conversation mode (おしゃべり, Delve 1), a progressive-vocab meter (Delve 2), and a locked productization architecture (Delve 4: subscription ~$8.99/mo, Supabase proxy, RevenueCat, Capacitor — all Accepted, none built). But the app a stranger opens today is a **workshop with ~15 doors** (`convo, sentenceCoach, kanaBlitz, forms, formBlitz, blitz, buildMode, today, phrases, progress, collections, modules, speakDrills, focus, settings`) — the opposite of the owner's own mandate ("the hands-free voice drill loop IS the app") and of what a sellable product needs.

**The owner's product thesis (2026-07-16):** the endgame is **talking to an AI friend/teacher — a real conversation, with zero subconscious judgment**. Every surface must either BE that conversation or visibly train you for it.

**Grounding evidence:** `reports/hydra-research/2026-07-16/REPORT.md` (competitive teardown). Its load-bearing findings for this delve:
- H2: **no app is Japanese-primary + conversation-first** — the white space Isshin should occupy; positioning is "Japanese-first, conversation-first, judgment-free."
- H3: **judgment-free is engineered, not declared** — latency, TTS warmth, and correction *framing* ("I heard X, did you mean Y?", no accuracy %, feedback optional) carry the feeling. Jumpspeak's false-positive STT and Duolingo's guilt loops are the anti-patterns.
- H1: Langua is the UX benchmark — free-form chat, **post-conversation feedback that never interrupts flow**; Isshin's beginner segment needs *more* scaffolding than Langua offers.
- Onboarding lane: inverted onboarding (product-first, signup-deferred), **first spoken exchange in <60–90s**, two-path entry (true beginner skips placement; returnees get a ~3-question router).
- M3: streaks retain but conflict with judgment-free → **optional, no-shame, private-by-default**.
- **Evidence caveat carried in:** several findings are [UNVERIFIED-EVIDENCE] from app-affiliated review blogs (Langua ranked #1 by its own blog's ecosystem); treat specific numbers as priors, directional only.

**Ground truth / constraints carried in:**
- Single-file, no-build PWA **for now**; nothing in this delve may depend on the Delve-4 backend existing (accounts/paywall UI may be *designed for* but must degrade to local-only today).
- The working hands-free loop must never break mid-migration; staged, shippable increments.
- Kana-only output [[feedback_no_kanji]]; hands-free voice loop is the product [[project_japanese_trainer_scope_decision]]; universal-phone, not Pixel-only [[project_japanese_trainer_commercial]].
- Delve-4 locks (subscription, Supabase, RevenueCat, Capacitor, price band) are **inputs, not open questions**. The voice-stack provider choice (research H4) is explicitly **out of scope** — it belongs to the Phase-1 backend track; this delve designs UX that works with the current STT/TTS and improves with better.
- ADR-003 (progressive-vocab hard-lock vs coverage meter) is still awaiting owner signoff — this delve's IA design may inform it but must not silently decide it.

## Stacked REVISED callouts

None binding. First round of a new delve.

## Primary

**Mode:** Opus-only (design/decision/prose → an implementation-ready spec a later `/hydra-forge` builds from).

### Investigation tasks

Each ends in a **final lock**, not a discussion.

1. **The front door — LOCK the IA.** What does (a) a brand-new stranger and (b) a returning user see on open? Candidates: おしゃべり-first (conversation IS the home), Daily-Path-first (guided ladder, conversation as summit), or hybrid (one hero CTA + one "train" drawer). Produce the **full keep/merge/cut/bury verdict for all ~15 surfaces** — each mode gets exactly one of: hero, path-step, practice-drawer, settings-buried, or deleted. Lock the target IA as a navigation map.

2. **First-minute onboarding — LOCK the flow.** From cold open to **first spoken Japanese exchange in <90s**: what's asked (goal? level?), what's skipped, where the first win lands, and the two-path entry (absolute beginner vs knows-some-Japanese ~3-question router → path placement). Design for signup/paywall insertion later (day-3–5 per research) without requiring it now. Lock the screen-by-screen flow.

3. **Judgment-free as a spec — LOCK the style guide.** Correction framing rules for every surface (おしゃべり feedback, blitz wrong-answers, recall misses): observation/question phrasing, no accuracy-% anywhere user-facing, feedback-toggle default ON or OFF, "conversations completed" as the score language, post-conversation (never mid-flow) feedback placement per Langua. Include the latency + TTS budgets as product requirements (what's achievable now vs at Phase-1). Lock the copy rules + budgets.

4. **Retention baseline without guilt — LOCK the design.** Optional streaks + generous no-shame freezes, private-by-default progress, the reminder strategy (what a PWA can do today; what native push adds at Phase 4), and the weekly "you talked X min this week" summary. Lock which mechanics ship in the restructure vs wait for native.

5. **The course spine — LOCK the arc.** Turn Conversational Core % into a visible **"path to your first real conversation"** ladder (research: people buy a path, not a toolbox): stages, what unlocks each stage, how drills feed it, where おしゃべり tiers (existing convoLevel XP) slot in. Must resolve cleanly against ADR-003's meter-vs-lock question or explicitly surface it for the owner. Lock the arc + its progress surface.

6. **Positioning & naming — LOCK the one-liner.** The store/ad-facing identity implied by the IA: "Japanese-first, conversation-first, judgment-free" rendered as the app's actual opening screen promise and the names of the 3–5 surviving surfaces (JP names like おしゃべり vs EN labels — decide the language of the chrome). Lock the one-liner + surface names.

### Output

Primary doc: `docs/delve-cycles/5-conversation-first-product.md`

Sections (in order):
1. Charter — scope + thesis + research grounding
2. Method
3. The front door / target IA (task 1)
4. First-minute onboarding (task 2)
5. Judgment-free spec (task 3)
6. Retention baseline (task 4)
7. The course spine (task 5)
8. Positioning & naming (task 6)
9. Implementation sketch — staged shipping order (each stage shippable alone), which `index.html` functions/screens change per stage, migration of existing users' state/habits
10. Decisions reached (locks)
11. Open questions still open
12. Foundation doc updates
13. ADR proposals (heuristic policy — only load-bearing locks become ADRs)

## Adversaries

### Adversary 1: devils-advocate (LEAD)
**Read:** primary doc, charter, the research REPORT, `index.html` (renderToday ~18997, renderHome ~19057, the nav surface list), [[project_japanese_trainer_scope_decision]].
**Audit:**
1. **Kill-the-user's-app attack:** the owner USES the 15 modes daily; the restructure serves a hypothetical stranger. Does the IA wreck the owner's own workflow (the only proven user)? Where's the power-user escape hatch?
2. **Evidence-quality attack:** the research rests on app-affiliated blogs and unverified numbers. Which locks lean on evidence that could be wrong, and would the lock change if it were?
3. **Judgment-free-vs-learning attack:** does the correction style guide risk users plateauing happily (feel good, learn nothing)? Where's the rigor hiding?
4. **De-sprawl theater attack:** is burying 10 modes behind a drawer actually focus, or the same sprawl one tap deeper? What would TRUE deletion look like and why not do it?
**Output:** `docs/delve-cycles/5-conversation-first-product-devils-advocate.md` — ≤400 lines, citations required.

### Adversary 2: qa-tester
**Read:** primary doc.
**Audit:**
1. Walk the cold-start funnel second-by-second: ad-tap → open → first spoken exchange. Where does a nervous 40-year-old beginner bail?
2. Walk the returning-user day-7: what pulls them back without push notifications (PWA-today reality)?
3. Walk the existing owner's migration: day-1 after the restructure ships, can he still do his exact daily routine?
4. Walk the mid-conversation failure: STT mishears twice in a row — does the judgment-free design survive its own tech stack's errors?
**Output:** `docs/delve-cycles/5-conversation-first-product-qa-design.md` — ≤400 lines.

### Adversary 3: code-reviewer
**Read:** primary doc + `index.html` (nav/render architecture, state.screen routing, the Daily Path model `_dailyPathModel`, convoLevelInfo, screen renderers).
**Audit:**
1. Does the target IA map onto the existing `state.screen` + `render()` switch without a rewrite? Enumerate the actual render functions each stage touches.
2. Is each shipping stage genuinely independent + non-breaking (render-verify passes, no dead nav targets, sw.js cache coherent)?
3. Onboarding state: where does first-run/placement state live (`state.settings`?), how does it interact with existing users' state so THEY never see the onboarding?
4. Does anything in the spec quietly require the Phase-1 backend (accounts, server state) that doesn't exist yet?
**Output:** `docs/delve-cycles/5-conversation-first-product-code-review.md` — ≤400 lines.

## Synthesis

`## Synthesis (Round 1 close — Delve 5)` appended to the primary doc. Verify every adversary citation; disposition each finding; lock the final IA + flows + style guide + spine. The staged implementation sketch becomes the brief for the follow-on `/hydra-forge`. Foundation updates: [[project_japanese_trainer_goal]] (thesis → concrete IA), `INDEX_ROADMAP.md` Phase-0 row → point at this doc. ADR policy **heuristic**: likely 1–2 ADRs max (target IA; judgment-free spec), everything else inline decision-notes.

## Definition of done
- [ ] Primary doc with all 6 locks + staged implementation sketch a forge run can build from
- [ ] Keep/merge/cut/bury verdict for every one of the ~15 surfaces
- [ ] Onboarding flow screen-by-screen to first spoken exchange <90s
- [ ] Judgment-free copy style guide + latency/TTS budgets
- [ ] 3 adversary docs filed
- [ ] Synthesis appended with citation verification
- [ ] ADRs (heuristic) filed pending
- [ ] User signoff

## Files this delve touches
- `docs/delve-cycles/5-conversation-first-product.md` (+ 3 adversary docs) — new
- `docs/decisions-pending/*` — possible new ADR proposals
- `INDEX_ROADMAP.md` — Phase-0 row pointer update (synthesis)
- No `index.html` changes in this delve (design only; build is the follow-on `/hydra-forge`)
