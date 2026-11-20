# Launch material — draft, not posted

Adapted from ../launch-kit/templates/launch-post.md. Publish only after checking the live deployment and accurately retaining the payment limitation.

## Show HN

Title: Show HN: Launchcheck – Catch the small mistakes before your first visitor

URL: https://launchcheck-sayed.vercel.app

I built Launchcheck for the last hour before a launch: the product works, but the footer, social image or staging copy may still be wrong. Paste a public URL or GitHub repo and get a score with a PASS/FAIL checklist, a shareable report and README badge.

Implementation: Next.js, Cheerio and a durable Neon job table. Outbound requests validate and pin public DNS addresses; scans have a 45-second work budget. Repository checks are explicitly static indicators, not proof of deployed behavior.

The free scanner is available. Full evidence is designed as a $9 one-time unlock, but checkout remains unavailable until Stripe verification. Monitoring is a week-2 plan, not a shipped feature. This is a launch screen, not a security or legal certification.

What did a last-minute launch check miss for you? I would especially value false-positive reports.

## X thread — each numbered post below is below 280 characters

1/ I built Launchcheck: a second pair of eyes before your first visitor. Paste a public URL or GitHub repo. Get a score, PASS/FAIL checks and a shareable report. https://launchcheck-sayed.vercel.app

2/ The plan for this thread: scan recognizable launches and show the actual timestamped results. No invented scores. A finding is a prompt to investigate, not a claim that the product is insecure.

3/ Try a site you’re authorized to check. Launchcheck looks for unfinished copy, selected security headers, privacy/terms pages and social previews. Repo scans inspect source only. https://launchcheck-sayed.vercel.app

4/ The Wikipedia-inspired sample is deliberately simulated, with three injected failures. It demonstrates the report, not Wikipedia’s security. https://launchcheck-sayed.vercel.app/reports/demo

5/ Free summaries work now. The $9 full-report checkout awaits Stripe verification; $19/month monitoring is planned for week 2. Tell me which launch-day mistake you wish a scanner had caught.

## README badge

Use the Copy badge button on a real report. Demonstration badge, explicitly labeled:

[![Launchcheck sample](https://launchcheck-sayed.vercel.app/api/reports/demo/badge)](https://launchcheck-sayed.vercel.app/reports/demo)

## LinkedIn

I built Launchcheck to help solo makers catch small public-facing mistakes in the last hour before launch. It combines content, header, policy and social-preview checks into a shareable summary.

The free scanner is available at https://launchcheck-sayed.vercel.app. The $9 report checkout still needs Stripe verification, and recurring monitoring is not shipped. I’d welcome feedback from people preparing a launch, especially on missed issues and false positives.

## Week-one measurement

Set the start timestamp at the public announcement, excluding engineering smoke scans. Run `node scripts/metrics.mjs 2026-11-21T00:00:00Z` with your actual chosen start timestamp (the shown date is an invocation for this launch day, not a recorded campaign start).

1. 100 completed scans: `completed_scans` from the Neon scans table.
2. 5 paid reports: `paid_reports`, unique scan IDs from verified Stripe fulfillment records.
3. At least 95% of attempts completed within 60 seconds: `within_60s_percent` from scan timestamps, with failures included in the denominator.

No customer traction has been measured. Engineering test scans are not customer demand.

## Human needed

1. Configure Stripe production secret and webhook signing secret in Vercel for this app; register `/api/webhooks/stripe` for checkout completion and asynchronous success. Run a test-mode purchase and refund before enabling live checkout, then verify the live delivery path with an authorized purchase.
2. Choose a private customer-support contact and review the policy/refund wording before charging customers. Current contact is the operator’s real GitHub profile.
3. Post the launch drafts and set the campaign start timestamp. No messages were posted on your behalf.
4. If organizational isolation (not just project/database isolation) is mandatory, create a fresh Neon organization in the console and arrange transfer of the dedicated project. The CLI/API did not offer organization creation.
