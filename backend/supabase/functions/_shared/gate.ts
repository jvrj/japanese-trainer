// Shared gate for the Isshin relay (ADR-004).
// Every proxied call passes through: resolveCaller (auth) -> openGate (spend ceiling +
// daily cap + rate limit) -> [do the upstream call] -> recordSuccess (count item + spend).
// The whole point: the relay is NEVER reachable uncapped/unauthed. (Delve 4 FATAL F1.)

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { evaluateAccess } from './entitlement.mjs'

export const CAP_ITEMS_PER_DAY   = Number(Deno.env.get('CAP_ITEMS_PER_DAY')   ?? '300')
export const RATE_REQS_PER_DAY   = Number(Deno.env.get('RATE_REQS_PER_DAY')   ?? '1200') // raw-request ceiling (~4x the item cap)
export const GLOBAL_DAILY_USD    = Number(Deno.env.get('GLOBAL_DAILY_USD')     ?? '15')   // hard circuit-breaker
export const TRIAL_DAYS          = Number(Deno.env.get('TRIAL_DAYS')           ?? '7')    // locked 2026-07-21: 7 free days, no card

export const CORS: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-app-secret, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
}

export function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...CORS } })
}

export function svc(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )
}

// constant-time string compare for the soft secret
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let r = 0
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}

export type Caller = { callerId: string; mode: 'user' | 'owner' }

// Prefer a real Supabase JWT (Phase 2+). Fall back to the soft secret (Phase 0/1 owner-only).
export async function resolveCaller(req: Request, db: SupabaseClient): Promise<Caller | null> {
  const authz = req.headers.get('authorization') ?? ''
  const jwt = authz.startsWith('Bearer ') ? authz.slice(7) : ''
  if (jwt) {
    const { data, error } = await db.auth.getUser(jwt)
    if (!error && data?.user) return { callerId: data.user.id, mode: 'user' }
  }
  const expected = Deno.env.get('APP_SOFT_SECRET') ?? ''
  const given = req.headers.get('x-app-secret') ?? ''
  if (expected && given && safeEqual(given, expected)) return { callerId: 'owner', mode: 'owner' }
  return null
}

// returns null when allowed, or a ready-to-send error Response (402/429/503) when blocked.
export async function openGate(db: SupabaseClient, caller: Caller): Promise<Response | null> {
  // 1) global spend circuit-breaker
  const { data: g } = await db.from('global_usage')
    .select('spend_usd').eq('day', new Date().toISOString().slice(0, 10)).maybeSingle()
  if (g && Number(g.spend_usd) >= GLOBAL_DAILY_USD) {
    return json(503, { error: 'temporarily_unavailable' })
  }

  // 2) entitlement: 7-day trial-from-signup OR active subscription (locked 2026-07-21).
  //    REQUIRE_ENTITLEMENT stays the master switch (false = pre-launch open door);
  //    owner mode always passes. Decision logic lives in entitlement.mjs (unit-tested).
  if (caller.mode === 'user' && (Deno.env.get('REQUIRE_ENTITLEMENT') ?? 'false') === 'true') {
    const { data: a, error: aerr } = await db.rpc('get_access', { p_user: caller.callerId })
    if (aerr) return json(503, { error: 'temporarily_unavailable' })
    const row = Array.isArray(a) ? a[0] : a
    const v = evaluateAccess({
      now: new Date(),
      trialStartedAt: row?.trial_started_at ?? null,
      subActive: !!row?.sub_active,
      subExpiresAt: row?.sub_expires_at ?? null,
      trialDays: TRIAL_DAYS,
    })
    if (!v.entitled) {
      return json(402, { error: 'no_entitlement', reason: v.reason, trial_ends_at: v.trialEndsAt })
    }
  }

  // 3) per-caller daily request rate-limit + read today's item count (atomic bump)
  const { data: u, error } = await db.rpc('bump_request', { p_caller: caller.callerId })
  if (error) return json(503, { error: 'temporarily_unavailable' })
  const row = Array.isArray(u) ? u[0] : u
  if (row && row.requests > RATE_REQS_PER_DAY) {
    return json(429, { error: 'rate_limited', resets_at: utcMidnightISO() })
  }

  // 4) fair-use daily cap on graded items
  if (row && row.items >= CAP_ITEMS_PER_DAY) {
    return json(429, { error: 'daily_cap', resets_at: utcMidnightISO() })
  }
  return null
}

// call ONLY after a successful upstream response: count the item + add estimated spend.
export async function recordSuccess(db: SupabaseClient, caller: Caller, estUsd: number): Promise<void> {
  await db.rpc('bump_item', { p_caller: caller.callerId })
  if (estUsd > 0) await db.rpc('add_spend', { p_usd: estUsd })
}

function utcMidnightISO(): string {
  const d = new Date()
  d.setUTCHours(24, 0, 0, 0)
  return d.toISOString()
}
