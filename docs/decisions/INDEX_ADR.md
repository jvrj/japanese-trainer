# ADR Index — Isshin (japanese-trainer)

One row per architecture decision record in `docs/decisions/`. Pointer index, not a restatement — open each ADR for detail.

| # | Title | Status | Date |
|---|---|---|---|
| ADR-004 | Backend & API-proxy architecture (Supabase relay; no uncapped public relay; gate contract) | Accepted | 2026-06-29 |
| ADR-005 | Auth & cloud-sync stack (Supabase Auth + `user_state` JSONB; per-item merge) | Accepted | 2026-06-29 |
| ADR-006 | Subscription / IAP layer (RevenueCat over StoreKit2 + Play Billing) | Accepted | 2026-06-29 |
| ADR-007 | Native wrapper choice (Capacitor; conditional on iOS WKWebView mic spike) | Accepted | 2026-06-29 |
| ADR-008 | Conversation-first two-door IA (Home hero + Practice drawer; deletion veto cleared — all 4 modes go) | Accepted | 2026-07-17 |
| ADR-009 | Judgment-free interaction spec (copy rules + latency budgets + double-miss containment) | Accepted | 2026-07-17 |
| ADR-012 | Rolling-frontier vocab hard lock (FRONTIER_N=80; choke point in `getActiveWords`; supersedes ADR-003) | Accepted | 2026-07-19 |
| ADR-013 | Sensei teaching layer (teach card + spoken breath; amends Delve-7 invisibility; keyed gate shared with ADR-011) | Accepted | 2026-07-19 |

## Not yet promoted (still in `docs/decisions-pending/`)
These describe already-shipped features and are de-facto accepted by implementation, but were never formally promoted. Promote on request.
- ADR-001 — Conversation-mode interaction model (delve 1; shipped)
- ADR-002 — Conversation-mode SRS coupling (delve 1; shipped)
- ADR-003 — Progressive vocab access model (delve 2; shipped) — **Superseded by ADR-012, 2026-07-19**
