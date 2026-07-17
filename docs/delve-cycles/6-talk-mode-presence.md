# Delve 6 — Talk Mode & Partner Presence (the orb front door)

**Round 1 · Primary investigation doc**
**Date:** 2026-07-17
**Charter:** `docs/delve-cycles/6-charter.md`
**Mode:** Opus-only design/decision — every task ends in a **lock**, not a discussion.

---

## 1. Charter — scope + fixed constraints + supersession

### 1.1 Scope

The v8.12 free-form engine is live and behaviorally verified (FOLLOW-THE-LEARNER contract,
code-switch-in, score shield — commit `5f47d37`; the contract text is in source at
`_convoPreamble`, `index.html:9275–9278`). The owner's verdict was **"no difference"** —
because nothing the learner *sees or feels* changed: same chat bubbles, same chips, same
capped AI-led session (tier `maxTurns` 4–10, `CONVO_TIERS` 2816–2819, end condition
`convoTurn` 9609). His vision, verbatim: *"OPEN the app, talk to the AI basically about
anything and it responds accordingly and the user gets to learn through speaking to the AI."*

This delve designs the **experience layer** over the live engine: (task 1) the orb presence
spec, (task 2) the endless session shape, (task 3) the wiring onto the v8.12 engine,
(task 4) the amended IA that makes Talk the front door, (task 5) the minute-one scaffold
that defeats Delve 5's own rejection of conversation-as-home. It ends with a staged
implementation sketch a follow-on `/hydra-forge` builds from.

### 1.2 Fixed constraints (owner-decided — not re-litigated here)

- Partner is an **abstract orb/waveform** with distinct listen/think/speak states — never a
  character, mascot, or photoreal avatar (Praktika REPORT: voice quality > avatar realism;
  avatar uncanny-valley is their persistent complaint cluster).
- **Audio-first with tap-to-peek** (kana + English) — no always-on subtitles.
- **Talk mode IS the front door** — open the app, you are facing the orb.
- The reviewed interactive mockup (canvas blob, harmonic deformation, state-blended
  hue/glow, inward rings = listening, outward rings = speaking, chips-on-stall at 6s,
  tap-to-peek) is the validated **base to evolve, not re-open** (owner, 2026-07-17:
  *"i kind of like it as a very base form… the options that come up are good"*).

### 1.3 Ground truth carried in

- Single-file no-build PWA: `index.html` (~20.5k lines, `APP_VERSION = '8.12'` at 676) +
  `sw.js`; no backend; learner's Anthropic key in localStorage (`_convoCall` 9311–9323);
  offline keyless fallback `_convoScript` (9331) cycling 5 canned turns
  (`_CONVO_SCRIPT_TURNS` 9351–9356).
- Delve-5 stages A–E are **all shipped** (v8.08–v8.11): 2-tab nav, onboarding OB-0→OB-4,
  advisory spine, judgment-free sweep, true deletions. This delve amends a *built* IA, not
  a paper one.
- Kana-only learner copy; STT is a turn-trigger, never a grader; hands-free Spam-mode
  template; universal phone. The working hands-free loop must never break mid-migration.
- Phase-1 backend (streaming, server key, memory, better voices) is **out of scope**: every
  lock below must work on today's stack and get *better*, not different, when Phase 1 lands.

### 1.4 Supersession (the load-bearing act of this delve)

Delve 5 §3 locked **L1: the hybrid two-door IA** — Home = spine header + おしゃべり hero +
today's path + resume chip; Practice tab; settings gear (ADR-008 filed pending). It
**rejected candidate A (おしゃべり-first)** with this reasoning: *"a true beginner cannot
hold a conversation on minute one; landing them inside a live AI chat with no ladder is the
fastest bail point."*

This delve, on the owner's direction (2026-07-17), supersedes that lock. The supersession
discipline: **the rejection reasoning was correct against candidate A as then specified**
(a bare chat screen as home, no ramp, no in-conversation ladder). This delve does not argue
the reasoning was wrong — it changes the candidate until the reasoning no longer applies,
and §7 states exactly which premise each design element removes. Delve-5's other locks
(judgment-free spec L4/ADR-009, course spine L8, <90s onboarding L3, Practice-tab contents
L2) remain inputs, amended only where the front door forces it (§6.5 enumerates every
amendment).

**Honesty note carried from the charter audit (WARN):** presence alone may not fix "no
difference" — latency and TTS voice quality are real contributors that only Phase 1 fully
addresses. §3.4 (latency masking) is therefore designed as the *strongest possible
no-backend treatment* of the 2–6s gap, §9 locks a **felt-difference acceptance signal**
(L12) so the claim is testable instead of vibes, and §4.5 confronts the endless-session ×
BYO-key commercial collision directly.

---

## 2. Method

1. **Read against source.** Every engine claim cites a verified `index.html` line:
   the five-key JSON contract (9282–9289), FOLLOW-THE-LEARNER block (9275–9278), message
   windowing (`slice(-6)`, 9524), double-miss/forceChips (9559–9575, 9487, 9970), downshift
   ladder (9577–9600), end condition (9609), hands-free chain TTS→auto-mic (9622–9626,
   `convoHandsFree` default 2789), TTS plumbing (`_buildSpeakJP` 14676, `_convoSpeakJP`
   9384 — both `window.speechSynthesis`), STT gate (`voiceSupported` 5175), the existing
   mic AnalyserNode pattern (`_whisperRecord` 5479–5510), render map (18552) and `nav()`
   normalization (18558+), keyless fallback (9531).
2. **Force the decision.** Each task states candidates, picks one, records the lock with a
   reversal condition. Rejected alternatives carry their reason so the adversary panel can
   attack reasoning, not reconstruct it.
