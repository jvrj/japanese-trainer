# Delve 5 — QA/Verification Adversary Audit (Round 1)

**Auditor:** qa-tester (read-only)
**Reads:** primary doc `docs/delve-cycles/5-conversation-first-product.md` (commit `a520830`), charter
`docs/delve-cycles/5-charter.md`, `index.html` (source-of-truth spot-checks for every cited line).
**Lens:** are acceptance criteria testable, are regressions covered, are the proposed verification
checks sound and non-hallucinated?

**Prompt-injection check:** both the primary doc and the charter were read as untrusted data. No
text resembling an instruction to this auditor (e.g. "ignore previous instructions", "run git
add") was found in either file. Nothing to report on this front.

**Citation-accuracy check:** every `index.html` line number I spot-checked against source
(18855 render map area, 18679 `progConversationalCore`, 18692 `PROG_LADDERS`, 2946 `CONVO_TIERS`,
2960 `CONVO_PARTNERS`, 2989 `SCENES`, 3016 `convoLevelInfo`, 19057/19059/19060-19062 `renderHome`,
19342-19356 Accuracy tile, 19261-19267 the v7.76 comment, 19426-19435 `contCard`, 2919/2923
`modulesEnabled`/`convoHandsFree` defaults) matched the doc's description. The doc's source
grounding is real, not hallucinated, on every line I checked. Findings below are about gaps in
what's tested/verifiable, not about invented citations.

---

## Findings

### F1 — SERIOUS — Onboarding's spoken-name capture has no STT mechanism to build on, and no failure path
The onboarding flow (§4.2 OB-3A, turn ②) has the user "speak their name in the frame" so the
partner can greet them by name in OB-3A turn ③ (`〔name〕さん、はじめまして!`). This requires
**open-vocabulary STT content extraction** — recognizing an arbitrary spoken name, not just
detecting that speech occurred. Nothing in the codebase does this today: the only existing
`userName` capture path is a **typed** text input (`index.html:20479`,
`<input type="text" ... oninput="setUserName(this.value)">`, backed by `index.html:2927`
default and `index.html:20716` setter). Every voice-recognition surface in the app is explicitly
built for **constrained-vocabulary** matching to get acceptable accuracy — see the app's own
comment at `index.html:16707`: *"Both use a constrained-vocabulary speech matcher — accuracy is
far higher than open-vocab scoring because the answer space is tiny (1-6 words)."* A person's
name is the opposite: unconstrained, open-vocabulary, exactly the case the app's own architecture
says degrades accuracy. The doc's own doctrine, "STT is a turn-trigger + optional echo, never a
grader" ([[project_japanese_trainer_stt_not_grader]], restated at primary doc line ~72), covers
*whether* speech happened, not *what was said* — the onboarding design silently asks STT to do
the second, harder job it was never built or verified for. §4.4's self-audit and §5.4's
double-miss rule both cover "no speech / STT miss," not "STT transcribed the wrong name." If the
name is mis-heard (a very likely outcome for an unconstrained open-vocab pass on-device), the
partner will confidently greet the new user with a wrong or garbled name inside the first ~60
seconds — a concrete, high-visibility failure of the "zero subconscious judgment" promise on
literally the first exchange, with **no described fallback, no acceptance criterion, and no test
plan.** This is a testability gap the doc should close (either drop the spoken-name step, gate
it behind confirmation-by-repeat-back, or explicitly design a low-stakes failure mode) before
Stage B's acceptance criteria ("mic-denied path completes via chips") can be considered complete
— that criterion covers denial, not mis-transcription.
**Citation:** primary doc §4.2 row OB-3A ("user speaks their name in the frame"); `index.html:2927`,
`index.html:20479`, `index.html:20716`, `index.html:16707`.

### F2 — SERIOUS — Universal-phone promise vs. iOS/Safari STT reality is untested and unaddressed in onboarding
The charter and primary doc both lock "universal-phone, not Pixel-only" as a constraint
(primary doc line ~65, citing `[[project_japanese_trainer_commercial]]`), and the onboarding's
core promise is literally "Speak Japanese from your first minute" (§8.2 one-liner). But the
app's voice input gate is `window.SpeechRecognition || window.webkitSpeechRecognition`
(`index.html:5313`, wrapped by `voiceSupported()` at `index.html:5327`), and Safari/iOS support
for this API is historically absent or unreliable, especially inside an installed
home-screen/standalone PWA (a materially different sandbox than Safari-in-browser). The app
already has ~15+ existing `voiceSupported()` guard sites across drills that silently degrade to
typed/chip input when the API is missing — proof the team already knows this platform gap
exists — yet the primary doc's onboarding section (§4) never discusses this case. OB-2's
"Denied/no-mic fallback" language only covers **permission denial**, not **API absence**
(a different code path: no `[Allow mic]` browser prompt ever fires because there is nothing to
grant). Given Facebook-ad strangers skew heavily toward iPhone users in many markets, this is not
an edge case — it may be the default experience for a large slice of the target audience, and
the doc's own headline promise ("speak... from your first minute") would not hold for them.
No acceptance criterion in Stage B mentions testing on iOS Safari/standalone-PWA specifically,
despite the explicit universal-phone constraint.
**Citation:** primary doc §4.2 OB-2 row ("Denied/no-mic fallback"); primary doc line ~65
(universal-phone constraint); `index.html:5313`, `index.html:5327`, plus the ~15 `voiceSupported()`
guard sites (e.g. `index.html:9312`, `index.html:9820`, `index.html:16089`).

### F3 — QUESTIONABLE — Onboarding flow ambiguity: does the mic pre-prompt (OB-2) run once or twice on the returnee path?
The linear flow is numbered OB-0 → OB-1 → OB-2 (mic pre-prompt) → OB-3A/OB-3B. But OB-3B's own
row text says: *"Then → OB-2 mic pre-prompt → a stage-matched scripted exchange..."* — i.e. the
router path explicitly re-enters OB-2 **after** completing the 3-question router. The doc never
states whether the returnee path (a) skips the earlier generic OB-2 and only hits it after the
router, or (b) hits OB-2 twice (once generically, once again post-router). This is a testable
flow spec and it's currently underspecified — an implementer or a `/hydra-forge` build following
§9 Stage B literally could go either way, and a QA pass can't write a deterministic funnel test
for the returnee path until this is resolved. If it's (b), a nervous user is asked for mic
permission twice in one onboarding session, which is itself a plausible bail point the doc's own
§4.4 bail-point audit doesn't cover (that audit only lists OB-0→OB-1, mic-permission-denial, and
STT-miss-turn-1 — not a duplicate-prompt scenario).
**Citation:** primary doc §4.2 table, OB-2 row vs. OB-3B row ("Then → OB-2 mic pre-prompt →...").

