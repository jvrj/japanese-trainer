# Delve 4 - Code-Reviewer Adversary Audit

> Lens: correctness of code citations, refactor completeness, staging safety, sync correctness, WebView platform gaps.
> Primary doc: docs/delve-cycles/4-productization-architecture.md
> Commit: 9b943e58b129103759563970a43d7c5c388bf76d
> Verdict: **WARN**

---

## Finding 1 - SERIOUS: whisperAvailable() routing gate not addressed in migration plan

### What the primary doc says

Section 7 Step 2: "Redirect _whisperTranscribe (:5814) from https://api.openai.com/v1/audio/transcriptions to API_BASE/transcribe..."
Section 7 Step A (Phase 1): "the app now works with no user key for everyone."

### What the code actually does

_buildVoiceListen at index.html:15567-15572 is the dispatcher for every voice answer in Build Mode:

    function _buildVoiceListen(target, onVerdict){
      if(whisperAvailable()){
        _whisperVoiceListen(target, onVerdict);   // leads to _whisperTranscribe
        return;
      }
      _buildVoiceListenWebSpeech(target, onVerdict);
    }

whisperAvailable() at index.html:5646 calls whisperStatus(), whose second gate is:

    if(!whisperKey()) return {ok:false, reason:"no key saved"};  // index.html:5640

whisperKey() at index.html:5632 returns state.settings.openaiKey trimmed. After the
migration removes the local OpenAI key, whisperKey() returns empty string,
whisperAvailable() is permanently false, and _buildVoiceListen always routes to
_buildVoiceListenWebSpeech. Redirecting _whisperTranscribe to API_BASE/transcribe
is dead code -- nothing in the call chain reaches it.

### Why it matters

The migration keystone claim ("the app works with no user key") is not achieved by
steps 1-4 as written. Users without a local key silently get the browser Web Speech
API, the exact quality regression the product is meant to eliminate. A forge run
following this spec would produce a superficially correct refactor that never invokes
the backend Whisper endpoint in practice.

### What must be added to the plan

whisperStatus() / whisperAvailable() must be rewritten as part of Phase 1. After
migration the check should be based on entitlement + network connectivity (and JWT
in Phase 2), not local key presence. This is ~5-10 new lines but must be explicitly
called out or the STT migration is broken.

---

## Finding 2 - SERIOUS: _coachCall does NOT have a no-key fallback

### What the primary doc says

Section 1 (Ground truth): "Both _convoCall and _coachCall already have **no-key
fallbacks** (_convoScript, :9617/:9722/:9723) -- relevant to offline behaviour."

Section 7 Step 6: "the no-key fallbacks (_convoScript, :9617/:9722) become the
**offline degradation path** rather than a BYO-key absence path -- keep them"

### What the code actually does

_coachCall at index.html:9409-9421 opens with:

    const key = (state.settings.anthropicKey || "").trim();
    if(!key) throw new Error("nokey");   // index.html:9411 -- hard throw, no fallback

Its sole production caller is at index.html:10217:

    const raw = await _coachCall(prompt);

...inside a try/catch at index.html:10223-10228 that surfaces the error message
"The coach needs a Claude API key -- add one in Settings -> AI" with no _convoScript
equivalent at any level.

The _convoScript fallback exists ONLY in _convoOpenProbe (index.html:9617) and the
convo-turn handler (index.html:9722-9723). Those callers pattern-match:
    key ? await _convoCall(...) : _convoScript(...)
_coachCall has no such pattern anywhere in its call chain.

### Why it matters

The offline degradation plan in Section 7 is correct for the conversation loop
(_convoCall path) but leaves the coach / Build-Mode AI-QA path (_coachCall path)
degrading to a hard error UI, not graceful scripted content. A user going offline
mid-session sees a broken coach, not the "cached/scripted content" the doc promises.
The plan must either add a scripted coach fallback or explicitly acknowledge that the
coach feature hard-fails offline (and that this is acceptable).

---

## Finding 3 - QUESTIONABLE: save() writes 16 localStorage keys; 3 are unlisted

### What the primary doc says

Section 1: "~13 discrete localStorage keys (LS.words, LS.stats, LS.settings,
LS.notes, LS.logs, LS.streak, LS.askClaude, LS.formStats, LS.kanaStats,
LS.sentenceStats, LS.phraseStats, LS.particleStats, LS.variationStats, ...)"

### What the code actually does

save() at index.html:3418-3437 writes 16 keys. The three not listed in the doc are:
LS.similarStats, LS.snapshots, and LS.convo.

LS.convo stores in-flight conversation session state: turn index, messages history,
loading/error flags, scene identity -- mutable ephemeral data that is meaningless
on a second device or after reinstall.

### Why it matters

Section 4 states that state_json mirrors what save() writes today. Syncing LS.convo
to the cloud and restoring it on a second device would revive an orphaned conversation
with no matching server-side AI context. LS.logs (a ring buffer of diagnostic events)
is also unlikely to be worth syncing. The sync design should enumerate which keys
are included vs excluded from the JSONB blob explicitly.

---

## Finding 4 - NITPICK: Settings UI at line 20716 cites the superseded whisper-1 price

index.html:20716 reads "~$0.006/min audio, roughly $1-3/month for daily practice" --
the old whisper-1 rate. v8.00 switched to gpt-4o-mini-transcribe at $0.003/min (per
the code comment at index.html:5805). The primary doc correctly uses $0.003/min in its
unit economics. The stale user-visible string should be corrected before the consumer
build ships to avoid support confusion.

---

## Citation verification table

All primary-doc citations verified against index.html:

| Cited location | Status |
|---|---|
| _whisperTranscribe at :5801 | confirmed |
| OpenAI fetch at :5814, auth header at :5816 | confirmed |
| Cost comment $0.003/min at :5805 | confirmed |
| _coachCall at :9409, fetch at :9413 | confirmed |
| _convoCall at :9512, fetch at :9516 | confirmed |
| "deliberately duplicates" note at :9504-9505 | confirmed |
| _convoScript fallback at :9617/:9722/:9723 | confirmed (convo path only; see Finding 2) |
| All 5 Anthropic fetch sites incl :4730 :15792 :21184 | confirmed |
| anthropicKeyInput at :20667, openaiKeyInput at :20717 | confirmed |
| localStorage copy at :20666 / :20723 | confirmed |
| Save handlers near :20774 / :20798 | confirmed (actual fn start at 20773/20797 -- off by 1) |
| save() at :3418 | confirmed |

---

## iOS WKWebView / mic note

The charter asked this reviewer to confirm the _whisperVoiceListen path against iOS
WKWebView mic constraints. The code uses navigator.mediaDevices.getUserMedia +
MediaRecorder with audio/mp4 MIME fallback (index.html:5730-5731). Capacitor 6+
exposes getUserMedia in WKWebView when NSMicrophoneUsageDescription is set and the
microphone permission plugin is in place. The primary doc correctly flags this as
a [VERIFY] item in Sections 6 and 12 rather than asserting it works. No additional
finding; the verification must happen during Phase 3 with a real device build.

---

## Summary

The primary doc is well-grounded in its code citations and the overall architecture
(Supabase, RevenueCat, Capacitor) is a coherent lock. Two material gaps in the
migration design require synthesis attention before a forge run:

1. **whisperAvailable() routing gate must be updated in Phase 1.** Without this,
   redirecting _whisperTranscribe is dead code and all STT silently falls back to
   the browser engine.

2. **_coachCall / Build-Mode coach path has no offline fallback.** The claim that
   both functions are covered by _convoScript is factually wrong.

**Verdict: WARN**
