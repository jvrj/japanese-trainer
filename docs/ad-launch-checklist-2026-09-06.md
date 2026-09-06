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
- [ ] **[CLAUDE]** Terms of Service + refund policy page on wordstick.app (`landing/terms.html`)
- [x] Privacy policy page (`landing/privacy.html` — exists; refresh footer links)
- [x] **[CLAUDE]** Rewrite the sales page with copy bank §G — DONE 6 Sep (`d1e56e3`):
      full diagnose→solve→prescribe structure, all compliance violations removed
      (no outcome+timeframe, no stale early-access framing, no competitor named),
      CTAs repointed github.io → app.wordstick.app, video slot above the fold
      (placeholder until Cut B), price as filter, 10/10 headless render probe.
- [x] **[CLAUDE]** Footer links on landing (privacy/terms/contact) — done in the
      rewrite. Contact stays gmail until hello@ can receive (Cloudflare sitting).
- [ ] **[BOTH]** Inbound email: hello@wordstick.app must RECEIVE mail (Resend is send-only).
      Cloudflare Email Routing → Gmail, ~5 min. Required as the support contact for
      Stripe + Facebook + the app's own users.
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

## D. Meta setup (BOTH — one sitting ~40 min, click-by-click from Claude)
- [ ] **[YOU]** Create the WordStick Facebook Page (personal profile → Pages → Create).
- [ ] **[YOU]** Meta Business portfolio + ad account + add your payment method (only you).
- [ ] **[YOU]** Create the Meta Pixel (dataset) in Events Manager; ID → isshin-keys.txt.
- [ ] **[CLAUDE]** Install the pixel on landing + app; fire `StartTrial` on real trial start
      (the optimization event — we optimize for trial-start, NEVER traffic, §7).
- [ ] **[BOTH]** Verify wordstick.app in Meta (DNS TXT in Cloudflare — Claude drives).
- [ ] **[YOU]** Warm the page (§11): post 2–3 organic posts over the days before launch
      (Claude writes them from the copy bank), profile pic = Sticker W, cover, About filled.
- [ ] **[CLAUDE]** Pixel test: confirm PageView + StartTrial events arrive in Events Manager.

## E. Free measurement plumbing (§12 — before the first ad, all $0)
- [ ] **[YOU]** Create GA4 property + GTM container (Google account clicks — Claude gives
      the exact path).
- [ ] **[CLAUDE]** GTM + GA4 tags on landing + app; scroll-depth tracking on the sales page;
      trial-start conversion event mirrored into GA4.
- [ ] **[YOU]** Create a Google Ads account, link it to GA4, leave it DORMANT ($0) — the
      FB-visitor audience starts accruing for later retargeting from day one.

## F. Ad assets + compliance pre-flight (CLAUDE, you approve)
- [ ] **[CLAUDE]** Pick 3–5 primary texts from the copy bank (mix of A/C/D voices —
      1st vs 3rd person A/B per Loren) + 1–2 headlines; assemble the dynamic-creative set.
- [ ] **[CLAUDE]** Compliance audit of every chosen variant + the final page (§11: no
      outcome+deadline, personal-attributes rules, softeners, no brand disparagement —
      the "green owl" line ships only if it survives this audit).
- [ ] **[CLAUDE]** One-page launch card: campaign recipe (1 campaign / ABO / 1 ad set /
      broad / dynamic creative / exclude warm / $40–50/day, start after midnight) + the
      judge thresholds (link CTR ≥1%, CTR-all ≈2.5–3× link, judge on CPC ranking,
      ~1500 impressions per variant) + the kill rules.
- [ ] **[YOU]** Final read + go/no-go on the launch card.

## G. Launch-day gates (all must be green before the campaign goes live)
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
