-- Billing wiring (Web + Stripe first — go-to-market lock 2026-08-20).
-- The entitlements table (0001) is the subscription truth the gate reads;
-- Stripe (not RevenueCat) is the first writer. These columns let the webhook
-- reconcile Stripe objects to a user without a second lookup table.
-- Written ONLY by the stripe-webhook edge function (service_role); RLS from
-- 0001 already limits users to selecting their own row.

alter table entitlements
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

create index if not exists entitlements_stripe_customer_idx
  on entitlements (stripe_customer_id);