3. **Design to the platform's real seams.** Two hard platform facts shape Task 1:
   `speechSynthesis` exposes **no output audio stream** (no AnalyserNode on TTS), and
   `SpeechRecognition` owns the mic while listening (a parallel `getUserMedia` tap is a
   known conflict risk on Android Chrome). The orb's "audio-reactivity" is therefore an
   honest illusion — exactly the trick Praktika ships (their "0.1s latency" is
   token-streaming + mouth-prediction masking a ~400–600ms pipeline).
4. **Two real users.** The stranger (commercial mandate) and the owner — whose daily
   routine (resume chip / topic ▶ hands-free drill) must survive day-1 (§6.4).
5. **Stay buildable.** Every lock maps to named functions in §8; no stage needs Phase 1;
   every stage ships alone behind the never-break invariant with a headless render check.

---

## 3. Orb presence spec (Task 1) 🔒

### 3.1 Rendering technology — candidates

- **CSS transforms/filters only.** Cheap, GPU-composited, but cannot do organic radial
  deformation (a blob that *breathes* asymmetrically) without heavy `filter: blur()` chains
  that jank mid-range phones. *Rejected.*
- **SVG + turbulence filters.** Organic shapes possible, but `feTurbulence`/`feDisplacement`
  animation is CPU-rasterized on most mobile GPUs — the known 60fps killer. *Rejected.*
- **WebGL shader.** Highest ceiling, but a shader pipeline inside a hand-maintained
  single-file PWA is a maintenance cliff, and WebGL context loss on low-memory Android needs
  its own recovery machinery. *Rejected for v1; noted as the Phase-2 upgrade path.*
- **Canvas 2D — one `<canvas>`, one path.** The mockup's proven approach: a closed path of
  N points on a circle, each radius modulated by summed harmonics; fill + pre-rendered glow.
  Single draw call per frame, trivially degradable. **LOCKED.**

### 3.2 The lock — visual architecture

- **One canvas**, sized `min(72vw, 300px)` square, centered in the upper ⅔ of the Talk
  screen; `devicePixelRatio` capped at 2 (a 3x panel renders at 2x — invisible on a blob,
  halves the pixel budget).
- **Blob:** 14 control points, radius `R·(1 + Σ aᵢ·sin(fᵢ·θ + φᵢ·t))` with 3 harmonics
  (f = 2, 3, 5), drawn as a closed Catmull-Rom/quadratic loop. Amplitude budget per state
  (§3.3). This is the mockup's harmonic deformation, kept.
- **Glow:** never per-frame `shadowBlur` (the classic canvas perf trap). The glow is a
  **pre-rendered radial-gradient sprite** on an offscreen canvas, re-baked only on hue
  change (throttled to ≤4 bakes/s during transitions), drawn under the blob at
  `globalAlpha` keyed to state energy.
- **Rings:** at most 3 live ring sprites (stroked circles, alpha-faded), animating radius
  inward (listening) or outward (speaking) — the mockup's validated direction language.
- **Hue language (state-blended, continuous):** idle = dim violet (the app's existing
  `#9d5cff` family), listening = cool teal-blue shift, thinking = deep indigo with a slow
  internal shimmer, speaking = warm magenta-pink (`#ff5d9e` family — already the app's
  celebratory gradient at 10050). Hue/amplitude/ring params **lerp continuously**; states
  never hard-cut.

### 3.3 The state machine — states, drivers, transitions

Four presentation states + one overlay. The orb is a **pure subscriber**: it never drives
the session; it mirrors engine seams (§5.2) via a single `_orbSet(state, meta)` entry.

| State | Visual | Driver (engine seam) | Motion spec |
|---|---|---|---|
| **idle** | slow breath: amplitude 0.05R, ~7s period; dim glow | no session, or session paused/sleeping (§4.3) | rAF may drop to 30fps; suspends entirely when `document.hidden` or `state.screen !== 'talk'` |
| **listening** | inward rings (1 spawn/1.2s), hue→teal, amplitude 0.08R + **pulse on speech events** | `convoToggleListen` → recognition `onstart`; pulses on `onspeechstart`/interim results | reactivity is **event-scripted, not audio-tapped** (§3.5) |
| **thinking** | rings stop; blob compacts to 0.94R; slow internal hue shimmer (~2s cycle); glow steady | `convoTurn` entry (9512 `cv.loading = true`) until parse resolves | THE latency mask — see §3.4 escalation |
| **speaking** | outward rings (1 spawn/0.9s), hue→warm, amplitude keyed to a **syllable envelope** | `_convoSpeakJP` call → utterance `onend`/`onerror` | envelope from kana length ÷ tier `ttsRate`; resynced by `onboundary` ticks where the engine fires them (§3.5) |
| *(overlay)* **chips** | orb unchanged; chips row fades in beneath | stall timer (§4.4) or `forceChips` (9569) | an overlay, **not** an orb state — presence never "becomes UI" |

**Transitions:** all params (hue, amplitude, ring spawn-rate/direction, scale) lerp over
450ms with ease-in-out; a transition interrupted by a newer state retargets from current
values (no snap). The full cycle in a healthy turn:
`speaking → (onend) → listening → (speech end) → thinking → (response) → speaking`.

### 3.4 Latency masking — the think-state contract

The API round-trip is 2–6s (non-streaming `_convoCall`; the dev readout `lastLatencyMs`
at 9538 already measures it). The mask must convert dead time into *consideration*:

