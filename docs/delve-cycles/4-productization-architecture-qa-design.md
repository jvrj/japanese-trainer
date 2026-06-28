# Delve 4 — QA Adversary: Test/Verification Design Audit

> Adversary: qa-tester. Lens: are acceptance criteria testable, are regressions covered,
> are the verification checks sound and non-hallucinated?
> Primary doc: `docs/delve-cycles/4-productization-architecture.md` (commit 9b943e58).

---

## Summary

The architecture decisions in the primary doc are directionally sound. The QA problem is that
the document is a design spec without testable acceptance criteria attached to the five critical
user journeys the charter explicitly assigned to this adversary. Most journeys are named but not
walked: the primary doc delegates several paths to "(qa-tester to walk this)" but does not
supply the intermediate states, error branches, or observable outcomes that a test plan requires.
Until those gaps are filled, a forge run cannot write meaningful integration or E2E tests, and
the synthesis cannot verify coverage.

No prompt-injection or disallowed-instruction text was detected in either the primary doc or the
charter.

---

## Findings

### F1 — SERIOUS: Cold-start funnel is named but never walked

**Detail.** The charter explicitly asks: "a brand-new user installs, opens — do they reach a
working drill before being asked to pay? Walk the funnel." The primary doc does not walk it.
Phase 4 mentions "paywall UI" is added, and Phase 1 delivers "the app works for anyone with
no key," but the sequence between those two points — what a new user actually sees, when
signup is required, whether a free sample drill exists before the paywall, and what the
entitlement gate returns for an unauthenticated user before Phase 2 lands — is nowhere
specified. A test cannot be written against an unspecified funnel state.

The closest the doc gets is: "the proxy can ship before any auth is enforced (an
unauthenticated `/transcribe` behind a soft secret), letting the client cut over off BYO-key
first; auth is layered on top (Phase 2)."

**Citation:** "Phase 1 alone delivers the core unblock (no more BYO-key); revenue isn't
possible until Phase 4." (§10, Phases preamble) — but the user-visible funnel between install
and first paid drill is absent.

---

### F2 — SERIOUS: Offline degradation acceptance criteria are absent despite explicit delegation

**Detail.** Section 7 explicitly delegates offline behavior to this adversary: "*(qa-tester
to walk this.)*" The doc then describes the intended behavior: degrade to `_convoScript` +
"offline — reconnect to keep practising" state, no hard crash, SRS review of "already-loaded
items" continues locally. But none of these terms are testable as written:

- **"already-loaded items"** is undefined. How many? What is the cache boundary — the full
  word bank loaded on launch, or only items in the current drill session?
- **How does the app detect the offline state?** Proactively (checking `navigator.onLine` or
  a heartbeat), or reactively (the `/transcribe` call fails with a network error)?
- **What is the `_convoScript` degradation quality?** The no-key fallback at `:9617/:9722/:9723`
  was designed for BYO-key absence, not offline. Does it still grade answers? Does it provide
  meaningful feedback, or just play audio prompts without STT?
- **Re-connection during a session:** the doc does not specify whether the app detects network
  recovery and re-enables STT, or whether a full restart is required.

Without these specifics, "no hard crash" is the only binary test possible.

**Citation:** "The loop must degrade to: cached/scripted content (`_convoScript`) + a clear
'offline — reconnect to keep practising' state, NOT a hard crash." (§7, Degradation section)

---

### F3 — SERIOUS: Refund state is completely absent from the payment edge-case coverage

**Detail.** The charter requires: "payment edge cases: trial expiry, failed renewal, restore
purchases on a new device, refund — does the app gate correctly each time?" The primary doc
covers trial, restore, and failed-renewal (via the "402-style" path) but **refund is never
mentioned**. A refund is a distinct RevenueCat webhook event (`CANCELLATION` with
`cancellation_reason: CUSTOMER_SUPPORT`) that fires when Apple/Google issue a refund after
the user has consumed the entitlement. The expected behavior — does the server immediately
revoke `entitlements.active`? Is there a grace period? Does the client show a paywall or a
"your subscription was cancelled" message? — is entirely absent.

**Citation:** The `entitlements` table schema is specified as `( user_id PK, active BOOL,
product_id, expires_at, source, raw_receipt )` (§4, data model), but no state transition for
the refund path is defined anywhere in the doc.

---

### F4 — SERIOUS: "402-style" response is ambiguous — no verifiable contract

**Detail.** Section 7 states: "**Unsubscribed/expired:** server returns a 402-style 'no
entitlement' → client shows paywall, never a broken drill." The phrase "402-style" is not a
testable specification. It is ambiguous between:
(a) an actual HTTP 402 Payment Required status code,
(b) HTTP 200 with an error body containing an entitlement-failure indicator, or
(c) HTTP 403 Forbidden.

The client-side error handler must match one specific contract. If a forge-built client catches
HTTP 402 but the server returns HTTP 403 (a common implementation choice for auth-related
failures), no paywall is shown and the drill fails silently. This needs a concrete API contract
before any test can verify the behavior.

**Citation:** "server returns a 402-style 'no entitlement' → client shows paywall, never a
broken drill." (§7, Degradation when offline / unsubscribed)

---

