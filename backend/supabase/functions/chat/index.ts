// POST /chat — { messages, system?, model?, max_tokens? } -> Anthropic message response
// Relays AI turns to Anthropic behind the gate. (ADR-004) Key stays server-side.
// Mirrors what _coachCall / _convoCall need; the client sends the same shape it builds today.

import { CORS, json, svc, resolveCaller, openGate, recordSuccess } from '../_shared/gate.ts'

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001'
// Anthropic returns token usage; price Haiku ~ $0.80/M in, $4/M out. Estimate from usage.
function estUsd(usage: { input_tokens?: number; output_tokens?: number } | undefined): number {
  if (!usage) return 0.002
  const i = (usage.input_tokens ?? 0) / 1_000_000 * 0.80
  const o = (usage.output_tokens ?? 0) / 1_000_000 * 4.0
  return i + o
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' })

  const db = svc()
  const caller = await resolveCaller(req, db)
  if (!caller) return json(401, { error: 'unauthorized' })

  const gated = await openGate(db, caller)
  if (gated) return gated

  let body: { messages?: unknown; system?: string; model?: string; max_tokens?: number }
  try { body = await req.json() } catch { return json(400, { error: 'bad_request' }) }
  if (!Array.isArray(body.messages) || body.messages.length === 0) return json(400, { error: 'no_messages' })

  const payload = {
    model: body.model || DEFAULT_MODEL,
    max_tokens: Math.min(body.max_tokens ?? 1024, 2048),
    system: body.system || undefined,
    messages: body.messages,
  }

  let r: Response
  try {
    r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_KEY')!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    })
  } catch {
    return json(503, { error: 'temporarily_unavailable' })
  }

  if (!r.ok) {
    if (r.status === 429) return json(503, { error: 'temporarily_unavailable' })
    return json(502, { error: 'upstream_error', status: r.status })
  }

  const data = await r.json().catch(() => ({}))
  await recordSuccess(db, caller, estUsd(data?.usage))
  return json(200, data) // pass the Anthropic response shape straight through
})
