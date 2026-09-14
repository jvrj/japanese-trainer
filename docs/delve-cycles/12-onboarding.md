# Delve 12 — Onboarding: the first five minutes of WordStick (primary)

- **Round:** 1 · **Mode:** Opus-only primary · **Date:** 2026-09-14
- **Build read:** index.html at v9.17 (working tree), `backend/supabase/` config + migrations
- **Status:** Round-1 synthesis applied (see **Synthesis** at the end). Adopted adversary fixes are written into the body below, each tagged with its finding ID (DA-n / QA-n / CR-n). ADRs filed as pending **ADR-024 / ADR-025 / ADR-026** in `docs/decisions-pending/`.

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
   - `reports/hydra-research/2026-08-27-gating-model/REPORT.md`: sign-up-flow lens — "84% of cancellations land by Day 1" (the verified half). The paired "82% of trial starts are Day 0" figure was **retracted by that report's own verify gate** (REPORT.md line 119) and isn't used here (QA-1). Trial start is the funnel event to optimise ad spend against.
   - `reports/hydra-research/2026-07-21/REPORT.md`: Praktika's goal-first onboarding is fast, but a goal change resets progress; Duolingo's streak loss-aversion "contradicts Isshin's judgment-free positioning".
   - `docs/delve-cycles/9-commercial-spine.md` and pending `ADR-014` (sign-in-first; ≤5 screens; the S0 funnel instrumented from day one).
3. **Check each current screen against one rule.** A screen before the first spoken word must do something the round itself can't do. The owner put it as *"every extra step loses some people"*, so the burden of proof sits on keeping a screen, not on cutting it.
4. **Time the path.** Estimate seconds per step on an Android phone on 4G, from the ad click. State a target and defend it.
5. **Pick, don't list.** Every task ends with a FINAL decision, the options it kills, and a reversal trigger where one makes sense.

**Code facts that change the answer** (found during step 1; the adversaries should re-check these):

