// POST /talk-token — the live voice teacher ("Talk"). Owner call 2026-09-24 ("voice next").
//
//   { action: 'start', engine?: 'full'|'mini', ctx: { name, owned:[{jp,romaji,en}], due:[...], fresh:[...] } }
//     -> { client_secret, model, engine, expires_at, seconds_left, cap_seconds }
//   { action: 'usage', seconds }         -> { seconds_left }        (reported by the client on hang-up)
//
// The phone talks to OpenAI DIRECTLY over WebRTC with a 60-second ephemeral
// client secret minted here. The real OpenAI key never leaves the server.
// The teacher's brain is the LEDGER the client sends: the words the learner
// has proven (owned), today's due words, and a couple of fresh ones. The
// session instructions are built HERE so a client can't rewrite the teacher.
//
// Money invariants (ADR-004 spirit): JWT-only, entitlement gate, a per-caller
// DAILY SECONDS CAP (TALK_CAP_SECONDS, default 15 min), and the global spend
// circuit-breaker fed with an estimate per minted session.

import { CORS, json, svc, resolveCaller, openGate } from '../_shared/gate.ts'

const CAP_SECONDS   = Number(Deno.env.get('TALK_CAP_SECONDS') ?? String(15 * 60))
const MODEL_FULL    = Deno.env.get('TALK_MODEL_FULL') ?? 'gpt-realtime-2.1'
const MODEL_MINI    = Deno.env.get('TALK_MODEL_MINI') ?? 'gpt-realtime-2.1-mini'
const DEFAULT_ENGINE = (Deno.env.get('TALK_ENGINE') ?? 'full') === 'mini' ? 'mini' : 'full'
const VOICE         = Deno.env.get('TALK_VOICE') ?? 'marin'
// spend estimate per minted session for the circuit-breaker (a full 10-min session ≈ $0.80 on the full model)
const EST_USD_PER_MIN = { full: 0.08, mini: 0.03 }

type W = { jp: string; romaji?: string; en: string }
const clean = (xs: unknown, max: number): W[] => {
  if (!Array.isArray(xs)) return []
  const out: W[] = []
  for (const x of xs) {
    if (!x || typeof x !== 'object') continue
    const jp = String((x as any).jp ?? '').slice(0, 40)
    const en = String((x as any).en ?? '').slice(0, 60)
    const romaji = String((x as any).romaji ?? '').slice(0, 40)
    if (!jp || !en) continue
    out.push({ jp, en, romaji })
    if (out.length >= max) break
  }
  return out
}
const list = (ws: W[]) => ws.map(w => `${w.jp}${w.romaji ? ' (' + w.romaji + ')' : ''} = ${w.en}`).join('; ')

function instructions(name: string, owned: W[], due: W[], fresh: W[], minutes: number): string {
  const who = name ? name : 'the learner'
  return [
    `You are a friendly Japanese teacher having a relaxed spoken chat with ${who}, a complete beginner who knows only about ${owned.length} Japanese words and cannot read kanji. This is a ${minutes}-minute conversation, not a lecture.`,
    `THE MOST IMPORTANT RULE: ONE SHORT SENTENCE PER TURN. At most eight words, about three seconds of speech, then STOP and wait for ${who}. Never two sentences in a row. Never a paragraph. Never a list. If you catch yourself explaining, stop.`,
    `SPEAK LIKE A FRIEND, NOT A TEXTBOOK. Slow, clear, natural Japanese, the way you would talk to a small child who is just starting. Ask one tiny question, wait, react to the answer in one line, ask the next tiny question.`,
    `YOU UNDERSTAND BOTH LANGUAGES. ${who} may answer in English, Japanese, or a mix. If ${who} speaks English, reply in English in one short line, then offer the Japanese way to say it and wait for them to try. If ${who} says "what", "huh", "sorry", or seems lost, say the same thing in plain English in one short line, then say the Japanese again slowly.`,
    `ADAPT CONSTANTLY. If ${who} does not respond or answers something unrelated, make your next turn SIMPLER and SHORTER, never longer. Rephrase with fewer words. Offer a two-choice question if needed (X ですか、Y ですか).`,
    `THE LEDGER. These are the ONLY Japanese words ${who} owns: ${owned.length ? list(owned) : '(none yet)'}. Use only these plus tiny grammar glue (です, は, を, か, ね, も, と). If a sentence would need any other Japanese word, say that one word in English instead, or choose a different sentence.`,
    `DUE TODAY (work these in naturally, one at a time, not as a test): ${due.length ? list(due) : '(none)'}.`,
    `FRESH (you may teach at most these two new words, one at a time, only when there is a natural moment): ${fresh.length ? list(fresh) : '(none)'}.`,
    `ASK, DON'T SHOW. Give ${who} the chance to say the word before you say it. If ${who} is silent for a while, offer the first sound as a hint, then wait again.`,
    `WHEN ${who.toUpperCase()} FUMBLES a word (wrong word, cannot recall, or badly wrong pronunciation): say the word once slowly, have them repeat it once, move on, and call the tool mark_word with result "fumbled". No lecture.`,
    `WHEN ${who.toUpperCase()} USES A WORD CLEANLY on their own (recalled or produced it without your help): call mark_word with result "clean". Only ledger or fresh words. One call per word per lesson at most.`,
    `Any text you write (transcripts) must be in hiragana or katakana only, never kanji.`,
    `Keep it light: brief praise, never judge, never mention scores. Near the end of the ${minutes} minutes, say goodbye warmly in one sentence.`,
  ].join('\n')
}

