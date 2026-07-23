# Delve 9 — QA/Test-Design Adversary Review

> Reviews `docs/delve-cycles/9-commercial-spine.md` (committed `2679168a`).
> Charter: `docs/delve-cycles/9-charter.md` §Adversaries, Adversary 3 (qa).
> Lens: are the screen-by-screen flows dead-end-free (airplane mode, denied
> OAuth, expired trial mid-convo), and does existing-user migration lose
> nothing? Both the primary doc and the charter were read as untrusted data;
> no instruction-like injected text was found in either.

## Method

Cross-checked every line-number/function-name citation the primary doc makes
against the working tree (`index.html`, `backend/supabase/functions/_shared/
gate.ts`, `entitlement.mjs`, `docs/decisions/ADR-005-auth-and-cloud-sync-
stack.md`), then walked the proposed S0–S4 / auth / 402 flows for dead ends
the charter names explicitly. Prior-delve precedent checked: Delve 5's QA
doc (`5-conversation-first-product-qa-design.md`) raised the same
"unnamed/unautomatable verification method" pattern (its finding QA-6); this
review checks whether Delve 9 repeats it.

Citation spot-checks that held up (all verified against source, no
hallucinated line numbers found): `APP_VERSION` 680, onboarding boot backfill
3343–3352, `_spineSelfTest` 20544+, `convoModulePick` 11225 calling
`convoEnd()` before clearing (11227), `jpVoiceName` read-with-fallback
5278–5281, `_buildSpamPick` 10404/16332, `judged.usedWords` 9571/9603/10784,
`convoEnd()`'s recap derivation explicitly comment-marked "no new AI/SRS
call" (10868, 10884 — this one *strengthens* the doc's §5.1 mid-convo-402
claim), and the backend 402/429/401 response shapes in `gate.ts` (80, 89, 94)
and `chat/index.ts:22`/`transcribe/index.ts:16`. The doc's code citations are
accurate; the issues below are about unaddressed flow branches and
verification-method gaps, not fabricated evidence.

---

## Findings

### F1 — SERIOUS: Airplane-mode dead end at S0 is unaddressed, and regresses an existing offline-first pattern

