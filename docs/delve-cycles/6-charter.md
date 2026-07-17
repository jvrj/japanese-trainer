# Delve 6 — Talk Mode & Partner Presence (the orb front door)

> **Repo root:** `C:\Users\Julius\Documents\GitHub\japanese-trainer` — every repo-relative path in this charter resolves against that root, and ALL git operations (status, add, commit, show, ls-files) must run with that directory as cwd (`cd` there first).

## Domain

The v8.12 free-form engine is live (FOLLOW-THE-LEARNER contract, code-switch-in, score shield — commit 5f47d37) and behaviorally verified (A/B probes: new contract followed learner-led derails 2/2 where the old contract steered back to the scene). But the owner's verdict was **"no difference"** — because the *experience* didn't change: same chat bubbles, same chips, same 6-turn AI-led session. His vision (2026-07-17, verbatim): *"OPEN the app, talk to the AI basically about anything and it responds accordingly and the user gets to learn through speaking to the AI."* This delve designs the experience layer that makes the live engine feel like that.

An interactive orb mockup was built and owner-reviewed 2026-07-17 (scripted demo: orb states, tap-to-peek, chips-on-stall). Owner reaction: *"i kind of like it as a very base form… the options that come up are good"* — the orb direction, chips-on-stall, and audio-first peek are validated as a base to evolve, not re-open.

