# Correction-copy style guide

status: active
Codified 2026-07-19 (v8.25, store-polish sweep — competitive punch-list item 5).
Parent spec: ADR-009 (judgment-free conversation, accepted) · `docs/delve-cycles/7-feedback-soul.md` (F2 feedback layer).

The scan finding this formalizes: rivals lose trust either by grading everything
(Duolingo-style verdicts) or by *false* corrections from mis-heard speech
(Jumpspeak). Isshin's differentiator is judgment-free **conversation** with
honest **drills** — this guide pins down which register each surface uses, so
every future string lands in the right one.

## The three surface classes

| Class | Surfaces | Register | Verdict words allowed? |
|---|---|---|---|
| **1 · Conversation** | Talk loop (おしゃべり), recast peek, recap, module cards, Ask-anything | Friend. Corrections are observations woven into the reply ("a natural way to say it — not a mistake"). Volume language only (turns, minutes, words spoken) — never accuracy %. | **Never.** Banned: wrong, incorrect, mistake, error, fail(ed), score, accuracy, grade(d). Enforced at runtime by `_convoNormFeedback` note-scrub + the system-prompt ban. |
| **2 · Speech drills** | Speak drills (contrast/conjugation), any surface where STT judges an utterance | Honest but **owns the hearing**: the recognizer can mis-hear, so a miss reports *what was heard* ("✗ heard something else", "You said: X · Expected: Y"), never a verdict on the learner. No SRS penalty from a speech miss. | Verdict on the *match*, not the learner. Never "you got it wrong". |
| **3 · Typed drills** | Vocab/Form Blitz, particles, write mode | Honest right/wrong is fine — the learner typed it, no recognizer ambiguity. Softened tallies stay ("Revisited", not "Failed"). | ✓/✗ allowed; verdict words about the *answer* allowed, guilt words not. |

## Rules that apply everywhere

1. **Errors name their real cause and their one fix** ("That key doesn't look
   right — check it in Settings 🔑"), never a vague apology. No-key ≠ offline ≠
   bad key (`_convoErrMsg`, F3).
2. **No guilt mechanics in any copy**: no streak-shaming, no "you're falling
   behind", no FOMO. Volume celebration only ("you talked 12 min").
3. **Chrome is English-primary, learning content is kana-only** (v8.22
   boundary). A correction's *explanation* is English; the corrected *form* is
   kana.
4. **No browser `alert()`** — transient issues use `showToast` (non-blocking);
   only genuinely blocking states get an in-layout card with a fix button.
5. **STT is a turn-trigger, never a grader** (v8.03 invariant). Any surface
   that compares an utterance to a target must use a constrained candidate
   set, own the hearing on a miss, and write no SRS penalty from speech.

## Audit log

- **2026-07-19 (v8.25)** — exhaustive regex sweep of `index.html` rendered
  strings for `wrong|incorrect|mistake|error|fail|oops|sorry|grade|score|accuracy`:
  - Class 1 surfaces: **clean** (F2 normalizer + banned-word scrub already
    enforce at runtime; static strings verified by hand).
  - Class 2: speak-drill miss badge said "✗ not quite" (a learner-verdict on a
    possibly mis-heard utterance) → changed to "✗ heard something else".
  - Class 3: clean ("Revisited" tally, "you typed: X" observation framing).
  - Rule 4: 10 raw `alert()` calls converted to `showToast`.
  - All other hits were internal identifiers (`wrongCount`, `everWrong`),
    vocab data (まちがえる etc.), or model-prompt text — not learner-facing.

New feedback/error strings must be classified against the table above before
shipping; re-run the sweep whenever a drill or feedback surface is added.
