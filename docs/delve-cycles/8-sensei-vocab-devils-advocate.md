# Delve 8 -- Devils Advocate (LEAD adversary)

Audit of docs/delve-cycles/8-sensei-vocab.md at 4c04f82 against index.html v8.25.
Injection check: neither doc nor charter contained text instructing the adversary.

## F1 -- FATAL: Using a word IS unlocking it is false by construction

Cite (doc S3.3): speaking a locked word writes an attempt, the word is now
started, unlocked. Using a word IS unlocking it. And: by being spoken unaided in
conversation (convoApplyScore already writes recordAttempt+smGrade, 10179-10181).

Source: convoApplyScore resolves each spoken word ONLY against the seeded pool
(index.html:10153), and on failure drops it -- comment index.html:10175: Drop
unresolved entries silently, never write stats for unknown ids. Pool is
_buildSpamPick(getActiveWords(), 8), EIGHT words (index.html:9838).

Under the lock the seed pool is drawn from the UNLOCKED deck (S3.4), so a spoken
locked word never resolves, recordAttempt never fires, started stays false, the
word is NOT unlocked. Conversation can never promote a locked word. L3 and S5.2
(conversation and drills feed unlock equally) are false by construction.
## F2 -- SERIOUS: the echo guard cannot detect the mishears it is gated against

Cite (doc S4.3): explicit teaching demands positive transcript corroboration.
Source (index.html:9682-9689): the guard compares transcript to the model heard
field via bigram overlap. But heard is the model rendering of the transcript, so
overlap is near-tautological -- it only catches an invented heard, not an STT
mishear (where transcript AND heard share the same error). So the gate does NOT
protect against the charter named threat (S1.2 worse-than-silence). S4.5 case 1
and case 4 (osake to osara) both admit the teach fires on the wrong word.

## F3 -- SERIOUS: owner asked for 1,500; design ships 80 and reframes it away

Cite (doc S3.2 row a): the owner instinct is about deck shape, not display, then
FRONTIER_N = 80 (S3.3). Owner literal ask (charter:9): only 1,500 words unlocked.
ADR-003:6: the literal reading of only have access to 1,500. 1,702 to 80 is a
20x divergence from the number the owner said, demoted to OQ-1 field-tune, never
reconciled. Owner verbatims are the acceptance oracle (Method 4) yet the one
number is overridden without the owner in the loop.

## F4 -- SERIOUS: empty-pool unrepresentable by construction overclaims

Cite (doc S3.5): no drill surface can render fewer words than minViable. But the
widening rung lives only in buildGenerateVocabSpamLesson (15554-15561); Random
Drill (S3.4 row, 15107 region) has none. getActiveWords applies theme filters
(index.html:3569-3572); if the 80 frontier is global deck order, frontier
intersect niche-theme can empty -- the v7.68 bug shape, not killed by
construction.
## F5 -- SERIOUS: audio-only false-teach drops the evidence line

Cite (doc S4.5.4): the spoken line always names the heard form, so audio-only
users get the evidence. Contradicted by (doc S4.6) template: More natural:
tabeta, past tense -- which names better, NOT the heard form. The app is
hands-free audio-led; the core user then gets a confident correction with zero
signal the phone misheard -- the worse-than-silence failure the charter bans.

## F6 -- QUESTIONABLE: is the hard lock more than a relabeled meter?

Cite (doc L3): the lock has no refusal path; and S3.7: the meter is re-labelled,
not replaced. If speech never blocks, browse adds in one tap, and thin pools
auto-widen-unlock, the only real teeth is narrowing the Random Drill / Spam
random draw from 1,702 to 80. The rest is the coverage meter with new labels.
The owner may read it as the non-locking meter ADR-003 already shipped in a lock
costume.

## F7 -- QUESTIONABLE: sensei ships before its base is ever validated

Cite (doc S6): the ADR-011 keyed session runs after S1+S2 -- so the teaching
surface ships to users first, atop an F2 layer that has NEVER been keyed. The
doc is honest and gives dial-back levers (S4.8); a sequencing risk, not a defect.

## Verdict: FAIL

F1 is fatal: the loop unlock arrow does not close through speech. F2/F5 leave
the false-teach defenses overstated for the audio-first user. F3/F4 show a 20x
divergence from the owner number and a surviving empty-pool class. Resolve
F1/F2/F5 before this becomes a forge brief.
