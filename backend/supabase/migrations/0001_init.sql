-- Isshin backend — Phase 0 schema (ADR-004, ADR-005)
-- profiles · user_state (synced app blob) · entitlements (subscription) ·
-- usage_daily (per-caller fair-use cap) · global_usage (spend circuit-breaker).
-- All times/days are UTC. Cap + ceiling are the money-protecting invariants (ADR-004 §3).

-- ---------- core per-user tables ----------
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- the whole app state blob, mirrors today's localStorage keys 1:1 (ADR-005)
create table if not exists user_state (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  state_json  jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- subscription truth, written by the RevenueCat webhook in Phase 4 (ADR-006)
create table if not exists entitlements (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  active      boolean not null default false,
  product     text,
  expires_at  timestamptz,
  updated_at  timestamptz not null default now()
);

-- ---------- guard tables (service-role only) ----------
-- per-caller daily counters. caller_id = a user uuid (Phase 2+) or 'owner' (soft-secret interim).
create table if not exists usage_daily (
  caller_id   text not null,
  day         date not null,                 -- UTC date
  items       int  not null default 0,       -- successful graded items (the fair-use cap unit)
  requests    int  not null default 0,       -- raw requests (rate-limit unit)
  updated_at  timestamptz not null default now(),
  primary key (caller_id, day)
);

-- global daily spend circuit-breaker (ADR-004 §3 503)
create table if not exists global_usage (
  day         date primary key,              -- UTC date
  spend_usd   numeric not null default 0
);

-- ---------- atomic counters (avoid read-modify-write races) ----------
create or replace function bump_request(p_caller text)
returns table(items int, requests int) language plpgsql security definer as $$
begin
  insert into usage_daily(caller_id, day, requests)
    values (p_caller, (now() at time zone 'utc')::date, 1)
  on conflict (caller_id, day)
    do update set requests = usage_daily.requests + 1, updated_at = now()
  returning usage_daily.items, usage_daily.requests into items, requests;
  return next;
end $$;

create or replace function bump_item(p_caller text)
returns int language plpgsql security definer as $$
declare cur int;
begin
  insert into usage_daily(caller_id, day, items)
    values (p_caller, (now() at time zone 'utc')::date, 1)
  on conflict (caller_id, day)
    do update set items = usage_daily.items + 1, updated_at = now()
  returning usage_daily.items into cur;
  return cur;
end $$;

create or replace function add_spend(p_usd numeric)
returns numeric language plpgsql security definer as $$
declare cur numeric;
begin
  insert into global_usage(day, spend_usd)
    values ((now() at time zone 'utc')::date, p_usd)
  on conflict (day) do update set spend_usd = global_usage.spend_usd + p_usd
  returning global_usage.spend_usd into cur;
  return cur;
end $$;

-- ---------- RLS: users touch only their own rows; guard tables are service-role only ----------
alter table profiles      enable row level security;
alter table user_state    enable row level security;
alter table entitlements  enable row level security;
alter table usage_daily   enable row level security;   -- no policies => only service_role reaches it
alter table global_usage  enable row level security;   -- same

create policy own_profile      on profiles     for select using (auth.uid() = id);
create policy own_state_select on user_state   for select using (auth.uid() = user_id);
create policy own_state_ins    on user_state   for insert with check (auth.uid() = user_id);
create policy own_state_upd    on user_state   for update using (auth.uid() = user_id);
create policy own_ent_select   on entitlements for select using (auth.uid() = user_id);
