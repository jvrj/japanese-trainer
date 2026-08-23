// POST /transcribe  — multipart { file, prompt? } -> { text }
// Relays audio to OpenAI gpt-4o-mini-transcribe behind the gate. (ADR-004)
// The OpenAI key NEVER leaves the server. Mirrors the client's _whisperTranscribe contract.

import { CORS, json, svc, resolveCaller, openGate, recordSuccess } from '../_shared/gate.ts'

// rough per-call cost guard for the spend ceiling (~10-20s audio @ $0.003/min ≈ $0.0005-0.001).
const EST_USD_PER_TRANSCRIBE = 0.001

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' })

  const db = svc()
  const caller = await resolveCaller(req, db)
  if (!caller) return json(401, { error: 'unauthorized' })

  const gated = await openGate(db, caller)
  if (gated) return gated

  // pull the audio from the incoming multipart form
  let inForm: FormData
  try { inForm = await req.formData() } catch { return json(400, { error: 'bad_request' }) }
  const file = inForm.get('file')
  const prompt = (inForm.get('prompt') as string) || ''
  if (!(file instanceof File)) return json(400, { error: 'no_file' })

  // rebuild the form for OpenAI
  const out = new FormData()
  out.append('file', file, file.name || 'audio.webm')
  out.append('model', 'gpt-4o-mini-transcribe')
  out.append('language', 'ja')
  if (prompt) out.append('prompt', prompt)
  out.append('response_format', 'json')
  out.append('temperature', '0')

  let r: Response
  try {
    r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { authorization: `Bearer ${Deno.env.get('OPENAI_KEY')}` },
      body: out,
    })
  } catch {
    return json(503, { error: 'temporarily_unavailable' })
  }

  if (!r.ok) {
    // surface a clean status; do NOT leak the upstream body/keys
    if (r.status === 429) return json(503, { error: 'temporarily_unavailable' })
    return json(502, { error: 'upstream_error', status: r.status })
  }

  const data = await r.json().catch(() => ({}))
  const text = (data && data.text) ? String(data.text) : ''
  // only a successful transcription counts toward the cap + spend (ADR-004: successful-only)
  await recordSuccess(db, caller, EST_USD_PER_TRANSCRIBE)
  return json(200, { text })
})
