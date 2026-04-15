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

Log failures in a note inside the Notes folder so next session can fix.
