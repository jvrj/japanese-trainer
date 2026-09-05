# WordStick · DO THIS NEXT
*The ONE file that always knows the next step. If it looks stale, tell Claude: "refresh DO_THIS_NEXT.md".*
*Last updated: **2026-09-05***

> **2 Sep — three things locked:** the name is **WordStick** (domain
> **wordstick.app** bought ✓), the app icon is the **Sticker W** (live in
> v8.85 ✓), and the site layout is decided: **wordstick.app** will be the
> sales page, **app.wordstick.app** will be the app — the standard setup
> paying customers expect. We point the domain FIRST, so every address you
> type into Google/Supabase/Resend is typed once, ever.

---

## 🎉 Where things stand

- **Sign-in + paywall LIVE** since 24 Aug: sign up free → free week →
  free plan (3 new words/day) with the plan picker one tap away
  ($8.99/mo · $59.99/yr). Your account (juliuspireh@gmail.com) is
  allow-listed — always in, never asked to pay.
- **Account sync (v8.80):** progress, settings and onboarding follow the
  ACCOUNT. This matters below — when the app moves to its new address,
  you just sign in once and everything comes back.
- **Rename + icon done:** WordStick everywhere, Sticker W icon shipped
  (v8.85). You'll see the new icon automatically when you reinstall the
  app at its new address in Step 3 — no separate icon step needed.
- Checkout is still **Stripe TEST mode** — nobody can be charged yet.

What's left before the $150 ads test: the **video shoot** (Step 5),
then Stripe go-live and ads. (Steps 3 + 4 — domain, Google, email,
sign-in test — all done 5 Sep.)

---

## ✅ STEP 1 — Phone-check — **DONE (1 Sep)**
## ✅ STEP 2 — Buy wordstick.app — **DONE (2 Sep)**

---

## 🟢 STEP 3 — THE BIG SITTING (~60 min, at the computer, with Claude)

One unhurried session. Your hands on the dashboards, Claude prepping and
verifying each move. **All keys/secrets go into `isshin-keys.txt`, never
into chat.**

### ✅ 3a. Point the domain — **DONE (2 Sep)** — all 3 records in Cloudflare
### ✅ 3b. The domain move — **DONE (2 Sep)** — Claude shipped + verified it
**https://app.wordstick.app** is the app (v8.86, full live test PASS);
**https://wordstick.app** is the sales page; the old github.io address
redirects automatically; Stripe return addresses updated on the server.

**Your one action left from this step:** on the phone, open
**https://app.wordstick.app** → **sign in** (progress comes back via
account sync) → Chrome ⋮ → **Add to Home screen** → remove the old
icon. Fresh install, new Sticker W icon.

### ✅ 3c. Tell Supabase the new addresses — **DONE (5 Sep)**
Dashboard: **https://supabase.com/dashboard/project/hslibrbdovrzhaxhtevr**
*(If it says PAUSED, click Restore and wait ~2 min.)*
1. **Authentication → URL Configuration**.
2. **Site URL:** `https://app.wordstick.app/index.html`
3. Under **Redirect URLs**, add all three:
   - `https://app.wordstick.app/index.html`
   - `https://app.wordstick.app/`
   - `http://localhost:8765/index.html`  *(lets Claude test sign-in locally)*
4. Save.

### ✅ 3d. Switch on "Continue with Google" — **DONE (5 Sep)**
Consent screen created (project `wordstick-507606`), OAuth client
`wordstick-web` created with the Supabase callback URI, ID + secret saved
to `isshin-keys.txt`, and the Google provider is **Enabled** in Supabase.
Branding also has home page `https://wordstick.app` + both authorized
domains, and your Gmail is a **test user**, so YOUR Google sign-in works
right now.
**⏳ One leftover click:** Google's "Publish app" button (Audience page)
was greyed out by a console lag ("configuration incomplete" even though
it isn't). Until it's clicked, ONLY you can use Google sign-in —
customers can't. Retry it next sitting (usually un-greys within
minutes–hours); everything else about 3d is done.
*(5 Sep, second sitting: still greyed — Claude also declared the 3 basic
sign-in scopes on the Data Access page so the config is now maximally
complete; just waiting on Google to catch up.)*
*(5 Sep, third check after Step 4: STILL greyed even after a forced
re-save of Branding. Google's own Project Checkup and Verification
Center both say nothing is wrong — it's their console bug. If it's
still stuck in 2–3 days, the next lever is adding privacy-policy +
terms links to Branding — pages we need anyway for Stripe go-live and
Facebook ads, so Claude will build them regardless.)*
Original steps kept below for reference:
First get a Google "OAuth client" (the ID card that lets your app use
Google sign-in):
1. **https://console.cloud.google.com** (your normal Google account).
2. Top bar project picker → **New project** → name `wordstick` → Create →
   make sure it's selected.
3. Search bar: **"OAuth consent screen"** (may appear as *Google Auth
   Platform → Branding*). App name: `WordStick` · support email: your
   Gmail · audience/user type: **External**. Save through the steps
   (scopes: skip, defaults are fine). If there's a **Publish app**
   button, click it.
4. **Credentials** (or *Clients*) → **Create credentials → OAuth client
   ID** → type **Web application** → name `wordstick-web`.
5. Under **Authorized redirect URIs** add exactly:
   `https://hslibrbdovrzhaxhtevr.supabase.co/auth/v1/callback`
