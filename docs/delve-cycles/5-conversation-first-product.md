# Delve 5 — Conversation-First Product Restructure (the world-class de-sprawl)

**Round 1 · Primary investigation doc**
**Date:** 2026-07-16
**Charter:** `docs/delve-cycles/5-charter.md`
**Mode:** Opus-only design/decision — every task below ends in a **lock**, not a discussion.

---

## 1. Charter — scope + thesis + research grounding

### 1.1 Scope

Isshin (`index.html`, single-file vanilla-JS PWA, ~21.2k lines, no build) has a working
conversation mode (おしゃべり, Delve 1), a progressive-vocab coverage meter (Delve 2), and a
locked productization architecture (Delve 4: ~$8.99/mo subscription, Supabase proxy,
RevenueCat, Capacitor — all Accepted, none built). But the app a stranger opens today is a
**workshop with ~15 doors**. The render map at `index.html:18855` routes **29 screens**
(`home, today, settings, particles, blitz, forms, formDrill, formBlitz, kanaBlitz,
sentenceBlitz, buildMode, phrases, phraseBlitz, variations, variationBlitz, library, modules,
similar, speakDrills, speakDrillSession, focus, collections, progress, sentenceCoach, recall,
memory, nuance, formsLadder, convo`). That is the opposite of the owner's own mandate ("the
hands-free voice drill loop IS the app" — [[project_japanese_trainer_scope_decision]]) and of
what a sellable product needs.

**The owner's product thesis (2026-07-16):** the endgame is **talking to an AI friend/teacher
— a real conversation, with zero subconscious judgment**. Every surface must either BE that
conversation or visibly train you for it.

