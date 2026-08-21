# Isshin 30s demo video — production script

> Quality-bar status: judge-panel round 4, weighted 8.06/10, all criteria ≥7 (2026-08-21).
> Judged per docs/quality-bar.md G2; scheduling claims verified against index.html smGrade.


Concept: narration-free — the only voice in the entire video is the app's own real neural TTS. Captions are the primary track (muted-first design); sparse real-app SFX and a low ambient bed. All UI footage is genuine Playwright capture of the live app at 412×915. TWO real capture sessions prove the spacing claim, with the time-jump disclosed on screen.

## MASTER-30S

| Time | On screen | Audio | Caption (distinct card style — visibly NOT app UI) |
|---|---|---|---|
| 0:00–0:03 | Pure black; a thin waveform pulses once with the word. No UI, no logo. | App's real TTS, clean and close: 「みず」 — then true silence. | beat 1: "You know this one." · beat 2: "Say it — out loud." |
| 0:03–0:06 | Hard cut to real app capture (412×915): dark-purple word card 「みず」, the thinking-gap pulse ring running. | Silence holds — the gap IS the point. | "It waits while you think. Hands free." |
| 0:06–0:09 | Real reveal: "water" fades in under the kana; card auto-advances; a genuinely new card slides in and 「コーヒー」 plays. | The app's own soft chime, once; TTS speaks the new word. | "みず = water — then it moves on by itself" |
| 0:09–0:12 | Capture continues: the 😬🙂💪 self-rating row gets one tap (🙂); next word begins. | Single tap SFX. | "No grades. You rate yourself." |
| 0:12–0:16 | Full-frame disclosure card: "THE NEXT DAY — real session", then a SECOND genuine capture session: 「みず」 returns; the reveal comes fast. | TTS: みず again; one soft early ding on the quick answer. | "Same word, back before it fades. You already had it." |
| 0:16–0:20 | Capture shrinks to a corner thumbnail (PiP scale-down of the same capture) over plain dark ground — the drill audibly KEEPS RUNNING in the corner, unattended, while two caption cards land. | The drill's own TTS continues quietly from the corner (real session audio, uncut) — proof it runs without being watched. | "It runs wherever you already are." → "Where will yours run?" |
| 0:20–0:24 | The phone frame morphs into a simple browser-address-bar motif; no store badge anywhere. | Quiet. | "No download. It's a web page. Open it and start talking." |
| 0:24–0:30 | Static end card: いっしん Isshin wordmark + URL + "Free right now — early access." | One soft chime, then silence. | "jvrj.github.io/japanese-trainer" |

Structure notes: in the default cold-open cut the loop is audible at literal second zero (when a pain hook replaces the cold open, the app's voice first lands at ~0:06 and the captions carry the opening); the objection beat ("but will I actually learn?") is answered by the 0:12–0:16 recurrence — one small checkable claim (the word comes back before you'd forget it), proven with a real second session rather than asserted. During the 0:03–0:06 thinking gap the app's REAL pulse-ring animation is on screen, so a muted or scrubbed-in viewer sees a designed pause, never dead air. The 0:16–0:20 beat plants the routine by INFERENCE, not assertion, and is deliberately HOOK-AGNOSTIC: the drill visibly and audibly keeps running in a corner thumbnail with nobody touching it (the proof it needs no eyes or hands), the first card supplies the universal premise — "It runs wherever you already are." — and the closing question — "Where will yours run?" — makes the viewer name their own car / walk / dishes. Because the premise card introduces the where-concept itself, the close coheres identically behind every hook, routine-flavoured (commute, screen fatigue, podcasts) or frustration-flavoured (review debt, price, streaks); the body never depends on the hook's vocabulary, which is what keeps the A/B isolation clean.

## HOOKS — 6 isolated 3s variants

Locked template (hook-isolation rigor): same black frame, same waveform style, same two-beat caption grid (setup card ~0.8s in, punch card ~1.9s in), same SFX bed level, hard cut at 3.0s. ONLY the pain text and one signature sound change — the A/B measures the pain, not the production.