### F5 — QUESTIONABLE: Migration failure path has no rollback or error-handling spec

**Detail.** The localStorage-to-Postgres migration seed (§4) is specified as: "on first
authenticated launch, detects existing localStorage and no `user_state` row → treats local as
seed, uploads it as the initial `state_json`." But the error path is unspecified:

- **Upload fails mid-seed** (network error, Supabase timeout): does the app retry? Silently?
  After a delay? Is the user informed?
- **Partial write:** can `state_json` be written in a partially-valid state if the upsert
  errors on a large blob?
- **Does the client continue with localStorage** if the seed upload fails, or does it block
  the user? The "No data loss, no manual export" guarantee is asserted but there is no mechanism
  specified that ensures it under failure conditions.

Without a rollback or retry contract, the migration represents a one-way, unrecoverable data
path for the owner's real SRS history.

**Citation:** "The account-aware build detects existing localStorage on first authenticated
launch and **no** `user_state` row → treats local as seed, uploads it as the initial
`state_json` (`schema_version` stamped). **No data loss, no manual export.**" (§4, Migration
path for the owner's existing localStorage data)

---

### F6 — QUESTIONABLE: Cross-device LWW conflict outcome is not testable as specified

**Detail.** Section 4 defines conflict resolution as "last-write-wins at the top-level-key
granularity." The doc acknowledges this may lose data: "LWW-per-key rarely loses real progress"
and "the cross-device corruption risk is bounded to 'newest device wins a given subsystem.'"
The problem is that neither "rarely" nor "bounded corruption" is testable. A QA test needs:

- A concrete scenario: user drills 50 items on phone (offline), then drills 30 different items
  on tablet (online). Phone comes online. What is the expected merged state?
- A definition of "corruption" that the test can check against: is any SRS progress ever
  decremented? Can a word's due-date go backwards?
- The doc's claim that "SRS stats are additive/monotonic in practice (counts, due-dates)" is
  an assertion that needs at minimum a representative sample of the `state_json` key structure
  to verify.

The primary doc correctly opens this as a question for code-reviewer (§12), but since this
also affects the cross-device journey assigned to qa-tester, the resolution matters here too.

**Citation:** "SRS stats are additive/monotonic in practice (counts, due-dates), so LWW-per-key
rarely loses real progress; the cross-device corruption risk is bounded to 'newest device wins
a given subsystem.'" (§4, Conflict resolution)

---

### F7 — QUESTIONABLE: Daily-cap counter reset time and error-counting policy are unspecified

**Detail.** Section 8 locks a "soft cap at ~300 graded items/day" enforced server-side. The
spec is incomplete in two ways that affect testability:

1. **When does the counter reset?** Midnight UTC? Midnight in the user's timezone? A rolling
   24-hour window? This determines whether a user who drills 300 items at 11 PM can drill
   again at midnight or must wait 23 hours.
2. **Does a failed STT call consume a cap unit?** If the Whisper call returns an error (network
   glitch, OpenAI timeout), does the counter increment? If yes, a flaky connection can burn the
   daily cap without the user completing any drills. If no, an abuser can spam partial requests.

Both are required to write a deterministic test for cap enforcement.

**Citation:** "Lock a soft cap at ~**300 graded items/day** (covers any genuine learner; clips
abuse) — server-enforced at the entitlement gate, with a gentle 'you've hit today's practice
limit' rather than a hard error." (§8, LOCKS)

---

### F8 — NITPICK: Phase 3 native wrap has no defined acceptance criteria for mic + STT

**Detail.** The primary doc acknowledges the iOS WKWebView mic risk as a flagged open question
and defers it to code-reviewer: "(Flagged for verify — historic iOS WKWebView mic quirks;
adversary code-reviewer must confirm against the `_whisperVoiceListen` path.)" This is the
correct delegation. However, from a QA standpoint, Phase 3 "first installable iOS + Android
builds → internal test tracks" needs at minimum a smoke-test checklist defining what "passing"
means before the build is promoted: mic permission granted, `_whisperVoiceListen` completes
one round-trip, drill loop runs end-to-end. Without this checklist the internal test track has
no exit criterion.

**Citation:** "(Flagged for verify — historic iOS WKWebView mic quirks; adversary code-reviewer
must confirm against the `_whisperVoiceListen` path.)" (§6, Required native plugins)

---

## Verdict: WARN

The architectural locks in this doc are reasonable and internally consistent. The QA problems
are not with the choices made — they are with what is left unspecified. The five user journeys
the charter assigned to this adversary (cold start, migration, payment edges, offline
degradation, cross-device) produce at most two that are fully walkable from the current text
(trial-expiry gate via the entitlement webhook path; restore-purchases via RevenueCat). The
other three cannot be reduced to a test plan without additional specification:

- Cold-start funnel (F1) — walk is entirely absent.
- Offline degradation (F2) — criteria are named but not grounded.
- Payment edge cases (F3, F4) — refund is missing; the 402-style contract is ambiguous.

Synthesis should require the primary author to supply: (a) a funnel state diagram from install
to first working drill, (b) the concrete offline detection and degradation contract, (c) the
refund webhook behavior, and (d) the exact HTTP contract for the entitlement-gate response
before treating these journeys as specified.