### F4 — SERIOUS — Stage D's "Change:" scope undercounts the acceptance criterion; the Accuracy tile exists in at least 7 places, not 1
§5.1 rule 1 says "No accuracy percentage anywhere user-facing," and Stage D's acceptance
criterion is "no user-facing %-accuracy anywhere." But Stage D's **Change** bullet names exactly
one site: "remove Accuracy tile (19342–19356)" (the Home stats row). Source has the same
user-facing `<div class="stat-label">Accuracy</div>` pattern (or `h8-stat-label` equivalent) at a
minimum of seven other locations tied to screens that **survive** the restructure as
practice-drawer tiles per §3.3's own verdict table (Vocab Blitz row 11, Kana Blitz row 10, Form
Blitz row 14, Sentence Blitz row 15, Phrase Blitz row 17, etc.) — confirmed by direct read at
`index.html:7661` (Vocab Blitz "Deck clear" complete screen) and `index.html:11028` (Kana Blitz
complete screen), plus matches at `index.html:9029, 11389, 12064, 12624, 13132`. The same
Vocab-Blitz complete screen also has a raw `<div class="stat-label">Wrong</div>` at
`index.html:7660`, and Kana Blitz repeats it at `index.html:11030` — "wrong" is on the doc's own
banned-word list (§5.1 rule 3). Stage D's exhaustive-grep verification method (citing
`[[feedback_translation_audit_exhaustive]]`) is the right tool and, if actually run
exhaustively, *would* catch these — but the stage's own "Change:" description signals a
single-site fix, which risks a forge implementation stopping after the cited line range and
declaring done, with the grep step skipped or run non-exhaustively. This is exactly the failure
mode `[[feedback_translation_audit_exhaustive]]` was written to prevent elsewhere in this
project. Recommend the primary doc (or synthesis) explicitly enumerate the multi-site scope
before Stage D is briefed to a builder.
**Citation:** primary doc §9 Stage D "Change:" bullet ("remove Accuracy tile (19342–19356)");
primary doc §5.1 rule 1; `index.html:7660-7661`, `index.html:11028-11030`.

