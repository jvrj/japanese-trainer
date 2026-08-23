// Unit tests for the trial/subscription decision (run: node backend/tests/entitlement.test.mjs)
import { evaluateAccess } from '../supabase/functions/_shared/entitlement.mjs'
import assert from 'node:assert/strict'

const NOW = new Date('2026-07-21T10:00:00Z')
const days = (n) => new Date(NOW.getTime() - n * 86400000).toISOString()
let ran = 0
function t(name, fn) { fn(); ran++; console.log('ok -', name) }

t('day 3 of trial → entitled (trial)', () => {
  const v = evaluateAccess({ now: NOW, trialStartedAt: days(3), subActive: false, subExpiresAt: null, trialDays: 7 })
  assert.equal(v.entitled, true)
  assert.equal(v.reason, 'trial')
  assert.equal(v.trialEndsAt, new Date(NOW.getTime() + 4 * 86400000).toISOString())
})

t('one minute before trial end → still entitled', () => {
  const start = new Date(NOW.getTime() - (7 * 86400000 - 60000)).toISOString()
  const v = evaluateAccess({ now: NOW, trialStartedAt: start, subActive: false, subExpiresAt: null, trialDays: 7 })
  assert.equal(v.entitled, true)
})

t('exactly at trial end → NOT entitled (ends > now is strict)', () => {
  const v = evaluateAccess({ now: NOW, trialStartedAt: days(7), subActive: false, subExpiresAt: null, trialDays: 7 })
  assert.equal(v.entitled, false)
  assert.equal(v.reason, 'trial_ended')
})

t('day 30, no sub → trial_ended with the (past) end date for the client copy', () => {
  const v = evaluateAccess({ now: NOW, trialStartedAt: days(30), subActive: false, subExpiresAt: null, trialDays: 7 })
  assert.equal(v.entitled, false)
  assert.equal(v.reason, 'trial_ended')
  assert.ok(new Date(v.trialEndsAt) < NOW)
})

t('active sub, no expiry → entitled (subscription)', () => {
  const v = evaluateAccess({ now: NOW, trialStartedAt: days(30), subActive: true, subExpiresAt: null, trialDays: 7 })
  assert.equal(v.entitled, true)
  assert.equal(v.reason, 'subscription')
})

t('active sub flag but expired date → falls back to (ended) trial → 402', () => {
  const v = evaluateAccess({ now: NOW, trialStartedAt: days(30), subActive: true, subExpiresAt: days(1), trialDays: 7 })
  assert.equal(v.entitled, false)
  assert.equal(v.reason, 'trial_ended')
})

t('active sub with future expiry beats an ended trial', () => {
  const future = new Date(NOW.getTime() + 20 * 86400000).toISOString()
  const v = evaluateAccess({ now: NOW, trialStartedAt: days(30), subActive: true, subExpiresAt: future, trialDays: 7 })
  assert.equal(v.entitled, true)
  assert.equal(v.reason, 'subscription')
})

t('sub during an active trial still reports subscription (billing truth wins)', () => {
  const v = evaluateAccess({ now: NOW, trialStartedAt: days(1), subActive: true, subExpiresAt: null, trialDays: 7 })
  assert.equal(v.reason, 'subscription')
})

t('no profile data at all → no_access (client treats as re-auth/paywall)', () => {
  const v = evaluateAccess({ now: NOW, trialStartedAt: null, subActive: false, subExpiresAt: null, trialDays: 7 })
  assert.equal(v.entitled, false)
  assert.equal(v.reason, 'no_access')
  assert.equal(v.trialEndsAt, null)
})

t('trialDays honors the env override (3-day config)', () => {
  const v = evaluateAccess({ now: NOW, trialStartedAt: days(5), subActive: false, subExpiresAt: null, trialDays: 3 })
  assert.equal(v.entitled, false)
})

console.log(`\n${ran} tests passed`)
