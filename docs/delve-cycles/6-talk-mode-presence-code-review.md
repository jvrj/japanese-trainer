# Delve 6 — Code-Review Adversary (Round 1)

**Target:** `docs/delve-cycles/6-talk-mode-presence.md` (committed `720548b`)
**Charter:** `docs/delve-cycles/6-charter.md`, Adversary 3 (code-reviewer)
**Scope:** verify engine claims against `index.html` (~20.5k lines), assess feasibility of the
orb spec, assess whether the endless-session and wiring locks (Task 2/3) map onto the live
render architecture without a rewrite, and check whether anything quietly needs Phase-1.

No prompt-injection attempts found in the primary doc or charter (both read purely as design
prose/data; no embedded instructions to this reviewer were present).

## Headline

Citation discipline is excellent, but the doc's central wiring lock (Task 3 / L9) has a real,
concrete implementation gap that a literal forge build would hit on day one.

Roughly 30 line-number citations were spot-checked against index.html (five-key contract
9282-9289, FOLLOW-THE-LEARNER 9275-9278, slice(-6) 9524, double-miss/forceChips
9487/9559-9575/9970, downshift ladder 9577-9600, end condition 9609, hands-free chain
9622-9626, convoHandsFree 2789, CONVO_TIERS 2816-2819, SCENES 2858-2865, convoLog 2929-2930,
voiceSupported 5175, _whisperRecord 5479-5510, _buildSpeakJP 14676, render map 18552,
renderHome 18747, renderPractice 19151, renderConvo 9907, _renderConvoRecap 10002,
_convoOpenProbe 9410-9438, _convoCall 9311-9323, _convoScript 9331, startConvo 9444, convoEnd
9680, convoToggleListen 9780). Every one of these checked out exactly or within a couple of
lines of the cited range. This is unusually rigorous grounding for a design doc and should be
credited. The findings below are the substantive exceptions.

## Findings

### 1. SERIOUS — startConvo('free') cannot select the free pseudo-scene as coded

Citation: primary doc, section 5.1: "startConvo('free') is the orb-tap target; minLevel
gating (2989-era logic) does not apply to free (available from tier 1...)"

startConvo(sceneId) resolves the session's scene via (index.html:9448-9449):

    const available = SCENES.filter(s => s.minLevel <= info.lv);
    const scene = (available.find(s => s.id === sceneId) || available[0] || SCENES[0]);

SCENES is the documented "closed bank" of six scenarios (index.html:2852-2865: intro, food,
family, town, daily, hobbies) and does not include free. Per section 5.1 the free pseudo-scene
is deliberately kept outside that six-scene bank ("the six existing SCENES... survive as topic
sparks"). So available.find(s => s.id === 'free') will always return undefined, and the
fallback silently resolves to available[0] — i.e. startConvo('free') as currently coded starts
the tier's first real scene (e.g. 'intro') instead of free-talk. This is the mechanism the
entire orb front door depends on (Task 3 is LOCKED, and this is lock L9), yet section 8 Stage
T2's build list only names changes to _convoPreamble (9230), the sceneDone guideline text
(9296), the end condition (9609), the silence ladder, XP/convoLog, and the daily-turn guard —
it never lists a required change to startConvo's scene-resolution branch (9444-9449). A forge
build following section 8 literally would ship an orb that opens the wrong scene every time.

Also: the supporting citation "(2989-era logic)" for where minLevel gating lives is itself
wrong — index.html:2989 is inside the ROMAJI_KANA yoon table (hya, hyu, hyo entries), an
unrelated romaji-typing subsystem. The actual gating logic is at index.html:9448, roughly 6460
lines away — not a rounding/"-era" imprecision, a wrong location entirely.

### 2. SERIOUS — _convoPreamble's scene param is a formatted display string, not the raw id

Citation: primary doc, section 5.1: "In _convoPreamble, when scene === free, the SCENE line
(9272-9273) is replaced by..."

_convoPreamble(pool, freeSet, scene, partner) (index.html:9230) receives scene already
formatted by its only caller: _convoPreamble(pool, _convoFreeSetWords(), scene.nameJP + '
かいわ', partner) (index.html:9454). For the proposed free scene object ({id:'free',
nameJP:'フリートーク', ...}) that means _convoPreamble would receive the string "フリートーク
かいわ", never the literal id 'free'. A check of scene === 'free' inside _convoPreamble (as
the doc states) will never be true. Fixing this needs either a new parameter threading the raw
sceneId through the call chain, or the branch decided in the caller (startConvo) before the
string is built — neither is named anywhere in section 5.1 or the Stage T2 build list.
Combined with Finding 1, the two central mechanics of the "free-talk without a scene" lock
(section 5.1, load-bearing for L9 and for the whole front-door pitch in sections 6-7) are both
unwired as specced.

### 3. SERIOUS — the cited "recognition onstart" seam does not exist in source

Citation: primary doc, section 5.2 seam table: "recognition onstart (inside
convoToggleListen's SR setup) | _orbSet('listening') | listening"

