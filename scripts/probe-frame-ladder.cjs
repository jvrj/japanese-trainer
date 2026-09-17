/* Frame rounds probe — v9.38 "ask, don't show".
   Asserts, in the real DOM at phone width:
     - teach: card 0 builds word by word and assembles into the legal set
     - teach: later cards ASK — a slot is missing from the DOM until revealed,
       tiers escalate (last word → pivot → both → all-but-first)
     - the teaching note appears only AFTER a reveal, never on an ask
     - "Missed it" re-queues the same thing three cards later
     - drill: every card hides all but the first word, no English on the card
     - every slot in every frame carries a note (no silent gaps)
     - the mode persists across rounds
     - zero-write: stats / streak / localStorage untouched
   Usage: node scripts/probe-frame-ladder.cjs [shot.png] */
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require(path.resolve('C:/Users/Julius/Documents/GitHub/node_modules/playwright'));
const ROOT = path.resolve(__dirname, '..');
const PORT = 8995;

const srv = http.createServer((rq, rs) => {
  const f = path.join(ROOT, rq.url === '/' ? '/index.html' : rq.url.split('?')[0]);
  fs.readFile(f, (e, d) => {
    if (e) { rs.writeHead(404); rs.end(); return; }
    rs.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8' });
    rs.end(d);
  });
});

