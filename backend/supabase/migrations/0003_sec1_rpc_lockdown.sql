-- SEC-1 minimal lockdown (ADR-017 items 1 + 4, pre-signoff safety subset).
-- Supabase/PostgREST exposes public-schema functions as anon-callable RPCs via the
-- default EXECUTE grant to PUBLIC. These five are internal gate machinery: callable
-- by an anon-key holder they allow a one-request global spend DoS (add_spend) and an
-- entitlement IDOR (get_access). Lock them to service_role (the edge functions' role).
-- The remaining ADR-017 items (model allow-list, tiered breaker, lazy trial clock)
-- ship with the full ADR-016/017 signoff.

revoke execute on function public.bump_request(text)     from public, anon, authenticated;
revoke execute on function public.bump_item(text)        from public, anon, authenticated;
revoke execute on function public.add_spend(numeric)     from public, anon, authenticated;
revoke execute on function public.get_access(uuid)       from public, anon, authenticated;
revoke execute on function public.handle_new_user()      from public, anon, authenticated;

grant execute on function public.bump_request(text)      to service_role;
grant execute on function public.bump_item(text)         to service_role;
grant execute on function public.add_spend(numeric)      to service_role;
grant execute on function public.get_access(uuid)        to service_role;

-- Pin search_path on all five SECURITY DEFINER functions (ADR-017 item 4).
alter function public.bump_request(text)    set search_path = public;
alter function public.bump_item(text)       set search_path = public;
alter function public.add_spend(numeric)    set search_path = public;
alter function public.get_access(uuid)      set search_path = public;
alter function public.handle_new_user()     set search_path = public;
