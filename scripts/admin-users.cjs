#!/usr/bin/env node
/* Owner-only account activity report. Reads every account plus its synced
   progress blob and prints one line per account, most recently active first.
   Needs the SERVICE ROLE key — never ship this to a phone or a customer.
     SUPABASE_URL=... SUPABASE_SERVICE_ROLE=... node scripts/admin-users.cjs
   Prints emails (owner report on request). Never prints keys. */
const URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE || '';
if (!URL || !KEY) { console.error('need SUPABASE_URL and SUPABASE_SERVICE_ROLE in the environment'); process.exit(2); }
const H = { apikey: KEY, authorization: 'Bearer ' + KEY };
const get = async (p) => { const r = await fetch(URL + p, { headers: H }); if (!r.ok) throw new Error(p + ' -> ' + r.status + ' ' + (await r.text()).slice(0, 200)); return r.json(); };
const day = (iso) => iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : null;
const ago = (iso) => { const d = day(iso); return d === null ? 'never' : d === 0 ? 'today' : d === 1 ? 'yesterday' : d + 'd ago'; };
const pad = (s, n) => String(s ?? '').padEnd(n).slice(0, n);

(async () => {
  const usersRes = await get('/auth/v1/admin/users?per_page=500');
  const users = usersRes.users || usersRes;
  const states = await get('/rest/v1/user_state?select=user_id,updated_at,state_json');
  const ents = await get('/rest/v1/entitlements?select=user_id,active,product,status,expires_at');
  const profiles = await get('/rest/v1/profiles?select=id,created_at,trial_started_at');
  const usage = await get('/rest/v1/usage_daily?select=caller_id,day,items,requests&order=day.desc');
  const S = new Map(states.map(s => [s.user_id, s]));
  const E = new Map(ents.map(e => [e.user_id, e]));
  const U = new Map();
  for (const u of usage) { const a = U.get(u.caller_id) || { days: 0, items: 0, last: null }; a.days++; a.items += u.items || 0; if (!a.last) a.last = u.day; U.set(u.caller_id, a); }
  const WEEK = Date.now() - 7 * 86400000;
  const rows = users.map(u => {
    const st = S.get(u.id); const j = (st && st.state_json) || {};
    const stats = j.stats || {};
    let touched = 0, attempts = 0, week = 0, certified = 0, lastAttempt = 0;
    for (const id in stats) {
      const x = stats[id] || {}; const at = x.attempts || [];
      if (at.length) touched++;
      attempts += at.length;
      for (const a of at) { if (a && a.ts) { if (a.ts > WEEK) week++; if (a.ts > lastAttempt) lastAttempt = a.ts; } }
      if ((x.certLevel || 0) > 0) certified++;
    }
    const e = E.get(u.id) || {};
    const plan = e.product === 'tester' ? 'tester' : e.active ? (e.status === 'trialing' ? 'trial' : (e.product || 'paid')) : 'free';
    const lastActive = Math.max(lastAttempt || 0, st && st.updated_at ? new Date(st.updated_at).getTime() : 0, u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : 0);
    return {
      email: u.email || '(no email)', name: (j.settings && j.settings.userName) || '',
      created: u.created_at, lastSignIn: u.last_sign_in_at, saved: st && st.updated_at, app: j.app || '',
      touched, attempts, week, certified, streak: (j.streak && j.streak.current) || 0, plan,
      lastActive: lastActive ? new Date(lastActive).toISOString() : null,
      relay: U.get(u.id) || null,
    };
  }).sort((a, b) => (b.lastActive || '').localeCompare(a.lastActive || ''));

  console.log(`${users.length} accounts · ${states.length} with saved progress · ${new Date().toISOString().slice(0, 10)}\n`);
  console.log(pad('EMAIL', 32) + pad('NAME', 10) + pad('JOINED', 10) + pad('LAST ACTIVE', 12) + pad('SAVED', 11) + pad('APP', 6) + pad('WORDS', 7) + pad('TRIES', 7) + pad('7-DAY', 7) + pad('PROVEN', 8) + pad('STREAK', 8) + 'PLAN');
  for (const r of rows) {
    console.log(pad(r.email, 32) + pad(r.name, 10) + pad(ago(r.created), 10) + pad(ago(r.lastActive), 12) + pad(ago(r.saved), 11) + pad(r.app, 6) + pad(r.touched, 7) + pad(r.attempts, 7) + pad(r.week, 7) + pad(r.certified, 8) + pad(r.streak, 8) + r.plan);
  }
  const active7 = rows.filter(r => day(r.lastActive) !== null && day(r.lastActive) <= 7).length;
  const never = rows.filter(r => !r.saved).length;
  console.log(`\nactive in the last 7 days: ${active7} · never saved any progress: ${never}`);
})().catch(e => { console.error('report failed:', e.message); process.exit(1); });