| # | Fact | Where | Consequence |
|---|---|---|---|
| F1 | `DEFAULT_SETTINGS.userName` is hard-coded to `'Julius'`. Load does `{...DEFAULT_SETTINGS, ...saved}` and `save()` writes all settings back. | index.html 4792, 5364 | **Every customer account is named "Julius"** unless they found the Settings field. The "no-name account" check must treat `'Julius'` as no name. |
| F2 | `_obLog` writes to `console` and `log()`, and `log()` only pushes into `state.logs` on the device. **But** a Meta Pixel is live: `PageView` on load, and `StartTrial` from `_metaTrackStartTrialOnce` on a brand-new account's first sign-in (created < 10 min ago). | 27688, 5567; Pixel at index.html 10–22, 7104–7124 | **No in-app onboarding event leaves the phone.** The ad side isn't blind, though: the Pixel already shows ad click → account per ad set. What nobody can see is everything *after* the account (sticker, round 1, day 2). *(Corrected at synthesis — DA-1.)* |
| F3 | `enable_confirmations = false` in `backend/supabase/config.toml` (email). `authDoSignUp` already finishes in-page when a session comes back. | config.toml 226; ≈7395 | Instant accounts are already the local config. The "Check your email" screen only shows if the **live** project still has confirmations on. |
| F4 | Granting the mic doesn't turn voice mode on; drills are hands-free on TTS + auto-advance without it. `_voicePreflightMic` already runs when the 🎙 Voice pill is tapped. | ≈27812 | The pre-round mic screen asks for a permission the first round doesn't use. |
| F5 | The v8.99 spoken intro ("Just repeat what you hear — out loud. I'll handle the rest.") and the coach captions already run **inside** the first round. | 24244 | The round already teaches itself, so a Welcome screen that explains the method is redundant. |
| F6 | Round end already says "Tomorrow morning I'll ask for them cold." and the morning check pops by itself (`_coldAutoPop`). | ≈27335, 26095 | The "prove it tomorrow" hook exists. Nothing makes sure the person is *there* tomorrow. |
| F7 | There's no Notification or push, and no `beforeinstallprompt` handling. `state.streak` exists and shows as 🔥 on Home and at round end. | grep | Nothing brings people back at the moment except memory. |
| F8 | Google OAuth is refused inside embedded webviews (Google's `disallowed_useragent` policy), and Facebook/Instagram ads open links in their in-app browser. | platform fact — **verify on device** | "Continue with Google" as the main button fails for ad traffic that never leaves the FB/IG browser. |
| F9 | Nothing in the repo reads Google profile data: 0 matches for `user_metadata`/`given_name`/`full_name` in index.html, and `backend/supabase/config.toml` has no Google provider block (it's set up in the live dashboard only). | grep | The Google name pre-fill (§4.1) is **unverified**. Check the real Supabase Google payload on a device before counting on "0 extra screens" (QA-5, CR-1). |
| F10 | Cloud sync pushes on a 45 s debounce (`SYNC_DEBOUNCE_MS = 45000`), and `_syncPushNow()` exists. | 7519, 7629 | Leaving right after round 1 can leave round-1 progress unsynced, so any handoff to another browser must push first (DA-4). |
| F11 | Every boot runs `history.replaceState({screen:'home'}, '', '#home')`, so every app open passes through `nav('home')`. | 29913 | A deep link can't skip a gate placed in `nav()` after the onboard rewrite (CR-4). |

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

**Target: ≤ 45 s on the email path (the headline, because FB/IG in-app ad traffic can't use Google, §5.3) · ≤ 30 s on the Google path (normal browsers). Median, Android, 4G. E7 is always reported split by `inapp`.** *(Re-headlined at synthesis — DA-7.)*

| Step | Google path (s) | Email path (s) |
|---|---|---|
| App shell loads from the ad link | 3 | 3 |
| Front door: read + tap | 4 | 4 |
| Google account picker + redirect back + account sync (6 s timeout, a new account has no cloud copy) | 8 | — |
| Email form: first name + email + password (autofill helps) + Create | — | 22 |
| First sticker: read + "Let's go" | 5 | 5 |
| v8.99 spoken intro (auto, or "Start now →") | 4 | 4 |
| First JP word spoken | ≈24 | ≈38 |

**Cold-load caveat (DA-7):** the 3 s shell step assumes a warm load. A first ad click downloads the ~2.17 MB `index.html` with no service worker installed yet, and autofill is weakest inside webviews. Real in-app medians may run above the table, which is why the ceiling is 60 s, not the target.

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
| **Google** | Taken automatically from `user.user_metadata.given_name`, else the first word of `full_name`/`name`. Stored in `state.settings.userName`. Editable later in Settings; no confirm screen. **Provisional (F9):** the payload shape is unverified. If the field is often absent, the Name screen below shows instead, and E4 `source:screen` counts how often. | 0 (provisional) |
| **Google with no name in its data** (rare; some Workspace accounts) | One **Name screen** (N) between sign-in and the sticker: *"What should we call you?"* · one field · **Continue**. It can't be skipped. | 1 |
| **Existing accounts with no name** (see 4.2) | The same Name screen shows **once**, on the next app open, before Home. Rounds already in progress aren't interrupted. | 1, once |

**Options rejected:**
- **Name as its own screen right after Welcome.** It's a screen for every user, against *"every extra step loses some people"*, and the email path already has a form open.
- **Name after the first round.** The first round is where the name pays off most (sticker headline, round end). Asking afterwards wastes those two uses and puts a form between the peak moment and "Keep going".
- **Optional name.** The owner said *"ensure a name is used"*. An optional field ends up blank for most people, and the uses in 4.3 then read awkwardly.

### 4.2 Catching existing accounts with no name

- **Rule (revised at synthesis — QA-3):** the name is missing when the durable, synced flag `settings.nameSet !== true`.
  - Saving any valid name sets `nameSet = true`, from any source: form, Google fill, Name screen or Settings.
  - **One-time backfill at load:** a non-empty `userName` that isn't exactly `'Julius'` sets `nameSet = true`. `'Julius'` on a non-owner device stays unset and is asked **once**.
  - So a real customer called Julius who types that name on the Name screen is never asked again. The old string rule would have asked them on every open.
- **Fix the source in the same build:** `DEFAULT_SETTINGS.userName` becomes `''` and `DEFAULT_SETTINGS.nameSet` is `false`. The owner's own saved settings keep `'Julius'`, and `ownerMode` backfills `nameSet = true`.
- **Where the check runs:** in `nav()`, immediately **after** the onboarding rewrite and before `home` **or the first sticker** renders.
  - If signed in + name missing, the screen becomes `name`, **whether or not `onboard.done` is true**. So an account closed between sign-up and the sticker is caught on reopen (QA-2).
  - Gate order: auth → name → onboard (sticker) → home.
  - A deep link can't skip it, because every boot passes through `home` (F11, index.html 29913 — CR-4).
- **No trap:** the Name screen has a quiet *"Not you? Sign out"* link, so a shared or wrong-account device always has a way out.
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
- **Ad-signal cost (DA-2):** `StartTrial` fires for any fresh account, so junk and throwaway accounts count as conversions and Meta learns to buy more of them. Throwaway emails also make the no-card trial renewable.
  - Watch the ratio **`StartTrial` ÷ E8 `round1_done`**.
  - If it runs above **2 : 1** over a cohort of ≥ 100 StartTrials, move ad optimisation to a round-1-finished Pixel event (this needs volume). The reversal trigger is in ADR-025.
- **Security gate (DA-3) — blocks shipping instant accounts to ad traffic:**
  - With confirmations off, a password sign-up counts as a confirmed email.
  - Supabase links identities that share an email automatically. `enable_manual_linking = false` (config.toml 180) only covers *manual* linking.
  - The risk: an attacker pre-registers a victim's Gmail address with their own password. If the victim later signs in with Google and the identities merge, the attacker's password opens the account and its Stripe portal.
  - **Before D12-7 ships:** run the live two-step test in OQ-9, or send it to security review. If the identities link, instant accounts ship only with one of these mitigations: confirmations stay on for password sign-ups, or a password identity is dropped when Google links to an unconfirmed address.
- The `_authSentHtml` signup branch stays in code as the fallback when the project returns no session.

### 5.3 Google placement — FINAL: **main button — except inside in-app browsers**

- **Normal browser:** **[Continue with Google]** is the main button at the top. Below it, **[Sign up with email]** (secondary), then a text link *"I already have an account"*.
- **FB/IG in-app browser** (user agent contains `FBAN`, `FBAV` or `Instagram`): the Google button is **hidden** (F8, Google refuses webview OAuth). **Sign up with email** becomes the main button, and a quiet line reads *"Using Google? Open WordStick in Chrome ⋮ → Open in browser"*.
  - Detection has to be reliable. The QA adversary should test the real FB and IG apps on Android and iOS.
  - **D12-8 is FINAL pending that device check (OQ-2 — QA-6).** Fallback if user-agent detection proves unreliable: **email leads for everyone**, and Google becomes the secondary button in every browser. A failed Google tap in a webview costs more than one extra form.
- **Google cancelled or failed:** the user lands back on the front door. The existing `AUTH_TRY_EMAIL_MSG` path stays, with email as the fallback.
- **Marketing consent:** unticked checkbox on the email form (unchanged). Google sign-ups don't see it at v1, which is accepted since the email list is parked; see OQ-5.

---

## 6. Task 4 — Day-1 → day-2 return (FINAL: two mechanisms)

**The problem, as a working hypothesis (DA-5):** the first round works (testers did 32–46 words). The likeliest failure is **finding the app again tomorrow**. That's inferred from 3 testers who didn't come from ads, and it isn't proven that the two who didn't return lost the way back rather than the reason to come back. Both picks are cheap enough to ship anyway. The hypothesis gets tested two ways:
- ask the two testers (OQ-10)
- report D1 return split by **installed vs not** (E9 × E10) The ad user is sitting in a Facebook/Instagram webview tab that's gone once the feed moves on. F6: the reason to come back already exists (the morning check). F7: the way back doesn't.

### 6.1 PICK 1 — **"Prove it tomorrow": the morning check, stated as a date**

The check itself is already shipped (v9.02–9.06). Build only the copy and the promise:

- **Round-end line** (replaces "Tomorrow morning I'll ask for them cold…"): **"Tomorrow, {Name}: a 1-minute check on 10 of these words — no hints. The ones that come out are the ones that stick."**
- **First Home visit after round 1** shows one card above the hero: **"Tomorrow's check · 10 words ready"** · sub *"Open WordStick tomorrow — it takes a minute."* The card disappears once the check has run.
- **Why this one:**
  1. It's native to the product (the stuck counter is *earned* this way).
  2. It isn't loss-aversion. Nothing breaks if you skip it; you just don't see what stuck. That keeps the judgment-free rule.
  3. Code cost is near zero.

### 6.2 PICK 2 — **Put WordStick on the home screen, at the peak moment**

On the **first round-end burst only**, below "Keep going", a single card: **"Keep WordStick one tap away"** · sub *"So tomorrow's check is right on your home screen."*

| Environment | What the card does |
|---|---|
| Android Chrome, install event available | The button **"Add to home screen"** fires the `beforeinstallprompt` event stashed by a **new boot-time listener** (capture → `preventDefault()` → keep). No such listener exists today (F7), so it's a build item (CR-2). |
| Android Chrome, no stashed event (not installable yet, or the event hasn't fired this session) | The card shows the manual steps instead: *⋮ → "Add to home screen" / "Install app"*. It's never a dead button (QA-4). |
| iOS Safari | The button opens a 2-step sheet: *Share ⬆ → "Add to Home Screen"*. |
| FB/IG in-app browser | The button becomes **"Open in Chrome"** / **"Open in Safari"** with the ⋮ instruction, plus the line *"You'll sign in once there — your words come with you."* (DA-4). |
| Already installed (`display-mode: standalone`) | No card. |

"Not now" dismisses it for good. It comes back once, at the end of round 2 on another day, then never.

**Sync before handoff (DA-4, F10):** the first round-end burst calls `_syncPushNow()` before the card renders, so round-1 words and the morning-check queue reach the cloud before the user leaves for another browser. That browser has separate storage and starts signed out; one sign-in there is accepted at v1. A signed-in handoff link would be new auth surface, so it's deferred (see Synthesis).

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

F2 (corrected): the Meta Pixel already shows ad click → account per ad set, but `_obLog` never leaves the device, so **everything after the account is blind**. **A minimal event sink for the post-account funnel is required before ads scale.** That makes it a launch gate, as ADR-014 §5 already required.

**Two sources, one job each (DA-1):**
- The **Pixel owns the wall**: `PageView` → `StartTrial` per ad set, which is the ad-optimisation signal.
- The **Supabase sink owns the product funnel**: E3 → E10 and D1 return.
- E3 fires from the same choke point as `_metaTrackStartTrialOnce` (index.html 7122–7124), so the two counts can be compared. If they diverge by > 20% across two cohorts, the ADR-026 trigger picks one source of truth.

**Sink (proposed, $0):**
*(Revised at synthesis — DA-1, DA-9: signed-in only, no anonymous write surface, no pre-consent `anon_id`.)*
- Supabase table `public.onboard_events(id bigserial, user_id uuid not null, evt text, ms int, meta jsonb, created_at timestamptz default now())`.
- **Insert-only for `authenticated`**, through a `security definer` RPC that:
  - sets `user_id = auth.uid()`
  - checks `evt` against an 8-event allowlist (E3–E10)
  - caps `meta` at 1 KB
  - rate-limits to **≤ 300 events per user per day**

  There's no grant to `anon` and no select for clients.
- Pre-sign-in events (the old E1/E2) are **not** sent to the sink; the Pixel covers them.
- The client sends events in batches (flush on screen change + `visibilitychange`, never blocking). A failure drops silently.
- **Privacy:** the privacy policy gets a short paragraph, not one line. It names both the Meta Pixel (`PageView`/`StartTrial`) and the signed-in product events, what they hold (event name, timing, small meta, no content) and why they're collected.
- **Security-review scope:** RLS + RPC lockdown in the style of `0003_sec1_rpc_lockdown.sql`.

### 7.2 The event set (minimal — 10 events)

| # | Event | Fires at | Existing `_obLog` mapping | Answers |
|---|---|---|---|---|
| E1 | *Pixel `PageView`* (not in the sink — DA-1/DA-9) | page load | Pixel, existing | ad click reached the app |
| E2 | *dropped from the sink at v1* (optional Pixel custom event later) | tap on Google / Create | — | intent |
| E3 | `signup_done` {method, new:bool, inapp:bool} | same auth choke point as `_metaTrackStartTrialOnce` (index.html 7122–7124) | new (ADR-014 "S0-completed"); cross-checks Pixel `StartTrial` | first sink event; wall conversion comes from the Pixel |
| E4 | `name_set` {source:typed\|google\|screen\|catchup} | name stored | new | name cost / catch-up reach |
| E5 | `sticker_shown` | `_obfSticker` render | **`step_sticker`** (rename) | reached pre-round |
| E6 | `round1_start` | `startOnboardMicroDrill` hand-off | **`micro_drill_start`** (rename) | started the product |
| E7 | `first_word_spoken` {ms_from_load, inapp} | first JP TTS of round 1 (timer runs from page load, held on the device until E3 lets it send) | new | **time to first word (§3.2 target), split by `inapp`** |
| E8 | `round1_done` {n, mins} | first round-end burst | new | finished the aha |
| E9 | `install_card` {action:shown\|accepted\|dismissed\|open_browser} | pick-2 card | new | way back chosen |
| E10 | `d2_open` {check:shown\|done\|skipped, standalone:bool} | first app open on a later **local calendar day** | new | **the return**, split installed vs not (DA-5) |

**Retired along with their screens:** `ob_start`, `step_w1`, `step_w5`, `step_mic`, `hear_tap` (moves to the front door as a `meta` flag on E2), `pick_*`, `funnel_done`, `mic_result`, `mic_declined`, `mic_skipped_unsupported`, `preview_start/done` (owner-only replay, not sent).

### 7.3 The success number for v1

**Headline: D1 return ≥ 40%** — share of accounts that reached E8 `round1_done` which fire E10 `d2_open` on the next local calendar day.
- Judged over the first cohort of **≥ 50 accounts reaching E8**.
- Testers baseline: 1 of 3 = 33%.
- 40% is a **placeholder to calibrate on cohort 1**, not a sourced industry benchmark. Treat it as the bar, with the funnel rows below as the diagnosis.
- **OQ-8 answered (DA-8):** don't block on finding a benchmark.
  - Every bar below is a **labelled placeholder**.
  - At n ≈ 50–100 the noise is roughly **±10–14 points**, so a trigger only fires when a result misses its bar by **≥ 10 points in the same direction across two consecutive cohorts**.
  - No 5-point triggers.

**Funnel health (diagnostic, each with its trigger):**

| Step | Bar | If below |
|---|---|---|
| Pixel `PageView` → `StartTrial` (wall, per ad set) | ≥ 60% (placeholder) | reopen strict/loose (§5.1), two-cohort rule |
| `StartTrial` ÷ E8 | ≤ 2 : 1 | junk accounts are training the ads; move the optimisation event (§5.2, DA-2) |
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
| **5** | **Round-end burst** (existing `_stkBurst`) | first round done | Eyebrow *{heard} OF {need} TO COLLECT* · H2 **"That's 30 words, {Name}"** · sub *"Nice one. Greetings · {mins} min"* · stats · line **"Tomorrow, {Name}: a 1-minute check on 10 of these words — no hints. The ones that come out are the ones that stick."** · **install card:** **"Keep WordStick one tap away"** / *"So tomorrow's check is right on your home screen."* | **[▶ Keep going]** · install card **[Add to home screen]** / **[Open in Chrome]** / *Not now* · links Change category · Home | 1 |
| **6** | **Home, first visit** | after round end → Home | greeting **"Good afternoon, {Name}"** · card **"Tomorrow's check · 10 words ready"** / *"Open WordStick tomorrow — it takes a minute."* · Category of the day hero (unchanged) | hero ▶ | — |
| **7** | **Day 2 — morning check** (existing, auto-pops) | first open on a later day | opener **"Morning, {Name}. Let's see what stuck."** · rest unchanged (v9.06) | unchanged | — |

**Removed from the path:** "Check your email" (kept only as the fallback when the project returns no session) · W1 Welcome · W5 word check · mic ask · W2/W3/W4/W6 (already unreachable). **Screens before the first spoken word:** 2 (Google) / 3 (email) / +1 when a name is missing.

---

## 9. Decisions reached

| ID | Decision |
|---|---|
| **D12-1** | Pre-round flow = **front door → [email form] → [name, only if missing] → first sticker → round 1**. W1 Welcome, W5 word check and the mic ask are **cut**; no question screen comes back. |
| **D12-2** | Target time to first spoken word **≤ 45 s email (headline, ad path) / ≤ 30 s Google** (median, E7 split by `inapp`); **> 60 s** reopens Task 1. |
| **D12-3** | The mic permission is asked **in context** on the first 🎙 Voice tap, never during onboarding. |
| **D12-4** | The name is **required**. It's captured at sign-up (email field) or from Google data; a one-field Name screen appears only when missing. `'Julius'` default removed from `DEFAULT_SETTINGS`. Missing = the durable synced flag `nameSet !== true` (with a one-time backfill). The gate in `nav()` runs for any signed-in account, before the sticker or Home, and has a Sign-out exit. Google pre-fill is provisional (F9). |
| **D12-5** | The name is used in writing at sticker headline, round end, Home greeting and morning check. It isn't spoken at v1. |
| **D12-6** | Sign-up wall is **strict**: no learning state before an account. The front door may carry the promise + one audio sample that writes no state. Reverse if E1→E3 < 60% over ≥ 100 views. |
| **D12-7** | **Instant accounts** (no confirmation link); the owner confirms the live project matches `enable_confirmations = false`. **Gated:** doesn't ship to ad traffic until the OQ-9 identity-linking test passes or is mitigated (DA-3). |
| **D12-8** | Google is the main button **except in FB/IG in-app browsers**, where it's hidden and email leads, with an "Open in Chrome" hint. FINAL pending the OQ-2 device check; fallback = email leads everywhere. |
| **D12-9** | Day-2 return = **(1) morning check promised as a date** (round-end line + first-Home card) and **(2) a home-screen install card** at the first round end. Streak push, web push, reminder email and sticker-progress-as-lever are rejected for v1. |
| **D12-10** | The **Meta Pixel owns the wall** (PageView → StartTrial). Post-account events go to a **$0, signed-in-only, insert-only, rate-limited Supabase sink**: 8 events, E3–E10. The old funnel events retire. It gates ad scale. |
| **D12-11** | v1 success number = **D1 return ≥ 40%** of round-1 finishers over ≥ 50 accounts (placeholder, calibrate on cohort 1), with the funnel bars in §7.3 as diagnostics. A trigger needs a ≥ 10-point miss in the same direction across two cohorts. |

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
| OQ-8 | ~~The 40% D1 bar isn't sourced.~~ **Answered at synthesis:** keep it as a labelled placeholder, with triggers sized to what a cohort can detect (§7.3). | Closed |
| OQ-9 | **Security (blocks D12-7):** on the live project, sign up with a password for address X, then sign in with Google as X. Does the password still open the Google-linked account? If yes, pick a mitigation (§5.2) before ads run. | Owner + security review |
| OQ-10 | Ask the two testers who didn't return on day 2 *why not*. Did they lose the tab, or have no reason to come back? | Owner |
| OQ-11 | What does the live Supabase Google sign-in actually put in `user_metadata` (`given_name`? `full_name`? `name`?) for a personal Gmail and for a Workspace account? | Device check, before the Name build |

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
   - **back button mid-flow and app closed mid-onboarding** (QA-2), see 11.1
4. **Settings → Account** name row (view/edit).
5. **Mic in-context ask:** the 🎙 Voice pill's first-tap explainer before the browser prompt, plus the "mic blocked" recovery line.

**Out of design scope:** the round itself, stickers art, paywall/day-5 offer (Delve 9 / gating report).

### 11.1 Dead ends: back button and app closed mid-flow (added at synthesis — QA-2)

| Where the user is | Hardware/browser back | App closed and reopened |
|---|---|---|
| Front door | leaves the page (nothing stored) | front door again |
| Create account | ← to the front door; nothing stored | front door again (no account yet) |
| After account, before a name | back re-enters `name` through the `nav()` gate; the exits are **Continue** or *Not you? Sign out* | `name` (the gate runs whether or not `onboard.done` is set) |
| First sticker | → Home, which rewrites to `onboard` → sticker again (no dead end, same as today) | sticker (`onboard.done` still false) |
| Round 1 in progress | the round's normal exit | Home. `onboard.done` is marked **before** the drill launches (index.html 27618–27619), and the round has already saved its heard steps. The tomorrow card only shows if E8 fired. |

Build probe: one scripted run per row; all 5 must land on the listed screen (ADR-024 gate).

### 11.2 Engineering items and size (added at synthesis — CR-3)

These aren't design work, but they're part of the build. Sizes come from the code-review adversary's estimate:

| Decision | Size | Note |
|---|---|---|
| D12-1 / D12-2 / D12-3 / D12-5 / D12-8 | small | copy + markup; remove W1/W5 and the mic step, delete the `_obfW2/W3/W4/W6` renderers |
| D12-4 name gate + `nameSet` + backfill | small–medium | the risk is getting the predicate and its `nav()` placement right, not code volume |
| D12-9 install card | medium | **new** boot-time `beforeinstallprompt` capture listener; iOS is copy only; `_syncPushNow()` before the card |
| **D12-10 event sink** | **largest** | new migration + security-definer RPC + RLS + allowlist + per-user rate limit + client batching. **The only security-relevant item, so it needs security review** |
| D12-7 instant accounts | small in code, **gated** | blocked on OQ-9 |

---

## 12. ADR proposals (placeholders — see Synthesis for what was filed)

*Synthesis outcome:*
- P12a + the name gate from P12b → **ADR-024**
- P12c → **ADR-025**
- P12e → **ADR-026**
- the name *uses* (the rest of P12b) and P12d → decision-notes

All three ADRs are pending in `docs/decisions-pending/`.

| Placeholder | Title | Supersedes / relates | Core decision | Reversal trigger |
|---|---|---|---|---|
| **ADR-P12a** | Onboarding v2: sticker-only pre-round flow | Supersedes pending **ADR-014 §1, §3, §4** (scripted conversation, path pick, mic ask, kana CTA). Keeps ADR-014 §2 (strict) and §5 (instrumented). | D12-1, D12-2, D12-3 | Median E7 > 60 s; E3→E6 < 90% |
| **ADR-P12b** | Required first name: capture, catch-up, and uses | New. Fixes the `DEFAULT_SETTINGS.userName = 'Julius'` defect. | D12-4, D12-5 | E4 `source:screen\|catchup` screen shows cause a measurable E3→E6 drop (> 5 points) → make the name optional again |
| **ADR-P12c** | Sign-up wall: strict wall, instant accounts, webview-aware Google | Amends **ADR-015** (sign-in mechanics: provider staging, magic link) | D12-6, D12-7, D12-8 | E1→E3 < 60% over ≥ 100 views; spike in fake/typo emails blocking checkout |
| **ADR-P12d** | Day-2 return: dated morning-check promise + home-screen install | Relates to ADR-009 (judgment-free, no loss-aversion) and v9.02 certification | D12-9 | D1 return < 40% on cohort 1 → test reminder email / web push (OQ-4) |
| **ADR-P12e** | Onboarding event sink and v1 success number | Implements ADR-014 §5; security scope like `0003_sec1_rpc_lockdown.sql` | D12-10, D12-11 | Sink insert error rate > 5%, or event volume threatening the free tier |

---

## Synthesis (Round 1 — Delve 12)

**Panel:** devils-advocate WARN · qa-tester WARN · code-reviewer WARN (commit `0114afd`).

**Result:** 20 findings, all 20 dispositioned: 16 accepted, 3 accepted-deferred, 1 contested.

**Citation gate:** before adopting any finding, every cited line and quoted token was re-checked against source. All matched:
- primary-doc quotes at lines 57, 69, 98, 130, 137, 141, 185, 192, 201, 207, 220, 222, 256, 277, 319, 322 and 335
- REPORT.md line 119 (the retraction)
- index.html:
  - 27623 (transient `state.onboard`)
  - 29913 (`history.replaceState`)
  - 7104–7109 (the 10-minute `StartTrial` rule)
  - 7519 (`SYNC_DEBOUNCE_MS = 45000`)
  - 0 matches for `beforeinstallprompt` / `user_metadata` / `given_name` / `full_name`
  - total size 2,172,061 bytes
- config.toml: 180 (`enable_manual_linking = false`), 226 (`enable_confirmations = false`), and no Google provider block
- the charter's Adversary 2 and 3 audit text

No finding was contested on citation grounds.

### Dispositions

| ID | Finding | Disposition | Rationale (one line) |
|---|---|---|---|
| DA-1 | "Ad test is blind" is false: a Meta Pixel with StartTrial is already live | **accepted** | Verified at index.html 10–22 and 7104–7124. F2, §7.1 and §7.2 are corrected: the Pixel owns the wall, the sink owns post-account events, and E3 fires from the same choke point. |
| DA-2 | Instant accounts poison Meta's ad-optimisation signal | **accepted-deferred** | The `StartTrial ÷ E8 ≤ 2:1` watch is added to §5.2 and §7.3 and as an ADR-025 trigger. Actually switching the optimisation event waits until there's enough volume. |
| DA-3 | Instant accounts plus automatic identity linking may allow pre-account takeover, and no security reviewer is on the panel | **accepted** | Plausible and not disproved in-session. D12-7 is now gated on the OQ-9 live test or a security review, with named mitigations (§5.2, ADR-025 gate). |
| DA-4 | The install card's "Open in Chrome" handoff lands signed out, and round-1 progress may not have synced | **accepted** | `_syncPushNow()` is forced before the card, and the copy sets up the one sign-in. A signed-in handoff link would be new auth surface, so it's deferred (decision-note). |
| DA-5 | The day-2 "finding the app" diagnosis is inferred from 3 testers who weren't from ads | **accepted** | §6 is reframed as a hypothesis, with OQ-10 (ask the testers) and a D1 installed-vs-not split added. Both picks stay because they cost almost nothing. |
| DA-6 | A required name adds friction, and the catch-up brings back a question screen | **contested** | The owner's verbatim directive is *"ensure a name is used"*, so making it optional isn't this delve's call. The v8.97/98 ban covered pre-round personalisation funnels, not a one-field identity step, and the email form adds 0 screens. The detectable-trigger half is adopted through DA-8 (ADR-024 trigger: Name-screen completion < 85%). |
| DA-7 | The headline timing target uses the Google path, which ad traffic in webviews can't take | **accepted** | Email ≤ 45 s is now the headline, E7 is split by `inapp`, and there's a cold-load caveat for the 2.17 MB shell (§3.2, D12-2). |
| DA-8 | Bars are unsourced, and 5-point triggers can't be detected at n ≈ 50–100 | **accepted** | Every bar is now labelled a placeholder, a trigger needs a ≥ 10-point miss across two cohorts, and OQ-8 is closed. |
| DA-9 | The anonymous insert RPC is a new unauthenticated write surface, and privacy gets one line | **accepted** | The sink is now signed-in only (no `anon` grant, no `anon_id`), rate-limited to 300 events per user per day, with meta ≤ 1 KB. The privacy paragraph names both the Pixel and the events. |
| DA-10 | "cold" is jargon for a total beginner | **accepted** | The copy now reads *"a 1-minute check on 10 of these words — no hints"* (§6.1, §8). |
| QA-1 | §2 grounding cites a statistic its own source retracted | **accepted** | Verified at REPORT.md 119. §2 now uses only the verified 84% half and names the retraction. |
| QA-2 | Back button mid-flow and app closed mid-onboarding are never addressed | **accepted** | Added the §11.1 dead-end table. The name gate now runs whether or not `onboard.done` is set, and a 5-row probe is in the ADR-024 gate. |
| QA-3 | The "Julius" string rule traps a real customer named Julius on the Name screen forever | **accepted** | Replaced with a durable, synced `nameSet` flag plus a one-time backfill (§4.2, D12-4). |
| QA-4 | The install card assumes `beforeinstallprompt` has already fired on a cold first visit | **accepted** | Added a "no stashed event" state that shows the manual ⋮ steps, so the button is never dead (§6.2). |
| QA-5 | Google name auto-fill relies on an unverified Supabase payload shape | **accepted-deferred** | Marked provisional (F9, OQ-11), with a device check before the Name build. The Name-screen fallback already covers a missing name, and E4 `source` measures how often it happens. |
| QA-6 | D12-8 is listed FINAL while its detection mechanism is unverified | **accepted** | D12-8 is now FINAL pending OQ-2, with an explicit fallback (email leads everywhere) at §5.3 and in §9. |
| CR-1 | The Google name pre-fill is unverified in code and config, and unlike F8 it isn't flagged | **accepted-deferred** | Same fix as QA-5: added as F9 with "verify on device" and OQ-11, since the live payload can't be checked from the repo. |
| CR-2 | "The saved beforeinstallprompt event" implies capture logic that doesn't exist | **accepted** | §6.2 now describes a new boot-time listener, and it's listed in §11.2 as a build item. |
| CR-3 | No change-size estimate, and D12-10 is missing from the build list | **accepted** | Added the §11.2 sizing table, with D12-10 flagged as the largest and only security-relevant item. |
| CR-4 | The "no skip" claim rests on an uncited boot invariant | **accepted** | Added F11, and §4.2 now cites index.html 29913. |

### ADRs filed (pending, `docs/decisions-pending/`)

- **ADR-024 — Onboarding v2: sticker-only pre-round flow and the name gate** (D12-1, D12-2, D12-3, D12-4). Supersedes pending ADR-014 §1, §3 and §4, and keeps §2 and §5. Changing ADR-014's status is left to human promotion.
- **ADR-025 — Sign-up wall: strict wall, instant accounts behind a security gate, webview-aware Google** (D12-6, D12-7, D12-8). Amends pending ADR-015.
- **ADR-026 — Onboarding measurement: the Pixel owns the wall, a signed-in-only event sink, and the v1 D1 number** (D12-10, D12-11).

### Decision-notes (not ADRs)

- **Name uses are written, not spoken, at v1 (D12-5)**
  - **Decision:** `{Name}` appears in the sticker headline, round end, Home greeting and morning-check opener. TTS never says the name (OQ-3).
  - **Why:** device TTS mispronounces names, and that would happen in the first 30 seconds.
  - **Reversal cost:** copy only; surfaces can be added or removed freely.
- **Day-2 return = dated morning-check promise + home-screen install card (D12-9)**
  - **Decision:**
    - the round-end line plus the first-Home "Tomorrow's check" card
    - an install card shown once, then once more on a later day: Android prompt, manual steps, iOS sheet, or in-app "Open in Chrome"
    - `_syncPushNow()` runs before the card shows
    - rejected for v1: streak push, web push, reminder email, sticker progress as the lever
  - **Why:** $0, judgment-free, and a cheap test of the "can't find the app again" hypothesis.
  - **Reversal cost:** local UI. If D1 < 40% by the two-cohort rule, swap in reminder email or web push after cohort 1 (OQ-4).
- **Signed-in cross-browser handoff link deferred (DA-4)**
  - **Decision:** at v1 the user signs in once in the new browser.
  - **Why:** a handoff token is new auth surface that needs security review.
  - **Reversal cost:** purely additive later; nothing to undo.

### Conflicts noted

None. The adversary findings were treated as data, and nothing in them that read like an instruction was acted on.