This delve locks six things: (1) the front-door IA with a keep/merge/cut/bury verdict for
every surface, (2) the first-minute onboarding flow, (3) judgment-free as an enforceable spec,
(4) the guilt-free retention baseline, (5) the course spine ("path to your first real
conversation"), (6) positioning + naming. It ends with a staged implementation sketch a
follow-on `/hydra-forge` can build from.

### 1.2 Research grounding (evidence caveats carried in)

Grounding evidence: `reports/hydra-research/2026-07-16/REPORT.md`. Load-bearing findings:

| Finding | Claim | Status |
|---|---|---|
| H2 | No app is Japanese-primary + conversation-first; the white space is "Japanese-first, conversation-first, judgment-free" | [UNVERIFIED-EVIDENCE] — absence-of-evidence across review blogs |
| H3 | Judgment-free is **engineered, not declared**: latency, TTS warmth, correction *framing* carry the feeling; no accuracy %, feedback optional; Jumpspeak false-positive STT and Duolingo guilt loops are the anti-patterns | [UNVERIFIED-EVIDENCE] — directional |
| H1 | Langua is the UX benchmark — free-form chat, **post-conversation feedback that never interrupts flow**; Isshin's beginner segment needs *more* scaffolding than Langua | [UNVERIFIED-EVIDENCE] — app-affiliated blogs (Langua = Languatalk) |
| Onboarding lane | Inverted onboarding (product-first, signup-deferred), **first spoken exchange in <60–90s**, two-path entry (true beginner skips placement; returnee gets ~3-question router) | [UNVERIFIED-EVIDENCE] |
| M3 | Streaks retain (3.6x engagement claims) but conflict with judgment-free → **optional, no-shame, private-by-default** | Duolingo streak-mechanics source adversarially verified; effect sizes directional |
| M2 | Free tier must be a functional lesson; paywall day 3–5; trial config is an experiment (rate vs LTV) | [UNVERIFIED-EVIDENCE], partially contradicted at source |

**Caveat rule applied throughout:** where a lock leans on an [UNVERIFIED-EVIDENCE] number, the
lock is designed so the *direction* (not the number) is load-bearing, and the number is marked
as a tuning knob. Example: "<90s to first spoken exchange" is locked as a budget because
faster-to-value is directionally safe even if the specific 77%-churn-in-3-days figure is not
independently confirmed.

### 1.3 Constraints (inputs, not open questions)

- Single-file, no-build PWA **for now**. Nothing in this delve may depend on the Delve-4
  backend existing. Accounts/paywall UI may be *designed for* but must degrade to local-only
  today. **Corollary locked here: the onboarding first exchange must run with zero API key
  and zero network beyond static assets** (scripted, local TTS/STT).
- The working hands-free loop must never break mid-migration; staged, shippable increments,
  each render-verified headlessly before ship ([[feedback_verify_render_not_cache]]).
- Kana-only Japanese output ([[feedback_no_kanji]]); the 一心 brand wordmark is treated as a
  logo, not learning content (see §8.4 open question).
- Universal-phone, not Pixel-only ([[project_japanese_trainer_commercial]]).
- Delve-4 locks (subscription $8.99/mo, Supabase, RevenueCat, Capacitor, fair-use cap) are
  inputs (`docs/delve-cycles/4-productization-architecture.md` §11). Voice-stack provider
  choice (research H4) is **out of scope** — Phase-1 backend track.
- ADR-003 (progressive-vocab non-locking coverage meter, `docs/decisions-pending/ADR-003…`)
  is **Proposed, awaiting owner signoff** — §7 resolves against it explicitly without silently
  deciding it.
- STT is a turn-trigger + optional echo, never a grader ([[project_japanese_trainer_stt_not_grader]],
  v8.03). Nothing here reintroduces pronunciation scoring.

---

## 2. Method

1. **Read against source.** Every architectural claim below was checked in `index.html` at a
   cited line: the 29-screen render map (18855), the bottom nav (628–632), the Daily Path
   model `_dailyPathModel()` (18916), `renderToday` (18997), `renderHome` (19057, the topics
   screen), `CONVO_TIERS` (2946), `CONVO_PARTNERS` (2960), `SCENES` + `minLevel` gates (2989),
   `convoLevelInfo()` (3016), `progConversationalCore()` (18679), `PROG_LADDERS` (18692),
   the v7.76 "computed-but-unrendered" home list (19261–19267), `modulesEnabled:false`
   default (settings block ~2920), `state.streak` (19059).
2. **Force the decision.** Each task section states candidates, picks one, and records the
   lock with its reversal condition. Alternatives are recorded as rejected-with-reason so the
   adversary panel can attack the reasoning, not reconstruct it.
3. **Carry the evidence grade.** Research-derived numbers are labeled priors; locks are
   phrased so they survive the number being wrong (direction-load-bearing design).
4. **Design for the two real users.** (a) The stranger from a Facebook ad
   ([[project_japanese_trainer_commercial]]) and (b) the owner — the only proven daily user —
   whose routine (tap a topic → hands-free drill while driving) must survive the restructure
   with at most one extra tap, with a Home resume shortcut making the common case zero extra
   taps (§3.5).
5. **Stay buildable.** Every lock maps to named functions/screens in §9's staged sketch; no
   stage requires the Phase-1 backend.

---

## 3. The front door — target IA (Task 1) 🔒

### 3.1 Candidates

- **A. おしゃべり-first** — the conversation screen IS the home. *Rejected:* a true beginner
  cannot hold a conversation on minute one; landing them inside a live AI chat with no ladder
  is the fastest bail point (research: beginner segment needs *more* scaffolding than Langua,
  H1). It also hides the training loop that makes the conversation improve.
- **B. Daily-Path-first** — guided ladder as home, conversation as summit (the current
  `today` tab, 18997). *Rejected as sole front door:* it buries the product's soul. The thesis
  says every surface must BE the conversation or visibly train for it; a checklist-first home
  reads as "another drill app," forfeiting the H2 positioning.
- **C. Hybrid — one hero CTA + one train surface.** Home leads with the conversation (partner
  avatar + "Talk" hero), with today's path rendered directly beneath as the visible ladder to
  it, and a single Practice tab for everything else. **LOCKED.**
- (Charter-adjacent cheap alternative — *re-default only*, keep 3 tabs and just reorder:
  rejected because the sprawl is structural, not ordinal; 12 doors one tap from home is still
  a workshop, and the adversary-4 "de-sprawl theater" attack lands on it.)

### 3.2 The lock — navigation map

**Bottom nav collapses 3 tabs → 2 tabs + the existing settings gear** (top bar, 19145):

```
┌─────────────────────────────────────────────────────────┐
│  HOME (new renderHome)                    ⚙ (top bar)   │
│                                                         │
│  ① Spine header — "Stage 2 · じぶんの こと"             │
│     path-to-first-conversation bar (§7)                 │
│  ② HERO — partner avatar + 「おしゃべり — Talk」CTA      │
│     tier chip (はじめて…じょうず) + XP bar (3016)        │
│  ③ Today's path ladder — 5 training steps + convo       │
│     summit (reuses _dailyPathModel, 18916)              │
│  ④ Resume chip — "▶ Continue: Food · hands-free"        │
│     (last activity; the power-user escape hatch)        │
├─────────────────────────────────────────────────────────┤
│  PRACTICE (renderPractice = today's topics home 19057)  │
│                                                         │
│  · Topics grid (hands-free ▶ per topic — unchanged UX)  │
│    scope row absorbs Collections + Focus + Textbook     │
│  · 6 fixed practice tiles:                              │
│    Kana あ · Verb forms 🪜 · Sentences 📜 ·             │
│    Speak drills 🗣 · Phrases 💬 · Typed blitz ⚡        │
├─────────────────────────────────────────────────────────┤
│  bottom-nav:  [ Home 💬 ]  [ Practice 🏋 ]              │
└─────────────────────────────────────────────────────────┘
```

- **Stranger on open:** sees the promise (spine header + partner + Talk hero) and the ladder
  that makes it achievable. First-run routes to onboarding first (§4).
- **Returning user:** sees stage + streak-softened header, the partner ("あおい is around"),
  today's path state, and the one-tap resume chip.

### 3.3 Keep / merge / cut / bury — verdict for every surface

All 29 render-map keys (18855). Verdict vocabulary per charter: **hero / path-step /
practice-drawer / settings-buried / deleted**. Internal session screens ride with their door.

| # | Surface (`state.screen`) | What it is today | Verdict | Disposition detail |
|---|---|---|---|---|
| 1 | `convo` (おしゃべり) | AI conversation mode | **hero** | The Home hero CTA. Scene picker + tier chip fold into the hero card. |
| 2 | `today` | Daily Path tab (18997) | **merge → hero screen** | Path ladder renders on Home under the hero; `today` ceases to be a tab. `pathGo()` routing unchanged. |
| 3 | `progress` | Milestones + Conversational Core % (18713) | **merge → hero screen** | Becomes the spine header on Home (§7) + an expandable detail sheet. No separate nav door. |
| 4 | `home` (topics grid) | Current home (19057) | **merge → practice-drawer** | Renamed `renderPractice`, near-verbatim: topic tiles + ▶ hands-free launch + search. |
| 5 | `buildMode` (+ Start/Step/Complete, 17657–18388) | THE hands-free voice loop engine | **path-step** | Engine of the "Learn new words" step and of every topic ▶ launch. Untouched internally — the never-break invariant. |
| 6 | `recall` | Warm-up recall (10373) | **path-step** | Step 1 of the path (already is, 18923). |
| 7 | `sentenceCoach` | Say-a-sentence coaching (10154) | **path-step** | Step 3 (already is). English prompts stay banned ([[feedback_japanese_trainer_no_english_prompts]]). |
| 8 | `nuance` | Look-alike discrimination (10749) | **path-step** | Step 4 (already is). |
| 9 | `memory` | Retention check (10568) | **path-step** | Step 5 (already is). |
| 10 | `kanaBlitz` | Kana trainer (charter: keep kana learning) | **practice-drawer** | Fixed tile. Also the Stage-0 routing target for true beginners (§4, §7) — verdict stays drawer; the stage routes into it. |
| 11 | `blitz` (typed Vocab Blitz) | Typed SRS drill | **practice-drawer** | "Typed blitz" tile — the quiet-environment fallback. Not on Home. |
| 12 | `formsLadder` | One verb · every form (10833) | **practice-drawer** | Survives as the single "Verb forms" tile front. |
| 13 | `forms` (hub, 8014) | Verb-form hub | **merge → practice-drawer** | Folded behind the Verb forms tile (ladder-first; hub reachable from it). |
| 14 | `formDrill`, `formBlitz` | Form sessions | **merge (internal)** | Session screens of Verb forms; no doors of their own. |
| 15 | `sentenceBlitz` | Sentence drill (typed + spam) | **practice-drawer** | "Sentences" tile → audio-led Sentence Spam (the v7.54 routing, 19248–19253); typed variant internal. |
| 16 | `speakDrills` (+ `speakDrillSession`) | Contrast/conjugation speech drills (17427) | **practice-drawer** | "Speak drills" tile; session internal. |
| 17 | `phrases` (+ `phraseBlitz`) | Phrasebook + drill (11995) | **practice-drawer** | "Phrases" tile; drill internal. |
| 18 | `focus` | User word basket (4930) | **merge → practice-drawer** | Becomes the ⭐ scope in the Topics scope row — not a separate door. |
| 19 | `collections` | User word groups (19680) | **merge → practice-drawer** | Already chips in the scope row (19379–19393); the management screen opens from a "manage" affordance there. |
| 20 | `modules` | Opt-in linear unlock path (19490) | **settings-buried** | Already default-off (`modulesEnabled:false`, v7.69). Stays a Settings toggle + screen; never resurfaces on Home (ADR-003 posture). |
| 21 | `settings` | Settings wall (20417) | **settings (kept, slimmed)** | Gear stays in the top bar. Slimming itself is a Stage-D item: group into Voice / Learning / Data; BYO-key cards die in Phase 1 (Delve 4). |
| 22 | `library` | Word browser (19998) | **deleted** | Already de-surfaced v7.76. Word lookup lives inside topic/collection screens. Code removed in Stage E. |
| 23 | `similar` | Similar-words explorer (13082) | **deleted** | Overlaps `nuance` + speak-drill contrast. Stage E. |
| 24 | `variations` + `variationBlitz` | Sentence-variation drills (12567) | **deleted** | Overlaps sentenceCoach/sentence spam. Stage E. |
| 25 | `particles` | Particle fill drill (20317) | **deleted** | は/が/を discrimination lives in speak drills + nuance + coach corrections. Stage E. |

**Deletion means deletion.** Stage E removes the render functions, nav references, and dead
data of rows 22–25 from `index.html` (not merely un-surfacing — the v7.76 "parts bin"
comment at 19261–19267 documented the softer approach; this delve hardens it). Git history is
the parts bin. This answers the "de-sprawl theater" attack in advance: 25 → **2 tabs, 1 hero,
6 path/spine steps, 7 drawer tiles, 1 settings door**.

### 3.4 Surviving door count (the number that matters)

Doors a stranger can reach within one tap of open: **Home** (hero + path + resume) and
**Practice** (topics + 6 tiles). Everything else is inside those or behind ⚙. From ~15
first-class doors to **2**.

### 3.5 Power-user escape hatch (owner's routine)

The owner's daily routine is: open → tap a topic (or the Continuing card) → hands-free drill
([[feedback_japanese_trainer_spam_mode_template]] shape). After restructure: Home renders a **resume chip**
(the current `contCard` logic, 19426–19435, relocated) reproducing the Continuing card —
zero extra taps for the common case; a fresh topic pick is Home → Practice → tap ▶ (one extra
tap vs today). Locked as an explicit acceptance criterion in §9 Stage A.

---

## 4. First-minute onboarding (Task 2) 🔒

### 4.1 Design constraints

- **<90s from cold open to first spoken Japanese exchange** (budget locked; beginner path
  targets ≤60s). Direction-load-bearing even if the research numbers are soft.
- **Zero-key, zero-backend:** the first exchange is **scripted** — canned partner lines,
  local TTS (`_buildSpeakJP` machinery), STT as turn-trigger only. No Claude call, no account.
  This also makes onboarding the free-tier's "functional first lesson" (M2) by construction.
- **Two-path entry:** true beginner skips placement; knows-some-Japanese gets a ≤3-question
  router. Router is skippable.
- **Signup/paywall designed-for, not present:** insertion points marked, nothing built now.
- **Existing users never see it:** first-run detection backfills done-state from existing
  data (§9 Stage B).

### 4.2 The locked flow — screen by screen

| # | Screen | Content | Budget (cum.) |
|---|---|---|---|
| OB-0 | **Promise** | 一心 wordmark · one-liner (§8.2) · one CTA **「はじめる — Start」** · tiny "I've used Isshin before" (→ restore/skip) | 0–8s |
| OB-1 | **One question** | "How much Japanese do you have?" → **ぜんぜん — none yet** / **すこし — a little** / **けっこう — a fair bit**. Nothing else asked. No goal quiz, no age, no email. | 8–15s |
| OB-2 | **Meet your partner + mic pre-prompt** | Random partner from `CONVO_PARTNERS` (2960), e.g. あおい 🧑‍🎨: "あおい will talk — you talk back. Allow the microphone so she can hear you." [Allow mic] → browser permission. **Denied/no-mic fallback:** "No mic? Tap your replies instead" — chips-only variant, identical script. | 15–25s |
| OB-3A | **First exchange (beginner path)** | Scripted 3 turns, hands-free (`convoHandsFree:true` default, 2923): ① Partner TTS: こんにちは! — screen shows こんにちは + romaji + 🔁 replay + 👁 peek-meaning (English stays behind the peek, [[feedback_japanese_trainer_no_english_prompts]]); mic auto-opens; user says it. **← first spoken exchange, ~40–50s.** ② Partner: こんにちは! わたしは あおい です。あなたは? — chip scaffold わたしは ___ です; user speaks their name in the frame. ③ Partner: 〔name〕さん、はじめまして! | 25–75s |
| OB-3B | **Router (returnee path)** | ≤3 taps, skippable ("just start talking →"): Q1 kana check (read ひと — 3 options); Q2 production self-check ("Could you say 'I eat sushi' out loud?" — yes/roughly/no); Q3 listening check (partner speaks たべもの が すき です — pick gist). Places Stage 1/2/3 (§7) and skips Stage 0 if Q1 passes. Then → OB-2 mic pre-prompt → a stage-matched scripted exchange (same 3-turn shape, higher-tier lines). | 15–60s; spoken exchange ≤90s |
| OB-4 | **First-win card** | "That was Japanese — you spoke it. 🎉" + "Day 1 together" + single CTA **「つづける — Keep going」** → Home, path seeded at the user's stage. NO score, NO accuracy, NO signup. | +8s |

**Future insertion points (designed, dormant):** (a) after OB-4, a soft "save your progress"
account prompt — Phase 1 only; (b) paywall trigger day 3–5 after a completed session (M2
prior; exact day is an experiment, §11). Both are marked in the flow as no-ops today.

### 4.3 First-run state (design)

`state.settings.onboard = { done:false, path:null /* 'new'|'router' */, placedStage:null }`
— additive to `DEFAULT_SETTINGS` (the ADR-003 additive-merge pattern; no migration transform).
On load, if the user already has data (`Object.keys(state.stats).length > 0` or
`convoXp > 0`), `onboard.done` backfills `true` — existing users (the owner) never see OB-0.

### 4.4 Bail-point audit (self-applied before the QA adversary)

- OB-0→OB-1: two taps, no typing — minimal.
- Mic permission is THE bail risk: pre-prompt framing (partner *wants to hear you*, not "app
  needs permission") + full chips fallback so denial never dead-ends.
- STT miss on turn 1: turn-trigger semantics (v8.03) — partner proceeds warmly on ANY speech
  detected; a silent 6s timeout re-prompts once, then offers chips. Never "I didn't catch
  that, try again" twice in a row (§5.4 double-miss rule).

---

## 5. Judgment-free as a spec (Task 3) 🔒

Research H3: the feeling is manufactured by **latency + TTS warmth + framing**. This section
is the enforceable style guide — copy rules per surface, hard budgets, defaults.

### 5.1 Global copy rules (all surfaces)

1. **No accuracy percentage anywhere user-facing.** This includes the current Home stats row
   ("Accuracy" tile computed at 19060–19062, rendered 19342–19356) — **removed in Stage D**.
   SRS keeps using correctness internally; it just never wears a % badge.
2. **Score language = production volume, not correctness:** "conversations completed",
   "you talked 12 min", "words you said out loud", "day 4 together".
3. **Corrections are observations or questions, never verdicts.** Template:
   「Xって いいましたか? Yも いいますよ」 / "I heard X — did you mean Y?". Banned words in
   user-facing copy: *wrong, incorrect, failed, mistake, error, score, accuracy, grade*.
4. **No red-X iconography, no failure buzzers.** Wrong-answer reveals are neutral:
   「→ こたえ: たべます」 with the same visual weight as a correct reveal.
5. **The partner takes the blame for tech failures.** STT trouble is always the listener's
   ear, never the speaker's mouth: 「ごめん、よく きこえなかった!」.
6. **Private by default:** no leaderboards, no social comparison, ever (lock; not "opt-in
   later" — a judgment-free brand cannot carry a league table).
7. Kana-only Japanese in all copy ([[feedback_no_kanji]]); every taught word carries its
   nuance note ([[feedback_surface_nuances]]).

### 5.2 Per-surface rules

| Surface | Mid-flow | After the fact |
|---|---|---|
| おしゃべり | **Never correct mid-conversation** (Langua reference model, H1). Optional echo 「🎤 きこえた: X」 stays (v8.03). Partner confusion is expressed in-character as a question, not a correction. | Post-conversation recap: **celebration-first** (turns held, words used, minutes), then **≤3 gentle notes** in did-you-mean framing. Recap notes toggle: `state.settings.convoRecapNotes`, **default ON** (rationale §5.3). |
| Onboarding exchange | No feedback at all. Any speech advances warmly. | First-win card only (§4.2 OB-4). |
| Blitz / recall / memory misses | Neutral reveal (rule 4); SRS reschedules silently. Miss copy: 「まだ ですね — it'll come back soon」. | Session end: items seen + "coming back tomorrow: N" — no right/wrong tally headline. |
| Sentence coach | Coaching phrased as offers: 「こう いうと もっと いい ですよ」 ("saying it this way is even better"). | Same recap shape as convo. |
| Speak/form drills | Turn-trigger semantics; reveal-and-model, not reject-and-retry. | Volume framing only. |

### 5.3 The feedback default (decision-note)

**Recap notes default ON.** The H3 devil's-advocate tension is real (feel good, learn
nothing): silent-by-default risks the plateau; the hedge is *placement* (post-flow only) +
*cap* (≤3) + *framing* (did-you-mean) + a *one-tap OFF*. Default-ON also matches the owner's
standards-over-comfort learning stance ([[feedback_standards_over_rules_of_thumb]]). The
rigor lives in the drills and the recap, so the live conversation can stay consequence-free.

### 5.4 The double-miss rule (STT failure containment)

After **2 consecutive** STT misses in any voice surface: the partner apologizes (rule 5),
**switches that turn to chips/typed input automatically**, and the session continues. Misses
never accumulate visible state, never feed SRS ([[project_japanese_trainer_stt_not_grader]]),
and the third prompt is never another open mic. This is the qa-tester "STT mishears twice"
scenario, resolved by design.

### 5.5 Latency + TTS budgets (product requirements)

| Metric | Now (local Web Speech / BYO era) | Phase 1 (backend, cascaded stack) | Basis |
|---|---|---|---|
| Convo turn RTT (user stops speaking → partner audio starts) | **≤3.5s target / 5s max**; fill with partner "thinking" affordance (typing dots + occasional うーん… filler TTS ≤1 per turn) | **≤1.2s target / 700ms stretch** | Retell pipeline anatomy: ~600ms feels human, >700ms degrades (verified source, REPORT ledger) |
| TTS start after text ready | ≤500ms | ≤300ms | H3 latency lever |
| TTS voice | Best local neural JP voice available; rate per tier (`CONVO_TIERS.ttsRate` 0.70–0.90, 2946); **never** robotic default if a neural voice exists on-device | Server TTS per H4 track (out of scope here) | H3: robotic TTS undermines "caring" regardless of prompt |
| Drill reveal cadence | Existing build-mode pacing (buildThinkSec etc.) unchanged | — | never-break invariant |

Budgets are **requirements**: Stage D adds a debug latency readout (dev-only) so regressions
are measurable; Phase-1 acceptance inherits the 1.2s figure.

---

## 6. Retention baseline without guilt (Task 4) 🔒

### 6.1 Locked mechanics — shipping in the restructure (no backend)

1. **Streak, reframed as 「いっしょ の ひ — days together」.** Same counter
   (`state.streak`, 19059), possessive-warm framing, shown on Home header only.
   **Optional:** a Settings toggle hides it entirely.
2. **No-shame freezes, automatic and silent.** 2 auto-freezes/week applied without asking;
   a missed day shows 「おかえり!」 ("welcome back") and the counter survives. **Streak loss
   is never announced.** If the gap exceeds the freezes, the counter quietly restarts and the
   copy stays forward-looking ("Day 1 together — again 🙂"). No streak-repair purchase, ever.
3. **Private-by-default progress.** Spine + minutes visible only in-app; no sharing prompts.
4. **Weekly summary, in-app.** First open ≥7 days after last summary: one card — "This week:
   you talked 23 min · 4 conversations · 18 new words out loud." Derived from existing
   session logs; volume language only (§5.1 rule 2).

### 6.2 Deferred — waits for its platform

| Mechanic | Ships when | Why deferred |
|---|---|---|
| Push reminders (character-voiced, non-guilt: 「あおい: きょうも はなそう?」) | Phase 4 native (FCM/APNs via Capacitor, Delve 4) | PWA-today has no reliable scheduled push without the Phase-1 server; Web Push (Phase 1+, Android) is an optional interim, opt-in only |
| Reminder opt-in moment | First completed conversation on day ≥2 (a success moment), never at install | M3: reminders must feel like the friend, not the app |
| Streak milestone moments (7/30/100) | Restructure (cheap) — celebration card only, no badge wall | keep light |
| Any A/B of streak vs no-streak cohorts | Post-launch, backend analytics | M3 devil's advocate: quantify the softening cost rather than assume |

**Explicitly rejected:** leaderboards/leagues (conflict with §5.1 rule 6), loss-aversion
push ("your streak dies tonight!" — the Duolingo guilt loop, M3), paid streak repair.

---

## 7. The course spine (Task 5) 🔒

### 7.1 The lock — five stages to your first real conversation

People buy a path, not a toolbox (research onboarding/retention lanes; the ROADMAP's own
Phase-0 framing). The spine turns the existing derived metrics — `progConversationalCore()`
(18679: weighted producible words / verbs-in-all-forms / sentences), `PROG_LADDERS` tiers
(18692: 25/75/150/300 producible · 5/15/30 verbs · 20/50/100 sentences), and おしゃべり tiers
(`CONVO_TIERS` 2946 + scene `minLevel` gates 2989) — into one visible ladder. **No new
tuning numbers are invented; every threshold below already exists in source.**

| Stage | Name (kana · EN subtitle) | Entry via | Targets (derived, existing) | Summit (convo) |
|---|---|---|---|---|
| 0 | **おと と かな** · Sounds & kana | True-beginner onboarding path; skippable via router Q1 | Kana familiarity via kanaBlitz (existing mastery signal); can be skipped outright | — (pre-conversation) |
| 1 | **あいさつ** · First words | Default start | 25 producible words · greetings/self topics | Tier 1 はじめて scripted scene じこしょうかい completed |
| 2 | **じぶん の こと** · Talking about me | Router placement possible | 75 producible · 5 verbs all forms · 20 sentences | Tier 2 すこし 6-turn scene (たべもの/かぞく) |
| 3 | **まいにち** · Your daily life | Router placement possible | 150 producible · 15 verbs · 50 sentences | Tier 3 なれてきた 8-turn scene (まち/にちじょう) |
| 4 | **ともだち** · A real conversation | — | 300 producible · 30 verbs · 100 sentences | Tier 4 じょうず 10-turn しゅみ conversation — **"your first real conversation"** graduation moment |

- **How drills feed it:** every existing drill already updates the underlying counts
  (producible/verb/sentence stats) — the spine is a pure derivation (`_spineModel()`), the
  same read-only posture as the Delve-2 coverage meter.
- **Where おしゃべり tiers slot:** the convo tier is the *summit check* per stage; convoLevel
  XP (3016) keeps its own pace, and stage completion requires both the drill targets and the
  summit conversation — conversation is the graduation, drills are the training, exactly the
  thesis.
- **Progress surface:** the spine header on Home (§3.2 ①) — stage name, a single bar,
  expandable to the detail sheet that absorbs `renderProgress` content (§3.3 row 3).
  Conversational Core % remains the north-star metric inside the detail sheet
  ([[project_japanese_trainer_goal]]); the stage NAME is the headline because names are a
  path, percentages are a meter.

### 7.2 Resolution against ADR-003 (explicit, not silent)

The spine is **advisory, non-locking** — stages describe and celebrate; they do not gate any
drill pool. This is *consistent with* ADR-003-as-proposed (non-locking coverage meter) and
adds no new gate state, so **it does not decide ADR-003**: if the owner signs the hard-lock
arm instead, the spine gains gates at exactly one seam (stage targets become unlock
conditions; scene `minLevel` — the one soft gate that already exists in source, 2989 —
becomes the enforcement precedent). Surfaced for the owner in §11. Until signoff, Stage C
ships the advisory spine only.

---

## 8. Positioning & naming (Task 6) 🔒

### 8.1 Identity

**"Japanese-first, conversation-first, judgment-free"** (H2 white space), rendered as a
product promise, not a tagline — because H3 says the claim must be engineered (§5 is the
engineering).

### 8.2 The one-liner (opening screen, OB-0) — locked

> **Speak Japanese from your first minute — with a friend who never judges.**
> はじめての にほんご、ともだち と。

Store-facing variants (same lock, different lengths):
- Store subtitle (≤30 chars): **"Japanese conversation, day one"**
- Store long line: "Isshin is a patient AI friend who talks with you in Japanese — real
  conversations from your very first minute. No grades, no streak-shaming, no judgment.
  Drills exist for one reason: to get you talking."

### 8.3 Names of the surviving surfaces — locked

**Chrome language decision: English-primary with Japanese accents.** The buyer is a beginner
who cannot yet read kana ([[project_japanese_trainer_commercial]] — universal audience); the
chrome must never be a reading test. Japanese names appear where they ARE the product's soul,
always with an EN subtitle.

| Surface | Locked name |
|---|---|
| App | **Isshin** (wordmark 一心 — see §8.4) |
| Hero / conversation | **おしゃべり — Talk** (established since Delve 1; keeps its JP name, EN subtitle) |
| Home tab | **Home** (nav icon 💬) |
| Practice tab | **Practice** (れんしゅう as accent label inside the screen) |
| The path ladder | **Today's path** |
| The spine | **Path to your first conversation** (stage names in kana per §7.1) |
| Partners | Kana names, unchanged (あおい, はると… 2960) |

### 8.4 Brand-mark note (open question flagged)

The 一心 wordmark is kanji. The no-kanji rule ([[feedback_no_kanji]]) governs learning
content; the logo is treated as a logotype (like a picture), and OB-0 pairs it with "Isshin"
in Latin. Whether to add いっしん furigana to the mark is an owner-taste call — §11.

---

## 9. Implementation sketch — staged shipping order

Each stage ships alone, keeps the hands-free loop working, bumps the sw.js cache version, and
passes a headless Playwright render check before ship ([[feedback_verify_render_not_cache]]).
No stage requires the Phase-1 backend. This section is the follow-on `/hydra-forge` brief.

### Stage A — Front-door swap (the IA lock lands)

- **Change:** bottom nav 628–632 → 2 buttons (Home/Practice); render map 18855: `home` →
  new conversation-first `renderHome` (spine placeholder header + convo hero + path ladder +
  resume chip), current topics `renderHome` (19057) renamed `renderPractice` and bound to
  `practice`; `today` key aliases to `home` (deep links/history keep working); `renderToday`
  (18997) folded into new Home (its `pathNodes` + extras blocks are the donor code — note the
  path ladder is currently duplicated in both renderers, 19001–19017 and 19287–19303; the fold
  de-duplicates it into one shared helper); `progress` reachable from spine placeholder only.
- **Also touches:** `_homeTopBar` (18904), `updateNav`/nav binding (18893, 21140),
  `updateBackFab` home checks (18486, 18890), hash-router entries.
- **Migration:** existing users land on the new Home with their streak/path state intact;
  resume chip reproduces the Continuing card (19426) → **acceptance: owner's topic-drill
  routine ≤1 tap worse, resume case 0 taps worse; path/convo/topic-▶ all reachable.**
- **Not yet:** no onboarding, no deletions — pure rearrangement, lowest-risk first.

### Stage B — Onboarding (first-run flow)

- **Change:** `DEFAULT_SETTINGS` + `state.settings.onboard` (§4.3, additive); boot-time
  backfill for existing users; `renderOnboard` (OB-0/1/2/4 cards + router OB-3B); the
  scripted first exchange as a canned-script variant of the convo session runner (fixed lines
  + TTS + STT-as-trigger; zero network); Home routes to onboarding when `!onboard.done`.
- **Acceptance:** cold profile → spoken exchange ≤90s (beginner ≤60s) measured on-device;
  mic-denied path completes via chips; existing profile never sees OB-0.

### Stage C — The spine

- **Change:** `_spineModel()` (pure derivation over `progConversationalCore`, `PROG_LADDERS`,
  `convoLevelInfo`); spine header on Home replaces the Stage-A placeholder; `renderProgress`
  content becomes the expandable detail sheet; router placement (OB-3B) writes
  `onboard.placedStage` which seeds the displayed stage floor.
- **Acceptance:** spine is display-only (0 pool changes — the ADR-003 non-locking invariant
  test reused); stage/summit reflect existing counts correctly on a seeded profile.

### Stage D — Judgment-free sweep + retention baseline

- **Change:** copy audit across all wrong-answer/reveal strings (§5.1 banned-word list —
  enforced by a grep script over `index.html` string literals, exhaustive per
  [[feedback_translation_audit_exhaustive]] method); remove Accuracy tile (19342–19356);
  convo recap → celebration-first ≤3 notes + `convoRecapNotes` toggle; double-miss rule
  (§5.4) in the voice-turn handler; streak reframe + silent auto-freeze + weekly summary
  card; dev latency readout.
- **Acceptance:** grep for banned words in UI strings returns 0; no user-facing %-accuracy
  anywhere; STT double-miss demo degrades to chips.

### Stage E — True deletion

- **Change:** remove `library`, `similar`, `variations`/`variationBlitz`, `particles`
  render functions, nav/router references, and orphaned helpers/data; render map shrinks
  accordingly; Settings slimmed into Voice/Learning/Data groups; `modules` stays (buried).
- **Acceptance:** no dead nav targets (router sweep), render-verify passes on every surviving
  screen, sw.js cache coherent, `index.html` line count visibly down.

**Ordering rationale:** A first (the lock users see, zero feature risk) → B (needs A's Home) →
C (needs B's placement) → D (copy touches everything; do once IA is stable) → E last
(deletion after everything above proves nothing surviving depends on the deleted).

---

## 10. Decisions reached (locks)

| # | Lock | Reversal condition |
|---|---|---|
| L1 | **Hybrid conversation-first front door:** Home = spine header + おしゃべり hero + today's path + resume chip; second tab = Practice; settings gear only. 2 doors total. | Post-ship: stranger D1 activation or owner-routine friction demonstrably worse |
| L2 | **Verdict table §3.3 for all 29 screens** — incl. TRUE deletion (code removal) of `library`, `similar`, `variations`, `variationBlitz`, `particles`; `modules` settings-buried | Owner veto on any specific deletion before Stage E |
| L3 | **Onboarding flow §4.2:** ≤90s to first spoken exchange, scripted zero-key first conversation, one-question entry + skippable 3-question router, mic pre-prompt with chips fallback, no signup/paywall | Funnel data contradicting a specific screen |
| L4 | **Judgment-free spec §5:** no user-facing accuracy %, volume-based score language, observation/question corrections, banned-word list, neutral reveals, partner-takes-blame, no leaderboards ever | — (brand foundation; changes require a new delve) |
| L5 | **Recap notes default ON**, post-conversation only, ≤3, did-you-mean framing, one-tap OFF | Early users report plateau/feel-judged imbalance |
| L6 | **Latency/TTS budgets §5.5** as product requirements (now: ≤3.5s turn; Phase-1: ≤1.2s/700ms) | Phase-1 stack measurements |
| L7 | **Retention baseline §6:** "days together" optional streak, silent auto-freezes, loss never announced, private-by-default, weekly in-app summary; push waits for native, opt-in at a success moment | No-streak cohort test post-launch |
| L8 | **Spine §7.1:** five kana-named stages built ONLY from existing thresholds (PROG_LADDERS + CONVO_TIERS/SCENES); advisory/non-locking; convo tier = stage summit | ADR-003 owner signoff choosing the hard-lock arm (spine gains gates, §7.2) |
| L9 | **Positioning §8:** one-liner locked; chrome English-primary; おしゃべり keeps its JP name; surface names per §8.3 | Store A/B post-launch (copy only, not identity) |
| L10 | **Shipping order A→E §9**, each stage independently shippable + render-verified; deletion last | — |
| L11 | **Onboarding first exchange must run offline-of-AI** (canned script, local TTS/STT) — doubles as the free-tier functional first lesson | Phase-1 may ADD a live variant; never replace the zero-dependency path |

Inline decision-notes (deliberately NOT ADRs — reversible): recap default (L5), stage names,
one-liner wording, freeze count (2/week), weekly-summary copy, resume-chip placement.

---

## 11. Open questions still open

1. **ADR-003 signoff** (owner): non-locking meter vs hard-lock. The spine is built to survive
   either (§7.2), but the *default posture* of the whole product reads differently — needs
   the owner's call before Stage C ships gates or not. **This delve did not decide it.**
2. **Paywall day + trial config** (M2's rate-vs-LTV tension): an experiment for Phase-1
   instrumentation, not decidable from current evidence.
3. **一心 wordmark furigana** (§8.4): owner taste.
4. **Deletion veto list** (L2): does the owner use `particles`/`similar`/`variations`
   enough to stay his own power user? One-line confirmation before Stage E.
5. **Web Push interim on Android (Phase 1)**: worth the server surface before native, or skip
   straight to Phase-4 push? Leans skip; revisit at Phase-1 planning.
6. **Streak-softening cost**: unmeasurable pre-launch; cohort test filed for post-launch
   analytics (M3 devil's advocate).
7. **Kana stage strictness**: Stage 0 is skippable by design; whether true beginners should
   be *nudged* through kana before Stage 2 (vs romaji crutch persisting) — pedagogy call the
   qa adversary should pressure-test.

---

## 12. Foundation doc updates

Proposed here; **applied at synthesis** (per delve layering — no foundation docs are patched
by this primary commit):

- `INDEX_ROADMAP.md` — Phase-0 row ("De-sprawl to ONE product") → point at this doc as the
  Phase-0 spec; note the forge brief lives in §9.
- [[project_japanese_trainer_goal]] (auto-memory) — thesis now concrete: conversation-first
  2-door IA; Conversational Core % remains the metric inside the spine detail sheet; frame
  milestones as spine stages.
- [[project_japanese_trainer_scope_decision]] — unchanged in spirit; the restructure IS its
  execution. Note the hands-free loop's front-door path (Home resume chip + Practice ▶).
- `ROADMAP.md` — no edit now (archive doc); Phase-0 completion will drain there when built.

---

## 13. ADR proposals (heuristic policy — only load-bearing locks become ADRs)

Framed as placeholders only — **no ADR files are created by this commit**; synthesis files
them to `docs/decisions-pending/` after the adversary round.

- **ADR-P1 → propose as ADR-008: "Conversation-first two-door IA"** (L1 + L2). Load-bearing
  and costly to reverse: it deletes code, retrains the only existing user's habits, and every
  later phase (onboarding, spine, store screenshots) builds on it. Candidate status: Proposed,
  pending owner signoff alongside the DoD gate.
- **ADR-P2 → propose as ADR-009: "Judgment-free interaction specification"** (L4 + L6 + the
  §5.4 double-miss rule). Load-bearing: it is the brand promise engineered into copy, budgets,
  and failure handling across all surfaces; silently regressing it (e.g. someone re-adding an
  accuracy stat) must be visibly a decision reversal.
- **Everything else stays inline** (L3, L5, L7–L11): onboarding screen order, retention
  mechanics, spine stage names/numbers, positioning copy, shipping order — reversible with
  local blast radius; recorded as decision-notes in §10 per the heuristic policy.

---

*End of Round-1 primary. Awaiting adversary panel (devils-advocate, qa-tester, code-reviewer)
and synthesis per charter.*
