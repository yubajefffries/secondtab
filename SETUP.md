# Northstar CRM — Instance Setup

Honest framing up front: the Vercel deploy itself is quick, but **connected email and QuickBooks require you to register your own developer apps** with Google, Microsoft, and Intuit. The CRM is fully usable without ever completing those registrations — they are optional modules.

## 1. Core instance (required)

1. **Create a Supabase project** (one per business — never shared).
2. **Apply migrations** with the Supabase CLI:
   ```bash
   npx supabase link --project-ref <ref>
   npx supabase db push
   ```
   All schema changes live in `supabase/migrations/`. Never edit the schema in the dashboard.
3. **Create the Vercel project** from this repo and set env vars from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; used by queue consumers and webhooks)
4. **Auth**: enable email/password (or magic link) plus TOTP MFA in Supabase Auth settings. Passkeys stay behind a feature flag while the provider implementation is experimental. Configure at least two recovery paths (backup factor + owner break-glass) before inviting real users.
5. **First user**: sign up, then set `role = 'owner'` on your row in `profiles`.
6. **Backups**: confirm the Supabase backup schedule and run one restore drill before go-live.

## 2. Transactional email (recommended)

Create a Resend account, verify the app's sending domain, set `RESEND_API_KEY` and `RESEND_FROM_ADDRESS`. This path sends system mail only (invites, notifications, digests) and never impersonates a user's personal address.

## 3. QuickBooks Online (optional module)

1. Create an app at developer.intuit.com. Sandbox keys work immediately; production keys require Intuit's app review.
2. Set `QBO_CLIENT_ID`, `QBO_CLIENT_SECRET`, `QBO_WEBHOOK_VERIFIER_TOKEN`.
3. Connect in Settings → Integrations. Webhooks are signature-verified and enqueued, never processed inline.

## 4. Connected email (optional modules)

**Gmail:** register a Google Cloud OAuth app. Reading mail uses restricted scopes — a published app needs Google verification plus an annual CASA security assessment. Small instances can run in testing/internal mode; understand the tradeoffs before choosing. Gmail push also requires a Pub/Sub topic.

**Microsoft 365:** register an app in Entra ID. Multi-tenant use requires publisher verification — lighter than Google's process but still a real step.

Set the corresponding `*_OAUTH_CLIENT_ID`/`*_OAUTH_CLIENT_SECRET` vars, then connect per-user in Settings.

## 5. Upgrading

```bash
git pull
npx supabase db push   # applies pending migrations
```
Redeploy on Vercel. Migrations are written expand/contract style, so a deploy and a migration never have to land in the same instant.
