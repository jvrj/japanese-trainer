-- Isshin backend — Phase 1: the 7-day free trial (decision locked 2026-07-21)
-- Every account gets free live-AI access for TRIAL_DAYS from signup — no card.
-- After that, live AI chat requires an active entitlement (subscription); drills
-- and scripted practice never touch the relay, so they stay free by construction.

-- trial clock starts at account creation
alter table profiles
  add column if not exists trial_started_at timestamptz not null default now();

-- auto-create the profile row (and so the trial clock) the moment an account exists
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles(id) values (new.id) on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- one-round-trip access snapshot for the gate. Self-healing: creates the
-- profile row if the signup trigger somehow missed (older accounts).
create or replace function get_access(p_user uuid)
returns table(trial_started_at timestamptz, sub_active boolean, sub_expires_at timestamptz)
language plpgsql security definer as $$
begin
  insert into profiles(id) values (p_user) on conflict (id) do nothing;
  return query
    select p.trial_started_at, coalesce(e.active, false), e.expires_at
    from profiles p
    left join entitlements e on e.user_id = p.id
    where p.id = p_user;
end $$;
