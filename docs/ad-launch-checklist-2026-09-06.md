# Pre-Ad Launch Checklist — everything before the first $1 of ads
*Created 6 Sep 2026. Sources: ads-playbook-2026-09-06.md (Parts 1+2), ad-copy-bank-2026-09-06.md,
DO_THIS_NEXT.md. Split: **[YOU]** = Julius at a dashboard/phone (Claude preps + gives click-by-click),
**[CLAUDE]** = I build it, **[BOTH]** = a sitting together.*

## Critical path (the two long poles)
```
YOU: video shoot ──────────────┐
                               ├─→ CLAUDE: ad cut + landing cut → final page → COMPLIANCE PASS → launch
BOTH: Stripe go-live ──────────┘
Everything else (pages, pixel, GA4, FB warm-up) slots in around these two.
```

---

## A. Site & legal pages (unblocks Stripe, Facebook, AND the stuck Google button)
- [x] **[CLAUDE]** Terms of Service + refund policy page on wordstick.app (`landing/terms.html`,
      commit 32ad077; deployed to the apex 6 Sep — see the repo-split note below)
- ⚠️ **NOTE (6 Sep): wordstick.app is served from the SEPARATE `wordstick-landing` repo**
      (moved 2 Sep, commit e1e175b there). `japanese-trainer/landing/` is the WORKING COPY;
      every landing edit must be synced across (icon paths `../icon-192.png` → `icon-192.png`)
      and pushed in `wordstick-landing` or the apex keeps serving the old page. The 6 Sep
      rewrite was synced in `wordstick-landing@f029e37`.
- [x] Privacy policy page (`landing/privacy.html` — exists; refresh footer links)
- [x] **[CLAUDE]** Rewrite the sales page with copy bank §G — DONE 6 Sep (`d1e56e3`):
      full diagnose→solve→prescribe structure, all compliance violations removed
      (no outcome+timeframe, no stale early-access framing, no competitor named),
      CTAs repointed github.io → app.wordstick.app, video slot above the fold
      (placeholder until Cut B), price as filter, 10/10 headless render probe.
- [x] **[CLAUDE]** Footer links on landing (privacy/terms/contact) — done in the
      rewrite. Contact stays gmail until hello@ can receive (Cloudflare sitting).
- [x] **[BOTH]** Inbound email DONE 7 Sep: hello@wordstick.app → juliuspireh@gmail.com
      via Cloudflare Email Routing (rule Active, DNS records added). Next: swap the
      landing/app contact links from gmail to hello@ once a test mail arrives.
- [ ] **[YOU]** Retry Google "Publish app" (wordstick-507606) AFTER the terms/privacy links
      are added to the OAuth Branding page — that's the documented next lever for the
      greyed button.

## B. Stripe go-live — ✅ COMPLETE 6 Sep, full live E2E green
- [x] **[YOU]** Account activated (real account, not sandbox; statement descriptor
      WORDSTICK.APP; Radar Lite). 6 Sep.
- [x] **[CLAUDE]** Live product **WordStick** + prices (lookup keys `wordstick_monthly`
      $8.99 / `wordstick_yearly` $59.99 USD), live webhook `we_1UCWDVIFl6LDy9NQAR0XvfK4`,
      all four server secrets swapped to live. IDs + secret in isshin-keys.txt.
- [x] **[YOU]** REAL live purchase test (juliuswipe test acct): paid $8.99 → webhook wrote
      entitlement in 7 s → refund succeeded → dashboard cancel → deletion webhook re-locked
      the row automatically. Receipt email received. The whole money chain is proven.
- [ ] **[YOU]** Cosmetic: Settings → Business details → Public business name → "WordStick"
      (shows on receipt emails; currently still Isshin).
- [x] **[CLAUDE]** 🐛 **LAUNCH BUG fixed — v8.92, 6 Sep (`be07d98`):** the paywall heal
      probe now bounces only PAYING users home; a mid-trial user stays and can buy.
      Reason-aware paywall copy + a "Plans" row in Settings → Account for trial/free
      users. Owner decision same day: keep the v8.79 free plan exactly as-is (3 new
      words/day drip — "the carrot is the point"), no category model.
- [x] **[CLAUDE]** Headless verify — 13/13 against the LIVE URL (trial stays + buy
      buttons enabled, paid bounces, free keeps picker, Plans row per tier) +
      independent code review clean (2 LOW self-healing cosmetics, noted in review).

## C. The video (the ad IS this)
- [x] **[YOU]** Footage shot 6 Sep — one 5-min take, credential-chopped → `video_raw/clean.mp4`
      (4:38, 30fps CFR); front-door capture done by Claude.
- [ ] **[CLAUDE]** Two cuts: FB ad cut (≤1:59, 4:5, hook = first 3 s, overlay lines = copy-bank
      openers, POSER proof-beat, show-the-landing-page beat) + landing "how it works" cut.
      **v1 DONE 6 Sep (`video_raw/cutA_v1.mp4`, builder `video_raw/build_cutA.py`). Owner
      review verdict: "not bad" but THREE fixes for v2: (1) voiceover must NOT talk over
      the app's own speech — sidechain-duck app audio + retime VO into gaps; (2) add big
      word-by-word speech captions synced to the narrator (edge-tts WordBoundary events
      give exact timings; Arial Black/ariblk for style); (3) more OOMPH — push-in motion
      per shot (zoompan), punchier shorter VO lines, harder text styling.**
      **v2 DONE 6 Sep — rebuilt in Remotion (`video_raw/remotion/`, output
      `video_raw/cutA_v2_final.mp4`, 21.6s, -14 LUFS): karaoke word captions, ①②③
      story kickers, phone-in-device-frame + punch-ins, synthesized music bed + SFX
      (all original → zero licensing risk), narrator retimed into gaps around the
      app's own speech, music ducked under all speech. Awaiting owner review.**
