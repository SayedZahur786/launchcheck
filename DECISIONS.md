# Decisions

- 2026-11-21: Next.js App Router, TypeScript, Tailwind, Cheerio, Neon Postgres, Vercel. One repository and database project for Launchcheck.
- Root ignore rule is the sole folder-boundary exception, explicitly required by the brief; it excludes every immediate project directory except launch-kit. Shared kit remains untouched.
- Primary customer: solo maker preparing tomorrow's public launch. Fixed v1 scope; monitoring is week 2 at a proposed $19/month, with no subscription sold in v1.
- Free summary includes every PASS/FAIL and score. $9 buys evidence and concrete remediation per report. Sharing never exposes purchased evidence; possession of a secure browser capability authorizes paid detail. No account system is needed for v1. Recovery is via a paid Stripe checkout session in the original browser; cross-device magic-link delivery is not included.
- Demo is a clearly labeled simulated scan inspired by Wikipedia, with exactly three intentional failures. It does not allege defects in Wikipedia.
- Select a real Playwright walkthrough, with local text-to-speech narration and captions: showing the actual scanner and paywall matters more than a motion-only promo. No /brag installation needed.
- Local development uses a file-backed durable adapter only when explicitly enabled. Hosted production fails closed without Neon; it never uses an ephemeral local database.
- Queue uses persistent rows, atomic claims and Next.js after-response execution. Poll requests can resume unclaimed work after interruption. A 45-second scan deadline leaves request overhead within a 60-second function budget; timed-out jobs report failure rather than a misleading score.
- No third-party analytics. Shared analytics component remains off; operational aggregate counts come from scan and verified-payment records.
