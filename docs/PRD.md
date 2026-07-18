# Open Source CRM Platform: Product Requirements Document (v3, Audited)

Revised to incorporate the architecture, security, product-scope, integration, operations, and UI/UX audit.

## 1. Summary

An open source CRM, hosted on Vercel, built to serve small service businesses like a car wrap shop, a realtor, and a small IT/MSP company out of the box, while staying generic enough for any small business to adopt. The project ships as a public open source repo that anyone can self-host, and also runs as a hosted instance for your own three businesses, with the option to offer it to future clients left open.

Core pillars:
- Self-hostable on Vercel + Supabase, deployed as a completely separate instance per business
- AI-native: bring-your-own-key, with a chat assistant, auto-drafted communications, and workflow automation, all gated by human approval for actions that write data or send mail
- QuickBooks Online two-way sync with real line items and Estimates, not just a single deal value
- Connected email (Gmail/Microsoft 365) for conversation logging, plus transactional email for the app itself, with a clearly separated send path
- Passkey + 2FA authentication with a documented recovery path
- Customizable through settings (custom fields in v1, custom objects in v1.5) and through code (open source, forkable)
- Responsive PWA, one codebase for desktop and mobile, with web push notifications
- Designed from day one for background processing, schema migrations across instances, and security (RLS-enforced RBAC, webhook verification, audit logging, prompt injection guardrails)

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend/hosting | Next.js (App Router), Vercel | Matches your existing stack, serverless-friendly, no persistent server to manage |
| Database/backend | Supabase (Postgres) | Postgres portability, Auth, Row Level Security for role-based access control, Storage, Realtime, Vault for carefully restricted database-side secrets, Queues/pgmq, and pg_cron. Passkeys are treated as an optional preview feature until the provider marks them stable. |
| Background jobs | Supabase Queues (pgmq) or another durable managed queue, plus Vercel Cron/Supabase pg_cron for schedules | Serverless requests are not a durable job system. Queue delivery, retries, visibility timeouts, dead-letter handling, and monitoring should use a supported queue rather than a hand-built jobs table where possible. |
| UI | Tailwind + shadcn/ui | Fast to build, easy to theme per business, matches modern CRM aesthetics |
| Auth | Supabase Auth | Email/password or magic link plus TOTP MFA as the launch baseline. Passkeys are optional while experimental. Recovery must use supported backup factors or a separately designed, tested, and audited recovery-code process. |
| AI | Provider-agnostic key vault (Anthropic, OpenAI, others) | Users plug in their own key for the instance; keys stored encrypted via Supabase Vault |
| QuickBooks | QuickBooks Online API (OAuth2) | Two-way sync, Estimates and Invoices with line items |
| Email | Gmail API + Microsoft Graph API (OAuth2) for connected inboxes, Resend for system mail only | Conversation logging plus system email, with distinct send paths (see Section 10) |
| Search | Postgres full-text search (tsvector) | Global search without adding an external search service |
| Error tracking | Sentry (or self-hosted GlitchTip for self-hosters who prefer it) | Observability across N instances |
| PWA | next-pwa or native App Router service worker, Web Push API | Installable on desktop and mobile, push notifications from one codebase |

## 3. Deployment Model

Each business gets a completely separate instance: its own Vercel project and its own Supabase project/database, all running the same open source codebase. No shared database, no cross-tenant Row Level Security, full isolation between the car wrap shop, the realtor, and DarkHorse.

This also settles the open question about future clients without forcing a decision now: offering it to a client later just means spinning up another instance from the same codebase. It's not a shared SaaS with per-workspace billing, it's the same deploy repeated, which matches how you already operate infrastructure.

**Deployment template:**
- A guided deployment flow using the Vercel and Supabase integration where available, followed by a preflight wizard that validates migrations, storage, domains, environment variables, queue configuration, cron capability, and required OAuth setup. Do not market the complete product setup as one click.
- A single `SETUP.md` covering the full process end to end, including the OAuth app registrations each self-hoster must complete (see Section 11), since this doubles as the onboarding doc for the open source version
- Honest framing in the docs: the Vercel deploy itself is one click, but connected email and QuickBooks require the operator to register their own developer apps with Google, Microsoft, and Intuit

**Schema migration strategy (decided before the first table exists):**
- All schema changes live in the repo as versioned Supabase CLI migrations; no manual dashboard edits, ever
- A central instance registry and release orchestrator applies pending migrations to owned instances in staged batches, records each version, runs post-migration checks, supports pause/rollback procedures, and prevents one failed client instance from blocking or corrupting the rest
- An `UPGRADING.md` doc gives self-hosters the same path: pull, run migrations, redeploy
- Migrations are written to be backward compatible for one release (expand/contract pattern) so a deploy and a migration never have to land in the same instant