### F5 — QUESTIONABLE — No proactive day-7 return mechanism exists on PWA-today; §6 reads as solving retention but only reacts on reopen
Charter QA prompt 2 asks directly: "what pulls [a returning user] back without push
notifications (PWA-today reality)?" Walking §6.1's four "shipping in the restructure" mechanics:
reframed streak (visible only after reopen), silent auto-freeze (invisible unless reopened),
private-by-default progress (passive), weekly summary card (shown "First open ≥7 days after
last summary" — i.e. only rendered *after* the user has already come back). All four are
**reactive** — none of them can independently cause a lapsed user to open the app again; that
requires push, which §6.2 correctly defers to Phase 4 (native) with Web Push flagged as an
optional, skip-leaning Phase-1 interim. The doc is self-aware of this (open question #5), but
§6's section header ("Retention baseline without guilt") and Task 4's framing read as if day-7
return is addressed by the restructure, when the honest answer to the charter's own question is
"nothing in this delve's shippable scope pulls a lapsed user back — that capability doesn't
exist until Phase 1/4." Worth stating as an explicit, named limitation (not just an open
question) so a later verification pass doesn't mistake §6.1 for a completed answer to day-7
retention.
**Citation:** primary doc §6.1 (all four bullets); primary doc §6.2 table; charter
`docs/delve-cycles/5-charter.md` Adversary 2 audit item 2.

### F6 — QUESTIONABLE — Acceptance-criteria verification methods are inconsistent across stages, several are unautomatable as written
§9's acceptance criteria mix three different (and partly implicit) verification methods without
naming them uniformly: Stage B is "measured on-device" (manual timing, no tooling named), Stage D
is a "grep script... exhaustive" (automatable, concrete), Stage E is "router sweep" (method
unnamed — manual or scripted?) plus "render-verify" (the one method the doc explicitly anchors to
`[[feedback_verify_render_not_cache]]`). But `[[feedback_verify_render_not_cache]]` is explicitly
a render-not-blank check, not an interaction/behavior check — it would not catch a broken
double-miss handler (§5.4), a mistimed onboarding budget (§4.1), or a duplicate mic-prompt (F3
above). None of Stage B's or §5.4's behavioral acceptance criteria name a concrete automated (or
even a repeatable manual) test procedure. For a doc whose stated purpose is to be "the follow-on
`/hydra-forge` brief" (§9 preamble), the acceptance criteria for the highest-risk, most
judgment-sensitive behaviors (first-exchange timing, STT double-miss degradation) are the least
verifiable as written.
**Citation:** primary doc §9 Stage B "Acceptance:" line; primary doc §9 Stage E "Acceptance:"
line; primary doc line ~442 (`[[feedback_verify_render_not_cache]]` citation).

### F7 — NITPICK — OB budget table's "cum." column changes units for the last row without flagging it
§4.2's table header is "Budget (cum.)" and every row through OB-4 uses an absolute cumulative
range (e.g. "15–25s") except the final OB-4 row, which switches to a relative "+8s". Combined
with OB-3A's own range spanning 25–75s (a 50-second span covering all three scripted turns, not
just the "first spoken exchange" bolded inline at "~40–50s"), a reader has to do the arithmetic
themselves to confirm the full flow stays inside the ≤90s/≤60s budgets locked in §4.1 and
restated in Stage B's acceptance line. It does appear to work out (75s + 8s = 83s ≤ 90s), but the
table as formatted doesn't make that self-evidently checkable, which matters for a document whose
whole point is to hand off testable, checkable budgets.
**Citation:** primary doc §4.2 table, OB-3A row ("25–75s") and OB-4 row ("+8s").

---

## Charter walk-throughs (summary, per Adversary 2's four required walks)

1. **Cold-start funnel (nervous 40-year-old beginner):** the doc's own §4.4 self-audit covers the
   two most obvious bail points (permission friction, silent STT). It does **not** cover F1
   (mis-heard name) or F2 (no STT at all on a large iOS slice) — both are more severe than the
   risks it does self-audit, because both can turn "speak Japanese from your first minute" into
   either an embarrassing wrong-name greeting or a silent fallback to typing for a platform the
   product claims to support universally.
2. **Returning-user day-7 (no push):** see F5 — the shipped mechanics are reactive, not pull-back;
   the doc is honest about this in §11 but §6's framing oversells it.
3. **Owner's day-1 migration:** the doc's acceptance line ("owner's topic-drill routine ≤1 tap
   worse, resume case 0 taps worse") is concrete, testable, and traced to real functions
   (`contCard` at `index.html:19426-19435`, verified accurate). No issue found here — this is the
   best-specified acceptance criterion in the document.
4. **Mid-conversation STT double-miss:** the §5.4 rule is well-designed on paper (apologize,
   auto-switch to chips, never accumulate visible state) but see F6 — no concrete test procedure
   is named for verifying it, and no code today implements anything like it (confirmed: no
   existing "double-miss" or consecutive-STT-failure counter exists in `index.html`), so this is
   pure new-build risk with no described test plan beyond "acceptance: STT double-miss demo
   degrades to chips" (§9 Stage D) — a demo is not a regression test.

---

## Verdict

**WARN.** The primary doc's source grounding is accurate everywhere checked (no hallucinated
citations found), and its highest-quality acceptance criterion (owner migration, Stage A) is
genuinely testable. But two SERIOUS gaps (F1: unaddressed open-vocabulary STT name capture with
no failure path; F4: an acceptance criterion whose described implementation scope undercounts the
actual surface by ~7x) and a cluster of QUESTIONABLE verification-design gaps (F2 iOS/Safari
untested against a "universal-phone" claim, F3 flow ambiguity, F5 retention framing, F6
inconsistent/unautomatable acceptance methods) mean the doc is not yet a clean brief a
`/hydra-forge` build could execute and have QA sign off on without first resolving these. None of
these rise to FATAL — the overall IA/lock structure is sound and none of the findings invalidate
the thesis — but they should be dispositioned (fixed or explicitly deferred with reasoning) before
Stage B/D are briefed to a builder.