**Owner-decided constraints (FIXED — do not re-litigate):**
- Partner is an **abstract orb/waveform** with distinct listen/think/speak animation states — NOT a character, mascot, or photoreal avatar (Praktika REPORT: voice quality > avatar realism; photoreal uncanny valley is their #1 complaint).
- Screen is **audio-first with tap-to-peek** (kana + English) — no always-on subtitles.
- **Talk mode IS the front door** — open the app, you're facing the orb, ready to talk; drills/kana become the training layer behind it.

**Supersession notice (user-directed, 2026-07-17):** this re-opens Delve 5 Task-1's lock, which chose *"C. Hybrid — one hero CTA + one train surface. Home leads with the conversation (partner avatar + 'Talk' hero), with today's path rendered directly beneath as the visible ladder to it, and a single Practice tab for everything else. **LOCKED.**"* — and which rejected candidate A (おしゃべり-first) because *"a true beginner cannot hold a conversation on minute one; landing them inside a live AI chat with no ladder is the fastest bail point."* That rejection reason is still true and this delve must **defeat it by design** (Task 5), not ignore it. Delve-5's other locks (judgment-free spec, course spine, <90s onboarding, Practice-tab contents) remain inputs, amended only where the front door forces it.

**Ground truth / constraints carried in:**
- Single-file no-build PWA (`index.html` ~20.5k lines + `sw.js`), no backend; user's Anthropic API key in localStorage; offline `_convoScript` fallback exists.
- Kana-only learner copy; STT is a turn-trigger only, never a grader; hands-free Spam-mode template; universal phone, not Pixel-only.
- The working hands-free loop must never break mid-migration — staged, shippable increments.
- Grounding docs: `docs/delve-cycles/5-conversation-first-product.md` (the amended IA's parent), `reports/hydra-research/2026-07-17-praktika/REPORT.md` (voice>avatar evidence, uncanny-valley complaint, unit-economics context).
- Phase-1 backend (streaming, server key, memory, better voices) is **out of scope** — this delve designs UX that works with today's stack and improves with Phase 1.

## Stacked REVISED callouts

None binding. First round of a new delve.

## Primary

**Mode:** Opus-only (design/decision/prose → an implementation-ready spec a later `/hydra-forge` builds from).

### Investigation tasks

Each ends in a **final lock**, not a discussion.

1. **The orb — LOCK the presence spec.** Visual + animation architecture inside the single-file PWA (CSS transforms vs canvas vs SVG; audio-reactive to TTS or scripted amplitude), the state machine (idle / listening / thinking / speaking) with transitions, **latency masking** (the think-state must make the 2–6s API round-trip feel like consideration, not lag), and a performance budget for mid-range phones. The reviewed mockup (canvas blob, harmonic deformation, state-blended hue/glow, inward rings = listening, outward rings = speaking) is the starting point.

2. **Endless session — LOCK the session shape.** Kill the 6-turn cap: how a session opens (orb greets first vs waits), how it ends (learner goodbye / tap-to-end / idle timeout), **stall detection** and when chips surface (interplay with the existing double-miss/forceChips rule; mockup used 6s silence), SRS/XP credit accrual without a session boundary, and a **cost guard** — endless turns burn the owner's own API key; lock a budget/soft-stop design.

3. **Engine layering — LOCK the wiring.** How Talk drives the live v8.12 engine: scene handling when there is no scene (free-talk opener vs scene-seeded start), the downshift ladder in an endless context, hands-free TTS→auto-listen orchestration, mishear recovery, and tap-to-peek sourced from the schema's existing `jp`/`glossEn`. Context growth per turn (messages array, token cost) needs a cap strategy.

4. **Front door restructure — LOCK the amended IA.** Open → Talk screen with orb. Where the spine header, daily path, Practice tab, and settings live now (one gesture away — swipe/corner affordance), first-run flow for a stranger (mic permission, the no-API-key case → offline `_convoScript` or onboarding-before-orb), reconciliation with Delve-5's <90s onboarding lock, and existing-owner migration (his daily routine must survive day-1).

5. **Minute-one beginner — LOCK the scaffold-inside-Talk design.** The load-bearing defense of the supersession: how orb + chips-on-stall + downshift + (possibly) a guided first exchange make minute one survivable for a true beginner, so conversation-as-home no longer equals fastest-bail-point.

### Output

Primary doc: `docs/delve-cycles/6-talk-mode-presence.md`

Sections (in order):
1. Charter — scope + fixed constraints + supersession
2. Method
3. Orb presence spec (task 1)
4. Endless session shape (task 2)
5. Engine layering (task 3)
6. The amended IA (task 4)
7. Minute-one scaffold (task 5)
8. Implementation sketch — staged shipping order (each stage shippable alone), which `index.html` functions/screens change per stage, existing-user migration
9. Decisions reached (locks)
10. Open questions still open
11. Foundation doc updates
12. ADR proposals (heuristic policy — only load-bearing locks become ADRs)

## Adversaries

### Adversary 1: devils-advocate (LEAD)
**Read:** primary doc, this charter, `docs/delve-cycles/5-conversation-first-product.md` (§3 IA lock), `reports/hydra-research/2026-07-17-praktika/REPORT.md`, `index.html` (convo engine: `_convoPreamble`, `convoTurn`, `_convoCall`; nav/render architecture).
**Audit:**
1. **Churn attack:** Delve 5 locked the hybrid front door days ago; is this supersession conviction or whiplash, and what stops delve 7 from flipping it back? What in the delve-5 rationale was actually wrong vs merely overridden?
2. **"No difference" recurrence attack:** v8.12 changed the engine and the owner felt nothing; will an orb + endless sessions actually change the felt experience, or is presence a gimmick without the latency/voice improvements that need the Phase-1 backend?
3. **Minute-one attack:** press hard on Task 5 — delve 5's rejection of conversation-as-home was correct reasoning; does the scaffold genuinely defeat it or just soften it?
4. **Cost-burn attack:** endless sessions on the owner's personal API key with no backend metering — where does this bleed money or die at scale?
**Output:** `docs/delve-cycles/6-talk-mode-presence-devils-advocate.md` — ≤400 lines, citations required.

### Adversary 2: qa-tester
**Read:** primary doc.
**Audit:**
1. Walk minute-one for a nervous true beginner facing the orb — where do they bail?
2. Walk the mishear-twice path hands-free — does the orb's judgment-free presence survive its own STT errors?
3. Walk an endless session to natural death — boredom, silence, battery, cost, context growth.
4. Walk the owner's day-1 after the restructure — is his exact daily routine intact?
**Output:** `docs/delve-cycles/6-talk-mode-presence-qa-design.md` — ≤400 lines.

### Adversary 3: code-reviewer
**Read:** primary doc + `index.html` (state.screen routing, `render()`, `convoTurn`/`_convoCall`/`_convoPreamble`, TTS/STT plumbing, `sw.js`).
**Audit:**
1. Does the Talk screen + orb map onto the existing render architecture without a rewrite — enumerate the actual functions each stage touches.
2. Is the animation approach feasible in a single file at 60fps on mid-range phones?
3. Endless-session state: memory growth of the messages array, preamble token growth per turn, context cap strategy.
4. Does anything in the spec quietly require the Phase-1 backend that doesn't exist yet?
**Output:** `docs/delve-cycles/6-talk-mode-presence-code-review.md` — ≤400 lines.

## Synthesis

`## Synthesis (Round 1 close — Delve 6)` appended to the primary doc. Verify every adversary citation; disposition each finding; lock orb spec + session shape + wiring + amended IA + minute-one scaffold. The staged implementation sketch becomes the brief for the follow-on `/hydra-forge`. Foundation updates: `INDEX_ROADMAP.md` row; note the delve-5 §3 amendment in place (pointer, not rewrite). ADR policy **heuristic** — likely exactly 1 ADR (the Talk-front-door supersession of the delve-5 IA lock); everything else inline decision-notes.

## Definition of done
- [ ] Primary doc with all 5 locks + staged implementation sketch a forge run can build from
- [ ] Minute-one beginner defense that answers delve-5's rejection explicitly
- [ ] Cost-guard design for endless sessions on BYO key
- [ ] 3 adversary docs filed
- [ ] Synthesis appended with citation verification
- [ ] ADRs (heuristic) filed pending
- [ ] User signoff

## Files this delve touches
- `docs/delve-cycles/6-talk-mode-presence.md` (+ 3 adversary docs) — new
- `docs/decisions-pending/*` — possible new ADR proposals
- `INDEX_ROADMAP.md` — row update (synthesis)
- No `index.html` changes in this delve (design only; build is the follow-on `/hydra-forge`)
