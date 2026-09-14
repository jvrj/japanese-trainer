// POST /portal  ->  { url }
// Opens Stripe's customer portal for the SIGNED-IN user's subscription, so a
// paying customer can cancel, change card, or see invoices from Settings.
// 404 no_subscription when the account has never had a Stripe customer.
// If the Stripe account has no portal configuration yet, one is created on
// first use (cancel at period end, card update, invoice history).

import { CORS, json, svc } from '../_shared/gate.ts'
import { stripeFetch } from '../_shared/stripe.ts'

const RETURN_URL = 'https://app.wordstick.app/?portal=return'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' })

  const db = svc()
  const authz = req.headers.get('authorization') ?? ''
  const jwt = authz.startsWith('Bearer ') ? authz.slice(7) : ''
  if (!jwt) return json(401, { error: 'unauthorized' })
  const { data: u, error: uerr } = await db.auth.getUser(jwt)
  if (uerr || !u?.user) return json(401, { error: 'unauthorized' })

  const { data: ent } = await db.from('entitlements')
    .select('stripe_customer_id')
    .eq('user_id', u.user.id).maybeSingle()
  if (!ent?.stripe_customer_id) return json(404, { error: 'no_subscription' })

  const configuration = await portalConfiguration()
  if (!configuration) return json(503, { error: 'temporarily_unavailable' })

  const { status, body } = await stripeFetch('/v1/billing_portal/sessions', {
    customer: ent.stripe_customer_id,
    return_url: RETURN_URL,
    configuration,
  })
  if (status !== 200 || !body?.url) {
    console.error('portal session failed', status, body?.error?.message)
    return json(503, { error: 'temporarily_unavailable' })
  }
  return json(200, { url: body.url })
})

async function portalConfiguration(): Promise<string | null> {
  const list = await stripeFetch('/v1/billing_portal/configurations?active=true&limit=10')
  if (list.status === 200 && Array.isArray(list.body?.data) && list.body.data.length) {
    const pick = list.body.data.find((c: any) => c.is_default) ?? list.body.data[0]
    return pick.id
  }
  const made = await stripeFetch('/v1/billing_portal/configurations', {
    'features[subscription_cancel][enabled]': 'true',
    'features[subscription_cancel][mode]': 'at_period_end',
    'features[payment_method_update][enabled]': 'true',
    'features[invoice_history][enabled]': 'true',
    'business_profile[headline]': 'Manage your WordStick subscription',
    'business_profile[privacy_policy_url]': 'https://wordstick.app/privacy.html',
    'business_profile[terms_of_service_url]': 'https://wordstick.app/terms.html',
    default_return_url: RETURN_URL,
  })
  if (made.status !== 200) {
    console.error('portal configuration failed', made.status, made.body?.error?.message)
    return null
  }
  return made.body.id
}
