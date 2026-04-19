# Manual regression checklist

Run after every deploy. Takes ~3 minutes.

1. **PWA loads** — open https://jvrj.github.io/japanese-trainer/ on phone home-screen icon, loads offline too
2. **Drill works** — tap Drill, see a card, answer correctly, see green feedback
3. **Wrong answer → smart feedback** — type a wrong word that IS in the deck, verify it shows what you typed means
4. **TTS** — tap speaker icon, hear ja-JP pronunciation
5. **Voice input** — tap mic, speak the word, see transcript + match result
6. **Export JSON** — Settings → Export → file downloads with deck + stats + notes
7. **Import JSON** — import the file back, data restored
8. **Notes** — tap 💭 floating button, type note, save, see it in list
9. **Mastery ladder** — after a few correct answers on same word, mastery stage visibly progresses
10. **Conversation Mode** — tap Convo, pick a scenario, see dialogue, TTS works on lines
11. **Streak** — complete a session, streak increments; open next day, still there
12. **Tag filter** — Settings → enable N5 pack → drill by theme (food only)
13. **Service worker update** — push a change, reload once, updated version appears (no stuck on old)
14. **Kana Blitz — hiragana** — Home → ひらがな. See a hiragana character at 120px, type romaji, green feedback on correct. Streak counter increments in the reveal screen.
15. **Kana Blitz — katakana retirement** — run Katakana Blitz, hit a 5-streak on one character, verify the tally shows "retired" on completion. Close the app, reopen, verify retirement persists (localStorage `jp4_kana_stats`).
16. **Kana Blitz — confusion pair** — deliberately type "tsu" when seeing シ. Fail card should mention ツ. Verify the next card (or one of the next two) is ツ.
17. **Kana Blitz — actually renders** — on ひらがな tap, confirm you land on a Kana Blitz screen (120px character + romaji input), NOT the home screen. If home shows, the dispatcher wiring is broken.
18. **Tutor register-tagging** — ask tutor "how do I say thank you?". Reply includes `[casual]`, `[polite]`, or `[formal]` tags on its Japanese examples. No kanji anywhere in the reply, including inside brackets.
19. **Tutor error-pattern recognition** — ask "what's the difference between に and で?". Reply is direct and concise (not a textbook lecture) with examples on both.
20. **Icon and name** — home screen icon on Pixel shows red 刀 on white. App title on home screen reads "Isshin". Header inside app reads "Isshin", subtitle shows "一心 · v5.0".
21. **Version freshness** — Settings → About card shows `v5.0`. If it still says v4.x, the service worker is serving stale cache — do a hard reload.

Log failures in a note inside the Notes folder so next session can fix.
