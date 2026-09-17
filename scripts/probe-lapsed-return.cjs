// What happens when a busy person comes back after a break?
// Seeds a realistic lapsed user (N days away, real history) and reports what
// the app shows them and what the first round is made of.
const path = require('path'), http = require('http'), fs = require('fs');
const { chromium } = require(path.resolve(__dirname, '../../node_modules/playwright'));
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp' };
const srv = http.createServer((q, s) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); s.end(d); }); });

const AWAY = Number(process.argv[2] || 14);   // days away
const TILE = process.argv[3] || 'food';
const SIZE = Number(process.argv[4] || 10);

(async () => {
  await new Promise(r => srv.listen(8993, r));
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.addEventListener('DOMContentLoaded', () => { window._authGateDecide = async () => ({ pass: true, reason: 'session' }); window.isUnlocked = async () => ({ unlocked: true, reason: 'trial' }); }); });
  await p.goto('http://localhost:8993/index.html', { waitUntil: 'load' }); await p.waitForTimeout(2500);

  const r = await p.evaluate(({ AWAY, TILE, SIZE }) => {
    const out = { version: APP_VERSION, away: AWAY, toasts: [] };
    const DAY = 86400000, t = Date.now();
    state.settings.ownerMode = false;
    _authState.user = { id: 'u9', email: 't@example.com', created_at: new Date(t - 60 * DAY).toISOString(), user_metadata: { first_name: 'Mika' } };
    state.settings.userName = 'Mika'; state.settings.nameSet = true; state.settings.onboard.done = true;
    state.settings.coach = { intro: true, card: true, reveal: true, fresh: true, end: true };
    window.buildAutoplayStep = () => {};
    const _t = window.showToast; window.showToast = (m, o) => { out.toasts.push(String(m).replace(/<[^>]*>/g, '')); try { return _t(m, o); } catch (e) {} };

    /* ---- seed a real history: 3 weeks of practice, then AWAY days of silence ---- */
    const sec = VOCAB_SECTIONS.find(x => x.id === TILE);
    const pool = _topicWords(sec);
    const wide = state.words.slice(0, 260);           // words touched across the deck
    const practised = [...new Set([...pool.slice(0, 40), ...wide])];
    let n = 0;
    for (const w of practised) {
      const st = state.stats[w.id] = state.stats[w.id] || {};
      st.hears = 4 + (n % 9);
      st.attempts = [];
      for (let k = 0; k < 4; k++) st.attempts.push({ ts: t - (AWAY + 3 + k) * DAY, correct: (n + k) % 7 !== 0 });
      ensureSm(st);
      st.smInterval = (1 + (n % 5)) * 24 * 60;        // 1–5 day intervals, in minutes
      st.lastReviewed = t - (AWAY + 3) * DAY;
      st.smNext = st.lastReviewed + st.smInterval * 60 * 1000;   // → long overdue
      n++;
    }
    /* they were mid-batch in this tile when life got busy */
    state.settings.roundSize = SIZE;
    state.settings.stickyBatch = state.settings.stickyBatch || {};
    state.settings.stickyBatch[TILE] = pool.slice(0, SIZE).map(w => w.id);
    /* streak: they had a good run, then stopped */
    state.streak = { current: 11, best: 11, lastDate: new Date(t - AWAY * DAY).toLocaleDateString('en-CA'), freezesUsedWeek: 0, freezeWeekKey: null };

    /* ---- what does the app now say? ---- */
    const overdue = [], dueToday = [];
    for (const w of state.words) {
      const st = state.stats[w.id];
      if (!st || !st.attempts || !st.attempts.length) continue;
      ensureSm(st);
      if (st.smNext <= t) { overdue.push(w); if (st.smNext > t - 2 * DAY) dueToday.push(w); }
    }
    out.practisedWords = practised.length;
    out.overdueTotal = overdue.length;
    out.overdueInTile = overdue.filter(w => pool.some(x => x.id === w.id)).length;
    out.tilePool = pool.length;

    out.streakBefore = { current: state.streak.current, last: state.streak.lastDate };

    /* home screen */
    nav('home'); render();
    out.homeText = (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 700);

    /* open the tile they were mid-way through */
    startTopicHandsFree(TILE);
    const ids = state.buildMode.lesson.cycles[0].steps.map(s => s.word_id);
    const byId = new Map(state.words.map(w => [w.id, w]));
    out.roundSize = ids.length;
    out.round = ids.map(id => {
      const w = byId.get(id), st = state.stats[id];
      const seen = !!(st && st.attempts && st.attempts.length);
      return { jp: w.jp, en: w.en, status: !seen ? 'NEW' : (st.smNext <= t ? 'overdue ' + Math.round((t - st.smNext) / DAY) + 'd' : 'not due') };
    });
    out.newInRound = out.round.filter(x => x.status === 'NEW').length;
    out.overdueInRound = out.round.filter(x => x.status.startsWith('overdue')).length;
    out.samePinned = ids.every(id => state.settings.stickyBatch[TILE].includes(id));

    /* finish the round — what happens to the streak? */
    try { updateStreak(true); } catch (e) {}
    out.streakAfter = { current: state.streak.current, last: state.streak.lastDate };
    return out;
  }, { AWAY, TILE, SIZE });

  await b.close(); srv.close();

  console.log(`\nAPP ${r.version}  ·  away ${r.away} days  ·  tile ${TILE}  ·  round ${SIZE}\n`);
  console.log(`history: ${r.practisedWords} words practised · tile pool ${r.tilePool}`);
  console.log(`OVERDUE on return: ${r.overdueTotal} words total, ${r.overdueInTile} in this category\n`);
  console.log(`streak before: ${r.streakBefore.current} (last ${r.streakBefore.last})   →   after one correct answer: ${r.streakAfter.current}\n`);
  console.log('HOME SCREEN says:\n  ' + r.homeText + '\n');
  console.log(`FIRST ROUND BACK — ${r.roundSize} words · ${r.overdueInRound} overdue, ${r.newInRound} new · same pinned batch as before: ${r.samePinned}`);
  for (const x of r.round) console.log(`   ${x.jp}  —  ${x.en}   [${x.status}]`);
  console.log('\ntoasts: ' + JSON.stringify(r.toasts));
  console.log('errors: ' + JSON.stringify(errs));
})();