6. Create → copy **Client ID** and **Client secret** into
   `isshin-keys.txt` as `google oauth client id: ...` /
   `google oauth client secret: ...`.
7. Supabase → **Authentication → Sign In / Providers** → **Google** →
   Enable → paste both → Save.

### ✅ 3e. Hook up Resend for sign-in emails — **DONE (5 Sep)**
You signed up + authorized Cloudflare; Claude drove the rest and
verified every step: domain `wordstick.app` **Verified** on Resend
(DNS auto-added via Cloudflare, ~4 min), API key `wordstick-supabase`
(Sending access) saved to `isshin-keys.txt`, Supabase custom SMTP
enabled (hello@wordstick.app / WordStick / smtp.resend.com:465 /
user `resend`), and the email rate limit raised to **60/hour**
(reload-verified). Sign-in emails now come from your own domain —
ads-ready volume. **Step 3 is complete** apart from the Google
"Publish app" console-lag click in 3d above.

---

## ✅ STEP 4 — One real sign-in test — **DONE (5 Sep)**

All three checks passed: the reset email arrived in under a minute
**from "WordStick <hello@wordstick.app>"** (your own domain — the
whole Resend chain works), email+password sign-in landed inside the
app, and **Continue with Google** worked too.
*One cosmetic note:* the Google popup showed the backend's address
(`hslibrbdovrzhaxhtevr.supabase.co`) instead of "WordStick" — that's
normal while the Google app is unpublished; the pending "Publish app"
click in 3d improves the branding shown.

---

## 🟢 STEP 5 — The video shoot (~20 min on the phone, after Step 3)

**Decided 2 Sep: real phone screen recording** — one shoot, two cuts
(15–30s Facebook ad + 30–60s "how it works" for the sales page). Shoot
AFTER the domain move so the new icon appears in the opening shot.

**Setup (2 min):** Do Not Disturb ON · brightness up · media volume up ·
pull down Quick Settings → **Screen record** → when it asks, pick
**"Device audio"** (so the app's voice is in the recording) · portrait.

**Take 1 — the drill (~3 min, record twice):**
1. Phone home screen → tap the **WordStick icon** (hold on it 2 seconds
   before tapping — this is the ad's opening shot).
2. Home → tap into your current topic → drill **8–10 steps** naturally:
   word plays → you answer out loud → reveal → next. Don't perform —
   real pace is the point. Mistakes are fine (honest = good ad).
3. Finish the round → tap the 😬🙂💪 check-in → land back on Home so the
   "words that stick" count is on screen.

**Take 2 — the tour (~1 min, record once):**
Slow, calm swipes: Home top to bottom → tap the headline to open the
road screen → scroll it → back to Home. No tapping into menus.

**Take 3 — the front door (~30s, record once):**
Incognito tab → **app.wordstick.app** → let the welcome screen sit for
5 seconds → tap Sign up free → stop recording before typing anything.

**Take 4 — Sentences (~1 min, record once) — NEW, added 3 Sep:**
Home → tap **Sentences** → answer ONE Fill-the-gap question at your
natural pace → back → build ONE Make-a-sentence (tap the chips into
order until it checks green) → stop. It's in the video because
Sentences ships in v1.

**The full script is ready** — both cuts, every caption, timed:
`docs/video-script-2026-09-03.md`. You just record the 4 takes.

**Then:** copy the video files into
`Documents\GitHub\japanese-trainer\video_raw\` (Claude keeps this folder
out of the public code) and tell Claude — Claude plans both cuts and the
captions from your real footage.

---

## 😵 STUCK? Been away for days or weeks? This is the whole recovery move:

> Open Claude Code in this folder and type:
> **"Read DO_THIS_NEXT.md and tell me the one next step."**
>
> 30 seconds. Claude re-reads everything and gives you ONE small action.

---

## 🗺️ THE JOURNEY

- [x] Market research — "AI friend, zero judgment" validated; $8.99/mo is right
- [x] Phase 0–1 — focused app + own backend live (30 Jul)
- [x] Core-loop polish — Home/road/Studio, onboarding, drill card, batch progression, storage hardening (v8.50–8.67)
- [x] **Sign-in + trial paywall LIVE** (v8.70–8.73, 24 Aug)
- [x] App-standard entry + free plan (v8.74–8.79, 27 Aug)
- [x] Account sync (v8.80, 28 Aug) — progress follows the account
- [x] Conversion polish + phone-check (v8.81, 1 Sep)
- [x] **Rename to WordStick** (v8.82) · **domain bought** · **Sticker W icon** (v8.85) — 2 Sep
- [x] **Step 3, the big sitting** (domain → Google → email) — 5 Sep (one Google "Publish app" click pending console lag)
- [x] **Step 4, the sign-in test** — 5 Sep: email from own domain ✓, both sign-ins ✓
- [ ] **← YOU ARE HERE: the video shoot** (script + captions ready: `docs/video-script-2026-09-03.md`)
- [ ] Stripe go-live (live products/prices/webhook + account activation)
- [ ] **$150 Facebook ads test** (US$10/day × 14) — the anchor's finish line
- Benched until subscribers exist: AI conversation relaunch + avatar (the big update)

Details: `INDEX_ROADMAP.md` · `docs/delve-cycles/` · `docs/decisions/`. You
never need to read them — Claude does.
