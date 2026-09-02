# WordStick (was Isshin) · DO THIS NEXT
*The ONE file that always knows the next step. If it looks stale, tell Claude: "refresh DO_THIS_NEXT.md".*
*Last updated: **2026-09-02***

> **2 Sep:** the app's new name is **WordStick** (~60 names checked; "Recall",
> "PeraPera" and Japanese words all taken or already competitor brands).
> Buy **wordstick.app** in Step 2. Claude renames everything in-app after.

---

## 🎉 Where things stand (27 Aug)

The **sign-in + paywall is LIVE** and now fully app-standard:
- **v8.74–8.78** — sign up free (no card) → straight in for a free week;
  welcome screen with real Sign up / Sign in buttons, email + password,
  "Forgot your password?" — all live-tested end to end.
- **v8.79** — day 8 is no longer a wall. After the free week the
  account drops to the **free plan**: unlimited reviewing of the words you
  already unlocked, plus **3 new words a day**. Home shows a quiet
  "Unlock" banner; the plan picker ($8.99/mo · **$59.99/yr listed first**)
  appears once at the transition and stays one tap away. Research behind
  this: `reports/hydra-research/2026-08-27-gating-model/REPORT.md`.
- **v8.80 (new)** — **your account remembers you.** Progress, settings and
  onboarding answers now back up to the account and come back on sign-in,
  so a new phone / reinstall / incognito sign-in lands straight in the
  app with everything in place — the intro runs once per ACCOUNT, not
  once per device. Two devices merge (the one with more drilling wins per
  word), and a different account on the same device gets a clean start.

**Your own account (juliuspireh@gmail.com) is allow-listed — sign in
anywhere and you're in, never asked to pay.** Everything machine-testable
is green on the live site.

Decisions you locked today: phone-check first · setup via this checklist ·
Resend for sign-in emails · **buy a cheap domain** · no free taste-demo in v1.

What's left before the $150 ads test is mostly **your hands** (accounts +
dashboard switches Claude can't touch), then the video re-shoot.

---

## ✅ STEP 1 — Phone-check — **DONE (1 Sep)** — v8.81 checked on the Pixel, all good

You haven't seen v8.64 → 8.73 on a real phone. Open the app:

1. Settings → **Get latest** → close + reopen twice → version shows **8.81**.
2. You'll see a one-time toast about the **music fix** (mic permission no
   longer switches voice on by itself).
3. Walk these and note anything that feels off:
   - **Home** — new look: "Words that stick" bar + Studio layout.
   - **The road screen** (tap the headline) — your path of topics.
   - **A drill** — new card design: X to exit, slim progress bar, step
     counter, circular controls, gradient Reveal/Next button.
   - **Settings** — now a short, clean customer page. Your owner controls
     moved behind **7 taps on the version number** at the bottom.
4. **See the customer's view once:** open a **private/incognito tab** in
   Chrome → `jvrj.github.io/japanese-trainer/` → you should hit the
   **welcome screen** (Sign up free / Sign in / Google) — and after
   signing in, land **straight in the app** (free week, no plan picker).
   Your own email gets you in permanently, no trial clock.

Tell Claude what you find. Anything broken gets fixed before the video.

---

## 🟢 STEP 2 — Buy the domain (~10 min, at the computer)

Why: sign-in emails need a domain you own (Resend can't send from
github.io), and your Facebook ads will look legitimate pointing at a real
address. ~US$10–14/year — the only unavoidable running cost so far.

1. Go to **https://www.cloudflare.com** → create a free account (Google
   sign-in is fine).
2. In the left sidebar: **Domain Registration → Register Domains**.
3. Search **`wordstick.app`** — the locked name (verified free 2 Sep;
   ~US$14/yr). If it somehow shows taken/premium, STOP and tell Claude.
4. Buy it (Cloudflare sells at cost, auto-renew on). Skip every upsell —
   no email add-ons (Resend handles email in Step 3d).
5. Write `domain: wordstick.app` in your keys file (`isshin-keys.txt`)
   and tell Claude — the rename pass + ads/landing plan use it.

---

## 🟢 STEP 3 — Supabase + Google + email sender (~25 min, at the computer)

Everything below happens in dashboards only Claude can't log into. Exact
clicks; menu names may drift slightly — if something's missing, tell Claude.
**All keys/secrets go into `isshin-keys.txt`, never into chat.**

Your Supabase dashboard: **https://supabase.com/dashboard/project/hslibrbdovrzhaxhtevr**
*(If the project says PAUSED — free tier naps after ~7 idle days — click
Restore first and wait ~2 min.)*

### 3a. Tell Supabase which addresses are allowed (2 min)
1. Left sidebar: **Authentication → URL Configuration**.
2. **Site URL:** `https://jvrj.github.io/japanese-trainer/index.html`
3. Under **Redirect URLs**, add all three:
   - `https://jvrj.github.io/japanese-trainer/index.html`
   - `https://jvrj.github.io/japanese-trainer/`
   - `http://localhost:8765/index.html`  *(lets Claude test sign-in locally)*
