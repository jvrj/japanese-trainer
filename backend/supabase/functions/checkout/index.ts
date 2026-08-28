// POST /checkout  { plan: 'monthly' | 'yearly' }  ->  { url }
// Creates a Stripe Checkout session (subscription mode) for the SIGNED-IN
// Supabase user. JWT-only on purpose: an entitlement must always belong to a
// real account, so there is no soft-secret path here.
// The webhook (stripe-webhook/) is the only writer of entitlements; this
// function only mints the redirect URL.
// No Stripe-side trial (owner call 2026-08-28): the app itself gives the
// 7-day free week from account creation, so checkout charges immediately —
// the old trial_period_days stacked a SECOND free week on top and pushed
// first revenue to day ~14.

import { CORS, json, svc } from '../_shared/gate.ts'
import { stripeFetch } from '../_shared/stripe.ts'

const ALLOWED_RETURN_ORIGIN = 'https://jvrj.github.io'
const DEFAULT_RETURN = 'https://jvrj.github.io/japanese-trainer/landing/'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' })

  const db = svc()
  const authz = req.headers.get('authorization') ?? ''
  const jwt = authz.startsWith('Bearer ') ? authz.slice(7) : ''
  if (!jwt) return json(401, { error: 'unauthorized' })
  const { data: u, error: uerr } = await db.auth.getUser(jwt)
  if (uerr || !u?.user) return json(401, { error: 'unauthorized' })
  const user = u.user

  let body: any = {}
  try { body = await req.json() } catch { /* fall through to plan check */ }
  const plan = body?.plan
  const priceId = plan === 'monthly'
    ? Deno.env.get('STRIPE_PRICE_MONTHLY')
    : plan === 'yearly'
    ? Deno.env.get('STRIPE_PRICE_YEARLY')
    : null
  if (!priceId) return json(400, { error: 'bad_plan' })

  // Don't sell a second subscription to someone who already has one.
  const { data: ent } = await db.from('entitlements')
    .select('active, expires_at, stripe_customer_id')
    .eq('user_id', user.id).maybeSingle()
  if (ent?.active && (!ent.expires_at || new Date(ent.expires_at) > new Date())) {
    return json(409, { error: 'already_subscribed' })
  }

  // Return URLs are pinned to our origin — parse and compare the real origin
  // (a raw prefix check passes https://jvrj.github.io.attacker.tld / @-userinfo tricks).
  const ok = (s: unknown) => {
    if (typeof s !== 'string') return false
    try { return new URL(s).origin === ALLOWED_RETURN_ORIGIN } catch { return false }
  }
  const successUrl = ok(body?.success_url) ? body.success_url : DEFAULT_RETURN + '?checkout=success'
  const cancelUrl = ok(body?.cancel_url) ? body.cancel_url : DEFAULT_RETURN + '?checkout=cancelled'

  const params: Record<string, string> = {
    mode: 'subscription',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    'subscription_data[metadata][user_id]': user.id,
    client_reference_id: user.id,
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: 'true',
  }
  // Reuse the Stripe customer when we know one (resubscribe path); otherwise
  // let Checkout create it, prefilled with the account email.
  if (ent?.stripe_customer_id) params.customer = ent.stripe_customer_id
  else if (user.email) params.customer_email = user.email

  const { status, body: session } = await stripeFetch('/v1/checkout/sessions', params)
  if (status !== 200 || !session?.url) {
    console.error('checkout session failed', status, session?.error?.message)
    return json(503, { error: 'temporarily_unavailable' })
  }
  return json(200, { url: session.url })
})
