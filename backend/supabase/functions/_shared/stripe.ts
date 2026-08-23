// Minimal Stripe helpers for the edge functions — no SDK dependency.
// stripeFetch: form-encoded call to the Stripe REST API.
// verifyStripeSignature: HMAC check of the Stripe-Signature webhook header,
// so a forged POST to the public webhook URL can never write entitlements.

const STRIPE_API = 'https://api.stripe.com'

export async function stripeFetch(
  path: string,
  params?: Record<string, string>,
  method: 'POST' | 'GET' = params ? 'POST' : 'GET',
): Promise<{ status: number; body: any }> {
  const key = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
  const init: RequestInit = {
    method,
    headers: { authorization: 'Basic ' + btoa(key + ':') },
  }
  if (params && method === 'POST') {
    init.headers = { ...init.headers as Record<string, string>, 'content-type': 'application/x-www-form-urlencoded' }
    init.body = new URLSearchParams(params).toString()
  }
  const res = await fetch(STRIPE_API + path, init)
  return { status: res.status, body: await res.json() }
}

// Stripe-Signature: t=<unix>,v1=<hex hmac of `${t}.${rawBody}`>[,v1=...]
export async function verifyStripeSignature(
  rawBody: string,
  sigHeader: string | null,
  secret: string,
  toleranceSec = 300,
): Promise<boolean> {
  if (!sigHeader || !secret) return false
  const parts = new Map<string, string[]>()
  for (const kv of sigHeader.split(',')) {
    const i = kv.indexOf('=')
    if (i < 0) continue
    const k = kv.slice(0, i).trim(), v = kv.slice(i + 1).trim()
    parts.set(k, [...(parts.get(k) ?? []), v])
  }
  const t = Number(parts.get('t')?.[0])
  const v1s = parts.get('v1') ?? []
  if (!t || v1s.length === 0) return false
  if (Math.abs(Date.now() / 1000 - t) > toleranceSec) return false

  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(`${t}.${rawBody}`))
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('')
  return v1s.some((v) => safeEqual(v, expected))
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let r = 0
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}
