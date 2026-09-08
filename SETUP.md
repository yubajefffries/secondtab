# SecondTab — Instance Setup

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


## Instance presentation and sign-in

With both public Supabase variables set, requests require authentication and sign-in
uses Supabase email/password. Magic link and passkey controls are disabled. Missing
either variable keeps demo mode, including the demo identity and branding.

With Supabase configured, branding is read on each server request from the single
`instance_settings` row (`id = 1`) through `public_instance_branding()`. Apply
migration `00000000000004_public_instance_branding.sql` before deploying this change.
The security definer function grants `anon` and `authenticated` access only to
`business_name`, `logo_url`, `brand_primary`, `brand_accent`, `object_labels`, and
`enabled_modules`. Direct settings reads and updates remain admin-only;
`tax_settings` and `qbo_item_mappings` are never returned by the function.
Branding uses the public Supabase key and the server session, without a service role key.

`INSTANCE_CONFIG` is an optional server environment JSON fallback when the RPC
fails or the row is missing. Its supported keys are the same six public fields.
Invalid or missing fallback JSON uses the built-in defaults. Live data takes
precedence over the entire environment fallback; omitted label and module keys
use built-in defaults. Do not put credentials in branding fields.

Sign-in, the shell wordmark, and page title use the live business name.
Unconfigured live instances show "Your business". Demo mode ignores both the RPC
and `INSTANCE_CONFIG` and keeps the defaults in `lib/instance-config.ts`.
Logo and color fields remain part of the contract without changing their rendering.

Example realtor `object_labels` JSON for an administrator to configure as needed
(documentation only, never applied as seed data):

```json
{"person": "Contacts", "company": "Brokerages", "deal": "Transactions"}
```

Sidebar label keys are `dashboard`, `person`, `company`, `deal`, `task`, `calendar`,
`email`, `report`, `workflow`, and `settings`. Values are displayed verbatim, so use
the desired navigation label (for example, `{"deal":"Jobs"}`). The same keys may
be set to false in `enabled_modules` to hide their sidebar items. `email` controls
Communications. Email, calendar, QuickBooks, and AI default to disabled in live
mode; other sidebar items default to visible. Enabling a module here only controls
navigation and does not connect an integration.

The shell reads the signed-in user's `profiles` row. If that row or its name is
missing, the authenticated email is used instead of a demo identity. CRM pages
continue using their existing demo datasets in this PR.
