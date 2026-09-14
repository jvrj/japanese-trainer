# Delve 12 — Onboarding: the first five minutes of WordStick (primary)

- **Round:** 1 · **Mode:** Opus-only primary · **Date:** 2026-09-14
- **Build read:** index.html at v9.17 (working tree), `backend/supabase/` config + migrations
- **Status:** decisions reached here are PROPOSED; the adversary panel (devils-advocate, qa, code) audits this doc next, then synthesis files ADRs.

---

## 1. Charter

Source: `docs/delve-cycles/12-charter.md`.

**Question:** what happens between an ad click and the end of the first round, so the click turns into a habit? WordStick launches Japanese-only to strangers from Facebook/Instagram ads. Pricing is $8.99/mo or $59.99/yr, with a 7-day trial that needs no card, then a free plan of 3 new words a day.

**What happened with testers (14 Sep):** 3 testers each did ONE session on day 1 (32–46 words). Only one came back the next day.

**Owner, verbatim:** *"the app should ensure a name is used"* · *"perhaps include it into the onboarding"* · *"every extra step loses some people"*.

**Locked (not reopened here):**
- sign-in up front, before content
- 7-day trial with no card
- free plan = 3 new words a day
- the first round is the standard 30-word round (special first drills and question screens are banned since v8.98)
- STT (speech recognition) never grades
- stickers are the category model
- AI conversation and avatar are benched
- chrome is English-first; content is kana + romaji + English

**Tasks:**
1. Final screen list
2. Name
3. Sign-up wall
4. Day-1 → day-2 return
5. Measurement

**One thing the charter review already flagged (change log WARN):** Task 3 as written ("one taste first") risks reopening the sign-in-up-front lock. This doc keeps the lock in its **strict** form and explains exactly what "content" means (§5).

---

## 2. Method

1. **Read the shipped flow in code, not in memory.** Every decision below is built on the working tree:
   - `nav()` gate order (index.html 26837): auth gate → `home`→`onboard` rewrite → onboard mirror guard
   - `_obEnsure`/`_obLog`/`obGoto` (27660–27712)
   - `_OBF_ORDER = ['w1','w5','mic']` (≈27745)
   - `obfFinish` word-check head start (27756)
   - `obMicAllow` — granting the mic does **not** turn voice mode on (v8.69 comment, ≈27810)
   - `startOnboardMicroDrill` → sticker beat → `startBuildModeVocabSpam` (27846)
   - `_obfSticker` (27376)
   - v8.99 first-round pathway: spoken intro `COACH_INTRO_LINE` + once-ever coach captions (24244)
   - auth screens `_authWelcomeHtml`/`_authFormHtml`/`_authSentHtml` (≈28055–28110)
   - `authDoSignUp`/`authContinueGoogle` (≈7299–7420)
   - account sync `_accountSyncOnSignIn` (≈7665)
   - round end `_stkBurst` (≈27305)
   - morning check `coldCheckDue`/`_coldAutoPop` (26081)
2. **Read the grounding.**
   - `reports/hydra-research/2026-08-27-gating-model/REPORT.md`: sign-up-flow lens — "82% of trial starts are Day 0 and 84% of cancellations land by Day 1"; trial start is the funnel event to optimise ad spend against.
   - `reports/hydra-research/2026-07-21/REPORT.md`: Praktika's goal-first onboarding is fast, but a goal change resets progress; Duolingo's streak loss-aversion "contradicts Isshin's judgment-free positioning".
   - `docs/delve-cycles/9-commercial-spine.md` and pending `ADR-014` (sign-in-first; ≤5 screens; the S0 funnel instrumented from day one).
3. **Check each current screen against one rule.** A screen before the first spoken word must do something the round itself can't do. The owner put it as *"every extra step loses some people"*, so the burden of proof sits on keeping a screen, not on cutting it.
4. **Time the path.** Estimate seconds per step on an Android phone on 4G, from the ad click. State a target and defend it.
5. **Pick, don't list.** Every task ends with a FINAL decision, the options it kills, and a reversal trigger where one makes sense.

**Code facts that change the answer** (found during step 1; the adversaries should re-check these):

