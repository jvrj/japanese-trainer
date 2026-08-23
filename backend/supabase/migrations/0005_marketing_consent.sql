-- Marketing consent columns + self-write policy (sign-in/paywall v1, ADR-005).
-- The sign-up screen's unchecked-by-default marketing checkbox needs somewhere
-- to land on the caller's own profile row. `profiles` currently ships
-- select-only RLS (0001_init.sql:87) — without the update policy below the
-- client's consent write would silently affect zero rows.

alter table profiles
  add column if not exists marketing_opt_in boolean not null default false,
  add column if not exists marketing_opt_in_at timestamptz;

-- Idempotent re-run: CREATE POLICY has no IF NOT EXISTS, so drop-then-create.
-- UPDATE only (no insert/delete/select widening); USING + WITH CHECK both
-- pinned to auth.uid() = id so a caller can neither read nor write any row
-- but their own, and cannot re-target another user's row via the update.
drop policy if exists own_profile_upd on profiles;
create policy own_profile_upd
  on profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
