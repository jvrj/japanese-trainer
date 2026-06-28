# Delve 4 — Adversary: Devil's Advocate (LEAD)

> Read-only audit of `4-productization-architecture.md` (committed 9b943e58) + charter `4-charter.md`.
> Lens: challenge the premise — right problem? fragile / over-built / wrong-by-construction? Steelman the strongest objection.
> Citations verified against `index.html` this session (`_whisperTranscribe` 5801, `_coachCall` 9409, `_convoCall` 9512 confirmed).

## The Good (brief)
- Ground truth is genuinely verified against code (fetch sites, key cards, save() keys) — citations check out.
- Staged "never break the live loop" posture and offline-first localStorage-as-cache are sound.
- The doc names its own weakest spots (CAC payback, web-first beta, iOS mic) instead of hiding them.

## FATAL

### F1 — Phase 1 ships an UNAUTHENTICATED, client-secret proxy = an open wallet for the internet
The keystone phase stands up /transcribe + /chat behind a "soft secret" and the client "now works with no user key for everyone," shipped to the live public PWA. The per-user fair-use cap does not exist until Phase 4. A soft app secret lives in a 1.1MB single-file client JS — trivially extractable from the deployed index.html. Between Phase 1 and Phase 4 (the doc's own effort sums to ~17–28 solo dev-days) there is a publicly reachable endpoint spending the owner's real OpenAI + Anthropic money with no account, no entitlement, no rate-limit, no cap. One scraper or shared URL drains the budget. Wrong by construction, not an edge case.
Fix: never expose an uncapped/unauthed relay. Keep BYO-key owner-only for the interim, or put a hard global+IP rate-limit AND the daily cap on /transcribe from Phase 0, before any public cutover.
Citation: :187 "the app now works with no user key for everyone" + :74 "an unauthenticated /transcribe behind a soft secret" + :234 "must exist by Phase 4".

## SERIOUS

### S1 — Premature scale: the delve LOCKS 7 architectures + 5 ADRs before any willingness-to-pay evidence
The charter's lead question is "are we building backend+accounts+IAP+native+ads before proving anyone will pay?" The doc agrees this is the crux ("retention is the whole game") yet still locks Supabase + RevenueCat + Capacitor + Meta SDK + ATT/SKAN and frames the cheapest validation — a web Stripe paid beta — as merely [OPEN — strategy] in §12 that "may reorder the roadmap." That is the lede, buried. Summed build effort (§3 ~3-5d + §4 ~3-4d + §5 ~3-5d + §6 ~4-7d + §7 ~2-3d + §9 ~2-4d) ~= 17–28 focused solo days before revenue is even possible (Phase 4), for a "solo, non-professional developer" (charter). The premise "lock the architecture" presupposes PMF is settled. It is not.
Fix: invert the roadmap. Phase 0 = web-first paid validation (existing PWA + Stripe + thin owner-run proxy, owner-gated); prove N paying retained users, THEN lock native/IAP. Make the lock conditional on the validation result.
Citation: :316 "web-first paid beta ... may reorder the roadmap".

### S2 — Phase 1 gives the full product away free on the web — undermining paid funnel + Apple review
Phase 1 makes the web PWA fully functional "with no user key for everyone." You then ask App-Store users to pay $8.99/mo for a native wrapper of that same free website. This destroys willingness-to-pay (why pay when web is free?) and invites App Store Guideline 4.2 "repackaged website / minimum functionality" rejection — a risk the doc addresses only for 4.8 sign-in and BYO-key remnants, not 4.2 vs a live free twin. Loading local www/index.html does not defeat thin-wrapper rejection when the same app exists free on the open web.
Fix: decide the web tier deliberately — kill/lock the free web path at cutover, or make web a paid tier too.
Citation: :157 "avoids Apple's 'thin web wrapper' rejection risk" vs :270 "App now works for anyone with no key. ... Ships to the existing PWA".

### S3 — The entire unit-economics model rests on a self-cited in-code comment, NOT flagged stale-external
§8's cost-dominant number ("$0.003/min ... per in-code comment :5805") is sourced from a developer comment in index.html, not current OpenAI pricing. The doc rigorously flags store cuts, RevenueCat tiers, ATT, and CAC as [STALE-EXTERNAL] — but the single most load-bearing cost variable, Whisper price, is taken as ground truth. gpt-4o-mini-transcribe is billed on audio tokens; minimum-billing/overhead can make real per-call cost diverge from a clean $0.003/min. If off 2–3x, every margin/break-even/cap conclusion shifts.
Fix: add Whisper STT pricing to the §12 STALE-EXTERNAL list; re-derive §8 before treating the 300-item cap or price band as locked.
Citation: :207 "$0.003/min of audio (per in-code comment :5805)".

### S4 — Margin inversion: the best-retained users are the least profitable, even capped
At $8.99 / 30% cut = $6.29 net, the doc states the heavy user is "~break-even on variable cost alone ... before CAC," and the cap only keeps "even the heaviest legitimate user near break-even" (~$6 cost vs $6.29 net = $0.29). Heavy daily users are exactly those who retain and amortize CAC — yet after any CAC amortization ($15–40 / payback 3–7mo) they are loss-making for months. The cap clips the whale but leaves the structurally-best cohort underwater. $8.99 may be too low for an STT-per-utterance product.
Fix: model net margin AFTER CAC amortization per cohort; consider a higher anchor, annual-only plans to front-load LTV, or a cheaper STT path so heavy use isn't a loss.
Citation: :230 "keeping even the heaviest legitimate user near break-even".

### S5 — Trial cost on non-converters is omitted from the model
§8 bounds trial spend per trial user (~$0.10–$1.40) but never multiplies by the funnel. Facebook-ad-driven niche-app trial->paid conversion is typically low. Per paying subscriber you also eat the trial OpenAI spend of every non-converter you paid CAC to acquire — a real cost line, on top of CAC, nowhere in the table. Store-native trials are also abusable (fresh Apple/Google IDs).
Fix: add "trial spend per converted user = trial_cost / conversion_rate"; consider a usage-gated trial (first N free items) over 7 unrestricted days.
Citation: :231 "bounded free AI spend (~$0.10–$1.40 for a trial-length engagement)".

## QUESTIONABLE

### Q1 — "LWW-per-key, SRS is additive/monotonic" is false by construction
The sync defense rests on "SRS stats are additive/monotonic in practice ... so LWW-per-key rarely loses real progress." But last-write-wins replaces a key's blob; it does not add. Two offline sessions on two devices -> the later sync overwrites the earlier device's whole stats/words subsystem, silently discarding a study session. "Full CRDT is over-engineering" is a false binary: a per-counter max/additive merge sits between LWW and CRDT and actually delivers the monotonic property claimed. For a learning app, progress loss is the cardinal sin.
Citation: :100 "SRS stats are additive/monotonic in practice (counts, due-dates), so LWW-per-key rarely loses real progress".

### Q2 — Native plan LOCKed despite a self-admitted unverified critical dependency
§6 LOCKs Capacitor while flagging that iOS WKWebView getUserMedia mic capture is unverified and "any platform gap blocks the entire native plan." Locking an architecture whose load-bearing assumption is explicitly unproven is premature; the lock should be conditional on the code-reviewer verify passing.
Citation: :315 "any platform gap blocks the entire native plan".

## Steelman (what would change my mind)
Strongest defense: the owner has a parallel personal need — he already pays for his own keys and wants off BYO-key for himself. If Phase 1 were scoped owner-only (his account, his device, hard-capped) rather than "for everyone," F1/S2 mostly dissolve and the backend doubles as personal infra while validation runs. If willingness-to-pay were already evidenced (waitlist deposits, a manual Stripe beta), S1 collapses and locking is reasonable forward-planning. Flip to PASS requires: (1) the public soft-secret/uncapped window removed or hard-capped from Phase 0, (2) a willingness-to-pay gate before the native/IAP lift, (3) Whisper pricing re-verified. None are present as written.

## Prompt-injection check
Scanned both the primary doc and the charter as untrusted data. No embedded instructions targeting the adversary (no "ignore previous instructions" / "git add" text). Clean.

## Verdict
WARN — The architecture is internally coherent and the engineering choices defensible, but the doc LOCKs a multi-week solo build and 5 ADRs on top of (a) a wrong-by-construction open-wallet interim (F1), (b) an unproven willingness-to-pay premise it defers to an open question (S1), and (c) a cost model resting on a self-cited code comment (S3). Fix F1 and gate the lock on validation before forge.