**Cost and operations note:** Plan on paid production services. A short-interval Vercel Cron queue drainer requires a plan that supports the needed frequency, and every production instance needs backups, recovery testing, monitoring, version inventory, and a defined owner.

## 4. Background Processing Architecture

This is foundation-phase work because four core features depend on it. Vercel functions are request-scoped, so anything that happens when nobody is clicking needs one of these mechanisms:

- **Job queue:** use Supabase Queues/pgmq or another durable queue with visibility timeouts, retries, dead-letter handling, idempotency keys, concurrency limits, and queue metrics. Used for QuickBooks sync operations, outbound email sends, AI workflow actions, imports, exports, and notification fanout
- **Scheduled triggers:** pg_cron inside Supabase for DB-local recurring work, and Vercel Cron for app-level schedules. Powers time-based workflow rules ("no activity in N days"), digest emails, and subscription renewals
- **Webhook ingestion:** webhook endpoints do signature verification and enqueue only; processing happens in the queue so slow work never blocks or drops a webhook
- **Subscription upkeep:** store the provider-returned expiration time and renew dynamically. Gmail watches and Microsoft Graph subscriptions have different lifetimes and failure modes. Handle lifecycle notifications where supported, reauthorization, removed subscriptions, missed notifications, and periodic reconciliation using provider cursors/delta tokens

Every job is idempotent and carries a stable idempotency key. Every external sync records a cursor or delta token, retry count, last success time, last error, and reconciliation state so a crashed or missed job resumes without silently duplicating or losing data.

## 5. Data Model (Core Objects)

Since each instance is single-tenant, there's no tenant/workspace boundary object. Settings live in a single `instance_settings` row (branding, labels, connected integrations, default QuickBooks item mappings, tax settings).

- **User**: auth identity for this instance
- **Role/Permission**: RBAC within the instance (owner, admin, member at minimum), enforced in RLS policies
- **Company**: the business/organization a contact belongs to
- **Person**: individual contact. Company relationships use a join table so one person can hold roles at multiple organizations, with an optional primary company
- **Deal** (relabelable per instance, e.g. "Wrap Job" or "Listing"): pipeline object with stage, close date, and line items rather than a single value field
- **Deal Line Item**: description, quantity, rate, linked QuickBooks Item/Service reference, taxable flag. This is what makes real QBO Estimates and Invoices possible
- **Pipeline** and **Pipeline Stage**: support multiple pipelines, ordered stages, probability, required fields, stage-entry rules, and won/lost reasons
- **Lead**: inbound record from web forms or the capture API, convertible to Person/Company/Deal
- **Note**: freeform, attachable to any object
- **Task**: owner/assignee, status, priority, due date/time, reminders, recurrence, completion metadata, and links to one or more records
- **Activity/Timeline**: auto-logged events (emails, stage changes, calls, texts) per Company/Person/Deal. The event type model includes SMS from day one even though sending SMS is a later module
- **Email Thread**: synced messages linked to a Person or Company
- **Attachment**: file in Supabase Storage, linked to any object (vehicle photos, design proofs, listing documents), with RLS on storage paths
- **Estimate**: mirrors a QuickBooks Estimate, linked to a Deal
- **Invoice**: mirrors a QuickBooks Invoice, linked to a Deal
- **Custom Field Definition**: metadata table driving the no-code field layer on core objects (v1)
- **Custom Object Definition**: metadata table for fully user-defined objects (v1.5, see Section 8)
- **Integration Credential**: encrypted OAuth tokens/API keys accessed only by privileged server-side code. Owners/admins can view connection metadata, scopes, health, and revoke/rotate actions, but never read decrypted credential values in the browser
- **Workflow Rule**: trigger + condition + action, powers the automation layer
- **Notification**: in-app/push/email notification records per user with read state
- **Audit Log Entry**: append-only admin audit trail (see Section 7)
- **Job**: background queue record (see Section 4)

**Data lifecycle:**
- Soft delete on ordinary user-facing objects with restore. Retention is object-specific. Financial mirrors, audit records, synchronization tombstones, legal-hold data, and integration history must not be purged by a universal 30-day rule
- Every record carries created_by/updated_by and UTC timestamps. The instance and user timezones are presentation settings only

## 6. Authentication

