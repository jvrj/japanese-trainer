# Delve 9 — Commercial spine: onboarding, sign-in & paywall UX

> Primary investigation doc. Round 1. Charter: `docs/delve-cycles/9-charter.md`.
> Engine line numbers cite `index.html` @ v8.36 (`APP_VERSION` at 680, the working
> tree this delve read). Backend citations: `backend/README.md`,
> `backend/supabase/functions/_shared/entitlement.mjs` / `gate.ts`.
> Research grounding: `reports/hydra-research/2026-07-21/REPORT.md` (Praktika teardown).

---

## 1. Charter — scope + fixed constraints

### 1.1 Scope

The backend trial gate is built (`backend/`: 7-day no-card trial clock,
`get_access()` snapshot, `402 {error:no_entitlement, reason:'trial_ended'}`
contract, 10/10 unit tests). What is NOT designed is everything the user
*feels*: the first-run flow, where sign-in sits, what the day-7 paywall moment
looks like, and which of Praktika's documented failures Isshin gates v1
against. This delve decides all five, screen by screen.

### 1.2 Fixed constraints (owner-decided — not re-litigated here)

- **LOCKED (owner, /interactive 2026-07-20/21):** $8.99/mo + ~$59.99/yr ·
  sign-in up front pre-trial · trial gates ONLY live AI chat (drills +
  scripted practice free forever) · 7-day no-card trial.
- **Scope mandate (standing):** *"the hands-free voice drill loop IS the app"* —
  any onboarding must land the user in the talk loop, not a menu
  (Delve 5 REVISED callout: Home = talk).
- **ADR-004** (Supabase relay, no uncapped public relay, 402/429/503/401 gate
  contract) and **ADR-005** (Supabase Auth: Apple + Google + magic-link;
  per-item merge sync; non-destructive migration) are binding for endpoints
  and the auth/sync stack. This delve stages them; it does not reopen them.
- **ADR-009** (judgment-free interaction spec): no accuracy language, no
  loss-aversion mechanics. The day-7 copy must pass this spec.
- **EN-primary chrome** (v8.22 decision): UI chrome English-primary, kana as
  accents; content stays kana-only.

### 1.3 What "decided" means in this doc

Every task section ends with a **FINAL** pick, the forcing rationale, and a
reversal condition. Alternatives are named and killed, not surveyed.

---

## 2. Method

1. **Read the locked substrate.** `backend/README.md` (trial model, endpoints,
   gate responses), `entitlement.mjs` (the pure trial/sub decision — reasons
   `subscription | trial | trial_ended | no_access`, `trialEndsAt` always
   returned once a trial exists), ADR-004/005/006 in full.
2. **Read the shipped first-run code.** The Stage-B onboarding OB-0..OB-4
   (`index.html` 21138–21321: promise → one-question path pick → mic ask →
   scripted 3-turn exchange OR skippable router → first-win card → Home),
   its persistence model (`state.settings.onboard` at 2800, boot backfill at
   3343–3352 so existing users never see OB-0), and the non-locking invariant
   self-test (20540+).
3. **Read the surfaces this delve retires or gates.** Settings BYO-key cards
   (Anthropic 22219–22346, `setAnthropicKey`/`testAnthropicKey` 22465–22506;
   OpenAI/Whisper `LS.openaiKey` 2743, 3278–3283), convo pool seeding
   (`_buildSpamPick(getActiveWords(), 24)` at ~10404, due-first, widened 8→24
   in v8.32 explicitly so the frontier is *felt* in conversation), topic
   switching (`convoModulePick` 11225: `convoEnd()` first — pending score
   applied, session logged — then session cleared), voice pinning
   (`state.settings.jpVoiceName` 5278).
4. **Anchor every "copy Praktika / avoid Praktika" claim** to the verified
   findings in `reports/hydra-research/2026-07-21/REPORT.md` (HIGH-1..4,
   MEDIUM-1), using only claims marked verified or independently corroborated;
   `[UNVERIFIED-EVIDENCE]`-only specifics are treated as directional.
5. **Force each decision** against the two owner locks that are in tension
   (sign-in up front vs loop-IS-the-app) and make the tension explicit rather
   than papering over it.

Nothing in this round patches code, files ADRs, or edits foundation docs —
those are the adversary/synthesis layers' jobs. §10 lists the patches;
§11 frames the ADRs as placeholders.

---

## 3. Task 1 — First-run flow (FINAL)

### 3.1 The pick

**FINAL: (B) — straight into the scripted first conversation. Goals are never
asked. No Praktika-style goal wizard, at v1 or later.**

