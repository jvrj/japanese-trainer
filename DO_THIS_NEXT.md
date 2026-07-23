# Isshin → Product · DO THIS NEXT
*The ONE file that always knows the next step. If it looks stale, tell Claude: "refresh DO_THIS_NEXT.md".*
*Last updated: **2026-07-24***

---

## 😵 STUCK? Been away for days or weeks? This is the whole recovery move:

> Open Claude Code in this folder and type:
> **"Read DO_THIS_NEXT.md and tell me the one next step."**
>
> 30 seconds. Claude re-reads everything, tells you where things stand, gives you ONE small action. You never need to remember anything — that sentence is the system. (This is exactly what fixed the July stall.)

---

## 🆕 WHILE YOU WERE AWAY (21 Jul afternoon) — Claude's autonomous sprint

- **v8.34 shipped:** every one of the 14 conversation topics now has its own scripted
  practice conversation (free tier) — before, every topic played the same 5 generic questions.
- **Landing page is live** for your future Facebook ads: https://jvrj.github.io/japanese-trainer/landing/
  (+ a real privacy policy behind it — both needed for store submission anyway).
- **Backend trial logic built + tested:** the 7-day-free-trial gate you decided on is coded
  and unit-tested (10/10), sitting ready in `backend/` — it goes live the moment you do the
  "keys ready" accounts step below.
- **Praktika deep-dive research DONE** — the closest competitor is proof your idea works at
  scale ($35.5M raised, ~$2M/month revenue, same "no judgment" pitch). Its verified weaknesses
  (no spaced repetition, words never come back, forced avatar, progress resets) are exactly
  what Isshin already does right. Full report: `reports/hydra-research/2026-07-21/REPORT.md`.
- **Delve 9 RAN and is decided (24 Jul):** the design investigation on first-run flow,
  sign-in screens, and the day-7 trial moment is done — every screen is now specced
  (sign-in first → your scripted first conversation → day-7 offer with zero pressure
  tactics), the trial clock now starts at a customer's FIRST live conversation (fairer),
  and a security review caught + scheduled fixes for real holes in the backend before any
  customer touches it. 5 decision records await your yes/no in `docs/decisions-pending/`
  (ADR-014..018) — Claude will walk you through them in ~10 min when you're ready.

## 🆕 22 Jul (later) — v8.36: your two field reports are FIXED

You reported: no teal answer card, and no recap when backing out. Both were real
bugs, both reproduced in a headless browser before fixing:

1. **Teal card** — your phone's speech-to-text writes the word you ask about in
   *kanji* (元気って何), but the app's dictionary is all kana, so the lookup
   missed every single time. The app now carries a kanji→kana reading table for
   ~230 common words. Ask 「〜って なに？」 again — the teal card should pop.
2. **Back-button recap** — two bugs: restarting/resuming conversations stacked
   duplicate history entries (so one back press did *nothing*), and backing out
   while the AI was still thinking skipped the recap entirely. Both fixed — one
   back press after 3+ turns now always shows your recap.

**Re-test:** close + reopen the app twice → Settings should show **v8.36** →
one conversation: ask 「〜って なに？」 about a word the AI used (teal card),
then after 3+ turns press BACK (recap). Tell Claude what you see.

## 🆕 22 Jul — v8.35: your full ~1,700-word deck is BACK in the practice area

You asked why practice showed 80 words instead of ~1,800. That was the "Vocab focus
lock" (a 19 Jul design decision) doing its thing — it kept drills to words you'd met
plus the next 80. Your verdict overruled it: **the lock is now OFF by default and the
whole deck is open again.** Nothing was lost — it was hidden, never deleted. If you
ever want the focused mode back, it's the "Vocab focus lock" switch in Settings.
Close + reopen the app twice → Settings should show **v8.35**.

## 🟢 RIGHT NOW — TEST v8.33/v8.34 changes (meaning questions now answered BY THE APP)

Your field report: mic patience ✅ fixed · 「〜って なに？」 ❌ still ignored. Root cause found — the instruction to the AI was getting buried, and the AI ignores polite instructions anyway. **v8.33 stops trusting the AI:**

- Ask 「Xって なに？」 and **the app itself looks the word up** in its own dictionary and instantly shows a **teal answer card** — the word, romaji, English meaning, and a nuance note. It appears *while the AI is still thinking*, so it can never be ignored.
- The AI is also handed the exact answer so its spoken reply agrees with the card.
- Detection got wider: it now catches how your phone's speech-to-text actually writes it (て何, kanji forms) and even English "what does X mean".

**Setup:** phone → open the app → close + reopen twice → Settings should show **v8.33**.

**Do:** one conversation.
1. Ask 「〜って なに？」 about a word the AI used → the teal card should pop up straight away.
2. **The recap test you haven't done yet:** after at least 3 back-and-forth turns, press the BACK button mid-conversation → your recap should appear before you leave.

**Then tell Claude:** did the teal answer card appear? Did the recap show on back-out? Anything else still off.

## 📋 STILL WAITING ON YOU (≈15–20 min at the computer, unblocks Phase 1 backend)

*(Note: the Anthropic key already pasted in the app's Settings is your PERSONAL one — it powers your open AI chat today. The keys below are SEPARATE ones just for the app's future server, so customer costs never touch your personal key.)*

First, make a **private keys file** if you don't have one: open Notepad, save an empty file as `isshin-keys.txt` somewhere private (e.g. Documents). Everything below gets pasted into THAT file — never into chat.

