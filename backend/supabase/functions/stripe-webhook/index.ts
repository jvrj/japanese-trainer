// POST /stripe-webhook — Stripe events -> the entitlements table (the ONE
// subscription truth the gate reads). Signature-verified; this function is the
// ONLY writer of entitlements. Idempotent: every handled event recomputes the
// row from the subscription object Stripe sends, so replays/out-of-order
// deliveries converge on the same state.

import { json, svc } from '../_shared/gate.ts'
import { stripeFetch, verifyStripeSignature } from '../_shared/stripe.ts'

// Statuses that grant access. past_due/canceled/unpaid do NOT — expires_at
// (current period end) already provides the paid-through grace.
const ACTIVE_STATUSES = new Set(['trialing', 'active'])

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' })

  const raw = await req.text()
  const okSig = await verifyStripeSignature(
    raw, req.headers.get('stripe-signature'), Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '',
  )
  if (!okSig) return json(400, { error: 'bad_signature' })

  let event: any
  try { event = JSON.parse(raw) } catch { return json(400, { error: 'bad_payload' }) }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        if (session.mode !== 'subscription' || !session.subscription) break
        // The session carries our user id; fetch the subscription for status/period.
        const { status, body: sub } = await stripeFetch(`/v1/subscriptions/${session.subscription}`)
        if (status !== 200) throw new Error('sub fetch failed: ' + sub?.error?.message)
        await applySubscription(sub, session.client_reference_id ?? sub.metadata?.user_id)
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object
        await applySubscription(sub, sub.metadata?.user_id)
        break
      }
      default:
        break // unhandled event types are acknowledged, not errors
    }
  } catch (e) {
    console.error('webhook handling failed', event?.type, String(e))
    return json(500, { error: 'handler_failed' }) // Stripe retries on 5xx
  }
  return json(200, { received: true })
})

async function applySubscription(sub: any, userId: string | null | undefined): Promise<void> {
  if (!userId) {
    // No user mapping -> nothing to write. Log loudly; this should never
    // happen for sessions our checkout function created.
    console.error('subscription without user_id metadata', sub?.id)
    return
  }
  const active = ACTIVE_STATUSES.has(sub.status)
  const periodEnd = sub.items?.data?.[0]?.current_period_end ?? sub.current_period_end
  const price = sub.items?.data?.[0]?.price
  const db = svc()
  const { error } = await db.from('entitlements').upsert({
    user_id: userId,
    active,
    product: price?.lookup_key ?? price?.id ?? null,
    expires_at: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null,
    stripe_subscription_id: sub.id ?? null,
    updated_at: new Date().toISOString(),
  })
  if (error) throw new Error('entitlements upsert failed: ' + error.message)
}
