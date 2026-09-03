# WordStick demo video — script + cut plans (drafted 3 Sep 2026)

One phone shoot → two cuts:
- **Ad cut** — 15–30s, portrait 9:16, for the $150 Facebook ads test.
- **Landing cut** — 30–60s "how it works", muted autoplay MP4 at the top of wordstick.app.

Both are watched **muted** (FB feeds and muted autoplay), so the CAPTIONS carry the
whole message. Copy rules (locked): lead with the vocab outcome + the
remember-it mechanism, in total-beginner words. Never say SRS, kana, deck,
spaced repetition. The commute is only the "how", never the headline.

---

## Pre-shoot checklist (add to the DO_THIS_NEXT Step 5 setup)

- App shows **WordStick** + the Sticker W icon (v8.82/v8.85 — done, verified).
- Your real account with real progress — the "words that stick" count must be
  a believable non-zero number, not 0 and not 2,000.
- Do Not Disturb ON · notifications cleared · battery comfortably charged
  (a red battery icon in the status bar reads as sloppy).
- Screen record with **Device audio** ON (the app's voice is the star even
  though the cuts run muted — we keep sound for people who unmute).
- Record every take **twice**. Storage is cheap; reshoots aren't.

## Takes (the existing 3 + one new)

- **Take 1 — the drill** (unchanged, DO_THIS_NEXT Step 5): icon tap → 8–10
  natural drill steps → 😬🙂💪 check-in → land on Home with the count visible.
- **Take 2 — the tour** (unchanged): slow Home scroll → road screen → back.
- **Take 3 — the front door** (unchanged): incognito → app.wordstick.app →
  welcome sits 5s → tap Sign up free → stop before typing.
- **Take 4 — Sentences (NEW, ~1 min, record once):** Home → tap the
  **Sentences** row → do ONE **Fill the gap** question at natural pace
  (picture → tap the right word → reveal) → back → one **Make a sentence**
  (drag/tap the chips into place → it auto-checks green) → stop. Two
  questions total, no menu digging. This is in the video because Sentences
  ships visible in v1 (owner call, 3 Sep).

---

## CUT A — Facebook ad (~25s, 9:16)

Fast, honest, no music needed (FB adds none; muted anyway). Captions big,
bottom-third, 3–7 words per card.

| Time | Footage | Caption on screen |
|---|---|---|
| 0–3s | Take 1 mid-drill — a word PLAYS and you answer out loud (start mid-action, not the icon tap) | **Learning Japanese? Make it actually stick.** |
| 3–8s | Take 1 continues — answer → reveal → next word, real pace | **Hear a word. Say it. Done — hands-free.** |
| 8–13s | Take 1 — a word you got wrong comes back around | **It brings each word back right before you'd forget it.** |
| 13–18s | Take 4 — the Make-a-sentence chips snap into place, green check | **Then you use your words in real sentences.** |
| 18–22s | Take 1 end — Home with the "words that stick" count | **30 words at a time, until they stick.** |
| 22–25s | Take 3 — welcome screen at app.wordstick.app | **Try it free for 7 days → wordstick.app** |

Notes: the hook must land inside 2 seconds — that's why we open mid-drill,
voice playing, not on a logo. If a 15s version is needed for testing, cut
rows 3 and 4 (keep hook → hands-free → count → CTA).

## CUT B — Landing "how it works" (~50s, muted autoplay)

Calmer pace, same caption rules. This sits above the fold on wordstick.app,
so it must make sense with zero sound and zero context.

| Time | Footage | Caption on screen |
|---|---|---|
| 0–4s | Take 3 — welcome screen, then cut to Take 1 icon-tap open | **This is WordStick. Here's the whole app in under a minute.** |
| 4–14s | Take 1 — 3–4 full drill steps: word plays → you answer aloud → reveal | **It says a Japanese word. You say what it means. That's the drill.** |
| 14–22s | Take 1 — keep drilling, phone clearly not being touched between answers | **Totally hands-free — it runs while you drive, walk, or do dishes.** |
| 22–30s | Take 1 — the 😬🙂💪 round-end check-in, tap one | **You tell it how well you knew each word — it plans what comes back.** |
| 30–38s | Take 4 — one Fill-the-gap question, picture → tap → reveal | **Your words show up in real sentences, so they're not just flashcards.** |
| 38–45s | Take 2 — Home scroll ending on the words-that-stick count, then the road screen | **Every word you keep is counted. Watch the number climb.** |
| 45–50s | Take 3 — Sign up free button | **7 days free. Cancel anytime.** |

## Caption bank (spares, same voice — swap in if a beat runs long)

- **No flashcards to tap. No streak guilt. Just words that stay.**
- **Five minutes a day is enough — it does the remembering schedule for you.**
- **Real Japanese from day one — spoken out loud, not memorised silently.**

## Editing (fits the $0-fixed-cost rule)

- **CapCut mobile (free)** on the Pixel: import takes → split → captions →
  export 1080p. Both cuts are straight cuts, no effects, no music.
- Export the landing cut ALSO as a compressed MP4 ≤ 6 MB if possible
  (muted autoplay must load fast); Claude can do the compression pass with
  ffmpeg once the file is in `video_raw\`.
- Raw takes go in `Documents\GitHub\japanese-trainer\video_raw\` (kept out
  of the public code) — then tell Claude and the caption timing gets fitted
  to the real footage.
