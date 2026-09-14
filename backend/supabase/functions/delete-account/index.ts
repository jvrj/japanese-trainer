// POST /delete-account  { confirm: 'DELETE' }  ->  { deleted: true }
// Permanently deletes the SIGNED-IN user's account (Google Play requires an
// in-app path). Order matters: any live Stripe subscription is cancelled
// FIRST, and the account is only deleted once billing has stopped, so nobody
// is ever charged for an account that no longer exists. Deleting the auth
// user cascades profiles, user_state and entitlements (0001_init.sql).

import { CORS, json, svc } from '../_shared/gate.ts'
import { stripeFetch } from '../_shared/stripe.ts'

const ENDED = new Set(['canceled', 'incomplete_expired'])

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
  try { body = await req.json() } catch { /* fall through */ }
  if (body?.confirm !== 'DELETE') return json(400, { error: 'confirm_required' })

  const { data: ent } = await db.from('entitlements')
    .select('active, stripe_subscription_id')
    .eq('user_id', user.id).maybeSingle()
  if (ent?.stripe_subscription_id) {
    const subPath = `/v1/subscriptions/${encodeURIComponent(ent.stripe_subscription_id)}`
    const got = await stripeFetch(subPath)
    const missing = got.status === 404 || got.body?.error?.code === 'resource_missing'
    // A paying account whose subscription can't be found is NOT safe to delete:
    // it usually means the wrong Stripe key/mode, and billing may still run.
    if (missing && ent.active) {
      console.error('delete: active entitlement but subscription not found')
      return json(503, { error: 'temporarily_unavailable' })
    }
    if (!missing) {
      if (got.status !== 200) {
        console.error('delete: subscription lookup failed', got.status, got.body?.error?.message)
        return json(503, { error: 'temporarily_unavailable' })
      }
      if (!ENDED.has(got.body?.status)) {
        const cancel = await stripeFetch(subPath, undefined, 'DELETE')
        if (cancel.status !== 200) {
          console.error('delete: subscription cancel failed', cancel.status, cancel.body?.error?.message)
          return json(503, { error: 'temporarily_unavailable' })
        }
      }
    }
  }

  const { error } = await db.auth.admin.deleteUser(user.id)
  if (error) {
    console.error('delete: auth user delete failed', error.message)
    return json(503, { error: 'temporarily_unavailable' })
  }
  return json(200, { deleted: true })
})