- [ ] **[YOU]** Approve the cuts (or request re-edits).

## D. Meta setup — sitting DONE 7 Sep (page, ad acct, pixel, domain, email all green)
- [x] **[YOU]** WordStick Facebook Page created 7 Sep (ID 1237334189473229; Sticker-W
      profile pic + branded cover + bio + wordstick.app; §I post 1 given to Julius with
      an unbranded "Recognizing ≠ producing" card image, `video_raw/fb_post1.png`).
- [x] **[YOU]** Business portfolio: used the EXISTING "A Grade Bathrooms" portfolio
      (aged portfolio = less new-advertiser friction). New-portfolio ad-account cap
      blocked a separate "WordStick Ads" account → decision: run from the existing ad
      account 669924825172996 (Active, MasterCard ····7570, AUD). Ad account = wallet
      only; separation that matters is page + pixel, both WordStick-owned. Create a
      dedicated ad account in a few weeks when the cap lifts (optional).
- [x] **[BOTH]** WordStick pixel/dataset created 7 Sep: **ID 1539713041242150**
      (in isshin-keys.txt), connected to the ad account, fully separate from the
      Agradebathrooms work dataset (zero data contamination either direction).
- [x] **[CLAUDE]** Pixel installed on LANDING (both repos; wordstick-landing@62fb8ef,
      live-verified on the apex). App install + `StartTrial` on real trial start = next.
- [x] **[BOTH]** wordstick.app **Verified** in Meta 7 Sep — via meta-tag in the landing
      head (same commit), not DNS TXT.
- [x] **[BOTH]** hello@wordstick.app inbound email LIVE 7 Sep: Cloudflare Email Routing
      → juliuspireh@gmail.com (rule Active, MX/SPF/DKIM records added by Cloudflare).
- [ ] **[YOU]** Warm the page (§11): §I posts 2–3 over the days before launch.
- [ ] **[CLAUDE]** Fire `StartTrial` in the app on real trial start (optimization event).
- [ ] **[CLAUDE]** Pixel test: confirm PageView + StartTrial events arrive in Events Manager.

## E. Free measurement plumbing (§12 — before the first ad, all $0)
- [ ] **[YOU]** Create GA4 property + GTM container (Google account clicks — Claude gives
      the exact path).
- [ ] **[CLAUDE]** GTM + GA4 tags on landing + app; scroll-depth tracking on the sales page;
      trial-start conversion event mirrored into GA4.
- [ ] **[YOU]** Create a Google Ads account, link it to GA4, leave it DORMANT ($0) — the
      FB-visitor audience starts accruing for later retargeting from day one.

## F. Ad assets + compliance pre-flight (CLAUDE, you approve)
- [x] **[CLAUDE]** Ad set DRAFTED 6 Sep (copy bank **§H**, `dab23ce`): 5 primary texts =
      5 distinct angles (streak-shame 2nd-p · quitter-vindication 1st-p · driver/format
      keep-frame · "it's a shame" commiseration 3rd-p · green-owl) + headlines 22/24.
      Awaiting Julius's read.
- [x] **[CLAUDE]** Compliance audit done per variant (copy bank §H-audit): all rate-claims
      only, Duolingo named only as 1st-person lived experience (H2), green owl (H5)
      watch-listed with the never-delete/whitewash procedure.
- [x] **[CLAUDE]** One-page launch card: `docs/ad-launch-card.md` (recipe, thresholds,
      kill/iterate rules, go/no-go gates).
- [ ] **[YOU]** Final read + go/no-go on the launch card.

## G. Launch-day gates (all must be green before the campaign goes live)
- [ ] **[BOTH]** App cleaning-up pass (owner 7 Sep: "right before we launch the first
      ad set") — Julius to define the list when we schedule it; nothing launches before it.
- [ ] Money chain proven live (B) · video cuts approved (C) · pixel firing (D) ·
      GA4 accruing (E) · compliance pass (F) · page loads fast on phone (Claude probes).
- [ ] **[YOU]** Publish the campaign per the launch card (your hands on the Ads Manager —
      Claude sits beside via screenshots if wanted). Never delete a rejected ad; on
      rejection, follow §11 (edit/appeal path).

## Suggested order of sittings
1. **This week, solo, 20 min: SHOOT THE VIDEO** — it gates the most downstream work.
2. Claude ships pages + landing rewrite meanwhile (A) → you click "Publish app".
3. Sitting 1: Stripe go-live (B) + inbound email (A).
4. Sitting 2: Meta + GA4/GTM/Google Ads (D+E) → warm-up posts start.
5. Claude cuts video + assembles ads + compliance (C+F) → launch card → you go live (G).
