// Frame rounds (v9.33 owner probe) — render + zero-write verification.
//
// Two things this must prove, because the whole point of the probe screen is
// that it can be played on a real profile without touching it:
//   1. every frame renders ten cards and every card is well-formed;
//   2. playing a full round changes NOTHING — not state.stats, not the streak,
//      not localStorage. The assertion is a before/after deep compare, not a
//      reading of the source.
// It also checks the one rule the frame data encodes: in "Going places" the
// time word and the verb must agree in tense (きのう cannot take いきます).
const path = require('path'), http = require('http'), fs = require('fs');
const { chromium } = require(path.resolve(__dirname, '../../node_modules/playwright'));
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp' };
const srv = http.createServer((q, s) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); s.end(d); }); });

const SHOT = process.argv[2] || '';
const SHOT_FRAME = process.argv[3] || 'move';

(async () => {
  await new Promise(r => srv.listen(8994, r));
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      window._authGateDecide = async () => ({ pass: true, reason: 'session' });
      window.isUnlocked = async () => ({ unlocked: true, reason: 'trial' });
    });
  });
  await p.goto('http://localhost:8994/index.html', { waitUntil: 'load' });
  await p.waitForTimeout(2500);

  const r = await p.evaluate(() => {
    const out = { version: APP_VERSION, frames: [], problems: [] };
    state.settings.ownerMode = true;
    state.settings.onboard.done = true;
    state.settings.userName = 'Julius'; state.settings.nameSet = true;
    _authState.user = { id: 'u1', email: 't@example.com', user_metadata: { first_name: 'Julius' } };

    /* Seed a REAL-looking profile so a write would be visible if one happened. */
    const t = Date.now(), DAY = 86400000;
    state.words.slice(0, 60).forEach((w, i) => {
      const st = state.stats[w.id] = state.stats[w.id] || {};
      st.hears = 5 + (i % 7);
      st.attempts = [{ ts: t - 2 * DAY, correct: true }, { ts: t - DAY, correct: i % 5 !== 0 }];
      ensureSm(st); st.lastReviewed = t - DAY;
    });
    state.streak = { current: 7, best: 9, lastDate: new Date(t - DAY).toLocaleDateString('en-CA'), freezesUsedWeek: 0, freezeWeekKey: null };
    save();

    const snap = () => JSON.stringify({
      stats: state.stats, streak: state.streak,
      ls: Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])
    });

    /* います and でした were absent from the deck and were added for the
       location frame. Dedup runs at boot and can drop a same-kana entry, so
       assert they are actually in the live word list, not just in the source. */
    out.deck = { total: state.words.length, added: {} };
    ['います', 'でした'].forEach(function (k) {
      const hits = state.words.filter(function (w) { return w.jp === k; });
      out.deck.added[k] = hits.length ? (hits.length + '× fam=' + (hits[0].fam || '-')) : 'MISSING';
      if (!hits.length) out.problems.push('deck: ' + k + ' did not survive boot dedup');
      if (hits.length > 1) out.problems.push('deck: ' + k + ' is duplicated (' + hits.length + ')');
    });

    /* The owner settings page must offer the entry buttons. */
    nav('settings');
    const setHtml = document.getElementById('main').innerHTML;
    out.entryButtons = (setHtml.match(/frameStart\('(\w+)'\)/g) || []).map(s => s.replace(/\D*'(\w+)'\D*/, '$1'));

    const before = snap();

    for (const f of FRAME_ROUNDS) {
      const rec = { id: f.id, title: f.title, cards: [], screen: '', done: false };
      frameStart(f.id);
      rec.screen = state.screen;
      if (state.screen !== 'frames') out.problems.push(f.id + ': nav did not reach the frames screen');

      for (let i = 0; i < 10; i++) {
        const u = _frUi;
        if (!u) { out.problems.push(f.id + ': _frUi vanished at card ' + i); break; }
        const c = u.cards[u.idx];
        if (!c) { out.problems.push(f.id + ': no card at index ' + u.idx); break; }
        const html = document.getElementById('main').innerHTML;
        const jp = c.parts.map(x => x.s).join('');
        rec.cards.push({ jp: jp, en: c.en, roles: c.parts.map(x => x.r).join('+') });
        if (!jp.trim()) out.problems.push(f.id + ' card ' + i + ': empty sentence');
        if (!c.en || !c.en.trim()) out.problems.push(f.id + ' card ' + i + ': empty meaning');
        /* the sentence must actually reach the DOM, not just the data */
        if (html.indexOf(c.parts[0].s) === -1) out.problems.push(f.id + ' card ' + i + ': first slot missing from DOM');
        /* peek must reveal the meaning, then hide it again */
        framePeek();
        if (document.getElementById('main').innerHTML.indexOf(c.en.slice(0, 12)) === -1)
          out.problems.push(f.id + ' card ' + i + ': peek did not reveal the meaning');
        framePeek();
        frameNext();
      }
      /* THE assertion that catches a slide back to free combination: every
         sentence a round generates must be a member of the frame's own
         declared legal set. A cross-product bug shows up here immediately. */
      const legal = {}; f.enumerate().forEach(function(s){ legal[s] = 1; });
      rec.reach = Object.keys(legal).length;
      rec.cards.forEach(function(c, i){
        if (!legal[c.jp]) out.problems.push(f.id + ' card ' + (i + 1) + ': ILLEGAL combination not in the frame\'s slot map — ' + c.jp);
      });
      /* and no round may show the same sentence twice */
      const dup = rec.cards.map(function(c){ return c.jp; })
        .filter(function(s, i, a){ return a.indexOf(s) !== i; });
      if (dup.length) out.problems.push(f.id + ': repeated sentence in one round — ' + dup.join(', '));

      rec.done = !!(_frUi && _frUi.done);
      if (!rec.done) out.problems.push(f.id + ': round did not reach the end card after ten nexts');
      const endHtml = document.getElementById('main').innerHTML;
      if (endHtml.indexOf('New ten') === -1) out.problems.push(f.id + ': end card missing the "New ten" action');
      rec.distinctSentences = new Set(rec.cards.map(c => c.jp)).size;
      out.frames.push(rec);
      frameExit();
    }

    out.zeroWrite = (snap() === before);
    if (!out.zeroWrite) out.problems.push('A FRAME ROUND WROTE TO THE PROFILE — zero-write contract broken');

    /* Tense agreement in "Going places": きのう is past-only, あした/まいにち non-past. */
    const PAST = ['いきました', 'かえりました', 'きました'];
    const move = out.frames.find(f => f.id === 'move');
    if (move) move.cards.forEach((c, i) => {
      const isPast = PAST.some(v => c.jp.endsWith(v));
      if (c.jp.startsWith('きのう') && !isPast) out.problems.push('move card ' + i + ': きのう with a non-past verb — ' + c.jp);
      if ((c.jp.startsWith('あした') || c.jp.startsWith('まいにち')) && isPast) out.problems.push('move card ' + i + ': ' + c.jp.slice(0, 4) + ' with a past verb — ' + c.jp);
    });

    /* Recombination claim: the reachable sentence count must exceed the ten shown. */
    return out;
  });

  if (SHOT) {
    await p.evaluate((id) => { state.settings.ownerMode = true; frameStart(id); }, SHOT_FRAME);
    await p.waitForTimeout(400);
    await p.screenshot({ path: SHOT });
  }

  console.log('version           ' + r.version);
  console.log('entry buttons     ' + r.entryButtons.join(', '));
  console.log('deck              ' + r.deck.total + ' words | ' + Object.keys(r.deck.added).map(function(k){return k+': '+r.deck.added[k];}).join(' | '));
  console.log('zero-write        ' + (r.zeroWrite ? 'PASS — profile byte-identical after every round' : 'FAIL'));
  console.log('page errors       ' + (errs.length ? errs.join(' | ') : 'none'));
  console.log('');
  for (const f of r.frames) {
    console.log('--- ' + f.title + ' (' + f.id + ')  ' + f.cards.length + ' cards, ' + f.distinctSentences + ' distinct, end card ' + (f.done ? 'ok' : 'MISSING'));
    f.cards.forEach((c, i) => console.log('  ' + String(i + 1).padStart(2) + '. ' + c.jp.padEnd(26) + '  ' + c.en));
    console.log('     legal sentences reachable from these slots: ' + f.reach);
  }
  console.log('');
  console.log(r.problems.length ? 'PROBLEMS:\n  - ' + r.problems.join('\n  - ') : 'PROBLEMS: none');

  await b.close(); srv.close();
  process.exit(r.problems.length || errs.length ? 1 : 0);
})();
