# Quality bar — go-to-market artifacts

Adopted 2026-08-21 (owner: "assuming high quality from the get go — I don't
want to be going through everything and having to redo it all").

**The rule: the owner reviews for TASTE, never for QA.** Every market-facing
artifact (landing copy, demo video, icons/screenshots, checkout flow, ad
creative) passes ALL four gates below BEFORE the owner ever sees it. Anything
that would make him say "redo this" must be caught by a gate, not by him.

## The four gates (all mandatory, in order)

**G1 — Grounded.** Copy/claims come from evidence, not invention:
- Every pain/hook phrase traces to the market research (buyers' own words).
- Every capability claim is audited against the shipped code
  (hydra-swarm → adversarial-verify — the pipeline that caught the
  "works offline" overclaim on 2026-08-21). Claims must stay true AFTER the
  relay cutover (server-side transcription), not just today.
- Honest-surface rule: never show or say capability the shipped app doesn't
  deliver. No urgency/loss framing, no "fluent in N weeks", ever.

**G2 — Crafted.** Independent judgment against best-in-class, not self-review:
- Variants are over-generated and judged (generate-filter / judge-panel) on a
  weighted rubric agreed BEFORE building (forge discipline: the evaluator
  can't move goalposts, the builder can't grade itself).
- Threshold: weighted average ≥ 8/10 AND no criterion below 7. Below bar →
  fix loop, not a shrug.
- Reference class: judged against named best-in-class consumer examples
  (e.g. Praktika/Duolingo-tier landing pages and store assets), not against
  "pretty good for a solo app".
- UI work additionally gets a design-skill pass (impeccable if installed,
  else frontend-design/ui-ux-pro-max).

**G3 — Functions.** Proven to work, on the surface a customer actually uses:
- Playwright behavioural gate at phone viewport (412×915) for anything
  interactive; hydra-verify for render/run checks of built assets.
- Checkout flow: full Stripe TEST-mode end-to-end (subscribe → entitlement →
  cancel → trial expiry) + security-reviewer pass before real cards.
- Live-URL poll after deploy; no "shipped" claim before the live check.

**G4 — Coherent.** One voice across every surface:
- Tagline family: "Learn Japanese by ear — hear it, say it, keep what
  sticks." Landing, manifest, store copy, ads, video captions all match.
- Pricing everywhere: $8.99/mo · $59.99/yr · 7-day trial. No stray old
  models ("drills free forever" is dead; conversation-first copy is dead —
  see the superseded banner in docs/store-listing-copy.md).

## Per-deliverable notes

| Deliverable | Build harness | Judge rubric highlights |
|---|---|---|
| Landing copy rewrite | generate-filter variants → judge-panel | pain-language fidelity, clarity in 5s, honesty, CTA strength |
| Demo video (~30s) | script judged BEFORE production; real-app footage only | shows HOW in first 5s, invites "imagine my routine", no AI-slop feel, legible captions muted |
| Icon + screenshots | generate → judge-panel | recognisable at 48px, consistent with app palette, honest UI |
| Checkout + entitlement | /hydra-forge (rubric + evaluator per sprint) | test-mode E2E, $0 fixed cost, security pass |
| Ad creative | variants → judge-panel | hook in 2s, claim-audited, platform-policy safe |

## Standing constraints (inherited)

- $0 fixed operating cost — never add a paid API to the core loop.
- Owner's device baseline: Android Chrome (Pixel 9 Pro), but design universal.
- Every ship: version bump + sw cache bump + gate + explicit-path commit +
  live poll (see repo ship ritual).
