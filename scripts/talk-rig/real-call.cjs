/* Talk — REAL end-to-end call from this PC: real backend (owner soft-secret header added
   by the node side, never printed), real OpenAI WebRTC, fake microphone = learner.wav
   played through Web Audio. Audio output MUTED (flag + element mute); Windows TTS stubbed.
   usage: node real-call.cjs [seconds] [wav]     env TRACE=1 prints every event,
          SILENT_FIRST=1 fakes two mic devices (first silent) to test the auto-switch. */
const path = require('path'); const http = require('http'); const fs = require('fs');
const { chromium } = require(path.resolve('C:/Users/Julius/Documents/GitHub/node_modules/playwright'));
const ROOT = 'C:/Users/Julius/Documents/GitHub/japanese-trainer'; const PORT = 8994;
const WAV = process.argv[3] ? (fs.existsSync(path.resolve(process.argv[3])) ? path.resolve(process.argv[3]) : path.join(__dirname, process.argv[3])) : path.join(__dirname, 'learner.wav');
const SECONDS = Number(process.argv[2] || 45);
const SILENT_FIRST = !!process.env.SILENT_FIRST;

function secret() {
  if (process.env.APP_SOFT_SECRET) return process.env.APP_SOFT_SECRET;
  const txt = fs.readFileSync('C:/Users/Julius/Documents/isshin-keys.txt', 'utf8');
  const line = txt.split(/\r?\n/).find(l => /^app soft secret/i.test(l)) || '';
  return (line.split(/[:=]/).slice(1).join(':')).trim();
}
const SECRET = secret();
if (!SECRET) { console.error('no soft secret found'); process.exit(2); }