### 1. Supabase (~7 min) — the app's future account/paywall server
1. Go to **https://supabase.com** → **Start your project** → sign in with your Google account.
2. It may ask you to create an "organization" — accept the defaults, Free plan.
3. Click **New project**. Name: `isshin`. Database password: click **Generate a password** → copy it into your keys file as `supabase db password: ...`. Region: pick **Sydney** (closest to you). Click **Create new project** and wait ~2 min while it spins up.
4. In the left sidebar: gear icon (**Project Settings**) → **API**.
5. Copy **Project URL** into your keys file as `supabase url: ...`
6. On the same page, under **Project API keys**, reveal the **`service_role`** key (NOT the `anon` one) → copy it as `supabase service_role: ...`
7. Done. Tell Claude **"Supabase ready"**.

### 2. Dedicated OpenAI key (~4 min)
1. Go to **https://platform.openai.com/api-keys** → sign in.
2. **Create new secret key** → name it `isshin-backend` → Create → copy the `sk-...` key into your keys file (it's shown ONCE).
3. Then go to **Settings → Limits** (or "Budgets") and set a **monthly budget of $20** so a bug can never run up a big bill.

### 3. Dedicated Anthropic key (~4 min)
1. Go to **https://console.anthropic.com** → sign in → **API keys**.
2. **Create key** → name `isshin-backend` → copy into your keys file.
3. In **Settings/Limits**, set a monthly **spend limit ~$20**.
   *(This is a second key — leave the one already in your phone's app Settings alone.)*

### 4. Apple Developer ($99/yr — background only; it gates ONLY the iPhone version)
*(Decided 24 Jul, Delve 9: Apple sign-in isn't needed until the actual iPhone
App Store build — months away. So this step stays background; nothing waits on it.)*
1. **https://developer.apple.com/programs/enroll** → sign in with (or create) an Apple ID → enrol as an **Individual** → pay $99.
2. Once approved (can take days), apply for the **Small Business Program** (Apple takes 15% instead of 30%): search "App Store Small Business Program apply".
3. This one can run in the background — steps 1–3 above are what actually unblock Claude.

### 5. Google sign-in switch (LATER — Claude will ask when it's time, ~10 min)
The sign-in screens were designed on 24 Jul (Delve 9): customers will tap
**"Continue with Google"** as the very first screen. Before that version can go
live you'll need to (Claude will walk you through it step by step when the
backend is running): in Supabase → **Authentication → Providers → enable
Google** (needs a small Google-Cloud "OAuth client" created on your Google
account), and set the app's address
`https://jvrj.github.io/japanese-trainer/` as the **Site URL**. Not needed for
the "keys ready" step below — just know it's coming.

When 1–3 are in your keys file, tell Claude: **"keys ready"** → the backend build starts.

## ⏭️ AFTER YOUR FIELD REPORT

- **Claude tunes/dials-back the sensei** if anything felt off (the design has three pre-built dial-back levers) → then builds **S3: the vocab lock you chose** (rolling frontier of 80 — decided 19 Jul, ADR-012) + S4 recap close.
- **Phase 1 backend** starts once your accounts above exist.

## 🗺️ THE JOURNEY

- [x] Market research — "AI friend, zero judgment" validated; **Japanese-first is unowned space**; $8.99/mo is right
- [x] **Phase 0 — One focused, conversation-first app** — shipped (v8.08–v8.11 + talk-loop depth v8.24)
- [x] **Feedback soul** — patient mic, feedback layer, honest modes, modules, anti-robotic (v8.16–v8.20)
- [x] **Sensei layer S1+S2** — teach card + spoken breath (v8.26, 19 Jul) ← **testing NOW (you!)**
- [ ] Sensei S3+S4 — vocab frontier lock (80) + recap close *(gated on your field report)*
- [ ] Phase 1 — Backend live, YOUR phone switches to the app's own server first (your personal key comes off the phone; everyone else unchanged for now) *(half-built in `backend/`; needs your accounts above; staged plan decided 24 Jul, Delve 9)*
- [ ] Phase 1.5 — Sign-in + free-trial switch-on: customers sign in with Google, get 7 free days of live talk (clock starts at their FIRST conversation, not signup), and the paste-your-API-key cards disappear for good *(screens fully designed 24 Jul, Delve 9)*
- [ ] Phase 2 — World-class polish *(first sweep shipped v8.25: style guide, store copy, 320px)*
- [ ] Phase 3 — iPhone mic test in the native wrapper (gates the whole store plan)
- [ ] Phase 4 — Native apps + subscriptions (RevenueCat, $8.99/mo, free trial)
- [ ] Phase 5 — Store submission → **you run ads**

Details: `INDEX_ROADMAP.md` (plan) · `docs/delve-cycles/` (designs) · `docs/decisions/` (locked choices). You never need to read them — Claude does.

## 🎯 YOUR ACTUAL JOB (it's small)

The hydras build; you steer:
1. **Decide** — read short summaries, say yes/no (~10 min when asked)
2. **Test on phone** — try what shipped, say what feels wrong (~10 min when asked) ← **you are here**
3. **Later: market** — ads + willingness-to-pay testing (your declared department)

## ❓ OPEN (no rush)

- ~~ADR-003 vocab lock question~~ — **DECIDED 19 Jul**: rolling-frontier hard lock, 80-word window (ADR-012). Builds after your field report.
- **STT check:** during the field session, Settings → Voice recognition card → tell Claude what "Last voice attempt" says (feeds the mic-reliability track).
