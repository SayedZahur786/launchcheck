# Release gate evidence

21 November 2026. Shared launch kit was read and executed in place, never modified.

| Gate | Result | Evidence |
| --- | --- | --- |
| Frozen install | PASS | npm ci completed from the committed lockfile. |
| Core tests | PASS | 12 tests: individual checks, weighted score, normalization/SSRF ranges, ownership, public redaction, atomic claims and rate limits. |
| Production build | PASS | Next.js 16.4.6 compiled and typechecked all routes locally and on Vercel. |
| Lint | PASS | ESLint completed with no errors. |
| Dependency audit | PASS | Zero vulnerabilities; docs/dependency-audit.json. |
| placeholder-scan | PASS | Shared script inspected authored source, policies, tests and docs; final scan repeated before push. |
| header-check | PASS | Canonical HTTPS origin, all 3 routes, including HSTS. |
| policy-check | PASS | Canonical HTTPS origin, distinct substantive policy pages. Legal adequacy remains manual. |
| perf-check | PASS | Cold-build mobile LCP 660/604/644 ms, worst 660 ms; 4× CPU, 1.6 Mbps, 150 ms latency. Local lab only. |
| URL happy path | PASS | Browser enters public URL, waits for real score, opens paywall and verifies badge; forged origins and unsigned payment rejected. |
| Public production smoke | PASS | Own deployed site scanned: 100/100 on its limited checks. Full browser workflow 6.628 seconds; evidence redacted, cross-browser access denied, badge 200, cross-origin POST 403. See production-smoke.json. |
| Desktop/mobile routes | PASS | Production screenshots of home, sample summary, full sample, privacy, terms and real 404; no horizontal overflow at 390 px. |
| Browser security smoke | PASS | No CSP errors or exposed stack/secret names on public routes. |
| Narrated video | PASS | 49.56 seconds; H.264 picture, AAC narration; large visible captions and honest payment status. |
| Repository scan | Verification in progress | Large-tree fallback added after a real oversized-tree failure; final test result recorded below. |
| Secrets and git history | Verification in progress | Initial 2 commits scanned by Gitleaks without findings; repeat on final index/history before push. |
| Real payment delivery | FAIL / HUMAN NEEDED | Stripe account keys and webhook registration absent. Checkout stays disabled; no charge or sale claimed. |

The score is not a security, legal, accessibility or performance certification. A live self-scan is a smoke test, not independent validation. Initial failures (missing migration, large GitHub tree, default Vercel SSO propagation) are recorded in DECISIONS.md and were not suppressed.
