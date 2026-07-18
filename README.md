# Northstar CRM

An open source CRM for small service businesses — a car wrap shop, a realtor, an IT/MSP — built to be self-hosted on **Vercel + Supabase**, one fully isolated instance per business.

Built from the audited PRD (`docs/PRD.md`). Design follows the Northstar reference mockups: light and dark themes are first-class, one responsive codebase for desktop and mobile (PWA planned).

## Status

Phase 1 scaffold (secure CRM core):

- ✅ App shell: sidebar navigation, global search / command palette (Ctrl+K), quick create, light/dark/system theme
- ✅ Dashboard: KPI cards with sparklines, pipeline funnel, recent activity, my tasks, integrations health
- ✅ Pipeline: kanban board with drag-and-drop between stages (keyboard-accessible via arrow keys), undo, table view, stage totals
- ✅ Contacts and Companies: list views + record detail (overview, activity, tasks, estimates/invoices, communications)
- ✅ Tasks, Calendar, Reports (fixed v1 dashboard), Communications, Automations, Settings
- ✅ Database schema + deny-by-default RLS policies as versioned Supabase migrations (`supabase/migrations/`)
- ⬜ Supabase provisioning: the app currently runs in **demo mode** with sample data; live queries, auth flows, and RLS tests wire up when an instance is provisioned (see `SETUP.md`)
- ⬜ Phase 2+: lead capture, product catalog + line items, QuickBooks Estimates/Invoices, connected email, AI assistance

## Stack

Next.js (App Router) · Tailwind CSS v4 · Radix UI · Supabase (Postgres, Auth, RLS, Storage, Queues) · Resend (system mail only) · Vercel

## Local development

```bash
npm install
npm run dev
```

Without Supabase env vars the app runs in demo mode with sample data. Copy `.env.example` to `.env.local` and fill in values to connect a real instance.

## Deployment model

Each business gets its own Vercel project and Supabase project running this same codebase. No shared database, no cross-tenant RLS. See `SETUP.md` for the full provisioning walkthrough, including the OAuth app registrations (Google, Microsoft, Intuit) that connected email and QuickBooks require.

## License

AGPL-3.0 (planned; see PRD §15). A CLA will be required for external contributions before the first external PR is merged.
