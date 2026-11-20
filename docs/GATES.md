# Release gate evidence

21 November 2026. Shared launch kit was read and executed in place, never modified.

| Gate | Result | Evidence |
| --- | --- | --- |
| Frozen install | PASS | npm ci completed from the committed lockfile. |
| Core tests | PASS | 14 tests: individual checks, weighted score, normalization/SSRF ranges, ownership, public redaction, atomic claims, rate limits, oversized-response settlement and signed payment integration. |
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
| Repository scan | PASS | Real vercel/next.js browser scan completed in 7.1 seconds after the bounded root-tree fallback and blob-source fix. |
| Secrets and git history | PASS | Gitleaks scanned tracked source, staged launch assets and history without findings; final history scan repeated after release commits. |
| Real payment delivery | FAIL / HUMAN NEEDED | Stripe account keys and webhook registration absent. Checkout stays disabled; no charge or sale claimed. |

The score is not a security, legal, accessibility or performance certification. A live self-scan is a smoke test, not independent validation. Initial failures (missing migration, large GitHub tree, default Vercel SSO propagation) are recorded in DECISIONS.md and were not suppressed.

GitHub README verification: the committed SVG loaded inside GitHub's actual rendered README; image-only captures 1.7 seconds apart differed, proving that the animation plays. See readme-verification.json and screenshots/github-readme.png.

Narration verification: AAC audio mean -17.6 dB, peak -1.6 dB, with the synthetic narration script and timing committed. The poster frame was visually checked for readable captions.

GitHub Actions: [checks run 44835989417](https://github.com/SayedZahur786/launchcheck/actions/runs/44835989417) passed frozen install, all 14 tests, lint, production build and dependency audit on Node 22. This is a real successful hosted CI run.

Final screenshot run: all eight main route states captured at 1440 px and 390 px, including a freshly scanned live summary and its actual paywall; completed in 6.1 seconds with no horizontal overflow.