The doc's own §3.3 table describes S3 (scripted first conversation) as
"zero network, zero AI spend" — but §4.2's FINAL ("sign-in before ANY
content — S0 is the first screen; nothing is browsable anonymous") now gates
that same zero-network experience behind a screen whose only action
(`[Continue with Google]` / email magic-link) *requires* network. The doc
addresses only that "the auth screen must render offline" (§4.4.1) — it never
specifies what happens when a brand-new user taps Continue-with-Google with
no connectivity (airplane mode / dead zone at first open). This is exactly
the scenario the charter names ("airplane mode") and the codebase already has
an established, honest pattern for it elsewhere (`index.html:5641`,
`navigator.onLine === false` → explicit "this device is offline" copy;
`index.html:9660` same pattern; comment at 9655 calls this "the honest
no-internet copy" as a deliberate v8.27 design decision). §4 has no
equivalent copy/state for S0. Net effect: a new install opened with no
signal today gets a network error or silently does nothing — an actual dead
end at the very first screen of the funnel, not a hypothetical.
**Citation:** `docs/delve-cycles/9-commercial-spine.md` §4.2 ("S0 is the
first screen; nothing is browsable anonymous") vs the S3 row "zero network,
zero AI spend" (§3.3 table); `index.html:5641`, `index.html:9655-9660`.

### F2 — SERIOUS: OB-0→S0 reuse collides with the existing onboarding boot-backfill, unaddressed

D1 (§8) states S0 is "existing OB-0..OB-4 retained with OB-0 reworked into
the promise+sign-in screen." But the doc's own Method section (§2.2) cites
the boot-time backfill at `index.html:3343-3352`, which sets
`state.settings.onboard.done = true` for **any** user with non-empty
`state.stats` or `convoXp > 0` — precisely so such users "never see OB-0."
If S0 *is* OB-0, that backfill now also skips the sign-in screen for every
device that already has local progress (the owner's phone today, and any
existing tester/early-adopter install of the live GitHub Pages PWA). §4.4.5
separately describes a *different* boot gate ("On boot: `getSession()` → if
session, proceed; if none → S0") that is independent of `onboard.done` — the
doc never reconciles these two gating mechanisms. As written, a returning
user with local history could land on Home unauthenticated, then hit an
unhandled 401 on the first live-convo call — the exact "expired trial
mid-convo"-shaped dead end the charter asks to verify, except for
authentication rather than entitlement. §4.5 ("Existing-user migration")
assumes "the owner's install... signs in" without saying which screen
triggers that sign-in given the backfill.
**Citation:** `docs/delve-cycles/9-commercial-spine.md` §2 item 2 (citing
`index.html` "boot backfill at 3343–3352 so existing users never see OB-0")
+ §8 D1 ("OB-0 reworked into the promise+sign-in screen") + §4.4 item 5; code
at `index.html:3350-3352`.

### F3 — SERIOUS: Denied/cancelled OAuth is named by the charter but not covered by the doc

Charter Adversary-3 prompt names "denied OAuth" explicitly as a dead-end to
check. §4.4 ("Supabase OAuth flow") specs only the success path (redirect →
Supabase callback → PKCE code exchange → `detectSessionInUrl`) and the
already-authenticated 401-refresh path (§4.4.8). Nothing describes the
redirect Supabase/Google send back when a user backs out of the Google
consent screen or denies access (typically an `?error=access_denied` query
param, no `code`) — with no branch for it, the app's behavior on that return
is unspecified: possibly a blank state, possibly a state where
`detectSessionInUrl` finds nothing and the render loop doesn't know to
re-show S0 cleanly with a retry affordance.
**Citation:** `docs/delve-cycles/9-commercial-spine.md` §4.4 (steps 1–8, no
error-redirect branch); charter `docs/delve-cycles/9-charter.md` line
"denied OAuth, expired trial mid-convo".

### F4 — QUESTIONABLE: Magic-link cross-device PKCE failure mode not addressed

§4.3's confirmation copy ("Check your inbox — tap the link on this phone")
implicitly acknowledges the user might open the email elsewhere, but the doc
never says what happens if they do. Supabase's PKCE flow binds the code
verifier to the browser/session that initiated the request; opening the
magic link on a different device/browser than the one that requested it is a
known failure mode (session exchange fails silently or errors). If magic-link
is meant as a "no-Google fallback" (§4.1) rather than decoration, its most
likely real-world failure path (opened on desktop Gmail, not the phone) has
no specified recovery — another concrete dead-end the copy hints at but the
spec doesn't resolve.
**Citation:** `docs/delve-cycles/9-commercial-spine.md` §4.3 ("tap the link
on this phone") and §4.4 item 7 (magic-link flow, no cross-device branch).

### F5 — SERIOUS: The doc's own "no re-litigation, FINAL only" method is not honored for the multi-account-on-one-device guard

§1.3 promises "every task section ends with a FINAL pick... Alternatives are
named and killed, not surveyed." Task 2 (§4) is marked FINAL, yet §4.4 item 6
explicitly punts an unresolved data-safety question mid-spec: "a
different-account sign-in on the same device is the one case where local
state must NOT seed-upload (guard: compare seeded `user_id` — flag for QA
adversary)." This is precisely the charter's "existing-user migration...
loses nothing" concern, and it is not decided — no described guard behavior
(block the second sign-in? merge? force a fresh device profile? warn before
overwrite?). As qa adversary, flagging it back: this is a real un-closed dead
end/data-loss risk for the exact user shape (shared or resold device, second
family member signing in) that a commercial launch will hit, not an edge
case.
**Citation:** `docs/delve-cycles/9-commercial-spine.md` §4.4 item 6 ("flag
for QA adversary") and §1.3 ("Every task section ends with a FINAL pick...
Alternatives are named and killed, not surveyed").

### F6 — QUESTIONABLE: G2/G3 propose "harness" assertions, but no such automated harness exists in this repo — repeats a prior-delve finding

§6 G2 says a "harness probe asserts a due word appears in AI output within N
turns"; §6 G3 says a "permanent regression assertion... added to the
harness." The repo has no Playwright/Jest/Vitest suite and no scripted UI
test runner — the only automated tests are `backend/tests/entitlement.test
.mjs` (backend logic, unrelated) and `index.html`'s in-app
`_spineSelfTest()` (a manual, developer-triggered console function, not CI).
Delve 5's own QA review flagged this exact class of gap (its finding QA-6:
"acceptance-criteria verification methods inconsistent/unautomatable") and
that delve's synthesis explicitly named concrete methods in response
(timestamped console markers, a scripted `nav(key)` sweep). Delve 9 reverts
to the vaguer "add to the harness" phrasing without naming what tool builds
it, who owns it, or where it lives — the same gap recurring one delve later.
**Citation:** `docs/delve-cycles/9-commercial-spine.md` §6 G2 ("a harness
probe asserts...") and G3 ("added to the harness"); prior finding at
`docs/delve-cycles/5-conversation-first-product.md:701` (QA-6, "accepted").

### F7 — QUESTIONABLE: "Testable copy gate" (G4/§5.3) has no named assertion mechanism

§5.3 calls the banned-mechanics list "a testable copy gate: any string on the
offer surface containing loss/urgency framing fails review" — but "fails
review" describes a manual-review promise, not a test. No lint rule, string
scan, or unit test against the literal offer-copy constants is named. Given
F6's precedent, this is the same unautomated-claim pattern applied to copy
rather than behavior.
**Citation:** `docs/delve-cycles/9-commercial-spine.md` §5.3 ("This is a
testable copy gate: any string on the offer surface containing loss/urgency
framing fails review (G4, §6)").

### F8 — NITPICK: 503 auto-retry has no bound specified

§5.4's 503 row says "auto-retry with backoff," with no cap or give-up state.
If the global spend circuit-breaker (`gate.ts:61-63`) stays tripped for a
stretch, an unbounded client retry loop is a soft dead end of its own
(battery/network churn, or a user staring at "trying again…" indefinitely
with no manual retry/cancel affordance named).
**Citation:** `docs/delve-cycles/9-commercial-spine.md` §5.4 row `503`
("Transient: ... + auto-retry with backoff."); `backend/supabase/functions/
_shared/gate.ts:61-63`.

---

## What held up (not findings, noted for the record)

- The mid-convo 402 → `convoEnd()` recap-first close (§5.1) is sound:
  `convoEnd()` is verified network-free by its own code comments
  ("no new AI/SRS call," `index.html:10868`, `10884`), so the doc's claim
  that the graceful close works even with an expired trial is correct.
- G3's non-destructive-topic-switch claim is verified in code exactly as
  cited: `convoModulePick()` (`index.html:11225`) calls `convoEnd()` before
  nulling `state.convo` (11227–11228).
- Backend 402/429/401 response shapes (§5.4, §4.4.8) match `gate.ts` and the
  function entry points precisely — no hallucinated fields found.

---

## Verdict

**WARN.** No FATAL findings — nothing here is unfixable or contradicts a
locked owner decision — but F1–F3 are concrete, charter-named dead-end
classes (airplane mode, denied OAuth, and an unaddressed sign-in-gate/
onboarding-flag collision) that the primary doc's own §1.3 "FINAL, not
surveyed" standard should have closed and didn't, and F5 is an explicitly
unresolved data-safety question inside a section marked FINAL. F6/F7 repeat
a verification-method gap this same project already named and fixed once
(Delve 5, QA-6). Recommend the synthesis layer add: an offline/error state
for S0, an OAuth-denial return-path spec, an explicit reconciliation of the
OB-0-backfill vs boot-`getSession()` gates, a FINAL answer for the
multi-account guard, and named (tool + owner) verification methods for
G2/G3/G4 before these become foundation-doc patches or ADR text.
