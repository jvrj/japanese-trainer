/* Morning-check grader probe — v9.39.
   Every word with a kanji form must pass when typed as romaji, hiragana,
   katakana or kanji; spaced phrases must pass with or without the spaces;
   wrong words, empty input and near-misses must fail.
   Usage: node scripts/probe-cold-scripts.cjs */
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require(path.resolve('C:/Users/Julius/Documents/GitHub/node_modules/playwright'));
const ROOT = path.resolve(__dirname, '..');
const PORT = 8998;

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
  const p = await (await b.newContext({ viewport: { width: 393, height: 852 }, isMobile: true })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'load' });
  await p.waitForTimeout(2500);

  const r = await p.evaluate(() => {
    const toKata = s => s.replace(/[\u3041-\u3096]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0x60));
    const words = state.words.filter(w => w && w.jp && w.romaji);
    const withKj = words.filter(w => w.kj && w.kj !== w.jp);
    const spaced = words.filter(w => / /.test(w.jp));
    const alt = words.filter(w => w.kj && /、/.test(w.kj));
    const out = { total: words.length, withKj: withKj.length, spaced: spaced.length, alt: alt.length,
                  fails: [], checks: 0 };
    const expect = (w, typed, want, label) => {
      out.checks++;
      const got = coldAnswerMatches(typed, w);
      if (got !== want) out.fails.push(label + ': ' + JSON.stringify(typed) + ' for ' + w.jp + (w.kj ? ' / ' + w.kj : '') + ' → ' + got + ', wanted ' + want);
    };
    withKj.forEach(w => {
      expect(w, w.romaji, true, 'romaji');
      expect(w, w.jp, true, 'hiragana');
      expect(w, toKata(w.jp), true, 'katakana');
      expect(w, w.kj.split(/[、,\/／]/)[0], true, 'kanji');
      expect(w, w.jp + 'ん', false, 'near-miss');
      expect(w, '', false, 'empty');
    });
    spaced.forEach(w => {
      expect(w, w.jp, true, 'spaced as written');
      expect(w, w.jp.replace(/ /g, ''), true, 'spaces removed');
      expect(w, w.jp.replace(/ /g, '\u3000'), true, 'fullwidth spaces');
    });
    alt.slice(0, 20).forEach(w => {
      w.kj.split('、').forEach(f => expect(w, f, true, 'kanji alternate'));
    });
    // wrong-word negatives, sampled
    for (let i = 0; i < 200; i++) {
      const a = withKj[(i * 37) % withKj.length], c = withKj[(i * 53 + 11) % withKj.length];
      if (a.jp !== c.jp && a.kj !== c.kj) { expect(a, c.jp, false, 'other word kana'); expect(a, c.kj, false, 'other word kanji'); }
    }
    // romaji path untouched
    const nk = words.find(w => w.romaji === 'neko') || words[0];
    expect(nk, nk.romaji.toUpperCase(), true, 'romaji upper');
    expect(nk, ' ' + nk.romaji + ' ', true, 'romaji padded');
    return out;
  });

  await b.close(); srv.close();
  console.log('\nMORNING CHECK — scripts accepted (v9.39)');
  console.log('words ' + r.total + ' | with kanji ' + r.withKj + ' | spaced phrases ' + r.spaced + ' | kanji alternates ' + r.alt);
  console.log('checks ' + r.checks + ' | failures ' + r.fails.length);
  r.fails.slice(0, 25).forEach(f => console.log('  - ' + f));
  if (r.fails.length > 25) console.log('  … ' + (r.fails.length - 25) + ' more');
  console.log('page errors ' + (errs.length ? errs.join(' | ') : 'none'));
  const bad = r.fails.length || errs.length;
  console.log('\n' + (bad ? 'PROBLEMS: yes' : 'PROBLEMS: none'));
  process.exit(bad ? 1 : 0);
})();