const TOOLS = [{
  type: 'function',
  name: 'mark_word',
  description: 'Record how the learner did with ONE word from the ledger during this lesson.',
  parameters: {
    type: 'object',
    properties: {
      jp: { type: 'string', description: 'The word exactly as written in the ledger (kana).' },
      result: { type: 'string', enum: ['fumbled', 'clean'] },
    },
    required: ['jp', 'result'],
  },
}]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' })

  const db = svc()
  const caller = await resolveCaller(req, db)
  if (!caller || caller.mode !== 'user') return json(401, { error: 'unauthorized' })

  let body: any = {}
  try { body = await req.json() } catch { return json(400, { error: 'bad_request' }) }

  // ---- usage report: the client says how many seconds the session ran ----
  if (body?.action === 'usage') {
    const secs = Math.min(3600, Math.max(0, Math.floor(Number(body.seconds) || 0)))
    const { data } = await db.rpc('talk_bump', { p_caller: caller.callerId, p_seconds: secs, p_session: 0 })
    const row = Array.isArray(data) ? data[0] : data
    return json(200, { seconds_left: Math.max(0, CAP_SECONDS - Number(row?.seconds ?? 0)) })
  }

  if (body?.action !== 'start') return json(400, { error: 'bad_action' })

  const gated = await openGate(db, caller)   // entitlement + rate limit + circuit-breaker
  if (gated) return gated

  // ---- daily minute cap ----
  const { data: u0, error: e0 } = await db.rpc('talk_bump', { p_caller: caller.callerId, p_seconds: 0, p_session: 1 })
  if (e0) return json(503, { error: 'temporarily_unavailable' })
  const used = Number((Array.isArray(u0) ? u0[0] : u0)?.seconds ?? 0)
  const secondsLeft = CAP_SECONDS - used
  if (secondsLeft <= 30) return json(429, { error: 'talk_cap', seconds_left: 0, cap_seconds: CAP_SECONDS })

  // ---- engine: 'full' by default; the owner's A/B toggle may ask for mini ----
  const engine: 'full' | 'mini' = body?.engine === 'mini' ? 'mini' : body?.engine === 'full' ? 'full' : DEFAULT_ENGINE
  const model = engine === 'mini' ? MODEL_MINI : MODEL_FULL

  const ctx = body?.ctx ?? {}
  const name = String(ctx.name ?? '').replace(/[^\p{L}\p{N} '\-]/gu, '').slice(0, 30)
  const owned = clean(ctx.owned, 120)
  const due = clean(ctx.due, 10)
  const fresh = clean(ctx.fresh, 2)
  const minutes = Math.max(1, Math.min(30, Math.round(Math.min(secondsLeft, 10 * 60) / 60)))

  const session = {
    type: 'realtime',
    model,
    output_modalities: ['audio'],
    instructions: instructions(name, owned, due, fresh, minutes),
    tools: TOOLS,
    tool_choice: 'auto',
    audio: {
      input: {
        transcription: { model: 'gpt-4o-mini-transcribe' },  // no forced language: the learner may speak English or Japanese
        turn_detection: { type: 'semantic_vad', eagerness: 'low' },
      },
      output: { voice: VOICE, speed: 0.85 },
    },
  }

  let r: Response
  try {
    r = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: { authorization: `Bearer ${Deno.env.get('OPENAI_KEY')}`, 'content-type': 'application/json' },
      body: JSON.stringify({ expires_after: { anchor: 'created_at', seconds: 120 }, session }),
    })
  } catch {
    return json(503, { error: 'temporarily_unavailable' })
  }
  if (!r.ok) {
    const txt = await r.text().catch(() => '')
    console.error('talk-token upstream', r.status, txt.slice(0, 300))
    return json(502, { error: 'upstream_error', status: r.status })
  }
  const data = await r.json().catch(() => ({}))
  const secret = data?.value ?? data?.client_secret?.value
  if (!secret) return json(502, { error: 'upstream_error', status: 500 })

  // circuit-breaker estimate: assume the session runs to its cap
  try { await db.rpc('add_spend', { p_usd: EST_USD_PER_MIN[engine] * minutes }) } catch { /* non-fatal */ }

  return json(200, {
    client_secret: secret,
    model, engine,
    expires_at: data?.expires_at ?? null,
    seconds_left: Math.min(secondsLeft, minutes * 60),
    cap_seconds: CAP_SECONDS,
  })
})
