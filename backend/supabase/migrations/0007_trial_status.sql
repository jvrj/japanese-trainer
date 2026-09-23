-- Card-required trial (2026-09-23). The webhook now records the raw Stripe
-- subscription status and the trial end so the app can distinguish a free
-- week (status 'trialing') from a paid period. Written ONLY by stripe-webhook
-- (service_role); the 0001 RLS policy still limits users to their own row.
alter table entitlements
  add column if not exists status text,
  add column if not exists trial_end timestamptz;
