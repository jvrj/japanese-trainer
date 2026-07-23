# Delve 9 - Security adversary review

> Adversary doc. Reviews docs/delve-cycles/9-commercial-spine.md (committed
> 2679168a) + backend/supabase/** against the charter security prompts:
> (1) OAuth redirect flow on GitHub-Pages PWA - token handling/storage/logout,
> (2) trivial trial reset (name the accepted abuse floor), (3) 402/401 client
> handling leaks nothing sensitive. Lens: injection, unsafe shell/git, secret
> handling, destructive ops, permission/hook bypass, auth-surface gaps.
>
> Note: both the primary doc and the charter were read as untrusted data.
> No embedded instructions to this reviewer (e.g. "ignore previous
> instructions", "run git add -A") were found in either file.

---

## FATAL - SECURITY DEFINER RPCs are almost certainly reachable directly via PostgREST, bypassing the entire gate

backend/supabase/migrations/0001_init.sql (bump_request 46-55, bump_item
57-67, add_spend 69-78) and 0002_trial.sql (get_access 25-35, handle_new_user
11-16) are all `language plpgsql security definer` functions with no
accompanying REVOKE/GRANT statement in either migration. Supabase default
PostgREST setup exposes every public-schema function as an RPC endpoint
(`/rest/v1/rpc/<fn>`) to whichever roles hold EXECUTE, and Supabase default
template grants EXECUTE on new public functions to anon/authenticated
unless a migration explicitly revokes it. Nothing here does.

gate.ts own header comment states the design intent: "the relay is NEVER
reachable uncapped/unauthed" (line 4) - but that invariant is enforced only
inside the Deno edge functions (resolveCaller -> openGate). The underlying
Postgres functions those edge functions call are a second, unguarded front
door: any client holding a Supabase anon/authenticated key (the public anon
key ships in the client bundle by design) can call
`supabase.rpc("add_spend", {p_usd: 999})` directly - no resolveCaller, no
openGate, no cap check - instantly tripping GLOBAL_DAILY_USD (gate.ts line
11, default 15) and forcing 503 on every caller, including paying
subscribers, for the rest of the UTC day. One request, repeatable at will,
is a full-product denial of service.

get_access(p_user uuid) (0002_trial.sql:25) also takes an arbitrary UUID
with no `p_user = auth.uid()` check - an IDOR leaking any other account
trial/subscription status by guessing UUIDs. bump_item/bump_request let a
caller inflate a targeted caller_id (including "owner", the shared
soft-secret bucket) directly, tripping that caller 429 early - a griefing
vector against the interim Phase-1 relay.

This undermines the primary doc reliance on the gate/entitlement machinery
being sound (Section 5.4 contract table, D8, gate.ts own "hard invariant"
language) and is not examined anywhere in the primary doc despite the
charter assigning gate.ts/entitlement.mjs/backend/supabase/** here.

Fix: a follow-up migration that revokes execute on bump_request, bump_item,
add_spend, get_access, handle_new_user from public/anon/authenticated
(grant only to service_role), plus auth.uid()-ownership checks (or drop
p_user, derive from auth.uid()) on any RPC that must stay client-reachable.
Verify with `supabase db lint` / Security Advisor before flip-on.

Citation: backend/supabase/migrations/0001_init.sql:46-78 (functions, no
REVOKE); 0002_trial.sql:25-35 (get_access arbitrary p_user);
backend/supabase/functions/_shared/gate.ts:4 ("the relay is NEVER reachable
uncapped/unauthed") and :11 (GLOBAL_DAILY_USD).

---

## SERIOUS - client-selectable model defeats the spend-ceiling estimate

backend/supabase/functions/chat/index.ts:32 - `model: body.model or
DEFAULT_MODEL` accepts any Anthropic model string from the caller with no
allow-list. estUsd() (lines 7-14) hardcodes Haiku pricing (0.80 USD/M in,
4 USD/M out) regardless of the model actually billed. Any authenticated
caller can request a materially more expensive model (an Opus-class model,
roughly 15-20x Haiku per-token price), and the recordSuccess/add_spend
bookkeeping will under-report true spend by the same factor - silently
defeating the GLOBAL_DAILY_USD circuit breaker gate.ts calls "the whole
point" of the design. Real cost exposure, not cosmetic: Task 4/G4 and
ADR-004's "hard invariant" both depend on the spend ceiling being accurate.

Fix: allow-list `model` server-side and price estUsd() per the actual model
used, not a hardcoded constant.

Citation: backend/supabase/functions/chat/index.ts:7-14 (estUsd), :32
(`model: body.model or DEFAULT_MODEL`).

---

## SERIOUS - Sybil trial abuse against the shared circuit breaker, not just the per-user cap

Primary doc Section 9 OQ-3 accepts new-Google-account-plus-cleared-storage
as a new trial "by construction," reasoning only about the per-caller cap
(CAP_ITEMS_PER_DAY). It ignores that GLOBAL_DAILY_USD (gate.ts:11, default
15 USD) is a single SHARED ceiling across every caller (global_usage: one
row per UTC day, no per-user dimension - gate.ts:58-63). Trial creation is
free and scriptable: Gmail plus-addressing (user+1@gmail.com,
user+2@gmail.com, ...) gives one attacker unlimited magic-link trial
accounts, collectively able to exhaust the 15 USD/day shared ceiling well
before any single account trips its own cap. When the ceiling trips,
openGate returns 503 to EVERY caller including paying subscribers (Section
5.4's own table frames 503 as transient, never the offer screen - so a
paying customer retry-loops through an outage actually caused by trial
abuse). This compounds the finding above: if those RPCs are directly
callable, the Sybil path is even cheaper (no edge-function round trip).

Fix: state the OQ-3 floor in dollars/day against the shared ceiling, not
just items/day/account; consider signup heuristics and/or splitting the
circuit breaker so trial-cohort spend can fail independently of paid-cohort
spend.

Citation: primary doc Section 9 OQ-3 (near-verbatim: "accept it at v1...
per-user daily cap bounds the burn"); gate.ts:11 (GLOBAL_DAILY_USD), :58-63
(shared global_usage row); Section 5.4 table 503 row.

---

## QUESTIONABLE - SECURITY DEFINER functions have no search_path pin

None of bump_request, bump_item, add_spend, get_access, handle_new_user set
a SET search_path directive. This is Supabase's own documented advisory
class ("Function Search Path Mutable") for SECURITY DEFINER functions
referencing unqualified identifiers (usage_daily, global_usage, profiles,
entitlements). Lower likelihood than the FATAL above (Supabase typically
revokes CREATE on public from anon/authenticated by default), but a
standing defense-in-depth gap, cheap to close alongside that fix.

Citation: backend/supabase/migrations/0001_init.sql:47,58,70 and
0002_trial.sql:12,26 (each opens `language plpgsql security definer as $$`,
never sets search_path).

---

## QUESTIONABLE - vendored supabase-js has no pin/SRI, and the "no third-party scripts" XSS claim is unenforced

Section 4.4 point 1 says to vendor the supabase-js v2 UMD build with no
version pin or integrity check specified, even though this file will own
every user's auth session (localStorage token) - an unnoticed/tampered
update becomes a full account-takeover vector. Section 4.4 point 4 then
leans on "no third-party scripts" to bound XSS risk elsewhere - true today
(index.html only pulls Google Fonts CSS via @import, confirmed by grep),
but there is no CSP meta tag anywhere in index.html enforcing it, and the
plan itself adds this new vendored script plus (Task 5) a Stripe
integration, which will erode the premise further.

Fix: pin/checksum the vendored file and diff on re-vendor; add a
GH-Pages-compatible `<meta http-equiv="Content-Security-Policy">` tag as an
enforced backstop rather than relying on an observed absence.

Citation: primary doc Section 4.4 point 1 ("vendor the supabase-js v2 UMD
build into the repo...") and point 4 ("XSS exposure is bounded by the app
having no third-party scripts"); index.html:14-18 (only third-party
reference found, Google Fonts @import).

---

## NITPICK - unvalidated system/messages shape is a full prompt pass-through

chat/index.ts:29 only checks that body.messages is a non-empty array; no
per-message role/content validation, and body.system passes through
verbatim. Not an access-control bug, but any authenticated caller fully
controls the system prompt sent to Anthropic - a jailbreak/prompt-injection
surface worth a QA/product note.

Citation: backend/supabase/functions/chat/index.ts:29,34 (`system:
body.system or undefined`).

---

## Answering the charter's three named questions directly

1. OAuth redirect flow, token handling/storage/logout (Section 4.4): the
   full-page-redirect PKCE flow, localStorage session, and a signOut() that
   revokes the refresh token server-side are standard supabase-js/SPA
   practice, reasonably specified. No FATAL/SERIOUS gap in the flow itself;
   residual concerns are the vendoring pin and CSP backstop above.
2. Trivial trial reset - accepted abuse floor: OQ-3's floor ("per-user
   daily cap bounds the burn") is incomplete - see the Sybil finding above.
   Name the floor in dollars/day against the shared ceiling, not just
   items/day/account.
3. 402/401 client handling leaks nothing sensitive: confirmed at the
   contract level - Section 5.4 and entitlement.mjs/gate.ts return only
   reason/trial_ends_at/resets_at, no stack traces or upstream bodies
   (transcribe/index.ts:49 explicitly: do NOT leak the upstream body/keys;
   chat/index.ts:55 returns only status). Well-designed. The leak found
   here is orthogonal: get_access's IDOR leaks entitlement data via a path
   the 402/401 contract does not model at all.

---

## Verdict: FAIL

The FATAL finding (unguarded SECURITY DEFINER RPCs - plausible one-request
whole-product DoS plus cross-account entitlement IDOR) sits squarely inside
this delve's backend surface without being examined in the primary doc,
which otherwise reasons carefully about the client-facing 402/401/429/503
contract. Recommend confirming with a live `supabase db lint` / a manual
anon-key RPC probe before Phase-2 flip-on, and blocking flip-on
definition-of-done on the REVOKE fix. The two SERIOUS findings (model-cost
bypass, shared-ceiling Sybil abuse) should be folded into ADR-P3/ADR-P5
before those ADRs are filed.