1. **Commute dead time** — "20 minutes in the car." / "0 words spoken." · turn-signal tick.
2. **Review debt** — "1,847 cards due." / "I haven't opened it in 9 days." · one dull notification ping, then silence.
3. **Screen fatigue** — "Another screen?" / "After 9 hours of screens?" · a single face-down buzz.
4. **Passive listening** — "6 months of podcasts." / "0 sentences I can say." · a self-recorded unintelligible radio-murmur bed fading to silence (own recording — no licensed audio, no content-ID exposure).
5. **Paying without speaking** — "$240 a year on language apps." / "Never once out loud." · a single card-tap.
6. **Streak guilt** — "Day 412." / "Still can't order food." · a small flame-chime, then silence. SPEC RULE (binding, in-caption-layer, not a footnote): this variant depicts the viewer's CURRENT generic streak app; the caption layer for this hook may never contain the word "Isshin" or any "no streak(s)" phrasing — Isshin itself has an opt-in streak toggle.

## MUTED-FEED PLAN
There is no narration, so muted IS the native experience: captions are the primary track, not subtitles of one. Two-beat setup/punch cards give every second a read rhythm; the waveform pulses only on discrete sound events, and the app's real pulse-ring animates on screen through the 0:03–0:06 gap, so the silence reads as intentional, not a load error — even for a viewer who scrubs in mid-clip. Real app text (kana card, gloss, 😬🙂💪 row) is legible at 412×915 without duplicate captions, so caption cards always add NEW information. The 0:16–0:20 premise + question cards ("It runs wherever you already are." / "Where will yours run?") are pure text, so the routine plant never depends on sound.

## PRODUCTION NOTES
- Assets used, and nothing else: Playwright/headed-Chrome captures of the LIVE app (two sessions — the second timed so 「みず」 is genuinely due again), the app's real TTS audio, sparse royalty-free or self-recorded SFX (turn-signal, ping, buzz, tap, chime, murmur bed), caption/waveform graphics, simple pans/zooms and picture-in-picture scaling/positioning of the same capture. No actor, no location footage, no stock video, no synthetic narrator.
- Caption cards use a distinct rounded-sans style on black, clearly not app chrome — never composite text styled like the real UI over capture (a lookalike overlay asserting anything is the fatal trap).
- The time-jump is disclosed ON SCREEN ("THE NEXT DAY — real session"), never only in production notes a viewer can't see.
- VERIFIED SCHEDULING FACTS (from the shipped code, index.html smGrade): new cards run Anki-style learning steps of 1 / 5 / 15 minutes, then graduate to SM-2 at ~25 min × ease — so every word drilled in session 1 is GENUINELY due again by the next day. A real 24-hour wait makes "THE NEXT DAY — real session" literally true with no compression and no simulated state. If production logistics rule out even that wait, use a second prepared profile that was drilled a day earlier in real time (still no state editing), or soften the label to "LATER — real session".
- PRE-SHOOT CHECKLIST (run on capture day, against the LIVE build): re-verify the learning-step intervals in smGrade (1/5/15min, graduation ~25min × ease) still hold; confirm the TTS-led auto-advance drill runs unattended; confirm the pulse-ring gap animation renders. The recurrence proof couples to the live app's SRS internals — never capture against an unverified build.
- KNOWN RISKS & HANDLING: (1) headless Chromium may not emit TTS audio — the PRIMARY capture path is headed Chrome with system-audio loopback recorded in the same take (video and audio synchronized by construction); the separate-mux path is FALLBACK only, and if used, the app's own reveal chime serves as the sync marker to align audio to the on-screen reveal frame; (2) the second capture session uses a prepared profile whose SRS schedule genuinely has 「みず」 due — set up by drilling it in session 1 and waiting past its real interval; no storage editing, no simulated state; (3) if that wait has to be compressed for logistics, the on-screen label in the MASTER softens to "LATER — real session", and every cut inherits the label exactly as captured (see 15s-cut); (4) end-card URL set large (≥28px at 1080-wide equivalent) so it survives feed compression; (5) the end card ("Free right now — early access") is rendered as a separate 6s template segment so it can be re-rendered alone — refresh trigger: the day paid launch ships, this segment is regenerated before any further ad spend, with no re-capture of the app footage needed.

## 15S-CUT (TikTok/IG)
Keep: 0:00–0:09 (cold open + gap + reveal + auto-advance) → one 1.5s recurrence card that REUSES the master's time-jump label exactly as captured ("THE NEXT DAY — real session" or the softened "LATER — real session" — never a stronger claim than the master's) + "— already knew it." → 0:20–0:24 CTA compressed to ~2.5s → end card ~2s. Drop: the rating-row beat and the unattended-corner beat (the tested hook carries the routine in this length). Same locked caption template throughout.