Searched the full file for .onstart on any SpeechRecognition instance: none exists.
convoToggleListen (index.html:9780-9814) sets cv.listening = true synchronously (line 9784)
before calling startVoice(...); startVoice (index.html:5177) wires only rec.onresult,
rec.onerror, and rec.onend (index.html:5222-5223) — no rec.onstart anywhere. The only .onstart
handler in the entire file is on a SpeechSynthesisUtterance (TTS), at index.html:5136 — an
unrelated API, not SpeechRecognition. Section 5.2 claims the orb "wraps, never rewires" via
"exactly these five seams," but this seam does not exist to wrap: adding it requires either a
genuinely new rec.onstart handler inside startVoice/getRecognition (a real wiring change) or
retargeting the seam to the existing cv.listening = true assignment at convoToggleListen line
9784. As written, one of the five "already built and load-bearing" seams the wiring lock rests
on is not load-bearing — it isn't there.

### 4. QUESTIONABLE — cost-guard thresholds rest on an unsourced per-turn price estimate

Citation: primary doc, section 4.5: "approx $0.003/turn; a heavy 100-turn day approx $0.30; a
runaway month approx $9"

The token counts feeding this (1.2k preamble plus 6-msg window, up to 400 out) are correctly
sourced (max_tokens: 400 at index.html:9318, model id claude-haiku-4-5-20251001 at
index.html:9314). But the dollar figure derived from those token counts cites no per-token
price anywhere — not in the repo, not in the cited Praktika report (used elsewhere in the
primary doc for a different claim), not as an inline note flagging it as an estimate. The
specific numeric caps this doc locks (L8: 30-turn soft cap, 150-turn/day default) are
downstream of that unsourced number. If actual Haiku-4.5 pricing differs meaningfully from the
assumed rate, the locked thresholds don't automatically track it. This doesn't undermine the
tiered design (soft wrap / daily budget / dev readout — all sound and backend-free), only the
specific numbers chosen, which read with a false precision for a value that isn't grounded in
a citable source.

### 5. QUESTIONABLE — the "reviewed interactive mockup" that Task 1 formalizes has no in-repo artifact

Citation: primary doc section 1.2: "The reviewed interactive mockup (canvas blob, harmonic
deformation, state-blended hue/glow, inward rings = listening, outward rings = speaking,
chips-on-stall at 6s, tap-to-peek) is the validated base to evolve, not re-open"

Checked git log --all for any orb/mockup commit and searched the working tree for
orb/canvas/harmonic content outside index.html: no matching commit, and the two files that do
match "mockup" (study_notes/home_mockups.html, study_notes/home_mockups_all.html) contain no
orb/canvas/harmonic content. The entire visual-architecture lock in section 3 (14 control
points, 3 harmonics, ring cadence, hue values) is presented as formalizing an owner-reviewed
artifact, but nothing in the repo lets an independent auditor verify that artifact ever
existed in the stated form, or that the owner's approval quote ("i kind of like it as a very
base form") attaches to the same details being locked here. This gap is inherited from the
charter (which also states the mockup was "built and owner-reviewed 2026-07-17" with no path)
rather than introduced by the primary doc, but the primary doc treats it as load-bearing prior
art without adding traceability.

## Charter Q1 — does Talk map onto the render architecture without a rewrite?

Outside Findings 1-3, yes. The render-layer plan is coherent and precisely cited: the render
map dispatch object at index.html:18552, the 'today' to 'home' normalization precedent at
index.html:18561-18567, the onboarding gate at index.html:18573, updateBackFab at
index.html:18592-18598, and the body[data-screen="home"] CSS-hook pattern (index.html:162,
405-406, precedent confirmed) all support the doc's claim that talk can be added as a sibling
render-map key plus a sibling body[data-screen="talk"] hook without restructuring
render()/nav(). state.convo is a top-level state field independent of state.screen, so the
claim that it "survives nav" across the drawer round-trip (section 6.3 T3 acceptance) is
correct.

## Charter Q2 — 60fps feasibility

Plausible, not fully verifiable from source. The Canvas-2D single-path approach, pre-baked
glow sprite, and up-to-3 ring-stroke budget are reasonable choices for a mid-range-phone
budget; the platform facts driving section 3.5 (no AnalyserNode on speechSynthesis; the
existing _whisperRecord AnalyserNode pattern at index.html:5479-5511 genuinely does record
instead of SR, confirmed by reading the function — it opens its own
getUserMedia+AudioContext, never running alongside SpeechRecognition) are accurate. No
feasibility red flag found; this claim class is a design choice, not a source-verifiable fact,
so it stays out of scope for a stronger verdict here.

## Charter Q4 — quiet Phase-1 dependency

None found. Every new mechanism proposed (orb canvas module, free pseudo-scene, silence/sleep
ladder, XP per-turn, convoLog checkpointing, daily-turn guard, dev cost readout) is
client-side-only and does not require streaming, a server key, or server memory.

## Verdict

WARN. Citation discipline across roughly 30 spot-checked line references is excellent and the
render-layer/IA plan (section 6) is sound. But the doc's own central "wiring" lock (sections
5.1-5.2, lock L9, marked LOCKED) has two concrete, source-verified implementation gaps
(Findings 1-2) plus one non-existent cited seam (Finding 3) that together mean Stage T2/T3 as
specced would not produce a working free-talk default if built literally — synthesis should
require these be patched into the wiring section (or explicitly deferred as forge-time TODOs)
before this doc's Task 3 lock is treated as build-ready.
