// Pure entitlement logic — the ONE place the trial/subscription decision lives.
// Plain JS (no Deno/TS imports) so the same file runs in the Deno edge function
// (gate.ts imports it) AND in node for unit tests (backend/tests/).
//
// Model (locked 2026-07-21): every account gets `trialDays` of live-AI access
// from `trialStartedAt` (signup), no card. An active subscription entitles
// regardless of the trial. Expired trial + no sub => not entitled (402 —
// the client shows the offer; drills/scripted practice never call the relay).

/**
 * @param {Object} p
 * @param {Date|string|number} p.now
 * @param {string|Date|null} p.trialStartedAt  profiles.trial_started_at (null = no profile)
 * @param {boolean} p.subActive                entitlements.active
 * @param {string|Date|null} p.subExpiresAt    entitlements.expires_at (null = no expiry)
 * @param {number} p.trialDays
 * @returns {{entitled: boolean, reason: 'subscription'|'trial'|'trial_ended'|'no_access', trialEndsAt: string|null}}
 */
export function evaluateAccess({ now, trialStartedAt, subActive, subExpiresAt, trialDays }) {
  const n = now instanceof Date ? n_ok(now) : new Date(now)

  if (subActive && (!subExpiresAt || new Date(subExpiresAt) > n)) {
    return { entitled: true, reason: 'subscription', trialEndsAt: null }
  }

  if (trialStartedAt) {
    const ends = new Date(new Date(trialStartedAt).getTime() + trialDays * 86400000)
    if (ends > n) return { entitled: true, reason: 'trial', trialEndsAt: ends.toISOString() }
    return { entitled: false, reason: 'trial_ended', trialEndsAt: ends.toISOString() }
  }

  return { entitled: false, reason: 'no_access', trialEndsAt: null }
}

function n_ok(d) {
  if (isNaN(d.getTime())) throw new Error('evaluateAccess: invalid now')
  return d
}