The existing OB-1 "path pick" (one question: brand-new vs I-know-some,
`path:'beginner'|'router'`) is **retained** — it is *placement*, not a goal:
it seeds a display-only, non-locking starting stage (`placedStage`, verified
non-locking by the self-test at 20540+ — drill pools are identical at any
placement). It is one screen, two taps maximum, skippable.

### 3.2 Why B wins

1. **The scope mandate decides it.** A goal wizard is a settings-wall reborn —
   the exact artifact the owner's mandate buried. The app's topic system
   already gives "goals" as *additive filters over one shared progress model*
   (14 topics, each with free scripted practice since v8.34); asking up front
   adds a decision tax with no data model behind it.
2. **Praktika's goal-first onboarding converts, but its documented failure is
   goal-*change* resetting progress** (REPORT MEDIUM-1). Isshin cannot have a
   reset-on-goal-change bug **because it has no goal paths to reset** — the
   cleanest possible implementation of "avoid the anti-pattern" is to not
   build the pattern.
3. **The scripted first exchange IS the goal question, answered by doing.**
   OB-3A already delivers a 3-turn scripted conversation with local TTS +
   STT-as-turn-trigger and zero network — a brand-new install *speaks
   Japanese within the first minute*, which is the product's promise enacted,
   not described. Praktika's proven "<5-min to first confidence moment"
   (REPORT MEDIUM-1) is beaten, not copied: Isshin's is <60 seconds.
4. **Goals-never-asked is also the A0 wedge.** Praktika's verified beginner
   failure is "too advanced, speaks too quickly" (HIGH-1). A goal wizard
   presumes the user can articulate a learning goal; an absolute beginner's
   only goal is "say anything at all." OB-3A serves exactly that user.

### 3.3 The first 60 seconds, screen by screen

A brand-new install (post-Phase-2 build, sign-in live) shows, in order:

| # | Screen | Contents | Taps | Budget |
|---|--------|----------|------|--------|
| S0 | **Promise + sign-in** (reworked OB-0) | App mark, one line: *"Speak Japanese from the first minute. No judgment, ever."* · **[Continue with Google]** (primary) · *"or use an email link"* (secondary) · privacy-policy link. Sign-in IS the first tap — there is no separate auth screen. | 1 (+ Google account picker) | 0–15s |
| S1 | **Path pick** (existing OB-1) | "Brand new? / I know some" — two chips, skippable ("start from zero" default). | ≤2 | 15–25s |
| S2 | **Mic ask** (existing OB-2) | Tap-triggered mic pre-prompt (never auto-fires, 21243); chips-only fallback if denied — the scripted exchange still works. | 1 | 25–30s |
| S3 | **Scripted first conversation** (existing OB-3A / router OB-3B) | 3 canned turns, local TTS + STT-as-turn-trigger; typed name field; zero network, zero AI spend. | speak | 30–55s |
| S4 | **First-win card** (existing OB-4) | No score, no signup (already signed in), one CTA: **"Keep talking →"** into the first *live* AI conversation — trial day 1 of 7 begins being *used* here (the clock started at signup per `profiles.trial_started_at`, but the felt moment is this tap). | 1 | 55–60s |

Landing surface after S4 is **Home = talk** (the orb), per Delve 5. Not a
menu, not a dashboard, not Settings.

**What a new install never sees:** a goal wizard, a feature tour, a plan
picker, a card form (no-card trial), an API-key field (§7), or any screen
between the first-win card and the talk loop.

### 3.4 Reversal condition

Revisit toward a 2-tap skippable goal pick only if post-launch funnel data
shows install→first-live-convo completion below ~50% AND user interviews
attribute the drop to "didn't know what this app is for" — i.e. an
orientation gap, not friction. A goal wizard added later must remain an
additive filter over the single progress model (never a path that can reset).

---

## 4. Task 2 — Sign-in mechanics (FINAL)

### 4.1 Provider staging

**FINAL: Google + email magic-link at v1 (PWA/Android). Apple Sign-In added
at the iOS store build, not before.**

- ADR-005 §1 locks Supabase Auth with Apple + Google + magic-link and notes
  Apple is mandatory "once any social login is offered" — that requirement is
  **App Store guideline 4.8**, which binds the **iOS app**, not a PWA or a
  Play-Store Android build. The PWA/Android interim carries no Apple
  obligation.