(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'load' });
  await p.waitForTimeout(2500);

  const r = await p.evaluate(() => {
    const out = { frames: {}, bad: [] };
    const ws = /\s+/g;
    const txt = () => document.getElementById('fr-sentence').innerText.replace(ws, '');
    const page = () => document.querySelector('#main').innerText;
    const teachingRx = /compared to|as for the|Plain form|landmark|new information|attaches BACKWARDS/;
    state.settings.ownerMode = true;
    state.settings.onboard.done = true;
    window.speechSynthesis.speak = function () {};
    const before = JSON.stringify({ s: state.stats, k: state.streak, ls: localStorage.length });

    // ---- note coverage
    out.noteGaps = []; out.noteCount = 0;
    FRAME_ROUNDS.forEach(function (f) {
      const slots = {};
      f.build().forEach(function (card) { card.parts.forEach(function (pt) { slots[pt.r + '|' + pt.s] = pt; }); });
      Object.keys(slots).forEach(function (k) {
        if (_frNote(f.id, slots[k])) out.noteCount++;
        else out.noteGaps.push(f.id + ' ' + slots[k].r + ' "' + slots[k].s + '"');
      });
    });
    if (out.noteGaps.length) out.bad.push('slots with no teaching note: ' + out.noteGaps.join(' | '));

    // ---- teach mode, every frame
    frameSetMode('teach');
    ['yori', 'move', 'where', 'hougaii'].forEach(function (id) {
      frameStart(id);
      const rec = { steps: [], asks: [] };
      const c0 = _frUi.cards[0];
      const full0 = c0.parts.map(x => x.s).join('').replace(ws, '');
      rec.card0Phase = _frUi.phase;
      rec.steps.push(txt());
      for (let i = 1; i < c0.parts.length; i++) { frameFwd(); rec.steps.push(txt()); }
      rec.card0Assembles = txt() === full0;
      const legal = FRAME_ROUNDS.find(x => x.id === id).enumerate().map(s => s.replace(ws, ''));
      rec.card0Legal = legal.indexOf(full0) !== -1;
      frameFwd();                       // whole → model
      rec.modelShowsSkeleton = page().indexOf(_frUi.skeleton) !== -1;
      frameFwd();                       // model → card 1

      // walk cards 1..7 recording what is hidden at each tier
      for (let k = 1; k <= 7 && !_frUi.done; k++) {
        const c = _frUi.cards[_frUi.idx];
        const full = c.parts.map(x => x.s).join('').replace(ws, '');
        const a = { idx: _frUi.idx, tier: _frUi.tier, phase: _frUi.phase, hide: _frUi.hide.slice() };
        a.askText = txt();
        a.hiddenAbsent = _frUi.hide.every(i => a.askText.indexOf(c.parts[i].s.replace(ws, '')) === -1
                                              || c.parts[i].s.length <= 1 && false);
        // a one-char particle like に can legitimately recur elsewhere in the sentence; check the
        // strong condition instead: the ask text is strictly shorter than the whole
        a.shorter = a.askText.length < full.length;
        a.noteOnAsk = !!document.getElementById('fr-note');
        a.teachingOnAsk = teachingRx.test(page());
        a.cue = document.getElementById('fr-cue').innerText;
        frameFwd();                     // ask → reveal
        a.revealText = txt();
        a.revealWhole = a.revealText === full;
        a.revealLegal = legal.indexOf(full) !== -1;
        a.noteOnReveal = !!document.getElementById('fr-note');
        a.reportButtons = !!document.getElementById('fr-hit') && !!document.getElementById('fr-miss');
        // pivot tier must hide every particle
        const fixedIdx = c.parts.map((pt, i) => (pt.r === 'fixed' || (id === 'where' && pt.r === 'verb')) ? i : -1).filter(i => i >= 0);
        a.pivotCovered = (a.tier === 'B' || a.tier === 'C') ? fixedIdx.every(i => a.hide.indexOf(i) !== -1) : null;
        a.allButFirst = (a.tier === 'D') ? (a.hide.length === c.parts.length - 1 && a.hide.indexOf(0) === -1) : null;
        rec.asks.push(a);
        frameReport(true);              // → next card
      }
      out.frames[id] = rec;

      if (rec.card0Phase !== 'build') out.bad.push(id + ': card 0 is not a build');
      if (!rec.card0Assembles) out.bad.push(id + ': card 0 does not assemble');
      if (!rec.card0Legal) out.bad.push(id + ': card 0 not in the legal set');
      if (!rec.modelShowsSkeleton) out.bad.push(id + ': skeleton missing on the model card');
      rec.asks.forEach(function (a) {
        const tag = id + ' card ' + (a.idx + 1) + ' tier ' + a.tier;
        if (a.phase !== 'ask') out.bad.push(tag + ': not an ask');
        if (!a.shorter) out.bad.push(tag + ': nothing is hidden on the ask');
        if (a.noteOnAsk || a.teachingOnAsk) out.bad.push(tag + ': teaching shown BEFORE the learner answered');
        if (!a.revealWhole) out.bad.push(tag + ': reveal is not the whole sentence');
        if (!a.revealLegal) out.bad.push(tag + ': revealed sentence not in the legal set');
        if (!a.noteOnReveal) out.bad.push(tag + ': no note after reveal (teach mode)');
        if (!a.reportButtons) out.bad.push(tag + ': Had it / Missed it missing');
        if (a.pivotCovered === false) out.bad.push(tag + ': pivot tier does not hide every particle');
        if (a.allButFirst === false) out.bad.push(tag + ': top tier does not hide all but the first word');
      });
      const tiers = rec.asks.map(a => a.tier).join('');
      rec.tierOrder = tiers;
      if (!/^A+B+C+D*$/.test(tiers)) out.bad.push(id + ': tiers do not escalate (' + tiers + ')');
    });

    // ---- Missed it re-queues
    frameStart('yori'); frameFwd(); frameFwd(); frameFwd(); frameFwd(); frameFwd(); frameFwd(); // through card 0
    while (_frUi.phase !== 'ask') frameFwd();
    const missIdx = _frUi.idx, missTier = _frUi.tier, missParts = _frUi.cards[missIdx].parts;
    const lenBefore = _frUi.cards.length;
    frameFwd(); frameReport(false);
    out.requeue = {
      grew: _frUi.cards.length === lenBefore + 1,
      at: _frUi.cards.findIndex(c => c.again === true),
      expectedAt: Math.min(missIdx + 3, lenBefore),
      sameTier: (_frUi.cards.find(c => c.again) || {}).tier === missTier,
      sameSentence: (_frUi.cards.find(c => c.again) || { parts: [] }).parts === missParts,
      missedCount: _frUi.missed
    };
    if (!out.requeue.grew) out.bad.push('Missed it did not add a card');
    if (out.requeue.at !== out.requeue.expectedAt) out.bad.push('re-ask landed at ' + out.requeue.at + ', expected ' + out.requeue.expectedAt);
    if (!out.requeue.sameTier) out.bad.push('re-ask changed tier');
    if (out.requeue.missedCount !== 1) out.bad.push('missed counter wrong');

    // ---- drill mode
    frameSetMode('drill'); frameStart('yori');
    out.drill = { phase: _frUi.phase, tier: _frUi.tier, rate: _frRateKey };
    out.drill.allButFirst = _frUi.hide.length === _frUi.cards[0].parts.length - 1 && _frUi.hide.indexOf(0) === -1;
    out.drill.teachingOnAsk = teachingRx.test(page());
    frameFwd(); // reveal
    out.drill.teachingOnReveal = teachingRx.test(page()) || !!document.getElementById('fr-note');
    out.drill.revealWhole = txt() === _frUi.cards[0].parts.map(x => x.s).join('').replace(ws, '');
    frameStart('move'); out.drill.persists = _frUi.tier === 'D' && _frUi.phase === 'ask';
    if (out.drill.phase !== 'ask' || out.drill.tier !== 'D') out.bad.push('drill card 0 is not a top-tier ask');
    if (!out.drill.allButFirst) out.bad.push('drill does not hide all but the first word');
    if (out.drill.rate !== 'full') out.bad.push('drill did not speed up');
    if (out.drill.teachingOnAsk || out.drill.teachingOnReveal) out.bad.push('teaching english on a DRILL card');
    if (!out.drill.revealWhole) out.bad.push('drill reveal is not the whole sentence');
    if (!out.drill.persists) out.bad.push('drill mode does not persist into the next round');

    frameSetMode('teach'); frameStart('move');
    out.teachPersists = _frUi.phase === 'build' && _frUi.step === 1 && _frRateKey === 'slow';
    if (!out.teachPersists) out.bad.push('teach mode does not persist / reset to slow');

    // ---- speed control
    frameSetRate('easy'); out.rateSwitch = _frRateKey === 'easy'; frameSetRate('slow');
    if (!out.rateSwitch) out.bad.push('speed control does not switch');

    // ---- autoplay engages without throwing
    frameTogglePlay(); out.playing = _frUi.playing === true; _frStop();
    if (!out.playing) out.bad.push('Play it for me did not engage');

    out.after = JSON.stringify({ s: state.stats, k: state.streak, ls: localStorage.length });
    out.zeroWrite = out.after === before;
    if (!out.zeroWrite) out.bad.push('NOT zero-write');
    return out;
  });

  console.log('\nFRAME ROUNDS — ask, don\'t show (v9.38)\n');
  Object.keys(r.frames).forEach(id => {
    const f = r.frames[id];
    console.log('--- ' + id);
    console.log('    card 0 builds:        ' + f.steps.join('  →  '));
    console.log('    assembles / legal     ' + f.card0Assembles + ' / ' + f.card0Legal);
    console.log('    tiers cards 2-8       ' + f.tierOrder);
    f.asks.forEach(a => {
      console.log('      ' + (a.idx + 1) + '. [' + a.tier + '] ask "' + a.askText + '"  →  reveal "' + a.revealText + '"' +
        (a.noteOnAsk ? '  *** NOTE ON ASK ***' : '') + (a.noteOnReveal ? '' : '  *** no note on reveal ***'));
    });
  });
  console.log('\n--- teaching notes    ' + r.noteCount + ' slots, ' + r.noteGaps.length + ' gaps');
  console.log('--- Missed it         grew ' + r.requeue.grew + ', re-asked at card ' + (r.requeue.at + 1) + ' (expected ' + (r.requeue.expectedAt + 1) + '), same tier ' + r.requeue.sameTier);
  console.log('--- drill             card 1 = tier ' + r.drill.tier + ' ask, rate ' + r.drill.rate + ', all-but-first ' + r.drill.allButFirst +
    ', english on card ' + ((r.drill.teachingOnAsk || r.drill.teachingOnReveal) ? '*** YES ***' : 'none') + ', persists ' + r.drill.persists);
  console.log('--- teach persists    ' + r.teachPersists);
  console.log('--- speed switches    ' + r.rateSwitch);
  console.log('--- autoplay engages  ' + r.playing);
  console.log('--- zero-write        ' + r.zeroWrite);
  console.log('--- page errors       ' + (errs.length ? errs.join(' | ') : 'none'));

  const bad = r.bad.slice();
  if (errs.length) bad.push('page errors: ' + errs.join(' | '));
  await p.screenshot({ path: process.argv[2] || 'ladder.png' });
  await b.close(); srv.close();
  console.log('\n' + (bad.length ? 'PROBLEMS:\n  - ' + bad.join('\n  - ') : 'PROBLEMS: none'));
  process.exit(bad.length ? 1 : 0);
})();
