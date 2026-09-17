# GitHub Market Scan: Claude Code / AI-Coding Ecosystem

**Scan Date:** 2026-09-17  
**Status:** Rate Limited (Unauthenticated)  
**Domains Scanned:** 4 (claude-code, claude agent, coding agent, ai coding)

## Limitations

This scan encountered GitHub API rate limiting for unauthenticated requests (60 req/hour limit).
The scan was unable to retrieve the full result set across all 4 domains × 3 categories each.

### Rate Limit Details
- **Error:** "API rate limit exceeded for [IP]. Authenticated requests get a higher rate limit."
- **Rate Limit:** 60 requests per hour for unauthenticated clients
- **Documented at:** https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting

### Queries Attempted
1. **Top by stars (all-time)** - 4 queries (one per domain)
2. **Trending (pushed last 14 days)** - 4 queries (last 14 days = since 2026-09-03)
3. **New entrants (created last 30 days)** - 4 queries (last 30 days = since 2026-08-18)

**Total Queries Needed:** 12  
**Rate Limit Per Hour:** 60  
**Queries Executed Before Rate Limit:** 4/12 (33% of scan)

## Findings

Due to rate limiting, no results were successfully retrieved.

## Recommendation

To complete this scan, either:
1. Authenticate with GitHub CLI (`gh auth login`) to get 5,000 req/hour limit
2. Use GitHub Personal Access Token for higher limits
3. Cache results and rerun 1 hour later after current quota resets

## Related Commands

```bash
# Authenticate gh CLI
gh auth login

# Check current rate limits
gh api rate_limit

# Search with authentication
gh api -X GET search/repositories -f q="claude-code" -f sort=stars -f order=desc -f per_page=10
```