- Supabase Auth as the identity layer
- Email/password or magic link plus TOTP-based MFA as the stable launch baseline
- Passkeys available as an optional feature flag while the provider implementation remains experimental; do not make passkeys the only primary sign-in path
- MFA enrollment, challenge, unenrollment, backup-factor management, session revocation, device/session listing, and recent-authentication checks are first-class UI flows
- Recovery uses at least two documented paths:
  1. A backup TOTP factor or another supported factor stored separately
  2. An owner-controlled, audited break-glass process requiring identity verification and forced credential reset
- Custom recovery codes are included only if they are independently designed and tested as single-use, hashed, rotatable credentials with rate limits and audit events
- Sensitive actions such as exporting all data, revealing integration scopes, changing MFA, changing roles, or rotating credentials require recent reauthentication
- Role assignment and MFA assurance level are enforced in database policies and server-side endpoints, not only reflected in the UI

## 7. Authorization, Security, and Audit

**RLS is the primary data-access boundary, not the entire security model.** The browser receives a publishable key, so every exposed table and storage path needs deny-by-default RLS. Server routes, Edge Functions, queue consumers, service-role operations, file processing, OAuth callbacks, and integration tools also require explicit authorization, validation, and least-privilege controls. Requirements:

- Deny-by-default policies on every table; no table ships without one
- Role checks live inside the policies, not just in application code. A member-level user must be unable to read `integration_credentials` or other privileged tables even with direct PostgREST calls
- Automated tests run against the RLS policies themselves (per-role fixtures asserting allowed and denied access), in CI, so a policy regression fails the build
- Storage buckets get equivalent path-based RLS for attachments, plus MIME/type validation, size limits, malware scanning or quarantine, signed URLs, and safe content-disposition headers

**Webhook verification:**
- QuickBooks webhooks verified against the intuit-signature header before any processing
- Resend webhooks verified against the signing secret
- Unverified or malformed payloads are rejected and logged; verified payloads are enqueued, never processed inline

**Rate limiting and abuse controls:**
- Per-user rate limits on all AI endpoints, since the instance's API key is a shared wallet
- Per-user and per-instance send limits on transactional email to protect domain reputation
- Lockout/backoff on auth endpoints

**Admin audit log:**
- Append-only log, separate from the customer-facing Activity Timeline
- Captures: role changes, user invites/removals, integration connect/disconnect, credential changes, data exports, deletions and restores, workflow rule changes, and every AI-initiated write or send
- Visible to owner/admin only; exportable

## 8. Customization System

Two layers, resequenced after the audit:

**No-code, v1: Custom Fields on core objects.**
Custom Field definitions stored as metadata and rendered dynamically on Companies, People, Deals, and Leads. Combined with per-instance relabeling (Deal becomes "Wrap Job" or "Listing"), this covers the large majority of what the three pilot businesses need: a "Vehicle Make/Model" field, a "Listing MLS #" field, and so on.

**No-code, v1.5: Custom Objects.**
Fully user-defined objects ("Showings," "Service Tickets") rendered from metadata. This is deliberately deferred: it is the hardest feature in the document, it's what Twenty spent years maturing, and a half-working metadata engine poisons everything built on top of it. The Custom Field system is designed so the object layer extends it rather than replacing it.

**Code-level (developer-driven):**
Because it's open source, anyone can fork and extend directly. For v1, a clean `/modules` folder convention where a developer can drop in a new page, API route, and custom server logic without touching core files, plus clear docs on the data model. A formal plugin SDK (installable packages, sandboxed execution) remains a v2 goal.

## 9. AI Functionality

Three capabilities, all using the instance's own API key:

1. **Chat assistant**: a chat interface that can query and update CRM data through tool calling (find contacts, summarize a deal's history, create a task)
2. **Auto-drafting**: draft follow-up emails, meeting notes, and summaries based on CRM context, presented for review before sending
3. **Workflow automation**: trigger-based rules (deal moves to a stage, no activity in N days, new lead created) that can call the AI to draft something or take a defined action

**Prompt injection guardrails (non-negotiable, part of Track D's definition):**
- All email bodies, notes, form submissions, and other externally-sourced content are treated as untrusted data, never as instructions. They are clearly delimited when passed to the model, and system prompts instruct the model accordingly
- AI actions use explicit risk tiers. Read-only actions and reversible internal actions such as creating a draft, suggested task, or proposed note may run automatically when configured. External communications, financial actions, destructive actions, permission changes, and high-impact record changes always require a preview and human approval. The UI must show exactly what will change before approval
- Tool access is scoped by the invoking user's role; the AI can never do what the user couldn't
- Every AI tool call records the user, model/provider, prompt or prompt-version reference, records accessed, tool arguments, result, approval decision, token/cost data where available, and resulting mutation in the audit log
- Per-user rate limits apply (Section 7)

**Send path for AI drafts:** an approved draft that replies to a logged conversation sends through the user's connected Gmail/Microsoft 365 account, so it comes from the right address with correct SPF/DKIM alignment. Resend never sends on behalf of a user's personal address (Section 10).

**Gateway note:** for your own hosted instances, route AI calls through Bifrost, your existing gateway. The open source core calls providers directly so self-hosters aren't required to stand up a gateway.

## 10. Email Integration

Two distinct pieces with a hard boundary between them:

- **Connected inboxes (Gmail, Microsoft 365):** OAuth connection per user, with explicit mailbox/folder scope, aliases, exclusions, retention rules, and privacy controls. Gmail push requires Google Cloud Pub/Sub configuration. Notifications are treated as hints, followed by cursor/delta synchronization and periodic reconciliation because notifications may be delayed, dropped, removed, or missed. Email-to-record matching is confidence-scored, reviewable, and manually correctable. All user-authored and approved AI-drafted correspondence sends through the connected inbox
- **Transactional email (Resend):** the app's own outgoing mail only: team invites, notifications, digests, password/recovery flows. Sent from the app's domain, never impersonating a user's address. Kept separate so the app functions without any personal inbox connected

**Auto-created contacts from email sync** feed the duplicate detection flow (Section 12) rather than silently creating new Person records.

## 11. Integration and OAuth App Registration Realities

This section exists because the setup burden is real and the docs should not hide it:

- **Gmail:** reading mail uses restricted scopes, which for a published Google OAuth app means Google's verification process and a paid annual CASA security assessment. Self-hosters register their own Google Cloud OAuth app; small instances can operate in testing/internal mode, and `SETUP.md` explains the tradeoffs plainly
- **Microsoft 365:** app registration in Entra ID plus publisher verification for multi-tenant use; lighter than Google but still a real step
- **QuickBooks:** production keys require Intuit's app review; sandbox keys work immediately for development
- **Consequence for the product:** connected email and QuickBooks are optional modules, cleanly disable-able, so the CRM is fully usable by a self-hoster who never completes any of these registrations. Your own three instances complete them once and reuse nothing across instances except the documentation
- Each instance's tokens live in Supabase Vault, are accessed server-side only, and are readable only by owner/admin per RLS

## 12. QuickBooks Online Integration

Two-way sync, OAuth2 connection per instance:

- **Estimates:** a Deal can generate a QuickBooks Estimate from versioned line items. Any workflow triggered by estimate acceptance must be based on a verified QuickBooks state or a separate customer-approval mechanism, not an assumed event
- **Out to QuickBooks:** a configured action creates or updates the matching QuickBooks Customer and then creates an Estimate or Invoice with mapped Items/Services, tax codes, discounts, currency, and line-level external IDs. The PRD must define a field-by-field source-of-truth matrix, QuickBooks SyncToken handling, conflict behavior, and who is allowed to retry or override a failed sync
- **Back from QuickBooks:** payment, void, deletion/inactivation, and relevant document status changes sync back through verified webhooks plus scheduled reconciliation. Partial payments, credits, deposits, edited line items, and conflicting edits have defined behaviors
- All sync operations are idempotent and cursor-based (Section 4); a sync health panel in settings surfaces failures instead of letting them rot silently

## 13. Core CRM Features Promoted From "Missing"

- **CSV import (v1, Track A):** contacts, companies, and deals with column mapping, validation preview, and dedupe on import. Nobody adopts a CRM with an empty database; all three pilot businesses have data somewhere today. Export remains alongside it (CSV at minimum)
- **Global search:** Postgres full-text search across People, Companies, Deals, Notes, and Email Threads, with a single search bar and keyboard shortcut
- **Reporting/dashboard:** pipeline value by stage, win rate, revenue this month, activity leaderboard. This is the first screen an owner actually wants and ships in v1 as a fixed dashboard (custom report builder is v2)
- **Calendar:** Google Calendar and Microsoft 365 calendar sync on the same OAuth connections already being built, with events linkable to Deals/People. All three pilot businesses are appointment-driven (installs, showings, service visits)
- **Lead capture:** an embeddable web form and a simple authenticated inbound API endpoint that create Lead records, feed workflow triggers ("new lead created"), and route into dedupe
- **Notifications:** in-app notification center, web push via the PWA service worker, and email digests via Resend. Triggers: task due, record assigned, payment received, workflow rule fired, AI action awaiting approval
- **Duplicate detection and merge:** match on email/phone/name similarity, surfaced at import time, at email-sync contact creation, and via a periodic review queue; merge preserves timeline history from both records
- **Saved views and segmentation:** reusable filters, column layouts, sorting, sharing scope, tags/lists, and owner/team filters
- **Bulk operations:** assign, tag, update stage, export, merge, archive, and delete with permission checks, previews, progress, failure reporting, and undo where practical
- **Ownership and teams:** record owners, followers, teams, assignment rules, queues, and visibility rules beyond owner/admin/member
- **Communication preferences:** consent, preferred channel, do-not-contact, unsubscribe/suppression state, email validity, and per-address/phone metadata
- **Product/service catalog:** reusable products and services with QuickBooks mappings, prices, tax codes, active state, and version-aware line items
- **Public API and outbound webhooks:** versioned API keys/service accounts, scoped permissions, rate limits, webhook signatures, replay protection, delivery logs, and retries
- **Soft delete:** trash with restore on ordinary user-facing objects (Section 5), subject to object-specific retention rules

## 14. Build Sequencing

The current feature set is too large for a single v1. Build by complete vertical slices that can be used by a pilot business, not by four mostly independent technical tracks.

**Phase 0: Product definition and design system**
- Choose the first primary pilot workflow and define the exact jobs to be done
- Document personas, permissions, terminology, required reports, and measurable launch success criteria
- Create the information architecture, responsive wireframes, design tokens, component standards, and light/dark themes
- Define out-of-scope items, data ownership rules, integration source-of-truth matrices, and acceptance criteria

**Phase 1: Secure CRM core**
- Auth and recovery, users/teams/permissions, Companies/People, multiple pipelines, Deals, Tasks, Notes, Activity, custom fields, saved views, search, CSV import/export, dedupe, attachments, audit, notifications, dashboard, backups, and restore procedure
- Ship this phase to one pilot business before beginning broad integration work

**Phase 2: Lead-to-estimate workflow**
- Lead capture, product/service catalog, line items, approvals, workflow rules without AI, and a controlled one-way QuickBooks flow from CRM to Estimate/Invoice
- Payment and document status sync back from QuickBooks
- Add conflict handling and reconciliation before calling the integration two-way

**Phase 3: Connected communications**
- Gmail or Microsoft 365 first, based on the pilot, then the second provider
- Email logging, manual and assisted record linking, send/reply, calendar linking, subscription lifecycle management, reconciliation, and privacy controls

**Phase 4: AI assistance**
- Read-only summarization and search with citations
- Draft generation and proposed actions
- Risk-tiered approvals, previews, undo, evaluation fixtures, budgets, cost reporting, prompt/version management, and full auditability

**Phase 5: Additional vertical modules**
- Car wrap production/job module, realtor property/showing module, or MSP service/ticket/asset module
- Custom Objects begin only after repeated real pilot requirements prove the metadata model is necessary

Each phase must have user acceptance tests, migration tests, security tests, performance budgets, accessibility checks, and a rollback plan before the next phase begins.

## 15. License and Contributions

**AGPL-3.0**, the same choice Twenty made. It keeps the project genuinely open while requiring that anyone who runs a modified version as a hosted service also releases their changes.

**CLA from the first external PR.** AGPL only preserves the option to offer a commercial hosted or dual-licensed version if you hold the copyright. Merging outside contributions without a Contributor License Agreement forfeits the ability to relicense later. Since Section 16 leaves the commercial door open, a standard CLA (CLA Assistant on the repo) is in place before any external contribution is accepted. (Standard caveat: run the final CLA text past an actual lawyer.)

## 16. Open Questions for Later

These don't block starting the build, but are worth deciding before launch:
- Project name and branding
- Whether the hosted version becomes a paid product, and if so, pricing/plan structure
- SMS module (Twilio or similar): the Activity model already represents texts, so this is additive when wanted
- Backup/export strategy beyond CSV for self-hosters (full Postgres dump guidance is easy to document since it's plain Supabase)
- Custom report builder (v2, fixed dashboard ships first)
- Formal plugin SDK (v2, `/modules` convention ships first)

## 17. Product Scope, Personas, and Pilot Workflows

The product must not attempt to serve "any small business" equally in v1. The shared core is a relationship and lead-to-cash CRM. Operational workflows such as MSP ticketing, realtor listing/showing management, and car-wrap production are separate modules unless the pilot proves they belong in the core.

Before implementation, define:

- Primary user personas: owner, manager, sales user, operations user, accounting user, and limited/read-only user
- The first pilot business and its five to ten critical workflows
- The system of record for every shared data domain, especially customer identity, estimates, invoices, payment status, products/services, email, and calendar
- A clear out-of-scope list for v1
- Adoption metrics such as successful imports, weekly active users, records created, tasks completed, lead response time, pipeline accuracy, sync success rate, and support incidents
- User acceptance criteria written as observable outcomes rather than implementation tasks

Minimum pilot workflows should include:

1. Import existing companies, contacts, and opportunities with a reviewable dedupe process
2. Capture a lead, assign it, follow up, and convert it without duplicating the person or company
3. Move a deal through a customizable pipeline with required fields, tasks, and stage history
4. Build an estimate from reusable products/services and send or sync it through an approved path
5. View a complete, permission-aware timeline of communication, notes, tasks, stage changes, and financial status
6. Find any record quickly through global search, recent items, saved views, and keyboard navigation
7. Recover from failed syncs, accidental edits, duplicate records, and deleted records without engineering intervention

## 18. UI, UX, Visual Design, and Theming Requirements

### 18.1 Design objective

The interface must feel calm, capable, and immediately understandable to a small-business user who may not have prior CRM experience. It should balance the information density expected by power users with clear hierarchy, progressive disclosure, and plain-language guidance for occasional users.

Visual quality is a product requirement, not a final polish step. The system must use a consistent design language, predictable interaction patterns, responsive behavior, and accessible components across every module.

### 18.2 Information architecture and navigation

- Use a persistent primary navigation with a small, stable set of top-level destinations: Home, Contacts, Companies, Pipeline, Tasks, Calendar, Communications, Reports, Automations, and Settings. Modules that are disabled must not leave empty navigation items.
- Provide a global search and command palette available from every screen, with keyboard access and grouped results for People, Companies, Deals, Tasks, Notes, and Communications.
- Include a global quick-create action for the most common records. The user should not need to navigate away from current work to add a contact, task, note, lead, or deal.
- Preserve context with breadcrumbs, recent records, back navigation, and return-to-list state including filters, sorting, pagination, and scroll position.
- Allow users to pin favorites and save personal or shared views.
- Keep administrative configuration in Settings rather than mixing it into day-to-day workflow screens.

### 18.3 Core screen patterns

**Dashboard**
- Role-aware and actionable, not merely decorative
- Shows work requiring attention, overdue tasks, new leads, pipeline movement, failed integrations, pending approvals, and meaningful trends
- Widgets have clear definitions, date ranges, drill-down behavior, empty states, and last-refreshed indicators
- Users can rearrange or hide widgets within sensible guardrails

**List and table views**
- Support saved filters, column selection, sorting, grouping, bulk selection, bulk actions, inline edits where safe, sticky headers, pagination or virtualization, and export
- Default columns are chosen by task relevance, not by database order
- Dense data remains readable through alignment, restrained borders, whitespace, and typographic hierarchy
- Every icon-only action has an accessible name and tooltip
- A keyboard-accessible alternative exists for every drag, drop, or pointer-only interaction

**Pipeline/Kanban**
- Cards emphasize record name, value, owner, next action, age, and risk state
- Dragging between stages is optimistic only when validation passes, with an undo option
- Required fields, stage rules, and permission failures are explained before the move is committed
- Provide list/table alternatives for accessibility and high-volume work
- Show stage totals and aging without visual clutter

**Record detail**
- Use a clear header with identity, status, owner, primary actions, and key metrics
- Organize content into an overview plus focused tabs or sections for activity, tasks, deals, communications, files, financial records, and related records
- Keep the activity composer close to the timeline
- Distinguish system-generated activity, user-entered notes, external communications, and AI-generated suggestions
- Show source, last sync, and conflict state for externally managed data
- Support copyable deep links to records and timeline events

**Forms**
- Use clear labels above fields, useful helper text, sensible defaults, inline validation, and explicit required indicators
- Group related information into short sections and progressively disclose advanced settings
- Preserve entered data after validation errors
- Warn before navigating away from unsaved changes
- Use autosave only where status is visible and failure cannot silently lose data
- Destructive actions require confirmation proportional to risk, with typed confirmation reserved for truly high-impact actions

### 18.4 Interaction quality

- Prefer direct manipulation, inline actions, and context menus for common work, while keeping primary actions visibly available
- Provide immediate feedback for every user action through loading states, success confirmation, validation, or error recovery
- Use optimistic updates only for reversible actions with reliable rollback
- Support undo for stage moves, assignments, tags, archives, and other common reversible changes
- Long-running operations such as imports, exports, merges, AI jobs, and synchronizations run in the background with visible progress, resumable status, and clear failure details
- Error messages explain what happened, what data was affected, and the next action the user can take
- Empty states explain the purpose of the screen and provide a relevant next step
- Avoid excessive modal dialogs. Use full pages or side panels for complex workflows and reserve modals for short, focused decisions
- Do not hide critical actions exclusively behind hover states

### 18.5 Light mode, dark mode, and theme system

The product ships with first-class light and dark modes and a system setting that follows the operating-system preference. Theme choice is stored per user and applied before first paint to avoid flashing the wrong theme.

The visual system uses semantic design tokens rather than hard-coded colors:

- Canvas/background
- Surface and elevated surface
- Border and divider
- Primary and secondary text
- Muted text
- Brand primary and brand accent
- Interactive hover, active, selected, and disabled states
- Success, warning, danger, and information
- Focus ring
- Overlay/scrim
- Data-visualization palette
- Shadows, radii, spacing, typography, and density

Theme customization includes:

- Logo, wordmark, favicon, organization name, and optional login artwork
- Brand primary and accent colors with real-time accessibility validation
- Light and dark semantic token sets derived from the brand colors rather than simple inversion
- Approved font choices or a safe system-font stack
- Compact and comfortable density modes
- Border radius and surface style within tested ranges
- Chart palette generated and tested for both light and dark backgrounds
- Live preview across representative CRM screens
- Reset to default, export/import theme configuration, and versioned theme changes

Custom themes must not allow arbitrary values that make controls unreadable, hide focus indicators, or confuse semantic states. Success, warning, and danger colors remain semantically consistent even when branded.

### 18.6 Responsive and mobile behavior

- Desktop layouts prioritize efficient scanning, multi-column detail views, tables, and keyboard workflows
- Tablet layouts collapse secondary navigation and use drawers or side panels without removing functionality
- Mobile layouts prioritize capture, lookup, calling, emailing, notes, tasks, pipeline updates, and approvals
- Data tables adapt to prioritized card/list views rather than forcing unusable horizontal scrolling for core tasks
- Touch targets, spacing, bottom-sheet behavior, safe areas, virtual keyboard behavior, and one-handed use are tested on actual devices
- PWA/offline behavior clearly identifies cached, stale, pending, and synchronized data. The app must never imply a change is saved when it is only stored locally

### 18.7 Accessibility

- Target WCAG 2.2 AA across both light and dark modes
- Use semantic HTML first and ARIA only where necessary
- All functionality is keyboard operable with logical focus order, visible focus indicators, skip links, and predictable focus restoration
- Color is never the only indicator of status
- Text, controls, charts, borders, disabled states, and focus indicators meet contrast requirements
- Interactive targets meet minimum sizing and spacing requirements, with larger targets used for touch interfaces
- Dialogs trap focus correctly and return focus to the invoking control
- Tables, grids, comboboxes, menus, tabs, tree views, and date pickers follow established accessible interaction patterns
- Motion respects reduced-motion preferences
- Automated accessibility checks run in CI, supplemented by keyboard and screen-reader testing for critical workflows

### 18.8 Content design and terminology

- Use plain language, active voice, and familiar small-business terms
- Per-instance terminology changes are allowed, but changing labels must not change underlying meaning or break help text, reports, permissions, or integrations
- Button labels describe the outcome, such as "Create estimate" instead of "Submit"
- Dates, amounts, currencies, timezones, and phone numbers use locale-aware formatting
- Status names and colors are consistent across lists, details, dashboards, notifications, and reports
- AI content is labeled as generated or suggested and never presented as a confirmed fact without its source

### 18.9 Design-system implementation

- Build a documented component library with tokens, variants, states, accessibility behavior, responsive behavior, and usage guidance
- Use Storybook or an equivalent isolated component environment
- Include components for navigation, command palette, data table, filter builder, record picker, activity timeline, Kanban, forms, file uploader, notification center, approval preview, sync health, empty/loading/error states, and charts
- Do not customize third-party components by page. Extend shared primitives so every module stays visually and behaviorally consistent
- Every component includes default, hover, focus, active, selected, disabled, loading, empty, error, success, and dark-mode states where applicable

## 19. Permissions and Data Visibility

The owner/admin/member model is insufficient for real client use. The authorization model must support:

- Roles composed of explicit permissions
- Object-level actions: view, create, edit, delete, export, merge, assign, approve, and administer
- Record ownership and team-based visibility
- Private records and internal-only notes
- Field-level restrictions for sensitive data where required
- Separate permissions for financial data, exports, integrations, automation, AI tools, audit logs, and theme/settings administration
- Service accounts and scoped API keys that are not tied to an employee's personal login
- User deactivation that preserves historical ownership and audit records
- Permission simulation or a "view as role" tool for administrators
- RLS tests, server authorization tests, and end-to-end permission tests for every role

## 20. Integration Reliability and Source of Truth

Every integration must define:

- Authentication scopes and why each is required
- The authoritative system for every shared field
- Create, update, delete, archive, and merge behavior
- External IDs, version tokens, idempotency keys, and tombstones
- Conflict detection and user-visible resolution
- Initial backfill, incremental sync, periodic reconciliation, and manual resync
- Rate-limit handling, exponential backoff, dead-letter handling, and provider outages
- Health status, last success, last attempted sync, error details, affected records, and retry controls
- Credential expiration, revocation, rotation, and reauthorization
- Sandbox/test-account strategy and contract tests using provider fixtures
- Audit events for connection, disconnection, scope changes, retries, overrides, and data mutations

"Two-way sync" must never mean that every field can overwrite every other field. It means that approved data flows exist in both directions under a documented ownership and conflict model.

## 21. AI Safety, Quality, and User Experience

- AI answers that summarize CRM data cite the records and timeline events used
- The assistant distinguishes facts from suggestions and uncertainty
- Every proposed mutation is shown as a structured preview or diff
- Approvals are scoped to a single action or clearly defined batch, never a vague blanket permission
- Users can edit generated drafts before approval
- High-impact actions require recent authentication and explicit confirmation
- AI tools enforce record and field permissions before retrieving data and again before writing
- Provider/model selection, data-retention settings, maximum cost, per-user budgets, and rate limits are configurable
- Prompt templates and tool schemas are versioned and tested against a fixed evaluation set
- Model failures, malformed tool calls, hallucinated identifiers, and partial actions fail safely
- External content is isolated as untrusted data
- AI-generated content is excluded from automatic learning or reuse unless the configured provider and business policy explicitly permit it
- The system provides a non-AI path for every critical workflow

## 22. Nonfunctional and Operational Requirements

Before production, define and test:

- Supported browsers and device classes
- Performance budgets for dashboard, list, search, record detail, and save interactions
- Maximum expected records, emails, attachments, users, import size, and concurrent jobs per instance
- Backup frequency, retention, restore procedure, recovery point objective, and recovery time objective
- A restore drill for each owned production instance
- Availability targets and incident response ownership
- Central monitoring for app errors, queue depth, oldest queued job, webhook failures, sync lag, database/storage usage, backup health, and version drift
- Staging and preview environments with safe test credentials and scrubbed data
- Feature flags for risky integrations and phased rollouts
- Unit, integration, end-to-end, migration, RLS, contract, accessibility, and load tests
- Dependency scanning, secret scanning, software bill of materials, vulnerability response, and patch policy
- Data retention, legal hold, export, deletion, and privacy-request workflows
- Attachment limits, file validation, malware/quarantine handling, and storage quotas
- API versioning and backward-compatibility policy
- Upgrade, rollback, and failed-migration procedures
- Product telemetry that is transparent, privacy-aware, optional for self-hosters where practical, and sufficient to diagnose adoption and reliability problems

## 23. Central Management for Hosted Instances

Separate databases provide strong isolation, but operating many independent deployments requires a small control plane for owned or managed instances.

The control plane stores no customer CRM content. It tracks:

- Instance identifier, owner, region, domain, plan, and enabled modules
- Application version, schema version, migration state, and feature flags
- Health checks, backup status, queue health, sync health, and error-rate summaries
- Deployment history and staged rollout groups
- Credential references for deployment automation, stored in an appropriate secrets manager
- Support access state and time-limited support authorization
- Cost and usage summaries
- Maintenance mode, pause, rollback, and decommission state

Without this control plane, the separate-instance model should be limited to the initial pilot businesses rather than presented as a scalable hosted offering.

## 24. Final Go/No-Go Gates

Development should not begin on all tracks until these decisions are complete:

1. Select the first pilot business and primary workflow
2. Approve the v1 out-of-scope list
3. Approve the information architecture and design system
4. Choose the durable queue implementation and required hosting plan
5. Replace experimental passkey assumptions with a stable authentication and recovery plan
6. Define the permission matrix
7. Define the QuickBooks source-of-truth and conflict matrix
8. Define email privacy, matching, retention, and reconciliation behavior
9. Define backup, restore, monitoring, and instance-management ownership
10. Convert each v1 feature into user-facing acceptance criteria