- Building Apple Sign-In now means paying the Apple Developer enrolment +
  Services-ID + key-rotation tax months before the iOS build exists
  (DO_THIS_NEXT step 4 — enrolment not yet done). Deferring it is pure
  schedule win with zero user cost on the interim platforms (target user =
  Android/Chrome; owner's device is a Pixel 9 Pro).
- **Email magic-link ships at v1** as the no-Google fallback (ADR-005 already
  includes it; Supabase provides it free). No passwords, ever.
- This is a **staging amendment to ADR-005 §1**, not a reversal — the end
  state (all three providers) is unchanged. Framed as ADR-P3 (§11).

### 4.2 "Up front" — strict or loose? **Strict.**

**FINAL: sign-in before ANY content — S0 is the first screen; nothing is
browsable anonymous.** The loose reading (one scripted taste, then auth) is
rejected. Forcing rationale:

1. **The owner's lock reads strict.** *"sign in up front"* + the /interactive
   record "sign-in up front pre-trial" — the natural reading is the front of
   the app, not the front of the paid surface.
2. **One account population.** Loose creates an anonymous cohort with local
   state that must later merge into accounts — reviving exactly the
   migration/merge matrix ADR-005 §5 was designed to keep to ONE case (the
   owner's own device). Strict keeps "first authenticated launch with no
   `user_state` row → seed upload" as the *only* migration path for
   customers. The QA adversary should verify this claim, not the merge code.
3. **Honest trial clock.** `trial_started_at` is set by the signup trigger
   (0002_trial.sql). Strict means signup ≈ first-open, so "7 days from
   signup" equals the felt "7 days from install" — no user discovers their
   trial "started" days before they first tapped live talk. (Residual gap:
   S3/S4 are free content, minutes not days — acceptable.)
4. **The competitor's evidence.** Praktika gates behind signup and converts
   at $2M/mo scale (REPORT HIGH-2) — with a *card-gated* trial, a strictly
   harsher wall than Isshin's no-card Google tap.
5. **Cost acknowledged, mitigated, measured.** Strict costs installs at S0.
   Mitigations: S0 *is* the promise screen (auth is one tap on the same
   screen as the pitch, not a second wall); no card; magic-link fallback; ads
   land on the landing page (live: `landing/`) which pre-frames the promise
   so S0 is confirmation, not first contact. **Measurement is a v1 gate:**
   count S0-shown vs S0-completed from day one (§10: DO_THIS_NEXT patch).
   If S0 completion < ~60% over the first meaningful ad cohort, the
   devils-advocate's case reopens with data (reversal condition).

### 4.3 The auth screen (spec)

- **Chrome:** EN-primary (v8.22): headline EN, kana accent only
  (e.g. いっしん mark). Dark, matches app shell.
- **Elements, in order:** app mark · promise line (*"Speak Japanese from the
  first minute. No judgment, ever."*) · `[Continue with Google]` (full-width
  primary) · `or get a sign-in link by email` (text field appears inline on
  tap; button `[Email me the link]`; confirmation state *"Check your inbox —
  tap the link on this phone."*) · footer: `Privacy` → `docs/privacy-policy.md`
  page + *"Free for 7 days of live talk. Drills are free forever. No card."*
  — the trial terms are stated **before** signup (trust gate G4, §6).
- **No** password field, no "create account vs log in" split (OAuth+magic-link
  make them the same act), no skip button.

### 4.4 Supabase OAuth flow (GitHub-Pages PWA, no custom domain)

Concrete flow for `https://jvrj.github.io/japanese-trainer/`:

1. **Library:** vendor the `supabase-js` v2 UMD build into the repo (no-build
   single-file constraint; also lets `sw.js` cache it — the auth screen must
   render offline even if sign-in itself needs network).
2. **Config:** Supabase Auth → Site URL = `https://jvrj.github.io/japanese-trainer/`;
   additional redirect URLs: same + `/index.html`. Google provider enabled with
   a Google-Cloud OAuth client (authorized origin `https://jvrj.github.io`).
3. **Sign-in:** `supabase.auth.signInWithOAuth({ provider:'google',
   options:{ redirectTo: location.origin + '/japanese-trainer/' } })` —
   full-page redirect (NOT a popup: popup flows die in installed-PWA contexts
   on Android). Supabase hosts the provider callback at
   `https://<ref>.supabase.co/auth/v1/callback`, completes the **PKCE code
   exchange**, and redirects back to the app with a `code` param that
   `supabase-js` (`detectSessionInUrl`) exchanges for a session.
4. **Session storage:** supabase-js default — `localStorage`
   (`sb-<ref>-auth-token`), auto refresh-token rotation. Accepted for v1: a
   PWA has no httpOnly-cookie option without a proxy domain; XSS exposure is
   bounded by the app having no third-party scripts. (Security adversary:
   audit this acceptance + logout token revocation.)
5. **Signed-in state:** JWT attached as `Authorization: Bearer` to
   `/functions/v1/transcribe` + `/chat` (backend/README endpoints). On boot:
   `supabase.auth.getSession()` → if session, proceed; if none → S0.
6. **Logout:** Settings row → `supabase.auth.signOut()` (revokes refresh
   token server-side) → clear session → return to S0. **Local SRS state is
   NOT deleted** on logout (device cache per ADR-005 §2); a different-account
   sign-in on the same device is the one case where local state must NOT
   seed-upload (guard: compare seeded `user_id` — flag for QA adversary).
7. **Magic link:** `supabase.auth.signInWithOtp({ email, options:{
   emailRedirectTo: <app URL> } })` — same PKCE return path.
8. **401 handling (ADR-004 contract):** silent `refreshSession()` once, then
   re-auth via S0 with a toast *"Please sign in again"* — never a dead end,
   never a loop.

### 4.5 Existing-user migration (owner's device)

The owner's install (real SRS history) signs in → first authenticated launch
seeds `user_state` per ADR-005 §5 (non-destructive, retry-with-backoff,
`localStorage` stays authoritative). No special path; the owner is customer
zero of the standard flow. His BYO keys are a separate retirement track (§7).

### 4.6 Reversal conditions

- S0 completion < ~60% on the first real ad cohort → reopen strict-vs-loose
  with funnel data (per §4.2.5).
- Google OAuth on `github.io` proves flaky in the field (third-party-storage
  changes, PWA redirect loss) → escalate the custom-domain question (§9 OQ-2)
  from "cosmetic" to "auth-reliability", which would also unlock
  httpOnly-cookie session handling via an edge proxy.

---

## 5. Task 3 — The day-7 moment (FINAL)

### 5.1 Where expiry surfaces

**FINAL: pre-convo offer screen as the primary surface; a graceful in-convo
close as the fallback for mid-session expiry. Never an interrupt, never a
dead end.**

- **Primary (pre-convo):** the client always knows `trial_ends_at` (returned
  by `get_access()` snapshot and by the 402 body — `entitlement.mjs` returns
  `trialEndsAt` on every trial-path result). On opening the talk surface with
  an expired trial, the orb area renders the **offer state** (§5.3) *instead
  of* starting a convo that would 402 on turn one. The user is never invited
  into a conversation the gate will kill.
- **Fallback (mid-convo 402):** the gate evaluates per call, so expiry can
  land mid-session. Client behavior on `402 {reason:'trial_ended'}` mid-convo:
  1. do NOT surface an error toast;
  2. run the normal `convoEnd()` close — the recap the user already knows
     (v8.36 back-out recap) fires: what you said, words that came back;
  3. after the recap, show the offer card (§5.3);
  4. the same topic's **scripted practice is one tap away** on that card
     (every topic has one since v8.34) — the session *continues free*, in
     scripted form, if the user wants.
  The conversation ends the way every conversation ends — with the recap —
  not with a paywall slam.

### 5.2 Countdown presence (before day 7)

- **Days 1–5:** a quiet static line under the talk orb:
  `free talk · day N of 7` — small, muted, EN chrome. No timer, no color
  shift, no badge.
- **Day 6–7:** the line becomes: `2 more free days of live talk — drills are
  free forever` (then `last free day of live talk — …`). Still muted. Still
  static.
- **Nothing else.** No push notifications about the trial, no modal on open,
  no red, no counting animation.

### 5.3 The offer screen (the named copy)

Judgment-free register (ADR-009: volume language, no loss-aversion, no
accuracy talk). The exact v1 copy:

> **Headline:** *Your 7 free days of talk are done — nothing you built is
> lost.*
>
> **Body:** *Everything you've learned stays yours. Drills and scripted
> practice stay free, forever. Live talk with your AI partner is $8.99 a
> month, or $59.99 a year — whenever you're ready. No pressure.*
>
> **CTAs:** `[Keep talking — $8.99/mo]` · `[$59.99/yr — 2 months free]` ·
> secondary text button: `[Practice this topic free instead →]` (scripted)
>
> `reason:'no_access'` variant (no trial record — edge case): headline
> becomes *Live talk is the paid part — everything else is free forever.*
> Body/CTAs identical.

**The line we name and hold (the anti-urgency covenant):** the offer never
implies the user loses anything, owes anything, or failed at anything.
Banned mechanics, explicitly: countdown timers · "expires soon" ·
fake/limited discounts · streak-loss threats · "don't lose your progress" ·
exit-intent re-modals · guilt copy ("serious learners…") · pre-checked
upsells · dark cancel flows. This is a **testable copy gate**: any string on
the offer surface containing loss/urgency framing fails review (G4, §6).

Praktika's Trustpilot record shows subscription/support complaints ("trial
auto-charge", "zero after sales service") as verified trust-killers (REPORT
Source Ledger, Trustpilot row). Isshin's no-card trial makes the
surprise-charge complaint class **structurally impossible** — the offer copy
should quietly embody that (*"No pressure"*), never brag about it.

### 5.4 The 402 client contract (exact behavior)

On any relay response, the client branches per ADR-004 §5 + backend/README:

| Response | Client behavior |
|---|---|
| `402 {error:'no_entitlement', reason:'trial_ended', trial_ends_at}` | Cache entitlement=expired locally (with `trial_ends_at`); if mid-convo → §5.1 fallback close; talk surface renders offer state; scripted practice + all drills untouched. Never auto-retry. |
| `402 … reason:'no_access'` | Same surface, `no_access` copy variant (§5.3). |
| `401` | One silent `refreshSession()` retry → else S0 re-auth (§4.4.8). NOT a paywall. |
| `429 {error:'daily_cap'\|'rate_limited', resets_at}` | Fair-use card: *"That's a lot of talk today — live talk returns <local-time>. Scripted practice is open."* NOT a paywall. |
| `503 {error:'temporarily_unavailable'}` | Transient: *"The AI partner is busy — trying again…"* + auto-retry with backoff. **Never** the offer screen (ADR-004: 503 is NOT paywall). |

Subscribing from the offer screen (Stripe checkout on PWA now / RevenueCat
IAP at store build per ADR-006) → webhook flips `entitlements.active` → next
relay call passes → orb returns to live state. The client never decides
entitlement (ADR-006 §4); it only renders the last gate answer.

### 5.5 Reversal condition

If trial→paid conversion is materially below the ~2–5% freemium baseline AND
session data shows users hitting day 7 without ever starting a live convo,
the fix is the *first-run* funnel (§3), not adding urgency mechanics to this
screen. Urgency mechanics are not a reversal path — they contradict ADR-009
and the positioning that REPORT HIGH-1 validates.

---

## 6. Task 4 — Praktika-gap ship gates (adopt / reject, each)

Praktika's verified shipped weaknesses (REPORT HIGH-3) are the candidate gate
list. Verdict on each as a **v1 ship gate**:

### G1 — Audio-first default: **ADOPT — PASS today**

The hands-free voice loop is the app (scope mandate); there is no avatar to
force and no video mode to miss. TTS is local/neural, mic loop is the primary
surface. Praktika's "no audio-only mode, forced avatar" complaint
(REPORT HIGH-3d, HIGH-4) cannot occur by construction.
**Gate form:** any future avatar/visual layer must keep audio-only as the
default and never gate content behind a visual (standing constraint, restated
from REPORT HIGH-4 integration note). Nothing to build for v1.

### G2 — Vocab continuity felt in convo: **ADOPT — NEEDS WORK (small)**

Praktika's verified failure: saved words never reappear (HIGH-3b, languatalk
adversarially-verified). Isshin's mechanism exists and is deliberate:
- convo pool seeds **due-first** via `_buildSpamPick(getActiveWords(), 24)`
  (~10404) — widened 8→24 in v8.32 *specifically because* 8 was "too few for
  the pool to shape the model's vocabulary" — i.e. the codebase has already
  fought this exact battle once;
- `judged.usedWords` (9571, 9603) feeds every recognized word back into SRS;
- the S4 recap diffs `unlockedDelta` from a session-open snapshot (~10405+).

**The gap is *felt*, not functional:** nothing tells the user *"a word you
studied came back."* Praktika's failure is invisible continuity; Isshin
currently has invisible continuity that *works* — invisible is still not a
differentiator. **Needs-work item (small, for the build phase):** the recap
names returning words (e.g. a "words that came back today" recap line — kana
content, EN chrome frame), and a harness probe asserts a due word appears in
AI output within N turns of a seeded session. Not a redesign; a surfacing.

### G3 — Non-destructive topic switching: **ADOPT — PASS today (verified)**

Praktika's failure: changing goals resets progress (HIGH-3c, MEDIUM-1).
Verified in code this session: `convoModulePick()` (11225) runs
`convoEnd()` **before** clearing the session — pending `judged` is applied
(`convoApplyScore`, 10856), the session is logged, XP retained; only the
ephemeral transcript dies (which ADR-005 §4 already excludes from sync as
`convo`). Vocab mastery, XP, streak: monotonic across any topic switch.
Placement is non-locking (self-test 20540+: identical drill pools at any
`placedStage`).
**Gate form:** a permanent regression assertion — "switch topic mid-convo →
0 lost graded items, XP monotonic" — added to the harness so this PASS can
never silently regress. (Same shape as ADR-005's two-device acceptance gate.)

### G4 — Trust-bug zero-tolerance list: **ADOPT — the v1 release gate**

Praktika's verified trust failures (data loss on completed chapters,
voice/accent drift, trial auto-charge complaints — HIGH-3f + Trustpilot
ledger row) break the exact promise both apps sell. The v1 zero-tolerance
list, each a ship-blocker:

1. **Progress loss** — any reproducible loss of graded items/SRS state
   (including via sync: ADR-005 acceptance gate = 0 lost items in the
   two-device test; including migration: seed is non-destructive or it
   doesn't ship).
2. **Voice drift** — the partner voice must be stable: `jpVoiceName` is
   pinned once picked (5278–5281) and rides settings sync (ADR-005 §4).
   Needs-work (small): pin the voice explicitly at first successful pick
   (today a device voice-list change can silently re-derive the fallback
   ranking), and surface the existing no-JA-voice warning (5349+) rather
   than degrading silently. Session-partner *persona* rotation
   (`_convoPickPartner`) is a design feature, not drift — but the *voice*
   under every persona must not wander.
3. **Billing surprise** — structurally excluded (no-card trial), plus:
   trial terms stated pre-signup (§4.3), cancel path reachable from Settings
   in ≤2 taps (Stripe portal link now; store-native manage-subscription at
   store build), and the §5.3 banned-mechanics copy gate.
4. **Honest surface** — no marketing (landing page, store listing, ads)
   showing anything the shipped app doesn't do (REPORT HIGH-4's
   promo-vs-runtime deception note). Store copy audit rides §10.

### Rejected as v1 gates (with reasons)

- **Deeper SRS-in-convo coupling** (scheduling convo turns off the SRS queue):
  REJECT for v1 — the due-first pool + usedWords feedback already deliver the
  continuity Praktika lacks; deeper coupling is pending-ADR-002 territory and
  risks "exposing the machinery" (HIGH-3 devil's-advocate: differentiation
  only pays if felt in conversation, not shown as gears).
- **Avatar quality bar:** REJECT — not the moat (HIGH-4, ceilinged axis);
  out of v1 scope entirely.
- **Correction-intensity dial (Praktika's Soft/Balanced/Strict):** REJECT —
  partially conflicts with STT-is-not-a-grader (REPORT method note) and the
  Delve-8 sensei layer already owns correction UX with its own dial-back
  levers. No second dial.
- **Streak/engagement mechanics parity (Duolingo-class):** REJECT —
  loss-aversion contradicts ADR-009 (REPORT noted: reference for magnitude
  only).

---

## 7. Task 5 — BYO-key retirement (FINAL)

### 7.1 The pick

**FINAL: the Settings key cards disappear at backend flip-on — defined as the
Phase-2 release where sign-in ships and `REQUIRE_ENTITLEMENT=true` — not at
store build. At that release the BYO call paths are *deleted*, not hidden.
Interim (Phase 1) the owner alone migrates: personal keys out, owner
soft-secret relay in, via one repurposed connection card.**

### 7.2 The staged sequence (concrete)

| Phase | Public users | Owner | Key cards in Settings |
|---|---|---|---|
| **Phase 0/now** (v8.36) | BYO key (status quo) | personal Anthropic + OpenAI keys in localStorage | Both cards visible |
| **Phase 1** — backend deployed, `REQUIRE_ENTITLEMENT=false`, no accounts yet | BYO key **unchanged** (ADR-004 §3 hard invariant: no public no-key relay before entitlement + cap — the soft secret must never ship broadly in a public PWA) | pastes `APP_SOFT_SECRET` into ONE repurposed "connection" card; app sends `x-app-secret`, calls relay; personal keys removed from the phone (kept dev-side only) | Two key cards collapse to one interim connection card (owner-only in practice; harmless if others see it — a random secret gates it) |
| **Phase 2 — FLIP-ON** — sign-in (§4) live, `REQUIRE_ENTITLEMENT=true` | Sign in → JWT → relay; trial/paid via gate | same as any user (customer zero); soft secret retired from the client, secret rotated server-side | **Gone.** BYO + soft-secret code paths deleted from `index.html` |
| **Store build** | unchanged | unchanged | (already gone) |

### 7.3 Why flip-on, not store build

1. **A second code path is a second untested product.** The single-file app
   keeping BYO fetch paths (`state.settings.anthropicKey` feeds ~10 call
   sites: 4676, 5049, 9468, 9653, 10323, 10549, 12064, 16821, 17078, 22802)
   alongside relay paths doubles the auth/error matrix exactly when the 402
   contract must be the only truth. The keyed-mock-probe lesson (v8.23: a
   keyless fallback masked a total keyed-path 400) is the standing proof that
   parallel paths hide breakage.
2. **Store build is too late for trust.** The PWA is the live product the ad
   cohort meets first; shipping paying-customer sign-in while a "paste your
   API key" card lurks in Settings reads as unfinished and invites support
   chaos ("do I need a key?").
3. **Flip-on is not premature — ADR-004's own gate says so.** The §3 hard
   invariant keeps BYO alive only "until the cap exists"; flip-on IS the
   entitlement gate + cap going live. Deleting BYO then is the invariant's
   scheduled endpoint, not a new decision.
4. **Existing keys at flip-on:** on first run of the flip-on version, if a
   legacy `anthropicKey`/`openaiKey` exists in localStorage, show a one-time
   notice (*"Isshin now includes the AI — your personal key is no longer
   used. It stays only in this phone's storage until you clear it."*) and
   stop reading it. Deleting stored user secrets silently is worse than
   leaving them; surfacing beats both.

### 7.4 Owner migration path (personal key → soft-secret relay)

Phase 1, owner's phone, in order: (1) backend deployed + smoke-tested
(backend/README deploy steps — blocked today on the DO_THIS_NEXT "keys
ready" accounts step); (2) owner pastes the generated `APP_SOFT_SECRET` into
the interim connection card; (3) app routes `_whisperTranscribe` /
`_coachCall` / `_convoCall` to `/functions/v1/*` with `x-app-secret`
(ADR-004 §7 wiring); (4) owner deletes personal keys from the card (and can
revoke the phone-resident personal Anthropic key at the console — the
dedicated `isshin-backend` keys are already separate per DO_THIS_NEXT).
Rollback at any point: re-paste personal key (Phase-1 code still has the BYO
path; only Phase 2 deletes it).

### 7.5 Reversal condition

If Phase 2 slips badly (> ~6 weeks after Phase 1 in practice) AND the owner
needs other real testers meanwhile, do NOT widen the soft secret; either
pull sign-in forward (preferred — it's the same work Phase 2 needs anyway)
or issue per-tester secrets with per-secret caps (ADR-004 §3b already
requires per-secret rate limits).

---

## 8. Decisions reached (summary)

| # | Decision | FINAL |
|---|---|---|
| D1 | First-run flow | **(B)** straight into scripted first conversation; goals never asked; existing OB-0..OB-4 retained with OB-0 reworked into the promise+sign-in screen; first 60 seconds per §3.3 table |
| D2 | Sign-in providers at v1 | **Google + email magic-link**; Apple Sign-In lands at the iOS store build (staging amendment to ADR-005 §1) |
| D3 | "Up front" interpretation | **Strict** — S0 before any content; no anonymous taste; S0-completion instrumented from day one with a ~60% reopen threshold |
| D4 | OAuth mechanics | Full-page redirect PKCE via supabase-js (vendored UMD), `github.io` origin allow-listed, localStorage session accepted for v1, logout keeps local SRS cache (§4.4) |
| D5 | Day-7 surface | **Pre-convo offer state** primary; mid-convo 402 → recap-first graceful close → offer; scripted practice always one tap away (§5.1) |
| D6 | Countdown | Quiet static `day N of 7` line only; softened day-6/7 wording; zero urgency mechanics — banned-list is a testable copy gate (§5.2–5.3) |
| D7 | Offer copy | Named verbatim in §5.3, judgment-free register, `trial_ended` + `no_access` variants |
| D8 | 402/401/429/503 client contract | Exact behavior table §5.4; client never decides entitlement |
| D9 | Praktika gates | G1 audio-first **PASS/adopt** · G2 vocab continuity **adopt/needs-small-work** (felt recap line + harness probe) · G3 non-destructive switching **PASS/adopt + regression assertion** · G4 trust-bug zero-tolerance **adopt** (progress loss, voice drift, billing surprise, honest surface) · four rejections with reasons (§6) |
| D10 | BYO-key retirement | Key cards + BYO code paths **deleted at Phase-2 flip-on** (sign-in + `REQUIRE_ENTITLEMENT=true`), not store build; Phase-1 owner-only soft-secret interim card; legacy-key one-time notice (§7) |

---

## 9. Open questions (for adversaries / later rounds — none block the above)

- **OQ-1 — Pricing display in-app vs store rules.** At the iOS store build,
  IAP price display + Apple's 30/15% cut interact with the $8.99/$59.99 lock
  (do prices rise on iOS, Praktika-style regional tiers, or eat the margin?).
  Phase-4 question (ADR-006 territory); the §5.3 copy hardcodes prices and
  will need a single source of truth before two storefronts exist.
- **OQ-2 — Custom domain.** `jvrj.github.io/japanese-trainer/` works for
  OAuth (§4.4) but a custom domain would (a) survive a repo rename,
  (b) unlock proxy/httpOnly session options, (c) look right in the Google
  consent screen ("continue to jvrj.github.io" is weak trust copy). Cheap;
  decide before ads run. Security adversary should weigh in.
- **OQ-3 — Trial-abuse floor.** New-Google-account + cleared storage = new
  7-day trial by construction. Explicitly the security adversary's charter
  question (name the accepted abuse floor); this doc's working assumption:
  accept it at v1 (no card = the cost of the honest funnel; per-user daily
  cap bounds the burn).
- **OQ-4 — Magic-link deliverability.** Supabase default email sender has
  weak deliverability for consumer Gmail; if magic-link is a real fallback
  (not decoration), custom SMTP may be needed. Verify during Phase-2 build.
- **OQ-5 — S0 instrumentation privacy.** Counting S0-shown/S0-completed needs
  an events sink before accounts exist at S0-shown time; simplest is a
  Supabase anonymous insert with no PII — confirm it stays inside the
  privacy policy's claims.

---

## 10. Foundation doc updates (to be applied at synthesis — NOT in this round)

1. **`DO_THIS_NEXT.md`** — add to the "STILL WAITING ON YOU" block: enable the
   Google provider in Supabase Auth (needs the Google-Cloud OAuth client) +
   allow-list `https://jvrj.github.io/japanese-trainer/` as Site URL; note
   that Apple Developer enrolment (existing step 4) now explicitly gates ONLY
   the iOS build (D2), so it stays background. Reword the Phase-1/Phase-2
   journey rows to reflect D10's staged key retirement.
2. **`backend/README.md`** — add a "Client behavior" pointer: the 402/401/429/
   503 handling table lives in this doc §5.4 (single source); note the
   Phase-2 flip-on definition (sign-in + `REQUIRE_ENTITLEMENT=true` +
   soft-secret rotation + BYO deletion happen together).
3. **`docs/store-listing-copy.md`** — align trial copy to "7 days of live
   talk free — no card"; carry the §5.3 judgment-free offer lines so store
   copy and in-app copy never drift; audit against gate G4.4 (honest
   surface).

---

## 11. ADR proposals (framed here as placeholders — NOT filed in this round;
numbering to be confirmed at synthesis against `docs/decisions-pending/`)

- **ADR-P1 — First-run flow: sign-in-first scripted-conversation onboarding
  (no goal wizard).** Decisions D1 + D3 + the §3.3 screen table. Amends
  nothing; binds the first-run surface.
- **ADR-P2 — Sign-in mechanics & staging.** D2 + D4: Google + magic-link at
  v1, Apple at iOS store build; PKCE redirect flow spec; localStorage-session
  acceptance; logout semantics. **Amends ADR-005 §1 (staging only).**
- **ADR-P3 — Day-7 / trial-expiry UX and the 402 client contract.** D5–D8:
  pre-convo offer surface, recap-first mid-convo close, banned-mechanics copy
  gate, §5.4 behavior table. **Extends ADR-004 §5 client-side.**
- **ADR-P4 — Praktika-gap v1 ship gates.** D9: the four adopted gates (with
  G2's felt-continuity work item + G3's regression assertion) and the four
  explicit rejections.
- **ADR-P5 — BYO-key retirement schedule.** D10: Phase-2 flip-on deletion,
  Phase-1 owner soft-secret interim, legacy-key notice. **Amends ADR-004 §3
  (fulfills its scheduled endpoint).**
- **ADR-P6 — Pricing amendment.** Records the locked $8.99/mo + $59.99/yr
  against ADR-006 (product/pricing was previously unnumbered there) and the
  monthly-option-on-purpose rationale (REPORT HIGH-2: Praktika's annual-only
  is an exploitable seam). **Amends ADR-006.**
