# Launchcheck plan — 2026-11-21

## Market and wedge
| Product | Job and price | Documented friction | Our narrow opportunity |
| --- | --- | --- | --- |
| Google Lighthouse | Free open-source performance, accessibility, SEO and best-practice audits | Its maintainers document score variability; users report differing scores across runs | Deterministic launch-content checks with evidence, rather than another speed score |
| Security Headers | Free browser-based HTTP-header grading | FAQ explains confusing letter grades; a grade describes headers, not total application safety. No independent complaint sample verified | Combine header checks with copy, policies and social previews; never call the score a security certification |
| Ahrefs | Free Site Audit for verified sites; paid suite has tiered subscriptions | Public users report price friction for one-off audits; ownership verification and SEO breadth add setup | One URL, no SEO project setup, $9 one-time detailed launch report |

Sources checked on the plan date: [Lighthouse overview](https://developer.chrome.com/docs/lighthouse/overview), [maintainer explanation](https://github.com/GoogleChrome/lighthouse/blob/main/docs/variability.md), [user issue](https://github.com/googlechrome/lighthouse/issues/17014), [Security Headers](https://securityheaders.com/about/), [header FAQ](https://api.securityheaders.com/faq), [Ahrefs prices](https://ahrefs.com/pricing), [Ahrefs free tier](https://ahrefs.com/faq/), [one-off audit price complaint](https://www.reddit.com/r/SEO/comments/1opdlaw). Ahrefs prices vary by billing term; free verified-site auditing is the direct competitor. The opportunity is an inference, not validated demand.

## Customer and scope
Primary persona: one technical founder shipping a public landing page after a hackathon, with under an hour left before posting. Core job: catch launch-blocking presentation mistakes and missing baseline safeguards before sharing the link. Smallest lovable v1: paste public URL or GitHub repository; queued scan; clear score and all check statuses; useful paid evidence; a share link and badge. No auto-fixes, cron monitoring or account dashboard.

Riskiest assumption: people pay $9 for a curated report when specialist tools are free. Cheapest test: send 20 consenting makers their free summary, offer the real $9 unlock, and count verified payments. Do not fabricate conversions or take money before payment setup is verified.

## Model and routes
- scans: random ID, normalized target, kind, queued/running/complete/failed state, timestamps, deadline, score, findings, private capability hash, demo flag.
- purchases: unique Stripe session/event IDs, scan ID, paid timestamp. Never store card data.
- rate_limits: hashed platform network identity plus hourly window and atomic count; global hourly ceiling.
- `/`: entry and pricing; `/reports/[id]`: summary and progress; `/reports/[id]/full`: private full report/paywall; `/api/scans`: create; `/api/scans/[id]`: polling; `/api/checkout`: hosted payment; `/api/webhooks/stripe`: signed fulfillment; `/api/reports/[id]/badge`: image; `/privacy`, `/terms`, real not-found route.
- Empty: labeled input and sample report. Loading: queued/running states and elapsed timer. Error: useful retry action with no internal traces. Success: score, scope, elapsed time, PASS/FAIL list. Checkout unavailable: explicit status, never a fake successful purchase.

## Implementation and verification sequence
1. Initialize isolated repo, read kit, check service access.
2. Build bounded SSRF-safe fetcher, pure checks, durable queue and storage adapters.
3. Implement responsive product and Stripe authorization; generate kit policies and OG image.
4. Test pure logic, security denials, queue and browser flow; production build and dependency audit.
5. Run kit gates unchanged, capture desktop/mobile screenshots, narrated video, storefront README and launch drafts.
6. Create GitHub repository and Vercel deployment if authenticated; document exact blockers and week-one counters.
