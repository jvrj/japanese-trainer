-- Talk (live voice teacher) — 2026-09-24, owner call "voice next".
-- Per-caller daily seconds of live voice, the unit the minute cap is enforced on.
-- Written ONLY by the talk-token edge function (service_role); never by clients.
create table if not exists talk_usage (
  caller_id   text not null,
  day         date not null,                 -- UTC date
  seconds     int  not null default 0,       -- seconds of live session reported
  sessions    int  not null default 0,       -- passes minted
  updated_at  timestamptz not null default now(),
  primary key (caller_id, day)
);
alter table talk_usage enable row level security;   -- no policies: service_role only

-- Atomic bump. p_seconds may be 0 (a mint counts a session, not time).
create or replace function talk_bump(p_caller text, p_seconds int, p_session int)
returns table(seconds int, sessions int) language plpgsql security definer as $$
begin
  insert into talk_usage(caller_id, day, seconds, sessions)
    values (p_caller, (now() at time zone 'utc')::date, greatest(0, p_seconds), greatest(0, p_session))
  on conflict (caller_id, day)
    do update set seconds  = talk_usage.seconds  + greatest(0, p_seconds),
                  sessions = talk_usage.sessions + greatest(0, p_session),
                  updated_at = now()
  returning talk_usage.seconds, talk_usage.sessions into seconds, sessions;
  return next;
end $$;

revoke execute on function public.talk_bump(text, int, int) from public, anon, authenticated;
grant  execute on function public.talk_bump(text, int, int) to service_role;
alter  function public.talk_bump(text, int, int) set search_path = public;
