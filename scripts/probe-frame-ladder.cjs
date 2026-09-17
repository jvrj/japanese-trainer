/* Verifies the v9.36 word-by-word ladder in the real DOM. */
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require(path.resolve('C:/Users/Julius/Documents/GitHub/node_modules/playwright'));
const ROOT = 'C:/Users/Julius/Documents/GitHub/japanese-trainer';
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

  const bad = [];
  const r = await p.evaluate(() => {
    const out = { frames: {} };
    state.settings.ownerMode = true;
    state.settings.onboard.done = true;
    // Speech must never actually fire in a headless probe.
    window.speechSynthesis.speak = function () {};
    const before = JSON.stringify({ s: state.stats, k: state.streak, ls: localStorage.length });

    ['yori', 'move', 'where', 'hougaii'].forEach(function (id) {
      frameStart(id);
      const rec = { steps: [], parts: _frUi.cards[0].parts.map(x => x.s) };
      rec.startStep = _frUi.step;
      rec.buildDefault = _frUi.build;
      const bigText = () => document.getElementById('fr-sentence').innerText.replace(/\s+/g, '');
      rec.steps.push(bigText());
      for (let i = 1; i < rec.parts.length; i++) { frameFwd(); rec.steps.push(bigText()); }
      rec.whole = bigText();
      rec.expected = rec.parts.join('').replace(/\s+/g, '');
      rec.labelAtWhole = (document.getElementById('fr-fwd').innerText.indexOf('Next') !== -1);
      // legal-set membership of the assembled sentence
      const f = FRAME_ROUNDS.find(x => x.id === id);
      rec.legal = f.enumerate().map(s => s.replace(/\s+/g, '')).indexOf(rec.whole.replace(/\s+/g, '')) !== -1;
      // skeleton hidden until whole
      frameStart(id);
      rec.skeletonAtStep1 = document.querySelector('#main').innerText.indexOf(_frUi.skeleton) !== -1;
      out.frames[id] = rec;
    });

    // speed control
    out.rateDefault = _frRateKey;
    frameSetRate('full'); out.rateAfter = _frRateKey;
    frameSetRate('slow');

    // skip-the-build toggle
    frameStart('yori');
    frameToggleBuild();
    out.afterToggleWhole = document.getElementById('fr-sentence').innerText.replace(/\s+/g, '')
      === _frUi.cards[0].parts.map(x => x.s).join('').replace(/\s+/g, '');
    out.after = JSON.stringify({ s: state.stats, k: state.streak, ls: localStorage.length });
    out.zeroWrite = out.after === before;
    return out;
  });

  console.log('\nWORD-BY-WORD LADDER — v9.36\n');
  Object.keys(r.frames).forEach(id => {
    const f = r.frames[id];
    console.log('--- ' + id);
    console.log('    starts at step        ' + f.startStep + (f.startStep === 1 ? '' : '  *** should be 1 ***'));
    console.log('    build on by default   ' + f.buildDefault);
    console.log('    skeleton hidden @1    ' + (!f.skeletonAtStep1) + (f.skeletonAtStep1 ? '  *** shown too early ***' : ''));
    f.steps.forEach((s, i) => console.log('      ' + (i + 1) + '. ' + s));
    console.log('    assembles to expected ' + (f.whole === f.expected));
    console.log('    in legal set          ' + f.legal);
    console.log('    button says Next      ' + f.labelAtWhole);
    if (f.startStep !== 1) bad.push(id + ': does not start at one word');
    if (!f.buildDefault) bad.push(id + ': build-up not default');
    if (f.skeletonAtStep1) bad.push(id + ': skeleton shown before the sentence is whole');
    if (f.whole !== f.expected) bad.push(id + ': assembled sentence != parts');
    if (!f.legal) bad.push(id + ': assembled sentence not in the legal set');
    if (f.steps.length !== f.parts.length) bad.push(id + ': step count != slot count');
    if (f.steps[0].length >= f.expected.length) bad.push(id + ': first step already shows the whole sentence');
  });
  console.log('\nspeed default        ' + r.rateDefault + (r.rateDefault === 'slow' ? '' : ' *** should be slow ***'));
  console.log('speed switches       ' + (r.rateAfter === 'full'));
  console.log('skip-build works     ' + r.afterToggleWhole);
  console.log('zero-write           ' + r.zeroWrite);
  console.log('page errors          ' + (errs.length ? errs.join(' | ') : 'none'));
  if (r.rateDefault !== 'slow') bad.push('speed does not default to slow');
  if (r.rateAfter !== 'full') bad.push('speed control does not switch');
  if (!r.afterToggleWhole) bad.push('skip-the-build does not show the whole sentence');
  if (!r.zeroWrite) bad.push('NOT zero-write');
  if (errs.length) bad.push('page errors: ' + errs.join(' | '));

  await p.screenshot({ path: process.argv[2] || 'ladder.png' });
  await b.close(); srv.close();
  console.log('\n' + (bad.length ? 'PROBLEMS:\n  - ' + bad.join('\n  - ') : 'PROBLEMS: none'));
  process.exit(bad.length ? 1 : 0);
})();
