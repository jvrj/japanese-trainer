# Topic Discovery: Praktika App Deep Teardown
**Research Scope:** YouTube topic-driven creator discovery + deep-dive video analysis

## Research Status: BLOCKED

### Blocker Summary
YouTube video access requires authentication (cookies or browser session). yt-dlp, while installed (v2026.03.17), cannot fetch search results without credentials due to YouTube's bot-protection measures:
- All video search queries returned "Sign in to confirm you're not a bot" errors
- No fallback method available for unauthenticated access to video metadata
- Transcript + comment extraction prerequisites cannot be met

### Intended Queries
The following research queries were designed but could not be executed:
1. "Praktika app review"
2. "Praktika AI tutor walkthrough"
3. "AI language learning avatar conversation"
4. "Praktika free conversation speaking"
5. "Praktika AI teacher demo"
6. "language learning AI avatar app 2024 2025"

### Expected Deliverables (Not Produced)
- Channel discovery (>=2 query matches)
- Top 3 channels by view-count×recency
- 5 videos per channel (15 total) with transcript + comments
- Per-video analysis: tools, GitHub URLs, patterns, failure modes, signal density
- Product teardown: ad-vs-reality verification, onboarding flow, avatar/voice/latency stack, pricing, retention mechanics, review sentiment, growth playbook
- Copy-vs-avoid list for Isshin PWA

### Workaround Requirements
To complete this research lane:
- Provide YouTube authentication via `--cookies-from-browser` or `--cookies` flag
- OR use browser-based search with authenticated session (requires Chrome integration)
- OR substitute alternative sources (Praktika official demos, app store reviews, written reviews/blogs)

---
*Research initiated 2026-07-17, blocked by authentication requirement.*