| # | Fact | Where | Consequence |
|---|---|---|---|
| F1 | `DEFAULT_SETTINGS.userName` is hard-coded to `'Julius'`. Load does `{...DEFAULT_SETTINGS, ...saved}` and `save()` writes all settings back. | index.html 4792, 5364 | **Every customer account is named "Julius"** unless they found the Settings field. The "no-name account" check must treat `'Julius'` as no name. |
| F2 | `_obLog` writes to `console` and `log()`, and `log()` only pushes into `state.logs` on the device. | 27688, 5567 | **No onboarding event ever leaves the phone.** The ad test currently can't see drop-off at all. |
| F3 | `enable_confirmations = false` in `backend/supabase/config.toml` (email). `authDoSignUp` already finishes in-page when a session comes back. | config.toml 226; ≈7395 | Instant accounts are already the local config. The "Check your email" screen only shows if the **live** project still has confirmations on. |
| F4 | Granting the mic doesn't turn voice mode on; drills are hands-free on TTS + auto-advance without it. `_voicePreflightMic` already runs when the 🎙 Voice pill is tapped. | ≈27812 | The pre-round mic screen asks for a permission the first round doesn't use. |
| F5 | The v8.99 spoken intro ("Just repeat what you hear — out loud. I'll handle the rest.") and the coach captions already run **inside** the first round. | 24244 | The round already teaches itself, so a Welcome screen that explains the method is redundant. |
| F6 | Round end already says "Tomorrow morning I'll ask for them cold." and the morning check pops by itself (`_coldAutoPop`). | ≈27335, 26095 | The "prove it tomorrow" hook exists. Nothing makes sure the person is *there* tomorrow. |
| F7 | There's no Notification or push, and no `beforeinstallprompt` handling. `state.streak` exists and shows as 🔥 on Home and at round end. | grep | Nothing brings people back at the moment except memory. |
| F8 | Google OAuth is refused inside embedded webviews (Google's `disallowed_useragent` policy), and Facebook/Instagram ads open links in their in-app browser. | platform fact — **verify on device** | "Continue with Google" as the main button fails for ad traffic that never leaves the FB/IG browser. |

---

## 3. Task 1 — Screen list (FINAL)

### 3.1 Verdict on each current screen

| Current screen | Verdict | Reason |
|---|---|---|
| Auth **welcome** ("WordStick · Try everything free for 7 days" · Sign up free / Sign in / Google) | **KEEP, merged** with Welcome's promise and its one tap-to-hear sample | A cold ad visitor sees the auth screen first *anyway* (auth gate). Two promise screens in a row (auth welcome, then onboarding W1) repeat the ad. Fold them into one front door. |
| Auth **create form** (email + password + consent) | **KEEP**, add a first-name field | This is the one form the email path must fill in. The name goes here at no extra screen cost (Task 2). |
| Auth **"Check your email"** | **REMOVE from the default path** (instant account, Task 3) | A context switch to an inbox inside an ad webview is the biggest drop in the whole flow, and the link often opens in a different browser that has no session. |
| Onboarding **W1 Welcome** ("ears, not thumbs", tap to hear みず) | **CUT as a screen.** Its headline and audio sample move to the front door. | F5: the round teaches the method by voice. The "90% / 5 min / 0 typing" stats are ad copy, already seen. |
| Onboarding **W5 word check** (12 words) | **CUT** | Its only effect is to plant known words as graduated in SM-2 (`obfFinish`). Since v9.02, **the morning check does this job better**: a word the user really knows passes cold on day 2 and graduates, with proof. Ad beginners mostly tap none, so it's a screen of reading and a "test" feel for zero gain. Any word planted wrongly by a hopeful tap would skip induction without proof. |
| Onboarding **mic ask** | **CUT from onboarding** → ask in context on the first 🎙 Voice pill tap (already how `_voicePreflightMic` works) | F4: the first round doesn't use the mic. A browser permission prompt before any value is a known drop point, and the owner has parked mic proof. Browsers with no speech support lose nothing. |
| Onboarding **first sticker** | **KEEP — it's the one screen before the round.** Personalised with the name. | It's the only screen that does something the round can't: it gives the first 30 words a *goal* people can collect ("hear 30 Greetings words and it's yours for good"), and it's the category model (locked). |
| Skipped **why / level / when** question screens | **STAY DEAD.** No question screen earns a place. | Locked (v8.97/98). Their only live effect (`topicBias`) was replaced by road-ordered first batches (v9.07). Level placement doesn't restrict the pool (ADR-014 self-test: 0 drill-pool diff). The renderers `_obfW2/W3/W4/W6` can be deleted in the build (code-review to size it). |

### 3.2 Target time to the first spoken word

**Definition:** from **ad-click page load** to the **first Japanese word WordStick speaks in round 1**. The user's first say-back comes about 3–5 s later.

**Target: ≤ 30 s on the Google path · ≤ 45 s on the email path (median, Android Chrome, 4G).**

| Step | Google path (s) | Email path (s) |
|---|---|---|
| App shell loads from the ad link | 3 | 3 |
| Front door: read + tap | 4 | 4 |
| Google account picker + redirect back + account sync (6 s timeout, a new account has no cloud copy) | 8 | — |
| Email form: first name + email + password (autofill helps) + Create | — | 22 |
| First sticker: read + "Let's go" | 5 | 5 |
| v8.99 spoken intro (auto, or "Start now →") | 4 | 4 |
| First JP word spoken | ≈24 | ≈38 |

**Why this target:**
1. The gating-model report says 84% of cancellations land by day 1. The first session is the whole trial for most ad clicks, so every second before value comes out of the trial.
2. ADR-014 set ≤60 s (beginner) and ≤90 s (router) when onboarding still contained a scripted conversation. That content is gone (v8.98), so the old budget is mostly screens that no longer exist. Holding the old number would hide ~30 s of dead chrome.
3. 30 s is roughly what's left once you subtract the two costs that can't be removed: the sign-in lock and one audio intro.

**Hard ceiling (reversal trigger):** if measured median time to first word is **> 60 s** on either path (Task 5 event E7), the flow has regressed. Reopen this task with the event data.

**Result:** screens before the round go from **6** (auth welcome, create form, check email, Welcome, word check, mic) + sticker = 7 **down to 2 (Google) or 3 (email)**: front door → [email form] → sticker. That is well inside ADR-014's ≤5.

---

## 4. Task 2 — Name (FINAL)

**Is the name worth its cost?** Only if it costs no extra screen for most people and is **used where the user can see it** at least 3 times in the first session. Both are designed in below. If either fails in build, cut the name instead of shipping a vanity field.

### 4.1 Where the name is asked — FINAL: **at sign-up, never as a separate onboarding screen for most people**

| Path | How the name is captured | Extra screens |
|---|---|---|
| **Email sign-up** | A **"First name"** field is the first field on the create form (above email). Required; Create stays disabled until it has 1+ non-space character. | 0 |
| **Google** | Taken automatically from `user.user_metadata.given_name`, else the first word of `full_name`/`name`. Stored in `state.settings.userName`. Editable later in Settings; no confirm screen. | 0 |
| **Google with no name in its data** (rare; some Workspace accounts) | One **Name screen** (N) between sign-in and the sticker: *"What should we call you?"* · one field · **Continue**. It can't be skipped. | 1 |
| **Existing accounts with no name** (see 4.2) | The same Name screen shows **once**, on the next app open, before Home. Rounds already in progress aren't interrupted. | 1, once |

**Options rejected:**
- **Name as its own screen right after Welcome.** It's a screen for every user, against *"every extra step loses some people"*, and the email path already has a form open.
- **Name after the first round.** The first round is where the name pays off most (sticker headline, round end). Asking afterwards wastes those two uses and puts a form between the peak moment and "Keep going".
- **Optional name.** The owner said *"ensure a name is used"*. An optional field ends up blank for most people, and the uses in 4.3 then read awkwardly.

### 4.2 Catching existing accounts with no name

- **Rule:** the name is missing when `userName` trimmed is empty, **or** equals `'Julius'` while `ownerMode !== true` (F1: that value is the hard-coded default, not a real name).
- **Fix the source in the same build:** `DEFAULT_SETTINGS.userName` becomes `''`. The owner's own saved settings keep `'Julius'`, and `ownerMode` exempts the owner device anyway.
- **Where the check runs:** in `nav()`, immediately **after** the onboarding rewrite and before `home` renders. If signed in + `onboard.done` + name missing, the screen becomes `name`. It's the same pattern as the `home`→`onboard` rewrite, so auth → onboard → name → home keeps the gate order the code-review adversary must confirm.
- **If Google data has a name,** the catch-up fills it in silently and shows no screen.
- **Progress:** it's a settings write only. `userName` already syncs with settings (it isn't in `SYNC_SETTINGS_EXCLUDE`), so it follows the account to other devices. Nothing is lost.
- **Validation:** trim; 1–24 characters (matches `_convoSafeName`'s cap); strip line breaks and `"`; always `esc()` on render. No profanity filter at v1.

### 4.3 Where the name is USED (why it's worth asking)

| # | Surface | Copy |
|---|---|---|
| U1 | First sticker headline | **"{Name}, here's your first sticker"** |
| U2 | Round-end burst (`_stkBurst`) | **"That's 30 words, {Name}"** |
| U3 | Home greeting (existing `greet`) | **"Good morning, {Name}"** |
| U4 | Morning check opener | **"Morning, {Name}. Let's see what stuck."** |
| U5 | Settings → Account | shows and edits the name |
| U6 | Later, when benched features come back | AI conversation partner (`_convoSafeName`, already wired); reminder email if one is added (§6) |

U1–U3 all show in the **first session**, and U4 on the first morning.

**The name is written, not spoken, at v1.** Device TTS mispronounces non-English names and would say the wrong name aloud in the first 30 seconds. Spoken name = Open question OQ-3.

---

## 5. Task 3 — Sign-up wall (FINAL)

### 5.1 Strict vs loose — FINAL: **STRICT. Full sign-up before any drill.**

- **What "content" means in the lock:** anything that **creates learning state**: a word entering SM-2, a round step, a sticker's progress, the morning-check queue.
- **Allowed before sign-up:** the ad's promise plus **one tap-to-hear audio sample** on the front door (みず — mizu — "water"). It writes nothing (`obfHear` is pure TTS, no state), and it's the same thing the landing video demos.
- **"Hear and say 3 words, then sign up" (loose) is rejected:**
  1. It's the banned special first drill under another name (a 3-word micro-drill was killed at v8.98: "never re-add special drills").
  2. Anonymous learning state would then have to merge into a new account on sign-up. That's a whole new code path next to `_accountSyncOnSignIn`'s virgin/restore table, just where the storage-loss bugs lived (v8.57).
  3. The gating-model report makes the **trial start** (= account) the event ad spend is optimised against. A taste first moves that event later and blurs it.
  4. The owner locked it.
- **Reversal trigger (kept from ADR-014):** if front door → account done is **< 60%** over the first cohort of ≥ 100 front-door views (E1 → E3), reopen strict vs loose with the funnel data.

### 5.2 Email confirmation — FINAL: **instant account, no confirmation link**

- Keep `enable_confirmations = false` (F3) and **check that the live Supabase project matches** (owner action; the "Check your email" screen showing on the phone means it doesn't).
- **Why:**
  1. It removes the inbox round-trip from the ad webview.
  2. It removes the "link opened in another browser with no session" dead end.
  3. An email address isn't needed to deliver value; the trial is card-free and there's no billing on the address until checkout (Stripe collects its own email).
- **Cost accepted:** typo'd or fake emails create real accounts. Password reset to a wrong address fails, and the user can make a new account.
- **Mitigation:** Settings → Account shows the email, and the reset flow (`authDoForgot`) is unchanged. Double-check with the email address before a checkout, at the Stripe step (already collected there).
- The `_authSentHtml` signup branch stays in code as the fallback when the project returns no session.

### 5.3 Google placement — FINAL: **main button — except inside in-app browsers**

- **Normal browser:** **[Continue with Google]** is the main button at the top. Below it, **[Sign up with email]** (secondary), then a text link *"I already have an account"*.
- **FB/IG in-app browser** (user agent contains `FBAN`, `FBAV` or `Instagram`): the Google button is **hidden** (F8, Google refuses webview OAuth). **Sign up with email** becomes the main button, and a quiet line reads *"Using Google? Open WordStick in Chrome ⋮ → Open in browser"*.
  - Detection has to be reliable. The QA adversary should test the real FB and IG apps on Android and iOS.
- **Google cancelled or failed:** the user lands back on the front door. The existing `AUTH_TRY_EMAIL_MSG` path stays, with email as the fallback.
- **Marketing consent:** unticked checkbox on the email form (unchanged). Google sign-ups don't see it at v1, which is accepted since the email list is parked; see OQ-5.

---

## 6. Task 4 — Day-1 → day-2 return (FINAL: two mechanisms)

**The problem, precisely:** the first round works (testers did 32–46 words). The failure is **finding the app again tomorrow**. The ad user is sitting in a Facebook/Instagram webview tab that's gone once the feed moves on. F6: the reason to come back already exists (the morning check). F7: the way back doesn't.

### 6.1 PICK 1 — **"Prove it tomorrow": the morning check, stated as a date**

The check itself is already shipped (v9.02–9.06). Build only the copy and the promise:

- **Round-end line** (replaces "Tomorrow morning I'll ask for them cold…"): **"Tomorrow, {Name}: 10 of these words, cold. About a minute. The ones that come out are the ones that stick."**
- **First Home visit after round 1** shows one card above the hero: **"Tomorrow's check · 10 words ready"** · sub *"Open WordStick tomorrow — it takes a minute."* The card disappears once the check has run.
- **Why this one:**
  1. It's native to the product (the stuck counter is *earned* this way).
  2. It isn't loss-aversion. Nothing breaks if you skip it; you just don't see what stuck. That keeps the judgment-free rule.
  3. Code cost is near zero.

### 6.2 PICK 2 — **Put WordStick on the home screen, at the peak moment**

On the **first round-end burst only**, below "Keep going", a single card: **"Keep WordStick one tap away"** · sub *"So tomorrow's check is right on your home screen."*

| Environment | What the card does |
|---|---|
| Android Chrome | The button **"Add to home screen"** fires the saved `beforeinstallprompt` event. |
| iOS Safari | The button opens a 2-step sheet: *Share ⬆ → "Add to Home Screen"*. |
| FB/IG in-app browser | The button becomes **"Open in Chrome"** / **"Open in Safari"** with the ⋮ instruction. |
| Already installed (`display-mode: standalone`) | No card. |

"Not now" dismisses it for good. It comes back once, at the end of round 2 on another day, then never.

**Why this one:**
1. It turns a throwaway webview tab into an app icon. This is the physical route back, and nothing else in the product offers it (F7).
2. $0, no server (the hard constraint in the go-to-market lock).
3. It's asked right after "That's 30 words", at the peak, not before any value.
4. An installed PWA also keeps storage safer (fewer evictions; ties to v8.57 storage hardening).

### 6.3 Rejected (with reasons)

| Mechanism | Rejected because |
|---|---|
| **Streak** as a return lever | Loss-aversion goes against the judgment-free position (2026-07-21 REPORT). Anyone who didn't come back on day 2 has a streak of 1, so there's nothing to lose. The 🔥 number **stays as a display** but isn't pushed or messaged. |
| **Push notification / reminder ask on day 1** | Web push needs a VAPID push service + a scheduled sender (new backend surface), and iOS only supports it for installed PWAs, so it depends on pick 2 anyway. A second permission prompt on day 1 is another drop point. **Revisit after the first cohort**, asked on day 2 *after* a passed morning check. |
| **Next-morning reminder email** | SMTP go-live is still an owner action, and the email list/campaign is owner-parked ("in the future"). A reminder to a possibly mistyped address (instant accounts, §5.2) is unreliable. Strongest candidate for the day-2+ test after cohort 1 (OQ-4). |
| **Sticker progress** as the return mechanism | Already on screen at round end and Home. It's a *pull* reason once someone opens the app, not a way to get them to open it. Counted as surface, not one of the two mechanisms. |
| **"Swap 10" / extra rounds prompts** | They work within a session. No effect on coming back. |

---

## 7. Task 5 — Measurement

### 7.1 The blocker

F2: `_obLog` never leaves the device, so the ad test is blind today. **A minimal event sink is required before ads scale.** That makes it a launch gate, as ADR-014 §5 already required for the front door.

**Sink (proposed, $0):**
- Supabase table `public.onboard_events(id bigserial, anon_id uuid, user_id uuid null, evt text, ms int, meta jsonb, created_at timestamptz default now())`.
- **Insert-only** for `anon`/`authenticated` through a `security definer` RPC that caps `meta` size and checks `evt` against an allowlist. No select for clients.
- `anon_id` = a random uuid in localStorage, created on first load, so events before sign-in (E1–E2) join the account after sign-in (`user_id` filled from E3 on).
- The client sends events in batches (flush on screen change + `visibilitychange`, never blocking). A failure drops silently.
- The privacy policy gets one line. Security-review scope: RLS + RPC lockdown in the style of `0003_sec1_rpc_lockdown.sql`.

### 7.2 The event set (minimal — 10 events)

| # | Event | Fires at | Existing `_obLog` mapping | Answers |
|---|---|---|---|---|
| E1 | `front_shown` {inapp:bool} | front door first render per `anon_id` | new (ADR-014 "S0-shown") | ad click reached the app |
| E2 | `signup_start` {method:google\|email} | tap on Google / Create | new | intent |
| E3 | `signup_done` {method, new:bool} | `_authCompleteSignIn` / `_authHandleReturn` with a session | new (ADR-014 "S0-completed") | **the wall's conversion** |
| E4 | `name_set` {source:typed\|google\|screen\|catchup} | name stored | new | name cost / catch-up reach |
| E5 | `sticker_shown` | `_obfSticker` render | **`step_sticker`** (rename) | reached pre-round |
| E6 | `round1_start` | `startOnboardMicroDrill` hand-off | **`micro_drill_start`** (rename) | started the product |
| E7 | `first_word_spoken` {ms_from_front} | first JP TTS of round 1 | new | **time to first word (§3.2 target)** |
| E8 | `round1_done` {n, mins} | first round-end burst | new | finished the aha |
| E9 | `install_card` {action:shown\|accepted\|dismissed\|open_browser} | pick-2 card | new | way back chosen |
| E10 | `d2_open` {check:shown\|done\|skipped} | first app open on a later **local calendar day** | new | **the return** |

**Retired along with their screens:** `ob_start`, `step_w1`, `step_w5`, `step_mic`, `hear_tap` (moves to the front door as a `meta` flag on E2), `pick_*`, `funnel_done`, `mic_result`, `mic_declined`, `mic_skipped_unsupported`, `preview_start/done` (owner-only replay, not sent).

### 7.3 The success number for v1

**Headline: D1 return ≥ 40%** — share of accounts that reached E8 `round1_done` which fire E10 `d2_open` on the next local calendar day.
- Judged over the first cohort of **≥ 50 accounts reaching E8**.
- Testers baseline: 1 of 3 = 33%.
- 40% is a **placeholder to calibrate on cohort 1**, not a sourced industry benchmark. Treat it as the bar, with the funnel rows below as the diagnosis.

**Funnel health (diagnostic, each with its trigger):**

| Step | Bar | If below |
|---|---|---|
| E1 → E3 (wall) | ≥ 60% | reopen strict/loose (§5.1) |
| E3 → E6 (account → round starts) | ≥ 90% | a screen between them is broken or unclear |
| E6 → E8 (round finished) | ≥ 70% | round-1 pacing problem (outside this delve: the round itself) |
| E7 median | ≤ 30 s Google / ≤ 45 s email | flow regressed (§3.2) |
| E9 accepted ÷ shown | report only at v1 | no bar yet |

---

## 8. Final flow (screen table with copy)

| # | Screen | Shown when | Copy | Controls | Taps |
|---|---|---|---|---|---|
| **1** | **Front door** (replaces auth welcome + onboarding W1) | Anyone signed out | Eyebrow *ことば · WORDSTICK* · H1 **"Learn Japanese with your ears, not your thumbs."** · sub *"Hear a word, say it back, keep it. Free for 7 days — no card needed."* · audio row **"▶ tap to hear: みず — mizu — 'water'"** | **[Continue with Google]** (main; hidden in FB/IG browsers) · **[Sign up with email]** · link *"I already have an account"* · in-app line *"Using Google? Open in Chrome ⋮"* | 1 |
| **2** | **Create account** (email path only) | Tapped "Sign up with email" | H1 **"Create your account"** · sub *"Free for 7 days — no card needed."* | fields **First name** · **Email** · **Password (8+ characters)** · **[Create account]** (disabled until all valid) · ☐ *"Email me tips and updates. No spam, unsubscribe anytime."* · link *"← Back"* | ~3 fields + 1 |
| 2b | Sign in | "I already have an account" | unchanged (`_authFormHtml` signin) | email · password · Forgot · Google (same webview rule) | — |
| **N** | **Name** (only when missing: Google with no name, or an existing no-name account) | after sign-in, before sticker/Home | H1 **"What should we call you?"** · sub *"Just your first name — it's how WordStick talks to you."* | field **First name** · **[Continue]** (disabled when empty). No skip. | 1 field + 1 |
| **3** | **First sticker** (existing, personalised) | first run, after account (+N) | Eyebrow *YOUR FIRST STICKER* · H1 **"{Name}, here's your first sticker"** · sub *"Hear 30 Greetings words — hands-free — and it's yours for good."* · sticker art · *"About 5 minutes."* | **[▶ Let's go]** | 1 |
| **4** | **Round 1** (standard 30-word round) | from sticker | v8.99 spoken intro **"Just repeat what you hear — out loud. I'll handle the rest."** (auto, or "Start now →") · once-ever coach captions unchanged · 🎙 Voice pill asks for the mic **only when tapped** | standard round controls | 0 |
| **5** | **Round-end burst** (existing `_stkBurst`) | first round done | Eyebrow *{heard} OF {need} TO COLLECT* · H2 **"That's 30 words, {Name}"** · sub *"Nice one. Greetings · {mins} min"* · stats · line **"Tomorrow, {Name}: 10 of these words, cold. About a minute. The ones that come out are the ones that stick."** · **install card:** **"Keep WordStick one tap away"** / *"So tomorrow's check is right on your home screen."* | **[▶ Keep going]** · install card **[Add to home screen]** / **[Open in Chrome]** / *Not now* · links Change category · Home | 1 |
| **6** | **Home, first visit** | after round end → Home | greeting **"Good afternoon, {Name}"** · card **"Tomorrow's check · 10 words ready"** / *"Open WordStick tomorrow — it takes a minute."* · Category of the day hero (unchanged) | hero ▶ | — |
| **7** | **Day 2 — morning check** (existing, auto-pops) | first open on a later day | opener **"Morning, {Name}. Let's see what stuck."** · rest unchanged (v9.06) | unchanged | — |

**Removed from the path:** "Check your email" (kept only as the fallback when the project returns no session) · W1 Welcome · W5 word check · mic ask · W2/W3/W4/W6 (already unreachable). **Screens before the first spoken word:** 2 (Google) / 3 (email) / +1 when a name is missing.

---

## 9. Decisions reached

| ID | Decision |
|---|---|
| **D12-1** | Pre-round flow = **front door → [email form] → [name, only if missing] → first sticker → round 1**. W1 Welcome, W5 word check and the mic ask are **cut**; no question screen comes back. |
| **D12-2** | Target time to first spoken word **≤ 30 s Google / ≤ 45 s email** (median); **> 60 s** reopens Task 1. |
| **D12-3** | The mic permission is asked **in context** on the first 🎙 Voice tap, never during onboarding. |
| **D12-4** | The name is **required**. It's captured at sign-up (email field) or from Google data; a one-field Name screen appears only when missing. `'Julius'` default removed from `DEFAULT_SETTINGS`; `userName` empty or `'Julius'` (non-owner) counts as missing; catch-up via a `nav()` rewrite after the onboard rewrite. |
| **D12-5** | The name is used in writing at sticker headline, round end, Home greeting and morning check. It isn't spoken at v1. |
| **D12-6** | Sign-up wall is **strict**: no learning state before an account. The front door may carry the promise + one audio sample that writes no state. Reverse if E1→E3 < 60% over ≥ 100 views. |
| **D12-7** | **Instant accounts** (no confirmation link); the owner confirms the live project matches `enable_confirmations = false`. |
| **D12-8** | Google is the main button **except in FB/IG in-app browsers**, where it's hidden and email leads, with an "Open in Chrome" hint. |
| **D12-9** | Day-2 return = **(1) morning check promised as a date** (round-end line + first-Home card) and **(2) a home-screen install card** at the first round end. Streak push, web push, reminder email and sticker-progress-as-lever are rejected for v1. |
| **D12-10** | Onboarding events go to a **$0 insert-only Supabase sink** keyed by `anon_id` → `user_id`; 10 events E1–E10; the old funnel events retire. It gates ad scale. |
| **D12-11** | v1 success number = **D1 return ≥ 40%** of round-1 finishers over ≥ 50 accounts (placeholder, calibrate on cohort 1), with the funnel bars in §7.3 as diagnostics. |

---

## 10. Open questions

| ID | Question | Owner / who resolves |
|---|---|---|
| OQ-1 | Does the **live** Supabase project have email confirmations off? (config.toml says off; the charter describes a "confirm email" step on the phone.) | Owner (dashboard) |
| OQ-2 | Is in-app-browser detection (`FBAN`/`FBAV`/`Instagram` user agent) reliable on current FB and IG builds for Android + iOS, and does Google OAuth really fail there today? | QA adversary, then a device check |
| OQ-3 | Should the spoken intro say the name ("Hi {Name} — just repeat what you hear")? Only if device TTS says common names acceptably; test with 10 names. | Owner ear-test |
| OQ-4 | Test after cohort 1: next-morning reminder email vs web push (asked after a passed day-2 check). Needs SMTP live + the owner to lift the email-list park. | Owner, after cohort 1 |
| OQ-5 | Google sign-ups never see the marketing-consent tickbox. Acceptable while the list is parked. Add a one-time Settings prompt later? | Owner |
| OQ-6 | Word-check removal: do any real "I know some Japanese" ad users hate starting at word one? Watch E6→E8 drop for signs of boredom; the morning check graduates known words from day 2. | Cohort 1 data |
| OQ-7 | ADR-014 (pending) still describes the retired scripted-conversation flow (S1 path pick, S3 scripted conversation, D1a kana CTA). Synthesis should supersede its §3 flow while keeping §2 strict sign-in and §5 instrumentation. | Synthesis |
| OQ-8 | The 40% D1 bar isn't sourced. Should the adversary panel find a verifiable benchmark for web/PWA language apps from paid social, or keep it as a calibrated placeholder? | Devils-advocate |

---

## 11. Build list for Claude Design Round 1–2

**Round 1 — the path everyone walks (design first):**
1. **Front door**
   - normal-browser variant (Google main, email secondary, sign-in link, audio row)
   - **FB/IG in-app** variant (email main, "Open in Chrome ⋮" hint)
2. **Create account** with the First name field on top, disabled/enabled Create states, inline error row.
3. **Name screen** (one field, no skip). Also used as the catch-up for existing accounts.
4. **First sticker** with `{Name}` in the headline, including long names (24 characters) wrapping on 360 px.
5. **Round-end burst**, first-round variant:
   - "That's 30 words, {Name}"
   - the tomorrow line
   - **install card** in its three states: Android add / iOS instructions / in-app open-in-browser
6. **Home first visit**: named greeting + "Tomorrow's check · 10 words ready" card above the Category-of-the-day hero.

**Round 2 — edges and day 2:**
1. **iOS "Add to Home Screen" 2-step sheet** (Share ⬆ → Add to Home Screen).
2. **Morning check opener** with the name.
3. **Error / dead-end states:**
   - Google cancelled
   - offline on the front door (existing offline line)
   - account exists ("sign in instead")
   - instant-account fallback "Check your email" (if the project returns no session)
4. **Settings → Account** name row (view/edit).
5. **Mic in-context ask:** the 🎙 Voice pill's first-tap explainer before the browser prompt, plus the "mic blocked" recovery line.

**Out of design scope:** the round itself, stickers art, paywall/day-5 offer (Delve 9 / gating report).

---

## 12. ADR proposals (placeholders — NOT filed; numbers assigned at synthesis)

| Placeholder | Title | Supersedes / relates | Core decision | Reversal trigger |
|---|---|---|---|---|
| **ADR-P12a** | Onboarding v2: sticker-only pre-round flow | Supersedes pending **ADR-014 §1, §3, §4** (scripted conversation, path pick, mic ask, kana CTA). Keeps ADR-014 §2 (strict) and §5 (instrumented). | D12-1, D12-2, D12-3 | Median E7 > 60 s; E3→E6 < 90% |
| **ADR-P12b** | Required first name: capture, catch-up, and uses | New. Fixes the `DEFAULT_SETTINGS.userName = 'Julius'` defect. | D12-4, D12-5 | E4 `source:screen\|catchup` screen shows cause a measurable E3→E6 drop (> 5 points) → make the name optional again |
| **ADR-P12c** | Sign-up wall: strict wall, instant accounts, webview-aware Google | Amends **ADR-015** (sign-in mechanics: provider staging, magic link) | D12-6, D12-7, D12-8 | E1→E3 < 60% over ≥ 100 views; spike in fake/typo emails blocking checkout |
| **ADR-P12d** | Day-2 return: dated morning-check promise + home-screen install | Relates to ADR-009 (judgment-free, no loss-aversion) and v9.02 certification | D12-9 | D1 return < 40% on cohort 1 → test reminder email / web push (OQ-4) |
| **ADR-P12e** | Onboarding event sink and v1 success number | Implements ADR-014 §5; security scope like `0003_sec1_rpc_lockdown.sql` | D12-10, D12-11 | Sink insert error rate > 5%, or event volume threatening the free tier |
