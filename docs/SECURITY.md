# Launch self-audit

Reviewer: Codex automated implementation and self-review, 21 November 2026. No independent penetration test is claimed. Checklist source: ../launch-kit/checklists/security.md, used unchanged.

| Checklist item | Status | Evidence |
| --- | --- | --- |
| Protected routes and ownership | PASS | Full report requires a matching 256-bit browser capability and verified purchase. Public report/API serialize only status and score. Pure tests cover wrong/missing capability. Browser tests prove no evidence in summary or paywall. Demo evidence is explicitly public simulation. |
| Input validation, bounded bodies, SQL, migrations | PASS | URL parser rejects credentials, queries, non-HTTPS, IP literals and alternate ports. Fetch validates every redirect, rejects all non-unicast resolved IPs and pins a vetted DNS answer. Body 4 KB, webhook 64 KB, HTML 1 MB, image 5 MB, repo tree 2 MB, 12 source files at 100 KB. Parameterized runtime SQL; versioned migration; restricted app role. |
| Secrets and history | Pending final scan | Run Gitleaks on tracked source and complete git history before push. Runtime credentials are ignored; Vercel receives only the restricted pooled URL, never the admin connection. Preview environment has no production secret. |
| Rate limits, costs, webhooks | PASS with payment verification blocked | Atomic Neon counters enforce 8 scans/network/hour and 100 globally/hour; tests cover concurrent exhaustion. Only Vercel's overwritten x-vercel-forwarded-for is trusted; arbitrary x-forwarded-for is ignored. Missing database/salt fails closed. Signed Stripe webhooks verify amount, currency, mode and report mapping; unique session rows prevent replay fulfillment. Actual Stripe transaction awaits owner credentials. |
| Cookies, expiry, CSRF, redirects | PASS | HTTP-only, Secure on hosted production, SameSite=Lax, 30-day browser/server ownership expiry. Mutations compare Origin with configured APP_URL. Checkout redirect is Stripe-hosted; return URLs derive from server config. No roles/accounts or user-supplied return URLs. |
| HTTPS headers and CSP | Pending hosted gate | Nonce-based CSP, no production eval, restrictive framing/base/object permissions; local 3-route gate passed. |
| Dependency audit | PASS | npm audit reports zero vulnerabilities; lockfile committed. Frozen install must be repeated after final dependency inputs. |
| Policies, filler, performance | PASS locally | Generated kit policies describe actual processing and retention. Analytics is disabled. Local cold-build LCP 660/604/644 ms. Policy/header/source gates rerun at release. Contact uses the operator's real GitHub profile; owner should add a private support channel before charging. |
| Errors, accessibility, recovery | PASS | Generic errors, retry UI, no raw stack traces. Playwright checks public routes, narrow widths, CSP errors, scan and paywall; desktop/mobile screenshots visually reviewed. |

## Payment boundary
No card entry or upload endpoints exist. Stripe-hosted checkout is disabled without both secret and webhook keys. No test charge is represented as a real sale. Fulfillment does not trust redirect parameters or client-supplied amounts. Accounts and magic-link recovery are not implemented; essential browser capabilities provide private report access.

## Operational limits and recovery
Queue dispatch uses Next.js after-response work with atomic Neon claims. Polling resumes a queued job; a running job older than 60 seconds is marked failed. There is no cron, automatic retry after a claimed job is interrupted, or monitoring in v1. Neon free-plan history retention was provisioned at 21,600 seconds (6 hours); use a timestamped branch in that window for recovery, verify it, then deliberately switch the app connection. Migrations use the direct owner connection; runtime cannot perform DDL. Run `node scripts/maintenance.mjs` during maintenance to remove expired rate-limit buckets. Reports are not automatically deleted; the policy says so.

## Remaining external evidence
A signed end-to-end Stripe checkout, refund and delivery check requires owner-controlled Stripe keys and a webhook registration. Legal review and private support contact selection remain owner tasks. These do not block a free scanning preview but do block claiming a fully verified paid launch.
