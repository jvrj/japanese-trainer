# Talk rig — the real call, run from the PC

Runs the live teacher END TO END from this computer: real backend, real OpenAI
call over WebRTC, a recorded learner voice played into a fake microphone,
every event traced, transcripts + reply-latency printed. Costs a few cents of
OpenAI credit per run (about 5–8 c per 45 s on the full engine).

    powershell -File scripts/talk-rig/make-learner-wav.ps1     # once, makes the WAVs
    node scripts/talk-rig/real-call.cjs 45                      # learner.wav, full engine
    node scripts/talk-rig/real-call.cjs 60 learner2.wav         # harder recording
    ENGINE=mini node scripts/talk-rig/real-call.cjs 45          # the cheaper engine
    SILENT_FIRST=1 node scripts/talk-rig/real-call.cjs 30       # silent first mic -> auto-switch
    TRACE=1 node scripts/talk-rig/real-call.cjs 30              # print every event

Needs: the keys file at Documents/isshin-keys.txt (line "app soft secret: …",
read by node, never printed) and the talk-token function accepting the owner
caller. Audio is muted three ways; nothing plays on the headset.
`kana-unit.cjs` checks the kanji→kana swap on transcripts (no OpenAI cost).