| Elapsed | Orb behavior | Rationale |
|---|---|---|
| 0–450ms | listening→thinking morph completes | the state change itself absorbs the first beat |
| 0.45–2.5s | compact + shimmer (base thinking) | reads as "she's thinking about what you said" |
| 2.5s | **one** filler TTS: うーん… or そうですね… (random, ≤1 per turn — the Delve-5 §5.5 budget, already spec'd) | a human hums; also proves audio path is alive |
| 6s | blob adds a slow stretch-and-settle wobble | visible acknowledgment without apology |
| 12s | apology + retry affordance: partner takes the blame (Delve-5 rule 5) — 「ごめん、ちょっと まって ね」 TTS once; peek sheet shows a retry button | never an error toast on the zen surface |
| fetch reject | existing error path (9532–9536) sets `cv.error`; orb → idle; chips surface | degraded, never dead |

**What masking cannot do (honest bound):** it cannot make 5s feel like 700ms. The mask
converts *annoyance* into *patience*; the felt-latency fix is Phase-1 streaming. L12's
felt-difference probe (§9) measures whether mask + presence + endlessness moves the owner's
verdict *without* Phase 1 — if it does not, the conclusion is "Phase 1 is the blocker," a
finding, not a failure.

### 3.5 Audio reactivity — the honest-illusion lock

- **Speaking:** `speechSynthesis` exposes no audio stream — a true TTS-reactive orb is
  **impossible on this stack** (platform fact, §2.3). LOCKED: a **scripted syllable
  envelope** — amplitude modulated per kana at the utterance's effective rate
  (kana count ÷ `ttsRate`-scaled duration), with `SpeechSynthesisUtterance.onboundary`
  used as resync ticks *where the engine fires them* (Android Chrome does for local
  voices; treat as enhancement, never dependency). Praktika ships the same class of
  illusion; nobody can tell.
- **Listening:** LOCKED — **no parallel `getUserMedia` tap while `SpeechRecognition` is
  active** (mic-ownership conflict risk on Android Chrome; the existing AnalyserNode
  pattern at 5479–5510 belongs to the Whisper path, which records *instead of* SR, not
  alongside it). Reactivity comes from SR's own events: `onspeechstart`, interim results,
  `onresult` — each fires a pulse. Scripted breathing carries the rest.
- **Reversal condition:** if a later spike proves a parallel analyser tap is safe on the
  target devices, listening may upgrade to true amplitude-reactivity as a pure enhancement
  (same `_orbSet` API; zero session-logic change).

### 3.6 Performance budget (mid-range phone, ~2020 Android)

| Item | Budget |
|---|---|
| Frame cost | ≤4ms main-thread per frame at 60fps (leaves headroom for render() churn) |
| Draw calls | 1 glow sprite blit + 1 blob path + ≤3 ring strokes |
| Degrade rule | rolling 2s avg frame > 24ms → halve rAF to 30fps (imperceptible on a blob); log once to dev readout |
| Suspend rule | `document.hidden` OR `state.screen !== 'talk'` (or orb not mounted) → cancel rAF entirely; resume on visibility/nav |
| Memory | 2 offscreen canvases (glow bake, optional dbl-buffer); no per-frame allocations in the draw loop (typed-array param buffers) |
| Battery | idle state at 30fps by default; screen-wake-lock is **not** requested by the orb (the hands-free loop's existing behavior owns that decision) |

Acceptance (forge-time): Chrome DevTools CPU 4x throttle sustains ≥28fps in speaking state
with chips overlay visible.

---

## 4. Endless session shape (Task 2) 🔒

### 4.1 Opening — who speaks first

- Candidates: orb waits for the learner (rejected — dead air is the #1 minute-one bail
  point, and a beginner cannot open; recognition-before-production is the entry skill) vs
  **orb greets first** (LOCKED — matches the AI-opens design already in `_convoOpenProbe`
  9416–9438 and the hands-free doctrine).
- **Cold-open gesture gate (platform fact):** autoplay policy means TTS + mic need a user
  gesture on Android Chrome. LOCKED: app opens to the orb **idle** with a soft pulse and
  one kana affix beneath — 「タップして はなす」. One tap = the gesture = session start →
  orb greets (tier-appropriate, e.g. こんにちは!きょうは なに を した?) → hands-free
  from there. Returning same-day users with a live session resume it instead (§4.3).
- The greeting turn is `_convoOpenProbe` unchanged; only the trigger moves from
  `startConvo`'s nav to the orb tap.

### 4.2 Killing the cap — what `maxTurns` becomes

The end condition `cv.turn >= cv.maxTurns` (9609) **stops ending the session**. `maxTurns`
is repurposed as the **soft-wrap threshold** (§4.5): tier values 4/6/8/10 are replaced by a
single `convoSoftCap` (default **30 advanced turns**) — the tier table keeps `chips`,
`ttsRate`, `xpToNext` (2816–2819) untouched. A session now ends only by:

1. **Learner farewell** — no schema change: the existing `sceneDone` key (9288) is
   re-purposed in the free-talk preamble as the **farewell signal**: "set true only when
   the learner says goodbye (またね/バイバイ/さようなら/おわり) or clearly wants to stop."
   The five-key contract stays byte-identical; only prose semantics shift (§5.1). The
   `parsed.sceneDone` branch at 9609 already routes to `convoEnd()` — zero new end plumbing.
2. **Tap-to-end** — an unobtrusive ✕ pill (bottom corner of Talk) → confirm-free immediate
   `convoEnd()` (recap card). Judgment-free: ending is never questioned.
3. **Idle timeout → sleep → auto-end** (§4.3).

### 4.3 Silence, sleep, and natural death

| Trigger | Behavior |
|---|---|
| 6s silence in listening (mockup value, kept) | **stall**: chips overlay fades in (§4.4); mic stays open |
| listening window ends with nothing (SR `onend`, no result) ×1 | orb re-opens mic once, silently |
| ×2 (double empty listen) + total silence ≥45s | orb asks **once**: 「まだ いますか?」 (are you still there?) with chips 「うん、いるよ」/「またね」 |
| no response 30s after that | **sleep**: session freezes (`cv._frozen` — the flag already exists and gates the auto-mic chain at 9624), orb → idle breathing, mic closed. Tap resumes exactly where it left off. |
| sleep persists 3 min | auto-`convoEnd()` → recap waits on screen; battery/mic released. Judgment-free copy: recap opens 「きょうも はなした ね!」 never "session timed out". |

This ladder means an abandoned phone never holds the mic open, never burns battery on rAF
(idle → suspend rules §3.6), and never burns API money (silence makes zero calls — turns
are user-speech-driven).

### 4.4 Stall detection × the existing double-miss rule (interplay lock)

Two orthogonal detectors, kept orthogonal:

- **Silence stall (new):** learner says *nothing* for 6s → chips overlay surfaces
  (suggestions from `cv.current.suggested` — already always present in the schema, 9286).
  Second consecutive silence stall → orb re-asks **simpler** (a downshift re-probe: the
  same question rephrased from the model's own `suggested` vocabulary, requested via the
  preamble's existing downshift behavior). Chips persist until the next successful turn.
- **Mishear stall (existing, untouched):** two consecutive score-0 *voice* turns →
  apology + `forceChips` one-turn chip-only input (9559–9575). LOCKED unchanged.
- **Precedence:** `forceChips` (a mishear verdict) always wins the input mode; the silence
  timer never counts down while `forceChips` is active or TTS is speaking.

### 4.5 Credit accrual without a boundary + the cost guard

- **SRS:** already boundary-free — `convoApplyScore` (9631) credits per turn as the next
  turn arrives. No change.
- **XP:** currently awarded in `convoEnd`. LOCKED: XP accrues **per advanced turn**
  (the `didAdvance` paths, 9581–9600), recap shows the session total. An endless session
  that dies by tab-kill loses nothing.
- **convoLog:** currently appended once in `convoEnd` (2929–2930). LOCKED: **checkpoint
  every 10 advanced turns** (upsert the open session's row by `startedTs`) + final write on
  end/sleep-death — tab-kill loses ≤10 turns of volume stats, never the session.
- **Cost guard (the BYO-key collision, confronted):** per-turn cost on the default
  `claude-haiku-4-5` (9314) ≈ 1.8k tokens in (preamble ~1.2k + 6-message window) + ≤400 out
  (9318) ≈ **$0.003/turn**; a heavy 100-turn day ≈ $0.30; a runaway month ≈ $9 — real money
  on the owner's personal key, and structurally unshippable to paying customers without
  Phase-1 metering. LOCKED, three tiers:
  1. **Soft wrap** at `convoSoftCap` (30 advanced turns): the partner *naturally* suggests
     a break in-character — 「たくさん はなした ね!すこし やすむ?」 with chips
     「まだ はなす!」/「またね」. Choosing to continue resets the wrap counter. Never a
     hard cutoff mid-thought.
  2. **Daily budget meter:** `state.convoDailyTurns` (date-keyed counter). Default cap
     **150 turns/day**; at cap the partner wraps warmly and Talk shows the (existing-style)
     settings pointer. Cap editable in Settings (the owner can raise his own).
  3. **Dev cost readout:** the `_isDevMode` latency readout (5390, 9538) gains an estimated
     session/day cost line (turns × $0.003) — measurement before Phase-1 metering exists.
  - **Commercial note (scope boundary):** these guards protect the *BYO-key era*. Phase-1
    server metering replaces tier 2 wholesale; tier 1 (soft wrap) survives as pedagogy.
    This delve deliberately does not design Phase-1 metering (charter exclusion).

---

## 5. Engine layering (Task 3) 🔒

### 5.1 Free talk without a scene

- LOCKED: a new pseudo-scene **`free`** (`{ id:'free', nameJP:'フリートーク', en:'Free talk',
  minLevel:1 }`) becomes the **default Talk session**. In `_convoPreamble`, when
  `scene === free`, the SCENE line (9272–9273) is replaced by: *"No scene. Open with a warm
  greeting and one easy question about the learner's day, then follow wherever they go."*
  — and the `sceneDone` guideline (9296) becomes the farewell semantics (§4.2.1).
- The six existing `SCENES` (2858–2865) survive as **topic sparks**: reachable from the Talk
  screen's peek sheet ("きょうの トピック?") and from the spine's summit steps (Delve-5 L8
  unbroken — summit scenes still exist for stage graduation). The FOLLOW-THE-LEARNER
  contract already makes any scene a starting point, not a script (9273).
- `startConvo('free')` is the orb-tap target; `minLevel` gating (2989-era logic) does not
  apply to `free` (available from tier 1 — the scaffold burden moves to chips + downshift,
  §7).

### 5.2 Hands-free orchestration — the orb subscribes to existing seams

The TTS→auto-listen chain is **already built and load-bearing** (9622–9626: `_convoSpeakJP`
onend → `convoToggleListen`, gated by `convoHandsFree` 2789, `_frozen`, `forceChips`).
LOCKED: the orb **wraps, never rewires**. One new module-level function `_orbSet(name, meta)`
called from exactly these five seams:

| Seam | Call | Orb state |
|---|---|---|
| `_convoSpeakJP` entry (9384) | `_orbSet('speaking', {jp})` | speaking, envelope from `jp` |
| its `onend`/`onerror` fire | (chain already calls `convoToggleListen`) | → listening via next seam |
| recognition `onstart` (inside `convoToggleListen`'s SR setup) | `_orbSet('listening')` | listening |
| `convoTurn` entry (after 9512 `cv.loading = true`) | `_orbSet('thinking')` | thinking + mask timers |
| response rendered / error / `convoEnd` / `_frozen` | `_orbSet('speaking'…)` or `_orbSet('idle')` | close the loop |

`_orbSet` on an unmounted orb is a no-op — the same engine keeps powering the legacy
`convo` chat screen during migration (§8 stage T1), which is the never-break invariant made
mechanical.

### 5.3 Mishear recovery

Unchanged from v8.10/8.12: double-miss → apology → `forceChips` (9559–9575); the partner
takes the blame (ADR-009 rule 5); STT stays a pure turn-trigger. The orb adds only
presentation: during an apology turn the orb does a small "bow" dip (scale 0.96 for 600ms).
Nothing here writes SRS (9562 comment stands).

### 5.4 Tap-to-peek — sourcing from the live schema

- Every AI turn already carries `jp` + `glossEn` (9284–9285). LOCKED: **tap the orb** →
  peek sheet slides up: the current `jp` in kana + 🔁 replay + a 👁 EN reveal button
  (English stays behind the second tap — the no-English-prompts doctrine, and exactly the
  Delve-1 peek pattern at 9942). Sheet auto-dismisses on the next state change or tap-away.
- The peek sheet is also the utility surface: topic sparks row, ✕ end pill, and (during
  `cv.error` states) the retry affordance — keeping the orb face itself chrome-free.

### 5.5 Context growth cap

- API payload is already capped: `slice(-6)` window (9524) + fixed preamble — per-turn
  token cost is **flat forever**. No change.
- In-memory `cv.messages` grows unboundedly in an endless session. LOCKED: cap the stored
  array at **40 entries** (drop oldest pairs; the window only ever needs 6). At ~80 bytes
  a message this is vanity memory, but unbounded-anything violates the endless contract.
- **No rolling-summary call.** A summary would cost a second API call per N turns to give
  the partner longer memory. Rejected for now: the money goes to the learner's turns;
  goldfish memory (≈3 exchanges) is an honest BYO-era limit that Phase-1 server memory
  fixes properly (Praktika's +24% D1 retention from memory is the Phase-1 prize, not a
  browser-side hack). Reversal: if the panel finds 3-exchange memory breaks the "friend"
  illusion in practice, a cheap FACTS accumulator (append `judged.usedWords`-derived nouns
  to the preamble, zero extra calls) is the designed fallback.

---

## 6. The amended IA (Task 4) 🔒

### 6.1 The new map

```
┌─────────────────────────────────────────────┐
│  TALK (new renderTalk — the front door)     │
│                                             │
│        ( ✦ the orb ✦ )                      │
│     「タップして はなす」/ live session      │
│                                             │
│   [chips overlay — on stall/forceChips]     │
│   [session pill: ✕ end · turn count off]    │
│                                             │
│  ═══ drawer handle (swipe up / tap) ═══     │
├─────────────────────────────────────────────┤
│  DRAWER = the Delve-5 Home, one gesture     │
│  away: spine header · today's path ladder   │
│  · resume chip · Practice grid access ·     │
│  ⚙ settings (drawer header)                 │
└─────────────────────────────────────────────┘
```

- **`talk` is a new render-map key** (18552) and the **boot default**. The Delve-5 Home
  (`renderHome` 18747: spine + hero + path + resume) becomes the **drawer destination** —
  content preserved, hero CTA removed (the orb IS the hero now). Practice (`renderPractice`
  19151) and Settings are unchanged, reached through the drawer exactly as they were
  reached through Home.
- **Gesture contract:** swipe-up or handle-tap on Talk → drawer (navigates to `home`);
  back/swipe-down → Talk. `updateBackFab` (18594-era) treats `talk` as the new root
  (`show` when `screen !== 'talk' && screen !== 'onboard'`); bottom-nav hidden on `talk`
  (CSS `body[data-screen="talk"]`), visible everywhere else — the 2-tab nav survives
  *inside* the drawer world, so deep navigation is untouched.
- **Normalization precedent reused:** `nav()` already normalizes `'today'→'home'` (18563+).
  No new alias: `home` remains a real screen (the drawer). Only the **boot route** and
  **back-FAB root** change.

### 6.2 First-run flow for a stranger

- LOCKED: **onboarding-before-orb, unchanged.** The shipped OB-0→OB-4 flow (Delve-5 L3:
  <90s, scripted zero-key exchange, mic pre-prompt with chips fallback,
  `voiceSupported()`-absent branch) already solves mic permission, the no-key case, and
  first-spoken-word activation — it IS the ramp into the orb. One amendment: **OB-4's
  「つづける」 lands on `talk`** (orb idle, coach-mark: "swipe up for your path") instead
  of Home. The `nav()` onboarding gate (18570: `home && !onboard.done → onboard`) extends
  to `talk`.
- **No-key case at the orb:** `convoTurn`'s keyless branch (9531) already serves
  `_convoScript`; the orb presents identically. The 5-turn script bank cycling is
  serviceable-but-thin for an *endless* front door — expanding `_CONVO_SCRIPT_TURNS` to
  ~15 turns with branch-on-chip variety is scoped into stage T5 (content work, no
  architecture).
- **<90s lock reconciliation:** untouched — same flow, same budget, different landing
  screen. The budget clock still ends at the OB-3 first spoken exchange, before Talk.

### 6.3 Where everything lives now (delta table vs Delve-5 §3.2)

| Surface | Delve 5 (shipped) | This delve |
|---|---|---|
| Front door | Home (spine + hero + path + resume) | **Talk (orb)** |
| Spine header + path + resume | on Home | in the **drawer** (= `home` screen, hero card removed) |
| おしゃべり hero CTA | Home card → `convo` screen | **the orb itself**; legacy `convo` chat screen retired at stage T4 (renderConvo's session UI absorbed by Talk; recap card survives) |
| Practice tab | bottom nav | unchanged (reached via drawer; nav visible off-Talk) |
| Settings ⚙ | top bar | drawer header (plus inside all non-Talk screens as today) |
| Scene picker | convo screen | peek-sheet topic sparks (§5.4) |

### 6.4 Existing-owner migration (day-1 survival)

The owner's routine: open → resume chip or topic ▶ → hands-free drill. After the flip:
open → orb → **swipe up → resume chip** (one gesture + the same tap). LOCKED acceptance
(carried from Delve-5 L1 discipline): **≤1 gesture worse than today, and the resume chip is
the drawer's topmost element** so muscle memory lands on it. Additionally, a
`frontDoor:'talk'|'home'` setting (default `'talk'`) makes the flip reversible per-user in
one toggle — the owner can restore Home-first the day it annoys him, which is also the
safest possible rollout switch (stage T4 ships default-off, flips default in T4.1 after
his own week-long test — §8).

### 6.5 Delve-5 locks — explicit amendment ledger

| Delve-5 lock | Status here |
|---|---|
| L1 two-door IA (ADR-008 pending) | **superseded**: front door = Talk; Home demoted to drawer. ADR proposal §12 |
| L2 verdict table + deletions | intact (all shipped) |
| L3 onboarding <90s | intact; landing amended to `talk` (§6.2) |
| L4/ADR-009 judgment-free spec | intact; extended to orb copy (§4.3, §5.3) |
| L5 recap default ON | intact (recap survives at session end) |
| L6 latency budgets | intact; §3.4 is its presence-layer execution |
| L7 retention baseline | intact; convoLog checkpointing strengthens it (§4.5) |
| L8 spine | intact; summit scenes reachable as topic sparks (§5.1) |
| L9 positioning gates | intact; note: the orb strengthens the honest-free-form claim (Praktika OWN-lane) |
| L10 staged shipping | pattern reused (§8) |
| L11 zero-key first exchange | intact and load-bearing for §6.2 |

---

## 7. Minute-one scaffold (Task 5) 🔒 — defeating Delve-5's rejection by design

Delve-5's rejection premise, decomposed: *"a true beginner cannot hold a conversation on
minute one"* (P1: production-incapable) + *"landing them inside a live AI chat"* (P2: cold
drop, chat UI) + *"with no ladder"* (P3: no visible scaffold or path) *"is the fastest bail
point"* (conclusion). Each premise is removed structurally:

1. **P2 falls — nobody lands cold.** The stranger's first minute is the *onboarding
   scripted exchange* (shipped, <90s, zero-key, chips fallback), which teaches the exact
   loop the orb runs (partner speaks → you speak) before the orb ever appears. The orb is
   minute *two*.
2. **P1 falls — recognition is the entry skill, production is chip-assisted.** The orb
   speaks **first** (§4.1); the beginner only ever *responds*. For tier-1 learners
   (`convoLevel ≤ 1`) chips are **always visible** — not stall-gated — for their first
   **3 completed sessions** (`state.convo.guided` counter): every turn is answerable by
   tap, and every tap is spoken aloud by TTS so the loop stays audio-led. Chips relax to
   stall-only when tier ≥2 or 3 sessions done. This is the ladder *inside* the
   conversation.
3. **P3 falls — the ladder is one gesture away and signposted.** The Delve-5 path ladder
   survives in the drawer; the first-run coach mark points at it; the spine's stage-1
   summit still routes through structured scenes. A beginner who wants "teach me first"
   finds the full training layer in one swipe.
4. **Silence never dead-ends** (new vs Delve-5's candidate A): 6s stall → chips; double
   empty listen → gentle re-ask; double mishear → chip-only turn with the partner taking
   blame. Every failure mode has a designed floor above "bail."
5. **The keyless stranger still gets a partner** — `_convoScript` behind the identical orb
   (L11's zero-dependency principle extended to the front door).

**What Delve-5 got right vs what changed:** its reasoning was sound against a bare chat
home. The orb candidate is not that candidate: it adds a ramp (onboarding-first), an
in-conversation ladder (guided chips), a speak-first partner, stall floors, and a
one-gesture path. The rejection is defeated by **changing the design until the premises are
false**, not by overriding the argument. The residual risk — a nervous beginner who freezes
even with chips — is exactly what the qa-tester adversary walk (charter §Adversary 2.1)
must pressure-test; §10 OQ-2 holds it open.

---

## 8. Implementation sketch — staged shipping order

Each stage ships alone, keeps the hands-free loop working, bumps the `sw.js` cache
version, and passes a headless Playwright render check before ship. No stage requires
Phase 1. This section is the follow-on `/hydra-forge` brief.

### Stage T1 — The orb, inside the existing convo screen (opt-in)

- **Build:** orb module (`_orbInit/_orbSet/_orbDraw`, one canvas, §3 spec complete
  including mask timers, degrade + suspend rules); mounted in `renderConvo` (9907)
  replacing the avatar header when `state.settings.orbMode` (new, default **ON** — it is
  presentation-only) is set; `_orbSet` calls at the five seams (§5.2 table:
  `_convoSpeakJP` 9384, SR `onstart` in `convoToggleListen`, `convoTurn` 9512, response
  render, `convoEnd`/error paths).
- **Why first:** proves 60fps + state orchestration on the live engine with **zero** IA or
  session-shape risk; the owner sees presence in his current flow within one stage.
- **Acceptance:** CPU-4x ≥28fps speaking; orb states track a full live turn and a keyless
  scripted turn; `convo` screen with `orbMode:false` is pixel-identical to v8.12.

### Stage T2 — Endless engine (still on the convo screen)

- **Build:** `free` pseudo-scene + preamble branch (§5.1, `_convoPreamble` 9230); farewell
  semantics on `sceneDone` (9296 guideline text); end-condition change at 9609 (drop
  turn-cap end; `convoSoftCap` wrap flow §4.5.1); silence-stall ladder + sleep/auto-end
  (§4.3) in the listen orchestration; per-turn XP + convoLog checkpointing (§4.5);
  `state.convoDailyTurns` guard; messages array cap 40 (9521 vicinity); dev cost line
  (5390 gate).
- **Acceptance:** a session survives 40+ turns with flat per-turn payload (window
  assertion); farewell ends it; silence path reaches sleep then auto-recap; soft-wrap
  fires at 30 and continue resets it; tab-kill at turn 25 loses ≤10 turns of convoLog.

### Stage T3 — The Talk screen (reachable, not yet default)

- **Build:** `renderTalk` + `talk` render-map key (18552) + CSS `body[data-screen="talk"]`
  (nav-hide, full-bleed); orb mounted fullscreen; tap-to-wake → `startConvo('free')`; peek
  sheet (§5.4: jp + 🔁 + 👁 EN + topic sparks + ✕ end); chips overlay; drawer handle →
  `nav('home')` with swipe-up/down gestures (reuse the app's existing touch handling
  patterns); Home hero CTA retargeted to `nav('talk')`.
- **Acceptance:** full endless session lives entirely on Talk; peek shows current `jp`/
  `glossEn`; drawer round-trip preserves the live session (`state.convo` survives nav —
  it already does; `_frozen` pauses the auto-mic off-screen).

### Stage T4 — The front-door flip

- **Build:** `frontDoor` setting (default `'home'` at T4-ship, flipped to `'talk'` in
  T4.1 after the owner's field week); boot routing honors it; `nav()` onboarding gate
  extended to `talk` (18570); OB-4 CTA lands on `talk` + one-time coach mark ("swipe up
  for your path"); `updateBackFab` root = `talk`; resume chip pinned topmost in drawer;
  legacy `convo` screen retires — `renderConvo`'s session body is absorbed by Talk, the
  recap card (`_renderConvoRecap` 10002) is kept and shown on Talk at session end;
  `nav('convo')` aliases to `talk` (the established normalization pattern).
- **Acceptance (owner migration):** open → orb; swipe up → resume chip top; routine ≤1
  gesture worse; `frontDoor:'home'` restores v8.12 behavior exactly. **Felt-difference
  probe (L12):** after 7 days of T4.1, the owner is asked the charter's own question — did
  the app *feel* different this week? — recorded before any Phase-1 work is scheduled.

### Stage T5 — Polish + content

- **Build:** `_CONVO_SCRIPT_TURNS` expansion (~15 turns, chip-branch variety) for the
  keyless endless orb; filler-TTS pool (§3.4); 30fps auto-degrade telemetry line;
  guided-chips counter tuning (§7.2); any panel-accepted refinements.

**Ordering rationale:** presentation first (T1, zero logic risk), engine second (T2,
testable on the old screen), new surface third (T3, additive), the irreversible-feeling
flip last (T4) — and even T4 is a setting, not a rewrite. The never-break invariant holds
at every boundary because the engine seams (§5.2) are wrap-points, not rewires.

---

## 9. Decisions reached (locks)

| # | Lock | Reversal condition |
|---|---|---|
| L1 | **Canvas-2D single-canvas orb**, 14-point 3-harmonic blob, pre-baked glow sprite, ≤3 rings, DPR≤2 (§3.1–3.2) | WebGL upgrade only as a Phase-2 spike with fallback |
| L2 | **Four-state machine** (idle/listening/thinking/speaking) + chips as overlay-not-state; 450ms lerped transitions; orb is a pure subscriber via `_orbSet` at five named seams (§3.3, §5.2) | — (architecture foundation) |
| L3 | **Honest-illusion reactivity:** scripted syllable envelope for speaking (no TTS audio tap exists); SR-event pulses for listening; **no parallel getUserMedia during SR** (§3.5) | a device-verified spike proving a safe parallel analyser tap (upgrade, listening only) |
| L4 | **Latency-mask escalation ladder** (morph → shimmer → ≤1 filler TTS at 2.5s → wobble at 6s → blame-taking apology at 12s) (§3.4) | Phase-1 streaming collapses the ladder naturally |
| L5 | **Perf budget §3.6** incl. 30fps auto-degrade + hidden/off-screen rAF suspension | device-lab data |
| L6 | **Orb greets first; one-tap wake gates the cold open** (autoplay/mic gesture) (§4.1) | — |
| L7 | **Endless session:** turn-cap end removed; ends only by farewell (via re-semanticized `sceneDone` — no schema change), tap-to-end, or the silence→sleep→auto-end ladder (§4.2–4.3) | felt-experience regression in the L12 probe |
| L8 | **Cost guard:** soft wrap at 30 advanced turns, 150-turn/day default budget (editable), dev cost readout; never a mid-thought cutoff (§4.5) | Phase-1 server metering replaces tier 2 |
| L9 | **Free-talk default** (`free` pseudo-scene, FOLLOW-THE-LEARNER preamble branch); scenes survive as topic sparks + spine summits; **6-msg window + 40-entry array cap; no rolling-summary call** (§5.1, §5.5) | panel/field evidence that 3-exchange memory breaks the friend illusion → FACTS-accumulator fallback |
| L10 | **Amended IA:** `talk` = front door; Delve-5 Home = drawer (content intact, hero removed); onboarding-before-orb unchanged with OB-4 → talk; legacy convo screen absorbed at T4; `frontDoor` setting makes the flip per-user reversible (§6) | owner's L12 verdict or stranger D1 data |
| L11 | **Minute-one scaffold:** onboarding ramp + orb-speaks-first + always-visible chips for first 3 tier-1 sessions + stall/mishear floors + drawer ladder one gesture away (§7) | qa-tester walk finds an undefended freeze point |
| L12 | **Felt-difference acceptance signal:** after 7 days on the flipped front door, the owner's own "does it feel like talking to someone?" verdict is collected and recorded; a "still no difference" outcome is a *finding that Phase-1 latency/voice is the blocker*, and does NOT trigger IA churn back (§1.4, §8-T4) | — (it is the measurement, not a bet) |

Inline decision-notes (deliberately not ADRs — reversible, local blast radius): hue
language values, harmonic counts, 6s stall timer, 45s/3min sleep ladder numbers, 30-turn
soft cap and 150/day defaults, guided-chips "3 sessions" counter, script-bank size, peek
sheet contents, drawer gesture details.

---

## 10. Open questions still open

1. **Does presence + endlessness move the felt-experience needle without Phase-1
   latency/voice?** L12 measures it; genuinely unknowable until the owner's field week.
   (Charter-audit WARN, held open honestly.)
2. **The frozen beginner:** does a nervous true beginner actually tap chips when the orb
   waits? §7 defends every *mechanical* dead-end; the *psychological* one needs the
   qa-tester walk and then a real stranger. If chips-always-on for 3 sessions is not
   enough, the designed fallback is a fully-guided first Talk session (scripted rails
   inside the live engine — OB-3A's pattern extended).
3. **`sceneDone`-as-farewell false positives:** will the model end sessions on ambiguous
   goodbyes (e.g. the learner *practicing* またね mid-chat)? Mitigation candidates (confirm
   chip before recap vs trust-and-instant-resume) — panel should pressure-test; leaning
   trust + a 「もどる」 chip on the recap card (undo = instant new session with same
   context window).
4. **Wake-lock policy:** should Talk request a screen wake-lock during active sessions
   (battery vs dead-screen-kills-hands-free)? Currently inherited from the drill loop's
   behavior; needs a deliberate call at T3.
5. **Owner's drawer muscle-memory:** is swipe-up discoverable enough for HIS day-1, or
   does T4 need a persistent mini-path pill under the orb for week one? Decide at T4.1
   with him.
6. **Keyless endless quality:** is a 15-turn script bank enough for the front door, or
   does the keyless orb need a visible "practice partner (offline)" framing so
   expectations are honest (Praktika ad-vs-reality lesson applied to ourselves)? Leaning
   the honest label; T5 decision.
7. **Filler-TTS cultural fit:** うーん/そうですね fillers at 2.5s — natural or annoying at
   frequency? Tunable pool + per-turn cap already locked; the *default-on* question stays
   open for the owner's week.

---

## 11. Foundation doc updates

Proposed here; **applied at synthesis** (delve layering — this primary commit patches no
foundation docs):

- `INDEX_ROADMAP.md` — amend the Phase-0/front-door row to point at this doc as the Talk
  front-door spec; note the forge brief lives in §8; keep the Delve-5 doc as the parent
  IA record.
- `docs/delve-cycles/5-conversation-first-product.md` — **pointer note at §3** (not a
  rewrite): "§3's L1 front door superseded by Delve 6 (`6-talk-mode-presence.md` §6);
  remaining locks intact per its §6.5 ledger."
- ADR-008 (pending, "Conversation-first two-door IA") — synthesis notes the supersession
  in its status line when filing this delve's ADR (§12); promotion/rejection remains a
  human step.
- Auto-memory [[project_japanese_trainer_scope_decision]] and
  [[project_japanese_trainer_goal]] — the front door is now the conversation itself; the
  hands-free drill loop remains the training layer (unchanged in spirit).
- `ROADMAP.md` — no edit now (archive doc).

---

## 12. ADR proposals (heuristic policy — placeholders only, filed at synthesis)

- **ADR-P1 → propose as ADR-010: "Talk-mode orb front door (supersedes ADR-008's two-door
  IA)."** Load-bearing and costly to reverse: it re-lands the boot route, retires the
  `convo` chat screen, demotes the shipped Home to a drawer, retrains the only proven
  daily user, and every commercial artifact (store screenshots, onboarding, ads) will
  depict the orb. Contents: §6 IA + §7 scaffold + the L12 measurement discipline + the
  explicit supersession ledger (§6.5). Status: Proposed, pending owner signoff.
- **Everything else stays inline.** The orb rendering spec (L1–L5), session shape
  (L6–L8), and engine layering (L9) are deliberately *not* ADRs: they are reversible with
  local blast radius (a canvas module, preamble prose, settings defaults), and the
  heuristic policy exists precisely to stop minting ADRs for every lock. If the panel
  argues the endless-session cost guard deserves ADR status because it touches the
  commercial architecture, synthesis re-decides with that argument on the table.

---

*End of Round-1 primary. Adversary panel and synthesis follow per charter.*