4. Save.

### 3b. Switch on "Continue with Google" (10 min — two dashboards)
First get a Google "OAuth client" (the ID card that lets your app use
Google sign-in):
1. Go to **https://console.cloud.google.com** (your normal Google account).
2. Top bar project picker → **New project** → name `wordstick` → Create →
   make sure it's selected.
3. Search bar: **"OAuth consent screen"** (may appear as *Google Auth
   Platform → Branding*). App name: `WordStick` · support email: your Gmail ·
   audience/user type: **External**. Save through the steps (scopes: skip,
   defaults are fine). If there's a **Publish app** button, click it.
4. Now **Credentials** (or *Clients*) → **Create credentials → OAuth client
   ID** → type **Web application** → name `wordstick-web`.
5. Under **Authorized redirect URIs** add exactly:
   `https://hslibrbdovrzhaxhtevr.supabase.co/auth/v1/callback`
6. Create → copy **Client ID** and **Client secret** into `isshin-keys.txt`
   as `google oauth client id: ...` / `google oauth client secret: ...`.

Then flip the switch in Supabase:
7. Supabase → **Authentication → Sign In / Providers** → **Google** →
   Enable → paste the Client ID + Client secret → Save.

### 3c. ~~Apply the consent-checkbox database change~~ — **DONE (28 Aug)**
Claude applied this (and the account-sync guard) directly through the
Supabase management API. Nothing for you to do here anymore.

### 3d. Hook up Resend for sign-in emails (10 min — needs Step 2's domain)
Right now sign-in emails go through Supabase's built-in sender — a few per
hour, which would lock customers out the moment ads run.
1. Go to **https://resend.com** → sign up (free: 3,000 emails/month).
2. **Domains → Add domain** → enter `wordstick.app` → it shows 3–4 DNS
   records to add. Because the domain is at Cloudflare, Resend usually
   offers a **"Sign in to Cloudflare to add automatically"** button — use
   it. Otherwise copy each record into Cloudflare → your domain → **DNS**.
   Wait for Resend to show **Verified** (minutes, occasionally an hour).
3. **API Keys → Create API key** → name `wordstick-supabase`, permission
   **Sending access** → copy it into `isshin-keys.txt` as
   `resend api key: ...` (shown once).
4. Supabase → **Authentication → Emails → SMTP Settings** (older layout:
   Project Settings → Authentication) → **Enable custom SMTP**:
   - Sender email: `hello@wordstick.app` · Sender name: `WordStick`
   - Host: `smtp.resend.com` · Port: `465`
   - Username: `resend` · Password: *the Resend API key*
   - Save.
5. Same area → **Rate Limits** → raise **emails per hour** to `60`.

---

## 🟢 STEP 4 — One real sign-in test (2 min, after Step 3)

Incognito tab → `jvrj.github.io/japanese-trainer/` → you should see the
welcome screen (Sign up free / Sign in / Google).
1. **Set your password once:** Sign in → **Forgot your password?** → your
   email → open the link → set a password. (Your account was created
   before passwords existed, so it doesn't have one yet.)
2. Then sign in with email + password → you land **inside the app**
   (your account = always unlocked; a stranger gets a free week, then
   drops to the free plan — 3 new words/day — with the plan picker one
   tap away).
3. Try **Continue with Google** too (needs Step 3b done first).
4. Tell Claude the results. (Checkout is still Stripe TEST mode — nobody
   can be charged yet. Going live is a later step.)

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
- [x] Core-loop polish — Home/road/Studio, onboarding funnel, new drill card, batch progression, storage hardening (v8.50–8.67)
- [x] **Sign-in + trial paywall LIVE** (v8.70–8.73, 24 Aug)
- [x] **App-standard entry + free plan** (v8.74–8.79, 27 Aug) — password auth, free week, day-8 = 3-new-words free tier
- [x] **Account sync** (v8.80, 28 Aug) — progress follows the account; onboarding once per account, not per device
- [x] **Conversion polish** (v8.81, 28 Aug) — one day-5/6 upgrade nudge after a good drill; checkout now charges immediately (no second Stripe free week)
- [ ] **← YOU ARE HERE: phone-check + the setup checklist above**
- [ ] Ad video re-shoot on the new UI (capture profile ready)
- [ ] Stripe go-live (live products/prices/webhook + account activation)
- [ ] **$150 Facebook ads test** (US$10/day × 14) — the anchor's finish line
- Benched until subscribers exist: AI conversation relaunch + avatar (the big update)

Details: `INDEX_ROADMAP.md` · `docs/delve-cycles/` · `docs/decisions/`. You
never need to read them — Claude does.
