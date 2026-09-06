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
- [ ] **[CLAUDE]** Rewrite the sales page with copy bank §G (diagnose→solve→prescribe).
      MUST remove the live compliance violations: "300 words in your first month"
      (outcome+timeframe) and "free right now in early access" (stale — paywall is live).
      Video slot above the fold (placeholder until the cut lands). Price shown as filter.
- [ ] **[CLAUDE]** Footer links (privacy/terms/support) on landing + app.
- [ ] **[BOTH]** Inbound email: hello@wordstick.app must RECEIVE mail (Resend is send-only).
      Cloudflare Email Routing → Gmail, ~5 min. Required as the support contact for
      Stripe + Facebook + the app's own users.
- [ ] **[YOU]** Retry Google "Publish app" (wordstick-507606) AFTER the terms/privacy links
      are added to the OAuth Branding page — that's the documented next lever for the
      greyed button.

## B. Stripe go-live (BOTH — one sitting ~30 min)
- [ ] **[YOU]** Activate the Stripe account: business details + bank account (only you can).
- [ ] **[CLAUDE]** Live products/prices ($8.99/mo · $59.99/yr · 7-day trial), live webhook,
      live keys onto the server (into isshin-keys.txt flow, never chat).
- [ ] **[YOU]** One real live-mode purchase with your own card → confirm entitlement unlocks →
      cancel → confirm the cancel path. The only honest test of the money chain.
- [ ] **[CLAUDE]** Headless verify of the full funnel post-switch (landing → sign-up → trial →
      plan picker) — the Playwright rule.

## C. The video (the ad IS this)
- [ ] **[YOU]** Shoot the 4 takes per `docs/video-script-2026-09-03.md` (~20 min, phone,
      Device audio ON) → drop files in `video_raw\` → tell Claude.
- [ ] **[CLAUDE]** Two cuts: FB ad cut (≤1:59, 4:5, hook = first 3 s, overlay lines = copy-bank
      openers, POSER proof-beat, show-the-landing-page beat) + landing "how it works" cut.
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
