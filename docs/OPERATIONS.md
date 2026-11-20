# Operate Launchcheck

## Provisioned resources
- GitHub: https://github.com/SayedZahur786/launchcheck
- Vercel project: `launchcheck`, ID `prj_3vtmwCFIq4mXFOczMKetlR1tWfb7`
- Canonical origin: https://launchcheck-sayed.vercel.app
- Neon organization: `org-sweet-wildflower-67376060`
- Dedicated Neon project: `fragrant-pine-65355999`
- Production branch: `br-quiet-grass-bcgcva0v`

## Configuration
`DATABASE_URL` is the pooled least-privilege runtime URL. `DATABASE_URL_UNPOOLED` is the owner connection for migrations, kept local and never sent to Vercel. `APP_URL` is the exact canonical origin. `RATE_LIMIT_SALT` is server-only random data. `LOCAL_STORE=1` enables the file adapter only outside Vercel; it is single-process development storage, not a hosted database.

`STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are required together to enable payment. Register checkout.session.completed and checkout.session.async_payment_succeeded for `/api/webhooks/stripe`. Price and currency are fixed server-side to USD 900 cents; payment mode, status, amount and report ID are verified before entitlement. Configure test mode first, verify purchase and refund, then separately configure live keys. Never commit or pass secrets in shell command arguments.

## Database setup

The requested Neon sequence was completed using npx because the global binary already existed:

```sh
npx neon@latest init -y --org-id org-sweet-wildflower-67376060 --project-id fragrant-pine-65355999 --branch production --services postgres --no-agent-setup
npx neon@latest deploy
npm run db:migrate
```

`neon deploy` may overwrite DATABASE_URL with an owner connection. Preserve and reapply the restricted runtime connection before deploying the web app. `scripts/runtime-role.mjs` provisions the role once and deliberately refuses to rotate an existing role. Use owner credentials only in maintenance tooling. New schema changes should be tested on a Neon development branch before applying to production. The initial migration was applied to the empty new app project.

## Deploy

Run tests, a frozen `npm ci`, lint and build. Link this directory with `vercel link --project launchcheck`. Configure the app-only production env vars through Vercel. `scripts/deploy-env.mjs` transfers only the pooled runtime URL, canonical origin and generated rate-limit salt; it does not transfer migration credentials or Stripe keys. For the initial setup it adds those variables, and refuses silently replacing an existing value.

Then run `vercel deploy --prod`, assign the canonical alias, and run the shared kit header/policy gates against HTTPS. Production secrets are not assigned to preview environments. GitHub Actions runs tests/lint/build without service credentials; external live smoke tests require an explicit configured environment.

## Maintenance

Run `node scripts/maintenance.mjs` to remove expired rate-limit buckets. For deletion requests, verify control of the report through a private support exchange and use the owner connection in a transaction; remove related purchases only when retention obligations permit. Do not implement a public unauthenticated delete endpoint.

Neon history retention at provisioning was 6 hours. Recover through a timestamped branch within that window, verify data and schema, then deliberately switch connection strings. Do not reset production as a troubleshooting shortcut. Failed scans can be rerun from the home page; no monitoring cron is configured.

## Week-one metrics

`node scripts/metrics.mjs` takes one ISO campaign-start timestamp. Set it when announcements go public so development smoke scans are excluded. It returns completed scans, distinct paid reports and percentage of all attempted scans completed within 60 seconds. Targets are 100, 5 and 95% respectively. This script reads aggregate counts, not target URLs or payment/customer details.