const srv = http.createServer((rq, rs) => {
  if (rq.url === '/learner.wav') { rs.writeHead(200, { 'Content-Type': 'audio/wav' }); fs.createReadStream(WAV).pipe(rs); return; }
  const f = path.join(ROOT, rq.url === '/' ? '/index.html' : rq.url.split('?')[0]);
  fs.readFile(f, (e, d) => { if (e) { rs.writeHead(404); rs.end(); return; }
    rs.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8' }); rs.end(d); });
});

(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const b = await chromium.launch({ headless: true, args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, permissions: ['microphone'] });
  const p = await ctx.newPage();
  const trace = []; const errs = []; let T0 = Date.now();
  p.on('console', m => { const s = m.text(); if (s.startsWith('[talk]')) trace.push(((Date.now() - T0) / 1000).toFixed(1) + 's ' + s); });
  p.on('pageerror', e => errs.push(e.message));
  p.on('response', async r => { if (r.url().includes('talk-token')) { let body = ''; try { body = (await r.text()).slice(0, 120); } catch (e) {} if (r.status() !== 200) console.log('[talk-token http]', r.status(), body); } });
  await p.addInitScript((SILENT_FIRST) => {
    /* silence everything that could reach the owner's headset */
    try { const ss = window.speechSynthesis; if (ss) { ss.speak = function (u) { try { u && u.onend && setTimeout(() => u.onend(new Event('end')), 50); } catch (e) {} }; ss.cancel = function () {}; } } catch (e) {}
    setInterval(() => { try { document.querySelectorAll('audio,video').forEach(a => { a.muted = true; a.volume = 0; }); } catch (e) {} }, 100);
    try { const play = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { this.muted = true; this.volume = 0; return play.apply(this, arguments); }; } catch (e) {}
    /* fake microphone(s) */
    const mk = async (silent) => {
      const ac = new AudioContext({ sampleRate: 48000 });
      const dest = ac.createMediaStreamDestination();
      if (!silent) { const ab = await ac.decodeAudioData(await (await fetch('/learner.wav')).arrayBuffer()); const src = ac.createBufferSource(); src.buffer = ab; src.loop = true; src.connect(dest); src.start(); }
      await ac.resume();
      console.log('[talk] fake mic ' + (silent ? 'SILENT' : 'voice') + ' state=' + ac.state);
      return dest.stream;
    };
    if (navigator.mediaDevices) {
      const devs = SILENT_FIRST ? [{ deviceId: 'silent-bt', kind: 'audioinput', label: 'Bluetooth headset' }, { deviceId: 'voice-builtin', kind: 'audioinput', label: 'Phone microphone' }]
                                : [{ deviceId: 'voice-builtin', kind: 'audioinput', label: 'Phone microphone' }];
      navigator.mediaDevices.enumerateDevices = async () => devs.map(d => ({ ...d, groupId: 'g', toJSON() { return d; } }));
      navigator.mediaDevices.getUserMedia = async (c) => {
        const want = c && c.audio && c.audio.deviceId && (c.audio.deviceId.exact || c.audio.deviceId);
        const silent = SILENT_FIRST && (!want || want === 'silent-bt');
        return mk(silent);
      };
    }
  }, SILENT_FIRST);
  await p.route('**/functions/v1/talk-token', route => route.continue({ headers: Object.assign({}, route.request().headers(), { 'x-app-secret': SECRET }) }));
  await p.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'load' }); await p.waitForTimeout(2500);
  console.log('version', await p.evaluate(() => APP_VERSION), SILENT_FIRST ? '(silent-first mic test)' : '');
  await p.evaluate((eng) => { window.__ENGINE = eng; }, process.env.ENGINE || 'full');
  await p.evaluate(() => {
    authToken = async () => (document.documentElement.outerHTML.match(/sb_publishable_[A-Za-z0-9_-]+/) || [])[0];
    _authState.user = { id: 'u-t', email: 't@example.com', created_at: new Date().toISOString(), user_metadata: {} };
    state._entUnlocked = true; state._entReason = 'paid'; state.settings.userName = 'Sam'; state.settings.nameSet = true; state.settings.r1Done = 'x'; state.settings.trialOfferShown = 'x';
    const ws = getActiveWords().filter(w => w.romaji).slice(0, 15);
    ws.slice(0, 12).forEach((w, i) => { const st = smStatFor(w.id); st.certLevel = 1; st.certAt = now() - i * 1000; st.certFirstAt = st.certAt; st.certNext = now() + 3 * 86400000; });
    ws.slice(12, 15).forEach(w => { recordAttempt(w.id, true, 'test'); });
    state.settings.talkEngine = window.__ENGINE || 'full'; save(); nav('talk');
    const orig = _talkOnEvent; _talkOnEvent = function (ev) { if (ev && ev.type === 'session.created') { const se = ev.session || {}; console.log('[talk] SESSION turn=' + JSON.stringify(se.audio && se.audio.input && se.audio.input.turn_detection && se.audio.input.turn_detection.type) + ' tools=' + ((se.tools || []).length) + ' instr_len=' + String(se.instructions || '').length); } return orig(ev); };
  });
  T0 = Date.now();
  await p.evaluate(() => talkStart());
  for (let i = 0; i < 24 && (await p.evaluate(() => window._talk.status)) === 'connecting'; i++) await p.waitForTimeout(500);
  const st = await p.evaluate(() => ({ status: window._talk.status, err: window._talk.err, model: window._talk.model }));
  console.log('after start:', JSON.stringify(st));
  let lines = [], marks = [], micNotes = [];
  if (st.status === 'live') {
    const end = Date.now() + SECONDS * 1000;
    while (Date.now() < end) { await p.waitForTimeout(1000); const n = await p.evaluate(() => (window._talk._micNote || '')); if (n && !micNotes.includes(n)) micNotes.push(n); }
    lines = await p.evaluate(() => window._talk.lines); marks = await p.evaluate(() => window._talk.marks);
    console.log('\n--- transcript ---'); for (const l of lines) console.log(l.who.toUpperCase() + ': ' + l.text.replace(/\s*\n\s*/g, ' / '));
    console.log('--- marks ---', JSON.stringify(marks.map(m => (m.jp || m.id) + ':' + m.result)));
    if (micNotes.length) console.log('--- mic notes ---', micNotes.join(' | '));
    await p.evaluate(() => talkStop('test')); await p.waitForTimeout(1200);
  }
  const ts = trace.map(l => { const m = l.match(/^([0-9.]+)s \[talk\] (\S+)/); return m ? { t: +m[1], ev: m[2] } : null; }).filter(Boolean);
  const lat = [];
  for (let i = 0; i < ts.length; i++) if (ts[i].ev === 'input_audio_buffer.speech_stopped') { const j = ts.slice(i + 1).find(x => x.ev === 'output_audio_buffer.started' || x.ev === 'input_audio_buffer.speech_started'); if (j && j.ev === 'output_audio_buffer.started') lat.push(+(j.t - ts[i].t).toFixed(2)); }
  const tl = lines.filter(l => l.who === 'teacher').map(l => l.text);
  console.log('\n=== QUALITY ===');
  console.log('reply latency s (you stop -> she speaks):', JSON.stringify(lat), 'avg', lat.length ? (lat.reduce((a, b) => a + b, 0) / lat.length).toFixed(2) : '-');
  console.log('teacher turns:', tl.length, '| avg chars', tl.length ? Math.round(tl.join('').length / tl.length) : '-', '| longest', Math.max(0, ...tl.map(x => x.length)), '| double-turns (two replies in a row):', lines.reduce((n, l, i) => n + (l.who === 'teacher' && lines[i - 1] && lines[i - 1].who === 'teacher' ? 1 : 0), 0));
  console.log('speech_started:', ts.filter(x => x.ev === 'input_audio_buffer.speech_started').length, '| she got cut off:', ts.filter(x => x.ev === 'conversation.item.truncated').length, '| page errors:', errs.length ? errs : 'none');
  if (process.env.TRACE) { console.log('\n--- event trace ---'); for (const t of trace) console.log(t); }
  await b.close(); srv.close();
})().catch(e => { console.error('harness failed:', e.message); process.exit(1); });
