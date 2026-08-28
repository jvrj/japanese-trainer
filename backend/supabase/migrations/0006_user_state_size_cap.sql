-- Account sync goes live (v8.80) — the client now writes its learning-state
-- snapshot to user_state (0001_init.sql shipped the table + own-row RLS but
-- nothing used it until now). Add an abuse guard before first real traffic:
-- a hostile client with a valid session could otherwise upsert an arbitrarily
-- large jsonb into its own row and eat free-tier database storage. Real
-- snapshots are tens-to-hundreds of KB; 2 MB is far above any legitimate one.

alter table user_state
  drop constraint if exists user_state_json_size_cap;
alter table user_state
  add constraint user_state_json_size_cap
  check (pg_column_size(state_json) < 2097152);
