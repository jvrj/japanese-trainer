# WordStick · DO THIS NEXT
*The ONE file that always knows the next step. If it looks stale, tell Claude: "refresh DO_THIS_NEXT.md".*
*Last updated: **2026-09-02***

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

What's left before the $150 ads test: **one sitting at the computer**
(Step 3), a **2-min test** (Step 4), the **video shoot** (Step 5), then
Stripe go-live and ads.

---

## ✅ STEP 1 — Phone-check — **DONE (1 Sep)**
## ✅ STEP 2 — Buy wordstick.app — **DONE (2 Sep)**

---

## 🟢 STEP 3 — THE BIG SITTING (~60 min, at the computer, with Claude)

One unhurried session. Your hands on the dashboards, Claude prepping and
verifying each move. **All keys/secrets go into `isshin-keys.txt`, never
into chat.**

### 3a. Point the domain (you: ~5 min in Cloudflare)
1. **https://dash.cloudflare.com** → click **wordstick.app** → left
   sidebar **DNS → Records**.
2. Add THREE records — for each one, set **Proxy status to "DNS only"**
   (click the orange cloud so it turns **grey** — important, GitHub needs
   to see the domain directly to issue its security certificate):
   - Type **CNAME** · Name **`@`** · Target **`jvrj.github.io`**
   - Type **CNAME** · Name **`www`** · Target **`jvrj.github.io`**
   - Type **CNAME** · Name **`app`** · Target **`jvrj.github.io`**
3. Tell Claude **"DNS is in."**

### 3b. Claude does the move (you: nothing — ~30 min of Claude work)
Claude then: creates the small second repo for the sales page, points
**wordstick.app** at it and **app.wordstick.app** at the app, updates
every address inside the code (links, share images, Stripe return
addresses), ships, and live-verifies both sites.

Then your one action: on the phone, open **https://app.wordstick.app** →
**sign in** (progress comes back via account sync) → Chrome ⋮ → **Add to
Home screen** → remove the old icon. Fresh install, new Sticker W icon.

### 3c. Tell Supabase the new addresses (you: 2 min)
Dashboard: **https://supabase.com/dashboard/project/hslibrbdovrzhaxhtevr**
*(If it says PAUSED, click Restore and wait ~2 min.)*
1. **Authentication → URL Configuration**.
2. **Site URL:** `https://app.wordstick.app/index.html`
3. Under **Redirect URLs**, add all three:
   - `https://app.wordstick.app/index.html`
   - `https://app.wordstick.app/`
   - `http://localhost:8765/index.html`  *(lets Claude test sign-in locally)*
4. Save.

### 3d. Switch on "Continue with Google" (you: ~10 min, two dashboards)
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

### 3e. Hook up Resend for sign-in emails (you: ~10 min)
Right now sign-in emails go through Supabase's built-in sender — a few
per hour, which would lock customers out the moment ads run.
1. **https://resend.com** → sign up (free: 3,000 emails/month).
2. **Domains → Add domain** → `wordstick.app` → it shows 3–4 DNS records.
   Resend usually offers **"Sign in to Cloudflare to add automatically"**
   — use it. Otherwise copy each record into Cloudflare → DNS. Wait for
   **Verified** (minutes, occasionally an hour).
3. **API Keys → Create API key** → name `wordstick-supabase`, permission
   **Sending access** → copy into `isshin-keys.txt` as
   `resend api key: ...` (shown once).
4. Supabase → **Authentication → Emails → SMTP Settings** →
   **Enable custom SMTP**:
   - Sender email: `hello@wordstick.app` · Sender name: `WordStick`
   - Host: `smtp.resend.com` · Port: `465`
   - Username: `resend` · Password: *the Resend API key*
   - Save.
5. Same area → **Rate Limits** → raise **emails per hour** to `60`.

---

## 🟢 STEP 4 — One real sign-in test (2 min, after Step 3)

Incognito tab → **https://app.wordstick.app** → welcome screen.
1. **Set your password once:** Sign in → **Forgot your password?** →
   your email → open the link → set a password.
2. Sign in with email + password → you land inside the app.
3. Try **Continue with Google** too.
4. Tell Claude the results.

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
- [ ] **← YOU ARE HERE: Step 3, the big sitting** (domain → Google → email)
- [ ] Video shoot (shot list ready above)
- [ ] Stripe go-live (live products/prices/webhook + account activation)
- [ ] **$150 Facebook ads test** (US$10/day × 14) — the anchor's finish line
- Benched until subscribers exist: AI conversation relaunch + avatar (the big update)

Details: `INDEX_ROADMAP.md` · `docs/delve-cycles/` · `docs/decisions/`. You
never need to read them — Claude does.
